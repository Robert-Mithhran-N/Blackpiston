import { Router, Request, Response } from 'express';
import prisma from '../config/database.js';

const router = Router();

// ============================================================
// Helper: Normalize tag string
// ============================================================
function normalizeTag(raw: string): string {
    return raw.replace(/^#/, '').trim().toLowerCase().replace(/\s+/g, '-');
}

// ============================================================
// GET /products/filters — Returns all available filter values
// (brands, colors, sizes, price range) from active products
// ============================================================
router.get('/filters', async (req: Request, res: Response) => {
    try {
        const products = await prisma.product.findMany({
            where: { isActive: true },
            select: {
                brand: true,
                price: true,
                offerPrice: true,
                variants: true,
                tagStrings: true,
            },
        });

        // Collect unique brands
        const brandSet = new Set<string>();
        // Collect unique colors & sizes from variants
        const colorSet = new Set<string>();
        const sizeSet = new Set<string>();
        // Collect all tags for category inference
        const tagCountMap = new Map<string, number>();
        // Track price range
        let minPrice = Infinity;
        let maxPrice = 0;

        for (const p of products) {
            if (p.brand) brandSet.add(p.brand);

            const effectivePrice = p.offerPrice || p.price;
            if (effectivePrice < minPrice) minPrice = effectivePrice;
            if (p.price > maxPrice) maxPrice = p.price;

            for (const v of p.variants) {
                if (v.color) colorSet.add(v.color.trim());
                if (v.size) sizeSet.add(v.size.trim().toUpperCase());
            }

            for (const tag of p.tagStrings) {
                tagCountMap.set(tag, (tagCountMap.get(tag) || 0) + 1);
            }
        }

        // Sort tags by frequency for category chips
        const topTags = Array.from(tagCountMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 30)
            .map(([tag, count]) => ({ tag, count }));

        res.json({
            brands: Array.from(brandSet).sort(),
            colors: Array.from(colorSet).sort(),
            sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'].filter(s => sizeSet.has(s)),
            priceRange: {
                min: minPrice === Infinity ? 0 : Math.floor(minPrice),
                max: Math.ceil(maxPrice),
            },
            tags: topTags,
        });
    } catch (error) {
        console.error('Get filters error:', error);
        res.status(500).json({ error: 'Failed to fetch filters' });
    }
});

// ============================================================
// GET /products — Full-featured filtering, sorting, pagination
// ============================================================
router.get('/', async (req: Request, res: Response) => {
    try {
        const {
            page = '1',
            limit = '12',
            search,
            brand,
            minPrice,
            maxPrice,
            color,
            size,
            discount,
            inStock,
            featured,
            tags,
            sort = 'newest',
        } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        // Build where clause
        const where: any = { isActive: true };
        const andConditions: any[] = [];

        // Search — name, description, brand, tags
        if (search) {
            const q = (search as string).trim();
            if (q) {
                const normalizedQ = normalizeTag(q);
                andConditions.push({
                    OR: [
                        { name: { contains: q, mode: 'insensitive' } },
                        { sections: { some: { content: { contains: q, mode: 'insensitive' } } } },
                        { brand: { contains: q, mode: 'insensitive' } },
                        { tagStrings: { hasSome: [normalizedQ] } },
                    ],
                });
            }
        }

        // Tag filtering (multi-select, comma-separated)
        if (tags) {
            const tagList = (tags as string).split(',').map(t => normalizeTag(t)).filter(Boolean);
            if (tagList.length > 0) {
                andConditions.push({ tagStrings: { hasSome: tagList } });
            }
        }

        // Brand multi-select (comma-separated)
        if (brand) {
            const brands = (brand as string).split(',').map(b => b.trim()).filter(Boolean);
            if (brands.length === 1) {
                where.brand = brands[0];
            } else if (brands.length > 1) {
                andConditions.push({ brand: { in: brands } });
            }
        }

        // Price range
        if (minPrice || maxPrice) {
            const priceFilter: any = {};
            if (minPrice) priceFilter.gte = parseFloat(minPrice as string);
            if (maxPrice) priceFilter.lte = parseFloat(maxPrice as string);
            where.price = priceFilter;
        }

        // In stock filter
        if (inStock === 'true') {
            where.inStock = true;
            where.stockQuantity = { gt: 0 };
        }

        // Featured filter
        if (featured === 'true') {
            where.isFeatured = true;
        }

        // Apply compound conditions
        if (andConditions.length > 0) {
            where.AND = andConditions;
        }

        // Build sort order
        let orderBy: any;
        switch (sort) {
            case 'price_asc':
                orderBy = { price: 'asc' };
                break;
            case 'price_desc':
                orderBy = { price: 'desc' };
                break;
            case 'rating':
                orderBy = { rating: 'desc' };
                break;
            case 'name_asc':
                orderBy = { name: 'asc' };
                break;
            case 'name_desc':
                orderBy = { name: 'desc' };
                break;
            case 'newest':
            default:
                orderBy = { createdAt: 'desc' };
                break;
        }

        // Fetch ALL matching products first if we need to post-filter, 
        // otherwise fetch paginated to save memory.
        const hasPostFilters = color || size || discount;
        
        let products;
        let total = 0;
        
        if (hasPostFilters) {
            // Fetch all matching products
            products = await prisma.product.findMany({
                where,
                orderBy,
            });
        } else {
            // Fetch only the paginated slice
            const [paged, count] = await Promise.all([
                prisma.product.findMany({
                    where,
                    orderBy,
                    skip,
                    take: limitNum,
                }),
                prisma.product.count({ where }),
            ]);
            products = paged;
            total = count;
        }

        let filtered = products;

        // Post-filter for variant-level filters (color, size) and discount
        if (hasPostFilters) {
            // Color filter (matches variant colors)
            if (color) {
                const colors = (color as string).split(',').map(c => c.trim().toLowerCase());
                filtered = filtered.filter(p =>
                    p.variants.some(v => v.color && colors.includes(v.color.toLowerCase()))
                );
            }

            // Size filter (matches variant sizes)
            if (size) {
                const sizes = (size as string).split(',').map(s => s.trim().toUpperCase());
                filtered = filtered.filter(p =>
                    p.variants.some(v => v.size && sizes.includes(v.size.toUpperCase()))
                );
            }

            // Discount filter (minimum discount %)
            if (discount) {
                const minDiscount = parseInt(discount as string);
                if (!isNaN(minDiscount) && minDiscount > 0) {
                    filtered = filtered.filter(p => {
                        if (!p.offerPrice || p.offerPrice >= p.price) return false;
                        const pct = Math.round(((p.price - p.offerPrice) / p.price) * 100);
                        return pct >= minDiscount;
                    });
                }
            }
            
            // Set adjusted total and slice the paginated result
            total = filtered.length;
            filtered = filtered.slice(skip, skip + limitNum);
        }

        res.json({
            products: filtered,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// ============================================================
// GET /products/categories/all — Flat category list
// ============================================================
router.get('/categories/all', async (req: Request, res: Response) => {
    try {
        // Categories model was removed — return tags-based categories instead
        const products = await prisma.product.findMany({
            where: { isActive: true },
            select: { tagStrings: true },
            take: 500,
        });

        const tagCounts = new Map<string, number>();
        for (const p of products) {
            for (const tag of p.tagStrings) {
                tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
            }
        }

        const categories = Array.from(tagCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20)
            .map(([tag, count]) => ({
                id: tag,
                name: tag.charAt(0).toUpperCase() + tag.slice(1).replace(/-/g, ' '),
                slug: tag,
                productCount: count,
            }));

        res.json({ categories });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// ============================================================
// GET /products/categories/tree — Category tree (tags-based)
// ============================================================
router.get('/categories/tree', async (_req: Request, res: Response) => {
    try {
        res.json({ tree: [] });
    } catch (error) {
        console.error('Get categories tree error:', error);
        res.status(500).json({ error: 'Failed to fetch category tree' });
    }
});

// ============================================================
// GET /products/categories/:parentId/children
// ============================================================
router.get('/categories/:parentId/children', async (_req: Request, res: Response) => {
    try {
        res.json({ categories: [] });
    } catch (error) {
        console.error('Get category children error:', error);
        res.status(500).json({ error: 'Failed to fetch sub-categories' });
    }
});

// ============================================================
// GET /products/category/:slug — Products by tag slug
// ============================================================
router.get('/category/:slug', async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const { page = '1', limit = '12' } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const normalizedSlug = normalizeTag(slug);

        const where: any = {
            tagStrings: { hasSome: [normalizedSlug] },
            isActive: true,
        };

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.product.count({ where }),
        ]);

        res.json({
            products,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        console.error('Get products by category error:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// ============================================================
// GET /products/featured/list — Featured products
// ============================================================
router.get('/featured/list', async (_req: Request, res: Response) => {
    try {
        const products = await prisma.product.findMany({
            where: {
                isFeatured: true,
                isActive: true,
            },
            take: 8,
            orderBy: { createdAt: 'desc' },
        });

        res.json({ products });
    } catch (error) {
        console.error('Get featured products error:', error);
        res.status(500).json({ error: 'Failed to fetch featured products' });
    }
});

// ============================================================
// GET /products/offers/top — Dynamic top offers (highest discounts)
// ============================================================
router.get('/offers/top', async (req: Request, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 8;

        const products = await prisma.product.findMany({
            where: {
                isActive: true,
                inStock: true,
                offerPrice: { not: null, gt: 0 },
            },
        });

        const productsWithDiscount = products
            .map(product => {
                const discountPercent = product.offerPrice
                    ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
                    : 0;

                return {
                    ...product,
                    discountPercent,
                };
            })
            .filter(p => p.discountPercent > 0)
            .sort((a, b) => b.discountPercent - a.discountPercent)
            .slice(0, limit);

        res.json({ products: productsWithDiscount });
    } catch (error) {
        console.error('Get top offers error:', error);
        res.status(500).json({ error: 'Failed to fetch top offers' });
    }
});

// ============================================================
// Search — unified tag + text search
// ============================================================
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
                    { sections: { some: { content: { contains: query, mode: 'insensitive' as const } } } },
                    { brand: { contains: query, mode: 'insensitive' as const } },
                    { tagStrings: { hasSome: [normalizeTag(query)] } },
                ];

                if (where.tagStrings) {
                    where.AND = [
                        { tagStrings: where.tagStrings },
                        { OR: textConditions },
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
            }),
            prisma.product.count({ where }),
        ]);

        res.json({
            products,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
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

// ============================================================
// GET /products/:idOrSlug — Single product by ID or slug
// IMPORTANT: This catch-all route MUST be defined LAST
// ============================================================
router.get('/:idOrSlug', async (req: Request, res: Response) => {
    try {
        const { idOrSlug } = req.params;

        let product: any = null;

        // Check if it looks like an ObjectId
        if (/^[0-9a-fA-F]{24}$/.test(idOrSlug)) {
            product = await prisma.product.findUnique({
                where: { id: idOrSlug },
                include: {
                    sections: true,
                    reviews: {
                        where: { isApproved: true },
                        take: 10,
                        orderBy: { createdAt: 'desc' },
                    },
                },
            });
        }

        // If not found by ID, try slug
        if (!product) {
            product = await prisma.product.findUnique({
                where: { slug: idOrSlug },
                include: {
                    sections: true,
                    reviews: {
                        where: { isApproved: true },
                        take: 10,
                        orderBy: { createdAt: 'desc' },
                    },
                },
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
