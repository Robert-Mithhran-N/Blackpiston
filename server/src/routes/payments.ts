import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../config/database.js';
import { getRazorpayKeyId } from '../config/razorpay.js';
import { ObjectId } from 'bson';
import {
    validateCartPrices,
    validateStock,
    reserveStock,
    createRazorpayOrder,
    verifyRazorpaySignature,
    handlePaymentSuccess,
    handlePaymentFailure,
    releaseReservedStock,
} from '../utils/paymentService.js';
import { verifyWebhookSignature, processWebhookEvent } from '../utils/webhookHandler.js';
import { sendOrderConfirmation } from '../utils/emailService.js';
import { emitNewOrder } from '../socketManager.js';

const router = Router();

// ============================================================
// Auth Middleware
// ============================================================

function authenticateToken(req: Request, res: Response, next: Function) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
            userId: string;
            role: string;
        };
        (req as any).userId = decoded.userId;
        (req as any).userRole = decoded.role;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

// ============================================================
// Generate unique order number
// ============================================================

function generateOrderNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const random = Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, '0');
    return `BP-${year}-${random}`;
}

// ============================================================
// GET /config — Return public Razorpay key (safe for frontend)
// ============================================================

router.get('/config', (req: Request, res: Response) => {
    try {
        const keyId = getRazorpayKeyId();
        res.json({ key_id: keyId });
    } catch (error: any) {
        res.status(503).json({ error: 'Payment gateway not configured' });
    }
});

const createPaymentOrderSchema = z.object({
    items: z.array(z.object({
        productId: z.string().min(1, 'Product ID is required'),
        variantId: z.string().optional().nullable(),
        quantity: z.number().int().positive('Quantity must be a positive integer'),
    })).min(1, 'At least one item is required'),
    shippingAddress: z.object({
        name: z.string().min(1, 'Shipping name is required'),
        phone: z.string().min(1, 'Shipping phone is required'),
        street: z.string().min(1, 'Shipping street is required'),
        city: z.string().min(1, 'Shipping city is required'),
        state: z.string().min(1, 'Shipping state is required'),
        pincode: z.string().min(1, 'Shipping pincode is required'),
        country: z.string().optional().nullable()
    }),
    billingAddress: z.object({
        name: z.string().optional().nullable(),
        phone: z.string().optional().nullable(),
        street: z.string().optional().nullable(),
        city: z.string().optional().nullable(),
        state: z.string().optional().nullable(),
        pincode: z.string().optional().nullable(),
        country: z.string().optional().nullable()
    }).optional().nullable(),
    couponCode: z.string().optional().nullable()
});

// ============================================================
// POST /create-order — Validate cart, create order, create Razorpay order
// ============================================================

