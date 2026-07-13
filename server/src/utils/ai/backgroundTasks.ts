// ============================================================
// AI Background Tasks — Non-Blocking DB & Analytics Processing
// ============================================================

type TaskFn = () => Promise<void> | void;

export class BackgroundTasks {
    private queue: { name: string; task: TaskFn }[] = [];
    private processing = false;

    /**
     * Enqueue a non-critical task to be run asynchronously in the background.
     */
    enqueue(name: string, task: TaskFn): void {
        this.queue.push({ name, task });
        
        // Trigger execution asynchronously
        setImmediate(() => this.processNext());
    }

    private async processNext() {
        if (this.processing || this.queue.length === 0) return;
        this.processing = true;

        const item = this.queue.shift();
        if (item) {
            try {
                // Execute the task
                await item.task();
            } catch (error) {
                console.error(`[Background Task] Error in task "${item.name}":`, error);
            }
        }

        this.processing = false;
        
        // Loop again if tasks are pending
        if (this.queue.length > 0) {
            setImmediate(() => this.processNext());
        }
    }

    getPendingCount(): number {
        return this.queue.length;
    }
}

export const backgroundTasks = new BackgroundTasks();
