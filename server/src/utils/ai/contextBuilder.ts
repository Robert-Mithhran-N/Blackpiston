// ============================================================
// AI Context Builder — Database Query Optimization & Caching
// ============================================================

import prisma from '../../config/database.js';
import { AiIntent, AiContextData } from './aiService.js';
import {
    productSearchCache,
    faqCache,
    policyCache,
    storeInfoCache,
    generateCacheKey,
} from './cacheManager.js';

// ── Optimized Product Fields for AI Context (Saves ~80% Tokens in General Search) ──
const COMPACT_PRODUCT_SELECT = {
    id: true,
    name: true,
    brand: true,
    price: true,
    offerPrice: true,
    rating: true,
    inStock: true,
    shortDescription: true,
};

const DETAILED_PRODUCT_SELECT = {
    id: true,
    name: true,
    slug: true,
    brand: true,
    price: true,
    offerPrice: true,
    rating: true,
    totalReviews: true,
    inStock: true,
    stockQuantity: true,
    shortDescription: true,
    highlights: true,
    specifications: true,
    deliveryCharge: true,
    warrantyBadgeTitle: true,
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
    benefits: true,
    supportedBikes: true,
    status: true,
};

// Safe settings fields (strips gateway keys and trackers)
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

// Safe order fields
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
};

interface SearchParams {
    search?: string;
    maxPrice?: number;
    tags?: string[];
    limit: number;
}

/**
 * Helper: Extract search params and detect quantity limit constraints (e.g. "top 5 helmets").
 */
export function extractSearchParams(message: string): SearchParams {
    const lower = message.toLowerCase();
    const params: SearchParams = { limit: 10 }; // Default search limit is 10

    // Extract price constraints
    const priceMatch = lower.match(/(?:under|below|less than|max|upto|up to|within|budget)\s*(?:rs\.?|₹|inr)?\s*(\d[\d,]*)/i);
    if (priceMatch) {
        params.maxPrice = parseInt(priceMatch[1].replace(/,/g, ''));
    }

    // Extract quantity limits (top 5, show 3, first 20)
    const limitMatch = lower.match(/(?:top|show|get|limit|first|only|fetch)\s*(\d+)/i);
    if (limitMatch) {
        const val = parseInt(limitMatch[1]);
        if (val > 0 && val <= 20) {
            params.limit = val;
        }
    }

    // Extract common tags
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

    // Build query search term
    params.search = message
        .replace(/(?:under|below|less than|max|upto|up to|within|budget)\s*(?:rs\.?|₹|inr)?\s*\d[\d,]*/gi, '')
        .replace(/(?:suggest|recommend|find|show|search|looking for|need|want|best|top|first|limit|fetch)\s*\d*/gi, '')
        .trim();

    return params;
}

/**
 * Helper: Extract product names for comparison/details.
 */
export function extractProductNames(message: string): string[] {
    const vsMatch = message.match(/(.+?)\s+(?:vs\.?|versus|or|and|&)\s+(.+)/i);
    if (vsMatch) {
        return [vsMatch[1].trim(), vsMatch[2].trim()];
    }
    return [message.trim()];
}

/**
 * Main context gatherer with optimized select fields, DB index usage, and caching.
 */
export async function buildContextData(
    intent: AiIntent,
    message: string,
    userId?: string
): Promise<AiContextData> {
    switch (intent) {
        case 'PRODUCT_SEARCH':
        case 'RECOMMENDATION': {
            const cacheKey = generateCacheKey('product', message);
            const cached = await productSearchCache.get(cacheKey);
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

            // Perform initial tag-based lookup (compact fields to save tokens)
            let products = await prisma.product.findMany({
                where,
                select: COMPACT_PRODUCT_SELECT,
                take: params.limit,
                orderBy: [{ isFeatured: 'desc' }, { rating: 'desc' }],
            });

            // If few results, do textual search on Name (compact fields)
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
                    select: COMPACT_PRODUCT_SELECT,
                    take: params.limit,
                    orderBy: [{ rating: 'desc' }],
                });

                // Deduplicate items
                const existingIds = new Set(products.map(p => p.id));
                for (const p of textProducts) {
                    if (!existingIds.has(p.id)) products.push(p);
                }
                products = products.slice(0, params.limit);
            }

            await productSearchCache.set(cacheKey, products);
            return { products, type: 'products' };
        }

        case 'PRODUCT_DETAILS': {
            const names = extractProductNames(message);
            // Fetch detailed information (including specs, highlights) because details are needed
            const products = await prisma.product.findMany({
                where: {
                    isActive: true,
                    OR: names.map(name => ({
                        name: { contains: name, mode: 'insensitive' as const },
                    })),
                },
                select: DETAILED_PRODUCT_SELECT,
                take: 5,
            });
            return { products, type: 'product_details' };
        }

        case 'PRODUCT_COMPARE': {
            const names = extractProductNames(message);
            // Compare needs detailed parameters
            const products = await prisma.product.findMany({
                where: {
                    isActive: true,
                    OR: names.map(name => ({
                        name: { contains: name, mode: 'insensitive' as const },
                    })),
                },
                select: DETAILED_PRODUCT_SELECT,
                take: 5,
            });
            return { products, type: 'product_compare' };
        }

        case 'SERVICE_INFO': {
            // Service listings are cached or queried
            const services = await prisma.service.findMany({
                where: { isActive: true, visible: true, status: { not: 'ARCHIVED' } },
                select: SAFE_SERVICE_SELECT,
                orderBy: [{ featured: 'desc' }, { displayOrder: 'asc' }],
            });
            return { services, type: 'services' };
        }

        case 'FAQ': {
            const cacheKey = generateCacheKey('faq', message);
            const cached = await faqCache.get(cacheKey);
            if (cached) return { knowledgeEntries: JSON.parse(cached), type: 'faq' };

            const entries = await prisma.aiKnowledgeBase.findMany({
                where: { category: 'FAQ', isActive: true },
                select: { question: true, answer: true, tags: true, priority: true },
                orderBy: { priority: 'desc' },
            });

            await faqCache.set(cacheKey, JSON.stringify(entries));
            return { knowledgeEntries: entries, type: 'faq' };
        }

        case 'POLICY': {
            const cacheKey = generateCacheKey('policy', message);
            const cached = await policyCache.get(cacheKey);
            if (cached) return { knowledgeEntries: JSON.parse(cached), type: 'policy' };

            const entries = await prisma.aiKnowledgeBase.findMany({
                where: {
                    category: { in: ['POLICY', 'CUSTOM'] },
                    isActive: true,
                },
                select: { question: true, answer: true, tags: true, priority: true },
                orderBy: { priority: 'desc' },
            });

            await policyCache.set(cacheKey, JSON.stringify(entries));
            return { knowledgeEntries: entries, type: 'policy' };
        }

        case 'STORE_INFO': {
            const cacheKey = 'store_info_main';
            const cached = await storeInfoCache.get(cacheKey);
            if (cached) return { storeInfo: JSON.parse(cached), type: 'store_info' };

            const settings = await prisma.settings.findFirst({
                select: SAFE_SETTINGS_SELECT,
            });

            const storeEntries = await prisma.aiKnowledgeBase.findMany({
                where: { category: 'STORE_INFO', isActive: true },
                select: { question: true, answer: true },
            });

            const combined = { settings, knowledgeEntries: storeEntries };
            await storeInfoCache.set(cacheKey, JSON.stringify(combined));
            return { storeInfo: combined, type: 'store_info' };
        }

        case 'ORDER_TRACKING': {
            if (!userId) return { type: 'auth_required' };

            // Fetch the user's latest 5 orders with safe fields
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
