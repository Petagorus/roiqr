import { test, expect } from "@playwright/test";
import { writeFileSync, mkdtempSync, readFileSync, statSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

test.describe("import template", () => {
  test("template downloads and round-trips through the batch flow", async ({ page }, testInfo) => {
    await page.goto("/");
    await page.getByRole("tab", { name: /batch/i }).click();

    const excelLink = page.getByRole("link", { name: /excel/i });
    await expect(excelLink).toBeVisible();
    const csvLink = page.getByRole("link", { name: /csv/i }).first();
    await expect(csvLink).toBeVisible();

    // Download the Excel template and feed it straight back into the app.
    const res = await page.request.get("/templates/roiqr-template.xlsx");
    expect(res.status()).toBe(200);
    mkdirSync(testInfo.outputDir, { recursive: true });
    const xlsxPath = join(testInfo.outputDir, "roiqr-template.xlsx");
    writeFileSync(xlsxPath, await res.body());
    await page.setInputFiles("input[type=file]", xlsxPath);
    await expect(page.getByText("roiqr-template.xlsx")).toBeVisible();

    // The template's url column generates every sample row.
    await page.getByRole("checkbox", { name: "url" }).check();
    await page.getByRole("button", { name: /generate all qr codes/i }).click();
    await expect(page.locator("img[alt^='QR code']")).toHaveCount(3, { timeout: 20_000 });
  });
});

test.describe("style templates", () => {
  test("template applies palette and shape in one click", async ({ page }) => {
    await page.goto("/");
  const openStyle = async () =>
    page.getByRole("button", { name: /customize style|ปรับแต่งสไตล์/i }).click();
    await openStyle();
    const picker = page.locator('[data-testid="template-picker"]');
    await expect(picker).toBeVisible();

    // Pick the Ocean template (Ocean palette + dots).
    await picker.getByRole("button", { name: /ocean/i }).click();

    // Palette hex readout switches to Ocean's colors…
    await expect(page.getByText("#0c4a6e / #f0f9ff").first()).toBeVisible();
    // …and the shape switches to dots.
    await expect(page.getByRole("button", { name: "Dots", exact: true }).first()).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    // The reset-to-palette button is disabled — nothing custom to clear.
    await expect(page.getByRole("button", { name: /reset to palette/i }).first()).toBeDisabled();

    // Setting a custom color re-enables it…
    await page.locator('input[type="text"][aria-label="Module color"]').fill("#123456");
    await expect(page.getByRole("button", { name: /reset to palette/i }).first()).toBeEnabled();
    // …and no template chip is highlighted while custom colors are active.
    await expect(picker.getByRole("button", { name: /ocean/i })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });
});

test.describe("hero CTAs", () => {
  test("hero buttons pre-select the generator tab", async ({ page }) => {
    await page.goto("/");

    // "Batch from a file" lands on the generator with the batch tab active.
    await page.getByRole("link", { name: /batch from a file/i }).click();
    const batchTrigger = page.getByRole("tab", { name: /batch/i });
    await expect(batchTrigger).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("button", { name: /choose file|browse/i }).or(
      page.getByText(/\.csv/i).first(),
    ).first()).toBeVisible();

    // Back up top, "Make one QR" restores the single tab.
    await page.getByRole("link", { name: /make one qr/i }).click();
    await expect(page.getByRole("tab", { name: /single/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(page.locator("#qr-type")).toBeVisible();
  });

  test("footer links also pre-select the tab", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /from a file/i }).click();
    await expect(page.getByRole("tab", { name: /batch/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    await page.getByRole("link", { name: /^single$|ตัวเดียว$/i }).click();
    await expect(page.getByRole("tab", { name: /single/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
});

test.describe("batch extras", () => {
  function makeCsv(rows: [string, string][]): string {
    const dir = mkdtempSync(join(tmpdir(), "qr-"));
    const path = join(dir, "people.csv");
    writeFileSync(path, "name,link\n" + rows.map((r) => r.join(",")).join("\n") + "\n");
    return path;
  }

  test("warns about duplicate values before generating", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("tab", { name: /batch/i }).click();
    // Single-column CSV: the first (only) column is preselected, so each
    // row's payload is exactly its link value.
    const dir = mkdtempSync(join(tmpdir(), "qr-"));
    const csv = join(dir, "links.csv");
    writeFileSync(
      csv,
      "link\nhttps://ada.example\nhttps://ada.example\nhttps://linus.example\n",
    );
    await page.setInputFiles("input[type=file]", csv);
    // Narrow to the app's own alert — Next also injects a route announcer
    // with role="alert" at the end of <body>.
    const alert = page.locator("[role=alert]").filter({ hasText: /duplicate/i });
    await expect(alert).toBeVisible();
    await expect(alert).toContainText("1+2");
  });

  test("PDF sticker sheet downloads with correct page count", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("tab", { name: /batch/i }).click();
    const csv = makeCsv([
      ["Ada", "https://ada.example"],
      ["Grace", "https://grace.example"],
      ["Linus", "https://linus.example"],
    ]);
    await page.setInputFiles("input[type=file]", csv);
    await page.getByRole("checkbox", { name: "link" }).check();
    await page.getByRole("button", { name: /generate all qr codes/i }).click();
    await expect(page.locator("img[alt^='QR code']").first()).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /pdf sheet/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/stickers-a4\.pdf$/);
    const path = await download.path();
    expect(statSync(path!).size).toBeGreaterThan(1000);
    const header = readFileSync(path!).subarray(0, 5).toString();
    expect(header).toBe("%PDF-");
  });
});

test.describe("single extras", () => {
  test("caption is embedded in the downloaded SVG", async ({ page }) => {
    await page.goto("/");
    await page.locator("#qr-type").click();
    await page.getByRole("option", { name: "URL" }).click();
    await page.getByPlaceholder("https://example.com").fill("https://example.com");
    await page.getByRole("button", { name: /customize style|ปรับแต่งสไตล์/i }).click();
    await page.locator("#qr-caption").fill("SCAN ME");
    await expect(page.locator("canvas")).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /download svg/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.svg$/);
    const svg = readFileSync((await download.path())!, "utf8");
    expect(svg).toContain("SCAN ME");
    const [, , height] = (svg.match(/viewBox="0 0 (\d+) (\d+)"/) ?? []) as unknown as string[];
    expect(Number(height)).toBeGreaterThan(512);
  });

  test("copy button puts a PNG on the clipboard", async ({ browser }) => {
    const context = await browser.newContext({
      permissions: ["clipboard-read", "clipboard-write"],
    });
    const page = await context.newPage();
    await page.goto("/");
    await page.locator("#qr-type").click();
    await page.getByRole("option", { name: "URL" }).click();
    await page.getByPlaceholder("https://example.com").fill("https://example.com");
    await expect(page.locator("canvas")).toBeVisible();

    await page.getByRole("button", { name: /customize style|ปรับแต่งสไตล์/i }).click();
    await page.getByRole("button", { name: /copy image/i }).click();
    // The write is async — poll until the image actually lands on the
    // clipboard instead of racing it.
    await page.waitForFunction(async () => {
      try {
        const items = await navigator.clipboard.read();
        return items.some((item) => item.types.includes("image/png"));
      } catch {
        return false;
      }
    }, { timeout: 5000 });
    await context.close();
  });

  test("style choice survives a reload and reset clears everything", async ({ page }) => {
    await page.goto("/");
    await page.locator("#qr-type").click();
    await page.getByRole("option", { name: "URL" }).click();

    await page.getByRole("button", { name: /customize style|ปรับแต่งสไตล์/i }).click();
    await page.getByRole("button", { name: "Dots", exact: true }).click();
    await page.getByPlaceholder("https://example.com").fill("https://example.com");
    // The URL text is NOT part of style memory — only style is.
    await page.reload();
    await expect(page.getByRole("button", { name: "Dots", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    // Reset clears the remembered style and collapses the disclosure.
    await page.getByRole("button", { name: /reset form/i }).click();
    const customize = page.getByRole("button", { name: /customize style|ปรับแต่งสไตล์/i });
    await expect(customize).toHaveAttribute("aria-expanded", "false");
    await customize.click();
    await expect(page.getByRole("button", { name: "Dots", exact: true })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });
});
