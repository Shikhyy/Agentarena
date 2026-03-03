"""
Redis Memorystore — caching layer for sessions, odds, and leaderboard.
In development: uses an in-memory dict. In production: swap to redis.asyncio.
"""

import time
import json
from typing import Any, Optional, Dict
import asyncio

# ── In-memory cache (Redis-compatible interface) ──────────────────
_cache: Dict[str, Dict] = {}  # key → {value, expires_at}

async def cache_get(key: str) -> Optional[Any]:
    """Get a value from cache. Returns None if expired or missing."""
    entry = _cache.get(key)
    if not entry:
        return None
    if entry["expires_at"] and time.time() > entry["expires_at"]:
        del _cache[key]
        return None
    return entry["value"]

async def cache_set(key: str, value: Any, ttl_seconds: int = 300) -> None:
    """Set a cache value with optional TTL."""
    _cache[key] = {
        "value": value,
        "expires_at": time.time() + ttl_seconds if ttl_seconds else None,
        "created_at": time.time(),
    }

async def cache_delete(key: str) -> None:
    _cache.pop(key, None)

async def cache_exists(key: str) -> bool:
    val = await cache_get(key)
    return val is not None

async def cache_increment(key: str, amount: int = 1) -> int:
    """Atomic increment (for rate counters, view counts, etc.)."""
    current = await cache_get(key) or 0
    new_val = current + amount
    await cache_set(key, new_val, ttl_seconds=3600)
    return new_val

# ── Cache keys & TTLs ─────────────────────────────────────────────
CACHE_KEYS = {
    "leaderboard":       ("leaderboard:global",  300),    # 5 min
    "arena_live_odds":   ("arena:odds:{arena_id}", 10),   # 10 sec — live!
    "agent_stats":       ("agent:stats:{agent_id}", 60),  # 1 min
    "bet_session":       ("session:bet:{wallet}", 1800),  # 30 min session
    "beta_waitlist_pos": ("beta:pos:{wallet}", 3600),     # 1 hour
}

# ── Session management ────────────────────────────────────────────
async def set_session(wallet: str, session_data: dict, ttl: int = 1800) -> None:
    await cache_set(f"session:{wallet}", session_data, ttl)

async def get_session(wallet: str) -> Optional[dict]:
    return await cache_get(f"session:{wallet}")

async def invalidate_session(wallet: str) -> None:
    await cache_delete(f"session:{wallet}")

# ── Leaderboard cache ─────────────────────────────────────────────
async def cache_leaderboard(data: list) -> None:
    await cache_set("leaderboard:global", data, ttl_seconds=300)

async def get_cached_leaderboard() -> Optional[list]:
    return await cache_get("leaderboard:global")

# ── Live odds cache ───────────────────────────────────────────────
async def cache_odds(arena_id: str, odds_data: dict) -> None:
    await cache_set(f"arena:odds:{arena_id}", odds_data, ttl_seconds=10)

async def get_cached_odds(arena_id: str) -> Optional[dict]:
    return await cache_get(f"arena:odds:{arena_id}")

# ── Cache stats (for monitoring) ──────────────────────────────────
def cache_stats() -> dict:
    now = time.time()
    active = sum(1 for v in _cache.values() if not v["expires_at"] or v["expires_at"] > now)
    expired = len(_cache) - active
    return {
        "total_keys": len(_cache),
        "active_keys": active,
        "expired_keys": expired,
        "memory_estimate_kb": len(json.dumps(_cache)) / 1024,
    }
