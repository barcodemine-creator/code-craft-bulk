// UPC-A checksum calculation (11-digit base → 1 check digit)
export function calculateUPCACheckDigit(base11: string): number {
  if (base11.length !== 11 || !/^\d+$/.test(base11)) {
    throw new Error("UPC-A base must be exactly 11 digits");
  }

  let sum = 0;
  for (let i = 0; i < 11; i++) {
    const digit = parseInt(base11[i], 10);
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
    const digit = parseInt(base12[i], 10);
    // Odd positions (0, 2, 4, ...) multiply by 1, even positions by 3
    sum += digit * (i % 2 === 0 ? 1 : 3);
  }

  return (10 - (sum % 10)) % 10;
}

// Generate full barcode with check digit
export function generateFullBarcode(
  base: string,
  type: "UPC-A" | "EAN-13"
): string {
  const expectedLength = type === "UPC-A" ? 11 : 12;
  const paddedBase = base.padStart(expectedLength, "0");

  if (paddedBase.length !== expectedLength) {
    throw new Error(
      `${type} requires a ${expectedLength}-digit base number`
    );
  }

  const checkDigit =
    type === "UPC-A"
      ? calculateUPCACheckDigit(paddedBase)
      : calculateEAN13CheckDigit(paddedBase);

  return paddedBase + checkDigit;
}

// Generate a sequence of barcodes
export function generateBarcodeSequence(
  startBase: string,
  quantity: number,
  type: "UPC-A" | "EAN-13"
): string[] {
  const expectedLength = type === "UPC-A" ? 11 : 12;
  const barcodes: string[] = [];
  let currentBase = BigInt(startBase.padStart(expectedLength, "0"));

  for (let i = 0; i < quantity; i++) {
    const baseStr = currentBase.toString().padStart(expectedLength, "0");
    
    // Check for overflow
    if (baseStr.length > expectedLength) {
      throw new Error(`Sequence overflow: exceeded maximum ${type} range`);
    }

    barcodes.push(generateFullBarcode(baseStr, type));
    currentBase++;
  }

  return barcodes;
}

// Validate base number input
export function validateBaseNumber(
  base: string,
  type: "UPC-A" | "EAN-13"
): { valid: boolean; error?: string } {
  const expectedLength = type === "UPC-A" ? 11 : 12;

  if (!base) {
    return { valid: false, error: "Base number is required" };
  }

  if (!/^\d+$/.test(base)) {
    return { valid: false, error: "Base number must contain only digits" };
  }

  if (base.length > expectedLength) {
    return {
      valid: false,
      error: `Base number must be at most ${expectedLength} digits for ${type}`,
    };
  }

  return { valid: true };
}

export type BarcodeType = "UPC-A" | "EAN-13";

export interface GeneratedBarcode {
  code: string;
  type: BarcodeType;
}
