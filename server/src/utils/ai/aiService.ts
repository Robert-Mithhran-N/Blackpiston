// ============================================================
// AI Service Orchestrator — Entrypoint, Core Logic & Streaming
// ============================================================

import { GoogleGenAI } from '@google/genai';
export type AiIntent =
    | 'PRODUCT_SEARCH'
    | 'PRODUCT_DETAILS'
    | 'PRODUCT_COMPARE'
    | 'SERVICE_INFO'
    | 'POLICY'
    | 'FAQ'
    | 'STORE_INFO'
    | 'ORDER_TRACKING'
    | 'CART_HELP'
    | 'RECOMMENDATION'
    | 'GREETING'
    | 'BLOCKED';

export interface AiChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface AiContextData {
    products?: any[];
    services?: any[];
    knowledgeEntries?: any[];
    storeInfo?: any;
    orders?: any[];
    type: string;
}

export interface AiChatResponse {
    message: string;
    intent: AiIntent;
    products?: any[];
    services?: any[];
    orders?: any[];
    suggestions?: string[];
}

// Import sub-modules
import {
    classifyIntentByRules,
    classifyIntentWithGemini,
    tryResolveStaticResponse,
    StaticResponse
} from './intentEngine.js';

import { buildContextData } from './contextBuilder.js';
import { buildPrompt } from './promptBuilder.js';
import { aiAnalyticsService } from './analytics.js';
import { backgroundTasks } from './backgroundTasks.js';

// Gemini Singleton
let client: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
    if (!client) {
        const key = process.env.GEMINI_API_KEY;
        if (!key) throw new Error('GEMINI_API_KEY is not configured');
        client = new GoogleGenAI({ apiKey: key });
    }
    return client;
}

// Re-export utility classifiers and context gatherers
export async function classifyIntent(message: string): Promise<AiIntent> {
    // 1. Try regex/rules first (fast, 0 cost)
    const ruleIntent = classifyIntentByRules(message);
    if (ruleIntent) return ruleIntent;

    // 2. Fallback to Gemini
    return classifyIntentWithGemini(message);
}

export async function fetchContextData(
    intent: AiIntent,
    message: string,
    userId?: string
): Promise<AiContextData> {
    const startTime = Date.now();
    const context = await buildContextData(intent, message, userId);
    
    // Track database query latency
    const dbLatency = Date.now() - startTime;
    (context as any).dbLatencyMs = dbLatency;

    return context;
}

/**
 * Orchestrates prompt construction, Gemini call execution (streaming or block),
 * latency tracking, and non-blocking conversation logging.
 */
