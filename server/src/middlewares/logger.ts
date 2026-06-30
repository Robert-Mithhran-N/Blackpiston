// ============================================================
// Request Logger Middleware — Morgan-based
// ============================================================

import morgan from 'morgan';

/**
 * Production: compact log format with essential info.
 * Development: colored, detailed log format.
 */
export const requestLogger = process.env.NODE_ENV === 'production'
    ? morgan(':remote-addr :method :url :status :res[content-length] - :response-time ms')
    : morgan('dev');
