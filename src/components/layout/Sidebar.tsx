import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Truck,
  BarChart3,
  Package,
  MapPin,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useUIStore } from "@/store/ui";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";


type NavItem = { to: string; label: string; icon: React.ComponentType<{ className?: string }> };

const NAV: Record<string, NavItem[]> = {
  admin: [
    { to: "/admin", label: "Dispatch", icon: LayoutDashboard },
    { to: "/admin/fleet", label: "Fleet", icon: Truck },
    { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  ],
  driver: [
    { to: "/driver", label: "My Route", icon: MapPin },
    { to: "/driver/history", label: "History", icon: Package },
  ],
  customer: [
    { to: "/customer/new", label: "New Delivery", icon: Package },
    { to: "/customer/orders", label: "My Orders", icon: Truck },
  ],
};

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const location = useLocation();
  const navigate = useNavigate();
  const role = user?.role ?? "admin";
  const items = NAV[role] ?? [];

  return (
    <aside
      className={cn(
        "hidden md:flex h-screen sticky top-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all",
        collapsed ? "w-16" : "w-60",
      )}
    >
      <div className="flex items-center h-14 px-4 border-b border-sidebar-border">
        <Link to={(items[0]?.to || "/") as any} className="flex items-center">
          <Logo showWordmark={!collapsed} size="sm" />
        </Link>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {items.map((item) => {
          const active =
            location.pathname === item.to ||
            (item.to !== "/" && location.pathname.startsWith(item.to + "/"));
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="p-2 border-t border-sidebar-border space-y-1">
        {!collapsed && user && (
          <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
            <div className="h-8 w-8 rounded-full bg-sidebar-primary/15 text-sidebar-primary flex items-center justify-center text-xs font-semibold ring-1 ring-sidebar-border">
              {user.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="text-xs font-medium truncate">{user.name}</div>
              <div className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">
                {user.role}
              </div>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 text-sidebar-foreground/80 hover:bg-sidebar-accent/60"
          onClick={() => {
            logout();
            navigate({ to: "/login" });
          }}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </Button>
      </div>
    </aside>
  );
}
