import { describe, expect, it } from "vitest";
import { MAX_ENCODED_LENGTH, decodeShare, encodeShare, extractShared, shareHash } from "./codec";
import { decodeShareArea } from "./codec";

describe("encodeShare / decodeShare", () => {
  it("round-trips data, including accents and emoji", () => {
    const data = { name: "Qualité & Délais ✓ 🙂", values: [1, 2.5, 3], nested: { ok: true } };
    expect(decodeShare(encodeShare("takt", data), "takt")).toEqual(data);
  });

  it("produces URL-safe output", () => {
    expect(encodeShare("pareto", { text: "???>>>~~~ ÿÿÿ" })).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("rejects a link made for another tool", () => {
    expect(decodeShare(encodeShare("oee", { a: 1 }), "takt")).toBeNull();
  });

  it("rejects an unknown version", () => {
    const future = btoa(JSON.stringify({ v: 99, tool: "takt", data: { a: 1 } }));
    expect(decodeShare(future, "takt")).toBeNull();
  });

  it("returns null for garbage instead of throwing", () => {
    // "e30" decodes to {} and "bnVsbA" decodes to null
    for (const junk of ["", "!!!", "abc", "e30", "bnVsbA"]) {
      expect(decodeShare(junk, "takt")).toBeNull();
    }
  });

  it("refuses to build an oversized link", () => {
    expect(() => encodeShare("pareto", { text: "x".repeat(MAX_ENCODED_LENGTH) })).toThrow(
      RangeError,
    );
  });

  it("ignores oversized input when decoding", () => {
    expect(decodeShare("A".repeat(MAX_ENCODED_LENGTH + 1), "takt")).toBeNull();
  });
});

describe("shareHash / extractShared", () => {
  it("extracts the payload from a hash", () => {
    const hash = shareHash("5s", { answers: {} });
    expect(hash.startsWith("#s=")).toBe(true);
    expect(decodeShare(extractShared(hash)!, "5s")).toEqual({ answers: {} });
  });

  it("returns null when there is no share payload", () => {
    expect(extractShared("")).toBeNull();
    expect(extractShared("#other=1")).toBeNull();
    expect(extractShared("#s=")).toBeNull();
  });
describe("area in links", () => {
  it("round-trips the area", () => {
    const encoded = encodeShare("oee", { a: 1 }, "  Packing   line 2 ");
    expect(decodeShareArea(encoded, "oee")).toBe("Packing line 2");
    expect(decodeShare(encoded, "oee")).toEqual({ a: 1 });
  });

  it("treats links without an area as having none", () => {
    expect(decodeShareArea(encodeShare("oee", { a: 1 }), "oee")).toBe("");
  });

  it("cleans an area that was edited by hand", () => {
    const edited = btoa(
      JSON.stringify({ v: 1, tool: "oee", data: { a: 1 }, area: "  Line   9  " }),
    );
    expect(decodeShareArea(edited, "oee")).toBe("Line 9");
  });

  it("ignores the area of a link made for another tool", () => {
    expect(decodeShareArea(encodeShare("takt", { a: 1 }, "Line 1"), "oee")).toBe("");
  });
});
});