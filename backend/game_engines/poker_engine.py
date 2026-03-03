"""
AgentArena — Texas Hold'em Poker Engine
2-6 player support, full betting rounds, hand evaluation.
"""

import random
import uuid
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field
from enum import IntEnum
from datetime import datetime
from itertools import combinations


# ─── Card System ────────────────────────────────────────────────────
class Suit(IntEnum):
    HEARTS = 0
    DIAMONDS = 1
    CLUBS = 2
    SPADES = 3

SUIT_SYMBOLS = {Suit.HEARTS: "♥", Suit.DIAMONDS: "♦", Suit.CLUBS: "♣", Suit.SPADES: "♠"}
RANK_NAMES = {
    2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 8: "8",
    9: "9", 10: "10", 11: "J", 12: "Q", 13: "K", 14: "A",
}


@dataclass
class Card:
    rank: int  # 2-14 (14=Ace)
    suit: Suit

    def __str__(self):
        return f"{RANK_NAMES[self.rank]}{SUIT_SYMBOLS[self.suit]}"

    def to_dict(self):
        return {"rank": self.rank, "suit": self.suit.name, "display": str(self)}


class Deck:
    def __init__(self):
        self.cards = [Card(rank, suit) for suit in Suit for rank in range(2, 15)]
        random.shuffle(self.cards)

    def deal(self, count: int = 1) -> List[Card]:
        dealt = self.cards[:count]
        self.cards = self.cards[count:]
        return dealt


# ─── Hand Evaluation ───────────────────────────────────────────────
class HandRank(IntEnum):
    HIGH_CARD = 0
    PAIR = 1
    TWO_PAIR = 2
    THREE_OF_A_KIND = 3
    STRAIGHT = 4
    FLUSH = 5
    FULL_HOUSE = 6
    FOUR_OF_A_KIND = 7
    STRAIGHT_FLUSH = 8
    ROYAL_FLUSH = 9


HAND_NAMES = {
    HandRank.HIGH_CARD: "High Card",
    HandRank.PAIR: "Pair",
    HandRank.TWO_PAIR: "Two Pair",
    HandRank.THREE_OF_A_KIND: "Three of a Kind",
    HandRank.STRAIGHT: "Straight",
    HandRank.FLUSH: "Flush",
    HandRank.FULL_HOUSE: "Full House",
    HandRank.FOUR_OF_A_KIND: "Four of a Kind",
    HandRank.STRAIGHT_FLUSH: "Straight Flush",
    HandRank.ROYAL_FLUSH: "Royal Flush",
}


def evaluate_hand(cards: List[Card]) -> Tuple[HandRank, List[int]]:
    """Evaluate the best 5-card hand from any set of cards. Returns (rank, kickers)."""
    if len(cards) < 5:
        return HandRank.HIGH_CARD, sorted([c.rank for c in cards], reverse=True)

    best_rank = HandRank.HIGH_CARD
    best_kickers: List[int] = []

    for combo in combinations(cards, 5):
        rank, kickers = _evaluate_five(list(combo))
        if rank > best_rank or (rank == best_rank and kickers > best_kickers):
            best_rank = rank
            best_kickers = kickers

    return best_rank, best_kickers


def _evaluate_five(cards: List[Card]) -> Tuple[HandRank, List[int]]:
    """Evaluate exactly 5 cards."""
    ranks = sorted([c.rank for c in cards], reverse=True)
    suits = [c.suit for c in cards]

    is_flush = len(set(suits)) == 1
    is_straight = (ranks[0] - ranks[4] == 4 and len(set(ranks)) == 5) or ranks == [14, 5, 4, 3, 2]

    # Handle Ace-low straight
    if ranks == [14, 5, 4, 3, 2]:
        ranks = [5, 4, 3, 2, 1]
        is_straight = True

    rank_counts: Dict[int, int] = {}
    for r in ranks:
        rank_counts[r] = rank_counts.get(r, 0) + 1

    counts = sorted(rank_counts.values(), reverse=True)
    count_keys = sorted(rank_counts.keys(), key=lambda x: (rank_counts[x], x), reverse=True)

    if is_straight and is_flush:
        if ranks[0] == 14 and ranks[1] == 13:
            return HandRank.ROYAL_FLUSH, ranks
        return HandRank.STRAIGHT_FLUSH, ranks

    if counts == [4, 1]:
        return HandRank.FOUR_OF_A_KIND, count_keys
    if counts == [3, 2]:
        return HandRank.FULL_HOUSE, count_keys
    if is_flush:
        return HandRank.FLUSH, ranks
    if is_straight:
        return HandRank.STRAIGHT, ranks
    if counts == [3, 1, 1]:
        return HandRank.THREE_OF_A_KIND, count_keys
    if counts == [2, 2, 1]:
        return HandRank.TWO_PAIR, count_keys
    if counts == [2, 1, 1, 1]:
        return HandRank.PAIR, count_keys

    return HandRank.HIGH_CARD, ranks


