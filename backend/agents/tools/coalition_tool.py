"""
Coalition-building mechanics for multi-player Monopoly games.
Agents can form temporary alliances to neutralize a dominant opponent.
"""

from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field
from enum import Enum

class CoalitionStatus(Enum):
    PROPOSED = "proposed"
    ACTIVE = "active"
    DISSOLVED = "dissolved"
    BETRAYED = "betrayed"

@dataclass
class Coalition:
    coalition_id: str
    members: List[str]            # agent_id list
    target: str                   # agent_id being countered
    status: CoalitionStatus = CoalitionStatus.PROPOSED
    created_at_round: int = 0
    agreement: Dict = field(default_factory=dict)
    turn_count: int = 0    # rounds since activated
    max_turns: int = 10    # dissolves after this many rounds

@dataclass
class TrustLedger:
    """Tracks promise-keeping history between agents."""
    from_agent: str
    to_agent: str
    promises_kept: int = 0
    promises_broken: int = 0

    @property
    def trust_score(self) -> float:
        total = self.promises_kept + self.promises_broken
        return self.promises_kept / total if total > 0 else 0.5


# ── Coalition Manager ─────────────────────────────────────────────

class CoalitionManager:
    def __init__(self):
        self.coalitions: Dict[str, Coalition] = {}
        self.trust_ledger: Dict[Tuple[str,str], TrustLedger] = {}
        self._next_id = 0

    def _new_id(self) -> str:
        self._next_id += 1
        return f"coalition_{self._next_id}"

    def get_trust(self, from_agent: str, to_agent: str) -> float:
        key = (from_agent, to_agent)
        if key not in self.trust_ledger:
            self.trust_ledger[key] = TrustLedger(from_agent, to_agent)
        return self.trust_ledger[key].trust_score

    def propose_coalition(
        self,
        proposer: str,
        partners: List[str],
        target: str,
        agreement: Dict,
        current_round: int,
    ) -> Coalition:
        """Form a new coalition to counter a dominant player."""
        coalition = Coalition(
            coalition_id=self._new_id(),
            members=[proposer] + partners,
            target=target,
            status=CoalitionStatus.PROPOSED,
            created_at_round=current_round,
            agreement=agreement,
        )
        self.coalitions[coalition.coalition_id] = coalition
        return coalition

    def accept_coalition(self, coalition_id: str, agent_id: str) -> bool:
        c = self.coalitions.get(coalition_id)
        if c and agent_id in c.members and c.status == CoalitionStatus.PROPOSED:
            c.status = CoalitionStatus.ACTIVE
            return True
        return False

    def should_form_coalition(
        self,
        my_net_worth: int,
        opponent_net_worth: int,
        threshold: float = 1.5,
    ) -> bool:
        """Returns True if an opponent is dominant enough to warrant coalition."""
        return opponent_net_worth > my_net_worth * threshold

    def handle_coalition_action(self, coalition_id: str, acting_agent: str, action_type: str) -> Dict:
        """
        Process coalition-relevant actions (rent relief, blocked auctions, shared intel).
        action_types: "rent_relief", "auction_block", "info_share"
        """
        c = self.coalitions.get(coalition_id)
        if not c or c.status != CoalitionStatus.ACTIVE:
            return {"applied": False, "reason": "coalition not active"}

        c.turn_count += 1
        if c.turn_count >= c.max_turns:
            c.status = CoalitionStatus.DISSOLVED
            return {"applied": False, "reason": "coalition expired"}

        if action_type == "rent_relief":
            # Members pay reduced rent to each other
            return {"applied": True, "modifier": 0.5, "description": "Coalition rent relief: 50% rent between members"}

        elif action_type == "auction_block":
            # Members coordinate to not outbid each other
            return {"applied": True, "description": "Coalition auction pact: members will not outbid each other"}

        elif action_type == "info_share":
            # Members share hidden information
            return {"applied": True, "description": f"Intel shared with coalition members"}

        return {"applied": False}

    def betray(self, coalition_id: str, betrayer: str) -> Dict:
        """An agent defects from a coalition."""
        c = self.coalitions.get(coalition_id)
        if not c:
            return {"success": False}

        c.status = CoalitionStatus.BETRAYED
        # Record betrayal in trust ledger for future negotiations
        for member in c.members:
            if member != betrayer:
                key = (member, betrayer)
                if key not in self.trust_ledger:
                    self.trust_ledger[key] = TrustLedger(member, betrayer)
                self.trust_ledger[key].promises_broken += 2

        return {"success": True, "betrayer": betrayer, "former_coalition": coalition_id}

    def evaluate_coalition_opportunity(
        self,
        my_agent_id: str,
        all_net_worths: Dict[str, int],
        personality: str = "adaptive",
    ) -> Optional[Dict]:
        """
        Suggest whether this agent should propose a coalition and against whom.
        Returns a suggestion dict or None if no coalition needed.
        """
        my_worth = all_net_worths.get(my_agent_id, 0)
        if my_worth == 0:
            return None

        # Find the wealthiest opponent
        opponents = {aid: worth for aid, worth in all_net_worths.items() if aid != my_agent_id}
        if not opponents:
            return None

        richest_id = max(opponents, key=opponents.get)
        richest_worth = opponents[richest_id]

        # Personality affects coalition threshold
        thresholds = {
            "aggressive": 1.3,
            "conservative": 2.0,
            "adaptive": 1.6,
            "unpredictable": 1.4,
            "chaos": 1.1,
        }
        threshold = thresholds.get(personality, 1.6)

        if self.should_form_coalition(my_worth, richest_worth, threshold):
            potential_partners = [
                aid for aid, worth in opponents.items()
                if aid != richest_id and worth < richest_worth * 0.9
            ]
            return {
                "recommend": True,
                "target": richest_id,
                "target_net_worth": richest_worth,
                "my_net_worth": my_worth,
                "suggested_partners": potential_partners,
                "reason": f"{richest_id} dominates with ${richest_worth:,} vs my ${my_worth:,}"
            }

        return {"recommend": False, "reason": "No dominant opponent detected"}


coalition_manager = CoalitionManager()
