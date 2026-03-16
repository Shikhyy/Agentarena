import { create } from "zustand";
import { apiGet, wsUrl } from "@/lib/api";
import { getAuraColor as themeAuraColor, ZONE_COLORS } from "@/lib/theme";

/* ── Zone definitions ────────────────────────────────────── */
export type WorldZone =
    | "central-nexus"
    | "arena-chess"
    | "arena-poker"
    | "arena-monopoly"
    | "workshop"
    | "marketplace"
    | "hall-of-fame"
    | "grand-arena"
    | "archive"
    | "sky-deck";

export interface ZoneConfig {
    id: WorldZone;
    label: string;
    position: [number, number, number];
    icon: string;
    color: string;
}

export const WORLD_ZONES: ZoneConfig[] = [
    { id: "central-nexus", label: "Central Nexus", position: [0, 0, 0], icon: "◉", color: ZONE_COLORS["central-nexus"] },
    { id: "arena-chess", label: "Chess", position: [0, 0, -60], icon: "♟", color: ZONE_COLORS["arena-chess"] },
    { id: "arena-poker", label: "Poker", position: [60, 0, 0], icon: "♠", color: ZONE_COLORS["arena-poker"] },
    { id: "arena-monopoly", label: "Monopoly", position: [-60, 0, 0], icon: "▦", color: ZONE_COLORS["arena-monopoly"] },
    { id: "workshop", label: "Workshop", position: [0, 0, 60], icon: "⚙", color: ZONE_COLORS["workshop"] },
    { id: "marketplace", label: "Marketplace", position: [45, 0, 45], icon: "◈", color: ZONE_COLORS["marketplace"] },
    { id: "hall-of-fame", label: "Hall of Fame", position: [-45, 0, -45], icon: "★", color: ZONE_COLORS["hall-of-fame"] },
    { id: "grand-arena", label: "Grand Arena", position: [0, 10, -120], icon: "⬡", color: ZONE_COLORS["grand-arena"] },
    { id: "archive", label: "Archive", position: [-280, 0, 280], icon: "📜", color: ZONE_COLORS["archive"] },
    { id: "sky-deck", label: "Sky Deck", position: [0, 80, -300], icon: "🌐", color: ZONE_COLORS["sky-deck"] },
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
    hudOpacity: number;
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
    setHUDOpacity: (opacity: number) => void;
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
    return themeAuraColor(winRate);
}

