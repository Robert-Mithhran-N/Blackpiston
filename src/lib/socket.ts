// Singleton Socket.IO client instance for BlackPiston Garage
// Connects lazily and auto-reconnects

import { io, Socket } from 'socket.io-client';

import { getApiHostUrl } from './api';

const WS_URL = getApiHostUrl();

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
