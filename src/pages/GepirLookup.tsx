import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Building2, MapPin, Calendar, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useGepirSearch, GepirEntry } from "@/hooks/useGepirRegistry";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export default function GepirLookup() {
  const [searchTerm, setSearchTerm] = useState("");
  const [submittedTerm, setSubmittedTerm] = useState("");
  const { data: results = [], isLoading } = useGepirSearch(submittedTerm);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.length >= 5) {
      setSubmittedTerm(searchTerm);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-foreground">GEPIR Lookup</h1>
          <p className="text-muted-foreground mt-1">
            Search our barcode registry to find the company registered to a GTIN/UPC/EAN.
          </p>
        </motion.div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="surface-card p-6"
        >
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter barcode number (minimum 5 digits)"
                className="pl-10 h-12 font-mono text-lg"
              />
            </div>
            <Button type="submit" size="lg" disabled={searchTerm.length < 5}>
              Search Registry
            </Button>
          </form>
          <p className="text-sm text-muted-foreground mt-3">
            Enter a full or partial barcode number to search. The search matches from the beginning of the barcode.
          </p>
        </motion.div>

        {/* Results */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : submittedTerm && results.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="surface-card p-12 text-center"
          >
            <Search className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No results found
            </h2>
            <p className="text-muted-foreground">
              No registered barcodes matching "{submittedTerm}" were found in our database.
            </p>
          </motion.div>
        ) : results.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h2 className="text-lg font-semibold text-foreground">
              Found {results.length} result{results.length !== 1 ? "s" : ""}
            </h2>
            
            {results.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="surface-card p-6"
              >
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-8 h-8 text-primary" />
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div>
                      <p className="font-mono text-lg font-semibold text-foreground">
                        {entry.barcode_number}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {entry.barcode_type}
                      </p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{entry.company_name}</span>
                      </div>
                      
                      {entry.company_contact && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Contact: {entry.company_contact}</span>
                        </div>
                      )}
                      
                      {entry.country && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Globe className="w-4 h-4" />
                          <span>{entry.country}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Registered {new Date(entry.registration_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : null}

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="surface-card p-6"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">
            About GEPIR
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            GEPIR (Global Electronic Party Information Registry) is a database of companies 
            that have registered their barcode numbers. This service allows retailers, 
            marketplaces, and other parties to verify barcode ownership and contact information. 
            When you purchase barcodes from BarcodeMine, your company is automatically registered 
            in our GEPIR-style database.
          </p>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
