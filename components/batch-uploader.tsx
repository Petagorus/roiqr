"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { QR_TYPE_OPTIONS } from "@/lib/constants";
import { encodePayload } from "@/lib/qr-encode";
import { parseSpreadsheet, parseSpreadsheetText, type ParsedSpreadsheet } from "@/lib/batch-parse";
import { generateBatchPayload, type ClientQrOptions } from "@/lib/qr-client";
import { DEFAULT_PRESET, resolveSize } from "@/lib/qr-size";
import { COLOR_PALETTES, type ModuleShape } from "@/lib/qr-render";
import type { QrTemplate } from "@/lib/qr-templates";
import { combineColumns, type CombinedColumn } from "@/lib/qr-combine";
import {
  applyJsonTemplate,
  extractTemplateKeys,
  isValidJson,
  minifyJson,
} from "@/lib/json-payload";
import { findDuplicateRows } from "@/lib/duplicates";
import { createStickerPdf } from "@/lib/sticker-pdf";
import { loadStyle, saveStyle } from "@/lib/style-memory";
import { createZipBlob, dataUrlToBytes, safeFilename } from "@/lib/zip";
import { Download, FileText, Loader2, ShieldCheck, Trash2, Upload } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import { useToast } from "@/components/ui/toast-provider";
import { SizeSelector } from "@/components/size-selector";
import { StyleSelector } from "@/components/style-selector";
import { QrPreview } from "@/components/qr-preview";

