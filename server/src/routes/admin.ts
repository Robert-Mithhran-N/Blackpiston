import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';

const router = Router();

// ============================================================
// Auth Middleware — verify JWT and require ADMIN/STAFF role
// ============================================================
function authenticateAdmin(req: Request, res: Response, next: Function) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as {
            userId: string;
            role: string;
        };

        if (!['ADMIN', 'STAFF'].includes(decoded.role)) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        (req as any).userId = decoded.userId;
        (req as any).userRole = decoded.role;
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

// ============================================================
// Dashboard Stats
// ============================================================
router.get('/dashboard/stats', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const [
            totalOrders,
            pendingOrders,
            completedOrders,
            totalUsers,
            totalProducts,
        ] = await Promise.all([
            prisma.order.count(),
            prisma.order.count({ where: { orderStatus: 'PENDING' } }),
            prisma.order.count({ where: { orderStatus: 'DELIVERED' } }),
            prisma.user.count(),
            prisma.product.count({ where: { isActive: true } }),
        ]);

        // Calculate total revenue from completed orders
        const revenueResult = await prisma.order.aggregate({
            _sum: { totalAmount: true },
            where: { orderStatus: 'DELIVERED' }
        });
        const totalRevenue = revenueResult._sum.totalAmount || 0;

        // Payment stats
        const [paidPayments, pendingPayments, failedPayments] = await Promise.all([
            prisma.payment.count({ where: { paymentStatus: 'COMPLETED' } }),
            prisma.payment.count({ where: { paymentStatus: 'PENDING' } }),
            prisma.payment.count({ where: { paymentStatus: 'FAILED' } }),
        ]);

        // Payment totals by method
        const onlinePayments = await prisma.payment.aggregate({
            _sum: { amount: true },
            where: { paymentStatus: 'COMPLETED', paymentMethod: { not: 'COD' } }
        });
        const codPaymentsTotal = await prisma.payment.aggregate({
            _sum: { amount: true },
            where: { paymentStatus: 'COMPLETED', paymentMethod: 'COD' }
        });

        const onlineTotal = onlinePayments._sum.amount || 0;
        const codTotal = codPaymentsTotal._sum.amount || 0;

        // Users who have placed orders
        const purchasingUsers = await prisma.order.groupBy({
            by: ['userId'],
        });

        // New users this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const newUsersThisMonth = await prisma.user.count({
            where: { createdAt: { gte: startOfMonth } }
        });

        res.json({
            dashboardStats: {
                totalOrders,
                pendingOrders,
                completedOrders,
                totalRevenue,
                totalPurchasingUsers: purchasingUsers.length,
                failedPayments,
                pendingPayments,
            },
            paymentSummary: {
                onlineTotal,
                codTotal,
                combinedTotal: onlineTotal + codTotal,
            },
            paymentStats: {
                paid: paidPayments,
                pending: pendingPayments,
                failed: failedPayments,
                totalAmount: onlineTotal + codTotal,
            },
            userStats: {
                totalRegistered: totalUsers,
                totalPurchasers: purchasingUsers.length,
                newThisMonth: newUsersThisMonth,
            },
            productStats: {
                totalProducts,
            }
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});

// ============================================================
// Products CRUD
// ============================================================

