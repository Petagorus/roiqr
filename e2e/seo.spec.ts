import { test, expect } from "@playwright/test";

test.describe("SEO / AEO / GEO", () => {
  test("home page carries a valid JSON-LD graph", async ({ page }) => {
    await page.goto("/");
    const raw = await page
      .locator('script[type="application/ld+json"]')
      .first()
      .textContent();
    expect(raw).toBeTruthy();
    const graph = JSON.parse(raw!);
    expect(graph["@context"]).toBe("https://schema.org");
    const types = graph["@graph"].map((n: { "@type": string }) => n["@type"]);
    for (const t of ["Organization", "WebSite", "SoftwareApplication", "FAQPage"]) {
      expect(types).toContain(t);
    }
  });

  test("FAQ section renders the same questions as the schema", async ({ page }) => {
    await page.goto("/");
    const faq = page.locator("#faq");
    await expect(faq).toBeVisible();
    // Bilingual default-locale question from the shared content source.
    await expect(
      faq.getByText("Is RoiQR free to use?").or(faq.getByText("RoiQR ใช้ฟรีหรือเปล่า?")),
    ).toBeVisible();
    const questions = await faq.locator("h3").count();
    expect(questions).toBeGreaterThanOrEqual(6);
  });

  test("llms.txt and llms-full.txt are served", async ({ request }) => {
    const brief = await request.get("/llms.txt");
    expect(brief.status()).toBe(200);
    expect(await brief.text()).toContain("RoiQR");

    const full = await request.get("/llms-full.txt");
    expect(full.status()).toBe(200);
    expect(await full.text()).toContain("Batch QR codes");
  });

  test("robots.txt explicitly allows AI crawlers and points to the sitemap", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    expect(robots.status()).toBe(200);
    const body = (await robots.text()).toLowerCase();
    for (const bot of ["gptbot", "claudebot", "perplexitybot", "google-extended"]) {
      expect(body).toContain(`user-agent: ${bot}`);
    }
    expect(body).toContain("sitemap:");
  });

  test("sitemap and canonical URL resolve", async ({ page, request }) => {
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    expect(await sitemap.text()).toContain("<urlset");

    await page.goto("/");
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  });
});
