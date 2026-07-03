import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useAuthStore } from "@/store/auth";
import { authApi } from "@/lib/api";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/verify-email")({
  validateSearch: z.object({
    uidb64: z.string().optional(),
    token: z.string().optional(),
  }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
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
    authApi.verifyEmail(search.uidb64, search.token)
      .then((res) => {
        if (!isMounted) return;
        setStatus("success");
        login(res.user, res.accessToken, res.refreshToken);
        if (res.user.role === "unassigned") {
          navigate({ to: "/role-select" });
        } else if (res.user.role === "admin") {
          navigate({ to: "/admin" });
        } else if (res.user.role === "driver") {
          navigate({ to: "/driver" });
        } else {
          navigate({ to: "/customer/new" });
        }
      })
      .catch(() => {
        if (isMounted) setStatus("error");
      });
      
    return () => { isMounted = false; };
  }, [search.uidb64, search.token, login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
      <div className="w-full max-w-md space-y-6 text-center">
        {status === "loading" && (
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <h2 className="mt-4 text-xl font-semibold">Verifying your email...</h2>
          </div>
        )}
        {status === "success" && (
          <div className="flex flex-col items-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            <h2 className="mt-4 text-xl font-semibold">Email verified!</h2>
            <p className="mt-2 text-muted-foreground text-sm">You are being redirected...</p>
          </div>
        )}
        {status === "error" && (
          <div className="flex flex-col items-center">
            <XCircle className="h-10 w-10 text-destructive" />
            <h2 className="mt-4 text-xl font-semibold">Verification failed</h2>
            <p className="mt-2 text-muted-foreground text-sm">
              The link is invalid or has expired. Please try registering again or contact support.
            </p>
            <Button asChild className="mt-6" variant="outline">
              <Link to="/login">Go to login</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
