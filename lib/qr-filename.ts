import { safeFilename } from "./zip";
import type { QrInput } from "./qr-encode";

/**
 * Suggest a meaningful download filename from a QR's content — e.g. a URL
 * becomes its hostname, a contact becomes the person's name — so users can
 * find their downloaded file later without opening it.
 */
export function suggestQrFilename(type: string, data: QrInput): string {
  let raw = "";
  switch (type) {
    case "url": {
      const url = (data.url ?? "").trim();
      try {
        raw = new URL(url).hostname.replace(/^www\./, "");
      } catch {
        raw = url.replace(/^https?:\/\//, "").split("/")[0] ?? "";
      }
      break;
    }
    case "email":
      raw = (data.email ?? "").split("@")[0] ?? "";
      break;
    case "phone":
    case "sms":
      raw = (data.phone ?? "").replace(/[^\d]/g, "");
      break;
    case "wifi":
      raw = data.wifiSsid ?? "";
      break;
    case "vcard":
      raw = data.vcardName ?? "";
      break;
    case "geo":
      raw = `${data.geoLat ?? "lat"},${data.geoLon ?? "lon"}`;
      break;
    case "event":
      raw = data.eventTitle ?? "";
      break;
    default: {
      const text = (data.text ?? "").trim();
      raw = text.length > 24 ? `${text.slice(0, 24).trimEnd()}…` : text;
    }
  }
  return safeFilename(raw, `qr-${Date.now()}`);
}
