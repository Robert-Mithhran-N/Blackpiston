import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import prisma from '../config/database.js';
import { deleteFromCloudinary } from '../config/cloudinary.js';
import { emitStockUpdate } from '../socketManager.js';
import { Parser } from 'json2csv';
import { generateProductContent, regenerateSection } from '../config/gemini.js';
import { JWT_VERIFY_OPTIONS } from '../middlewares/security.js';
import { invalidateProducts, invalidateKnowledge } from '../utils/ai/cacheManager.js';
import { aiAnalyticsService } from '../utils/ai/analytics.js';

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
        const decoded = jwt.verify(token, process.env.JWT_SECRET!, JWT_VERIFY_OPTIONS) as {
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
            prisma.order.count({ where: { orderStatus: 'NEW' } }),
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
            prisma.payment.count({ where: { paymentStatus: 'PAID' } }),
            prisma.payment.count({ where: { paymentStatus: 'PENDING' } }),
            prisma.payment.count({ where: { paymentStatus: 'FAILED' } }),
        ]);

        // Payment totals by method
        const onlinePayments = await prisma.payment.aggregate({
            _sum: { amountReceived: true },
            where: { paymentStatus: 'PAID', paymentMethod: { not: 'COD' } }
        });
        const codPaymentsTotal = await prisma.payment.aggregate({
            _sum: { amountReceived: true },
            where: { paymentStatus: 'PAID', paymentMethod: 'COD' }
        });

        const onlineTotal = onlinePayments._sum?.amountReceived || 0;
        const codTotal = codPaymentsTotal._sum?.amountReceived || 0;

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
// Zod Validation Schemas
// ============================================================

const productImageSchema = z.object({
    url: z.string().url(),
    public_id: z.string().optional(),
    alt: z.string().optional(),
    isPrimary: z.boolean().optional().default(false),
});

// createCategorySchema removed — categories feature removed

const createProductSchema = z.object({
    name: z.string().min(1, 'Product name is required').trim(),
    slug: z.string().optional().nullable(),
    shortDescription: z.string().optional().nullable(),
    // categoryId: removed with categories feature
    // categorySlug: removed with categories feature
    brand: z.string().optional().nullable(),
    price: z.coerce.number().positive('Price must be greater than 0'),
    offerPrice: z.coerce.number().positive().optional().nullable(),
    costPrice: z.coerce.number().optional().nullable(),     // frontend sends this
    deliveryCharge: z.coerce.number().nonnegative('Delivery charge must be 0 or greater').optional().default(0),
    images: z.array(productImageSchema).optional().default([]),
    thumbnailUrl: z.string().optional().nullable(),
    thumbnailPublicId: z.string().optional().nullable(),
    tags: z.array(z.string()).optional().default([]),
    sku: z.string().optional().nullable(),
    isFeatured: z.boolean().optional().default(false),
    isActive: z.boolean().optional().default(true),
    weight: z.coerce.number().optional().nullable(),
    dimensions: z.object({
        length: z.number().optional().nullable(),
        width: z.number().optional().nullable(),
        height: z.number().optional().nullable(),
    }).optional().nullable(),
    variants: z.array(z.object({
        id: z.string().optional().nullable(),
        size: z.string().optional().nullable(),
        color: z.string().optional().nullable(),
        model: z.string().optional().nullable(),
        sku: z.string().optional().nullable(),
        stockQuantity: z.coerce.number().optional().default(0),
        price: z.coerce.number().positive().optional().nullable(),
        priceModifier: z.number().optional().default(0),
        images: z.array(productImageSchema).optional().default([]),
        deliveryCharge: z.coerce.number().nonnegative('Variant delivery charge must be 0 or greater').optional().nullable(),
    })).optional().default([]),
    specifications: z.array(z.object({
        label: z.string(),
        value: z.string(),
    })).optional().default([]),
    stockQuantity: z.coerce.number().int().min(0).optional().default(0),
    rating: z.number().optional().default(0),
    totalReviews: z.number().optional().default(0),
    productType: z.string().optional().nullable(),
    sections: z.array(z.object({
        title: z.string(),
        content: z.string(),
        order: z.number().optional()
    })).optional().default([]),
    seoTitle: z.string().optional().nullable(),
    seoDescription: z.string().optional().nullable(),
    seoKeywords: z.array(z.string()).optional().default([]),
    highlights: z.array(z.string()).optional().default([]),
    shippingBadgeTitle: z.string().optional().nullable(),
    shippingBadgeDesc: z.string().optional().nullable(),
    warrantyBadgeTitle: z.string().optional().nullable(),
    warrantyBadgeDesc: z.string().optional().nullable(),
    returnBadgeTitle: z.string().optional().nullable(),
    returnBadgeDesc: z.string().optional().nullable(),
});

