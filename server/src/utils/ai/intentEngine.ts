// ============================================================
// AI Intent Engine — Hybrid Regex, Keywords & Gemini Fallback
// ============================================================

import { GoogleGenAI } from '@google/genai';
import { AiIntent } from './aiService.js';
import prisma from '../../config/database.js';
import {
    storeInfoCache,
    policyCache,
    faqCache,
    generateCacheKey,
} from './cacheManager.js';

// Gemini client getter (will be shared/modularized)
let client: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
    if (!client) {
        const key = process.env.GEMINI_API_KEY;
        if (!key) throw new Error('GEMINI_API_KEY is not configured');
        client = new GoogleGenAI({ apiKey: key });
    }
    return client;
}

export interface StaticResponse {
    isStatic: boolean;
    intent: AiIntent;
    message: string;
    suggestions: string[];
}

// ── Regex Patterns for Cheap Intent Matching ──
const INTENT_PATTERNS = {
    GREETING: /\b(hi|hello|hey|good\s*(morning|evening|afternoon)|namaste|vanakkam|sup|howdy|yo)\b/i,
    THANK_YOU: /\b(thanks|thank\s*you|thank\s*s|appreciate|grateful|helpful)\b/i,
    GOODBYE: /\b(bye|goodbye|see\s*you|talk\s*later|farewell|exit|quit)\b/i,
    HELP_MENU: /\b(help|menu|options|features|what\s*can\s*you\s*do|capabilities)\b/i,
    STORE_TIMINGS: /\b(timing|hours|open|close|business\s*hours|working\s*hours|garage\s*timings)\b/i,
    ADDRESS: /\b(address|location|where\s*(are\s*you|is\s*your\s*store|is\s*the\s*garage|located)|directions|map|place)\b/i,
    CONTACT: /\b(contact|phone|email|support|call|number|reach|customer\s*care|helpdesk)\b/i,
    WHATSAPP: /\b(whatsapp|wa\.me|text\s*on\s*whatsapp|whatsapp\s*number)\b/i,
    SHIPPING_POLICY: /\b(shipping\s*policy|shipping|delivery\s*charges|delivery\s*time|how\s*long\s*to\s*deliver|dispatch)\b/i,
    REFUND_POLICY: /\b(refund\s*policy|refund|return|exchange|cancel\s*order|cancellation|money\s*back)\b/i,
    PRIVACY_POLICY: /\b(privacy\s*policy|privacy|personal\s*data|data\s*protection)\b/i,
    TERMS: /\b(terms\s*and\s*conditions|terms|t&c|user\s*agreement|legal)\b/i,
    WARRANTY: /\b(warranty\s*policy|warranty|guarantee|claim\s*warranty|warranty\s*period)\b/i,
};

// ── Keyword Maps for Fallback Keyword Matcher ──
const INTENT_KEYWORDS: Record<AiIntent, string[]> = {
    GREETING: ['hi', 'hello', 'hey', 'good morning', 'good evening', 'good afternoon', 'namaste'],
    PRODUCT_SEARCH: ['suggest', 'recommend', 'find', 'search', 'show', 'looking for', 'need', 'want', 'best', 'top', 'budget', 'under', 'below', 'affordable', 'cheap', 'premium'],
    PRODUCT_DETAILS: ['details', 'specifications', 'specs', 'material', 'weight', 'warranty', 'waterproof', 'fit', 'box contents', 'dimensions'],
    PRODUCT_COMPARE: ['compare', 'vs', 'versus', 'better', 'difference', 'which one', 'comparison'],
    SERVICE_INFO: ['garage', 'service', 'ecu', 'tuning', 'install', 'exhaust install', 'throttle body', 'ceramic coating', 'maintenance', 'repair', 'wash', 'detailing'],
    ORDER_TRACKING: ['track', 'order', 'shipping status', 'delivery', 'where is my', 'order status', 'return', 'refund status'],
    POLICY: ['policy', 'privacy', 'terms', 'conditions', 'refund', 'return policy', 'shipping policy', 'warranty policy'],
    FAQ: ['faq', 'frequently', 'how do', 'do you', 'can i', 'is there', 'accept', 'payment method', 'cod', 'cash on delivery'],
    STORE_INFO: ['contact', 'phone', 'email', 'whatsapp', 'location', 'address', 'hours', 'timing', 'store'],
    RECOMMENDATION: ['budget', 'beginner', 'touring', 'sports', 'recommend for', 'accessories for', 'gear for', 'riding gear'],
    CART_HELP: ['cart', 'checkout', 'how to buy', 'how to order', 'payment', 'pay', 'add to cart'],
    BLOCKED: ['api key', 'secret', 'password', 'database', 'mongodb', 'env', 'credential', 'admin panel', 'source code', 'server', 'internal', 'employee', 'supplier cost'],
};

