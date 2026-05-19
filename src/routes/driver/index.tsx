import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deliveriesApi, driversApi } from "@/lib/api";
import { useMemo, useState } from "react";
import { LiveMap } from "@/components/map/LiveMap";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DeliveryStatusBadge, DriverStatusBadge } from "@/components/dashboard/StatusBadge";
import { formatDistance } from "@/lib/geo";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth";
import type { DeliveryStatus, DriverStatus } from "@/types";

export const Route = createFileRoute("/driver/")({
  component: () => (
    <AppShell requireRole="driver">
      <Inner />
    </AppShell>
  ),
});

function Inner() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [liveOn, setLiveOn] = useState(true);

  const { data: drivers = [] } = useQuery({
    queryKey: ["drivers"],
    queryFn: () => driversApi.list(),
    refetchInterval: 5000,
  });
  const { data: deliveries = [] } = useQuery({
    queryKey: ["deliveries"],
    queryFn: () => deliveriesApi.list(),
    refetchInterval: 5000,
  });

  const me = useMemo(
    () => drivers.find((d) => user?.name && d.name === user.name) ?? drivers[0],
    [drivers, user],
  );
  const current = useMemo(
    () => deliveries.find((d) => d.id === me?.activeDeliveryId) ?? null,
    [deliveries, me],
  );
  const history = useMemo(
    () =>
      deliveries
        .filter((d) => d.status === "delivered")
        .slice(0, 8),
    [deliveries],
  );

  const updateDeliveryStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: DeliveryStatus }) =>
      deliveriesApi.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["deliveries"] });
      qc.invalidateQueries({ queryKey: ["drivers"] });
      toast.success("Delivery status updated");
    },
    onError: () => {
      toast.error("Failed to update delivery status");
    },
  });

  const updateDriverStatus = useMutation({
    mutationFn: (status: DriverStatus) => driversApi.updateStatus(status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["drivers"] });
      toast.success("Status updated");
    },
  });

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            Good shift, {user?.name?.split(" ")[0] ?? "Driver"}
            {me && <DriverStatusBadge status={me.status} />}
          </h1>
          <p className="text-sm text-muted-foreground">
            {current ? "Your current delivery is below." : "No active delivery."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
            {(["active", "idle", "offline"] as DriverStatus[]).map((s) => (
              <Button
                key={s}
                size="sm"
                variant={me?.status === s ? "default" : "ghost"}
                disabled={updateDriverStatus.isPending}
                onClick={() => updateDriverStatus.mutate(s)}
                className="h-7 px-3 text-xs capitalize"
              >
                {s}
              </Button>
            ))}
          </div>
          <div className="h-6 w-px bg-border" />
          <label className="flex items-center gap-2 text-sm">
            <Switch
              checked={liveOn}
              onCheckedChange={setLiveOn}
              disabled={me?.status === "offline"}
            />
            Share live location
          </label>
        </div>
      </div>

      {current ? (
        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 p-3">
            <LiveMap
              drivers={me ? [me] : []}
              deliveries={[current]}
              focusDelivery={current}
              focusMode
              height={460}
            />
          </Card>
          <Card className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">{current.id}</div>
              <DeliveryStatusBadge status={current.status} />
            </div>
            <div className="space-y-2 text-sm">
              <Row label="Customer" value={current.customerName} />
              <Row label="Package" value={`${current.package.description} · ${current.package.weightKg}kg`} />
              <Row label="Distance" value={formatDistance(current.distanceKm)} />
              <Row label="ETA" value={`${current.etaMinutes ?? "—"} min`} />
              <Row label="Pickup" value={current.pickup.label ?? "—"} />
              <Row label="Dropoff" value={current.dropoff.label ?? "—"} />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button
                variant="outline"
                disabled={current.status !== "assigned" || updateDeliveryStatus.isPending}
                onClick={() => updateDeliveryStatus.mutate({ id: current.id, status: "picked_up" })}
              >
                {updateDeliveryStatus.isPending ? "Updating…" : "Mark picked up"}
              </Button>
              <Button
                disabled={current.status === "delivered" || current.status === "pending" || updateDeliveryStatus.isPending}
                onClick={() => updateDeliveryStatus.mutate({ id: current.id, status: "delivered" })}
              >
                {updateDeliveryStatus.isPending ? "Updating…" : "Complete delivery"}
              </Button>
            </div>
          </Card>
        </div>
      ) : (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          You have no active delivery. New assignments will appear here automatically.
        </Card>
      )}

      <Card className="p-4">
        <div className="text-sm font-medium mb-3">Recent history</div>
        <div className="divide-y divide-border">
          {history.map((d) => (
            <Link
              key={d.id}
              to="/deliveries/$id"
              params={{ id: d.id }}
              className="flex items-center justify-between py-2.5 hover:bg-accent/50 px-2 -mx-2 rounded text-sm"
            >
              <span className="flex items-center gap-3">
                <DeliveryStatusBadge status={d.status} />
                <span className="font-medium">{d.id}</span>
                <span className="text-muted-foreground hidden md:inline">
                  {d.customerName}
                </span>
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistance(d.distanceKm)} · ${d.priceUsd}
              </span>
            </Link>
          ))}
          {history.length === 0 && (
            <div className="text-sm text-muted-foreground py-6 text-center">
              No completed deliveries yet.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
      <span className="text-sm text-right truncate">{value}</span>
    </div>
  );
}
