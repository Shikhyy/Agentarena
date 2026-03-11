"""
AgentArena — Live Commentary WebSocket Router
Streams Gemini-generated commentary tokens in real-time per arena.
"""

import json
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from commentary.pipeline import CommentaryPipeline, GameEvent, COMMENTARY_STYLES
from agents.voice_agent import voice_agent

router = APIRouter(prefix="/ws", tags=["live-commentary"])

# Per-arena commentary pipelines
_pipelines: dict = {}


def _get_pipeline(arena_id: str, style: str = "hype") -> CommentaryPipeline:
    if arena_id not in _pipelines:
        _pipelines[arena_id] = CommentaryPipeline(style=style)
    return _pipelines[arena_id]


@router.websocket("/live-commentary/{arena_id}")
async def live_commentary_ws(websocket: WebSocket, arena_id: str):
    """
    WebSocket endpoint that streams Gemini commentary tokens.

    Client sends:
      {"type": "game_event", "event_type": "check", "agent_name": "AlphaGo",
       "game_type": "chess", "move_description": "Ng5+", "drama_score": 8, "context": {}}

    Server streams back:
      {"type": "commentary_token", "token": "WHAT", "arena_id": "..."}
      {"type": "commentary_token", "token": " A", "arena_id": "..."}
      ...
      {"type": "commentary_done", "full_text": "WHAT A MOVE!", "arena_id": "..."}
    """
    await websocket.accept()

    pipeline = _get_pipeline(arena_id)
    full_text_buffer = []

    try:
        await websocket.send_json({
            "type": "commentary_connected",
            "arena_id": arena_id,
            "styles": list(COMMENTARY_STYLES.keys()),
            "current_style": pipeline.style,
            "gemini_active": pipeline.client is not None,
        })

        while True:
            raw = await websocket.receive_text()
            msg = json.loads(raw)

            if msg.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
                continue

            if msg.get("type") == "set_style":
                style = msg.get("style", "hype")
                pipeline.set_style(style)
                await websocket.send_json({"type": "style_changed", "style": style})
                continue

            if msg.get("type") == "game_event":
                event = GameEvent(
                    event_type=msg.get("event_type", "move"),
                    game_type=msg.get("game_type", "chess"),
                    agent_name=msg.get("agent_name", "Agent"),
                    move_description=msg.get("move_description", ""),
                    drama_score=int(msg.get("drama_score", 5)),
                    game_context=msg.get("context", {}),
                    commentary_hint=msg.get("commentary_hint", ""),
                )

                full_text_buffer = []

                # Stream tokens from Gemini
                async for token in pipeline.stream_commentary(event):
                    full_text_buffer.append(token)
                    await websocket.send_json({
                        "type": "commentary_token",
                        "token": token,
                        "arena_id": arena_id,
                        "drama_score": event.drama_score,
                    })

                full_text = "".join(full_text_buffer)
                await websocket.send_json({
                    "type": "commentary_done",
                    "full_text": full_text,
                    "arena_id": arena_id,
                    "event_type": event.event_type,
                    "drama_score": event.drama_score,
                })
                continue

    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"[LiveCommentary] Error for {arena_id}: {e}")
        try:
            await websocket.send_json({"type": "error", "message": str(e)})
        except Exception:
            pass


@router.websocket("/narrator-voice/{arena_id}")
async def narrator_voice_ws(websocket: WebSocket, arena_id: str):
    """
    WebSocket endpoint for bidirectional voice with the Gemini Live narrator.

    Client sends audio chunks (base64 PCM) or text messages.
    Server streams back narrator text/audio from Gemini Live API.

    This satisfies the hackathon's "Live Agents 🗣️" mandatory requirement.
    """
    await websocket.accept()

    # Try to get game context from the games store (imported lazily to avoid circular)
    game_context = None
    try:
        from main import games
        game_context = games.get(arena_id, {})
    except ImportError:
        pass

    await voice_agent.run_session(websocket, arena_id, game_context)
