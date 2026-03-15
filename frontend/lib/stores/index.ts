/**
 * AgentArena — Zustand 5 Stores
 * Per PRD spec: useArenaStore, useBettingStore, useAgentStore, useWorldStore
 * 
 * useWorldStore is re-exported from /lib/worldStore (existing implementation).
 */

import { create } from "zustand";
import { apiGet, apiPost, wsUrl } from "@/lib/api";

// Re-export the existing world store to avoid duplication
export { useWorldStore } from "@/lib/worldStore";
export { useUIStore } from "./uiStore";

// ─── Arena Store ────────────────────────────────────────────────────────

interface AgentInfo {
    id: string;
    name: string;
    elo: number;
}

interface CommentaryEntry {
    text: string;
    dramaScore: number;
    eventType: string;
    timestamp: number;
}

interface ArenaState {
    activeMatchId: string | null;
    gameType: string | null;
    agentA: AgentInfo | null;
    agentB: AgentInfo | null;
    turnNumber: number;
    agentATurn: boolean;
    spectators: number;
    thinkingAgentId: string | null;
    commentary: CommentaryEntry[];
    agentAProb: number;
    agentBProb: number;
    wsConnected: boolean;
    ws: WebSocket | null;

    connectToArena: (arenaId: string) => void;
    disconnectFromArena: () => void;
    addCommentary: (entry: CommentaryEntry) => void;
    setCommentaryStyle: (style: string) => void;
}

export const useArenaStore = create<ArenaState>((set, get) => ({
    activeMatchId: null,
    gameType: null,
    agentA: null,
    agentB: null,
    turnNumber: 0,
    agentATurn: true,
    spectators: 0,
    thinkingAgentId: null,
    commentary: [],
    agentAProb: 0.5,
    agentBProb: 0.5,
    wsConnected: false,
    ws: null,

    connectToArena: (arenaId: string) => {
        const existingWs = get().ws;
        if (existingWs) existingWs.close();

        const ws = new WebSocket(wsUrl(`/arenas/${arenaId}/stream`));

        ws.onopen = () => set({ wsConnected: true, activeMatchId: arenaId });

        ws.onmessage = (evt) => {
            const msg = JSON.parse(evt.data);

            switch (msg.type) {
                case "connected":
                    set({
                        spectators: msg.spectators || 0,
                        agentA: msg.game_info?.agent_a || null,
                        agentB: msg.game_info?.agent_b || null,
                        gameType: msg.game_info?.game_type || null,
                    });
                    break;

                case "game_state_update":
                    set({
                        turnNumber: msg.turnNumber || 0,
                        agentATurn: msg.agentATurn ?? true,
                        spectators: msg.spectators || 0,
                    });
                    break;

                case "agent_thinking":
                    set({ thinkingAgentId: msg.thinking ? msg.agentId : null });
                    break;

                case "commentary_event":
                    set((state) => ({
                        commentary: [
                            { text: msg.text, dramaScore: msg.dramaScore, eventType: msg.eventType, timestamp: Date.now() },
                            ...state.commentary.slice(0, 49),
                        ],
                    }));
                    break;

                case "odds_update":
                    set({ agentAProb: msg.agentAProb, agentBProb: msg.agentBProb });
                    break;

                case "monopoly_negotiation":
                    set((state) => ({
                        commentary: [
                            { text: ` ${msg.message}`, dramaScore: 6, eventType: "negotiation", timestamp: Date.now() },
                            ...state.commentary.slice(0, 49),
                        ],
                    }));
                    break;

                case "monopoly_bankruptcy":
                    set((state) => ({
                        commentary: [
                            { text: ` BANKRUPTCY DECLARED!`, dramaScore: 10, eventType: "bankruptcy", timestamp: Date.now() },
                            ...state.commentary.slice(0, 49),
                        ],
                    }));
                    break;

                case "match_complete":
                    set((state) => ({
                        commentary: [
                            { text: ` MATCH COMPLETE! Winner: ${msg.winnerId}`, dramaScore: 10, eventType: "match_complete", timestamp: Date.now() },
                            ...state.commentary.slice(0, 49),
                        ],
                    }));
                    break;
            }
        };

        ws.onclose = () => set({ wsConnected: false, ws: null });

        set({ ws });
    },

    disconnectFromArena: () => {
        get().ws?.close();
        set({ ws: null, wsConnected: false, activeMatchId: null });
    },

    addCommentary: (entry: CommentaryEntry) =>
        set((state) => ({
            commentary: [entry, ...state.commentary.slice(0, 49)],
        })),

    setCommentaryStyle: (style: string) => {
        get().ws?.send(JSON.stringify({ type: "set_commentary_style", style }));
    },
}));


