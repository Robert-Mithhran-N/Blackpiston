// ============================================================
// AI Rate Limiter — Dynamic, Role-Based Protection with Burst Control
// ============================================================

import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { JWT_VERIFY_OPTIONS } from '../../middlewares/security.js';

const rateLimitResponse = (message: string) => {
    return (req: Request, res: Response) => {
        console.warn(`[AI Rate Limit] Limit exceeded for IP: ${req.ip}. URL: ${req.originalUrl}`);
        res.status(429).json({
            success: false,
            message,
            errorCode: 'RATE_LIMIT_EXCEEDED',
        });
    };
};

// ── Burst Protection (Max 2 requests per 3 seconds) ──
const burstLimiter = rateLimit({
    windowMs: 3 * 1000,
    max: 2,
    standardHeaders: false,
    legacyHeaders: false,
    handler: rateLimitResponse('Please wait a moment before sending another message. 🏍️'),
});

// ── Guest Limiter (10 req/min) ──
const guestLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitResponse('Too many messages. Guest users are limited to 10 requests per minute. Register or log in to get a higher limit! 🔐'),
});

// ── User Limiter (30 req/min) ──
const userLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitResponse('Too many messages. Logged-in users are limited to 30 requests per minute. Please wait a moment. 🏍️'),
});

// ── Admin Limiter (100 req/min) ──
const adminLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitResponse('Admin AI rate limit exceeded (100 requests per minute). ⚙️'),
});

/**
 * Dynamic AI rate limiter middleware. Resolves user roles and applies corresponding limiters.
 */
export function aiDynamicRateLimiter(req: Request, res: Response, next: NextFunction) {
    // 1. Run Burst Limiter First
    burstLimiter(req, res, (err) => {
        if (err) return next(err);

        // 2. Identify Role from optional JWT token
        let role = 'GUEST';
        const authHeader = req.headers.authorization;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const token = authHeader.split(' ')[1];
                const secret = process.env.JWT_SECRET as string;
                const decoded = jwt.verify(token, secret, JWT_VERIFY_OPTIONS) as {
                    userId: string;
                    role: string;
                };
                role = decoded.role || 'USER';
            } catch {
                // Invalid token -> falls back to GUEST limits
            }
        }

        // 3. Delegate to appropriate role-based limiter
        if (role === 'ADMIN' || role === 'STAFF') {
            return adminLimiter(req, res, next);
        } else if (role === 'USER') {
            return userLimiter(req, res, next);
        } else {
            return guestLimiter(req, res, next);
        }
    });
}
