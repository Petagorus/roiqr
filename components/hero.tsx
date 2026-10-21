"use client";

import * as React from "react";

import { motion, type Variants } from "framer-motion";
import { QrCode, Upload } from "lucide-react";

import { useI18n } from "@/lib/i18n-context";
import { requestGeneratorTab } from "@/lib/generator-tab";

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export function Hero() {
  const { messages } = useI18n();
  return (
    <section className="relative overflow-hidden px-6 pt-24 pb-16 sm:pt-32 sm:pb-24">
      {/* Ambient background: generated brand art + soft glows on top.
          Light and dark each get their own art so the hero matches the theme. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <img
          src="/brand/hero-bg.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-80 dark:hidden"
        />
        <img
          src="/brand/hero-bg-dark.jpg"
          alt=""
          loading="lazy"
          className="absolute inset-0 hidden h-full w-full object-cover opacity-70 dark:block"
        />
        <div className="absolute inset-0 hidden bg-gradient-to-b from-background/40 via-transparent to-background dark:block dark:opacity-60" />
        <div className="absolute left-1/2 top-[-12rem] h-[28rem] w-[52rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-primary/10 via-primary/5 to-transparent blur-3xl" />
        <div className="absolute right-[6%] top-[16%] h-72 w-72 rounded-full bg-gradient-to-tl from-primary/10 to-transparent blur-3xl" />
      </div>

      <div className="mx-auto max-w-3xl text-center">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center gap-6"
        >
          <motion.img
            variants={item}
            src="/brand/logo.png"
            alt="RoiQR"
            className="h-24 w-24 rounded-3xl border border-border/60 bg-card object-cover shadow-lg shadow-black/10"
          />
          <motion.span
            variants={item}
            className="inline-flex items-center gap-2 rounded-full border bg-card/80 px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur"
          >
            <QrCode className="h-3.5 w-3.5 text-primary" />
            {messages.heroSubtitle}
          </motion.span>

          <motion.h1
            variants={item}
            className="text-balance text-4xl font-semibold leading-[1.15] tracking-tight text-foreground sm:text-6xl"
          >
            {messages.heroTitle.split("\n").map((line, i) => (
              <React.Fragment key={i}>
                {i > 0 && <br />}
                {line}
              </React.Fragment>
            ))}
          </motion.h1>

          <motion.p
            variants={item}
            className="max-w-xl text-balance text-lg leading-relaxed text-muted-foreground"
          >
            {messages.heroBody}
          </motion.p>

          <motion.div
            variants={item}
            className="flex flex-wrap items-center justify-center gap-3 pt-2"
          >
            <a
              href="#generator"
              onClick={() => requestGeneratorTab("single")}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/25"
            >
              <QrCode className="h-4 w-4" />
              {messages.heroSingle}
            </a>
            <a
              href="#generator"
              onClick={() => requestGeneratorTab("batch")}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-6 py-3 text-sm font-medium text-foreground shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-accent"
            >
              <Upload className="h-4 w-4" />
              {messages.heroBatch}
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
