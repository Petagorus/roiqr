import { expect, test } from "@playwright/test";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("loads the landing page with the hero and generator", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText(/QR codes that work/i)).toBeVisible();

  // Both entry points are present.
  await expect(
    page.getByRole("link", { name: /make one qr/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /batch from a file/i }),
  ).toBeVisible();

  await expect(page.locator("#generator")).toBeVisible();
});

test("generates a single QR code from the single tab", async ({ page }) => {
  await page.goto("/");

  const urlInput = page.getByPlaceholder("https://example.com");
  await urlInput.fill("https://example.com");


  await expect(page.locator("canvas")).toBeVisible();
  await expect(page.getByText("https://example.com")).toBeVisible();
});

test("renders at least one QR in the batch tab after upload", async ({ page }) => {
  await page.goto("/");

  // Switch to the Batch tab.
  await page.getByRole("tab", { name: /batch/i }).click();

  // Create a small CSV file and upload it.
  const dir = mkdtempSync(join(tmpdir(), "qr-e2e-"));
  const csvPath = join(dir, "people.csv");
  const csv = "name,link\nAda,https://ada.example\nGrace,https://grace.example\n";
  writeFileSync(csvPath, csv);
  await page.setInputFiles("input[type=file]", csvPath);

  // Wait for the file info chip to appear, then pick the "link" column.
  await expect(page.getByText(/people\.csv/i)).toBeVisible();
  await page.getByRole("checkbox", { name: "link" }).check();

  await page.getByRole("button", { name: /generate all qr codes/i }).click();

  // At least one QR image should render.
  await expect(page.locator("img[alt^='QR code']").first()).toBeVisible();
});
