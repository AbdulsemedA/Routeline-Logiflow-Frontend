import { useMemo, useState } from "react";
import type { Delivery, Driver } from "@/types";
import { haversineKm } from "@/lib/geo";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Star, Truck } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deliveriesApi } from "@/lib/api";
import { toast } from "sonner";
import { DriverStatusBadge } from "@/components/dashboard/StatusBadge";
import { formatDistance } from "@/lib/geo";

interface Props {
  delivery: Delivery | null;
  drivers: Driver[];
  onClose: () => void;
}

interface Scored {
  driver: Driver;
  distanceKm: number;
  score: number;
}

export function AssignDriverDialog({ delivery, drivers, onClose }: Props) {
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const ranked = useMemo<Scored[]>(() => {
    if (!delivery) return [];
    return drivers
      .filter((d) => d.status !== "offline" && !d.activeDeliveryId)
      .map((d) => {
        const distanceKm = haversineKm(d.currentLocation, delivery.pickup);
        // Lower distance, higher rating + on-time = better
        const score =
          d.rating * 18 + d.onTimeRate * 40 - distanceKm * 6;
        return { driver: d, distanceKm, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [delivery, drivers]);

  const suggested = ranked[0];

  const assign = useMutation({
    mutationFn: (driverId: string) =>
      deliveriesApi.assign(delivery!.id, driverId),
    onSuccess: (_, driverId) => {
      const drv = drivers.find((d) => d.id === driverId);
      toast.success(`Assigned to ${drv?.name ?? "driver"}`);
      qc.invalidateQueries({ queryKey: ["deliveries"] });
      qc.invalidateQueries({ queryKey: ["drivers"] });
      onClose();
    },
    onError: () => toast.error("Failed to assign driver"),
  });

  const open = !!delivery;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign driver</DialogTitle>
          <DialogDescription>
            {delivery
              ? `Order ${delivery.id} · ${formatDistance(delivery.distanceKm)} · ${delivery.customerName}`
              : ""}
          </DialogDescription>
        </DialogHeader>

        {suggested && (
          <div className="rounded-lg border border-primary/40 bg-primary/5 p-3">
            <div className="flex items-center gap-2 text-xs font-medium text-primary mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              Smart suggestion
            </div>
            <DriverRow
              scored={suggested}
              selected={selectedId === suggested.driver.id}
              onSelect={() => setSelectedId(suggested.driver.id)}
            />
          </div>
        )}

        <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
          {ranked.slice(1).map((s) => (
            <DriverRow
              key={s.driver.id}
              scored={s}
              selected={selectedId === s.driver.id}
              onSelect={() => setSelectedId(s.driver.id)}
            />
          ))}
          {ranked.length === 0 && (
            <div className="text-sm text-muted-foreground p-4 text-center">
              No available drivers right now.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!selectedId && !suggested}
            onClick={() =>
              assign.mutate(selectedId ?? suggested!.driver.id)
            }
          >
            {assign.isPending ? "Assigning…" : "Assign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DriverRow({
  scored,
  selected,
  onSelect,
}: {
  scored: Scored;
  selected: boolean;
  onSelect: () => void;
}) {
  const { driver, distanceKm } = scored;
  return (
    <button
      type="button"
      onClick={onSelect}
      className={
        "w-full flex items-center gap-3 p-2 rounded-md border text-left transition-colors " +
        (selected
          ? "border-primary bg-primary/10"
          : "border-border hover:bg-accent")
      }
    >
      <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
        {driver.name
          .split(" ")
          .map((p) => p[0])
          .slice(0, 2)
          .join("")}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{driver.name}</span>
          <DriverStatusBadge status={driver.status} />
        </div>
        <div className="text-xs text-muted-foreground flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Truck className="h-3 w-3" /> {driver.vehicle.type}
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-amber-400 stroke-amber-400" />{" "}
            {driver.rating.toFixed(2)}
          </span>
          <span>{formatDistance(distanceKm)} away</span>
        </div>
      </div>
    </button>
  );
}