router.post('/create-order', authenticateToken, async (req: Request, res: Response) => {
    try {
        const validation = createPaymentOrderSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: validation.error.format()
            });
        }

        const userId = (req as any).userId;
        const {
            items,
            shippingAddress,
            billingAddress,
            couponCode,
        } = validation.data;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'No items provided' });
        }

        if (!shippingAddress) {
            return res.status(400).json({ error: 'Shipping address is required' });
        }

        // ── Step 1: Validate prices from database (NEVER trust frontend) ──
        const cartItemsInput = items.map(item => ({
            productId: item.productId,
            variantId: item.variantId || undefined,
            quantity: item.quantity,
        }));
        const { validatedItems, subtotal, shippingCost, errors: priceErrors } = await validateCartPrices(cartItemsInput);

        if (priceErrors.length > 0) {
            return res.status(400).json({ error: 'Cart validation failed', details: priceErrors });
        }

        // ── Step 2: Validate stock availability ──
        const stockErrors = await validateStock(
            validatedItems.map(item => ({
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
            }))
        );

        if (stockErrors.length > 0) {
            return res.status(400).json({ error: 'Insufficient stock', details: stockErrors });
        }

        // ── Step 3: Calculate totals ──
        const taxAmount = Math.round(subtotal * 0.18 * 100) / 100; // 18% GST
        let discountAmount = 0;

        // Apply coupon if provided
        if (couponCode) {
            try {
                const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
                if (coupon && coupon.isActive) {
                    if (coupon.expiryDate && coupon.expiryDate < new Date()) {
                        // Expired — ignore silently
                    } else if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
                        // Below minimum — ignore silently
                    } else {
                        if (coupon.discountType === 'PERCENTAGE') {
                            discountAmount = Math.round((subtotal * coupon.value) / 100);
                        } else {
                            discountAmount = coupon.value;
                        }
                    }
                }
            } catch {
                // Coupon errors are non-blocking
            }
        }

        const totalAmount = subtotal + shippingCost + taxAmount - discountAmount;

        // ── Step 4: Reserve stock ──
        await reserveStock(
            validatedItems.map(item => ({
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
            }))
        );

        // ── Step 5: Create the database order ──
        const orderNumber = generateOrderNumber();
        const paymentExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

        const orderProducts = validatedItems.map(item => ({
            productId: item.productId,
            name: item.name,
            sku: item.sku,
            image: item.image || '',
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            variantSize: item.variantSize || '',
            variantColor: item.variantColor || '',
            deliveryCharge: item.deliveryCharge,
        }));

        const order = await prisma.order.create({
            data: {
                orderNumber,
                userId,
                products: orderProducts,
                subtotal,
                shippingCost,
                taxAmount,
                discountAmount,
                totalAmount,
                couponCode: couponCode || undefined,
                paymentMethod: 'ONLINE',
                paymentStatus: 'PENDING',
                orderStatus: 'NEW',
                shippingAddress,
                billingAddress: billingAddress || shippingAddress,
                isStockReserved: true,
                paymentExpiresAt,
                statusHistory: [
                    {
                        status: 'NEW',
                        timestamp: new Date(),
                        note: 'Order created — awaiting payment',
                    },
                ],
            },
        });

        // ── Step 6: Create Razorpay order ──
        const razorpayOrder = await createRazorpayOrder(
            totalAmount,
            'INR',
            order.orderNumber,
            {
                order_id: order.id,
                order_number: order.orderNumber,
            }
        );

        // Update order with Razorpay order ID
        await prisma.order.update({
            where: { id: order.id },
            data: { razorpayOrderId: razorpayOrder.id },
        });

        // ── Step 7: Create payment record ──
        const idempotencyKey = `${order.id}-${Date.now()}`;

        await prisma.payment.create({
            data: {
                paymentId: `PAY-${order.orderNumber}`,
                orderId: order.id,
                userId,
                paymentMethod: 'ONLINE',
                paymentGateway: 'razorpay',
                amountDue: totalAmount,
                paymentStatus: 'PENDING',
                currency: 'INR',
                razorpayOrderId: razorpayOrder.id,
                idempotencyKey,
            },
        });

        // ── Step 8: Auto-save shipping address ──
        try {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (user) {
                const isAddressSaved = user.savedAddresses?.some(
                    addr =>
                        addr.fullName === shippingAddress.name &&
                        addr.phone === shippingAddress.phone &&
                        addr.addressLine1 === shippingAddress.street &&
                        addr.city === shippingAddress.city &&
                        addr.pincode === shippingAddress.pincode
                );

                if (!isAddressSaved) {
                    const newAddress = {
                        id: new ObjectId().toString(),
                        label: user.savedAddresses?.length === 0 ? 'Home' : 'Other',
                        fullName: shippingAddress.name || user.name,
                        phone: shippingAddress.phone || user.phone || '',
                        addressLine1: shippingAddress.street || '',
                        addressLine2: '',
                        city: shippingAddress.city || '',
                        state: shippingAddress.state || '',
                        pincode: shippingAddress.pincode || '',
                        country: shippingAddress.country || 'India',
                        landmark: '',
                        isDefault: user.savedAddresses?.length === 0,
                    };

                    await prisma.user.update({
                        where: { id: userId },
                        data: { savedAddresses: { push: newAddress } },
                    });
                }
            }
        } catch (addrErr) {
            console.error('Failed to auto-save address:', addrErr);
        }

        // ── Return data for frontend Razorpay checkout ──
        res.status(201).json({
            success: true,
            order: {
                id: order.id,
                orderNumber: order.orderNumber,
                totalAmount,
            },
            razorpay: {
                orderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                key_id: getRazorpayKeyId(),
            },
        });
    } catch (error: any) {
        console.error('Create payment order error:', error);
        res.status(500).json({ error: error.message || 'Failed to create payment order' });
    }
});

