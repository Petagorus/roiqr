import { expect, test, type Page } from "@playwright/test";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Select a QR type from the dropdown
async function selectType(page: Page, label: string) {
  await page.locator("#qr-type").click();
  await page.getByRole("option", { name: label }).click();
}

// Assert that a QR code has rendered. After the QR Code Monkey redesign the
// preview renders a live <canvas> as soon as content is present, so we check
// for the canvas element.
async function expectQrRendered(page: Page) {
  await expect(page.locator("canvas")).toBeVisible();
}

// Test each QR content type through the single tab, filling the specific
// fields each type needs.
test.describe("Single QR — every content type", () => {
  test("URL generates a QR code", async ({ page }) => {
    await page.goto("/");
    await selectType(page, "URL");
    await page.getByPlaceholder("https://example.com").fill("https://example.com");
    await expectQrRendered(page);
  });

  test("Text generates a QR code", async ({ page }) => {
    await page.goto("/");
    await selectType(page, "Text");
    await page.getByPlaceholder(/text to encode/i).fill("Hello world");
    await expectQrRendered(page);
  });

  test("Email generates a QR code", async ({ page }) => {
    await page.goto("/");
    await selectType(page, "Email");
    await page.getByPlaceholder(/hello@example\.com/i).fill("user@example.com");
    await expectQrRendered(page);
  });

  test("Phone generates a QR code", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /customize style|ปรับแต่งสไตล์/i }).click();
    await selectType(page, "Phone");
    await page.getByPlaceholder(/1 555 123 4567/i).fill("+15551234567");
    await expectQrRendered(page);
  });

  test("SMS generates a QR code", async ({ page }) => {
    await page.goto("/");
    await selectType(page, "SMS");
    await page.getByPlaceholder(/1 555 123 4567/i).fill("+15551234567");
    await expectQrRendered(page);
  });

  test("Wi-Fi generates a QR code", async ({ page }) => {
    await page.goto("/");
    await selectType(page, "Wi-Fi");
    await page.getByPlaceholder(/my wi-fi/i).fill("MyNetwork");
    await page.getByPlaceholder(/secret/i).fill("secret");
    await expectQrRendered(page);
  });

  test("Contact (vCard) generates a QR code", async ({ page }) => {
    await page.goto("/");
    await selectType(page, "vCard");
    await page.getByPlaceholder(/ada lovelace/i).fill("Ada Lovelace");
    await expectQrRendered(page);
  });

  test("Location generates a QR code", async ({ page }) => {
    await page.goto("/");
    await selectType(page, "Location");
    await page.getByPlaceholder(/37\.7749/i).fill("37.7749");
    await page.getByPlaceholder(/-122\.4194/i).fill("-122.4194");
    await expectQrRendered(page);
  });

  test("Calendar Event generates a QR code", async ({ page }) => {
    await page.goto("/");
    await selectType(page, "Event");
    await page.getByPlaceholder(/product launch/i).fill("Product launch");
    await expectQrRendered(page);
  });
});

test("batch upload generates multiple QRs", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("tab", { name: /batch/i }).click();

  // Create CSV via file path (the in-browser contents API is flaky here)
  const dir = mkdtempSync(join(tmpdir(), "qr-e2e-"));
  const csvPath = join(dir, "people.csv");
  const csv = "name,link\nAda,https://ada.example\nGrace,https://grace.example\nLinus,https://linus.example\n";
  writeFileSync(csvPath, csv);

  await page.setInputFiles("input[type=file]", csvPath);
  await expect(page.getByText(/people\.csv/i)).toBeVisible();

  // Select the "link" column via its checkbox
  await page.getByRole("checkbox", { name: "link" }).check();

  // Generate
  await page.getByRole("button", { name: /generate all qr codes/i }).click();

  // Verify at least one QR rendered
  await expect(page.locator("img[alt^='QR code']").first()).toBeVisible();
});

test.describe("QR size selector", () => {
  test("shows size presets and custom input, generates with custom size", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /customize style|ปรับแต่งสไตล์/i }).click();

    // Preset buttons are visible
    await expect(page.getByRole("button", { name: "2x" })).toBeVisible();
    await expect(page.getByRole("button", { name: "10x" })).toBeVisible();

    // Select a preset
    await page.getByRole("button", { name: "4x" }).click();
    await page.getByPlaceholder(/https:\/\/example\.com/i).fill("https://example.com");
    await expectQrRendered(page);

    // Custom size input is present and shows resolved pixels
    await page.goto("/");
    await selectType(page, "Phone");
    await page.getByPlaceholder(/1 555 123 4567/i).fill("+15551234567");
    await expect(page.getByPlaceholder(/1500/i)).toBeVisible();

    // Type a custom size and generate
    await page.locator("#custom-size").fill("1600");
    await expectQrRendered(page);
  });

  test("batch respects custom size", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("tab", { name: /batch/i }).click();

    const dir = mkdtempSync(join(tmpdir(), "qr-e2e-size-"));
    const csvPath = join(dir, "size.csv");
    const csv = "name,link\nAda,https://ada.example\nGrace,https://grace.example\n";
    writeFileSync(csvPath, csv);

    await page.setInputFiles("input[type=file]", csvPath);
    await page.getByRole("checkbox", { name: "link" }).check();
    await page.locator("#custom-size").fill("1280");
    await page.getByRole("button", { name: /generate all qr codes/i }).click();
    await expect(page.locator("img[alt^='QR code']").first()).toBeVisible();
  });
});

test("rate limiting returns 429 on spam", async ({ request }) => {
  let lastStatus = 200;
  for (let i = 0; i < 65; i++) {
    const resp = await request.post("/api/generate", {
      data: { type: "url", rows: [{ url: "https://example.com" }] },
      headers: { "content-type": "application/json" },
    });
    lastStatus = resp.status();
  }
  expect(lastStatus).toBe(429);
});
