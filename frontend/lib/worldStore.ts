import { create } from "zustand";

/* ── Zone definitions ────────────────────────────────────── */
export type WorldZone =
    | "central-nexus"
    | "arena-chess"
    | "arena-poker"
    | "arena-monopoly"
    | "workshop"
    | "marketplace"
    | "hall-of-fame"
    | "grand-arena";

export interface ZoneConfig {
    id: WorldZone;
    label: string;
    position: [number, number, number];
    icon: string;
    color: string;
}

export const WORLD_ZONES: ZoneConfig[] = [
    { id: "central-nexus", label: "Central Nexus", position: [0, 0, 0], icon: "🏛️", color: "#6C3AED" },
    { id: "arena-chess", label: "Hall of Chess", position: [0, 0, -60], icon: "♟️", color: "#10B981" },
    { id: "arena-poker", label: "Hall of Poker", position: [60, 0, 0], icon: "🃏", color: "#F59E0B" },
    { id: "arena-monopoly", label: "Hall of Monopoly", position: [-60, 0, 0], icon: "🏠", color: "#EF4444" },
    { id: "workshop", label: "Workshop", position: [0, 0, 60], icon: "🔧", color: "#8B5CF6" },
    { id: "marketplace", label: "Marketplace", position: [45, 0, 45], icon: "🛒", color: "#FBBF24" },
    { id: "hall-of-fame", label: "Hall of Fame", position: [-45, 0, -45], icon: "🏆", color: "#F59E0B" },
    { id: "grand-arena", label: "Grand Arena", position: [0, 10, -120], icon: "⚔️", color: "#EF4444" },
];

/* ── Agent in-world representation ───────────────────────── */
export interface WorldAgent {
    id: string;
    name: string;
    level: number;
    elo: number;
    personality: "aggressive" | "conservative" | "chaotic" | "adaptive";
    position: [number, number, number];
    targetPosition: [number, number, number];
    status: "idle" | "walking" | "seated" | "competing" | "celebrating";
    winRate: number;
    auraColor: string;
    zone: WorldZone;
}

/* ── Live match ──────────────────────────────────────────── */
export interface LiveMatch {
    id: string;
    gameType: "chess" | "poker" | "monopoly" | "trivia";
    zone: WorldZone;
    agentA: { name: string; elo: number };
    agentB: { name: string; elo: number };
    spectators: number;
    odds: [number, number];
    status: "waiting" | "live" | "finished";
    pool: number;
    dramaScore: number;
}

/* ── Spectator ───────────────────────────────────────────── */
export interface SpectatorOrb {
    id: string;
    username: string;
    position: [number, number, number];
    zone: WorldZone;
}

/* ── Camera mode ─────────────────────────────────────────── */
export type CameraMode = "free" | "first-person" | "follow-agent" | "cinematic";

/* ── Quality preset ──────────────────────────────────────── */
export type QualityPreset = "low" | "medium" | "high" | "ultra";

/* ── Store ───────────────────────────────────────────────── */
interface WorldState {
    // World state
    currentZone: WorldZone;
    cameraMode: CameraMode;
    cameraTarget: [number, number, number];
    qualityPreset: QualityPreset;
    worldTime: number; // 0-24 for day/night cycle

    // Agents
    agents: WorldAgent[];
    selectedAgentId: string | null;
    myAgentId: string | null;

    // Matches
    liveMatches: LiveMatch[];
    activeMatchId: string | null;

    // Spectators
    spectators: SpectatorOrb[];
    spectatorCount: number;

    // UI state
    hudVisible: boolean;
    chatOpen: boolean;
    minimapExpanded: boolean;

    // Player
    arenaBalance: number;

    // Actions
    setZone: (zone: WorldZone) => void;
    setCameraMode: (mode: CameraMode) => void;
    setCameraTarget: (target: [number, number, number]) => void;
    setQuality: (preset: QualityPreset) => void;
    selectAgent: (id: string | null) => void;
    setActiveMatch: (id: string | null) => void;
    setHudVisible: (v: boolean) => void;
    toggleChat: () => void;
    toggleMinimap: () => void;
    updateAgentPosition: (id: string, position: [number, number, number]) => void;
    addAgent: (agent: WorldAgent) => void;
    addMatch: (match: LiveMatch) => void;
    updateMatchSpectators: (matchId: string, count: number) => void;
    teleportToZone: (zone: WorldZone) => void;
}

function getAuraColor(winRate: number): string {
    if (winRate >= 0.8) return "#F59E0B"; // gold
    if (winRate >= 0.6) return "#C0C0C0"; // silver
    if (winRate >= 0.4) return "#3B82F6"; // blue
    return "#6B7280"; // gray
}

