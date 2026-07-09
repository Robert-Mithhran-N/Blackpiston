// ============================================================
// AI Service — Intent Classification, Data Fetching, Response Generation
// ============================================================

import { GoogleGenAI, Type } from '@google/genai';
import prisma from '../config/database.js';
import {
    faqCache,
    policyCache,
    storeInfoCache,
    productSearchCache,
    generateCacheKey,
} from './aiCache.js';

// ============================================================
// Types
// ============================================================

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

// ============================================================
// Gemini Client (Singleton)
// ============================================================

let aiClient: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
    if (!aiClient) {
        const key = process.env.GEMINI_API_KEY;
        if (!key) throw new Error('GEMINI_API_KEY is not configured');
        aiClient = new GoogleGenAI({ apiKey: key });
    }
    return aiClient;
}

// ============================================================
// System Prompt — HARDCODED GUARDRAILS (never editable by AI)
// ============================================================

const SYSTEM_PROMPT = `You are BlackPiston AI, the official assistant for BlackPiston Garage — an Indian motorcycle accessories, gear, and garage services store.

STRICT RULES YOU MUST ALWAYS FOLLOW:
1. ONLY answer about BlackPiston Garage: products, services, policies, orders, and shopping guidance.
2. ONLY use the context data provided. NEVER invent products, prices, stock status, or any information not in the context.
3. NEVER reveal API keys, credentials, database details, server configuration, source code, internal routes, or any system internals.
4. NEVER share other users' data, admin data, financial reports, supplier pricing, purchase costs, or employee information.
5. If asked about ANYTHING outside BlackPiston business (politics, general knowledge, coding, etc.), respond: "I'm BlackPiston AI — I can only help with BlackPiston Garage products, services, and orders. How can I assist you with your motorcycle gear?"
6. If asked about confidential/system information, respond: "I'm unable to provide confidential system information. I can help you with products, services, or orders!"
7. Always respond in a helpful, professional, and friendly tone.
8. Format product recommendations clearly with name, brand, price (in ₹), and key features.
9. All prices are in Indian Rupees (₹).
10. When comparing products, create a clear comparison highlighting differences.
11. If a product is out of stock, mention it clearly.
12. If no products match the query, say so honestly — never fabricate results.
13. Keep responses concise but informative. Use bullet points for lists.
14. When showing prices, if there's an offer price, show both: ~~₹MRP~~ ₹OfferPrice.

CONTEXT DATA FORMAT:
You will receive context data in JSON format. Use ONLY this data to answer.
If context is empty or missing for a query, say you couldn't find matching information and suggest alternatives.`;

// ============================================================
// Intent Classification — Keyword-first, Gemini fallback
// ============================================================

// Keyword maps for cheap intent detection (avoids Gemini call ~70% of the time)
const INTENT_KEYWORDS: Record<AiIntent, string[]> = {
    GREETING: ['hi', 'hello', 'hey', 'good morning', 'good evening', 'good afternoon', 'howdy', 'sup', 'namaste', 'vanakkam'],
    PRODUCT_SEARCH: ['suggest', 'recommend', 'find', 'search', 'show', 'looking for', 'need', 'want', 'best', 'top', 'budget', 'under', 'below', 'affordable', 'cheap', 'premium'],
    PRODUCT_DETAILS: ['details', 'specifications', 'specs', 'material', 'weight', 'warranty', 'waterproof', 'fit', 'included', 'box contents', 'manufacturer', 'dimensions'],
    PRODUCT_COMPARE: ['compare', 'vs', 'versus', 'better', 'difference', 'which one', 'comparison'],
    SERVICE_INFO: ['garage', 'service', 'ecu', 'tuning', 'install', 'exhaust install', 'throttle body', 'ceramic coating', 'maintenance', 'repair', 'wash', 'detailing', 'how long', 'duration', 'benefits'],
    ORDER_TRACKING: ['track', 'order', 'shipping status', 'delivery', 'where is my', 'order status', 'payment status', 'cancel order', 'return', 'refund status', 'my order'],
    POLICY: ['policy', 'privacy', 'terms', 'conditions', 'refund', 'return policy', 'shipping policy', 'warranty policy'],
    FAQ: ['faq', 'frequently', 'how do', 'do you', 'can i', 'is there', 'accept', 'payment method', 'cod', 'cash on delivery'],
    STORE_INFO: ['contact', 'phone', 'email', 'whatsapp', 'location', 'address', 'hours', 'timing', 'open', 'close', 'business hours', 'store'],
    RECOMMENDATION: ['budget', 'beginner', 'touring', 'sports', 'recommend for', 'accessories for', 'gear for', 'riding gear', 'rain', 'city riding', 'long ride'],
    CART_HELP: ['cart', 'checkout', 'how to buy', 'how to order', 'payment', 'pay', 'add to cart'],
    BLOCKED: ['api key', 'secret', 'password', 'database', 'mongodb', 'env', 'credential', 'admin panel', 'source code', 'server', 'internal', 'employee', 'supplier cost', 'purchase price'],
};

