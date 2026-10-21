import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { BatchQueue } from "../batch-queue";

function makeQueue(overrides = {}) {
  return new BatchQueue({
    baseLimit: 3,
    minLimit: 1,
    maxLimit: 6,
    waitingTtlMs: 60_000,
    activeTtlMs: 60_000,
    ...overrides,
  });
}

describe("BatchQueue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("admits up to the base limit immediately, then queues in FIFO", () => {
    const q = makeQueue();
    expect(q.acquire("a")).toEqual({ active: true, position: 0 });
    expect(q.acquire("b")).toEqual({ active: true, position: 0 });
    expect(q.acquire("c")).toEqual({ active: true, position: 0 });

    const fourth = q.acquire("d");
    expect(fourth.active).toBe(false);
    expect(fourth.position).toBe(1); // one queue ahead
    expect(q.acquire("e").position).toBe(2); // two queues ahead
    expect(q.stats).toEqual({ limit: 3, active: 3, waiting: 2 });
  });

  it("promotes waiting tickets when an active ticket is released", () => {
    const q = makeQueue();
    for (const id of ["a", "b", "c"]) q.acquire(id);
    q.acquire("d");
    q.acquire("e");

    q.release("a");
    expect(q.acquire("d")).toEqual({ active: true, position: 0 });
    expect(q.stats.waiting).toBe(1);
  });

  it("keeps an existing active ticket active on re-acquire", () => {    const q = makeQueue();
    q.acquire("a");
    expect(q.acquire("a")).toEqual({ active: true, position: 0 });
  });

  it("heartbeat refreshes the lease of a live ticket", () => {
    const q = makeQueue({ activeTtlMs: 15_000 });
    q.acquire("a");
    vi.advanceTimersByTime(10_000);
    expect(q.heartbeat("a")).toBe(true);
    vi.advanceTimersByTime(10_000); // 20s since acquire, 10s since heartbeat
    expect(q.stats.active).toBe(1); // still alive
    expect(q.heartbeat("ghost")).toBe(false);
  });

  it("a ticket that stops heartbeating frees its slot", () => {
    const q = makeQueue({ activeTtlMs: 15_000 });
    q.acquire("a");
    q.acquire("b");
    q.acquire("c");
    expect(q.acquire("d").active).toBe(false);
    vi.advanceTimersByTime(16_000); // no heartbeats — all three expire
    expect(q.acquire("d").active).toBe(true);
  });

  it("drops waiting tickets that exceeded their TTL", () => {
    // Long active lease so only the waiting line expires here.
    const q = makeQueue({ activeTtlMs: 600_000 });
    for (const id of ["a", "b", "c"]) q.acquire(id);
    q.acquire("ghost");

    vi.advanceTimersByTime(61_000);
    // ghost expired; a fresh ticket is now first in line (1 queue ahead:
    // the three still-active slots)
    expect(q.acquire("new")).toEqual({ active: false, position: 1 });
  });

  it("force-releases active tickets older than the active TTL", () => {
    const q = makeQueue();
    for (const id of ["a", "b", "c"]) q.acquire(id);
    vi.advanceTimersByTime(61_000);
    // all expired — a new ticket gets a slot right away
    expect(q.acquire("fresh")).toEqual({ active: true, position: 0 });
  });

  it("shrinks capacity under pressure and grows it back when idle", () => {
    const q = makeQueue();
    // Healthy: grows toward max.
    q.setCapacity(0.2, 0.2);
    expect(q.stats.limit).toBe(4);
    // Pressure: shrinks proportionally.
    q.setCapacity(0.9, 0.2);
    expect(q.stats.limit).toBe(2);
    q.setCapacity(0.9, 0.9);
    expect(q.stats.limit).toBe(1); // never below minLimit
    expect(q.stats.limit).toBeGreaterThanOrEqual(1);
  });

  it("promotes queued tickets when capacity grows", () => {
    const q = makeQueue();
    for (const id of ["a", "b", "c"]) q.acquire(id);
    const state = q.acquire("d");
    expect(state.position).toBe(1);

    q.setCapacity(0.1, 0.1); // idle -> limit grows, d should be promoted
    expect(q.acquire("d").active).toBe(true);
  });
});
