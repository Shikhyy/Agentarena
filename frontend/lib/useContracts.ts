/**
 * AgentArena — wagmi/viem React Hooks for on-chain contract reads.
 *
 * All hooks gracefully return undefined/null when:
 *  - Wallet not connected
 *  - Wrong chain
 *  - Contract not deployed at configured address
 *
 * Usage:
 *   const { arenaBalance, isLoading } = useArenaTokenBalance(address)
 *   const { agentCount } = useAgentNFTBalance(address)
 *   const { odds } = useMatchOdds(matchId)
 */

"use client";

import { useReadContract, useReadContracts, useChainId, useAccount } from "wagmi";
import { formatUnits } from "viem";
import { polygon, polygonAmoy, hardhat } from "wagmi/chains";
import {
  CONTRACTS,
  ARENA_TOKEN_ABI,
  AGENT_NFT_ABI,
  ZK_BETTING_POOL_ABI,
} from "./contracts";
import type { Address } from "viem";

// ── Chain detection ─────────────────────────────────────────────────

/** Returns true when the wallet is on a supported chain. */
export function useIsCorrectChain(): boolean {
  const chainId = useChainId();
  const supported = [polygon.id, polygonAmoy.id, hardhat.id];
  return supported.includes(chainId);
}

// ── ARENA Token ─────────────────────────────────────────────────────

interface ArenaTokenBalance {
  raw: bigint | undefined;
  formatted: string;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Reads the $ARENA ERC-20 balance for any address.
 * Returns "0" when not connected or contract unavailable.
 */
export function useArenaTokenBalance(address?: string): ArenaTokenBalance {
  const { data, isLoading, error } = useReadContract({
    address: CONTRACTS.ARENA_TOKEN as Address,
    abi: ARENA_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address as Address] : undefined,
    query: { enabled: Boolean(address) },
  });

  const raw = data as bigint | undefined;
  return {
    raw,
    formatted: raw !== undefined ? Number(formatUnits(raw, 18)).toFixed(2) : "0",
    isLoading,
    error: error as Error | null,
  };
}

/**
 * Reads the connected wallet's $ARENA balance directly from wagmi account.
 */
export function useConnectedArenaBalance(): ArenaTokenBalance {
  const { address } = useAccount();
  return useArenaTokenBalance(address);
}

/**
 * Reads token metadata: name, symbol, totalSupply, circulatingSupply.
 */
export function useArenaTokenInfo() {
  const { data, isLoading } = useReadContracts({
    contracts: [
      { address: CONTRACTS.ARENA_TOKEN as Address, abi: ARENA_TOKEN_ABI, functionName: "name" },
      { address: CONTRACTS.ARENA_TOKEN as Address, abi: ARENA_TOKEN_ABI, functionName: "symbol" },
      { address: CONTRACTS.ARENA_TOKEN as Address, abi: ARENA_TOKEN_ABI, functionName: "totalSupply" },
      { address: CONTRACTS.ARENA_TOKEN as Address, abi: ARENA_TOKEN_ABI, functionName: "circulatingSupply" },
      { address: CONTRACTS.ARENA_TOKEN as Address, abi: ARENA_TOKEN_ABI, functionName: "getBurnStats" },
    ],
  });

  const [nameResult, symbolResult, supplyResult, circResult, burnResult] = data ?? [];
  const totalSupply = supplyResult?.result as bigint | undefined;
  const circSupply = circResult?.result as bigint | undefined;
  const burnStats = burnResult?.result as [bigint, bigint, bigint] | undefined;

  return {
    name: nameResult?.result as string | undefined,
    symbol: symbolResult?.result as string | undefined,
    totalSupply: totalSupply ? Number(formatUnits(totalSupply, 18)) : 100_000_000,
    circulatingSupply: circSupply ? Number(formatUnits(circSupply, 18)) : 42_000_000,
    totalBurned: burnStats ? Number(formatUnits(burnStats[0], 18)) : 0,
    burnPercent: burnStats ? Number(burnStats[2]) / 100 : 0,
    isLoading,
  };
}

// ── Agent NFT ───────────────────────────────────────────────────────

interface AgentNFTBalance {
  count: number;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Returns how many AgentNFTs a wallet owns.
 */
export function useAgentNFTBalance(address?: string): AgentNFTBalance {
  const { data, isLoading, error } = useReadContract({
    address: CONTRACTS.AGENT_NFT as Address,
    abi: AGENT_NFT_ABI,
    functionName: "balanceOf",
    args: address ? [address as Address] : undefined,
    query: { enabled: Boolean(address) },
  });

  return {
    count: data !== undefined ? Number(data) : 0,
    isLoading,
    error: error as Error | null,
  };
}

/**
 * Returns total minted AgentNFT supply.
 */
export function useAgentNFTSupply(): { supply: number; isLoading: boolean } {
  const { data, isLoading } = useReadContract({
    address: CONTRACTS.AGENT_NFT as Address,
    abi: AGENT_NFT_ABI,
    functionName: "totalSupply",
  });

  return { supply: data !== undefined ? Number(data) : 0, isLoading };
}

// ── ZK Betting Pool ─────────────────────────────────────────────────

interface MatchOdds {
  oddsA: number;       // 0–100 representing probability %
  oddsB: number;
  rake: number;        // basis points
  isLoading: boolean;
  error: Error | null;
}

/**
 * Reads on-chain odds for a match from the ZK Betting Pool.
 * Falls back to 50/50 if contract not available.
 */
export function useMatchOdds(matchId: number | bigint): MatchOdds {
  const { data, isLoading, error } = useReadContract({
    address: CONTRACTS.ZK_BETTING_POOL as Address,
    abi: ZK_BETTING_POOL_ABI,
    functionName: "getGameOdds",
    args: [BigInt(matchId)],
    query: { enabled: Boolean(matchId) },
  });

  const result = data as [bigint, bigint, bigint] | undefined;
  return {
    oddsA: result ? Number(result[0]) / 100 : 50,
    oddsB: result ? Number(result[1]) / 100 : 50,
    rake: result ? Number(result[2]) / 100 : 250, // default 2.5%
    isLoading,
    error: error as Error | null,
  };
}

// ── Combined wallet summary ──────────────────────────────────────────

interface WalletOnChainSummary {
  arenaBalance: string;
  agentNFTs: number;
  isCorrectChain: boolean;
  isLoading: boolean;
}

/**
 * One-call hook for the Navbar — returns all chain data for the connected wallet.
 */
export function useWalletOnChain(): WalletOnChainSummary {
  const { address } = useAccount();
  const isCorrectChain = useIsCorrectChain();
  const { formatted: arenaBalance, isLoading: loadingToken } = useArenaTokenBalance(address);
  const { count: agentNFTs, isLoading: loadingNFT } = useAgentNFTBalance(address);

  return {
    arenaBalance,
    agentNFTs,
    isCorrectChain,
    isLoading: loadingToken || loadingNFT,
  };
}

// ── Starter Pack Claim ──────────────────────────────────────────────

interface StarterPackStatus {
  hasClaimed: boolean;
  isLoading: boolean;
}

/**
 * Checks if the connected wallet has already claimed the starter pack.
 */
export function useStarterPackStatus(): StarterPackStatus {
  const { address } = useAccount();
  const { data, isLoading } = useReadContract({
    address: CONTRACTS.ARENA_TOKEN as Address,
    abi: ARENA_TOKEN_ABI,
    functionName: "starterClaimed",
    args: address ? [address as Address] : undefined,
    query: { enabled: Boolean(address) },
  });

  return {
    hasClaimed: Boolean(data),
    isLoading,
  };
}
