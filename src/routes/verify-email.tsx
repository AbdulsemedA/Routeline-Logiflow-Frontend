import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useAuthStore } from "@/store/auth";
import { authApi } from "@/lib/api";
import { Loader2, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/brand/Logo";
import { AmbientBackground } from "@/components/brand/AmbientBackground";
import { useThemeEffect } from "@/hooks/useThemeEffect";

export const Route = createFileRoute("/verify-email")({
  validateSearch: z.object({
    uidb64: z.string().optional(),
    token: z.string().optional(),
  }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  useThemeEffect();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const login = useAuthStore((s) => s.login);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!search.uidb64 || !search.token) {
      setStatus("error");
      return;
    }
    let isMounted = true;
    authApi
      .verifyEmail(search.uidb64, search.token)
      .then((res) => {
        if (!isMounted) return;
        setStatus("success");
        login(res.user, res.accessToken, res.refreshToken);
        setTimeout(() => {
          if (res.user.role === "unassigned") navigate({ to: "/role-select" });
          else if (res.user.role === "admin") navigate({ to: "/admin" });
          else if (res.user.role === "driver") navigate({ to: "/driver" });
          else navigate({ to: "/customer/new" });
        }, 900);
      })
      .catch(() => {
        if (isMounted) setStatus("error");
      });
    return () => {
      isMounted = false;
    };
  }, [search.uidb64, search.token, login, navigate]);

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

      <main className="flex items-center justify-center px-4 pt-10 pb-16">
        <Card className="w-full max-w-md border-border/60 bg-card/70 backdrop-blur-xl shadow-xl shadow-primary/5">
          <CardContent className="p-10 text-center">
            {status === "loading" && (
              <div className="flex flex-col items-center">
                <div className="relative h-16 w-16">
                  <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
                  <div className="relative h-16 w-16 rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center">
                    <Loader2 className="h-7 w-7 animate-spin text-primary" />
                  </div>
                </div>
                <h2 className="mt-6 text-xl font-semibold">Verifying your email</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Hang tight — this only takes a second.
                </p>
              </div>
            )}
            {status === "success" && (
              <div className="flex flex-col items-center">
                <div className="relative h-16 w-16">
                  <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl" />
                  <div className="relative h-16 w-16 rounded-full border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  </div>
                </div>
                <h2 className="mt-6 text-xl font-semibold">Email verified</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  You're all set. Redirecting you to your dashboard…
                </p>
              </div>
            )}
            {status === "error" && (
              <div className="flex flex-col items-center">
                <div className="relative h-16 w-16">
                  <div className="absolute inset-0 rounded-full bg-destructive/20 blur-xl" />
                  <div className="relative h-16 w-16 rounded-full border border-destructive/30 bg-destructive/10 flex items-center justify-center">
                    <XCircle className="h-8 w-8 text-destructive" />
                  </div>
                </div>
                <h2 className="mt-6 text-xl font-semibold">Verification failed</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  The link is invalid or has expired. Please try registering again
                  or reach out to support.
                </p>
                <div className="mt-6 flex gap-2">
                  <Button asChild variant="outline">
                    <Link to="/register">Try again</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/login">Go to sign in</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
