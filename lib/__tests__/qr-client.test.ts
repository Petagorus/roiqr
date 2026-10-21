import { describe, expect, it } from "vitest";

import { generateBatch, generateQrClient } from "../qr-client";

describe("generateQrClient", () => {
  it("renders a data URL for a URL payload", async () => {
    const result = await generateQrClient("url", { url: "https://example.com" });
    expect(result.dataUrl).toMatch(/^data:image\/png;base64,/);
    expect(result.payload).toBe("https://example.com");
  });
});

describe("generateBatch", () => {
  it("renders many codes and captures bad rows", async () => {
    const { results, errors } = await generateBatch(
      "geo",
      [
        { geoLat: "1", geoLon: "2" },
        { geoLat: "", geoLon: "" },
      ],
    );

    expect(results).toHaveLength(1);
    expect(errors).toHaveLength(1);
    expect(errors[0]?.index).toBe(1);
  });
});
