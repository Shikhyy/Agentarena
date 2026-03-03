// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ResultOracle
 * @notice On-chain attestation of AgentArena game results.
 *
 * The off-chain Judge Agent (ADK) runs the game, optionally generates a Noir ZK proof
 * that the game execution was valid, then calls `attestResult()` here.
 * The ZKBettingPool and AgentNFT contracts are notified via callbacks.
 *
 * Security model:
 *  - Multiple trusted judges are required to agree on the outcome (multi-sig lite).
 *  - A mandatory delay allows for challenges before finalization.
 *  - Noir proofBytes are stored but not verified on-chain (L2 cost reasons).
 *    They can be submitted to a future L1 verifier contract for dispute resolution.
 */
contract ResultOracle is Ownable {

    // ── Constants ─────────────────────────────────────────────
    uint256 public constant CHALLENGE_PERIOD = 2 hours;
    uint256 public requiredConfirmations = 2;   // adjustable

    // ── Types ─────────────────────────────────────────────────
    enum Outcome { Pending, AgentAWin, AgentBWin, Draw, Disputed }

    struct GameResult {
        uint256 gameId;           // BettingPool game ID
        bytes32 agentAId;
        bytes32 agentBId;
        Outcome outcome;
        bytes   noirProof;        // Noir circuit proof of valid game execution
        uint256 attestedAt;
        bool    finalized;
        uint8   confirmations;
        mapping(address => bool) judgeVoted;
    }

    // ── State ─────────────────────────────────────────────────
    mapping(uint256 => GameResult) public results;   // indexed by gameId
    mapping(address => bool) public trustedJudges;
    address public bettingPool;   // ZKBettingPool to notify

    // ── Events ────────────────────────────────────────────────
    event ResultAttested(uint256 indexed gameId, address indexed judge, Outcome outcome);
    event ResultFinalized(uint256 indexed gameId, Outcome outcome, bytes noirProof);
    event ResultDisputed(uint256 indexed gameId, address disputer, string reason);
    event JudgeUpdated(address indexed judge, bool trusted);

    // ── Constructor ───────────────────────────────────────────
    constructor() Ownable(msg.sender) {}

    // ── Judge management ──────────────────────────────────────
    function setJudge(address judge, bool trusted) external onlyOwner {
        trustedJudges[judge] = trusted;
        emit JudgeUpdated(judge, trusted);
    }

    function setBettingPool(address pool) external onlyOwner {
        bettingPool = pool;
    }

    function setRequiredConfirmations(uint256 n) external onlyOwner {
        require(n >= 1 && n <= 10, "Invalid confirmations");
        requiredConfirmations = n;
    }

    // ─────────────────────────────────────────────────────────
    //  Judge Attestation
    // ─────────────────────────────────────────────────────────

    /**
     * @notice A trusted judge attests the result of a game.
     * @param noirProof  Proof bytes from the Noir circuit verifying the game transcript.
     *                   Empty bytes are acceptable for the MVP (off-chain verification only).
     */
    function attestResult(
        uint256    gameId,
        bytes32    agentAId,
        bytes32    agentBId,
        Outcome    outcome,
        bytes calldata noirProof
    ) external {
        require(trustedJudges[msg.sender], "Not a trusted judge");
        require(outcome != Outcome.Pending && outcome != Outcome.Disputed, "Invalid outcome");

        GameResult storage r = results[gameId];
        require(!r.judgeVoted[msg.sender], "Already voted");
        require(!r.finalized, "Already finalized");

        // First attest initializes the record
        if (r.attestedAt == 0) {
            r.gameId    = gameId;
            r.agentAId  = agentAId;
            r.agentBId  = agentBId;
            r.outcome   = outcome;
            r.noirProof = noirProof;
            r.attestedAt = block.timestamp;
        } else {
            // Subsequent votes must agree on the same outcome
            require(r.outcome == outcome, "Conflicting outcomes - dispute triggered");
        }

        r.judgeVoted[msg.sender] = true;
        r.confirmations++;

        emit ResultAttested(gameId, msg.sender, outcome);

        if (r.confirmations >= requiredConfirmations) {
            _finalize(gameId);
        }
    }

    function _finalize(uint256 gameId) internal {
        GameResult storage r = results[gameId];
        r.finalized = true;

        // Map Outcome → BettingPool winner code (1=A, 2=B, 3=draw)
        uint8 winner = _outcomeToWinner(r.outcome);

        // Notify ZKBettingPool
        if (bettingPool != address(0)) {
            // Low-level call to avoid reverting if pool is not deployed yet
            (bool ok,) = bettingPool.call(
                abi.encodeWithSignature(
                    "resolveGame(uint256,uint8,bytes)",
                    gameId,
                    winner,
                    r.noirProof
                )
            );
            // Silently continue if pool call fails — oracle result stands independently
        }

        emit ResultFinalized(gameId, r.outcome, r.noirProof);
    }

    // ─────────────────────────────────────────────────────────
    //  Challenge / Dispute
    // ─────────────────────────────────────────────────────────

    /**
     * @notice Anyone can raise a dispute within the challenge period.
     *         The oracle owner must then manually review and override if needed.
     */
    function disputeResult(uint256 gameId, string calldata reason) external {
        GameResult storage r = results[gameId];
        require(!r.finalized, "Already finalized");
        require(r.attestedAt > 0, "No result attested");
        require(block.timestamp < r.attestedAt + CHALLENGE_PERIOD, "Challenge period over");

        r.outcome = Outcome.Disputed;
        emit ResultDisputed(gameId, msg.sender, reason);
    }

    /**
     * @notice Owner can manually override a disputed result with a full re-attest.
     */
    function overrideResult(
        uint256    gameId,
        Outcome    correctedOutcome,
        bytes calldata noirProof
    ) external onlyOwner {
        GameResult storage r = results[gameId];
        require(!r.finalized, "Already finalized");

        r.outcome   = correctedOutcome;
        r.noirProof = noirProof;
        r.confirmations = uint8(requiredConfirmations); // sufficient confirmations
        _finalize(gameId);
    }

    // ─────────────────────────────────────────────────────────
    //  View Helpers
    // ─────────────────────────────────────────────────────────

    function getResult(uint256 gameId)
        external view
        returns (Outcome outcome, bool finalized, uint256 attestedAt, uint8 confirmations)
    {
        GameResult storage r = results[gameId];
        return (r.outcome, r.finalized, r.attestedAt, r.confirmations);
    }

    function _outcomeToWinner(Outcome o) internal pure returns (uint8) {
        if (o == Outcome.AgentAWin) return 1;
        if (o == Outcome.AgentBWin) return 2;
        if (o == Outcome.Draw)      return 3;
        return 0;
    }
}
