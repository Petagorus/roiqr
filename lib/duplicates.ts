/**
 * Duplicate detection for batch rows. Shop owners printing sticker sheets
 * don't want the same QR twice, so we flag payloads that appear in more than
 * one row before generation.
 */

export interface DuplicateGroup {
  /** The repeated payload value. */
  value: string;
  /** 1-based row numbers (spreadsheet style) carrying this value. */
  rows: number[];
}

/**
 * Find values that appear in more than one row. Rows are reported 1-based to
 * match what the user sees in Excel/Google Sheets.
 */
export function findDuplicateRows(values: string[]): DuplicateGroup[] {
  const seen = new Map<string, number[]>();
  values.forEach((value, index) => {
    const key = value.trim();
    if (!key) return;
    const rows = seen.get(key) ?? [];
    rows.push(index + 1);
    seen.set(key, rows);
  });

  return Array.from(seen.entries())
    .filter(([, rows]) => rows.length > 1)
    .map(([value, rows]) => ({ value, rows }));
}