// ============================================================
// POST /verify — Verify Razorpay payment signature
// ============================================================

router.post('/verify', authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            order_id, // Our internal order ID
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !order_id) {
            return res.status(400).json({ error: 'Missing payment verification data' });
        }

        // ── Step 1: Find and validate order ownership ──
        const order = await prisma.order.findUnique({
            where: { id: order_id },
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (order.userId !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Check if Razorpay order ID matches
        if (order.razorpayOrderId !== razorpay_order_id) {
            return res.status(400).json({ error: 'Order ID mismatch' });
        }

        // Idempotent: if already paid, return success
        if (order.paymentStatus === 'PAID') {
            return res.json({
                success: true,
                message: 'Payment already verified',
                order: {
                    id: order.id,
                    orderNumber: order.orderNumber,
                    paymentStatus: order.paymentStatus,
                },
            });
        }

        // ── Step 2: Verify signature (CRITICAL security check) ──
        const isValid = verifyRazorpaySignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );

        if (!isValid) {
            console.error(`❌ Invalid signature for order ${order.orderNumber}`);

            // Mark payment as failed
            await handlePaymentFailure(order.id, 'Invalid payment signature');

            return res.status(400).json({ error: 'Payment verification failed — invalid signature' });
        }

        // ── Step 3: Handle successful payment ──
        const updatedOrder = await handlePaymentSuccess(
            order.id,
            razorpay_payment_id,
            razorpay_signature
        );

        // ── Step 4: Send confirmation email ──
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user?.email) {
            const orderWithUser = { ...updatedOrder, user: { name: user.name } };
            sendOrderConfirmation(user.email, orderWithUser).catch(err =>
                console.error('Email failed', err)
            );
        }

        // ── Step 5: Emit realtime admin notification ──
        emitNewOrder({
            id: `notif-${updatedOrder.id}-${Date.now()}`,
            orderId: updatedOrder.id,
            orderNumber: updatedOrder.orderNumber,
            customerName: user?.name || 'Customer',
            totalAmount: updatedOrder.totalAmount,
            paymentMethod: 'ONLINE',
            products: updatedOrder.products.map((p: any) => ({ name: p.name, quantity: p.quantity, image: p.image })),
            createdAt: updatedOrder.createdAt.toISOString(),
        });

        res.json({
            success: true,
            message: 'Payment verified successfully',
            order: {
                id: updatedOrder.id,
                orderNumber: updatedOrder.orderNumber,
                paymentStatus: updatedOrder.paymentStatus,
                totalAmount: updatedOrder.totalAmount,
            },
        });
    } catch (error: any) {
        console.error('Payment verification error:', error);
        res.status(500).json({ error: error.message || 'Payment verification failed' });
    }
});

// ============================================================
// POST /webhook — Razorpay webhook endpoint (no auth — uses signature)
// ============================================================

router.post('/webhook', async (req: Request, res: Response) => {
    try {
        const signature = req.headers['x-razorpay-signature'] as string;

        if (!signature) {
            return res.status(400).json({ error: 'Missing webhook signature' });
        }

        // Get raw body for verification
        const rawBody = typeof req.body === 'string'
            ? req.body
            : Buffer.isBuffer(req.body)
            ? req.body
            : JSON.stringify(req.body);

        // Verify webhook signature
        const isValid = verifyWebhookSignature(rawBody, signature);

        if (!isValid) {
            console.error('❌ Invalid webhook signature');
            return res.status(400).json({ error: 'Invalid webhook signature' });
        }

        // Parse the payload
        const payload = typeof req.body === 'string' || Buffer.isBuffer(req.body)
            ? JSON.parse(rawBody.toString())
            : req.body;

        const eventId = payload.event_id || `evt_${Date.now()}`;
        const eventType = payload.event;

        if (!eventType) {
            return res.status(400).json({ error: 'Missing event type' });
        }

        console.log(`📨 Webhook received: ${eventType} (${eventId})`);

        // Process the event idempotently
        await processWebhookEvent(eventId, eventType, payload.payload);

        // Always return 200 to Razorpay (even if processing fails)
        res.status(200).json({ status: 'ok' });
    } catch (error: any) {
        console.error('Webhook processing error:', error);
        // Return 200 to prevent Razorpay from retrying
        res.status(200).json({ status: 'error', message: error.message });
    }
});

