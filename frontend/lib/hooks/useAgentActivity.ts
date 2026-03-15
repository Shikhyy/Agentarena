/**
 * useAgentActivity — Subscribe to autonomous agent actions via socketStore.
 * Returns activity feed items for the ActivityFeed component.
 */

import { useEffect, useState } from "react";
import { useSocketStore, type WSMessage } from "@/lib/stores/socketStore";

export type ActivityType =
  | "thinking"
  | "move"
  | "odds_shift"
  | "transaction"
  | "commentary"
  | "zk_event"
  | "nft_update";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  icon: string;
  message: string;
  agentName?: string;
  timestamp: number;
  txHash?: string;
  explorerUrl?: string;
}

const ICONS: Record<ActivityType, string> = {
  thinking: "●",
  move: "◆",
  odds_shift: "▲",
  transaction: "✦",
  commentary: "◈",
  zk_event: "⬡",
  nft_update: "◇",
};

let idCounter = 0;
function nextId() {
  return `activity-${Date.now()}-${idCounter++}`;
}

function mapWSToActivity(msg: WSMessage): ActivityItem | null {
  const now = Date.now();

  switch (msg.type) {
    case "agent_thinking":
      return {
        id: nextId(),
        type: "thinking",
        icon: ICONS.thinking,
        message: `${msg.agent_name ?? "Agent"} is thinking...`,
        agentName: msg.agent_name as string,
        timestamp: now,
      };

    case "game_state_update":
      return {
        id: nextId(),
        type: "move",
        icon: ICONS.move,
        message: (msg.description as string) ?? `Move played: ${msg.move ?? "—"}`,
        agentName: msg.agent_name as string,
        timestamp: now,
      };

    case "odds_update":
      return {
        id: nextId(),
        type: "odds_shift",
        icon: ICONS.odds_shift,
        message: `Odds shifted — ${((msg.probability_a as number) * 100 || 50).toFixed(0)}% / ${((msg.probability_b as number) * 100 || 50).toFixed(0)}%`,
        timestamp: now,
      };

    case "commentary_event":
      return {
        id: nextId(),
        type: "commentary",
        icon: ICONS.commentary,
        message: (msg.commentary as string) ?? (msg.text as string) ?? "Commentary update",
        timestamp: now,
      };

    case "match_complete":
    case "game_over":
      return {
        id: nextId(),
        type: "transaction",
        icon: ICONS.transaction,
        message: `Match settled — ${msg.winner ?? "Draw"}`,
        timestamp: now,
        txHash: msg.tx_hash as string,
        explorerUrl: msg.tx_hash
          ? `https://polygonscan.com/tx/${msg.tx_hash}`
          : undefined,
      };

    default:
      return null;
  }
}

export function useAgentActivity(arenaId: string | null, maxItems = 50) {
  const on = useSocketStore((s) => s.on);
  const [items, setItems] = useState<ActivityItem[]>([]);

  useEffect(() => {
    if (!arenaId) return;

    const unsub = on("*", (msg: WSMessage) => {
      const item = mapWSToActivity(msg);
      if (item) {
        setItems((prev) => [item, ...prev].slice(0, maxItems));
      }
    });

    return unsub;
  }, [arenaId, on, maxItems]);

  const clear = () => setItems([]);

  return { items, clear };
}