# ─── Player & Game State ───────────────────────────────────────────
@dataclass
class PokerPlayer:
    player_id: str
    agent_config: dict
    chips: int = 1000
    hole_cards: List[Card] = field(default_factory=list)
    current_bet: int = 0
    total_bet_this_round: int = 0
    is_folded: bool = False
    is_all_in: bool = False

    def to_dict(self, reveal: bool = False) -> dict:
        return {
            "player_id": self.player_id,
            "agent": self.agent_config,
            "chips": self.chips,
            "current_bet": self.current_bet,
            "is_folded": self.is_folded,
            "is_all_in": self.is_all_in,
            "hole_cards": [c.to_dict() for c in self.hole_cards] if reveal else ["🂠", "🂠"],
        }


@dataclass
class PokerGame:
    game_id: str
    players: List[PokerPlayer]
    deck: Deck = field(default_factory=Deck)
    community_cards: List[Card] = field(default_factory=list)
    pot: int = 0
    status: str = "waiting"  # waiting, preflop, flop, turn, river, showdown, finished
    current_player_idx: int = 0
    dealer_idx: int = 0
    small_blind: int = 5
    big_blind: int = 10
    action_history: List[dict] = field(default_factory=list)
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    winner: Optional[str] = None
    min_raise: int = 10

    def to_dict(self, reveal_all: bool = False) -> dict:
        return {
            "game_id": self.game_id,
            "status": self.status,
            "pot": self.pot,
            "community_cards": [c.to_dict() for c in self.community_cards],
            "players": [p.to_dict(reveal=reveal_all or self.status == "showdown") for p in self.players],
            "current_player": self.players[self.current_player_idx].player_id if self.status not in ("finished", "showdown", "waiting") else None,
            "dealer": self.players[self.dealer_idx].player_id,
            "small_blind": self.small_blind,
            "big_blind": self.big_blind,
            "action_history": self.action_history[-10:],
            "created_at": self.created_at,
            "winner": self.winner,
        }