const updateProductSchema = createProductSchema.partial();

// ============================================================
// Categories Management — REMOVED (using tags instead)
// Stub routes return informative messages
// ============================================================


// ============================================================
// AI Content Generation
// ============================================================

// Generate product content using Gemini AI
router.post('/products/generate-content', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const { name, brand, productType, variantInfo } = req.body;

        if (!name || typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({ error: 'Product name is required' });
        }

        const content = await generateProductContent({
            name: name.trim(),
            brand: brand?.trim() || undefined,
            productType: productType?.trim() || undefined,
            variantInfo: variantInfo?.trim() || undefined,
        });

        res.json({ content });
    } catch (error: any) {
        console.error('❌ [POST /products/generate-content] AI generation error:', error?.message || error);

        // Handle specific error types
        if (error?.message?.includes('GEMINI_API_KEY')) {
            return res.status(503).json({ error: 'AI service is not configured. Please set GEMINI_API_KEY.' });
        }
        if (error?.status === 429 || error?.message?.includes('429') || error?.message?.toLowerCase()?.includes('rate limit')) {
            return res.status(429).json({ error: 'AI rate limit exceeded. Please try again in a few seconds.' });
        }
        if (error?.message?.includes('empty response')) {
            return res.status(502).json({ error: 'AI returned an empty response. Please try again.' });
        }

        res.status(500).json({ error: error?.message || 'Failed to generate product content' });
    }
});

// Regenerate a single section using Gemini AI
router.post('/products/regenerate-section', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const { name, brand, productType, sectionTitle } = req.body;

        if (!name || !sectionTitle) {
            return res.status(400).json({ error: 'Product name and section title are required' });
        }

        const section = await regenerateSection({
            name: name.trim(),
            brand: brand?.trim() || undefined,
            productType: productType?.trim() || undefined,
            sectionTitle: sectionTitle.trim(),
        });

        res.json({ section });
    } catch (error: any) {
        console.error('❌ [POST /products/regenerate-section] AI regeneration error:', error?.message || error);
        res.status(500).json({ error: error?.message || 'Failed to regenerate section' });
    }
});

// ============================================================
// Products CRUD
// ============================================================

