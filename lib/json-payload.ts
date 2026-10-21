/**
 * JSON payload helpers for the "JSON" QR type and the batch JSON template
 * builder. A programmer can dictate a JSON shape ("my scanner reads this")
 * and the app guarantees the generated payload is valid, minified, and small
 * enough to still scan.
 */

/**
 * Practical capacity ceiling. The renderer always uses error-correction H
 * (logo support), where byte mode tops out at 1273 bytes for version 40.
 */
export const JSON_MAX_BYTES = 1273;
/** Above this size the QR version grows fast and print quality suffers. */
export const JSON_WARN_BYTES = 500;

/** UTF-8 byte length — Thai and emoji count as more than one byte. */
export function jsonByteLength(text: string): number {
  return new TextEncoder().encode(text).length;
}

export function isValidJson(text: string): boolean {
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
}

/** Minified payload — JSON.parse throws when the input is invalid. */
export function minifyJson(text: string): string {
  return JSON.stringify(JSON.parse(text));
}

/**
 * Count top-level keys of a JSON object (0 for arrays and primitives) —
 * shown in the UI as a structural sanity check.
 */
export function jsonObjectKeyCount(text: string): number {
  try {
    const parsed: unknown = JSON.parse(text);
    if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
      return Object.keys(parsed as Record<string, unknown>).length;
    }
    return 0;
  } catch {
    return 0;
  }
}

const PLACEHOLDER_RE = /\{([^{}]+)\}/g;

/**
 * Fill a JSON template with row values: every `{Column Name}` is replaced by
 * that column's value for the row (trimmed). Unknown or missing columns
 * become empty strings — JSON.parse on the result decides validity, which is
 * exactly the per-row validation the batch flow reports.
 */
export function applyJsonTemplate(
  template: string,
  row: Record<string, string | number | null | undefined>,
): string {
  return template.replace(PLACEHOLDER_RE, (match, rawKey: string) => {
    const value = row[rawKey.trim()];
    return value === undefined || value === null ? "" : String(value).trim();
  });
}

/** Extract every column name referenced by `{...}` placeholders in a template. */
export function extractTemplateKeys(template: string): string[] {
  const keys: string[] = [];
  for (const match of template.matchAll(PLACEHOLDER_RE)) {
    const key = match[1]!.trim();
    if (!keys.includes(key)) keys.push(key);
  }
  return keys;
}
