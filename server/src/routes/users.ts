import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'bson';
import { z } from 'zod';
import prisma from '../config/database.js';
import { JWT_VERIFY_OPTIONS } from '../middlewares/security.js';

const router = Router();

// Middleware to verify user token
const authenticateUser = (req: Request, res: Response, next: Function) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string, JWT_VERIFY_OPTIONS) as { userId: string; role: string };
        
        // Attach user info to request
        (req as any).user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

// Apply middleware to all routes in this file
router.use(authenticateUser);

// ---------------------------------------------------------
// Profile Details
// ---------------------------------------------------------

// Zod validation schemas
const updateProfileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
    phone: z.string().max(20).optional(),
});

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

const addressSchema = z.object({
    label: z.string().optional().default('Home'),
    fullName: z.string().min(1, 'Full name is required'),
    phone: z.string().min(1, 'Phone is required'),
    addressLine1: z.string().min(1, 'Address line 1 is required'),
    addressLine2: z.string().optional().default(''),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    pincode: z.string().min(1, 'Pincode is required'),
    country: z.string().optional().default('India'),
    landmark: z.string().optional().default(''),
    isDefault: z.boolean().optional().default(false),
});

// Update basic user profile info (name, phone)
router.put('/update', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const validation = updateProfileSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: validation.error.format()
            });
        }
        const { name, phone } = validation.data;
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { 
                name: name !== undefined ? name : undefined,
                phone: phone !== undefined ? phone : undefined
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatar: true,
                role: true,
            }
        });

        res.json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Update password
router.put('/password', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const validation = changePasswordSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: validation.error.format()
            });
        }
        const { currentPassword, newPassword } = validation.data;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!user.passwordHash) {
            return res.status(400).json({ error: 'Social login users cannot change password this way' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ error: 'Incorrect current password' });
        }

        const passwordHash = await bcrypt.hash(newPassword, 12);

        await prisma.user.update({
            where: { id: userId },
            data: { passwordHash }
        });

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({ error: 'Failed to update password' });
    }
});

// ---------------------------------------------------------
// Address Management (Saved Addresses)
// ---------------------------------------------------------

// Add new saved address
router.post('/addresses', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const validation = addressSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: validation.error.format()
            });
        }
        const addressData = validation.data;

        // Must explicitly generate a unique BSON object ID for the nested type, or rely on Prisma handling
        // Prisma allows atomic array pushes.
        
        // Ensure id is provided for embedded types if required by Prisma definition
        const newAddress = {
            id: new ObjectId().toString(),
            label: addressData.label || 'Home',
            fullName: addressData.fullName || '',
            phone: addressData.phone || '',
            addressLine1: addressData.addressLine1 || '',
            addressLine2: addressData.addressLine2 || '',
            city: addressData.city || '',
            state: addressData.state || '',
            pincode: addressData.pincode || '',
            country: addressData.country || 'India',
            landmark: addressData.landmark || '',
            isDefault: addressData.isDefault || false
        };

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                savedAddresses: {
                    push: newAddress
                }
            },
            select: { savedAddresses: true }
        });

        res.status(201).json({ message: 'Address added', addresses: user.savedAddresses });
    } catch (error) {
        console.error('Add address error:', error);
        res.status(500).json({ error: 'Failed to add address' });
    }
});

// Update saved address
router.put('/addresses/:id', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const addressId = req.params.id;
        const addressData = req.body;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { savedAddresses: true }
        });

        if (!user) return res.status(404).json({ error: 'User not found' });

        const updatedAddresses = user.savedAddresses.map(addr => 
            addr.id === addressId ? { ...addr, ...addressData } : addr
        );

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { savedAddresses: { set: updatedAddresses } },
            select: { savedAddresses: true }
        });

        res.json({ message: 'Address updated', addresses: updatedUser.savedAddresses });
    } catch (error) {
        console.error('Update address error:', error);
        res.status(500).json({ error: 'Failed to update address' });
    }
});

// Delete saved address
router.delete('/addresses/:id', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const addressId = req.params.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { savedAddresses: true }
        });

        if (!user) return res.status(404).json({ error: 'User not found' });

        const updatedAddresses = user.savedAddresses.filter(addr => addr.id !== addressId);

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { savedAddresses: { set: updatedAddresses } },
            select: { savedAddresses: true }
        });

        res.json({ message: 'Address deleted', addresses: updatedUser.savedAddresses });
    } catch (error) {
        console.error('Delete address error:', error);
        res.status(500).json({ error: 'Failed to delete address' });
    }
});

export default router;
