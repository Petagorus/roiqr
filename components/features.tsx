"use client";

import { motion, useInView } from "framer-motion";
import * as React from "react";
import {
  Download,
  FileSpreadsheet,
  Gauge,
  Lock,
  Scan,
  Sparkles,
} from "lucide-react";

import { useI18n, type Messages } from "@/lib/i18n-context";

interface Feature {
  icon: typeof Scan;
  title: string;
  body: string;
}

function buildFeatures(m: Messages): Feature[] {
  return [
    {
      icon: Scan,
      title: m.feat1Title,
      body: m.feat1Body,
    },
    {
      icon: FileSpreadsheet,
      title: m.feat2Title,
      body: m.feat2Body,
    },
    {
      icon: Lock,
      title: m.feat3Title,
      body: m.feat3Body,
    },
    {
      icon: Sparkles,
      title: m.feat4Title,
      body: m.feat4Body,
    },
    {
      icon: Download,
      title: m.feat5Title,
      body: m.feat5Body,
    },
    {
      icon: Gauge,
      title: m.feat6Title,
      body: m.feat6Body,
    },
  ];
}

function FeatureCard({
  icon: Icon,
  title,
  body,
  index,
}: {
  icon: typeof Scan;
  title: string;
  body: string;
  index: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  // Vary the layout so the section doesn't read as a uniform grid.
  const isWide = index % 3 === 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
      className={
        "group rounded-2xl border bg-card/80 p-6 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-black/[0.06] " +
        (isWide ? "sm:col-span-2" : "sm:col-span-1")
      }
    >
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-md shadow-primary/20 transition-transform duration-300 group-hover:scale-105">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mb-1.5 text-base font-semibold text-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
    </motion.div>
  );
}

export function Features() {
  const { messages } = useI18n();
  const features = buildFeatures(messages);
  return (
    <section id="features" className="relative scroll-mt-20 px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 max-w-xl">
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-muted-foreground">
            {messages.featEyebrow}
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {messages.featTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} index={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
