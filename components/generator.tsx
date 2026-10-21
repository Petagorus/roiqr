"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { BatchUploader } from "@/components/batch-uploader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SingleQrForm } from "@/components/single-qr-form";
import { useI18n } from "@/lib/i18n-context";
import { onGeneratorTab, consumePendingGeneratorTab, type GeneratorTab } from "@/lib/generator-tab";

export function Generator() {
  const { messages } = useI18n();
  const [tab, setTab] = React.useState<GeneratorTab>("single");

  // Hero CTAs and footer links request a tab; requests made while we were
  // unmounted (e.g. from /privacy) are consumed here on mount.
  React.useEffect(() => {
    const pending = consumePendingGeneratorTab();
    // Tab requests can only be consumed after mount (they survive SSR).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (pending) setTab(pending);
    return onGeneratorTab((t) => {
      consumePendingGeneratorTab();
      setTab(t);
    });
  }, []);

  return (
    <section id="generator" className="relative scroll-mt-20 px-6 py-16">
      {/* Wide layout so the single form can show content + preview side by side */}
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            {messages.generatorTitle}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {messages.generatorSubtitle}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border bg-card/90 p-4 shadow-xl shadow-black/[0.04] backdrop-blur sm:p-6"
        >
          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as GeneratorTab)}
            className="w-full"
          >
            <TabsList className="mx-auto mb-8 grid w-full max-w-sm grid-cols-2 rounded-full p-1">
              <TabsTrigger
                value="single"
                className="rounded-full data-[state=active]:shadow-sm"
              >
                {messages.tabSingle}
              </TabsTrigger>
              <TabsTrigger
                value="batch"
                className="rounded-full data-[state=active]:shadow-sm"
              >
                {messages.tabBatch}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="single" className="mt-0">
              <SingleQrForm />
            </TabsContent>
            <TabsContent value="batch" className="mt-0">
              <BatchUploader />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </section>
  );
}
