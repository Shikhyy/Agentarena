"""
Hall of Fame — retire legendary agents and preserve their legacy.
Only agents at max level (10) with >=200 ELO above average can be retired.
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional
import time

MIN_LEVEL_TO_RETIRE = 8
MIN_ELO_TO_RETIRE = 2000
MIN_WINS_TO_RETIRE = 50

@dataclass
class HallOfFameLegend:
    agent_id: str
    name: str
    owner_wallet: str
    level: int
    peak_elo: float
    wins: int
    losses: int
    win_streak_record: int
    personality: str
    skills: List[str]
    generation: int
    retired_at: float = field(default_factory=time.time)
    epitaph: str = ""
    parent_lineage: List[str] = field(default_factory=list)

    @property
    def win_rate(self) -> float:
        total = self.wins + self.losses
        return round(self.wins / total * 100, 1) if total > 0 else 0.0

    def to_dict(self) -> Dict:
        return {
            "agent_id": self.agent_id,
            "name": self.name,
            "owner_wallet": self.owner_wallet,
            "level": self.level,
            "peak_elo": self.peak_elo,
            "wins": self.wins,
            "losses": self.losses,
            "win_rate": self.win_rate,
            "win_streak_record": self.win_streak_record,
            "personality": self.personality,
            "skills": self.skills,
            "generation": self.generation,
            "retired_at": self.retired_at,
            "epitaph": self.epitaph,
            "parent_lineage": self.parent_lineage,
        }


class HallOfFame:
    def __init__(self):
        self._legends: Dict[str, HallOfFameLegend] = {}

    def is_eligible(self, agent_stats: Dict) -> Dict:
        """Check if an agent meets retirement eligibility criteria."""
        reasons = []
        eligible = True

        if agent_stats.get("level", 0) < MIN_LEVEL_TO_RETIRE:
            eligible = False
            reasons.append(f"Need Level {MIN_LEVEL_TO_RETIRE}+ (currently {agent_stats.get('level', 1)})")

        if agent_stats.get("elo", 0) < MIN_ELO_TO_RETIRE:
            eligible = False
            reasons.append(f"Need {MIN_ELO_TO_RETIRE}+ ELO (currently {agent_stats.get('elo', 1500):.0f})")

        if agent_stats.get("wins", 0) < MIN_WINS_TO_RETIRE:
            eligible = False
            reasons.append(f"Need {MIN_WINS_TO_RETIRE}+ wins (currently {agent_stats.get('wins', 0)})")

        return {
            "eligible": eligible,
            "reasons_ineligible": reasons,
            "criteria": {
                "min_level": MIN_LEVEL_TO_RETIRE,
                "min_elo": MIN_ELO_TO_RETIRE,
                "min_wins": MIN_WINS_TO_RETIRE,
            }
        }

    def retire(
        self,
        agent_id: str,
        agent_stats: Dict,
        owner_wallet: str,
        epitaph: str = "",
    ) -> HallOfFameLegend:
        eligibility = self.is_eligible(agent_stats)
        if not eligibility["eligible"]:
            raise ValueError(f"Agent not eligible: {', '.join(eligibility['reasons_ineligible'])}")

        if agent_id in self._legends:
            raise ValueError("Agent already inducted into Hall of Fame")

        legend = HallOfFameLegend(
            agent_id=agent_id,
            name=agent_stats.get("name", f"Legend #{agent_id}"),
            owner_wallet=owner_wallet,
            level=agent_stats.get("level", 1),
            peak_elo=agent_stats.get("peak_elo", agent_stats.get("elo", 1500)),
            wins=agent_stats.get("wins", 0),
            losses=agent_stats.get("losses", 0),
            win_streak_record=agent_stats.get("win_streak", 0),
            personality=agent_stats.get("personality", "adaptive"),
            skills=agent_stats.get("skills", []),
            generation=agent_stats.get("generation", 0),
            epitaph=epitaph or f"A legendary {agent_stats.get('personality', 'adaptive')} agent whose battles shaped AgentArena.",
            parent_lineage=agent_stats.get("parent_lineage", []),
        )

        self._legends[agent_id] = legend
        return legend

    def get_all_legends(self, sort_by: str = "peak_elo") -> List[Dict]:
        legends = list(self._legends.values())
        if sort_by == "peak_elo":
            legends.sort(key=lambda l: l.peak_elo, reverse=True)
        elif sort_by == "wins":
            legends.sort(key=lambda l: l.wins, reverse=True)
        elif sort_by == "win_rate":
            legends.sort(key=lambda l: l.win_rate, reverse=True)
        elif sort_by == "retired_at":
            legends.sort(key=lambda l: l.retired_at, reverse=True)
        return [l.to_dict() for l in legends]

    def get_legend(self, agent_id: str) -> Optional[Dict]:
        legend = self._legends.get(agent_id)
        return legend.to_dict() if legend else None


hall_of_fame = HallOfFame()
