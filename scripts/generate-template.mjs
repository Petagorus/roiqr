/**
 * Generates the downloadable batch-import templates:
 *   public/templates/roiqr-template.xlsx  — "QR codes" data sheet + guide sheet
 *   public/templates/roiqr-template.csv   — plain CSV for quick edits
 *
 * Run `node scripts/generate-template.mjs` to regenerate after edits.
 */
import * as XLSX from "xlsx";
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "templates");
mkdirSync(outDir, { recursive: true });

const HEADERS = ["name", "url"];
const SAMPLE_ROWS = [
  ["โต๊ะ 1", "https://example.com/table-1"],
  ["Somchai Cafe", "https://example.com/cafe"],
  ["Promo Landing", "https://example.com/promo"],
];

// --- XLSX: data sheet + bilingual guide sheet ---
const dataSheet = XLSX.utils.aoa_to_sheet([HEADERS, ...SAMPLE_ROWS]);
dataSheet["!cols"] = [{ wch: 24 }, { wch: 36 }];

const guide = [
  ["RoiQR — คู่มือไฟล์นำเข้า / Import guide"],
  [],
  ["1. ใส่ข้อมูลของคุณในชีต “QR codes” เท่านั้น / Put your data in the “QR codes” sheet only"],
  ["2. คอลัมน์ name = ชื่อไฟล์ตอนดาวน์โหลด / name column = download filename"],
  ["3. คอลัมน์ url = เนื้อหาที่จะเข้ารหัสเป็น QR / url column = content encoded into the QR"],
  ["4. เพิ่ม ลบ หรือเปลี่ยนชื่อคอลัมน์ได้อิสระ — หน้าเว็บให้เลือกเองว่าคอลัมน์ไหนทำหน้าที่อะไร"],
  ["   (Add, remove or rename columns freely — the site lets you assign each column's role.)"],
  [],
  ["รูปแบบเนื้อหาแนะนำตามประเภท / Recommended content format by QR type:"],
  ["ลิงก์ URL", "ขึ้นต้นด้วย https:// หรือ http://"],
  ["ข้อความ Text", "ข้อความอิสระ"],
  ["อีเมล Email", "name@example.com"],
  ["เบอร์โทร Phone", "+66812345678"],
  ["SMS", "+66812345678"],
  ["Wi-Fi", "ชื่อสัญญาณ (SSID)"],
  ["vCard", "ชื่อ-นามสกุล"],
  ["พิกัด Location", "latitude,longitude เช่น 13.7563,100.5018"],
  ["ปฏิทิน Event", "ชื่อกิจกรรม"],
  [],
  ["เคล็ดลับ / Tips:"],
  ["- 1 แถว = 1 QR code / one row = one QR code"],
  ["- แถวที่ว่างทุกคอลัมน์จะถูกข้าม / fully empty rows are skipped"],
  ["- ค่าที่ซ้ำกัน ระบบจะเตือนก่อนสร้าง / duplicate values are flagged before generating"],
  ["- ชื่อไฟล์ภาษาไทยใช้ได้ / Thai filenames are fine"],
];
const guideSheet = XLSX.utils.aoa_to_sheet(guide);
guideSheet["!cols"] = [{ wch: 22 }, { wch: 70 }];

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, dataSheet, "QR codes");
XLSX.utils.book_append_sheet(wb, guideSheet, "คู่มือ-Guide");
writeFileSync(join(outDir, "roiqr-template.xlsx"), XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));

// --- CSV: data sheet only ---
const csv = [HEADERS.join(","), ...SAMPLE_ROWS.map((r) => r.join(","))].join("\n") + "\n";
writeFileSync(join(outDir, "roiqr-template.csv"), csv);

console.log("Templates written to", outDir);
