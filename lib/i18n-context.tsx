"use client";

import { useSyncExternalStore } from "react";

import { LOCALES, localeNames, messages, typeLabels, type Locale } from "./locales";

export type { Locale, Messages } from "./locales";
export { LOCALES, localeNames, messages, typeLabels };

export interface Ctx {
  locale: Locale;
  setLocale: (l: Locale) => void;
  messages: typeof messages[Locale];
  typeLabels: Record<string, string>;
  theme: "light" | "dark" | "system";
  setTheme: (t: "light" | "dark" | "system") => void;
  resolvedTheme: "light" | "dark";
  isRTL: boolean;
}

// Default used before the provider publishes (and as the SSR snapshot).
export const DEFAULT: Ctx = {
  locale: "en",
  setLocale: () => {},
  messages: messages.en,
  typeLabels: typeLabels.en,
  theme: "system",
  setTheme: () => {},
  resolvedTheme: "light",
  isRTL: false,
};

// ---------------------------------------------------------------------------
// External store
//
// Plain React context can't be consumed from a plain module across the
// client/server boundary (the bundler drops the React namespace reference
// during SSR of client components), so the i18n state lives in a module-level
// store instead. Consumers subscribe via useSyncExternalStore, which is what
// makes locale/theme switches re-render every reader instantly — without it,
// React bails out of re-rendering the children subtree and stale text stays
// on screen until a full page reload.
// ---------------------------------------------------------------------------

let currentValue: Ctx | null = null;
let lastPublished: Ctx | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Update the store contents without notifying subscribers. Render-safe. */
export function writeStoreValue(value: Ctx) {
  currentValue = value;
}

/**
 * Update the store contents and notify every subscribed consumer.
 * Compares against the last published value, not the current one — the
 * provider writes silently during render, so `currentValue` is already
 * up to date by the time the post-commit publish runs.
 */
export function publishStoreValue(value: Ctx) {
  currentValue = value;
  if (lastPublished === value) return;
  lastPublished = value;
  listeners.forEach((listener) => listener());
}

function getSnapshot(): Ctx {
  return currentValue ?? DEFAULT;
}

function getServerSnapshot(): Ctx {
  return DEFAULT;
}

export function useI18n(): Ctx {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
