"""
AgentArena — Matches Router
Start, query, and list match history.
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List
import time
import uuid

from auth.service import get_current_user
from betting.odds_engine import odds_engine

router = APIRouter(prefix="/matches", tags=["Matches"])

# ─── In-Memory Match Store (replace with Firestore in production) ─────
matches_db: dict = {}


class StartMatchRequest(BaseModel):
    agent_a_id: str
    agent_b_id: str
    game_type: str  # chess, poker, monopoly, trivia
    hall_id: Optional[str] = None
    spectator_bet_enabled: bool = True


@router.post("/start")
async def start_match(req: StartMatchRequest, background_tasks: BackgroundTasks, wallet: str = Depends(get_current_user)):
    """
    Start a new match between two agents.
    Initializes game engine, odds engine, and returns matchId.
    """
    if req.game_type not in ("chess", "poker", "monopoly", "trivia"):
        raise HTTPException(status_code=400, detail="Invalid game_type. Must be chess, poker, monopoly, or trivia")

    match_id = f"match_{uuid.uuid4().hex[:12]}"
    hall_id = req.hall_id or f"hall_{req.game_type}_{uuid.uuid4().hex[:6]}"

    match = {
        "match_id": match_id,
        "hall_id": hall_id,
        "game_type": req.game_type,
        "agent_a_id": req.agent_a_id,
        "agent_b_id": req.agent_b_id,
        "status": "starting",
        "started_at": time.time(),
        "ended_at": None,
        "winner_id": None,
        "turns": [],
        "spectator_count": 0,
        "started_by": wallet,
    }

    matches_db[match_id] = match

    # Initialize odds for this match
    odds_engine.initialize_arena(match_id, prob_a=0.5)

    # In production: trigger ADK orchestrator via Cloud Pub/Sub
    # For MVP: mark as live
    matches_db[match_id]["status"] = "live"

    return {
        "match_id": match_id,
        "hall_id": hall_id,
        "status": "live",
        "stream_url": f"/arenas/{hall_id}/stream",
        "watch_url": f"/world/arena/{hall_id}",
        "initial_odds": odds_engine.get_current_state(match_id),
    }


@router.get("/history")
async def match_history(
    agent_id: Optional[str] = None,
    game_type: Optional[str] = None,
    limit: int = 20,
    offset: int = 0,
):
    """Get match history with optional filters."""
    results = list(matches_db.values())

    if agent_id:
        results = [
            m for m in results
            if m.get("agent_a_id") == agent_id or m.get("agent_b_id") == agent_id
        ]
    if game_type:
        results = [m for m in results if m.get("game_type") == game_type]

    # Sort by most recent first
    results.sort(key=lambda m: m.get("started_at", 0), reverse=True)

    return {
        "matches": results[offset: offset + limit],
        "total": len(results),
        "offset": offset,
        "limit": limit,
    }


@router.get("/live")
async def list_live_matches(game_type: Optional[str] = None):
    """Get all currently live matches."""
    results = [m for m in matches_db.values() if m.get("status") == "live"]
    if game_type:
        results = [m for m in results if m.get("game_type") == game_type]
    return {"matches": results, "total": len(results)}


@router.get("/{match_id}")
async def get_match(match_id: str):
    """Get full match state including current turn, odds, and spectator count."""
    match = matches_db.get(match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    return {
        **match,
        "live_odds": odds_engine.get_current_state(match_id),
    }


@router.post("/{match_id}/end")
async def end_match(match_id: str, winner_id: str, wallet: str = Depends(get_current_user)):
    """
    End a match and record the result.
    In production, called by judge_agent after verifying final position.
    """
    match = matches_db.get(match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    if match.get("status") == "completed":
        raise HTTPException(status_code=400, detail="Match already completed")

    match["status"] = "completed"
    match["ended_at"] = time.time()
    match["winner_id"] = winner_id
    duration = match["ended_at"] - match["started_at"]

    return {
        "match_id": match_id,
        "winner_id": winner_id,
        "duration_seconds": round(duration),
        "final_odds": odds_engine.get_current_state(match_id),
        "status": "completed",
    }