// Create product
router.post('/products', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        // Validate with Zod
        const parseResult = createProductSchema.safeParse(req.body);
        if (!parseResult.success) {
            const errors = parseResult.error.issues.map(i => `${i.path.join('.')}: ${i.message} `);
            return res.status(400).json({ error: 'Validation failed', details: errors });
        }

        const data = parseResult.data;

        // Sanitize ObjectId fields — empty strings and non-24-hex values become null
        const isValidObjectId = (v: any) => typeof v === 'string' && /^[a-fA-F0-9]{24}$/.test(v);
        // safeCategoryId removed with categories feature

        // Auto-generate SKU if not provided
        const finalSku = data.sku || `BP - ${Date.now().toString(36).toUpperCase()} `;

        // Normalize tags into tagStrings for search
        const tagStrings = data.tags.map((t: string) => t.replace(/^#/, '').trim().toLowerCase()).filter(Boolean);

        // Sanitize variants — ensure each has all required fields + generate IDs
        const safeVariants = data.variants.map((v: any, i: number) => ({
            id: v.id || randomUUID(),
            size: v.size || null,
            color: v.color || null,
            model: v.model || null,
            sku: v.sku || `${finalSku}-V${i + 1}`,
            stockQuantity: v.stockQuantity ?? 0,
            price: v.price ?? null,
            priceModifier: v.priceModifier ?? 0,
            images: v.images || [],
            deliveryCharge: v.deliveryCharge ?? null,
        }));

        // Strip undefined values that Prisma can't handle
        const safeWeight = data.weight != null ? Number(data.weight) : undefined;
        const safeDimensions = data.dimensions && typeof data.dimensions === 'object' ? data.dimensions : undefined;


        const product = await prisma.product.create({
            data: {
                name: data.name,
                slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                shortDescription: data.shortDescription,
                // categoryId: removed with categories
                // categorySlug: removed with categories
                // productType: removed with categories
                brand: data.brand,
                price: data.price,
                offerPrice: data.offerPrice ?? null,
                deliveryCharge: data.deliveryCharge,
                sku: finalSku,
                stockQuantity: data.stockQuantity,
                inStock: data.stockQuantity > 0,
                images: data.images,
                thumbnailUrl: data.thumbnailUrl,
                thumbnailPublicId: data.thumbnailPublicId,
                tags: data.tags,
                tagStrings,
                isFeatured: data.isFeatured,
                isActive: data.isActive,
                ...(safeWeight !== undefined && { weight: safeWeight }),
                ...(safeDimensions !== undefined && { dimensions: safeDimensions }),
                variants: safeVariants,
                specifications: data.specifications,
                rating: data.rating,
                totalReviews: data.totalReviews,
                seoTitle: data.seoTitle || null,
                seoDescription: data.seoDescription || null,
                seoKeywords: data.seoKeywords || [],
                highlights: data.highlights || [],
                shippingBadgeTitle: data.shippingBadgeTitle || null,
                shippingBadgeDesc: data.shippingBadgeDesc || null,
                warrantyBadgeTitle: data.warrantyBadgeTitle || null,
                warrantyBadgeDesc: data.warrantyBadgeDesc || null,
                returnBadgeTitle: data.returnBadgeTitle || null,
                returnBadgeDesc: data.returnBadgeDesc || null,
                sections: {
                    create: data.sections.map((s: any, idx: number) => ({
                        title: s.title,
                        content: s.content,
                        order: s.order ?? idx
                    }))
                }
            }
            // include: { category: true } removed
        });

        invalidateProducts().catch(err => console.error('[Cache Invalidation] Failed to invalidate products cache:', err));
        res.status(201).json({ message: 'Product created', product });
    } catch (error: any) {
        console.error('❌ [POST /products] Create product error:', error);
        res.status(500).json({ error: error?.message || 'Failed to create product' });
    }
});

