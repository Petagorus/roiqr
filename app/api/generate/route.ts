import { NextRequest, NextResponse } from "next/server";

import { QR_TYPE_MAP } from "@/lib/constants";
import { generateQr, type QrRenderOptions } from "@/lib/qr-encode";
import { checkRateLimit, deriveClientKey, type RateLimitResult } from "@/lib/rate-limiter";
import { z } from "zod";

/**
 * POST /api/generate
 *
 * Two modes, both rate-limited:
 *   1. Single:  { type, data, options }  -> one QR data URL
 *   2. Batch:   { type, rows, options }  -> many QR data URLs
 *
 * `rows` in batch mode is the already-parsed spreadsheet data (client-side
 * parsing of Excel/CSV keeps the Docker image lean). Each row is a
 * key/value object; the matching fields are fed into the QR encoder.
 *
 * A token-bucket limiter protects the endpoint from spam. Clients that exceed
 * the window receive HTTP 429 with a Retry-After header and never reach the
 * encoder.
 */

export const runtime = "nodejs";

const BATCH_MAX = Number(process.env.BATCH_MAX_QR ?? 500);

const optionsSchema = z
  .object({
    width: z.number().min(128).max(2048).optional(),
    margin: z.number().min(0).max(10).optional(),
    errorCorrectionLevel: z.enum(["L", "M", "Q", "H"]).optional(),
    asDataUrl: z.boolean().optional(),
  })
  .optional();

const singleSchema = z.object({
  type: z.enum([
    "url",
    "text",
    "json",
    "promptpay",
    "email",
    "phone",
    "sms",
    "wifi",
    "vcard",
    "geo",
    "event",
  ]),
  data: z.record(z.union([z.string(), z.boolean(), z.number(), z.null()])),
  options: optionsSchema,
});

const batchSchema = z.object({
  type: z.enum([
    "url",
    "text",
    "json",
    "promptpay",
    "email",
    "phone",
    "sms",
    "wifi",
    "vcard",
    "geo",
    "event",
  ]),
  rows: z.array(z.record(z.union([z.string(), z.boolean(), z.number(), z.null()]))),
  options: optionsSchema,
});

export async function POST(request: NextRequest) {
  const key = deriveClientKey(request.headers);

  // Enforce the rate limit before doing any work.
  const limit = await checkRateLimit(key);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded. Slow down and try again shortly.",
        retryAfterMs: limit.retryAfterMs,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((limit.retryAfterMs ?? 60000) / 1000)),
          "RateLimit-Limit": "60",
          "RateLimit-Remaining": "0",
          "RateLimit-Reset": String(limit.resetInSeconds),
        },
      },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const isBatch = Array.isArray((body as { rows?: unknown }).rows);

  const singleParsed = singleSchema.safeParse(body);
  const batchParsed = batchSchema.safeParse(body);

  if (isBatch) {
    if (!batchParsed.success) {
      return NextResponse.json(
        { error: "Invalid batch request. Check the payload schema." },
        { status: 400 },
      );
    }
    try {
      return await handleBatch(batchParsed.data, key, limit);
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Failed to generate QR code." },
        { status: 422 },
      );
    }
  }

  if (!singleParsed.success) {
    return NextResponse.json(
      { error: "Invalid request. Check the payload schema." },
      { status: 400 },
    );
  }

  try {
    return await handleSingle(singleParsed.data, key, limit);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate QR code." },
      { status: 422 },
    );
  }
}

function toRenderOptions(
  options: z.infer<typeof optionsSchema>,
): QrRenderOptions {
  return {
    width: options?.width,
    margin: options?.margin,
    errorCorrectionLevel: options?.errorCorrectionLevel,
    asDataUrl: options?.asDataUrl ?? true,
  };
}

async function handleSingle(
  payload: z.infer<typeof singleSchema>,
  key: string,
  limit: RateLimitResult,
): Promise<NextResponse> {
  const { type, data, options } = payload;

  if (!QR_TYPE_MAP[type]) {
    return NextResponse.json({ error: `Unsupported QR type: ${type}` }, { status: 400 });
  }

  const qr = await generateQr(type, data, toRenderOptions(options));

  // Persist an audit entry when a database is configured.
  void recordUsage(key, type, 1);

  return NextResponse.json({
    type,
    result: { dataUrl: qr.dataUrl, payload: qr.payload, bytes: qr.bytes },
    batchMax: BATCH_MAX,
    rateLimit: { remaining: limit.remaining, resetInSeconds: limit.resetInSeconds },
  });
}

async function handleBatch(
  payload: z.infer<typeof batchSchema>,
  key: string,
  limit: RateLimitResult,
): Promise<NextResponse> {
  const { type, rows, options } = payload;

  if (!QR_TYPE_MAP[type]) {
    return NextResponse.json({ error: `Unsupported QR type: ${type}` }, { status: 400 });
  }

  const capped = rows.slice(0, BATCH_MAX);

  const results = await Promise.all(
    capped.map((row, index) =>
      generateQr(type, row, toRenderOptions(options)).then((qr) => ({
        index,
        ok: true,
        dataUrl: qr.dataUrl,
        payload: qr.payload,
        bytes: qr.bytes,
      })),
    ),
  );

  // Persist an audit entry when a database is configured.
  void recordUsage(key, type, results.length);

  return NextResponse.json({
    type,
    count: results.length,
    batchMax: BATCH_MAX,
    results,
    rateLimit: { remaining: limit.remaining, resetInSeconds: limit.resetInSeconds },
  });
}

async function recordUsage(
  key: string,
  type: string,
  count: number,
): Promise<void> {
  if (!process.env.DATABASE_URL) return;
  try {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    await prisma.usageLog.create({
      data: { key, type, bytes: 0 },
    });
    void prisma;
    void count;
  } catch {
    // Audit logging must never break generation.
  }
}
