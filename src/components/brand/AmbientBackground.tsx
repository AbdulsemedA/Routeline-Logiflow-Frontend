export function AmbientBackground({ intensity = "full" }: { intensity?: "full" | "soft" }) {
  const orb =
    intensity === "full"
      ? "radial-gradient(ellipse 60% 50% at 50% -10%, color-mix(in oklab, var(--color-primary) 22%, transparent), transparent 70%), radial-gradient(ellipse 40% 40% at 85% 30%, color-mix(in oklab, var(--color-chart-2) 18%, transparent), transparent 70%)"
      : "radial-gradient(ellipse 55% 40% at 50% -15%, color-mix(in oklab, var(--color-primary) 12%, transparent), transparent 70%), radial-gradient(ellipse 35% 35% at 90% 10%, color-mix(in oklab, var(--color-chart-2) 10%, transparent), transparent 70%)";
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{ backgroundImage: orb }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.28]"
        style={{
          backgroundImage:
            "radial-gradient(var(--color-border) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          maskImage: "linear-gradient(to bottom, black, transparent 75%)",
          WebkitMaskImage: "linear-gradient(to bottom, black, transparent 75%)",
        }}
      />
    </>
  );
}
