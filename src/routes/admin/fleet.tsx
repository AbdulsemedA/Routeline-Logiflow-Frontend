import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useQuery } from "@tanstack/react-query";
import { driversApi } from "@/lib/api";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DriverStatusBadge } from "@/components/dashboard/StatusBadge";
import { Star } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/fleet")({
  component: FleetPage,
});

function FleetPage() {
  return (
    <AppShell requireRole="admin">
      <FleetInner />
    </AppShell>
  );
}

function FleetInner() {
  const { data: drivers = [] } = useQuery({
    queryKey: ["drivers"],
    queryFn: () => driversApi.list(),
    refetchInterval: 6000,
  });
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const filtered = useMemo(
    () =>
      drivers.filter(
        (d) =>
          d.name.toLowerCase().includes(q.toLowerCase()) ||
          d.vehicle.plate.toLowerCase().includes(q.toLowerCase()),
      ),
    [drivers, q],
  );
  const pageData = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Fleet</h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} drivers · {drivers.filter((d) => d.status === "active").length} active
          </p>
        </div>
        <Input
          placeholder="Search by name or plate…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(0);
          }}
          className="w-64"
        />
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Driver</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead className="text-right">Rating</TableHead>
              <TableHead className="text-right">Deliveries</TableHead>
              <TableHead className="text-right">On-time</TableHead>
              <TableHead>Location</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.map((d) => (
              <TableRow key={d.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                      {d.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{d.name}</div>
                      <div className="text-xs text-muted-foreground">{d.phone}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell><DriverStatusBadge status={d.status} /></TableCell>
                <TableCell>
                  <div className="text-sm capitalize">{d.vehicle.type}</div>
                  <div className="text-xs text-muted-foreground font-mono">{d.vehicle.plate}</div>
                </TableCell>
                <TableCell className="text-right">
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-400 stroke-amber-400" />
                    {d.rating.toFixed(2)}
                  </span>
                </TableCell>
                <TableCell className="text-right tabular-nums">{d.deliveriesCompleted}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {(d.onTimeRate * 100).toFixed(1)}%
                </TableCell>
                <TableCell className="text-xs text-muted-foreground font-mono">
                  {d.currentLocation.lat.toFixed(4)}, {d.currentLocation.lng.toFixed(4)}
                </TableCell>
              </TableRow>
            ))}
            {pageData.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No drivers match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Page {page + 1} of {pages}
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
