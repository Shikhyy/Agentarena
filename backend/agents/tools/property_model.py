"""
Property Value ML Model — estimates Monopoly property values based on game state.
Uses a simple heuristic model (Vertex AI AutoML replacement for Phase 2 scope).
In production: train an AutoML tabular model on simulated game state data.
"""

import math
from typing import Dict, List, Optional

# ── Feature engineering ───────────────────────────────────────────

def estimate_property_value(
    property_name: str,
    base_price: int,
    houses: int = 0,
    hotel: bool = False,
    owns_color_set: bool = False,
    num_opponents: int = 1,
    rounds_remaining: int = 50,
    opponent_cash: int = 1500,
) -> Dict:
    """
    Estimate the strategic value of a property in the current game state.
    Returns: adjusted_value, rent_income, development_roi, buy_recommendation
    """
    # Base value
    adjusted = base_price

    # Color set multiplier (owning color set doubles rent earnings)
    if owns_color_set:
        adjusted *= 2.2

    # Development value
    if hotel:
        adjusted *= 4.0
        houses = 5
    elif houses > 0:
        adjusted *= (1 + houses * 0.6)

    # Traffic multiplier: more opponents = more likely to be landed on
    traffic_mult = 1 + (num_opponents - 1) * 0.15
    adjusted *= traffic_mult

    # Time value: early game = more valuable (more rounds to earn back)
    time_mult = min(2.0, max(0.5, rounds_remaining / 40))
    adjusted *= time_mult

    # Estimate monthly rent (approximate)
    rent_table = {0: 0.06, 1: 0.25, 2: 0.45, 3: 0.65, 4: 0.85, 5: 1.0}
    rent_as_pct = rent_table.get(houses if not hotel else 5, 0.06)
    base_rent = base_price * rent_as_pct
    expected_rent = base_rent * traffic_mult

    # ROI of building a house (if not yet developed)
    house_cost = base_price * 0.5  # simplified
    roi = (expected_rent - base_rent) / house_cost if house_cost > 0 else 0

    # Buy recommendation
    buy_score = adjusted / (opponent_cash + 1) * 100
    buy_recommendation = "strong_buy" if buy_score > 25 else "buy" if buy_score > 10 else "hold"

    return {
        "property": property_name,
        "base_price": base_price,
        "adjusted_value": round(adjusted),
        "expected_rent_per_landing": round(expected_rent),
        "development_roi": round(roi, 3),
        "buy_recommendation": buy_recommendation,
        "factors": {
            "owns_color_set": owns_color_set,
            "houses": houses,
            "hotel": hotel,
            "traffic_multiplier": round(traffic_mult, 2),
            "time_multiplier": round(time_mult, 2),
        }
    }


def rank_properties_to_buy(
    available_properties: List[str],
    property_prices: Dict[str, int],
    my_properties: List[str],
    game_state: Dict,
    budget: int,
) -> List[Dict]:
    """
    Rank all available properties by strategic value.
    Returns sorted list of recommendations within budget.
    """
    rankings = []

    from agents.tools.negotiation_tool import COLOR_GROUPS
    # Build ownership map for color set detection
    for prop in available_properties:
        price = property_prices.get(prop, 150)
        if price > budget:
            continue

        # Detect if buying this would complete a color set
        group = None
        for g, members in COLOR_GROUPS.items():
            if prop in members:
                group = g
                group_members = members
                break

        will_complete_set = False
        if group:
            owned_in_group = [p for p in group_members if p in my_properties or p == prop]
            will_complete_set = len(owned_in_group) == len(group_members)

        valuation = estimate_property_value(
            property_name=prop,
            base_price=price,
            owns_color_set=will_complete_set,
            num_opponents=game_state.get("num_players", 2) - 1,
            rounds_remaining=game_state.get("rounds_remaining", 40),
            opponent_cash=game_state.get("avg_opponent_cash", 1500),
        )
        valuation["will_complete_set"] = will_complete_set
        rankings.append(valuation)

    return sorted(rankings, key=lambda x: x["adjusted_value"], reverse=True)


class PropertyValueModel:
    """Vertex AI AutoML-compatible interface for property valuation."""

    def predict(self, features: Dict) -> Dict:
        return estimate_property_value(**features)

    def batch_rank(self, available_properties, property_prices, my_properties, game_state, budget) -> List[Dict]:
        return rank_properties_to_buy(available_properties, property_prices, my_properties, game_state, budget)


property_model = PropertyValueModel()
