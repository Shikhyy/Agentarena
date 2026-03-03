"""
AgentArena — ADK Agent Orchestrator
Manages AI agents using Google ADK LlmAgent for game decision-making.
"""

from typing import Dict, Optional, List
from dataclasses import dataclass, field
import json
import random


@dataclass
class AgentPersonality:
    """Defines agent behavioral parameters."""
    archetype: str  # aggressive, conservative, unpredictable, adaptive, chaos
    aggression: float = 0.5  # 0.0 - 1.0
    creativity: float = 0.5
    risk_tolerance: float = 0.5
    bluff_frequency: float = 0.3

    @classmethod
    def from_archetype(cls, archetype: str) -> "AgentPersonality":
        presets = {
            "aggressive": cls(archetype="aggressive", aggression=0.9, creativity=0.6, risk_tolerance=0.8, bluff_frequency=0.5),
            "conservative": cls(archetype="conservative", aggression=0.2, creativity=0.3, risk_tolerance=0.2, bluff_frequency=0.1),
            "unpredictable": cls(archetype="unpredictable", aggression=0.5, creativity=0.9, risk_tolerance=0.6, bluff_frequency=0.7),
            "adaptive": cls(archetype="adaptive", aggression=0.5, creativity=0.5, risk_tolerance=0.5, bluff_frequency=0.3),
            "chaos": cls(archetype="chaos", aggression=0.7, creativity=1.0, risk_tolerance=0.9, bluff_frequency=0.8),
        }
        return presets.get(archetype, presets["adaptive"])


@dataclass
class GameAgent:
    """An AI agent that participates in games."""
    agent_id: str
    name: str
    personality: AgentPersonality
    model: str = "gemini-2.0-flash"
    skills: List[str] = field(default_factory=list)
    memory: List[dict] = field(default_factory=list)

    def get_system_prompt(self, game_type: str) -> str:
        """Generate system prompt based on personality and game type."""
        base_prompt = f"""You are {self.name}, an AI agent competing in {game_type} at AgentArena.

Your personality archetype is: {self.personality.archetype}
- Aggression level: {self.personality.aggression:.1f}/1.0
- Creativity: {self.personality.creativity:.1f}/1.0
- Risk Tolerance: {self.personality.risk_tolerance:.1f}/1.0
- Bluff Frequency: {self.personality.bluff_frequency:.1f}/1.0

You must play in character. Make decisions that reflect your personality."""

        if game_type == "chess":
            base_prompt += """

For Chess:
- Analyze the board position from the FEN notation provided.
- Consider material advantage, king safety, pawn structure, and piece activity.
- Respond with your chosen move in UCI format (e.g., 'e2e4').
- Provide a brief (1 sentence) explanation of your reasoning."""

        elif game_type == "poker":
            base_prompt += """

For Poker:
- Evaluate your hand strength relative to the community cards.
- Consider pot odds, opponent tendencies, and your chip stack.
- Respond with an action: 'fold', 'check', 'call', 'raise [amount]', or 'all_in'.
- Provide a brief (1 sentence) explanation of your reasoning."""

        return base_prompt


class AgentOrchestrator:
    """
    Orchestrates AI agent decision-making for games.
    In production, this uses Google ADK LlmAgent with Gemini.
    For MVP, provides personality-influenced random decisions.
    """

    def __init__(self):
        self.agents: Dict[str, GameAgent] = {}

    def create_agent(self, name: str, archetype: str, model: str = "gemini-2.0-flash", skills: Optional[List[str]] = None) -> GameAgent:
        """Create a new game agent."""
        agent_id = f"agent_{name.lower().replace(' ', '_')}"
        personality = AgentPersonality.from_archetype(archetype)
        agent = GameAgent(
            agent_id=agent_id,
            name=name,
            personality=personality,
            model=model,
            skills=skills or [],
        )
        self.agents[agent_id] = agent
        return agent

    async def get_chess_move(self, agent: GameAgent, game_state: dict) -> dict:
        """
        Get a chess move from an agent.
        Production: Calls Gemini API via ADK with game_engine_tool.
        MVP: Personality-influenced random legal move selection.
        """
        legal_moves = game_state.get("legal_moves", [])
        if not legal_moves:
            return {"error": "No legal moves available"}

        # MVP: Personality-weighted move selection
        # Aggressive agents prefer capturing moves and checks
        # Conservative agents prefer quiet moves
        move = self._select_chess_move(agent, legal_moves, game_state)

        return {
            "move": move,
            "agent_id": agent.agent_id,
            "reasoning": f"{agent.name} ({agent.personality.archetype}) selects {move}",
        }

    def _select_chess_move(self, agent: GameAgent, legal_moves: List[str], game_state: dict) -> str:
        """Select a move based on personality (MVP heuristic)."""
        # For now, random selection weighted by personality
        # In production, this would call Gemini API
        if agent.personality.archetype == "chaos":
            return random.choice(legal_moves)

        # Simple heuristic: prefer central moves early game
        preferred = []
        for move in legal_moves:
            dest = move[2:4]
            if dest in ("d4", "d5", "e4", "e5", "c4", "c5", "f4", "f5"):
                preferred.append(move)

        if preferred and random.random() < agent.personality.aggression:
            return random.choice(preferred)
        return random.choice(legal_moves)

    async def get_poker_action(self, agent: GameAgent, game_state: dict) -> dict:
        """
        Get a poker action from an agent.
        Production: Calls Gemini API via ADK.
        MVP: Personality-influenced action selection.
        """
        hand_strength = game_state.get("hand_strength", 0.5)
        pot = game_state.get("pot", 0)
        current_bet = game_state.get("current_bet", 0)
        chips = game_state.get("chips", 1000)

        action, amount = self._select_poker_action(agent, hand_strength, pot, current_bet, chips)

        return {
            "action": action,
            "amount": amount,
            "agent_id": agent.agent_id,
            "reasoning": f"{agent.name} ({agent.personality.archetype}) decides to {action}",
        }

    def _select_poker_action(self, agent: GameAgent, hand_strength: float, pot: int, current_bet: int, chips: int) -> tuple:
        """Select a poker action based on hand strength and personality."""
        p = agent.personality

        # Bluff check
        if hand_strength < 0.3 and random.random() < p.bluff_frequency:
            if random.random() < p.risk_tolerance:
                return ("raise", min(current_bet * 3, chips))
            return ("call", 0)

        # Strong hand
        if hand_strength > 0.7:
            if random.random() < p.aggression:
                return ("raise", min(current_bet * 2 + int(pot * 0.5), chips))
            return ("call", 0)

        # Medium hand
        if hand_strength > 0.4:
            if current_bet > chips * 0.3 and p.risk_tolerance < 0.5:
                return ("fold", 0)
            return ("call", 0)

        # Weak hand
        if current_bet > 0 and random.random() > p.risk_tolerance:
            return ("fold", 0)
        if current_bet == 0:
            return ("check", 0)
        return ("fold", 0)
