"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Check, ChevronDown, Copy } from "lucide-react";

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
import { HexInput } from "@/components/hex-input";
import { QR_TYPE_OPTIONS } from "@/lib/constants";
import { encodePayload, type QrInput } from "@/lib/qr-encode";
import { generateQrClient } from "@/lib/qr-client";
import { DEFAULT_PRESET, resolveSize } from "@/lib/qr-size";
import { COLOR_PALETTES, type ModuleShape } from "@/lib/qr-render";
import type { QrTemplate } from "@/lib/qr-templates";
import { renderQrSvg } from "@/lib/qr-svg";
import { suggestQrFilename } from "@/lib/qr-filename";
import {
  jsonByteLength,
  jsonObjectKeyCount,
  minifyJson,
  JSON_MAX_BYTES,
  JSON_WARN_BYTES,
} from "@/lib/json-payload";
import { clearStyle, loadStyle, saveStyle } from "@/lib/style-memory";
import { useI18n, type Messages } from "@/lib/i18n-context";
import { useToast } from "@/components/ui/toast-provider";
import { SizeSelector } from "@/components/size-selector";
import { TemplatePicker } from "@/components/template-picker";
import { QrPreview } from "@/components/qr-preview";

interface FormState {
  type: string;
  url: string;
  text: string;
  json: string;
  promptpayTarget: string;
  promptpayAmount: string;
  email: string;
  subject: string;
  body: string;
  phone: string;
  smsBody: string;
  wifiSsid: string;
  wifiPassword: string;
  wifiEncryption: string;
  wifiHidden: boolean;
  vcardName: string;
  vcardPhone: string;
  vcardEmail: string;
  vcardOrg: string;
  geoLat: string;
  geoLon: string;
  eventStart: string;
  eventEnd: string;
  eventTitle: string;
  eventLocation: string;
  eventDescription: string;
}

const EMPTY_FORM: FormState = {
  type: "url",
  url: "",
  text: "",
  json: "",
  promptpayTarget: "",
  promptpayAmount: "",
  email: "",
  subject: "",
  body: "",
  phone: "",
  smsBody: "",
  wifiSsid: "",
  wifiPassword: "",
  wifiEncryption: "WPA",
  wifiHidden: false,
  vcardName: "",
  vcardPhone: "",
  vcardEmail: "",
  vcardOrg: "",
  geoLat: "",
  geoLon: "",
  eventStart: "",
  eventEnd: "",
  eventTitle: "",
  eventLocation: "",
  eventDescription: "",
};

const fieldKeys = Object.keys(EMPTY_FORM).filter(
  (k) => k !== "type",
) as (keyof FormState)[];

/** One saved entry in the local "Recent codes" list. */
type HistoryEntry = { form: FormState; style: StyleSnapshot; ts: number };

interface StyleSnapshot {
  shape: ModuleShape;
  palette: string;
  customColor: { moduleColor: string; bgColor: string } | null;
  logo: string | null;
  caption: string;
}

const HISTORY_KEY = "qr-gen-history";
const HISTORY_MAX = 20;

interface FieldDef {
  label: string;
  placeholder: string;
  type: "text" | "email" | "tel" | "datetime-local";
}

