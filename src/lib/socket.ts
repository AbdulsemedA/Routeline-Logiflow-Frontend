import type { SocketEventMap, SocketEventName } from "@/types";

type Handler<E extends SocketEventName> = (payload: SocketEventMap[E]) => void;

class MockSocket {
  private handlers = new Map<SocketEventName, Set<Handler<any>>>();
  connected = true;

  on<E extends SocketEventName>(event: E, handler: Handler<E>) {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event)!.add(handler as Handler<any>);
    return () => this.off(event, handler);
  }

  off<E extends SocketEventName>(event: E, handler: Handler<E>) {
    this.handlers.get(event)?.delete(handler as Handler<any>);
  }

  emit<E extends SocketEventName>(event: E, payload: SocketEventMap[E]) {
    this.handlers.get(event)?.forEach((h) => {
      try {
        h(payload);
      } catch (e) {
        console.error("socket handler error", e);
      }
    });
  }
}

export const socket = new MockSocket();
