"""
NFT Metadata Evolution — updates AgentNFT on-chain metadata after each game.
When a game completes, the NFT's XP, ELO, level, and win/loss record are updated.
"""

from dataclasses import dataclass, asdict
from typing import Dict, Optional, List
import json
import time

@dataclass
class AgentNFTMetadata:
    """On-chain NFT metadata following OpenSea ERC-721 standard."""
    name: str
    description: str
    image: str
    external_url: str
    attributes: List[Dict]
    background_color: str = "0f0a1a"

    @staticmethod
    def build(
        agent_id: str,
        name: str,
        level: int,
        elo: int,
        xp: int,
        wins: int,
        losses: int,
        win_streak: int,
        personality: str,
        skills: List[str],
        generation: int = 0,
        parent_a: Optional[str] = None,
        parent_b: Optional[str] = None,
        is_hall_of_fame: bool = False,
        is_retired: bool = False,
    ) -> "AgentNFTMetadata":
        desc = f"{personality.title()} AI agent competing in AgentArena. "
        if is_hall_of_fame:
            desc += " Hall of Fame Legend. "
        if parent_a and parent_b:
            desc += f"Gen {generation} offspring of agents {parent_a} and {parent_b}. "
        desc += f"ELO {elo} | Level {level} | {wins}W/{losses}L"

        attributes = [
            {"trait_type": "Level",         "value": level},
            {"trait_type": "ELO Rating",    "value": elo},
            {"trait_type": "XP",            "value": xp},
            {"trait_type": "Wins",          "value": wins},
            {"trait_type": "Losses",        "value": losses},
            {"trait_type": "Win Streak",    "value": win_streak},
            {"trait_type": "Personality",   "value": personality},
            {"trait_type": "Generation",    "value": generation},
        ]

        # Add skills as traits
        for skill in skills:
            attributes.append({"trait_type": "Skill", "value": skill})

        # Special badges
        if is_hall_of_fame:
            attributes.append({"trait_type": "Status", "value": "Hall of Fame Legend"})
            attributes.append({"trait_type": "Rarity", "value": "Legendary"})
        elif is_retired:
            attributes.append({"trait_type": "Status", "value": "Retired"})
        elif level >= 8:
            attributes.append({"trait_type": "Rarity", "value": "Epic"})
        elif level >= 5:
            attributes.append({"trait_type": "Rarity", "value": "Rare"})
        else:
            attributes.append({"trait_type": "Rarity", "value": "Common"})

        return AgentNFTMetadata(
            name=name,
            description=desc,
            image=f"https://agentarena.io/api/agents/{agent_id}/avatar?level={level}&personality={personality}",
            external_url=f"https://agentarena.io/agents/{agent_id}",
            attributes=attributes,
        )

    def to_json(self) -> str:
        return json.dumps(asdict(self), indent=2)


# ── Metadata Evolution Engine ─────────────────────────────────────

class NFTMetadataEvolver:
    """
    Tracks queued metadata updates. In production, these are submitted
    as Polygon transactions calling AgentNFT.setStats(tokenId, xp, elo, wins, losses).
    """

    def __init__(self):
        self._pending_updates: Dict[str, AgentNFTMetadata] = {}
        self._history: Dict[str, List[Dict]] = {}

    def evolve(
        self,
        agent_id: str,
        current_metadata: Dict,
        game_result: Dict,
    ) -> AgentNFTMetadata:
        """
        Update NFT metadata based on a completed game result.
        game_result: {outcome: "win"|"loss"|"draw", xp_gained, new_elo, level, ...}
        """
        # Track change history
        if agent_id not in self._history:
            self._history[agent_id] = []

        self._history[agent_id].append({
            "timestamp": time.time(),
            "change": game_result,
            "old_level": current_metadata.get("level", 1),
            "new_level": game_result.get("level", 1),
        })

        new_meta = AgentNFTMetadata.build(
            agent_id=agent_id,
            name=current_metadata.get("name", f"Agent #{agent_id}"),
            level=game_result.get("level", current_metadata.get("level", 1)),
            elo=int(game_result.get("new_elo", current_metadata.get("elo", 1500))),
            xp=game_result.get("total_xp", current_metadata.get("xp", 0)),
            wins=current_metadata.get("wins", 0) + (1 if game_result.get("outcome") == "win" else 0),
            losses=current_metadata.get("losses", 0) + (1 if game_result.get("outcome") == "loss" else 0),
            win_streak=game_result.get("win_streak", 0),
            personality=current_metadata.get("personality", "adaptive"),
            skills=current_metadata.get("skills", []),
            generation=current_metadata.get("generation", 0),
            parent_a=current_metadata.get("parent_a"),
            parent_b=current_metadata.get("parent_b"),
            is_hall_of_fame=current_metadata.get("is_hall_of_fame", False),
            is_retired=current_metadata.get("is_retired", False),
        )

        self._pending_updates[agent_id] = new_meta
        return new_meta

    def flush_pending(self) -> List[Dict]:
        """Return all pending updates and clear the queue."""
        updates = [
            {"agent_id": aid, "metadata": meta.to_json()}
            for aid, meta in self._pending_updates.items()
        ]
        self._pending_updates.clear()
        return updates

    def get_evolution_history(self, agent_id: str) -> List[Dict]:
        return self._history.get(agent_id, [])


nft_evolver = NFTMetadataEvolver()
