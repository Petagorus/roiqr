import { describe, expect, it } from "vitest";

import { captionBandHeight } from "../qr-render";
import { renderQrSvg } from "../qr-svg";
import { findDuplicateRows } from "../duplicates";
import { computeStickerGrid, createStickerPdf, CELL_H, CELL_W } from "../sticker-pdf";
import { clearStyle, loadStyle, saveStyle } from "../style-memory";

describe("QR caption rendering", () => {
  it("adds a caption band whose height scales with the width", () => {
    expect(captionBandHeight(512)).toBeGreaterThanOrEqual(48);
    expect(captionBandHeight(4096)).toBeGreaterThan(captionBandHeight(512));
  });

  it("renders a taller SVG with an escaped caption text node", () => {
    const svg = renderQrSvg("https://example.com", {
      width: 512,
      caption: "SCAN ME & <save>",
    });
    // The viewBox grows to fit the caption band below the QR square.
    expect(svg).not.toContain('viewBox="0 0 512 512"');
    expect(svg).toMatch(/viewBox="0 0 512 \d{3}"/);
    // Text is escaped so the XML stays valid.
    expect(svg).toContain("SCAN ME &amp; &lt;save&gt;");
    expect(svg).toContain('text-anchor="middle"');
  });

  it("stays square when no caption is given", () => {
    const svg = renderQrSvg("https://example.com", { width: 512 });
    expect(svg).toContain('viewBox="0 0 512 512"');
    expect(svg).not.toContain("<text");
  });
});

describe("findDuplicateRows", () => {
  it("flags payloads appearing in more than one row (1-based)", () => {
    const groups = findDuplicateRows(["alpha", "beta", "alpha", "", "alpha"]);
    expect(groups).toEqual([{ value: "alpha", rows: [1, 3, 5] }]);
  });

  it("ignores unique and empty values", () => {
    expect(findDuplicateRows(["a", "b", ""])).toEqual([]);
  });
});

describe("computeStickerGrid", () => {
  it("packs 20 items per A4 page in row-major order", () => {
    const pages = computeStickerGrid(45);
    expect(pages).toHaveLength(3);
    expect(pages[0]).toHaveLength(20);
    expect(pages[1]).toHaveLength(20);
    expect(pages[2]).toHaveLength(5);
    expect(pages[0]![0]).toBe(0);
    expect(pages[0]!.at(-1)).toBe(19);
    expect(pages[1]![0]).toBe(20);
  });

  it("returns no pages for an empty batch", () => {
    expect(computeStickerGrid(0)).toEqual([]);
  });

  it("cell geometry fits the A4 printable area", () => {
    expect(CELL_W * 4).toBeCloseTo(190);
    expect(10 + CELL_H * 5).toBeLessThanOrEqual(297);
  });
});

describe("createStickerPdf", () => {
  // 1x1 transparent PNG.
  const tinyPng =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

  it("produces a PDF blob with one page per 20 stickers", async () => {
    const items = Array.from({ length: 21 }, (_, i) => ({
      dataUrl: tinyPng,
      label: `QR ${i + 1}`,
    }));
    const blob = await createStickerPdf(items);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(1000);
    // jsdom's Blob predates arrayBuffer(); read via FileReader instead.
    const bytes = await new Promise<Uint8Array>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(blob);
    });
    const header = String.fromCharCode(...bytes.subarray(0, 5));
    expect(header).toBe("%PDF-");
  });
});

describe("style memory", () => {
  it("round-trips style choices through localStorage", () => {
    saveStyle({
      shape: "dots",
      palette: "Ocean",
      customColor: { moduleColor: "#112233", bgColor: "#ffffff" },
      logoSize: 96,
      caption: "แสกนเลย",
    });
    expect(loadStyle()).toMatchObject({
      shape: "dots",
      palette: "Ocean",
      caption: "แสกนเลย",
      logoSize: 96,
    });
    clearStyle();
    expect(loadStyle()).toEqual({});
  });

  it("drops oversized logos instead of throwing on quota", () => {
    expect(() =>
      saveStyle({ logo: "data:image/png;base64," + "A".repeat(400_000) }),
    ).not.toThrow();
    expect(loadStyle().logo).toBeNull();
  });

  it("survives corrupted JSON", () => {
    window.localStorage.setItem("roiqr-style-v1", "{not json");
    expect(loadStyle()).toEqual({});
  });
});
