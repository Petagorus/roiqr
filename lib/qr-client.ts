import { encodePayload, type QrInput } from "./qr-encode";
import {
  COLOR_PALETTES,
  type ModuleShape,
  renderQr,
} from "./qr-render";

export interface ClientQrOptions {
  width?: number;
  margin?: number;
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  /** Module shape: square, rounded, dots, or diamond. */
  shape?: ModuleShape;
  /** Palette name from COLOR_PALETTES. */
  palette?: string;
  /** When set, these override the palette colors. `moduleColor` is the dark
   *  module color; `bgColor` is the background color. */
  customColor?: { moduleColor: string; bgColor: string } | null;
  /** Optional logo data URL. */
  logo?: string | null;
  /** Center logo size in px (default 64, rendered against a padded backing). */
  logoSize?: number;
  /** Optional caption drawn under the code (e.g. "SCAN ME"). */
  caption?: string | null;
}

export interface ClientQrResult {
  dataUrl: string;
  payload: string;
  bytes: number;
}

function resolveColor(palette?: string, customColor?: { moduleColor: string; bgColor: string } | null) {
  if (customColor) return { dark: customColor.moduleColor, light: customColor.bgColor };
  const found = COLOR_PALETTES.find((p) => p.name === palette);
  if (found) return { dark: found.dark, light: found.light };
  return { dark: "#1f1a17", light: "#f6f3ee" };
}

/**
 * Client-side QR generation. Mirrors lib/qr-encode.ts so the app renders
 * instantly without a round-trip, keeping the Docker image lean.
 *
 * Uses the custom canvas renderer so it supports module shape, color
 * palette, and a center logo while keeping the payload scannable.
 */
export async function generateQrClient(
  type: string,
  data: QrInput,
  options: ClientQrOptions = {},
): Promise<ClientQrResult> {
  const payload = encodePayload(type, data);
  const { shape, palette, customColor, logo, logoSize, caption, ...rest } = options;
  const color = resolveColor(palette, customColor);
  const size = logoSize ?? 64;

  const { dataUrl } = await renderQr(payload, {
    width: rest.width ?? 512,
    margin: rest.margin ?? 2,
    errorCorrectionLevel: rest.errorCorrectionLevel ?? "H",
    color,
    shape: shape ?? "square",
    caption,
    ...(logo ? { logo: { src: logo, size, padding: Math.round(size * 0.125) } } : {}),
  });

  return {
    dataUrl,
    payload,
    bytes: new TextEncoder().encode(payload).length,
  };
}

/**
 * Render many QR codes from parsed rows. Returns results in order; rows that
 * fail encoding are captured in `errors` so one bad row never kills the batch.
 */
export async function generateBatch(
  type: string,
  rows: QrInput[],
  options: ClientQrOptions = {},
): Promise<{ results: ClientQrResult[]; errors: { index: number; error: string }[] }> {
  const results: ClientQrResult[] = [];
  const errors: { index: number; error: string }[] = [];

  for (let i = 0; i < rows.length; i += 1) {
    try {
      results.push(await generateQrClient(type, rows[i] ?? {}, options));
    } catch (err) {
      errors.push({ index: i, error: err instanceof Error ? err.message : "Unknown error" });
    }
  }

  return { results, errors };
}

/**
 * Render many QR codes from pre-combined payload strings. Used by the batch
 * flow when the user selects multiple columns — each row's payload is already
 * assembled, so we skip per-type encoding and render directly.
 */
export async function generateBatchPayload(
  payloads: string[],
  options: ClientQrOptions = {},
): Promise<{ results: ClientQrResult[]; errors: { index: number; error: string }[] }> {
  const results: ClientQrResult[] = [];
  const errors: { index: number; error: string }[] = [];

  for (let i = 0; i < payloads.length; i += 1) {
    const payload = payloads[i];
    if (!payload) {
      errors.push({ index: i, error: "Empty payload." });
      continue;
    }
    try {
      const { shape, palette, customColor, logo, logoSize, caption, ...rest } = options;
      const color = resolveColor(palette, customColor);
      const size = logoSize ?? 64;
      const { dataUrl } = await renderQr(payload, {
        width: rest.width ?? 512,
        margin: rest.margin ?? 2,
        errorCorrectionLevel: rest.errorCorrectionLevel ?? "H",
        color,
        shape: shape ?? "square",
        caption,
        ...(logo ? { logo: { src: logo, size, padding: Math.round(size * 0.125) } } : {}),
      });
      results.push({
        dataUrl,
        payload,
        bytes: new TextEncoder().encode(payload).length,
      });
    } catch (err) {
      errors.push({ index: i, error: err instanceof Error ? err.message : "Unknown error" });
    }
  }

  return { results, errors };
}
