import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  MapPinned,
  Sparkles,
  Trophy,
  BarChart3,
  Radio,
  ShieldCheck,
  Check,
  Truck,
  Package,
  Users,
  Github,
  Twitter,
  Linkedin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";
import { useAuthStore } from "@/store/auth";
import { useThemeEffect } from "@/hooks/useThemeEffect";
import { useUIStore } from "@/store/ui";
import { Moon, Sun } from "lucide-react";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "Routeline — Smart Logistics & Dispatch Platform" },
      {
        name: "description",
        content:
          "Real-time dispatch, live fleet map, and AI-powered driver assignment for modern logistics teams. Move packages faster, on-time, every time.",
      },
      { property: "og:title", content: "Routeline — Smart Logistics & Dispatch Platform" },
      {
        property: "og:description",
        content:
          "Real-time dispatch, live fleet map, and AI-powered driver assignment for modern logistics teams.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:title", content: "Routeline — Smart Logistics & Dispatch Platform" },
      {
        name: "twitter:description",
        content:
          "Real-time dispatch, live fleet map, and AI-powered driver assignment.",
      },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Routeline",
          description:
            "Smart Logistics & Delivery Dispatch Platform. Real-time fleet visibility and AI dispatch.",
          url: "/",
        }),
      },
    ],
  }),
});

function LandingPage() {
  useThemeEffect();
  const user = useAuthStore((s) => s.user);
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);

  const dashboardHref =
    user?.role === "driver"
      ? "/driver"
      : user?.role === "customer"
        ? "/customer/new"
        : "/admin";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Ambient background */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 60% 50% at 50% -10%, color-mix(in oklab, var(--color-primary) 22%, transparent), transparent 70%), radial-gradient(ellipse 40% 40% at 85% 30%, color-mix(in oklab, var(--color-chart-2) 18%, transparent), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(var(--color-border) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          maskImage:
            "linear-gradient(to bottom, black, transparent 70%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black, transparent 70%)",
        }}
      />

      <Header
        dashboardHref={dashboardHref}
        hasUser={!!user}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <main>
        <Hero hasUser={!!user} dashboardHref={dashboardHref} />
        <LogosStrip />
        <Features />
        <HowItWorks />
        <ProductPreview />
        <Roles />
        <CTABanner />
      </main>

      <Footer />
    </div>
  );
}

