import { useEffect } from "react";
import { socket } from "@/lib/socket";
import { useLivePositions } from "@/store/livePositions";
import { useQueryClient } from "@tanstack/react-query";
import { driversApi } from "@/lib/api";

/**
 * Wires the mock socket into client state on mount.
 * - driver:move -> live positions store
 * - delivery:status / order:new / dispatch:assigned -> invalidate queries
 */
export function useRealtimeBridge() {
  const setOne = useLivePositions((s) => s.setOne);
  const setMany = useLivePositions((s) => s.setMany);
  const qc = useQueryClient();

  useEffect(() => {
    let cancelled = false;
    // Seed positions from current driver list
    driversApi.list().then((list) => {
      if (cancelled) return;
      const seed: Record<string, { lat: number; lng: number }> = {};
      for (const d of list) seed[d.id] = d.currentLocation;
      setMany(seed);
    });

    const offMove = socket.on("driver:move", ({ driverId, location }) => {
      setOne(driverId, location);
    });
    const offStatus = socket.on("delivery:status", () => {
      qc.invalidateQueries({ queryKey: ["deliveries"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
    });
    const offNew = socket.on("order:new", () => {
      qc.invalidateQueries({ queryKey: ["deliveries"] });
    });
    const offAssign = socket.on("dispatch:assigned", () => {
      qc.invalidateQueries({ queryKey: ["deliveries"] });
      qc.invalidateQueries({ queryKey: ["drivers"] });
    });
    return () => {
      cancelled = true;
      offMove();
      offStatus();
      offNew();
      offAssign();
    };
  }, [setOne, setMany, qc]);
}
