"""
AgentArena — Tournaments Router
Create brackets, enter agents, track bracket state.
Grand Prix requires L20+ agents.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
import time
import uuid
import math

from auth.service import get_current_user

router = APIRouter(prefix="/tournaments", tags=["Tournaments"])

# ─── In-Memory Tournament Store ───────────────────────────────────
tournaments_db: dict = {}


class CreateTournamentRequest(BaseModel):
    name: str
    game_type: str   # chess, poker, monopoly, trivia
    max_agents: int = 8   # must be power of 2: 4, 8, 16
    entry_fee_arena: int = 10
    prize_pool_arena: int = 100
    is_grand_prix: bool = False   # L20+ only


class EnterTournamentRequest(BaseModel):
    agent_id: str


def generate_bracket(agents: List[str]) -> List[dict]:
    """Generate a single-elimination bracket from a list of agent IDs."""
    n = len(agents)
    if n < 2:
        return []

    rounds = []
    current_round = [{"agent_a": agents[i * 2], "agent_b": agents[i * 2 + 1], "winner": None}
                     for i in range(n // 2)]
    rounds.append({"round": 1, "matches": current_round})

    for r in range(2, int(math.log2(n)) + 1):
        tbd_matches = [{"agent_a": "TBD", "agent_b": "TBD", "winner": None}
                       for _ in range(n // (2 ** r))]
        rounds.append({"round": r, "matches": tbd_matches})

    return rounds


@router.post("")
async def create_tournament(req: CreateTournamentRequest, wallet: str = Depends(get_current_user)):
    """Create a new tournament bracket."""
    if req.max_agents not in (4, 8, 16, 32):
        raise HTTPException(status_code=400, detail="max_agents must be 4, 8, 16, or 32")
    if req.game_type not in ("chess", "poker", "monopoly", "trivia"):
        raise HTTPException(status_code=400, detail="Invalid game_type")

    tournament_id = f"tournament_{uuid.uuid4().hex[:10]}"
    tournament = {
        "tournament_id": tournament_id,
        "name": req.name,
        "game_type": req.game_type,
        "max_agents": req.max_agents,
        "entry_fee_arena": req.entry_fee_arena,
        "prize_pool_arena": req.prize_pool_arena,
        "is_grand_prix": req.is_grand_prix,
        "status": "registration",   # registration, active, completed
        "created_by": wallet,
        "created_at": time.time(),
        "starts_at": time.time() + 3600,  # 1 hour from now
        "participants": [],
        "bracket": [],
        "winner_id": None,
    }
    tournaments_db[tournament_id] = tournament
    return tournament


@router.get("")
async def list_tournaments(
    game_type: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 20,
):
    """List tournaments with optional filters."""
    results = list(tournaments_db.values())
    if game_type:
        results = [t for t in results if t.get("game_type") == game_type]
    if status:
        results = [t for t in results if t.get("status") == status]
    results.sort(key=lambda t: t.get("created_at", 0), reverse=True)
    return {"tournaments": results[:limit], "total": len(results)}


@router.get("/{tournament_id}")
async def get_tournament(tournament_id: str):
    """Get full tournament state including bracket."""
    tournament = tournaments_db.get(tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    return tournament


@router.post("/{tournament_id}/enter")
async def enter_tournament(
    tournament_id: str,
    req: EnterTournamentRequest,
    wallet: str = Depends(get_current_user),
):
    """Enter an agent into a tournament."""
    tournament = tournaments_db.get(tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    if tournament["status"] != "registration":
        raise HTTPException(status_code=400, detail="Registration is closed")
    if len(tournament["participants"]) >= tournament["max_agents"]:
        raise HTTPException(status_code=400, detail="Tournament is full")
    if req.agent_id in tournament["participants"]:
        raise HTTPException(status_code=400, detail="Agent already entered")

    tournament["participants"].append(req.agent_id)

    # Auto-start when full
    if len(tournament["participants"]) == tournament["max_agents"]:
        tournament["status"] = "active"
        tournament["bracket"] = generate_bracket(tournament["participants"])
        tournament["started_at"] = time.time()

    return {
        "tournament_id": tournament_id,
        "agent_id": req.agent_id,
        "position": len(tournament["participants"]),
        "spots_remaining": tournament["max_agents"] - len(tournament["participants"]),
        "status": tournament["status"],
    }


@router.post("/{tournament_id}/report")
async def report_match_result(
    tournament_id: str,
    round_num: int,
    match_index: int,
    winner_id: str,
    wallet: str = Depends(get_current_user),
):
    """Report a match result and advance the bracket."""
    tournament = tournaments_db.get(tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    if tournament["status"] != "active":
        raise HTTPException(status_code=400, detail="Tournament is not active")

    bracket = tournament["bracket"]
    round_data = next((r for r in bracket if r["round"] == round_num), None)
    if not round_data or match_index >= len(round_data["matches"]):
        raise HTTPException(status_code=400, detail="Invalid round or match index")

    round_data["matches"][match_index]["winner"] = winner_id

    # Advance winner to next round
    if round_num < len(bracket):
        next_round = next((r for r in bracket if r["round"] == round_num + 1), None)
        if next_round:
            slot = match_index // 2
            if slot < len(next_round["matches"]):
                if match_index % 2 == 0:
                    next_round["matches"][slot]["agent_a"] = winner_id
                else:
                    next_round["matches"][slot]["agent_b"] = winner_id

    # Check if tournament is over
    final_round = bracket[-1] if bracket else None
    if final_round and all(m["winner"] for m in final_round["matches"]):
        tournament["status"] = "completed"
        tournament["winner_id"] = final_round["matches"][0]["winner"]
        tournament["ended_at"] = time.time()

    return {"bracket": bracket, "tournament_status": tournament["status"]}
