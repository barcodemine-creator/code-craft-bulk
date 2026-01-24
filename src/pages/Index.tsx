import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/Header";
import { GeneratorForm } from "@/components/GeneratorForm";
import { BarcodePreview } from "@/components/BarcodePreview";
import { ExportPanel } from "@/components/ExportPanel";
import type { BarcodeType } from "@/lib/barcode-utils";
import { FileBarChart, Shield, Zap, Package } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "GS1 Compliant",
    description: "Official modulo-10 checksum algorithms",
  },
  {
    icon: FileBarChart,
    title: "Multiple Formats",
    description: "JPG, SVG, Excel & PDF exports",
  },
  {
    icon: Zap,
    title: "Instant Generation",
    description: "Up to 1000 barcodes per batch",
  },
  {
    icon: Package,
    title: "Bulk Download",
    description: "All formats in one ZIP file",
  },
];

export default function Index() {
  const [barcodes, setBarcodes] = useState<string[]>([]);
  const [barcodeType, setBarcodeType] = useState<BarcodeType>("UPC-A");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = useCallback(
    (codes: string[], type: BarcodeType) => {
      setIsGenerating(true);
      setBarcodes([]);
      setBarcodeType(type);

      // Simulate processing time for better UX
      setTimeout(() => {
        setBarcodes(codes);
        setIsGenerating(false);
      }, 300);
    },
    []
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Generate{" "}
            <span className="text-gradient">UPC-A & EAN-13</span>{" "}
            Barcodes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Professional bulk barcode generation with automatic checksum calculation.
            Export as JPG, SVG, Excel, or PDF.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="surface-card p-4 text-center"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-1">
                {feature.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Generator Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-4"
          >
            <div className="surface-elevated p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-foreground mb-6">
                Generator Settings
              </h2>
              <GeneratorForm
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
              />

              {/* Export Panel */}
              <AnimatePresence>
                {barcodes.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 pt-6 border-t border-border"
                  >
                    <ExportPanel barcodes={barcodes} type={barcodeType} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Preview Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-8"
          >
            <div className="surface-elevated p-6 min-h-[400px]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">
                  Preview
                </h2>
                {barcodes.length > 0 && (
                  <span className="text-sm text-muted-foreground">
                    Showing {Math.min(barcodes.length, 50)} of {barcodes.length}
                  </span>
                )}
              </div>

              <AnimatePresence mode="wait">
                {barcodes.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-16 text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Package className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      No Barcodes Yet
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Configure your settings and click "Generate Barcodes" to create
                      your batch.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                  >
                    {barcodes.slice(0, 50).map((code, index) => (
                      <BarcodePreview
                        key={code}
                        code={code}
                        type={barcodeType}
                        index={index}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {barcodes.length > 50 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-sm text-muted-foreground mt-6"
                >
                  + {barcodes.length - 50} more barcodes (all included in
                  download)
                </motion.p>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Generate standards-compliant UPC-A and EAN-13 barcodes for commercial use.
          </p>
        </div>
      </footer>
    </div>
  );
}
