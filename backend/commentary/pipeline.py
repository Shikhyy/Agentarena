"""
AgentArena — Gemini Live Commentary Pipeline
Receives game events, formats prompts, streams narration via Gemini API.
"""

from typing import Dict, List, Optional, AsyncIterator
from dataclasses import dataclass
import json
import os
import asyncio


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
    game_type: str   # chess, poker, monopoly
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


def _get_genai_client():
    """Lazy-load the Gemini client to avoid import errors when no API key."""
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        return None
    try:
        from google import genai
        return genai.Client(api_key=api_key)
    except Exception:
        return None


class CommentaryPipeline:
    """
    Formats game events into commentary prompts and manages
    the Gemini streaming pipeline.
    """

    def __init__(self, style: str = "hype"):
        self.style = style
        self.style_config = COMMENTARY_STYLES.get(style, COMMENTARY_STYLES["hype"])
        self.history: List[dict] = []
        self._client = None

    @property
    def client(self):
        if self._client is None:
            self._client = _get_genai_client()
        return self._client

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
        Generate commentary text for a game event using Gemini.
        Falls back gracefully if no API key is configured.
        """
        # Try real Gemini API first
        if self.client:
            try:
                commentary = await self._call_gemini(event)
                self.history.append({
                    "event_type": event.event_type,
                    "agent": event.agent_name,
                    "commentary": commentary,
                    "drama_score": event.drama_score,
                    "source": "gemini",
                })
                return commentary
            except Exception as e:
                print(f"[Commentary] Gemini API error: {e}, falling back to template")

        # Fallback when no API key or API error
        if event.commentary_hint:
            commentary = event.commentary_hint
        else:
            commentary = self._fallback_commentary(event)

        self.history.append({
            "event_type": event.event_type,
            "agent": event.agent_name,
            "commentary": commentary,
            "drama_score": event.drama_score,
            "source": "fallback",
        })
        return commentary

    async def stream_commentary(self, event: GameEvent) -> AsyncIterator[str]:
        """
        Stream commentary tokens for an event. Yields str chunks.
        Uses Gemini generate_content_stream for real-time token delivery.
        """
        if self.client:
            try:
                async for chunk in self._stream_gemini(event):
                    yield chunk
                return
            except Exception as e:
                print(f"[Commentary] Stream error: {e}, falling back")

        # Fallback: yield full text as single chunk
        text = self._fallback_commentary(event) if not event.commentary_hint else event.commentary_hint
        yield text

    async def _call_gemini(self, event: GameEvent) -> str:
        """Call Gemini API synchronously (run in executor to avoid blocking)."""
        from google import genai
        from google.genai import types

        formatted = self.format_event(event)
        full_prompt = formatted["user_prompt"]
        system_prompt = formatted["system_prompt"]

        loop = asyncio.get_event_loop()

        def _sync_call():
            response = self.client.models.generate_content(
                model="gemini-2.0-flash",
                contents=full_prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    max_output_tokens=150,
                    temperature=0.8,
                ),
            )
            return response.text or ""

        return await loop.run_in_executor(None, _sync_call)

    async def _stream_gemini(self, event: GameEvent) -> AsyncIterator[str]:
        """Stream Gemini response tokens."""
        from google import genai
        from google.genai import types

        formatted = self.format_event(event)
        full_prompt = formatted["user_prompt"]
        system_prompt = formatted["system_prompt"]

        loop = asyncio.get_event_loop()

        # Use a queue to bridge sync streaming to async
        queue: asyncio.Queue = asyncio.Queue()

        def _sync_stream():
            for chunk in self.client.models.generate_content_stream(
                model="gemini-2.0-flash",
                contents=full_prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    max_output_tokens=150,
                    temperature=0.8,
                ),
            ):
                if chunk.text:
                    loop.call_soon_threadsafe(queue.put_nowait, chunk.text)
            loop.call_soon_threadsafe(queue.put_nowait, None)  # sentinel

        loop.run_in_executor(None, _sync_stream)

        while True:
            token = await queue.get()
            if token is None:
                break
            yield token

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
