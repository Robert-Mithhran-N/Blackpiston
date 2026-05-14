import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';

const router = Router();

// Middleware to verify user token (optional or required depending on your needs)
// But since userId is required in schema, we'll make it required.
const authenticateUser = (req: Request, res: Response, next: Function) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as { userId: string };
        
        (req as any).user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

// Create a new request (Public/Customer endpoint)
router.post('/', authenticateUser, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { userName, userEmail, userPhone, requestType, productName, message } = req.body;

        // Generate a random request number
        const requestNumber = `REQ-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

        const newRequest = await prisma.request.create({
            data: {
                requestNumber,
                userId,
                userName,
                userEmail,
                userPhone,
                requestType: requestType || 'PRODUCT_INQUIRY',
                productName,
                message
            }
        });

        res.status(201).json({ message: 'Request submitted successfully', request: newRequest });
    } catch (error) {
        console.error('Submit request error:', error);
        res.status(500).json({ error: 'Failed to submit request' });
    }
});

export default router;
