import { motion } from "framer-motion";
import type { BarcodeType } from "@/lib/barcode-utils";

interface BarcodeTypeSelectorProps {
  value: BarcodeType;
  onChange: (type: BarcodeType) => void;
}

export function BarcodeTypeSelector({
  value,
  onChange,
}: BarcodeTypeSelectorProps) {
  const options: { type: BarcodeType; label: string; digits: string }[] = [
    { type: "EAN-13", label: "EAN-13", digits: "13 digits" },
    { type: "UPC-A", label: "UPC-A", digits: "12 digits" },
    { type: "EAN-8", label: "EAN-8", digits: "8 digits" },
    { type: "Code 128", label: "Code 128", digits: "Variable length" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((option) => (
        <motion.button
          type="button"
          key={option.type}
          onClick={() => onChange(option.type)}
          className={`relative p-4 rounded-lg border-2 transition-all duration-200 text-left ${
            value === option.type
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 bg-card"
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {value === option.type && (
            <motion.div
              layoutId="selector-indicator"
              className="absolute inset-0 rounded-lg border-2 border-primary"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <div className="relative z-10">
            <div className="font-semibold text-foreground">{option.label}</div>
            <div className="text-sm text-muted-foreground">{option.digits}</div>
          </div>
        </motion.button>
      ))}
    </div>
  );
}
