// Singleton Socket.IO client instance for BlackPiston Garage
// Connects lazily and auto-reconnects

import { io, Socket } from 'socket.io-client';

// Derive the WS URL from the API base (strip /api suffix)
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const WS_URL = API_BASE.replace(/\/api\/?$/, '');

let socket: Socket | null = null;

/**
 * Get (or create) the singleton Socket.IO client.
 * The connection is established lazily on first call.
 */
export function getSocket(): Socket {
    if (!socket) {
        socket = io(WS_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 10000,
            autoConnect: true,
        });

        socket.on('connect', () => {
            console.log('🔌 Socket.IO connected:', socket?.id);
        });

        socket.on('disconnect', (reason) => {
            console.log('🔌 Socket.IO disconnected:', reason);
        });

        socket.on('connect_error', (err) => {
            console.warn('🔌 Socket.IO connection error:', err.message);
        });
    }

    return socket;
}

/**
 * Disconnect and clean up the socket instance.
 */
export function disconnectSocket(): void {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}