function buildFieldDefs(m: Messages) {
  return {
    url: { label: m.formUrlLabel, placeholder: m.formUrlPlaceholder, type: "text" as const },
    text: { label: m.formTextLabel, placeholder: m.formTextPlaceholder, type: "text" as const },
    promptpayTarget: { label: m.formPpTargetLabel, placeholder: m.formPpTargetPlaceholder, type: "tel" as const },
    promptpayAmount: { label: m.formPpAmountLabel, placeholder: m.formPpAmountPlaceholder, type: "text" as const },
    email: { label: m.formEmailLabel, placeholder: m.formEmailPlaceholder, type: "email" as const },
    subject: { label: m.formSubjectLabel, placeholder: m.formSubjectPlaceholder, type: "text" as const },
    body: { label: m.formBodyLabel, placeholder: m.formBodyPlaceholder, type: "text" as const },
    phone: { label: m.formPhoneLabel, placeholder: m.formPhonePlaceholder, type: "tel" as const },
    smsBody: { label: m.formSmsLabel, placeholder: m.formSmsPlaceholder, type: "text" as const },
    wifiSsid: { label: m.formWifiSsidLabel, placeholder: m.formWifiSsidPlaceholder, type: "text" as const },
    wifiPassword: { label: m.formWifiPasswordLabel, placeholder: m.formWifiPasswordPlaceholder, type: "text" as const },
    vcardName: { label: m.formVcardNameLabel, placeholder: m.formVcardNamePlaceholder, type: "text" as const },
    vcardPhone: { label: m.formVcardPhoneLabel, placeholder: m.formVcardPhonePlaceholder, type: "tel" as const },
    vcardEmail: { label: m.formVcardEmailLabel, placeholder: m.formVcardEmailPlaceholder, type: "email" as const },
    vcardOrg: { label: m.formVcardOrgLabel, placeholder: m.formVcardOrgPlaceholder, type: "text" as const },
    geoLat: { label: m.formGeoLatLabel, placeholder: m.formGeoLatPlaceholder, type: "text" as const },
    geoLon: { label: m.formGeoLonLabel, placeholder: m.formGeoLonPlaceholder, type: "text" as const },
    eventStart: { label: m.formEventStartLabel, placeholder: "", type: "datetime-local" as const },
    eventEnd: { label: m.formEventEndLabel, placeholder: "", type: "datetime-local" as const },
    eventTitle: { label: m.formEventTitleLabel, placeholder: m.formEventTitlePlaceholder, type: "text" as const },
    eventLocation: { label: m.formEventLocationLabel, placeholder: m.formEventLocationPlaceholder, type: "text" as const },
    eventDescription: { label: m.formEventDescLabel, placeholder: m.formEventDescPlaceholder, type: "text" as const },
  } satisfies Partial<Record<keyof FormState, FieldDef>>;
}

/** Build the scannable payload string from the current form state. */
function buildPayload(type: string, form: FormState): string {
  const data: QrInput = { type: form.type };
  for (const key of fieldKeys) {
    const value = form[key];
    if (value === null || value === undefined || value === "") continue;
    (data as Record<string, unknown>)[key] = value;
  }
  try {
    return encodePayload(type, data);
  } catch {
    return "";
  }
}

