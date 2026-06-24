import { Router, Request, Response } from 'express';
import prisma from '../config/database.js';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { emitStockUpdate, emitNewOrder } from '../socketManager.js';
import { sendOrderConfirmation, sendOrderStatusUpdate } from '../utils/emailService.js';
import { ObjectId } from 'bson';
import { validateCartPrices } from '../utils/paymentService.js';

const router = Router();

// Middleware to verify JWT token
function authenticateToken(req: Request, res: Response, next: Function) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string; role: string };
        (req as any).userId = decoded.userId;
        (req as any).userRole = decoded.role;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

// Generate unique order number
function generateOrderNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `BP-${year}-${random}`;
}

// ============================================================
// Verify Stock — used by frontend before checkout
// ============================================================
router.post('/verify-stock', async (req: Request, res: Response) => {
    try {
        const { items } = req.body;
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'No items to verify' });
        }

        const results: {
            productId: string;
            variantId?: string;
            requested: number;
            currentStock: number;
            available: boolean;
            productName?: string;
        }[] = [];

        for (const item of items) {
            const product = await prisma.product.findUnique({
                where: { id: item.productId },
                select: { id: true, name: true, stockQuantity: true, variants: true, inStock: true }
            });

            if (!product) {
                results.push({
                    productId: item.productId,
                    variantId: item.variantId,
                    requested: item.quantity,
                    currentStock: 0,
                    available: false,
                    productName: 'Unknown product',
                });
                continue;
            }

            // Check variant-level stock if variantId provided
            if (item.variantId && product.variants && product.variants.length > 0) {
                const variant = product.variants.find((v: any) => v.id === item.variantId);
                const variantStock = variant ? variant.stockQuantity : 0;
                results.push({
                    productId: item.productId,
                    variantId: item.variantId,
                    requested: item.quantity,
                    currentStock: variantStock,
                    available: variantStock >= item.quantity,
                    productName: product.name,
                });
            } else {
                // Product-level stock
                results.push({
                    productId: item.productId,
                    requested: item.quantity,
                    currentStock: product.stockQuantity,
                    available: product.stockQuantity >= item.quantity,
                    productName: product.name,
                });
            }
        }

        const allAvailable = results.every(r => r.available);
        res.json({ available: allAvailable, items: results });
    } catch (error) {
        console.error('Verify stock error:', error);
        res.status(500).json({ error: 'Failed to verify stock' });
    }
});

const createOrderSchema = z.object({
    products: z.array(z.object({
        productId: z.string().min(1, 'Product ID is required'),
        variantId: z.string().optional().nullable(),
        quantity: z.number().int().positive('Quantity must be a positive integer'),
    })).min(1, 'At least one product is required'),
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
    paymentMethod: z.enum(['ONLINE', 'COD', 'UPI', 'CARD', 'NETBANKING', 'WALLET']).optional().default('COD'),
    couponCode: z.string().optional().nullable()
});

