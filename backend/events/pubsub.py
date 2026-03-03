"""
Cloud Pub/Sub Event Pipeline — async event bus for game state propagation.
In production: uses google-cloud-pubsub. In development: in-memory async queues.
"""

import asyncio
import json
import time
from typing import Any, Callable, Dict, List, Optional

# ── Event types ────────────────────────────────────────────────────
class EventTopics:
    GAME_STARTED    = "game.started"
    GAME_ENDED      = "game.ended"
    BET_COMMITTED   = "bet.committed"
    BET_REVEALED    = "bet.revealed"
    AGENT_LEVELED   = "agent.leveled_up"
    ELO_UPDATED     = "elo.updated"
    ODDS_UPDATED    = "odds.updated"
    MATCH_RESULT    = "match.result"
    NFT_EVOLVE      = "nft.evolve"
    HOF_INDUCTED    = "hof.inducted"

# ── Event payload ──────────────────────────────────────────────────
class Event:
    def __init__(self, topic: str, payload: Dict[str, Any], source: str = "backend"):
        self.topic = topic
        self.payload = payload
        self.source = source
        self.timestamp = time.time()
        self.event_id = f"{topic}_{int(self.timestamp * 1000)}"

    def to_dict(self) -> Dict:
        return {
            "event_id": self.event_id,
            "topic": self.topic,
            "source": self.source,
            "timestamp": self.timestamp,
            "payload": self.payload,
        }

    def to_json(self) -> str:
        return json.dumps(self.to_dict())


# ── In-memory Pub/Sub ─────────────────────────────────────────────
class InMemoryPubSub:
    """
    Async publish-subscribe bus. Swap for Google Cloud Pub/Sub in production
    by implementing the same publish/subscribe interface.
    """

    def __init__(self):
        self._subscriptions: Dict[str, List[Callable]] = {}
        self._event_log: List[Dict] = []
        self._max_log = 500  # Keep last 500 events

    def subscribe(self, topic: str, handler: Callable) -> None:
        """Register an async handler for a topic."""
        if topic not in self._subscriptions:
            self._subscriptions[topic] = []
        self._subscriptions[topic].append(handler)

    def unsubscribe(self, topic: str, handler: Callable) -> None:
        if topic in self._subscriptions:
            self._subscriptions[topic] = [h for h in self._subscriptions[topic] if h != handler]

    async def publish(self, event: Event) -> None:
        """Publish an event and deliver to all subscribers."""
        # Log event
        self._event_log.append(event.to_dict())
        if len(self._event_log) > self._max_log:
            self._event_log.pop(0)

        # Deliver to subscribers
        handlers = self._subscriptions.get(event.topic, [])
        # Also wildcard subscribers
        handlers += self._subscriptions.get("*", [])

        if handlers:
            await asyncio.gather(*[
                self._safe_call(h, event)
                for h in handlers
            ])

    async def _safe_call(self, handler: Callable, event: Event) -> None:
        try:
            if asyncio.iscoroutinefunction(handler):
                await handler(event)
            else:
                handler(event)
        except Exception as e:
            print(f"[PubSub] Handler error for {event.topic}: {e}")

    def get_recent_events(self, topic: Optional[str] = None, limit: int = 50) -> List[Dict]:
        events = self._event_log
        if topic:
            events = [e for e in events if e["topic"] == topic]
        return events[-limit:]

    def stats(self) -> Dict:
        return {
            "total_events": len(self._event_log),
            "topics": list(self._subscriptions.keys()),
            "subscriber_count": sum(len(v) for v in self._subscriptions.values()),
        }


# ── Global bus instance ───────────────────────────────────────────
bus = InMemoryPubSub()


# ── Convenience publish helpers ───────────────────────────────────
async def emit_game_started(arena_id: str, agent_a: str, agent_b: str, game_type: str):
    await bus.publish(Event(EventTopics.GAME_STARTED, {
        "arena_id": arena_id, "agent_a": agent_a, "agent_b": agent_b, "game_type": game_type
    }))

async def emit_game_ended(arena_id: str, winner: str, loser: str, game_type: str, duration_s: float):
    await bus.publish(Event(EventTopics.GAME_ENDED, {
        "arena_id": arena_id, "winner": winner, "loser": loser,
        "game_type": game_type, "duration_s": duration_s
    }))

async def emit_bet_committed(arena_id: str, wallet: str, commitment_hash: str):
    await bus.publish(Event(EventTopics.BET_COMMITTED, {
        "arena_id": arena_id, "wallet": wallet, "commitment_hash": commitment_hash
    }))

async def emit_match_result(arena_id: str, winner_agent: str, loser_agent: str, elo_changes: Dict):
    await bus.publish(Event(EventTopics.MATCH_RESULT, {
        "arena_id": arena_id, "winner": winner_agent, "loser": loser_agent,
        "elo_changes": elo_changes
    }))

async def emit_agent_leveled(agent_id: str, old_level: int, new_level: int, xp: int):
    await bus.publish(Event(EventTopics.AGENT_LEVELED, {
        "agent_id": agent_id, "old_level": old_level, "new_level": new_level, "xp": xp
    }))

async def emit_odds_updated(arena_id: str, odds: Dict):
    await bus.publish(Event(EventTopics.ODDS_UPDATED, {
        "arena_id": arena_id, "odds": odds
    }))


# ── Example subscriber registration ──────────────────────────────
async def _on_game_ended_update_nft(event: Event):
    """When a game ends, trigger NFT metadata evolution."""
    from progression.nft_evolution import nft_evolver
    # In production: fetch agent state from Firestore and trigger evolution
    print(f"[NFT] Evolving metadata for winner: {event.payload.get('winner')}")

async def _on_game_ended_update_elo(event: Event):
    """When a game ends, update ELO for both agents."""
    from progression.elo import record_match
    winner = event.payload.get("winner")
    loser = event.payload.get("loser")
    if winner and loser:
        result = record_match(winner, loser, 1.0)
        print(f"[ELO] Updated: {result}")


def register_default_handlers():
    """Register the standard event handlers on app startup."""
    bus.subscribe(EventTopics.GAME_ENDED, _on_game_ended_update_nft)
    bus.subscribe(EventTopics.GAME_ENDED, _on_game_ended_update_elo)
