
# Smart Logistics & Delivery Dispatch — Frontend Build Plan

## Stack (locked in)

- **Vite + React 18 + TypeScript** (React Router v6 for routing)
- **TailwindCSS** + shadcn/ui primitives + semantic design tokens (dark/light)
- **Zustand** (auth, notifications, live driver positions, UI prefs)
- **TanStack Query** (server-state cache for deliveries/drivers/analytics)
- **Leaflet + react-leaflet** + `leaflet.markercluster` (free, no token)
- **Recharts** for analytics
- **Mock Socket.IO layer** — same `on/off/emit` API as `socket.io-client`, driven by `setInterval`. Swap-in real Socket.IO later by changing one import.
- **MSW-style mock API** in `/lib/api` returning realistic seeded data with simulated latency.

## Folder structure

```text
src/
  routes/                  router config + lazy route components
  pages/
    auth/                  Login, Register, RoleSelect
    admin/                 Dashboard, Fleet, Analytics, DeliveryDetail
    driver/                Dashboard, History
    customer/              NewDelivery, Tracking
  components/
    ui/                    shadcn primitives
    layout/                Sidebar, Topbar, AppShell, RoleGuard
    map/                   MapCanvas, DriverMarker, RouteLayer, Cluster
    dashboard/             StatCard, LiveBadge, EmptyState, Skeletons
    dispatch/              PendingOrders, AssignDriverDialog, SmartSuggestion
  features/
    deliveries/            hooks, queries, types, mock data
    drivers/               hooks, queries, simulator (movement engine)
    analytics/             aggregators, chart configs
    notifications/         toast bus + notification center
  hooks/                   useSocket, useGeolocation, useMediaQuery, useTheme
  lib/
    api/                   axios-like client + endpoints (auth, deliveries, drivers, analytics)
    socket/                mockSocket.ts (Socket.IO-compatible), events.ts
    geo/                   haversine, ETA, bbox, route interpolation
    utils.ts
  store/                   auth.ts, ui.ts, livePositions.ts, notifications.ts
  types/                   user.ts, driver.ts, delivery.ts, location.ts, vehicle.ts, events.ts
  styles/                  index.css (tokens), themes
```

## Pages (all 7)

1. **/login, /register, /role-select** — clean centered card layout, role tiles (Admin / Driver / Customer), mock auth persisted via Zustand + localStorage. Role guards on all app routes.
2. **/admin** (main screen) — `AppShell` with collapsible sidebar + top status bar (live KPI ticker). Grid: 5 stat cards → Map (2/3 width) + Dispatch panel (1/3 width) → recent activity feed. Map shows clustered driver markers moving in real time, active delivery routes, pickup/dropoff pins. Dispatch panel lists pending orders with "Assign Driver" → opens dialog with **Smart Suggestion** (top-ranked driver by distance + load + rating).
3. **/driver** — current assignment card, route map with polyline, Start/Pickup/Complete action stepper, "Share live location" toggle (drives the simulator), history list below.
4. **/customer/new** + **/customer/tracking/:id** — map-based pickup/dropoff selector (click map to drop pin), package details form, then live tracking view with animated driver marker + ETA + status timeline.
5. **/admin/fleet** — paginated/sortable table: driver, status badge (active/idle/offline), current location (reverse-geocoded label), deliveries completed, rating, on-time %. Row click → driver drawer.
6. **/admin/analytics** — Recharts: deliveries/day (area), avg delivery time (line), driver efficiency (bar), peak hours (radial/bar), delivery activity heatmap (custom grid component over Leaflet using a hex bin).
7. **/deliveries/:id** — full timeline (created → assigned → picked up → in transit → delivered), route polyline on map, driver card, status event log with timestamps.

## Realtime simulation

`lib/socket/mockSocket.ts` exposes `socket.on('driver:move', ...)`, `'delivery:status'`, `'order:new'`, `'dispatch:assigned'`. A background **driver simulator** interpolates each active driver along their route polyline every 1.5s and emits events. Zustand `livePositions` store consumes events; map components subscribe via selector so only marker positions re-render. New orders drop into the dispatch panel every ~20s.

## Data models (`/types`)

`User`, `Role`, `Driver` (with `Vehicle`, status, currentLocation, rating, stats), `Delivery` (pickup, dropoff, status, assignedDriverId, route, events[]), `Location` (lat/lng/label), `Vehicle` (type, plate, capacity), `DeliveryStatusEvent` (status, timestamp, actorId, note).

## UI/UX

- Semantic Tailwind tokens in `index.css` (`--background`, `--primary`, `--success`, `--warning`, `--muted`…) — full dark/light parity. No hardcoded colors in components.
- Sidebar + topbar shell, card-based widgets, skeleton loaders, empty states, sonner toasts, smooth Framer-Motion-light transitions (CSS only to keep bundle lean).
- Fully responsive: sidebar collapses to bottom nav on mobile; map and dispatch stack vertically.

## Performance

- `React.lazy` + `Suspense` per route.
- Memoized map (`React.memo` + stable props); marker layer keyed by driver id; cluster plugin for >50 drivers.
- Zustand selectors with `shallow` to scope re-renders to changed markers only.
- Tables paginated + virtualized where >100 rows.

## API layer (`/lib/api`)

Typed client with `auth.ts`, `deliveries.ts`, `drivers.ts`, `analytics.ts`. Every function returns a Promise (200–400ms simulated latency) so swapping for real `fetch` later is mechanical. TanStack Query keys centralized in `features/*/queries.ts`.

## Out of scope this pass

Optional upgrades (AI dispatch panel beyond a stub, real traffic data, advanced ranking ML) — stubs/placeholders only, easy to extend.

## Deliverable

A runnable Lovable preview with seeded data: log in as Admin to see the live dispatch dashboard with drivers moving on the map, assign a pending order, switch to Driver role to see the assignment, switch to Customer to create + track a delivery.
