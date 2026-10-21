import QRCode from "qrcode";

/**
 * Custom QR renderer that draws modules directly onto a canvas.
 *
 * Unlike `QRCode.toDataURL`, this lets us control module shape, colors, and
 * overlay a center logo. It uses the H error-correction level by default so a
 * logo covering the middle still leaves enough redundancy to scan.
 */

export type ModuleShape = "square" | "rounded" | "dots" | "diamond";

export interface QrColorPair {
  dark: string;
  light: string;
}

export interface LogoOptions {
  /** Data URL or object URL of the logo image. */
  src: string;
  /** Logo height/width in pixels, drawn as a square. */
  size: number;
  /** Optional padding between logo and QR, in pixels. */
  padding: number;
}

export interface ColorPalette {
  name: string;
  dark: string;
  light: string;
}

/**
 * Built-in color palettes. Each is a dark-module / light-module pair.
 * The defaults follow the app's off-white / warm-gray / charcoal palette.
 */
export const COLOR_PALETTES: ColorPalette[] = [
  { name: "Charcoal", dark: "#1f1a17", light: "#f6f3ee" },
  { name: "Mono", dark: "#000000", light: "#ffffff" },
  { name: "Slate", dark: "#334155", light: "#f8fafc" },
  { name: "Forest", dark: "#14532d", light: "#f0fdf4" },
  { name: "Ocean", dark: "#0c4a6e", light: "#f0f9ff" },
  { name: "Wine", dark: "#7f1d1d", light: "#fef2f2" },
];

export interface RenderOptions {
  width?: number;
  margin?: number;
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  color?: QrColorPair;
  shape?: ModuleShape;
  logo?: LogoOptions;
  /** Optional caption drawn under the code (e.g. "SCAN ME"). */
  caption?: string | null;
}

/** Height of the caption band for a given QR width (0 when no caption). */
export function captionBandHeight(width: number): number {
  return Math.max(48, Math.round(width * 0.12));
}

export interface RenderedQr {
  dataUrl: string;
  payload: string;
  bytes: number;
}

const DEFAULT_COLOR: QrColorPair = { dark: "#1f1a17", light: "#f6f3ee" };

/**
 * Build a QRCode object from a payload string. The object exposes the module
 * matrix via `modules.data` (a flat array indexed by row*n+col).
 */
export function buildMatrix(
  payload: string,
  errorCorrectionLevel: "L" | "M" | "Q" | "H",
): { size: number; data: number[] } {
  const qr = QRCode.create(payload, { errorCorrectionLevel });
  const size = qr.modules.size;
  const raw = qr.modules.data as Uint8Array;
  const data = Array.from(raw);
  return { size, data };
}

function isDark(data: number[], row: number, col: number, size: number): boolean {
  return data[row * size + col] === 1;
}

/** Draw a single module. `size` is the pixel size of one module. */
function drawModule(
  ctx: CanvasRenderingContext2D,
  shape: ModuleShape,
  x: number,
  y: number,
  size: number,
  radius = 0,
) {
  switch (shape) {
    case "dots": {
      const r = size * 0.42;
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, r, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "diamond": {
      const cx = x + size / 2;
      const cy = y + size / 2;
      const half = size * 0.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy - half);
      ctx.lineTo(cx + half, cy);
      ctx.lineTo(cx, cy + half);
      ctx.lineTo(cx - half, cy);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case "rounded": {
      const r = Math.min(radius, size / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + size, y, x + size, y + size, r);
      ctx.arcTo(x + size, y + size, x, y + size, r);
      ctx.arcTo(x, y + size, x, y, r);
      ctx.arcTo(x, y, x + size, y, r);
      ctx.closePath();
      ctx.fill();
      break;
    }
    default:
      ctx.fillRect(x, y, size, size);
  }
}

/**
 * Render a QR code for the given payload to a canvas and return its data URL.
 * The canvas must already exist with the requested width/height.
 */
export async function renderQrToCanvas(
  canvas: HTMLCanvasElement,
  payload: string,
  options: RenderOptions = {},
): Promise<void> {
  const {
    width = 512,
    margin = 2,
    errorCorrectionLevel = "H",
    color = DEFAULT_COLOR,
    shape = "square",
    logo,
    caption,
  } = options;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable.");

  const captionText = (caption ?? "").trim();
  const bandHeight = captionText ? captionBandHeight(width) : 0;

  canvas.width = width;
  canvas.height = width + bandHeight;

  // Background (light module color).
  ctx.fillStyle = color.light;
  ctx.fillRect(0, 0, width, width + bandHeight);

  const { size, data } = buildMatrix(payload, errorCorrectionLevel);
  const moduleSize = (width - margin * 2) / size;

  ctx.fillStyle = color.dark;

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (!isDark(data, row, col, size)) continue;
      const x = margin + col * moduleSize;
      const y = margin + row * moduleSize;
      drawModule(ctx, shape, x, y, moduleSize);
    }
  }

  if (logo) {
    drawLogo(ctx, logo, width);
  }

  if (captionText) {
    drawCaption(ctx, captionText, width, bandHeight, color.dark);
  }
}

