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

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  head: () => ({
    meta: [
      { title: "Create account — Routeline" },
      { name: "description", content: "Create a Routeline account and start dispatching in minutes." },
      { property: "og:title", content: "Create account — Routeline" },
      { property: "og:url", content: "/register" },
    ],
    links: [{ rel: "canonical", href: "/register" }],
  }),
});


function RegisterPage() {
  useThemeEffect();
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await authApi.register(name, email, password);
      login(result.user, result.accessToken, result.refreshToken);
      navigate({ to: "/role-select" });
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background text-foreground">
      <div className="hidden lg:flex flex-col justify-between p-10 bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-md bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center">
            <Radar className="h-4 w-4" />
          </div>
          <span className="font-semibold tracking-tight">Routeline</span>
        </Link>
        <div className="space-y-4 max-w-md">
          <h1 className="text-3xl font-semibold leading-tight">
            Start dispatching in under a minute.
          </h1>
          <p className="text-sm text-sidebar-foreground/70">
            Create your free account and get access to live fleet tracking,
            AI-powered dispatch, and real-time delivery management.
          </p>
          <div className="grid grid-cols-3 gap-3 pt-4">
            {[
              ["Free", "To get started"],
              ["30s", "Setup time"],
              ["3", "Role views"],
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
            <CardTitle>Create account</CardTitle>
            <CardDescription>Start dispatching in under a minute.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating…" : "Create account"}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Already have an account?{" "}
                <Link to="/login" className="text-primary underline-offset-4 hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
