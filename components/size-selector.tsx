"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SIZE_PRESETS, resolveSize, type SizePreset } from "@/lib/qr-size";
import { useI18n } from "@/lib/i18n-context";

interface Props {
  /** Selected preset value, e.g. "2x". */
  preset: string;
  onPresetChange: (value: string) => void;
  /** Free-form custom size in pixels. */
  custom: string;
  onCustomChange: (value: string) => void;
}

/**
 * Shared size selector: preset buttons (2x / 4x / 8x / 10x) plus an optional
 * custom pixel input. Renders the resolved pixel width under the custom field
 * so the user sees exactly what will be produced.
 */
export function SizeSelector({ preset, onPresetChange, custom, onCustomChange }: Props) {
  const { messages } = useI18n();
  const customRef = React.useRef<HTMLInputElement>(null);
  const resolved = resolveSize(preset, custom);

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>{messages.formSizeLabel}</Label>
        <div className="flex flex-wrap gap-2">
          {SIZE_PRESETS.map((p: SizePreset) => {
            const active = preset === p.value && custom.trim() === "";
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => {
                  onPresetChange(p.value);
                  if (custom.trim() !== "") onCustomChange("");
                }}
                aria-pressed={active}
                className={
                  "min-h-11 md:min-h-9 rounded-md border px-2.5 py-1.5 text-sm font-medium transition-colors " +
                  (active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:border-primary/50")
                }
              >
                {p.label} · {p.pixels}px
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="custom-size">{messages.sizeCustomLabel}</Label>
        <Input
          id="custom-size"
          ref={customRef}
          type="number"
          inputMode="numeric"
          min={1}
          max={10000}
          placeholder={messages.sizeCustomPlaceholder}
          value={custom}
          onChange={(e) => {
            onPresetChange(preset);
            onCustomChange(e.target.value);
          }}
        />
        <p className="text-[13px] text-muted-foreground">
          {custom.trim() !== ""
            ? `${resolved}px`
            : `${resolveSize(preset, "")}px · ${messages.formScansTo}`}
        </p>
      </div>
    </div>
  );
}
