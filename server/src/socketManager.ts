import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

let io: Server | null = null;

// ============================================================
// Notification Types
// ============================================================

export type AdminNotificationType =
    | 'NEW_ORDER'
    | 'PAYMENT_SUCCESS'
    | 'LOW_STOCK'
    | 'NEW_USER'
    | 'COD_RECEIVED'
    | 'REFUND_REQUEST'
    | 'ORDER_CANCELLED';

export interface NewOrderPayload {
    id: string;              // unique notification ID
    orderId: string;
    orderNumber: string;
    customerName: string;
    totalAmount: number;
    paymentMethod: string;
    products: { name: string; quantity: number; image?: string }[];
    createdAt: string;
}

export interface AdminNotificationPayload {
    id: string;
    type: AdminNotificationType;
    title: string;
    message: string;
    orderId?: string;
    orderNumber?: string;
    customerName?: string;
    amount?: number;
    paymentMethod?: string;
    createdAt: string;
}

// ============================================================
// Socket.IO Server Initialization
// ============================================================

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
        // ── Admin Room Join ──
        // Admins send their JWT token to authenticate and join the admin room
        socket.on('join-admin', (token: string) => {
            try {
                const decoded = jwt.verify(
                    token,
                    process.env.JWT_SECRET as string
                ) as { userId: string; role: string };

                if (['ADMIN', 'STAFF', 'super-admin'].includes(decoded.role)) {
                    socket.join('admin');
                    socket.emit('admin-joined', { success: true });
                    console.log(`👤 Admin socket joined: ${decoded.userId} (${decoded.role})`);
                } else {
                    socket.emit('admin-joined', { success: false, error: 'Insufficient permissions' });
                }
            } catch (err) {
                socket.emit('admin-joined', { success: false, error: 'Invalid token' });
            }
        });

        socket.on('disconnect', (_reason) => {
            // no-op
        });
    });

    console.log('🔌 Socket.IO server initialized');
    return io;
}

// ============================================================
// Getters
// ============================================================

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

// ============================================================
// Event Emitters
// ============================================================

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
    io.emit('stockUpdate', data);
}

/**
 * Emit a new-order notification to all admin sockets.
 * Called after an order is successfully created + paid (or COD placed).
 */
export function emitNewOrder(data: NewOrderPayload): void {
    if (!io) {
        console.warn('Socket.IO not initialized — skipping new-order emit');
        return;
    }
    io.to('admin').emit('new-order', data);
    console.log(`📦 New order notification emitted: ${data.orderNumber}`);
}

/**
 * Emit a generic admin notification (for future event types).
 */
export function emitAdminNotification(data: AdminNotificationPayload): void {
    if (!io) {
        console.warn('Socket.IO not initialized — skipping admin notification emit');
        return;
    }
    io.to('admin').emit('admin-notification', data);
}
