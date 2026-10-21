// Translation dictionaries for the QR generator.
//
// Every user-facing string in the app is keyed here so the UI can swap
// between Thai and English at runtime. Keep keys parallel across locales.

export type Locale = "en" | "th";

export const LOCALES: Locale[] = ["en", "th"];

export const localeNames: Record<Locale, string> = {
  en: "English",
  th: "ไทย",
};

export interface Messages {
  heroSubtitle: string;
  heroTitle: string;
  heroBody: string;
  heroSingle: string;
  heroBatch: string;
  featEyebrow: string;
  featTitle: string;
  feat1Title: string;
  feat1Body: string;
  feat2Title: string;
  feat2Body: string;
  feat3Title: string;
  feat3Body: string;
  feat4Title: string;
  feat4Body: string;
  feat5Title: string;
  feat5Body: string;
  feat6Title: string;
  feat6Body: string;
  generatorTitle: string;
  generatorSubtitle: string;
  tabSingle: string;
  tabBatch: string;
  footerCopy: string;
  footerPromise: string;
  footerExplore: string;
  footerLegal: string;
  footerTerms: string;
  footerPrivacy: string;
  footerRights: string;

  formTypeLabel: string;
  formTypePlaceholder: string;
  formGenerating: string;
  formScansTo: string;
  formDownload: string;
  formDownloadSvg: string;
  formSizeLabel: string;
  sizeCustomLabel: string;
  sizeCustomPlaceholder: string;

  styleShapeLabel: string;
  styleShapeSquare: string;
  styleShapeRounded: string;
  styleShapeDots: string;
  styleShapeDiamond: string;
  styleTemplateLabel: string;
  templateClassic: string;
  templateMinimal: string;
  templateOcean: string;
  templateForest: string;
  templateWine: string;
  templateSlate: string;
  stylePaletteLabel: string;
  styleCustomColorLabel: string;
  styleCustomColorModule: string;
  styleCustomColorBackground: string;
  styleCustomColorUse: string;
  styleLogoLabel: string;
  styleLogoLoaded: string;
  styleGroupStyle: string;
  styleGroupBranding: string;
  styleGroupAdvanced: string;
  styleCustomizeLabel: string;
  helpShape: string;
  helpCustomColor: string;
  historyTitle: string;
  historyClear: string;
  historyHint: string;
  downloadDone: string;
  navFeatures: string;
  navFaq: string;
  privacyNote: string;
  styleLogoUpload: string;
  styleLogoRemove: string;
  styleLogoSizeLabel: string;
  styleLogoHint: string;
  styleCaptionLabel: string;
  styleCaptionPlaceholder: string;
  styleCaptionHint: string;

  formCopy: string;
  formCopied: string;
  formReset: string;

  multiColumnLabel: string;
  multiColumnPlaceholder: string;
  multiColumnSelectAll: string;

  previewEmpty: string;
  previewLabel: string;
  errorGenerate: string;
  errorLoadImage: string;
  errorCopyImage: string;
  errorParseFile: string;
  errorPdf: string;

  faqEyebrow: string;
  faqTitle: string;

  formUrlLabel: string;
  formUrlPlaceholder: string;
  formTextLabel: string;
  formTextPlaceholder: string;
  formJsonLabel: string;
  formJsonPlaceholder: string;
  formJsonInvalid: string;
  formJsonSize: string;
  formJsonTooLarge: string;
  formJsonKeys: string;
  formEmailLabel: string;
  formEmailPlaceholder: string;
  formSubjectLabel: string;
  formSubjectPlaceholder: string;
  formBodyLabel: string;
  formBodyPlaceholder: string;
  formPhoneLabel: string;
  formPhonePlaceholder: string;
  formSmsLabel: string;
  formSmsPlaceholder: string;
  formWifiSsidLabel: string;
  formWifiSsidPlaceholder: string;
  formWifiPasswordLabel: string;
  formWifiPasswordPlaceholder: string;
  formWifiEncLabel: string;
  formWifiHiddenLabel: string;
  formPpTargetLabel: string;
  formPpTargetPlaceholder: string;
  formPpAmountLabel: string;
  formPpAmountPlaceholder: string;
  scanVerifyLabel: string;
  scanVerifyOk: string;
  scanVerifyFail: string;
  formVcardNameLabel: string;
  formVcardNamePlaceholder: string;
  formVcardPhoneLabel: string;
  formVcardPhonePlaceholder: string;
  formVcardEmailLabel: string;
  formVcardEmailPlaceholder: string;
  formVcardOrgLabel: string;
  formVcardOrgPlaceholder: string;
  formGeoLatLabel: string;
  formGeoLatPlaceholder: string;
  formGeoLonLabel: string;
  formGeoLonPlaceholder: string;
  formEventStartLabel: string;
  formEventEndLabel: string;
  formEventTitleLabel: string;
  formEventTitlePlaceholder: string;
  formEventLocationLabel: string;
  formEventLocationPlaceholder: string;
  formEventDescLabel: string;
  formEventDescPlaceholder: string;

