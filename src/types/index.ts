export type Role = "admin" | "driver" | "customer" | "unassigned";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export interface Location {
  lat: number;
  lng: number;
  label?: string;
}

export interface Vehicle {
  id: string;
  type: "van" | "truck" | "bike" | "car";
  plate: string;
  capacityKg: number;
}

export type DriverStatus = "active" | "idle" | "offline";

export interface Driver {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  status: DriverStatus;
  currentLocation: Location;
  vehicle: Vehicle;
  rating: number; // 0..5
  deliveriesCompleted: number;
  onTimeRate: number; // 0..1
  activeDeliveryId?: string;
}

export type DeliveryStatus =
  | "pending"
  | "assigned"
  | "picked_up"
  | "in_transit"
  | "delivered"
  | "cancelled";

export interface DeliveryStatusEvent {
  status: DeliveryStatus;
  timestamp: string;
  actorId?: string;
  note?: string;
}

export interface Package {
  description: string;
  weightKg: number;
  fragile: boolean;
}

export interface Delivery {
  id: string;
  customerId: string;
  customerName: string;
  pickup: Location;
  dropoff: Location;
  package: Package;
  status: DeliveryStatus;
  assignedDriverId?: string;
  createdAt: string;
  etaMinutes?: number;
  distanceKm: number;
  priceUsd: number;
  route: Location[]; // polyline of positions
  events: DeliveryStatusEvent[];
}

export type SocketEventMap = {
  "driver:move": { driverId: string; location: Location };
  "delivery:status": { deliveryId: string; status: DeliveryStatus; note?: string };
  "order:new": { delivery: Delivery };
  "dispatch:assigned": { deliveryId: string; driverId: string };
};

export type SocketEventName = keyof SocketEventMap;
