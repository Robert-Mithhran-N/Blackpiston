import { Router, Request, Response } from 'express';
import prisma from '../config/database.js';

const router = Router();

// Get all products with filtering and pagination
router.get('/', async (req: Request, res: Response) => {
    try {
        const {
            page = '1',
            limit = '12',
            category,
            brand,
            minPrice,
            maxPrice,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            featured
        } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        // Build where clause
        const where: any = {
            isActive: true
        };

        if (category) {
            where.categorySlug = category;
        }

        if (brand) {
            where.brand = brand;
        }

        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = parseFloat(minPrice as string);
            if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
        }

        if (search) {
            const normalizedSearch = (search as string).replace(/^#/, '').trim().toLowerCase();
            where.OR = [
                { name: { contains: search as string, mode: 'insensitive' } },
                { description: { contains: search as string, mode: 'insensitive' } },
                { tagStrings: { hasSome: [normalizedSearch] } }
            ];
        }

        if (featured === 'true') {
            where.isFeatured = true;
        }

        // Build order by
        const orderBy: any = {};
        orderBy[sortBy as string] = sortOrder;

        // Get products
        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                orderBy,
                skip,
                take: limitNum,
                include: {
                    category: {
                        select: {
                            id: true,
                            name: true,
                            slug: true
                        }
                    }
                }
            }),
            prisma.product.count({ where })
        ]);

        res.json({
            products,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Get all categories
// IMPORTANT: This must come BEFORE the /:idOrSlug catch-all route
router.get('/categories/all', async (req: Request, res: Response) => {
    try {
        const where: any = { isActive: true };

        const categories = await prisma.productCategory.findMany({
            where,
            orderBy: { sortOrder: 'asc' },
        });

        res.json({ categories });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// Get products by category
// IMPORTANT: This must come BEFORE the /:idOrSlug catch-all route
router.get('/category/:slug', async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const { page = '1', limit = '12' } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where: {
                    categorySlug: slug,
                    isActive: true
                },
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.product.count({
                where: {
                    categorySlug: slug,
                    isActive: true
                }
            })
        ]);

        res.json({
            products,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Get products by category error:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Get featured products
// IMPORTANT: This must come BEFORE the /:idOrSlug catch-all route
router.get('/featured/list', async (req: Request, res: Response) => {
    try {
        const products = await prisma.product.findMany({
            where: {
                isFeatured: true,
                isActive: true
            },
            take: 8,
            orderBy: { createdAt: 'desc' }
        });

        res.json({ products });
    } catch (error) {
        console.error('Get featured products error:', error);
        res.status(500).json({ error: 'Failed to fetch featured products' });
    }
});

// Get top offers
// IMPORTANT: This must come BEFORE the /:idOrSlug catch-all route
router.get('/offers/top', async (req: Request, res: Response) => {
    try {
        const offers = await prisma.topOffer.findMany({
            where: {
                isActive: true,
                OR: [
                    { validUntil: null },
                    { validUntil: { gte: new Date() } }
                ]
            },
            include: {
                product: true
            },
            orderBy: { priority: 'asc' },
            take: 10
        });

        res.json({ offers });
    } catch (error) {
        console.error('Get top offers error:', error);
        res.status(500).json({ error: 'Failed to fetch offers' });
    }
});

// ============================================================
// Search — unified tag + text search
// ============================================================
function normalizeTag(raw: string): string {
    return raw.replace(/^#/, '').trim().toLowerCase().replace(/\s+/g, '-');
}

router.get('/search', async (req: Request, res: Response) => {
    try {
        const { q, tags, page = '1', limit = '20' } = req.query;
        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const where: any = { isActive: true };
        const orderBy: any = { createdAt: 'desc' };

        // Tag search
        if (tags) {
            const tagList = (tags as string)
                .split(',')
                .map(t => normalizeTag(t))
                .filter(Boolean);
            if (tagList.length > 0) {
                where.tagStrings = { hasSome: tagList };
            }
        }

        // Text search
        if (q) {
            const query = (q as string).replace(/^#/, '').trim();
            if (query) {
                const textConditions = [
                    { name: { contains: query, mode: 'insensitive' as const } },
                    { description: { contains: query, mode: 'insensitive' as const } },
                    { brand: { contains: query, mode: 'insensitive' as const } },
                    { tagStrings: { hasSome: [normalizeTag(query)] } },
                ];

                if (where.tagStrings) {
                    where.AND = [
                        { tagStrings: where.tagStrings },
                        { OR: textConditions }
                    ];
                    delete where.tagStrings;
                } else {
                    where.OR = textConditions;
                }
            }
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                skip,
                take: limitNum,
                orderBy,
                include: {
                    category: { select: { id: true, name: true, slug: true } },
                }
            }),
            prisma.product.count({ where })
        ]);

        res.json({
            products,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

// ============================================================
// Tag Suggestions
// ============================================================
router.get('/tags/suggestions', async (req: Request, res: Response) => {
    try {
        const { prefix } = req.query;
        const normalized = normalizeTag((prefix as string) || '');

        if (!normalized) {
            return res.json({ tags: [] });
        }

        const allProducts = await prisma.product.findMany({
            where: { isActive: true },
            select: { tagStrings: true },
            take: 500,
        });

        const tagCounts = new Map<string, number>();
        for (const p of allProducts) {
            for (const tag of p.tagStrings) {
                if (tag.startsWith(normalized)) {
                    tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
                }
            }
        }

        const suggestions = Array.from(tagCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15)
            .map(([tag, count]) => ({ tag, count }));

        res.json({ tags: suggestions });
    } catch (error) {
        console.error('Tag suggestions error:', error);
        res.status(500).json({ error: 'Failed to fetch tag suggestions' });
    }
});

// Get single product by ID or slug
// IMPORTANT: This catch-all route MUST be defined LAST among the product routes
router.get('/:idOrSlug', async (req: Request, res: Response) => {
    try {
        const { idOrSlug } = req.params;

        // Try to find by ID first, then by slug
        let product = null;

        // Check if it looks like an ObjectId
        if (/^[0-9a-fA-F]{24}$/.test(idOrSlug)) {
            product = await prisma.product.findUnique({
                where: { id: idOrSlug },
                include: {
                    category: true,
                    reviews: {
                        where: { isApproved: true },
                        take: 10,
                        orderBy: { createdAt: 'desc' }
                    }
                }
            });
        }

        // If not found by ID, try slug
        if (!product) {
            product = await prisma.product.findUnique({
                where: { slug: idOrSlug },
                include: {
                    category: true,
                    reviews: {
                        where: { isApproved: true },
                        take: 10,
                        orderBy: { createdAt: 'desc' }
                    }
                }
            });
        }

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({ product });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

export default router;
