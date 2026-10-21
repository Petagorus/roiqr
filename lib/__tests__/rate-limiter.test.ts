import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Force the in-memory fallback so the test never needs a database.
vi.stubEnv("DATABASE_URL", "");

import { checkRateLimit, deriveClientKey } from "../rate-limiter";

describe("rate limiter (in-memory fallback)", () => {
  beforeEach(() => {
    // The in-memory store is module-level; clear it between tests by
    // resetting the module.
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("allows requests under the window limit", async () => {
    const { checkRateLimit: limit } = await import("../rate-limiter");
    const result = await limit("test-key");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(59);
  });

  it("blocks after the limit is reached", async () => {
    const { checkRateLimit: limit } = await import("../rate-limiter");
    const MAX = Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 60);

    let last: Awaited<ReturnType<typeof limit>> | undefined;
    // The MAXth call is still allowed (remaining 0); the (MAX+1)th is blocked.
    for (let i = 0; i <= MAX; i += 1) {
      last = await limit("spammer");
    }

    expect(last?.allowed).toBe(false);
    expect(last?.remaining).toBe(0);
    expect(last?.retryAfterMs).toBeGreaterThan(0);
  });

  it("derives a client key from headers", () => {
    const headers = new Headers({ "x-forwarded-for": "203.0.113.7" });
    const key = deriveClientKey(headers);
    expect(key).toMatch(/^rl:/);
    expect(key).toContain("203.0.113.7");
  });

  it("prefers an explicit API key when present", () => {
    const headers = new Headers({
      "x-api-key": "secret-123",
      "x-forwarded-for": "203.0.113.7",
    });
    const key = deriveClientKey(headers);
    expect(key).toContain("secret-123");
  });
});