// Generate initial mock agents
const MOCK_AGENTS: WorldAgent[] = [
    {
        id: "agent-zeus", name: "ZEUS", level: 24, elo: 2450,
        personality: "aggressive", position: [5, 0, 3], targetPosition: [5, 0, 3],
        status: "idle", winRate: 0.82, auraColor: getAuraColor(0.82), zone: "central-nexus",
    },
    {
        id: "agent-athena", name: "ATHENA", level: 21, elo: 2380,
        personality: "adaptive", position: [-3, 0, 7], targetPosition: [-3, 0, 7],
        status: "idle", winRate: 0.75, auraColor: getAuraColor(0.75), zone: "central-nexus",
    },
    {
        id: "agent-blitz", name: "BLITZ", level: 18, elo: 2200,
        personality: "aggressive", position: [60, 0, 2], targetPosition: [60, 0, 2],
        status: "competing", winRate: 0.68, auraColor: getAuraColor(0.68), zone: "arena-poker",
    },
    {
        id: "agent-shadow", name: "SHADOW", level: 16, elo: 2150,
        personality: "conservative", position: [62, 0, -2], targetPosition: [62, 0, -2],
        status: "competing", winRate: 0.61, auraColor: getAuraColor(0.61), zone: "arena-poker",
    },
    {
        id: "agent-titan", name: "TITAN", level: 30, elo: 2600,
        personality: "conservative", position: [2, 0, -58], targetPosition: [2, 0, -58],
        status: "competing", winRate: 0.88, auraColor: getAuraColor(0.88), zone: "arena-chess",
    },
    {
        id: "agent-oracle", name: "ORACLE", level: 28, elo: 2520,
        personality: "adaptive", position: [-2, 0, -62], targetPosition: [-2, 0, -62],
        status: "competing", winRate: 0.84, auraColor: getAuraColor(0.84), zone: "arena-chess",
    },
    {
        id: "agent-phantom", name: "PHANTOM", level: 12, elo: 1900,
        personality: "chaotic", position: [8, 0, -5], targetPosition: [8, 0, -5],
        status: "walking", winRate: 0.52, auraColor: getAuraColor(0.52), zone: "central-nexus",
    },
    {
        id: "agent-viper", name: "VIPER", level: 15, elo: 2050,
        personality: "aggressive", position: [-8, 0, 2], targetPosition: [-8, 0, 2],
        status: "idle", winRate: 0.59, auraColor: getAuraColor(0.59), zone: "central-nexus",
    },
    // NPC agents (autonomous walkers)
    {
        id: "npc-herald", name: "HERALD", level: 8, elo: 1650,
        personality: "adaptive", position: [10, 0, 10], targetPosition: [10, 0, 10],
        status: "idle", winRate: 0.45, auraColor: getAuraColor(0.45), zone: "central-nexus",
    },
    {
        id: "npc-wraith", name: "WRAITH", level: 10, elo: 1780,
        personality: "chaotic", position: [-15, 0, -10], targetPosition: [-15, 0, -10],
        status: "walking", winRate: 0.48, auraColor: getAuraColor(0.48), zone: "central-nexus",
    },
    {
        id: "npc-flux", name: "FLUX", level: 6, elo: 1520,
        personality: "chaotic", position: [50, 0, 40], targetPosition: [50, 0, 40],
        status: "idle", winRate: 0.38, auraColor: getAuraColor(0.38), zone: "marketplace",
    },
    {
        id: "npc-sage", name: "SAGE", level: 14, elo: 1980,
        personality: "conservative", position: [-40, 0, -40], targetPosition: [-40, 0, -40],
        status: "idle", winRate: 0.55, auraColor: getAuraColor(0.55), zone: "hall-of-fame",
    },
    {
        id: "npc-nova", name: "NOVA", level: 9, elo: 1700,
        personality: "aggressive", position: [0, 0, 55], targetPosition: [0, 0, 55],
        status: "walking", winRate: 0.42, auraColor: getAuraColor(0.42), zone: "workshop",
    },
    {
        id: "npc-cipher", name: "CIPHER", level: 11, elo: 1820,
        personality: "adaptive", position: [-55, 0, 5], targetPosition: [-55, 0, 5],
        status: "idle", winRate: 0.50, auraColor: getAuraColor(0.50), zone: "arena-monopoly",
    },
    {
        id: "npc-echo", name: "ECHO", level: 7, elo: 1580,
        personality: "conservative", position: [12, 0, -15], targetPosition: [12, 0, -15],
        status: "walking", winRate: 0.40, auraColor: getAuraColor(0.40), zone: "central-nexus",
    },
    {
        id: "npc-jinx", name: "JINX", level: 5, elo: 1450,
        personality: "chaotic", position: [-10, 0, 15], targetPosition: [-10, 0, 15],
        status: "idle", winRate: 0.35, auraColor: getAuraColor(0.35), zone: "central-nexus",
    },
    {
        id: "npc-rune", name: "RUNE", level: 13, elo: 1920,
        personality: "adaptive", position: [40, 0, -30], targetPosition: [40, 0, -30],
        status: "walking", winRate: 0.53, auraColor: getAuraColor(0.53), zone: "central-nexus",
    },
    {
        id: "npc-drift", name: "DRIFT", level: 4, elo: 1380,
        personality: "aggressive", position: [-20, 0, 30], targetPosition: [-20, 0, 30],
        status: "idle", winRate: 0.32, auraColor: getAuraColor(0.32), zone: "central-nexus",
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
    appState: "spawning",
    playerPosition: [0, 0, 8],
    playerTarget: null,
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
    hudOpacity: 1,
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
    setHUDOpacity: (opacity) => set({ hudOpacity: Math.max(0, Math.min(1, opacity)) }),
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
            // Fade HUD out during zone transition for a cleaner world-jump effect.
            set({ hudOpacity: 0 });

            setTimeout(() => {
                set({
                    currentZone: zone,
                    cameraTarget: zoneConfig.position,
                    playerPosition: [zoneConfig.position[0], 0, zoneConfig.position[2] + 5],
                    playerTarget: null,
                });

                setTimeout(() => {
                    set({ hudOpacity: 1 });
                }, 200);
            }, 180);
        }
    },

    connectBackendEvents: () => {
        // Hydrate initially via HTTP
        apiGet("/arenas/live")
            .then((data) => {
                if (data.arenas && data.arenas.length > 0) {
                    const mappedMatches = data.arenas.map((arena: any) => ({
                        id: arena.id,
                        gameType: arena.game_type,
                        zone: `arena-${arena.game_type}` as WorldZone,
                        agentA: { name: arena.agent_a?.name || "Agent A", elo: 2000 },
                        agentB: { name: arena.agent_b?.name || "Agent B", elo: 2000 },
                        spectators: arena.spectators || 0,
                        odds: [
                            parseFloat(((arena.live_odds?.agent_a?.probability ?? 0.5) * 100).toFixed(0)),
                            parseFloat(((arena.live_odds?.agent_b?.probability ?? 0.5) * 100).toFixed(0)),
                        ],
                        status: arena.status,
                        pool: 10000,
                        dramaScore: 5.0,
                    }));
                    set({ liveMatches: mappedMatches });

                    // Establish WebSocket connection for real-time live events to each active arena
                    data.arenas.forEach((arena: any) => {
                        const ws = new WebSocket(wsUrl(`/arenas/${arena.id}/stream`));
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
                                            odds: msg.live_odds
                                                ? [
                                                    parseFloat(((msg.live_odds.agent_a?.probability ?? 0.5) * 100).toFixed(0)),
                                                    parseFloat(((msg.live_odds.agent_b?.probability ?? 0.5) * 100).toFixed(0)),
                                                ]
                                                : m.odds,
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
            .catch((err) => console.log("Backend offline, using mock matches."));
        
        // Remove loop fallback now that WS is implemented
    },
}));
