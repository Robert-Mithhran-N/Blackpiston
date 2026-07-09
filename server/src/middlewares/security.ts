// ============================================================
// Security Middleware — Helmet, Rate Limiting, CORS
// ============================================================

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { Request, Response, NextFunction } from 'express';
import { SignOptions, VerifyOptions } from 'jsonwebtoken';

// ============================================================
// Helmet — HTTP Security Headers
// ============================================================

export const helmetMiddleware = helmet({
    // Disable CSP to avoid breaking Cloudinary images, Google OAuth, inline styles (shadcn/ui)
    contentSecurityPolicy: false,

    // Prevent clickjacking — deny all framing
    frameguard: { action: 'deny' },

    // Prevent MIME-type sniffing
    noSniff: undefined, // enabled by default

    // Strict-Transport-Security for HTTPS
    hsts: {
        maxAge: 31536000,       // 1 year
        includeSubDomains: true,
        preload: true,
    },

    // Referrer Policy — only send origin on cross-origin requests
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },

    // Hide X-Powered-By header
    hidePoweredBy: undefined, // enabled by default

    // Cross-Origin-Embedder-Policy — use unsafe-none to allow Cloudinary/Google embeds
    crossOriginEmbedderPolicy: false,

    // Cross-Origin-Opener-Policy — same-origin-allow-popups for Google OAuth
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },

    // Cross-Origin-Resource-Policy — cross-origin to allow Cloudinary image loading
    crossOriginResourcePolicy: { policy: 'cross-origin' },
});


// ============================================================
// CORS — Strict Whitelist
// ============================================================

function buildAllowedOrigins(): string[] {
    const origins: string[] = [];

    // Add configured frontend URLs
    if (process.env.FRONTEND_URL) {
        const urls = process.env.FRONTEND_URL.split(',').map(u => u.trim()).filter(Boolean);
        origins.push(...urls);
    }

    // Always allow common local dev origins
    origins.push(
        'http://localhost:5000',
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:8080',
        'http://127.0.0.1:5000',
        'http://127.0.0.1:5173',
    );

    return [...new Set(origins)]; // deduplicate
}

export const allowedOrigins = buildAllowedOrigins();

export const corsMiddleware = cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Allow requests with no origin (mobile apps, Postman, cURL, server-to-server)
        if (!origin) return callback(null, true);

        // Check whitelist
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        // Allow any localhost/127.0.0.1 port in development
        const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
        if (isLocalhost) {
            return callback(null, true);
        }

        // Allow local network IPs (for mobile testing on same wifi)
        const isLocalNetwork = /^https?:\/\/192\.168\.\d+\.\d+(:\d+)?$/.test(origin);
        if (isLocalNetwork) {
            return callback(null, true);
        }

        // Allow any *.vercel.app subdomain (preview deployments)
        if (origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }

        // Reject everything else
        console.warn(`🚫 CORS blocked origin: ${origin}`);
        callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Disposition'], // for CSV/PDF downloads
    maxAge: 86400, // preflight cache for 24 hours
});


// ============================================================
// Rate Limiters — Per-route protection
// ============================================================

const rateLimitResponse = (req: Request, res: Response) => {
    res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        errorCode: 'RATE_LIMIT_EXCEEDED',
    });
};

/** Authentication routes: 5 requests per minute */
export const authLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitResponse,
    message: 'Too many authentication attempts. Please try again later.',
    keyGenerator: (req: Request) => {
        // Rate limit by IP + email to prevent distributed attacks on single account
        const email = req.body?.email || '';
        return `${req.ip}-${email}`;
    },
});

/** Upload routes: 20 requests per minute */
export const uploadLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitResponse,
});

/** Search/product browsing: 100 requests per minute */
export const searchLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitResponse,
});

/** Admin routes: 50 requests per minute */
export const adminLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitResponse,
});

/** Gemini AI generation: 5 requests per minute */
export const aiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitResponse,
    message: 'AI generation rate limit exceeded. Please wait before trying again.',
});

/** AI Chat assistant: 15 requests per minute per IP */
export const aiChatLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitResponse,
    message: 'AI chat rate limit exceeded. Please slow down.',
});


/** General API fallback: 200 requests per minute */
export const generalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitResponse,
});


// ============================================================
// JWT Verification Options — Shared across all route files
// ============================================================

export const JWT_SIGN_OPTIONS: SignOptions = {
    algorithm: 'HS256',
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any,
    issuer: 'blackpiston-api',
    audience: 'blackpiston-client',
};

export const JWT_VERIFY_OPTIONS: VerifyOptions = {
    algorithms: ['HS256'],
    issuer: 'blackpiston-api',
    audience: 'blackpiston-client',
};
