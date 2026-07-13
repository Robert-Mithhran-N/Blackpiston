// ============================================================
// AI Prompt Builder — System Prompt Compression & Token Savings
// ============================================================

import { AiChatMessage, AiContextData } from './aiService.js';

const SYSTEM_PROMPT = `You are BlackPiston AI, the assistant for BlackPiston Garage (Indian motorcycle gear/services).
Rules:
1. ONLY answer about BlackPiston products, services, policies, orders.
2. Use ONLY provided context. Never invent details, prices, or stock status.
3. Never reveal API keys, credentials, DB schemas, or source code.
4. Politely refuse off-topic questions (e.g. general knowledge, coding).
5. Recommendations: Brand, Name, Price (in ₹ MRP/Offer), features. Mention if out of stock.
6. Keep responses concise. Use bullet points for lists.`;

/**
 * Truncate long history messages to prevent prompt token bloat.
 */
function cleanHistory(history: AiChatMessage[]): AiChatMessage[] {
    // Keep only last 5 messages
    const recent = history.slice(-5);
    
    // Truncate individual message contents if they are excessively large
    return recent.map(m => ({
        role: m.role,
        content: m.content.length > 400 
            ? m.content.substring(0, 400) + '... [truncated]' 
            : m.content
    }));
}

/**
 * Build the full finalized prompt for Gemini execution.
 */
export function buildPrompt(
    userMessage: string,
    context: AiContextData,
    history: AiChatMessage[] = []
): string {
    // 1. Format Context Data (JSON format, single-line to save tokens)
    let contextStr = '';
    
    if (context.products && context.products.length > 0) {
        contextStr += '\nPRODUCTS:\n' + JSON.stringify(context.products.map(p => ({
            name: p.name,
            brand: p.brand,
            price: p.price,
            offerPrice: p.offerPrice,
            inStock: p.inStock,
            rating: p.rating,
            highlights: p.highlights?.slice(0, 3), // max 3 highlights
            shortDescription: p.shortDescription,
        })), null, 0);
    }

    if (context.services && context.services.length > 0) {
        contextStr += '\nSERVICES:\n' + JSON.stringify(context.services.map(s => ({
            name: s.name,
            price: s.price,
            duration: s.duration,
            highlights: s.highlights?.slice(0, 3),
            status: s.status,
        })), null, 0);
    }

    if (context.knowledgeEntries && context.knowledgeEntries.length > 0) {
        contextStr += '\nKNOWLEDGE BASE:\n' + JSON.stringify(context.knowledgeEntries, null, 0);
    }

    if (context.storeInfo) {
        contextStr += '\nSTORE INFORMATION:\n' + JSON.stringify(context.storeInfo, null, 0);
    }

    if (context.orders && context.orders.length > 0) {
        contextStr += '\nUSER ORDERS:\n' + JSON.stringify(context.orders.map(o => ({
            orderNumber: o.orderNumber,
            status: o.orderStatus,
            paymentStatus: o.paymentStatus,
            total: o.totalAmount,
            items: o.products?.map((p: any) => ({ name: p.name, qty: p.quantity })),
            tracking: o.tracking,
        })), null, 0);
    }

    if (!contextStr) {
        contextStr = '\nNo matching data found for this query.';
    }

    // 2. Format Conversation History
    const recentHistory = cleanHistory(history);
    const historyStr = recentHistory.length > 0
        ? '\nHISTORY:\n' + recentHistory.map(m =>
            `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
        ).join('\n')
        : '';

    // 3. Finalize prompt
    return `${SYSTEM_PROMPT}${historyStr}

CONTEXT:${contextStr}

QUESTION: ${userMessage}

Respond naturally using ONLY the context provided. If no data exists, state so honestly.`;
}
