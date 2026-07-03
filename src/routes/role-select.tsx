import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Package, Truck } from "lucide-react";
import type { Role } from "@/types";
import { useThemeEffect } from "@/hooks/useThemeEffect";
import http from "@/lib/http";
import { toast } from "sonner";
import { Logo } from "@/components/brand/Logo";
import { AmbientBackground } from "@/components/brand/AmbientBackground";
import { GradientText } from "@/components/brand/AuthLayout";

export const Route = createFileRoute("/role-select")({
  component: RoleSelectPage,
});

const ROLES: { role: Role; title: string; desc: string; icon: any; to: string; bullets: string[] }[] = [
  {
    role: "driver",
    title: "Driver",
    desc: "Your active delivery, route, and history in one place.",
    icon: Truck,
    to: "/driver",
    bullets: ["Live turn-by-turn map", "One-tap status updates", "Delivery history & earnings"],
  },
  {
    role: "customer",
    title: "Customer",
    desc: "Book a delivery and track it on a live map.",
    icon: Package,
    to: "/customer/new",
    bullets: ["Book in seconds", "Real-time ETA tracking", "Delivery notifications"],
  },
];

function RoleSelectPage() {
  useThemeEffect();
  const user = useAuthStore((s) => s.user);
  const setRole = useAuthStore((s) => s.setRole);
  const navigate = useNavigate();
  const [picking, setPicking] = useState<Role | null>(null);

  useEffect(() => {
    if (!user) navigate({ to: "/login" });
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
    <div className="relative min-h-screen bg-background text-foreground">
      <AmbientBackground />

      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 md:px-6 h-16">
        <Link to="/" className="flex items-center">
          <Logo />
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to home
        </Link>
      </header>

      <main className="mx-auto max-w-4xl px-4 md:px-6 pt-10 pb-16">
        <div className="text-center space-y-3 mb-10">
          <div className="mx-auto inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            One account, every view
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            How will you use <GradientText>Routeline</GradientText> today?
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Pick the experience that fits you best. You can change your role at any time from settings.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {ROLES.map(({ role, title, desc, icon: Icon, to, bullets }) => (
            <Card
              key={role}
              className="group relative overflow-hidden border-border/60 bg-card/70 backdrop-blur-xl cursor-pointer transition-all hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10"
              onClick={() => pick(role, to)}
            >
              <div
                aria-hidden
                className="absolute inset-x-0 -top-16 h-32 opacity-0 group-hover:opacity-100 transition-opacity blur-2xl"
                style={{
                  background:
                    "radial-gradient(50% 60% at 50% 100%, color-mix(in oklab, var(--color-primary) 35%, transparent), transparent 70%)",
                }}
              />
              <CardContent className="relative p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div
                    className="h-11 w-11 rounded-xl flex items-center justify-center text-primary-foreground"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--color-primary), var(--color-chart-2))",
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
                <div>
                  <div className="text-lg font-semibold">{title}</div>
                  <p className="text-sm text-muted-foreground mt-1">{desc}</p>
                </div>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-primary" />
                      {b}
                    </li>
                  ))}
                </ul>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-2"
                  disabled={picking === role}
                >
                  {picking === role ? "Applying…" : `Continue as ${title}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
