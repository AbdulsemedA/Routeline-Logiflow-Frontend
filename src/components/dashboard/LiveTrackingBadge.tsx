import { useLivePositions } from "@/store/livePositions";

interface Props {
  /** When provided, checks if this specific driver has a live position */
  driverId?: string;
}

/**
 * A small pulsing "● LIVE" badge that lights up green when a real-time
 * position exists in the useLivePositions store.
 */
export function LiveTrackingBadge({ driverId }: Props) {
  const hasLive = useLivePositions((s) => {
    if (driverId) return !!s.positions[driverId];
    return Object.keys(s.positions).length > 0;
  });

  if (!hasLive) return null;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-emerald-500 uppercase select-none">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      Live
    </span>
  );
}