export function BatchUploader() {
  const { messages, typeLabels } = useI18n();
  const { addToast } = useToast();
  const notifyError = (description: string) => addToast({ description, variant: "destructive" });
  const [file, setFile] = React.useState<File | null>(null);
  const [parsed, setParsed] = React.useState<ParsedSpreadsheet | null>(null);
  const [type, setType] = React.useState("url");
  const [columns, setColumns] = React.useState<string[]>([]);
  const [sizePreset, setSizePreset] = React.useState(DEFAULT_PRESET);
  const [sizeCustom, setSizeCustom] = React.useState("");
  const [shape, setShape] = React.useState<ModuleShape>("square");
  const [palette, setPalette] = React.useState(COLOR_PALETTES[0]?.name ?? "Charcoal");
  const [customColor, setCustomColor] = React.useState<{ moduleColor: string; bgColor: string } | null>(null);
  const [filenameColumn, setFilenameColumn] = React.useState<string>("");
  const [jsonTemplate, setJsonTemplate] = React.useState<string>("");
  const [ppTargetCol, setPpTargetCol] = React.useState("");
  const [ppAmountCol, setPpAmountCol] = React.useState("");
  const [pasted, setPasted] = React.useState("");
  const [logo, setLogo] = React.useState<string | null>(null);
  const [logoSize, setLogoSize] = React.useState(64);
  const [caption, setCaption] = React.useState("");
  const [queueAhead, setQueueAhead] = React.useState<number | null>(null);
  const [pdfBusy, setPdfBusy] = React.useState(false);

  // Restore the style saved by the single-QR form (they share one memory).
  // Storage is read after mount so SSR markup stays stable; the state sync
  // inside is that intentional hydration restore.
  /* eslint-disable react-hooks/set-state-in-effect */
  React.useEffect(() => {
    const saved = loadStyle();
    if (saved.shape) setShape(saved.shape as ModuleShape);
    if (saved.palette) setPalette(saved.palette);
    if (saved.customColor !== undefined) setCustomColor(saved.customColor ?? null);
    if (saved.logo) setLogo(saved.logo);
    if (saved.logoSize) setLogoSize(saved.logoSize);
    if (typeof saved.caption === "string") setCaption(saved.caption);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  React.useEffect(() => {
    saveStyle({ shape, palette, customColor, logo, logoSize, caption });
  }, [shape, palette, customColor, logo, logoSize, caption]);
  const [results, setResults] = React.useState<
    { dataUrl: string; payload: string; filename: string }[]
  >([]);
  const [errors, setErrors] = React.useState<{ index: number; error: string }[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [dragActive, setDragActive] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const ticketRef = React.useRef<string | null>(null);

  // If the user leaves mid-generation, hand the queue slot back so others
  // don't wait on a dead ticket.
  React.useEffect(() => {
    const onPageHide = () => {
      const ticket = ticketRef.current;
      if (!ticket) return;
      void fetch("/api/batch/queue", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "release", ticket }),
        keepalive: true,
      }).catch(() => {});
    };
    window.addEventListener("pagehide", onPageHide);
    return () => window.removeEventListener("pagehide", onPageHide);
  }, []);

  async function handleFile(selected: File | null) {
    if (!selected) return;
    setFile(selected);
    setResults([]);
    setErrors([]);
    try {
      const data = await parseSpreadsheet(selected);
      setParsed(data);
      if (data.headers.length > 0) {
        setColumns([data.headers[0] ?? ""]);
      }
    } catch (err) {
      notifyError(err instanceof Error ? err.message : messages.errorParseFile);
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    handleFile(e.target.files?.[0] ?? null);
  }

  async function usePasted() {
    const text = pasted.trim();
    if (!text) return;
    setResults([]);
    setErrors([]);
    try {
      const data = await parseSpreadsheetText(text, "pasted-data.csv");
      setParsed(data);
      setColumns(data.headers.length > 0 ? [data.headers[0] ?? ""] : []);
    } catch (err) {
      notifyError(err instanceof Error ? err.message : messages.errorParseFile);
    }
  }

  function clearFile() {
    setFile(null);
    setParsed(null);
    setResults([]);
    setErrors([]);
    setColumns([]);
    if (inputRef.current) inputRef.current.value = "";
  }

  function toggleColumn(column: string, checked: boolean) {
    setColumns((prev) =>
      checked ? [...prev, column] : prev.filter((c) => c !== column),
    );
  }

  function toggleAll(selected: boolean) {
    if (selected) {
      setColumns([...parsed?.headers ?? []]);
    } else {
      setColumns([]);
    }
  }

  function applyTemplate(t: QrTemplate) {
    setShape(t.shape);
    setPalette(t.palette);
    setCustomColor(null);
  }

  function columnTypes(): CombinedColumn[] {
    return columns.map((column) => ({ column, type: type }));
  }

  // In JSON mode the template drives the payload — columns are referenced by
  // name inside {braces} instead of being checkbox-selected.
  function payloadForRow(row: Record<string, string | number | null>): string {
    if (type === "promptpay" && ppTargetCol) {
      try {
        return encodePayload("promptpay", {
          promptpayTarget: row[ppTargetCol],
          promptpayAmount: ppAmountCol && ppAmountCol !== "(none)" ? row[ppAmountCol] : null,
        });
      } catch {
        // Invalid target/amount: surface as a per-row error downstream
        // (an empty payload is reported by generateBatchPayload).
        return "";
      }
    }
    if (type === "json" && jsonTemplate.trim()) {
      return applyJsonTemplate(jsonTemplate, row);
    }
    return combineColumns(row, columnTypes());
  }

  const jsonMode = type === "json" && jsonTemplate.trim() !== "";
  const promptpayMode = type === "promptpay" && ppTargetCol !== "";
  const unknownTemplateColumns =
    parsed && jsonTemplate.trim()
      ? extractTemplateKeys(jsonTemplate).filter(
          (k) => !parsed.headers.some((h) => h.toLowerCase() === k.toLowerCase()),
        )
      : [];

  // Live preview payload: the first row with content under the current
  // payload strategy (selected columns or the JSON template). Renders
  // instantly as soon as inputs change, before the user clicks Generate.
  const previewPayload = React.useMemo(() => {
    if (!parsed) return "";
    if (promptpayMode) {
      const row = parsed.rows.find((r) => String(r[ppTargetCol] ?? "").trim() !== "");
      return row ? payloadForRow(row) : "";
    }
    if (jsonMode) {
      const row = parsed.rows.find((r) => Object.values(r).some((v) => String(v ?? "").trim() !== ""));
      return row ? payloadForRow(row) : "";
    }
    if (columns.length === 0) return "";
    const row = parsed.rows.find((r) =>
      columns.some((c) => String(r[c] ?? "").trim() !== ""),
    );
    return row ? combineColumns(row, columnTypes()) : "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsed, columns, type, jsonTemplate]);

  // Warn before generating when two rows will produce the same QR code.
  const duplicateGroups = React.useMemo(() => {
    if (!parsed) return [];
    if (promptpayMode) {
      return findDuplicateRows(
        parsed.rows
          .filter((row) => String(row[ppTargetCol] ?? "").trim() !== "")
          .map((row) => payloadForRow(row))
          .filter((v) => v.trim() !== ""),
      );
    }
    if (jsonMode) {
      if (!jsonTemplate.trim()) return [];
      return findDuplicateRows(
        parsed.rows.map((row) => payloadForRow(row)).filter((v) => v.trim() !== ""),
      );
    }
    if (columns.length === 0) return [];
    const values = parsed.rows
      .filter((row) => columns.some((c) => String(row[c] ?? "").trim() !== ""))
      .map((row) => combineColumns(row, columnTypes()));
    return findDuplicateRows(values);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsed, columns, type, jsonTemplate]);

  async function onGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!parsed || (promptpayMode ? !ppTargetCol : columns.length === 0)) return;

    setLoading(true);
    let ticket: string | null = null;
    let heartbeat: ReturnType<typeof setInterval> | null = null;
    try {
      // Check in with the server's batch queue (max concurrent batches).
      // If the endpoint is unreachable we fail open and generate anyway.
      try {
        const res = await fetch("/api/batch/queue", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ action: "acquire" }),
        });
        const data = await res.json();
        ticket = data.ticket ?? null;
        ticketRef.current = ticket;
        setQueueAhead(data.active ? 0 : data.position ?? 0);
      } catch {
        ticket = null;
      }

      // Wait for our turn while keeping the lease alive through polling.
      const deadline = Date.now() + 30_000; // fail open if the queue stalls
      while (ticket) {
        const status = await fetch(`/api/batch/queue?ticket=${ticket}`)
          .then((r) => r.json())
          .catch(() => null);
        if (!status) break; // endpoint gone — proceed
        setQueueAhead(status.active ? 0 : status.position ?? 0);
        if (status.active) break;
        if (Date.now() > deadline) break;
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      // While generating, keep the server convinced we are alive so a slow
      // batch never loses its slot — and a crashed tab does.
      heartbeat = ticket
        ? setInterval(() => {
            void fetch("/api/batch/queue", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ action: "heartbeat", ticket }),
              keepalive: true,
            }).catch(() => {});
          }, 3_000)
        : null;

      const rows = parsed.rows
        .map((row, index) => ({ index, row }))
        .filter((r) => {
          // JSON mode: any row with content participates; the template
          // decides what is extracted. Column mode: any selected column
          // with a non-empty value includes the row.
          if (promptpayMode) {
            return String(r.row[ppTargetCol] ?? "").trim() !== "";
          }
          if (jsonMode) {
            return Object.values(r.row).some((v) => String(v ?? "").trim() !== "");
          }
          return columns.some((c) => String(r.row[c] ?? "").trim() !== "");
        })
        .map((r) => {
          const payload = payloadForRow(r.row);
          return { index: r.index, payload, row: r.row };
        });

      const width = resolveSize(sizePreset, sizeCustom);
      const options: ClientQrOptions = {
        width,
        margin: 2,
        shape,
        palette,
        customColor,
        logo,
        logoSize,
        caption,
      };

      // JSON mode: rows that do not assemble into valid JSON are reported
      // and skipped instead of producing unscannable codes. An empty payload
      // makes generateBatchPayload throw per-row, so reuse that channel and
      // swap the message afterwards for clarity.
      const payloads = rows.map((r) => {
        if (!jsonMode) return r.payload;
        const text = r.payload.trim();
        return text && isValidJson(text) ? minifyJson(text) : "";
      });
      const { results: qrResults, errors: qrErrors } = await generateBatchPayload(
        payloads,
        options,
      );
      const finalErrors = jsonMode
        ? qrErrors.map((e) => ({
            ...e,
            error: e.error === "Empty payload." ? "Invalid JSON payload" : e.error,
          }))
        : qrErrors;

      // Name each file from the filename column's value. Errored payloads are
      // excluded first so names stay aligned with the successful results.
      const errorPositions = new Set(qrErrors.map((e) => e.index));
      let nameCounter = 0;
      const named = rows
        .filter((_, i) => !errorPositions.has(i))
        .map((r) => {
          nameCounter += 1;
          const fallback = `${filenameColumn || "qr"}-${nameCounter}`;
          const value = filenameColumn ? String(r.row[filenameColumn] ?? "") : "";
          return safeFilename(value, fallback);
        });

      setResults(
        qrResults.map((r, j) => ({
          dataUrl: r.dataUrl,
          payload: r.payload,
          filename: named[j] ?? `qr-${j + 1}`,
        })),
      );
      setErrors(finalErrors);
    } finally {
      setQueueAhead(null);
      ticketRef.current = null;
      if (heartbeat) clearInterval(heartbeat);
      if (ticket) {
        // Release the slot; keepalive lets it survive page navigation.
        void fetch("/api/batch/queue", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ action: "release", ticket }),
          keepalive: true,
        }).catch(() => {});
      }
      setLoading(false);
    }
  }

  function downloadAll() {
    if (results.length === 0) return;

    // Build a unique .png name per file from the filename column's value.
    const used = new Set<string>();
    const names = results.map((qr, i) => {
      const fallback = `${filenameColumn || "qr"}-${i + 1}`;
      const base = qr.filename || fallback;
      let candidate = `${base}.png`;
      let n = 2;
      while (used.has(candidate)) {
        candidate = `${base}-${n}.png`;
        n += 1;
      }
      used.add(candidate);
      return candidate;
    });

    if (results.length === 1) {
      triggerDownload(results[0]!.dataUrl, names[0]!);
      return;
    }

    // Browsers block multiple automatic downloads, so bundle every QR into a
    // single ZIP — one click, every file, no permission prompt needed.
    const zip = createZipBlob(
      results.map((qr, i) => ({
        name: names[i]!,
        data: dataUrlToBytes(qr.dataUrl),
      })),
    );
    const url = URL.createObjectURL(zip);
    triggerDownload(url, `${filenameColumn || "qr"}-qr-codes.zip`);
    URL.revokeObjectURL(url);
  }

  function triggerDownload(href: string, filename: string) {
    const link = document.createElement("a");
    link.href = href;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function downloadPdf() {
    if (results.length === 0 || pdfBusy) return;
    setPdfBusy(true);
    try {
      const blob = await createStickerPdf(
        results.map((qr, i) => ({
          dataUrl: qr.dataUrl,
          label: qr.filename || `#${i + 1}`,
        })),
      );
      const url = URL.createObjectURL(blob);
      triggerDownload(url, `${filenameColumn || "qr"}-stickers-a4.pdf`);
      URL.revokeObjectURL(url);
    } catch {
      notifyError(messages.errorPdf);
    } finally {
      setPdfBusy(false);
    }
  }

  return (
    <form onSubmit={onGenerate} className="grid items-start gap-6 md:grid-cols-2">
      {/* Left: upload + controls */}
      <div className="space-y-4">
      {/* Dropzone */}
      <div>
        <Label>{messages.batchStep1}</Label>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onMouseEnter={() => setDragActive(true)}
          onMouseLeave={() => setDragActive(false)}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            handleFile(e.dataTransfer.files?.[0] ?? null);
          }}
          className={
            "mt-2 flex h-40 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors " +
            (dragActive ? "border-primary bg-accent/40" : "border-border hover:border-primary/50")
          }
        >
          <Upload className="h-7 w-7 text-muted-foreground" />
          <p className="text-center text-sm text-muted-foreground">
            {messages.batchDrop}
            <br />
            <span className="font-medium text-foreground">{messages.batchDropTypes}</span>
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={onInputChange}
            className="hidden"
          />
        </button>
        <p className="mt-2 flex items-start gap-2 text-[13px] text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
          {messages.privacyNote}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {messages.batchTemplateLabel}{" "}
          <a
            href="/templates/roiqr-template.xlsx"
            download
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            {messages.batchTemplateExcel}
          </a>{" "}
          ·{" "}
          <a
            href="/templates/roiqr-template.csv"
            download
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            {messages.batchTemplateCsv}
          </a>
        </p>
      </div>

      {/* Paste straight from Excel/Sheets — no file round-trip needed */}
      <div>
        <Label htmlFor="batch-paste">{messages.batchPasteLabel}</Label>
        <Textarea
          id="batch-paste"
          rows={3}
          value={pasted}
          placeholder={messages.batchPastePlaceholder}
          onChange={(e) => setPasted(e.target.value)}
          className="mt-2 font-mono text-xs"
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">{messages.batchPasteHint}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!pasted.trim()}
            onClick={usePasted}
            className="shrink-0"
          >
            {messages.batchPasteUse}
          </Button>
        </div>
      </div>

      {parsed && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm"
        >
          <span className="text-muted-foreground">
            <span className="font-medium text-foreground">{parsed.filename}</span> ·{" "}
            {parsed.rows.length === 1
              ? messages.batchRowsOne
              : messages.batchRowsMany.replace("{count}", String(parsed.rows.length))}{" "}
            · {parsed.sheet}
          </span>
          <Button type="button" variant="ghost" size="sm" onClick={clearFile}>
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            {messages.batchRemove}
          </Button>
        </motion.div>
      )}

      {/* Column + type selection (PromptPay picks its columns below instead) */}
      {parsed && parsed.headers.length > 0 && type !== "promptpay" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid gap-4 sm:grid-cols-2"
        >
          <div className="space-y-2">
            <Label>
              {messages.batchColumnLabel}
              {parsed.headers.length > 1 && (
                <button
                  type="button"
                  onClick={() => toggleAll(true)}
                  className="ml-2 text-xs text-primary hover:underline"
                >
                  {messages.multiColumnSelectAll}
                </button>
              )}
            </Label>
            <div className="flex flex-col gap-1 rounded-md border p-2">
              {parsed.headers.map((h) => {
                const checked = columns.includes(h);
                return (
                  <label
                    key={h}
                    className="flex items-center gap-2 rounded px-1 py-0.5 text-sm hover:bg-muted/50"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => toggleColumn(h, e.target.checked)}
                      className="h-4 w-4 rounded border-input"
                    />
                    {h}
                  </label>
                );
              })}
            </div>
            {columns.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {columns.length === 1
                  ? messages.batchColumnsSelectedOne
                  : messages.batchColumnsSelectedMany.replace("{count}", String(columns.length))}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="batch-type">{messages.batchTypeLabel}</Label>
            <Select
              value={type}
              onValueChange={(v) => {
                setType(v);
                if (v === "promptpay" && !ppTargetCol && parsed) {
                  setPpTargetCol(parsed.headers[0] ?? "");
                }
              }}
            >
              <SelectTrigger id="batch-type">
                <SelectValue placeholder={messages.batchTypePlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {QR_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {typeLabels[opt.value] ?? opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>
      )}

      {/* JSON template builder — replaces column checkboxes when active */}
      {parsed && type === "json" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-lg border bg-muted/30 p-4"
        >
          <Label htmlFor="json-template">{messages.batchJsonTemplateLabel}</Label>
          <Textarea
            id="json-template"
            rows={3}
            value={jsonTemplate}
            placeholder={messages.batchJsonTemplatePlaceholder}
            onChange={(e) => setJsonTemplate(e.target.value)}
            className="mt-3 font-mono text-xs"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            {messages.batchJsonTemplateHint}
          </p>
          {parsed.headers.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {parsed.headers.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setJsonTemplate((t) => `${t}{${h}}`)}
                  title={messages.batchJsonTemplateLabel}
                  className="rounded border border-input px-1.5 py-0.5 font-mono text-xs text-foreground transition-colors hover:border-primary/50"
                >
                  {h}
                </button>
              ))}
            </div>
          )}
          {unknownTemplateColumns.length > 0 && (
            <p role="alert" className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-400">
              {messages.batchJsonUnknownColumn.replace(
                "{columns}",
                unknownTemplateColumns.join(", "),
              )}
            </p>
          )}
        </motion.div>
      )}

      {/* PromptPay columns — the payload needs a target plus an optional
          amount, so instead of the checkbox flow the user maps two columns. */}
      {parsed && type === "promptpay" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-lg border bg-muted/30 p-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pp-target">{messages.batchPpTargetLabel}</Label>
              <Select value={ppTargetCol} onValueChange={setPpTargetCol}>
                <SelectTrigger id="pp-target">
                  <SelectValue placeholder={messages.batchColumnLabel} />
                </SelectTrigger>
                <SelectContent>
                  {parsed.headers.map((h) => (
                    <SelectItem key={h} value={h}>
                      {h}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pp-amount">{messages.batchPpAmountLabel}</Label>
              <Select value={ppAmountCol} onValueChange={setPpAmountCol}>
                <SelectTrigger id="pp-amount">
                  <SelectValue placeholder={messages.batchFilenamePlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {parsed.headers.map((h) => (
                    <SelectItem key={h} value={h}>
                      {h}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {messages.formPpTargetPlaceholder}
          </p>
        </motion.div>
      )}

      {/* Filename selection — separate from QR content columns */}
      {parsed && parsed.headers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-lg border bg-muted/30 p-4"
        >
          <Label htmlFor="filename-col">{messages.batchFilenameLabel}</Label>
          <Select value={filenameColumn} onValueChange={setFilenameColumn}>
            <SelectTrigger id="filename-col">
              <SelectValue placeholder={messages.batchFilenamePlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {parsed.headers.map((h) => (
                <SelectItem key={h} value={h}>
                  {h}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="mt-1 text-xs text-muted-foreground">
            {messages.batchFilenameHint}
          </p>
          <p className="text-xs text-muted-foreground/60">
            {messages.batchFilenameNote}
          </p>
        </motion.div>
      )}

      {/* Duplicate warning — before any generation happens */}
      {duplicateGroups.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          role="alert"
          className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400"
        >
          {messages.batchDuplicateWarning
            .replace("{n}", String(duplicateGroups.length))
            .replace(
              "{rows}",
              duplicateGroups
                .slice(0, 5)
                .map((g) => g.rows.join("+"))
                .join(", "),
            )
            .slice(0, 220)}
        </motion.div>
      )}

      {/* Caption under each QR code */}
      {parsed && parsed.headers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-lg border bg-muted/30 p-4"
        >
          <Label htmlFor="batch-caption">{messages.styleCaptionLabel}</Label>
          <Input
            id="batch-caption"
            value={caption}
            maxLength={40}
            placeholder={messages.styleCaptionPlaceholder}
            onChange={(e) => setCaption(e.target.value)}
            className="mt-3"
          />
          <p className="mt-2 text-xs text-muted-foreground">{messages.styleCaptionHint}</p>
        </motion.div>
      )}

      {/* Style selection */}
      {parsed && parsed.headers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-lg border bg-muted/30 p-4"
        >
          <StyleSelector
            shape={shape}
            onShapeChange={setShape}
            palette={palette}
            onPaletteChange={setPalette}
            customColor={customColor}
            onCustomColorChange={setCustomColor}
            logo={logo}
            onLogoChange={setLogo}
            logoSize={logoSize}
            onLogoSizeChange={setLogoSize}
            onSelectTemplate={applyTemplate}
          />
        </motion.div>
      )}

      {/* Size selection */}
      {parsed && parsed.headers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-3"
        >
          <SizeSelector
            preset={sizePreset}
            onPresetChange={setSizePreset}
            custom={sizeCustom}
            onCustomChange={setSizeCustom}
          />
        </motion.div>
      )}

      </div>

      {/* Right: sticky live preview + generate. The wrapper stretches to the
          full row height so the sticky inner column stops at the row's bottom
          instead of sliding over the results section below. */}
      <div className="self-stretch">
        <div className="flex flex-col gap-4 md:sticky md:top-24">
          <p className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {messages.previewLabel}
          </p>
        <QrPreview
          payload={previewPayload}
          shape={shape}
          palette={palette}
          customColor={customColor}
          logo={logo}
          logoSize={logoSize}
          caption={caption}
          showPayload
        />
        {queueAhead !== null && queueAhead > 0 && (
          <p
            role="status"
            className="rounded-md bg-amber-500/15 px-3 py-2 text-center text-sm font-medium text-amber-700 dark:text-amber-400"
          >
            {messages.batchQueueAhead.replace("{n}", String(queueAhead))}
          </p>
        )}
        <Button
          type="submit"
          disabled={
            !parsed ||
            loading ||
            (type === "promptpay"
              ? !ppTargetCol
              : jsonMode
                ? !jsonTemplate.trim()
                : columns.length === 0)
          }
          size="lg"
          className="disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {messages.formGenerating}
            </>
          ) : (
            messages.batchGenerate
          )}
        </Button>
        </div>
      </div>

      {/* Results — full width on desktop */}
      {results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 md:col-span-2"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm text-muted-foreground">
                {results.length === 1
                  ? messages.batchGeneratedOne
                  : messages.batchGeneratedMany.replace("{count}", String(results.length))}
                {errors.length > 0 && (
                  <span className="text-destructive">
                    {" "}
                    ·{" "}
                    {errors.length === 1
                      ? messages.batchSkippedOne
                      : messages.batchSkippedMany.replace("{count}", String(errors.length))}
                  </span>
                )}
              </p>
              {results.length > 1 && (
                <p className="text-xs text-muted-foreground/80">{messages.batchZipHint}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {results.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={downloadPdf}
                  disabled={pdfBusy}
                >
                  {pdfBusy ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="mr-1.5 h-4 w-4" />
                  )}
                  {messages.batchPdfButton}
                </Button>
              )}
              <Button type="button" variant="outline" size="sm" onClick={downloadAll}>
                <Download className="mr-1.5 h-4 w-4" />
                {messages.batchDownloadAll}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {results.map((qr, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.01 }}
                className="group relative flex flex-col items-center gap-2 rounded-lg border bg-card p-3"
              >
                <img
                  src={qr.dataUrl}
                  alt={`QR code ${index + 1}`}
                  className="h-24 w-24 rounded bg-white p-1"
                />
                <span className="text-xs font-medium text-foreground">#{index + 1}</span>
                <span
                  className="line-clamp-2 max-w-full break-all text-center text-xs text-muted-foreground"
                  title={qr.payload}
                >
                  {qr.payload}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    triggerDownload(qr.dataUrl, `${qr.filename || `qr-${index + 1}`}.png`)
                  }
                  aria-label={`${messages.batchCardDownload} #${index + 1}`}
                  className="inline-flex items-center gap-1 rounded-md border border-input px-2 py-1 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                >
                  <Download className="h-3 w-3" />
                  {messages.batchCardDownloadShort}
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </form>
  );
}
