import JSZip from "jszip";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import JsBarcode from "jsbarcode";
import { BARCODE_SPECS, type BarcodeType } from "./barcode-utils";

export interface ExportProgress {
  current: number;
  total: number;
  phase: "generating" | "packaging" | "complete";
}

type ProgressCallback = (progress: ExportProgress) => void;

// Convert SVG to canvas data URL
async function svgToDataUrl(
  svgElement: SVGElement,
  format: "image/jpeg" | "image/png" = "image/jpeg"
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("Could not get canvas context"));
      return;
    }

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // White background for JPG
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL(format, 0.95));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load SVG image"));
    };
    img.src = url;
  });
}

// Generate SVG element for a barcode - HD quality with higher resolution
function generateBarcodeSVG(code: string, type: BarcodeType, hdMode: boolean = true): SVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  
  // HD settings for print-ready output (300+ DPI equivalent)
  const width = hdMode ? 4 : 2;  // Double width for HD
  const height = hdMode ? 200 : 100;  // Double height for HD
  const fontSize = hdMode ? 32 : 16;  // Double font size for HD
  const margin = hdMode ? 20 : 10;  // Double margin for HD
  
  JsBarcode(svg, String(code), {
    format: BARCODE_SPECS[type].format,
    width: width,
    height: height,
    displayValue: true,
    flat: false,
    fontSize: fontSize,
    margin: margin,
    // EAN-13 needs a wider left quiet zone so the leading digit is decoded
    marginLeft: type === "EAN-13" ? margin * 3 : margin,
    marginRight: type === "EAN-13" ? margin * 2.5 : margin,
    background: "#ffffff",
    lineColor: "#000000",
    textMargin: hdMode ? 8 : 4,
    fontOptions: "bold",
  });
  return svg;
}

// Export barcodes as ZIP
export async function exportAsZip(
  barcodes: string[],
  type: BarcodeType,
  onProgress?: ProgressCallback
): Promise<void> {
  const zip = new JSZip();
  const jpgFolder = zip.folder("JPG");
  const svgFolder = zip.folder("SVG");
  const total = barcodes.length;

  // Generate images
  for (let i = 0; i < barcodes.length; i++) {
    const code = barcodes[i];
    const svg = generateBarcodeSVG(code, type, true); // HD mode enabled
    // Add SVG
    const svgString = new XMLSerializer().serializeToString(svg);
    svgFolder?.file(`${code}.svg`, svgString);

    // Add JPG
    try {
      const dataUrl = await svgToDataUrl(svg, "image/jpeg");
      const base64Data = dataUrl.split(",")[1];
      jpgFolder?.file(`${code}.jpg`, base64Data, { base64: true });
    } catch (error) {
      console.error(`Failed to generate JPG for ${code}:`, error);
    }

    onProgress?.({
      current: i + 1,
      total: total + 2, // +2 for Excel and PDF
      phase: "generating",
    });
  }

  // Generate Excel
  const excelFolder = zip.folder("EXCEL");
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([
    ["Barcode Number", "Type"],
    ...barcodes.map((code) => [code, type]),
  ]);
  for (let row = 2; row <= barcodes.length + 1; row++) {
    const cell = worksheet[`A${row}`];
    if (cell) {
      cell.t = "s";
      cell.v = String(cell.v);
      cell.z = "@";
    }
  }
  XLSX.utils.book_append_sheet(workbook, worksheet, "Barcodes");
  const excelBuffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
  excelFolder?.file("barcodes.xlsx", excelBuffer);

  onProgress?.({
    current: total + 1,
    total: total + 2,
    phase: "generating",
  });

  // Generate PDF
  const pdfFolder = zip.folder("PDF");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const barcodeWidth = 80;
  const barcodeHeight = 35;
  const margin = 15;
  const cols = 2;
  const rowsPerPage = 6;

  for (let i = 0; i < barcodes.length; i++) {
    const code = barcodes[i];
    const pageIndex = Math.floor(i / (cols * rowsPerPage));
    const positionOnPage = i % (cols * rowsPerPage);
    const col = positionOnPage % cols;
    const row = Math.floor(positionOnPage / cols);

    if (i > 0 && positionOnPage === 0) {
      pdf.addPage();
    }

    const x = margin + col * (barcodeWidth + 10);
    const y = margin + row * (barcodeHeight + 10);

    // Generate barcode image for PDF
    const svg = generateBarcodeSVG(code, type);
    try {
      const dataUrl = await svgToDataUrl(svg, "image/jpeg");
      pdf.addImage(dataUrl, "JPEG", x, y, barcodeWidth, barcodeHeight);
    } catch (error) {
      // Fallback: just add text
      pdf.text(code, x, y + barcodeHeight / 2);
    }
  }

  const pdfBuffer = pdf.output("arraybuffer");
  pdfFolder?.file("barcodes.pdf", pdfBuffer);

  onProgress?.({
    current: total + 2,
    total: total + 2,
    phase: "packaging",
  });

  // Generate and download ZIP
  const zipBlob = await zip.generateAsync({ type: "blob" });
  saveAs(zipBlob, `${type}_Barcodes_${new Date().toISOString().slice(0, 10)}.zip`);

  onProgress?.({
    current: total + 2,
    total: total + 2,
    phase: "complete",
  });
}

// Copy barcodes to clipboard
export async function copyToClipboard(barcodes: string[]): Promise<void> {
  const text = barcodes.join("\n");
  await navigator.clipboard.writeText(text);
}
