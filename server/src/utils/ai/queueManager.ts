// ============================================================
// AI Queue Manager — Concurrency Control & Spike Protection
// ============================================================

interface QueueJob {
    sessionId: string;
    requestId: string;
    task: () => Promise<any>;
    resolve: (val: any) => void;
    reject: (err: any) => void;
    onStatusUpdate?: (update: { status: 'queued' | 'processing'; position?: number; waitMs?: number }) => void;
}

export class QueueManager {
    private activeSessions = new Set<string>(); // Session level lock
    private queue: QueueJob[] = [];
    private activeJobCount = 0;
    private maxConcurrentJobs = 5; // Global Gemini concurrent execution limit (prevent API overloading)

    /**
     * Try to acquire lock for a session. Returns true if lock acquired, false if already processing.
     */
    acquireLock(sessionId: string): boolean {
        if (this.activeSessions.has(sessionId)) {
            return false;
        }
        this.activeSessions.add(sessionId);
        return true;
    }

    /**
     * Release lock for a session.
     */
    releaseLock(sessionId: string): void {
        this.activeSessions.delete(sessionId);
    }

    /**
     * Check if a session has an active lock.
     */
    isLocked(sessionId: string): boolean {
        return this.activeSessions.has(sessionId);
    }

    /**
     * Queue a new AI operation. Executes task when slot opens.
     */
    enqueue<T>(
        sessionId: string,
        task: () => Promise<T>,
        onStatusUpdate?: QueueJob['onStatusUpdate']
    ): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const job: QueueJob = {
                sessionId,
                requestId: 'req_' + Math.random().toString(36).substring(2, 9),
                task,
                resolve: resolve as any,
                reject,
                onStatusUpdate,
            };

            this.queue.push(job);
            
            // Notify position
            if (onStatusUpdate) {
                const pos = this.queue.length;
                onStatusUpdate({
                    status: 'queued',
                    position: pos,
                    waitMs: pos * 1500, // Estimate 1.5 seconds per job
                });
            }

            this.processNext();
        });
    }

    private async processNext() {
        if (this.activeJobCount >= this.maxConcurrentJobs || this.queue.length === 0) {
            // Update queue position messages for waiting jobs
            this.queue.forEach((job, index) => {
                if (job.onStatusUpdate) {
                    job.onStatusUpdate({
                        status: 'queued',
                        position: index + 1,
                        waitMs: (index + 1) * 1500,
                    });
                }
            });
            return;
        }

        const job = this.queue.shift();
        if (!job) return;

        this.activeJobCount++;
        
        if (job.onStatusUpdate) {
            job.onStatusUpdate({ status: 'processing' });
        }

        try {
            const result = await job.task();
            job.resolve(result);
        } catch (error) {
            job.reject(error);
        } finally {
            this.activeJobCount--;
            // Recursively process the next item
            this.processNext();
        }
    }

    /** Get current status of the queue */
    getStats() {
        return {
            activeSessionsCount: this.activeSessions.size,
            queuedJobsCount: this.queue.length,
            runningJobsCount: this.activeJobCount,
        };
    }
}

export const aiQueueManager = new QueueManager();
