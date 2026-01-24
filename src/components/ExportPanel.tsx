import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Copy,
  Check,
  FileArchive,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { exportAsZip, copyToClipboard, type ExportProgress } from "@/lib/export-utils";
import type { BarcodeType } from "@/lib/barcode-utils";

interface ExportPanelProps {
  barcodes: string[];
  type: BarcodeType;
}

export function ExportPanel({ barcodes, type }: ExportPanelProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [copied, setCopied] = useState(false);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    setProgress({ current: 0, total: barcodes.length + 2, phase: "generating" });

    try {
      await exportAsZip(barcodes, type, setProgress);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
      setProgress(null);
    }
  }, [barcodes, type]);

  const handleCopy = useCallback(async () => {
    await copyToClipboard(barcodes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [barcodes]);

  const progressPercentage = progress
    ? Math.round((progress.current / progress.total) * 100)
    : 0;

  const getProgressLabel = () => {
    if (!progress) return "";
    switch (progress.phase) {
      case "generating":
        return `Generating images... (${progress.current}/${progress.total})`;
      case "packaging":
        return "Creating ZIP archive...";
      case "complete":
        return "Complete!";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Export Options</h3>
          <p className="text-sm text-muted-foreground">
            {barcodes.length} barcodes ready
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isExporting && progress && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-sm text-muted-foreground text-center">
              {getProgressLabel()}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          onClick={handleCopy}
          disabled={isExporting}
          className="h-12"
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.span
                key="copied"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex items-center gap-2 text-success"
              >
                <Check className="w-4 h-4" />
                Copied!
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy All
              </motion.span>
            )}
          </AnimatePresence>
        </Button>

        <Button
          onClick={handleExport}
          disabled={isExporting}
          className="h-12"
        >
          {isExporting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Exporting...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <FileArchive className="w-4 h-4" />
              Download ZIP
            </span>
          )}
        </Button>
      </div>

      <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
        <p className="text-xs text-muted-foreground text-center">
          ZIP includes: JPG, SVG, Excel, and PDF files
        </p>
      </div>
    </div>
  );
}
