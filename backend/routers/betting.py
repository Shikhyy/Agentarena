from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Optional
import hashlib
import time

from auth.service import get_current_user
from betting.aztec_client import aztec_client

router = APIRouter(prefix="/arenas", tags=["Betting"])

# In-memory mock DB for bet commitments
active_bets: Dict[str, list] = {}

class BetRequest(BaseModel):
    amount: int
    position: int # 0 for Agent A, 1 for Agent B
    secret: str   # Blinding factor

class RevealRequest(BaseModel):
    amount: int
    position: int
    secret: str

def compute_pedersen_mock(amount: int, position: int, secret: str) -> str:
    """
    Mock Pedersen hash for demonstration. In production, this matches 
    the exact Noir std::hash::pedersen_hash output format.
    """
    raw = f"{amount}|{position}|{secret}".encode('utf-8')
    return "0x" + hashlib.sha256(raw).hexdigest()

@router.post("/{arena_id}/bet")
async def place_bet(arena_id: str, req: BetRequest, address: str = Depends(get_current_user)):
    """
    Submit a ZK-private bet. The user provides plain values which are hashed.
    The backend uses Aztec Noir client to generate a proof of this knowledge.
    """
    
    # 1. Compute the public commitment hash
    commitment = compute_pedersen_mock(req.amount, req.position, req.secret)
    
    # 2. Invoke Nargo to generate the ZK Proof
    # In a real decentralised setup, the user's browser generates this proof.
    # We do it server-side for this MVP.
    success = aztec_client.generate_bet_commit_proof(
        amount=req.amount,
        position=req.position,
        secret=req.secret,
        commitment=commitment
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to synthesize ZK Bet Proof")
        
    # Store the commitment on-chain (mocked in memory here)
    if arena_id not in active_bets:
        active_bets[arena_id] = []
        
    active_bets[arena_id].append({
        "wallet": address,
        "commitment": commitment,
        "timestamp": time.time(),
        "revealed": False
    })
    
    return {
        "status": "committed",
        "arena": arena_id,
        "commitment_hash": commitment,
        "message": "ZK Proof generated and bet committed successfully."
    }

@router.post("/{arena_id}/reveal")
async def reveal_bet(arena_id: str, req: RevealRequest, address: str = Depends(get_current_user)):
    """
    Reveal a previously committed bet at the end of a match.
    """
    if arena_id not in active_bets:
        raise HTTPException(status_code=404, detail="No active bets for this arena")
        
    calc_commitment = compute_pedersen_mock(req.amount, req.position, req.secret)
    
    # Find matching commitment
    bet_record = None
    for b in active_bets[arena_id]:
        if b["wallet"] == address and b["commitment"] == calc_commitment:
            bet_record = b
            break
            
    if not bet_record:
        raise HTTPException(status_code=400, detail="Invalid reveal values or no matching commitment found")
        
    if bet_record["revealed"]:
        raise HTTPException(status_code=400, detail="Bet already revealed")
        
    # Mark revealed and process payout 
    # (In Reality: Smart contract verifies Noir Proof and processes ERC20 transfer)
    bet_record["revealed"] = True
    bet_record["revealed_amount"] = req.amount
    bet_record["revealed_position"] = req.position
    
    return {
        "status": "revealed",
        "payout_pending": True,
        "details": bet_record
    }


@router.get("/bets/{address}")
async def get_bet_history(address: str):
    """
    Return bet history for a given wallet address across all arenas.
    """
    history = []
    for arena_id, bets in active_bets.items():
        for b in bets:
            if b.get("wallet") == address:
                history.append({
                    "arena_id": arena_id,
                    "commitment": b.get("commitment"),
                    "timestamp": b.get("timestamp"),
                    "revealed": b.get("revealed", False),
                    "revealed_amount": b.get("revealed_amount"),
                    "revealed_position": b.get("revealed_position"),
                })
    return {"bets": history, "total": len(history)}
