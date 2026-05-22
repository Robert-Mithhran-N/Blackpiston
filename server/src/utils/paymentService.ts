import crypto from 'crypto';
import prisma from '../config/database.js';
import { getRazorpayInstance, getRazorpayKeySecret } from '../config/razorpay.js';
import { emitStockUpdate } from '../socketManager.js';

// ============================================================
// Price Validation — NEVER trust frontend prices
// ============================================================

interface CartItemInput {
    productId: string;
    variantId?: string;
    quantity: number;
}

interface ValidatedCartItem {
    productId: string;
    variantId?: string;
    name: string;
    sku: string;
    image?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    variantSize?: string;
    variantColor?: string;
}

export async function validateCartPrices(items: CartItemInput[]): Promise<{
    validatedItems: ValidatedCartItem[];
    subtotal: number;
    errors: string[];
}> {
    const validatedItems: ValidatedCartItem[] = [];
    const errors: string[] = [];
    let subtotal = 0;

    for (const item of items) {
        const product = await prisma.product.findUnique({
            where: { id: item.productId },
            select: {
                id: true,
                name: true,
                sku: true,
                price: true,
                offerPrice: true,
                images: true,
                thumbnailUrl: true,
                variants: true,
                isActive: true,
                inStock: true,
            },
        });

        if (!product) {
            errors.push(`Product not found: ${item.productId}`);
            continue;
        }

        if (!product.isActive) {
            errors.push(`Product "${product.name}" is no longer available`);
            continue;
        }

        let unitPrice: number;
        let variantSize: string | undefined;
        let variantColor: string | undefined;
        let sku = product.sku;

        if (item.variantId && product.variants && product.variants.length > 0) {
            const variant = product.variants.find((v: any) => v.id === item.variantId);
            if (!variant) {
                errors.push(`Variant not found for "${product.name}"`);
                continue;
            }
            unitPrice = variant.price ?? product.offerPrice ?? product.price;
            variantSize = variant.size ?? undefined;
            variantColor = variant.color ?? undefined;
            sku = variant.sku || product.sku;
        } else {
            unitPrice = product.offerPrice ?? product.price;
        }

        const totalPrice = unitPrice * item.quantity;
        subtotal += totalPrice;

        const image = product.thumbnailUrl ||
            (product.images && product.images.length > 0 ? product.images[0].url : undefined);

        validatedItems.push({
            productId: product.id,
            variantId: item.variantId,
            name: product.name,
            sku,
            image,
            quantity: item.quantity,
            unitPrice,
            totalPrice,
            variantSize,
            variantColor,
        });
    }

    return { validatedItems, subtotal, errors };
}

// ============================================================
// Stock Management
// ============================================================

interface StockOperation {
    productId: string;
    variantId?: string;
    quantity: number;
}

/**
 * Validate that sufficient stock exists for all items.
 * Returns errors if any item doesn't have enough stock.
 */
export async function validateStock(items: StockOperation[]): Promise<string[]> {
    const errors: string[] = [];

    for (const item of items) {
        const product = await prisma.product.findUnique({
            where: { id: item.productId },
            select: { id: true, name: true, stockQuantity: true, variants: true, inStock: true },
        });

        if (!product) {
            errors.push(`Product not found: ${item.productId}`);
            continue;
        }

        if (item.variantId && product.variants && product.variants.length > 0) {
            const variant = product.variants.find((v: any) => v.id === item.variantId);
            if (!variant) {
                errors.push(`Variant not found for "${product.name}"`);
                continue;
            }
            if (variant.stockQuantity < item.quantity) {
                errors.push(
                    `Insufficient stock for "${product.name}" (variant). Available: ${variant.stockQuantity}, Requested: ${item.quantity}`
                );
            }
        } else {
            if (product.stockQuantity < item.quantity) {
                errors.push(
                    `Insufficient stock for "${product.name}". Available: ${product.stockQuantity}, Requested: ${item.quantity}`
                );
            }
        }
    }

    return errors;
}

/**
 * Reserve stock for online payment orders.
 * Increments reservedStock without decrementing availableStock.
 */
