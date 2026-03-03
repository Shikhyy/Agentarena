"""
Bloodline Breeding — Combine two owned agents into a hybrid offspring.
"""

import random
import math
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict

BREEDING_FEE_PERCENT = 5.0      # 5% fee on wager amount
MAX_OFFSPRING_SKILLS = 3        # offspring can inherit up to 3 skills
TRAIT_MUTATION_RATE = 0.12      # 12% chance each trait mutates slightly
TRAIT_NAMES = ["aggression", "risk_tolerance", "bluff_frequency", "adaptability", "creativity"]

@dataclass
class AgentTraits:
    aggression:      float = 0.5  # 0=passive, 1=aggressive
    risk_tolerance:  float = 0.5
    bluff_frequency: float = 0.3
    adaptability:    float = 0.5
    creativity:      float = 0.5

@dataclass
class AgentProfile:
    agent_id: str
    name: str
    level: int = 1
    elo: float = 1500
    traits: AgentTraits = None
    skills: List[str] = None
    parent_a: Optional[str] = None
    parent_b: Optional[str] = None
    generation: int = 0

    def __post_init__(self):
        if self.traits is None:
            self.traits = AgentTraits()
        if self.skills is None:
            self.skills = []


def _blend_trait(trait_a: float, trait_b: float, bias: float = 0.5) -> float:
    """Weighted blend of two trait values with optional mutation."""
    blended = trait_a * bias + trait_b * (1 - bias)
    # Mutation
    if random.random() < TRAIT_MUTATION_RATE:
        mutation = random.gauss(0, 0.1)
        blended = max(0.0, min(1.0, blended + mutation))
    return round(blended, 3)


def breed_agents(
    parent_a: AgentProfile,
    parent_b: AgentProfile,
    offspring_name: str,
    bias_toward_a: float = 0.5,  # 0.5 = equal; 0.7 = more like parent A
) -> AgentProfile:
    """
    Combine two agents to produce a hybrid offspring.
    Stats, traits, and skills are inherited proportionally.
    """
    # Blend each personality trait
    offspring_traits = AgentTraits(
        aggression=_blend_trait(parent_a.traits.aggression, parent_b.traits.aggression, bias_toward_a),
        risk_tolerance=_blend_trait(parent_a.traits.risk_tolerance, parent_b.traits.risk_tolerance, bias_toward_a),
        bluff_frequency=_blend_trait(parent_a.traits.bluff_frequency, parent_b.traits.bluff_frequency, bias_toward_a),
        adaptability=_blend_trait(parent_a.traits.adaptability, parent_b.traits.adaptability, bias_toward_a),
        creativity=_blend_trait(parent_a.traits.creativity, parent_b.traits.creativity, bias_toward_a),
    )

    # Inherit skills: pick from union of both parents' skills, up to MAX_OFFSPRING_SKILLS
    combined_skills = list(set(parent_a.skills + parent_b.skills))
    random.shuffle(combined_skills)
    inherited_skills = combined_skills[:MAX_OFFSPRING_SKILLS]

    # Starting ELO regresses to mean of parents (floor at 1200)
    offspring_elo = max(1200.0, (parent_a.elo + parent_b.elo) / 2 - 100)

    # Generation is one more than the max parent generation
    generation = max(parent_a.generation, parent_b.generation) + 1

    offspring = AgentProfile(
        agent_id=f"offspring_{parent_a.agent_id}_{parent_b.agent_id}_{random.randint(1000, 9999)}",
        name=offspring_name,
        level=1,
        elo=offspring_elo,
        traits=offspring_traits,
        skills=inherited_skills,
        parent_a=parent_a.agent_id,
        parent_b=parent_b.agent_id,
        generation=generation,
    )

    return offspring


def calculate_breeding_fee(wager_amount: float) -> float:
    """Returns the fee taken from the wager for breeding."""
    return wager_amount * (BREEDING_FEE_PERCENT / 100)


def traits_to_dict(profile: AgentProfile) -> Dict:
    """Serialize an agent profile to dict for API responses / NFT metadata."""
    return {
        "agent_id": profile.agent_id,
        "name": profile.name,
        "level": profile.level,
        "elo": profile.elo,
        "traits": asdict(profile.traits),
        "skills": profile.skills,
        "lineage": {
            "parent_a": profile.parent_a,
            "parent_b": profile.parent_b,
            "generation": profile.generation,
        }
    }
