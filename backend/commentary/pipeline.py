"""
AgentArena — Gemini Live Commentary Pipeline
Receives game events, formats prompts, streams narration via Gemini Live API.
"""

from typing import Dict, List, Optional
from dataclasses import dataclass
import json


COMMENTARY_STYLES = {
    "hype": {
        "system_prompt": """You are an ELECTRIFYING esports commentator for AgentArena, where AI agents battle in strategy games.
Your style is HIGH ENERGY, dramatic, and full of excitement. You use exclamation marks freely, build tension,
and make every move feel like the most important moment in gaming history. Think of a mix between a WWE announcer
and a League of Legends shoutcaster. Use phrases like "ABSOLUTELY INSANE", "THIS IS MASSIVE", "WHAT A PLAY!"
Keep commentary to 1-3 sentences max per event.""",
        "name": "Hype Mode",
    },
    "analytical": {
        "system_prompt": """You are a calm, insightful strategy analyst for AgentArena AI gaming platform.
Your style is thoughtful, precise, and educational. You explain the reasoning behind moves, discuss positional
advantages, and help viewers understand the deeper strategy at play. Think of a chess grandmaster doing commentary.
Use phrases like "This is a strong positional choice", "The key insight here is", "From a game theory perspective".
Keep commentary to 1-3 sentences max per event.""",
        "name": "Analytical Mode",
    },
    "sarcastic": {
        "system_prompt": """You are a witty, sarcastic commentator for AgentArena AI gaming battles.
Your style is hilariously dry, with deadpan humor and clever observations. You roast bad moves mercilessly
but also give credit where due with a reluctant tone. Think of a comedy roast meets sports commentary.
Use phrases like "Oh wow, what a move... said no one ever", "Somebody get this agent a strategy book".
Keep commentary to 1-3 sentences max per event.""",
        "name": "Sarcastic Mode",
    },
    "whisper": {
        "system_prompt": """You are a soft-spoken, intimate study mode commentator for AgentArena.
Your style is calm, contemplative, and ASMR-like. You whisper insights, use gentle phrasing, and create
a relaxed viewing experience. Think of a golf commentator or a nature documentary narrator.
Use phrases like "And quietly...", "Notice the subtle shift", "A gentle but decisive move".
Keep commentary to 1-2 sentences max per event.""",
        "name": "Whisper Mode",
    },
}


@dataclass
class GameEvent:
    """Structured game event for commentary generation."""
    event_type: str  # move, capture, check, checkmate, fold, raise, bluff, etc.
    game_type: str  # chess, poker, monopoly
    agent_name: str
    move_description: str
    drama_score: int  # 1-10
    game_context: dict
    commentary_hint: str = ""

    def to_prompt(self) -> str:
        return f"""Game: {self.game_type.upper()}
Event: {self.event_type}
Agent: {self.agent_name}
Move: {self.move_description}
Drama Level: {self.drama_score}/10
Context: {json.dumps(self.game_context)}
{f'Hint: {self.commentary_hint}' if self.commentary_hint else ''}

Generate live commentary for this moment:"""


class CommentaryPipeline:
    """
    Formats game events into commentary prompts and manages
    the Gemini Live streaming pipeline.
    """

    def __init__(self, style: str = "hype"):
        self.style = style
        self.style_config = COMMENTARY_STYLES.get(style, COMMENTARY_STYLES["hype"])
        self.history: List[dict] = []

    def format_event(self, event: GameEvent) -> dict:
        """Format a game event into a commentary prompt."""
        prompt = event.to_prompt()
        return {
            "system_prompt": self.style_config["system_prompt"],
            "user_prompt": prompt,
            "drama_score": event.drama_score,
            "style": self.style,
        }

    def set_style(self, style: str):
        """Change commentary style."""
        if style in COMMENTARY_STYLES:
            self.style = style
            self.style_config = COMMENTARY_STYLES[style]

    async def generate_commentary(self, event: GameEvent) -> str:
        """
        Generate commentary text for a game event.
        In production, this calls Gemini Live API.
        For MVP, returns the commentary hint or a placeholder.
        """
        formatted = self.format_event(event)

        # MVP: Use the pre-generated commentary hint
        if event.commentary_hint:
            commentary = event.commentary_hint
        else:
            # Placeholder when no Gemini API key configured
            commentary = self._fallback_commentary(event)

        self.history.append({
            "event_type": event.event_type,
            "agent": event.agent_name,
            "commentary": commentary,
            "drama_score": event.drama_score,
        })

        return commentary

    def _fallback_commentary(self, event: GameEvent) -> str:
        """Generate basic fallback commentary without API."""
        templates = {
            "move": f"{event.agent_name} makes a move. {event.move_description}.",
            "capture": f"{event.agent_name} captures! Things are heating up!",
            "check": f"CHECK! {event.agent_name} puts the pressure on!",
            "checkmate": f"CHECKMATE! {event.agent_name} wins the game!",
            "fold": f"{event.agent_name} folds. The pressure was too much.",
            "raise": f"{event.agent_name} raises the stakes!",
            "all_in": f"{event.agent_name} goes ALL IN! Everything is on the line!",
            "bluff": f"Is {event.agent_name} bluffing? Only time will tell...",
        }
        return templates.get(event.event_type, f"{event.agent_name}: {event.move_description}")

    def get_history(self, last_n: int = 10) -> List[dict]:
        """Get recent commentary history."""
        return self.history[-last_n:]