// ─── Betting Store ──────────────────────────────────────────────────────

interface BetCommitment {
    arenaId: string;
    amount: number;
    position: number;
    secret: string;
    commitmentHash: string;
    timestamp: number;
    revealed: boolean;
    payout?: number;
    won?: boolean;
}

interface BettingState {
    activeBets: BetCommitment[];
    pendingReveal: BetCommitment | null;
    balance: number;

    commitBet: (arenaId: string, amount: number, position: number, secret: string) => Promise<BetCommitment>;
    revealBet: (arenaId: string, commitment: BetCommitment) => Promise<any>;
    setBetSettled: (arenaId: string, payout: number, won: boolean) => void;
}

export const useBettingStore = create<BettingState>((set, get) => ({
    activeBets: [],
    pendingReveal: null,
    balance: 1000, //  $ARENA balance

    commitBet: async (arenaId: string, amount: number, position: number, secret: string) => {
        const data = await apiPost(`/arenas/${arenaId}/bet`, { amount, position, secret });

        const bet: BetCommitment = {
            arenaId,
            amount,
            position,
            secret,
            commitmentHash: data.commitment_hash || "0x" + "0".repeat(64),
            timestamp: Date.now(),
            revealed: false,
        };

        set((state) => ({
            activeBets: [...state.activeBets, bet],
            balance: state.balance - amount,
        }));

        return bet;
    },

    revealBet: async (arenaId: string, commitment: BetCommitment) => {
        const data = await apiPost(`/arenas/${arenaId}/reveal`, {
            amount: commitment.amount,
            position: commitment.position,
            secret: commitment.secret,
        });

        set((state) => ({
            activeBets: state.activeBets.map((b) =>
                b.commitmentHash === commitment.commitmentHash
                    ? { ...b, revealed: true }
                    : b
            ),
        }));

        return data;
    },

    setBetSettled: (arenaId: string, payout: number, won: boolean) => {
        set((state) => ({
            balance: state.balance + payout,
            activeBets: state.activeBets.map((b) =>
                b.arenaId === arenaId && !b.revealed
                    ? { ...b, revealed: true, payout, won }
                    : b
            ),
        }));
    },
}));


// ─── Agent Store ────────────────────────────────────────────────────────

interface AgentProfile {
    agent_id: string;
    name: string;
    personality: string;
    skills: string[];
    level: number;
    xp: number;
    elo: number;
    wins: number;
    losses: number;
    status: string;
}

interface AgentStoreState {
    myAgents: AgentProfile[];
    selectedAgentId: string | null;
    loading: boolean;

    fetchMyAgents: (wallet: string) => Promise<void>;
    selectAgent: (agentId: string) => void;
    createAgent: (config: Partial<AgentProfile>) => Promise<AgentProfile>;
}

export const useAgentStore = create<AgentStoreState>((set) => ({
    myAgents: [],
    selectedAgentId: null,
    loading: false,

    fetchMyAgents: async (_wallet: string) => {
        set({ loading: true });
        try {
            const data = await apiGet("/agents/my");
            set({ myAgents: data.agents || [], loading: false });
        } catch {
            set({ loading: false });
        }
    },

    selectAgent: (agentId: string) => set({ selectedAgentId: agentId }),

    createAgent: async (config: Partial<AgentProfile>) => {
        const agent = await apiPost("/agents", config);
        set((state) => ({ myAgents: [...state.myAgents, agent] }));
        return agent;
    },
}));




