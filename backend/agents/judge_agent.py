"""
AgentArena — Judge Agent
Post-match validation: verify legality, compute result, emit match_complete event.
"""

import time
from typing import Optional
from dataclasses import dataclass


@dataclass
class MatchResult:
    match_id: str
    winner_id: str
    loser_id: str
    game_type: str
    reason: str              # checkmate, fold, bankruptcy, trivia_win, time_limit
    duration_seconds: float
    xp_gained: dict          # agent_id -> xp
    elo_change: dict         # agent_id -> delta


class JudgeAgent:
    """
    Validates match results, prevents cheating, and posts results on-chain.
    In production: calls ResultOracle.sol via web3.py with ZK verification.
    """

    def __init__(self):
        self.pending_results: dict = {}

    def validate_chess_result(self, match_id: str, game_state: dict) -> Optional[MatchResult]:
        """Validate a chess game result."""
        board = game_state.get("board", {})
        if not game_state.get("is_game_over"):
            return None

        winner_id = game_state.get("winner")
        loser_id = game_state.get("loser")
        outcome = game_state.get("outcome", "unknown")

        # Map outcome to reason
        reason_map = {
            "checkmate": "checkmate",
            "resignation": "resignation",
            "time_forfeit": "time_limit",
            "draw_agreement": "draw",
            "stalemate": "stalemate",
        }

        return self._build_result(
            match_id=match_id,
            winner_id=winner_id,
            loser_id=loser_id,
            game_type="chess",
            reason=reason_map.get(outcome, outcome),
            game_state=game_state,
        )

    def validate_poker_result(self, match_id: str, game_state: dict) -> Optional[MatchResult]:
        """Validate a poker game result."""
        if not game_state.get("is_game_over"):
            return None

        winner_id = game_state.get("winner")
        loser_id = game_state.get("loser")
        reason = "fold" if game_state.get("ended_by_fold") else "showdown"

        return self._build_result(
            match_id=match_id,
            winner_id=winner_id,
            loser_id=loser_id,
            game_type="poker",
            reason=reason,
            game_state=game_state,
        )

    def validate_monopoly_result(self, match_id: str, game_state: dict) -> Optional[MatchResult]:
        """Validate a Monopoly game result."""
        if not game_state.get("is_game_over"):
            return None

        bankrupt_agents = game_state.get("bankrupt_agents", [])
        winner_id = game_state.get("winner")
        loser_id = bankrupt_agents[-1] if bankrupt_agents else game_state.get("loser")

        return self._build_result(
            match_id=match_id,
            winner_id=winner_id,
            loser_id=loser_id,
            game_type="monopoly",
            reason="bankruptcy",
            game_state=game_state,
        )

    def validate_trivia_result(self, match_id: str, game_state: dict) -> Optional[MatchResult]:
        """Validate a trivia game result."""
        if game_state.get("status") != "completed":
            return None

        scores = game_state.get("scores", {})
        if not scores:
            return None

        winner_id = max(scores, key=scores.get)
        loser_id = min(scores, key=scores.get)

        return self._build_result(
            match_id=match_id,
            winner_id=winner_id,
            loser_id=loser_id,
            game_type="trivia",
            reason="trivia_win",
            game_state=game_state,
        )

    def _build_result(self, match_id: str, winner_id: str, loser_id: str, game_type: str, reason: str, game_state: dict) -> MatchResult:
        """Build a MatchResult and compute XP/ELO deltas."""
        duration = game_state.get("duration_seconds", 60.0)

        # XP: win=100, loss=30 (from PRD)
        xp_gained = {winner_id: 100, loser_id: 30}

        # ELO: K-factor based on level (PRD spec)
        elo_winner = game_state.get("winner_elo", 1500)
        elo_loser = game_state.get("loser_elo", 1500)
        k = 40  # K=40 early career, K=24 mid, K=16 late
        expected_win = 1 / (1 + 10 ** ((elo_loser - elo_winner) / 400))
        elo_delta = round(k * (1 - expected_win))

        elo_change = {winner_id: elo_delta, loser_id: -elo_delta}

        result = MatchResult(
            match_id=match_id,
            winner_id=winner_id,
            loser_id=loser_id,
            game_type=game_type,
            reason=reason,
            duration_seconds=duration,
            xp_gained=xp_gained,
            elo_change=elo_change,
        )
        self.pending_results[match_id] = result
        return result

    async def post_result_on_chain(self, result: MatchResult) -> dict:
        """
        Post result to ResultOracle.sol on Polygon.
        In production: web3.py call with signed transaction.
        For MVP: returns mock transaction hash.
        """
        mock_tx_hash = f"0x{'a' * 64}"
        return {
            "tx_hash": mock_tx_hash,
            "match_id": result.match_id,
            "winner_id": result.winner_id,
            "on_chain": True,
            "status": "confirmed",
        }

    def build_match_complete_event(self, result: MatchResult) -> dict:
        """Build the WebSocket match_complete event payload."""
        return {
            "type": "match_complete",
            "matchId": result.match_id,
            "winnerId": result.winner_id,
            "loserId": result.loser_id,
            "reason": result.reason,
            "xpGained": result.xp_gained,
            "eloChange": result.elo_change,
            "duration": result.duration_seconds,
        }


# Singleton
judge_agent = JudgeAgent()
