import { useEffect, useMemo, useRef, useState } from "react";
import type { Delivery, Driver, Location } from "@/types";
import { useLivePositions } from "@/store/livePositions";
import { useUIStore } from "@/store/ui";
import { CITY_CENTER } from "@/lib/mockData";

interface Props {
  drivers?: Driver[];
  deliveries?: Delivery[];
  focusDelivery?: Delivery | null;
  /** Show only the focused delivery's route and driver. */
  focusMode?: boolean;
  /** Allow user to click on the map to drop a pin. */
  onPick?: (loc: Location) => void;
  /** Markers to render explicitly (e.g. selected pickup/dropoff). */
  pins?: { id: string; location: Location; color?: string; label?: string }[];
  height?: number | string;
  className?: string;
}

const TILE_LIGHT =
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const TILE_DARK =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

export function LiveMap(props: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <div
        className={"rounded-lg bg-muted animate-pulse " + (props.className ?? "")}
        style={{ height: props.height ?? 480 }}
      />
    );
  }
  return <LeafletMap {...props} />;
}

function LeafletMap({
  drivers = [],
  deliveries = [],
  focusDelivery = null,
  focusMode = false,
  onPick,
  pins = [],
  height = 480,
  className = "",
}: Props) {
  // Dynamic require — only on client
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const L = require("leaflet") as typeof import("leaflet");
  require("leaflet/dist/leaflet.css");

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const driverLayerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const routeLayerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const pinLayerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const driverMarkers = useRef(new Map<string, import("leaflet").Marker>());

  const theme = useUIStore((s) => s.theme);
  const positions = useLivePositions((s) => s.positions);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [CITY_CENTER.lat, CITY_CENTER.lng],
      zoom: 12,
      zoomControl: true,
      attributionControl: false,
    });
    mapRef.current = map;
    L.tileLayer(theme === "dark" ? TILE_DARK : TILE_LIGHT, {
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(map);
    driverLayerRef.current = L.layerGroup().addTo(map);
    routeLayerRef.current = L.layerGroup().addTo(map);
    pinLayerRef.current = L.layerGroup().addTo(map);

    if (onPick) {
      map.on("click", (e) => onPick({ lat: e.latlng.lat, lng: e.latlng.lng }));
    }
    return () => {
      map.remove();
      mapRef.current = null;
      driverMarkers.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Swap tile layer when theme changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.eachLayer((layer) => {
      // @ts-expect-error _url is internal but stable
      if (layer._url) map.removeLayer(layer);
    });
    L.tileLayer(theme === "dark" ? TILE_DARK : TILE_LIGHT, {
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(map);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  // Render driver markers (with smooth position updates)
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
      const existing = driverMarkers.current.get(drv.id);
      if (existing) {
        existing.setLatLng([pos.lat, pos.lng]);
      } else {
        const icon = L.divIcon({
          className: "",
          html: driverIconHtml(drv.status),
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });
        const m = L.marker([pos.lat, pos.lng], { icon }).bindTooltip(
          `<strong>${escapeHtml(drv.name)}</strong><br/>${drv.vehicle.type.toUpperCase()} · ${escapeHtml(drv.vehicle.plate)}`,
          { direction: "top", offset: [0, -8] },
        );
        m.addTo(layer);
        driverMarkers.current.set(drv.id, m);
      }
    }
    // remove markers no longer visible
    for (const [id, m] of driverMarkers.current.entries()) {
      if (!existingIds.has(id)) {
        layer.removeLayer(m);
        driverMarkers.current.delete(id);
      }
    }
  }, [visibleDrivers, positions, L]);

  // Render routes for active deliveries + pickup/dropoff pins
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

    if (focusMode && focusDelivery) {
      const bounds = L.latLngBounds([
        [focusDelivery.pickup.lat, focusDelivery.pickup.lng],
        [focusDelivery.dropoff.lat, focusDelivery.dropoff.lng],
      ]);
      mapRef.current?.fitBounds(bounds, { padding: [60, 60] });
    }
  }, [deliveries, focusDelivery, focusMode, L]);

  // Custom pins (for customer pickup/dropoff selector)
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
  return `
    <div style="position:relative;width:22px;height:22px;">
      <div style="position:absolute;inset:-6px;border-radius:9999px;background:${color};opacity:0.18;"></div>
      <div style="position:absolute;inset:0;border-radius:9999px;background:${color};border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.4);"></div>
    </div>
  `;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}
