import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  useEffect(() => {
    if (!user) navigate({ to: "/login" });
    else if (user.role === "admin") navigate({ to: "/admin" });
    else if (user.role === "driver") navigate({ to: "/driver" });
    else navigate({ to: "/customer/new" });
  }, [user, navigate]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground text-sm text-muted-foreground">
      Loading…
    </div>
  );
}
