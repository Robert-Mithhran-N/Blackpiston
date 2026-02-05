import { Router, Request, Response } from 'express';
import prisma from '../config/database.js';
import jwt from 'jsonwebtoken';

const router = Router();

// Middleware to verify JWT token
function authenticateToken(req: Request, res: Response, next: Function) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as { userId: string; role: string };
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

// Create new order
router.post('/', authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const {
            products,
            shippingAddress,
            billingAddress,
            paymentMethod = 'COD',
            couponCode
        } = req.body;

        if (!products || products.length === 0) {
            return res.status(400).json({ error: 'No products in order' });
        }

        // Calculate totals
        let subtotal = 0;
        const orderProducts = products.map((item: any) => {
            const itemTotal = item.unitPrice * item.quantity;
            subtotal += itemTotal;
            return {
                productId: item.productId,
                name: item.name,
                sku: item.sku || '',
                image: item.image,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: itemTotal,
                variantSize: item.variantSize,
                variantColor: item.variantColor
            };
        });

        const shippingCost = subtotal >= 5000 ? 0 : 99; // Free shipping over ₹5000
        const taxAmount = Math.round(subtotal * 0.18 * 100) / 100; // 18% GST
        const totalAmount = subtotal + shippingCost + taxAmount;

        // Create order
        const order = await prisma.order.create({
            data: {
                orderNumber: generateOrderNumber(),
                userId,
                products: orderProducts,
                subtotal,
                shippingCost,
                taxAmount,
                discountAmount: 0,
                totalAmount,
                couponCode,
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

// Get single order by ID
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

// Cancel order
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

// Admin: Get all orders
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
            data: updateData
        });

        res.json({
            message: 'Order status updated',
            order: updatedOrder
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

export default router;
