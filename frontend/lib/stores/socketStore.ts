/**
 * AgentArena — Socket Store (Zustand 5)
 * Manages WebSocket connections to backend arena streams.
 * Replaces raw WebSocket with typed event handling.
 */

import { create } from "zustand";
import { wsUrl } from "@/lib/api";

// ── Event Types ─────────────────────────────────────────────

export type WSEventType =
  | "connected"
  | "game_state_update"
  | "agent_thinking"
  | "commentary_event"
  | "odds_update"
  | "game_over"
  | "game_restart"
  | "monopoly_negotiation"
  | "monopoly_bankruptcy"
  | "match_complete";

export interface WSMessage {
  type: WSEventType;
  [key: string]: unknown;
}

type EventHandler = (msg: WSMessage) => void;

// ── State ───────────────────────────────────────────────────

interface SocketState {
  // Connection state
  connections: Map<string, WebSocket>;
  connectionStatus: Map<string, "connecting" | "connected" | "disconnected" | "error">;

  // Event handlers
  handlers: Map<string, EventHandler[]>;

  // Actions
  connect: (arenaId: string) => void;
  disconnect: (arenaId: string) => void;
  disconnectAll: () => void;
  send: (arenaId: string, data: Record<string, unknown>) => void;
  on: (event: string, handler: EventHandler) => () => void;
  getStatus: (arenaId: string) => "connecting" | "connected" | "disconnected" | "error";
}

export const useSocketStore = create<SocketState>((set, get) => ({
  connections: new Map(),
  connectionStatus: new Map(),
  handlers: new Map(),

  connect: (arenaId: string) => {
    const { connections } = get();
    // Close existing connection if any
    const existing = connections.get(arenaId);
    if (existing) existing.close();

    const url = wsUrl(`/arenas/${arenaId}/stream`);
    const ws = new WebSocket(url);

    set((s) => {
      const newConns = new Map(s.connections);
      const newStatus = new Map(s.connectionStatus);
      newConns.set(arenaId, ws);
      newStatus.set(arenaId, "connecting");
      return { connections: newConns, connectionStatus: newStatus };
    });

    ws.onopen = () => {
      set((s) => {
        const newStatus = new Map(s.connectionStatus);
        newStatus.set(arenaId, "connected");
        return { connectionStatus: newStatus };
      });
    };

    ws.onmessage = (evt) => {
      try {
        const msg: WSMessage = JSON.parse(evt.data);
        const { handlers } = get();

        // Fire specific event handlers
        const specific = handlers.get(msg.type);
        if (specific) specific.forEach((h) => h(msg));

        // Fire wildcard handlers
        const wildcard = handlers.get("*");
        if (wildcard) wildcard.forEach((h) => h(msg));

        // Fire arena-specific handlers
        const arenaSpecific = handlers.get(`${arenaId}:${msg.type}`);
        if (arenaSpecific) arenaSpecific.forEach((h) => h(msg));
      } catch {
        // ignore parse errors
      }
    };

    ws.onerror = () => {
      set((s) => {
        const newStatus = new Map(s.connectionStatus);
        newStatus.set(arenaId, "error");
        return { connectionStatus: newStatus };
      });
    };

    ws.onclose = () => {
      set((s) => {
        const newConns = new Map(s.connections);
        const newStatus = new Map(s.connectionStatus);
        newConns.delete(arenaId);
        newStatus.set(arenaId, "disconnected");
        return { connections: newConns, connectionStatus: newStatus };
      });
    };
  },

  disconnect: (arenaId: string) => {
    const ws = get().connections.get(arenaId);
    if (ws) ws.close();
  },

  disconnectAll: () => {
    get().connections.forEach((ws) => ws.close());
    set({ connections: new Map(), connectionStatus: new Map() });
  },

  send: (arenaId: string, data: Record<string, unknown>) => {
    const ws = get().connections.get(arenaId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  },

  on: (event: string, handler: EventHandler) => {
    set((s) => {
      const newHandlers = new Map(s.handlers);
      const existing = newHandlers.get(event) || [];
      newHandlers.set(event, [...existing, handler]);
      return { handlers: newHandlers };
    });

    // Return unsubscribe function
    return () => {
      set((s) => {
        const newHandlers = new Map(s.handlers);
        const existing = newHandlers.get(event) || [];
        newHandlers.set(
          event,
          existing.filter((h) => h !== handler)
        );
        return { handlers: newHandlers };
      });
    };
  },

  getStatus: (arenaId: string) => {
    return get().connectionStatus.get(arenaId) || "disconnected";
  },
}));
