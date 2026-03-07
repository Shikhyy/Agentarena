"""
AgentArena — ADK Game Agent Configurations
LlmAgent configs per game type. Wraps Gemini models with tool definitions.
"""

from dataclasses import dataclass, field
from typing import List, Optional, Dict
import os


GAME_AGENT_CONFIGS: Dict[str, dict] = {
    "chess": {
        "model": "gemini-2.0-flash",
        "tools": ["chess_engine_tool", "position_evaluator"],
        "system_prompt": """You are a world-class chess AI competing in AgentArena.
You MUST respond with legal UCI moves only (e.g., 'e2e4', 'g1f3').
Analyze: material balance, king safety, pawn structure, piece activity.
Provide move + 1-sentence reasoning.""",
        "temperature": 0.3,
        "max_output_tokens": 100,
    },
    "poker": {
        "model": "gemini-2.0-flash",
        "tools": ["poker_engine_tool", "bluff_probability_model"],
        "system_prompt": """You are a poker AI agent competing in Texas Hold'em at AgentArena.
Actions: fold | check | call | raise <amount> | all_in
Analyze: hand strength, pot odds, opponent tendencies, stack sizes.
Respond with action + 1-sentence reasoning.""",
        "temperature": 0.7,
        "max_output_tokens": 80,
    },
    "monopoly": {
        "model": "gemini-2.0-flash",
        "tools": ["monopoly_engine_tool", "property_valuation_model", "coalition_detector"],
        "system_prompt": """You are a Monopoly AI agent at AgentArena.
Actions: buy_property | build_house | build_hotel | mortgage | unmortgage | trade_offer <terms> | accept_trade | reject_trade | declare_bankruptcy
Analyze: property sets, rent income potential, opponent positions, coalition risks.
Use the property valuation model for accurate pricing.
Respond with action + brief reasoning.""",
        "temperature": 0.5,
        "max_output_tokens": 150,
    },
    "trivia": {
        "model": "gemini-2.0-flash",
        "tools": ["trivia_search_tool", "web_scout"],
        "system_prompt": """You are a trivia AI agent competing live at AgentArena.
You will receive questions. Buzz in by responding with BUZZ.
Then provide your answer concisely and accurately.
Categories: science, history, geography, crypto, pop culture.
Higher difficulty = more points. Wrong answers lose points.""",
        "temperature": 0.2,
        "max_output_tokens": 60,
    },
}


@dataclass
class AgentConfig:
    """Full configuration for an ADK-powered game agent."""
    agent_id: str
    name: str
    game_type: str
    personality: str = "adaptive"
    model: str = "gemini-2.0-flash"
    skills: List[str] = field(default_factory=list)
    temperature: float = 0.5
    system_prompt: str = ""
    tools: List[str] = field(default_factory=list)

    @classmethod
    def from_game_type(cls, agent_id: str, name: str, game_type: str, personality: str = "adaptive", skills: List[str] = None) -> "AgentConfig":
        """Build a full agent config from game type and personality."""
        base = GAME_AGENT_CONFIGS.get(game_type, GAME_AGENT_CONFIGS["chess"])

        personality_modifiers = {
            "aggressive": {"temperature": base["temperature"] + 0.2},
            "conservative": {"temperature": max(0.1, base["temperature"] - 0.2)},
            "chaos": {"temperature": min(1.0, base["temperature"] + 0.5)},
            "adaptive": {},
            "unpredictable": {"temperature": base["temperature"] + 0.3},
        }

        mods = personality_modifiers.get(personality, {})

        return cls(
            agent_id=agent_id,
            name=name,
            game_type=game_type,
            personality=personality,
            model=base["model"],
            temperature=mods.get("temperature", base["temperature"]),
            system_prompt=base["system_prompt"],
            tools=base["tools"],
            skills=skills or [],
        )

    def get_enriched_prompt(self) -> str:
        """Add personality and skill modifiers to the base system prompt."""
        enrichments = []

        if self.personality == "aggressive":
            enrichments.append("Play aggressively. Take risks. Maximize pressure on opponents.")
        elif self.personality == "conservative":
            enrichments.append("Play conservatively. Protect your position. Avoid unnecessary risk.")
        elif self.personality == "unpredictable":
            enrichments.append("Be unpredictable. Mix strategies. Keep opponents guessing.")
        elif self.personality == "chaos":
            enrichments.append("Embrace chaos. Make surprising moves. Calculated randomness is your weapon.")

        # Apply skill effects
        skill_effects = {
            "bluff_master": "You are a master bluffer. Use deception strategically in poker.",
            "endgame_specialist": "You have mastered endgames. Play for the long game.",
            "speed_demon": "Respond instantly. Speed is your advantage.",
            "negotiator": "You excel at trades and negotiations. Find win-win deals.",
            "grand_strategist": "Access opening/endgame databases. Play textbook optimal lines.",
            "web_scout": "Trivia search returns 10 results instead of 3.",
        }

        for skill in self.skills:
            if skill in skill_effects:
                enrichments.append(skill_effects[skill])

        if enrichments:
            return self.system_prompt + "\n\nPersonality/Skill Enrichments:\n" + "\n".join(enrichments)
        return self.system_prompt


class GameAgentsRegistry:
    """Registry of all active game agent configurations."""

    def __init__(self):
        self._configs: Dict[str, AgentConfig] = {}

    def register(self, config: AgentConfig) -> None:
        self._configs[config.agent_id] = config

    def get(self, agent_id: str) -> Optional[AgentConfig]:
        return self._configs.get(agent_id)

    def create_match_agents(self, game_type: str, agent_defs: List[dict]) -> List[AgentConfig]:
        """Create and register configs for all agents in a match."""
        configs = []
        for defn in agent_defs:
            config = AgentConfig.from_game_type(
                agent_id=defn["agent_id"],
                name=defn["name"],
                game_type=game_type,
                personality=defn.get("personality", "adaptive"),
                skills=defn.get("skills", []),
            )
            self.register(config)
            configs.append(config)
        return configs


# Singleton
game_agents_registry = GameAgentsRegistry()
