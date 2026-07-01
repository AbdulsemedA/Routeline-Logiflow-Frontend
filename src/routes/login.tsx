import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth";
import { authApi } from "@/lib/api";
import { Radar } from "lucide-react";
import { useThemeEffect } from "@/hooks/useThemeEffect";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Sign in — Routeline" },
      { name: "description", content: "Sign in to your Routeline dispatch dashboard." },
      { property: "og:title", content: "Sign in — Routeline" },
      { property: "og:url", content: "/login" },
    ],
    links: [{ rel: "canonical", href: "/login" }],
  }),
});


function LoginPage() {
  useThemeEffect();
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("demo1234");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await authApi.login(username, password);
      login(result.user, result.accessToken, result.refreshToken);
      navigate({ to: "/role-select" });
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background text-foreground">
      <div className="hidden lg:flex flex-col justify-between p-10 bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-md bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center">
            <Radar className="h-4 w-4" />
          </div>
          <span className="font-semibold tracking-tight">Routeline</span>
        </div>
        <div className="space-y-4 max-w-md">
          <h1 className="text-3xl font-semibold leading-tight">
            Real-time dispatch for fleets that don't stop.
          </h1>
          <p className="text-sm text-sidebar-foreground/70">
            Live map, smart driver suggestions, route visibility — the operational
            cockpit modern logistics teams run on.
          </p>
          <div className="grid grid-cols-3 gap-3 pt-4">
            {[
              ["12k+", "Daily routes"],
              ["98.7%", "On-time rate"],
              ["<3s", "Dispatch time"],
            ].map(([v, l]) => (
              <div key={l} className="rounded-md border border-sidebar-border p-3">
                <div className="text-lg font-semibold">{v}</div>
                <div className="text-[11px] text-sidebar-foreground/60">{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="text-xs text-sidebar-foreground/50">
          © {new Date().getFullYear()} Routeline Systems
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>
              Continue to your dispatch dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in…" : "Sign in"}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Don't have an account?{" "}
                <Link to="/register" className="text-primary underline-offset-4 hover:underline">
                  Create one
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
