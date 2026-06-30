import { Router, Request, Response } from 'express';
import prisma from '../config/database.js';
import jwt from 'jsonwebtoken';
import { JWT_VERIFY_OPTIONS } from '../middlewares/security.js';

const router = Router();

// Middleware to verify JWT token
function authenticateToken(req: Request, res: Response, next: Function) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string, JWT_VERIFY_OPTIONS) as { userId: string; role: string };
        (req as any).userId = decoded.userId;
        (req as any).userRole = decoded.role;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

// Ensure Admin or Staff Role
function authorizeAdmin(req: Request, res: Response, next: Function) {
    const role = (req as any).userRole;
    if (!['ADMIN', 'STAFF'].includes(role)) {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
}

// ============================================================
// Public/User Route: Apply Coupon during Checkout
// ============================================================
router.post('/apply', authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { code, cartTotal } = req.body;

        if (!code) {
            return res.status(400).json({ error: 'Coupon code helps required' });
        }

        const coupon = await prisma.coupon.findUnique({
            where: { code: code.toUpperCase() }
        });

        if (!coupon) {
            return res.status(404).json({ error: 'Invalid coupon code' });
        }

        if (!coupon.isActive) {
            return res.status(400).json({ error: 'This coupon is currently inactive' });
        }

        if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
            return res.status(400).json({ error: 'This coupon has expired' });
        }

        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ error: 'This coupon has reached its usage limit' });
        }

        if (coupon.minOrderAmount && cartTotal < coupon.minOrderAmount) {
            return res.status(400).json({ 
                error: `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon` 
            });
        }

        // Check if user has exceeded their individual usage limit
        const userUsageCount = await prisma.couponUsage.count({
            where: { couponId: coupon.id, userId }
        });

        if (userUsageCount >= coupon.userUsageLimit) {
            return res.status(400).json({ error: 'You have exhausted the usage limit for this coupon' });
        }

        // Calculate discount
        let discountAmount = 0;
        if (coupon.discountType === 'PERCENTAGE') {
            discountAmount = (cartTotal * coupon.value) / 100;
        } else {
            discountAmount = coupon.value;
        }

        // Prevent discount from being more than the cart total itself
        if (discountAmount > cartTotal) {
            discountAmount = cartTotal;
        }

        res.json({
            message: 'Coupon applied successfully',
            discountAmount: discountAmount,
            couponCode: coupon.code,
            type: coupon.discountType,
            value: coupon.value
        });
        
    } catch (error) {
        console.error('Apply coupon error:', error);
        res.status(500).json({ error: 'Failed to apply coupon' });
    }
});


// ============================================================
// Admin Routes: Manage Coupons
// ============================================================

// GET All
router.get('/admin', authenticateToken, authorizeAdmin, async (req: Request, res: Response) => {
    try {
        const coupons = await prisma.coupon.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(coupons);
    } catch (error) {
        console.error('Fetch coupons error:', error);
        res.status(500).json({ error: 'Failed to fetch coupons' });
    }
});

// POST Create
router.post('/admin', authenticateToken, authorizeAdmin, async (req: Request, res: Response) => {
    try {
        const { code, description, discountType, value, minOrderAmount, expiryDate, usageLimit, userUsageLimit, isActive } = req.body;

        const exists = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
        if (exists) {
            return res.status(400).json({ error: 'A coupon with this code already exists' });
        }

        const coupon = await prisma.coupon.create({
            data: {
                code: code.toUpperCase(),
                description,
                discountType,
                value: parseFloat(value),
                minOrderAmount: parseFloat(minOrderAmount || 0),
                expiryDate: expiryDate ? new Date(expiryDate) : null,
                usageLimit: usageLimit ? parseInt(usageLimit) : null,
                userUsageLimit: userUsageLimit ? parseInt(userUsageLimit) : 1,
                isActive: isActive !== undefined ? isActive : true
            }
        });

        res.status(201).json(coupon);
    } catch (error) {
        console.error('Create coupon error:', error);
        res.status(500).json({ error: 'Failed to create coupon' });
    }
});

// PUT Update
router.put('/admin/:id', authenticateToken, authorizeAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { code, description, discountType, value, minOrderAmount, expiryDate, usageLimit, userUsageLimit, isActive } = req.body;

        const coupon = await prisma.coupon.update({
            where: { id },
            data: {
                code: code ? code.toUpperCase() : undefined,
                description,
                discountType,
                value: value !== undefined ? parseFloat(value) : undefined,
                minOrderAmount: minOrderAmount !== undefined ? parseFloat(minOrderAmount) : undefined,
                expiryDate: expiryDate ? new Date(expiryDate) : null,
                usageLimit: usageLimit !== undefined ? (usageLimit === null ? null : parseInt(usageLimit)) : undefined,
                userUsageLimit: userUsageLimit !== undefined ? parseInt(userUsageLimit) : undefined,
                isActive
            }
        });

        res.json(coupon);
    } catch (error) {
        console.error('Update coupon error:', error);
        res.status(500).json({ error: 'Failed to update coupon' });
    }
});

// DELETE User
router.delete('/admin/:id', authenticateToken, authorizeAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.coupon.delete({ where: { id } });
        res.json({ message: 'Coupon deleted successfully' });
    } catch (error) {
        console.error('Delete coupon error:', error);
        res.status(500).json({ error: 'Failed to delete coupon' });
    }
});

export default router;
