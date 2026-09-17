import { describe, expect, it } from "vitest";
import {
  calculateEAN13CheckDigit,
  generateBarcodeSequence,
  incrementNumericString,
  normalizeBarcodeInput,
} from "@/lib/barcode-utils";

describe("leading-zero EAN-13 handling", () => {
  it.each([
    ["071885267515", "0718852675153"],
    ["012345678901", "0123456789012"],
    ["001234567890", "0012345678905"],
    ["079123456789", "0791234567895"],
  ])("calculates a valid check digit for %s", (base, expected) => {
    expect(`${base}${calculateEAN13CheckDigit(base)}`).toBe(expected);
    expect(normalizeBarcodeInput(expected, "EAN-13")).toBe(expected);
  });

  it("rejects an invalid complete EAN-13 instead of replacing its check digit", () => {
    expect(() => normalizeBarcodeInput("0791234567891", "EAN-13")).toThrow("Invalid EAN-13 check digit");
  });

  it("keeps leading zeros while incrementing and generating", () => {
    expect(incrementNumericString("001234567890")).toBe("001234567891");
    expect(generateBarcodeSequence("0012345678905", 2, "EAN-13")).toEqual([
      "0012345678905",
      "0012345678912",
    ]);
  });
});