import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";
import { motion } from "framer-motion";
import type { BarcodeType } from "@/lib/barcode-utils";

interface BarcodePreviewProps {
  code: string;
  type: BarcodeType;
  index: number;
}

export function BarcodePreview({ code, type, index }: BarcodePreviewProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current) {
      JsBarcode(svgRef.current, code, {
        format: type === "UPC-A" ? "upc" : "ean13",
        width: 1.5,
        height: 60,
        displayValue: true,
        fontSize: 12,
        margin: 8,
        background: "#ffffff",
        lineColor: "#000000",
      });
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
    </motion.div>
  );
}
