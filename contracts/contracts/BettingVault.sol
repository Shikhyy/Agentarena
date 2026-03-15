// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title BettingVault
 * @notice Autonomous agent betting with session keys and ZK commitment-reveal.
 * @dev Session keys allow agents to bet without human approval per-tx.
 *      Rake: 2.5% total (1.5% treasury + 1.0% burn).
 */
contract BettingVault is AccessControl {

    bytes32 public constant RESOLVER_ROLE = keccak256("RESOLVER_ROLE");

    // ── Session Keys ─────────────────────────────────────────
    struct SessionKey {
        address agent;           // Agent wallet address
        uint256 maxPerTx;        // Max spend per transaction
        uint256 dailyLimit;      // Max daily spend
        uint256 spentToday;      // Running daily total
        uint64 dayStart;         // Unix timestamp for daily reset
        uint64 expiresAt;        // Session expiry
        bool active;
    }

    // ── Match ────────────────────────────────────────────────
    struct Match {
        bytes32 agentAId;
        bytes32 agentBId;
        uint256 totalPoolA;
        uint256 totalPoolB;
        uint8 winner;            // 0=pending, 1=A, 2=B, 3=draw
        bool settled;
    }

    // ── Bet Commitment ───────────────────────────────────────
    struct BetCommitment {
        bytes32 commitment;      // pedersen_hash(amount, side, blinding)
        uint256 deposit;         // ETH deposited with commitment
        bool revealed;
        uint8 side;
        uint256 amount;
        bool claimed;
    }

    mapping(address => SessionKey) public sessionKeys;
    mapping(uint256 => Match) public matches;
    mapping(uint256 => mapping(address => BetCommitment)) public bets;
    uint256 public nextMatchId;

    address public treasury;
    address public burnAddress;  // Burn address for $ARENA
    uint256 public treasuryRakeBps = 150;  // 1.5%
    uint256 public burnRakeBps = 100;      // 1.0%

    // ── Events ───────────────────────────────────────────────
    event SessionKeyCreated(address indexed owner, address indexed agent, uint256 maxPerTx, uint256 dailyLimit, uint64 expiresAt);
    event SessionKeyRevoked(address indexed owner, address indexed agent);
    event MatchCreated(uint256 indexed matchId, bytes32 agentA, bytes32 agentB);
    event BetCommitted(uint256 indexed matchId, address indexed bettor, bytes32 commitment);
    event BetRevealed(uint256 indexed matchId, address indexed bettor, uint8 side, uint256 amount);
    event MatchSettled(uint256 indexed matchId, uint8 winner);
    event PayoutClaimed(uint256 indexed matchId, address indexed bettor, uint256 payout);

    constructor(address _treasury, address _burnAddress) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(RESOLVER_ROLE, msg.sender);
        treasury = _treasury;
        burnAddress = _burnAddress;
    }

    // ── Session Key Management ───────────────────────────────

    /**
     * @notice Create a session key for an agent wallet.
     *         One-time approval — agent can then bet autonomously.
     */
    function createSessionKey(
        address agent,
        uint256 maxPerTx,
        uint256 dailyLimit,
        uint64 duration
    ) external {
        require(agent != address(0), "Invalid agent");
        require(maxPerTx > 0 && dailyLimit >= maxPerTx, "Invalid limits");

        sessionKeys[agent] = SessionKey({
            agent: agent,
            maxPerTx: maxPerTx,
            dailyLimit: dailyLimit,
            spentToday: 0,
            dayStart: uint64(block.timestamp),
            expiresAt: uint64(block.timestamp) + duration,
            active: true
        });

        emit SessionKeyCreated(msg.sender, agent, maxPerTx, dailyLimit, uint64(block.timestamp) + duration);
    }

    function revokeSessionKey(address agent) external {
        require(sessionKeys[agent].active, "No active session");
        sessionKeys[agent].active = false;
        emit SessionKeyRevoked(msg.sender, agent);
    }

    function _validateSessionKey(address agent, uint256 amount) internal {
        SessionKey storage key = sessionKeys[agent];
        require(key.active, "No active session key");
        require(block.timestamp < key.expiresAt, "Session expired");
        require(amount <= key.maxPerTx, "Exceeds per-tx limit");

        // Reset daily counter if new day
        if (block.timestamp >= key.dayStart + 1 days) {
            key.spentToday = 0;
            key.dayStart = uint64(block.timestamp);
        }
        require(key.spentToday + amount <= key.dailyLimit, "Exceeds daily limit");
        key.spentToday += amount;
    }

    // ── Match Lifecycle ──────────────────────────────────────

    function createMatch(bytes32 agentAId, bytes32 agentBId) external onlyRole(RESOLVER_ROLE) returns (uint256) {
        uint256 matchId = nextMatchId++;
        matches[matchId] = Match({
            agentAId: agentAId,
            agentBId: agentBId,
            totalPoolA: 0,
            totalPoolB: 0,
            winner: 0,
            settled: false
        });
        emit MatchCreated(matchId, agentAId, agentBId);
        return matchId;
    }

    /**
     * @notice Commit a ZK bet. Agents use session keys; spectators use direct ETH.
     */
    function commitBet(uint256 matchId, bytes32 commitment) external payable {
        Match storage m = matches[matchId];
        require(!m.settled, "Match settled");
        require(msg.value > 0, "Must deposit ETH");
        require(bets[matchId][msg.sender].commitment == 0, "Already committed");

        // If sender has a session key, validate limits
        if (sessionKeys[msg.sender].active) {
            _validateSessionKey(msg.sender, msg.value);
        }

        bets[matchId][msg.sender] = BetCommitment({
            commitment: commitment,
            deposit: msg.value,
            revealed: false,
            side: 0,
            amount: 0,
            claimed: false
        });

        emit BetCommitted(matchId, msg.sender, commitment);
    }

    /**
     * @notice Reveal and settle a bet after match resolution.
     */
    function revealAndSettle(
        uint256 matchId,
        uint8 side,
        uint256 amount,
        uint256 blinding
    ) external {
        Match storage m = matches[matchId];
        require(m.settled, "Match not settled");

        BetCommitment storage bet = bets[matchId][msg.sender];
        require(bet.commitment != 0, "No commitment");
        require(!bet.revealed, "Already revealed");

        // Verify ZK commitment (simplified: keccak in contract, Noir proof off-chain)
        bytes32 expected = keccak256(abi.encodePacked(amount, side, blinding));
        require(expected == bet.commitment, "Invalid reveal");

        bet.revealed = true;
        bet.side = side;
        bet.amount = amount;

        if (side == 1) {
            m.totalPoolA += amount;
        } else if (side == 2) {
            m.totalPoolB += amount;
        }

        emit BetRevealed(matchId, msg.sender, side, amount);
    }

    function settleMatch(uint256 matchId, uint8 winner) external onlyRole(RESOLVER_ROLE) {
        Match storage m = matches[matchId];
        require(!m.settled, "Already settled");
        require(winner >= 1 && winner <= 3, "Invalid winner");

        m.winner = winner;
        m.settled = true;

        emit MatchSettled(matchId, winner);
    }

    function claimPayout(uint256 matchId) external {
        Match storage m = matches[matchId];
        require(m.settled, "Not settled");

        BetCommitment storage bet = bets[matchId][msg.sender];
        require(bet.revealed, "Not revealed");
        require(!bet.claimed, "Already claimed");
        require(bet.side == m.winner, "Did not win");

        bet.claimed = true;

        uint256 totalPool = m.totalPoolA + m.totalPoolB;
        uint256 winningPool = m.winner == 1 ? m.totalPoolA : m.totalPoolB;
        require(winningPool > 0, "No winners");

        // Rake: 1.5% treasury + 1.0% burn = 2.5% total
        uint256 treasuryRake = (totalPool * treasuryRakeBps) / 10000;
        uint256 burnRake = (totalPool * burnRakeBps) / 10000;
        uint256 netPool = totalPool - treasuryRake - burnRake;

        uint256 payout = (bet.amount * netPool) / winningPool;

        if (treasuryRake > 0) payable(treasury).transfer(treasuryRake);
        if (burnRake > 0) payable(burnAddress).transfer(burnRake);
        payable(msg.sender).transfer(payout);

        emit PayoutClaimed(matchId, msg.sender, payout);
    }

    // ── Admin ────────────────────────────────────────────────

    function setTreasury(address _treasury) external onlyRole(DEFAULT_ADMIN_ROLE) {
        treasury = _treasury;
    }

    function setBurnAddress(address _burn) external onlyRole(DEFAULT_ADMIN_ROLE) {
        burnAddress = _burn;
    }

    receive() external payable {}
}
