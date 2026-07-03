import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LayoutDashboard, Package, Truck } from "lucide-react";
import type { Role } from "@/types";
import { useThemeEffect } from "@/hooks/useThemeEffect";
import http from "@/lib/http";
import { toast } from "sonner";

export const Route = createFileRoute("/role-select")({
  component: RoleSelectPage,
});

const ROLES: { role: Role; title: string; desc: string; icon: any; to: string }[] = [
  {
    role: "driver",
    title: "Driver",
    desc: "Your active delivery, route, and history in one place.",
    icon: Truck,
    to: "/driver",
  },
  {
    role: "customer",
    title: "Customer",
    desc: "Book a delivery and track it on a live map.",
    icon: Package,
    to: "/customer/new",
  },
];

function RoleSelectPage() {
  useThemeEffect();
  const user = useAuthStore((s) => s.user);
  const setRole = useAuthStore((s) => s.setRole);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const [picking, setPicking] = useState<Role | null>(null);

  useEffect(() => {
    if (!user) {
      navigate({ to: "/login" });
    }
  }, [user, navigate]);

  async function pick(role: Role, to: string) {
    setPicking(role);
    try {
      await http.patch("/auth/role", { role });
      setRole(role);
      navigate({ to });
    } catch {
      toast.error("Failed to update role");
    } finally {
      setPicking(null);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
      <div className="w-full max-w-3xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Choose your view</h1>
          <p className="text-sm text-muted-foreground">
            You can switch between roles at any time from the sidebar.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {ROLES.map(({ role, title, desc, icon: Icon, to }) => (
            <Card
              key={role}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => pick(role, to)}
            >
              <CardContent className="p-5 space-y-3">
                <div className="h-10 w-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium">{title}</div>
                  <p className="text-sm text-muted-foreground mt-1">{desc}</p>
                </div>
                <Button size="sm" variant="outline" className="w-full" disabled={picking === role}>
                  {picking === role ? "Applying…" : `Continue as ${role}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
