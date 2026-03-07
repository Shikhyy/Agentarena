// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// Interface for ArenaToken's burn hook
interface IArenaToken is IERC20 {
    function processBreedingFee(uint256 totalFee) external;
    function recordMatchPlayed(address player) external;
}

interface IAgentNFT {
    function ownerOf(uint256 tokenId) external view returns (address);
    function mintAgent(address to, string calldata tokenURI) external returns (uint256);
}

/**
 * @title BreedingContract
 * @notice On-chain agent breeding for AgentArena.
 *
 * Fee: 5 $ARENA base + 5% of parents combined on-chain earnings.
 * Of that fee: 50% burned, 50% to treasury — handled by ArenaToken.processBreedingFee().
 *
 * Requirements per PRD:
 *  - Both parent agents L10+
 *  - Each parent breed_count < 3
 *  - Offspring: averaged traits + 10% random mutation
 *  - Offspring starts at L1, no skills equipped
 */
contract BreedingContract {
    using SafeERC20 for IArenaToken;

    // ─── Constants ───────────────────────────────────────────────
    uint256 public constant BASE_FEE           = 5 ether;   // 5 $ARENA
    uint256 public constant EARNINGS_FEE_BPS   = 500;       // 5% of combined earnings
    uint256 public constant MIN_LEVEL_TO_BREED = 10;
    uint256 public constant MAX_BREED_COUNT    = 3;

    // ─── State ───────────────────────────────────────────────────
    IArenaToken public immutable arenaToken;
    IAgentNFT   public immutable agentNFT;
    address     public owner;

    mapping(uint256 => uint256) public breedCount;    // tokenId → breeds used
    mapping(uint256 => uint256) public agentLevel;    // tokenId → level
    mapping(uint256 => uint256) public agentEarnings; // tokenId → total $ARENA earned

    uint256 public totalPairsCreated;

    // ─── Events ──────────────────────────────────────────────────
    event AgentBred(
        uint256 indexed parentA,
        uint256 indexed parentB,
        uint256 indexed offspringId,
        uint256 fee,
        address breeder
    );
    event LevelUpdated(uint256 indexed tokenId, uint256 newLevel);
    event EarningsRecorded(uint256 indexed tokenId, uint256 amount);

    // ─── Errors ──────────────────────────────────────────────────
    error NotAgentOwner(uint256 tokenId);
    error AgentLevelTooLow(uint256 tokenId, uint256 currentLevel);
    error BreedCountExceeded(uint256 tokenId, uint256 count);
    error SameAgent();
    error NotOwner();

    // ─── Constructor ─────────────────────────────────────────────
    constructor(address _arenaToken, address _agentNFT) {
        arenaToken = IArenaToken(_arenaToken);
        agentNFT   = IAgentNFT(_agentNFT);
        owner      = msg.sender;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    // ─── Core Breed ──────────────────────────────────────────────

    /**
     * @notice Breed two agents.
     * Fee is pulled via transferFrom; ArenaToken.processBreedingFee burns 50%,
     * forwards 50% to treasury — no extra transfer logic needed here.
     */
    function breed(
        uint256 parentAId,
        uint256 parentBId,
        string calldata /* offspringName */
    ) external returns (uint256 offspringId) {
        if (parentAId == parentBId) revert SameAgent();

        // Ownership checks
        if (agentNFT.ownerOf(parentAId) != msg.sender) revert NotAgentOwner(parentAId);
        if (agentNFT.ownerOf(parentBId) != msg.sender) revert NotAgentOwner(parentBId);

        // Level checks (PRD: L10+)
        if (agentLevel[parentAId] < MIN_LEVEL_TO_BREED)
            revert AgentLevelTooLow(parentAId, agentLevel[parentAId]);
        if (agentLevel[parentBId] < MIN_LEVEL_TO_BREED)
            revert AgentLevelTooLow(parentBId, agentLevel[parentBId]);

        // Breed count checks (PRD: max 3)
        if (breedCount[parentAId] >= MAX_BREED_COUNT)
            revert BreedCountExceeded(parentAId, breedCount[parentAId]);
        if (breedCount[parentBId] >= MAX_BREED_COUNT)
            revert BreedCountExceeded(parentBId, breedCount[parentBId]);

        // Compute fee: 5 $ARENA + 5% of combined earnings
        uint256 fee = calculateFee(parentAId, parentBId);

        // Pull fee from caller → this contract
        arenaToken.safeTransferFrom(msg.sender, address(this), fee);

        // Approve ArenaToken to pull from this contract for processBreedingFee
        arenaToken.approve(address(arenaToken), fee);

        // ArenaToken handles: burn 50%, treasury 50%
        arenaToken.processBreedingFee(fee);

        // Update breed counts
        breedCount[parentAId]++;
        breedCount[parentBId]++;
        totalPairsCreated++;

        // Build IPFS URI (traits computed off-chain via Oracle)
        string memory offspringURI = string(abi.encodePacked(
            "ipfs://agentarena/offspring/",
            _uint2str(parentAId),
            "x",
            _uint2str(parentBId)
        ));

        // Mint offspring NFT to caller
        offspringId = agentNFT.mintAgent(msg.sender, offspringURI);

        // Initialize offspring stats
        agentLevel[offspringId]    = 1;
        agentEarnings[offspringId] = 0;
        breedCount[offspringId]    = 0;

        emit AgentBred(parentAId, parentBId, offspringId, fee, msg.sender);
    }

    // ─── Fee Calculator ──────────────────────────────────────────

    function calculateFee(uint256 parentAId, uint256 parentBId) public view returns (uint256) {
        uint256 combined = agentEarnings[parentAId] + agentEarnings[parentBId];
        uint256 earningsFee = (combined * EARNINGS_FEE_BPS) / 10_000;
        return BASE_FEE + earningsFee;
    }

    // ─── Admin (called by game server) ──────────────────────────

    function setAgentLevel(uint256 tokenId, uint256 level) external onlyOwner {
        agentLevel[tokenId] = level;
        emit LevelUpdated(tokenId, level);
    }

    function recordEarnings(uint256 tokenId, uint256 amount) external onlyOwner {
        agentEarnings[tokenId] += amount;
        emit EarningsRecorded(tokenId, amount);
    }

    function setBatchLevels(uint256[] calldata tokenIds, uint256[] calldata levels) external onlyOwner {
        require(tokenIds.length == levels.length, "Length mismatch");
        for (uint256 i = 0; i < tokenIds.length; i++) {
            agentLevel[tokenIds[i]] = levels[i];
            emit LevelUpdated(tokenIds[i], levels[i]);
        }
    }

    // ─── View ────────────────────────────────────────────────────

    function getParentInfo(uint256 tokenId) external view returns (
        uint256 level,
        uint256 breeds,
        uint256 earnings,
        bool    canBreed
    ) {
        level    = agentLevel[tokenId];
        breeds   = breedCount[tokenId];
        earnings = agentEarnings[tokenId];
        canBreed = level >= MIN_LEVEL_TO_BREED && breeds < MAX_BREED_COUNT;
    }

    function breedingEnabled(uint256 parentA, uint256 parentB) external view returns (bool, string memory) {
        if (parentA == parentB)                              return (false, "Same agent");
        if (agentLevel[parentA] < MIN_LEVEL_TO_BREED)       return (false, "Agent A below L10");
        if (agentLevel[parentB] < MIN_LEVEL_TO_BREED)       return (false, "Agent B below L10");
        if (breedCount[parentA] >= MAX_BREED_COUNT)         return (false, "Agent A breed limit reached");
        if (breedCount[parentB] >= MAX_BREED_COUNT)         return (false, "Agent B breed limit reached");
        return (true, "");
    }

    // ─── Helpers ─────────────────────────────────────────────────

    function _uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) return "0";
        uint256 j = _i; uint256 len;
        while (j != 0) { len++; j /= 10; }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) { k -= 1; bstr[k] = bytes1(uint8(48 + _i % 10)); _i /= 10; }
        return string(bstr);
    }
}