function Header({
  dashboardHref,
  hasUser,
  theme,
  toggleTheme,
}: {
  dashboardHref: string;
  hasUser: boolean;
  theme: string;
  toggleTheme: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 md:px-6">
        <Link to="/" className="flex items-center">
          <Logo />
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
          <a href="#product" className="hover:text-foreground transition-colors">Product</a>
          <a href="#roles" className="hover:text-foreground transition-colors">Who it's for</a>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          {hasUser ? (
            <Button asChild size="sm">
              <Link to={dashboardHref as any}>
                Go to dashboard <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/register">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function Hero({ hasUser, dashboardHref }: { hasUser: boolean; dashboardHref: string }) {
  return (
    <section className="relative mx-auto max-w-7xl px-4 md:px-6 pt-16 md:pt-24 pb-16">
      <div className="mx-auto max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Live dispatch running in 42 cities
        </div>
        <h1 className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
          Real-time dispatch for fleets that{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(120deg, var(--color-primary), var(--color-chart-2))",
            }}
          >
            don't stop.
          </span>
        </h1>
        <p className="mt-5 text-base md:text-lg text-muted-foreground">
          Routeline is the operational cockpit for modern logistics — live map,
          AI-powered driver assignment, and end-to-end delivery visibility in
          one beautifully fast dashboard.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {hasUser ? (
            <Button asChild size="lg">
              <Link to={dashboardHref as any}>
                Open dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild size="lg">
                <Link to="/register">
                  Start free <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/login">Sign in</Link>
              </Button>
            </>
          )}
        </div>
        <div className="mt-10 grid grid-cols-3 gap-2 sm:gap-6 max-w-xl mx-auto">
          {[
            ["12k+", "Daily routes"],
            ["98.7%", "On-time rate"],
            ["<3s", "Dispatch time"],
          ].map(([v, l]) => (
            <div key={l} className="rounded-lg border border-border bg-card/50 p-3 backdrop-blur">
              <div className="text-xl md:text-2xl font-semibold">{v}</div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mock dashboard preview */}
      <div className="relative mt-16 md:mt-20">
        <div
          aria-hidden
          className="absolute -inset-8 -z-10 rounded-[2rem] blur-3xl opacity-60"
          style={{
            background:
              "radial-gradient(ellipse at center, color-mix(in oklab, var(--color-primary) 30%, transparent), transparent 70%)",
          }}
        />
        <div className="mx-auto max-w-5xl rounded-2xl border border-border bg-card/80 shadow-2xl overflow-hidden backdrop-blur">
          <div className="flex items-center gap-1.5 border-b border-border px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-chart-4" />
            <span className="h-2.5 w-2.5 rounded-full bg-chart-2" />
            <span className="ml-3 text-[11px] text-muted-foreground font-mono">app.routeline.io/admin</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4">
            <div className="md:col-span-2 h-64 md:h-80 rounded-lg border border-border relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, color-mix(in oklab, var(--color-primary) 8%, var(--color-card)), var(--color-card))",
              }}
            >
              <div
                aria-hidden
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 300" fill="none">
                <path
                  d="M40 240 Q 120 180 180 200 T 360 60"
                  stroke="var(--color-chart-2)"
                  strokeWidth="2.5"
                  strokeDasharray="6 6"
                  fill="none"
                />
                <path
                  d="M60 80 Q 140 120 220 100 T 380 200"
                  stroke="var(--color-primary)"
                  strokeWidth="2"
                  strokeDasharray="4 6"
                  fill="none"
                  opacity="0.7"
                />
              </svg>
              {[
                { x: "12%", y: "78%", c: "var(--color-chart-2)" },
                { x: "44%", y: "62%", c: "var(--color-chart-2)" },
                { x: "88%", y: "18%", c: "var(--color-primary)" },
                { x: "18%", y: "24%", c: "var(--color-chart-4)" },
                { x: "62%", y: "40%", c: "var(--color-chart-2)" },
              ].map((p, i) => (
                <span
                  key={i}
                  className="absolute h-3 w-3 rounded-full shadow-lg"
                  style={{ left: p.x, top: p.y, background: p.c, boxShadow: `0 0 0 4px color-mix(in oklab, ${p.c} 25%, transparent)` }}
                />
              ))}
              <div className="absolute bottom-3 left-3 rounded-md bg-background/80 backdrop-blur px-2.5 py-1.5 text-[11px] font-mono">
                <span className="text-emerald-500">●</span> 24 drivers live
              </div>
            </div>
            <div className="space-y-3">
              {[
                { name: "Marcus O.", status: "En route", eta: "6 min", tone: "chart-2" },
                { name: "Priya S.", status: "Pickup", eta: "2 min", tone: "chart-4" },
                { name: "Diego R.", status: "Idle", eta: "—", tone: "muted-foreground" },
              ].map((d) => (
                <div key={d.name} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{d.name}</div>
                    <span
                      className="text-[10px] uppercase tracking-wider rounded-full px-2 py-0.5"
                      style={{
                        color: `var(--color-${d.tone})`,
                        background: `color-mix(in oklab, var(--color-${d.tone}) 15%, transparent)`,
                      }}
                    >
                      {d.status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>ETA {d.eta}</span>
                    <span className="font-mono">4.9 ★</span>
                  </div>
                </div>
              ))}
              <div className="rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                + 21 more drivers
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LogosStrip() {
  const brands = ["NORTHWIND", "ACME LOGISTICS", "PARCELWORKS", "FLEETLY", "URBANMOVE", "CARGONAUT"];
  return (
    <section className="border-y border-border/60 bg-card/30 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-8">
        <div className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-6">
          Trusted by operations teams worldwide
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-muted-foreground/70">
          {brands.map((b) => (
            <span key={b} className="font-semibold tracking-widest text-sm">
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    { icon: MapPinned, title: "Live fleet map", desc: "Every driver, every route, every second. Powered by realtime WebSockets and clustered markers." },
    { icon: Sparkles, title: "AI smart dispatch", desc: "Rank drivers by distance, rating, and on-time performance. Assign the best one in a click." },
    { icon: Trophy, title: "Driver ranking", desc: "Automatic performance scoring based on ETA accuracy, completion rate, and customer feedback." },
    { icon: BarChart3, title: "Operational analytics", desc: "Volume, latency, demand heatmaps, and cost per delivery — all in one dashboard." },
    { icon: Radio, title: "Realtime tracking", desc: "Customers get a live tracking link. No refresh, no email chains, no surprises." },
    { icon: ShieldCheck, title: "Role-based access", desc: "Admins, drivers, and customers see exactly what they need. Nothing more, nothing less." },
  ];
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 md:px-6 py-24">
      <div className="max-w-2xl">
        <div className="text-xs uppercase tracking-widest text-primary font-medium">Features</div>
        <h2 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight">
          Everything an ops team needs. Nothing they don't.
        </h2>
        <p className="mt-4 text-muted-foreground">
          Built by dispatchers, for dispatchers. Every screen is designed to
          reduce decisions and increase throughput.
        </p>
      </div>
      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-lg"
          >
            <div
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-primary-foreground"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-primary), color-mix(in oklab, var(--color-primary) 60%, var(--color-chart-2)))",
              }}
            >
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-semibold">{title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", title: "Order arrives", desc: "Customer books a delivery. Pickup and dropoff snap to real coordinates in seconds." },
    { n: "02", title: "AI assigns", desc: "Routeline ranks nearby drivers by distance, rating, and reliability — you approve or auto-dispatch." },
    { n: "03", title: "Track & deliver", desc: "Live location, status timeline, and proof-of-delivery. All parties stay in sync automatically." },
  ];
  return (
    <section id="how" className="border-t border-border/60 bg-card/30">
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-24">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-widest text-primary font-medium">How it works</div>
          <h2 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight">
            Order to doorstep in three moves.
          </h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3 relative">
          {steps.map((s, i) => (
            <div key={s.n} className="relative rounded-xl border border-border bg-background p-6">
              <div className="font-mono text-xs text-muted-foreground">{s.n}</div>
              <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              {i < steps.length - 1 && (
                <div
                  aria-hidden
                  className="hidden md:block absolute top-1/2 -right-3 h-px w-6 bg-border"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductPreview() {
  const bullets = [
    "One map, every driver, updated every 1.5s",
    "Assign in one click — or let AI do it",
    "Delivery timelines with full audit trail",
    "Analytics, heatmaps, and demand forecasting",
  ];
  return (
    <section id="product" className="mx-auto max-w-7xl px-4 md:px-6 py-24 grid gap-12 md:grid-cols-2 items-center">
      <div>
        <div className="text-xs uppercase tracking-widest text-primary font-medium">The dispatch cockpit</div>
        <h2 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight">
          The map is the product.
        </h2>
        <p className="mt-4 text-muted-foreground">
          A single, honest view of your entire fleet. Zero context switching,
          zero refresh buttons, zero guesswork.
        </p>
        <ul className="mt-6 space-y-3">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-3 text-sm">
              <span
                className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-primary-foreground"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-primary), color-mix(in oklab, var(--color-primary) 60%, var(--color-chart-2)))",
                }}
              >
                <Check className="h-3 w-3" />
              </span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="relative">
        <div
          aria-hidden
          className="absolute -inset-6 -z-10 rounded-3xl blur-2xl opacity-60"
          style={{
            background:
              "radial-gradient(ellipse at center, color-mix(in oklab, var(--color-chart-2) 25%, transparent), transparent 70%)",
          }}
        />
        <div className="rounded-xl border border-border bg-card p-4 shadow-xl">
          <div className="grid grid-cols-3 gap-3">
            {[
              { l: "Active", v: "142", t: "chart-2" },
              { l: "On-time", v: "98.7%", t: "primary" },
              { l: "Avg ETA", v: "14m", t: "chart-4" },
            ].map((s) => (
              <div key={s.l} className="rounded-lg border border-border p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.l}</div>
                <div
                  className="mt-1 text-xl font-semibold"
                  style={{ color: `var(--color-${s.t})` }}
                >
                  {s.v}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-lg border border-border p-4 h-56 relative overflow-hidden">
            <div className="text-xs text-muted-foreground mb-2">Deliveries · last 24h</div>
            <svg viewBox="0 0 300 140" className="h-full w-full">
              <defs>
                <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0 110 L30 90 L60 100 L90 70 L120 78 L150 50 L180 60 L210 30 L240 45 L270 20 L300 35 L300 140 L0 140 Z"
                fill="url(#area)"
              />
              <path
                d="M0 110 L30 90 L60 100 L90 70 L120 78 L150 50 L180 60 L210 30 L240 45 L270 20 L300 35"
                stroke="var(--color-primary)"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

function Roles() {
  const roles = [
    {
      icon: Users,
      title: "For Admins",
      desc: "Command the entire fleet. Assign, monitor, and analyze.",
      bullets: ["Live map & dispatch", "Fleet management", "Analytics & heatmaps"],
      cta: "Open admin",
      to: "/login",
    },
    {
      icon: Truck,
      title: "For Drivers",
      desc: "One tap to accept, one tap to complete.",
      bullets: ["Turn-by-turn route", "Simple status stepper", "Delivery history"],
      cta: "Driver login",
      to: "/login",
    },
    {
      icon: Package,
      title: "For Customers",
      desc: "Book, track, and know exactly when it arrives.",
      bullets: ["Map-based booking", "Live tracking link", "Order history"],
      cta: "Send a package",
      to: "/register",
    },
  ];
  return (
    <section id="roles" className="border-t border-border/60 bg-card/30">
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-24">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-widest text-primary font-medium">Built for every seat</div>
          <h2 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight">
            One platform. Three tailored experiences.
          </h2>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {roles.map(({ icon: Icon, title, desc, bullets, cta, to }) => (
            <div
              key={title}
              className="flex flex-col rounded-xl border border-border bg-background p-6 hover:border-primary/40 transition-colors"
            >
              <div
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-primary-foreground"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-primary), color-mix(in oklab, var(--color-primary) 60%, var(--color-chart-2)))",
                }}
              >
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{desc}</p>
              <ul className="mt-4 space-y-2 flex-1">
                {bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-3.5 w-3.5 text-primary" /> {b}
                  </li>
                ))}
              </ul>
              <Button asChild variant="outline" className="mt-6 w-full">
                <Link to={to}>
                  {cta} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTABanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 md:px-6 py-24">
      <div
        className="relative overflow-hidden rounded-3xl border border-border p-10 md:p-16 text-center"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in oklab, var(--color-primary) 90%, black), color-mix(in oklab, var(--color-primary) 60%, var(--color-chart-2)))",
        }}
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(white 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="relative">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-primary-foreground">
            Start dispatching in minutes.
          </h2>
          <p className="mt-4 text-primary-foreground/80 max-w-xl mx-auto">
            No credit card. No integrations to wire up. Try the full platform
            with realistic demo data.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link to="/register">
                Create free account <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Link to="/login">Try the demo</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const cols = [
    { title: "Product", links: ["Features", "Analytics", "Roadmap", "Changelog"] },
    { title: "Company", links: ["About", "Careers", "Press", "Contact"] },
    { title: "Legal", links: ["Privacy", "Terms", "Security", "DPA"] },
  ];
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-14 grid gap-10 md:grid-cols-5">
        <div className="md:col-span-2 space-y-4">
          <Logo />
          <p className="text-sm text-muted-foreground max-w-xs">
            The operational cockpit for modern logistics teams. Built to move.
          </p>
          <div className="flex items-center gap-2">
            {[Twitter, Github, Linkedin].map((I, i) => (
              <a
                key={i}
                href="#"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
              >
                <I className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">{c.title}</div>
            <ul className="mt-4 space-y-2">
              {c.links.map((l) => (
                <li key={l}>
                  <a href="#" className="text-sm hover:text-primary transition-colors">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-5 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Routeline Systems. All rights reserved.</span>
          <span>Made for teams that move.</span>
        </div>
      </div>
    </footer>
  );
}
