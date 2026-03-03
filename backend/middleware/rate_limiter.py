"""
Rate Limiting Middleware — Per-wallet sliding window rate limiter.
Uses an in-memory store (Redis-compatible interface for easy migration).
"""

from fastapi import Request, HTTPException
from collections import defaultdict, deque
import time
from typing import Dict, Deque

# ── Rate limit configs ─────────────────────────────────────────────
RATE_LIMITS = {
    "bet":       {"window": 60,   "max_requests": 5},   # 5 bets/minute
    "api":       {"window": 60,   "max_requests": 60},   # 60 reqs/minute general
    "auth":      {"window": 300,  "max_requests": 10},   # 10 auth attempts / 5 min
    "websocket": {"window": 60,   "max_requests": 100},  # 100 WS messages/minute
}

# In-memory sliding window store: {key: deque of timestamps}
_request_log: Dict[str, Deque[float]] = defaultdict(deque)


def check_rate_limit(identifier: str, limit_type: str = "api") -> None:
    """
    Check if an identifier (wallet address/IP) has exceeded its rate limit.
    Raises HTTP 429 if exceeded.
    """
    config = RATE_LIMITS.get(limit_type, RATE_LIMITS["api"])
    window = config["window"]
    max_requests = config["max_requests"]

    key = f"{limit_type}:{identifier}"
    now = time.time()
    log = _request_log[key]

    # Remove expired timestamps
    while log and log[0] < now - window:
        log.popleft()

    if len(log) >= max_requests:
        retry_after = int(window - (now - log[0])) + 1
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded. Try again in {retry_after}s.",
            headers={"Retry-After": str(retry_after)},
        )

    log.append(now)


def get_rate_limit_status(identifier: str, limit_type: str = "api") -> dict:
    """Return remaining quota for a given identifier."""
    config = RATE_LIMITS.get(limit_type, RATE_LIMITS["api"])
    window = config["window"]
    max_requests = config["max_requests"]

    key = f"{limit_type}:{identifier}"
    now = time.time()
    log = _request_log[key]

    # Clean
    while log and log[0] < now - window:
        log.popleft()

    used = len(log)
    return {
        "limit": max_requests,
        "remaining": max(0, max_requests - used),
        "window_seconds": window,
        "reset_at": int((log[0] + window) if log else now),
    }


class RateLimitMiddleware:
    """
    ASGI middleware to enforce per-IP API rate limits.
    Wallet-specific limits are enforced at the route level via check_rate_limit().
    """

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            headers = dict(scope.get("headers", []))
            # Get client IP
            client = scope.get("client", ("unknown",))
            ip = client[0] if client else "unknown"
            forwarded_for = headers.get(b"x-forwarded-for", b"").decode()
            if forwarded_for:
                ip = forwarded_for.split(",")[0].strip()

            try:
                check_rate_limit(ip, "api")
            except HTTPException as exc:
                # Build ASGI response manually
                body = f'{{"detail": "{exc.detail}"}}'.encode()
                await send({
                    "type": "http.response.start",
                    "status": 429,
                    "headers": [
                        [b"content-type", b"application/json"],
                        [b"retry-after", exc.headers.get("Retry-After", "60").encode()],
                    ],
                })
                await send({"type": "http.response.body", "body": body})
                return

        await self.app(scope, receive, send)
