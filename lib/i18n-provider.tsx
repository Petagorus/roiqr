"use client";

import { useEffect, useLayoutEffect, useMemo, useState } from "react";

import {
  LOCALES,
  localeNames,
  messages,
  type Locale,
  Messages,
  typeLabels,
} from "./locales";
import { publishStoreValue, writeStoreValue, type Ctx } from "./i18n-context";

export type { Ctx };

const STORAGE_LOCALE = "qr-gen-locale";
const STORAGE_THEME = "qr-gen-theme";

function readInitialLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(STORAGE_LOCALE);
  return LOCALES.includes(stored as Locale) ? (stored as Locale) : "en";
}

function readInitialTheme(): Ctx["theme"] {
  if (typeof window === "undefined") return "system";
  const stored = window.localStorage.getItem(STORAGE_THEME);
  if (stored === "light" || stored === "dark" || stored === "system") return stored;
  return "system";
}

function resolveTheme(theme: Ctx["theme"]): "light" | "dark" {
  if (theme === "light" || theme === "dark") return theme;
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readInitialLocale);
  const [theme, setThemeState] = useState<Ctx["theme"]>(readInitialTheme);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    try {
      window.localStorage.setItem(STORAGE_LOCALE, l);
    } catch {
      /* ignore storage errors */
    }
    document.documentElement.lang = l;
  };

  const setTheme = (t: Ctx["theme"]) => {
    setThemeState(t);
    try {
      window.localStorage.setItem(STORAGE_THEME, t);
    } catch {
      /* ignore storage errors */
    }
  };

  useEffect(() => {
    const resolved = resolveTheme(theme);
    // Theme must be applied after mount so documentElement exists; sync state
    // here is the hydration-safe path.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResolvedTheme(resolved);
    const root = document.documentElement;
    if (resolved === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (theme === "system") {
        setResolvedTheme(mq.matches ? "dark" : "light");
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<Ctx>(
    () => ({
      locale,
      setLocale,
      messages: messages[locale],
      typeLabels: typeLabels[locale],
      theme,
      setTheme,
      resolvedTheme,
      isRTL: false,
    }),
    [locale, setLocale, theme, setTheme, resolvedTheme],
  );

  // Keep the store contents in sync synchronously during render so consumers
  // hydrating (or first-rendering) read the freshest value. This is a plain
  // side effect on a plain object, so it survives the client/server boundary
  // where React context's useContext() cannot be called.
  writeStoreValue(value);

  // Publish after commit so every subscribed consumer re-renders with the new
  // value the moment the locale or theme changes — before the browser paints.
  useIsomorphicLayoutEffect(() => {
    publishStoreValue(value);
  }, [value]);

  return <>{children}</>;
}

// useLayoutEffect warns on the server; fall back to useEffect there.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
