// ============================================================
// AI Response Cache — Simple LRU with TTL
// ============================================================

interface CacheEntry<T> {
    value: T;
    expiresAt: number;
}

export class AiCache<T = any> {
    private cache = new Map<string, CacheEntry<T>>();
    private maxSize: number;
    private defaultTtlMs: number;

    constructor(maxSize: number = 200, defaultTtlSeconds: number = 300) {
        this.maxSize = maxSize;
        this.defaultTtlMs = defaultTtlSeconds * 1000;
    }

    /**
     * Get a cached value. Returns undefined if not found or expired.
     */
    get(key: string): T | undefined {
        const entry = this.cache.get(key);
        if (!entry) return undefined;

        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return undefined;
        }

        // Move to end (most recently used)
        this.cache.delete(key);
        this.cache.set(key, entry);
        return entry.value;
    }

    /**
     * Set a cached value with optional custom TTL.
     */
    set(key: string, value: T, ttlSeconds?: number): void {
        // Evict oldest if at capacity
        if (this.cache.size >= this.maxSize) {
            const oldestKey = this.cache.keys().next().value;
            if (oldestKey) this.cache.delete(oldestKey);
        }

        this.cache.set(key, {
            value,
            expiresAt: Date.now() + (ttlSeconds ? ttlSeconds * 1000 : this.defaultTtlMs),
        });
    }

    /**
     * Check if a key exists and is not expired.
     */
    has(key: string): boolean {
        return this.get(key) !== undefined;
    }

    /**
     * Clear all cached entries.
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Remove expired entries.
     */
    prune(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiresAt) {
                this.cache.delete(key);
            }
        }
    }

    get size(): number {
        return this.cache.size;
    }
}

// ── Shared cache instances ──

/** FAQ responses — 1 hour TTL */
export const faqCache = new AiCache<string>(100, 3600);

/** Policy responses — 1 hour TTL */
export const policyCache = new AiCache<string>(50, 3600);

/** Store info responses — 30 min TTL */
export const storeInfoCache = new AiCache<string>(20, 1800);

/** Product search results — 5 min TTL */
export const productSearchCache = new AiCache<any>(100, 300);

/**
 * Generate a cache key from a message by normalizing it.
 */
export function generateCacheKey(prefix: string, message: string): string {
    const normalized = message
        .toLowerCase()
        .trim()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ');
    return `${prefix}:${normalized}`;
}
