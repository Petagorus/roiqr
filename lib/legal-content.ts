/**
 * Bilingual Terms of Service and Privacy Policy content, shared by the
 * /terms and /privacy pages so both locales always stay in sync.
 */

export interface LegalSection {
  heading: { en: string; th: string };
  body: { en: string; th: string };
}

export interface LegalDoc {
  title: { en: string; th: string };
  updated: { en: string; th: string };
  intro: { en: string; th: string };
  sections: LegalSection[];
}

const TH_UPDATED = "อัปเดตล่าสุด: 30 สิงหาคม 2569";
const EN_UPDATED = "Last updated: August 30, 2026";

export const PRIVACY_DOC: LegalDoc = {
  title: { en: "Privacy Policy", th: "นโยบายความเป็นส่วนตัว" },
  updated: { en: EN_UPDATED, th: TH_UPDATED },
  intro: {
    en: "RoiQR is built to need as little of your data as possible. This policy explains exactly what touches a server and what never leaves your device.",
    th: "RoiQR ถูกออกแบบให้ใช้ข้อมูลของคุณให้น้อยที่สุด นโยบายนี้อธิบายชัดเจนว่าอะไรผ่านเซิร์ฟเวอร์และอะไรที่ไม่เคยออกจากเครื่องของคุณ",
  },
  sections: [
    {
      heading: { en: "Your files and QR content never leave your device", th: "ไฟล์และเนื้อหา QR ของคุณไม่เคยออกจากเครื่อง" },
      body: {
        en: "All QR generation — including reading Excel/CSV files, encoding payloads, and rendering images — happens inside your browser. Uploaded spreadsheets are parsed in memory on your device and are never uploaded to, stored on, or visible to our servers.",
        th: "การสร้าง QR ทั้งหมด รวมถึงการอ่านไฟล์ Excel/CSV การเข้ารหัสข้อมูล และการสร้างภาพ เกิดขึ้นภายในเบราว์เซอร์ของคุณ ไฟล์สเปรดชีตถูกอ่านในหน่วยความจำของเครื่องคุณเท่านั้น ไม่ถูกอัปโหลด ไม่ถูกจัดเก็บ และเราไม่มีวันเห็นข้อมูลของคุณ",
      },
    },
    {
      heading: { en: "What does reach the server", th: "สิ่งที่ส่งถึงเซิร์ฟเวอร์จริง" },
      body: {
        en: "Only anonymous operational signals: the batch queue uses a random ticket ID to count how many jobs are running — it contains no file or QR content and expires automatically. Like any website, the hosting provider may keep standard short-lived access logs for security and rate limiting.",
        th: "มีเพียงสัญญาณการทำงานแบบไม่ระบุตัวตน: ระบบคิวงานแบบใช้ตั๋วสุ่มเพื่อนับจำนวนงานที่กำลังทำงาน โดยไม่มีเนื้อหาไฟล์หรือ QR แนบไป และหมดอายุอัตโนมัติ และเช่นเว็บไซต์ทั่วไป ผู้ให้บริการโฮสต์อาจเก็บบันทึกการเข้าถึงระยะสั้นตามปกติเพื่อความปลอดภัยและการจำกัดอัตราการเรียกใช้",
      },
    },
    {
      heading: { en: "Local storage of your style preferences", th: "การจดจำสไตล์ในเครื่องของคุณ" },
      body: {
        en: "Your design choices (colors, module shape, logo, caption) are saved in your browser's local storage so you don't have to set them again. This data stays on your device, is never transmitted, and can be erased anytime with the form's reset button or by clearing site data.",
        th: "การตั้งค่าดีไซน์ของคุณ (สี รูปทรงโมดูล โลโก้ ข้อความใต้โค้ด) ถูกบันทึกไว้ใน local storage ของเบราว์เซอร์เพื่อไม่ต้องตั้งใหม่ ข้อมูลส่วนนี้อยู่บนเครื่องคุณเท่านั้น ไม่ถูกส่งไปที่ใด และลบได้ทุกเมื่อด้วยปุ่มล้างฟอร์มหรือล้างข้อมูลเว็บไซต์ในเบราว์เซอร์",
      },
    },
    {
      heading: { en: "No accounts, no tracking, no ads", th: "ไม่มีสมาชิก ไม่มีการติดตาม ไม่มีโฆษณา" },
      body: {
        en: "RoiQR has no sign-up and no user profiles. We do not use analytics trackers, advertising cookies, fingerprinting, or any third-party marketing scripts.",
        th: "RoiQR ไม่มีระบบสมัครสมาชิกและไม่มีโปรไฟล์ผู้ใช้ เราไม่ใช้เครื่องมือวิเคราะห์การติดตาม คุกกี้โฆษณา การตรวจจับอุปกรณ์ หรือสคริปต์การตลาดจากบุคคลที่สามใดๆ",
      },
    },
    {
      heading: { en: "We never sell or share data", th: "เราไม่ขายและไม่แบ่งปันข้อมูล" },
      body: {
        en: "There is no dataset to sell or share — we don't collect personal information, so there is nothing to hand to advertisers, data brokers, or any third party.",
        th: "ไม่มีชุดข้อมูลให้ขายหรือแบ่งปัน — เราไม่เก็บข้อมูลส่วนบุคคล จึงไม่มีอะไรจะส่งต่อให้ผู้ลงโฆษณา ผู้ค้าข้อมูล หรือบุคคลที่สามใดๆ",
      },
    },
    {
      heading: { en: "Your control", th: "สิทธิในการควบคุมของคุณ" },
      body: {
        en: "Because nothing personal is stored on our side, there is nothing to export or request deletion of. Close the tab and everything you generated is gone from your device.",
        th: "เนื่องจากเราไม่จัดเก็บข้อมูลส่วนบุคคลใดๆ จึงไม่มีอะไรต้องขอสำเนาหรือขอลบ ปิดแท็บเมื่อไหร่ ทุกอย่างที่คุณสร้างก็หายไปจากเครื่องทันที",
      },
    },
    {
      heading: { en: "Changes to this policy", th: "การเปลี่ยนแปลงนโยบาย" },
      body: {
        en: "If this policy changes materially, the updated version will be published on this page with a new “last updated” date.",
        th: "หากมีการเปลี่ยนแปลงที่สำคัญ เวอร์ชันล่าสุดจะเผยแพร่บนหน้านี้พร้อมวันที่ “อัปเดตล่าสุด” ใหม่",
      },
    },
  ],
};