export async function reserveStock(items: StockOperation[]): Promise<void> {
    for (const item of items) {
        const product = await prisma.product.findUnique({
            where: { id: item.productId },
            select: { id: true, stockQuantity: true, variants: true },
        });
        if (!product) continue;

        if (item.variantId && product.variants && product.variants.length > 0) {
            const variant = product.variants.find((v: any) => v.id === item.variantId);
            if (!variant) continue;

            // For variants, we track reservation by reducing available in the variant
            // We'll restore it if payment fails
            const updatedVariants = product.variants.map((v: any) => {
                if (v.id === item.variantId) {
                    return { ...v, stockQuantity: v.stockQuantity - item.quantity };
                }
                return v;
            });
            const totalVariantStock = updatedVariants.reduce((sum: number, v: any) => sum + v.stockQuantity, 0);
            await prisma.product.update({
                where: { id: item.productId },
                data: {
                    variants: updatedVariants,
                    stockQuantity: totalVariantStock,
                    inStock: totalVariantStock > 0,
                },
            });
        } else {
            const newStock = product.stockQuantity - item.quantity;
            await prisma.product.update({
                where: { id: item.productId },
                data: {
                    stockQuantity: newStock,
                    inStock: newStock > 0,
                },
            });
        }
    }
}

/**
 * Commit reserved stock after successful payment.
 * Emits real-time stock update events.
 */
export async function commitStock(items: StockOperation[]): Promise<void> {
    // Stock was already reduced during reservation.
    // Just emit socket events for real-time updates.
    for (const item of items) {
        const product = await prisma.product.findUnique({
            where: { id: item.productId },
            select: { id: true, stockQuantity: true, variants: true },
        });
        if (!product) continue;

        emitStockUpdate({
            productId: item.productId,
            variantId: item.variantId || null,
            newStock: product.stockQuantity,
            inStock: product.stockQuantity > 0,
            variants: product.variants
                ? product.variants.map((v: any) => ({ id: v.id, stockQuantity: v.stockQuantity }))
                : undefined,
        });
    }
}

/**
 * Release reserved stock when payment fails or expires.
 * Restores stock that was deducted during reservation.
 */
export async function releaseReservedStock(items: StockOperation[]): Promise<void> {
    for (const item of items) {
        const product = await prisma.product.findUnique({
            where: { id: item.productId },
            select: { id: true, stockQuantity: true, variants: true },
        });
        if (!product) continue;

        if (item.variantId && product.variants && product.variants.length > 0) {
            const updatedVariants = product.variants.map((v: any) => {
                if (v.id === item.variantId) {
                    return { ...v, stockQuantity: v.stockQuantity + item.quantity };
                }
                return v;
            });
            const totalVariantStock = updatedVariants.reduce((sum: number, v: any) => sum + v.stockQuantity, 0);
            await prisma.product.update({
                where: { id: item.productId },
                data: {
                    variants: updatedVariants,
                    stockQuantity: totalVariantStock,
                    inStock: true,
                },
            });

            emitStockUpdate({
                productId: item.productId,
                variantId: item.variantId || null,
                newStock: totalVariantStock,
                inStock: true,
                variants: updatedVariants.map((v: any) => ({ id: v.id, stockQuantity: v.stockQuantity })),
            });
        } else {
            const restoredStock = product.stockQuantity + item.quantity;
            await prisma.product.update({
                where: { id: item.productId },
                data: {
                    stockQuantity: restoredStock,
                    inStock: true,
                },
            });

            emitStockUpdate({
                productId: item.productId,
                newStock: restoredStock,
                inStock: true,
            });
        }
    }
}

// ============================================================
// Razorpay Operations
// ============================================================

/**
 * Create a Razorpay order for the given amount.
 */
export async function createRazorpayOrder(
    amount: number,
    currency: string = 'INR',
    receipt: string,
    notes?: Record<string, string>
): Promise<any> {
    const razorpay = getRazorpayInstance();

    const order = await razorpay.orders.create({
        amount: Math.round(amount * 100), // Convert to paise
        currency,
        receipt,
        notes: notes || {},
    });

    return order;
}

/**
 * Verify Razorpay payment signature using HMAC SHA256.
 * This is the critical security check — never skip this.
 */
export function verifyRazorpaySignature(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
): boolean {
    const secret = getRazorpayKeySecret();
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');

    // Use timing-safe comparison to prevent timing attacks
    try {
        return crypto.timingSafeEqual(
            Buffer.from(expectedSignature, 'hex'),
            Buffer.from(razorpaySignature, 'hex')
        );
    } catch {
        return false;
    }
}

