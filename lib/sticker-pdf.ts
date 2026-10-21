import type { jsPDF } from "jspdf";

/**
 * A4 sticker-sheet PDF for batch QR codes: a grid of QR images, each with a
 * text label underneath, ready to print and cut. The grid math is pure so it
 * can be unit-tested without jsPDF; the assembly needs the browser only for
 * fetching the embedded Thai-capable font.
 */

/** A4 portrait layout in millimetres. */
export const STICKER_LAYOUT = {
  pageW: 210,
  pageH: 297,
  margin: 10,
  cols: 4,
  rows: 5,
  /** QR square size per cell. */
  qrSize: 40,
  /** Space reserved under each QR for its label. */
  labelH: 8,
} as const;

export const CELL_W = (STICKER_LAYOUT.pageW - STICKER_LAYOUT.margin * 2) / STICKER_LAYOUT.cols;
export const CELL_H = STICKER_LAYOUT.qrSize + STICKER_LAYOUT.labelH;

/**
 * Split `count` items into pages of row-major cell indices. Each page is a
 * flat array of item indexes; the last page may be partial.
 */
export function computeStickerGrid(
  count: number,
  cols: number = STICKER_LAYOUT.cols,
  rows: number = STICKER_LAYOUT.rows,
): number[][] {
  const perPage = cols * rows;
  const pages: number[][] = [];
  for (let start = 0; start < count; start += perPage) {
    const page: number[] = [];
    for (let i = start; i < Math.min(start + perPage, count); i += 1) {
      page.push(i);
    }
    pages.push(page);
  }
  return pages;
}

/** Base64-encode an ArrayBuffer in chunks (btoa has no streaming API). */
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

/**
 * Register the Kanit TTF so Thai labels render correctly. Core PDF fonts are
 * WinAnsi-only and would turn Thai into garbage; if the font fetch fails we
 * fall back to Helvetica and strip non-Latin characters from labels.
 */
async function registerFont(doc: jsPDF): Promise<boolean> {
  try {
    const res = await fetch("/fonts/Kanit-Regular.ttf");
    if (!res.ok) return false;
    const base64 = bufferToBase64(await res.arrayBuffer());
    doc.addFileToVFS("Kanit.ttf", base64);
    doc.addFont("Kanit.ttf", "Kanit", "normal");
    doc.setFont("Kanit", "normal");
    return true;
  } catch {
    return false;
  }
}

function sanitizeLabel(label: string, thaiCapable: boolean): string {
  if (thaiCapable) return label;
  // Helvetica covers Latin-1 only; drop anything it cannot draw.
  return label.replace(/[^\x20-\xFF]/g, "").trim();
}

export interface StickerItem {
  dataUrl: string;
  label: string;
}

/**
 * Build the sticker-sheet PDF for the given items. Returns a Blob ready for
 * a download link. Uses dynamic `import("jspdf")` callers can stay in
 * code-split bundles.
 */
export async function createStickerPdf(items: StickerItem[]): Promise<Blob> {
  const { jsPDF: JsPDF } = await import("jspdf");
  const doc = new JsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const thaiCapable = await registerFont(doc);
  const pages = computeStickerGrid(items.length);

  pages.forEach((page, pageIndex) => {
    if (pageIndex > 0) doc.addPage();
    page.forEach((itemIndex, cell) => {
      const item = items[itemIndex]!;
      const col = cell % STICKER_LAYOUT.cols;
      const row = Math.floor(cell / STICKER_LAYOUT.cols);
      const x = STICKER_LAYOUT.margin + col * CELL_W + (CELL_W - STICKER_LAYOUT.qrSize) / 2;
      const y = STICKER_LAYOUT.margin + row * CELL_H;
      doc.addImage(item.dataUrl, "PNG", x, y, STICKER_LAYOUT.qrSize, STICKER_LAYOUT.qrSize);
      const label = sanitizeLabel(item.label, thaiCapable);
      if (label) {
        doc.setFontSize(9);
        doc.text(label, x + STICKER_LAYOUT.qrSize / 2, y + STICKER_LAYOUT.qrSize + 4.5, {
          align: "center",
          maxWidth: CELL_W - 2,
        });
      }
    });
  });

  return doc.output("blob");
}
