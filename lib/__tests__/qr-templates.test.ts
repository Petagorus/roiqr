import { describe, expect, it } from "vitest";

import { COLOR_PALETTES, type ModuleShape } from "../qr-render";
import { QR_TEMPLATES } from "../qr-templates";

describe("QR_TEMPLATES", () => {
  it("references existing palettes and known shapes", () => {
    const paletteNames = COLOR_PALETTES.map((p) => p.name);
    const shapes: ModuleShape[] = ["square", "rounded", "dots", "diamond"];
    for (const t of QR_TEMPLATES) {
      expect(paletteNames).toContain(t.palette);
      expect(shapes).toContain(t.shape);
    }
  });

  it("has unique ids", () => {
    const ids = QR_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(QR_TEMPLATES.length);
  });

  it("offers at least four distinct looks", () => {
    const combos = new Set(QR_TEMPLATES.map((t) => `${t.palette}/${t.shape}`));
    expect(combos.size).toBeGreaterThanOrEqual(4);
  });
});
