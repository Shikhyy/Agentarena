/**
 * useMatchEvents — Subscribe to real-time match events via socketStore.
 * Returns latest game state, move list, and match status.
 */

import { useEffect, useState, useCallback } from "react";
import { useSocketStore, type WSMessage } from "@/lib/stores/socketStore";

export interface MatchEvent {
  type: string;
  timestamp: number;
  data: Record<string, unknown>;
}

export interface MatchState {
  gameState: Record<string, unknown> | null;
  moves: MatchEvent[];
  status: "idle" | "live" | "finished";
  winner: string | null;
  round: number;
}

export function useMatchEvents(arenaId: string | null) {
  const connect = useSocketStore((s) => s.connect);
  const disconnect = useSocketStore((s) => s.disconnect);
  const on = useSocketStore((s) => s.on);
  const getStatus = useSocketStore((s) => s.getStatus);

  const [state, setState] = useState<MatchState>({
    gameState: null,
    moves: [],
    status: "idle",
    winner: null,
    round: 0,
  });

  useEffect(() => {
    if (!arenaId) return;

    connect(arenaId);

    const unsubs = [
      on("game_state_update", (msg: WSMessage) => {
        setState((prev) => ({
          ...prev,
          gameState: msg.state as Record<string, unknown> ?? prev.gameState,
          status: "live",
          round: (msg.round as number) ?? prev.round,
          moves: [
            ...prev.moves,
            {
              type: "move",
              timestamp: Date.now(),
              data: msg as Record<string, unknown>,
            },
          ].slice(-200), // Keep last 200 moves
        }));
      }),

      on("match_complete", (msg: WSMessage) => {
        setState((prev) => ({
          ...prev,
          status: "finished",
          winner: (msg.winner as string) ?? null,
        }));
      }),

      on("game_over", (msg: WSMessage) => {
        setState((prev) => ({
          ...prev,
          status: "finished",
          winner: (msg.winner as string) ?? null,
        }));
      }),

      on("game_restart", () => {
        setState({
          gameState: null,
          moves: [],
          status: "live",
          winner: null,
          round: 0,
        });
      }),
    ];

    return () => {
      unsubs.forEach((u) => u());
      disconnect(arenaId);
    };
  }, [arenaId, connect, disconnect, on]);

  const connectionStatus = arenaId ? getStatus(arenaId) : "disconnected";

  return { ...state, connectionStatus };
}
