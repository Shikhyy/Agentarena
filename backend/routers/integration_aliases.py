"""
Integration aliases for PDF/API parity.
Provides /api/* compatibility routes and runtime contract config.
"""

from fastapi import APIRouter, HTTPException

from config import config
from progression.elo import get_leaderboard, get_or_create_elo
from progression.xp_system import get_or_create_xp_state, xp_to_next_level
from routers.agents import agents_db
from routers.matches import matches_db
from betting.odds_engine import odds_engine

router = APIRouter(tags=["Integration"])


@router.get("/config/contracts")
async def contract_config():
    return {
        "network": {
            "rpc_url": config.POLYGON_RPC_URL,
        },
        "contracts": {
            "agent_nft": config.AGENT_NFT_CONTRACT,
            "skill_nft": config.SKILL_NFT_CONTRACT,
            "arena_token": config.ARENA_TOKEN_CONTRACT,
            "zk_betting_pool": getattr(config, "ZK_BETTING_POOL_CONTRACT", ""),
            "result_oracle": getattr(config, "RESULT_ORACLE_CONTRACT", ""),
        },
    }


@router.get("/nfts")
async def nfts(owner: str = ""):
    if not owner:
        return {"nfts": [], "total": 0}

    owned_agents = [a for a in agents_db.values() if a.get("owner") == owner]
    items = []
    for idx, agent in enumerate(owned_agents):
        items.append({
            "token_id": agent.get("nft_token_id") or f"demo-{idx + 1}",
            "collection": "AgentNFT",
            "name": agent.get("name", "Unnamed Agent"),
            "agent_id": agent.get("agent_id"),
            "metadata_uri": f"ipfs://agentarena/{agent.get('agent_id', 'unknown')}",
        })

    return {"nfts": items, "total": len(items)}


@router.get("/api/stats")
async def api_stats():
    # Kept intentionally lightweight; frontend expects these keys.
    return {
        "total_agents": len(agents_db),
        "live_matches": sum(1 for m in matches_db.values() if m.get("status") == "live"),
        "pool_volume_usd": 0,
    }


@router.get("/api/leaderboard")
async def api_leaderboard(limit: int = 100, game: str = "all", period: str = "all_time"):
    game_type = None if game == "all" else game
    rankings = get_leaderboard(top_n=limit, game_type=game_type)
    return {
        "rankings": rankings,
        "game_filter": game,
        "period": period,
        "total": len(rankings),
    }


@router.get("/api/agents")
async def api_agents(owner: str = "", status: str = "active", limit: int = 50):
    results = list(agents_db.values())
    if owner:
        results = [a for a in results if a.get("owner") == owner]
    if status:
        results = [a for a in results if a.get("status") == status]
    return {"agents": results[:limit], "total": len(results)}


@router.get("/api/agents/{agent_id}")
async def api_agent(agent_id: str):
    agent = agents_db.get(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    xp_state = get_or_create_xp_state(agent_id)
    elo_state = get_or_create_elo(agent_id)
    return {
        **agent,
        "xp": xp_state.xp,
        "level": xp_state.level,
        "xp_to_next_level": xp_to_next_level(xp_state.xp),
        "wins": xp_state.wins,
        "losses": xp_state.losses,
        "games_played": xp_state.games_played,
        "elo": elo_state.elo,
        "peak_elo": elo_state.peak_elo,
    }


@router.get("/api/matches/{match_id}")
async def api_match(match_id: str):
    match = matches_db.get(match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    return {
        **match,
        "live_odds": odds_engine.get_current_state(match_id),
    }


@router.get("/api/betting/odds/{match_id}")
async def api_betting_odds(match_id: str):
    return odds_engine.get_current_state(match_id)


@router.get("/api/nfts")
async def api_nfts(owner: str = ""):
    return await nfts(owner=owner)
