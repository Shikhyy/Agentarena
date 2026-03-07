"""
AgentArena — Narrator Agent
Manages Gemini Live commentary sessions and emits commentary_event WebSocket messages.
"""

import asyncio
import random
from typing import Optional, Callable
from commentary.pipeline import CommentaryPipeline, GameEvent, COMMENTARY_STYLES


class NarratorAgent:
    """
    Wraps CommentaryPipeline and manages Gemini Live streaming.
    Emits commentary_event WebSocket messages with drama score pacing.
    """

    def __init__(self):
        self.pipelines: dict = {}   # arena_id -> CommentaryPipeline
        self.broadcast_callbacks: dict = {}  # arena_id -> async callable

    def create_session(self, arena_id: str, style: str = "hype") -> CommentaryPipeline:
        """Initialize a commentary session for an arena."""
        pipeline = CommentaryPipeline(style=style)
        self.pipelines[arena_id] = pipeline
        return pipeline

    def register_broadcast(self, arena_id: str, callback: Callable):
        """Register a WebSocket broadcast callback for an arena."""
        self.broadcast_callbacks[arena_id] = callback

    def set_style(self, arena_id: str, style: str):
        """Change commentary style mid-match."""
        if arena_id in self.pipelines and style in COMMENTARY_STYLES:
            self.pipelines[arena_id].set_style(style)

    async def narrate_event(self, arena_id: str, event: GameEvent) -> Optional[str]:
        """
        Generate and broadcast commentary for a game event.
        Drama score determines pause before commentary (high drama = shorter pause, immediate).
        """
        pipeline = self.pipelines.get(arena_id)
        if not pipeline:
            pipeline = self.create_session(arena_id)

        # Pacing: high drama events fire immediately; low drama has a short delay
        if event.drama_score >= 8:
            await asyncio.sleep(0)        # Immediate
        elif event.drama_score >= 5:
            await asyncio.sleep(0.3)      # Slight pause
        else:
            await asyncio.sleep(0.8)      # Relaxed pace

        commentary_text = await pipeline.generate_commentary(event)

        event_payload = self._build_commentary_event(
            arena_id=arena_id,
            text=commentary_text,
            drama_score=event.drama_score,
            event_type=event.event_type,
        )

        # Broadcast via WebSocket
        callback = self.broadcast_callbacks.get(arena_id)
        if callback:
            await callback(arena_id, event_payload)

        return commentary_text

    def _build_commentary_event(self, arena_id: str, text: str, drama_score: int, event_type: str) -> dict:
        """Build the WebSocket commentary_event payload per PRD spec."""
        return {
            "type": "commentary_event",
            "matchId": arena_id,
            "text": text,
            "audioUrl": None,  # Set to Gemini Live audio URL in production
            "dramaScore": drama_score,
            "eventType": event_type,
            "timestamp": asyncio.get_event_loop().time() if asyncio.get_event_loop().is_running() else 0,
        }

    async def narrate_agent_thinking(self, arena_id: str, agent_id: str):
        """
        Emit an agent_thinking event — triggers particle effect on avatar.
        Called when agent starts deliberating.
        """
        payload = {
            "type": "agent_thinking",
            "matchId": arena_id,
            "agentId": agent_id,
            "thinking": True,
        }
        callback = self.broadcast_callbacks.get(arena_id)
        if callback:
            await callback(arena_id, payload)

    async def narrate_thinking_done(self, arena_id: str, agent_id: str):
        """Emit thinking done — removes particle effect."""
        payload = {
            "type": "agent_thinking",
            "matchId": arena_id,
            "agentId": agent_id,
            "thinking": False,
        }
        callback = self.broadcast_callbacks.get(arena_id)
        if callback:
            await callback(arena_id, payload)

    def get_history(self, arena_id: str, last_n: int = 10) -> list:
        """Get recent commentary for an arena."""
        pipeline = self.pipelines.get(arena_id)
        if not pipeline:
            return []
        return pipeline.get_history(last_n)


# Singleton
narrator_agent = NarratorAgent()
