// Hook: subscribe to real-time stock updates for a specific product
// Usage: useStockUpdates(productId, (data) => { /* update state */ })

import { useEffect } from 'react';
import { getSocket } from '@/lib/socket';

export interface StockUpdatePayload {
    productId: string;
    variantId?: string | null;
    newStock: number;
    inStock: boolean;
    variants?: { id: string; stockQuantity: number }[];
}

/**
 * Listen for `stockUpdate` socket events for a given product.
 * Calls `onUpdate` whenever the server broadcasts a stock change
 * that matches the provided productId.
 */
export function useStockUpdates(
    productId: string | undefined,
    onUpdate: (data: StockUpdatePayload) => void,
): void {
    useEffect(() => {
        if (!productId) return;

        const socket = getSocket();

        const handler = (data: StockUpdatePayload) => {
            if (data.productId === productId) {
                onUpdate(data);
            }
        };

        socket.on('stockUpdate', handler);

        return () => {
            socket.off('stockUpdate', handler);
        };
    }, [productId, onUpdate]);
}
