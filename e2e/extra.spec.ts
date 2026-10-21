import { expect, test } from "@playwright/test";

test("download PNG button appears after generation", async ({ page }) => {
  await page.goto("/");
  await page.locator("#qr-type").click();
  await page.getByRole("option", { name: "URL" }).click();
  await page.getByPlaceholder("https://example.com").fill("https://example.com");
  // Live preview renders the code without any generate step.
  await expect(page.locator("canvas")).toBeVisible();
  // Download button should be present and enabled
  await expect(page.getByRole("button", { name: /download png/i })).toBeEnabled();
});

test("invalid geo leaves the download disabled and no QR", async ({ page }) => {
  await page.goto("/");
  await page.locator("#qr-type").click();
  await page.getByRole("option", { name: "Location" }).click();
  // Leave lat/lon empty -> payload is empty, nothing to download
  await expect(page.getByRole("button", { name: /download png/i })).toBeDisabled();
  await expect(page.locator("canvas")).not.toBeVisible();
});

test("empty URL leaves download disabled until content is entered", async ({ page }) => {
  await page.goto("/");
  await page.locator("#qr-type").click();
  await page.getByRole("option", { name: "URL" }).click();
  await expect(page.getByRole("button", { name: /download png/i })).toBeDisabled();
  await expect(page.locator("canvas")).not.toBeVisible();

  // Typing a URL enables the download immediately — no generate step.
  await page.getByPlaceholder("https://example.com").fill("https://example.com");
  await expect(page.getByRole("button", { name: /download png/i })).toBeEnabled();
});