// ============================================================
// Create new order — with atomic stock validation & decrement
// ============================================================
router.post('/', authenticateToken, async (req: Request, res: Response) => {
    try {
        const validation = createOrderSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: validation.error.format()
            });
        }

        const userId = (req as any).userId;
        const {
            products,
            shippingAddress,
            billingAddress,
            paymentMethod,
            couponCode
        } = validation.data;

        if (!products || products.length === 0) {
            return res.status(400).json({ error: 'No products in order' });
        }

        // ── Step 1: Validate prices/products from database (NEVER trust frontend) ──
        const cartItemsInput = products.map((p: any) => ({
            productId: p.productId,
            variantId: p.variantId,
            quantity: p.quantity,
        }));
        const { validatedItems, subtotal, shippingCost, errors: priceErrors } = await validateCartPrices(cartItemsInput);

        if (priceErrors.length > 0) {
            return res.status(400).json({ error: 'Cart validation failed', details: priceErrors });
        }

        // ── Step 2: Validate stock for every item ──
        const stockErrors: string[] = [];
        const stockUpdates: {
            productId: string;
            variantId?: string;
            newProductStock: number;
            updatedVariants?: any[];
        }[] = [];

        for (const item of validatedItems) {
            const product = await prisma.product.findUnique({
                where: { id: item.productId },
                select: { id: true, name: true, stockQuantity: true, variants: true }
            });

            if (!product) {
                stockErrors.push(`Product "${item.name || item.productId}" not found`);
                continue;
            }

            // Determine if this is a variant or product-level purchase
            const variantId = item.variantId || null;
            if (variantId && product.variants && product.variants.length > 0) {
                const variant = product.variants.find((v: any) => v.id === variantId);
                if (!variant) {
                    stockErrors.push(`Variant not found for "${product.name}"`);
                    continue;
                }
                if (variant.stockQuantity < item.quantity) {
                    stockErrors.push(
                        `Insufficient stock for "${product.name}" (variant). Available: ${variant.stockQuantity}, Requested: ${item.quantity}`
                    );
                    continue;
                }
                // Prepare variant-level update
                const updatedVariants = product.variants.map((v: any) => {
                    if (v.id === variantId) {
                        return { ...v, stockQuantity: v.stockQuantity - item.quantity };
                    }
                    return v;
                });
                const totalVariantStock = updatedVariants.reduce((sum: number, v: any) => sum + v.stockQuantity, 0);
                stockUpdates.push({
                    productId: product.id,
                    variantId,
                    newProductStock: totalVariantStock,
                    updatedVariants,
                });
            } else {
                // Product-level stock
                if (product.stockQuantity < item.quantity) {
                    stockErrors.push(
                        `Insufficient stock for "${product.name}". Available: ${product.stockQuantity}, Requested: ${item.quantity}`
                    );
                    continue;
                }
                stockUpdates.push({
                    productId: product.id,
                    newProductStock: product.stockQuantity - item.quantity,
                });
            }
        }

        if (stockErrors.length > 0) {
            return res.status(400).json({
                error: 'Insufficient stock',
                details: stockErrors,
            });
        }

        // ── Step 3: Atomically decrement stock ──
        for (const update of stockUpdates) {
            const updateData: any = {
                stockQuantity: update.newProductStock,
                inStock: update.newProductStock > 0,
            };
            if (update.updatedVariants) {
                updateData.variants = update.updatedVariants;
            }
            await prisma.product.update({
                where: { id: update.productId },
                data: updateData,
            });
        }

        // ── Step 4: Calculate coupon discount, tax and total amount ──
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
                orderNumber: generateOrderNumber(),
                userId,
                products: orderProducts,
                subtotal,
                shippingCost,
                taxAmount,
                discountAmount,
                totalAmount,
                couponCode: couponCode || undefined,
                paymentMethod: paymentMethod as any,
                paymentStatus: 'PENDING',
                orderStatus: 'NEW',
                shippingAddress,
                billingAddress: billingAddress || shippingAddress,
                statusHistory: [{
                    status: 'NEW',
                    timestamp: new Date(),
                    note: 'Order placed successfully'
                }]
            }
        });

        // ── Auto-save address to User Profile ──
        try {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (user) {
                const isAddressSaved = user.savedAddresses?.some(addr => 
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
                        isDefault: user.savedAddresses?.length === 0
                    };
                    
                    await prisma.user.update({
                        where: { id: userId },
                        data: {
                            savedAddresses: { push: newAddress }
                        }
                    });
                }
            }
        } catch (addrErr) {
            console.error("Failed to auto-save address:", addrErr);
            // Non-blocking error
        }

        // Create payment record
        await prisma.payment.create({
            data: {
                paymentId: `PAY-${order.orderNumber}`,
                orderId: order.id,
                userId,
                paymentMethod: paymentMethod as any,
                amountDue: totalAmount,
                paymentStatus: 'PENDING',
                currency: 'INR'
            }
        });

        // ── Step 4: Emit real-time stock updates ──
        for (const update of stockUpdates) {
            emitStockUpdate({
                productId: update.productId,
                variantId: update.variantId || null,
                newStock: update.newProductStock,
                inStock: update.newProductStock > 0,
                variants: update.updatedVariants
                    ? update.updatedVariants.map((v: any) => ({ id: v.id, stockQuantity: v.stockQuantity }))
                    : undefined,
            });
        }

        // ── Step 5: Send Order Confirmation Email ──
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user && user.email) {
            // Attach user data for the template
            const orderWithUser = { ...order, user: { name: user.name } };
            // Fire and forget email
            sendOrderConfirmation(user.email, orderWithUser).catch(err => console.error("Email failed", err));
        }

        // ── Step 6: Emit realtime admin notification ──
        emitNewOrder({
            id: `notif-${order.id}-${Date.now()}`,
            orderId: order.id,
            orderNumber: order.orderNumber,
            customerName: user?.name || 'Customer',
            totalAmount: order.totalAmount,
            paymentMethod: paymentMethod,
            products: orderProducts.map(p => ({ name: p.name, quantity: p.quantity, image: p.image })),
            createdAt: order.createdAt.toISOString(),
        });

        res.status(201).json({
            message: 'Order placed successfully',
            order
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Get user's orders
// IMPORTANT: This must come BEFORE the /:orderId catch-all route
router.get('/my-orders', authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { page = '1', limit = '10' } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limitNum
            }),
            prisma.order.count({ where: { userId } })
        ]);

        res.json({
            orders,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Admin: Get all orders
// IMPORTANT: This must come BEFORE the /:orderId catch-all route
router.get('/admin/all', authenticateToken, async (req: Request, res: Response) => {
    try {
        const userRole = (req as any).userRole;

        if (!['ADMIN', 'STAFF'].includes(userRole)) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { page = '1', limit = '20', status } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};
        if (status) {
            where.orderStatus = status;
        }

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limitNum,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true
                        }
                    },
                    payment: true
                }
            }),
            prisma.order.count({ where })
        ]);

        res.json({
            orders,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Admin: Update order status
// IMPORTANT: This must come BEFORE the /:orderId catch-all route
router.patch('/admin/:orderId/status', authenticateToken, async (req: Request, res: Response) => {
    try {
        const userRole = (req as any).userRole;
        const userId = (req as any).userId;

        if (!['ADMIN', 'STAFF'].includes(userRole)) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { orderId } = req.params;
        const { status, note } = req.body;

        const order = await prisma.order.findUnique({
            where: { id: orderId }
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const updateData: any = {
            orderStatus: status,
            statusHistory: {
                push: {
                    status,
                    timestamp: new Date(),
                    note: note || `Status updated to ${status}`,
                    updatedBy: userId
                }
            }
        };

        // Set timestamp based on status
        if (status === 'CONFIRMED') updateData.confirmedAt = new Date();
        if (status === 'SHIPPED') updateData.shippedAt = new Date();
        if (status === 'DELIVERED') updateData.deliveredAt = new Date();
        if (status === 'COMPLETED') updateData.completedAt = new Date();

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: updateData,
            include: {
                user: true
            }
        });

        // ── Send Order Status Update Email ──
        if (updatedOrder.user?.email && order.orderStatus !== status) {
            sendOrderStatusUpdate(updatedOrder.user.email, updatedOrder.orderNumber, status)
                .catch(err => console.error("Status Update Email failed", err));
        }

        res.json({
            message: 'Order status updated',
            order: updatedOrder
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

// Admin: Update payment status
// IMPORTANT: This must come BEFORE the /:orderId catch-all route
router.patch('/admin/:orderId/payment', authenticateToken, async (req: Request, res: Response) => {
    try {
        const userRole = (req as any).userRole;

        if (!['ADMIN', 'STAFF'].includes(userRole)) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { orderId } = req.params;
        const { status } = req.body;

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { payment: true }
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const updateData: any = { paymentStatus: status };
        if (status === 'PAID') {
            updateData.isPaid = true;
            updateData.paidAt = new Date();
        } else if (status === 'FAILED' || status === 'PENDING') {
            updateData.isPaid = false;
        }

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: updateData
        });

        if (order.payment) {
            await prisma.payment.update({
                where: { id: order.payment.id },
                data: { paymentStatus: status }
            });
        }

        res.json({
            message: 'Payment status updated',
            order: updatedOrder
        });
    } catch (error) {
        console.error('Update payment status error:', error);
        res.status(500).json({ error: 'Failed to update payment status' });
    }
});

// Admin: Mark COD as received
// IMPORTANT: This must come BEFORE the /:orderId catch-all route
router.patch('/admin/:orderId/cod-received', authenticateToken, async (req: Request, res: Response) => {
    try {
        const userRole = (req as any).userRole;

        if (!['ADMIN', 'STAFF'].includes(userRole)) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { orderId } = req.params;

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { payment: true }
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (order.paymentMethod !== 'COD') {
            return res.status(400).json({ error: 'Not a COD order' });
        }

        if (order.paymentStatus === 'PAID') {
            return res.status(400).json({ error: 'Order already paid' });
        }

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { 
                paymentStatus: 'PAID',
                isPaid: true,
                paidAt: new Date()
            }
        });

        if (order.payment) {
            await prisma.payment.update({
                where: { id: order.payment.id },
                data: {
                    paymentStatus: 'PAID',
                    amountReceived: order.payment.amountDue,
                    receivedDate: new Date()
                }
            });
        }

        res.json({
            message: 'COD marked as received',
            order: updatedOrder
        });
    } catch (error) {
        console.error('Mark COD received error:', error);
        res.status(500).json({ error: 'Failed to mark COD as received' });
    }
});

// Cancel order — restore stock and emit updates
router.post('/:orderId/cancel', authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { orderId } = req.params;
        const { reason } = req.body;

        const order = await prisma.order.findUnique({
            where: { id: orderId }
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (order.userId !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Only allow cancellation for certain statuses
        if (!['NEW', 'CONFIRMED', 'PROCESSING'].includes(order.orderStatus)) {
            return res.status(400).json({ error: 'Order cannot be cancelled at this stage' });
        }

        // Restore stock for each product in the cancelled order
        for (const item of order.products) {
            const product = await prisma.product.findUnique({
                where: { id: item.productId },
                select: { id: true, stockQuantity: true, variants: true }
            });
            if (!product) continue;

            const restoredStock = product.stockQuantity + item.quantity;
            const updateData: any = {
                stockQuantity: restoredStock,
                inStock: true,
            };

            // If this was a variant purchase, restore variant stock too
            if ((item as any).variantId && product.variants && product.variants.length > 0) {
                updateData.variants = product.variants.map((v: any) => {
                    if (v.id === (item as any).variantId) {
                        return { ...v, stockQuantity: v.stockQuantity + item.quantity };
                    }
                    return v;
                });
            }

            await prisma.product.update({
                where: { id: item.productId },
                data: updateData,
            });

            emitStockUpdate({
                productId: item.productId,
                newStock: restoredStock,
                inStock: true,
                variants: updateData.variants
                    ? updateData.variants.map((v: any) => ({ id: v.id, stockQuantity: v.stockQuantity }))
                    : undefined,
            });
        }

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                orderStatus: 'CANCELLED',
                cancelledAt: new Date(),
                cancellationReason: reason || 'Cancelled by customer',
                statusHistory: {
                    push: {
                        status: 'CANCELLED',
                        timestamp: new Date(),
                        note: reason || 'Cancelled by customer'
                    }
                }
            }
        });

        res.json({
            message: 'Order cancelled successfully',
            order: updatedOrder
        });
    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({ error: 'Failed to cancel order' });
    }
});

// Get single order by ID
// IMPORTANT: This catch-all route MUST be defined LAST among the order routes
router.get('/:orderId', authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;
        const { orderId } = req.params;

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                payment: true
            }
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Only allow user to view their own orders unless admin
        if (order.userId !== userId && !['ADMIN', 'STAFF'].includes(userRole)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json({ order });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ error: 'Failed to fetch order' });
    }
});

export default router;
