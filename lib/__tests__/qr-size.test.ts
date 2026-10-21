import { describe, expect, it } from "vitest";

import { BASE_SIZE, DEFAULT_PRESET, SIZE_PRESETS, resolveSize } from "@/lib/qr-size";

describe("qr-size", () => {
  it("exposes the five presets with correct pixel multiples", () => {
    expect(SIZE_PRESETS).toEqual([
      { value: "1x", label: "1x", pixels: BASE_SIZE },
      { value: "2x", label: "2x", pixels: BASE_SIZE * 2 },
      { value: "4x", label: "4x", pixels: BASE_SIZE * 4 },
      { value: "8x", label: "8x", pixels: BASE_SIZE * 8 },
      { value: "10x", label: "10x", pixels: BASE_SIZE * 10 },
    ]);
  });

  it("defaults to 2x", () => {
    expect(DEFAULT_PRESET).toBe("2x");
  });

  it("returns the preset pixels when no custom value is set", () => {
    expect(resolveSize("2x", "")).toBe(BASE_SIZE * 2);
    expect(resolveSize("10x", "")).toBe(BASE_SIZE * 10);
  });

  it("honors a valid custom integer", () => {
    expect(resolveSize("2x", "1500")).toBe(1500);
    expect(resolveSize("4x", " 2048 ")).toBe(2048);
  });

  it("ignores invalid custom values and falls back to the preset", () => {
    expect(resolveSize("2x", "abc")).toBe(BASE_SIZE * 2);
    expect(resolveSize("8x", "-100")).toBe(BASE_SIZE * 8);
    expect(resolveSize("8x", "0")).toBe(BASE_SIZE * 8);
  });

  it("clamps oversized custom values to 10000px", () => {
    expect(resolveSize("2x", "999999")).toBe(10000);
  });
});
