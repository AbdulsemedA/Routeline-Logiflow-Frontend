import { cn } from "@/lib/utils";
import type { DeliveryStatus, DriverStatus } from "@/types";

const DELIVERY_STYLES: Record<DeliveryStatus, string> = {
  pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  assigned: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  picked_up: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
  in_transit: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  delivered: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
};

const DELIVERY_LABEL: Record<DeliveryStatus, string> = {
  pending: "Pending",
  assigned: "Assigned",
  picked_up: "Picked up",
  in_transit: "In transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function DeliveryStatusBadge({ status }: { status: DeliveryStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border",
        DELIVERY_STYLES[status],
      )}
    >
      {DELIVERY_LABEL[status]}
    </span>
  );
}

const DRIVER_STYLES: Record<DriverStatus, string> = {
  active: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  idle: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  offline: "bg-muted text-muted-foreground border-border",
};

export function DriverStatusBadge({ status }: { status: DriverStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border capitalize",
        DRIVER_STYLES[status],
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "active" && "bg-emerald-500",
          status === "idle" && "bg-amber-500",
          status === "offline" && "bg-muted-foreground",
        )}
      />
      {status}
    </span>
  );
}
