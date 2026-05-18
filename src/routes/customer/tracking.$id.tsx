import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useQuery } from "@tanstack/react-query";
import { deliveriesApi, driversApi } from "@/lib/api";
import { LiveMap } from "@/components/map/LiveMap";
import { Card } from "@/components/ui/card";
import { DeliveryStatusBadge } from "@/components/dashboard/StatusBadge";
import { formatDistance } from "@/lib/geo";

export const Route = createFileRoute("/customer/tracking/$id")({
  component: () => (
    <AppShell requireRole={["customer", "admin"]}>
      <Inner />
    </AppShell>
  ),
});

function Inner() {
  const { id } = Route.useParams();
  const { data: delivery } = useQuery({
    queryKey: ["deliveries", id],
    queryFn: () => deliveriesApi.get(id),
    refetchInterval: 4000,
  });
  const { data: drivers = [] } = useQuery({
    queryKey: ["drivers"],
    queryFn: () => driversApi.list(),
    refetchInterval: 5000,
  });
  const driver = drivers.find((d) => d.id === delivery?.assignedDriverId);

  if (!delivery) return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Tracking {delivery.id}</h1>
          <p className="text-sm text-muted-foreground">
            {delivery.pickup.label} → {delivery.dropoff.label}
          </p>
        </div>
        <DeliveryStatusBadge status={delivery.status} />
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-3">
          <LiveMap
            drivers={driver ? [driver] : []}
            deliveries={[delivery]}
            focusDelivery={delivery}
            focusMode
            height={460}
          />
        </Card>
        <Card className="p-4 space-y-3">
          <div className="text-sm font-medium">ETA</div>
          <div className="text-3xl font-semibold tabular-nums">
            {delivery.etaMinutes ?? "—"}
            <span className="text-sm text-muted-foreground ml-1">min</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {formatDistance(delivery.distanceKm)} · ${delivery.priceUsd}
          </div>
          {driver && (
            <div className="pt-3 border-t border-border space-y-1 text-sm">
              <div className="font-medium">{driver.name}</div>
              <div className="text-xs text-muted-foreground capitalize">
                {driver.vehicle.type} · {driver.vehicle.plate}
              </div>
            </div>
          )}
          <Link
            to="/deliveries/$id"
            params={{ id: delivery.id }}
            className="text-xs text-primary hover:underline"
          >
            View full timeline →
          </Link>
        </Card>
      </div>
    </div>
  );
}
