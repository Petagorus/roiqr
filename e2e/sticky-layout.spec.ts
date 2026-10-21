import { test, expect } from "@playwright/test";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("sticky preview never overlaps results", async ({ page }) => {
  await page.setViewportSize({ width: 1386, height: 1080 });
  await page.goto("/");
  await page.getByRole("tab", { name: /จากไฟล์|batch/i }).click();
  const dir = mkdtempSync(join(tmpdir(), "qr-geo-"));
  const csvPath = join(dir, "people.csv");
  writeFileSync(csvPath, "name,link\nAda,https://ada.example\nGrace,https://grace.example\nLinus,https://linus.example\n");
  await page.setInputFiles("input[type=file]", csvPath);
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: /generate all qr codes|สร้าง QR code ทั้งหมด/i }).click();
  await page.waitForTimeout(800);
  // Scroll through the whole page; at every step the sticky preview must not
  // overlap the results section.
  for (let y = 0; y <= 2200; y += 400) {
    await page.evaluate((v) => window.scrollTo({ top: v, behavior: "instant" }), y);
    await page.waitForTimeout(120);
    const overlap = await page.evaluate(() => {
      const form = document.querySelector("#generator form.grid") as HTMLElement;
      const kids = Array.from(form.children) as HTMLElement[];
      const sticky = kids.find((k) => k.className.includes("self-stretch"))?.firstElementChild as HTMLElement;
      const results = kids.find((k) => k.className.includes("col-span-2")) as HTMLElement;
      if (!sticky || !results) return null;
      const s = sticky.getBoundingClientRect();
      const r = results.getBoundingClientRect();
      // overlap = sticky bottom extends into results top
      return Math.round(s.bottom - r.top);
    });
    if (overlap !== null) {
      expect(overlap, `scrollY=${y}`).toBeLessThanOrEqual(0);
    }
  }
});
