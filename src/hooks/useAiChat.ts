import { useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { useUserAuth } from '@/context/UserAuthContext';

// ── Types ──

export interface AiChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    products?: AiProduct[];
    services?: AiService[];
    orders?: AiOrder[];
    suggestions?: string[];
}

export interface AiProduct {
    id: string;
    name: string;
    slug: string;
    brand?: string;
    price: number;
    offerPrice?: number;
    thumbnailUrl?: string;
    rating?: number;
    totalReviews?: number;
    inStock?: boolean;
}

export interface AiService {
    id: string;
    name: string;
    slug: string;
    price: number;
    duration: string;
    image?: string;
    highlights?: string[];
}

export interface AiOrder {
    orderNumber: string;
    orderStatus: string;
    paymentStatus: string;
    totalAmount: number;
    orderedAt: string;
    tracking?: {
        carrier?: string;
        trackingNumber?: string;
        trackingUrl?: string;
    };
}

// ── API Base URL ──

const getApiBaseUrl = () => {
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl && !envUrl.includes('localhost')) return envUrl;
    return `${window.location.protocol}//${window.location.hostname}:3001/api`;
};

const API_BASE = getApiBaseUrl();

// ── Session ID ──

function generateSessionId(): string {
    return 'ai_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
}

// ── Hook ──

export function useAiChat() {
    const { token } = useUserAuth();
    const [messages, setMessages] = useState<AiChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const sessionIdRef = useRef(generateSessionId());

    const sendMessage = useCallback(async (userMessage: string) => {
        if (!userMessage.trim() || isLoading) return;

        setError(null);

        // Add user message to state
        const userMsg: AiChatMessage = {
            role: 'user',
            content: userMessage.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            // Build conversation history for context (last 5 messages)
            const history = messages.slice(-5).map(m => ({
                role: m.role,
                content: m.content,
            }));

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await axios.post(
                `${API_BASE}/ai/chat`,
                {
                    message: userMessage.trim(),
                    sessionId: sessionIdRef.current,
                    history,
                },
                { headers, timeout: 30000 },
            );

            if (response.data.success) {
                const data = response.data.data;
                const aiMsg: AiChatMessage = {
                    role: 'assistant',
                    content: data.message,
                    timestamp: new Date(),
                    products: data.products,
                    services: data.services,
                    orders: data.orders,
                    suggestions: data.suggestions,
                };
                setMessages(prev => [...prev, aiMsg]);
            } else {
                throw new Error(response.data.error || 'Unknown error');
            }
        } catch (err: any) {
            const errorMsg = err?.response?.status === 429
                ? "You're sending messages too quickly. Please wait a moment."
                : err?.response?.data?.error || 'Failed to get response. Please try again.';

            setError(errorMsg);

            // Add error as assistant message
            const errorAiMsg: AiChatMessage = {
                role: 'assistant',
                content: `⚠️ ${errorMsg}`,
                timestamp: new Date(),
                suggestions: ['Try again', 'Search products', 'Contact support'],
            };
            setMessages(prev => [...prev, errorAiMsg]);
        } finally {
            setIsLoading(false);
        }
    }, [messages, isLoading, token]);

    const clearChat = useCallback(() => {
        setMessages([]);
        setError(null);
        sessionIdRef.current = generateSessionId();
    }, []);

    return {
        messages,
        isLoading,
        error,
        sendMessage,
        clearChat,
        sessionId: sessionIdRef.current,
    };
}
