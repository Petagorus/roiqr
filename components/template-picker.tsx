"use client";

import * as React from "react";

import { Label } from "@/components/ui/label";
import { COLOR_PALETTES, type ModuleShape } from "@/lib/qr-render";
import { QR_TEMPLATES, type QrTemplate } from "@/lib/qr-templates";
import { useI18n, type Messages } from "@/lib/i18n-context";

/** Cells drawn in the 4×4 thumbnail so each chip looks like a tiny QR. */
const THUMB_MATRIX = [
  [1, 0, 1, 1],
  [1, 1, 0, 1],
  [0, 1, 1, 0],
  [1, 0, 1, 1],
];

const TEMPLATE_NAME_KEYS: Record<string, keyof Messages> = {
  classic: "templateClassic",
  minimal: "templateMinimal",
  ocean: "templateOcean",
  forest: "templateForest",
  wine: "templateWine",
  slate: "templateSlate",
};

function cellClass(shape: ModuleShape): string {
  switch (shape) {
    case "dots":
      return "rounded-full";
    case "rounded":
      return "rounded-[2px]";
    case "diamond":
      return "[clip-path:polygon(50%_0,100%_50%,50%_100%,0_50%)]";
    default:
      return "";
  }
}

interface Props {
  palette: string;
  shape: ModuleShape;
  /** When custom colors are active no template is considered active. */
  customColor: { moduleColor: string; bgColor: string } | null;
  onSelect: (template: QrTemplate) => void;
}

/**
 * One-click style templates shown as chips with a live miniature preview of
 * the palette + module shape. Active template gets a highlight ring.
 */
export function TemplatePicker({ palette, shape, customColor, onSelect }: Props) {
  const { messages } = useI18n();

  const activeId = customColor
    ? null
    : QR_TEMPLATES.find((t) => t.palette === palette && t.shape === shape)?.id ?? null;

  return (
    <div data-testid="template-picker">
      <Label className="text-sm font-semibold">{messages.styleTemplateLabel}</Label>
      <div className="mt-3 flex flex-wrap gap-2.5">
        {QR_TEMPLATES.map((t) => {
          const colors = COLOR_PALETTES.find((p) => p.name === t.palette)!;
          const name = messages[TEMPLATE_NAME_KEYS[t.id]!] as string;
          const active = activeId === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelect(t)}
              aria-pressed={active}
              title={name}
              className={
                "group flex flex-col items-center gap-1.5 rounded-xl border p-2 transition-all " +
                (active
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-border hover:border-primary/40")
              }
            >
              <span
                className="grid grid-cols-4 gap-[1.5px] rounded-lg p-1.5"
                style={{ backgroundColor: colors.light }}
              >
                {THUMB_MATRIX.flatMap((row, r) =>
                  row.map((cell, c) => (
                    <span
                      key={`${r}-${c}`}
                      className={
                        "h-[5px] w-[5px] " +
                        (cell ? cellClass(t.shape) : "opacity-0")
                      }
                      style={cell ? { backgroundColor: colors.dark } : undefined}
                    />
                  )),
                )}
              </span>
              <span className="text-[11px] font-medium text-foreground">{name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
