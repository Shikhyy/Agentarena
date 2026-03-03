"""
XP System — Per-game experience gain with level thresholds and bonuses.
"""

from dataclasses import dataclass, field
from typing import Dict, List
import math

# ── Level Thresholds ─────────────────────────────────────────────
# XP required to reach each level (cumulative)
LEVEL_THRESHOLDS = [
    0,      # Level 1
    100,    # Level 2
    300,    # Level 3
    600,    # Level 4
    1000,   # Level 5
    1500,   # Level 6
    2200,   # Level 7
    3100,   # Level 8
    4200,   # Level 9
    5500,   # Level 10 (Max for Phase 2)
]

# ── XP Awards ────────────────────────────────────────────────────
XP_WIN      = 50
XP_LOSS     = 15
XP_DRAW     = 25
XP_STREAK_BONUS   = 10   # per win in a streak above 2
XP_UPSET_BONUS    = 30   # beat opponent with 200+ ELO advantage
XP_FLAWLESS_BONUS = 20   # won without opponent scoring (game-specific)

@dataclass
class AgentXPState:
    agent_id: str
    xp: int = 0
    level: int = 1
    win_streak: int = 0
    games_played: int = 0
    wins: int = 0
    losses: int = 0
    draws: int = 0

def get_level_for_xp(xp: int) -> int:
    level = 1
    for i, threshold in enumerate(LEVEL_THRESHOLDS):
        if xp >= threshold:
            level = i + 1
    return level

def xp_to_next_level(xp: int) -> int:
    current_level = get_level_for_xp(xp)
    if current_level >= len(LEVEL_THRESHOLDS):
        return 0  # Max level
    return LEVEL_THRESHOLDS[current_level] - xp

def award_xp(
    state: AgentXPState,
    outcome: str,          # "win", "loss", "draw"
    opponent_elo: int = 1500,
    my_elo: int = 1500,
    flawless: bool = False,
) -> Dict[str, any]:
    """
    Award XP for a game result. Returns a summary of what was gained.
    """
    base_xp = 0
    bonuses = []

    if outcome == "win":
        base_xp = XP_WIN
        state.wins += 1
        state.win_streak += 1

        # Streak bonus (kicks in at 3+ wins)
        if state.win_streak > 2:
            streak_bonus = XP_STREAK_BONUS * (state.win_streak - 2)
            base_xp += streak_bonus
            bonuses.append({"type": "streak", "amount": streak_bonus, "streak": state.win_streak})

        # Upset bonus
        if opponent_elo - my_elo >= 200:
            base_xp += XP_UPSET_BONUS
            bonuses.append({"type": "upset", "amount": XP_UPSET_BONUS})

        # Flawless
        if flawless:
            base_xp += XP_FLAWLESS_BONUS
            bonuses.append({"type": "flawless", "amount": XP_FLAWLESS_BONUS})

    elif outcome == "loss":
        base_xp = XP_LOSS
        state.losses += 1
        state.win_streak = 0

    elif outcome == "draw":
        base_xp = XP_DRAW
        state.draws += 1
        state.win_streak = 0

    old_level = state.level
    state.xp += base_xp
    state.games_played += 1
    state.level = get_level_for_xp(state.xp)
    leveled_up = state.level > old_level

    return {
        "xp_gained": base_xp,
        "total_xp": state.xp,
        "level": state.level,
        "leveled_up": leveled_up,
        "bonuses": bonuses,
        "xp_to_next_level": xp_to_next_level(state.xp),
    }


# ── In-memory store (replace with Firestore in production) ───────
_xp_store: Dict[str, AgentXPState] = {}

def get_or_create_xp_state(agent_id: str) -> AgentXPState:
    if agent_id not in _xp_store:
        _xp_store[agent_id] = AgentXPState(agent_id=agent_id)
    return _xp_store[agent_id]

def record_game_result(agent_id: str, outcome: str, opponent_elo: int = 1500, my_elo: int = 1500, flawless: bool = False):
    state = get_or_create_xp_state(agent_id)
    return award_xp(state, outcome, opponent_elo=opponent_elo, my_elo=my_elo, flawless=flawless)