  batchStep1: string;
  batchDrop: string;
  batchDropTypes: string;
  batchRemove: string;
  batchRowsOne: string;
  batchRowsMany: string;
  batchColumnsSelectedOne: string;
  batchColumnsSelectedMany: string;
  batchGeneratedOne: string;
  batchGeneratedMany: string;
  batchSkippedOne: string;
  batchSkippedMany: string;
  batchTemplateLabel: string;
  batchTemplateExcel: string;
  batchTemplateCsv: string;
  batchJsonTemplateLabel: string;
  batchJsonTemplateHint: string;
  batchJsonTemplatePlaceholder: string;
  batchJsonUnknownColumn: string;
  batchColumnLabel: string;
  batchColumnPlaceholder: string;
  batchFilenameLabel: string;
  batchFilenamePlaceholder: string;
  batchFilenameHint: string;
  batchFilenameNote: string;
  batchTypeLabel: string;
  batchPpTargetLabel: string;
  batchPpAmountLabel: string;
  batchPasteLabel: string;
  batchPasteHint: string;
  batchPasteUse: string;
  batchPastePlaceholder: string;
  batchTypePlaceholder: string;
  batchGenerate: string;
  batchDownloadAll: string;
  batchZipHint: string;
  batchCardDownload: string;
  batchCardDownloadShort: string;
  batchQueueAhead: string;
  batchPdfButton: string;
  batchDuplicateWarning: string;
}

