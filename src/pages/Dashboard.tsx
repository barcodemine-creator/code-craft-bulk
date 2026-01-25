import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Package, 
  FileText, 
  Download, 
  Settings,
  ShoppingCart,
  BarChart3,
  Award,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/hooks/useOrders";
import { useProfile } from "@/hooks/useProfile";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { data: orders = [] } = useOrders();
  const { data: profile } = useProfile();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const completedOrders = orders.filter((o) => o.status === "completed");
  const totalBarcodes = completedOrders.reduce((sum, o) => sum + o.quantity, 0);

  const stats = [
    {
      title: "Total Orders",
      value: orders.length,
      icon: ShoppingCart,
      color: "text-blue-500",
    },
    {
      title: "Total Barcodes",
      value: totalBarcodes,
      icon: Package,
      color: "text-green-500",
    },
    {
      title: "Certificates",
      value: completedOrders.length,
      icon: Award,
      color: "text-purple-500",
    },
    {
      title: "This Month",
      value: orders.filter(
        (o) =>
          new Date(o.created_at).getMonth() === new Date().getMonth()
      ).length,
      icon: BarChart3,
      color: "text-orange-500",
    },
  ];

  const quickActions = [
    {
      title: "Buy Barcodes",
      description: "Purchase UPC-A or EAN-13 barcode packs",
      icon: ShoppingCart,
      href: "/buy",
    },
    {
      title: "My Orders",
      description: "View your order history and download barcodes",
      icon: FileText,
      href: "/orders",
    },
    {
      title: "Certificates",
      description: "Download your GTIN assignment certificates",
      icon: Award,
      href: "/certificates",
    },
    {
      title: "GEPIR Lookup",
      description: "Search the barcode registry database",
      icon: Search,
      href: "/gepir",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {profile?.contact_name || profile?.company_name || "User"}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your barcodes and certificates from your dashboard.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {stats.map((stat, index) => (
            <div
              key={stat.title}
              className="surface-card p-4"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.title}
                onClick={() => navigate(action.href)}
                className="surface-card p-4 text-left hover:border-primary/50 transition-colors"
              >
                <action.icon className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-semibold text-foreground">{action.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {action.description}
                </p>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Orders</h2>
            <Button variant="outline" size="sm" onClick={() => navigate("/orders")}>
              View All
            </Button>
          </div>

          {orders.length === 0 ? (
            <div className="surface-card p-8 text-center">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No orders yet</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Purchase your first barcode pack to get started
              </p>
              <Button onClick={() => navigate("/buy")}>Buy Barcodes</Button>
            </div>
          ) : (
            <div className="surface-card overflow-hidden">
              <table className="w-full">
                <thead className="border-b border-border">
                  <tr className="text-left">
                    <th className="p-4 text-sm font-medium text-muted-foreground">Order ID</th>
                    <th className="p-4 text-sm font-medium text-muted-foreground">Type</th>
                    <th className="p-4 text-sm font-medium text-muted-foreground">Quantity</th>
                    <th className="p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="p-4 text-sm font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order.id} className="border-b border-border last:border-0">
                      <td className="p-4 font-mono text-sm">{order.id.slice(0, 8)}...</td>
                      <td className="p-4">{order.barcode_type}</td>
                      <td className="p-4">{order.quantity}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === "completed"
                              ? "bg-green-500/10 text-green-500"
                              : order.status === "paid"
                              ? "bg-blue-500/10 text-blue-500"
                              : "bg-yellow-500/10 text-yellow-500"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground text-sm">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
