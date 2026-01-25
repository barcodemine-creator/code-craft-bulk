import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Barcode, 
  LayoutDashboard, 
  ShoppingCart, 
  FileText, 
  Award, 
  Search, 
  Settings, 
  LogOut,
  Shield,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Buy Barcodes", href: "/buy", icon: ShoppingCart },
  { name: "My Orders", href: "/orders", icon: FileText },
  { name: "Certificates", href: "/certificates", icon: Award },
  { name: "GEPIR Lookup", href: "/gepir", icon: Search },
  { name: "Profile", href: "/profile", icon: User },
];

const adminNavigation = [
  { name: "Admin Panel", href: "/admin", icon: Shield },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card/50 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Barcode className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-foreground">BarcodeMine</h1>
              <p className="text-xs text-muted-foreground">Customer Portal</p>
            </div>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.href)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </button>
            );
          })}

          {/* Admin Navigation */}
          {isAdmin && (
            <>
              <div className="pt-4 pb-2">
                <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Admin
                </p>
              </div>
              {adminNavigation.map((item) => {
                const isActive = location.pathname.startsWith(item.href);
                return (
                  <button
                    key={item.name}
                    onClick={() => navigate(item.href)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </button>
                );
              })}
            </>
          )}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.email}
              </p>
              <p className="text-xs text-muted-foreground">
                {isAdmin ? "Admin" : "Customer"}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
}
