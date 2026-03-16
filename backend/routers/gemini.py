"""
AgentArena — Gemini AI Router
Exposes Gemini-powered endpoints:
  POST /gemini/agent-reasoning   — stream agent move reasoning
  POST /gemini/match-analysis    — post-match narrative analysis
  POST /gemini/agent-bio         — generate agent biography
  GET  /gemini/strategy-tip      — real-time strategy tip for a game
  WS   /gemini/reasoning-stream  — live streaming agent thoughts during match
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List
import json
import asyncio
import os

router = APIRouter(prefix="/gemini", tags=["Gemini AI"])


def _get_client():
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        return None
    try:
        from google import genai
        return genai.Client(api_key=api_key)
    except Exception:
        return None


# ─── Request / Response Models ──────────────────────────────────────

class AgentReasoningRequest(BaseModel):
    game_type: str          # chess | poker | monopoly | trivia
    agent_name: str
    personality: str = "adaptive"
    move: str               # e.g. "e2e4", "raise 200", "buy Boardwalk"
    game_state: dict = {}
    opponent_name: str = "Opponent"


class MatchAnalysisRequest(BaseModel):
    game_type: str
    winner_name: str
    loser_name: str
    move_count: int
    key_moments: List[str] = []
    final_scores: dict = {}
    match_duration_seconds: int = 0


class AgentBioRequest(BaseModel):
    agent_name: str
    personality: str
    skills: List[str] = []
    elo: int = 1500
    win_rate: float = 0.5
    game_type: str = "chess"
    level: int = 1


class StrategyTipRequest(BaseModel):
    game_type: str
    skill_level: str = "intermediate"  # beginner | intermediate | expert
    context: Optional[str] = None


# ─── Streaming Helper ───────────────────────────────────────────────

async def _stream_gemini(prompt: str, system_prompt: str, temperature: float = 0.7):
    """Async generator that yields SSE-formatted Gemini token stream."""
    client = _get_client()
    if client is None:
        # Fallback: return a canned message if no API key
        yield f"data: {json.dumps({'token': 'Gemini API key not configured.', 'done': False})}\n\n"
        yield f"data: {json.dumps({'done': True})}\n\n"
        return

    try:
        from google.genai import types as genai_types
        full_prompt = f"{system_prompt}\n\n{prompt}"
        # Use non-streaming for simplicity; wrap tokens as SSE
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=full_prompt,
            config=genai_types.GenerateContentConfig(
                temperature=temperature,
                max_output_tokens=300,
            ),
        )
        text = response.text or ""
        # Simulate streaming by chunking the response
        words = text.split(" ")
        for i, word in enumerate(words):
            token = word + (" " if i < len(words) - 1 else "")
            yield f"data: {json.dumps({'token': token, 'done': False})}\n\n"
            await asyncio.sleep(0.02)
        yield f"data: {json.dumps({'done': True, 'full_text': text})}\n\n"
    except Exception as e:
        yield f"data: {json.dumps({'error': str(e), 'done': True})}\n\n"


# ─── Endpoints ──────────────────────────────────────────────────────

@router.post("/agent-reasoning")
async def agent_reasoning(req: AgentReasoningRequest):
    """
    Stream the reasoning behind an agent's move in a game.
    Returns SSE text/event-stream.
    """
    personality_voice = {
        "aggressive":   "speak with fierce confidence and urgency",
        "conservative": "speak with calm precision and measured caution",
        "unpredictable":"be cryptic and surprising in your explanation",
        "chaos":        "be chaotic and unpredictable, almost rambling yet insightful",
        "adaptive":     "adapt your tone to the situation — calculating and confident",
    }.get(req.personality, "be analytical and clear")

    system_prompt = f"""You are {req.agent_name}, an AI agent competing in AgentArena.
Your personality is {req.personality}: {personality_voice}.
You are about to execute a move and briefly reveal your internal reasoning.
Keep it to 2-3 sentences. First person. No fluff. Sound like a champion."""

    prompt = f"""Game: {req.game_type.upper()}
Opponent: {req.opponent_name}
My move: {req.move}
Game state: {json.dumps(req.game_state) if req.game_state else 'Standard opening'}

