import type { Location } from "@/types";

export function haversineKm(a: Location, b: Location): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sa =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(sa));
}

// Linear interpolate along a polyline by fraction 0..1
export function interpolateRoute(route: Location[], t: number): Location {
  if (route.length === 0) return { lat: 0, lng: 0 };
  if (route.length === 1) return route[0];
  const clamped = Math.max(0, Math.min(1, t));
  // total length
  const segs: number[] = [];
  let total = 0;
  for (let i = 0; i < route.length - 1; i++) {
    const d = haversineKm(route[i], route[i + 1]);
    segs.push(d);
    total += d;
  }
  if (total === 0) return route[0];
  let target = clamped * total;
  for (let i = 0; i < segs.length; i++) {
    if (target <= segs[i]) {
      const f = segs[i] === 0 ? 0 : target / segs[i];
      const a = route[i];
      const b = route[i + 1];
      return { lat: a.lat + (b.lat - a.lat) * f, lng: a.lng + (b.lng - a.lng) * f };
    }
    target -= segs[i];
  }
  return route[route.length - 1];
}

export function buildRoute(from: Location, to: Location, steps = 24): Location[] {
  // Add slight curvature for visual variety
  const points: Location[] = [];
  const midLat = (from.lat + to.lat) / 2;
  const midLng = (from.lng + to.lng) / 2;
  // perpendicular offset
  const dx = to.lng - from.lng;
  const dy = to.lat - from.lat;
  const offset = 0.18;
  const cx = midLng - dy * offset;
  const cy = midLat + dx * offset;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // quadratic bezier
    const lng =
      (1 - t) ** 2 * from.lng + 2 * (1 - t) * t * cx + t ** 2 * to.lng;
    const lat =
      (1 - t) ** 2 * from.lat + 2 * (1 - t) * t * cy + t ** 2 * to.lat;
    points.push({ lat, lng });
  }
  return points;
}

export function etaMinutes(distanceKm: number, avgKph = 32): number {
  return Math.max(1, Math.round((distanceKm / avgKph) * 60));
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}