/** Draw a centered caption in the band below the QR square. */
function drawCaption(
  ctx: CanvasRenderingContext2D,
  text: string,
  width: number,
  bandHeight: number,
  color: string,
) {
  const fontSize = Math.max(14, Math.round(bandHeight * 0.42));
  ctx.fillStyle = color;
  ctx.font = `bold ${fontSize}px "Kanit", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // Clamp to one line — a caption that wraps would push into the QR.
  let label = text;
  while (label.length > 1 && ctx.measureText(label).width > width * 0.94) {
    label = label.slice(0, -1);
  }
  if (label !== text) label = label.slice(0, -1) + "…";
  ctx.fillText(label, width / 2, width + bandHeight / 2, width * 0.94);
}

/** Draw a centered logo with a white backing so it sits cleanly on the QR. */
function drawLogo(
  ctx: CanvasRenderingContext2D,
  logo: LogoOptions,
  width: number,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const padding = logo.padding ?? 8;
        const boxSize = logo.size + padding * 2;
        const x = width / 2 - boxSize / 2;
        const y = width / 2 - boxSize / 2;

        // White backing so the QR under the logo stays isolated.
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        const r = 8;
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + boxSize, y, x + boxSize, y + boxSize, r);
        ctx.arcTo(x + boxSize, y + boxSize, x, y + boxSize, r);
        ctx.arcTo(x, y + boxSize, x, y, r);
        ctx.arcTo(x, y, x + boxSize, y, r);
        ctx.closePath();
        ctx.fill();

        // Logo image, centered, preserving aspect ratio.
        const aspect = img.width / img.height;
        let drawW = logo.size;
        let drawH = logo.size;
        if (aspect > 1) {
          drawH = logo.size / aspect;
        } else if (aspect < 1) {
          drawW = logo.size * aspect;
        }
        const drawX = x + padding + (logo.size - drawW) / 2;
        const drawY = y + padding + (logo.size - drawH) / 2;
        ctx.drawImage(img, drawX, drawY, drawW, drawH);
        resolve();
      } catch (err) {
        reject(err instanceof Error ? err : new Error("Logo draw failed"));
      }
    };
    img.onerror = () =>
      reject(new Error("Could not load logo image: " + logo.src));
    img.src = logo.src;
  });
}

/**
 * Convenience wrapper: render a payload and return a PNG data URL.
 * Uses H error correction so a center logo still scans reliably.
 */
export async function renderQr(
  payload: string,
  options: RenderOptions = {},
): Promise<RenderedQr> {
  const width = options.width ?? 512;
  const canvas = document.createElement("canvas");
  await renderQrToCanvas(canvas, payload, { ...options, width });
  const dataUrl = canvas.toDataURL("image/png");
  return {
    dataUrl,
    payload,
    bytes: new TextEncoder().encode(payload).length,
  };
}

/** Read a File as a data URL, or reject with a clear message. */
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

