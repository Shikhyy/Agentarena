"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

import { SiweMessage } from "siwe";
import { fetchArenaBalance } from "@/lib/contracts";
import { BACKEND_URL } from "@/lib/api";

// ── Types ────────────────────────────────────────────────────
interface WalletState {
    address: string | null;
    chainId: number | null;
    isConnected: boolean;
    isConnecting: boolean;
    balance: string;
    arenaBalance: string;
    token: string | null;
}

interface WalletContextType extends WalletState {
    connect: () => Promise<void>;
    disconnect: () => void;
    switchToPolygon: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | null>(null);

// ── Polygon chain config ─────────────────────────────────────
const POLYGON_CHAIN = {
    chainId: "0x89", // 137
    chainName: "Polygon Mainnet",
    rpcUrls: ["https://polygon-rpc.com"],
    nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
    blockExplorerUrls: ["https://polygonscan.com"],
};

// ── Provider ─────────────────────────────────────────────────
export function WalletProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<WalletState>({
        address: null,
        chainId: null,
        isConnected: false,
        isConnecting: false,
        balance: "0",
        arenaBalance: "0",
        token: (typeof window !== "undefined" ? localStorage.getItem("agentarena_token") : null),
    });

    const connect = useCallback(async () => {
        // Demo mode: if no MetaMask, simulate a wallet for development
        if (typeof window === "undefined" || !(window as any).ethereum) {
            setState({
                address: "0xDEMO...4321",
                chainId: 137,
                isConnected: true,
                isConnecting: false,
                balance: "0.0000",
                arenaBalance: "1000",
                token: "demo-token",
            });
            console.log("[WalletProvider] Demo mode — no MetaMask detected. Simulated wallet with 1000 $ARENA.");
            return;
        }
        setState((s) => ({ ...s, isConnecting: true }));

        try {
            const ethereum = (window as any).ethereum;
            const accounts = await ethereum.request({ method: "eth_requestAccounts" });
            const address = accounts[0];
            const chainIdHex = await ethereum.request({ method: "eth_chainId" });
            const chainId = parseInt(chainIdHex, 16);

            // 1. Get Nonce from Backend
            const nonceRes = await fetch(`${BACKEND_URL}/auth/nonce`);
            const { nonce } = await nonceRes.json();

            // 2. Create SIWE Message
            const message = new SiweMessage({
                domain: window.location.host,
                address,
                statement: "Sign in to AgentArena. This will issue a session token for secure API access.",
                uri: window.location.origin,
                version: "1",
                chainId,
                nonce,
            });
            const preparedMessage = message.prepareMessage();

            // 3. Prompt user signature
            const signature = await ethereum.request({
                method: "personal_sign",
                params: [preparedMessage, address],
            });

            // 4. Verify signature on backend
            const verifyRes = await fetch(`${BACKEND_URL}/auth/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: message, signature }),
            });

            if (!verifyRes.ok) {
                throw new Error("SIWE verification failed");
            }

            const { token } = await verifyRes.json();
            localStorage.setItem("agentarena_token", token);

            const balanceHex = await ethereum.request({
                method: "eth_getBalance",
                params: [address, "latest"],
            });
            const balanceEth = (parseInt(balanceHex, 16) / 1e18).toFixed(4);

            // Fetch real $ARENA balance — try on-chain first, then backend fallback
            let arenaBalanceStr = await fetchArenaBalance(address);
            if (arenaBalanceStr === "0") {
                // Fallback: ask backend for on-chain balance (backend uses web3.py)
                try {
                    const res = await fetch(`${BACKEND_URL}/blockchain/wallet/${address}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data.arena_token_balance > 0) {
                            arenaBalanceStr = String(Number(data.arena_token_balance).toFixed(2));
                        }
                    }
                } catch { /* ignore backend errors */ }
            }

            setState({
                address,
                chainId,
                isConnected: true,
                isConnecting: false,
                balance: balanceEth,
                arenaBalance: arenaBalanceStr,
                token,
            });
        } catch (err) {
            console.error("Connection failed:", err);
            setState((s) => ({ ...s, isConnecting: false }));
        }
    }, []);

    const disconnect = useCallback(() => {
        localStorage.removeItem("agentarena_token");
        setState({
            address: null,
            chainId: null,
            isConnected: false,
            isConnecting: false,
            balance: "0",
            arenaBalance: "0",
            token: null,
        });
    }, []);

    const switchToPolygon = useCallback(async () => {
        if (!(window as any).ethereum) return;
        try {
            await (window as any).ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: POLYGON_CHAIN.chainId }],
            });
        } catch (err: any) {
            if (err.code === 4902) {
                await (window as any).ethereum.request({
                    method: "wallet_addEthereumChain",
                    params: [POLYGON_CHAIN],
                });
            }
        }
    }, []);

    // Listen for account/chain changes
    useEffect(() => {
        if (typeof window === "undefined" || !(window as any).ethereum) return;
        const ethereum = (window as any).ethereum;
        const handleAccountsChanged = (accounts: string[]) => {
            if (accounts.length === 0) {
                disconnect();
            } else {
                setState((s) => ({ ...s, address: accounts[0] }));
            }
        };
        const handleChainChanged = (chainId: string) => {
            setState((s) => ({ ...s, chainId: parseInt(chainId, 16) }));
        };
        ethereum.on("accountsChanged", handleAccountsChanged);
        ethereum.on("chainChanged", handleChainChanged);
        return () => {
            ethereum.removeListener("accountsChanged", handleAccountsChanged);
            ethereum.removeListener("chainChanged", handleChainChanged);
        };
    }, [disconnect]);

    return (
        <WalletContext.Provider value={{ ...state, connect, disconnect, switchToPolygon }}>
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    const context = useContext(WalletContext);
    if (!context) throw new Error("useWallet must be used within WalletProvider");
    return context;
}