export async function generateAiResponse(
    userMessage: string,
    context: AiContextData,
    conversationHistory: AiChatMessage[] = [],
    onChunk?: (text: string) => void // SSE chunk streaming support
): Promise<AiChatResponse> {
    const startTime = Date.now();
    const dbLatencyMs = (context as any).dbLatencyMs || 0;
    
    // Record search keyword for keywords analysis
    if (context.type === 'products' && userMessage.trim().length > 2) {
        aiAnalyticsService.recordSearchKeyword(userMessage);
    }

    // 1. Handle Static / Pre-calculated Responses directly (0ms, 0 Gemini tokens)
    const staticResponse = await tryResolveStaticResponse(userMessage, context.type as AiIntent);
    if (staticResponse) {
        const payload = {
            intent: staticResponse.intent,
            totalLatencyMs: Date.now() - startTime,
            dbLatencyMs,
            geminiLatencyMs: 0,
            inputTokens: 0,
            outputTokens: 0,
            cacheHit: true,
            isStatic: true,
            success: true
        };
        aiAnalyticsService.recordRequest(payload);

        return {
            message: staticResponse.message,
            intent: staticResponse.intent,
            suggestions: staticResponse.suggestions,
        };
    }

    // Auth warning or Cart assistance fallbacks
    if (context.type === 'auth_required') {
        return {
            message: "To check your order status, I need you to be logged in. Please log in to your account first, and then I can help you track your orders! 🔐",
            intent: 'ORDER_TRACKING',
            suggestions: ['Search products', 'Garage services', 'Store policies'],
        };
    }

    if (context.type === 'cart_help') {
        return {
            message: "Here's how to shop on BlackPiston Garage:\n\n1. 🔍 Browse products in our Shop\n2. ➕ Click 'Add to Cart' on items you want\n3. 🛒 Go to your Cart to review\n4. 💳 Proceed to Checkout\n5. 📦 Choose shipping & payment method (Online/COD)\n\nNeed help finding a specific product?",
            intent: 'CART_HELP',
            suggestions: ['Search products', 'Payment methods', 'Shipping policy'],
        };
    }

    // 2. Build Optimized System & Context Prompts
    const prompt = buildPrompt(userMessage, context, conversationHistory);
    const geminiStartTime = Date.now();
    let finalMessage = '';
    let inputTokens = 0;
    let outputTokens = 0;

    try {
        const client = getAI();

        if (onChunk) {
            // ── SSE STREAMING RESPONSE ──
            const responseStream = await client.models.generateContentStream({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    temperature: 0.7,
                    maxOutputTokens: 1024,
                },
            });

            for await (const chunk of responseStream) {
                const text = chunk.text || '';
                finalMessage += text;
                onChunk(text);

                // Collect usage stats if present in chunk metadata
                if (chunk.usageMetadata) {
                    inputTokens = chunk.usageMetadata.promptTokenCount || 0;
                    outputTokens = chunk.usageMetadata.candidatesTokenCount || 0;
                }
            }
        } else {
            // ── STANDARD BLOCK RESPONSE ──
            const response = await client.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    temperature: 0.7,
                    maxOutputTokens: 1024,
                },
            });

            finalMessage = response.text || "I'm sorry, I couldn't process your request. Please try again.";
            
            if (response.usageMetadata) {
                inputTokens = response.usageMetadata.promptTokenCount || 0;
                outputTokens = response.usageMetadata.candidatesTokenCount || 0;
            }
        }

        const geminiLatencyMs = Date.now() - geminiStartTime;
        const totalLatencyMs = Date.now() - startTime;

        // If usage metadata was missing, approximate it
        if (inputTokens === 0) {
            inputTokens = Math.round(prompt.length / 4);
            outputTokens = Math.round(finalMessage.length / 4);
        }

        // Record metrics
        const payload = {
            intent: context.type,
            totalLatencyMs,
            dbLatencyMs,
            geminiLatencyMs,
            inputTokens,
            outputTokens,
            cacheHit: false,
            isStatic: false,
            success: true
        };
        aiAnalyticsService.recordRequest(payload);

        // Build Response Object
        const result: AiChatResponse = {
            message: finalMessage,
            intent: context.type as AiIntent,
        };

        // Attach structured data
        if (context.products && context.products.length > 0) {
            result.products = context.products.map(p => ({
                id: p.id,
                name: p.name,
                slug: p.slug,
                brand: p.brand,
                price: p.price,
                offerPrice: p.offerPrice,
                thumbnailUrl: p.thumbnailUrl || p.images?.[0]?.url,
                rating: p.rating,
                totalReviews: p.totalReviews,
                inStock: p.inStock,
            }));
        }

        if (context.services && context.services.length > 0) {
            result.services = context.services.map(s => ({
                id: s.id,
                name: s.name,
                slug: s.slug,
                price: s.price,
                duration: s.duration,
                image: s.image,
                highlights: s.highlights?.slice(0, 3),
            }));
        }

        if (context.orders && context.orders.length > 0) {
            result.orders = context.orders.map(o => ({
                orderNumber: o.orderNumber,
                orderStatus: o.orderStatus,
                paymentStatus: o.paymentStatus,
                totalAmount: o.totalAmount,
                orderedAt: o.orderedAt,
                tracking: o.tracking,
            }));
        }

        result.suggestions = generateSuggestions(context.type);
        return result;

    } catch (error: any) {
        console.error('[AI Service] Gemini response generation error:', error);
        
        const payload = {
            intent: context.type,
            totalLatencyMs: Date.now() - startTime,
            dbLatencyMs,
            geminiLatencyMs: 0,
            inputTokens: 0,
            outputTokens: 0,
            cacheHit: false,
            isStatic: false,
            success: false,
            errorCode: error?.message || 'GEMINI_ERROR'
        };
        aiAnalyticsService.recordRequest(payload);

        return {
            message: "I'm having trouble processing your request right now. Please try again in a moment. 🔧",
            intent: 'FAQ',
            suggestions: ['Search products', 'Contact support', 'FAQs'],
        };
    }
}

export function generateSuggestions(contextType: string): string[] {
    switch (contextType) {
        case 'products':
        case 'product_details':
            return ['Compare products', 'View all products', 'Garage services'];
        case 'product_compare':
            return ['More product details', 'Search by budget', 'View services'];
        case 'services':
            return ['Book a service', 'View products', 'Contact us'];
        case 'faq':
            return ['Search products', 'View services', 'Contact info'];
        case 'policy':
            return ['Refund policy', 'Shipping info', 'Contact support'];
        case 'store_info':
            return ['View products', 'Book service', 'FAQs'];
        case 'orders':
            return ['Search products', 'Return policy', 'Contact support'];
        default:
            return ['Search products', 'Garage services', 'FAQs'];
    }
}

export function getQuickSuggestions(): { label: string; icon: string; query: string }[] {
    return [
        { label: 'Search Products', icon: '🔍', query: 'Show me your best products' },
        { label: 'Track Order', icon: '📦', query: 'Track my order' },
        { label: 'Garage Services', icon: '🔧', query: 'What garage services do you offer?' },
        { label: 'FAQs', icon: '❓', query: 'Show me frequently asked questions' },
        { label: 'Contact Info', icon: '📞', query: 'How can I contact you?' },
        { label: 'Shipping Info', icon: '🚚', query: 'What is your shipping policy?' },
    ];
}
export { };
