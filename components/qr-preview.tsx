"use client";

import * as React from "react";
import { QrCode } from "lucide-react";

import {
  COLOR_PALETTES,
  type ModuleShape,
  type RenderOptions,
  renderQrToCanvas,
} from "@/lib/qr-render";
import { useI18n } from "@/lib/i18n-context";

interface Props {
  /** The payload string to render. */
  payload: string;
  /** Selected module shape. */
  shape: ModuleShape;
  /** Selected palette name. */
  palette: string;
  /** Custom colors that override the palette, or null to use the palette. */
  customColor?: { moduleColor: string; bgColor: string } | null;
  /** Optional logo data URL. */
  logo: string | null;
  /** Center logo size in px. */
  logoSize?: number;
  /** Optional caption drawn under the code in the preview. */
  caption?: string | null;
  /** Whether to show the "scans to" payload text below. */
  showPayload?: boolean;
}

/**
 * Live QR preview. Re-renders onto a canvas whenever any input changes so the
 * right-hand panel updates instantly as the user edits content, shape, color,
 * or logo — matching the QR Code Monkey workflow.
 */
export function QrPreview({
  payload,
  shape,
  palette,
  customColor,
  logo,
  logoSize = 64,
  caption,
  showPayload = true,
}: Props) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const { messages } = useI18n();
  // Verdicts are stamped with the inputs that produced them; a stamp that no
  // longer matches the current inputs is stale and hidden.
  const [verify, setVerify] = React.useState<{ ok: boolean; for: string } | null>(null);

  const activePalette =
    COLOR_PALETTES.find((p) => p.name === palette) ?? COLOR_PALETTES[0]!;

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Only render when there is actual content to encode.
    if (!payload.trim()) return;
    renderQrToCanvas(canvas, payload, {
      width: 320,
      margin: 2,
      errorCorrectionLevel: "H",
      color: customColor
        ? { dark: customColor.moduleColor, light: customColor.bgColor }
        : { dark: activePalette.dark, light: activePalette.light },
      shape,
      caption,
      ...(logo ? { logo: { src: logo, size: logoSize, padding: Math.round(logoSize * 0.125) } } : {}),
    }).catch(() => {
      /* canvas render errors are non-fatal for preview */
    });
  }, [payload, shape, palette, customColor, logo, logoSize, caption]);

  async function testScan() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return setVerify({ ok: false, for: payload });
      const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const { default: jsQR } = await import("jsqr");
      const found = jsQR(new Uint8ClampedArray(image.data), image.width, image.height);
      setVerify({
        ok: !!found && found.data === payload.trim(),
        for: `${payload}|${shape}|${palette}|${customColor?.moduleColor ?? ""}|${logo ?? ""}|${caption ?? ""}`,
      });
    } catch {
      setVerify({ ok: false, for: payload });
    }
  }

  const currentStamp = `${payload}|${shape}|${palette}|${customColor?.moduleColor ?? ""}|${logo ?? ""}|${caption ?? ""}`;
  const verdict = verify && verify.for === currentStamp ? verify : null;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* 240px keeps the empty state compact and the mobile sticky panel
          within the viewport; a real QR gets the full 320px on desktop. */}
      <div className={`flex h-[240px] w-full max-w-[320px] items-center justify-center rounded-lg border border-border bg-white p-4 ${payload.trim() ? "md:h-[320px]" : ""}`}>
        {payload.trim() ? (
          <canvas ref={canvasRef} className="h-full w-full object-contain" />
        ) : (
          <div className="flex flex-col items-center gap-3 text-center">
            <QrCode className="h-10 w-10 text-border" strokeWidth={1.5} aria-hidden />
            {/* The preview card is always white, so use a color that reads on
                white in both themes. */}
            <p className="text-sm text-neutral-600">{messages.previewEmpty}</p>
          </div>
        )}
      </div>

      {payload.trim() && (
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={testScan}
            className="min-h-11 rounded-md border border-input bg-background px-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground md:min-h-9"
          >
            {messages.scanVerifyLabel}
          </button>
          {verdict && (
            <p
              role="status"
              className={
                "text-xs font-medium " +
                (verdict.ok ? "text-green-700 dark:text-green-400" : "text-amber-700 dark:text-amber-400")
              }
            >
              {verdict.ok ? messages.scanVerifyOk : messages.scanVerifyFail}
            </p>
          )}
        </div>
      )}

      {showPayload && payload.trim() && (
        <div className="w-full rounded-md bg-muted/40 p-2">
          <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
            {messages.formScansTo}
          </div>
          <p className="break-all text-xs text-foreground/85">{payload}</p>
        </div>
      )}
    </div>
  );
}
