import { test, expect } from "@playwright/test";
import { writeFileSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("download all produces a single zip containing every QR", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("tab", { name: /batch/i }).click();

  const dir = mkdtempSync(join(tmpdir(), "qr-zip-"));
  const csvPath = join(dir, "people.csv");
  writeFileSync(csvPath, "name,link\nAda,https://ada.example\nGrace,https://grace.example\nLinus,https://linus.example\n");

  await page.setInputFiles("input[type=file]", csvPath);
  await page.getByRole("checkbox", { name: "name" }).uncheck();
  await page.getByRole("checkbox", { name: "link" }).check();
  await page.getByRole("button", { name: /generate all qr codes/i }).click();
  await expect(page.locator("img[alt^='QR code']").first()).toBeVisible();

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: /download all/i }).click(),
  ]);

  // One archive — not a burst of individual PNGs the browser may block.
  expect(download.suggestedFilename()).toMatch(/\.zip$/);
  const path = await download.path();
  const bytes = readFileSync(path!);
  // ZIP magic "PK\x03\x04" and 3 entries recorded in the end-of-central-directory.
  expect(bytes[0]).toBe(0x50);
  expect(bytes[1]).toBe(0x4b);
  expect(bytes[2]).toBe(0x03);
  expect(bytes[3]).toBe(0x04);
  const eocd = bytes.length - 22;
  expect(bytes.readInt16LE(eocd + 10)).toBe(3);
});
