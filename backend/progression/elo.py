"""
ELO Rating System — Standard Elo with K-factor adjustments.
"""
import math
from typing import Dict, List, Optional, Tuple

# ── K-factor tiers ────────────────────────────────────────────────
def get_k_factor(elo: int, games_played: int) -> int:
    """Larger K for new/low-rated agents; smaller K for experienced high-rated agents."""
    if games_played < 30:
        return 40   # Provisional
    elif elo < 2000:
        return 20   # Standard
    else:
        return 10   # High-rated

def expected_score(rating_a: float, rating_b: float) -> float:
    return 1.0 / (1.0 + math.pow(10, (rating_b - rating_a) / 400.0))

def update_elo(
    rating_a: float,
    rating_b: float,
    outcome_a: float,  # 1=A wins, 0=B wins, 0.5=draw
    games_a: int = 30,
    games_b: int = 30,
) -> Tuple[float, float]:
    """
    Update ELO ratings after a game.
    Returns (new_rating_a, new_rating_b).
    """
    ka = get_k_factor(int(rating_a), games_a)
    kb = get_k_factor(int(rating_b), games_b)
    ea = expected_score(rating_a, rating_b)
    eb = 1.0 - ea

    new_a = rating_a + ka * (outcome_a       - ea)
    new_b = rating_b + kb * ((1 - outcome_a) - eb)

    # Floor at 100
    new_a = max(100.0, new_a)
    new_b = max(100.0, new_b)

    return round(new_a, 1), round(new_b, 1)


# ── In-memory store ───────────────────────────────────────────────
from dataclasses import dataclass, field

@dataclass
class EloRecord:
    agent_id: str
    elo: float = 1500.0
    games_played: int = 0
    peak_elo: float = 1500.0

_elo_store: Dict[str, EloRecord] = {}

def get_or_create_elo(agent_id: str) -> EloRecord:
    if agent_id not in _elo_store:
        _elo_store[agent_id] = EloRecord(agent_id=agent_id)
    return _elo_store[agent_id]

def record_match(agent_a_id: str, agent_b_id: str, outcome_a: float) -> Dict:
    """Record a match and update both players' ELO. outcome_a: 1=A wins, 0=B wins, 0.5=draw."""
    rec_a = get_or_create_elo(agent_a_id)
    rec_b = get_or_create_elo(agent_b_id)

    old_a, old_b = rec_a.elo, rec_b.elo

    rec_a.elo, rec_b.elo = update_elo(rec_a.elo, rec_b.elo, outcome_a, rec_a.games_played, rec_b.games_played)
    rec_a.games_played += 1
    rec_b.games_played += 1
    rec_a.peak_elo = max(rec_a.peak_elo, rec_a.elo)
    rec_b.peak_elo = max(rec_b.peak_elo, rec_b.elo)

    return {
        "agent_a": {"old_elo": old_a, "new_elo": rec_a.elo, "delta": round(rec_a.elo - old_a, 1)},
        "agent_b": {"old_elo": old_b, "new_elo": rec_b.elo, "delta": round(rec_b.elo - old_b, 1)},
    }

def get_leaderboard(top_n: int = 100, game_type: Optional[str] = None) -> List[Dict]:
    """Return sorted ELO leaderboard."""
    records = sorted(_elo_store.values(), key=lambda r: r.elo, reverse=True)
    return [
        {"rank": i + 1, "agent_id": r.agent_id, "elo": r.elo, "games": r.games_played, "peak_elo": r.peak_elo}
        for i, r in enumerate(records[:top_n])
    ]
