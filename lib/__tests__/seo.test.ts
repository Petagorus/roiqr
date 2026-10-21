import { describe, expect, it } from "vitest";

import { FAQ_ITEMS } from "../faq-content";
import { buildSeoJsonLd } from "../seo";

describe("buildSeoJsonLd", () => {
  const graph = buildSeoJsonLd();
  const typed = (type: string) =>
    (graph["@graph"] as { "@type": string }[]).filter((n) => n["@type"] === type);

  it("defines the RoiQR entity, website, app and FAQ in one graph", () => {
    expect(typed("Organization")).toHaveLength(1);
    expect(typed("WebSite")).toHaveLength(1);
    expect(typed("SoftwareApplication")).toHaveLength(1);
    expect(typed("FAQPage")).toHaveLength(1);
  });

  it("marks the application as free web software with features", () => {
    const app = typed("SoftwareApplication")[0] as Record<string, unknown>;
    expect(app.name).toBe("RoiQR");
    expect(app.isAccessibleForFree).toBe(true);
    expect(app.applicationCategory).toBe("UtilitiesApplication");
    expect((app.offers as Record<string, unknown>).price).toBe("0");
    expect(app.featureList as string[]).toContain(
      "Batch QR generation from .xlsx / .xls / .csv",
    );
  });

  it("mirrors the on-page FAQ in both languages", () => {
    const faq = typed("FAQPage")[0] as unknown as { mainEntity: { name: string }[] };
    expect(faq.mainEntity).toHaveLength(FAQ_ITEMS.length * 2);
    for (const item of FAQ_ITEMS) {
      expect(faq.mainEntity.map((q) => q.name)).toContain(item.q.th);
      expect(faq.mainEntity.map((q) => q.name)).toContain(item.q.en);
    }
  });

  it("serializes to valid JSON without expando keys", () => {
    expect(() => JSON.parse(JSON.stringify(graph))).not.toThrow();
    expect(graph["@context"]).toBe("https://schema.org");
  });
});
