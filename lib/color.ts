/**
 * Normalize a user-typed color string into a strict `#rrggbb` hex value.
 * Accepts `abc`, `#abc`, `aabbcc`, `#AABBCC`; returns null when the input is
 * not yet a complete hex color so callers can keep the last valid value.
 */
export function normalizeHex(input: string): string | null {
  const trimmed = input.trim().replace(/^#?/, "");
  if (!/^[0-9a-fA-F]{3}$/.test(trimmed) && !/^[0-9a-fA-F]{6}$/.test(trimmed)) {
    return null;
  }
  const s = trimmed.toLowerCase();
  const expanded = s.length === 3 ? s.split("").map((c) => c + c).join("") : s;
  return `#${expanded}`;
}
