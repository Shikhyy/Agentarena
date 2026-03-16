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
    GEMINI_MODEL_FLASH = os.getenv("GEMINI_MODEL_FLASH", "gemini-2.0-flash")
    GEMINI_MODEL_PRO = os.getenv("GEMINI_MODEL_PRO", "gemini-2.0-pro")

    # Commentary
    COMMENTARY_STYLE = os.getenv("COMMENTARY_STYLE", "hype")  # hype, analytical, sarcastic, whisper

    # Blockchain
    POLYGON_RPC_URL = os.getenv("POLYGON_RPC_URL", "https://polygon-rpc.com")
    POLYGON_AMOY_RPC = os.getenv("POLYGON_AMOY_RPC", "https://rpc-amoy.polygon.technology")
    AGENT_NFT_CONTRACT = os.getenv("AGENT_NFT_CONTRACT", "")
    SKILL_NFT_CONTRACT = os.getenv("SKILL_NFT_CONTRACT", "")
    ARENA_TOKEN_CONTRACT = os.getenv("ARENA_TOKEN_CONTRACT", "")
    ZK_BETTING_POOL_CONTRACT = os.getenv("ZK_BETTING_POOL_CONTRACT", "")
    RESULT_ORACLE_CONTRACT = os.getenv("RESULT_ORACLE_CONTRACT", "")

    # Auth
    FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "")
    JWT_SECRET = os.getenv("JWT_SECRET", "changeme-in-production")

    # Redis
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

    # CORS — comma-separated origins or * for dev
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

    # Frontend URL (for building absolute links)
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

    # Cloud Storage (for avatar uploads)
    GCS_BUCKET = os.getenv("GCS_BUCKET", "")

    @property
    def is_blockchain_configured(self) -> bool:
        return bool(self.POLYGON_RPC_URL and self.ARENA_TOKEN_CONTRACT)

    @property
    def is_gemini_configured(self) -> bool:
        return bool(self.GEMINI_API_KEY)


config = Config()