// Update product
router.put('/products/:id', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        const parseResult = updateProductSchema.safeParse(req.body);
        if (!parseResult.success) {
            const errors = parseResult.error.issues.map(i => `${i.path.join('.')}: ${i.message}`);
            return res.status(400).json({ error: 'Validation failed', details: errors });
        }
        const body = parseResult.data;


        // Helper: convert to number or null
        const toFloatOrNull = (v: any): number | null => {
            if (v === null || v === undefined || v === '') return null;
            const n = Number(v);
            return isNaN(n) ? null : n;
        };
        const toIntOrZero = (v: any): number => {
            if (v === null || v === undefined || v === '') return 0;
            const n = parseInt(String(v), 10);
            return isNaN(n) ? 0 : n;
        };

        // Sanitize ObjectId fields
        const isValidObjectId = (v: any) => typeof v === 'string' && /^[a-fA-F0-9]{24}$/.test(v);

        // Build explicit update object — only known Prisma fields
        const updateData: Record<string, any> = {};

        // String fields
        if ('name' in body && body.name) updateData.name = String(body.name).trim();
        if ('slug' in body) updateData.slug = body.slug || undefined;
        if ('shortDescription' in body) updateData.shortDescription = body.shortDescription || null;
        if ('brand' in body) updateData.brand = body.brand || null;
        if ('sku' in body) updateData.sku = body.sku || undefined;
        // categorySlug removed with categories
        // productType removed with categories

        // ObjectId fields
        // categoryId removed with categories

        // Numeric fields — coerce from string
        if ('price' in body) {
            const p = toFloatOrNull(body.price);
            if (p !== null && p > 0) updateData.price = p;
        }
        if ('offerPrice' in body) updateData.offerPrice = toFloatOrNull(body.offerPrice);
        if ('deliveryCharge' in body) {
            const dc = toFloatOrNull(body.deliveryCharge);
            if (dc !== null && dc >= 0) updateData.deliveryCharge = dc;
        }
        if ('stockQuantity' in body) {
            updateData.stockQuantity = toIntOrZero(body.stockQuantity);
            updateData.inStock = updateData.stockQuantity > 0;
        }
        if ('weight' in body) {
            const w = toFloatOrNull(body.weight);
            if (w !== null) updateData.weight = w;
        }

        // Boolean fields
        if ('isFeatured' in body) updateData.isFeatured = Boolean(body.isFeatured);
        if ('isActive' in body) updateData.isActive = Boolean(body.isActive);

        // Array fields
        if ('images' in body && Array.isArray(body.images)) updateData.images = body.images;
        if ('thumbnailUrl' in body) updateData.thumbnailUrl = body.thumbnailUrl;
        if ('thumbnailPublicId' in body) updateData.thumbnailPublicId = body.thumbnailPublicId;
        if ('tags' in body && Array.isArray(body.tags)) {
            updateData.tags = body.tags;
            updateData.tagStrings = body.tags.map((t: string) => t.replace(/^#/, '').trim().toLowerCase()).filter(Boolean);
        }
        if ('specifications' in body && Array.isArray(body.specifications)) updateData.specifications = body.specifications;

        // Dimensions
        if ('dimensions' in body && body.dimensions && typeof body.dimensions === 'object') {
            updateData.dimensions = body.dimensions;
        }

        // Variants — critical: coerce price and stockQuantity to proper types
        if ('variants' in body && Array.isArray(body.variants)) {
            const baseSku = updateData.sku || body.sku || id;
            updateData.variants = body.variants.map((v: any, i: number) => ({
                id: v.id || randomUUID(),
                size: v.size || null,
                color: v.color || null,
                model: v.model || null,
                sku: v.sku || `${baseSku}-V${i + 1}`,
                stockQuantity: toIntOrZero(v.stockQuantity),
                price: toFloatOrNull(v.price),
                priceModifier: toFloatOrNull(v.priceModifier) ?? 0,
                images: Array.isArray(v.images) ? v.images : [],
                deliveryCharge: toFloatOrNull(v.deliveryCharge),
            }));
        }


        if ('sections' in body && Array.isArray(body.sections)) {
            // we update by deleting old and creating new ones
            await prisma.productSection.deleteMany({ where: { productId: id } });
            if (body.sections.length > 0) {
                updateData.sections = {
                    create: body.sections.map((s: any, idx: number) => ({
                        title: s.title,
                        content: s.content,
                        order: s.order ?? idx
                    }))
                };
            }
        }

        // SEO and highlights fields
        if ('seoTitle' in body) updateData.seoTitle = body.seoTitle || null;
        if ('seoDescription' in body) updateData.seoDescription = body.seoDescription || null;
        if ('seoKeywords' in body && Array.isArray(body.seoKeywords)) updateData.seoKeywords = body.seoKeywords;
        if ('highlights' in body && Array.isArray(body.highlights)) updateData.highlights = body.highlights;

        // Trust badge fields
        if ('shippingBadgeTitle' in body) updateData.shippingBadgeTitle = body.shippingBadgeTitle || null;
        if ('shippingBadgeDesc' in body) updateData.shippingBadgeDesc = body.shippingBadgeDesc || null;
        if ('warrantyBadgeTitle' in body) updateData.warrantyBadgeTitle = body.warrantyBadgeTitle || null;
        if ('warrantyBadgeDesc' in body) updateData.warrantyBadgeDesc = body.warrantyBadgeDesc || null;
        if ('returnBadgeTitle' in body) updateData.returnBadgeTitle = body.returnBadgeTitle || null;
        if ('returnBadgeDesc' in body) updateData.returnBadgeDesc = body.returnBadgeDesc || null;

        const product = await prisma.product.update({
            where: { id },
            data: updateData
            // include: { category: true } removed
        });


        // Emit real-time stock update if stock-related fields changed
        if ('stockQuantity' in body || 'variants' in body || 'inStock' in body) {
            emitStockUpdate({
                productId: product.id,
                newStock: product.stockQuantity,
                inStock: product.inStock,
                variants: product.variants
                    ? product.variants.map((v: any) => ({ id: v.id, stockQuantity: v.stockQuantity }))
                    : undefined,
            });
        }

        invalidateProducts().catch(err => console.error('[Cache Invalidation] Failed to invalidate products cache:', err));
        res.json({ message: 'Product updated', product });
    } catch (error: any) {
        console.error('❌ [PUT /products/:id] Update error:', error?.message || error);
        res.status(500).json({ error: error?.message || 'Failed to update product' });
    }
});

