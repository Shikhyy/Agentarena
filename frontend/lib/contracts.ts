// ─── AgentArena Contract Configuration ───────────────────────────────
// Central config for all on-chain contract interactions via ethers.js.
// Contract addresses are read from environment variables so they can be
// changed per-network (local Hardhat, Polygon Amoy testnet, mainnet).

import { ethers, BrowserProvider, Contract } from "ethers";

// ── Contract Addresses ──────────────────────────────────────────────
export const CONTRACTS = {
    ARENA_TOKEN: process.env.NEXT_PUBLIC_ARENA_TOKEN_ADDRESS || "",
    ZK_BETTING_POOL: process.env.NEXT_PUBLIC_ZK_BETTING_POOL_ADDRESS || "",
    AGENT_NFT: process.env.NEXT_PUBLIC_AGENT_NFT_ADDRESS || "",
};

// ── Minimal ABI excerpts (only the functions the frontend calls) ─────

export const ARENA_TOKEN_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
];

export const ZK_BETTING_POOL_ABI = [
    "function commitBetArena(uint256 gameId, uint256 amount, bytes32 commitHash, bytes32 noirCommit) external",
    "function commitBetETH(uint256 gameId, bytes32 commitHash, bytes32 noirCommit) external payable",
    "function revealAndClaim(uint256 gameId, uint8 side, uint256 secret, bytes calldata noirProof) external",
    "function getGameOdds(uint256 gameId) external view returns (uint256 totalA, uint256 totalB, uint256 impliedProbA)",
    "function getCommitHash(uint256 amount, uint8 side, uint256 secret) external pure returns (bytes32)",
    "function games(uint256) view returns (bytes32 agentAId, bytes32 agentBId, string gameType, uint8 status, uint8 currency, uint256 totalPoolA, uint256 totalPoolB, uint8 winner, uint64 startedAt, uint64 resolvedAt)",
];

export const AGENT_NFT_ABI = [
    "function agentStats(uint256 tokenId) view returns (string name, string personality, uint256 xp, uint256 elo, uint16 level, uint32 wins, uint32 losses, uint32 gamesPlayed, uint64 createdAt, uint64 lastBattleAt, bool isRetired)",
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function balanceOf(address owner) view returns (uint256)",
    "function mintAgent(string name, string personality, string metadataURI) external payable returns (uint256)",
    "function mintPrice() view returns (uint256)",
];

// ── Provider / Signer Helpers ────────────────────────────────────────

/**
 * Returns an ethers BrowserProvider connected to the user's MetaMask.
 * Returns null if MetaMask is not available.
 */
export function getBrowserProvider(): BrowserProvider | null {
    if (typeof window === "undefined" || !(window as any).ethereum) return null;
    return new BrowserProvider((window as any).ethereum);
}

/**
 * Returns a read-only Contract instance (no signer needed).
 */
export function getReadContract(address: string, abi: string[]): Contract | null {
    const provider = getBrowserProvider();
    if (!provider || !address) return null;
    return new Contract(address, abi, provider);
}

/**
 * Returns a Contract instance connected to the user's signer (for write txns).
 */
export async function getWriteContract(address: string, abi: string[]): Promise<Contract | null> {
    const provider = getBrowserProvider();
    if (!provider || !address) return null;
    const signer = await provider.getSigner();
    return new Contract(address, abi, signer);
}

// ── Convenience getters ──────────────────────────────────────────────

export function getArenaTokenRead() {
    return getReadContract(CONTRACTS.ARENA_TOKEN, ARENA_TOKEN_ABI);
}

export async function getArenaTokenWrite() {
    return getWriteContract(CONTRACTS.ARENA_TOKEN, ARENA_TOKEN_ABI);
}

export function getZKBettingPoolRead() {
    return getReadContract(CONTRACTS.ZK_BETTING_POOL, ZK_BETTING_POOL_ABI);
}

export async function getZKBettingPoolWrite() {
    return getWriteContract(CONTRACTS.ZK_BETTING_POOL, ZK_BETTING_POOL_ABI);
}

export function getAgentNFTRead() {
    return getReadContract(CONTRACTS.AGENT_NFT, AGENT_NFT_ABI);
}

/**
 * Fetches the user's $ARENA token balance.
 * Returns a formatted string (e.g. "12,450.00") or "0" if unavailable.
 */
export async function fetchArenaBalance(address: string): Promise<string> {
    try {
        const token = getArenaTokenRead();
        if (!token) return "0";
        const raw: bigint = await token.balanceOf(address);
        const formatted = ethers.formatUnits(raw, 18);
        // Format with commas and 2 decimals
        const num = parseFloat(formatted);
        return num.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    } catch {
        return "0";
    }
}

/**
 * Compute a keccak256 commitment hash matching the on-chain getCommitHash.
 * commitment = keccak256(abi.encodePacked(amount, side, secret))
 */
export function computeCommitHash(amount: bigint, side: number, secret: bigint): string {
    return ethers.solidityPackedKeccak256(
        ["uint256", "uint8", "uint256"],
        [amount, side, secret]
    );
}
