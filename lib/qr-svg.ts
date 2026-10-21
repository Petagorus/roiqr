import {
  buildMatrix,
  captionBandHeight,
  type LogoOptions,
  type ModuleShape,
  type QrColorPair,
} from "./qr-render";

/**
 * Vector (SVG) QR renderer. Mirrors the canvas renderer's module shapes so a
 * downloaded SVG looks identical to the PNG preview — but stays crisp at any
 * print size. No DOM required: runs anywhere `QRCode.create` runs.
 */

export interface SvgRenderOptions {
  /** Outer pixel size of the QR square (viewBox adds the caption band). */
  width?: number;
  /** Quiet zone in modules on each side. */
  margin?: number;
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  color?: QrColorPair;
  shape?: ModuleShape;
  logo?: LogoOptions;
  /** Optional caption drawn under the code (e.g. "SCAN ME"). */
  caption?: string | null;
}

const DEFAULT_COLOR: QrColorPair = { dark: "#1f1a17", light: "#f6f3ee" };

const f = (n: number) => n.toFixed(2);

/** Escape text for safe interpolation into SVG/XML markup. */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function moduleElement(shape: ModuleShape, x: number, y: number, s: number): string {
  switch (shape) {
    case "dots": {
      const r = s * 0.42;
      return `<circle cx="${f(x + s / 2)}" cy="${f(y + s / 2)}" r="${f(r)}"/>`;
    }
    case "diamond": {
      const cx = x + s / 2;
      const cy = y + s / 2;
      const h = s * 0.5;
      return `<path d="M${f(cx)} ${f(cy - h)}L${f(cx + h)} ${f(cy)}L${f(cx)} ${f(cy + h)}L${f(cx - h)} ${f(cy)}Z"/>`;
    }
    case "rounded": {
      return `<rect x="${f(x)}" y="${f(y)}" width="${f(s)}" height="${f(s)}" rx="${f(s * 0.25)}"/>`;
    }
    default:
      return `<rect x="${f(x)}" y="${f(y)}" width="${f(s)}" height="${f(s)}"/>`;
  }
}

/**
 * Render a QR payload to a standalone SVG string. Pass a logo (data URL) to
 * embed it in the center with a white rounded backing, matching the canvas
 * renderer.
 */
export function renderQrSvg(payload: string, options: SvgRenderOptions = {}): string {
  const width = options.width ?? 512;
  const margin = options.margin ?? 2;
  const ecc = options.errorCorrectionLevel ?? "H";
  const color = options.color ?? DEFAULT_COLOR;
  const shape = options.shape ?? "square";
  const logo = options.logo ?? null;
  const caption = (options.caption ?? "").trim();
  const bandHeight = caption ? captionBandHeight(width) : 0;
  const totalHeight = width + bandHeight;

  const { size, data } = buildMatrix(payload, ecc);
  const moduleSize = width / (size + margin * 2);
  const offset = margin * moduleSize;

  let modules = "";
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (data[row * size + col] === 1) {
        modules += moduleElement(shape, offset + col * moduleSize, offset + row * moduleSize, moduleSize);
      }
    }
  }

  let logoMarkup = "";
  if (logo) {
    const padding = logo.padding ?? 8;
    const box = logo.size + padding * 2;
    const boxPos = (width - box) / 2;
    const imgPos = (width - logo.size) / 2;
    logoMarkup =
      `<rect x="${f(boxPos)}" y="${f(boxPos)}" width="${f(box)}" height="${f(box)}" rx="${f(box * 0.18)}" fill="#ffffff"/>` +
      `<image href="${logo.src}" x="${f(imgPos)}" y="${f(imgPos)}" width="${logo.size}" height="${logo.size}" preserveAspectRatio="xMidYMid meet"/>`;
  }

  let captionMarkup = "";
  if (caption) {
    const fontSize = Math.max(14, Math.round(bandHeight * 0.42));
    captionMarkup =
      `<text x="${f(width / 2)}" y="${f(width + bandHeight / 2)}" text-anchor="middle" dominant-baseline="central" ` +
      `font-family="Kanit, sans-serif" font-size="${fontSize}" font-weight="bold" fill="${color.dark}">` +
      `${escapeXml(caption)}</text>`;
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${totalHeight}" viewBox="0 0 ${width} ${totalHeight}" shape-rendering="geometricPrecision">` +
    `<rect width="${width}" height="${totalHeight}" fill="${color.light}"/>` +
    `<g fill="${color.dark}">${modules}</g>` +
    logoMarkup +
    captionMarkup +
    `</svg>`
  );
}
