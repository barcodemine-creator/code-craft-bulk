import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarcodeTypeSelector } from "./BarcodeTypeSelector";
import {
  type BarcodeType,
  validateBaseNumber,
  generateBarcodeSequence,
} from "@/lib/barcode-utils";

interface GeneratorFormProps {
  onGenerate: (barcodes: string[], type: BarcodeType) => void;
  isGenerating: boolean;
}

export function GeneratorForm({ onGenerate, isGenerating }: GeneratorFormProps) {
  const [type, setType] = useState<BarcodeType>("UPC-A");
  const [baseNumber, setBaseNumber] = useState("07920579974");
  const [quantity, setQuantity] = useState("20");
  const [error, setError] = useState<string | null>(null);

  const expectedLength = type === "UPC-A" ? 11 : 12;

  const handleGenerate = useCallback(() => {
    setError(null);

    // Validate base number
    const validation = validateBaseNumber(baseNumber, type);
    if (!validation.valid) {
      setError(validation.error || "Invalid base number");
      return;
    }

    // Validate quantity
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) {
      setError("Quantity must be at least 1");
      return;
    }
    if (qty > 1000) {
      setError("Maximum quantity is 1000 barcodes per batch");
      return;
    }

    try {
      const barcodes = generateBarcodeSequence(baseNumber, qty, type);
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
        <BarcodeTypeSelector value={type} onChange={setType} />
      </div>

      <div className="space-y-3">
        <Label
          htmlFor="baseNumber"
          className="text-sm font-medium text-foreground"
        >
          Starting Base Number ({expectedLength} digits)
        </Label>
        <Input
          id="baseNumber"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={baseNumber}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "");
            if (value.length <= expectedLength) {
              setBaseNumber(value);
            }
          }}
          placeholder={`Enter ${expectedLength} digits`}
          className="font-mono text-lg tracking-wider h-12"
        />
        <p className="text-xs text-muted-foreground">
          The check digit will be calculated automatically
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
