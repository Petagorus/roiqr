/**
 * In-memory concurrency limiter for the batch flow.
 *
 * Single-QR generation runs per user and is never queued. Batch generation is
 * gated behind this queue so a burst of large spreadsheets cannot saturate the
 * server: at most `limit` tickets are active at once, everyone else waits in a
 * FIFO line and is told how many queues are ahead of them.
 *
 * The limit is dynamic — the API route periodically samples CPU load and RSS
 * and calls `setCapacity`, which shrinks the limit under pressure and grows it
 * back when the machine is idle.
 */

export interface QueueTicketState {
  active: boolean;
  /** How many tickets are ahead in the waiting line (0 = you may proceed). */
  position: number;
}

export interface QueueStats {
  limit: number;
  active: number;
  waiting: number;
}

interface WaitingTicket {
  id: string;
  enqueuedAt: number;
}

export interface BatchQueueOptions {
  /** Concurrency limit while the machine is healthy (default 10). */
  baseLimit: number;
  minLimit: number;
  maxLimit: number;
  /** A ticket waiting longer than this is dropped (client went away). */
  waitingTtlMs: number;
  /** An active ticket older than this is force-released (crashed client). */
  activeTtlMs: number;
}

export class BatchQueue {
  private limit: number;
  private readonly opts: BatchQueueOptions;
  private readonly active = new Map<string, number>();
  private waiting: WaitingTicket[] = [];

  constructor(opts: BatchQueueOptions) {
    this.opts = opts;
    this.limit = opts.baseLimit;
  }

  /** Acquire (or re-check) a ticket. Returns the current position in line. */
  acquire(id: string): QueueTicketState {
    this.cleanup();
    const startedAt = this.active.get(id);
    if (startedAt !== undefined) {
      this.active.set(id, Date.now()); // refresh lease while the client polls
      return { active: true, position: 0 };
    }
    if (this.active.size < this.limit) {
      this.active.set(id, Date.now());
      return { active: true, position: 0 };
    }
    let entry = this.waiting.find((w) => w.id === id);
    if (!entry) {
      entry = { id, enqueuedAt: Date.now() };
      this.waiting.push(entry);
    }
    const position = this.waiting.findIndex((w) => w.id === id) + 1;
    return { active: false, position };
  }

  /** Give up a ticket (client finished or disconnected). */
  release(id: string): void {
    this.active.delete(id);
    this.waiting = this.waiting.filter((w) => w.id !== id);
    this.promote();
  }

  /**
   * Liveness signal from a generating client. Refreshes the lease without
   * ever re-creating a released ticket; a ticket whose client stopped
   * heartbeating expires after `activeTtlMs` and frees its slot.
   */
  heartbeat(id: string): boolean {
    this.cleanup();
    const startedAt = this.active.get(id);
    if (startedAt === undefined) return false;
    this.active.set(id, Date.now());
    return true;
  }

  /** Adjust concurrency from machine pressure. Both inputs are 0..1 ratios. */
  setCapacity(cpuFactor: number, memFactor: number): QueueStats {
    const pressured = cpuFactor > 0.8 || memFactor > 0.7;
    const idle = cpuFactor < 0.4 && memFactor < 0.4;
    if (pressured) {
      this.limit = Math.max(this.opts.minLimit, Math.floor(this.limit * 0.6));
    } else if (idle) {
      this.limit = Math.min(this.opts.maxLimit, this.limit + 1);
    }
    this.promote();
    return this.stats;
  }

  /** Drop dead tickets immediately — keeps public stats honest. */
  prune(): void {
    this.cleanup();
  }

  get stats(): QueueStats {
    return { limit: this.limit, active: this.active.size, waiting: this.waiting.length };
  }

  private promote(): void {
    while (this.active.size < this.limit && this.waiting.length > 0) {
      const next = this.waiting.shift();
      if (next) this.active.set(next.id, Date.now());
    }
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [id, startedAt] of this.active) {
      if (now - startedAt > this.opts.activeTtlMs) this.active.delete(id);
    }
    this.waiting = this.waiting.filter((w) => now - w.enqueuedAt <= this.opts.waitingTtlMs);
    this.promote();
  }
}
