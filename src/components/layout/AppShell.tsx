import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useAuthStore } from "@/store/auth";
import { useRealtimeBridge } from "@/hooks/useRealtimeBridge";
import { useThemeEffect } from "@/hooks/useThemeEffect";
import { AmbientBackground } from "@/components/brand/AmbientBackground";
import type { Role } from "@/types";

export function AppShell({
  children,
  requireRole,
}: {
  children: ReactNode;
  requireRole?: Role | Role[];
}) {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  useThemeEffect();
  useRealtimeBridge();

  useEffect(() => {
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    if (requireRole) {
      const roles = Array.isArray(requireRole) ? requireRole : [requireRole];
      if (!roles.includes(user.role)) {
        if (user.role === "admin") navigate({ to: "/admin" });
        else if (user.role === "driver") navigate({ to: "/driver" });
        else navigate({ to: "/customer/new" });
      }
    }
  }, [user, requireRole, navigate]);

  if (!user) return null;

  return (
    <div className="relative min-h-screen flex bg-background text-foreground">
      <AmbientBackground intensity="soft" />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
