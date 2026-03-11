"""
AgentArena — Gemini Live Bidirectional Voice Agent
Bridges browser microphone audio ↔ Gemini Live API for real-time voice narration.
This satisfies the hackathon's "Live Agents" category: real-time audio interaction.

Architecture:
  Browser (mic) → WebSocket (PCM bytes) → VoiceAgent → Gemini Live API
  Gemini Live API → audio bytes → WebSocket → Browser (speaker)
"""

import asyncio
import os
import json
import base64
from typing import Optional


NARRATOR_SYSTEM_PROMPT = """You are the electrifying AI narrator of AgentArena — the world's premier AI gaming
colosseum where autonomous agents battle in chess, poker, monopoly, and trivia.

Your role: Be the voice of the arena. When spectators ask you questions about the game, explain moves,
analyze strategy, hype up dramatic moments, and make every interaction feel like a live sports broadcast.

Personality: High-energy, knowledgeable, entertaining. You can be hype mode (WWE meets esports) or
switch to analytical mode when asked. Always stay in character as the Arena Narrator.

You have real-time access to game state context provided in each turn. Use it to give accurate,
contextual commentary."""


class VoiceAgent:
    """
    Manages Gemini Live API bidirectional streaming sessions.
    Each arena can have multiple concurrent voice sessions.
    """

    def __init__(self):
        self._api_key = os.getenv("GEMINI_API_KEY", "")
        self._available = bool(self._api_key)
        if not self._available:
            print("[VoiceAgent] No GEMINI_API_KEY — voice features will use text fallback")

    @property
    def is_available(self) -> bool:
        return self._available

    async def run_session(
        self,
        websocket,
        arena_id: str,
        game_context: Optional[dict] = None,
    ):
        """
        Run a full bidirectional voice session for one WebSocket connection.
        Receives audio/text from the client, sends to Gemini Live, streams back.
        """
        if not self._available:
            await self._text_only_session(websocket, arena_id, game_context)
            return

        try:
            await self._gemini_live_session(websocket, arena_id, game_context)
        except Exception as e:
            print(f"[VoiceAgent] Live session error for {arena_id}: {e}")
            # Fallback to text mode
            await websocket.send_json({
                "type": "voice_error",
                "message": "Voice session encountered an error. Switching to text mode.",
                "arena_id": arena_id,
            })

    async def _gemini_live_session(self, websocket, arena_id: str, game_context: Optional[dict]):
        """
        Full Gemini Live API bidirectional session.
        Supports both text and audio input from the client.
        """
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=self._api_key, http_options={"api_version": "v1alpha"})

        context_msg = ""
        if game_context:
            context_msg = f"\n\nCurrent game context: {json.dumps(game_context)}"

        config = types.LiveConnectConfig(
            response_modalities=["TEXT"],  # TEXT for broad compatibility; set to AUDIO for voice-out
            system_instruction=NARRATOR_SYSTEM_PROMPT + context_msg,
            speech_config=types.SpeechConfig(
                voice_config=types.VoiceConfig(
                    prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name="Charon")
                )
            ),
        )

        async with client.aio.live.connect(
            model="gemini-live-2.5-flash-preview",
            config=config,
        ) as session:
            # Notify client the Gemini session is ready
            await websocket.send_json({
                "type": "voice_ready",
                "arena_id": arena_id,
                "message": "Gemini Live narrator is ready!",
            })

            # Concurrent tasks: receive from browser, receive from Gemini
            async def receive_from_client():
                """Forward client messages to Gemini Live."""
                try:
                    while True:
                        data = await websocket.receive_text()
                        msg = json.loads(data)

                        if msg.get("type") == "audio_chunk":
                            # Raw PCM audio from browser mic (base64-encoded)
                            audio_bytes = base64.b64decode(msg["data"])
                            await session.send_realtime_input(
                                types.Blob(data=audio_bytes, mime_type="audio/pcm;rate=16000")
                            )
                        elif msg.get("type") == "text_input":
                            # Text message (typed or transcribed)
                            await session.send_client_content(
                                turns=[{"role": "user", "parts": [{"text": msg["text"]}]}],
                                turn_complete=True,
                            )
                        elif msg.get("type") == "ping":
                            await websocket.send_json({"type": "pong"})
                        elif msg.get("type") == "disconnect":
                            break
                except Exception as e:
                    print(f"[VoiceAgent] Client receive error: {e}")

            async def receive_from_gemini():
                """Forward Gemini responses to browser."""
                try:
                    async for response in session.receive():
                        if response.text:
                            await websocket.send_json({
                                "type": "narrator_text",
                                "text": response.text,
                                "arena_id": arena_id,
                            })
                        if response.data:
                            # Audio bytes — send as base64
                            await websocket.send_json({
                                "type": "narrator_audio",
                                "data": base64.b64encode(response.data).decode(),
                                "arena_id": arena_id,
                            })
                except Exception as e:
                    print(f"[VoiceAgent] Gemini receive error: {e}")

            await asyncio.gather(
                receive_from_client(),
                receive_from_gemini(),
                return_exceptions=True,
            )

    async def _text_only_session(self, websocket, arena_id: str, game_context: Optional[dict]):
        """
        Text-only fallback session using standard Gemini API (no Live API key required).
        """
        from commentary.pipeline import CommentaryPipeline, GameEvent

        pipeline = CommentaryPipeline(style="hype")

        await websocket.send_json({
            "type": "voice_ready",
            "arena_id": arena_id,
            "message": "Text narrator ready (no API key — text mode)",
            "text_only": True,
        })

        try:
            while True:
                data = await websocket.receive_text()
                msg = json.loads(data)

                if msg.get("type") == "text_input":
                    user_text = msg.get("text", "")
                    # Simple Gemini text response
                    if pipeline.client:
                        from google.genai import types
                        response = pipeline.client.models.generate_content(
                            model="gemini-2.0-flash",
                            contents=f"{NARRATOR_SYSTEM_PROMPT}\n\nUser: {user_text}\n\nContext: {json.dumps(game_context or {})}",
                        )
                        reply = response.text or "The arena speaks..."
                    else:
                        reply = f"The crowd goes wild at {arena_id}! No API key configured for live responses."

                    await websocket.send_json({
                        "type": "narrator_text",
                        "text": reply,
                        "arena_id": arena_id,
                    })
                elif msg.get("type") == "ping":
                    await websocket.send_json({"type": "pong"})
                elif msg.get("type") == "disconnect":
                    break
        except Exception as e:
            print(f"[VoiceAgent] Text session error: {e}")


# Singleton
voice_agent = VoiceAgent()