// ============================================================
// Payment Lifecycle
// ============================================================

/**
 * Handle successful payment — mark order as paid and commit stock.
 */
export async function handlePaymentSuccess(
    orderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
): Promise<any> {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { payment: true },
    });

    if (!order) throw new Error('Order not found');

    // Idempotent: if already paid, return success
    if (order.paymentStatus === 'PAID') {
        return order;
    }

    const now = new Date();

    // Update order
    const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
            paymentStatus: 'PAID',
            isPaid: true,
            paidAt: now,
            razorpayPaymentId,
            razorpaySignature,
            paymentCapturedAt: now,
            isStockReserved: false,
            orderStatus: 'CONFIRMED',
            confirmedAt: now,
            statusHistory: {
                push: [
                    {
                        status: 'PAID',
                        timestamp: now,
                        note: 'Payment verified successfully',
                    },
                    {
                        status: 'CONFIRMED',
                        timestamp: now,
                        note: 'Order confirmed after payment',
                    },
                ],
            },
        },
    });

    // Update payment record
    if (order.payment) {
        await prisma.payment.update({
            where: { id: order.payment.id },
            data: {
                paymentStatus: 'PAID',
                razorpayPaymentId,
                razorpaySignature,
                amountReceived: order.totalAmount,
                capturedAt: now,
                transactionId: razorpayPaymentId,
            },
        });
    }

    // Commit stock (emit real-time updates)
    const stockOps: StockOperation[] = order.products.map((p: any) => ({
        productId: p.productId,
        variantId: p.variantId,
        quantity: p.quantity,
    }));
    await commitStock(stockOps);

    return updatedOrder;
}

/**
 * Handle failed payment — release reserved stock and update records.
 */
export async function handlePaymentFailure(
    orderId: string,
    reason: string
): Promise<any> {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { payment: true },
    });

    if (!order) throw new Error('Order not found');

    // Don't process if already in a terminal state
    if (['PAID', 'CANCELLED'].includes(order.paymentStatus)) {
        return order;
    }

    const now = new Date();

    // Update order
    const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
            paymentStatus: 'FAILED',
            statusHistory: {
                push: {
                    status: 'PAYMENT_FAILED',
                    timestamp: now,
                    note: reason || 'Payment failed',
                },
            },
        },
    });

    // Update payment record
    if (order.payment) {
        await prisma.payment.update({
            where: { id: order.payment.id },
            data: {
                paymentStatus: 'FAILED',
                failureReason: reason,
                attempts: { increment: 1 },
            },
        });
    }

    // Release reserved stock if it was reserved
    if (order.isStockReserved) {
        const stockOps: StockOperation[] = order.products.map((p: any) => ({
            productId: p.productId,
            variantId: p.variantId,
            quantity: p.quantity,
        }));
        await releaseReservedStock(stockOps);

        await prisma.order.update({
            where: { id: orderId },
            data: { isStockReserved: false },
        });
    }

    return updatedOrder;
}

/**
 * Cleanup expired payment orders — releases stuck stock reservations.
 * Should be called periodically (every 15 minutes).
 */
export async function cleanupExpiredOrders(): Promise<number> {
    const now = new Date();

    // Find orders where payment expired and stock is still reserved
    const expiredOrders = await prisma.order.findMany({
        where: {
            isStockReserved: true,
            paymentExpiresAt: { lt: now },
            paymentStatus: { in: ['PENDING', 'PROCESSING'] },
            paymentMethod: { not: 'COD' },
        },
    });

    let cleanedCount = 0;

    for (const order of expiredOrders) {
        try {
            await handlePaymentFailure(order.id, 'Payment expired');

            await prisma.order.update({
                where: { id: order.id },
                data: { paymentStatus: 'EXPIRED' },
            });

            // Update any associated payment records
            await prisma.payment.updateMany({
                where: { orderId: order.id },
                data: { paymentStatus: 'EXPIRED', expiredAt: now },
            });

            cleanedCount++;
            console.log(`🧹 Cleaned up expired order: ${order.orderNumber}`);
        } catch (err) {
            console.error(`Failed to cleanup expired order ${order.orderNumber}:`, err);
        }
    }

    if (cleanedCount > 0) {
        console.log(`🧹 Cleaned up ${cleanedCount} expired orders`);
    }

    return cleanedCount;
}
