"""
Agent Progression API Router — XP, ELO, Breeding endpoints.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional

from auth.service import get_current_user
from progression.xp_system import record_game_result, get_or_create_xp_state, xp_to_next_level
from progression.elo import record_match, get_leaderboard, get_or_create_elo
from progression.breeding import (
    breed_agents, AgentProfile, AgentTraits,
    calculate_breeding_fee, traits_to_dict
)
from middleware.rate_limiter import check_rate_limit

router = APIRouter(prefix="/agents", tags=["Agent Progression"])


# ── XP / Game Result ────────────────────────────────────────────
class GameResultRequest(BaseModel):
    agent_id: str
    outcome: str          # "win", "loss", "draw"
    opponent_elo: int = 1500
    flawless: bool = False

@router.post("/game-result")
async def post_game_result(req: GameResultRequest, wallet: str = Depends(get_current_user)):
    check_rate_limit(wallet, "api")
    state = get_or_create_xp_state(req.agent_id)
    result = record_game_result(
        req.agent_id,
        req.outcome,
        opponent_elo=req.opponent_elo,
        my_elo=int(state.xp),  # rough proxy
        flawless=req.flawless,
    )
    return {"agent_id": req.agent_id, **result}


@router.get("/{agent_id}/stats")
async def get_agent_stats(agent_id: str):
    xp_state = get_or_create_xp_state(agent_id)
    elo_state = get_or_create_elo(agent_id)
    return {
        "agent_id": agent_id,
        "xp": xp_state.xp,
        "level": xp_state.level,
        "xp_to_next_level": xp_to_next_level(xp_state.xp),
        "win_streak": xp_state.win_streak,
        "wins": xp_state.wins,
        "losses": xp_state.losses,
        "draws": xp_state.draws,
        "games_played": xp_state.games_played,
        "elo": elo_state.elo,
        "peak_elo": elo_state.peak_elo,
    }


# ── ELO Match Recording ─────────────────────────────────────────
class MatchRequest(BaseModel):
    agent_a_id: str
    agent_b_id: str
    outcome_a: float   # 1=A wins, 0=B wins, 0.5=draw

@router.post("/match")
async def record_match_result(req: MatchRequest, wallet: str = Depends(get_current_user)):
    result = record_match(req.agent_a_id, req.agent_b_id, req.outcome_a)
    return result


# ── Leaderboard ─────────────────────────────────────────────────
@router.get("/leaderboard")
async def leaderboard(top: int = 100, game_type: Optional[str] = None):
    return {"rankings": get_leaderboard(top_n=top, game_type=game_type)}


# ── Breeding ────────────────────────────────────────────────────
class BreedRequest(BaseModel):
    parent_a_id: str
    parent_b_id: str
    offspring_name: str
    bias_toward_a: float = 0.5   # 0–1; 0.5 = equal blend

@router.post("/breed")
async def breed(req: BreedRequest, wallet: str = Depends(get_current_user)):
    check_rate_limit(wallet, "api")

    # Retrieve parent profiles (mock — replace with Firestore lookup)
    parent_a = AgentProfile(agent_id=req.parent_a_id, name=f"Agent {req.parent_a_id}")
    parent_b = AgentProfile(agent_id=req.parent_b_id, name=f"Agent {req.parent_b_id}")

    if not (0.0 <= req.bias_toward_a <= 1.0):
        raise HTTPException(status_code=400, detail="bias_toward_a must be between 0 and 1")

    offspring = breed_agents(parent_a, parent_b, req.offspring_name, req.bias_toward_a)

    fee = calculate_breeding_fee(100)  # placeholder wager of 100 $ARENA

    return {
        "offspring": traits_to_dict(offspring),
        "breeding_fee_arena": fee,
        "message": f"Offspring '{offspring.name}' created. Gen {offspring.generation}."
    }
