"""
Closed Beta Waitlist — lightweight FastAPI routes for beta invite management.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Dict, List
import hashlib, time, secrets

router = APIRouter(prefix="/beta", tags=["Closed Beta"])

# In-memory store (replace with Firestore in production)
waitlist: List[Dict] = []
invite_codes: Dict[str, Dict] = {}   # code → {wallet, used, created_at}

BETA_SPOTS = 500

class WaitlistRequest(BaseModel):
    wallet_address: str
    email: str
    twitter_handle: str = ""
    referral_code: str = ""

class InviteUseRequest(BaseModel):
    wallet_address: str
    invite_code: str

@router.post("/waitlist")
async def join_waitlist(req: WaitlistRequest):
    """Register for the closed beta waitlist."""
    if len(waitlist) >= BETA_SPOTS * 3:  # allow 3x overflow
        raise HTTPException(status_code=503, detail="Waitlist is full. Check back soon.")

    # Dedup by wallet
    existing = [w for w in waitlist if w["wallet"] == req.wallet_address]
    if existing:
        pos = waitlist.index(existing[0]) + 1
        return {"status": "already_registered", "position": pos, "total_spots": BETA_SPOTS}

    pos = len(waitlist) + 1
    waitlist.append({
        "wallet": req.wallet_address,
        "email": req.email,
        "twitter": req.twitter_handle,
        "referral": req.referral_code,
        "joined_at": time.time(),
        "position": pos,
    })

    # Referral bonus → grant invite code if referral moved them up
    if req.referral_code and req.referral_code in invite_codes:
        invite_codes[req.referral_code]["referrals"] = invite_codes[req.referral_code].get("referrals", 0) + 1

    return {
        "status": "registered",
        "position": pos,
        "total_spots": BETA_SPOTS,
        "spots_remaining": max(0, BETA_SPOTS - pos),
        "message": "You're on the waitlist! 🏟️ Share your referral link to move up.",
    }

@router.get("/waitlist/position/{wallet}")
async def get_position(wallet: str):
    """Check waitlist position for a wallet."""
    record = next((w for w in waitlist if w["wallet"] == wallet), None)
    if not record:
        raise HTTPException(status_code=404, detail="Wallet not found on waitlist")
    return {
        "position": record["position"],
        "total_registered": len(waitlist),
        "spots_remaining": max(0, BETA_SPOTS - record["position"]),
        "is_invited": wallet in {v.get("wallet") for v in invite_codes.values()},
    }

@router.post("/invite/generate")
async def generate_invite(wallet: str, count: int = 1):
    """Admin: generate invite codes for early access. Rate limited in prod."""
    codes = []
    for _ in range(min(count, 10)):
        code = secrets.token_urlsafe(8).upper()
        invite_codes[code] = {"wallet": wallet, "used": False, "created_at": time.time(), "referrals": 0}
        codes.append(code)
    return {"codes": codes, "total_outstanding": len(invite_codes)}

@router.post("/invite/use")
async def use_invite(req: InviteUseRequest):
    """Redeem an invite code to gain beta access."""
    code = req.invite_code.upper()
    if code not in invite_codes:
        raise HTTPException(status_code=404, detail="Invalid invite code")
    if invite_codes[code]["used"]:
        raise HTTPException(status_code=400, detail="Invite already used")

    invite_codes[code]["used"] = True
    invite_codes[code]["redeemed_by"] = req.wallet_address
    invite_codes[code]["redeemed_at"] = time.time()

    return {
        "status": "activated",
        "wallet": req.wallet_address,
        "message": "🎉 Beta access granted! Start arena at agentarena.io",
        "starting_arena_tokens": 100,  # 100 free $ARENA for beta users
    }

@router.get("/stats")
async def beta_stats():
    """Public stats for the closed beta."""
    used = sum(1 for v in invite_codes.values() if v["used"])
    return {
        "registered_waitlist": len(waitlist),
        "invites_sent": len(invite_codes),
        "invites_used": used,
        "spots_left": max(0, BETA_SPOTS - used),
        "target_users": BETA_SPOTS,
    }
