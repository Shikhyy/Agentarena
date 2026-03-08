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
    { id: "central-nexus", label: "Central Nexus", position: [0, 0, 0], icon: "️", color: "#6C3AED" },
    { id: "arena-chess", label: "Hall of Chess", position: [0, 0, -60], icon: "️", color: "#10B981" },
    { id: "arena-poker", label: "Hall of Poker", position: [60, 0, 0], icon: "", color: "#F59E0B" },
    { id: "arena-monopoly", label: "Hall of Monopoly", position: [-60, 0, 0], icon: "", color: "#EF4444" },
    { id: "workshop", label: "Workshop", position: [0, 0, 60], icon: "", color: "#8B5CF6" },
    { id: "marketplace", label: "Marketplace", position: [45, 0, 45], icon: "", color: "#FBBF24" },
    { id: "hall-of-fame", label: "Hall of Fame", position: [-45, 0, -45], icon: "", color: "#F59E0B" },
    { id: "grand-arena", label: "Grand Arena", position: [0, 10, -120], icon: "️", color: "#EF4444" },
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
    status: "idle" | "walking" | "seated" | "competing" | "celebrating" | "thinking";
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
    appState: "spawning" | "roaming";
    playerPosition: [number, number, number];
    playerTarget: [number, number, number] | null;

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
    setAppState: (state: "spawning" | "roaming") => void;
    setPlayerPosition: (pos: [number, number, number]) => void;
    setPlayerTarget: (pos: [number, number, number] | null) => void;
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
    setLiveMatches: (matches: LiveMatch[]) => void;
    addMatch: (match: LiveMatch) => void;
    updateMatchSpectators: (matchId: string, count: number) => void;
    teleportToZone: (zone: WorldZone) => void;
    connectBackendEvents: () => void;
}

function getAuraColor(winRate: number): string {
    if (winRate >= 0.8) return "#F59E0B"; // gold
    if (winRate >= 0.6) return "#C0C0C0"; // silver
    if (winRate >= 0.4) return "#3B82F6"; // blue
    return "#6B7280"; // gray
}

const _AGENTS: WorldAgent[] = [];

const _MATCHES: LiveMatch[] = [];

export const useWorldStore = create<WorldState>((set, get) => ({
    appState: "spawning",
    playerPosition: [0, 0, 8],
    playerTarget: null,
    currentZone: "central-nexus",
    cameraMode: "free",
    cameraTarget: [0, 2, 0],
    qualityPreset: "high",
    worldTime: 22, // evening for max atmosphere

    agents: _AGENTS,
    selectedAgentId: null,
    myAgentId: "agent-zeus",

    liveMatches: _MATCHES,
    activeMatchId: null,

    spectators: [],
    spectatorCount: 2847,

    hudVisible: true,
    chatOpen: false,
    minimapExpanded: false,

    arenaBalance: 1250.0,

    setZone: (zone) => set({ currentZone: zone }),
    setAppState: (state) => set({ appState: state }),
    setPlayerPosition: (pos) => set({ playerPosition: pos }),
    setPlayerTarget: (pos) => set({ playerTarget: pos }),
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

    setLiveMatches: (matches) => set({ liveMatches: matches }),

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
                playerPosition: [zoneConfig.position[0], 0, zoneConfig.position[2] + 5],
                playerTarget: null
            });
        }
    },

    connectBackendEvents: () => {
        // Hydrate initially via HTTP
        fetch("http://localhost:8000/arenas/live")
            .then((res) => res.json())
            .then((data) => {
                if (data.arenas && data.arenas.length > 0) {
                    const mappedMatches = data.arenas.map((arena: any) => ({
                        id: arena.id,
                        gameType: arena.game_type,
                        zone: `arena-${arena.game_type}` as WorldZone,
                        agentA: { name: arena.agent_a?.name || "Agent A", elo: 2000 },
                        agentB: { name: arena.agent_b?.name || "Agent B", elo: 2000 },
                        spectators: arena.spectators || 0,
                        odds: [parseFloat((arena.live_odds?.agent_a * 100).toFixed(0)) || 50, parseFloat((arena.live_odds?.agent_b * 100).toFixed(0)) || 50],
                        status: arena.status,
                        pool: 10000,
                        dramaScore: 5.0,
                    }));
                    set({ liveMatches: mappedMatches });

                    // Establish WebSocket connection for real-time live events to each active arena
                    data.arenas.forEach((arena: any) => {
                        const ws = new WebSocket(`ws://localhost:8000/arenas/${arena.id}/stream`);
                        ws.onmessage = (event) => {
                            try {
                                const msg = JSON.parse(event.data);
                                set((s) => ({
                                    liveMatches: s.liveMatches.map((m) => {
                                        if (m.id !== arena.id) return m;

                                        // Update state selectively based on event type
                                        return {
                                            ...m,
                                            spectators: msg.spectators ?? m.spectators,
                                            odds: msg.live_odds ? [
                                                parseFloat((msg.live_odds.agent_a * 100).toFixed(0)),
                                                parseFloat((msg.live_odds.agent_b * 100).toFixed(0))
                                            ] : m.odds,
                                            dramaScore: msg.drama_score ?? m.dramaScore,
                                        };
                                    })
                                }));

                                // Make the agents "think" randomly on engine update
                                if (msg.type === "engine_eval") {
                                    set((s) => ({
                                        agents: s.agents.map((a) => {
                                            // Identify if agent belongs to this match
                                            const isMatchAgent = a.name === arena.agent_a?.name || a.name === arena.agent_b?.name;
                                            if (isMatchAgent) {
                                                const originalStatus = a.status;
                                                return { ...a, status: "thinking" };
                                            }
                                            return a;
                                        })
                                    }));

                                    // Revert from thinking to competing quickly
                                    setTimeout(() => {
                                        set((s) => ({
                                            agents: s.agents.map(a =>
                                                (a.name === arena.agent_a?.name || a.name === arena.agent_b?.name)
                                                    ? { ...a, status: "competing" } : a
                                            )
                                        }));
                                    }, 2000);
                                }
                            } catch (e) {
                                // ignore parse errors
                            }
                        };
                    });
                }
            })
            .catch((err) => console.log("Backend offline, using  matches."));

        // Remove loop fallback now that WS is implemented
    },
}));
