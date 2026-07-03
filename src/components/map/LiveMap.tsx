import { useEffect, useMemo, useRef, useState } from "react";
import type * as LeafletNS from "leaflet";
import type { Delivery, Driver, Location } from "@/types";
import { useLivePositions } from "@/store/livePositions";
import { useUIStore } from "@/store/ui";
import { CITY_CENTER } from "@/lib/mockData";

interface Props {
  drivers?: Driver[];
  deliveries?: Delivery[];
  focusDelivery?: Delivery | null;
  focusMode?: boolean;
  onPick?: (loc: Location) => void;
  pins?: { id: string; location: Location; color?: string; label?: string }[];
  height?: number | string;
  className?: string;
}

const TILE_LIGHT =
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const TILE_DARK =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

export function LiveMap(props: Props) {
  const [L, setL] = useState<typeof LeafletNS | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const mod = await import("leaflet");
      await import("leaflet/dist/leaflet.css");
      if (!cancelled) setL(mod.default ?? (mod as unknown as typeof LeafletNS));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!L) {
    return (
      <div
        className={"rounded-lg bg-muted animate-pulse " + (props.className ?? "")}
        style={{ height: props.height ?? 480 }}
      />
    );
  }
  return <LeafletMap L={L} {...props} />;
}

function LeafletMap({
  L,
  drivers = [],
  deliveries = [],
  focusDelivery = null,
  focusMode = false,
  onPick,
  pins = [],
  height = 480,
  className = "",
}: Props & { L: typeof LeafletNS }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletNS.Map | null>(null);
  const driverLayerRef = useRef<LeafletNS.LayerGroup | null>(null);
  const routeLayerRef = useRef<LeafletNS.LayerGroup | null>(null);
  const pinLayerRef = useRef<LeafletNS.LayerGroup | null>(null);
  const tileLayerRef = useRef<LeafletNS.TileLayer | null>(null);
  const driverMarkers = useRef(new Map<string, LeafletNS.Marker>());

  const theme = useUIStore((s) => s.theme);
  const positions = useLivePositions((s) => s.positions);

  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [CITY_CENTER.lat, CITY_CENTER.lng],
      zoom: 12,
      zoomControl: true,
      attributionControl: false,
    });
    mapRef.current = map;
    tileLayerRef.current = L.tileLayer(theme === "dark" ? TILE_DARK : TILE_LIGHT, {
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(map);
    driverLayerRef.current = L.layerGroup().addTo(map);
    routeLayerRef.current = L.layerGroup().addTo(map);
    pinLayerRef.current = L.layerGroup().addTo(map);
    map.on("click", (e: LeafletNS.LeafletMouseEvent) => {
      onPickRef.current?.({ lat: e.latlng.lat, lng: e.latlng.lng });
    });
    return () => {
      map.remove();
      mapRef.current = null;
      driverMarkers.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [L]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !tileLayerRef.current) return;
    map.removeLayer(tileLayerRef.current);
    tileLayerRef.current = L.tileLayer(theme === "dark" ? TILE_DARK : TILE_LIGHT, {
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(map);
  }, [theme, L]);

  const visibleDrivers = useMemo(() => {
    if (focusMode && focusDelivery?.assignedDriverId) {
      return drivers.filter((d) => d.id === focusDelivery.assignedDriverId);
    }
    return drivers.filter((d) => d.status !== "offline");
  }, [drivers, focusMode, focusDelivery]);

  useEffect(() => {
    const layer = driverLayerRef.current;
    if (!layer) return;
    const existingIds = new Set<string>();
    for (const drv of visibleDrivers) {
      existingIds.add(drv.id);
      const pos = positions[drv.id] ?? drv.currentLocation;
      const tooltipContent = driverTooltipHtml(drv, pos);
      const existing = driverMarkers.current.get(drv.id);
      if (existing) {
        existing.setLatLng([pos.lat, pos.lng]);
        existing.setTooltipContent(tooltipContent);
      } else {
        const icon = L.divIcon({
          className: "",
          html: driverIconHtml(drv.status),
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });
        const m = L.marker([pos.lat, pos.lng], { icon }).bindTooltip(
          tooltipContent,
          { direction: "top", offset: [0, -14] },
        );
        m.addTo(layer);
        driverMarkers.current.set(drv.id, m);
      }
    }
    for (const [id, m] of driverMarkers.current.entries()) {
      if (!existingIds.has(id)) {
        layer.removeLayer(m);
        driverMarkers.current.delete(id);
      }
    }
  }, [visibleDrivers, positions, L]);

  useEffect(() => {
    const layer = routeLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    const list = focusMode && focusDelivery ? [focusDelivery] : deliveries;
    for (const d of list) {
      if (!["assigned", "picked_up", "in_transit"].includes(d.status) && !focusMode) continue;
      if (d.route.length > 1) {
        L.polyline(
          d.route.map((p) => [p.lat, p.lng] as [number, number]),
          {
            color: d.status === "in_transit" ? "#22c55e" : "#3b82f6",
            weight: 3,
            opacity: 0.7,
            dashArray: d.status === "assigned" ? "6 6" : undefined,
          },
        ).addTo(layer);
      }
      L.circleMarker([d.pickup.lat, d.pickup.lng], {
        radius: 5,
        color: "#10b981",
        fillColor: "#10b981",
        fillOpacity: 1,
        weight: 2,
      })
        .bindTooltip(`Pickup · ${escapeHtml(d.pickup.label ?? "")}`)
        .addTo(layer);
      L.circleMarker([d.dropoff.lat, d.dropoff.lng], {
        radius: 5,
        color: "#ef4444",
        fillColor: "#ef4444",
        fillOpacity: 1,
        weight: 2,
      })
        .bindTooltip(`Dropoff · ${escapeHtml(d.dropoff.label ?? "")}`)
        .addTo(layer);
    }

    if (focusMode && focusDelivery && mapRef.current) {
      const bounds = L.latLngBounds([
        [focusDelivery.pickup.lat, focusDelivery.pickup.lng],
        [focusDelivery.dropoff.lat, focusDelivery.dropoff.lng],
      ]);
      mapRef.current.fitBounds(bounds, { padding: [60, 60] });
    }
  }, [deliveries, focusDelivery, focusMode, L]);

  useEffect(() => {
    const layer = pinLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    for (const p of pins) {
      const icon = L.divIcon({
        className: "",
        html: `<div style="background:${p.color ?? "#3b82f6"};width:14px;height:14px;border-radius:9999px;border:3px solid white;box-shadow:0 0 0 1px rgba(0,0,0,0.25);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      L.marker([p.location.lat, p.location.lng], { icon })
        .bindTooltip(p.label ?? "")
        .addTo(layer);
    }
  }, [pins, L]);

  return (
    <div
      ref={containerRef}
      className={"rounded-lg overflow-hidden border border-border " + className}
      style={{ height }}
    />
  );
}

function driverIconHtml(status: "active" | "idle" | "offline") {
  const color =
    status === "active" ? "#22c55e" : status === "idle" ? "#eab308" : "#6b7280";
  const pulseClass = status !== "offline" ? "driver-pulse-ring" : "";
  return `
    <div style="position:relative;width:36px;height:36px;">
      <div class="${pulseClass}" style="position:absolute;inset:-8px;border-radius:9999px;background:${color};opacity:0.15;"></div>
      <div style="position:absolute;inset:0;border-radius:9999px;background:${color};border:2.5px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="18" height="18">
          <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
        </svg>
      </div>
    </div>
  `;
}

function driverTooltipHtml(drv: { name: string; vehicle: { type: string; plate: string } }, pos: { lat: number; lng: number }) {
  return `<strong>${escapeHtml(drv.name)}</strong><br/>${drv.vehicle.type.toUpperCase()} · ${escapeHtml(drv.vehicle.plate)}<br/><span style="font-size:11px;color:#888;">📍 ${Number(pos.lat).toFixed(4)}, ${Number(pos.lng).toFixed(4)}</span>`;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}
