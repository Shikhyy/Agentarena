// ─── AgentArena Contract Configuration ───────────────────────────────
// Full ABIs for all 5 deployed contracts, using viem-compatible format.
// Addresses loaded from env vars; fallback to Hardhat defaults from deployed.json.

export const CONTRACTS = {
  ARENA_TOKEN: process.env.NEXT_PUBLIC_ARENA_TOKEN_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  AGENT_NFT: process.env.NEXT_PUBLIC_AGENT_NFT_ADDRESS || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  SKILL_NFT: process.env.NEXT_PUBLIC_SKILL_NFT_ADDRESS || "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  ZK_BETTING_POOL: process.env.NEXT_PUBLIC_ZK_BETTING_POOL_ADDRESS || "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
  RESULT_ORACLE: process.env.NEXT_PUBLIC_RESULT_ORACLE_ADDRESS || "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
} as const;

// ── ArenaToken ABI (ERC-20 + Burnable + Vesting + Referral) ──────────

export const ARENA_TOKEN_ABI = [
  { type: "function", name: "name", inputs: [], outputs: [{ type: "string" }], stateMutability: "view" },
  { type: "function", name: "symbol", inputs: [], outputs: [{ type: "string" }], stateMutability: "view" },
  { type: "function", name: "decimals", inputs: [], outputs: [{ type: "uint8" }], stateMutability: "view" },
  { type: "function", name: "totalSupply", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "balanceOf", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "transfer", inputs: [{ name: "to", type: "address" }, { name: "value", type: "uint256" }], outputs: [{ type: "bool" }], stateMutability: "nonpayable" },
  { type: "function", name: "transferFrom", inputs: [{ name: "from", type: "address" }, { name: "to", type: "address" }, { name: "value", type: "uint256" }], outputs: [{ type: "bool" }], stateMutability: "nonpayable" },
  { type: "function", name: "approve", inputs: [{ name: "spender", type: "address" }, { name: "value", type: "uint256" }], outputs: [{ type: "bool" }], stateMutability: "nonpayable" },
  { type: "function", name: "allowance", inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "burn", inputs: [{ name: "value", type: "uint256" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "burnFrom", inputs: [{ name: "account", type: "address" }, { name: "value", type: "uint256" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "totalBurned", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "circulatingSupply", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "getBurnStats", inputs: [], outputs: [{ name: "burned", type: "uint256" }, { name: "remaining", type: "uint256" }, { name: "burnPercent", type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "distributeReward", inputs: [{ name: "to", type: "address" }, { name: "amount", type: "uint256" }, { name: "reason", type: "string" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "createVesting", inputs: [{ name: "beneficiary", type: "address" }, { name: "amount", type: "uint256" }, { name: "duration", type: "uint64" }, { name: "revocable", type: "bool" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "releaseVested", inputs: [], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "getVestedAmount", inputs: [{ name: "beneficiary", type: "address" }], outputs: [{ name: "vested", type: "uint256" }, { name: "releasable", type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "registerReferral", inputs: [{ name: "referee", type: "address" }, { name: "referrer", type: "address" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "processBreedingFee", inputs: [{ name: "totalFee", type: "uint256" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "processMarketplaceRake", inputs: [{ name: "saleAmount", type: "uint256" }, { name: "seller", type: "address" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "processTournamentEntry", inputs: [{ name: "totalFee", type: "uint256" }, { name: "prizePool", type: "address" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "owner", inputs: [], outputs: [{ type: "address" }], stateMutability: "view" },
  // Events
  { type: "event", name: "Transfer", inputs: [{ name: "from", type: "address", indexed: true }, { name: "to", type: "address", indexed: true }, { name: "value", type: "uint256", indexed: false }] },
  { type: "event", name: "Approval", inputs: [{ name: "owner", type: "address", indexed: true }, { name: "spender", type: "address", indexed: true }, { name: "value", type: "uint256", indexed: false }] },
  { type: "event", name: "RewardDistributed", inputs: [{ name: "to", type: "address", indexed: true }, { name: "amount", type: "uint256", indexed: false }, { name: "reason", type: "string", indexed: false }] },
  { type: "event", name: "VestingCreated", inputs: [{ name: "beneficiary", type: "address", indexed: true }, { name: "amount", type: "uint256", indexed: false }, { name: "duration", type: "uint64", indexed: false }] },
  { type: "event", name: "VestingReleased", inputs: [{ name: "beneficiary", type: "address", indexed: true }, { name: "amount", type: "uint256", indexed: false }] },
  { type: "event", name: "ReferralRewarded", inputs: [{ name: "referrer", type: "address", indexed: true }, { name: "referee", type: "address", indexed: true }, { name: "amount", type: "uint256", indexed: false }] },
] as const;

// ── AgentNFT ABI (ERC-721 Enumerable + Stats + Breeding + Skills) ────

export const AGENT_NFT_ABI = [
  { type: "function", name: "name", inputs: [], outputs: [{ type: "string" }], stateMutability: "view" },
  { type: "function", name: "symbol", inputs: [], outputs: [{ type: "string" }], stateMutability: "view" },
  { type: "function", name: "totalSupply", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "balanceOf", inputs: [{ name: "owner", type: "address" }], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "ownerOf", inputs: [{ name: "tokenId", type: "uint256" }], outputs: [{ type: "address" }], stateMutability: "view" },
  { type: "function", name: "tokenURI", inputs: [{ name: "tokenId", type: "uint256" }], outputs: [{ type: "string" }], stateMutability: "view" },
  { type: "function", name: "tokenByIndex", inputs: [{ name: "index", type: "uint256" }], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "tokenOfOwnerByIndex", inputs: [{ name: "owner", type: "address" }, { name: "index", type: "uint256" }], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "approve", inputs: [{ name: "to", type: "address" }, { name: "tokenId", type: "uint256" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "getApproved", inputs: [{ name: "tokenId", type: "uint256" }], outputs: [{ type: "address" }], stateMutability: "view" },
  { type: "function", name: "setApprovalForAll", inputs: [{ name: "operator", type: "address" }, { name: "approved", type: "bool" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "isApprovedForAll", inputs: [{ name: "owner", type: "address" }, { name: "operator", type: "address" }], outputs: [{ type: "bool" }], stateMutability: "view" },
  { type: "function", name: "transferFrom", inputs: [{ name: "from", type: "address" }, { name: "to", type: "address" }, { name: "tokenId", type: "uint256" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "mintAgent", inputs: [{ name: "name", type: "string" }, { name: "personality", type: "string" }, { name: "metadataURI", type: "string" }], outputs: [{ type: "uint256" }], stateMutability: "payable" },
  { type: "function", name: "mintPrice", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "maxSupply", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "breedAgents", inputs: [{ name: "parentA", type: "uint256" }, { name: "parentB", type: "uint256" }, { name: "childName", type: "string" }, { name: "childPersonality", type: "string" }, { name: "metadataURI", type: "string" }], outputs: [{ type: "uint256" }], stateMutability: "payable" },
  { type: "function", name: "breedPrice", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "retireAgent", inputs: [{ name: "tokenId", type: "uint256" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "agentStats", inputs: [{ name: "tokenId", type: "uint256" }], outputs: [{ name: "name", type: "string" }, { name: "personality", type: "string" }, { name: "xp", type: "uint256" }, { name: "elo", type: "uint256" }, { name: "level", type: "uint16" }, { name: "wins", type: "uint32" }, { name: "losses", type: "uint32" }, { name: "gamesPlayed", type: "uint32" }, { name: "createdAt", type: "uint64" }, { name: "lastBattleAt", type: "uint64" }, { name: "isRetired", type: "bool" }], stateMutability: "view" },
  { type: "function", name: "bloodline", inputs: [{ name: "tokenId", type: "uint256" }], outputs: [{ name: "parentA", type: "uint256" }, { name: "parentB", type: "uint256" }, { name: "generation", type: "uint8" }], stateMutability: "view" },
  { type: "function", name: "updateStats", inputs: [{ name: "tokenId", type: "uint256" }, { name: "xpGained", type: "uint256" }, { name: "eloChange", type: "int256" }, { name: "won", type: "bool" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "equipSkill", inputs: [{ name: "agentId", type: "uint256" }, { name: "skillId", type: "uint256" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "unequipSkill", inputs: [{ name: "agentId", type: "uint256" }, { name: "skillIndex", type: "uint256" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "getEquippedSkills", inputs: [{ name: "agentId", type: "uint256" }], outputs: [{ type: "uint256[]" }], stateMutability: "view" },
  { type: "function", name: "owner", inputs: [], outputs: [{ type: "address" }], stateMutability: "view" },
  // Events
  { type: "event", name: "AgentMinted", inputs: [{ name: "tokenId", type: "uint256", indexed: true }, { name: "owner", type: "address", indexed: true }, { name: "name", type: "string", indexed: false }, { name: "personality", type: "string", indexed: false }] },
  { type: "event", name: "AgentBred", inputs: [{ name: "childId", type: "uint256", indexed: true }, { name: "parentA", type: "uint256", indexed: false }, { name: "parentB", type: "uint256", indexed: false }, { name: "generation", type: "uint8", indexed: false }] },
  { type: "event", name: "AgentRetired", inputs: [{ name: "tokenId", type: "uint256", indexed: true }, { name: "name", type: "string", indexed: false }, { name: "finalElo", type: "uint256", indexed: false }] },
  { type: "event", name: "StatsUpdated", inputs: [{ name: "tokenId", type: "uint256", indexed: true }, { name: "xp", type: "uint256", indexed: false }, { name: "elo", type: "uint256", indexed: false }, { name: "level", type: "uint16", indexed: false }, { name: "wins", type: "uint32", indexed: false }, { name: "losses", type: "uint32", indexed: false }] },
  { type: "event", name: "SkillEquipped", inputs: [{ name: "agentId", type: "uint256", indexed: true }, { name: "skillId", type: "uint256", indexed: false }] },
  { type: "event", name: "SkillUnequipped", inputs: [{ name: "agentId", type: "uint256", indexed: true }, { name: "skillId", type: "uint256", indexed: false }] },
  { type: "event", name: "Transfer", inputs: [{ name: "from", type: "address", indexed: true }, { name: "to", type: "address", indexed: true }, { name: "tokenId", type: "uint256", indexed: true }] },
] as const;

// ── SkillNFT ABI (ERC-1155 + Marketplace) ────────────────────────────

export const SKILL_NFT_ABI = [
  { type: "function", name: "balanceOf", inputs: [{ name: "account", type: "address" }, { name: "id", type: "uint256" }], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "balanceOfBatch", inputs: [{ name: "accounts", type: "address[]" }, { name: "ids", type: "uint256[]" }], outputs: [{ type: "uint256[]" }], stateMutability: "view" },
  { type: "function", name: "safeTransferFrom", inputs: [{ name: "from", type: "address" }, { name: "to", type: "address" }, { name: "id", type: "uint256" }, { name: "value", type: "uint256" }, { name: "data", type: "bytes" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "setApprovalForAll", inputs: [{ name: "operator", type: "address" }, { name: "approved", type: "bool" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "isApprovedForAll", inputs: [{ name: "account", type: "address" }, { name: "operator", type: "address" }], outputs: [{ type: "bool" }], stateMutability: "view" },
  { type: "function", name: "uri", inputs: [{ name: "id", type: "uint256" }], outputs: [{ type: "string" }], stateMutability: "view" },
  { type: "function", name: "totalSupply", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "exists", inputs: [{ name: "id", type: "uint256" }], outputs: [{ type: "bool" }], stateMutability: "view" },
  { type: "function", name: "getSkill", inputs: [{ name: "skillId", type: "uint256" }], outputs: [{ name: "", type: "tuple", components: [{ name: "name", type: "string" }, { name: "description", type: "string" }, { name: "rarity", type: "uint8" }, { name: "gameType", type: "uint8" }, { name: "maxSupply", type: "uint256" }, { name: "price", type: "uint256" }, { name: "active", type: "bool" }] }], stateMutability: "view" },
  { type: "function", name: "getSkillCount", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "nextSkillId", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "purchaseSkill", inputs: [{ name: "skillId", type: "uint256" }, { name: "amount", type: "uint256" }], outputs: [], stateMutability: "payable" },
  { type: "function", name: "createSkill", inputs: [{ name: "name", type: "string" }, { name: "description", type: "string" }, { name: "rarity", type: "uint8" }, { name: "gameType", type: "uint8" }, { name: "maxSupply", type: "uint256" }, { name: "price", type: "uint256" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "rewardSkill", inputs: [{ name: "to", type: "address" }, { name: "skillId", type: "uint256" }, { name: "amount", type: "uint256" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "setSkillActive", inputs: [{ name: "skillId", type: "uint256" }, { name: "active", type: "bool" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "setSkillPrice", inputs: [{ name: "skillId", type: "uint256" }, { name: "price", type: "uint256" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "owner", inputs: [], outputs: [{ type: "address" }], stateMutability: "view" },
  // Events
  { type: "event", name: "SkillCreated", inputs: [{ name: "skillId", type: "uint256", indexed: true }, { name: "name", type: "string", indexed: false }, { name: "rarity", type: "uint8", indexed: false }, { name: "gameType", type: "uint8", indexed: false }] },
  { type: "event", name: "SkillPurchased", inputs: [{ name: "skillId", type: "uint256", indexed: true }, { name: "buyer", type: "address", indexed: true }, { name: "amount", type: "uint256", indexed: false }] },
  { type: "event", name: "TransferSingle", inputs: [{ name: "operator", type: "address", indexed: true }, { name: "from", type: "address", indexed: true }, { name: "to", type: "address", indexed: true }, { name: "id", type: "uint256", indexed: false }, { name: "value", type: "uint256", indexed: false }] },
] as const;

// ── ZKBettingPool ABI (Commit-Reveal + Parimutuel + ZK) ──────────────

export const ZK_BETTING_POOL_ABI = [
  { type: "function", name: "arenaToken", inputs: [], outputs: [{ type: "address" }], stateMutability: "view" },
  { type: "function", name: "createGame", inputs: [{ name: "gameType", type: "string" }, { name: "agentAId", type: "bytes32" }, { name: "agentBId", type: "bytes32" }, { name: "currency", type: "uint8" }], outputs: [{ type: "uint256" }], stateMutability: "nonpayable" },
  { type: "function", name: "commitBetArena", inputs: [{ name: "gameId", type: "uint256" }, { name: "amount", type: "uint256" }, { name: "commitHash", type: "bytes32" }, { name: "noirCommit", type: "bytes32" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "commitBetETH", inputs: [{ name: "gameId", type: "uint256" }, { name: "commitHash", type: "bytes32" }, { name: "noirCommit", type: "bytes32" }], outputs: [], stateMutability: "payable" },
  { type: "function", name: "revealAndClaim", inputs: [{ name: "gameId", type: "uint256" }, { name: "side", type: "uint8" }, { name: "secret", type: "uint256" }, { name: "noirProof", type: "bytes" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "lockBetting", inputs: [{ name: "gameId", type: "uint256" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "resolveGame", inputs: [{ name: "gameId", type: "uint256" }, { name: "winner", type: "uint8" }, { name: "noirAttestation", type: "bytes" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "getGameOdds", inputs: [{ name: "gameId", type: "uint256" }], outputs: [{ name: "totalA", type: "uint256" }, { name: "totalB", type: "uint256" }, { name: "impliedProbA", type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "getCommitHash", inputs: [{ name: "amount", type: "uint256" }, { name: "side", type: "uint8" }, { name: "secret", type: "uint256" }], outputs: [{ type: "bytes32" }], stateMutability: "pure" },
  { type: "function", name: "games", inputs: [{ name: "gameId", type: "uint256" }], outputs: [{ name: "agentAId", type: "bytes32" }, { name: "agentBId", type: "bytes32" }, { name: "gameType", type: "string" }, { name: "status", type: "uint8" }, { name: "currency", type: "uint8" }, { name: "totalPoolA", type: "uint256" }, { name: "totalPoolB", type: "uint256" }, { name: "winner", type: "uint8" }, { name: "startedAt", type: "uint64" }, { name: "resolvedAt", type: "uint64" }], stateMutability: "view" },
  { type: "function", name: "commitments", inputs: [{ name: "gameId", type: "uint256" }, { name: "bettor", type: "address" }], outputs: [{ name: "commitHash", type: "bytes32" }, { name: "noirCommit", type: "bytes32" }, { name: "amount", type: "uint256" }, { name: "side", type: "uint8" }, { name: "revealed", type: "bool" }, { name: "claimed", type: "bool" }], stateMutability: "view" },
  { type: "function", name: "nextGameId", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "minBetArena", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "minBetEth", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "rakePercent", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "rakeAccumulated", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "treasury", inputs: [], outputs: [{ type: "address" }], stateMutability: "view" },
  { type: "function", name: "owner", inputs: [], outputs: [{ type: "address" }], stateMutability: "view" },
  // Events
  { type: "event", name: "BetCommitted", inputs: [{ name: "gameId", type: "uint256", indexed: true }, { name: "bettor", type: "address", indexed: true }, { name: "commitHash", type: "bytes32", indexed: false }, { name: "noirCommit", type: "bytes32", indexed: false }] },
  { type: "event", name: "BetRevealedAndClaimed", inputs: [{ name: "gameId", type: "uint256", indexed: true }, { name: "bettor", type: "address", indexed: true }, { name: "side", type: "uint8", indexed: false }, { name: "amount", type: "uint256", indexed: false }, { name: "payout", type: "uint256", indexed: false }, { name: "noirProof", type: "bytes", indexed: false }] },
  { type: "event", name: "GameCreated", inputs: [{ name: "gameId", type: "uint256", indexed: true }, { name: "gameType", type: "string", indexed: false }, { name: "agentA", type: "bytes32", indexed: false }, { name: "agentB", type: "bytes32", indexed: false }] },
  { type: "event", name: "GameResolved", inputs: [{ name: "gameId", type: "uint256", indexed: true }, { name: "winner", type: "uint8", indexed: false }, { name: "noirAttestation", type: "bytes", indexed: false }] },
  { type: "event", name: "RakeCollected", inputs: [{ name: "gameId", type: "uint256", indexed: true }, { name: "amount", type: "uint256", indexed: false }] },
] as const;

// ── ResultOracle ABI ─────────────────────────────────────────────────

export const RESULT_ORACLE_ABI = [
  { type: "function", name: "attestResult", inputs: [{ name: "gameId", type: "uint256" }, { name: "agentAId", type: "bytes32" }, { name: "agentBId", type: "bytes32" }, { name: "outcome", type: "uint8" }, { name: "noirProof", type: "bytes" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "disputeResult", inputs: [{ name: "gameId", type: "uint256" }, { name: "reason", type: "string" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "getResult", inputs: [{ name: "gameId", type: "uint256" }], outputs: [{ name: "outcome", type: "uint8" }, { name: "finalized", type: "bool" }, { name: "attestedAt", type: "uint256" }, { name: "confirmations", type: "uint8" }], stateMutability: "view" },
  { type: "function", name: "results", inputs: [{ name: "gameId", type: "uint256" }], outputs: [{ name: "gameId", type: "uint256" }, { name: "agentAId", type: "bytes32" }, { name: "agentBId", type: "bytes32" }, { name: "outcome", type: "uint8" }, { name: "noirProof", type: "bytes" }, { name: "attestedAt", type: "uint256" }, { name: "finalized", type: "bool" }, { name: "confirmations", type: "uint8" }], stateMutability: "view" },
  { type: "function", name: "CHALLENGE_PERIOD", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "requiredConfirmations", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "bettingPool", inputs: [], outputs: [{ type: "address" }], stateMutability: "view" },
  { type: "function", name: "trustedJudges", inputs: [{ name: "judge", type: "address" }], outputs: [{ type: "bool" }], stateMutability: "view" },
  { type: "function", name: "owner", inputs: [], outputs: [{ type: "address" }], stateMutability: "view" },
  // Events
  { type: "event", name: "ResultAttested", inputs: [{ name: "gameId", type: "uint256", indexed: true }, { name: "judge", type: "address", indexed: true }, { name: "outcome", type: "uint8", indexed: false }] },
  { type: "event", name: "ResultFinalized", inputs: [{ name: "gameId", type: "uint256", indexed: true }, { name: "outcome", type: "uint8", indexed: false }, { name: "noirProof", type: "bytes", indexed: false }] },
  { type: "event", name: "ResultDisputed", inputs: [{ name: "gameId", type: "uint256", indexed: true }, { name: "disputer", type: "address", indexed: false }, { name: "reason", type: "string", indexed: false }] },
] as const;

// ── Helper functions for backward compatibility ──────────────────────
// These replace the old ethers.js helpers with viem-compatible versions.

import { keccak256, encodePacked, parseUnits, formatUnits, createPublicClient, http, type Address } from "viem";
import { hardhat } from "viem/chains";

/**
 * Compute a commit hash for ZK betting: keccak256(abi.encodePacked(amount, side, secret))
 */
export function computeCommitHash(amount: bigint, side: number, secret: bigint): `0x${string}` {
  return keccak256(
    encodePacked(
      ["uint256", "uint8", "uint256"],
      [amount, side, secret],
    ),
  );
}

/**
 * Parse a human-readable ARENA amount to wei (18 decimals)
 */
export function parseArena(amount: string | number): bigint {
  return parseUnits(String(amount), 18);
}

/**
 * Format wei to human-readable ARENA string
 */
export function formatArena(wei: bigint): string {
  return formatUnits(wei, 18);
}

/**
 * Create a read-only public client for contract reads.
 * Returns null if running server-side.
 */
function getPublicClient() {
  if (typeof window === "undefined") return null;
  return createPublicClient({
    chain: hardhat,
    transport: http(),
  });
}

/**
 * Fetch ARENA token balance for an address.
 * Returns formatted string (e.g. "1000.0"). Falls back to "0" on error.
 */
export async function fetchArenaBalance(address: string): Promise<string> {
  const client = getPublicClient();
  if (!client) return "0";
  try {
    const balance = await client.readContract({
      address: CONTRACTS.ARENA_TOKEN as Address,
      abi: ARENA_TOKEN_ABI,
      functionName: "balanceOf",
      args: [address as Address],
    });
    return formatArena(balance as bigint);
  } catch {
    return "0";
  }
}

/**
 * Legacy compat: returns a read-only ZK betting pool interface stub.
 * In the new architecture, use wagmi hooks (useReadContract) instead.
 */
export function getZKBettingPoolRead() {
  const client = getPublicClient();
  if (!client) return null;
  return {
    async getGameOdds(gameId: number): Promise<[bigint, bigint, bigint]> {
      try {
        const result = await client.readContract({
          address: CONTRACTS.ZK_BETTING_POOL as Address,
          abi: ZK_BETTING_POOL_ABI,
          functionName: "getGameOdds",
          args: [BigInt(gameId)],
        });
        return result as [bigint, bigint, bigint];
      } catch {
        return [BigInt(0), BigInt(0), BigInt(5000)]; // 50/50 fallback
      }
    },
  };
}

/**
 * Stub for legacy write helpers. In the new architecture, use wagmi's
 * useWriteContract hook instead. These stubs return null to signal
 * "contracts not available via legacy path".
 */
export function getArenaTokenWrite(): Promise<any> { return Promise.resolve(null); }
export function getZKBettingPoolWrite(): Promise<any> { return Promise.resolve(null); }
