// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BettingPool
 * @notice Manages private betting on AgentArena game outcomes.
 * @dev Phase 2 MVP: commitment-reveal scheme for basic bet privacy.
 *      Phase 3+: integrate Aztec/Noir ZK proofs for full privacy.
 *
 *      Flow:
 *      1. Users commit: hash(amount, side, salt) during a game
 *      2. After game ends, users reveal their bets
 *      3. Winners claim proportional share of the pool
 */
contract BettingPool is Ownable {

    enum GameStatus { Open, Locked, Resolved }

    struct Game {
        string gameType;         // "chess", "poker"
        bytes32 agentAId;        // agent identifier hash
        bytes32 agentBId;
        GameStatus status;
        uint256 totalPoolA;      // total wagered on agent A
        uint256 totalPoolB;      // total wagered on agent B
        uint8 winner;            // 0=none, 1=agentA, 2=agentB, 3=draw
        uint64 startedAt;
        uint64 resolvedAt;
    }

    struct Commitment {
        bytes32 commitHash;
        bool revealed;
        uint8 side;              // 1=agentA, 2=agentB
        uint256 amount;
        bool claimed;
    }

    mapping(uint256 => Game) public games;
    mapping(uint256 => mapping(address => Commitment)) public commitments;
    uint256 public nextGameId;

    // Fee: 2% rake to treasury
    uint256 public rakePercent = 200; // basis points (2%)
    address public arenaToken;
    address public treasury;

    // ── Events ───────────────────────────────────────────────
    event GameCreated(uint256 indexed gameId, string gameType, bytes32 agentA, bytes32 agentB);
    event BetCommitted(uint256 indexed gameId, address indexed bettor, bytes32 commitHash);
    event BetRevealed(uint256 indexed gameId, address indexed bettor, uint8 side, uint256 amount);
    event GameResolved(uint256 indexed gameId, uint8 winner);
    event WinningsClaimed(uint256 indexed gameId, address indexed bettor, uint256 payout);

    // ── Authorized game resolver ─────────────────────────────
    address public gameResolver;

    modifier onlyResolver() {
        require(msg.sender == gameResolver || msg.sender == owner(), "Not resolver");
        _;
    }

    constructor(address _treasury) Ownable(msg.sender) {
        treasury = _treasury;
    }

    // ── Create a new betting game ────────────────────────────
    function createGame(
        string calldata gameType,
        bytes32 agentAId,
        bytes32 agentBId
    ) external onlyResolver returns (uint256) {
        uint256 gameId = nextGameId++;
        games[gameId] = Game({
            gameType: gameType,
            agentAId: agentAId,
            agentBId: agentBId,
            status: GameStatus.Open,
            totalPoolA: 0,
            totalPoolB: 0,
            winner: 0,
            startedAt: uint64(block.timestamp),
            resolvedAt: 0
        });
        emit GameCreated(gameId, gameType, agentAId, agentBId);
        return gameId;
    }

    // ── Phase 1: Commit a bet ────────────────────────────────
    function commitBet(uint256 gameId, bytes32 commitHash) external payable {
        Game storage game = games[gameId];
        require(game.status == GameStatus.Open, "Betting closed");
        require(msg.value > 0, "Must send ETH");
        require(commitments[gameId][msg.sender].commitHash == 0, "Already committed");

        commitments[gameId][msg.sender] = Commitment({
            commitHash: commitHash,
            revealed: false,
            side: 0,
            amount: msg.value,
            claimed: false
        });

        emit BetCommitted(gameId, msg.sender, commitHash);
    }

    // ── Lock betting (game has started) ──────────────────────
    function lockBetting(uint256 gameId) external onlyResolver {
        games[gameId].status = GameStatus.Locked;
    }

    // ── Reveal bet after game ends ───────────────────────────
    function revealBet(
        uint256 gameId,
        uint8 side,
        uint256 salt
    ) external {
        Game storage game = games[gameId];
        require(game.status == GameStatus.Resolved, "Game not resolved");

        Commitment storage commit = commitments[gameId][msg.sender];
        require(commit.commitHash != 0, "No commitment");
        require(!commit.revealed, "Already revealed");

        // Verify commitment
        bytes32 expected = keccak256(abi.encodePacked(commit.amount, side, salt));
        require(expected == commit.commitHash, "Invalid reveal");

        commit.revealed = true;
        commit.side = side;

        if (side == 1) {
            game.totalPoolA += commit.amount;
        } else if (side == 2) {
            game.totalPoolB += commit.amount;
        }

        emit BetRevealed(gameId, msg.sender, side, commit.amount);
    }

    // ── Resolve game outcome ─────────────────────────────────
    function resolveGame(uint256 gameId, uint8 winner) external onlyResolver {
        Game storage game = games[gameId];
        require(game.status == GameStatus.Locked || game.status == GameStatus.Open, "Already resolved");
        require(winner >= 1 && winner <= 3, "Invalid winner");

        game.status = GameStatus.Resolved;
        game.winner = winner;
        game.resolvedAt = uint64(block.timestamp);

        emit GameResolved(gameId, winner);
    }

    // ── Claim winnings ───────────────────────────────────────
    function claimWinnings(uint256 gameId) external {
        Game storage game = games[gameId];
        require(game.status == GameStatus.Resolved, "Game not resolved");

        Commitment storage commit = commitments[gameId][msg.sender];
        require(commit.revealed, "Not revealed");
        require(!commit.claimed, "Already claimed");
        require(commit.side == game.winner, "Did not win");

        commit.claimed = true;

        uint256 totalPool = game.totalPoolA + game.totalPoolB;
        uint256 winningPool = game.winner == 1 ? game.totalPoolA : game.totalPoolB;

        // Proportional payout minus rake
        uint256 rake = (totalPool * rakePercent) / 10000;
        uint256 netPool = totalPool - rake;
        uint256 payout = (commit.amount * netPool) / winningPool;

        // Send rake to treasury
        if (rake > 0) {
            payable(treasury).transfer(rake);
        }

        payable(msg.sender).transfer(payout);
        emit WinningsClaimed(gameId, msg.sender, payout);
    }

    // ── Helper: Generate commit hash ────────────────────────
    function getCommitHash(
        uint256 amount,
        uint8 side,
        uint256 salt
    ) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(amount, side, salt));
    }

    // ── Admin ────────────────────────────────────────────────
    function setGameResolver(address _resolver) external onlyOwner {
        gameResolver = _resolver;
    }

    function setTreasury(address _treasury) external onlyOwner {
        treasury = _treasury;
    }

    function setRakePercent(uint256 _rake) external onlyOwner {
        require(_rake <= 1000, "Max 10%");
        rakePercent = _rake;
    }
}
