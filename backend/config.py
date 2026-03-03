"""
AgentArena — Configuration
"""

import os


class Config:
    # Server
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", "8000"))
    DEBUG = os.getenv("DEBUG", "true").lower() == "true"

    # Google AI
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL_FLASH = "gemini-2.0-flash"
    GEMINI_MODEL_PRO = "gemini-2.0-pro"

    # Commentary
    COMMENTARY_STYLE = os.getenv("COMMENTARY_STYLE", "hype")  # hype, analytical, sarcastic, whisper

    # Blockchain (Phase 2)
    POLYGON_RPC_URL = os.getenv("POLYGON_RPC_URL", "")
    AGENT_NFT_CONTRACT = os.getenv("AGENT_NFT_CONTRACT", "")
    SKILL_NFT_CONTRACT = os.getenv("SKILL_NFT_CONTRACT", "")
    ARENA_TOKEN_CONTRACT = os.getenv("ARENA_TOKEN_CONTRACT", "")

    # Auth (Phase 2)
    FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "")

    # Redis (Phase 2)
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

    # CORS
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")


config = Config()
