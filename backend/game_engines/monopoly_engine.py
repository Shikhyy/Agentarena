"""
AgentArena — Monopoly Game Engine
Full Monopoly rules: property acquisition, rent, houses/hotels, trading, jail, bankruptcy.
"""
import random
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional


class PropertyType(Enum):
    STREET = "street"
    RAILROAD = "railroad"
    UTILITY = "utility"


class SpaceType(Enum):
    PROPERTY = "property"
    TAX = "tax"
    CHANCE = "chance"
    COMMUNITY = "community"
    GO = "go"
    JAIL = "jail"
    FREE_PARKING = "free_parking"
    GO_TO_JAIL = "go_to_jail"


@dataclass
class Property:
    name: str
    position: int
    prop_type: PropertyType
    color_group: str
    price: int
    rent: list[int]  # [base, 1house, 2house, 3house, 4house, hotel]
    house_cost: int
    owner: Optional[str] = None
    houses: int = 0  # 5 = hotel
    mortgaged: bool = False


@dataclass
class Player:
    agent_id: str
    name: str
    position: int = 0
    cash: int = 1500
    properties: list[int] = field(default_factory=list)
    in_jail: bool = False
    jail_turns: int = 0
    get_out_free_cards: int = 0
    is_bankrupt: bool = False
    doubles_count: int = 0


