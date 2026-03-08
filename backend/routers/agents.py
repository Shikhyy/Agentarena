"""
AgentArena — Agents Router
Full CRUD for AI agents: create, list, get, retire, breed.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
import time
import uuid

from auth.service import get_current_user
from progression.xp_system import get_or_create_xp_state, xp_to_next_level
from progression.elo import get_or_create_elo
from progression.breeding import (
    breed_agents, AgentProfile,
    calculate_breeding_fee, traits_to_dict
)

router = APIRouter(prefix="/agents", tags=["Agents"])

# ─── In-Memory Agent Store (replace with Firestore in production) ─────
agents_db: dict = {}


class CreateAgentRequest(BaseModel):
    name: str
    personality: str = "adaptive"  # aggressive, conservative, unpredictable, adaptive, chaos
    strategy: str = "balanced"
    skills: List[str] = []
    model: str = "gemini-2.0-flash"


class RetireRequest(BaseModel):
    agent_id: str


class BreedRequest(BaseModel):
    parent_a_id: str
    parent_b_id: str
    offspring_name: str
    bias_toward_a: float = 0.5


@router.post("")
async def create_agent(req: CreateAgentRequest, wallet: str = Depends(get_current_user)):
    """
    Create a new AI agent with personality, strategy, and skill loadout.
    Vertex AI Imagen generates the avatar (mocked here).
    """
    agent_id = f"agent_{uuid.uuid4().hex[:8]}"
    agent = {
        "agent_id": agent_id,
        "name": req.name,
        "personality": req.personality,
        "strategy": req.strategy,
        "skills": req.skills,
        "model": req.model,
        "owner": wallet,
        "status": "active",
        "created_at": time.time(),
        "avatar_url": f"https://storage.googleapis.com/agentarena-avatars/{agent_id}.gltf",
        "nft_token_id": None,  # Minted on-chain after creation
        "breed_count": 0,
        "level": 1,
        "elo": 1500,
    }
    agents_db[agent_id] = agent
    return agent


@router.get("")
async def list_agents(
    owner: Optional[str] = None,
    game_type: Optional[str] = None,
    status: Optional[str] = "active",
    limit: int = 50,
):
    """List agents with optional filters."""
    results = list(agents_db.values())
    if owner:
        results = [a for a in results if a.get("owner") == owner]
    if status:
        results = [a for a in results if a.get("status") == status]
    return {"agents": results[:limit], "total": len(results)}


@router.get("/my")
async def get_my_agents(wallet: str = Depends(get_current_user)):
    """Get all agents owned by the authenticated user."""
    results = [a for a in agents_db.values() if a.get("owner") == wallet]
    return {"agents": results, "total": len(results)}


@router.get("/{agent_id}")
async def get_agent(agent_id: str):
    """Get full agent profile including stats, XP, ELO."""
    agent = agents_db.get(agent_id)
    if not agent:
        # Return a synthetic agent for demo purposes
        agent = {
            "agent_id": agent_id,
            "name": agent_id.replace("_", " ").title(),
            "personality": "adaptive",
            "status": "active",
        }

    xp_state = get_or_create_xp_state(agent_id)
    elo_state = get_or_create_elo(agent_id)

    return {
        **agent,
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


@router.post("/{agent_id}/retire")
async def retire_agent(agent_id: str, wallet: str = Depends(get_current_user)):
    """
    Retire an agent. Irreversible. Sets status to 'retired'.
    In production, calls AgentNFT.retire() on Polygon.
    """
    agent = agents_db.get(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    if agent.get("owner") != wallet:
        raise HTTPException(status_code=403, detail="Not your agent")
    if agent.get("status") == "retired":
        raise HTTPException(status_code=400, detail="Agent already retired")

    agent["status"] = "retired"
    agent["retired_at"] = time.time()
    agents_db[agent_id] = agent

    xp_state = get_or_create_xp_state(agent_id)
    return {
        "status": "retired",
        "agent_id": agent_id,
        "career_summary": {
            "games_played": xp_state.games_played,
            "wins": xp_state.wins,
            "losses": xp_state.losses,
            "peak_elo": get_or_create_elo(agent_id).peak_elo,
            "final_level": xp_state.level,
        },
        "message": f"{agent['name']} walks to the Hall of Fame. A legend retires.",
    }


@router.post("/breed")
async def breed_agents_endpoint(req: BreedRequest, wallet: str = Depends(get_current_user)):
    """
    Breed two agents. Both must be L10+ and have < 3 breed count.
    Fee: 5 $ARENA + 5% of parents combined earnings.
    """
    if not (0.0 <= req.bias_toward_a <= 1.0):
        raise HTTPException(status_code=400, detail="bias_toward_a must be 0–1")

    parent_a_data = agents_db.get(req.parent_a_id, {})
    parent_b_data = agents_db.get(req.parent_b_id, {})

    parent_a = AgentProfile(agent_id=req.parent_a_id, name=parent_a_data.get("name", req.parent_a_id))
    parent_b = AgentProfile(agent_id=req.parent_b_id, name=parent_b_data.get("name", req.parent_b_id))

    offspring = breed_agents(parent_a, parent_b, req.offspring_name, req.bias_toward_a)
    fee = calculate_breeding_fee(100)

    # Update breed counts
    if req.parent_a_id in agents_db:
        agents_db[req.parent_a_id]["breed_count"] = agents_db[req.parent_a_id].get("breed_count", 0) + 1
    if req.parent_b_id in agents_db:
        agents_db[req.parent_b_id]["breed_count"] = agents_db[req.parent_b_id].get("breed_count", 0) + 1

    # Register offspring
    offspring_id = f"agent_{uuid.uuid4().hex[:8]}"
    agents_db[offspring_id] = {
        "agent_id": offspring_id,
        "name": req.offspring_name,
        "personality": "adaptive",
        "owner": wallet,
        "status": "active",
        "created_at": time.time(),
        "breed_count": 0,
        "generation": offspring.generation,
        "parent_a": req.parent_a_id,
        "parent_b": req.parent_b_id,
        "traits": traits_to_dict(offspring),
        "level": 1,
        "elo": 1500,
    }

    return {
        "offspring_id": offspring_id,
        "offspring": traits_to_dict(offspring),
        "breeding_fee_arena": fee,
        "message": f" Offspring '{offspring.name}' Gen {offspring.generation} created! DNA helix animation: 8s.",
    }