export function classifyIntentByKeywords(message: string): AiIntent | null {
    const lower = message.toLowerCase().trim();

    // Check BLOCKED first (highest priority)
    for (const keyword of INTENT_KEYWORDS.BLOCKED) {
        if (lower.includes(keyword)) return 'BLOCKED';
    }

    // Score each intent by keyword matches
    const scores: Partial<Record<AiIntent, number>> = {};

    for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS) as [AiIntent, string[]][]) {
        if (intent === 'BLOCKED') continue;
        let score = 0;
        for (const keyword of keywords) {
            if (lower.includes(keyword)) score++;
        }
        if (score > 0) scores[intent] = score;
    }

    if (Object.keys(scores).length === 0) return null; // Ambiguous — needs Gemini

    // Return the highest scoring intent
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);

    // If top two scores are tied, it's ambiguous
    if (sorted.length > 1 && sorted[0][1] === sorted[1][1]) return null;

    return sorted[0][0] as AiIntent;
}

export async function classifyIntentWithGemini(message: string): Promise<AiIntent> {
    const client = getAI();

    const prompt = `Classify the following user message into exactly ONE intent category for a motorcycle accessories e-commerce store.

Categories:
- PRODUCT_SEARCH: Looking for products, browsing, recommendations
- PRODUCT_DETAILS: Asking about specific product specs, features, materials
- PRODUCT_COMPARE: Comparing two or more products
- SERVICE_INFO: Asking about garage services, repairs, installations
- ORDER_TRACKING: Asking about their order status, delivery, returns
- POLICY: Asking about privacy, refund, shipping, terms policies
- FAQ: General frequently asked questions about the store
- STORE_INFO: Asking about contact info, location, business hours
- RECOMMENDATION: Asking for personalized recommendations based on use-case or budget
- CART_HELP: Questions about how to buy, checkout, payment methods
- GREETING: Simple greetings
- BLOCKED: Asking about system internals, credentials, admin info, or non-business topics

User message: "${message}"

Respond with ONLY the category name, nothing else.`;

    try {
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0,
                maxOutputTokens: 20,
            },
        });

        const result = response.text?.trim().toUpperCase().replace(/[^A-Z_]/g, '') || '';
        const validIntents: AiIntent[] = [
            'PRODUCT_SEARCH', 'PRODUCT_DETAILS', 'PRODUCT_COMPARE', 'SERVICE_INFO',
            'ORDER_TRACKING', 'POLICY', 'FAQ', 'STORE_INFO', 'RECOMMENDATION',
            'CART_HELP', 'GREETING', 'BLOCKED',
        ];

        if (validIntents.includes(result as AiIntent)) {
            return result as AiIntent;
        }
        return 'FAQ'; // Default fallback
    } catch (error) {
        console.error('Gemini intent classification error:', error);
        return 'FAQ'; // Safe fallback
    }
}

