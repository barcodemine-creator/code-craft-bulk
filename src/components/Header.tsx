import { motion } from "framer-motion";
import { Barcode } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Barcode className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">BarcodeMine</h1>
            <p className="text-xs text-muted-foreground">
              Professional Barcode Generator
            </p>
          </div>
        </motion.div>
      </div>
    </header>
  );
}
