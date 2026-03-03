import os
import secrets
import jwt
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import Optional
from siwe import SiweMessage

router = APIRouter(prefix="/auth", tags=["Auth"])

# In-memory store for nonces (in production use Redis with TTL)
nonces = set()

# JWT Config
JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-agentarena-key")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24


class VerifyRequest(BaseModel):
    message: dict
    signature: str


def generate_nonce() -> str:
    """Generate a secure random alphanumeric string."""
    nonce = secrets.token_hex(16)
    nonces.add(nonce)
    return nonce


def create_access_token(address: str) -> str:
    """Create a JWT token for the verified wallet address."""
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode = {"sub": address, "exp": expire}
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt


# Dependency to get current user
async def get_current_user(request: Request) -> str:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    
    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        address: str = payload.get("sub")
        if address is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        return address
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.get("/nonce")
async def get_nonce():
    """Returns a secure nonce for SIWE challenge."""
    return {"nonce": generate_nonce()}


@router.post("/verify")
async def verify_signature(req: VerifyRequest):
    """Verifies the signed SIWE message and issues a JWT."""
    try:
        # Reconstruct the SIWE message object
        siwe_message = SiweMessage(message=req.message)
        
        # Verify message format and signature
        siwe_message.verify(req.signature)
        
        # Verify nonce matches one we generated
        if siwe_message.nonce not in nonces:
            raise ValueError("Invalid or expired nonce")
        
        # Remove used nonce
        nonces.remove(siwe_message.nonce)
        
        # Issue token for the validated address
        token = create_access_token(siwe_message.address)
        return {"token": token, "address": siwe_message.address}
        
    except ValueError as e:
        # Includes signature mismatch, expired time, invalid nonce, etc.
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid message format")


@router.get("/me")
async def get_current_session(address: str = Depends(get_current_user)):
    """Returns details of the currently authenticated wallet."""
    return {"address": address, "status": "authenticated"}
