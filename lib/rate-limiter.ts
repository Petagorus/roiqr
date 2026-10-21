import { PrismaClient } from "@prisma/client";

/**
 * Rate limiting for the QR generation endpoint.
 *
 * Strategy: token-bucket per client key with a sliding window. When a Postgres
 * database is configured, usage is persisted in the `RateLimit` table so limits
 * survive restarts and scale across multiple containers behind Coolify. When no
 * DB is present, it transparently falls back to an in-memory store.
 *
 * This is the "high-risk" anti-spam layer: it throttles clients that spam the
 * endpoint, returns HTTP 429 with a Retry-After header, and caps batch size.
 */

const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000);
const MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 60);

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
  retryAfterMs?: number;
}

/** A minimal shape so both Prisma and an in-memory map satisfy it. */
interface RateLimitRecord {
  key: string;
  count: number;
  windowStart: Date;
  lastSeen: Date;
}

// PrismaClient throws if DATABASE_URL is unset, so we only construct it when
// the connection string is present. Otherwise we fall back to the in-memory
// store below.
const prisma = process.env.DATABASE_URL
  ? new PrismaClient()
  : null;

/** In-memory fallback store keyed by client key. */
const memoryStore = new Map<
  string,
  { count: number; windowStart: number }
>();

function memoryCheck(key: string): RateLimitResult {
  const now = Date.now();
  const stored = memoryStore.get(key);

  if (!stored || now - stored.windowStart > WINDOW_MS) {
    memoryStore.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetInSeconds: Math.ceil(WINDOW_MS / 1000) };
  }

  if (stored.count >= MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds: Math.ceil((stored.windowStart + WINDOW_MS - now) / 1000),
      retryAfterMs: stored.windowStart + WINDOW_MS - now,
    };
  }

  stored.count += 1;
  return { allowed: true, remaining: MAX_REQUESTS - stored.count, resetInSeconds: Math.ceil(WINDOW_MS / 1000) };
}

/**
 * Record one usage event for the key and return the current limit status.
 * `key` is usually an API key, session id, or hashed client IP.
 */
export async function checkRateLimit(
  key: string,
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = now - (now % WINDOW_MS);

  if (!prisma) {
    return memoryCheck(key);
  }

  const existing = await prisma.rateLimit.findUnique({ where: { key } });

  if (!existing || existing.windowStart.getTime() < windowStart) {
    // Fresh window: create or reset.
    if (existing && existing.windowStart.getTime() < windowStart) {
      await prisma.rateLimit.update({
        where: { key },
        data: { count: 1, windowStart: new Date(windowStart), lastSeen: new Date(now) },
      });
    } else {
      await prisma.rateLimit.create({
        data: { key, count: 1, windowStart: new Date(windowStart), lastSeen: new Date(now) },
      });
    }
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetInSeconds: Math.ceil(WINDOW_MS / 1000) };
  }

  if (existing.count >= MAX_REQUESTS) {
    const retryAfterMs = existing.windowStart.getTime() + WINDOW_MS - now;
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds: Math.ceil(retryAfterMs / 1000),
      retryAfterMs,
    };
  }

  await prisma.rateLimit.update({
    where: { key },
    data: { count: existing.count + 1, lastSeen: new Date(now) },
  });

  return { allowed: true, remaining: MAX_REQUESTS - (existing.count + 1), resetInSeconds: Math.ceil((existing.windowStart.getTime() + WINDOW_MS - now) / 1000) };
}

/** Derive a stable client key from request headers. */
export function deriveClientKey(headers: Headers): string {
  const apiKey = headers.get("x-api-key") ?? "";
  const forwarded = headers.get("x-forwarded-for") ?? "";
  const realIp = headers.get("x-real-ip") ?? forwarded;
  const base = apiKey || realIp || "anonymous";
  // Keep the key bounded and opaque.
  return `rl:${base.slice(0, 120)}`;
}
