import type { Delivery, Driver, DeliveryStatus, Location } from "@/types";
import { generateDeliveries, generateDrivers, CITY_CENTER } from "./mockData";
import { buildRoute, etaMinutes, haversineKm, interpolateRoute } from "./geo";
import { socket } from "./socket";

// In-memory "database"
let drivers: Driver[] = [];
let deliveries: Delivery[] = [];
let initialized = false;
// Per-driver progress along their active delivery route (0..1)
const progress = new Map<string, number>();

function init() {
  if (initialized) return;
  drivers = generateDrivers(16);
  deliveries = generateDeliveries(drivers, 24);
  // initialize progress for in-transit deliveries
  for (const d of deliveries) {
    if (d.assignedDriverId && (d.status === "picked_up" || d.status === "in_transit")) {
      progress.set(d.assignedDriverId, Math.random() * 0.7);
    }
  }
  initialized = true;
  startSimulation();
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function delay<T>(value: T, ms = 220): Promise<T> {
  await sleep(ms + Math.random() * 120);
  return value;
}

// ---------- Auth ----------
export const authApi = {
  async login(email: string, _password: string) {
    return delay({
      id: "usr_self",
      name: email.split("@")[0] || "User",
      email,
      role: "admin" as const,
    });
  },
  async register(name: string, email: string, _password: string) {
    return delay({
      id: "usr_self",
      name,
      email,
      role: "customer" as const,
    });
  },
};

// ---------- Drivers ----------
export const driversApi = {
  async list(): Promise<Driver[]> {
    init();
    return delay([...drivers]);
  },
  async get(id: string): Promise<Driver | undefined> {
    init();
    return delay(drivers.find((d) => d.id === id));
  },
};

// ---------- Deliveries ----------
export const deliveriesApi = {
  async list(): Promise<Delivery[]> {
    init();
    return delay([...deliveries]);
  },
  async get(id: string): Promise<Delivery | undefined> {
    init();
    return delay(deliveries.find((d) => d.id === id));
  },
  async create(input: {
    customerName: string;
    pickup: Location;
    dropoff: Location;
    description: string;
    weightKg: number;
    fragile: boolean;
  }): Promise<Delivery> {
    init();
    const dist = Number(haversineKm(input.pickup, input.dropoff).toFixed(2));
    const route = buildRoute(input.pickup, input.dropoff);
    const now = new Date().toISOString();
    const delivery: Delivery = {
      id: `dlv_${Date.now()}`,
      customerId: "cus_self",
      customerName: input.customerName,
      pickup: input.pickup,
      dropoff: input.dropoff,
      package: {
        description: input.description,
        weightKg: input.weightKg,
        fragile: input.fragile,
      },
      status: "pending",
      createdAt: now,
      etaMinutes: etaMinutes(dist),
      distanceKm: dist,
      priceUsd: Number((6 + dist * 1.7).toFixed(2)),
      route,
      events: [{ status: "pending", timestamp: now }],
    };
    deliveries = [delivery, ...deliveries];
    socket.emit("order:new", { delivery });
    return delay(delivery);
  },
  async assign(deliveryId: string, driverId: string): Promise<Delivery> {
    init();
    const dlv = deliveries.find((d) => d.id === deliveryId);
    const drv = drivers.find((d) => d.id === driverId);
    if (!dlv || !drv) throw new Error("Not found");
    dlv.status = "assigned";
    dlv.assignedDriverId = driverId;
    dlv.events.push({
      status: "assigned",
      timestamp: new Date().toISOString(),
      actorId: driverId,
    });
    drv.activeDeliveryId = deliveryId;
    drv.status = "active";
    progress.set(driverId, 0);
    socket.emit("dispatch:assigned", { deliveryId, driverId });
    socket.emit("delivery:status", { deliveryId, status: "assigned" });
    return delay(dlv);
  },
  async updateStatus(deliveryId: string, status: DeliveryStatus): Promise<Delivery> {
    init();
    const dlv = deliveries.find((d) => d.id === deliveryId);
    if (!dlv) throw new Error("Not found");
    dlv.status = status;
    dlv.events.push({
      status,
      timestamp: new Date().toISOString(),
      actorId: dlv.assignedDriverId,
    });
    if (status === "delivered" && dlv.assignedDriverId) {
      const drv = drivers.find((d) => d.id === dlv.assignedDriverId);
      if (drv) {
        drv.activeDeliveryId = undefined;
        drv.status = "idle";
        drv.deliveriesCompleted += 1;
      }
    }
    socket.emit("delivery:status", { deliveryId, status });
    return delay(dlv);
  },
};

// ---------- Analytics ----------
export const analyticsApi = {
  async summary() {
    init();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTs = today.getTime();
    const completedToday = deliveries.filter(
      (d) =>
        d.status === "delivered" &&
        new Date(d.events[d.events.length - 1].timestamp).getTime() >= todayTs,
    ).length;
    const active = deliveries.filter((d) =>
      ["assigned", "picked_up", "in_transit"].includes(d.status),
    ).length;
    const activeDrivers = drivers.filter((d) => d.status === "active").length;
    const avgEta =
      deliveries.reduce((sum, d) => sum + (d.etaMinutes ?? 0), 0) /
      Math.max(1, deliveries.length);
    return delay({
      activeDeliveries: active,
      activeDrivers,
      completedToday,
      avgDeliveryMin: Number(avgEta.toFixed(1)),
      totalDrivers: drivers.length,
    });
  },
  async series() {
    init();
    // 14-day deliveries-per-day
    const perDay = Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      return {
        date: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        deliveries: 60 + Math.round(Math.random() * 80),
        avgMinutes: 18 + Math.round(Math.random() * 14),
      };
    });
    const peakHours = Array.from({ length: 24 }, (_, h) => ({
      hour: `${h}:00`,
      demand:
        Math.round(
          20 +
            Math.abs(Math.sin((h - 6) / 3)) * 80 +
            (h >= 11 && h <= 13 ? 30 : 0) +
            (h >= 17 && h <= 19 ? 40 : 0),
        ),
    }));
    const driverEfficiency = drivers
      .slice()
      .sort((a, b) => b.onTimeRate - a.onTimeRate)
      .slice(0, 8)
      .map((d) => ({
        name: d.name.split(" ")[0],
        score: Math.round(d.onTimeRate * 100),
        deliveries: d.deliveriesCompleted,
      }));
    return delay({ perDay, peakHours, driverEfficiency });
  },
};

