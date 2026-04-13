// This section replaces lines ~97-220 in products.ts
// Remove all category routes and replace with this comment:

// ============================================================
// Categories removed - using tags for product filtering
// ============================================================

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
