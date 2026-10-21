/**
 * Bilingual FAQ content — the single source of truth shared by the on-page
 * FAQ section and the JSON-LD FAQPage schema, so answer engines always see
 * the same Q&A in the markup as humans see on the page.
 */

export interface FaqItem {
  q: { en: string; th: string };
  a: { en: string; th: string };
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: {
      en: "Is RoiQR free to use?",
      th: "RoiQR ใช้ฟรีหรือเปล่า?",
    },
    a: {
      en: "Yes — RoiQR is completely free with no sign-up. Create unlimited single QR codes or batch-generate hundreds from a spreadsheet, including PNG, SVG, ZIP and PDF downloads.",
      th: "ฟรีทั้งหมด ไม่ต้องสมัครสมาชิก สร้าง QR code ได้ไม่จำกัดทั้งตัวเดียวและแบบกลุ่มจากไฟล์ Excel พร้อมดาวน์โหลดเป็น PNG, SVG, ZIP และ PDF",
    },
  },
  {
    q: {
      en: "Does RoiQR store my data or files?",
      th: "RoiQR เก็บข้อมูลหรือไฟล์ของฉันหรือไม่?",
    },
    a: {
      en: "No. Everything is generated inside your browser — spreadsheet files are parsed in memory on your device and nothing is uploaded to or stored on the server. Close the tab and nothing remains.",
      th: "ไม่เก็บครับ ทุกอย่างสร้างในเบราว์เซอร์ของคุณ ไฟล์ Excel/CSV ถูกอ่านในหน่วยความจำเครื่องคุณเท่านั้น ไม่มีการอัปโหลดหรือจัดเก็บบนเซิร์ฟเวอร์ ปิดแท็บเมื่อไหร่ข้อมูลหายทันที",
    },
  },
  {
    q: {
      en: "Can I create many QR codes from an Excel or CSV file?",
      th: "สร้าง QR code หลายตัวจากไฟล์ Excel หรือ CSV ได้ไหม?",
    },
    a: {
      en: "Yes. Upload an .xlsx, .xls or .csv file, choose the column(s) to encode, and generate hundreds of unique codes in one click. Name each file from a column you pick, then download everything as one ZIP or a printable A4 sticker-sheet PDF.",
      th: "ได้ครับ อัปโหลดไฟล์ .xlsx, .xls หรือ .csv เลือกคอลัมน์ที่จะใส่ในโค้ด แล้วสร้างหลายร้อยตัวในคลิกเดียว ตั้งชื่อไฟล์จากคอลัมน์ที่เลือกได้ และดาวน์โหลดเป็น ZIP เดียวหรือ PDF แผ่นสติกเกอร์ A4 พร้อมปริ้น",
    },
  },
  {
    q: {
      en: "Which QR code types does RoiQR support?",
      th: "RoiQR รองรับ QR code ประเภทไหนบ้าง?",
    },
    a: {
      en: "Eleven standard types: website URL, plain text, raw JSON, Thai PromptPay payment, email, phone number, SMS, Wi-Fi login, vCard contact, map location (geo), and calendar event — all encoded to the official specifications so every camera app can scan them.",
      th: "ครบ 11 ประเภทตามมาตรฐานสากล: เว็บไซต์ (URL) ข้อความ JSON พร้อมเพย์ อีเมล เบอร์โทรศัพท์ SMS การเชื่อมต่อ Wi-Fi นามบัตรดิจิทัล (vCard) พิกัดแผนที่ และกิจกรรมในปฏิทิน ทุกประเภทเข้ารหัสตามสเปก กล้องทุกแอปสแกนได้ทันที",
    },
  },
  {
    q: {
      en: "Can I customize the design with my logo and brand colors?",
      th: "ปรับดีไซน์ใส่โลโก้และสีแบรนด์เองได้ไหม?",
    },
    a: {
      en: "Yes — add a center logo, choose from 6 palettes or enter your own hex colors, pick one of 4 module shapes (square, rounded, dots, diamond), and print a caption like “SCAN ME” under the code. Logos use high error correction so the code still scans reliably.",
      th: "ได้ครับ ใส่โลโก้ตรงกลางโค้ด เลือกพาเลตต์สำเร็จรูป 6 แบบหรือกรอกรหัสสีเอง เลือกรูปทรงเซลล์ 4 แบบ (สี่เหลี่ยม มุมมน จุดกลม เพชร) และใส่ข้อความใต้โค้ดเช่น “แสกนเลย” โลโก้จะถูกวางด้วยระดับกู้คืนข้อมูลสูงสุด สแกนได้ปกติ",
    },
  },
  {
    q: {
      en: "Do the QR codes ever expire?",
      th: "QR code ที่สร้างมีวันหมดอายุไหม?",
    },
    a: {
      en: "Never. RoiQR produces static QR codes — the content is encoded directly in the image with no redirect service or subscription in the middle, so codes keep working forever. Change the link? Generate a new code in seconds.",
      th: "ไม่มีวันหมดอายุครับ RoiQR สร้างเป็น static QR ข้อมูลฝังอยู่ในตัวรูปโดยตรง ไม่ผ่านบริการ redirect หรือระบบสมาชิกใดๆ ใช้งานได้ตลอดไป ถ้าเปลี่ยนลิงก์ก็สร้างโค้ดใหม่ได้ในไม่กี่วินาที",
    },
  },
];