export async function classifyIntent(message: string): Promise<AiIntent> {
    // Try cheap keyword matching first
    const keywordIntent = classifyIntentByKeywords(message);
    if (keywordIntent) return keywordIntent;

    // Fall back to Gemini for ambiguous messages
    return classifyIntentWithGemini(message);
}

// ============================================================
// Data Fetching — Only approved fields, never raw records
// ============================================================

// Safe product fields — NEVER includes unitCost, supplierId, adminNotes
const SAFE_PRODUCT_SELECT = {
    id: true,
    name: true,
    slug: true,
    brand: true,
    price: true,
    offerPrice: true,
    images: true,
    specifications: true,
    variants: true,
    tags: true,
    tagStrings: true,
    rating: true,
    totalReviews: true,
    inStock: true,
    stockQuantity: true,
    highlights: true,
    shortDescription: true,
    shippingBadgeTitle: true,
    shippingBadgeDesc: true,
    warrantyBadgeTitle: true,
    warrantyBadgeDesc: true,
    returnBadgeTitle: true,
    returnBadgeDesc: true,
    thumbnailUrl: true,
    weight: true,
    dimensions: true,
    deliveryCharge: true,
    sections: {
        select: {
            title: true,
            content: true,
        },
        orderBy: { order: 'asc' as const },
    },
};

// Safe service fields
const SAFE_SERVICE_SELECT = {
    id: true,
    name: true,
    slug: true,
    description: true,
    price: true,
    duration: true,
    category: true,
    image: true,
    highlights: true,
    included: true,
    benefits: true,
    process: true,
    supportedBikes: true,
    status: true,
};

// Safe settings fields — strips razorpay, cod, seo analytics
const SAFE_SETTINGS_SELECT = {
    siteName: true,
    siteTagline: true,
    contactEmail: true,
    supportEmail: true,
    contactPhone: true,
    alternatePhone: true,
    whatsappNumber: true,
    address: true,
    socialLinks: true,
    businessHoursMonday: true,
    businessHoursTuesday: true,
    businessHoursWednesday: true,
    businessHoursThursday: true,
    businessHoursFriday: true,
    businessHoursSaturday: true,
    businessHoursSunday: true,
};

// Safe order fields — for authenticated user's own orders
const SAFE_ORDER_SELECT = {
    id: true,
    orderNumber: true,
    products: true,
    totalAmount: true,
    orderStatus: true,
    paymentStatus: true,
    paymentMethod: true,
    tracking: true,
    statusHistory: true,
    orderedAt: true,
    shippedAt: true,
    deliveredAt: true,
};

/**
 * Extract product search parameters from user message.
 */
function extractSearchParams(message: string): { search?: string; maxPrice?: number; tags?: string[] } {
    const lower = message.toLowerCase();
    const params: { search?: string; maxPrice?: number; tags?: string[] } = {};

    // Extract price constraints
    const priceMatch = lower.match(/(?:under|below|less than|max|upto|up to|within|budget)\s*(?:rs\.?|₹|inr)?\s*(\d[\d,]*)/i);
    if (priceMatch) {
        params.maxPrice = parseInt(priceMatch[1].replace(/,/g, ''));
    }

    // Extract common product category tags
    const categoryKeywords: Record<string, string[]> = {
        'helmet': ['helmet', 'helmets'],
        'exhaust': ['exhaust', 'exhausts', 'silencer'],
        'engine-oil': ['engine oil', 'oil', 'lubricant'],
        'gloves': ['gloves', 'glove', 'riding gloves'],
        'jacket': ['jacket', 'jackets', 'riding jacket'],
        'lights': ['light', 'lights', 'led', 'headlight', 'fog light'],
        'chain-lube': ['chain lube', 'chain', 'chain spray'],
        'ceramic-coating': ['ceramic', 'coating', 'ceramic coating'],
        'rain-gear': ['rain', 'rain gear', 'waterproof'],
    };

    const matchedTags: string[] = [];
    for (const [tag, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(kw => lower.includes(kw))) {
            matchedTags.push(tag);
        }
    }
    if (matchedTags.length > 0) params.tags = matchedTags;

    // Use the whole message as a search term (minus price parts)
    params.search = message
        .replace(/(?:under|below|less than|max|upto|up to|within|budget)\s*(?:rs\.?|₹|inr)?\s*\d[\d,]*/gi, '')
        .replace(/(?:suggest|recommend|find|show|search|looking for|need|want|best|top)\s*/gi, '')
        .trim();

    return params;
}

