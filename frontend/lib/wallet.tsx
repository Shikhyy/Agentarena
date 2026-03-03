"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

// ── Types ────────────────────────────────────────────────────
interface WalletState {
    address: string | null;
    chainId: number | null;
    isConnected: boolean;
    isConnecting: boolean;
    balance: string;
    arenaBalance: string;
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
    });

    const connect = useCallback(async () => {
        if (typeof window === "undefined" || !(window as any).ethereum) {
            alert("Please install MetaMask to connect your wallet.");
            return;
        }
        setState((s) => ({ ...s, isConnecting: true }));

        try {
            const ethereum = (window as any).ethereum;
            const accounts = await ethereum.request({ method: "eth_requestAccounts" });
            const chainId = await ethereum.request({ method: "eth_chainId" });
            const balanceHex = await ethereum.request({
                method: "eth_getBalance",
                params: [accounts[0], "latest"],
            });
            const balanceEth = (parseInt(balanceHex, 16) / 1e18).toFixed(4);

            setState({
                address: accounts[0],
                chainId: parseInt(chainId, 16),
                isConnected: true,
                isConnecting: false,
                balance: balanceEth,
                arenaBalance: "12,450", // Mock $ARENA balance
            });
        } catch {
            setState((s) => ({ ...s, isConnecting: false }));
        }
    }, []);

    const disconnect = useCallback(() => {
        setState({
            address: null,
            chainId: null,
            isConnected: false,
            isConnecting: false,
            balance: "0",
            arenaBalance: "0",
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
