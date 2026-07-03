import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useQuery } from "@tanstack/react-query";
import { deliveriesApi, driversApi } from "@/lib/api";
import { LiveMap } from "@/components/map/LiveMap";
import { Card } from "@/components/ui/card";
import { DeliveryStatusBadge } from "@/components/dashboard/StatusBadge";
import { formatDistance } from "@/lib/geo";
import { format } from "date-fns";

export const Route = createFileRoute("/deliveries/$id")({
  component: () => (
    <AppShell requireRole={["customer", "admin", "driver"]}>
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
  });
  if (!delivery) return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  const driver = drivers.find((d) => d.id === delivery.assignedDriverId);

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{delivery.id}</h1>
          <p className="text-sm text-muted-foreground">{delivery.customerName}</p>
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
            height={420}
          />
        </Card>
        <Card className="p-4 space-y-3 text-sm">
          <Row label="Distance" value={formatDistance(delivery.distanceKm)} />
          <Row label="Price" value={`$${delivery.priceUsd}`} />
          <Row label="ETA" value={`${delivery.etaMinutes ?? "—"} min`} />
          <Row label="Package" value={`${delivery.package.description} · ${delivery.package.weightKg}kg`} />
          <Row label="Pickup" value={delivery.pickup.label ?? "—"} />
          <Row label="Dropoff" value={delivery.dropoff.label ?? "—"} />
          {driver && (
            <div className="pt-3 border-t border-border">
              <div className="font-medium">{driver.name}</div>
              <div className="text-xs text-muted-foreground capitalize">
                {driver.vehicle.type} · {driver.vehicle.plate}
              </div>
            </div>
          )}
        </Card>
      </div>
      <Card className="p-4">
        <div className="text-sm font-medium mb-3">Timeline</div>
        <ol className="relative border-l border-border ml-2 space-y-4">
          {delivery.events.map((e, i) => (
            <li key={i} className="ml-4">
              <span className="absolute -left-1.5 h-3 w-3 rounded-full bg-primary border-2 border-background" />
              <div className="flex items-center gap-2">
                <DeliveryStatusBadge status={e.status} />
                <span className="text-xs text-muted-foreground">
                  {format(new Date(e.timestamp), "MMM d, HH:mm:ss")}
                </span>
              </div>
              {e.note && <div className="text-xs text-muted-foreground mt-1">{e.note}</div>}
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
      <span className="text-right truncate">{value}</span>
    </div>
  );
}
