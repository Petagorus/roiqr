"use client";

import * as React from "react";

import { motion } from "framer-motion";

import { PRIVACY_DOC, TERMS_DOC, type LegalDoc } from "@/lib/legal-content";
import { useI18n, type Locale } from "@/lib/i18n-context";

const DOCS: Record<"terms" | "privacy", LegalDoc> = {
  terms: TERMS_DOC,
  privacy: PRIVACY_DOC,
};

/**
 * Renders the Terms of Service or Privacy Policy document, picking the text
 * from the active locale (switching language updates the page instantly,
 * like the rest of the site).
 */
export function LegalPage({ doc }: { doc: "terms" | "privacy" }) {
  const { locale } = useI18n();
  const lang = locale as Locale;
  const content = DOCS[doc];

  return (
    <article className="mx-auto max-w-2xl px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          {content.title[lang]}
        </h1>
        <p className="mt-1.5 text-xs uppercase tracking-widest text-muted-foreground">
          {content.updated[lang]}
        </p>
        <p className="mt-6 text-sm leading-relaxed text-foreground/85">
          {content.intro[lang]}
        </p>

        <div className="mt-10 space-y-8">
          {content.sections.map((section, index) => (
            <section key={index}>
              <h2 className="text-base font-semibold text-foreground">
                {section.heading[lang]}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {section.body[lang]}
              </p>
            </section>
          ))}
        </div>

        <p className="mt-12 rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
          RoiQR · {content.title[lang]}
        </p>
      </motion.div>
    </article>
  );
}
