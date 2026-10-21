import type { Metadata } from "next";

import { Footer } from "@/components/footer";
import { LegalPage } from "@/components/legal-page";
import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title: "นโยบายความเป็นส่วนตัว — RoiQR",
  description:
    "Privacy Policy for RoiQR — your files and QR content never leave your device. / นโยบายความเป็นส่วนตัวของ RoiQR — ไฟล์และเนื้อหา QR ของคุณไม่เคยออกจากเครื่อง",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen">
        <LegalPage doc="privacy" />
      </main>
      <Footer />
    </>
  );
}