// Create product
router.post('/products', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const {
            name, slug, description, shortDescription, categoryId, categorySlug,
            brand, price, offerPrice, images, tags, sku,
            isFeatured, isActive, weight, dimensions, variants, specifications,
            stockQuantity, rating, totalReviews, productTypeId
        } = req.body;

        // Auto-generate SKU if not provided
        const finalSku = sku || `BP-${Date.now().toString(36).toUpperCase()}`;

        const stock = stockQuantity ?? 0;

        // Normalize tags into tagStrings for search
        const rawTags: string[] = tags || [];
        const tagStrings = rawTags.map((t: string) => t.replace(/^#/, '').trim().toLowerCase()).filter(Boolean);

        const product = await prisma.product.create({
            data: {
                name,
                slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                description,
                shortDescription,
                productTypeId: productTypeId || null,
                categoryId,
                categorySlug,
                brand,
                price,
                offerPrice: offerPrice ?? null,
                sku: finalSku,
                stockQuantity: stock,
                inStock: stock > 0,
                images: images || [],
                tags: rawTags,
                tagStrings,
                isFeatured: isFeatured || false,
                isActive: isActive !== false,
                weight,
                dimensions,
                variants: variants || [],
                specifications: specifications || [],
                rating: rating ?? 0,
                totalReviews: totalReviews ?? 0,
            },
            include: { category: true, productType: true }
        });

        res.status(201).json({ message: 'Product created', product });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

// Update product
router.put('/products/:id', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Remove fields that shouldn't be updated directly
        delete updateData.id;
        delete updateData.createdAt;

        // Auto-compute inStock when stockQuantity changes
        if (updateData.stockQuantity !== undefined) {
            updateData.inStock = updateData.stockQuantity > 0;
        }

        // If tags are being updated, also update tagStrings
        if (updateData.tags && Array.isArray(updateData.tags)) {
            updateData.tagStrings = updateData.tags.map((t: string) => t.replace(/^#/, '').trim().toLowerCase()).filter(Boolean);
        }

        const product = await prisma.product.update({
            where: { id },
            data: updateData,
            include: { category: true, productType: true }
        });

        res.json({ message: 'Product updated', product });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// Delete product
router.delete('/products/:id', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.product.delete({ where: { id } });

        res.json({ message: 'Product deleted' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// Get all products (admin view — includes inactive)
router.get('/products', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const { page = '1', limit = '20', search, category, status } = req.query;
        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search as string, mode: 'insensitive' } },
                { brand: { contains: search as string, mode: 'insensitive' } },
                { tagStrings: { hasSome: [(search as string).replace(/^#/, '').trim().toLowerCase()] } },
            ];
        }

        if (category) {
            where.categorySlug = category;
        }

        const productTypeId = req.query.productTypeId as string | undefined;
        if (productTypeId) {
            where.productTypeId = productTypeId;
        }

        if (status === 'active') where.isActive = true;
        if (status === 'inactive') where.isActive = false;

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' },
                include: { category: true, productType: true, inventory: true }
            }),
            prisma.product.count({ where })
        ]);

        res.json({
            products,
            pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) }
        });
    } catch (error) {
        console.error('Admin get products error:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// ============================================================
// Categories CRUD
// ============================================================
router.post('/categories', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const { name, slug, description, image, icon, sortOrder, productTypeId } = req.body;
        const category = await prisma.productCategory.create({
            data: {
                name,
                slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                description,
                image,
                icon,
                sortOrder: sortOrder || 0,
                productTypeId: productTypeId || null,
                isActive: true,
            }
        });
        res.status(201).json({ message: 'Category created', category });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ error: 'Failed to create category' });
    }
});

router.put('/categories/:id', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        delete updateData.id;
        const category = await prisma.productCategory.update({
            where: { id },
            data: updateData,
        });
        res.json({ message: 'Category updated', category });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ error: 'Failed to update category' });
    }
});

router.delete('/categories/:id', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.productCategory.delete({ where: { id } });
        res.json({ message: 'Category deleted' });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ error: 'Failed to delete category' });
    }
});

// ============================================================
// Payments
// ============================================================
router.get('/payments', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const { page = '1', limit = '20', status, method } = req.query;
        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};
        if (status) where.paymentStatus = status;
        if (method) where.paymentMethod = method;

        const [payments, total] = await Promise.all([
            prisma.payment.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.payment.count({ where })
        ]);

        res.json({
            payments,
            pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) }
        });
    } catch (error) {
        console.error('Get payments error:', error);
        res.status(500).json({ error: 'Failed to fetch payments' });
    }
});

// ============================================================
// Product Requests
// ============================================================
router.get('/requests', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const { page = '1', limit = '20', status } = req.query;
        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};
        if (status) where.status = status;

        const [requests, total] = await Promise.all([
            prisma.request.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.request.count({ where })
        ]);

        res.json({
            requests,
            pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) }
        });
    } catch (error) {
        console.error('Get requests error:', error);
        res.status(500).json({ error: 'Failed to fetch requests' });
    }
});

