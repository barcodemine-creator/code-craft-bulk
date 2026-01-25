import { jsPDF } from "jspdf";

interface CertificateData {
  certificateNumber: string;
  companyName: string;
  contactName: string;
  barcodes: string[];
  barcodeType: "UPC-A" | "EAN-13";
  issueDate: Date;
  quantity: number;
}

export async function generateCertificatePDF(data: CertificateData): Promise<void> {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;

  // Background
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, pageWidth, pageHeight, "F");

  // Border
  pdf.setDrawColor(59, 130, 246);
  pdf.setLineWidth(2);
  pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);

  // Inner decorative border
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.5);
  pdf.rect(15, 15, pageWidth - 30, pageHeight - 30);

  // Header
  pdf.setFontSize(28);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(30, 64, 175);
  pdf.text("CERTIFICATE", pageWidth / 2, 45, { align: "center" });
  
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(100, 100, 100);
  pdf.text("of GTIN Assignment", pageWidth / 2, 55, { align: "center" });

  // Decorative line
  pdf.setDrawColor(59, 130, 246);
  pdf.setLineWidth(1);
  pdf.line(60, 65, pageWidth - 60, 65);

  // Certificate Number
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Certificate No: ${data.certificateNumber}`, pageWidth / 2, 75, { align: "center" });

  // Main Content
  let yPos = 95;

  pdf.setFontSize(12);
  pdf.setTextColor(60, 60, 60);
  pdf.text("This is to certify that", pageWidth / 2, yPos, { align: "center" });

  yPos += 15;
  pdf.setFontSize(20);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(30, 30, 30);
  pdf.text(data.companyName || "Company Name", pageWidth / 2, yPos, { align: "center" });

  if (data.contactName) {
    yPos += 10;
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(80, 80, 80);
    pdf.text(`(${data.contactName})`, pageWidth / 2, yPos, { align: "center" });
  }

  yPos += 15;
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(60, 60, 60);
  pdf.text("has been assigned the following Global Trade Item Numbers (GTINs):", pageWidth / 2, yPos, { align: "center" });

  // Barcode Type
  yPos += 15;
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(59, 130, 246);
  pdf.text(`${data.barcodeType} Barcodes`, pageWidth / 2, yPos, { align: "center" });

  // Barcode Range Box
  yPos += 10;
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(200, 200, 200);
  pdf.roundedRect(margin + 20, yPos, pageWidth - margin * 2 - 40, 35, 3, 3, "FD");

  yPos += 12;
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text("Assigned Range:", pageWidth / 2, yPos, { align: "center" });

  yPos += 12;
  pdf.setFontSize(16);
  pdf.setFont("courier", "bold");
  pdf.setTextColor(30, 30, 30);
  const rangeText = data.barcodes.length === 2 
    ? `${data.barcodes[0]} - ${data.barcodes[1]}`
    : data.barcodes.join(", ");
  pdf.text(rangeText, pageWidth / 2, yPos, { align: "center" });

  yPos += 8;
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(100, 100, 100);
  pdf.text(`(${data.quantity} barcode${data.quantity > 1 ? "s" : ""})`, pageWidth / 2, yPos, { align: "center" });

  // Features
  yPos += 25;
  const features = [
    "✓ Lifetime ownership with no renewal fees",
    "✓ Works on Amazon, retail stores, and all marketplaces",
    "✓ Registered in BarcodeMine GEPIR database",
    "✓ GS1-compliant check digit calculation",
  ];

  pdf.setFontSize(10);
  pdf.setTextColor(60, 60, 60);
  features.forEach((feature, index) => {
    pdf.text(feature, pageWidth / 2, yPos + (index * 7), { align: "center" });
  });

  yPos += 40;

  // Issue Date
  pdf.setFontSize(11);
  pdf.setTextColor(80, 80, 80);
  pdf.text(`Issue Date: ${data.issueDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })}`, pageWidth / 2, yPos, { align: "center" });

  // Signature Area
  yPos += 25;
  
  // Signature line
  pdf.setDrawColor(150, 150, 150);
  pdf.setLineWidth(0.5);
  pdf.line(pageWidth / 2 - 40, yPos, pageWidth / 2 + 40, yPos);
  
  yPos += 6;
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text("Authorized Signature", pageWidth / 2, yPos, { align: "center" });

  yPos += 6;
  pdf.setFontSize(9);
  pdf.text("BarcodeMine.com", pageWidth / 2, yPos, { align: "center" });

  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.text(
    "This certificate is issued by BarcodeMine.com and serves as proof of GTIN ownership.",
    pageWidth / 2,
    pageHeight - 25,
    { align: "center" }
  );
  pdf.text(
    "For verification, visit our GEPIR registry at barcodemine.com/gepir",
    pageWidth / 2,
    pageHeight - 20,
    { align: "center" }
  );

  // Save
  pdf.save(`Certificate_${data.certificateNumber}.pdf`);
}