# ── Standard Monopoly Board (40 spaces) ──────────────────────
BOARD = [
    {"name": "GO", "type": SpaceType.GO},
    {"name": "Mediterranean Avenue", "type": SpaceType.PROPERTY, "prop_type": PropertyType.STREET, "color": "brown", "price": 60, "rent": [2, 10, 30, 90, 160, 250], "house_cost": 50},
    {"name": "Community Chest", "type": SpaceType.COMMUNITY},
    {"name": "Baltic Avenue", "type": SpaceType.PROPERTY, "prop_type": PropertyType.STREET, "color": "brown", "price": 60, "rent": [4, 20, 60, 180, 320, 450], "house_cost": 50},
    {"name": "Income Tax", "type": SpaceType.TAX, "amount": 200},
    {"name": "Reading Railroad", "type": SpaceType.PROPERTY, "prop_type": PropertyType.RAILROAD, "color": "railroad", "price": 200, "rent": [25, 50, 100, 200, 200, 200], "house_cost": 0},
    {"name": "Oriental Avenue", "type": SpaceType.PROPERTY, "prop_type": PropertyType.STREET, "color": "light_blue", "price": 100, "rent": [6, 30, 90, 270, 400, 550], "house_cost": 50},
    {"name": "Chance", "type": SpaceType.CHANCE},
    {"name": "Vermont Avenue", "type": SpaceType.PROPERTY, "prop_type": PropertyType.STREET, "color": "light_blue", "price": 100, "rent": [6, 30, 90, 270, 400, 550], "house_cost": 50},
    {"name": "Connecticut Avenue", "type": SpaceType.PROPERTY, "prop_type": PropertyType.STREET, "color": "light_blue", "price": 120, "rent": [8, 40, 100, 300, 450, 600], "house_cost": 50},
    {"name": "Jail / Just Visiting", "type": SpaceType.JAIL},
    {"name": "St. Charles Place", "type": SpaceType.PROPERTY, "prop_type": PropertyType.STREET, "color": "pink", "price": 140, "rent": [10, 50, 150, 450, 625, 750], "house_cost": 100},
    {"name": "Electric Company", "type": SpaceType.PROPERTY, "prop_type": PropertyType.UTILITY, "color": "utility", "price": 150, "rent": [4, 10, 10, 10, 10, 10], "house_cost": 0},
    {"name": "States Avenue", "type": SpaceType.PROPERTY, "prop_type": PropertyType.STREET, "color": "pink", "price": 140, "rent": [10, 50, 150, 450, 625, 750], "house_cost": 100},
    {"name": "Virginia Avenue", "type": SpaceType.PROPERTY, "prop_type": PropertyType.STREET, "color": "pink", "price": 160, "rent": [12, 60, 180, 500, 700, 900], "house_cost": 100},
    {"name": "Pennsylvania Railroad", "type": SpaceType.PROPERTY, "prop_type": PropertyType.RAILROAD, "color": "railroad", "price": 200, "rent": [25, 50, 100, 200, 200, 200], "house_cost": 0},
    {"name": "St. James Place", "type": SpaceType.PROPERTY, "prop_type": PropertyType.STREET, "color": "orange", "price": 180, "rent": [14, 70, 200, 550, 750, 950], "house_cost": 100},
    {"name": "Community Chest", "type": SpaceType.COMMUNITY},
    {"name": "Tennessee Avenue", "type": SpaceType.PROPERTY, "prop_type": PropertyType.STREET, "color": "orange", "price": 180, "rent": [14, 70, 200, 550, 750, 950], "house_cost": 100},
    {"name": "New York Avenue", "type": SpaceType.PROPERTY, "prop_type": PropertyType.STREET, "color": "orange", "price": 200, "rent": [16, 80, 220, 600, 800, 1000], "house_cost": 100},
    {"name": "Free Parking", "type": SpaceType.FREE_PARKING},
    {"name": "Kentucky Avenue", "type": SpaceType.PROPERTY, "prop_type": PropertyType.STREET, "color": "red", "price": 220, "rent": [18, 90, 250, 700, 875, 1050], "house_cost": 150},
    {"name": "Chance", "type": SpaceType.CHANCE},
    {"name": "Indiana Avenue", "type": SpaceType.PROPERTY, "prop_type": PropertyType.STREET, "color": "red", "price": 220, "rent": [18, 90, 250, 700, 875, 1050], "house_cost": 150},
    {"name": "Illinois Avenue", "type": SpaceType.PROPERTY, "prop_type": PropertyType.STREET, "color": "red", "price": 240, "rent": [20, 100, 300, 750, 925, 1100], "house_cost": 150},
    {"name": "B&O Railroad", "type": SpaceType.PROPERTY, "prop_type": PropertyType.RAILROAD, "color": "railroad", "price": 200, "rent": [25, 50, 100, 200, 200, 200], "house_cost": 0},
    {"name": "Atlantic Avenue", "type": SpaceType.PROPERTY, "prop_type": PropertyType.STREET, "color": "yellow", "price": 260, "rent": [22, 110, 330, 800, 975, 1150], "house_cost": 150},
    {"name": "Ventnor Avenue", "type": SpaceType.PROPERTY, "prop_type": PropertyType.STREET, "color": "yellow", "price": 260, "rent": [22, 110, 330, 800, 975, 1150], "house_cost": 150},
    {"name": "Water Works", "type": SpaceType.PROPERTY, "prop_type": PropertyType.UTILITY, "color": "utility", "price": 150, "rent": [4, 10, 10, 10, 10, 10], "house_cost": 0},
    {"name": "Marvin Gardens", "type": SpaceType.PROPERTY, "prop_type": PropertyType.STREET, "color": "yellow", "price": 280, "rent": [24, 120, 360, 850, 1025, 1200], "house_cost": 150},
    {"name": "Go To Jail", "type": SpaceType.GO_TO_JAIL},
    {"name": "Pacific Avenue", "type": SpaceType.PROPERTY, "prop_type": PropertyType.STREET, "color": "green", "price": 300, "rent": [26, 130, 390, 900, 1100, 1275], "house_cost": 200},
    {"name": "North Carolina Avenue", "type": SpaceType.PROPERTY, "prop_type": PropertyType.STREET, "color": "green", "price": 300, "rent": [26, 130, 390, 900, 1100, 1275], "house_cost": 200},
    {"name": "Community Chest", "type": SpaceType.COMMUNITY},
    {"name": "Pennsylvania Avenue", "type": SpaceType.PROPERTY, "prop_type": PropertyType.STREET, "color": "green", "price": 320, "rent": [28, 150, 450, 1000, 1200, 1400], "house_cost": 200},
    {"name": "Short Line Railroad", "type": SpaceType.PROPERTY, "prop_type": PropertyType.RAILROAD, "color": "railroad", "price": 200, "rent": [25, 50, 100, 200, 200, 200], "house_cost": 0},
    {"name": "Chance", "type": SpaceType.CHANCE},
    {"name": "Park Place", "type": SpaceType.PROPERTY, "prop_type": PropertyType.STREET, "color": "dark_blue", "price": 350, "rent": [35, 175, 500, 1100, 1300, 1500], "house_cost": 200},
    {"name": "Luxury Tax", "type": SpaceType.TAX, "amount": 100},
    {"name": "Boardwalk", "type": SpaceType.PROPERTY, "prop_type": PropertyType.STREET, "color": "dark_blue", "price": 400, "rent": [50, 200, 600, 1400, 1700, 2000], "house_cost": 200},
]