// Delete product (also cleans up Cloudinary images)
router.delete('/products/:id', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Fetch product to get image public_ids before deletion
        const product = await prisma.product.findUnique({ where: { id }, select: { images: true, name: true } });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Delete images from Cloudinary
        const imageCleanups = (product.images || []).map(async (img: any) => {
            if (img.public_id) {
                await deleteFromCloudinary(img.public_id);
            }
        });
        await Promise.allSettled(imageCleanups);

        await prisma.product.delete({ where: { id } });
        invalidateProducts().catch(err => console.error('[Cache Invalidation] Failed to invalidate products cache:', err));
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
            // Category filtering removed - using tags instead
            // where.categorySlug = category;
        }

        // productTypeId removed with categories
        // const productTypeId = req.query.productTypeId as string | undefined;
        // if (productTypeId) {
        //     where.productTypeId = productTypeId;
        // }

        if (status === 'active') where.isActive = true;
        if (status === 'inactive') where.isActive = false;

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                skip,
                take: limitNum,
                include: { inventory: true, sections: true } // category removed
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
// Categories CRUD — REMOVED (using tags for product filtering)
// ============================================================

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

        const [rawPayments, total] = await Promise.all([
            prisma.payment.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { name: true, phone: true } },
                    order: { select: { orderNumber: true, orderStatus: true, orderedAt: true, createdAt: true, products: true, shippingAddress: true } }
                }
            }),
            prisma.payment.count({ where })
        ]);

        const formattedPayments = rawPayments.map(p => {
            const addr = p.order?.shippingAddress as any;
            const addressString = addr ? `${addr.city || ''}, ${addr.state || ''}`.replace(/^, |^,|, $|, $/g, '') || 'N/A' : 'N/A';
            return {
                id: p.paymentId || p.id,
                realId: p.id,
                userId: p.userId,
                username: p.user?.name || 'Unknown',
                contact: p.user?.phone || 'N/A',
                address: addressString,
                orderId: p.order?.orderNumber || p.orderId,
                realOrderId: p.orderId,
                itemsOrdered: p.order?.products?.length ? `${p.order.products.length} items` : 'N/A',
                orderDate: p.order?.orderedAt || p.order?.createdAt || p.createdAt,
                amountDue: p.amountDue,
                amountReceived: p.amountReceived,
                amountReceivedDate: p.receivedDate,
                paymentMethod: p.paymentMethod,
                paymentStatus: p.paymentStatus,
                orderStatus: p.order?.orderStatus || 'N/A'
            };
        });

        res.json({
            payments: formattedPayments,
            pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) }
        });
    } catch (error) {
        console.error('Get payments error:', error);
        res.status(500).json({ error: 'Failed to fetch payments' });
    }
});