// ============================================================
// GET /status/:orderId — Get payment status for an order
// ============================================================

router.get('/status/:orderId', authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;
        const { orderId } = req.params;

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { payment: true },
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Only allow user to view their own orders unless admin
        if (order.userId !== userId && !['ADMIN', 'STAFF'].includes(userRole)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json({
            orderId: order.id,
            orderNumber: order.orderNumber,
            paymentStatus: order.paymentStatus,
            paymentMethod: order.paymentMethod,
            totalAmount: order.totalAmount,
            isPaid: order.isPaid,
            paidAt: order.paidAt,
            razorpayOrderId: order.razorpayOrderId,
            razorpayPaymentId: order.razorpayPaymentId,
            paymentCapturedAt: order.paymentCapturedAt,
            payment: order.payment
                ? {
                      status: order.payment.paymentStatus,
                      transactionId: order.payment.transactionId,
                      failureReason: order.payment.failureReason,
                      attempts: order.payment.attempts,
                      retryCount: order.payment.retryCount,
                      webhookVerified: order.payment.webhookVerified,
                  }
                : null,
        });
    } catch (error: any) {
        console.error('Get payment status error:', error);
        res.status(500).json({ error: 'Failed to get payment status' });
    }
});

// ============================================================
// POST /retry/:orderId — Retry a failed payment
// ============================================================

router.post('/retry/:orderId', authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { orderId } = req.params;

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { payment: true },
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (order.userId !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Only allow retry for failed or expired payments
        if (!['FAILED', 'EXPIRED', 'PENDING'].includes(order.paymentStatus)) {
            return res.status(400).json({
                error: `Cannot retry payment in ${order.paymentStatus} state`,
            });
        }

        // Validate stock is still available
        const stockErrors = await validateStock(
            order.products.map((p: any) => ({
                productId: p.productId,
                variantId: p.variantId,
                quantity: p.quantity,
            }))
        );

        if (stockErrors.length > 0) {
            return res.status(400).json({
                error: 'Some items are no longer available',
                details: stockErrors,
            });
        }

        // If stock was already released, re-reserve it
        if (!order.isStockReserved) {
            await reserveStock(
                order.products.map((p: any) => ({
                    productId: p.productId,
                    variantId: p.variantId,
                    quantity: p.quantity,
                }))
            );

            await prisma.order.update({
                where: { id: orderId },
                data: { isStockReserved: true },
            });
        }

        // Create a new Razorpay order
        const razorpayOrder = await createRazorpayOrder(
            order.totalAmount,
            'INR',
            order.orderNumber,
            {
                order_id: order.id,
                order_number: order.orderNumber,
                retry: 'true',
            }
        );

        // Update order with new Razorpay order ID
        const paymentExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
        await prisma.order.update({
            where: { id: orderId },
            data: {
                razorpayOrderId: razorpayOrder.id,
                paymentStatus: 'PENDING',
                paymentExpiresAt,
                statusHistory: {
                    push: {
                        status: 'RETRY',
                        timestamp: new Date(),
                        note: 'Payment retry initiated',
                    },
                },
            },
        });

        // Update payment record
        if (order.payment) {
            await prisma.payment.update({
                where: { id: order.payment.id },
                data: {
                    razorpayOrderId: razorpayOrder.id,
                    paymentStatus: 'PENDING',
                    failureReason: null,
                    retryCount: { increment: 1 },
                },
            });
        }

        res.json({
            success: true,
            order: {
                id: order.id,
                orderNumber: order.orderNumber,
                totalAmount: order.totalAmount,
            },
            razorpay: {
                orderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                key_id: getRazorpayKeyId(),
            },
        });
    } catch (error: any) {
        console.error('Retry payment error:', error);
        res.status(500).json({ error: error.message || 'Failed to retry payment' });
    }
});

export default router;