# ─── Poker Engine ──────────────────────────────────────────────────
class PokerEngine:
    """Manages Texas Hold'em poker games."""

    def __init__(self):
        self.games: Dict[str, PokerGame] = {}

    def create_game(self, players: List[dict], starting_chips: int = 1000) -> PokerGame:
        """Create a new poker game."""
        game_id = str(uuid.uuid4())[:8]
        poker_players = [
            PokerPlayer(player_id=f"p{i}", agent_config=p, chips=starting_chips)
            for i, p in enumerate(players)
        ]
        game = PokerGame(game_id=game_id, players=poker_players)
        self.games[game_id] = game
        return game

    def start_hand(self, game_id: str) -> dict:
        """Start a new hand: post blinds and deal hole cards."""
        game = self.games.get(game_id)
        if not game:
            return {"error": "Game not found"}

        # Reset for new hand
        game.deck = Deck()
        game.community_cards = []
        game.pot = 0
        game.action_history = []

        for player in game.players:
            player.hole_cards = []
            player.current_bet = 0
            player.total_bet_this_round = 0
            player.is_folded = False
            player.is_all_in = False

        # Post blinds
        sb_idx = (game.dealer_idx + 1) % len(game.players)
        bb_idx = (game.dealer_idx + 2) % len(game.players)

        self._post_blind(game, sb_idx, game.small_blind)
        self._post_blind(game, bb_idx, game.big_blind)

        # Deal hole cards
        for player in game.players:
            player.hole_cards = game.deck.deal(2)

        game.status = "preflop"
        game.current_player_idx = (bb_idx + 1) % len(game.players)
        game.min_raise = game.big_blind

        return {
            "success": True,
            "game_state": game.to_dict(),
            "drama_score": 3,
            "commentary_hint": "Cards are dealt! The tension begins...",
        }

    def _post_blind(self, game: PokerGame, player_idx: int, amount: int):
        player = game.players[player_idx]
        actual = min(amount, player.chips)
        player.chips -= actual
        player.current_bet = actual
        player.total_bet_this_round = actual
        game.pot += actual
        if player.chips == 0:
            player.is_all_in = True

    def take_action(self, game_id: str, player_id: str, action: str, amount: int = 0) -> dict:
        """
        Process a player action: fold, check, call, raise, all_in.
        """
        game = self.games.get(game_id)
        if not game:
            return {"error": "Game not found"}

        player = game.players[game.current_player_idx]
        if player.player_id != player_id:
            return {"error": f"Not {player_id}'s turn"}
        if player.is_folded:
            return {"error": "Player has folded"}

        current_max_bet = max(p.current_bet for p in game.players if not p.is_folded)
        drama_score = 2
        commentary_hint = ""

        if action == "fold":
            player.is_folded = True
            commentary_hint = f"{player.agent_config.get('name', player_id)} FOLDS! They couldn't take the heat!"
            drama_score = 4

        elif action == "check":
            if player.current_bet < current_max_bet:
                return {"error": "Cannot check — must call or raise"}
            commentary_hint = f"{player.agent_config.get('name', player_id)} checks. Playing it cool."

        elif action == "call":
            call_amount = current_max_bet - player.current_bet
            if call_amount > player.chips:
                call_amount = player.chips
                player.is_all_in = True
            player.chips -= call_amount
            player.current_bet += call_amount
            player.total_bet_this_round += call_amount
            game.pot += call_amount
            commentary_hint = f"{player.agent_config.get('name', player_id)} calls {call_amount}!"
            drama_score = 3

        elif action == "raise":
            if amount < game.min_raise + current_max_bet:
                return {"error": f"Raise must be at least {game.min_raise + current_max_bet}"}
            raise_amount = amount - player.current_bet
            if raise_amount > player.chips:
                raise_amount = player.chips
                player.is_all_in = True
            player.chips -= raise_amount
            player.current_bet += raise_amount
            player.total_bet_this_round += raise_amount
            game.pot += raise_amount
            game.min_raise = amount - current_max_bet
            commentary_hint = f"{player.agent_config.get('name', player_id)} RAISES to {amount}! Bold move!"
            drama_score = 6

        elif action == "all_in":
            all_in_amount = player.chips
            player.current_bet += all_in_amount
            player.total_bet_this_round += all_in_amount
            game.pot += all_in_amount
            player.chips = 0
            player.is_all_in = True
            commentary_hint = f"{player.agent_config.get('name', player_id)} goes ALL IN! {all_in_amount} chips on the line!!"
            drama_score = 9

        else:
            return {"error": f"Unknown action: {action}"}

        # Record action
        game.action_history.append({
            "player_id": player_id,
            "action": action,
            "amount": amount if action in ("raise", "all_in") else 0,
            "pot_after": game.pot,
        })

        # Advance to next active player
        self._advance_turn(game)

        # Check if round is over
        if self._is_betting_round_over(game):
            self._next_round(game)

        # Check for single remaining player
        active = [p for p in game.players if not p.is_folded]
        if len(active) == 1:
            game.status = "finished"
            game.winner = active[0].player_id
            active[0].chips += game.pot
            commentary_hint = f"{active[0].agent_config.get('name', active[0].player_id)} wins the pot of {game.pot}! Everyone else folded!"
            drama_score = 7

        return {
            "success": True,
            "game_state": game.to_dict(),
            "drama_score": drama_score,
            "commentary_hint": commentary_hint,
        }

    def _advance_turn(self, game: PokerGame):
        """Move to the next non-folded, non-all-in player."""
        for _ in range(len(game.players)):
            game.current_player_idx = (game.current_player_idx + 1) % len(game.players)
            p = game.players[game.current_player_idx]
            if not p.is_folded and not p.is_all_in:
                return
        # Everyone is folded or all-in

    def _is_betting_round_over(self, game: PokerGame) -> bool:
        """Check if the betting round is complete."""
        active = [p for p in game.players if not p.is_folded and not p.is_all_in]
        if not active:
            return True
        max_bet = max(p.current_bet for p in game.players if not p.is_folded)
        return all(p.current_bet == max_bet for p in active)

    def _next_round(self, game: PokerGame):
        """Advance to the next round (flop, turn, river, showdown)."""
        for player in game.players:
            player.current_bet = 0

        if game.status == "preflop":
            game.community_cards.extend(game.deck.deal(3))
            game.status = "flop"
        elif game.status == "flop":
            game.community_cards.extend(game.deck.deal(1))
            game.status = "turn"
        elif game.status == "turn":
            game.community_cards.extend(game.deck.deal(1))
            game.status = "river"
        elif game.status == "river":
            self._showdown(game)

        game.current_player_idx = (game.dealer_idx + 1) % len(game.players)
        while game.players[game.current_player_idx].is_folded or game.players[game.current_player_idx].is_all_in:
            game.current_player_idx = (game.current_player_idx + 1) % len(game.players)

    def _showdown(self, game: PokerGame):
        """Evaluate hands and determine winner."""
        game.status = "showdown"
        active = [p for p in game.players if not p.is_folded]

        best_player = None
        best_hand = (HandRank.HIGH_CARD, [])
        results = []

        for player in active:
            all_cards = player.hole_cards + game.community_cards
            hand_rank, kickers = evaluate_hand(all_cards)
            results.append({
                "player_id": player.player_id,
                "hand_rank": HAND_NAMES[hand_rank],
                "cards": [c.to_dict() for c in player.hole_cards],
            })
            if hand_rank > best_hand[0] or (hand_rank == best_hand[0] and kickers > best_hand[1]):
                best_hand = (hand_rank, kickers)
                best_player = player

        if best_player:
            game.winner = best_player.player_id
            best_player.chips += game.pot
            game.status = "finished"

    def get_hand_strength(self, game_id: str, player_id: str) -> dict:
        """Evaluate current hand strength for an agent (used by Bluff Tool)."""
        game = self.games.get(game_id)
        if not game:
            return {"error": "Game not found"}
        player = next((p for p in game.players if p.player_id == player_id), None)
        if not player:
            return {"error": "Player not found"}

        all_cards = player.hole_cards + game.community_cards
        hand_rank, kickers = evaluate_hand(all_cards)
        return {
            "hand_rank": HAND_NAMES[hand_rank],
            "rank_value": int(hand_rank),
            "strength": round(int(hand_rank) / 9.0, 2),
            "kickers": kickers,
        }
