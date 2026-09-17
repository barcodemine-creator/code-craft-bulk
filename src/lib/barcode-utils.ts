// UPC-A checksum calculation (11-digit base → 1 check digit)
export type BarcodeType = "EAN-13" | "UPC-A" | "EAN-8" | "Code 128";

export const BARCODE_SPECS: Record<BarcodeType, {
  baseLength: number | null;
  fullLength: number | null;
  format: "ean13" | "upc" | "ean8" | "CODE128";
}> = {
  "EAN-13": { baseLength: 12, fullLength: 13, format: "ean13" },
  "UPC-A": { baseLength: 11, fullLength: 12, format: "upc" },
  "EAN-8": { baseLength: 7, fullLength: 8, format: "ean8" },
  "Code 128": { baseLength: null, fullLength: null, format: "CODE128" },
};

const digitAt = (value: string, index: number): number => value.charCodeAt(index) - 48;

export function calculateUPCACheckDigit(base11: string): number {
  if (base11.length !== 11 || !/^\d+$/.test(base11)) {
    throw new Error("UPC-A base must be exactly 11 digits");
  }

  let sum = 0;
  for (let i = 0; i < 11; i++) {
    const digit = digitAt(base11, i);
    // Odd positions (0, 2, 4, ...) multiply by 3, even positions by 1
    sum += digit * (i % 2 === 0 ? 3 : 1);
  }

  return (10 - (sum % 10)) % 10;
}

// EAN-13 checksum calculation (12-digit base → 1 check digit)
export function calculateEAN13CheckDigit(base12: string): number {
  if (base12.length !== 12 || !/^\d+$/.test(base12)) {
    throw new Error("EAN-13 base must be exactly 12 digits");
  }

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = digitAt(base12, i);
    // Odd positions (0, 2, 4, ...) multiply by 1, even positions by 3
    sum += digit * (i % 2 === 0 ? 1 : 3);
  }

  return (10 - (sum % 10)) % 10;
}

export function calculateEAN8CheckDigit(base7: string): number {
  if (!/^\d{7}$/.test(base7)) throw new Error("EAN-8 base must be exactly 7 digits");
  let sum = 0;
  for (let i = 0; i < 7; i++) sum += digitAt(base7, i) * (i % 2 === 0 ? 3 : 1);
  return (10 - (sum % 10)) % 10;
}

export function incrementNumericString(value: string): string {
  if (!/^\d+$/.test(value)) throw new Error("Barcode value must contain only digits");
  const digits = value.split("");
  for (let index = digits.length - 1; index >= 0; index--) {
    if (digits[index] !== "9") {
      digits[index] = String(digitAt(digits[index], 0) + 1);
      return digits.join("");
    }
    digits[index] = "0";
  }
  throw new Error("Sequence overflow: exceeded maximum barcode range");
}

// Generate full barcode with check digit
export function generateFullBarcode(
  base: string,
  type: BarcodeType
): string {
  const barcodeBase = String(base).trim();
  if (type === "Code 128") {
    if (!barcodeBase) throw new Error("Code 128 value is required");
    return barcodeBase;
  }
  const expectedLength = BARCODE_SPECS[type].baseLength;
  if (expectedLength === null || barcodeBase.length !== expectedLength || !/^\d+$/.test(barcodeBase)) {
    throw new Error(`${type} requires exactly ${expectedLength} numeric base digits`);
  }
  const checkDigit = type === "UPC-A"
    ? calculateUPCACheckDigit(barcodeBase)
    : type === "EAN-8"
      ? calculateEAN8CheckDigit(barcodeBase)
      : calculateEAN13CheckDigit(barcodeBase);
  return barcodeBase + String(checkDigit);
}

export function normalizeBarcodeInput(value: string, type: BarcodeType): string {
  const barcodeValue = String(value).trim();
  if (!barcodeValue) throw new Error("Barcode value is required");
  if (type === "Code 128") return barcodeValue;
  if (!/^\d+$/.test(barcodeValue)) throw new Error(`${type} must contain only numeric characters`);
  const { baseLength, fullLength } = BARCODE_SPECS[type];
  if (barcodeValue.length === baseLength) return generateFullBarcode(barcodeValue, type);
  if (barcodeValue.length !== fullLength) {
    throw new Error(`${type} requires exactly ${baseLength} base digits or ${fullLength} complete digits`);
  }
  const expected = generateFullBarcode(barcodeValue.slice(0, -1), type);
  if (expected !== barcodeValue) {
    throw new Error(`Invalid ${type} check digit: expected ${expected.slice(-1)}, received ${barcodeValue.slice(-1)}`);
  }
  return barcodeValue;
}

// Generate a sequence of barcodes
export function generateBarcodeSequence(
  startValue: string,
  quantity: number,
  type: BarcodeType
): string[] {
  const firstValue = normalizeBarcodeInput(startValue, type);
  if (type === "Code 128" && !/^\d+$/.test(firstValue)) {
    if (quantity !== 1) throw new Error("Code 128 sequences require a numeric starting value");
    return [firstValue];
  }
  const baseLength = BARCODE_SPECS[type].baseLength;
  const barcodes: string[] = [];
  let currentBase = baseLength === null ? firstValue : firstValue.slice(0, baseLength);

  for (let i = 0; i < quantity; i++) {
    barcodes.push(generateFullBarcode(currentBase, type));
    if (i < quantity - 1) currentBase = incrementNumericString(currentBase);
  }

  return barcodes;
}

// Validate base number input
export function validateBaseNumber(
  base: string,
  type: BarcodeType
): { valid: boolean; error?: string } {
  try {
    normalizeBarcodeInput(base, type);
    return { valid: true };
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : "Invalid barcode value" };
  }
}

export interface GeneratedBarcode {
  code: string;
  type: BarcodeType;
}
