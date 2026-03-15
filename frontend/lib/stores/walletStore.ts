/**
 * AgentArena — Wallet Store (Zustand 5)
 * Tracks wallet connection state, chain info, and token balances.
 * Works alongside wagmi — this store caches derived UI state.
 */

import { create } from "zustand";

interface WalletStoreState {
  // Connection
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;

  // Balances
  ethBalance: string;
  arenaBalance: string;
  maticBalance: string;

  // Auth
  jwt: string | null;

  // Actions
  setConnected: (address: string, chainId: number) => void;
  setDisconnected: () => void;
  setConnecting: (v: boolean) => void;
  setBalances: (balances: { eth?: string; arena?: string; matic?: string }) => void;
  setJwt: (token: string | null) => void;
  getJwt: () => string | null;
}

export const useWalletStore = create<WalletStoreState>((set, get) => ({
  address: null,
  chainId: null,
  isConnected: false,
  isConnecting: false,

  ethBalance: "0",
  arenaBalance: "0",
  maticBalance: "0",

  jwt: typeof window !== "undefined" ? localStorage.getItem("agentarena_token") : null,

  setConnected: (address, chainId) =>
    set({ address, chainId, isConnected: true, isConnecting: false }),

  setDisconnected: () => {
    if (typeof window !== "undefined") localStorage.removeItem("agentarena_token");
    set({
      address: null,
      chainId: null,
      isConnected: false,
      isConnecting: false,
      ethBalance: "0",
      arenaBalance: "0",
      maticBalance: "0",
      jwt: null,
    });
  },

  setConnecting: (v) => set({ isConnecting: v }),

  setBalances: ({ eth, arena, matic }) =>
    set((s) => ({
      ethBalance: eth ?? s.ethBalance,
      arenaBalance: arena ?? s.arenaBalance,
      maticBalance: matic ?? s.maticBalance,
    })),

  setJwt: (token) => {
    if (typeof window !== "undefined") {
      if (token) localStorage.setItem("agentarena_token", token);
      else localStorage.removeItem("agentarena_token");
    }
    set({ jwt: token });
  },

  getJwt: () => get().jwt,
}));
