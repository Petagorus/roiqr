import { describe, expect, it } from "vitest";

import {
  applyJsonTemplate,
  extractTemplateKeys,
  isValidJson,
  jsonByteLength,
  jsonObjectKeyCount,
  minifyJson,
  JSON_MAX_BYTES,
  JSON_WARN_BYTES,
} from "../json-payload";
import { encodePayload } from "../qr-encode";

describe("json helpers", () => {
  it("minifies JSON and reports its UTF-8 byte length", () => {
    const minified = minifyJson('{ "id": "A1",\n  "qty": 2 }');
    expect(minified).toBe('{"id":"A1","qty":2}');
    // Thai characters are 3 bytes each in UTF-8.
    expect(jsonByteLength(minified)).toBe(19);
    expect(jsonByteLength('{"id":"โต๊ะ 1"}')).toBeGreaterThan('{"id":"A1"}'.length);
  });

  it("validates JSON and counts top-level object keys", () => {
    expect(isValidJson('{"a":1}')).toBe(true);
    expect(isValidJson('{"a":1,}')).toBe(false);
    expect(jsonObjectKeyCount('{"a":1,"b":2,"c":3}')).toBe(3);
    expect(jsonObjectKeyCount("[1,2,3]")).toBe(0);
    expect(jsonObjectKeyCount("not json")).toBe(0);
  });

  it("capacity thresholds stay inside H error-correction limits", () => {
    expect(JSON_WARN_BYTES).toBeLessThan(JSON_MAX_BYTES);
    expect(JSON_MAX_BYTES).toBeLessThanOrEqual(1273);
  });
});

describe("applyJsonTemplate", () => {
  const row = { name: "โต๊ะ 1", qty: 3, note: null };

  it("substitutes {column} placeholders with row values", () => {
    const out = applyJsonTemplate('{"id":"{name}","qty":{qty}}', row);
    expect(out).toBe('{"id":"โต๊ะ 1","qty":3}');
    expect(() => JSON.parse(out)).not.toThrow();
  });

  it("tolerates spaces inside braces and missing columns", () => {
    expect(applyJsonTemplate("{ name }|{missing}", row)).toBe("โต๊ะ 1|");
  });

  it("keeps numeric values unquoted when the template omits quotes", () => {
    const parsed = JSON.parse(applyJsonTemplate('{"qty":{qty}}', row));
    expect(parsed.qty).toBe(3);
    expect(typeof parsed.qty).toBe("number");
  });

  it("lists the columns a template references", () => {
    expect(extractTemplateKeys('{"a":"{name}","b":"{ name }","c":"{missing}"}')).toEqual([
      "name",
      "missing",
    ]);
  });
});

describe("encodePayload json", () => {
  it("minifies valid JSON payloads", () => {
    expect(encodePayload("json", { json: '{ "id": "X" }' })).toBe('{"id":"X"}');
  });

  it("throws on invalid or empty JSON", () => {
    expect(() => encodePayload("json", { json: "{oops" })).toThrow();
    expect(() => encodePayload("json", { json: "  " })).toThrow();
  });
});
