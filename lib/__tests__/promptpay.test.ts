import { describe, expect, it } from "vitest";

import { crc16CCITT, encodePayload, promptpayPayload } from "../qr-encode";

describe("crc16CCITT", () => {
  it("matches the canonical CRC-16/CCITT-FALSE check value", () => {
    // CRC-16/CCITT-FALSE of "123456789" is 0x29B1 by specification.
    expect(crc16CCITT("123456789")).toBe("29B1");
  });
});

describe("promptpayPayload", () => {
  it("builds the BOT EMVCo structure for a mobile target without amount", () => {
    const payload = promptpayPayload("0812345678");
    expect(payload.startsWith("000201010211")).toBe(true);
    expect(payload).toContain("0016A000000677010111"); // PromptPay AID
    expect(payload).toContain("01130066812345678"); // 0066 + number minus 0
    expect(payload).toContain("5802TH");
    expect(payload).toContain("5303764"); // THB
    expect(payload).not.toContain("54"); // no amount
    // CRC is the last 4 chars and verifies against a recomputation.
    const body = payload.slice(0, -4);
    expect(payload.slice(-4)).toMatch(/^[0-9A-F]{4}$/);
    expect(crc16CCITT(body)).toBe(payload.slice(-4));
  });

  it("switches to single-use and adds the amount when one is set", () => {
    const payload = promptpayPayload("0812345678", "50");
    expect(payload.startsWith("000201010212")).toBe(true);
    expect(payload).toContain("540550.00");
    expect(crc16CCITT(payload.slice(0, -4))).toBe(payload.slice(-4));
  });

  it("accepts a national ID and an e-wallet ID", () => {
    expect(promptpayPayload("1234567890123")).toContain("011700001234567890123");
    expect(promptpayPayload("123456789012345")).toContain("01190001123456789012345");
  });

  it("normalizes formatted input", () => {
    expect(promptpayPayload("0 8123-456-78")).toBe(promptpayPayload("0812345678"));
  });

  it("accepts formatted decimal amounts", () => {
    expect(promptpayPayload("0812345678", "1,250.5")).toContain("54071250.50");
  });

  it("rejects invalid targets with a clear error", () => {
    expect(() => promptpayPayload("")).toThrow();
    expect(() => promptpayPayload("12345")).toThrow();
    // 10 digits not starting with 0 is a bank account number, not a proxy.
    expect(() => promptpayPayload("1234567890")).toThrow();
  });

  it("rejects invalid amounts", () => {
    expect(() => promptpayPayload("0812345678", "0")).toThrow();
    expect(() => promptpayPayload("0812345678", "-5")).toThrow();
    expect(() => promptpayPayload("0812345678", "abc")).toThrow();
  });

  it("is reachable through the generic encoder", () => {
    expect(
      encodePayload("promptpay", { promptpayTarget: "0812345678" }),
    ).toBe(promptpayPayload("0812345678"));
  });
});
