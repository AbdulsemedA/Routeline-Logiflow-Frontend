import type { SocketEventMap, SocketEventName } from "@/types";

type Handler<E extends SocketEventName> = (payload: SocketEventMap[E]) => void;

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000/ws/stream/";

class RealSocket {
  private ws: WebSocket | null = null;
  private handlers = new Map<SocketEventName, Set<Handler<any>>>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private closed = false;
  connected = false;

  constructor() {
    this.connect();
  }

  private connect() {
    if (this.closed) return;
    try {
      this.ws = new WebSocket(WS_URL);
    } catch {
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      this.connected = true;
    };

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        const { event: eventName, data } = msg;
        if (eventName && this.handlers.has(eventName)) {
          this.handlers.get(eventName)!.forEach((h) => h(data));
        }
      } catch {
        // ignore
      }
    };

    this.ws.onclose = () => {
      this.connected = false;
      this.scheduleReconnect();
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  private scheduleReconnect() {
    if (this.closed) return;
    this.reconnectTimer = setTimeout(() => this.connect(), 3000);
  }

  on<E extends SocketEventName>(event: E, handler: Handler<E>) {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event)!.add(handler as Handler<any>);
    return () => this.off(event, handler);
  }

  off<E extends SocketEventName>(event: E, handler: Handler<E>) {
    this.handlers.get(event)?.delete(handler as Handler<any>);
  }

  destroy() {
    this.closed = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.handlers.clear();
  }
}

export const socket = new RealSocket();
