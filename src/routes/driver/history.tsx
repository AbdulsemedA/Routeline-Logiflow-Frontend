import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useQuery } from "@tanstack/react-query";
import { deliveriesApi } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { DeliveryStatusBadge } from "@/components/dashboard/StatusBadge";
import { formatDistance } from "@/lib/geo";

export const Route = createFileRoute("/driver/history")({
  component: () => (
    <AppShell requireRole="driver">
      <Inner />
    </AppShell>
  ),
});

function Inner() {
  const { data: deliveries = [] } = useQuery({
    queryKey: ["deliveries"],
    queryFn: () => deliveriesApi.list(),
  });
  const history = deliveries.filter((d) => d.status === "delivered");
  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-xl font-semibold tracking-tight">Delivery history</h1>
      <Card className="p-4 divide-y divide-border">
        {history.map((d) => (
          <Link
            key={d.id}
            to="/deliveries/$id"
            params={{ id: d.id }}
            className="flex items-center justify-between py-3 hover:bg-accent/50 px-2 -mx-2 rounded text-sm"
          >
            <span className="flex items-center gap-3">
              <DeliveryStatusBadge status={d.status} />
              <span className="font-medium">{d.id}</span>
              <span className="text-muted-foreground">{d.customerName}</span>
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistance(d.distanceKm)} · ${d.priceUsd}
            </span>
          </Link>
        ))}
        {history.length === 0 && (
          <div className="text-sm text-muted-foreground py-8 text-center">
            No completed deliveries yet.
          </div>
        )}
      </Card>
    </div>
  );
}
