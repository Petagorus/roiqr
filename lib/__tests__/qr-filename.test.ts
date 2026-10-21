import { describe, expect, it } from "vitest";

import { suggestQrFilename } from "../qr-filename";

describe("suggestQrFilename", () => {
  it("uses the hostname for URLs, stripping www", () => {
    expect(
      suggestQrFilename("url", { type: "url", url: "https://www.scb.co.th/th" }),
    ).toBe("scb.co.th");
  });

  it("falls back gracefully for non-URL text", () => {
    expect(suggestQrFilename("url", { type: "url", url: "not a url" })).toBe(
      "not a url",
    );
  });

  it("uses digits for phone and SMS", () => {
    expect(suggestQrFilename("phone", { type: "phone", phone: "+66 80 123 4567" })).toBe(
      "66801234567",
    );
    expect(suggestQrFilename("sms", { type: "sms", phone: "+66 80 123 4567" })).toBe(
      "66801234567",
    );
  });

  it("uses the SSID, contact name, geo pair and event title", () => {
    expect(suggestQrFilename("wifi", { type: "wifi", wifiSsid: "Home/Net:5G" })).toBe(
      "Home Net 5G",
    );
    expect(
      suggestQrFilename("vcard", { type: "vcard", vcardName: "Ada Lovelace" }),
    ).toBe("Ada Lovelace");
    expect(
      suggestQrFilename("geo", { type: "geo", geoLat: "13.7", geoLon: "100.5" }),
    ).toBe("13.7,100.5");
    expect(
      suggestQrFilename("event", { type: "event", eventTitle: "Launch day" }),
    ).toBe("Launch day");
  });

  it("truncates long text with an ellipsis", () => {
    const name = suggestQrFilename("text", {
      type: "text",
      text: "abcdefghijklmnopqrstuvwxyz1234567890",
    });
    expect(name.length).toBeLessThanOrEqual(25);
    expect(name.endsWith("…")).toBe(true);
  });

  it("never returns an empty name", () => {
    const name = suggestQrFilename("email", { type: "email", email: "" });
    expect(name.length).toBeGreaterThan(0);
  });
});
