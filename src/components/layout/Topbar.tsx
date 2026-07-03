import { Bell, Menu, Moon, Search, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/ui";
import { useAuthStore } from "@/store/auth";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api";

export function Topbar() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const user = useAuthStore((s) => s.user);
  const { data } = useQuery({
    queryKey: ["analytics", "summary"],
    queryFn: () => analyticsApi.summary(),
    refetchInterval: 8000,
  });

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-border/60 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 flex items-center px-3 md:px-5 gap-3">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}>
        <Menu className="h-5 w-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="hidden md:inline-flex"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        System operational
      </div>

      <div className="hidden lg:flex items-center gap-6 ml-6 text-xs">
        <Stat label="Active" value={data?.activeDeliveries ?? "—"} />
        <Stat label="Drivers" value={data?.activeDrivers ?? "—"} />
        <Stat label="Today" value={data?.completedToday ?? "—"} />
        <Stat label="Avg ETA" value={data ? `${data.avgDeliveryMin}m` : "—"} />
      </div>

      <div className="relative hidden md:flex items-center ml-auto">
        <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search orders, drivers…"
          className="h-9 w-64 rounded-md border border-input bg-background pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <Button variant="ghost" size="icon" className="ml-auto md:ml-0" onClick={toggleTheme}>
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
      <Button variant="ghost" size="icon">
        <Bell className="h-4 w-4" />
      </Button>
      <div className="flex items-center gap-2 pl-2 border-l border-border">
        <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
          {user?.name?.[0]?.toUpperCase() ?? "U"}
        </div>
        <div className="hidden md:block text-xs leading-tight">
          <div className="font-medium">{user?.name ?? "Guest"}</div>
          <div className="text-muted-foreground capitalize">{user?.role ?? "—"}</div>
        </div>
      </div>
    </header>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="font-mono font-medium text-foreground">{value}</span>
    </div>
  );
}
