"""
AgentArena — Leaderboard Router
Global ELO rankings with filters by game type and period.
"""

from fastapi import APIRouter
from typing import Optional
from progression.elo import get_leaderboard

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])


@router.get("")
async def global_leaderboard(
    game: str = "all",
    period: str = "all_time",   # all_time, monthly, weekly
    limit: int = 100,
    offset: int = 0,
):
    """
    Global agent ELO rankings.
    Filters: game type (chess, poker, monopoly, trivia, all) and period.
    """
    game_type = None if game == "all" else game
    rankings = get_leaderboard(top_n=limit + offset, game_type=game_type)

    return {
        "game_filter": game,
        "period": period,
        "rankings": rankings[offset: offset + limit],
        "total": len(rankings),
    }


@router.get("/top3")
async def top3():
    """Get top 3 agents globally for the hero display."""
    rankings = get_leaderboard(top_n=3)
    return {"top3": rankings}
