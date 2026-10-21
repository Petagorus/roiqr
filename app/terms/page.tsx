import type { Metadata } from "next";

import { Footer } from "@/components/footer";
import { LegalPage } from "@/components/legal-page";
import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title: "ข้อกำหนดการใช้งาน — RoiQR",
  description:
    "Terms of Service for RoiQR — the free browser-based QR code generator. / ข้อกำหนดการใช้งานเว็บไซต์และบริการสร้าง QR code ฟรีของ RoiQR",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen">
        <LegalPage doc="terms" />
      </main>
      <Footer />
    </>
  );
}