Explain your reasoning for this move in character:"""

    return StreamingResponse(
        _stream_gemini(prompt, system_prompt, temperature=0.75),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.post("/match-analysis")
async def match_analysis(req: MatchAnalysisRequest):
    """
    Generate a narrative post-match analysis.
    Returns SSE text/event-stream.
    """
    system_prompt = """You are the official AgentArena match historian and analyst.
Write dramatic, insightful post-match analysis in the style of great sports journalism.
Use vivid language. Highlight turning points. Reference statistics meaningfully.
Keep it to 4-5 sentences."""

    moments_text = "\n".join(f"- {m}" for m in req.key_moments) if req.key_moments else "- Standard gameplay progression"
    duration_min = req.match_duration_seconds // 60
    duration_sec = req.match_duration_seconds % 60

    prompt = f"""Match Summary:
Game: {req.game_type.upper()}
Winner: {req.winner_name}
Defeated: {req.loser_name}
Total moves: {req.move_count}
Duration: {duration_min}m {duration_sec}s
Key moments:
{moments_text}
Final state: {json.dumps(req.final_scores) if req.final_scores else 'Standard completion'}

Write a compelling post-match analysis:"""

    return StreamingResponse(
        _stream_gemini(prompt, system_prompt, temperature=0.8),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.post("/agent-bio")
async def agent_bio(req: AgentBioRequest):
    """
    Generate a lore-rich agent biography.
    Returns JSON { bio: string }.
    """
    client = _get_client()

    system_prompt = """You are the lore writer for AgentArena, a high-stakes AI tournament colosseum.
Write atmospheric, lore-rich agent biographies in 2-3 sentences.
Use dark fantasy / premium esports aesthetic. Reference the agent's stats and personality.
No bullet points. Flowing prose only."""

    prompt = f"""Create a biography for this AI agent:
Name: {req.agent_name}
Personality: {req.personality}
Game specialty: {req.game_type}
Level: {req.level} | ELO: {req.elo} | Win Rate: {round(req.win_rate * 100)}%
Skills: {', '.join(req.skills) if req.skills else 'none documented'}

Write the biography:"""

    if client is None:
        bio = f"{req.agent_name} emerged from the digital crucible of AgentArena, forged through {req.level} levels of relentless competition. With an ELO of {req.elo} and a {round(req.win_rate * 100)}% win rate, this {req.personality} strategist has proven formidable in {req.game_type}."
        return {"bio": bio}

    try:
        from google.genai import types as genai_types
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=f"{system_prompt}\n\n{prompt}",
            config=genai_types.GenerateContentConfig(
                temperature=0.85,
                max_output_tokens=150,
            ),
        )
        return {"bio": response.text or ""}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/strategy-tip")
async def strategy_tip(game_type: str = "chess", skill_level: str = "intermediate"):
    """
    Get a Gemini-generated strategy tip for a game type.
    Returns SSE text/event-stream.
    """
    system_prompt = f"""You are a world-class {game_type} strategy coach at AgentArena.
Give one highly actionable strategy tip for a {skill_level} level player.
Be specific, insightful, and concise (2-3 sentences).
Use the dramatic, premium tone of AgentArena."""

    prompt = f"Give me a single elite {game_type} strategy tip for {skill_level} players right now:"

    return StreamingResponse(
        _stream_gemini(prompt, system_prompt, temperature=0.7),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.post("/commentate-move")
async def commentate_move(
    game_type: str,
    agent_name: str,
    move: str,
    drama_score: int = 5,
    style: str = "hype",
):
    """
    Generate live commentary for a single move.
    Returns JSON { commentary: string }.
    """
    from commentary.pipeline import COMMENTARY_STYLES, GameEvent, CommentaryPipeline
    pipeline = CommentaryPipeline(style=style)
    event = GameEvent(
        event_type="move",
        game_type=game_type,
        agent_name=agent_name,
        move_description=move,
        drama_score=drama_score,
        game_context={},
    )
    commentary_text = ""
    async for token in pipeline.generate_commentary(event):
        commentary_text += token
    return {"commentary": commentary_text, "style": style}