router.put('/payments/:id', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { paymentStatus, amountReceived, receivedDate } = req.body;

        const updateData: any = {};
        if (paymentStatus) updateData.paymentStatus = paymentStatus;
        if (amountReceived !== undefined) updateData.amountReceived = Number(amountReceived);
        if (receivedDate) updateData.receivedDate = new Date(receivedDate);

        const payment = await prisma.payment.update({
            where: { id },
            data: updateData,
        });

        res.json({ message: 'Payment updated', payment });
    } catch (error: any) {
        if (error.code === 'P2025') return res.status(404).json({ error: 'Payment not found' });
        console.error('Update payment error:', error);
        res.status(500).json({ error: 'Failed to update payment' });
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
        if (status) where.requestStatus = status;

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
        if (status) updateData.requestStatus = status;
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

router.delete('/requests/:id', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.request.delete({ where: { id } });
        res.json({ message: 'Request deleted successfully' });
    } catch (error: any) {
        if (error.code === 'P2025') return res.status(404).json({ error: 'Request not found' });
        console.error('Delete request error:', error);
        res.status(500).json({ error: 'Failed to delete request' });
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
                    select: { id: true, name: true, images: true } // categorySlug removed
                }
            },
            orderBy: { availableStock: 'asc' }
        });

        const lowStock = allInventory.filter(
            (item) => item.availableStock <= item.reorderLevel
        );

        res.json({ lowStockProducts: lowStock });
    } catch (error) {
        console.error('Get low stock error:', error);
        res.status(500).json({ error: 'Failed to fetch low stock products' });
    }
});

// ============================================================
// Appointments / Service Bookings
// ============================================================
router.get('/appointments', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const { page = '1', limit = '20', status } = req.query;
        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};
        if (status) where.status = status;

        const [appointments, total] = await Promise.all([
            prisma.serviceBooking.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { appointmentDate: 'desc' },
                include: { user: { select: { id: true, name: true, email: true } } }
            }),
            prisma.serviceBooking.count({ where })
        ]);

        res.json({
            appointments,
            pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) }
        });
    } catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({ error: 'Failed to fetch appointments' });
    }
});

router.put('/appointments/:id', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, appointmentDate, appointmentTime, estimatedCost, actualCost, assignedMechanic, notes } = req.body;

        const updateData: any = {};
        if (status) {
            updateData.status = status;
            if (status === 'COMPLETED') updateData.completedAt = new Date();
        }
        if (appointmentDate) updateData.appointmentDate = new Date(appointmentDate);
        if (appointmentTime !== undefined) updateData.appointmentTime = appointmentTime;
        if (estimatedCost !== undefined) updateData.estimatedCost = Number(estimatedCost);
        if (actualCost !== undefined) updateData.actualCost = Number(actualCost);
        if (assignedMechanic !== undefined) updateData.assignedMechanic = assignedMechanic;
        if (notes !== undefined) updateData.notes = notes;

        const appointment = await prisma.serviceBooking.update({
            where: { id },
            data: updateData,
            include: { user: { select: { name: true, email: true } } }
        });

        res.json({ message: 'Appointment updated', appointment });
    } catch (error: any) {
        if (error.code === 'P2025') return res.status(404).json({ error: 'Appointment not found' });
        console.error('Update appointment error:', error);
        res.status(500).json({ error: 'Failed to update appointment' });
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

// Export all users
router.get('/users/export', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                name: true,
                email: true,
                phone: true,
                role: true,
                isActive: true,
                createdAt: true,
                _count: { select: { orders: true } },
            }
        });

        // Add total orders and spending if needed. Currently counting orders.
        // For total spending, we'd need to join orders, but we'll stick to _count.orders for now.
        const csvData = users.map(user => ({
            Name: user.name,
            Email: user.email,
            Phone: user.phone || 'N/A',
            Role: user.role,
            Status: user.isActive ? 'Active' : 'Inactive',
            'Joined Date': user.createdAt.toISOString().split('T')[0],
            'Total Orders': user._count.orders
        }));

        const parser = new Parser();
        const csv = parser.parse(csvData);

        res.header('Content-Type', 'text/csv');
        res.attachment('users_export.csv');
        return res.send(csv);
    } catch (error) {
        console.error('Export users error:', error);
        res.status(500).json({ error: 'Failed to export users' });
    }
});

