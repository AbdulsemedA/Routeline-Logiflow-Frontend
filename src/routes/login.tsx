import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth";
import { authApi } from "@/lib/api";
import { AuthLayout, GradientText } from "@/components/brand/AuthLayout";

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
      if (result.user.role === "unassigned") navigate({ to: "/role-select" });
      else if (result.user.role === "admin") navigate({ to: "/admin" });
      else if (result.user.role === "driver") navigate({ to: "/driver" });
      else navigate({ to: "/customer/new" });
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Live dispatch cockpit"
      title={
        <>
          Real-time dispatch for fleets that <GradientText>don't stop.</GradientText>
        </>
      }
      subtitle="Live map, smart driver suggestions, route visibility — the operational cockpit modern logistics teams run on."
      stats={[
        ["12k+", "Daily routes"],
        ["98.7%", "On-time rate"],
        ["<3s", "Dispatch time"],
      ]}
    >
      <Card className="border-border/60 bg-card/70 backdrop-blur-xl shadow-xl shadow-primary/5">
        <CardHeader className="space-y-1.5">
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Continue to your dispatch dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
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
            <Button type="submit" className="w-full h-10" disabled={loading}>
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
    </AuthLayout>
  );
}
