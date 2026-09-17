import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Download, Eye, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrders, useOrderBarcodes, Order } from "@/hooks/useOrders";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { exportAsZip } from "@/lib/export-utils";
import { generateBarcodeSequence } from "@/lib/barcode-utils";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Orders() {
  const { data: orders = [], isLoading } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);

  const { data: barcodes = [] } = useOrderBarcodes(selectedOrder?.id ?? null);

  const handleExport = async (order: Order) => {
    setExporting(order.id);
    try {
      const barcodeNumbers = generateBarcodeSequence(
        String(order.start_number),
        order.quantity,
        order.barcode_type,
      );

      await exportAsZip(barcodeNumbers, order.barcode_type);
      toast.success("Download started!");
    } catch (error) {
      toast.error("Failed to export barcodes");
    } finally {
      setExporting(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-foreground">My Orders</h1>
          <p className="text-muted-foreground mt-1">
            View your order history and download your barcodes.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="surface-card p-12 text-center"
          >
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No orders yet
            </h2>
            <p className="text-muted-foreground mb-6">
              Your orders will appear here after you purchase barcode packs.
            </p>
            <Button onClick={() => window.location.href = "/buy"}>
              Buy Barcodes
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="surface-card p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-foreground">
                        Order #{order.id.slice(0, 8)}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          order.status === "completed"
                            ? "bg-green-500/10 text-green-500"
                            : order.status === "paid"
                            ? "bg-blue-500/10 text-blue-500"
                            : order.status === "refunded"
                            ? "bg-red-500/10 text-red-500"
                            : "bg-yellow-500/10 text-yellow-500"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.quantity} × {order.barcode_type} barcodes
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Range: {order.start_number} - {order.end_number}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()} at{" "}
                      {new Date(order.created_at).toLocaleTimeString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold text-foreground mr-4">
                      ${order.total_amount.toFixed(2)}
                    </p>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>

                    {order.status === "completed" && (
                      <Button
                        size="sm"
                        onClick={() => handleExport(order)}
                        disabled={exporting === order.id}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        {exporting === order.id ? "Exporting..." : "Download"}
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Order Details Dialog */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
            </DialogHeader>
            
            {selectedOrder && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Order ID</p>
                    <p className="font-mono text-sm">{selectedOrder.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium capitalize">{selectedOrder.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-medium">{selectedOrder.barcode_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Quantity</p>
                    <p className="font-medium">{selectedOrder.quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Start Number</p>
                    <p className="font-mono">{selectedOrder.start_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">End Number</p>
                    <p className="font-mono">{selectedOrder.end_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="font-bold">${selectedOrder.total_amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Certificate</p>
                    <p className="font-mono text-sm">
                      {selectedOrder.certificate_number || "Pending"}
                    </p>
                  </div>
                </div>

                {barcodes.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Barcode Numbers</h4>
                    <div className="max-h-48 overflow-auto bg-muted/50 rounded-lg p-3">
                      <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                        {barcodes.map((bc) => (
                          <span key={bc.id}>{bc.barcode_number}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
