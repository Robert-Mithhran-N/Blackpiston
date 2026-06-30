import express from 'express';
import { createServer } from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

// Load environment variables FIRST (before any other imports that use env vars)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Validate environment variables — crashes on missing critical vars
import { validateEnvironment } from './config/validateEnv.js';
validateEnvironment();

// Security middleware
import {
    helmetMiddleware,
    corsMiddleware,
    authLimiter,
    uploadLimiter,
    searchLimiter,
    adminLimiter,
    generalLimiter,
} from './middlewares/security.js';
import { requestLogger } from './middlewares/logger.js';
import { sanitizeInput } from './middlewares/sanitize.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

// Route imports
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import uploadRoutes from './routes/upload.js';
import adminRoutes from './routes/admin.js';
import userRoutes from './routes/users.js';
import blogRoutes from './routes/blog.js';
import serviceRoutes from './routes/services.js';
import couponRoutes from './routes/coupons.js';
import wishlistRoutes from './routes/wishlist.js';
import requestRoutes from './routes/requests.js';
import paymentRoutes from './routes/payments.js';
import sitemapRoutes from './routes/sitemap.js';
import { initSocketServer } from './socketManager.js';
import { cleanupExpiredOrders } from './utils/paymentService.js';

// Validate JWT_SECRET on startup
if (!process.env.JWT_SECRET) {
    console.error("❌ CRITICAL: JWT_SECRET environment variable is missing!");
    process.exit(1);
}

const app = express();
const httpServer = createServer(app);
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// ============================================================
// Global Security Middleware (applied in order)
// ============================================================

// 1. Helmet — HTTP security headers
app.use(helmetMiddleware);

// 2. CORS — strict whitelist
app.use(corsMiddleware);

// 3. Request logging
app.use(requestLogger);

// 4. Raw body parser for Razorpay webhook (MUST come before express.json)
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// 5. Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 6. Input sanitization (after body parsing, before routes)
app.use(sanitizeInput);

// ============================================================
// Health Check Endpoints (no rate limiting)
// ============================================================

app.get("/health", (req, res) => {
    return res.status(200).json({
        status: "ok",
        message: "BlackPiston backend running"
    });
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'BlackPiston Garage API is running',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/health/db', async (req, res) => {
    try {
        await prisma.$runCommandRaw({ ping: 1 });
        res.json({
            status: 'connected',
            database: 'MongoDB',
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        res.status(503).json({
            status: 'disconnected',
            database: 'MongoDB',
            error: error?.message || 'Connection failed',
            timestamp: new Date().toISOString()
        });
    }
});

// ============================================================
// API Routes with Rate Limiters
// ============================================================

// Auth routes — strictest rate limit (5/min)
app.use('/api/auth', authLimiter, authRoutes);

// Upload routes — 20/min
app.use('/api/upload', uploadLimiter, uploadRoutes);

// Admin routes — 50/min
app.use('/api/admin', adminLimiter, adminRoutes);
app.use('/api/admin/blog', adminLimiter, blogRoutes);
app.use('/api/admin/services', adminLimiter, serviceRoutes);

// Product/search routes — 100/min
app.use('/api/products', searchLimiter, productRoutes);

// General API routes — 200/min
app.use('/api/orders', generalLimiter, orderRoutes);
app.use('/api/users', generalLimiter, userRoutes);
app.use('/api/coupons', generalLimiter, couponRoutes);
app.use('/api/wishlist', generalLimiter, wishlistRoutes);
app.use('/api/requests', generalLimiter, requestRoutes);
app.use('/api/payments', generalLimiter, paymentRoutes);

// Dynamic sitemap endpoint — rate limited to 100/min
app.use('/sitemap.xml', searchLimiter, sitemapRoutes);

// ============================================================
// Error Handling (must be LAST)
// ============================================================

// 404 handler
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

// ============================================================
// Server Startup
// ============================================================

async function checkDatabaseConnection() {
    try {
        await prisma.$connect();
        console.log('✅ Connected to MongoDB successfully');
    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error);
        process.exit(1);
    }
}

async function startServer() {
    await checkDatabaseConnection();

    // Initialize Socket.IO before listening
    initSocketServer(httpServer);

    httpServer.listen(PORT, () => {
        console.log("Server running on port " + PORT);
        console.log(`
🏍️  BlackPiston Garage API Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Server running on: http://localhost:${PORT}
🔗 API Base URL: http://localhost:${PORT}/api
🏥 Health Check: http://localhost:${PORT}/api/health
🔌 Socket.IO: Enabled
🔐 Security: Helmet + Rate Limiting + CORS + Sanitization
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
    });
}

startServer();

// ── Expired Payment Cleanup (every 15 minutes) ──
setInterval(() => {
    cleanupExpiredOrders().catch(err =>
        console.error('Expired order cleanup failed:', err)
    );
}, 15 * 60 * 1000);

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🔌 Shutting down server...');
    await prisma.$disconnect();
    process.exit(0);
});

export { prisma };
