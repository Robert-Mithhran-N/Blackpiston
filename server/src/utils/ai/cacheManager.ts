// ============================================================
// AI Cache Manager — Modular Memory & Future Redis Support
// ============================================================

export interface ICache<T = any> {
    get(key: string): Promise<T | undefined>;
    set(key: string, value: T, ttlSeconds?: number): Promise<void>;
    del(key: string): Promise<void>;
    clear(): Promise<void>;
    getSize(): Promise<number>;
}

interface CacheEntry<T> {
    value: T;
    expiresAt: number;
}

// ── Local Memory Cache (LRU-like with TTL) ──
export class LocalMemoryCache<T = any> implements ICache<T> {
    private cache = new Map<string, CacheEntry<T>>();
    private maxSize: number;
    private defaultTtlMs: number;

    constructor(maxSize: number = 200, defaultTtlSeconds: number = 300) {
        this.maxSize = maxSize;
        this.defaultTtlMs = defaultTtlSeconds * 1000;
    }

    async get(key: string): Promise<T | undefined> {
        const entry = this.cache.get(key);
        if (!entry) return undefined;

        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return undefined;
        }

        // Move to end (MRU)
        this.cache.delete(key);
        this.cache.set(key, entry);
        return entry.value;
    }

    async set(key: string, value: T, ttlSeconds?: number): Promise<void> {
        // Evict oldest if at capacity
        if (this.cache.size >= this.maxSize) {
            const oldestKey = this.cache.keys().next().value;
            if (oldestKey) this.cache.delete(oldestKey);
        }

        const ttl = ttlSeconds ? ttlSeconds * 1000 : this.defaultTtlMs;
        this.cache.set(key, {
            value,
            expiresAt: Date.now() + ttl,
        });
    }

    async del(key: string): Promise<void> {
        this.cache.delete(key);
    }

    async clear(): Promise<void> {
        this.cache.clear();
    }

    async getSize(): Promise<number> {
        return this.cache.size;
    }

    /** Prunes expired entries (can be run periodically) */
    prune(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiresAt) {
                this.cache.delete(key);
            }
        }
    }
}

// ── Redis Cache Stub (Ready for Production Horizontal Scaling) ──
export class RedisCacheStub<T = any> implements ICache<T> {
    private memoryFallback: LocalMemoryCache<T>;
    private providerName = 'Redis (Future-Ready Stub)';

    constructor(maxSize: number = 200, defaultTtlSeconds: number = 300) {
        this.memoryFallback = new LocalMemoryCache<T>(maxSize, defaultTtlSeconds);
        console.log(`[Cache] RedisCache initialized using Memory Fallback. Update env to point to a real Redis server.`);
    }

    async get(key: string): Promise<T | undefined> {
        // Future production integration:
        // return this.redisClient.get(key);
        return this.memoryFallback.get(key);
    }

    async set(key: string, value: T, ttlSeconds?: number): Promise<void> {
        // Future production integration:
        // await this.redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
        await this.memoryFallback.set(key, value, ttlSeconds);
    }

    async del(key: string): Promise<void> {
        await this.memoryFallback.del(key);
    }

    async clear(): Promise<void> {
        await this.memoryFallback.clear();
    }

    async getSize(): Promise<number> {
        return this.memoryFallback.getSize();
    }
}

// ── Factory to support dynamic Cache Provider switching ──
const CACHE_PROVIDER = process.env.CACHE_PROVIDER || 'memory';

function createCacheInstance<T>(maxSize: number, ttlSeconds: number): ICache<T> {
    if (CACHE_PROVIDER === 'redis') {
        return new RedisCacheStub<T>(maxSize, ttlSeconds);
    }
    return new LocalMemoryCache<T>(maxSize, ttlSeconds);
}

// ── Dedicated Cache Instances ──

/** FAQ cache: stores resolved FAQ messages (1 hr TTL) */
export const faqCache = createCacheInstance<string>(100, 3600);

/** Policy cache: stores policy texts (1 hr TTL) */
export const policyCache = createCacheInstance<string>(50, 3600);

/** Store Info cache: timings, address, contacts (30 min TTL) */
export const storeInfoCache = createCacheInstance<string>(20, 1800);

/** Product search results: stores queries -> products array (5 min TTL) */
export const productSearchCache = createCacheInstance<any[]>(100, 300);

/** Settings cache: store settings configurations (30 min TTL) */
export const settingsCache = createCacheInstance<any>(20, 1800);

/** Conversation cache: stores user history messages to bypass DB queries (10 min TTL) */
export const conversationCache = createCacheInstance<any>(500, 600);

// ── Helpers ──

export function generateCacheKey(prefix: string, message: string): string {
    const normalized = message
        .toLowerCase()
        .trim()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ');
    return `${prefix}:${normalized}`;
}

// ── Invalidation Hooks ──

export async function invalidateProducts(): Promise<void> {
    console.log('[Cache Invalidation] Clearing Product Search Cache');
    await productSearchCache.clear();
}

export async function invalidateServices(): Promise<void> {
    console.log('[Cache Invalidation] Clearing Services Cache');
    // Services are loaded context-wise, we can clear search caches or any service-specific caches
}

export async function invalidateSettings(): Promise<void> {
    console.log('[Cache Invalidation] Clearing Store Info and Settings Caches');
    await storeInfoCache.clear();
    await settingsCache.clear();
}

export async function invalidateKnowledge(): Promise<void> {
    console.log('[Cache Invalidation] Clearing FAQ and Policy Caches');
    await faqCache.clear();
    await policyCache.clear();
}

export async function invalidateConversations(sessionId?: string): Promise<void> {
    if (sessionId) {
        console.log(`[Cache Invalidation] Clearing Conversation Cache for session: ${sessionId}`);
        await conversationCache.del(sessionId);
    } else {
        console.log('[Cache Invalidation] Clearing All Conversation Caches');
        await conversationCache.clear();
    }
}

export async function invalidateAll(): Promise<void> {
    console.log('[Cache Invalidation] Clearing All Caches');
    await Promise.all([
        faqCache.clear(),
        policyCache.clear(),
        storeInfoCache.clear(),
        productSearchCache.clear(),
        settingsCache.clear(),
        conversationCache.clear()
    ]);
}
