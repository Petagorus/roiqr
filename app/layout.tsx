import type { Metadata, Viewport } from "next";

import { kanit } from "@/components/fonts";
import { PwaRegister } from "@/components/pwa-register";
import { ToastProvider } from "@/components/ui/toast-provider";
import { I18nProvider } from "@/lib/i18n-provider";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "RoiQR — ร้อย QR code ในคลิกเดียว",
  description:
    "Generate a single QR code from any link, text, contact or Wi-Fi detail — or mass-produce hundreds from an Excel or CSV file. No file storage, runs entirely in your browser.",
  keywords: ["RoiQR", "QR code", "QR generator", "batch QR", "Excel QR", "vCard QR"],
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: "/",
    languages: { en: "/", th: "/" },
  },
  icons: {
    icon: "/brand/favicon.png",
    apple: "/brand/icon-192.png",
  },
  openGraph: {
    type: "website",
    siteName: "RoiQR",
    locale: "th_TH",
    alternateLocale: "en_US",
    title: "RoiQR — ร้อย QR code ในคลิกเดียว",
    description:
      "Generate a single QR code from any link, text, contact or Wi-Fi detail — or mass-produce hundreds from an Excel or CSV file.",
    images: [
      {
        url: "/brand/logo.png",
        width: 1024,
        height: 1024,
        alt: "RoiQR — QR code generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RoiQR — ร้อย QR code ในคลิกเดียว",
    description:
      "Generate a single QR code from any link, text, contact or Wi-Fi detail — or mass-produce hundreds from an Excel or CSV file.",
    images: ["/brand/logo.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f6f3ee",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={kanit.variable}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <I18nProvider>
          <ToastProvider>{children}</ToastProvider>
        </I18nProvider>
        <PwaRegister />
      </body>
    </html>
  );
}
