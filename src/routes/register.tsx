import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth";
import { authApi } from "@/lib/api";
import { AuthLayout, GradientText } from "@/components/brand/AuthLayout";

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
      await authApi.register(name, email, password);
      const result = await authApi.login(name, password);
      login(result.user, result.accessToken, result.refreshToken);
      if (result.user.role === "unassigned") navigate({ to: "/role-select" });
      else if (result.user.role === "admin") navigate({ to: "/admin" });
      else if (result.user.role === "driver") navigate({ to: "/driver" });
      else navigate({ to: "/customer/new" });
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Free to get started"
      title={
        <>
          Start dispatching in <GradientText>under a minute.</GradientText>
        </>
      }
      subtitle="Create your free account and unlock live fleet tracking, AI-powered dispatch, and real-time delivery orchestration."
      stats={[
        ["Free", "To get started"],
        ["30s", "Setup time"],
        ["3", "Role views"],
      ]}
    >
      <Card className="border-border/60 bg-card/70 backdrop-blur-xl shadow-xl shadow-primary/5">
        <CardHeader className="space-y-1.5">
          <CardTitle className="text-2xl">Create account</CardTitle>
          <CardDescription>Start dispatching in under a minute.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
              {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
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
              <Button type="submit" className="w-full h-10" disabled={loading}>
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
    </AuthLayout>
  );
}