export const messages: Record<Locale, Messages> = {
  en: {
    heroSubtitle: "Single scan or thousands — one file",
    heroTitle: "QR codes that work, generated in seconds",
    heroBody:
      "Drop in a link, a contact, or a Wi-Fi network. Or upload an Excel sheet and produce hundreds of unique codes from one column. Nothing is stored on a server — everything runs in your browser.",
    heroSingle: "Make one QR",
    heroBatch: "Batch from a file",
    featEyebrow: "What it does",
    featTitle: "One tool. Every kind of QR code.",
    feat1Title: "Eleven content types",
    feat1Body:
      "URL, text, JSON, PromptPay, email, phone, SMS, Wi-Fi, vCard, location and calendar events — each encoded to the exact format a camera reads.",
    feat2Title: "Mass generate",
    feat2Body:
      "Upload one Excel or CSV file. Pick the columns, and every row becomes its own ready-to-download QR code.",
    feat3Title: "Nothing leaves your device",
    feat3Body:
      "Files are parsed and codes rendered locally. No uploads, no server storage, nothing cached on a host.",
    feat4Title: "Instant preview",
    feat4Body:
      "See the code and the exact payload it encodes before you download. Edit once, re-scan, done.",
    feat5Title: "Download as PNG",
    feat5Body:
      "A single high-resolution PNG for one code, or every code in a batch, exported in one click.",
    feat6Title: "Fast and offline-capable",
    feat6Body:
      "The generator runs client-side, so it responds immediately and keeps working once the page is loaded.",
    generatorTitle: "Start generating",
    generatorSubtitle: "Pick a single code, or mass-produce from a spreadsheet.",
    tabSingle: "Single",
    tabBatch: "Batch",
    footerCopy: "RoiQR",
    footerPromise: "Your files are never stored on a server.",
    footerExplore: "Explore",
    footerLegal: "Legal",
    footerTerms: "Terms of Service",
    footerPrivacy: "Privacy Policy",
    footerRights: "All rights reserved.",

    formTypeLabel: "What should the QR code contain?",
    formTypePlaceholder: "Choose a type",
    formGenerating: "Generating…",
    formScansTo: "Scans to",
    formDownload: "Download PNG",
    formDownloadSvg: "Download SVG",
    formSizeLabel: "Image size",
    sizeCustomLabel: "Custom size",
    sizeCustomPlaceholder: "e.g. 1500",

    styleShapeLabel: "Module shape",
    styleTemplateLabel: "Style templates",
    templateClassic: "Classic",
    templateMinimal: "Minimal",
    templateOcean: "Ocean",
    templateForest: "Forest",
    templateWine: "Wine",
    templateSlate: "Slate",
    styleShapeSquare: "Square",
    styleShapeRounded: "Rounded",
    styleShapeDots: "Dots",
    styleShapeDiamond: "Diamond",
    stylePaletteLabel: "Color palette",
    styleCustomColorLabel: "Custom colors",
    styleCustomColorModule: "Module color",
    styleCustomColorBackground: "Background",
    styleCustomColorUse: "Reset to palette",    styleLogoLabel: "Center logo",
    styleLogoUpload: "Add logo",
    styleLogoLoaded: "Logo loaded",
    styleGroupStyle: "Style",
    styleGroupBranding: "Branding",
    styleGroupAdvanced: "Advanced options",
    styleCustomizeLabel: "Customize style",
    helpShape: "Every shape scans the same — pick what looks right.",
    helpCustomColor: "Keep dark modules on a light background so cameras read the code.",
    historyTitle: "Recent codes",
    historyClear: "Clear",
    historyHint: "Saved only in this browser — clear anytime.",
    downloadDone: "Downloaded.",
    navFeatures: "Features",
    navFaq: "FAQ",
    privacyNote: "Parsed in your browser. Nothing is uploaded.",
    styleLogoRemove: "Remove",
    styleLogoSizeLabel: "Logo size",
    styleLogoHint: "A logo is added with high error correction so the code still scans.",
    styleCaptionLabel: "Caption under the QR code",
    styleCaptionPlaceholder: "SCAN ME",
    styleCaptionHint: "Short text printed under the code in the PNG, SVG, ZIP and PDF.",
    formCopy: "Copy image",
    formCopied: "Copied!",
    formReset: "Reset form",
    multiColumnLabel: "Which columns go into the QR code?",
    multiColumnPlaceholder: "Select one or more columns",
    multiColumnSelectAll: "Select all",

    previewEmpty: "Your QR code appears here",
    previewLabel: "Live preview",
    errorGenerate: "Could not generate QR code.",
    errorLoadImage: "Could not load the selected image.",
    errorCopyImage: "Could not copy the image to the clipboard.",
    errorParseFile: "Could not parse file.",
    errorPdf: "Could not build the PDF sheet.",
    faqEyebrow: "FAQ",
    faqTitle: "Frequently asked questions",

    formUrlLabel: "Website URL",
    formUrlPlaceholder: "https://example.com",
    formTextLabel: "Text",
    formTextPlaceholder: "Any text to encode",
    formJsonLabel: "JSON data",
    formJsonPlaceholder: '{ "id": "A-1024", "qty": 2 }',
    formJsonInvalid: "Invalid JSON: {error}",
    formJsonSize: "{bytes} bytes · auto-minified",
    formJsonTooLarge: "Too large for a scannable QR — keep it under ~{max} bytes",
    formJsonKeys: "{keys} keys",
    formEmailLabel: "Email address",
    formEmailPlaceholder: "hello@example.com",
    formSubjectLabel: "Subject",
    formSubjectPlaceholder: "Optional subject",
    formBodyLabel: "Body",
    formBodyPlaceholder: "Optional message",
    formPhoneLabel: "Phone number",
    formPhonePlaceholder: "+1 555 123 4567",
    formSmsLabel: "Message",
    formSmsPlaceholder: "Optional pre-filled message",
    formWifiSsidLabel: "Network name (SSID)",
    formWifiSsidPlaceholder: "My Wi-Fi",
    formWifiPasswordLabel: "Password",
    formWifiPasswordPlaceholder: "Secret",
    formWifiEncLabel: "Encryption",
    formWifiHiddenLabel: "Hidden network",
    formPpTargetLabel: "Mobile number or national ID",
    formPpTargetPlaceholder: "0812345678 or 13-digit ID",
    formPpAmountLabel: "Amount in THB (optional)",
    formPpAmountPlaceholder: "0.00",
    scanVerifyLabel: "Test scan",
    scanVerifyOk: "Decoded text matches the content ✓",
    scanVerifyFail: "Could not decode — try a larger size or simpler style",
    formVcardNameLabel: "Full name",
    formVcardNamePlaceholder: "Ada Lovelace",
    formVcardPhoneLabel: "Phone",
    formVcardPhonePlaceholder: "+1 555 123 4567",
    formVcardEmailLabel: "Email",
    formVcardEmailPlaceholder: "ada@example.com",
    formVcardOrgLabel: "Organization",
    formVcardOrgPlaceholder: "Analytical Engines",
    formGeoLatLabel: "Latitude",
    formGeoLatPlaceholder: "37.7749",
    formGeoLonLabel: "Longitude",
    formGeoLonPlaceholder: "-122.4194",
    formEventStartLabel: "Start",
    formEventEndLabel: "End",
    formEventTitleLabel: "Title",
    formEventTitlePlaceholder: "Product launch",
    formEventLocationLabel: "Location",
    formEventLocationPlaceholder: "San Francisco, CA",
    formEventDescLabel: "Description",
    formEventDescPlaceholder: "Optional details",

    batchStep1: "Step 1 — Upload your file",
    batchDrop: "Drop .xlsx or .csv here, or click to browse",
    batchDropTypes: ".xlsx or .csv",
    batchRemove: "Remove",
    batchRowsOne: "1 row",
    batchRowsMany: "{count} rows",
    batchColumnsSelectedOne: "1 column selected",
    batchColumnsSelectedMany: "{count} columns selected",
    batchGeneratedOne: "QR code generated",
    batchGeneratedMany: "{count} QR codes generated",
    batchSkippedOne: "1 row skipped",
    batchSkippedMany: "{count} rows skipped",
    batchTemplateLabel: "Not sure about the format? Grab a template:",
    batchTemplateExcel: "Excel (with guide sheet)",
    batchTemplateCsv: "CSV",
    batchJsonTemplateLabel: "JSON template",
    batchJsonTemplateHint:
      "Wrap a column name in {braces} to insert each row's value — unquoted braces stay numbers/booleans.",
    batchJsonTemplatePlaceholder: '{ "id": "{name}", "qty": {qty} }',
    batchJsonUnknownColumn: "Unknown columns: {columns}",
    batchColumnLabel: "Which column goes in the QR code?",
    batchColumnPlaceholder: "Pick a column",
    batchFilenameLabel: "Filename from column",
    batchFilenamePlaceholder: "Select a column for the filename",
    batchFilenameHint: "This column's values are used as the download filename.",
    batchFilenameNote: "This only affects the file name — it does not change the QR code content.",
    batchTypeLabel: "QR content type",
    batchPpTargetLabel: "Target column (mobile or national ID)",
    batchPpAmountLabel: "Amount column (optional)",
    batchPasteLabel: "Or paste from Excel",
    batchPasteHint: "Copy a cell range in Excel/Google Sheets (headers first), then paste here.",
    batchPasteUse: "Use pasted data",
    batchPastePlaceholder: "name\tlink\nAda\thttps://example.com",
    batchTypePlaceholder: "Choose a type",
    batchGenerate: "Generate all QR codes",
    batchDownloadAll: "Download all",
    batchZipHint: "All files are bundled into one ZIP archive, named from the filename column.",
    batchCardDownload: "Download this QR code",
    batchCardDownloadShort: "PNG",
    batchQueueAhead: "{n} queue(s) ahead of you — waiting…",
    batchPdfButton: "PDF sheet (A4)",
    batchDuplicateWarning:
      "{n} duplicate value(s) found — rows: {rows}. Duplicates print twice unless removed.",
  },
  th: {
    heroSubtitle: "ตัวเดียวหรือหลายพัน — จบในไฟล์เดียว",
    heroTitle: "QR code ที่สแกนได้จริง สร้างเสร็จในไม่กี่วินาที",
    heroBody:
      "วางลิงก์ ข้อมูลติดต่อ หรือ Wi-Fi ลงไป หรืออัปโหลดไฟล์ Excel เพื่อสร้าง QR code หลายร้อยตัวจากคอลัมน์ที่เลือก ไม่มีข้อมูลถูกเก็บบนเซิร์ฟเวอร์ — ทุกอย่างประมวลผลในเบราว์เซอร์ของคุณ",
    heroSingle: "สร้าง QR ตัวเดียว",
    heroBatch: "สร้างจากไฟล์",
    featEyebrow: "ฟีเจอร์ทั้งหมด",
    featTitle: "เครื่องมือเดียว ครบทุกประเภท QR code",
    feat1Title: "ครบทั้ง 11 ประเภท",
    feat1Body:
      "URL ข้อความ JSON พร้อมเพย์ อีเมล เบอร์โทร SMS Wi-Fi vCard พิกัด และปฏิทิน — ทุกประเภทเข้ารหัสตามรูปแบบมาตรฐานที่กล้องสแกนอ่านได้ทันที",
    feat2Title: "สร้างจำนวนมาก",
    feat2Body:
      "อัปโหลดไฟล์ Excel หรือ CSV เดียว เลือกคอลัมน์ แล้วทุกแถวจะกลายเป็น QR code พร้อมดาวน์โหลดทันที",
    feat3Title: "ข้อมูลไม่ออกจากเครื่องของคุณ",
    feat3Body:
      "ไฟล์ถูกอ่านและ QR ถูกสร้างบนเครื่องของคุณทั้งหมด ไม่มีการอัปโหลด ไม่มีเก็บบนเซิร์ฟเวอร์ ไม่มีการแคชไว้",
    feat4Title: "ดูตัวอย่างทันที",
    feat4Body:
      "เห็น QR code และข้อมูลที่เข้ารหัสก่อนดาวน์โหลด แก้ไขได้ทันที สแกนตรวจสอบความถูกต้องได้เลย",
    feat5Title: "ดาวน์โหลดเป็น PNG",
    feat5Body:
      "ไฟล์ PNG ความละเอียดสูงสำหรับ QR ตัวเดียว หรือดาวน์โหลดทุกตัวในชุดได้ในคลิกเดียว",
    feat6Title: "เร็วและใช้งานได้แบบออฟไลน์",
    feat6Body:
      "ตัวสร้างทำงานบนเบราว์เซอร์โดยตรง ตอบสนองทันที และยังใช้งานต่อได้แม้ไม่มีอินเทอร์เน็ตหลังโหลดหน้าเสร็จ",
    generatorTitle: "เริ่มสร้าง QR code",
    generatorSubtitle: "สร้างตัวเดียว หรือสร้างจำนวนมากจากสเปรดชีต",
    tabSingle: "ตัวเดียว",
    tabBatch: "จากไฟล์",
    footerCopy: "RoiQR",
    footerPromise: "ไฟล์ของคุณไม่ถูกเก็บบนเซิร์ฟเวอร์",
    footerExplore: "เมนู",
    footerLegal: "ข้อกำหนด",
    footerTerms: "ข้อกำหนดการใช้งาน",
    footerPrivacy: "นโยบายความเป็นส่วนตัว",
    footerRights: "สงวนลิขสิทธิ์",

    formTypeLabel: "ต้องการให้ QR code มีเนื้อหาอะไร?",
    formTypePlaceholder: "เลือกประเภท",
    formGenerating: "กำลังสร้าง…",
    formScansTo: "สแกนแล้วได้",
    formDownload: "ดาวน์โหลด PNG",
    formDownloadSvg: "ดาวน์โหลด SVG",
    formSizeLabel: "ขนาดภาพ",
    sizeCustomLabel: "ขนาดที่กำหนดเอง",
    sizeCustomPlaceholder: "เช่น 1500",

    styleShapeLabel: "รูปทรงโมดูล",
    styleTemplateLabel: "สไตล์สำเร็จรูป",
    templateClassic: "คลาสสิก",
    templateMinimal: "มินิมอล",
    templateOcean: "โอเชียน",
    templateForest: "ป่าไม้",
    templateWine: "ไวน์",
    templateSlate: "สเลต",
    styleShapeSquare: "สี่เหลี่ยม",
    styleShapeRounded: "มุมมน",
    styleShapeDots: "วงกลม",
    styleShapeDiamond: "เพชร",
    stylePaletteLabel: "โทนสี",
    styleCustomColorLabel: "กำหนดสีเอง",
    styleCustomColorModule: "สีโมดูล",
    styleCustomColorBackground: "สีพื้นหลัง",
    styleCustomColorUse: "ล้างสีที่กำหนดเอง",
    styleLogoLabel: "โลโก้ตรงกลาง",
    styleLogoUpload: "เพิ่มโลโก้",
    styleLogoLoaded: "โหลดโลโก้แล้ว",
    styleGroupStyle: "สไตล์",
    styleGroupBranding: "แบรนด์",
    styleGroupAdvanced: "ตัวเลือกขั้นสูง",
    styleCustomizeLabel: "ปรับแต่งสไตล์",
    helpShape: "ทุกทรงสแกนได้เหมือนกัน — เลือกตามถูกใจได้เลย",
    helpCustomColor: "ใช้สีเข้มเป็นสีโมดูล บนพื้นหลังสีอ่อน เพื่อให้กล้องอ่านได้",
    historyTitle: "รหัสล่าสุด",
    historyClear: "ล้าง",
    historyHint: "บันทึกในเบราว์เซอร์นี้เท่านั้น — ล้างได้ทุกเมื่อ",
    downloadDone: "ดาวน์โหลดแล้ว",
    navFeatures: "ฟีเจอร์",
    navFaq: "คำถามบ่อย",
    privacyNote: "ประมวลผลในเบราว์เซอร์ของคุณ — ไม่มีไฟล์ถูกอัปโหลด",
    styleLogoRemove: "ลบโลโก้",
    styleLogoSizeLabel: "ขนาดโลโก้",
    styleLogoHint: "โลโก้จะถูกวางด้วยระดับการกู้คืนข้อมูลสูงสุด (H) QR code ยังสแกนได้ปกติ",
    styleCaptionLabel: "ข้อความใต้ QR code",
    styleCaptionPlaceholder: "แสกนเลย",
    styleCaptionHint: "ข้อความสั้นจะถูกพิมพ์ใต้โค้ดในไฟล์ PNG, SVG, ZIP และ PDF",
    formCopy: "คัดลอกรูป",
    formCopied: "คัดลอกแล้ว!",
    formReset: "ล้างฟอร์ม",
    multiColumnLabel: "เลือกคอลัมน์ที่จะใส่ลงใน QR code",
    multiColumnPlaceholder: "เลือกได้มากกว่า 1 คอลัมน์",
    multiColumnSelectAll: "เลือกทั้งหมด",

    previewEmpty: "QR code จะแสดงที่นี่",
    faqEyebrow: "คำถามที่พบบ่อย",
    faqTitle: "คำถามที่พบบ่อยเกี่ยวกับ RoiQR",
    previewLabel: "ตัวอย่างสด",
    errorGenerate: "สร้าง QR code ไม่สำเร็จ",
    errorLoadImage: "โหลดรูปภาพที่เลือกไม่สำเร็จ",
    errorCopyImage: "คัดลอกรูปภาพไปยังคลิปบอร์ดไม่สำเร็จ",
    errorParseFile: "อ่านไฟล์ไม่สำเร็จ",
    errorPdf: "สร้างไฟล์ PDF ไม่สำเร็จ",

    formUrlLabel: "ลิงก์เว็บไซต์",
    formUrlPlaceholder: "https://example.com",
    formTextLabel: "ข้อความ",
    formTextPlaceholder: "ข้อความที่ต้องการเข้ารหัส",
    formJsonLabel: "ข้อมูล JSON",
    formJsonPlaceholder: '{ "id": "A-1024", "qty": 2 }',
    formJsonInvalid: "JSON ไม่ถูกต้อง: {error}",
    formJsonSize: "{bytes} ไบต์ · ย่อขนาดอัตโนมัติ",
    formJsonTooLarge: "ใหญ่เกินกว่า QR จะสแกนได้ — ควรอยู่ใต้ ~{max} ไบต์",
    formJsonKeys: "{keys} คีย์",
    formEmailLabel: "ที่อยู่อีเมล",
    formEmailPlaceholder: "hello@example.com",
    formSubjectLabel: "หัวเรื่อง",
    formSubjectPlaceholder: "หัวเรื่อง (ไม่บังคับ)",
    formBodyLabel: "เนื้อความ",
    formBodyPlaceholder: "ข้อความ (ไม่บังคับ)",
    formPhoneLabel: "เบอร์โทรศัพท์",
    formPhonePlaceholder: "+66 80 123 4567",
    formSmsLabel: "ข้อความ SMS",
    formSmsPlaceholder: "ข้อความที่ต้องการใส่ไว้ (ไม่บังคับ)",
    formWifiSsidLabel: "ชื่อเครือข่าย (SSID)",
    formWifiSsidPlaceholder: "Wi-Fi บ้านฉัน",
    formWifiPasswordLabel: "รหัสผ่าน",
    formWifiPasswordPlaceholder: "รหัสผ่าน Wi-Fi",
    formWifiEncLabel: "ชนิดการเข้ารหัส",
    formWifiHiddenLabel: "เครือข่ายที่ซ่อนอยู่",
    formPpTargetLabel: "เบอร์โทร หรือเลขประจำตัวประชาชน",
    formPpTargetPlaceholder: "0812345678 หรือเลข 13 หลัก",
    formPpAmountLabel: "ยอดเงิน (บาท) — ไม่ใส่ได้",
    formPpAmountPlaceholder: "0.00",
    scanVerifyLabel: "ทดสอบสแกน",
    scanVerifyOk: "อ่านได้ตรงกับเนื้อหา ✓",
    scanVerifyFail: "สแกนไม่ออก — ลองขนาดใหญ่ขึ้นหรือสไตล์ที่เรียบกว่า",
    formVcardNameLabel: "ชื่อ-นามสกุล",
    formVcardNamePlaceholder: "สมชาย ใจดี",
    formVcardPhoneLabel: "เบอร์โทรศัพท์",
    formVcardPhonePlaceholder: "+66 80 123 4567",
    formVcardEmailLabel: "อีเมล",
    formVcardEmailPlaceholder: "somchai@example.com",
    formVcardOrgLabel: "บริษัท / หน่วยงาน",
    formVcardOrgPlaceholder: "บริษัท ตัวอย่าง จำกัด",
    formGeoLatLabel: "ละติจูด",
    formGeoLatPlaceholder: "13.7563",
    formGeoLonLabel: "ลองจิจูด",
    formGeoLonPlaceholder: "100.5018",
    formEventStartLabel: "เริ่ม",
    formEventEndLabel: "สิ้นสุด",
    formEventTitleLabel: "ชื่อกิจกรรม",
    formEventTitlePlaceholder: "งานเปิดตัวสินค้า",
    formEventLocationLabel: "สถานที่",
    formEventLocationPlaceholder: "กรุงเทพมหานคร",
    formEventDescLabel: "รายละเอียด",
    formEventDescPlaceholder: "รายละเอียดเพิ่มเติม (ไม่บังคับ)",

    batchStep1: "ขั้นตอนที่ 1 — อัปโหลดไฟล์",
    batchDrop: "ลากไฟล์ .xlsx หรือ .csv มาวาง หรือคลิกเพื่อเลือกไฟล์",
    batchDropTypes: ".xlsx หรือ .csv",
    batchRemove: "ลบไฟล์",
    batchRowsOne: "1 แถว",
    batchRowsMany: "{count} แถว",
    batchColumnsSelectedOne: "เลือกอยู่ 1 คอลัมน์",
    batchColumnsSelectedMany: "เลือกอยู่ {count} คอลัมน์",
    batchGeneratedOne: "สร้าง QR code แล้ว 1 รายการ",
    batchGeneratedMany: "สร้าง QR code แล้ว {count} รายการ",
    batchSkippedOne: "ข้าม 1 แถว",
    batchSkippedMany: "ข้าม {count} แถว",
    batchTemplateLabel: "ไม่แน่ใจรูปแบบไฟล์? โหลดเทมเพลตไปใส่ข้อมูลได้เลย:",
    batchTemplateExcel: "ไฟล์ Excel (มีชีตคู่มือ)",
    batchTemplateCsv: "ไฟล์ CSV",
    batchJsonTemplateLabel: "เทมเพลต JSON",
    batchJsonTemplateHint:
      "ใส่ {ชื่อคอลัมน์} ตรงจุดที่ต้องการแทนค่าจากแต่ละแถว — ตำแหน่งที่ไม่ครอบ quote จะเป็นตัวเลข/boolean",
    batchJsonTemplatePlaceholder: '{ "id": "{name}", "qty": {qty} }',
    batchJsonUnknownColumn: "ไม่พบคอลัมน์: {columns}",
    batchColumnLabel: "คอลัมน์ที่จะใส่ลงใน QR code",
    batchColumnPlaceholder: "เลือกคอลัมน์",
    batchFilenameLabel: "คอลัมน์สำหรับตั้งชื่อไฟล์",
    batchFilenamePlaceholder: "เลือกคอลัมน์เพื่อใช้เป็นชื่อไฟล์",
    batchFilenameHint: "ค่าในคอลัมน์นี้จะถูกใช้เป็นชื่อไฟล์ตอนดาวน์โหลด",
    batchFilenameNote: "ใช้เพียงตั้งชื่อไฟล์เท่านั้น — ไม่มีผลต่อเนื้อหาใน QR code",
    batchTypeLabel: "ประเภทเนื้อหา QR",
    batchPpTargetLabel: "คอลัมน์เบอร์โทร/เลขประจำตัว",
    batchPpAmountLabel: "คอลัมน์ยอดเงิน (ไม่บังคับ)",
    batchPasteLabel: "หรือวางจาก Excel เลย",
    batchPasteHint: "คัดลอกช่วงเซลล์ใน Excel/Google Sheets (มีหัวคอลัมน์ด้วย) แล้ววางที่นี่",
    batchPasteUse: "ใช้ข้อมูลที่วาง",
    batchPastePlaceholder: "name\tlink\nAda\thttps://example.com",
    batchTypePlaceholder: "เลือกประเภท",
    batchGenerate: "สร้าง QR code ทั้งหมด",
    batchDownloadAll: "ดาวน์โหลดทั้งหมด",
    batchZipHint: "ไฟล์ทั้งหมดถูกรวมเป็นไฟล์ ZIP เดียว ตั้งชื่อจากคอลัมน์ที่เลือก",
    batchCardDownload: "ดาวน์โหลด QR นี้",
    batchCardDownloadShort: "ดาวน์โหลด",
    batchQueueAhead: "มีคิวก่อนหน้า {n} คิว — กำลังรอ…",
    batchPdfButton: "ไฟล์ PDF แผ่นสติกเกอร์ (A4)",
    batchDuplicateWarning: "พบค่าซ้ำกัน {n} รายการ — แถวที่ {rows} หากไม่ลบออก จะปริ้นซ้ำเป็น 2 แผ่น",
  },
};

// Bilingual labels for the QR content-type selector.
export const typeLabels: Record<Locale, Record<string, string>> = {
  en: {
    url: "URL",
    text: "Text",
    json: "JSON",
    promptpay: "PromptPay",
    email: "Email",
    phone: "Phone",
    sms: "SMS",
    wifi: "Wi-Fi",
    vcard: "vCard",
    geo: "Location",
    event: "Event",
  },
  th: {
    url: "ลิงก์",
    text: "ข้อความ",
    json: "JSON",
    promptpay: "พร้อมเพย์",
    email: "อีเมล",
    phone: "เบอร์โทร",
    sms: "SMS",
    wifi: "Wi-Fi",
    vcard: "vCard",
    geo: "พิกัด",
    event: "ปฏิทิน",
  },
};
