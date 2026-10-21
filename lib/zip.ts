/**
 * Minimal ZIP archive writer (store method, no compression).
 *
 * The batch flow bundles every generated QR into one .zip download.
 * Browsers block multiple automatic downloads, so a single archive is the
 * only reliable way to hand the user all their files in one click. This
 * avoids adding a dependency — the format is just headers + CRC32 + raw data.
 */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(data: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < data.length; i += 1) {
    c = CRC_TABLE[(c ^ (data[i] ?? 0)) & 0xff]! ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

export interface ZipEntry {
  name: string;
  /** `Uint8Array<ArrayBuffer>` so the entries are valid BlobParts. */
  data: Uint8Array<ArrayBuffer>;
}

/** Build a .zip Blob from entries. Names are UTF-8; data is stored raw. */
export function createZipBlob(entries: ZipEntry[]): Blob {
  const encoder = new TextEncoder();
  const chunks: BlobPart[] = [];
  const central: BlobPart[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.name);
    const crc = crc32(entry.data);

    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true); // local file header signature
    local.setUint16(4, 20, true); // version needed
    local.setUint16(6, 0x0800, true); // flags: UTF-8 filenames
    local.setUint16(8, 0, true); // method: store (no compression)
    local.setUint16(12, 0x21, true); // mod date 1980-01-01
    local.setUint32(14, crc, true);
    local.setUint32(18, entry.data.length, true);
    local.setUint32(22, entry.data.length, true);
    local.setUint16(26, nameBytes.length, true);

    chunks.push(new Uint8Array(local.buffer), nameBytes, entry.data);

    const cd = new DataView(new ArrayBuffer(46));
    cd.setUint32(0, 0x02014b50, true); // central directory signature
    cd.setUint16(4, 20, true); // version made by
    cd.setUint16(6, 20, true); // version needed
    cd.setUint16(8, 0x0800, true);
    cd.setUint16(14, 0x21, true);
    cd.setUint32(16, crc, true);
    cd.setUint32(20, entry.data.length, true);
    cd.setUint32(24, entry.data.length, true);
    cd.setUint16(28, nameBytes.length, true);
    cd.setUint32(42, offset, true); // local header offset
    central.push(new Uint8Array(cd.buffer), nameBytes);

    offset += 30 + nameBytes.length + entry.data.length;
  }

  const centralSize = central.reduce((n, part) => n + (part as Uint8Array).length, 0);
  const eocd = new DataView(new ArrayBuffer(22));
  eocd.setUint32(0, 0x06054b50, true); // end of central directory
  eocd.setUint16(8, entries.length, true);
  eocd.setUint16(10, entries.length, true);
  eocd.setUint32(12, centralSize, true);
  eocd.setUint32(16, offset, true);

  return new Blob([...chunks, ...central, new Uint8Array(eocd.buffer)], {
    type: "application/zip",
  });
}

/** Decode a data URL (e.g. a generated PNG) into raw bytes. */
export function dataUrlToBytes(dataUrl: string): Uint8Array<ArrayBuffer> {
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Make a spreadsheet value safe to use as a download filename: strip path
 * separators and reserved characters, cap the length, fall back to a prefix.
 */
export function safeFilename(raw: string, fallback: string): string {
  const cleaned = raw
    .replace(/[\\/:*?"<>|\r\n\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80)
    .trim();
  return cleaned.length > 0 ? cleaned : fallback;
}
