import { jsPDF } from "jspdf";
import QRCode from "qrcode";

interface CertificateData {
  certificateNumber: string;
  companyName: string;
  contactName: string;
  barcodes: string[];
  barcodeType: "UPC-A" | "EAN-13";
  issueDate: Date;
  quantity: number;
  accountNumber?: string;
  orderId?: string;
  verificationUrl?: string;
}

async function generateQRCodeDataUrl(url: string): Promise<string> {
  try {
    return await QRCode.toDataURL(url, {
      width: 100,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    return "";
  }
}

export async function generateCertificatePDF(data: CertificateData): Promise<void> {
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;

  // White background
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, pageWidth, pageHeight, "F");

  // Main border - dark blue
  pdf.setDrawColor(31, 41, 55);
  pdf.setLineWidth(3);
  pdf.rect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2);

  // Inner border
  pdf.setDrawColor(100, 116, 139);
  pdf.setLineWidth(0.5);
  pdf.rect(margin + 3, margin + 3, pageWidth - margin * 2 - 6, pageHeight - margin * 2 - 6);

  // Header background - blue gradient effect (solid blue)
  pdf.setFillColor(30, 58, 138);
  pdf.rect(margin + 4, margin + 4, pageWidth - margin * 2 - 8, 45, "F");

  // BarCodeMine header text
  pdf.setFontSize(32);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(255, 255, 255);
  pdf.text("BARCODEMINE", pageWidth / 2, margin + 22, { align: "center" });

  // Certificate of GTIN Assignment title (cursive style simulation)
  pdf.setFontSize(24);
  pdf.setFont("times", "italic");
  pdf.setTextColor(255, 255, 255);
  pdf.text("Certificate of ", pageWidth / 2 - 50, margin + 38, { align: "center" });
  
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(255, 255, 255);
  pdf.text("GTIN Assignment", pageWidth / 2 + 30, margin + 38, { align: "center" });

  // Company name section - large and prominent
  let yPos = margin + 60;
  pdf.setFontSize(28);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(51, 65, 85);
  pdf.text(data.companyName || "Company Name", pageWidth / 2, yPos, { align: "center" });

  // "Is Assigned the Following Barcode Number(s) (GTINs):" text
  yPos += 12;
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(71, 85, 105);
  pdf.text("Is Assigned the Following Barcode Number(s) (GTINs):", pageWidth / 2, yPos, { align: "center" });

  // Barcode range display
  yPos += 15;
  pdf.setFontSize(11);
  pdf.setTextColor(100, 116, 139);
  pdf.text(`Quantity(${data.quantity}):`, pageWidth / 2 - 60, yPos);

  pdf.setFontSize(14);
  pdf.setFont("courier", "bold");
  pdf.setTextColor(37, 99, 235);
  const startBarcode = data.barcodes[0] || "";
  const endBarcode = data.barcodes.length > 1 ? data.barcodes[data.barcodes.length - 1] : data.barcodes[0];
  pdf.text(startBarcode, pageWidth / 2 - 15, yPos);
  
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(51, 65, 85);
  pdf.text("to", pageWidth / 2 + 30, yPos);
  
  pdf.setFont("courier", "bold");
  pdf.setTextColor(37, 99, 235);
  pdf.text(endBarcode, pageWidth / 2 + 45, yPos);

  // Generate QR code for verification
  const verificationUrl = data.verificationUrl || `https://barcodemine.com/gepir?barcode=${startBarcode}`;
  const qrCodeDataUrl = await generateQRCodeDataUrl(verificationUrl);
  
  // Add QR code to PDF (left side)
  if (qrCodeDataUrl) {
    pdf.addImage(qrCodeDataUrl, "PNG", margin + 15, yPos - 15, 30, 30);
  }

  // Horizontal divider line
  yPos += 15;
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.3);
  pdf.line(margin + 20, yPos, pageWidth - margin - 20, yPos);

  // Left side - GTINs info section
  yPos += 10;
  const leftColX = margin + 20;
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(30, 58, 138);
  pdf.text("GTINs assigned for use in creating GS1", leftColX, yPos);
  yPos += 5;
  pdf.text("Identification Numbers", leftColX, yPos);

  yPos += 8;
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(71, 85, 105);
  
  const gtinTypes = [
    "• Universal Product Code (UPC / GTIN-12)",
    "• European Article Number (EAN / GTIN-13)",
    "• Shipping Container Code (SCC / GTIN-14)",
    "• Global Location Number (GLN)",
  ];
  
  gtinTypes.forEach((type, index) => {
    pdf.text(type, leftColX, yPos + index * 5);
  });

  // Right side - Account details
  const rightColX = pageWidth / 2 + 20;
  let rightY = yPos - 13;
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(51, 65, 85);
  
  // Account Number
  pdf.text("Account Number:", rightColX, rightY);
  pdf.setFont("helvetica", "normal");
  pdf.text(data.accountNumber || data.certificateNumber.replace("CERT-", ""), rightColX + 40, rightY);

  // GTIN Coordinator
  rightY += 8;
  pdf.setFont("helvetica", "bold");
  pdf.text("GTIN Coordinator:", rightColX, rightY);
  pdf.setFont("helvetica", "normal");
  pdf.text(data.contactName || "BarCodeMine Team", rightColX + 40, rightY);

  // Order Number
  rightY += 8;
  pdf.setFont("helvetica", "bold");
  pdf.text("Order Number:", rightColX, rightY);
  pdf.setFont("helvetica", "normal");
  const orderNumber = data.orderId ? `BM${data.orderId.substring(0, 5).toUpperCase()}` : `BM${data.certificateNumber.replace("CERT-", "")}`;
  pdf.text(orderNumber, rightColX + 40, rightY);

  // Issued Date
  rightY += 8;
  pdf.setFont("helvetica", "bold");
  pdf.text("Issued Date:", rightColX, rightY);
  pdf.setFont("helvetica", "normal");
  pdf.text(data.issueDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }), rightColX + 40, rightY);

  // Footer section
  const footerY = pageHeight - margin - 15;
  
  // Footer background
  pdf.setFillColor(31, 41, 55);
  pdf.rect(margin + 4, footerY - 5, pageWidth - margin * 2 - 8, 18, "F");

  // Footer text
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(255, 255, 255);
  pdf.text("BARCODEMINE.com", margin + 20, footerY + 5);

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.text("ContactUs@BarCodeMine.com", margin + 80, footerY + 5);

  // Certification statement
  pdf.setFontSize(7);
  pdf.text(
    "BarcodeMine hereby certifies the uniqueness of, as well as, assigns and transfers,",
    pageWidth - margin - 100,
    footerY + 2
  );
  pdf.text(
    "the Global Trade Item Number (GTIN) range listed above to the Certificate Holder.",
    pageWidth - margin - 100,
    footerY + 7
  );

  // Save the PDF
  const fileName = `${data.certificateNumber}_certificate.pdf`;
  pdf.save(fileName);
}
