import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { LiveMap } from "@/components/map/LiveMap";
import { StatCard } from "@/components/dashboard/StatCard";
import { DeliveryStatusBadge } from "@/components/dashboard/StatusBadge";
import { AssignDriverDialog } from "@/components/dispatch/AssignDriverDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { deliveriesApi, driversApi, analyticsApi } from "@/lib/api";
import {
  Activity,
  Clock,
  Package,
  Sparkles,
  Truck,
  TrendingUp,
} from "lucide-react";
import { formatDistance } from "@/lib/geo";
import { formatDistanceToNow } from "date-fns";
import type { Delivery } from "@/types";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <AppShell requireRole="admin">
      <DashboardInner />
    </AppShell>
  );
}

function DashboardInner() {
  const [assigning, setAssigning] = useState<Delivery | null>(null);

  const { data: summary } = useQuery({
    queryKey: ["analytics", "summary"],
    queryFn: () => analyticsApi.summary(),
    refetchInterval: 6000,
  });
  const { data: deliveries = [] } = useQuery({
    queryKey: ["deliveries"],
    queryFn: () => deliveriesApi.list(),
    refetchInterval: 5000,
  });
  const { data: drivers = [] } = useQuery({
    queryKey: ["drivers"],
    queryFn: () => driversApi.list(),
    refetchInterval: 8000,
  });

  const pending = useMemo(
    () =>
      deliveries
        .filter((d) => d.status === "pending")
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
        .slice(0, 8),
    [deliveries],
  );

  const recent = useMemo(
    () =>
      deliveries
        .slice()
        .sort(
          (a, b) =>
            +new Date(b.events[b.events.length - 1]?.timestamp ?? b.createdAt) -
            +new Date(a.events[a.events.length - 1]?.timestamp ?? a.createdAt),
        )
        .slice(0, 6),
    [deliveries],
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Dispatch overview</h1>
        <p className="text-sm text-muted-foreground">
          Live operational view of your fleet and orders.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard
          label="Active deliveries"
          value={summary?.activeDeliveries ?? "—"}
          icon={Package}
          tone="success"
        />
        <StatCard
          label="Active drivers"
          value={`${summary?.activeDrivers ?? "—"} / ${summary?.totalDrivers ?? "—"}`}
          icon={Truck}
        />
        <StatCard
          label="Completed today"
          value={summary?.completedToday ?? "—"}
          icon={TrendingUp}
          tone="success"
        />
        <StatCard
          label="Avg delivery"
          value={summary ? `${summary.avgDeliveryMin}m` : "—"}
          icon={Clock}
        />
        <StatCard
          label="System"
          value="Operational"
          icon={Activity}
          tone="success"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-3">
          <div className="flex items-center justify-between mb-3 px-1">
            <div>
              <div className="text-sm font-medium">Live fleet map</div>
              <div className="text-xs text-muted-foreground">
                {drivers.filter((d) => d.status !== "offline").length} drivers visible · updates every 1.5s
              </div>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <Legend color="#22c55e" label="Active" />
              <Legend color="#eab308" label="Idle" />
              <Legend color="#3b82f6" label="Assigned route" />
              <Legend color="#10b981" label="Pickup" />
              <Legend color="#ef4444" label="Dropoff" />
            </div>
          </div>
          <LiveMap drivers={drivers} deliveries={deliveries} height={520} />
        </Card>

        <Card className="p-4 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm font-medium">Pending orders</div>
              <div className="text-xs text-muted-foreground">
                {pending.length} awaiting assignment
              </div>
            </div>
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div className="space-y-2 overflow-y-auto pr-1 max-h-[480px]">
            {pending.map((d) => (
              <div
                key={d.id}
                className="rounded-md border border-border p-3 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Link
                    to="/deliveries/$id"
                    params={{ id: d.id }}
                    className="text-sm font-medium hover:underline"
                  >
                    {d.id}
                  </Link>
                  <DeliveryStatusBadge status={d.status} />
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <div className="truncate">{d.customerName}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500">●</span>
                    <span className="truncate">{d.pickup.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-500">●</span>
                    <span className="truncate">{d.dropoff.label}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span>{formatDistance(d.distanceKm)} · ${d.priceUsd}</span>
                    <span>
                      {formatDistanceToNow(new Date(d.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => setAssigning(d)}
                >
                  Assign driver
                </Button>
              </div>
            ))}
            {pending.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-8">
                No pending orders. New orders will appear here.
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium">Recent activity</div>
          <Link
            to="/admin/analytics"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            View analytics →
          </Link>
        </div>
        <div className="divide-y divide-border">
          {recent.map((d) => {
            const ev = d.events[d.events.length - 1];
            return (
              <Link
                key={d.id}
                to="/deliveries/$id"
                params={{ id: d.id }}
                className="flex items-center justify-between py-2.5 hover:bg-accent/50 px-2 -mx-2 rounded"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <DeliveryStatusBadge status={d.status} />
                  <span className="text-sm font-medium">{d.id}</span>
                  <span className="text-xs text-muted-foreground truncate hidden md:inline">
                    {d.customerName} · {d.pickup.label} → {d.dropoff.label}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatDistanceToNow(new Date(ev?.timestamp ?? d.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </Link>
            );
          })}
        </div>
      </Card>

      <AssignDriverDialog
        delivery={assigning}
        drivers={drivers}
        onClose={() => setAssigning(null)}
      />
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
