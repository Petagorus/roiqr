/**
 * Combine multiple spreadsheet columns into a single QR payload.
 *
 * Used by the batch flow when the user selects more than one column. Each
 * selected column is rendered through its own content-type encoder (when the
 * column has an assigned type) and the results are joined with a separator so
 * the combined string is still a valid, scannable QR payload.
 */

import { encodePayload, type QrInput } from "./qr-encode";

export interface CombinedColumn {
  /** The spreadsheet column name. */
  column: string;
  /** Content type to encode this column as. Defaults to "text". */
  type?: string;
}

/** Separator used between combined column values. */
const COMBINE_SEPARATOR = "\n";

/**
 * Map a column value to the field name a given type's encoder reads.
 * The spreadsheet column can be named anything (e.g. "link"), but the
 * encoders expect specific fields (e.g. "url", "phone").
 */
function fieldForType(type: string, column: string): string {
  switch (type) {
    case "url":
      return "url";
    case "text":
      return "text";
    case "promptpay":
      return "promptpayTarget";
    case "email":
      return "email";
    case "phone":
    case "sms":
      return "phone";
    case "wifi":
      return "wifiSsid";
    case "vcard":
      return "vcardName";
    case "geo":
      return "geoLat";
    case "event":
      return "eventTitle";
    default:
      return column;
  }
}

/**
 * Encode a single row's selected columns into one payload string.
 * Empty columns are skipped so trailing separators never appear.
 */
export function combineColumns(
  row: Record<string, string | number | null | undefined>,
  columns: CombinedColumn[],
): string {
  const parts: string[] = [];
  for (const col of columns) {
    const value = row[col.column];
    if (value === null || value === undefined || String(value).trim() === "") {
      continue;
    }
    const type = col.type ?? "text";
    const field = fieldForType(type, col.column);
    const data: QrInput = { [field]: String(value) };
    try {
      parts.push(encodePayload(type, data));
    } catch {
      // If a column's type can't encode the value, fall back to raw text.
      parts.push(String(value).trim());
    }
  }
  return parts.join(COMBINE_SEPARATOR);
}

/**
 * Validate that all requested columns exist in the parsed headers.
 * Returns the list of missing column names.
 */
export function missingColumns(
  headers: string[],
  columns: CombinedColumn[],
): string[] {
  const headerSet = new Set(headers);
  const names = new Set(columns.map((c) => c.column));
  return [...names].filter((name) => !headerSet.has(name));
}
