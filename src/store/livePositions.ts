import { create } from "zustand";
import type { Location } from "@/types";

interface LivePositionsState {
  positions: Record<string, Location>;
  setMany: (entries: Record<string, Location>) => void;
  setOne: (driverId: string, location: Location) => void;
}

export const useLivePositions = create<LivePositionsState>((set) => ({
  positions: {},
  setMany: (entries) =>
    set((s) => ({ positions: { ...s.positions, ...entries } })),
  setOne: (driverId, location) =>
    set((s) => ({ positions: { ...s.positions, [driverId]: location } })),
}));
