import { useState, useCallback, useRef, useEffect } from 'react';
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
    isQueued?: boolean; // Indicates if the message is queued in client queue
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

function generateSessionId(): string {
    return 'ai_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
}

export function useAiChat() {
    const { token } = useUserAuth();
    const [messages, setMessages] = useState<AiChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [queueStatus, setQueueStatus] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const sessionIdRef = useRef(generateSessionId());
    
    // Frontend message queue ref to prevent multiple active requests
    const messageQueueRef = useRef<string[]>([]);
    const isProcessingRef = useRef(false);

    // Core execution dispatcher
    const executeSend = useCallback(async (userMessage: string, skipAddingUserMsg = false) => {
        setIsLoading(true);
        setError(null);
        isProcessingRef.current = true;

        if (!skipAddingUserMsg) {
            const userMsg: AiChatMessage = {
                role: 'user',
                content: userMessage,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, userMsg]);
        } else {
            // Remove the queued status from the matching user message
            setMessages(prev => 
                prev.map(m => m.role === 'user' && m.content === userMessage ? { ...m, isQueued: false } : m)
            );
        }

        // Add a placeholder assistant message that we will stream text into
        const assistantPlaceholder: AiChatMessage = {
            role: 'assistant',
            content: '',
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantPlaceholder]);

        try {
            // Collect last 5 messages for history context (excluding the placeholder we just added)
            // Need to filter out any messages that are still queued
            const activeHistory = messages
                .filter(m => !m.isQueued)
                .slice(-5)
                .map(m => ({
                    role: m.role,
                    content: m.content,
                }));

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'Accept': 'text/event-stream',
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_BASE}/ai/chat`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    message: userMessage,
                    sessionId: sessionIdRef.current,
                    history: activeHistory,
                    stream: true,
                }),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || errData.error || `Server returned ${response.status}`);
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder('utf-8');

            if (!reader) {
                throw new Error('Streaming not supported in this browser. Fallback to standard request.');
            }

            let buffer = '';
            let isReading = true;

            while (isReading) {
                const { value, done } = await reader.read();
                if (done) {
                    isReading = false;
                    break;
                }

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // Keep incomplete lines in the buffer

                let currentEvent = '';

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed) continue;

                    if (trimmed.startsWith('event:')) {
                        currentEvent = trimmed.substring(6).trim();
                    } else if (trimmed.startsWith('data:')) {
                        const dataStr = trimmed.substring(5).trim();
                        try {
                            const data = JSON.parse(dataStr);
                            
                            if (currentEvent === 'chunk') {
                                // Append text chunk in real-time
                                setMessages(prev => {
                                    const next = [...prev];
                                    const last = next[next.length - 1];
                                    if (last && last.role === 'assistant') {
                                        last.content += data.text;
                                    }
                                    return next;
                                });
                            } else if (currentEvent === 'status') {
                                // Update request queue status
                                if (data.status === 'queued') {
                                    setQueueStatus(`Queued (Position #${data.position}, waiting ~${Math.round(data.waitMs / 1000)}s)...`);
                                } else if (data.status === 'processing') {
                                    setQueueStatus('Thinking...');
                                }
                            } else if (currentEvent === 'end') {
                                // Final response with structured metadata
                                setMessages(prev => {
                                    const next = [...prev];
                                    const last = next[next.length - 1];
                                    if (last && last.role === 'assistant') {
                                        last.content = data.message;
                                        last.products = data.products;
                                        last.services = data.services;
                                        last.orders = data.orders;
                                        last.suggestions = data.suggestions;
                                    }
                                    return next;
                                });
                                setQueueStatus(null);
                            } else if (currentEvent === 'error') {
                                throw new Error(data.message || 'Stream error');
                            }
                        } catch (err) {
                            console.error('SSE JSON parsing error:', err);
                        }
                    }
                }
            }

        } catch (err: any) {
            console.error('AI chat connection error:', err);
            const statusStr = err?.message || 'Failed to get response';
            const isRateLimit = statusStr.includes('429') || statusStr.toLowerCase().includes('rate limit');
            
            const errorMsg = isRateLimit
                ? "You're sending messages too quickly. Please wait a moment."
                : statusStr;

            setError(errorMsg);

            // Replace assistant placeholder with error content
            setMessages(prev => {
                const next = [...prev];
                const last = next[next.length - 1];
                if (last && last.role === 'assistant') {
                    last.content = `⚠️ ${errorMsg}`;
                    last.suggestions = ['Try again', 'Search products', 'Contact support'];
                }
                return next;
            });
            setQueueStatus(null);
        } finally {
            setIsLoading(false);
            isProcessingRef.current = false;

            // Trigger next message in client queue if any are pending
            if (messageQueueRef.current.length > 0) {
                const nextMsg = messageQueueRef.current.shift();
                if (nextMsg) {
                    executeSend(nextMsg, true);
                }
            }
        }
    }, [messages, token]);

    // Primary send message handler
    const sendMessage = useCallback(async (userMessage: string) => {
        const trimmed = userMessage.trim();
        if (!trimmed) return;

        // If another message is active, add it to the client queue
        if (isProcessingRef.current || isLoading) {
            messageQueueRef.current.push(trimmed);
            setMessages(prev => [...prev, {
                role: 'user',
                content: trimmed,
                timestamp: new Date(),
                isQueued: true, // Display queued badge/status in UI
            }]);
            return;
        }

        await executeSend(trimmed);
    }, [executeSend, isLoading]);

    const clearChat = useCallback(() => {
        setMessages([]);
        setError(null);
        setQueueStatus(null);
        messageQueueRef.current = [];
        isProcessingRef.current = false;
        sessionIdRef.current = generateSessionId();
    }, []);

    return {
        messages,
        isLoading,
        queueStatus,
        error,
        sendMessage,
        clearChat,
        sessionId: sessionIdRef.current,
        queueLength: messageQueueRef.current.length,
    };
}
