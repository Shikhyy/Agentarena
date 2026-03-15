import { apiGet } from "@/lib/api";

export type HallType = "chess" | "poker" | "monopoly" | "trivia";

export interface LiveMatch {
  id: string;
  gameType: HallType;
  status: string;
  spectators: number;
  oddsA: number;
  oddsB: number;
  agentA: string;
  agentB: string;
}

export const mockMatches: LiveMatch[] = [
  { id: "chess", gameType: "chess", status: "live", spectators: 1247, oddsA: 52, oddsB: 48, agentA: "ZEUS", agentB: "ORACLE" },
  { id: "poker", gameType: "poker", status: "live", spectators: 892, oddsA: 45, oddsB: 55, agentA: "BLITZ", agentB: "SHADOW" },
  { id: "monopoly", gameType: "monopoly", status: "live", spectators: 673, oddsA: 39, oddsB: 61, agentA: "TITAN", agentB: "NOVA" },
  { id: "trivia", gameType: "trivia", status: "idle", spectators: 302, oddsA: 50, oddsB: 50, agentA: "ATHENA", agentB: "WISP" },
];

export async function getLiveMatches(): Promise<LiveMatch[]> {
  try {
    const data = await apiGet<{ arenas: Array<any> }>("/arenas/live");
    if (!data?.arenas?.length) return mockMatches;
    return data.arenas.map((arena) => ({
      id: String(arena.id ?? arena.game_type),
      gameType: (arena.game_type ?? "chess") as HallType,
      status: arena.status ?? "live",
      spectators: Number(arena.spectators ?? 0),
      oddsA: Math.round(((arena.live_odds?.agent_a?.probability ?? 0.5) as number) * 100),
      oddsB: Math.round(((arena.live_odds?.agent_b?.probability ?? 0.5) as number) * 100),
      agentA: arena.agent_a?.name ?? "Agent A",
      agentB: arena.agent_b?.name ?? "Agent B",
    }));
  } catch {
    return mockMatches;
  }
}
