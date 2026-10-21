import { test, expect } from "@playwright/test";

test("locale switch updates text instantly without reload", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("QR codes that work");

  // Open the locale menu and pick Thai
  await page.getByRole("button", { name: /english/i }).click();
  await page.getByRole("button", { name: "ไทย" }).click();

  // Hero title should be Thai immediately — no reload
  await expect(page.getByRole("heading", { level: 1 })).toContainText("QR code ที่สแกนได้จริง");
  // The generator heading and tab labels should be Thai too
  await expect(page.getByRole("tab", { name: "ตัวเดียว" })).toBeVisible();

  // Switch back to English instantly
  await page.getByRole("button", { name: /ไทย/i }).click();
  await page.getByRole("button", { name: "English" }).click();
  await expect(page.getByRole("tab", { name: "Single" })).toBeVisible();
});