export const TERMS_DOC: LegalDoc = {
  title: { en: "Terms of Service", th: "ข้อกำหนดการใช้งาน" },
  updated: { en: EN_UPDATED, th: TH_UPDATED },
  intro: {
    en: "These terms govern your use of the RoiQR website and QR generation service. By using RoiQR you agree to them.",
    th: "ข้อกำหนดนี้ใช้กับการใช้งานเว็บไซต์และบริการสร้าง QR code ของ RoiQR เมื่อคุณใช้งาน RoiQR ถือว่าคุณยอมรับข้อกำหนดนี้",
  },
  sections: [
    {
      heading: { en: "Software license", th: "สัญญาอนุญาตซอฟต์แวร์" },
      body: {
        en: "The original application source code is available under the MIT license. These service-use terms do not restrict the rights to use, copy, modify, distribute or sell that code under its license. Third-party components retain their own licenses.",
        th: "ซอร์สโค้ดต้นฉบับของแอปเผยแพร่ภายใต้ MIT ข้อกำหนดการใช้บริการนี้ไม่จำกัดสิทธิ์ในการใช้ คัดลอก แก้ไข แจกจ่าย หรือขายโค้ดตามสัญญาอนุญาต ส่วนประกอบของบุคคลที่สามคงใช้สัญญาอนุญาตของตนเอง",
      },
    },
    {
      heading: { en: "The service", th: "บริการ" },
      body: {
        en: "RoiQR is a free, browser-based tool for creating QR codes, individually or in batches from spreadsheets. The service is provided as-is and may have usage limits (such as batch concurrency or rate limits) to keep it fast and available for everyone.",
        th: "RoiQR เป็นเครื่องมือฟรีบนเบราว์เซอร์สำหรับสร้าง QR code ทั้งรายตัวและแบบกลุ่มจากสเปรดชีต บริการจัดให้ตามสภาพที่เป็น และอาจมีข้อจำกัดการใช้งาน (เช่น จำนวนงานพร้อมกันหรือการจำกัดอัตรา) เพื่อให้ทุกคนใช้งานได้รวดเร็วและต่อเนื่อง",
      },
    },
    {
      heading: { en: "Acceptable use", th: "การใช้งานที่อนุญาต" },
      body: {
        en: "Do not use RoiQR to create codes linking to unlawful, harmful, deceptive, or malicious content (including phishing, malware, or fraud). Do not attempt to overload or disrupt a running service or bypass its limits.",
        th: "ห้ามใช้ RoiQR สร้างโค้ดที่ลิงก์ไปยังเนื้อหาผิดกฎหมาย สร้างความเสียหาย หลอกลวง หรือเป็นภัย (รวมถึงฟิชชิง มัลแวร์ หรือการฉ้อโกง) และห้ามพยายามโจมตีหรือรบกวนบริการที่กำลังทำงาน หรือหลบเลี่ยงข้อจำกัดการใช้งาน",
      },
    },
    {
      heading: { en: "Your content is your responsibility", th: "เนื้อหาของคุณเป็นความรับผิดชอบของคุณ" },
      body: {
        en: "You keep all rights to the data you encode and are solely responsible for what your QR codes contain and where you publish them. We never see, store, or moderate that content because it is processed entirely in your browser.",
        th: "คุณเป็นเจ้าของสิทธิ์ในข้อมูลที่นำมาเข้ารหัส และรับผิดชอบแต่เพียงผู้เดียวต่อเนื้อหาใน QR code และที่ที่คุณนำไปเผยแพร่ เราไม่ได้เห็น ไม่จัดเก็บ และไม่ตรวจสอบเนื้อหานั้น เพราะถูกประมวลผลทั้งหมดในเบราว์เซอร์ของคุณ",
      },
    },
    {
      heading: { en: "Always test before printing", th: "ทดสอบก่อนปริ้นจริงทุกครั้ง" },
      body: {
        en: "QR quality depends on size, colors, contrast, and scanning conditions. Always scan-test your codes before large print runs or publication. RoiQR makes no warranty that every generated code scans in every environment.",
        th: "คุณภาพของ QR ขึ้นกับขนาด สี ความต่างระดับสี และสภาพการสแกน กรุณาทดสอบสแกนก่อนปริ้นจำนวนมากหรือเผยแพร่ทุกครั้ง RoiQR ไม่รับประกันว่าโค้ดที่สร้างจะสแกนได้ในทุกสภาพแวดล้อม",
      },
    },
    {
      heading: { en: "Disclaimer and limitation of liability", th: "การปฏิเสธการรับประกันและการจำกัดความรับผิด" },
      body: {
        en: "The service is provided without warranties of any kind, express or implied, to the maximum extent permitted by law. To the extent permitted by law, the operator is not liable for any indirect, incidental, or consequential damages arising from use of the service, including printing costs or losses caused by codes that fail to scan.",
        th: "บริการจัดให้โดยไม่มีการรับประกันใดๆ ทั้งโดยชัดแจ้งหรือโดยปริยาย เท่าที่กฎหมายอนุญาต ผู้ให้บริการไม่รับผิดต่อความเสียหายทางอ้อม โดยบังเอิญ หรือต่อเนื่องจากการใช้บริการ รวมถึงค่าใช้จ่ายการปริ้นหรือความเสียหายจากโค้ดที่สแกนไม่ได้",
      },
    },
    {
      heading: { en: "Changes to the service or terms", th: "การเปลี่ยนแปลงบริการหรือข้อกำหนด" },
      body: {
        en: "We may update the service or these terms; material changes will be reflected on this page with a new “last updated” date. Continued use after changes means acceptance of the updated terms.",
        th: "เราอาจปรับปรุงบริการหรือข้อกำหนดนี้ การเปลี่ยนแปลงที่สำคัญจะแสดงบนหน้านี้พร้อมวันที่ “อัปเดตล่าสุด” ใหม่ การใช้งานต่อไปหลังการเปลี่ยนแปลงถือว่ายอมรับข้อกำหนดที่ปรับปรุงแล้ว",
      },
    },
  ],
};
