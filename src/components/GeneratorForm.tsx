import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarcodeTypeSelector } from "./BarcodeTypeSelector";
import {
  type BarcodeType,
  BARCODE_SPECS,
  validateBaseNumber,
  generateBarcodeSequence,
} from "@/lib/barcode-utils";

interface GeneratorFormProps {
  onGenerate: (barcodes: string[], type: BarcodeType) => void;
  isGenerating: boolean;
}

export function GeneratorForm({ onGenerate, isGenerating }: GeneratorFormProps) {
  const [type, setType] = useState<BarcodeType>("EAN-13");
  const [baseNumber, setBaseNumber] = useState("0718852675153");
  const [quantity, setQuantity] = useState("20");
  const [error, setError] = useState<string | null>(null);

  const { baseLength, fullLength } = BARCODE_SPECS[type];

  // Reset default value when switching type so it fits
  const handleTypeChange = (newType: BarcodeType) => {
    setType(newType);
    setError(null);
    const defaults: Record<BarcodeType, string> = {
      "EAN-13": "0718852675153",
      "UPC-A": "079205799742",
      "EAN-8": "12345670",
      "Code 128": "000123456789",
    };
    setBaseNumber(defaults[newType]);
  };

  const handleBaseNumberChange = (value: string) => {
    const barcodeValue = String(value);
    const cleaned = type === "Code 128" ? barcodeValue : barcodeValue.replace(/\D/g, "");
    if (fullLength === null || cleaned.length <= fullLength) setBaseNumber(cleaned);
  };

  const handleGenerate = useCallback(() => {
    setError(null);

    const barcodeValue = String(baseNumber).trim();
    const validation = validateBaseNumber(barcodeValue, type);
    if (!validation.valid) {
      setError(validation.error || "Invalid base number");
      return;
    }

    const qty = Number(quantity);
    if (isNaN(qty) || qty < 1) {
      setError("Quantity must be at least 1");
      return;
    }
    if (qty > 1000) {
      setError("Maximum quantity is 1000 barcodes per batch");
      return;
    }

    try {
      const barcodes = generateBarcodeSequence(barcodeValue, qty, type);
      onGenerate(barcodes, type);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    }
  }, [baseNumber, quantity, type, onGenerate]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">
          Barcode Type
        </Label>
        <BarcodeTypeSelector value={type} onChange={handleTypeChange} />
      </div>

      <div className="space-y-3">
        <Label
          htmlFor="baseNumber"
          className="text-sm font-medium text-foreground"
        >
          {type === "Code 128" ? "Starting Value" : `Starting Number (${baseLength} or ${fullLength} digits)`}
        </Label>
        <Input
          key={type}
          id="baseNumber"
          type="text"
          inputMode={type === "Code 128" ? "text" : "numeric"}
          pattern={type === "Code 128" ? undefined : "[0-9]*"}
          maxLength={fullLength ?? 80}
          value={baseNumber}
          onChange={(e) => handleBaseNumberChange(e.target.value)}
          placeholder={type === "Code 128" ? "Enter a value" : `Enter ${baseLength} or ${fullLength} digits`}
          className="font-mono text-lg tracking-wider h-12"
        />
        <p className="text-xs text-muted-foreground">
          {type === "Code 128"
            ? "Values stay as text; numeric values can be generated as a sequence."
            : `Enter ${baseLength} base digits to calculate the check digit, or ${fullLength} complete digits to validate it.`}
        </p>
      </div>


      <div className="space-y-3">
        <Label htmlFor="quantity" className="text-sm font-medium text-foreground">
          Quantity to Generate
        </Label>
        <Input
          id="quantity"
          type="number"
          min="1"
          max="1000"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Number of barcodes"
          className="h-12"
        />
        <p className="text-xs text-muted-foreground">
          Maximum 1000 barcodes per batch
        </p>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full h-12 text-base font-medium btn-shine"
        size="lg"
      >
        {isGenerating ? (
          <motion.span
            className="flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-5 h-5" />
            </motion.span>
            Generating...
          </motion.span>
        ) : (
          <span className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Generate Barcodes
          </span>
        )}
      </Button>
    </div>
  );
}
