import QRCode from "qrcode";

export type QrType =
  | "url"
  | "text"
  | "json"
  | "promptpay"
  | "email"
  | "phone"
  | "sms"
  | "wifi"
  | "vcard"
  | "geo"
  | "event";

/**
 * QR code rendering options accepted by the API.
 * Kept intentionally small and explicit.
 */
export interface QrRenderOptions {
  width?: number;
  margin?: number;
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  /** When true, returns a data URL instead of raw bytes. */
  asDataUrl?: boolean;
}

export const DEFAULT_QR_OPTIONS: Required<QrRenderOptions> = {
  width: 512,
  margin: 2,
  errorCorrectionLevel: "M",
  asDataUrl: true,
};

/**
 * Build the raw payload string for a given QR type.
 * Each branch produces a standard-encoded string that QR readers understand.
 */
export function encodePayload(type: string, data: QrInput): string {
  switch (type) {
    case "url":
      return (data.url ?? "").trim();
    case "text":
      return (data.text ?? "").trim();
    case "email": {
      const address = (data.email ?? "").trim();
      const subject = encodeURIComponent(data.subject ?? "");
      const body = encodeURIComponent(data.body ?? "");
      const params: string[] = [];
      if (data.subject) params.push(`subject=${subject}`);
      if (data.body) params.push(`body=${body}`);
      const query = params.length ? `?${params.join("&")}` : "";
      return `mailto:${address}${query}`;
    }
    case "phone": {
      const digits = (data.phone ?? "").replace(/[^\d+]/g, "");
      if (!digits) throw new Error("Phone number is required.");
      return `tel:${digits}`;
    }
    case "sms": {
      const digits = (data.phone ?? "").replace(/[^\d+]/g, "");
      const body = encodeURIComponent(data.smsBody ?? "");
      return digits ? `SMSTO:${digits}:${data.smsBody ?? ""}` : `SMSTO::${body}`;
    }
    case "wifi": {
      const ssid = (data.wifiSsid ?? "").replace(/["\\]/g, "\\$&");
      const password = (data.wifiPassword ?? "").replace(/["\\]/g, "\\$&");
      const encryption = data.wifiEncryption || "WPA";
      const hidden = data.wifiHidden ? ";H:true" : "";
      return `WIFI:T:${encryption};S:${ssid};P:${password};${hidden}`;
    }
    case "vcard": {
      const parts: string[] = [];
      const name = data.vcardName ?? "";
      const [family, given] = name.split(" ").reverse();
      parts.push(`FN:${data.vcardName ?? ""}`);
      parts.push(`N:${family ?? ""};${given ?? ""};;;`);
      if (data.vcardPhone) parts.push(`TEL:${data.vcardPhone.replace(/[^\d+]/g, "")}`);
      if (data.vcardEmail) parts.push(`EMAIL:${data.vcardEmail}`);
      if (data.vcardOrg) parts.push(`ORG:${data.vcardOrg.replace(/,/g, "")}`);
      parts.push("VERSION:3.0");
      return parts.join("\n");
    }
    case "geo": {
      if (!data.geoLat || !data.geoLon) {
        throw new Error("Latitude and longitude are required.");
      }
      const lat = Number(data.geoLat);
      const lon = Number(data.geoLon);
      if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
        return `geo:${lat},${lon}`;
      }
      throw new Error("Latitude and longitude must be valid numbers.");
    }
    case "event": {
      const start = normalizeEventDate(data.eventStart);
      const end = normalizeEventDate(data.eventEnd);
      const lines: string[] = [
        "BEGIN:VCALENDAR",
        `SUMMARY:${(data.eventTitle ?? "").replace(/[\r\n]/g, " ")}`,
        `DTSTART:${start}`,
        ...(end ? [`DTEND:${end}`] : []),
        ...(data.eventLocation ? [`LOCATION:${data.eventLocation.replace(/[\r\n]/g, " ")}`] : []),
        ...(data.eventDescription ? [`DESCRIPTION:${data.eventDescription.replace(/[\r\n]/g, " ")}`] : []),
        "END:VCALENDAR",
      ];
      return lines.join("\n");
    }
    case "json": {
      // The payload is the raw JSON text itself (minified by the UI); the
      // scanner app receives exactly this string and JSON.parses it.
      const text = (data.json ?? "").trim();
      if (!text) throw new Error("JSON content is required.");
      JSON.parse(text); // throws with position info on invalid JSON
      return JSON.stringify(JSON.parse(text));
    }
    case "promptpay":
      return promptpayPayload(data.promptpayTarget, data.promptpayAmount);
    default:
      throw new Error(`Unsupported QR type: ${type}`);
  }
}

/** CRC-16/CCITT-FALSE (poly 0x1021, init 0xFFFF) as required by PromptPay. */
export function crc16CCITT(input: string): string {
  let crc = 0xffff;
  for (let i = 0; i < input.length; i += 1) {
    crc ^= input.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/** One EMVCo TLV entry: tag + 2-digit length + value. */
function tlv(tag: string, value: string): string {
  return tag + String(value.length).padStart(2, "0") + value;
}

/**
 * Build a PromptPay (พร้อมเพย์) QR payload per the BOT EMVCo spec.
 *
 * Target accepts a 10-digit mobile number (leading 0), a 13-digit national
 * ID, or a 15-digit e-wallet ID. Amount is an optional THB value — when
 * present the payload becomes single-use ("12") instead of reusable ("11").
 * Bank account numbers are not valid PromptPay proxies, so they are rejected
 * rather than silently producing an unpayable code.
 */
export function promptpayPayload(
  target?: string | number | null,
  amount?: string | number | null,
): string {
  const digits = String(target ?? "").replace(/[^\d]/g, "");
  let proxy: string;
  if (digits.length === 10 && digits.startsWith("0")) {
    proxy = "0066" + digits.slice(1); // mobile, country code without leading 0
  } else if (digits.length === 13) {
    proxy = "0000" + digits; // national ID
  } else if (digits.length === 15) {
    proxy = "0001" + digits; // e-wallet
  } else {
    throw new Error("Enter a 10-digit mobile number or 13-digit national ID.");
  }

  let amountText = "";
  if (amount != null && String(amount).trim() !== "") {
    // Excel and Thai locale inputs commonly carry thousands separators.
    const parsedAmount = Number(String(amount).replace(/,/g, "").trim());
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      throw new Error("Amount must be a positive number.");
    }
    amountText = parsedAmount.toFixed(2);
  }

  const merchantAccount = tlv("00", "A000000677010111") + tlv("01", proxy);
  let payload =
    tlv("00", "01") +
    tlv("01", amountText ? "12" : "11") +
    tlv("29", merchantAccount) +
    tlv("58", "TH") +
    tlv("53", "764");
  if (amountText) payload += tlv("54", amountText);
  payload += tlv("63", "");
  return payload + crc16CCITT(payload);
}

/** Normalize a user date/datetime string to an ISO basic format (UTC). */
function normalizeEventDate(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().replace(/[:-]|\.\d{3}/g, "");
}

export interface QrInput {
  url?: string | null;
  text?: string | null;
  json?: string | null;
  promptpayTarget?: string | number | null;
  promptpayAmount?: string | number | null;
  email?: string | null;
  subject?: string | null;
  body?: string | null;
  phone?: string | null;
  smsBody?: string | null;
  wifiSsid?: string | null;
  wifiPassword?: string | null;
  wifiEncryption?: string | null;
  wifiHidden?: boolean | null;
  vcardName?: string | null;
  vcardPhone?: string | null;
  vcardEmail?: string | null;
  vcardOrg?: string | null;
  geoLat?: string | null;
  geoLon?: string | null;
  eventStart?: string | null;
  eventEnd?: string | null;
  eventTitle?: string | null;
  eventLocation?: string | null;
  eventDescription?: string | null;
  [key: string]: string | null | undefined | boolean | number;
}

/**
 * Generate a QR code for a payload string.
 * Returns a PNG data URL by default, or raw bytes when asDataUrl is false.
 */
export async function generateQr(
  type: QrType,
  data: QrInput,
  options: QrRenderOptions = {},
): Promise<{ dataUrl: string; payload: string; bytes: number }> {
  const payload = encodePayload(type, data);
  const settings = { ...DEFAULT_QR_OPTIONS, ...options };

  const dataUrl = await QRCode.toDataURL(payload, {
    width: settings.width,
    margin: settings.margin,
    errorCorrectionLevel: settings.errorCorrectionLevel,
  });

  const bytes = new TextEncoder().encode(payload).length;

  return { dataUrl, payload, bytes };
}
