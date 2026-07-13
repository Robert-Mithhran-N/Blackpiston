// ============================================================
// AI Analytics & Observability — Real-time Metrics and Costs
// ============================================================

export interface MetricsPayload {
    intent: string;
    totalLatencyMs: number;
    dbLatencyMs: number;
    geminiLatencyMs: number;
    inputTokens: number;
    outputTokens: number;
    cacheHit: boolean;
    isStatic: boolean;
    success: boolean;
    errorCode?: string;
}

class AnalyticsService {
    // In-memory counters
    private totalRequests = 0;
    private successfulRequests = 0;
    private failedRequests = 0;
    private rateLimitErrors = 0;
    private cacheHits = 0;
    private cacheMisses = 0;
    
    // Latencies
    private latencyHistory: number[] = [];
    private dbLatencyHistory: number[] = [];
    private geminiLatencyHistory: number[] = [];

    // Tokens & Costs
    private totalInputTokens = 0;
    private totalOutputTokens = 0;
    
    // Gemini 2.5 Flash pricing (estimates per 1M tokens as of 2026: Input $0.075, Output $0.30)
    private INPUT_COST_PER_TOKEN = 0.075 / 1000000;
    private OUTPUT_COST_PER_TOKEN = 0.30 / 1000000;

    // Track common searches / topics
    private intentFrequencies: Record<string, number> = {};
    private searchKeywords: Record<string, number> = {};

    /**
     * Record a chat transaction metrics.
     */
    recordRequest(payload: MetricsPayload): void {
        this.totalRequests++;
        
        if (payload.success) {
            this.successfulRequests++;
        } else {
            this.failedRequests++;
            if (payload.errorCode === 'RATE_LIMIT_EXCEEDED' || payload.errorCode === 'BURST_LIMIT_EXCEEDED') {
                this.rateLimitErrors++;
            }
        }

        if (payload.cacheHit || payload.isStatic) {
            this.cacheHits++;
        } else {
            this.cacheMisses++;
        }

        // Add to historical arrays (keep last 1000 values)
        this.addLatency(this.latencyHistory, payload.totalLatencyMs);
        this.addLatency(this.dbLatencyHistory, payload.dbLatencyMs);
        this.addLatency(this.geminiLatencyHistory, payload.geminiLatencyMs);

        // Tokens
        this.totalInputTokens += payload.inputTokens;
        this.totalOutputTokens += payload.outputTokens;

        // Intent frequencies
        this.intentFrequencies[payload.intent] = (this.intentFrequencies[payload.intent] || 0) + 1;
    }

    /**
     * Record common search words.
     */
    recordSearchKeyword(query: string): void {
        const clean = query.toLowerCase().trim().replace(/[^\w\s]/g, '');
        const words = clean.split(/\s+/).filter(w => w.length > 2); // only record words longer than 2 chars
        for (const word of words) {
            this.searchKeywords[word] = (this.searchKeywords[word] || 0) + 1;
        }
    }

    private addLatency(arr: number[], val: number) {
        arr.push(val);
        if (arr.length > 1000) arr.shift();
    }

    private getAverage(arr: number[]): number {
        if (arr.length === 0) return 0;
        const sum = arr.reduce((a, b) => a + b, 0);
        return Math.round(sum / arr.length);
    }

    private getCacheHitRatio(): number {
        const total = this.cacheHits + this.cacheMisses;
        if (total === 0) return 0;
        return parseFloat((this.cacheHits / total).toFixed(4));
    }

    /**
     * Get real-time observability diagnostic report.
     */
    getDashboardReport() {
        const totalCost = (this.totalInputTokens * this.INPUT_COST_PER_TOKEN) + 
                          (this.totalOutputTokens * this.OUTPUT_COST_PER_TOKEN);
        
        // Estimated savings: assuming without caching, every request would hit Gemini.
        // Approximate cost per request = ~1000 input tokens + ~200 output tokens.
        const avgRequestCost = (1000 * this.INPUT_COST_PER_TOKEN) + (200 * this.OUTPUT_COST_PER_TOKEN);
        const estimatedSavings = (this.cacheHits * avgRequestCost);

        // Sort keywords and intents for top values
        const topKeywords = Object.entries(this.searchKeywords)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([word, count]) => ({ word, count }));

        const topIntents = Object.entries(this.intentFrequencies)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([intent, count]) => ({ intent, count }));

        return {
            requests: {
                total: this.totalRequests,
                successful: this.successfulRequests,
                failed: this.failedRequests,
                rateLimitErrors: this.rateLimitErrors,
            },
            caching: {
                hits: this.cacheHits,
                misses: this.cacheMisses,
                hitRatio: this.getCacheHitRatio(),
            },
            latency: {
                averageTotalMs: this.getAverage(this.latencyHistory),
                averageDbMs: this.getAverage(this.dbLatencyHistory),
                averageGeminiMs: this.getAverage(this.geminiLatencyHistory),
            },
            tokens: {
                inputTokens: this.totalInputTokens,
                outputTokens: this.totalOutputTokens,
                totalTokens: this.totalInputTokens + this.totalOutputTokens,
            },
            cost: {
                estimatedCostUsd: parseFloat(totalCost.toFixed(6)),
                estimatedSavingsUsd: parseFloat(estimatedSavings.toFixed(6)),
            },
            usage: {
                topIntents,
                topKeywords,
            },
            timestamp: new Date().toISOString()
        };
    }
}

export const aiAnalyticsService = new AnalyticsService();
