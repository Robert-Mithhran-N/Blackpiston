// ============================================================
// Centralized Error Handler Middleware
// ============================================================

import { Request, Response, NextFunction } from 'express';

// Error codes for structured API responses
export const ErrorCodes = {
    // Authentication
    AUTH_TOKEN_MISSING: 'AUTH_001',
    AUTH_TOKEN_INVALID: 'AUTH_002',
    AUTH_TOKEN_EXPIRED: 'AUTH_003',
    AUTH_INSUFFICIENT_PERMISSIONS: 'AUTH_004',
    AUTH_INVALID_CREDENTIALS: 'AUTH_005',

    // Validation
    VALIDATION_FAILED: 'VAL_001',
    INVALID_INPUT: 'VAL_002',

    // Resources
    NOT_FOUND: 'RES_001',
    CONFLICT: 'RES_002',

    // Rate Limiting
    RATE_LIMIT_EXCEEDED: 'RATE_001',

    // Server
    INTERNAL_ERROR: 'SRV_001',
    SERVICE_UNAVAILABLE: 'SRV_002',

    // Upload
    UPLOAD_FAILED: 'UPL_001',
    INVALID_FILE_TYPE: 'UPL_002',
    FILE_TOO_LARGE: 'UPL_003',
} as const;

export class AppError extends Error {
    public readonly statusCode: number;
    public readonly errorCode: string;
    public readonly isOperational: boolean;

    constructor(
        message: string,
        statusCode: number = 500,
        errorCode: string = ErrorCodes.INTERNAL_ERROR,
        isOperational: boolean = true
    ) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

/**
 * Global error handling middleware.
 * Must be registered LAST (after all routes).
 */
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
    // Default values
    let statusCode = 500;
    let message = 'Internal Server Error';
    let errorCode: string = ErrorCodes.INTERNAL_ERROR;

    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        errorCode = err.errorCode;
    } else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid authentication token';
        errorCode = ErrorCodes.AUTH_TOKEN_INVALID;
    } else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Authentication token has expired';
        errorCode = ErrorCodes.AUTH_TOKEN_EXPIRED;
    } else if (err.message?.includes('CORS')) {
        statusCode = 403;
        message = 'Cross-origin request blocked';
        errorCode = ErrorCodes.AUTH_INSUFFICIENT_PERMISSIONS;
    }

    // Log the error (full stack in development only)
    if (process.env.NODE_ENV === 'development') {
        console.error(`❌ [${errorCode}] ${req.method} ${req.path}:`, err);
    } else {
        console.error(`❌ [${errorCode}] ${req.method} ${req.path}: ${err.message}`);
    }

    res.status(statusCode).json({
        success: false,
        message: process.env.NODE_ENV === 'production' && statusCode === 500
            ? 'Something went wrong'
            : message,
        errorCode,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
}

/**
 * 404 handler — registered after all routes, before the error handler.
 */
export function notFoundHandler(req: Request, res: Response): void {
    res.status(404).json({
        success: false,
        message: 'The requested resource was not found',
        errorCode: ErrorCodes.NOT_FOUND,
    });
}
