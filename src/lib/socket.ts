// Singleton Socket.IO client instance for BlackPiston Garage
// Connects lazily and auto-reconnects

import { io, Socket } from 'socket.io-client';

// Derive the WS URL from the API base (strip /api suffix)
const getApiHostUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && !envUrl.includes("localhost")) return envUrl;
  return `${window.location.protocol}//${window.location.hostname}:3001`;
};
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
