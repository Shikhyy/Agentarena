"""
AgentArena Backend — FastAPI + WebSocket Game Server
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import json
import asyncio
from typing import Dict, List, Set

from auth.service import router as auth_router
from routers.betting import router as betting_router


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
games: Dict[str, dict] = {}


# ─── FastAPI App ─────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🏟️  AgentArena Backend starting...")
    yield
    print("🏟️  AgentArena Backend shutting down...")


app = FastAPI(
    title="AgentArena API",
    description="Backend API for the AgentArena AI gaming platform",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(betting_router)

# ─── REST Endpoints ─────────────────────────────────────────────────
@app.get("/")
async def root():
    return {
        "name": "AgentArena API",
        "version": "0.1.0",
        "status": "running",
    }


from betting.odds_engine import odds_engine

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
            "live_odds": odds_engine.get_current_state(game_id)
        })
    return {"arenas": arena_list}


@app.post("/agents")
async def create_agent(agent_config: dict):
    """Create a new AI agent with personality and skills config."""
    agent_id = f"agent_{len(games) + 1}"
    return {
        "agent_id": agent_id,
        "name": agent_config.get("name", "Unnamed"),
        "personality": agent_config.get("personality", "adaptive"),
        "skills": agent_config.get("skills", []),
        "status": "created",
    }


@app.get("/agents/{agent_id}/stats")
async def get_agent_stats(agent_id: str):
    """Full agent history: games, XP, ELO, NFT metadata, skill loadout."""
    return {
        "agent_id": agent_id,
        "elo": 1500,
        "xp": 0,
        "level": 1,
        "wins": 0,
        "losses": 0,
        "skills": [],
        "games_played": [],
    }


@app.get("/leaderboard")
async def get_leaderboard(game: str = "all", period: str = "all_time"):
    """Global agent ELO rankings."""
    return {
        "game_filter": game,
        "period": period,
        "rankings": [],
    }


# ─── WebSocket Endpoints ────────────────────────────────────────────
@app.websocket("/arenas/{arena_id}/stream")
async def arena_stream(websocket: WebSocket, arena_id: str):
    """WebSocket stream: real-time game state events + commentary."""
    await manager.connect(arena_id, websocket)
    try:
        # Send initial state
        await websocket.send_json({
            "type": "connected",
            "arena_id": arena_id,
            "spectators": manager.get_spectator_count(arena_id),
            "live_odds": odds_engine.get_current_state(arena_id)
        })

        # Listen for client messages
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            if message.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
            
            elif message.get("type") == "bet":
                await websocket.send_json({
                    "type": "bet_confirmed",
                    "amount": message.get("amount"),
                })
                
            elif message.get("type") == "engine_eval":
                # Simulated game engine evaluation shifting the Bayesian prob
                position = message.get("position", 0)
                advantage = message.get("advantage_score", 1.0)
                
                new_probs = odds_engine.bayesian_update(arena_id, {
                    "position": position, 
                    "advantage_score": advantage
                })
                
                await manager.broadcast(arena_id, {
                    "type": "odds_update",
                    "live_odds": odds_engine.get_current_state(arena_id)
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
    return {"status": "healthy", "active_games": len(games)}
