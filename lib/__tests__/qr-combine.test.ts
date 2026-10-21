import { describe, expect, it } from "vitest";

import { combineColumns, missingColumns, type CombinedColumn } from "../qr-combine";

describe("combineColumns", () => {
  it("joins multiple columns with a newline separator", () => {
    const row = { name: "Ada", link: "https://ada.example" };
    const columns: CombinedColumn[] = [
      { column: "name", type: "text" },
      { column: "link", type: "url" },
    ];
    const payload = combineColumns(row, columns);
    expect(payload).toBe("Ada\nhttps://ada.example");
  });

  it("skips empty columns", () => {
    const row = { name: "Grace", link: "", email: "" };
    const columns: CombinedColumn[] = [
      { column: "name", type: "text" },
      { column: "link", type: "url" },
      { column: "email", type: "email" },
    ];
    const payload = combineColumns(row, columns);
    expect(payload).toBe("Grace");
  });

  it("applies the assigned type to each column", () => {
    const row = { phone: "+15551234567", link: "https://example.com" };
    const columns: CombinedColumn[] = [
      { column: "phone", type: "phone" },
      { column: "link", type: "url" },
    ];
    const payload = combineColumns(row, columns);
    expect(payload).toContain("tel:+15551234567");
    expect(payload).toContain("https://example.com");
  });

  it("falls back to raw text when a type cannot encode the value", () => {
    // geo requires both lat and lon; a lone value throws and falls back.
    const row = { geo: "not-a-number" };
    const columns: CombinedColumn[] = [{ column: "geo", type: "geo" }];
    const payload = combineColumns(row, columns);
    expect(payload).toBe("not-a-number");
  });

  it("returns an empty string when all columns are empty", () => {
    const row = { name: "", link: "" };
    const columns: CombinedColumn[] = [
      { column: "name", type: "text" },
      { column: "link", type: "url" },
    ];
    expect(combineColumns(row, columns)).toBe("");
  });
});

describe("missingColumns", () => {
  it("returns only the columns that do not exist in headers", () => {
    const headers = ["name", "link"];
    const columns: CombinedColumn[] = [
      { column: "name" },
      { column: "missing" },
      { column: "link" },
    ];
    expect(missingColumns(headers, columns)).toEqual(["missing"]);
  });

  it("returns an empty array when all columns exist", () => {
    const headers = ["a", "b"];
    const columns: CombinedColumn[] = [{ column: "a" }, { column: "b" }];
    expect(missingColumns(headers, columns)).toEqual([]);
  });
});
