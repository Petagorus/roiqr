import { describe, expect, it } from "vitest";

import { encodePayload, generateQr } from "../qr-encode";

describe("encodePayload", () => {
  it("encodes a URL as-is", () => {
    expect(encodePayload("url", { url: "https://example.com" })).toBe(
      "https://example.com",
    );
  });

  it("encodes plain text", () => {
    expect(encodePayload("text", { text: "hello world" })).toBe("hello world");
  });

  it("encodes an email with subject and body", () => {
    const payload = encodePayload("email", {
      email: "a@b.com",
      subject: "Hi",
      body: "There",
    });
    expect(payload).toBe("mailto:a@b.com?subject=Hi&body=There");
  });

  it("encodes a phone number stripping non-digits", () => {
    expect(encodePayload("phone", { phone: "+1 (555) 123-4567" })).toBe(
      "tel:+15551234567",
    );
  });

  it("encodes an SMS message", () => {
    expect(encodePayload("sms", { phone: "+15551234567", smsBody: "Ping" })).toBe(
      "SMSTO:+15551234567:Ping",
    );
  });

  it("encodes Wi-Fi credentials with WPA", () => {
    const payload = encodePayload("wifi", {
      wifiSsid: "Cafe",
      wifiPassword: "secret",
      wifiEncryption: "WPA",
    });
    expect(payload).toBe("WIFI:T:WPA;S:Cafe;P:secret;");
  });

  it("encodes a vCard with name, phone and email", () => {
    const payload = encodePayload("vcard", {
      vcardName: "Ada Lovelace",
      vcardPhone: "+15551234567",
      vcardEmail: "ada@example.com",
    });
    expect(payload).toContain("FN:Ada Lovelace");
    expect(payload).toContain("TEL:+15551234567");
    expect(payload).toContain("EMAIL:ada@example.com");
    expect(payload).toContain("VERSION:3.0");
  });

  it("encodes a geo location", () => {
    expect(
      encodePayload("geo", { geoLat: "37.7749", geoLon: "-122.4194" }),
    ).toBe("geo:37.7749,-122.4194");
  });

  it("throws when geo coordinates are missing", () => {
    expect(() => encodePayload("geo", { geoLat: "", geoLon: "" })).toThrow();
  });

  it("encodes a calendar event", () => {
    const payload = encodePayload("event", {
      eventTitle: "Launch",
      eventStart: "2026-01-01T10:00:00Z",
      eventLocation: "SF",
    });
    expect(payload).toContain("BEGIN:VCALENDAR");
    expect(payload).toContain("SUMMARY:Launch");
    expect(payload).toContain("LOCATION:SF");
    expect(payload).toContain("END:VCALENDAR");
  });

  it("throws on unsupported types", () => {
    expect(() => encodePayload("fax", {})).toThrow();
  });
});

describe("generateQr", () => {
  it("returns a data URL for a valid payload", async () => {
    const result = await generateQr("url", { url: "https://example.com" });
    expect(result.dataUrl).toMatch(/^data:image\/png;base64,/);
    expect(result.payload).toBe("https://example.com");
    expect(result.bytes).toBeGreaterThan(0);
  });

  it("throws for a bad geo payload", async () => {
    await expect(
      generateQr("geo", { geoLat: "", geoLon: "" }),
    ).rejects.toThrow();
  });
});
