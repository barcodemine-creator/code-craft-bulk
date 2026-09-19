import { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";
import { BARCODE_SPECS, type BarcodeType } from "@/lib/barcode-utils";

interface BarcodePreviewProps {
  code: string;
  type: BarcodeType;
  index: number;
}

export function BarcodePreview({ code, type, index }: BarcodePreviewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [verification, setVerification] = useState<"checking" | "verified" | "normalized" | "failed">("checking");

  useEffect(() => {
    const svg = svgRef.current;
    if (svg) {
      setVerification("checking");
      JsBarcode(svg, String(code), {
        format: BARCODE_SPECS[type].format,
        width: 1.5,
        height: 60,
        displayValue: true,
        flat: false,
        fontSize: 12,
        margin: 8,
        // Wider quiet zones so scanners read the full EAN-13 symbol
        marginLeft: type === "EAN-13" ? 24 : 12,
        marginRight: type === "EAN-13" ? 20 : 12,
        background: "#ffffff",
        lineColor: "#000000",
      });

      const verify = async () => {
        let url: string | undefined;
        try {
          const image = new Image();
          const svgData = new XMLSerializer().serializeToString(svg);
          url = URL.createObjectURL(new Blob([svgData], { type: "image/svg+xml" }));
          await new Promise<void>((resolve, reject) => {
            image.onload = () => resolve();
            image.onerror = () => reject(new Error("Barcode image could not be loaded"));
            image.src = url ?? "";
          });

          const canvas = document.createElement("canvas");
          canvas.width = Math.max(image.width * 3, 900);
          canvas.height = Math.max(image.height * 3, 360);
          const context = canvas.getContext("2d");
          if (!context) throw new Error("Barcode verification canvas is unavailable");
          context.fillStyle = "#ffffff";
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.drawImage(image, 0, 0, canvas.width, canvas.height);

          const formats: Record<BarcodeType, BarcodeFormat> = {
            "EAN-13": BarcodeFormat.EAN_13,
            "UPC-A": BarcodeFormat.UPC_A,
          };
          const hints = new Map<DecodeHintType, unknown>();
          hints.set(DecodeHintType.POSSIBLE_FORMATS, [formats[type]]);
          const result = new BrowserMultiFormatReader(hints).decodeFromCanvas(canvas);
          const decoded = result.getText();
          const decodedType = result.getBarcodeFormat();
          if (decoded === code && decodedType === formats[type]) setVerification("verified");
          else if (type === "EAN-13" && code.startsWith("0") && decoded === code.slice(1)) setVerification("normalized");
          else setVerification("failed");
        } catch {
          setVerification("failed");
        } finally {
          if (url) URL.revokeObjectURL(url);
        }
      };
      void verify();
    }
  }, [code, type]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02, duration: 0.2 }}
      className="barcode-preview flex flex-col items-center"
    >
      <svg ref={svgRef} className="max-w-full" />
      <p className="font-mono text-xs text-foreground" aria-label={`Encoded value ${code}`}>{code}</p>
      <div className={`mt-2 flex items-center gap-1 text-[11px] ${verification === "verified" ? "text-success" : "text-muted-foreground"}`}>
        {verification === "verified" ? <CheckCircle2 className="h-3 w-3" /> : verification !== "checking" ? <AlertTriangle className="h-3 w-3" /> : null}
        <span>
          {verification === "checking" && `Verifying ${type}…`}
          {verification === "verified" && `Verified ${type}`}
          {verification === "normalized" && "Scanner normalized to UPC-A; review scanner settings"}
          {verification === "failed" && `${type} verification unavailable`}
        </span>
      </div>
    </motion.div>
  );
}
