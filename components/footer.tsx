"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { useI18n } from "@/lib/i18n-context";
import { requestGeneratorTab } from "@/lib/generator-tab";

export function Footer() {
  const { messages } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border/70 bg-card/40 px-6 py-14">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          {/* Brand + promise */}
          <div className="max-w-xs space-y-3">
            <div className="flex items-center gap-2.5">
              <img
                src="/brand/logo-crop.png"
                alt="RoiQR logo"
                className="h-9 w-9 rounded-xl object-cover shadow-sm shadow-black/10 ring-1 ring-black/5"
              />
              <span className="text-lg font-semibold tracking-tight text-foreground">
                {messages.footerCopy}
              </span>
            </div>
            <p className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              {messages.footerPromise}
            </p>
          </div>

          {/* Link groups */}
          <div className="flex gap-14 sm:gap-20">
            <nav aria-label={messages.footerExplore}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
                {messages.footerExplore}
              </p>
              <ul className="space-y-2.5 text-sm">
                <li>
                  {/* /#generator works from any page: on the home page it
                      scrolls to the generator, elsewhere it navigates home. */}
                  <Link
                    href="/#generator"
                    onClick={() => requestGeneratorTab("single")}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {messages.tabSingle}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#generator"
                    onClick={() => requestGeneratorTab("batch")}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {messages.tabBatch}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#faq"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {messages.faqEyebrow}
                  </Link>
                </li>
              </ul>
            </nav>

            <nav aria-label={messages.footerLegal}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
                {messages.footerLegal}
              </p>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link
                    href="/terms"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {messages.footerTerms}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {messages.footerPrivacy}
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-2 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
          <span>
            © {year} {messages.footerCopy}. {messages.footerRights}
          </span>
        </div>
      </div>
    </footer>
  );
}
