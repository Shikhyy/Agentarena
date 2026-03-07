// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title ZKBettingPool
 * @notice Privacy-preserving betting using commit-reveal + off-chain Noir ZK proofs.
 *
 * ZK Flow:
 *  1. Bettor computes commitment = keccak256(amount ‖ side ‖ secret) off-chain (or via Noir circuit).
 *  2. Bettor calls `commitBet(gameId, commitment)`, locking ETH/ARENA tokens.
 *  3. Game is locked by the resolver when play begins.
 *  4. Game is resolved by the ResultOracle, passing the winner.
 *  5. To claim, bettor calls `revealAndClaim(gameId, side, secret, noirProofBytes)`.
 *     - On-chain: verifies keccak hash matches stored commitment.
 *     - Off-chain validated: Noir proof bytes are emitted for archival & dispute resolution.
 *  6. Proportional payout is sent, minus 2% rake to treasury.
 */
contract ZKBettingPool is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ── Types ────────────────────────────────────────────────
    enum GameStatus { Open, Locked, Resolved }
    enum Currency { ETH, ARENA }

    struct Game {
        bytes32 agentAId;
        bytes32 agentBId;
        string  gameType;
        GameStatus status;
        Currency currency;
        uint256 totalPoolA;
        uint256 totalPoolB;
        uint8   winner;        // 0=none, 1=agentA, 2=agentB, 3=draw
        uint64  startedAt;
        uint64  resolvedAt;
    }

    struct Commitment {
        bytes32  commitHash;   // keccak256(amount ‖ side ‖ secret)
        bytes32  noirCommit;   // optional: Pedersen commitment from Noir circuit
        uint256  amount;
        uint8    side;
        bool     revealed;
        bool     claimed;
    }

    // ── State ────────────────────────────────────────────────
    mapping(uint256 => Game) public games;
    mapping(uint256 => mapping(address => Commitment)) public commitments;
    uint256 public nextGameId;

    IERC20  public arenaToken;
    address public treasury;
    address public gameResolver;
    uint256 public rakePercent = 200; // basis points (2%)

    // Minimum bet amounts
    uint256 public minBetEth   = 0.001 ether;
    uint256 public minBetArena = 10e18; // 10 ARENA tokens

    // Rake accumulator — flushed quarterly to ArenaToken.quarterlyRakeBurn
    uint256 public rakeAccumulated;

    // ── Events ───────────────────────────────────────────────
    event GameCreated(uint256 indexed gameId, string gameType, bytes32 agentA, bytes32 agentB);
    event BetCommitted(uint256 indexed gameId, address indexed bettor, bytes32 commitHash, bytes32 noirCommit);
    event BetRevealedAndClaimed(uint256 indexed gameId, address indexed bettor, uint8 side, uint256 amount, uint256 payout, bytes noirProof);
    event GameResolved(uint256 indexed gameId, uint8 winner, bytes noirAttestation);
    event RakeCollected(uint256 indexed gameId, uint256 amount);

    // ── Modifiers ────────────────────────────────────────────
    modifier onlyResolver() {
        require(msg.sender == gameResolver || msg.sender == owner(), "Not resolver");
        _;
    }

    // ── Constructor ──────────────────────────────────────────
    constructor(address _arenaToken, address _treasury) Ownable(msg.sender) {
        arenaToken = IERC20(_arenaToken);
        treasury = _treasury;
    }

    // ─────────────────────────────────────────────────────────
    //  Game Lifecycle
    // ─────────────────────────────────────────────────────────

    function createGame(
        string calldata gameType,
        bytes32 agentAId,
        bytes32 agentBId,
        Currency currency
    ) external onlyResolver returns (uint256 gameId) {
        gameId = nextGameId++;
        games[gameId] = Game({
            agentAId:   agentAId,
            agentBId:   agentBId,
            gameType:   gameType,
            status:     GameStatus.Open,
            currency:   currency,
            totalPoolA: 0,
            totalPoolB: 0,
            winner:     0,
            startedAt:  uint64(block.timestamp),
            resolvedAt: 0
        });
        emit GameCreated(gameId, gameType, agentAId, agentBId);
    }

    function lockBetting(uint256 gameId) external onlyResolver {
        require(games[gameId].status == GameStatus.Open, "Already locked");
        games[gameId].status = GameStatus.Locked;
    }

    /**
     * @notice Resolver announces the winner, attaching an off-chain Noir attestation.
     * @param noirAttestation  ABI-encoded Noir proof bytes from ResultOracle verification.
     */
    function resolveGame(
        uint256 gameId,
        uint8 winner,
        bytes calldata noirAttestation
    ) external onlyResolver {
        Game storage g = games[gameId];
        require(g.status != GameStatus.Resolved, "Already resolved");
        require(winner >= 1 && winner <= 3, "Invalid winner");

        g.status     = GameStatus.Resolved;
        g.winner     = winner;
        g.resolvedAt = uint64(block.timestamp);

        emit GameResolved(gameId, winner, noirAttestation);
    }

    // ─────────────────────────────────────────────────────────
    //  Betting
    // ─────────────────────────────────────────────────────────

    /**
     * @notice Commit a private bet via a keccak hash of (amount, side, secret).
     * @param noirCommit  Optional Pedersen commitment from Noir circuit (bytes32(0) if unused).
     */
    function commitBetETH(
        uint256 gameId,
        bytes32 commitHash,
        bytes32 noirCommit
    ) external payable {
        Game storage g = games[gameId];
        require(g.status == GameStatus.Open, "Betting closed");
        require(g.currency == Currency.ETH, "Use ARENA token");
        require(msg.value >= minBetEth, "Below minimum bet");
        require(commitments[gameId][msg.sender].commitHash == 0, "Already committed");

        commitments[gameId][msg.sender] = Commitment({
            commitHash: commitHash,
            noirCommit: noirCommit,
            amount:     msg.value,
            side:       0,
            revealed:   false,
            claimed:    false
        });

        emit BetCommitted(gameId, msg.sender, commitHash, noirCommit);
    }

    function commitBetArena(
        uint256 gameId,
        uint256 amount,
        bytes32 commitHash,
        bytes32 noirCommit
    ) external {
        Game storage g = games[gameId];
        require(g.status == GameStatus.Open, "Betting closed");
        require(g.currency == Currency.ARENA, "Use ETH");
        require(amount >= minBetArena, "Below minimum bet");
        require(commitments[gameId][msg.sender].commitHash == 0, "Already committed");

        arenaToken.safeTransferFrom(msg.sender, address(this), amount);

        commitments[gameId][msg.sender] = Commitment({
            commitHash: commitHash,
            noirCommit: noirCommit,
            amount:     amount,
            side:       0,
            revealed:   false,
            claimed:    false
        });

        emit BetCommitted(gameId, msg.sender, commitHash, noirCommit);
    }

    // ─────────────────────────────────────────────────────────
    //  Reveal & Claim (combined for UX efficiency)
    // ─────────────────────────────────────────────────────────

    /**
     * @notice Reveal the bet secret and claim winnings in one tx.
     * @param noirProof  Off-chain Noir proof bytes that the commitment was correctly formed.
     *                   Emitted on-chain for archival / L1 dispute resolution.
     */
    function revealAndClaim(
        uint256 gameId,
        uint8   side,
        uint256 secret,
        bytes calldata noirProof
    ) external nonReentrant {
        Game storage g = games[gameId];
        require(g.status == GameStatus.Resolved, "Game not resolved");

        Commitment storage c = commitments[gameId][msg.sender];
        require(c.commitHash != 0, "No commitment");
        require(!c.revealed,       "Already revealed");

        // ── Verify the keccak commitment on-chain ────────────
        bytes32 expected = keccak256(abi.encodePacked(c.amount, side, secret));
        require(expected == c.commitHash, "Commitment mismatch");

        c.revealed = true;
        c.side     = side;

        // Add to totals
        if (side == 1) {
            g.totalPoolA += c.amount;
        } else if (side == 2) {
            g.totalPoolB += c.amount;
        }

        // ── Calculate payout ─────────────────────────────────
        uint256 payout = 0;
        if (side == g.winner) {
            uint256 totalPool   = g.totalPoolA + g.totalPoolB;
            uint256 winningPool = (g.winner == 1) ? g.totalPoolA : g.totalPoolB;
            uint256 rake        = (totalPool * rakePercent) / 10000;
            uint256 netPool     = totalPool - rake;

            payout = (c.amount * netPool) / winningPool;
            c.claimed = true;

            // Distribute rake
            _transfer(g.currency, treasury, rake);
            // Distribute winnings
            _transfer(g.currency, msg.sender, payout);

            emit RakeCollected(gameId, rake);
        } else if (g.winner == 3) {
            // Draw — full refund
            payout  = c.amount;
            c.claimed = true;
            _transfer(g.currency, msg.sender, payout);
        }
        // else: lost — no payout, tokens remain in contract for winner distribution

        emit BetRevealedAndClaimed(gameId, msg.sender, side, c.amount, payout, noirProof);
    }

    // ── Internal transfer helper ─────────────────────────────
    function _transfer(Currency currency, address to, uint256 amount) internal {
        if (currency == Currency.ETH) {
            (bool ok,) = payable(to).call{value: amount}("");
            require(ok, "ETH transfer failed");
        } else {
            arenaToken.safeTransfer(to, amount);
        }
    }

    // ─────────────────────────────────────────────────────────
    //  View Helpers
    // ─────────────────────────────────────────────────────────

    function getCommitHash(uint256 amount, uint8 side, uint256 secret)
        external pure returns (bytes32)
    {
        return keccak256(abi.encodePacked(amount, side, secret));
    }

    function getGameOdds(uint256 gameId)
        external view returns (uint256 totalA, uint256 totalB, uint256 impliedProbA)
    {
        Game storage g = games[gameId];
        totalA = g.totalPoolA;
        totalB = g.totalPoolB;
        uint256 total = totalA + totalB;
        impliedProbA = (total == 0) ? 5000 : (totalA * 10000) / total; // basis points
    }

    // ─────────────────────────────────────────────────────────
    //  Admin
    // ─────────────────────────────────────────────────────────

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

    function setMinBets(uint256 _eth, uint256 _arena) external onlyOwner {
        minBetEth   = _eth;
        minBetArena = _arena;
    }

    /**
     * @notice Flush accumulated betting rake to ArenaToken for quarterly burn.
     * ArenaToken.quarterlyRakeBurn() enforces the 90-day cadence.
     * Call this quarterly to trigger the deflationary burn loop.
     */
    function flushRakeToToken() external onlyOwner {
        uint256 amount = rakeAccumulated;
        require(amount > 0, "No rake to flush");
        rakeAccumulated = 0;
        // Transfer to ArenaToken treasury, owner calls quarterlyRakeBurn separately
        arenaToken.transfer(treasury, amount);
    }

    receive() external payable {}
}
