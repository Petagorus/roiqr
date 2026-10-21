import { expect, test } from "@playwright/test";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("PromptPay single QR renders and test-scan verifies it", async ({ page }) => {
  await page.goto("/");
  await page.locator("#qr-type").click();
  await page.getByRole("option", { name: "PromptPay" }).click();
  await page.getByPlaceholder(/0812345678/).fill("0812345678");
  await expect(page.locator("canvas").first()).toBeVisible();

  // The built-in decoder must read back exactly what was encoded.
  await page.getByRole("button", { name: /test scan/i }).click();
  await expect(page.getByText(/decoded text matches/i)).toBeVisible({ timeout: 10_000 });
});

test("paste from Excel populates the batch and generates", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("tab", { name: /batch/i }).click();
  await page
    .getByLabel(/paste from excel/i)
    .fill("name,link\nAda,https://ada.example\nGrace,https://grace.example\n");
  await page.getByRole("button", { name: /use pasted data/i }).click();
  await expect(page.getByText(/pasted-data\.csv/i)).toBeVisible();

  await page.getByRole("checkbox", { name: "link" }).check();
  await page.getByRole("button", { name: /generate all qr codes/i }).click();
  await expect(page.locator("img[alt^='QR code']").first()).toBeVisible({ timeout: 20_000 });
});

test("PromptPay batch builds per-row payment QRs", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("tab", { name: /batch/i }).click();

  const dir = mkdtempSync(join(tmpdir(), "pp-"));
  const csv = join(dir, "bills.csv");
  writeFileSync(csv, "phone,amount\n0812345678,50\n0898765432,120.75\n");
  await page.setInputFiles("input[type=file]", csv);

  await page.locator("#batch-type").click();
  await page.getByRole("option", { name: "PromptPay" }).click();
  // Target column is preselected (first header); map the amount column too.
  await page.locator("#pp-amount").click();
  await page.getByRole("option", { name: "amount" }).click();

  await page.getByRole("button", { name: /generate all qr codes/i }).click();
  await expect(page.locator("img[alt^='QR code']").first()).toBeVisible({ timeout: 20_000 });
});