/**
 * Extract product names for comparison or details queries.
 */
function extractProductNames(message: string): string[] {
    // Try to extract "X vs Y" or "X and Y"
    const vsMatch = message.match(/(.+?)\s+(?:vs\.?|versus|or|and|&)\s+(.+)/i);
    if (vsMatch) {
        return [vsMatch[1].trim(), vsMatch[2].trim()];
    }
    return [message.trim()];
}

export async function fetchContextData(
    intent: AiIntent,
    message: string,
    userId?: string,
): Promise<AiContextData> {
    switch (intent) {
        case 'PRODUCT_SEARCH':
        case 'RECOMMENDATION': {
            const cacheKey = generateCacheKey('product', message);
            const cached = productSearchCache.get(cacheKey);
            if (cached) return { products: cached, type: 'products' };

            const params = extractSearchParams(message);
            const where: any = { isActive: true };

            if (params.maxPrice) {
                where.OR = [
                    { offerPrice: { lte: params.maxPrice } },
                    { AND: [{ offerPrice: null }, { price: { lte: params.maxPrice } }] },
                ];
            }

            if (params.tags && params.tags.length > 0) {
                where.tagStrings = { hasSome: params.tags };
            }

            let products = await prisma.product.findMany({
                where,
                select: SAFE_PRODUCT_SELECT,
                take: 10,
                orderBy: [{ isFeatured: 'desc' }, { rating: 'desc' }],
            });

            // If tag search returned few results, also try text search on name
            if (products.length < 3 && params.search) {
                const textProducts = await prisma.product.findMany({
                    where: {
                        isActive: true,
                        name: { contains: params.search, mode: 'insensitive' },
                        ...(params.maxPrice ? {
                            OR: [
                                { offerPrice: { lte: params.maxPrice } },
                                { AND: [{ offerPrice: null }, { price: { lte: params.maxPrice } }] },
                            ],
                        } : {}),
                    },
                    select: SAFE_PRODUCT_SELECT,
                    take: 10,
                    orderBy: [{ rating: 'desc' }],
                });

                // Merge and deduplicate
                const existingIds = new Set(products.map(p => p.id));
                for (const p of textProducts) {
                    if (!existingIds.has(p.id)) products.push(p);
                }
                products = products.slice(0, 10);
            }

            productSearchCache.set(cacheKey, products);
            return { products, type: 'products' };
        }

        case 'PRODUCT_DETAILS': {
            const names = extractProductNames(message);
            const products = await prisma.product.findMany({
                where: {
                    isActive: true,
                    OR: names.map(name => ({
                        name: { contains: name, mode: 'insensitive' as const },
                    })),
                },
                select: SAFE_PRODUCT_SELECT,
                take: 5,
            });
            return { products, type: 'product_details' };
        }

        case 'PRODUCT_COMPARE': {
            const names = extractProductNames(message);
            const products = await prisma.product.findMany({
                where: {
                    isActive: true,
                    OR: names.map(name => ({
                        name: { contains: name, mode: 'insensitive' as const },
                    })),
                },
                select: SAFE_PRODUCT_SELECT,
                take: 5,
            });
            return { products, type: 'product_compare' };
        }

        case 'SERVICE_INFO': {
            const services = await prisma.service.findMany({
                where: { isActive: true, visible: true, status: { not: 'ARCHIVED' } },
                select: SAFE_SERVICE_SELECT,
                orderBy: [{ featured: 'desc' }, { displayOrder: 'asc' }],
            });
            return { services, type: 'services' };
        }

        case 'FAQ': {
            const cacheKey = generateCacheKey('faq', message);
            const cached = faqCache.get(cacheKey);
            if (cached) return { knowledgeEntries: JSON.parse(cached), type: 'faq' };

            const entries = await prisma.aiKnowledgeBase.findMany({
                where: { category: 'FAQ', isActive: true },
                select: { question: true, answer: true, tags: true, priority: true },
                orderBy: { priority: 'desc' },
            });

            faqCache.set(cacheKey, JSON.stringify(entries));
            return { knowledgeEntries: entries, type: 'faq' };
        }

        case 'POLICY': {
            const cacheKey = generateCacheKey('policy', message);
            const cached = policyCache.get(cacheKey);
            if (cached) return { knowledgeEntries: JSON.parse(cached), type: 'policy' };

            const entries = await prisma.aiKnowledgeBase.findMany({
                where: {
                    category: { in: ['POLICY', 'CUSTOM'] },
                    isActive: true,
                },
                select: { question: true, answer: true, tags: true, priority: true },
                orderBy: { priority: 'desc' },
            });

            policyCache.set(cacheKey, JSON.stringify(entries));
            return { knowledgeEntries: entries, type: 'policy' };
        }

        case 'STORE_INFO': {
            const cacheKey = 'store_info_main';
            const cached = storeInfoCache.get(cacheKey);
            if (cached) return { storeInfo: JSON.parse(cached), type: 'store_info' };

            const settings = await prisma.settings.findFirst({
                select: SAFE_SETTINGS_SELECT,
            });

            // Also get store-info knowledge entries
            const storeEntries = await prisma.aiKnowledgeBase.findMany({
                where: { category: 'STORE_INFO', isActive: true },
                select: { question: true, answer: true },
            });

            const combined = { settings, knowledgeEntries: storeEntries };
            storeInfoCache.set(cacheKey, JSON.stringify(combined));
            return { storeInfo: combined, type: 'store_info' };
        }

        case 'ORDER_TRACKING': {
            if (!userId) {
                return { type: 'auth_required' };
            }

            const orders = await prisma.order.findMany({
                where: { userId },
                select: SAFE_ORDER_SELECT,
                orderBy: { createdAt: 'desc' },
                take: 5,
            });
            return { orders, type: 'orders' };
        }

        case 'CART_HELP':
            return { type: 'cart_help' };

        case 'GREETING':
            return { type: 'greeting' };

        case 'BLOCKED':
            return { type: 'blocked' };

        default:
            return { type: 'unknown' };
    }
}