# Color groups and their property positions
COLOR_GROUPS = {
    "brown": [1, 3],
    "light_blue": [6, 8, 9],
    "pink": [11, 13, 14],
    "orange": [16, 18, 19],
    "red": [21, 23, 24],
    "yellow": [26, 27, 29],
    "green": [31, 32, 34],
    "dark_blue": [37, 39],
    "railroad": [5, 15, 25, 35],
    "utility": [12, 28],
}


class MonopolyEngine:
    def __init__(self, player_configs: list[dict]):
        """Initialize with 2-6 players. Each config: {agent_id, name}"""
        assert 2 <= len(player_configs) <= 6, "Need 2-6 players"

        self.players = {
            cfg["agent_id"]: Player(agent_id=cfg["agent_id"], name=cfg["name"])
            for cfg in player_configs
        }
        self.properties: dict[int, Property] = {}
        self._init_properties()

        self.turn_order = [cfg["agent_id"] for cfg in player_configs]
        self.current_turn_idx = 0
        self.turn_count = 0
        self.game_over = False
        self.winner: Optional[str] = None
        self.trade_proposals: list[dict] = []
        self.game_log: list[dict] = []

    def _init_properties(self):
        for i, space in enumerate(BOARD):
            if space["type"] == SpaceType.PROPERTY:
                self.properties[i] = Property(
                    name=space["name"],
                    position=i,
                    prop_type=space["prop_type"],
                    color_group=space["color"],
                    price=space["price"],
                    rent=space["rent"],
                    house_cost=space["house_cost"],
                )

    @property
    def current_player(self) -> Player:
        return self.players[self.turn_order[self.current_turn_idx]]

    def roll_dice(self) -> tuple[int, int]:
        return (random.randint(1, 6), random.randint(1, 6))

    def take_turn(self) -> dict:
        """Execute a full turn for the current player. Returns turn events."""
        player = self.current_player
        if player.is_bankrupt:
            self._next_turn()
            return {"skipped": True, "reason": "bankrupt"}

        events = []
        dice = self.roll_dice()
        is_doubles = dice[0] == dice[1]
        total = sum(dice)

        events.append({"type": "roll", "dice": dice, "total": total, "doubles": is_doubles})

        # Jail logic
        if player.in_jail:
            if is_doubles:
                player.in_jail = False
                player.jail_turns = 0
                events.append({"type": "jail_release", "method": "doubles"})
            elif player.jail_turns >= 3:
                player.cash -= 50
                player.in_jail = False
                player.jail_turns = 0
                events.append({"type": "jail_release", "method": "paid_50"})
            else:
                player.jail_turns += 1
                events.append({"type": "jail_stay", "turns_remaining": 3 - player.jail_turns})
                self._next_turn()
                return {"player": player.name, "events": events}

        # Doubles → speeding (3 in a row = jail)
        if is_doubles:
            player.doubles_count += 1
            if player.doubles_count >= 3:
                self._send_to_jail(player)
                events.append({"type": "go_to_jail", "reason": "three_doubles"})
                self._next_turn()
                return {"player": player.name, "events": events}
        else:
            player.doubles_count = 0

        # Move
        old_pos = player.position
        player.position = (player.position + total) % 40

        # Passed GO?
        if player.position < old_pos and player.position != 0:
            player.cash += 200
            events.append({"type": "pass_go", "collected": 200})

        events.append({"type": "move", "from": old_pos, "to": player.position, "space": BOARD[player.position]["name"]})

        # Handle landing
        space = BOARD[player.position]
        land_events = self._handle_landing(player, space)
        events.extend(land_events)

        # Check bankruptcy
        if player.cash < 0:
            player.is_bankrupt = True
            events.append({"type": "bankrupt", "player": player.name})
            self._check_game_over()

        # Another turn for doubles (if not jailed)
        if not is_doubles or player.in_jail:
            self._next_turn()

        self.turn_count += 1
        result = {"player": player.name, "events": events}
        self.game_log.append(result)
        return result

    def _handle_landing(self, player: Player, space: dict) -> list[dict]:
        events = []
        space_type = space["type"]

        if space_type == SpaceType.PROPERTY:
            prop = self.properties[player.position]
            if prop.owner is None:
                events.append({"type": "unowned_property", "property": prop.name, "price": prop.price})
            elif prop.owner != player.agent_id and not prop.mortgaged:
                rent = self._calculate_rent(prop)
                player.cash -= rent
                self.players[prop.owner].cash += rent
                events.append({"type": "rent_paid", "property": prop.name, "amount": rent, "to": self.players[prop.owner].name})

        elif space_type == SpaceType.TAX:
            tax = space["amount"]
            player.cash -= tax
            events.append({"type": "tax", "amount": tax})

        elif space_type == SpaceType.GO_TO_JAIL:
            self._send_to_jail(player)
            events.append({"type": "go_to_jail", "reason": "landed"})

        elif space_type == SpaceType.CHANCE or space_type == SpaceType.COMMUNITY:
            effect = self._draw_card(player, space_type)
            events.append({"type": "card", "card_type": space_type.value, "effect": effect})

        return events

    def _calculate_rent(self, prop: Property) -> int:
        if prop.prop_type == PropertyType.RAILROAD:
            owner = self.players[prop.owner]
            rr_count = sum(1 for p in owner.properties if self.properties[p].prop_type == PropertyType.RAILROAD)
            return 25 * (2 ** (rr_count - 1))

        elif prop.prop_type == PropertyType.UTILITY:
            owner = self.players[prop.owner]
            util_count = sum(1 for p in owner.properties if self.properties[p].prop_type == PropertyType.UTILITY)
            dice_roll = sum(self.roll_dice())
            return dice_roll * (10 if util_count == 2 else 4)

        else:
            # Color monopoly doubles base rent
            base_rent = prop.rent[prop.houses]
            if prop.houses == 0 and self._has_monopoly(prop.owner, prop.color_group):
                base_rent *= 2
            return base_rent

    def _has_monopoly(self, owner_id: str, color_group: str) -> bool:
        positions = COLOR_GROUPS.get(color_group, [])
        return all(
            self.properties[p].owner == owner_id
            for p in positions
        )

    def _send_to_jail(self, player: Player):
        player.position = 10
        player.in_jail = True
        player.jail_turns = 0
        player.doubles_count = 0

    def _draw_card(self, player: Player, card_type: SpaceType) -> str:
        effects = [
            ("Advance to GO. Collect $200.", lambda p: self._advance_to(p, 0)),
            ("Bank pays you $50.", lambda p: setattr(p, 'cash', p.cash + 50)),
            ("Pay poor tax of $15.", lambda p: setattr(p, 'cash', p.cash - 15)),
            ("You inherit $100.", lambda p: setattr(p, 'cash', p.cash + 100)),
            ("Pay hospital fees of $100.", lambda p: setattr(p, 'cash', p.cash - 100)),
            ("Collect $150.", lambda p: setattr(p, 'cash', p.cash + 150)),
            ("Pay school fees of $50.", lambda p: setattr(p, 'cash', p.cash - 50)),
        ]
        text, fn = random.choice(effects)
        fn(player)
        return text

    def _advance_to(self, player: Player, position: int):
        if position <= player.position:
            player.cash += 200
        player.position = position

    def buy_property(self, agent_id: str, position: int) -> bool:
        """Agent buys an unowned property."""
        if position not in self.properties:
            return False
        prop = self.properties[position]
        player = self.players[agent_id]
        if prop.owner is not None or player.cash < prop.price:
            return False
        player.cash -= prop.price
        prop.owner = agent_id
        player.properties.append(position)
        return True

    def build_house(self, agent_id: str, position: int) -> bool:
        """Build a house on a property (requires monopoly)."""
        if position not in self.properties:
            return False
        prop = self.properties[position]
        player = self.players[agent_id]
        if (prop.owner != agent_id or prop.houses >= 5 or
            player.cash < prop.house_cost or
            not self._has_monopoly(agent_id, prop.color_group)):
            return False
        player.cash -= prop.house_cost
        prop.houses += 1
        return True

    def propose_trade(self, from_id: str, to_id: str, offer: dict) -> dict:
        """
        Propose a trade.
        offer: {
            "give_properties": [positions],
            "give_cash": int,
            "want_properties": [positions],
            "want_cash": int,
        }
        """
        trade = {
            "id": len(self.trade_proposals),
            "from": from_id,
            "to": to_id,
            "offer": offer,
            "status": "pending",
        }
        self.trade_proposals.append(trade)
        return trade

    def accept_trade(self, trade_id: int) -> bool:
        """Accept a pending trade."""
        if trade_id >= len(self.trade_proposals):
            return False
        trade = self.trade_proposals[trade_id]
        if trade["status"] != "pending":
            return False

        from_player = self.players[trade["from"]]
        to_player = self.players[trade["to"]]
        offer = trade["offer"]

        # Transfer cash
        from_player.cash -= offer.get("give_cash", 0)
        from_player.cash += offer.get("want_cash", 0)
        to_player.cash += offer.get("give_cash", 0)
        to_player.cash -= offer.get("want_cash", 0)

        # Transfer properties
        for pos in offer.get("give_properties", []):
            self.properties[pos].owner = trade["to"]
            from_player.properties.remove(pos)
            to_player.properties.append(pos)
        for pos in offer.get("want_properties", []):
            self.properties[pos].owner = trade["from"]
            to_player.properties.remove(pos)
            from_player.properties.append(pos)

        trade["status"] = "accepted"
        return True

    def _next_turn(self):
        active = [i for i, pid in enumerate(self.turn_order) if not self.players[pid].is_bankrupt]
        if len(active) <= 1:
            self._check_game_over()
            return
        self.current_turn_idx = (self.current_turn_idx + 1) % len(self.turn_order)
        while self.players[self.turn_order[self.current_turn_idx]].is_bankrupt:
            self.current_turn_idx = (self.current_turn_idx + 1) % len(self.turn_order)

    def _check_game_over(self):
        active = [pid for pid in self.turn_order if not self.players[pid].is_bankrupt]
        if len(active) == 1:
            self.game_over = True
            self.winner = active[0]
        elif self.turn_count > 500:  # Max turns
            self.game_over = True
            self.winner = max(active, key=lambda pid: self._net_worth(pid))

    def _net_worth(self, agent_id: str) -> int:
        player = self.players[agent_id]
        prop_value = sum(
            self.properties[p].price + self.properties[p].houses * self.properties[p].house_cost
            for p in player.properties
        )
        return player.cash + prop_value

    def get_state(self) -> dict:
        return {
            "turn": self.turn_count,
            "current_player": self.current_player.name if not self.game_over else None,
            "game_over": self.game_over,
            "winner": self.players[self.winner].name if self.winner else None,
            "players": {
                pid: {
                    "name": p.name,
                    "position": p.position,
                    "cash": p.cash,
                    "properties": [self.properties[pos].name for pos in p.properties],
                    "net_worth": self._net_worth(pid),
                    "in_jail": p.in_jail,
                    "is_bankrupt": p.is_bankrupt,
                }
                for pid, p in self.players.items()
            },
        }

    def get_commentary_hints(self) -> dict:
        """Generate commentary-worthy events for the Gemini narrator."""
        hints = []
        monopolies = {}
        for pid, player in self.players.items():
            for color, positions in COLOR_GROUPS.items():
                if self._has_monopoly(pid, color) and color not in ["railroad", "utility"]:
                    monopolies[color] = player.name

        if monopolies:
            hints.append(f"Monopolies held: {monopolies}")

        cash_leader = max(self.players.values(), key=lambda p: p.cash if not p.is_bankrupt else 0)
        prop_leader = max(self.players.values(), key=lambda p: len(p.properties))
        hints.append(f"Cash leader: {cash_leader.name} (${cash_leader.cash})")
        hints.append(f"Property leader: {prop_leader.name} ({len(prop_leader.properties)} properties)")

        drama_score = min(100, self.turn_count * 2 + len(self.trade_proposals) * 10)
        return {
            "hints": hints,
            "drama_score": drama_score,
            "trade_count": len(self.trade_proposals),
        }
