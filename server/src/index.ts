import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import uploadRoutes from './routes/upload.js';
import adminRoutes from './routes/admin.js';
import productTypeRoutes from './routes/productTypes.js';

// Load environment variables (resolve path relative to this file, not CWD)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'BlackPiston Garage API is running',
        timestamp: new Date().toISOString()
    });
});

// Database health check endpoint
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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/product-types', productTypeRoutes);
// Search and tag suggestion routes are inside productTypeRoutes

// Database connection check
async function checkDatabaseConnection() {
    try {
        await prisma.$connect();
        console.log('✅ Connected to MongoDB successfully');
    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error);
        process.exit(1);
    }
}

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err.message);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found', message: 'The requested resource was not found' });
});

// Start server
async function startServer() {
    await checkDatabaseConnection();

    app.listen(PORT, () => {
        console.log(`
🏍️  BlackPiston Garage API Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Server running on: http://localhost:${PORT}
🔗 API Base URL: http://localhost:${PORT}/api
🏥 Health Check: http://localhost:${PORT}/api/health
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
    });
}

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🔌 Shutting down server...');
    await prisma.$disconnect();
    process.exit(0);
});

export { prisma };
