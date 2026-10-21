import { describe, expect, it } from "vitest";

import { createZipBlob, dataUrlToBytes, safeFilename } from "../zip";

// jsdom's Blob lacks .arrayBuffer(), so read through FileReader instead.
async function toBytes(blob: Blob): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.onerror = () => reject(new Error("Failed to read blob"));
    reader.readAsArrayBuffer(blob);
  });
}

describe("createZipBlob", () => {
  it("produces a zip with local header, entries and end-of-central-directory", async () => {
    const blob = createZipBlob([
      { name: "one.png", data: new Uint8Array([1, 2, 3, 4]) },
      { name: "two.png", data: new Uint8Array([9, 8, 7]) },
    ]);
    const bytes = await toBytes(blob);

    // Local file header signature "PK\x03\x04".
    expect([bytes[0], bytes[1], bytes[2], bytes[3]]).toEqual([0x50, 0x4b, 0x03, 0x04]);

    // End-of-central-directory signature "PK\x05\x06" in the final 22 bytes.
    const eocd = bytes.length - 22;
    expect([bytes[eocd], bytes[eocd + 1], bytes[eocd + 2], bytes[eocd + 3]]).toEqual([
      0x50, 0x4b, 0x05, 0x06,
    ]);
    const view = new DataView(bytes.buffer, eocd, 22);
    expect(view.getUint16(8, true)).toBe(2); // entries on this disk
    expect(view.getUint16(10, true)).toBe(2); // total entries

    // Entry names are stored.
    const text = new TextDecoder().decode(bytes);
    expect(text).toContain("one.png");
    expect(text).toContain("two.png");
  });

  it("stores entry data raw and uncompressed", async () => {
    const data = new Uint8Array([1, 2, 3, 4]);
    const blob = createZipBlob([{ name: "one.png", data }]);
    const bytes = await toBytes(blob);
    // 30-byte local header + 7-byte name, then the raw data.
    const start = 30 + "one.png".length;
    expect(Array.from(bytes.slice(start, start + data.length))).toEqual([1, 2, 3, 4]);
  });
});

describe("dataUrlToBytes", () => {
  it("decodes base64 payload from a data URL", () => {
    const bytes = dataUrlToBytes("data:text/plain;base64,SGVsbG8=");
    expect(Array.from(bytes)).toEqual([72, 101, 108, 108, 111]); // "Hello"
  });
});

describe("safeFilename", () => {
  it("strips reserved characters and collapses whitespace", () => {
    expect(safeFilename('a/b:c*?"<>|d', "x-1")).toBe("a b c d");
  });

  it("falls back when the value is empty", () => {
    expect(safeFilename("   ", "x-1")).toBe("x-1");
  });
});
