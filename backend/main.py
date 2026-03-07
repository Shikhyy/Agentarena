"""
AgentArena Backend — FastAPI + WebSocket Game Server
Full PRD-compliant implementation with all 8 WebSocket event types,
5 routers, ADK agents, and Gemini Live commentary.
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import json
import asyncio
import random
from typing import Dict, List, Set

from auth.service import router as auth_router
from routers.betting import router as betting_router
from routers.progression import router as progression_router
from routers.beta import router as beta_router
from routers.agents import router as agents_router
from routers.matches import router as matches_router
from routers.leaderboard import router as leaderboard_router
from routers.tournaments import router as tournaments_router
from middleware.rate_limiter import RateLimitMiddleware
from events.pubsub import register_default_handlers
from betting.odds_engine import odds_engine
from agents.narrator_agent import narrator_agent
from agents.market_agent import market_agent
from commentary.pipeline import GameEvent


# ─── Connection Manager ───────────────────────────────────────────────
class ConnectionManager:
    """Manages WebSocket connections for game rooms."""

    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, room_id: str, websocket: WebSocket):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = set()
        self.active_connections[room_id].add(websocket)

    def disconnect(self, room_id: str, websocket: WebSocket):
        if room_id in self.active_connections:
            self.active_connections[room_id].discard(websocket)
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]

    async def broadcast(self, room_id: str, message: dict):
        if room_id in self.active_connections:
            dead = []
            for ws in self.active_connections[room_id]:
                try:
                    await ws.send_json(message)
                except Exception:
                    dead.append(ws)
            for ws in dead:
                self.active_connections[room_id].discard(ws)

    def get_spectator_count(self, room_id: str) -> int:
        return len(self.active_connections.get(room_id, set()))


manager = ConnectionManager()


# ─── In-Memory Game State Store ─────────────────────────────────────
games: Dict[str, dict] = {
    "test_arena_1": {
        "game_type": "chess",
        "agent_a": {"id": "agent_alphago", "name": "AlphaGo Zero", "elo": 2800},
        "agent_b": {"id": "agent_deepblue", "name": "DeepBlue Next", "elo": 2750},
        "status": "live",
        "move_count": 14,
        "turn_number": 14,
    },
    "test_arena_poker_1": {
        "game_type": "poker",
        "agent_a": {"id": "agent_bluffking", "name": "BluffKing", "elo": 2300},
        "agent_b": {"id": "agent_texasai", "name": "TexasHoldem AI", "elo": 2250},
        "status": "live",
        "move_count": 5,
        "turn_number": 5,
    },
    "test_arena_monopoly_1": {
        "game_type": "monopoly",
        "agent_a": {"id": "agent_monopoly_a", "name": "Monopoly Master", "elo": 1800},
        "agent_b": {"id": "agent_monopoly_b", "name": "Property Baron", "elo": 1750},
        "status": "live",
        "move_count": 22,
        "turn_number": 22,
    },
    "test_arena_trivia_1": {
        "game_type": "trivia",
        "agent_a": {"id": "agent_trivia_a", "name": "QuizMaster AI", "elo": 1600},
        "agent_b": {"id": "agent_trivia_b", "name": "JeopardyBot", "elo": 1580},
        "status": "live",
        "move_count": 8,
        "turn_number": 8,
    },
}


# ─── Game Event Simulator ─────────────────────────────────────────────
CHESS_EVENTS = [
    {"type": "move", "desc": "plays e4, controlling the center", "drama": 3},
    {"type": "capture", "desc": "captures the knight on f6!", "drama": 7},
    {"type": "check", "desc": "delivers a stunning check!", "drama": 9},
    {"type": "move", "desc": "pushes the pawn to d5", "drama": 4},
    {"type": "capture", "desc": "takes the bishop", "drama": 6},
]
POKER_EVENTS = [
    {"type": "raise", "desc": "raises 2x pot", "drama": 6},
    {"type": "bluff", "desc": "makes a suspiciously large bet", "drama": 8},
    {"type": "fold", "desc": "folds under pressure", "drama": 5},
    {"type": "all_in", "desc": "goes ALL IN!", "drama": 10},
    {"type": "check", "desc": "checks — holding back", "drama": 3},
]
MONOPOLY_EVENTS = [
    {"type": "buy", "desc": "purchases Boardwalk!", "drama": 7},
    {"type": "trade_offer", "desc": "proposes a trade for the red set", "drama": 6},
    {"type": "build", "desc": "builds 3 houses on Park Place", "drama": 8},
    {"type": "move", "desc": "lands on Chance", "drama": 4},
    {"type": "rent", "desc": "pays rent of $500!", "drama": 5},
]
TRIVIA_EVENTS = [
    {"type": "buzz_in", "desc": "buzzes in first!", "drama": 7},
    {"type": "correct", "desc": "answers correctly for 300 points!", "drama": 8},
    {"type": "wrong", "desc": "answers incorrectly and loses points!", "drama": 6},
    {"type": "timeout", "desc": "neither agent answers in time", "drama": 5},
    {"type": "question", "desc": "new question revealed", "drama": 3},
]

EVENTS_BY_GAME = {
    "chess": CHESS_EVENTS,
    "poker": POKER_EVENTS,
    "monopoly": MONOPOLY_EVENTS,
    "trivia": TRIVIA_EVENTS,
}


async def simulate_game_moves():
    """Simulate all game agents playing continuously, emitting all PRD events."""
    while True:
        await asyncio.sleep(6)
        for arena_id, game in games.items():
            if game["status"] != "live":
                continue

            game["move_count"] += 1
            game["turn_number"] = game["move_count"]

            game_type = game.get("game_type", "chess")
            agent_a = game.get("agent_a", {})
            agent_b = game.get("agent_b", {})
            active_agent = agent_a if game["move_count"] % 2 == 0 else agent_b
            events = EVENTS_BY_GAME.get(game_type, CHESS_EVENTS)
            event = random.choice(events)

            # Shift odds
            advantage = random.uniform(0.7, 1.3)
            odds_engine.bayesian_update(arena_id, {"advantage_score": advantage})
            current_odds = odds_engine.get_current_state(arena_id)
            live_probs = current_odds.get("live_probs", {0: 0.5, 1: 0.5})

            # 1. game_state_update ─────────────────────────────────────
            await manager.broadcast(arena_id, {
                "type": "game_state_update",
                "matchId": arena_id,
                "state": game_type,
                "turnNumber": game["turn_number"],
                "agentATurn": game["move_count"] % 2 == 0,
                "spectators": manager.get_spectator_count(arena_id),
                "moveCount": game["move_count"],
            })

            # 2. agent_thinking ─────────────────────────────────────────
            await manager.broadcast(arena_id, {
                "type": "agent_thinking",
                "matchId": arena_id,
                "agentId": active_agent.get("id", "unknown"),
                "thinking": True,
            })

            await asyncio.sleep(1.5)

            # 3. agent done thinking ────────────────────────────────────
            await manager.broadcast(arena_id, {
                "type": "agent_thinking",
                "matchId": arena_id,
                "agentId": active_agent.get("id", "unknown"),
                "thinking": False,
            })

            # 4. commentary_event ───────────────────────────────────────
            commentary_templates = {
                "hype": f"UNBELIEVABLE! {active_agent.get('name')} {event['desc']}! The crowd goes wild!",
                "analytical": f"{active_agent.get('name')} {event['desc']}. A calculated strategic decision.",
                "sarcastic": f"Oh wow, {active_agent.get('name')} {event['desc']}. Truly groundbreaking.",
            }
            commentary_text = commentary_templates.get("hype", f"{active_agent.get('name')} {event['desc']}")

            await manager.broadcast(arena_id, {
                "type": "commentary_event",
                "matchId": arena_id,
                "text": commentary_text,
                "audioUrl": None,
                "dramaScore": event["drama"],
                "eventType": event["type"],
            })

            # 5. odds_update ────────────────────────────────────────────
            await manager.broadcast(arena_id, {
                "type": "odds_update",
                "matchId": arena_id,
                "agentAProb": round(live_probs.get(0, 0.5), 4),
                "agentBProb": round(live_probs.get(1, 0.5), 4),
                "impliedOdds": current_odds.get("decimal_odds", {}),
            })

            # 6. Monopoly-specific events ───────────────────────────────
            if game_type == "monopoly" and event["type"] == "trade_offer":
                await manager.broadcast(arena_id, {
                    "type": "monopoly_negotiation",
                    "matchId": arena_id,
                    "from": active_agent.get("id"),
                    "to": (agent_b if active_agent == agent_a else agent_a).get("id"),
                    "tradeType": "property_swap",
                    "offer": {"properties": ["Park Place"], "cash": 200},
                    "message": f"I'll give you Park Place and $200 for your red set. Deal?",
                })

            # Occasionally emit drama_score == 10 for all_in / check events
            if event["drama"] >= 9:
                await manager.broadcast(arena_id, {
                    "type": "drama_peak",
                    "matchId": arena_id,
                    "dramaScore": event["drama"],
                    "message": f"⚡ CRITICAL MOMENT! {active_agent.get('name')} {event['desc']}",
                })


# ─── FastAPI App ─────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🏟️  AgentArena Backend starting...")

    # Wire up narrator + market agents to broadcast
    async def broadcast_callback(arena_id: str, message: dict):
        await manager.broadcast(arena_id, message)

    for arena_id in games:
        narrator_agent.create_session(arena_id)
        narrator_agent.register_broadcast(arena_id, broadcast_callback)
        market_agent.register_broadcast(arena_id, broadcast_callback)
        odds_engine.initialize_arena(arena_id)

    task = asyncio.create_task(simulate_game_moves())
    yield
    task.cancel()
    print("🏟️  AgentArena Backend shutting down...")


app = FastAPI(
    title="AgentArena API",
    description="Backend API for the AgentArena AI gaming platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(RateLimitMiddleware)

# ─── Register All Routers ────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(betting_router)
app.include_router(progression_router)
app.include_router(beta_router)
app.include_router(agents_router)
app.include_router(matches_router)
app.include_router(leaderboard_router)
app.include_router(tournaments_router)


# ─── REST Endpoints ─────────────────────────────────────────────────
@app.get("/")
async def root():
    return {
        "name": "AgentArena API",
        "version": "1.0.0",
        "status": "running",
        "games_supported": ["chess", "poker", "monopoly", "trivia"],
    }


@app.get("/arenas/live")
async def list_live_arenas():
    """List active game rooms with state, odds, spectator count."""
    arena_list = []
    for game_id, game in games.items():
        arena_list.append({
            "id": game_id,
            "game_type": game.get("game_type", "chess"),
            "agent_a": game.get("agent_a", {}),
            "agent_b": game.get("agent_b", {}),
            "status": game.get("status", "waiting"),
            "spectators": manager.get_spectator_count(game_id),
            "move_count": game.get("move_count", 0),
            "turn_number": game.get("turn_number", 0),
            "live_odds": odds_engine.get_current_state(game_id),
        })
    return {"arenas": arena_list}


# ─── WebSocket Endpoints ────────────────────────────────────────────
@app.websocket("/arenas/{arena_id}/stream")
async def arena_stream(websocket: WebSocket, arena_id: str):
    """
    WebSocket stream: emits all 8 PRD-spec event types.
    """
    await manager.connect(arena_id, websocket)
    try:
        # Send initial state
        await websocket.send_json({
            "type": "connected",
            "arena_id": arena_id,
            "spectators": manager.get_spectator_count(arena_id),
            "live_odds": odds_engine.get_current_state(arena_id),
            "game_info": games.get(arena_id, {}),
        })

        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            if message.get("type") == "ping":
                await websocket.send_json({"type": "pong"})

            elif message.get("type") == "set_commentary_style":
                style = message.get("style", "hype")
                narrator_agent.set_style(arena_id, style)
                await websocket.send_json({"type": "style_changed", "style": style})

            elif message.get("type") == "bet":
                await websocket.send_json({
                    "type": "bet_confirmed",
                    "amount": message.get("amount"),
                    "commitment": f"0x{'0' * 64}",
                })

            elif message.get("type") == "engine_eval":
                advantage = message.get("advantage_score", 1.0)
                odds_engine.bayesian_update(arena_id, {
                    "position": message.get("position", 0),
                    "advantage_score": advantage,
                })
                await manager.broadcast(arena_id, {
                    "type": "odds_update",
                    "matchId": arena_id,
                    **odds_engine.get_current_state(arena_id),
                })

    except WebSocketDisconnect:
        manager.disconnect(arena_id, websocket)
        await manager.broadcast(arena_id, {
            "type": "spectator_left",
            "spectators": manager.get_spectator_count(arena_id),
        })


# ─── Health Check ────────────────────────────────────────────────────
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "active_games": len(games),
        "active_connections": sum(len(v) for v in manager.active_connections.values()),
        "games": list(games.keys()),
    }
