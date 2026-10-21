"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { FAQ_ITEMS } from "@/lib/faq-content";
import { useI18n, type Locale } from "@/lib/i18n-context";

/**
 * On-page FAQ. Every question and answer is rendered as visible, crawlable
 * text (no accordions that hide content) — answer engines and AI crawlers
 * extract from the same text users read, mirroring the FAQPage JSON-LD.
 */
export function Faq() {
  const { messages, locale } = useI18n();
  const lang = locale as Locale;

  return (
    <section id="faq" className="relative px-6 py-20">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-muted-foreground">
            {messages.faqEyebrow}
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {messages.faqTitle}
          </h2>
        </div>

        <div className="space-y-2">
          {FAQ_ITEMS.map((item, index) => (
            <motion.div
              key={item.q.en}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: index * 0.04 }}
              className="rounded-xl border bg-card/70 px-5 py-4"
            >
              <h3 className="text-base font-semibold text-foreground">
                {item.q[lang]}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {item.a[lang]}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