/**
 * Classify intent using regex and keyword rules. Fast, 0-cost fallback.
 */
export function classifyIntentByRules(message: string): AiIntent | null {
    const lower = message.toLowerCase().trim();

    // Check BLOCKED first
    for (const keyword of INTENT_KEYWORDS.BLOCKED) {
        if (lower.includes(keyword)) return 'BLOCKED';
    }

    // 1. Regex Exact Pattern matches (high precision)
    if (INTENT_PATTERNS.GREETING.test(lower)) return 'GREETING';
    if (INTENT_PATTERNS.THANK_YOU.test(lower)) return 'FAQ'; // Treat thank you under FAQ/GREETING
    if (INTENT_PATTERNS.GOODBYE.test(lower)) return 'FAQ';
    if (INTENT_PATTERNS.HELP_MENU.test(lower)) return 'FAQ';
    
    // Store Info & Policies
    if (INTENT_PATTERNS.STORE_TIMINGS.test(lower)) return 'STORE_INFO';
    if (INTENT_PATTERNS.ADDRESS.test(lower)) return 'STORE_INFO';
    if (INTENT_PATTERNS.CONTACT.test(lower)) return 'STORE_INFO';
    if (INTENT_PATTERNS.WHATSAPP.test(lower)) return 'STORE_INFO';
    
    if (INTENT_PATTERNS.SHIPPING_POLICY.test(lower)) return 'POLICY';
    if (INTENT_PATTERNS.REFUND_POLICY.test(lower)) return 'POLICY';
    if (INTENT_PATTERNS.PRIVACY_POLICY.test(lower)) return 'POLICY';
    if (INTENT_PATTERNS.TERMS.test(lower)) return 'POLICY';
    if (INTENT_PATTERNS.WARRANTY.test(lower)) return 'POLICY';

    // 2. Keyword scoring
    const scores: Partial<Record<AiIntent, number>> = {};
    for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS) as [AiIntent, string[]][]) {
        if (intent === 'BLOCKED') continue;
        let score = 0;
        for (const keyword of keywords) {
            if (lower.includes(keyword)) score++;
        }
        if (score > 0) scores[intent] = score;
    }

    if (Object.keys(scores).length === 0) return null;

    const sorted = Object.entries(scores).sort((a, b) => (b[1] as number) - (a[1] as number));
    if (sorted.length > 1 && sorted[0][1] === sorted[1][1]) return null; // Tied -> ambiguous

    return sorted[0][0] as AiIntent;
}

/**
 * Call Gemini to classify intent when rule-matching is ambiguous.
 */
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
        return 'FAQ';
    } catch (error) {
        console.error('[Intent Engine] Gemini classification error:', error);
        return 'FAQ';
    }
}

/**
 * Resolve direct static or cached replies without calling Gemini.
 */