export function SingleQrForm() {
  const { messages, typeLabels } = useI18n();
  const { addToast } = useToast();
  const notifyError = (description: string) => addToast({ description, variant: "destructive" });
  const [form, setForm] = React.useState<FormState>(EMPTY_FORM);
  // T1(b): no generate step — downloads render on demand from the live payload.
  const [busy, setBusy] = React.useState<"png" | "svg" | "copy" | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [styleOpen, setStyleOpen] = React.useState(false);
  const [history, setHistory] = React.useState<HistoryEntry[]>([]);
  const [sizePreset, setSizePreset] = React.useState(DEFAULT_PRESET);
  const [sizeCustom, setSizeCustom] = React.useState("");
  const [shape, setShape] = React.useState<ModuleShape>("square");
  const [palette, setPalette] = React.useState(COLOR_PALETTES[0]?.name ?? "Charcoal");
  const [customColor, setCustomColor] = React.useState<{ moduleColor: string; bgColor: string } | null>(null);
  const [logo, setLogo] = React.useState<string | null>(null);
  const [logoSize, setLogoSize] = React.useState(64);
  const [caption, setCaption] = React.useState("");

  // Restore the style the user picked last time (after hydration so the
  // server-rendered markup stays stable). The style disclosure opens by
  // default for returning users with a non-default style; otherwise it
  // follows the stored open/closed preference.
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

    let pref: string | null = null;
    try {
      pref = window.localStorage.getItem("qr-gen-style-open");
    } catch {
      /* ignore storage errors */
    }
    const hasCustomStyle =
      (Boolean(saved.shape) && saved.shape !== "square") ||
      (Boolean(saved.palette) && saved.palette !== (COLOR_PALETTES[0]?.name ?? "Charcoal")) ||
      saved.customColor != null ||
      Boolean(saved.logo) ||
      (typeof saved.caption === "string" && saved.caption !== "");
    setStyleOpen(pref ? pref === "1" : hasCustomStyle);

    try {
      const raw = window.localStorage.getItem(HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw) as HistoryEntry[]);
    } catch {
      /* ignore storage errors */
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Persist style choices as they change.
  React.useEffect(() => {
    saveStyle({ shape, palette, customColor, logo, logoSize, caption });
  }, [shape, palette, customColor, logo, logoSize, caption]);

  function resetForm() {
    setForm(EMPTY_FORM);
    setSizePreset(DEFAULT_PRESET);
    setSizeCustom("");
    setShape("square");
    setPalette(COLOR_PALETTES[0]?.name ?? "Charcoal");
    setCustomColor(null);
    setLogo(null);
    setLogoSize(64);
    setCaption("");
    clearStyle();
    setStyleOpen(false);
    try {
      window.localStorage.setItem("qr-gen-style-open", "0");
    } catch {
      /* ignore storage errors */
    }
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function applyTemplate(t: QrTemplate) {
    setShape(t.shape);
    setPalette(t.palette);
    setCustomColor(null);
  }

  function onTypeChange(value: string) {
    setForm((prev) => ({ ...prev, type: value }));
  }

  function toggleStyleOpen() {
    setStyleOpen((prev) => {
      try {
        window.localStorage.setItem("qr-gen-style-open", prev ? "0" : "1");
      } catch {
        /* ignore storage errors */
      }
      return !prev;
    });
  }

  function currentStyleSnapshot(): StyleSnapshot {
    return { shape, palette, customColor, logo, caption };
  }

  function pushHistory(snapshot: FormState) {
    const style = currentStyleSnapshot();
    setHistory((prev) => {
      const key = (f: FormState) => JSON.stringify(f);
      const next = [
        { form: snapshot, style, ts: Date.now() },
        ...prev.filter((e) => key(e.form) !== key(snapshot)),
      ].slice(0, HISTORY_MAX);
      try {
        window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      } catch {
        /* ignore storage errors */
      }
      return next;
    });
  }

  function clearHistory() {
    setHistory([]);
    try {
      window.localStorage.removeItem(HISTORY_KEY);
    } catch {
      /* ignore storage errors */
    }
  }

  function restoreHistory(entry: HistoryEntry) {
    setForm(entry.form);
    setShape(entry.style.shape);
    setPalette(entry.style.palette);
    setCustomColor(entry.style.customColor);
    setLogo(entry.style.logo);
    setCaption(entry.style.caption);
  }

  /** Human preview for a history row — masks secret-bearing payloads. */
  function historyPreview(entry: HistoryEntry): string {
    const f = entry.form;
    switch (f.type) {
      case "url":
        return f.url;
      case "text":
        return f.text;
      case "json":
        return f.json;
      default:
        // Secret-bearing types (Wi-Fi, vCard, phone…) are masked in the list.
        return "••••••";
    }
  }

  const fieldDefs = buildFieldDefs(messages);

  const visibleFields = fieldKeys.filter((key) => {
    if (key === "url" || key === "text" || key === "json") return form.type === key;
    if (key === "promptpayTarget" || key === "promptpayAmount") return form.type === "promptpay";
    if (key === "email" || key === "subject" || key === "body") return form.type === "email";
    if (key === "phone" || key === "smsBody") return form.type === "phone" || form.type === "sms";
    if (key === "wifiSsid" || key === "wifiPassword" || key === "wifiEncryption" || key === "wifiHidden") return form.type === "wifi";
    if (["vcardName", "vcardPhone", "vcardEmail", "vcardOrg"].includes(key)) return form.type === "vcard";
    if (key === "geoLat" || key === "geoLon") return form.type === "geo";
    if (["eventStart", "eventEnd", "eventTitle", "eventLocation", "eventDescription"].includes(key)) return form.type === "event";
    return false;
  });

  const payload = buildPayload(form.type, form);

  // JSON type: live validation, minified byte size and key count.
  const jsonError = React.useMemo(() => {
    const text = form.json.trim();
    if (!text) return null;
    try {
      JSON.parse(text);
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : "Invalid JSON";
    }
  }, [form.json]);
  const jsonPayload = React.useMemo(() => {
    const text = form.json.trim();
    if (!text || jsonError) return null;
    try {
      return minifyJson(text);
    } catch {
      return null;
    }
  }, [form.json, jsonError]);
  const jsonBytes = jsonPayload ? jsonByteLength(jsonPayload) : 0;
  const jsonKeys = jsonPayload ? jsonObjectKeyCount(jsonPayload) : 0;

  function buildName(): string {
    return suggestQrFilename(form.type, form as never);
  }

  async function generateDataUrl(): Promise<string> {
    const width = resolveSize(sizePreset, sizeCustom);
    const qr = await generateQrClient(form.type, form as never, {
      width,
      margin: 2,
      shape,
      palette,
      customColor,
      logo,
      logoSize,
      caption,
    });
    return qr.dataUrl;
  }

  function triggerPngDownload(dataUrl: string) {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${buildName()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function downloadPng() {
    if (!payload.trim() || busy) return;
    setBusy("png");
    try {
      triggerPngDownload(await generateDataUrl());
      pushHistory(form);
      addToast({ description: messages.downloadDone });
    } catch (err) {
      notifyError(err instanceof Error ? err.message : messages.errorGenerate);
    } finally {
      setBusy(null);
    }
  }

  function downloadSvg() {
    if (!payload.trim() || busy) return;
    try {
      const width = resolveSize(sizePreset, sizeCustom);
      const svg = renderQrSvg(payload, {
        width,
        margin: 2,
        shape,
        color: {
          dark: customColor?.moduleColor ?? COLOR_PALETTES.find((p) => p.name === palette)?.dark ?? "#1f1a17",
          light: customColor?.bgColor ?? COLOR_PALETTES.find((p) => p.name === palette)?.light ?? "#f6f3ee",
        },
        caption,
        ...(logo ? { logo: { src: logo, size: logoSize, padding: Math.round(logoSize * 0.125) } } : {}),
      });
      const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `${buildName()}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      pushHistory(form);
      addToast({ description: messages.downloadDone });
    } catch {
      notifyError(messages.errorGenerate);
    }
  }

  async function copyImage() {
    if (!payload.trim() || busy) return;
    setBusy("copy");
    try {
      const dataUrl = await generateDataUrl();
      const blob = await (await fetch(dataUrl)).blob();
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
      pushHistory(form);
    } catch {
      notifyError(messages.errorCopyImage);
    } finally {
      setBusy(null);
    }
  }

  return (
    // flex-col on mobile so the sticky preview can travel the whole form
    // (a one-column grid row gives the sticky element no travel room);
    // md: switches to the two-column grid pinned below.
    <form className="flex flex-col gap-6 md:grid md:grid-cols-2 md:items-start">
      {/* Content: type + fields. Order-1 so mobile reaches the preview and
          Generate before any style options. */}
      <div className="order-1 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="qr-type">{messages.formTypeLabel}</Label>
          <Select value={form.type} onValueChange={onTypeChange}>
            <SelectTrigger id="qr-type" aria-label={messages.formTypePlaceholder}>
              <SelectValue placeholder={messages.formTypePlaceholder} />
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

        <div className="space-y-4">
          {visibleFields.map((key) => {
            if (key === "wifiEncryption") {
              return (
                <div key={key} className="space-y-2">
                  <Label>{messages.formWifiEncLabel}</Label>
                  <Select
                    value={form.wifiEncryption}
                    onValueChange={(v) => update("wifiEncryption", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WPA">WPA/WPA2</SelectItem>
                      <SelectItem value="WEP">WEP</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              );
            }
            if (key === "wifiHidden") {
              return (
                <label
                  key={key}
                  className="flex items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={form.wifiHidden}
                    onChange={(e) => update("wifiHidden", e.target.checked)}
                    className="h-4 w-4 rounded border-input"
                  />
                  {messages.formWifiHiddenLabel}
                </label>
              );
            }
            if (key === "json") {
              return (
                <div key={key} className="space-y-2">
                  <Label htmlFor="field-json">{messages.formJsonLabel}</Label>
                  <Textarea
                    id="field-json"
                    rows={5}
                    placeholder={messages.formJsonPlaceholder}
                    value={form.json}
                    onChange={(e) => update("json", e.target.value)}
                    className="font-mono text-xs"
                  />
                  {form.json.trim() && jsonError && (
                    <p role="alert" className="text-xs font-medium text-destructive">
                      {messages.formJsonInvalid.replace("{error}", jsonError)}
                    </p>
                  )}
                  {jsonPayload && (
                    <p
                      className={
                        "text-xs font-medium " +
                        (jsonBytes > JSON_MAX_BYTES
                          ? "text-destructive"
                          : jsonBytes > JSON_WARN_BYTES
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-green-600 dark:text-green-500")
                      }
                    >
                      {messages.formJsonSize.replace("{bytes}", String(jsonBytes))} ·{" "}
                      {messages.formJsonKeys.replace("{keys}", String(jsonKeys))}
                      {jsonBytes > JSON_MAX_BYTES && (
                        <span className="block">
                          {messages.formJsonTooLarge.replace("{max}", String(JSON_MAX_BYTES))}
                        </span>
                      )}
                    </p>
                  )}
                </div>
              );
            }
            const def = fieldDefs[key as keyof typeof fieldDefs];
            if (!def) return null;
            return (
              <div key={key} className="space-y-2">
                <Label htmlFor={`field-${key}`}>{def.label}</Label>
                {key === "body" || key === "eventDescription" ? (
                  <Textarea
                    id={`field-${key}`}
                    placeholder={def.placeholder}
                    value={form[key] as string}
                    onChange={(e) => update(key, e.target.value)}
                  />
                ) : (
                  <Input
                    id={`field-${key}`}
                    type={def.type}
                    placeholder={def.placeholder}
                    value={form[key] as string}
                    onChange={(e) => update(key, e.target.value)}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Style groups — order-3 on mobile, after the preview and Generate.
          md:col/row-start pins them under the content column on desktop. */}
      <div className="order-3 space-y-4 md:col-start-1 md:row-start-2">
        <button
          type="button"
          onClick={toggleStyleOpen}
          aria-expanded={styleOpen}
          className="flex min-h-11 w-full items-center justify-between rounded-lg border bg-muted/30 px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/40"
        >
          {messages.styleCustomizeLabel}
          <ChevronDown
            className={"h-4 w-4 transition-transform " + (styleOpen ? "rotate-180" : "")}
          />
        </button>
        {styleOpen && (
          <>
        {/* STYLE TEMPLATES */}
        <div className="rounded-lg border bg-muted/30 p-4">
          <TemplatePicker
            palette={palette}
            shape={shape}
            customColor={customColor}
            onSelect={applyTemplate}
          />
        </div>

        {/* STYLE: palette + module shape */}
        <div className="rounded-lg border bg-muted/30 p-4">
          <Label className="text-sm font-semibold">{messages.styleGroupStyle}</Label>
          <div className="mt-3 space-y-5">
          <div>
          <Label className="text-xs font-medium text-muted-foreground">{messages.stylePaletteLabel}</Label>
          <div className="mt-3 flex flex-wrap gap-3">
            {COLOR_PALETTES.map((p) => {
              const active = palette === p.name;
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => {
                    setPalette(p.name);
                    setCustomColor(null);
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
          </div>

          <div>
          <Label className="text-xs font-medium text-muted-foreground">{messages.styleShapeLabel}</Label>
          <div className="mt-3 flex flex-wrap gap-2">
            {(["square", "rounded", "dots", "diamond"] as ModuleShape[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setShape(s)}
                aria-pressed={shape === s}
                className={
                  "min-h-11 md:min-h-9 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors " +
                  (shape === s
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:border-primary/50")
                }
              >
                {s === "square" ? messages.styleShapeSquare
                  : s === "rounded" ? messages.styleShapeRounded
                  : s === "dots" ? messages.styleShapeDots
                  : messages.styleShapeDiamond}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[13px] text-muted-foreground">{messages.helpShape}</p>
          </div>
          </div>
        </div>

        {/* BRANDING: logo + caption */}
        <div className="rounded-lg border bg-muted/30 p-4">
          <Label className="text-sm font-semibold">{messages.styleGroupBranding}</Label>

          <div>
          <Label className="text-xs font-medium text-muted-foreground">{messages.styleLogoLabel}</Label>
          <div className="mt-3">
            {logo ? (
              <div className="flex items-center gap-3">
                <img
                  src={logo}
                  alt="Logo preview"
                  className="h-10 w-10 rounded border bg-white p-0.5 object-contain"
                />
                <span className="text-sm text-muted-foreground">{messages.styleLogoLoaded}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setLogo(null)}
                  className="text-sm"
                >
                  {messages.styleLogoRemove}
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const input = document.getElementById("logo-input");
                  input?.click();
                }}
              >
                {messages.styleLogoUpload}
              </Button>
            )}
            <input
              id="logo-input"
              type="file"
              accept="image/png,image/jpeg,image/svg+xml"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  const dataUrl = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(String(reader.result));
                    reader.onerror = () => reject(new Error("Could not read file"));
                    reader.readAsDataURL(file);
                  });
                  setLogo(dataUrl);
                } catch {
                  notifyError(messages.errorLoadImage);
                }
                e.target.value = "";
              }}
              className="hidden"
            />
            <p className="mt-2 text-[13px] text-muted-foreground">{messages.styleLogoHint}</p>
            {logo && (
              <div className="mt-2 flex items-center gap-3">
                <Label className="text-xs text-muted-foreground">
                  {messages.styleLogoSizeLabel}
                </Label>
                <input
                  type="range"
                  min={32}
                  max={128}
                  step={8}
                  value={logoSize}
                  onChange={(e) => setLogoSize(Number(e.target.value))}
                  aria-label={messages.styleLogoSizeLabel}
                  className="h-1.5 w-40 cursor-pointer accent-[hsl(var(--primary))]"
                />
                <span className="w-10 text-xs tabular-nums text-muted-foreground">{logoSize}px</span>
              </div>
            )}
          </div>
          </div>

          <div>
          <Label htmlFor="qr-caption" className="text-xs font-medium text-muted-foreground">
            {messages.styleCaptionLabel}
          </Label>
          <Input
            id="qr-caption"
            value={caption}
            maxLength={40}
            placeholder={messages.styleCaptionPlaceholder}
            onChange={(e) => setCaption(e.target.value)}
            className="mt-3"
          />
          <p className="mt-2 text-[13px] text-muted-foreground">{messages.styleCaptionHint}</p>
          </div>
        </div>

        {/* ADVANCED: custom colors + image size */}
        <div className="rounded-lg border bg-muted/30 p-4">
          <Label className="text-sm font-semibold">{messages.styleGroupAdvanced}</Label>

          <div>
          <Label className="text-xs font-medium text-muted-foreground">{messages.styleCustomColorLabel}</Label>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <span className="font-medium text-foreground">{messages.styleCustomColorModule}</span>
              <input
                type="color"
                value={customColor?.moduleColor ?? COLOR_PALETTES.find((p) => p.name === palette)?.dark ?? "#1f1a17"}
                onChange={(e) => setCustomColor({ moduleColor: e.target.value, bgColor: customColor?.bgColor ?? COLOR_PALETTES.find((p) => p.name === palette)?.light ?? "#f6f3ee" })}
                aria-label={messages.styleCustomColorModule}
                className="h-9 w-14 cursor-pointer rounded-md border border-input"
              />
              <HexInput
                value={customColor?.moduleColor ?? COLOR_PALETTES.find((p) => p.name === palette)?.dark ?? "#1f1a17"}
                onCommit={(hex) => setCustomColor({ moduleColor: hex, bgColor: customColor?.bgColor ?? COLOR_PALETTES.find((p) => p.name === palette)?.light ?? "#f6f3ee" })}
                label={messages.styleCustomColorModule}
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <span className="font-medium text-foreground">{messages.styleCustomColorBackground}</span>
              <input
                type="color"
                value={customColor?.bgColor ?? COLOR_PALETTES.find((p) => p.name === palette)?.light ?? "#f6f3ee"}
                onChange={(e) => setCustomColor({ moduleColor: customColor?.moduleColor ?? COLOR_PALETTES.find((p) => p.name === palette)?.dark ?? "#1f1a17", bgColor: e.target.value })}
                aria-label={messages.styleCustomColorBackground}
                className="h-9 w-14 cursor-pointer rounded-md border border-input"
              />
              <HexInput
                value={customColor?.bgColor ?? COLOR_PALETTES.find((p) => p.name === palette)?.light ?? "#f6f3ee"}
                onCommit={(hex) => setCustomColor({ moduleColor: customColor?.moduleColor ?? COLOR_PALETTES.find((p) => p.name === palette)?.dark ?? "#1f1a17", bgColor: hex })}
                label={messages.styleCustomColorBackground}
              />
            </label>
            <button
              type="button"
              onClick={() => setCustomColor(null)}
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
          <p className="mt-2 text-[13px] text-muted-foreground">
            {customColor?.moduleColor ?? COLOR_PALETTES.find((p) => p.name === palette)?.dark ?? "#1f1a17"} / {customColor?.bgColor ?? COLOR_PALETTES.find((p) => p.name === palette)?.light ?? "#f6f3ee"}
          </p>
          <p className="text-[13px] text-muted-foreground">{messages.helpCustomColor}</p>
          </div>

          <div>
          {/* SizeSelector renders its own "Image size" label. */}
          <SizeSelector
            preset={sizePreset}
            onPresetChange={setSizePreset}
            custom={sizeCustom}
            onCustomChange={setSizeCustom}
          />
          </div>
        </div>
          </>
        )}
          {/* Reset + history live under the style groups so the left column
              balances the preview column instead of leaving a dead zone. */}
          <div className="flex flex-col gap-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={resetForm}
            className="w-full text-muted-foreground"
          >
            {messages.formReset}
          </Button>
          {history.length > 0 && (
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">{messages.historyTitle}</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearHistory}
                  className="text-xs text-muted-foreground"
                >
                  {messages.historyClear}
                </Button>
              </div>
              <ul className="mt-2 space-y-1">
                {history.slice(0, 5).map((entry, i) => (
                  <li key={entry.ts + "-" + i}>
                    <button
                      type="button"
                      onClick={() => restoreHistory(entry)}
                      className="min-h-11 md:min-h-0 w-full rounded px-2 py-1.5 text-left transition-colors hover:bg-accent/60"
                    >
                      <span className="text-xs font-medium text-foreground">
                        {typeLabels[entry.form.type] ?? entry.form.type}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {historyPreview(entry)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[13px] text-muted-foreground">{messages.historyHint}</p>
            </div>
          )}
          </div>
      </div>

      {/* Right: sticky live preview + actions. Order-2 puts it between the
          fields and the style groups on mobile; md:row-span-2 lets the
          sticky inner column span both desktop rows. The sticky lives on
          this outer div (a direct form child) so it can travel the whole
          form height on mobile — an inner sticky would be trapped by a
          parent exactly its own size and scroll away before the style
          section. Capped to the viewport (with internal scroll) so the
          download buttons stay reachable while pinned; opaque bg — /95 +
          blur dropped frames on fast scrolls. */}
      {/* md:self-start is required: align-self:stretch on a grid item breaks
          sticky travel within its row-span area (the probe pins, stretched
          items do not). */}
      <div className="order-2 sticky top-20 z-10 flex max-h-[calc(100dvh_-_5.5rem)] flex-col gap-4 self-stretch overflow-y-auto rounded-lg bg-background p-3 md:row-span-2 md:self-start md:max-h-none md:overflow-visible md:bg-transparent md:p-0">
        <div className="flex flex-col gap-4">
          <p className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {messages.previewLabel}
          </p>
          <QrPreview
            payload={payload}
            shape={shape}
            palette={palette}
            customColor={customColor}
            logo={logo}
            logoSize={logoSize}
            caption={caption}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              disabled={!payload.trim() || busy !== null}
              onClick={downloadPng}
              size="lg"
              className="w-full"
            >
              {busy === "png" ? messages.formGenerating : messages.formDownload}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!payload.trim() || busy !== null}
              onClick={downloadSvg}
              className="min-h-11 md:min-h-10 shrink-0"
            >
              {messages.formDownloadSvg}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!payload.trim() || busy !== null}
              onClick={copyImage}
              aria-label={messages.formCopy}
              className="min-h-11 md:min-h-10 w-auto shrink-0 px-3"
            >
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-center text-[13px] text-muted-foreground">{messages.privacyNote}</p>
          </div>
      </div>
    </form>
  );
}
