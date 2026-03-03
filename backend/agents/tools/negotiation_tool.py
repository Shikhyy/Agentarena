"""
ADK Negotiation Tool — evaluates Monopoly trade offers and generates counter-offers.
Used by the MonopolyAgent to reason about property trades.
"""

from typing import Optional
import google.generativeai as genai
from config import settings

# Property base values (approximate Manhattan prices scaled)
PROPERTY_VALUES = {
    # Brown
    "Mediterranean Avenue": 60, "Baltic Avenue": 60,
    # Light Blue
    "Oriental Avenue": 100, "Vermont Avenue": 100, "Connecticut Avenue": 120,
    # Pink
    "St. Charles Place": 140, "States Avenue": 140, "Virginia Avenue": 160,
    # Orange
    "St. James Place": 180, "Tennessee Avenue": 180, "New York Avenue": 200,
    # Red
    "Kentucky Avenue": 220, "Indiana Avenue": 220, "Illinois Avenue": 240,
    # Yellow
    "Atlantic Avenue": 260, "Ventnor Avenue": 260, "Marvin Gardens": 280,
    # Green
    "Pacific Avenue": 300, "North Carolina Avenue": 300, "Pennsylvania Avenue": 320,
    # Dark Blue
    "Park Place": 350, "Boardwalk": 400,
    # Railroads & Utilities
    "Reading Railroad": 200, "Pennsylvania Railroad": 200,
    "B&O Railroad": 200, "Short Line": 200,
    "Electric Company": 150, "Water Works": 150,
}

COLOR_GROUPS = {
    "brown": ["Mediterranean Avenue", "Baltic Avenue"],
    "light_blue": ["Oriental Avenue", "Vermont Avenue", "Connecticut Avenue"],
    "pink": ["St. Charles Place", "States Avenue", "Virginia Avenue"],
    "orange": ["St. James Place", "Tennessee Avenue", "New York Avenue"],
    "red": ["Kentucky Avenue", "Indiana Avenue", "Illinois Avenue"],
    "yellow": ["Atlantic Avenue", "Ventnor Avenue", "Marvin Gardens"],
    "green": ["Pacific Avenue", "North Carolina Avenue", "Pennsylvania Avenue"],
    "dark_blue": ["Park Place", "Boardwalk"],
    "railroads": ["Reading Railroad", "Pennsylvania Railroad", "B&O Railroad", "Short Line"],
    "utilities": ["Electric Company", "Water Works"],
}


def get_property_group(property_name: str) -> Optional[str]:
    for group, props in COLOR_GROUPS.items():
        if property_name in props:
            return group
    return None


def evaluate_trade(
    my_offer: dict,      # {"properties": [...], "cash": int}
    their_offer: dict,   # {"properties": [...], "cash": int}
    my_properties: list,
    their_properties: list,
) -> dict:
    """
    Evaluate a trade offer and return:
    - fairness_score: -1 (losing bad) to +1 (winning)
    - strategic_score: does this help complete a color set?
    - recommendation: "accept", "reject", "counter"
    - reasoning: brief explanation
    """
    # Calculate raw values
    my_giving_value = sum(PROPERTY_VALUES.get(p, 100) for p in my_offer.get("properties", [])) + my_offer.get("cash", 0)
    i_receive_value = sum(PROPERTY_VALUES.get(p, 100) for p in their_offer.get("properties", [])) + their_offer.get("cash", 0)

    fairness_score = (i_receive_value - my_giving_value) / max(my_giving_value + i_receive_value, 1)

    # Strategic: check if trade completes color sets
    strategic_bonus = 0
    after_my_properties = (
        [p for p in my_properties if p not in my_offer.get("properties", [])]
        + their_offer.get("properties", [])
    )

    for group, group_props in COLOR_GROUPS.items():
        if all(p in after_my_properties for p in group_props):
            strategic_bonus += 0.4  # Complete set = huge bonus

    strategic_score = min(1.0, fairness_score + strategic_bonus)

    if strategic_score > 0.15:
        recommendation = "accept"
    elif strategic_score > -0.15:
        recommendation = "counter"
    else:
        recommendation = "reject"

    return {
        "fairness_score": round(fairness_score, 3),
        "strategic_score": round(strategic_score, 3),
        "my_giving_value": my_giving_value,
        "i_receive_value": i_receive_value,
        "recommendation": recommendation,
        "reasoning": (
            f"Giving ${my_giving_value}, receiving ${i_receive_value}. "
            f"{'Set completion bonus applied.' if strategic_bonus > 0 else 'No color set completed.'}"
        )
    }


def generate_counter_offer(
    original_offer: dict,
    evaluation: dict,
    my_properties: list,
    my_cash: int,
    personality: str = "adaptive",
) -> dict:
    """
    Generate a counter-offer based on evaluation and agent personality.
    """
    gap = evaluation["my_giving_value"] - evaluation["i_receive_value"]

    # Aggressive agents ask for more; conservative ask for fair value
    ask_multiplier = {
        "aggressive": 1.3,
        "conservative": 1.05,
        "adaptive": 1.15,
        "unpredictable": 0.9 + 0.5,  # might go lower or higher
        "chaos": 1.6,
    }.get(personality, 1.15)

    counter_cash_request = int(abs(gap) * ask_multiplier)
    counter_cash_offer = max(0, my_cash - counter_cash_request)

    return {
        "properties": original_offer.get("properties", []),
        "cash": counter_cash_offer,
        "message": (
            f"I appreciate the offer but need at least ${counter_cash_request} more "
            f"to make this work. Here's my counter."
        )
    }


class NegotiationTool:
    """ADK-compatible tool for Monopoly trade negotiation."""

    name = "negotiate_trade"
    description = "Evaluate a Monopoly trade offer and generate an accept/reject/counter decision."

    def run(
        self,
        my_offer_properties: list,
        my_offer_cash: int,
        their_offer_properties: list,
        their_offer_cash: int,
        my_current_properties: list,
        my_cash: int,
        personality: str = "adaptive",
    ) -> dict:
        eval_result = evaluate_trade(
            my_offer={"properties": my_offer_properties, "cash": my_offer_cash},
            their_offer={"properties": their_offer_properties, "cash": their_offer_cash},
            my_properties=my_current_properties,
            their_properties=[],
        )

        result = {"evaluation": eval_result}

        if eval_result["recommendation"] == "counter":
            counter = generate_counter_offer(
                original_offer={"properties": my_offer_properties, "cash": their_offer_cash},
                evaluation=eval_result,
                my_properties=my_current_properties,
                my_cash=my_cash,
                personality=personality,
            )
            result["counter_offer"] = counter

        return result


negotiation_tool = NegotiationTool()
