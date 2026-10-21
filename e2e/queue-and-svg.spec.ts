import { test, expect } from "@playwright/test";
import { writeFileSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("batch queue admits concurrent jobs up to the limit and queues the rest", async ({
  request,
}) => {
  const acquired: string[] = [];
  let queuedTicket: string | null = null;
  try {
    // Wait for a free slot (parallel tests may hold some; leaked tickets age
    // out via TTL, so this always clears eventually).
    let free = 0;
    for (let attempt = 0; attempt < 30 && free === 0; attempt += 1) {
      const s = await (await request.get("/api/batch/queue")).json();
      free = s.limit - s.activeCount;
      if (free === 0) await new Promise((r) => setTimeout(r, 500));
    }
    expect(free).toBeGreaterThan(0);

    // Acquire until the queue actually rejects a ticket. The limit adapts to
    // live machine pressure between samples, so the reported headroom is
    // advisory — filling exactly `free` races with a limit that can grow.
    let queuedData: { active: boolean; position: number } | null = null;
    for (let i = 0; i < 20 && !queuedData; i += 1) {
      const res = await request.post("/api/batch/queue", {
        data: { action: "acquire" },
        headers: { "content-type": "application/json" },
      });
      const data = await res.json();
      if (data.active) {
        acquired.push(data.ticket);
      } else {
        queuedData = data;
        queuedTicket = data.ticket;
      }
    }
    expect(queuedData).not.toBeNull();
    expect(queuedData!.active).toBe(false);
    expect(queuedData!.position).toBeGreaterThan(0);

    // Releasing one promotes the waiter.
    await request.post("/api/batch/queue", {
      data: { action: "release", ticket: acquired[0] },
      headers: { "content-type": "application/json" },
    });
    const status = await request.get(`/api/batch/queue?ticket=${queuedTicket}`);
    const statusData = await status.json();
    expect(statusData.active).toBe(true);
    expect(statusData.position).toBe(0);
  } finally {
    // Never leak tickets — other parallel tests need the slots.
    for (const t of acquired) {
      await request.post("/api/batch/queue", {
        data: { action: "release", ticket: t },
        headers: { "content-type": "application/json" },
      });
    }
    if (queuedTicket) {
      await request.post("/api/batch/queue", {
        data: { action: "release", ticket: queuedTicket },
        headers: { "content-type": "application/json" },
      });
    }
  }
});

test("single QR offers an SVG download", async ({ page }) => {
  await page.goto("/");
  await page.getByPlaceholder("https://example.com").fill("https://example.com");
  const svgButton = page.getByRole("button", { name: /download svg/i });
  await svgButton.waitFor({ state: "visible" });

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    svgButton.click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/\.svg$/);
  const bytes = readFileSync(await download.path());
  expect(bytes.toString("utf8").startsWith("<svg")).toBe(true);
});

test("single download uses a content-based filename", async ({ page }) => {
  await page.goto("/");
  await page.getByPlaceholder("https://example.com").fill("https://scb.co.th/th");
  const pngButton = page.getByRole("button", { name: /download png/i });
  await pngButton.waitFor({ state: "visible" });

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    pngButton.click(),
  ]);
  expect(download.suggestedFilename()).toBe("scb.co.th.png");
});

test("batch end-to-end still generates and zips with the queue in place", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("tab", { name: /batch/i }).click();

  const dir = mkdtempSync(join(tmpdir(), "qr-queue-e2e-"));
  const csvPath = join(dir, "people.csv");
  writeFileSync(csvPath, "name,link\nAda,https://ada.example\nGrace,https://grace.example\n");

  await page.setInputFiles("input[type=file]", csvPath);
  await page.getByRole("checkbox", { name: "link" }).check();
  await page.getByRole("button", { name: /generate all qr codes/i }).click();
  await expect(page.locator("img[alt^='QR code']").first()).toBeVisible();

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: /download all/i }).click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/\.zip$/);
  const bytes = readFileSync(await download.path());
  expect(bytes.readInt16LE(bytes.length - 22 + 10)).toBe(2);
});
