import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';

const router = Router();

// ============================================================
// Auth Middleware (same as admin.ts)
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
// Helper: normalize a tag string
// ============================================================
function normalizeTag(raw: string): string {
    return raw.replace(/^#/, '').trim().toLowerCase().replace(/\s+/g, '-');
}

// ============================================================
// Product Types CRUD
// ============================================================

// List all product types
router.get('/', async (_req: Request, res: Response) => {
    try {
        const productTypes = await prisma.productType.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: { select: { categories: true, products: true } }
            }
        });
        res.json({ productTypes });
    } catch (error) {
        console.error('Get product types error:', error);
        res.status(500).json({ error: 'Failed to fetch product types' });
    }
});

// Create product type
router.post('/', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const { name, description } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Name is required' });
        }
        const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

        // Check unique slug
        const existing = await prisma.productType.findUnique({ where: { slug } });
        if (existing) {
            return res.status(409).json({ error: 'A product type with this slug already exists' });
        }

        const productType = await prisma.productType.create({
            data: { name: name.trim(), slug, description: description?.trim() || null }
        });
        res.status(201).json({ message: 'Product type created', productType });
    } catch (error) {
        console.error('Create product type error:', error);
        res.status(500).json({ error: 'Failed to create product type' });
    }
});

// Update product type
router.put('/:id', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const data: any = {};

        if (name !== undefined) {
            data.name = name.trim();
            data.slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        }
        if (description !== undefined) {
            data.description = description?.trim() || null;
        }

        const productType = await prisma.productType.update({
            where: { id },
            data,
        });
        res.json({ message: 'Product type updated', productType });
    } catch (error) {
        console.error('Update product type error:', error);
        res.status(500).json({ error: 'Failed to update product type' });
    }
});

// Delete product type (with dependency check)
router.delete('/:id', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Check for dependent categories
        const categoryCount = await prisma.productCategory.count({ where: { productTypeId: id } });
        if (categoryCount > 0) {
            return res.status(409).json({
                error: `Cannot delete: ${categoryCount} categor${categoryCount === 1 ? 'y' : 'ies'} still linked to this product type. Reassign them first.`
            });
        }

        // Check for dependent products
        const productCount = await prisma.product.count({ where: { productTypeId: id } });
        if (productCount > 0) {
            return res.status(409).json({
                error: `Cannot delete: ${productCount} product${productCount === 1 ? '' : 's'} still linked to this product type. Reassign them first.`
            });
        }

        await prisma.productType.delete({ where: { id } });
        res.json({ message: 'Product type deleted' });
    } catch (error) {
        console.error('Delete product type error:', error);
        res.status(500).json({ error: 'Failed to delete product type' });
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
                    { description: { contains: query, mode: 'insensitive' as const } },
                    { brand: { contains: query, mode: 'insensitive' as const } },
                    { tagStrings: { hasSome: [normalizeTag(query)] } },
                ];

                if (where.tagStrings) {
                    // If we already have a tag filter, combine with OR for text
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
                    productType: { select: { id: true, name: true, slug: true } },
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

        // Fetch all products' tagStrings arrays, then extract unique matches
        const products = await prisma.product.findMany({
            where: { tagStrings: { hasSome: [normalized] } },
            select: { tagStrings: true },
            take: 100,
        });

        // Also do a broader prefix search by fetching products and filtering
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

export default router;
