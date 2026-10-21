import { FAQ_ITEMS } from "./faq-content";

/**
 * JSON-LD structured data for the home page — SEO, AEO (answer engines /
 * featured snippets) and GEO (generative engines) all read this graph:
 *
 * - Organization + WebSite: entity definition for "RoiQR"
 * - SoftwareApplication: what the product is, category, price, features
 * - FAQPage: question/answer pairs mirrored from the on-page FAQ section
 *
 * Kept pure (no DOM, no i18n context) so it can be unit-tested and rendered
 * from the server component.
 */

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const SITE_NAME = "RoiQR";
const SITE_DESC_EN =
  "Generate a single QR code from any link, text, contact or Wi-Fi detail — or mass-produce hundreds from an Excel or CSV file. No file storage, runs entirely in your browser.";
const SITE_DESC_TH =
  "สร้าง QR code ตัวเดียวจากลิงก์ ข้อความ ข้อมูลติดต่อ หรือ Wi-Fi หรือสร้างหลายร้อยตัวจากไฟล์ Excel/CSV ในคลิกเดียว ไม่จัดเก็บไฟล์ใดๆ ทำงานทั้งหมดในเบราว์เซอร์ของคุณ";

const FEATURES_EN = [
  "Single QR codes: URL, text, email, phone, SMS, Wi-Fi, vCard, location, calendar event",
  "Batch QR generation from .xlsx / .xls / .csv",
  "Custom colors, module shapes, center logo and caption",
  "PNG, SVG and clipboard export; batch ZIP and printable A4 sticker-sheet PDF",
  "Content-based filenames from a spreadsheet column",
  "Everything generated in the browser — no data stored",
  "Free, no sign-up, static codes that never expire",
];

export function buildSeoJsonLd(): Record<string, unknown> {
  const orgId = `${SITE_URL}/#organization`;
  const siteId = `${SITE_URL}/#website`;
  const appId = `${SITE_URL}/#software`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId,
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/brand/icon-512.png`,
        description: SITE_DESC_TH,
      },
      {
        "@type": "WebSite",
        "@id": siteId,
        url: SITE_URL,
        name: SITE_NAME,
        description: SITE_DESC_EN,
        inLanguage: ["th", "en"],
        publisher: { "@id": orgId },
      },
      {
        "@type": "SoftwareApplication",
        "@id": appId,
        name: SITE_NAME,
        url: SITE_URL,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Any (web browser)",
        browserRequirements: "Requires JavaScript",
        description: SITE_DESC_EN,
        inLanguage: ["th", "en"],
        isAccessibleForFree: true,
        featureList: FEATURES_EN,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "THB",
        },
        publisher: { "@id": orgId },
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/#faq`,
        inLanguage: ["th", "en"],
        mainEntity: FAQ_ITEMS.flatMap((item) => [
          {
            "@type": "Question",
            name: item.q.th,
            acceptedAnswer: { "@type": "Answer", text: item.a.th },
          },
          {
            "@type": "Question",
            name: item.q.en,
            acceptedAnswer: { "@type": "Answer", text: item.a.en },
          },
        ]),
      },
    ],
  };
}
