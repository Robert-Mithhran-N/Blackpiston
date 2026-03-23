import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'bson';
import prisma from '../config/database.js';

const router = Router();

// Middleware to verify user token
const authenticateUser = (req: Request, res: Response, next: Function) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as { userId: string; role: string };
        
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

// Update basic user profile info (name, phone)
router.put('/update', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { name, phone } = req.body;

        // Note: we generally do not allow email updates here easily because it relies on Auth checks
        // However, for standard name/phone updates it's fine.
        
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
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current and new passwords are required' });
        }

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
        const addressData = req.body; // e.g., { label, street, city, state, pincode, country, isDefault }

        // Must explicitly generate a unique BSON object ID for the nested type, or rely on Prisma handling
        // Prisma allows atomic array pushes.
        
        // Ensure id is provided for embedded types if required by Prisma definition
        const newAddress = {
            id: new ObjectId().toString(),
            label: addressData.label || 'Home',
            street: addressData.street || '',
            city: addressData.city || '',
            state: addressData.state || '',
            pincode: addressData.pincode || '',
            country: addressData.country || 'India',
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
