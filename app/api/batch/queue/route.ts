import { NextResponse } from "next/server";
import os from "node:os";

import { BatchQueue, type QueueStats } from "@/lib/batch-queue";

/**
 * Batch concurrency queue.
 *
 * Single-QR generation is per-user and unlimited; batch jobs check in here so
 * only `limit` run at once. The limit adapts to live machine pressure (CPU
 * load per core + RSS against the container budget) — quiet server, more
 * concurrent batches; busy server, fewer with everyone else queued in FIFO.
 *
 * In-memory on purpose: one container per Coolify app, no storage promise.
 */

interface QueueSingleton {
  queue: BatchQueue;
  sampler?: ReturnType<typeof setInterval>;
}

const MEM_BUDGET_BYTES = Number(process.env.BATCH_MEM_BUDGET ?? 1.5 * 1024 * 1024 * 1024);
const globalRef = globalThis as typeof globalThis & {
  __qrBatchQueue?: QueueSingleton;
};

function sampleCapacity(singleton: QueueSingleton): void {
  const cores = Math.max(os.cpus().length, 1);
  const cpuFactor = (os.loadavg()[0] ?? 0) / cores;
  const memFactor = process.memoryUsage().rss / MEM_BUDGET_BYTES;
  singleton.queue.setCapacity(cpuFactor, memFactor);
}

function getSingleton(): QueueSingleton {
  if (!globalRef.__qrBatchQueue) {
    const queue = new BatchQueue({
      baseLimit: 10,
      minLimit: 2,
      maxLimit: 16,
      waitingTtlMs: 5 * 60_000,
      // Generating clients heartbeat every 3s; a silent ticket (crashed or
      // closed tab) frees its slot quickly instead of blocking for minutes.
      activeTtlMs: 15_000,
    });
    const singleton: QueueSingleton = { queue };
    globalRef.__qrBatchQueue = singleton;

    // Re-evaluate capacity periodically. Skipped during the production build
    // so prerendering never leaves a dangling timer behind.
    if (process.env.NEXT_PHASE !== "phase-production-build") {
      singleton.sampler = setInterval(() => sampleCapacity(singleton), 10_000);
      singleton.sampler.unref?.();
    }
  }
  return globalRef.__qrBatchQueue;
}

export async function GET(request: Request): Promise<NextResponse> {
  const { queue } = getSingleton();
  const ticket = new URL(request.url).searchParams.get("ticket");
  queue.prune(); // expire silent tickets so reported counts are truthful
  const stats: QueueStats = queue.stats;
  const counts = { limit: stats.limit, activeCount: stats.active, waitingCount: stats.waiting };

  if (!ticket) {
    return NextResponse.json(counts);
  }
  const state = queue.acquire(ticket);
  return NextResponse.json({ ...state, ...counts });
}

export async function POST(request: Request): Promise<NextResponse> {
  const { queue } = getSingleton();
  let body: { action?: string; ticket?: string } = {};
  try {
    body = await request.json();
  } catch {
    // Empty or malformed body falls through to the action checks below.
  }

  if (body.action === "acquire") {
    const ticket = crypto.randomUUID();
    const state = queue.acquire(ticket);
    const stats = queue.stats;
    return NextResponse.json({
      ticket,
      ...state,
      limit: stats.limit,
      activeCount: stats.active,
      waitingCount: stats.waiting,
    });
  }

  if (body.action === "heartbeat" && body.ticket) {
    const alive = queue.heartbeat(body.ticket);
    const stats = queue.stats;
    return NextResponse.json({
      alive,
      limit: stats.limit,
      activeCount: stats.active,
      waitingCount: stats.waiting,
    });
  }

  if (body.action === "release" && body.ticket) {
    queue.release(body.ticket);
    const stats = queue.stats;
    return NextResponse.json({
      released: true,
      limit: stats.limit,
      activeCount: stats.active,
      waitingCount: stats.waiting,
    });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