// ============================================================
// Response Generation — Gemini with context
// ============================================================

export async function generateAiResponse(
    userMessage: string,
    context: AiContextData,
    conversationHistory: AiChatMessage[] = [],
): Promise<AiChatResponse> {

    // Handle static responses without Gemini call
    if (context.type === 'greeting') {
        return {
            message: "👋 Hello! Welcome to BlackPiston Garage. I'm your AI assistant and I can help you with:\n\n• 🛒 Finding motorcycle products & gear\n• 🔧 Garage service information\n• 📦 Order tracking\n• 📋 Policies & FAQs\n• 💬 Product recommendations\n\nWhat would you like to know?",
            intent: 'GREETING',
            suggestions: ['Search products', 'Garage services', 'Track my order', 'FAQs'],
        };
    }

    if (context.type === 'blocked') {
        return {
            message: "I'm unable to provide confidential system information. I can help you with products, services, orders, or policies! 🏍️",
            intent: 'BLOCKED',
            suggestions: ['Search products', 'View services', 'Store contact info'],
        };
    }

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

    // For all other intents, use Gemini to generate a natural response
    const client = getAI();

    // Build context string
    let contextStr = '';
    if (context.products && context.products.length > 0) {
        contextStr += '\n\nMATCHING PRODUCTS:\n' + JSON.stringify(context.products.map(p => ({
            name: p.name,
            brand: p.brand,
            price: p.price,
            offerPrice: p.offerPrice,
            rating: p.rating,
            totalReviews: p.totalReviews,
            inStock: p.inStock,
            highlights: p.highlights?.slice(0, 5),
            shortDescription: p.shortDescription,
            specifications: p.specifications?.slice(0, 8),
            tags: p.tags,
            warrantyBadge: p.warrantyBadgeTitle,
            deliveryCharge: p.deliveryCharge,
        })), null, 0);
    }

    if (context.services && context.services.length > 0) {
        contextStr += '\n\nAVAILABLE SERVICES:\n' + JSON.stringify(context.services.map(s => ({
            name: s.name,
            description: s.description,
            price: s.price,
            duration: s.duration,
            highlights: s.highlights?.slice(0, 5),
            benefits: s.benefits?.slice(0, 5),
            supportedBikes: s.supportedBikes,
            status: s.status,
        })), null, 0);
    }

    if (context.knowledgeEntries && context.knowledgeEntries.length > 0) {
        contextStr += '\n\nKNOWLEDGE BASE:\n' + JSON.stringify(context.knowledgeEntries, null, 0);
    }

    if (context.storeInfo) {
        contextStr += '\n\nSTORE INFORMATION:\n' + JSON.stringify(context.storeInfo, null, 0);
    }

    if (context.orders && context.orders.length > 0) {
        contextStr += '\n\nUSER ORDERS:\n' + JSON.stringify(context.orders.map(o => ({
            orderNumber: o.orderNumber,
            status: o.orderStatus,
            paymentStatus: o.paymentStatus,
            total: o.totalAmount,
            items: o.products?.map((p: any) => ({ name: p.name, qty: p.quantity })),
            tracking: o.tracking,
            orderedAt: o.orderedAt,
            shippedAt: o.shippedAt,
            deliveredAt: o.deliveredAt,
        })), null, 0);
    }

    if (!contextStr) {
        contextStr = '\n\nNo matching data found for this query.';
    }

    // Build conversation history (last 5 messages for cost efficiency)
    const recentHistory = conversationHistory.slice(-5);
    const historyStr = recentHistory.length > 0
        ? '\n\nCONVERSATION HISTORY:\n' + recentHistory.map(m =>
            `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
        ).join('\n')
        : '';

    const fullPrompt = `${SYSTEM_PROMPT}${historyStr}

CONTEXT DATA:${contextStr}

USER'S CURRENT QUESTION: ${userMessage}

Respond naturally and helpfully using ONLY the context data provided. If the context is empty or has no matching results, say so honestly.`;

    try {
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
                temperature: 0.7,
                maxOutputTokens: 1024,
            },
        });

        const aiMessage = response.text || "I'm sorry, I couldn't process your request. Please try again.";

        // Build structured response
        const result: AiChatResponse = {
            message: aiMessage,
            intent: context.type as AiIntent,
        };

        // Attach structured data for frontend rendering
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

        // Generate follow-up suggestions
        result.suggestions = generateSuggestions(context.type);

        return result;
    } catch (error: any) {
        console.error('Gemini response generation error:', error);
        return {
            message: "I'm having trouble processing your request right now. Please try again in a moment. 🔧",
            intent: 'FAQ',
            suggestions: ['Search products', 'Contact support', 'FAQs'],
        };
    }
}

function generateSuggestions(contextType: string): string[] {
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

// ============================================================
// Quick Suggestions for UI
// ============================================================

export function getQuickSuggestions(): { label: string; icon: string; query: string }[] {
    return [
        { label: 'Search Products', icon: '🔍', query: 'Show me your best products' },
        { label: 'Track Order', icon: '📦', query: 'Track my order' },
        { label: 'Garage Services', icon: '🔧', query: 'What garage services do you offer?' },
        { label: 'FAQs', icon: '❓', query: 'Show me your frequently asked questions' },
        { label: 'Contact Info', icon: '📞', query: 'How can I contact you?' },
        { label: 'Shipping Info', icon: '🚚', query: 'What is your shipping policy?' },
    ];
}
