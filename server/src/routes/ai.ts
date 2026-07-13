// ============================================================
// AI Chat Routes — POST /api/ai/chat, GET /api/ai/suggestions
// ============================================================

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';
import { JWT_VERIFY_OPTIONS } from '../middlewares/security.js';

// Import optimized modular AI sub-modules
import { screenMessage } from '../utils/ai/securityGuard.js';
import { aiDynamicRateLimiter } from '../utils/ai/rateLimiter.js';
import { aiQueueManager } from '../utils/ai/queueManager.js';
import { backgroundTasks } from '../utils/ai/backgroundTasks.js';
import {
    classifyIntent,
    fetchContextData,
    generateAiResponse,
    getQuickSuggestions,
    AiChatMessage
} from '../utils/ai/aiService.js';

const router = Router();

// ── Zod Schemas ──

const chatSchema = z.object({
    message: z.string().min(1, 'Message is required').max(500, 'Message too long (max 500 chars)'),
    sessionId: z.string().min(1).max(100),
    history: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().max(2000),
    })).max(10).optional().default([]),
    stream: z.boolean().optional().default(false),
});

const feedbackSchema = z.object({
    sessionId: z.string().min(1).max(100),
    messageIndex: z.number().int().min(0),
    rating: z.enum(['helpful', 'not_helpful']),
});

// ── Helper: Extract userId from optional JWT ──
function tryExtractUserId(req: Request): string | undefined {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return undefined;

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string, JWT_VERIFY_OPTIONS) as {
            userId: string;
            role: string;
        };
        return decoded.userId;
    } catch {
        return undefined;
    }
}

// Apply dynamic rate limiting and burst protection to AI chat routes
router.post('/chat', aiDynamicRateLimiter, async (req: Request, res: Response) => {
    // 1. Concurrency Lock check: Acquire lock early
    const sessionId = req.body?.sessionId;
    if (sessionId) {
        const acquired = aiQueueManager.acquireLock(sessionId);
        if (!acquired) {
            return res.status(429).json({
                success: false,
                message: 'An active request is already processing for this session. Please wait.',
                errorCode: 'CONCURRENT_REQUEST',
            });
        }
    }

    try {
        // Validate input schema
        const parseResult = chatSchema.safeParse(req.body);
        if (!parseResult.success) {
            if (sessionId) aiQueueManager.releaseLock(sessionId);
            return res.status(400).json({
                success: false,
                error: 'Invalid request',
                details: parseResult.error.errors.map(e => e.message),
            });
        }

        const { message, history, stream } = parseResult.data;
        const userId = tryExtractUserId(req);

        // 2. Security Screening check
        const securityCheck = screenMessage(message);
        if (securityCheck.isBlocked) {
            if (sessionId) aiQueueManager.releaseLock(sessionId);
            return res.json({
                success: true,
                data: {
                    message: securityCheck.responseMessage || "Blocked by security rules.",
                    intent: 'BLOCKED' as any,
                    suggestions: ['Search products', 'FAQs', 'Contact support'],
                },
            });
        }

        // Check if client is requesting a Server-Sent Events stream
        const isStreaming = stream || req.headers.accept === 'text/event-stream';

        if (isStreaming) {
            // Set SSE response headers
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.setHeader('X-Accel-Buffering', 'no');
            res.flushHeaders();

            // Enqueue the AI execution in our queue manager to prevent API overload
            await aiQueueManager.enqueue(sessionId, async () => {
                // 1. Classify intent
                const intent = await classifyIntent(message);

                // 2. Fetch context data
                const context = await fetchContextData(intent, message, userId);

                // 3. Generate response with streaming chunks callback
                const response = await generateAiResponse(
                    message,
                    context,
                    history as AiChatMessage[],
                    (chunk) => {
                        res.write(`event: chunk\ndata: ${JSON.stringify({ text: chunk })}\n\n`);
                    }
                );

                // Send the final complete structured response details
                res.write(`event: end\ndata: ${JSON.stringify(response)}\n\n`);
                res.end();

                // 4. Background non-blocking conversation logging
                backgroundTasks.enqueue('log_conversation_sse', async () => {
                    await prisma.aiConversation.upsert({
                        where: { sessionId },
                        create: {
                            sessionId,
                            userId: userId || undefined,
                            intent,
                            messages: [
                                { role: 'user', content: message, timestamp: new Date() },
                                { role: 'assistant', content: response.message, timestamp: new Date() },
                            ],
                        },
                        update: {
                            intent,
                            messages: {
                                push: [
                                    { role: 'user', content: message, timestamp: new Date() },
                                    { role: 'assistant', content: response.message, timestamp: new Date() },
                                ],
                            },
                        },
                    });
                });
            }, (statusUpdate) => {
                // Stream request queue positions to client
                res.write(`event: status\ndata: ${JSON.stringify(statusUpdate)}\n\n`);
            });

        } else {
            // ── Standard JSON response ──
            const response = await aiQueueManager.enqueue(sessionId, async () => {
                const intent = await classifyIntent(message);
                const context = await fetchContextData(intent, message, userId);
                const result = await generateAiResponse(message, context, history as AiChatMessage[]);

                // Background logging
                backgroundTasks.enqueue('log_conversation_json', async () => {
                    await prisma.aiConversation.upsert({
                        where: { sessionId },
                        create: {
                            sessionId,
                            userId: userId || undefined,
                            intent,
                            messages: [
                                { role: 'user', content: message, timestamp: new Date() },
                                { role: 'assistant', content: result.message, timestamp: new Date() },
                            ],
                        },
                        update: {
                            intent,
                            messages: {
                                push: [
                                    { role: 'user', content: message, timestamp: new Date() },
                                    { role: 'assistant', content: result.message, timestamp: new Date() },
                                ],
                            },
                        },
                    });
                });

                return result;
            });

            return res.json({
                success: true,
                data: response,
            });
        }

    } catch (error: any) {
        console.error('[AI Chat Route] Request processing error:', error);
        
        // Check if headers have already been sent in streaming mode
        if (res.headersSent) {
            res.write(`event: error\ndata: ${JSON.stringify({ message: 'Internal assistant error.' })}\n\n`);
            res.end();
        } else {
            res.status(500).json({
                success: false,
                error: 'AI assistant is temporarily unavailable. Please try again.',
            });
        }
    } finally {
        // 5. Always release the concurrency lock for the session
        if (sessionId) {
            aiQueueManager.releaseLock(sessionId);
        }
    }
});

// ============================================================
// GET /api/ai/suggestions — Quick suggestion chips
// ============================================================
router.get('/suggestions', (req: Request, res: Response) => {
    res.json({
        success: true,
        data: getQuickSuggestions(),
    });
});

// ============================================================
// POST /api/ai/feedback — Rate AI response quality
// ============================================================
router.post('/feedback', async (req: Request, res: Response) => {
    try {
        const parseResult = feedbackSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ success: false, error: 'Invalid feedback data' });
        }

        // Log feedback in the background
        const { sessionId, messageIndex, rating } = parseResult.data;
        backgroundTasks.enqueue('log_feedback', async () => {
            console.log(`[AI Feedback] session=${sessionId} msg=${messageIndex} rating=${rating}`);
        });

        res.json({ success: true, message: 'Thank you for your feedback!' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to submit feedback' });
    }
});

export default router;
