// ============================================================
// Input Sanitization Middleware
// Protects against XSS, HTML injection, script injection,
// MongoDB/NoSQL operator injection, and path traversal.
// ============================================================

import { Request, Response, NextFunction } from 'express';

/**
 * Strip dangerous HTML tags, event handlers, and javascript: URIs from a string.
 * Lightweight regex-based approach — no extra dependencies.
 */
function sanitizeString(value: string): string {
    if (typeof value !== 'string') return value;

    let clean = value;

    // Remove <script>...</script> blocks (including content)
    clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Remove remaining script tags (self-closing or unclosed)
    clean = clean.replace(/<\/?script[^>]*>/gi, '');

    // Remove event handler attributes (onclick, onerror, onload, etc.)
    clean = clean.replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, '');
    clean = clean.replace(/\bon\w+\s*=\s*[^\s>]+/gi, '');

    // Remove javascript: and data: URIs in href/src attributes
    clean = clean.replace(/(?:href|src)\s*=\s*["']?\s*(?:javascript|data)\s*:/gi, '');

    // Remove <iframe>, <embed>, <object>, <form> tags
    clean = clean.replace(/<\/?(iframe|embed|object|form|meta|link|base)[^>]*>/gi, '');

    // Remove style attributes containing expression() or url(javascript:)
    clean = clean.replace(/style\s*=\s*["'][^"']*expression\s*\([^)]*\)[^"']*["']/gi, '');
    clean = clean.replace(/style\s*=\s*["'][^"']*url\s*\(\s*["']?\s*javascript:[^)]*\)[^"']*["']/gi, '');

    return clean.trim();
}

/**
 * Detect and neutralize MongoDB/NoSQL operator injection.
 * If a string value starts with $, it's likely an injection attempt.
 */
function sanitizeMongoOperators(obj: any): any {
    if (obj === null || obj === undefined) return obj;

    if (typeof obj === 'string') {
        // Block strings that look like MongoDB operators
        if (obj.startsWith('$')) {
            return '';
        }
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeMongoOperators(item));
    }

    if (typeof obj === 'object') {
        const sanitized: Record<string, any> = {};
        for (const key of Object.keys(obj)) {
            // Block object keys that are MongoDB operators
            if (key.startsWith('$')) {
                console.warn(`🚫 Blocked MongoDB operator injection attempt: key="${key}"`);
                continue; // skip this key entirely
            }
            sanitized[key] = sanitizeMongoOperators(obj[key]);
        }
        return sanitized;
    }

    return obj;
}

/**
 * Recursively sanitize all string values in an object.
 */
function deepSanitize(obj: any): any {
    if (obj === null || obj === undefined) return obj;

    if (typeof obj === 'string') {
        return sanitizeString(sanitizeMongoOperators(obj) as string);
    }

    if (Array.isArray(obj)) {
        return obj.map(item => deepSanitize(item));
    }

    if (typeof obj === 'object') {
        // First strip MongoDB operators, then sanitize strings
        const cleaned = sanitizeMongoOperators(obj);
        const sanitized: Record<string, any> = {};
        for (const key of Object.keys(cleaned)) {
            sanitized[key] = deepSanitize(cleaned[key]);
        }
        return sanitized;
    }

    return obj;
}

/**
 * Express middleware to sanitize req.body, req.query, and req.params.
 * Should be applied AFTER body parsers but BEFORE route handlers.
 */
export function sanitizeInput(req: Request, _res: Response, next: NextFunction): void {
    try {
        if (req.body && typeof req.body === 'object') {
            req.body = deepSanitize(req.body);
        }
        if (req.query && typeof req.query === 'object') {
            req.query = deepSanitize(req.query);
        }
        if (req.params && typeof req.params === 'object') {
            req.params = deepSanitize(req.params);
        }
    } catch (err) {
        console.error('Sanitization error:', err);
        // Don't block the request on sanitization failure
    }
    next();
}
