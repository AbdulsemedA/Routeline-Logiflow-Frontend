import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useQuery } from "@tanstack/react-query";
import { deliveriesApi } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { DeliveryStatusBadge } from "@/components/dashboard/StatusBadge";

export const Route = createFileRoute("/customer/orders")({
  component: () => (
    <AppShell requireRole="customer">
      <Inner />
    </AppShell>
  ),
});

function Inner() {
  const { data: deliveries = [] } = useQuery({
    queryKey: ["deliveries"],
    queryFn: () => deliveriesApi.list(),
    refetchInterval: 5000,
  });
  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-xl font-semibold tracking-tight">My orders</h1>
      <Card className="p-4 divide-y divide-border">
        {deliveries.slice(0, 20).map((d) => (
          <Link
            key={d.id}
            to="/customer/tracking/$id"
            params={{ id: d.id }}
            className="flex items-center justify-between py-3 hover:bg-accent/50 px-2 -mx-2 rounded text-sm"
          >
            <span className="flex items-center gap-3">
              <DeliveryStatusBadge status={d.status} />
              <span className="font-medium">{d.id}</span>
              <span className="text-muted-foreground truncate hidden md:inline">
                {d.pickup.label} → {d.dropoff.label}
              </span>
            </span>
            <span className="text-xs text-muted-foreground">${d.priceUsd}</span>
          </Link>
        ))}
      </Card>
    </div>
  );
}
