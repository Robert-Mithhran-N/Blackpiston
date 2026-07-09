// ============================================================
// AI Chat Routes — POST /api/ai/chat, GET /api/ai/suggestions
// ============================================================

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';
import { JWT_VERIFY_OPTIONS } from '../middlewares/security.js';
import {
    classifyIntent,
    fetchContextData,
    generateAiResponse,
    getQuickSuggestions,
    AiChatMessage,
} from '../utils/aiService.js';

const router = Router();

// ── Zod Schemas ──

const chatSchema = z.object({
    message: z.string().min(1, 'Message is required').max(500, 'Message too long (max 500 chars)'),
    sessionId: z.string().min(1).max(100),
    history: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().max(2000),
    })).max(10).optional().default([]),
});

const feedbackSchema = z.object({
    sessionId: z.string().min(1).max(100),
    messageIndex: z.number().int().min(0),
    rating: z.enum(['helpful', 'not_helpful']),
});

// ── Helper: Try to extract userId from optional JWT ──

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

// ============================================================
// POST /api/ai/chat — Main chat endpoint
// ============================================================

router.post('/chat', async (req: Request, res: Response) => {
    try {
        // Validate input
        const parseResult = chatSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({
                success: false,
                error: 'Invalid request',
                details: parseResult.error.errors.map(e => e.message),
            });
        }

        const { message, sessionId, history } = parseResult.data;

        // Optional auth (needed for order tracking)
        const userId = tryExtractUserId(req);

        // 1. Classify intent
        const intent = await classifyIntent(message);

        // 2. Fetch relevant context data
        const context = await fetchContextData(intent, message, userId);

        // 3. Generate AI response
        const response = await generateAiResponse(
            message,
            context,
            history as AiChatMessage[],
        );

        // 4. Log conversation (async, don't block response)
        prisma.aiConversation.upsert({
            where: { sessionId } as any,
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
        }).catch(err => {
            // Fallback: if upsert fails (no unique on sessionId), just create
            prisma.aiConversation.create({
                data: {
                    sessionId,
                    userId: userId || undefined,
                    intent,
                    messages: [
                        { role: 'user', content: message, timestamp: new Date() },
                        { role: 'assistant', content: response.message, timestamp: new Date() },
                    ],
                },
            }).catch(innerErr => console.error('AI conversation log failed:', innerErr));
        });

        return res.json({
            success: true,
            data: response,
        });

    } catch (error: any) {
        console.error('AI chat error:', error);
        return res.status(500).json({
            success: false,
            error: 'AI service temporarily unavailable. Please try again.',
        });
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

        // Log feedback — in production, this could feed into model improvement
        console.log(`AI Feedback: session=${parseResult.data.sessionId} msg=${parseResult.data.messageIndex} rating=${parseResult.data.rating}`);

        res.json({ success: true, message: 'Thank you for your feedback!' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to submit feedback' });
    }
});

export default router;
