import type {
  Delivery,
  DeliveryStatus,
  Driver,
  Location,
  Vehicle,
} from "@/types";
import { buildRoute, etaMinutes, haversineKm } from "./geo";

// San Francisco-ish center
export const CITY_CENTER: Location = { lat: 37.7749, lng: -122.4194 };

const FIRST = [
  "Alex",
  "Jordan",
  "Sam",
  "Taylor",
  "Morgan",
  "Casey",
  "Riley",
  "Quinn",
  "Avery",
  "Jamie",
  "Drew",
  "Reese",
  "Skyler",
  "Hayden",
  "Rowan",
];
const LAST = [
  "Patel",
  "Garcia",
  "Nguyen",
  "Kim",
  "Brown",
  "Davis",
  "Lopez",
  "Khan",
  "Silva",
  "Mori",
  "Wright",
  "Adams",
  "Foster",
  "Chen",
  "Park",
];

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
function randInt(min: number, max: number) {
  return Math.floor(rand(min, max + 1));
}
function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}
function randLocation(center: Location, radiusKm = 6): Location {
  const r = radiusKm / 111;
  const u = Math.random();
  const v = Math.random();
  const w = r * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  return {
    lat: center.lat + w * Math.cos(t),
    lng: center.lng + (w * Math.sin(t)) / Math.cos((center.lat * Math.PI) / 180),
  };
}

const VEHICLE_TYPES: Vehicle["type"][] = ["van", "truck", "bike", "car"];

function makeVehicle(i: number): Vehicle {
  const type = pick(VEHICLE_TYPES);
  return {
    id: `veh_${i}`,
    type,
    plate: `${pick(["7B", "9C", "3F", "8K"])}${randInt(100, 999)}-${randInt(10, 99)}`,
    capacityKg: type === "truck" ? 1200 : type === "van" ? 600 : type === "car" ? 120 : 25,
  };
}

export function generateDrivers(n = 14): Driver[] {
  const drivers: Driver[] = [];
  for (let i = 0; i < n; i++) {
    const status =
      i < n * 0.6 ? "active" : i < n * 0.85 ? "idle" : "offline";
    drivers.push({
      id: `drv_${i + 1}`,
      name: `${pick(FIRST)} ${pick(LAST)}`,
      phone: `+1 415 555 0${randInt(100, 999)}`,
      status,
      currentLocation: randLocation(CITY_CENTER, 5),
      vehicle: makeVehicle(i + 1),
      rating: Number((4 + Math.random()).toFixed(2)),
      deliveriesCompleted: randInt(40, 900),
      onTimeRate: Number((0.85 + Math.random() * 0.14).toFixed(3)),
    });
  }
  return drivers;
}

const PKG_DESC = [
  "Documents",
  "Electronics",
  "Apparel",
  "Groceries",
  "Furniture",
  "Medical supplies",
  "Auto parts",
  "Books",
  "Food order",
];

const CUSTOMERS = [
  "Northwind Co.",
  "Acme Logistics",
  "Globex Corp",
  "Initech",
  "Umbrella Foods",
  "Stark Industries",
  "Wayne Enterprises",
  "Hooli",
  "Pied Piper",
  "Soylent",
];

const STATUSES: DeliveryStatus[] = [
  "pending",
  "pending",
  "assigned",
  "picked_up",
  "in_transit",
  "in_transit",
  "delivered",
];

export function generateDeliveries(drivers: Driver[], n = 22): Delivery[] {
  const out: Delivery[] = [];
  const now = Date.now();
  for (let i = 0; i < n; i++) {
    const pickup = randLocation(CITY_CENTER, 4);
    const dropoff = randLocation(CITY_CENTER, 7);
    const status = pick(STATUSES);
    const createdAt = new Date(now - randInt(2, 240) * 60_000).toISOString();
    const distanceKm = Number(haversineKm(pickup, dropoff).toFixed(2));
    const route = buildRoute(pickup, dropoff);
    const assignableDrivers = drivers.filter((d) => d.status !== "offline");
    const driver =
      status === "pending" ? undefined : pick(assignableDrivers);
    const events = buildEvents(status, createdAt, driver?.id);
    out.push({
      id: `dlv_${1000 + i}`,
      customerId: `cus_${i}`,
      customerName: pick(CUSTOMERS),
      pickup: { ...pickup, label: addressLabel() },
      dropoff: { ...dropoff, label: addressLabel() },
      package: {
        description: pick(PKG_DESC),
        weightKg: Number(rand(0.2, 30).toFixed(1)),
        fragile: Math.random() < 0.25,
      },
      status,
      assignedDriverId: driver?.id,
      createdAt,
      etaMinutes: etaMinutes(distanceKm),
      distanceKm,
      priceUsd: Number((6 + distanceKm * 1.7).toFixed(2)),
      route,
      events,
    });
  }
  // Link drivers to active deliveries
  for (const d of out) {
    if (
      d.assignedDriverId &&
      (d.status === "assigned" || d.status === "picked_up" || d.status === "in_transit")
    ) {
      const drv = drivers.find((x) => x.id === d.assignedDriverId);
      if (drv && !drv.activeDeliveryId) drv.activeDeliveryId = d.id;
    }
  }
  return out;
}

function buildEvents(
  status: DeliveryStatus,
  createdAt: string,
  driverId?: string,
) {
  const chain: DeliveryStatus[] = [
    "pending",
    "assigned",
    "picked_up",
    "in_transit",
    "delivered",
  ];
  const idx = chain.indexOf(status);
  const start = new Date(createdAt).getTime();
  const events = [];
  for (let i = 0; i <= idx; i++) {
    events.push({
      status: chain[i],
      timestamp: new Date(start + i * randInt(4, 18) * 60_000).toISOString(),
      actorId: i === 0 ? undefined : driverId,
    });
  }
  return events;
}

const STREETS = [
  "Market St",
  "Mission St",
  "Valencia St",
  "Folsom St",
  "Bryant St",
  "Howard St",
  "Geary Blvd",
  "Divisadero St",
  "Castro St",
  "Polk St",
];
function addressLabel(): string {
  return `${randInt(100, 4900)} ${pick(STREETS)}`;
}
