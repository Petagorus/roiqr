import { describe, expect, it } from "vitest";

import { renderQrSvg } from "../qr-svg";

describe("renderQrSvg", () => {
  it("produces a standalone SVG with background and modules", () => {
    const svg = renderQrSvg("https://example.com", { width: 512 });
    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain('viewBox="0 0 512 512"');
    expect(svg).toContain('fill="#f6f3ee"'); // default light background
    expect(svg).toContain('fill="#1f1a17"'); // default dark modules
    // A URL payload yields dozens of dark modules.
    expect(svg.match(/<rect/g)?.length ?? 0).toBeGreaterThan(50);
  });

  it("honors custom colors and shapes", () => {
    const square = renderQrSvg("hello", {
      color: { dark: "#7c3aed", light: "#ffffff" },
    });
    expect(square).toContain("#7c3aed");

    const dots = renderQrSvg("hello", { shape: "dots" });
    expect(dots).toContain("<circle");

    const diamond = renderQrSvg("hello", { shape: "diamond" });
    expect(diamond).toContain("<path");

    const rounded = renderQrSvg("hello", { shape: "rounded" });
    expect(rounded).toMatch(/<rect[^>]*rx=/);
  });

  it("embeds the logo with a white backing when provided", () => {
    const svg = renderQrSvg("hello", {
      logo: { src: "data:image/png;base64,AAAA", size: 64, padding: 8 },
    });
    expect(svg).toContain("<image");
    expect(svg).toContain('href="data:image/png;base64,AAAA"');
    expect(svg).toContain('fill="#ffffff"');
  });
});
