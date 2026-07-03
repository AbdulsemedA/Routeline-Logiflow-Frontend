import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";
import { AmbientBackground } from "@/components/brand/AmbientBackground";
import { useThemeEffect } from "@/hooks/useThemeEffect";

type Stat = [string, string];

export function AuthLayout({
  eyebrow,
  title,
  subtitle,
  stats,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle: string;
  stats?: Stat[];
  children: ReactNode;
}) {
  useThemeEffect();
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

      <main className="mx-auto grid max-w-7xl gap-12 px-4 md:px-6 pb-16 pt-6 lg:grid-cols-2 lg:pt-14">
        <div className="hidden lg:flex flex-col justify-center max-w-lg">
          {eyebrow && (
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              {eyebrow}
            </div>
          )}
          <h1 className="mt-6 text-4xl xl:text-5xl font-semibold tracking-tight leading-[1.05]">
            {title}
          </h1>
          <p className="mt-5 text-base text-muted-foreground leading-relaxed">
            {subtitle}
          </p>
          {stats && (
            <div className="mt-10 grid grid-cols-3 gap-3">
              {stats.map(([v, l]) => (
                <div
                  key={l}
                  className="rounded-lg border border-border bg-card/60 p-3 backdrop-blur"
                >
                  <div className="text-xl font-semibold">{v}</div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {l}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-center lg:justify-end">
          <div className="w-full max-w-md">
            <div
              aria-hidden
              className="absolute -z-10 hidden lg:block h-72 w-72 rounded-full blur-3xl opacity-40 translate-x-16 -translate-y-8"
              style={{
                background:
                  "radial-gradient(circle, color-mix(in oklab, var(--color-primary) 40%, transparent), transparent 70%)",
              }}
            />
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

export function GradientText({ children }: { children: ReactNode }) {
  return (
    <span
      className="bg-clip-text text-transparent"
      style={{
        backgroundImage:
          "linear-gradient(120deg, var(--color-primary), var(--color-chart-2))",
      }}
    >
      {children}
    </span>
  );
}
