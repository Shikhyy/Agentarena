import math
from typing import Dict, Any

class LiveOddsEngine:
    def __init__(self):
        # Base probabilities before the game starts (can be fetched from ELO in the future)
        # 0: Agent A, 1: Agent B
        self.base_win_probs: Dict[str, Dict[int, float]] = {}
        
    def initialize_arena(self, arena_id: str, prob_a: float = 0.5):
        """Sets the starting odds before the match begins."""
        self.base_win_probs[arena_id] = {
            0: prob_a,
            1: 1.0 - prob_a
        }
        
    def bayesian_update(self, arena_id: str, new_evidence: Dict[str, Any]):
        """
        Updates the win probability based on live game events.
        new_evidence format: {"position": 0, "advantage_score": 1.2} # 1.2x multiplier for A
        """
        if arena_id not in self.base_win_probs:
            self.initialize_arena(arena_id)
            
        current_probs = self.base_win_probs[arena_id]
        
        # Simple Bayesian Approximation: 
        # P(A|Evidence) = [P(Evidence|A) * P(A)] / P(Evidence)
        # Here we use an advantage multiplier (e.g., Chess Engine evaluation +1.5 pawns)
        adv_pos = new_evidence["position"]
        multiplier = new_evidence.get("advantage_score", 1.0)
        
        # Scale the favored position
        scaled_favored = current_probs[adv_pos] * multiplier
        other_pos = 1 if adv_pos == 0 else 0
        
        # Normalize back to 1.0
        total = scaled_favored + current_probs[other_pos]
        
        self.base_win_probs[arena_id][adv_pos] = scaled_favored / total
        self.base_win_probs[arena_id][other_pos] = current_probs[other_pos] / total
        
        return self.base_win_probs[arena_id]

    def kelly_criterion(self, win_prob: float, odds_offered: float) -> float:
        """
        Calculates the optimal fraction of a bankroll to bet.
        f* = (bp - q) / b
        where:
        p = probability of winning
        q = probability of losing (1 - p)
        b = decimal odds - 1 (the multiple of the bet you win)
        """
        if win_prob <= 0 or win_prob >= 1.0:
            return 0.0
            
        p = win_prob
        q = 1.0 - p
        b = odds_offered - 1.0
        
        if b <= 0:
            return 0.0 # Cannot divide by zero or negative odds
            
        fk = (b * p - q) / b
        
        # Return 0 if the edge is negative (dont bet)
        return max(0.0, fk)
        
    def get_american_odds(self, win_prob: float) -> int:
        """Converts raw probability to American Odds (+150, -120) for display."""
        if win_prob <= 0:
            return 10000
        if win_prob >= 1.0:
            return -10000
            
        if win_prob >= 0.5:
            return int(-100 * (win_prob / (1.0 - win_prob)))
        else:
            return int(100 * ((1.0 - win_prob) / win_prob))
            
    def get_current_state(self, arena_id: str) -> Dict[str, Any]:
        """Returns the full odds package for the frontend."""
        if arena_id not in self.base_win_probs:
            self.initialize_arena(arena_id)
            
        probs = self.base_win_probs[arena_id]
        
        return {
            "agent_a": {
                "probability": probs[0],
                "american_odds": self.get_american_odds(probs[0]),
                "suggested_kelly_fraction": self.kelly_criterion(probs[0], 1.0 / probs[0] if probs[0] > 0 else 1.0) # Using fair odds for Kelly example
            },
            "agent_b": {
                "probability": probs[1],
                "american_odds": self.get_american_odds(probs[1]),
                "suggested_kelly_fraction": self.kelly_criterion(probs[1], 1.0 / probs[1] if probs[1] > 0 else 1.0)
            }
        }

odds_engine = LiveOddsEngine()
