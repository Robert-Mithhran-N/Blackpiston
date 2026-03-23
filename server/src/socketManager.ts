import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

let io: Server | null = null;

/**
 * Initialize Socket.IO server and attach to the given HTTP server.
 * Must be called once at startup before any routes emit events.
 */
export function initSocketServer(httpServer: HttpServer): Server {
    io = new Server(httpServer, {
        cors: {
            origin: (origin, callback) => {
                // Allow all origins in development; production should be more restrictive
                if (!origin || process.env.NODE_ENV === 'development') {
                    return callback(null, true);
                }
                const allowedOrigins = [
                    process.env.FRONTEND_URL || 'http://localhost:5000',
                    'http://localhost:5000',
                    'http://localhost:5173',
                    'http://localhost:3000',
                ].filter(Boolean);

                if (allowedOrigins.includes(origin)) {
                    return callback(null, true);
                }
                callback(new Error('Not allowed by CORS'));
            },
            credentials: true,
        },
    });

    io.on('connection', (socket: Socket) => {
        console.log(`🔌 Client connected: ${socket.id}`);

        socket.on('disconnect', (reason) => {
            console.log(`🔌 Client disconnected: ${socket.id} (${reason})`);
        });
    });

    console.log('🔌 Socket.IO server initialized');
    return io;
}

/**
 * Get the global Socket.IO server instance.
 * Throws if called before initSocketServer().
 */
export function getIO(): Server {
    if (!io) {
        throw new Error('Socket.IO not initialized — call initSocketServer() first');
    }
    return io;
}

/**
 * Broadcast a stock update event to ALL connected clients.
 */
export function emitStockUpdate(data: {
    productId: string;
    variantId?: string | null;
    newStock: number;
    inStock: boolean;
    variants?: { id: string; stockQuantity: number }[];
}): void {
    if (!io) {
        console.warn('Socket.IO not initialized — skipping stockUpdate emit');
        return;
    }
    console.log(`📡 Emitting stockUpdate: product=${data.productId} stock=${data.newStock} inStock=${data.inStock}`);
    io.emit('stockUpdate', data);
}
