import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, ShoppingCart, Barcode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useBarcodePacks, BarcodePack } from "@/hooks/useBarcodePacks";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { toast } from "sonner";

export default function BuyBarcodes() {
  const [selectedType, setSelectedType] = useState<"UPC-A" | "EAN-13">("UPC-A");
  const [selectedPack, setSelectedPack] = useState<BarcodePack | null>(null);
  const { data: packs = [], isLoading } = useBarcodePacks(selectedType);
  const navigate = useNavigate();

  const handlePurchase = () => {
    if (!selectedPack) {
      toast.error("Please select a barcode pack");
      return;
    }
    
    // Navigate to checkout with selected pack
    navigate("/checkout", { state: { pack: selectedPack } });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-foreground">Buy Barcodes</h1>
          <p className="text-muted-foreground mt-1">
            Choose your barcode type and select a pack that fits your needs.
          </p>
        </motion.div>

        {/* Barcode Type Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-4"
        >
          <button
            onClick={() => {
              setSelectedType("UPC-A");
              setSelectedPack(null);
            }}
            className={`flex-1 p-4 rounded-xl border-2 transition-all ${
              selectedType === "UPC-A"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <Barcode className="w-8 h-8 text-primary" />
              <div className="text-left">
                <h3 className="font-semibold text-foreground">UPC-A</h3>
                <p className="text-sm text-muted-foreground">
                  12-digit • USA & Canada
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              setSelectedType("EAN-13");
              setSelectedPack(null);
            }}
            className={`flex-1 p-4 rounded-xl border-2 transition-all ${
              selectedType === "EAN-13"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <Barcode className="w-8 h-8 text-primary" />
              <div className="text-left">
                <h3 className="font-semibold text-foreground">EAN-13</h3>
                <p className="text-sm text-muted-foreground">
                  13-digit • International
                </p>
              </div>
            </div>
          </button>
        </motion.div>

        {/* Packs Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Select a Pack
          </h2>

          {isLoading ? (
            <div className="grid md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {packs.map((pack, index) => {
                const isSelected = selectedPack?.id === pack.id;
                const pricePerBarcode = (pack.price / pack.quantity).toFixed(2);
                
                return (
                  <motion.button
                    key={pack.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    onClick={() => setSelectedPack(pack)}
                    className={`p-6 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-foreground">{pack.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {pack.quantity} barcode{pack.quantity > 1 ? "s" : ""}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="mb-4">
                      <span className="text-3xl font-bold text-foreground">
                        ${pack.price.toFixed(2)}
                      </span>
                      <span className="text-muted-foreground text-sm ml-2">
                        (${pricePerBarcode}/each)
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {pack.description}
                    </p>
                  </motion.button>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* What's Included */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="surface-card p-6"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">
            What's Included
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              "Certificate of GTIN Assignment",
              "EPS & SVG Vector Graphics",
              "High-Resolution JPG Files",
              "Excel & PDF Spreadsheets",
              "GEPIR Database Registration",
              "Lifetime Ownership - No Renewal Fees",
              "Works on Amazon & All Retailers",
              "24/7 Download Access",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-sm text-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Purchase Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-end"
        >
          <Button
            size="lg"
            onClick={handlePurchase}
            disabled={!selectedPack}
            className="px-8"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Continue to Checkout
            {selectedPack && ` - $${selectedPack.price.toFixed(2)}`}
          </Button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
