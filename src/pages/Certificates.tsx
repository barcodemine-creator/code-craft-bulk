import { motion } from "framer-motion";
import { Award, Download, FileText, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrders } from "@/hooks/useOrders";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { generateCertificatePDF } from "@/lib/certificate-utils";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

export default function Certificates() {
  const { data: orders = [], isLoading } = useOrders();
  const { data: profile } = useProfile();
  
  const completedOrders = orders.filter((o) => o.status === "completed");

  const handleDownloadCertificate = async (order: typeof orders[0]) => {
    try {
      const accountNumber = order.certificate_number?.replace("CERT-", "") || order.id.slice(0, 5).toUpperCase();
      const verificationUrl = `${window.location.origin}/gepir?barcode=${order.start_number}`;
      
      await generateCertificatePDF({
        certificateNumber: order.certificate_number || order.id.slice(0, 12).toUpperCase(),
        companyName: profile?.company_name || "Your Company",
        contactName: profile?.contact_name || "",
        barcodes: [order.start_number, order.end_number],
        barcodeType: order.barcode_type,
        issueDate: new Date(order.completed_at || order.created_at),
        quantity: order.quantity,
        accountNumber: accountNumber,
        orderId: order.id,
        verificationUrl: verificationUrl,
      });
      toast.success("Certificate downloaded!");
    } catch (error) {
      toast.error("Failed to generate certificate");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-foreground">Certificates</h1>
          <p className="text-muted-foreground mt-1">
            Download your Certificate of GTIN Assignment for each completed order.
          </p>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="surface-card p-6 border-l-4 border-l-primary"
        >
          <div className="flex items-start gap-4">
            <Award className="w-8 h-8 text-primary flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                Certificate of GTIN Assignment
              </h3>
              <p className="text-sm text-muted-foreground">
                Each certificate serves as official proof that you own the assigned barcode numbers. 
                Present these certificates to retailers, marketplaces (like Amazon), and distributors 
                to verify your barcode ownership.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Certificates List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : completedOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="surface-card p-12 text-center"
          >
            <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No certificates yet
            </h2>
            <p className="text-muted-foreground mb-6">
              Complete a barcode purchase to receive your Certificate of GTIN Assignment.
            </p>
            <Button onClick={() => window.location.href = "/buy"}>
              Buy Barcodes
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {completedOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="surface-card p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Award className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        Certificate #{order.certificate_number || order.id.slice(0, 8).toUpperCase()}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {order.quantity} × {order.barcode_type} barcodes
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Issued on {new Date(order.completed_at || order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <Button onClick={() => handleDownloadCertificate(order)}>
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
