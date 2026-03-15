/**
 * useLiveOdds — Subscribe to Bayesian odds updates via socketStore.
 * Returns current probabilities, odds history, and last update time.
 */

import { useEffect, useState } from "react";
import { useSocketStore, type WSMessage } from "@/lib/stores/socketStore";

export interface OddsSnapshot {
  agentA: number; // probability 0-1
  agentB: number;
  timestamp: number;
}

export interface LiveOddsState {
  current: OddsSnapshot;
  history: OddsSnapshot[];
  lastUpdate: number;
  isStale: boolean;
}

const STALE_THRESHOLD = 30_000; // 30 seconds

export function useLiveOdds(arenaId: string | null) {
  const on = useSocketStore((s) => s.on);

  const [state, setState] = useState<LiveOddsState>({
    current: { agentA: 0.5, agentB: 0.5, timestamp: Date.now() },
    history: [],
    lastUpdate: Date.now(),
    isStale: false,
  });

  useEffect(() => {
    if (!arenaId) return;

    const unsub = on("odds_update", (msg: WSMessage) => {
      const probA =
        (msg.live_odds as any)?.agent_a?.probability ??
        (msg.probability_a as number) ??
        0.5;
      const probB =
        (msg.live_odds as any)?.agent_b?.probability ??
        (msg.probability_b as number) ??
        0.5;
      const now = Date.now();

      const snapshot: OddsSnapshot = {
        agentA: probA,
        agentB: probB,
        timestamp: now,
      };

      setState((prev) => ({
        current: snapshot,
        history: [...prev.history, snapshot].slice(-100), // Keep last 100
        lastUpdate: now,
        isStale: false,
      }));
    });

    // Staleness check interval
    const staleCheck = setInterval(() => {
      setState((prev) => ({
        ...prev,
        isStale: Date.now() - prev.lastUpdate > STALE_THRESHOLD,
      }));
    }, 5000);

    return () => {
      unsub();
      clearInterval(staleCheck);
    };
  }, [arenaId, on]);

  return state;
}