// Generate initial mock agents
const MOCK_AGENTS: WorldAgent[] = [
    {
        id: "agent-zeus", name: "ZEUS", level: 24, elo: 2450,
        personality: "aggressive", position: [5, 0, 3], targetPosition: [5, 0, 3],
        status: "idle", winRate: 0.82, auraColor: "#F59E0B", zone: "central-nexus",
    },
    {
        id: "agent-athena", name: "ATHENA", level: 21, elo: 2380,
        personality: "adaptive", position: [-3, 0, 7], targetPosition: [-3, 0, 7],
        status: "idle", winRate: 0.75, auraColor: "#C0C0C0", zone: "central-nexus",
    },
    {
        id: "agent-blitz", name: "BLITZ", level: 18, elo: 2200,
        personality: "aggressive", position: [60, 0, 2], targetPosition: [60, 0, 2],
        status: "competing", winRate: 0.68, auraColor: "#C0C0C0", zone: "arena-poker",
    },
    {
        id: "agent-shadow", name: "SHADOW", level: 16, elo: 2150,
        personality: "conservative", position: [62, 0, -2], targetPosition: [62, 0, -2],
        status: "competing", winRate: 0.61, auraColor: "#C0C0C0", zone: "arena-poker",
    },
    {
        id: "agent-titan", name: "TITAN", level: 30, elo: 2600,
        personality: "conservative", position: [2, 0, -58], targetPosition: [2, 0, -58],
        status: "competing", winRate: 0.88, auraColor: "#F59E0B", zone: "arena-chess",
    },
    {
        id: "agent-oracle", name: "ORACLE", level: 28, elo: 2520,
        personality: "adaptive", position: [-2, 0, -62], targetPosition: [-2, 0, -62],
        status: "competing", winRate: 0.84, auraColor: "#F59E0B", zone: "arena-chess",
    },
    {
        id: "agent-phantom", name: "PHANTOM", level: 12, elo: 1900,
        personality: "chaotic", position: [8, 0, -5], targetPosition: [8, 0, -5],
        status: "walking", winRate: 0.52, auraColor: "#3B82F6", zone: "central-nexus",
    },
    {
        id: "agent-viper", name: "VIPER", level: 15, elo: 2050,
        personality: "aggressive", position: [-8, 0, 2], targetPosition: [-8, 0, 2],
        status: "idle", winRate: 0.59, auraColor: "#3B82F6", zone: "central-nexus",
    },
];

const MOCK_MATCHES: LiveMatch[] = [
    {
        id: "match-1", gameType: "chess", zone: "arena-chess",
        agentA: { name: "TITAN", elo: 2600 }, agentB: { name: "ORACLE", elo: 2520 },
        spectators: 1247, odds: [52, 48], status: "live", pool: 24500, dramaScore: 7.2,
    },
    {
        id: "match-2", gameType: "poker", zone: "arena-poker",
        agentA: { name: "BLITZ", elo: 2200 }, agentB: { name: "SHADOW", elo: 2150 },
        spectators: 892, odds: [45, 55], status: "live", pool: 18200, dramaScore: 8.5,
    },
];

export const useWorldStore = create<WorldState>((set, get) => ({
    currentZone: "central-nexus",
    cameraMode: "free",
    cameraTarget: [0, 2, 0],
    qualityPreset: "high",
    worldTime: 22, // evening for max atmosphere

    agents: MOCK_AGENTS,
    selectedAgentId: null,
    myAgentId: "agent-zeus",

    liveMatches: MOCK_MATCHES,
    activeMatchId: null,

    spectators: [],
    spectatorCount: 2847,

    hudVisible: true,
    chatOpen: false,
    minimapExpanded: false,

    arenaBalance: 1250.0,

    setZone: (zone) => set({ currentZone: zone }),
    setCameraMode: (mode) => set({ cameraMode: mode }),
    setCameraTarget: (target) => set({ cameraTarget: target }),
    setQuality: (preset) => set({ qualityPreset: preset }),
    selectAgent: (id) => set({ selectedAgentId: id }),
    setActiveMatch: (id) => set({ activeMatchId: id }),
    setHudVisible: (v) => set({ hudVisible: v }),
    toggleChat: () => set((s) => ({ chatOpen: !s.chatOpen })),
    toggleMinimap: () => set((s) => ({ minimapExpanded: !s.minimapExpanded })),

    updateAgentPosition: (id, position) =>
        set((s) => ({
            agents: s.agents.map((a) => (a.id === id ? { ...a, position } : a)),
        })),

    addAgent: (agent) => set((s) => ({ agents: [...s.agents, agent] })),

    addMatch: (match) => set((s) => ({ liveMatches: [...s.liveMatches, match] })),

    updateMatchSpectators: (matchId, count) =>
        set((s) => ({
            liveMatches: s.liveMatches.map((m) =>
                m.id === matchId ? { ...m, spectators: count } : m
            ),
        })),

    teleportToZone: (zone) => {
        const zoneConfig = WORLD_ZONES.find((z) => z.id === zone);
        if (zoneConfig) {
            set({
                currentZone: zone,
                cameraTarget: zoneConfig.position,
            });
        }
    },
}));
