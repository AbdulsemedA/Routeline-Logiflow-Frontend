import type { Delivery, Driver, Location } from "@/types";
import http from "./http";

function mapDriver(d: any): Driver {
  return {
    id: d.id,
    name: d.name,
    phone: d.phone,
    status: d.status,
    currentLocation: d.currentLocation ?? { lat: 0, lng: 0 },
    vehicle: {
      id: d.vehicle?.id ?? "",
      type: d.vehicle?.type ?? "van",
      plate: d.vehicle?.plate ?? "",
      capacityKg: d.vehicle?.capacityKg ?? 0,
    },
    rating: d.rating,
    deliveriesCompleted: d.deliveriesCompleted,
    onTimeRate: d.onTimeRate,
    activeDeliveryId: d.activeDeliveryId ?? undefined,
  };
}

function mapDelivery(d: any): Delivery {
  return {
    id: d.id,
    customerId: d.customerId,
    customerName: d.customerName,
    pickup: d.pickup,
    dropoff: d.dropoff,
    package: d.package,
    status: d.status,
    assignedDriverId: d.assignedDriverId ?? undefined,
    createdAt: d.created,
    etaMinutes: d.etaMinutes ?? undefined,
    distanceKm: d.distanceKm,
    priceUsd: d.priceUsd,
    route: d.route ?? [],
    events: d.events ?? [],
  };
}

export const authApi = {
  async login(username: string, password: string) {
    const { data } = await http.post("/auth/login", { username, password });
    const tokenRes = await http.get("/auth/me", {
      headers: { Authorization: `Bearer ${data.access}` },
    });
    return {
      user: {
        id: tokenRes.data.id,
        name: tokenRes.data.username,
        email: tokenRes.data.email,
        role: tokenRes.data.role as "admin" | "driver" | "customer" | "unassigned",
      },
      accessToken: data.access,
      refreshToken: data.refresh,
    };
  },

  async register(name: string, email: string, password: string) {
    await http.post("/auth/register", { username: name, email, password });

  },
};

export const driversApi = {
  async list(): Promise<Driver[]> {
    const { data } = await http.get("/drivers/");
    return (data.results ?? data).map(mapDriver);
  },
  async get(id: string): Promise<Driver | undefined> {
    const { data } = await http.get(`/drivers/${id}`);
    return mapDriver(data);
  },
  async nearby(lat: number, lng: number): Promise<Driver[]> {
    const { data } = await http.get("/drivers/nearby", { params: { lat, lng } });
    return data.map(mapDriver);
  },
  async updateLocation(lat: number, lng: number): Promise<Driver> {
    const { data } = await http.post("/drivers/location", { lat, lng });
    return mapDriver(data);
  },
  async updateStatus(status: "active" | "idle" | "offline"): Promise<Driver> {
    const { data } = await http.patch("/drivers/status", { status });
    return mapDriver(data);
  },
};

export const deliveriesApi = {
  async list(): Promise<Delivery[]> {
    const { data } = await http.get("/deliveries/");
    return (data.results ?? data).map(mapDelivery);
  },
  async get(id: string): Promise<Delivery | undefined> {
    const { data } = await http.get(`/deliveries/${id}`);
    return mapDelivery(data);
  },
  async create(input: {
    customerName: string;
    pickup: Location;
    dropoff: Location;
    description: string;
    weightKg: number;
    fragile: boolean;
  }): Promise<Delivery> {
    const { data } = await http.post("/deliveries/", {
      customerId: "self",
      customerName: input.customerName,
      pickup: input.pickup,
      dropoff: input.dropoff,
      package: {
        description: input.description,
        weightKg: input.weightKg,
        fragile: input.fragile,
      },
    });
    return mapDelivery(data);
  },
  async updateStatus(deliveryId: string, status: Delivery["status"], extra: Record<string, any> = {}): Promise<Delivery> {
    const { data } = await http.patch(`/deliveries/${deliveryId}/status`, { status, ...extra });
    return mapDelivery(data);
  },
};

export const analyticsApi = {
  async summary() {
    const { data } = await http.get("/analytics/summary");
    return data;
  },
  async series() {
    const { data } = await http.get("/analytics/series");
    return data;
  },
};
