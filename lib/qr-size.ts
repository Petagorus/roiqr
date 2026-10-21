// QR image size presets. The base is 512px (1x); each preset is a multiple of
// that base, and a custom size can override any of them.

export const BASE_SIZE = 512;

export interface SizePreset {
  /** Value stored in the Select / radio. */
  value: string;
  /** Display label, e.g. "2x". */
  label: string;
  /** Pixel width produced from this preset. */
  pixels: number;
}

export const SIZE_PRESETS: SizePreset[] = [
  { value: "1x", label: "1x", pixels: BASE_SIZE },
  { value: "2x", label: "2x", pixels: BASE_SIZE * 2 },
  { value: "4x", label: "4x", pixels: BASE_SIZE * 4 },
  { value: "8x", label: "8x", pixels: BASE_SIZE * 8 },
  { value: "10x", label: "10x", pixels: BASE_SIZE * 10 },
];

export const DEFAULT_PRESET = "2x";

/**
 * Resolve the final pixel width from the selected preset and any custom
 * override. A custom value wins when it is a valid positive integer; otherwise
 * the preset value is used.
 */
export function resolveSize(preset: string, custom: string): number {
  const trimmed = custom.trim();
  if (trimmed !== "") {
    const parsed = Number(trimmed);
    if (Number.isInteger(parsed) && parsed > 0) {
      return Math.min(parsed, 10000);
    }
  }
  return SIZE_PRESETS.find((p) => p.value === preset)?.pixels ?? BASE_SIZE * 2;
}
