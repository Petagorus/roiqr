"use client";

import * as React from "react";
import { Upload, X, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { HexInput } from "@/components/hex-input";
import { TemplatePicker } from "@/components/template-picker";
import {
  COLOR_PALETTES,
  readFileAsDataURL,
  type ModuleShape,
} from "@/lib/qr-render";
import type { QrTemplate } from "@/lib/qr-templates";
import { useI18n } from "@/lib/i18n-context";
import { useToast } from "@/components/ui/toast-provider";

interface Props {
  /** Selected module shape. */
  shape: ModuleShape;
  onShapeChange: (shape: ModuleShape) => void;
  /** Selected palette name (one of COLOR_PALETTES.name). */
  palette: string;
  onPaletteChange: (name: string) => void;
  /** Custom colors that override the palette, or null to use the palette. */
  customColor: { moduleColor: string; bgColor: string } | null;
  onCustomColorChange: (customColor: { moduleColor: string; bgColor: string } | null) => void;
  /** Logo data URL, or null when none selected. */
  logo: string | null;
  onLogoChange: (dataUrl: string | null) => void;
  /** Center logo size in px (32–128). */
  logoSize: number;
  onLogoSizeChange: (size: number) => void;
  /** One-click style template selected. */
  onSelectTemplate: (template: QrTemplate) => void;
}

const SHAPES: { value: ModuleShape; labelKey: "styleShapeSquare" | "styleShapeRounded" | "styleShapeDots" | "styleShapeDiamond" }[] = [
  { value: "square", labelKey: "styleShapeSquare" },
  { value: "rounded", labelKey: "styleShapeRounded" },
  { value: "dots", labelKey: "styleShapeDots" },
  { value: "diamond", labelKey: "styleShapeDiamond" },
];

/**
 * Style controls shared by the single and batch flows: module shape, color
 * palette, and an optional center logo. The logo is drawn with H error
 * correction so the resulting code still scans.
 */
export function StyleSelector({
  shape,
  onShapeChange,
  palette,
  onPaletteChange,
  customColor,
  onCustomColorChange,
  logo,
  onLogoChange,
  logoSize,
  onLogoSizeChange,
  onSelectTemplate,
}: Props) {
  const { messages } = useI18n();
  const { addToast } = useToast();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const activePalette =
    COLOR_PALETTES.find((p) => p.name === palette) ?? COLOR_PALETTES[0]!;

  // Current module + background colors. When custom colors are active they
  // win over the palette; otherwise the selected palette is shown.
  const moduleColor = customColor?.moduleColor ?? activePalette.dark;
  const bgColor = customColor?.bgColor ?? activePalette.light;

  return (
    <div className="space-y-4">
      {/* One-click style templates */}
      <TemplatePicker
        palette={palette}
        shape={shape}
        customColor={customColor}
        onSelect={onSelectTemplate}
      />

      {/* Module shape */}
      <div className="space-y-1.5">
        <Label>{messages.styleShapeLabel}</Label>
        <div className="flex flex-wrap gap-2">
          {SHAPES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => onShapeChange(s.value)}
              aria-pressed={shape === s.value}
              className={
                "min-h-11 md:min-h-9 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors " +
                (shape === s.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background hover:border-primary/50")
              }
            >
              {messages[s.labelKey]}
            </button>
          ))}
        </div>
        <p className="text-[13px] text-muted-foreground">{messages.helpShape}</p>
      </div>

      {/* Color palette */}
      <div className="space-y-1.5">
        <Label>{messages.stylePaletteLabel}</Label>
        <div className="flex flex-wrap gap-3">
          {COLOR_PALETTES.map((p) => {
            const active = palette === p.name;
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => {
                  onPaletteChange(p.name);
                  onCustomColorChange(null);
                }}
                aria-label={p.name}
                aria-pressed={active}
                title={p.name}
                className={
                  "relative h-11 w-11 rounded-full border-2 transition-colors " +
                  (active ? "border-primary ring-2 ring-primary/30" : "border-border")
                }
                style={{ backgroundColor: p.dark }}
              >
                {active && (
                  <span className="absolute inset-0 flex items-center justify-center text-white">
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <p className="text-[13px] text-muted-foreground">
          {activePalette.dark} / {activePalette.light}
        </p>
      </div>

      {/* Custom colors */}
      <div className="space-y-1.5">
        <Label>{messages.styleCustomColorLabel}</Label>
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">{messages.styleCustomColorModule}</span>
            <input
              type="color"
              value={moduleColor}
              onChange={(e) =>
                onCustomColorChange({
                  moduleColor: e.target.value,
                  bgColor: bgColor,
                })
              }
              aria-label={messages.styleCustomColorModule}
              className="h-9 w-14 cursor-pointer rounded-md border border-input"
            />
            <HexInput
              value={moduleColor}
              onCommit={(hex) => onCustomColorChange({ moduleColor: hex, bgColor })}
              label={messages.styleCustomColorModule}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">{messages.styleCustomColorBackground}</span>
            <input
              type="color"
              value={bgColor}
              onChange={(e) =>
                onCustomColorChange({
                  moduleColor: moduleColor,
                  bgColor: e.target.value,
                })
              }
              aria-label={messages.styleCustomColorBackground}
              className="h-9 w-14 cursor-pointer rounded-md border border-input"
            />
            <HexInput
              value={bgColor}
              onCommit={(hex) => onCustomColorChange({ moduleColor, bgColor: hex })}
              label={messages.styleCustomColorBackground}
            />
          </div>
          <button
            type="button"
            onClick={() => onCustomColorChange(null)}
            disabled={customColor === null}
            className={
              "min-h-11 md:min-h-9 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed " +
              (customColor === null
                ? "border-border bg-background text-muted-foreground"
                : "border-border bg-background hover:border-primary/50")
            }
          >
            {messages.styleCustomColorUse}
          </button>
        </div>
        <p className="text-[13px] text-muted-foreground">
          {moduleColor} / {bgColor}
        </p>
        <p className="text-[13px] text-muted-foreground">{messages.helpCustomColor}</p>
      </div>

      {/* Logo upload */}
      <div className="space-y-1.5">
        <Label>{messages.styleLogoLabel}</Label>
        {logo ? (
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="Logo preview"
              className="h-10 w-10 rounded border bg-white p-0.5 object-contain"
            />
            <span className="text-sm text-muted-foreground">Logo loaded</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onLogoChange(null)}
            >
              <X className="mr-1.5 h-3.5 w-3.5" />
              {messages.styleLogoRemove}
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            {messages.styleLogoUpload}
          </Button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              const dataUrl = await readFileAsDataURL(file);
              onLogoChange(dataUrl);
            } catch {
              addToast({ description: messages.errorLoadImage, variant: "destructive" });
            }
            // Reset so the same file can be re-selected.
            e.target.value = "";
          }}
          className="hidden"
        />
        <p className="text-xs text-muted-foreground">
          {messages.styleLogoHint}
        </p>
        {logo && (
          <div className="flex items-center gap-3">
            <Label className="text-xs text-muted-foreground">
              {messages.styleLogoSizeLabel}
            </Label>
            <input
              type="range"
              min={32}
              max={128}
              step={8}
              value={logoSize}
              onChange={(e) => onLogoSizeChange(Number(e.target.value))}
              aria-label={messages.styleLogoSizeLabel}
              className="h-1.5 w-40 cursor-pointer accent-[hsl(var(--primary))]"
            />
            <span className="w-10 text-xs tabular-nums text-muted-foreground">{logoSize}px</span>
          </div>
        )}
      </div>
    </div>
  );
}