export async function tryResolveStaticResponse(
    message: string,
    intent: AiIntent
): Promise<StaticResponse | null> {
    const lower = message.toLowerCase().trim();

    // 1. Basic Greetings
    if (intent === 'GREETING' || INTENT_PATTERNS.GREETING.test(lower)) {
        return {
            isStatic: true,
            intent: 'GREETING',
            message: "👋 Hello! Welcome to BlackPiston Garage. I'm your AI assistant and I can help you with:\n\n• 🛒 Finding motorcycle products & gear\n• 🔧 Garage service information\n• 📦 Order tracking\n• 📋 Policies & FAQs\n• 💬 Product recommendations\n\nWhat would you like to know?",
            suggestions: ['Search products', 'Garage services', 'Track my order', 'FAQs'],
        };
    }

    // 2. Thank You messages
    if (INTENT_PATTERNS.THANK_YOU.test(lower)) {
        return {
            isStatic: true,
            intent: 'FAQ',
            message: "You're very welcome! 😊 Always happy to help. Let me know if you need anything else for your motorcycle gear or garage services!",
            suggestions: ['Search products', 'Garage services', 'Store address'],
        };
    }

    // 3. Goodbyes
    if (INTENT_PATTERNS.GOODBYE.test(lower)) {
        return {
            isStatic: true,
            intent: 'FAQ',
            message: "Goodbye! 🏍️ Ride safe and have a great day ahead! Hope to see you again at BlackPiston Garage soon.",
            suggestions: ['Search products', 'View services'],
        };
    }

    // 4. Help Menu
    if (INTENT_PATTERNS.HELP_MENU.test(lower)) {
        return {
            isStatic: true,
            intent: 'FAQ',
            message: "I am the BlackPiston AI assistant. Here is a menu of things I can help you with:\n\n• 🛒 **Browse Products**: Ask things like 'show me helmets under 5000' or 'recommend engine oil'.\n• 🔧 **Garage Services**: Ask about tuning, ceramic coating, throttle body cleaning, etc.\n• 📦 **Track Orders**: Check order status (requires login).\n• 📋 **Store Policies**: Get details on shipping, returns, warranty, and privacy.\n• 📞 **Contact Info**: Access store address, timings, email, and WhatsApp support.",
            suggestions: ['Helmets under ₹5000', 'Garage services', 'Contact details'],
        };
    }

    // 5. Store Information (Timings, Address, Contact, WhatsApp)
    if (intent === 'STORE_INFO') {
        const storeData = await getCachedStoreInfo();
        const settings = storeData?.settings;
        const knowledgeEntries = storeData?.knowledgeEntries || [];

        if (INTENT_PATTERNS.STORE_TIMINGS.test(lower)) {
            const monClose = settings?.businessHoursMonday?.close || '8:00 PM';
            const monOpen = settings?.businessHoursMonday?.open || '9:00 AM';
            const timingMsg = `🔧 **BlackPiston Garage Timing**:\n\n` +
                `• Monday - Saturday: ${monOpen} - ${monClose}\n` +
                `• Sunday: ${settings?.businessHoursSunday?.open || 'Closed'} ${settings?.businessHoursSunday?.close ? `- ${settings.businessHoursSunday.close}` : ''}\n\n` +
                `Stop by for premium motorcycle services!`;
            return {
                isStatic: true,
                intent: 'STORE_INFO',
                message: timingMsg,
                suggestions: ['Store address', 'Garage services', 'Contact support'],
            };
        }

        if (INTENT_PATTERNS.ADDRESS.test(lower)) {
            const addr = settings?.address;
            const addressStr = addr
                ? `${addr.street || ''}, ${addr.city || ''}, ${addr.state || ''} - ${addr.pincode || ''}`
                : "BlackPiston Garage, Bangalore, India";
            return {
                isStatic: true,
                intent: 'STORE_INFO',
                message: `📍 **Our Location**:\n\n${addressStr}\n\nCome visit our workshop for installations, ECU tuning, and gear fitting!`,
                suggestions: ['Garage timings', 'Book service', 'Contact details'],
            };
        }

        if (INTENT_PATTERNS.WHATSAPP.test(lower)) {
            const wa = settings?.whatsappNumber || 'N/A';
            return {
                isStatic: true,
                intent: 'STORE_INFO',
                message: `💬 **WhatsApp Support**:\n\nYou can chat with us on WhatsApp at: **${wa}**.\nClick here to text us: [WhatsApp Chat](https://wa.me/${wa.replace(/[^0-9]/g, '')})`,
                suggestions: ['Store timings', 'Contact email', 'Search products'],
            };
        }

        if (INTENT_PATTERNS.CONTACT.test(lower)) {
            const phone = settings?.contactPhone || 'N/A';
            const email = settings?.supportEmail || settings?.contactEmail || 'support@blackpistongarage.com';
            const wa = settings?.whatsappNumber || 'N/A';
            return {
                isStatic: true,
                intent: 'STORE_INFO',
                message: `📞 **Contact BlackPiston Garage**:\n\n• **Phone**: ${phone}\n• **WhatsApp**: ${wa}\n• **Email**: ${email}\n\nWe're here to help with your orders and service bookings!`,
                suggestions: ['Store timings', 'Store address', 'Garage services'],
            };
        }
    }

    // 6. Policy Questions (Shipping, Refund, Privacy, Terms, Warranty)
    if (intent === 'POLICY') {
        const policyEntries = await getCachedPolicies();
        let matchedPolicy: any = null;

        if (INTENT_PATTERNS.SHIPPING_POLICY.test(lower)) {
            matchedPolicy = policyEntries.find((p: any) => p.tags.some((t: string) => t.toLowerCase().includes('shipping')));
        } else if (INTENT_PATTERNS.REFUND_POLICY.test(lower)) {
            matchedPolicy = policyEntries.find((p: any) => p.tags.some((t: string) => t.toLowerCase().includes('refund') || t.toLowerCase().includes('return')));
        } else if (INTENT_PATTERNS.PRIVACY_POLICY.test(lower)) {
            matchedPolicy = policyEntries.find((p: any) => p.tags.some((t: string) => t.toLowerCase().includes('privacy')));
        } else if (INTENT_PATTERNS.TERMS.test(lower)) {
            matchedPolicy = policyEntries.find((p: any) => p.tags.some((t: string) => t.toLowerCase().includes('terms') || t.toLowerCase().includes('condition')));
        } else if (INTENT_PATTERNS.WARRANTY.test(lower)) {
            matchedPolicy = policyEntries.find((p: any) => p.tags.some((t: string) => t.toLowerCase().includes('warranty')));
        }

        if (matchedPolicy) {
            return {
                isStatic: true,
                intent: 'POLICY',
                message: `📋 **${matchedPolicy.question}**:\n\n${matchedPolicy.answer}`,
                suggestions: ['Refund policy', 'Shipping info', 'Contact us'],
            };
        }
    }

    // 7. FAQ Matching (Simple exact/partial question match)
    if (intent === 'FAQ') {
        const faqs = await getCachedFaqs();
        // Check if query matches any FAQ tags or has strong overlap
        const matchedFaq = faqs.find((faq: any) => {
            const q = faq.question.toLowerCase();
            return lower.includes(q) || q.includes(lower) || faq.tags.some((t: string) => lower.includes(t.toLowerCase()));
        });

        if (matchedFaq) {
            return {
                isStatic: true,
                intent: 'FAQ',
                message: `❓ **${matchedFaq.question}**:\n\n${matchedFaq.answer}`,
                suggestions: ['Search products', 'Contact support', 'FAQs'],
            };
        }
    }

    return null; // Not static - needs reasoning
}

