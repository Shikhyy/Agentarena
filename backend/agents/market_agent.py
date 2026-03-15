"""
AgentArena — Market Agent
Live odds calculation after each game event. Integrates with Aztec for ZK bets.
"""

import asyncio
from typing import Optional, Callable
from betting.odds_engine import odds_engine, LiveOddsEngine


class MarketAgent:
    """
    Watches game events and updates live odds after every move.
    Emits odds_update and bet_settled WebSocket messages.
    """

    def __init__(self):
        self.broadcast_callbacks: dict = {}   # arena_id -> async callable
        self.bet_pools: dict = {}             # arena_id -> list of bets

    def register_broadcast(self, arena_id: str, callback: Callable):
        """Register WebSocket broadcast callback."""
        self.broadcast_callbacks[arena_id] = callback

    async def update_odds(self, arena_id: str, game_event: dict) -> dict:
        """
        Update live odds after a game event and broadcast to spectators.
        game_event: { advantage_score: float, position: int, event_type: str }
        """
        new_probs = odds_engine.bayesian_update(arena_id, game_event)
        current_state = odds_engine.get_current_state(arena_id)

        payload = self._build_odds_update(arena_id, current_state)
        callback = self.broadcast_callbacks.get(arena_id)
        if callback:
            await callback(arena_id, payload)

        return current_state

    def _build_odds_update(self, arena_id: str, current_state: dict) -> dict:
        """Build the WebSocket odds_update payload per PRD spec."""
        probs = current_state.get("live_probs", {0: 0.5, 1: 0.5})
        return {
            "type": "odds_update",
            "matchId": arena_id,
            "agentAProb": round(probs.get(0, 0.5), 4),
            "agentBProb": round(probs.get(1, 0.5), 4),
            "impliedOdds": current_state.get("decimal_odds", {}),
        }

    async def settle_bets(self, arena_id: str, winner_position: int, active_bets: list) -> list:
        """
        Settle all bets for a completed match.
        Emits bet_settled for each user who wagered.
        Supports both user bets (with wallet) and agent bets (with agent_id).
        In production: verifies Noir ZK proof, triggers smart contract payout.
        """
        settled = []

        for bet in active_bets:
            if not bet.get("revealed"):
                continue

            revealed_pos = bet.get("revealed_position")
            amount = bet.get("revealed_amount", 0)
            wallet = bet.get("wallet")
            agent_id = bet.get("agent_id")

            # Simple payout: 2x on correct position (MVP)
            won = (revealed_pos == winner_position)
            payout = amount * 2 if won else 0

            payload = {
                "type": "bet_settled",
                "matchId": arena_id,
                "payout": payout,
                "won": won,
                "originalAmount": amount,
                "timestamp": asyncio.get_event_loop().time() if asyncio.get_event_loop().is_running() else 0,
            }

            if agent_id:
                payload["agentId"] = agent_id
            else:
                payload["walletAddress"] = wallet

            callback = self.broadcast_callbacks.get(arena_id)
            if callback and (wallet or agent_id):
                await callback(arena_id, payload)

            settled.append({**bet, "payout": payout, "won": won})

        return settled

    async def process_agent_bets(self, arena_id: str, agents: list, odds_state: dict, orchestrator) -> list:
        """
        Iterate over agents, place personality-driven bets, and broadcast events.
        """
        placed_bets = []
        for agent in agents:
            bet_result = await orchestrator.place_agent_bet(agent, arena_id, odds_state)
            placed_bets.append(bet_result)

            # Broadcast agent_bet_placed event
            payload = {
                "type": "agent_bet_placed",
                "matchId": arena_id,
                "agentId": bet_result["agent_id"],
                "agentName": bet_result["agent_name"],
                "commitment": bet_result["commitment"],
                "personality": bet_result["personality"],
            }
            callback = self.broadcast_callbacks.get(arena_id)
            if callback:
                await callback(arena_id, payload)

        return placed_bets

    async def emit_monopoly_negotiation(
        self,
        arena_id: str,
        from_agent: str,
        to_agent: str,
        trade_type: str,
        offer: dict,
        message: str,
    ):
        """Emit a Monopoly negotiation event per PRD WebSocket spec."""
        payload = {
            "type": "monopoly_negotiation",
            "matchId": arena_id,
            "from": from_agent,
            "to": to_agent,
            "tradeType": trade_type,
            "offer": offer,
            "message": message,
        }
        callback = self.broadcast_callbacks.get(arena_id)
        if callback:
            await callback(arena_id, payload)

    async def emit_monopoly_bankruptcy(self, arena_id: str, agent_id: str, creditor_id: str):
        """Emit a Monopoly bankruptcy event — triggers token dissolve animation."""
        payload = {
            "type": "monopoly_bankruptcy",
            "matchId": arena_id,
            "agentId": agent_id,
            "creditor": creditor_id,
        }
        callback = self.broadcast_callbacks.get(arena_id)
        if callback:
            await callback(arena_id, payload)

        # Redistribute odds among surviving agents
        odds_engine.bayesian_update(arena_id, {
            "advantage_score": 1.3,
            "position": 0,  # Favor Agent A after bankruptcy event
        })


# Singleton
market_agent = MarketAgent()
