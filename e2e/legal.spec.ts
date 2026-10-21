import { test, expect } from "@playwright/test";

test.describe("legal pages", () => {
  test("footer links to Terms and Privacy, both pages render", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer.getByRole("link", { name: /terms of service/i })).toBeVisible();
    await expect(footer.getByRole("link", { name: /privacy policy/i })).toBeVisible();

    // Terms page
    await footer.getByRole("link", { name: /terms of service/i }).click();
    await expect(page).toHaveURL(/\/terms$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/terms/i);
    await expect(page.getByText(/acceptable use/i)).toBeVisible();

    // Privacy page
    await page.goto("/privacy");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/privacy/i);
    await expect(page.getByText(/never leave your device/i)).toBeVisible();
    // Legal pages keep the site's nav and footer for navigation back.
    await expect(page.locator("footer").getByRole("link", { name: /privacy policy/i })).toBeVisible();
  });

  test("logo in the nav returns to the home page", async ({ page }) => {
    await page.goto("/privacy");
    await page.getByRole("link", { name: /RoiQR — home/i }).click();
    await expect(page).toHaveURL(/localhost:\d+\/$/);
    await expect(page.getByRole("tab", { name: /single/i })).toBeVisible();
  });

  test("footer product links return home AND select the tab", async ({ page }) => {
    await page.goto("/privacy");

    // "Batch" navigates home with the batch tab active.
    await page.locator("footer").getByRole("link", { name: /batch/i }).click();
    await expect(page).toHaveURL(/#generator$/);
    await expect(page.getByRole("tab", { name: /batch/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(page.getByText(/\.xlsx/i).first()).toBeVisible();

    // Back to a legal page; "Single" returns home on the single tab.
    await page.goto("/terms");
    await page.locator("footer").getByRole("link", { name: /^single$|ตัวเดียว$/i }).click();
    await expect(page).toHaveURL(/#generator$/);
    await expect(page.getByRole("tab", { name: /single/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  test("legal pages are indexable and in the sitemap", async ({ page, request }) => {
    for (const path of ["/terms", "/privacy"]) {
      const res = await request.get(path);
      expect(res.status()).toBe(200);
    }
    await page.goto("/terms");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/terms$/);

    const sitemap = await request.get("/sitemap.xml");
    const body = await sitemap.text();
    expect(body).toContain("/terms");
    expect(body).toContain("/privacy");
  });
});
