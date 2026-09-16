# Leading-zero-safe barcode generation

## Outcome
EAN-13 values remain strings from input through preview, export, saved records, and downloads. A leading zero is encoded and displayed as part of the complete GTIN-13, with invalid check digits rejected.

## Changes
- Centralize barcode specifications and validation for EAN-13, UPC-A, EAN-8, and Code 128.
- For EAN-13, accept exactly 12 or 13 digits: calculate the check digit for 12 digits and validate it for 13 digits.
- Keep barcode values as strings; replace range reconstruction that passes through `BigInt` with string-safe decimal incrementing.
- Explicitly map each selected type to its real encoder format (`ean13`, `upc`, `ean8`, `CODE128`) in previews and every export format.
- Add a clear four-option type selector and type-specific input guidance without inferring UPC-A from a leading zero.
- Validate generated symbols after rendering with an EAN-13 decoder, checking both decoded value and decoded symbology. Surface a warning when a decoder normalizes a leading-zero EAN-13 to UPC-A rather than claiming exact verification.
- Keep Excel barcode cells explicitly typed as text so leading zeros survive spreadsheet export.
- Add database constraints to enforce text-formatted barcode values and permitted lengths without converting existing values to numeric types.

## Verification
- Add automated tests for checksum calculation, full-value validation, leading-zero preservation, sequence generation, and invalid check-digit rejection.
- Cover `0718852675153`, `0123456789012`, `0012345678905`, and reject invalid `0791234567891` (correct form: `0791234567895`).
- Verify the live generator and preview at desktop and mobile sizes, including the displayed 13-digit value and reported EAN-13 symbology.

## Technical details
- Use JsBarcode with an explicit format; no automatic format selection.
- Add ZXing decoding for post-render verification.
- Continue storing barcode identifiers in existing text columns and text arrays; add checks rather than numeric casts.