// Export single user
router.get('/users/:id/export', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                name: true,
                email: true,
                phone: true,
                role: true,
                isActive: true,
                createdAt: true,
                _count: { select: { orders: true } },
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const csvData = [{
            Name: user.name,
            Email: user.email,
            Phone: user.phone || 'N/A',
            Role: user.role,
            Status: user.isActive ? 'Active' : 'Inactive',
            'Joined Date': user.createdAt.toISOString().split('T')[0],
            'Total Orders': user._count.orders
        }];

        const parser = new Parser();
        const csv = parser.parse(csvData);

        res.header('Content-Type', 'text/csv');
        res.attachment(`user_${id}_export.csv`);
        return res.send(csv);
    } catch (error) {
        console.error('Export user error:', error);
        res.status(500).json({ error: 'Failed to export user' });
    }
});

// ============================================================
// Record COD Payment Received
// ============================================================
router.patch('/orders/:id/cod-received', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).userId;

        // 1. Fetch order by either BSON ID or Order Number
        const isObjectId = /^[a-fA-F0-9]{24}$/.test(id);
        const order = await prisma.order.findFirst({
            where: isObjectId ? { id } : { orderNumber: id },
            include: { payment: true }
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (order.paymentMethod !== 'COD') {
            return res.status(400).json({ error: 'Only COD orders can be marked as COD received' });
        }

        // 2. Update order status and history
        const updatedOrder = await prisma.order.update({
            where: { id: order.id },
            data: {
                paymentStatus: 'COD_RECEIVED',
                isPaid: true,
                paidAt: new Date(),
                statusHistory: {
                    push: {
                        status: order.orderStatus,
                        timestamp: new Date(),
                        note: 'COD payment received and verified by admin',
                        updatedBy: userId
                    }
                }
            },
            include: { payment: true }
        });

        // 3. Update or create the payment record
        if (order.payment) {
            await prisma.payment.update({
                where: { id: order.payment.id },
                data: {
                    paymentStatus: 'COD_RECEIVED',
                    amountReceived: order.totalAmount,
                    receivedDate: new Date()
                }
            });
        } else {
            await prisma.payment.create({
                data: {
                    paymentId: `PAY-${order.orderNumber}`,
                    orderId: order.id,
                    userId: order.userId,
                    paymentMethod: 'COD',
                    amountDue: order.totalAmount,
                    amountReceived: order.totalAmount,
                    paymentStatus: 'COD_RECEIVED',
                    receivedDate: new Date(),
                    currency: 'INR'
                }
            });
        }

        res.json({ message: 'COD payment marked as received', order: updatedOrder });
    } catch (error: any) {
        console.error('Record COD received error:', error);
        res.status(500).json({ error: error?.message || 'Failed to update order payment' });
    }
});

// ============================================================
// AI Knowledge Base — CRUD (Admin Only)
// ============================================================

