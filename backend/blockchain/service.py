"""
AgentArena — Blockchain Service
Read-only contract interactions via web3.py.
Used by the /stats endpoint and /config/contracts endpoint to surface
live on-chain data (token supply, NFT counts, betting pool volume).

All reads are optional — if the RPC or contracts are not configured,
sensible fallbacks are returned so the app stays functional.
"""

from __future__ import annotations
import os
import asyncio
from typing import Optional, Tuple
from functools import lru_cache


# Minimal ERC-20 ABI for balance/supply reads
ERC20_ABI = [
    {"inputs": [{"name": "account", "type": "address"}], "name": "balanceOf",
     "outputs": [{"type": "uint256"}], "stateMutability": "view", "type": "function"},
    {"inputs": [], "name": "totalSupply",
     "outputs": [{"type": "uint256"}], "stateMutability": "view", "type": "function"},
    {"inputs": [], "name": "decimals",
     "outputs": [{"type": "uint8"}], "stateMutability": "view", "type": "function"},
]

# Minimal ERC-721 ABI for supply reads
ERC721_ABI = [
    {"inputs": [], "name": "totalSupply",
     "outputs": [{"type": "uint256"}], "stateMutability": "view", "type": "function"},
    {"inputs": [{"name": "owner", "type": "address"}], "name": "balanceOf",
     "outputs": [{"type": "uint256"}], "stateMutability": "view", "type": "function"},
]

# ZK Betting Pool — read total volume
BETTING_POOL_ABI = [
    {"inputs": [], "name": "totalVolume",
     "outputs": [{"type": "uint256"}], "stateMutability": "view", "type": "function"},
    {"inputs": [], "name": "activeGames",
     "outputs": [{"type": "uint256"}], "stateMutability": "view", "type": "function"},
]


def _get_web3(rpc_url: str):
    """Create a Web3 instance or return None if web3 is unavailable."""
    try:
        from web3 import Web3
        w3 = Web3(Web3.HTTPProvider(rpc_url, request_kwargs={"timeout": 5}))
        return w3 if w3.is_connected() else None
    except Exception:
        return None


class BlockchainService:
    """
    Thin read-only wrapper around the deployed contracts.
    All methods return (value, error) tuples — the app never crashes on chain errors.
    """

    def __init__(self):
        self.rpc_url = os.getenv("POLYGON_RPC_URL", "https://polygon-rpc.com")
        self.token_addr = os.getenv("ARENA_TOKEN_CONTRACT", "")
        self.agent_nft_addr = os.getenv("AGENT_NFT_CONTRACT", "")
        self.betting_pool_addr = os.getenv("ZK_BETTING_POOL_CONTRACT", "")
        self._w3 = None
        self._connected: Optional[bool] = None

    @property
    def w3(self):
        if self._w3 is None:
            self._w3 = _get_web3(self.rpc_url)
        return self._w3

    def is_configured(self) -> bool:
        return bool(self.rpc_url and (self.token_addr or self.agent_nft_addr))

    def is_connected(self) -> bool:
        if self._connected is None:
            self._connected = bool(self.w3)
        return self._connected

    def _contract(self, address: str, abi: list):
        if not self.w3 or not address:
            return None
        try:
            from web3 import Web3
            return self.w3.eth.contract(
                address=Web3.to_checksum_address(address), abi=abi
            )
        except Exception:
            return None

    def get_token_supply(self) -> Tuple[float, Optional[str]]:
        """Returns (total_supply_human, error_or_None)."""
        contract = self._contract(self.token_addr, ERC20_ABI)
        if contract is None:
            return (0.0, "not_configured")
        try:
            raw = contract.functions.totalSupply().call()
            decimals = contract.functions.decimals().call()
            return (raw / (10 ** decimals), None)
        except Exception as e:
            return (0.0, str(e))

    def get_token_balance(self, address: str) -> Tuple[float, Optional[str]]:
        """Returns (balance_human, error_or_None) for a wallet address."""
        contract = self._contract(self.token_addr, ERC20_ABI)
        if contract is None:
            return (0.0, "not_configured")
        try:
            from web3 import Web3
            checksum = Web3.to_checksum_address(address)
            raw = contract.functions.balanceOf(checksum).call()
            decimals = contract.functions.decimals().call()
            return (raw / (10 ** decimals), None)
        except Exception as e:
            return (0.0, str(e))

    def get_agent_nft_supply(self) -> Tuple[int, Optional[str]]:
        """Returns (total_minted_nfts, error_or_None)."""
        contract = self._contract(self.agent_nft_addr, ERC721_ABI)
        if contract is None:
            return (0, "not_configured")
        try:
            return (contract.functions.totalSupply().call(), None)
        except Exception as e:
            return (0, str(e))

    def get_agent_nft_balance(self, address: str) -> Tuple[int, Optional[str]]:
        """Returns (nft_count_for_address, error_or_None)."""
        contract = self._contract(self.agent_nft_addr, ERC721_ABI)
        if contract is None:
            return (0, "not_configured")
        try:
            from web3 import Web3
            checksum = Web3.to_checksum_address(address)
            return (contract.functions.balanceOf(checksum).call(), None)
        except Exception as e:
            return (0, str(e))

    def get_betting_pool_stats(self) -> Tuple[dict, Optional[str]]:
        """Returns (pool_stats_dict, error_or_None)."""
        contract = self._contract(self.betting_pool_addr, BETTING_POOL_ABI)
        if contract is None:
            return ({"total_volume": 0, "active_games": 0}, "not_configured")
        try:
            total_vol = contract.functions.totalVolume().call()
            active = contract.functions.activeGames().call()
            return ({"total_volume": total_vol / 1e18, "active_games": active}, None)
        except Exception as e:
            return ({"total_volume": 0, "active_games": 0}, str(e))

    def get_chain_status(self) -> dict:
        """Returns a status summary for the /health endpoint."""
        connected = self.is_connected()
        return {
            "connected": connected,
            "rpc_url": self.rpc_url if self.rpc_url else None,
            "contracts_configured": {
                "arena_token": bool(self.token_addr),
                "agent_nft": bool(self.agent_nft_addr),
                "zk_betting_pool": bool(self.betting_pool_addr),
            },
        }


# Singleton
blockchain = BlockchainService()