// ---------- Simulation ----------
function startSimulation() {
  if (typeof window === "undefined") return;

  // Tick: move drivers along routes / random walk
  setInterval(() => {
    for (const drv of drivers) {
      if (drv.status === "offline") continue;
      if (drv.activeDeliveryId) {
        const dlv = deliveries.find((d) => d.id === drv.activeDeliveryId);
        if (!dlv) continue;
        // Advance progress
        let p = progress.get(drv.id) ?? 0;
        p = Math.min(1, p + 0.012 + Math.random() * 0.008);
        progress.set(drv.id, p);
        const loc = interpolateRoute(dlv.route, p);
        drv.currentLocation = loc;
        socket.emit("driver:move", { driverId: drv.id, location: loc });

        // Transition statuses based on progress
        if (p > 0.05 && dlv.status === "assigned") {
          dlv.status = "picked_up";
          dlv.events.push({
            status: "picked_up",
            timestamp: new Date().toISOString(),
            actorId: drv.id,
          });
          socket.emit("delivery:status", {
            deliveryId: dlv.id,
            status: "picked_up",
          });
        } else if (p > 0.15 && dlv.status === "picked_up") {
          dlv.status = "in_transit";
          dlv.events.push({
            status: "in_transit",
            timestamp: new Date().toISOString(),
            actorId: drv.id,
          });
          socket.emit("delivery:status", {
            deliveryId: dlv.id,
            status: "in_transit",
          });
        } else if (p >= 1 && dlv.status !== "delivered") {
          dlv.status = "delivered";
          dlv.events.push({
            status: "delivered",
            timestamp: new Date().toISOString(),
            actorId: drv.id,
          });
          drv.activeDeliveryId = undefined;
          drv.status = "idle";
          drv.deliveriesCompleted += 1;
          progress.delete(drv.id);
          socket.emit("delivery:status", {
            deliveryId: dlv.id,
            status: "delivered",
          });
        }
      } else if (drv.status === "active" || drv.status === "idle") {
        // small jitter so the map feels alive
        drv.currentLocation = {
          lat: drv.currentLocation.lat + (Math.random() - 0.5) * 0.0015,
          lng: drv.currentLocation.lng + (Math.random() - 0.5) * 0.0015,
        };
        socket.emit("driver:move", {
          driverId: drv.id,
          location: drv.currentLocation,
        });
      }
    }
  }, 1500);

  // Occasionally drop a new pending order
  setInterval(
    () => {
      const pickup = randomNear();
      const dropoff = randomNear();
      const dist = Number(haversineKm(pickup, dropoff).toFixed(2));
      const route = buildRoute(pickup, dropoff);
      const now = new Date().toISOString();
      const delivery: Delivery = {
        id: `dlv_${Date.now()}`,
        customerId: `cus_${Math.floor(Math.random() * 1000)}`,
        customerName: ["Northwind", "Acme", "Globex", "Soylent"][
          Math.floor(Math.random() * 4)
        ]!,
        pickup,
        dropoff,
        package: {
          description: ["Documents", "Electronics", "Groceries"][
            Math.floor(Math.random() * 3)
          ]!,
          weightKg: Number((Math.random() * 20).toFixed(1)),
          fragile: Math.random() < 0.2,
        },
        status: "pending",
        createdAt: now,
        etaMinutes: etaMinutes(dist),
        distanceKm: dist,
        priceUsd: Number((6 + dist * 1.7).toFixed(2)),
        route,
        events: [{ status: "pending", timestamp: now }],
      };
      deliveries = [delivery, ...deliveries];
      socket.emit("order:new", { delivery });
    },
    22_000,
  );
}

function randomNear(): Location {
  const r = 5 / 111;
  const u = Math.random();
  const v = Math.random();
  const w = r * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  return {
    lat: CITY_CENTER.lat + w * Math.cos(t),
    lng: CITY_CENTER.lng + (w * Math.sin(t)) / Math.cos((CITY_CENTER.lat * Math.PI) / 180),
  };
}
