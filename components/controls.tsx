"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useI18n, localeNames, type Locale } from "@/lib/i18n-context";

// A compact two-in-one control: locale switcher + light/dark theme toggle.
export function Controls() {
  const { locale, setLocale, theme, setTheme, resolvedTheme } = useI18n();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onClick(e: MouseEvent) {
      const el = document.getElementById("locale-menu");
      if (el && !el.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  const isDark = resolvedTheme === "dark";

  return (
    <div className="flex items-center gap-2">
      {/* Locale switcher */}
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="true"
          aria-expanded={open}
          className="h-9 gap-1.5 text-sm font-medium"
        >
          <span className="text-base leading-none">🌐</span>
          <span className="hidden xs:inline">{localeNames[locale]}</span>
        </Button>
        {open && (
          <div className="absolute right-0 z-50 mt-2 w-40 rounded-md border bg-background p-1 shadow-md" id="locale-menu">
            {(["en", "th"] as Locale[]).map((l) => (
              <button
                key={l}
                onClick={() => {
                  setLocale(l);
                  setOpen(false);
                }}
                className={
                  "flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm " +
                  (l === locale
                    ? "bg-accent font-medium"
                    : "hover:bg-accent/60")
                }
              >
                <span>{localeNames[l]}</span>
                {l === locale && <span aria-hidden>✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Theme toggle */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        className="h-9 w-9 p-0"
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
    </div>
  );
}