const aiKnowledgeSchema = z.object({
    category: z.enum(['FAQ', 'POLICY', 'CUSTOM', 'STORE_INFO']),
    question: z.string().min(3, 'Question is required').max(500),
    answer: z.string().min(3, 'Answer is required').max(5000),
    tags: z.array(z.string().max(50)).max(20).optional().default([]),
    isActive: z.boolean().optional().default(true),
    priority: z.number().int().min(0).max(100).optional().default(0),
});

// GET /api/admin/ai/knowledge — List all knowledge entries
router.get('/ai/knowledge', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const { category, search } = req.query;

        const where: any = {};
        if (category && ['FAQ', 'POLICY', 'CUSTOM', 'STORE_INFO'].includes(category as string)) {
            where.category = category;
        }
        if (search && typeof search === 'string') {
            where.OR = [
                { question: { contains: search, mode: 'insensitive' } },
                { answer: { contains: search, mode: 'insensitive' } },
                { tags: { hasSome: [search.toLowerCase()] } },
            ];
        }

        const entries = await prisma.aiKnowledgeBase.findMany({
            where,
            orderBy: [{ category: 'asc' }, { priority: 'desc' }, { createdAt: 'desc' }],
        });

        res.json({ entries, total: entries.length });
    } catch (error) {
        console.error('List AI knowledge error:', error);
        res.status(500).json({ error: 'Failed to fetch knowledge entries' });
    }
});

// POST /api/admin/ai/knowledge — Create new entry
router.post('/ai/knowledge', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const parseResult = aiKnowledgeSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: parseResult.error.errors,
            });
        }

        const entry = await prisma.aiKnowledgeBase.create({
            data: parseResult.data,
        });

        invalidateKnowledge().catch(err => console.error('[Cache Invalidation] Failed to invalidate knowledge cache:', err));
        res.status(201).json({ message: 'Knowledge entry created', entry });
    } catch (error) {
        console.error('Create AI knowledge error:', error);
        res.status(500).json({ error: 'Failed to create knowledge entry' });
    }
});

// PUT /api/admin/ai/knowledge/:id — Update entry
router.put('/ai/knowledge/:id', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const parseResult = aiKnowledgeSchema.partial().safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: parseResult.error.errors,
            });
        }

        const entry = await prisma.aiKnowledgeBase.update({
            where: { id },
            data: parseResult.data,
        });

        invalidateKnowledge().catch(err => console.error('[Cache Invalidation] Failed to invalidate knowledge cache:', err));
        res.json({ message: 'Knowledge entry updated', entry });
    } catch (error: any) {
        if (error?.code === 'P2025') {
            return res.status(404).json({ error: 'Entry not found' });
        }
        console.error('Update AI knowledge error:', error);
        res.status(500).json({ error: 'Failed to update knowledge entry' });
    }
});

// DELETE /api/admin/ai/knowledge/:id — Delete entry
router.delete('/ai/knowledge/:id', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.aiKnowledgeBase.delete({ where: { id } });
        invalidateKnowledge().catch(err => console.error('[Cache Invalidation] Failed to invalidate knowledge cache:', err));
        res.json({ message: 'Knowledge entry deleted' });
    } catch (error: any) {
        if (error?.code === 'P2025') {
            return res.status(404).json({ error: 'Entry not found' });
        }
        console.error('Delete AI knowledge error:', error);
        res.status(500).json({ error: 'Failed to delete knowledge entry' });
    }
});

// GET /api/admin/ai/conversations — View recent AI conversations (debugging)
router.get('/ai/conversations', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);

        const [conversations, total] = await Promise.all([
            prisma.aiConversation.findMany({
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.aiConversation.count(),
        ]);

        res.json({
            conversations,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error('List AI conversations error:', error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});

// GET /api/admin/ai/monitoring — AI Diagnostics Observability
router.get('/ai/monitoring', authenticateAdmin, (req: Request, res: Response) => {
    try {
        const stats = aiAnalyticsService.getDashboardReport();
        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('Get AI monitoring error:', error);
        res.status(500).json({ error: 'Failed to fetch AI monitoring stats' });
    }
});

export default router;
