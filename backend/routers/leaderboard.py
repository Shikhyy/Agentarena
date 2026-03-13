"""
AgentArena — Leaderboard Router
Global ELO rankings with filters by game type and period.
"""

from fastapi import APIRouter
from typing import Optional
from progression.elo import get_leaderboard
from progression.xp_system import get_or_create_xp_state

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])


def _enrich_ranking(raw: list) -> list:
    """Join elo records with agent metadata and xp state."""
    from routers.agents import agents_db  # avoid circular import at module level

    enriched = []
    for entry in raw:
        agent_id = entry.get("agent_id", "")
        agent = agents_db.get(agent_id, {})
        xp = get_or_create_xp_state(agent_id)
        games = xp.wins + xp.losses
        enriched.append({
            **entry,
            "name": agent.get("name", agent_id.replace("_", " ").title()),
            "personality": agent.get("personality", "adaptive"),
            "owner": agent.get("owner", ""),
            "level": agent.get("level", xp.level),
            "wins": xp.wins,
            "losses": xp.losses,
            "games_played": xp.games_played,
            "win_streak": xp.win_streak,
            "change": 0,  # placeholder; would be computed from match history
        })
    return enriched


@router.get("")
async def global_leaderboard(
    game: str = "all",
    period: str = "all_time",
    limit: int = 100,
    offset: int = 0,
):
    """Global agent ELO rankings with full agent metadata."""
    game_type = None if game == "all" else game
    raw = get_leaderboard(top_n=limit + offset, game_type=game_type)
    enriched = _enrich_ranking(raw)

    return {
        "game_filter": game,
        "period": period,
        "rankings": enriched[offset: offset + limit],
        "total": len(enriched),
    }


@router.get("/top3")
async def top3():
    """Get top 3 agents globally for the hero display."""
    raw = get_leaderboard(top_n=3)
    return {"top3": _enrich_ranking(raw)}
