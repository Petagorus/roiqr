import { test, expect } from "@playwright/test";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

test.describe("single JSON QR", () => {
  test("validates, minifies and reports the byte size", async ({ page }) => {
    await page.goto("/");
    await page.locator("#qr-type").click();
    await page.getByRole("option", { name: "JSON" }).click();

    const jsonField = page.locator("#field-json");

    // Broken JSON shows an inline error and blocks generation.
    await jsonField.fill('{"id": "A1",,}');
    await expect(page.locator("#field-json ~ p[role=alert], p[role=alert]").first()).toBeVisible();
    await expect(page.locator("canvas")).not.toBeVisible();

    // Valid JSON is minified automatically and the byte counter appears.
    await jsonField.fill('{\n  "id": "A1",\n  "qty": 2\n}');
    await expect(page.getByText(/19 bytes/)).toBeVisible();
    await expect(page.getByText(/2 keys/)).toBeVisible();

    await expect(page.locator("canvas")).toBeVisible();

    // The "scans to" payload is the minified JSON, not the pretty text.
    await expect(page.getByText('{"id":"A1","qty":2}')).toBeVisible();
  });

  test("oversized JSON is flagged before generating", async ({ page }) => {
    await page.goto("/");
    await page.locator("#qr-type").click();
    await page.getByRole("option", { name: "JSON" }).click();

    const bigValue = "x".repeat(1300);
    await page
      .locator("#field-json")
      .fill(JSON.stringify({ id: bigValue }));
    await expect(page.getByText(/too large/i)).toBeVisible();
  });
});

test.describe("batch JSON builder", () => {
  test("template placeholders assemble per-row JSON; broken rows are skipped", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("tab", { name: /batch/i }).click();

    const dir = mkdtempSync(join(tmpdir(), "qr-"));
    const csvPath = join(dir, "items.csv");
    // Bob's qty is not a number — the unquoted {qty} brace makes his row
    // invalid JSON, so it must be skipped with an error.
    writeFileSync(
      csvPath,
      "name,qty\nAda,1\nBob,two\nCara,3\n",
    );
    await page.setInputFiles("input[type=file]", csvPath);

    // Switch the batch content type to JSON.
    await page.locator("#batch-type").click();
    await page.getByRole("option", { name: "JSON" }).click();

    const template = page.locator("#json-template");
    await template.fill('{"id":"{name}","qty":{qty}}');
    await page.getByRole("button", { name: /generate all qr codes/i }).click();

    // Two valid rows generate…
    await expect(page.locator("img[alt^='QR code']")).toHaveCount(2, { timeout: 20_000 });
    // …and the broken row is reported as skipped.
    await expect(page.getByText(/1 row skipped/)).toBeVisible();

    // Ada's code scans to her assembled JSON.
    await expect(page.getByText('{"id":"Ada","qty":1}').first()).toBeVisible();
  });
});
