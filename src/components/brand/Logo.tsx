import { Radar } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  showWordmark = true,
  size = "md",
}: {
  className?: string;
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const tile =
    size === "lg" ? "h-11 w-11" : size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const icon =
    size === "lg" ? "h-5 w-5" : size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const text =
    size === "lg" ? "text-lg" : size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center rounded-lg text-primary-foreground shadow-sm",
          tile,
        )}
        style={{
          background:
            "linear-gradient(135deg, var(--color-primary), color-mix(in oklab, var(--color-primary) 60%, var(--color-chart-2)))",
        }}
      >
        <Radar className={cn(icon, "relative z-10")} />
        <span
          aria-hidden
          className="absolute inset-0 rounded-lg opacity-40 blur-md"
          style={{ background: "var(--color-chart-2)" }}
        />
      </div>
      {showWordmark && (
        <span className={cn("font-semibold tracking-tight", text)}>
          Routeline
        </span>
      )}
    </div>
  );
}