// ── In-Memory Cache Fetchers with Database Fallback ──

async function getCachedStoreInfo(): Promise<any> {
    const cacheKey = 'store_info_main';
    const cached = await storeInfoCache.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const settings = await prisma.settings.findFirst();
    const storeEntries = await prisma.aiKnowledgeBase.findMany({
        where: { category: 'STORE_INFO', isActive: true },
        select: { question: true, answer: true },
    });

    const combined = { settings, knowledgeEntries: storeEntries };
    await storeInfoCache.set(cacheKey, JSON.stringify(combined));
    return combined;
}

async function getCachedPolicies(): Promise<any[]> {
    const cacheKey = 'policies_all';
    const cached = await policyCache.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const entries = await prisma.aiKnowledgeBase.findMany({
        where: { category: { in: ['POLICY', 'CUSTOM'] }, isActive: true },
        select: { question: true, answer: true, tags: true, priority: true },
        orderBy: { priority: 'desc' },
    });

    await policyCache.set(cacheKey, JSON.stringify(entries));
    return entries;
}

async function getCachedFaqs(): Promise<any[]> {
    const cacheKey = 'faqs_all';
    const cached = await faqCache.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const entries = await prisma.aiKnowledgeBase.findMany({
        where: { category: 'FAQ', isActive: true },
        select: { question: true, answer: true, tags: true, priority: true },
        orderBy: { priority: 'desc' },
    });

    await faqCache.set(cacheKey, JSON.stringify(entries));
    return entries;
}