router.patch('/requests/:id', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, adminNotes } = req.body;

        const updateData: any = {};
        if (status) updateData.status = status;
        if (adminNotes) updateData.adminNotes = adminNotes;
        if (status === 'CLOSED') updateData.closedAt = new Date();

        const request = await prisma.request.update({
            where: { id },
            data: updateData,
        });

        res.json({ message: 'Request updated', request });
    } catch (error) {
        console.error('Update request error:', error);
        res.status(500).json({ error: 'Failed to update request' });
    }
});

// ============================================================
// Inventory / Low Stock
// ============================================================
router.get('/inventory/low-stock', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        // MongoDB doesn't support field-to-field comparisons in Prisma,
        // so we fetch all inventory and filter in JS
        const allInventory = await prisma.inventory.findMany({
            include: {
                product: {
                    select: { id: true, name: true, categorySlug: true, images: true }
                }
            },
            orderBy: { currentStock: 'asc' }
        });

        const lowStock = allInventory.filter(
            (item: { currentStock: number; reorderPoint: number }) =>
                item.currentStock <= item.reorderPoint
        );

        res.json({ lowStockProducts: lowStock });
    } catch (error) {
        console.error('Get low stock error:', error);
        res.status(500).json({ error: 'Failed to fetch low stock products' });
    }
});

// ============================================================
// Users
// ============================================================
router.get('/users', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const { page = '1', limit = '20', search } = req.query;
        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};
        if (search) {
            where.OR = [
                { name: { contains: search as string, mode: 'insensitive' } },
                { email: { contains: search as string, mode: 'insensitive' } },
            ];
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    role: true,
                    avatar: true,
                    isActive: true,
                    authProvider: true,
                    createdAt: true,
                    lastLogin: true,
                    _count: { select: { orders: true } }
                }
            }),
            prisma.user.count({ where })
        ]);

        res.json({
            users,
            pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// ============================================================
// Top Offers CRUD
// ============================================================
router.post('/top-offers', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const {
            productId, title, description, discountPercent,
            offerPrice, originalPrice, badgeText, priority,
            validFrom, validUntil, isActive
        } = req.body;

        const offer = await prisma.topOffer.create({
            data: {
                productId,
                title,
                description,
                discountPercent,
                offerPrice,
                originalPrice,
                badgeText,
                priority: priority || 0,
                validFrom: validFrom ? new Date(validFrom) : null,
                validUntil: validUntil ? new Date(validUntil) : null,
                isActive: isActive !== false,
            },
            include: { product: true }
        });

        res.status(201).json({ message: 'Top offer created', offer });
    } catch (error) {
        console.error('Create top offer error:', error);
        res.status(500).json({ error: 'Failed to create top offer' });
    }
});

router.put('/top-offers/:id', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        delete updateData.id;

        if (updateData.validFrom) updateData.validFrom = new Date(updateData.validFrom);
        if (updateData.validUntil) updateData.validUntil = new Date(updateData.validUntil);

        const offer = await prisma.topOffer.update({
            where: { id },
            data: updateData,
            include: { product: true }
        });

        res.json({ message: 'Top offer updated', offer });
    } catch (error) {
        console.error('Update top offer error:', error);
        res.status(500).json({ error: 'Failed to update top offer' });
    }
});

router.delete('/top-offers/:id', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.topOffer.delete({ where: { id } });
        res.json({ message: 'Top offer deleted' });
    } catch (error) {
        console.error('Delete top offer error:', error);
        res.status(500).json({ error: 'Failed to delete top offer' });
    }
});

// Get all top offers (admin — includes inactive)
router.get('/top-offers', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const offers = await prisma.topOffer.findMany({
            include: { product: true },
            orderBy: { priority: 'asc' }
        });
        res.json({ offers });
    } catch (error) {
        console.error('Get top offers error:', error);
        res.status(500).json({ error: 'Failed to fetch top offers' });
    }
});

export default router;
