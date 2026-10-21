import Papa from "papaparse";

/**
 * Parse a spreadsheet file (Excel .xlsx/.xls or CSV) into:
 *  - headers: the column names
 *  - rows: the data rows as key/value objects
 *
 * Excel files are read as an ArrayBuffer and converted via the `xlsx` library.
 * CSV files are parsed textually with PapaParse.
 */
export interface ParsedSpreadsheet {
  filename: string;
  sheet: string;
  headers: string[];
  rows: Record<string, string | number | null>[];
}

export async function parseSpreadsheet(
  file: File,
  options: { sheetName?: string; maxRows?: number } = {},
): Promise<ParsedSpreadsheet> {
  const { sheetName, maxRows = 5000 } = options;

  if (/\.(xlsx|xls)$/i.test(file.name)) {
    return parseExcel(file, sheetName, maxRows);
  }
  return parseSpreadsheetText(await file.text(), file.name, { maxRows });
}

/**
 * Parse pasted TSV/CSV text — a cell range copied straight out of Excel or
 * Google Sheets. The header row must be the first line, same as a file.
 */
export function parseSpreadsheetText(
  text: string,
  filename: string,
  options: { maxRows?: number } = {},
): Promise<ParsedSpreadsheet> {
  return parseCsvText(text, filename, options.maxRows ?? 5000);
}

async function parseCsvText(
  text: string,
  filename: string,
  maxRows: number,
): Promise<ParsedSpreadsheet> {
  const parsed = Papa.parse<string[]>(text, {
    header: true,
    skipEmptyLines: true,
    // No dynamic typing: QR payloads are text, and number-coercion silently
    // strips leading zeros from phone numbers and national IDs.
    dynamicTyping: false,
  });

  // PapaParse can return `headers: undefined` depending on the version while
  // still giving us keyed objects in `data`. Fall back to the keys of the
  // first row so column selection always works.
  const rawHeaders = (parsed as unknown as { headers?: string[] }).headers ?? [];
  const firstRow = (
    (parsed as unknown as { data?: Record<string, unknown>[] }).data ?? []
  )[0] ?? {};
  const fallbackHeaders = Object.keys(firstRow);
  const headers = (rawHeaders.length > 0 ? rawHeaders : fallbackHeaders).map(
    (h) => String(h).trim(),
  );

  const parsedData = (parsed as unknown as {
    data?: Record<string, unknown>[];
  }).data ?? [];

  const rows = parsedData.slice(0, maxRows).map((row) => {
    const obj: Record<string, string | number | null> = {};
    headers.forEach((header) => {
      const value = (row[header] as string | number | null) ?? null;
      obj[header] = value === "" || value == null ? null : value;
    });
    return obj;
  });

  return {
    filename,
    sheet: "CSV",
    headers,
    rows,
  };
}

async function parseExcel(
  file: File,
  sheetName: string | undefined,
  maxRows: number,
): Promise<ParsedSpreadsheet> {
  // Lazy require to keep the browser bundle lean; xlsx is heavy.
  // CJS/ESM interop: some browser bundles expose the API on the namespace,
  // others under .default — handle both or XLSX ends up undefined.
  const mod = await import("xlsx");
  const XLSX = (mod as unknown as { default?: typeof mod }).default ?? mod;
  const arrayBuffer = await file.arrayBuffer();
  // "array" + Uint8Array is the only combination that works in the browser
  // (there is no Buffer polyfill; "buffer" type throws on real uploads).
  const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });

  const sheetNameSelected = sheetName ?? workbook.SheetNames[0];
  if (!sheetNameSelected) {
    throw new Error("The spreadsheet has no worksheets.");
  }
  const worksheet = workbook.Sheets[sheetNameSelected];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json = worksheet ? XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 }) : [];
  const rows = json as unknown[][];

  if (rows.length === 0) {
    return { filename: file.name, sheet: sheetNameSelected, headers: [], rows: [] };
  }

  const headers = (rows[0] as unknown[]).map((h) => String(h).trim());
  const dataRows = rows.slice(1).slice(0, maxRows);

  const parsedRows = dataRows.map((row) => {
    const obj: Record<string, string | number | null> = {};
    headers.forEach((header, index) => {
      const value = (row[index] as unknown) as string | number | null;
      obj[header] = value === undefined || value === null ? null : value;
    });
    return obj;
  });

  return {
    filename: file.name,
    sheet: sheetNameSelected,
    headers,
    rows: parsedRows,
  };
}

/**
 * Validate that a target column exists in the parsed headers.
 * Returns true/false so the UI can surface a clear message.
 */
export function columnExists(parsed: ParsedSpreadsheet, column: string): boolean {
  return parsed.headers.some((h) => h.toLowerCase() === column.toLowerCase());
}
