"use client";

import Link from "next/link";

import { Controls } from "@/components/controls";
import { useI18n } from "@/lib/i18n-context";

export function Nav() {
  const { messages } = useI18n();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* Home link: on the home page this scrolls to top, on legal pages
            it returns to the generator. */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            aria-label="RoiQR — home"
            className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <img
              src="/brand/logo-crop.png"
              alt=""
              className="h-9 w-9 rounded-xl object-cover shadow-sm shadow-black/10 ring-1 ring-black/5"
            />
            <span className="text-base font-semibold tracking-tight text-foreground">
              RoiQR
            </span>
          </Link>
          <nav className="hidden items-center gap-5 text-sm text-muted-foreground sm:flex">
            <Link
              href="/#features"
              className="transition-colors hover:text-foreground"
            >
              {messages.navFeatures}
            </Link>
            <Link
              href="/#faq"
              className="transition-colors hover:text-foreground"
            >
              {messages.navFaq}
            </Link>
          </nav>
        </div>
        <Controls />
      </div>
    </header>
  );
}
