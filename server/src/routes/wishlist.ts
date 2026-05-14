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

// ============================================================
// User Wishlist Routes
// ============================================================

// 1. Get User's Wishlist
router.get('/', authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;

        let wishlist = await prisma.wishlist.findUnique({
            where: { userId }
        });

        if (!wishlist) {
            wishlist = await prisma.wishlist.create({
                data: { userId, items: [] }
            });
        }

        // Fetch detailed product data for each wishlist item
        const productIds = wishlist.items.map(item => item.productId);
        
        const products = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                offerPrice: true,
                images: true,
                inStock: true,
            }
        });

        // Merge product data with wishlist items
        const detailedItems = wishlist.items.map(item => ({
            ...item,
            product: products.find(p => p.id === item.productId) || null
        })).filter(item => item.product !== null);

        res.json({ 
            wishlist: { ...wishlist, items: detailedItems } 
        });
    } catch (error) {
        console.error('Get wishlist error:', error);
        res.status(500).json({ error: 'Failed to fetch wishlist' });
    }
});

// 2. Add Item to Wishlist
router.post('/add', authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ error: 'Product ID is required' });
        }

        let wishlist = await prisma.wishlist.findUnique({
            where: { userId }
        });

        if (!wishlist) {
            wishlist = await prisma.wishlist.create({
                data: { userId, items: [] }
            });
        }

        // Check if item already exists
        const exists = wishlist.items.some(item => item.productId === productId);

        if (exists) {
            return res.status(400).json({ error: 'Product is already in your wishlist' });
        }

        // Push new embedded item
        const updatedWishlist = await prisma.wishlist.update({
            where: { id: wishlist.id },
            data: {
                items: {
                    push: { productId, addedAt: new Date() }
                }
            }
        });

        res.status(201).json({ 
            message: 'Added to wishlist', 
            item: updatedWishlist.items[updatedWishlist.items.length - 1]
        });
    } catch (error) {
        console.error('Add to wishlist error:', error);
        res.status(500).json({ error: 'Failed to add item to wishlist' });
    }
});

// 3. Remove Item from Wishlist
router.delete('/:productId', authenticateToken, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { productId } = req.params;

        const wishlist = await prisma.wishlist.findUnique({
            where: { userId }
        });

        if (!wishlist) {
            return res.status(404).json({ error: 'Wishlist not found' });
        }

        const itemExists = wishlist.items.some(item => item.productId === productId);
        if (!itemExists) {
            return res.status(404).json({ error: 'Item not found in wishlist' });
        }

        // Filter out the embedded item and set array
        const updatedItems = wishlist.items.filter(item => item.productId !== productId);

        await prisma.wishlist.update({
            where: { id: wishlist.id },
            data: {
                items: updatedItems
            }
        });

        res.json({ message: 'Removed from wishlist' });
    } catch (error) {
        console.error('Remove from wishlist error:', error);
        res.status(500).json({ error: 'Failed to remove item from wishlist' });
    }
});

export default router;
