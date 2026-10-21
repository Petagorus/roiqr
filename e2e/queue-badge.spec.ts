import { test, expect } from "@playwright/test";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("queue badge appears when all slots are busy", async ({ page, request }) => {
  // Fill every slot from the API side. The limit adapts to live machine
  // pressure (see sampleCapacity), so read it instead of assuming the base
  // limit of 10 — and grab a small margin in case it grows before the batch
  // reaches the queue.
  const limit = (await (await request.get("/api/batch/queue")).json()).limit;
  const tickets: string[] = [];
  for (let i = 0; i < limit + 3; i += 1) {
    const res = await request.post("/api/batch/queue", {
      data: { action: "acquire" },
      headers: { "content-type": "application/json" },
    });
    tickets.push((await res.json()).ticket);
  }

  try {
    await page.goto("/");
    await page.getByRole("tab", { name: /batch/i }).click();
    const dir = mkdtempSync(join(tmpdir(), "qr-badge-"));
    const csvPath = join(dir, "people.csv");
    writeFileSync(csvPath, "name,link\nAda,https://ada.example\n");
    await page.setInputFiles("input[type=file]", csvPath);
    await page.getByRole("checkbox", { name: "link" }).check();
    await page.getByRole("button", { name: /generate all qr codes/i }).click();

    // The waiting badge must appear while all slots are taken. Scope to the
    // app's own status line — Next's dev overlay also injects role=status.
    await expect(
      page.getByRole("status").filter({ hasText: /ahead of you/ }),
    ).toContainText(/queue\(s\) ahead/i, {
      timeout: 10_000,
    });
    await page.screenshot({ path: "/tmp/queue-badge.png" });
  } finally {
    // Let the waiting job through, verify it finishes, then release everything.
    for (const t of tickets) {
      await request.post("/api/batch/queue", {
        data: { action: "release", ticket: t },
        headers: { "content-type": "application/json" },
      });
    }
    await expect(page.locator("img[alt^='QR code']").first()).toBeVisible({
      timeout: 30_000,
    });
  }
});
