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
                    },
                    productType: {
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

// Get single product by ID or slug
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

// Get all categories (optionally filtered by productTypeId)
router.get('/categories/all', async (req: Request, res: Response) => {
    try {
        const { productTypeId } = req.query;
        const where: any = { isActive: true };
        if (productTypeId) {
            where.productTypeId = productTypeId as string;
        }

        const categories = await prisma.productCategory.findMany({
            where,
            orderBy: { sortOrder: 'asc' },
            include: {
                productType: { select: { id: true, name: true, slug: true } }
            }
        });

        res.json({ categories });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// Get products by category
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

export default router;
