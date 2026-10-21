import { test, expect } from "@playwright/test";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("single QR generation works", async ({ page }) => {
  await page.goto("/");
  await page.locator("#qr-type").click();
  await page.getByRole("option", { name: "URL" }).click();
  await page.getByPlaceholder("https://example.com").fill("https://example.com");
  await expect(page.locator("canvas")).toBeVisible();
  await expect(page.getByRole("button", { name: /download png/i })).toBeVisible();
});

test("batch upload works", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("tab", { name: /batch/i }).click();
  const dir = mkdtempSync(join(tmpdir(), "qr-"));
  const csvPath = join(dir, "people.csv");
  writeFileSync(csvPath, "name,link\nAda,https://ada.example\nGrace,https://grace.example\n");
  await page.setInputFiles("input[type=file]", csvPath);
  await expect(page.getByText("people.csv")).toBeVisible();
  await page.getByRole("checkbox", { name: "link" }).check();
  await page.getByRole("button", { name: /generate all qr codes/i }).click();
  await expect(page.locator("img[alt^='QR code']").first()).toBeVisible();
});

test("rate limiter returns 429", async ({ request }) => {
  let last = 200;
  for (let i = 0; i < 65; i++) {
    const r = await request.post("/api/generate", {
      data: { type: "url", rows: [{ url: "https://example.com" }] },
      headers: { "content-type": "application/json" },
    });
    last = r.status();
  }
  expect(last).toBe(429);
});
