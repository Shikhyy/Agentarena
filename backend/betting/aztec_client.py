import os
import json
import subprocess
from typing import Dict, Any, Tuple

# AgentArena - Aztec/Noir Python Client
# Interacts with the local Nargo CLI to generate and verify ZK proofs
# for Bet Commitments and Strategy Vaults.

NOIR_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "contracts", "noir")
BET_COMMIT_DIR = os.path.join(NOIR_DIR, "bet_commit")
STRATEGY_VAULT_DIR = os.path.join(NOIR_DIR, "strategy_vault")

class AztecNoirClient:
    def __init__(self):
        # Ensure Nargo is in PATH or use absolute path
        self.nargo_bin = os.path.expanduser("~/.nargo/bin/nargo")
        
    def _run_nargo(self, cwd: str, args: list) -> Tuple[bool, str]:
        """Runs the nargo CLI command in the specified directory."""
        try:
            cmd = [self.nargo_bin] + args
            result = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, check=True)
            return True, result.stdout
        except subprocess.CalledProcessError as e:
            return False, e.stderr

    def _write_toml(self, filepath: str, data: Dict[str, Any]):
        """Writes inputs to a TOML file for Nargo to read."""
        with open(filepath, "w") as f:
            for k, v in data.items():
                if isinstance(v, str) and v.startswith("0x"):
                    # Hex string
                    f.write(f'{k} = "{v}"\n')
                elif isinstance(v, int):
                    # Nargo expects field elements as string literals if large, but u64/u8 as plain ints
                    # However, to be safe with Field types, we format as strings if needed, but for now:
                    f.write(f'{k} = {v}\n')
                elif isinstance(v, str):
                    f.write(f'{k} = "{v}"\n')

    def generate_bet_commit_proof(self, amount: int, position: int, secret: str, commitment: str) -> bool:
        """
        Generates a ZK proof that the (amount, position, secret) hashes to `commitment`.
        """
        prover_toml = os.path.join(BET_COMMIT_DIR, "Prover.toml")
        
        # Write inputs
        self._write_toml(prover_toml, {
            "amount": amount,
            "position": position,
            "secret": secret,
            "commitment": commitment
        })
        
        # Execute nargo execute (to generate witness) and nargo prove
        success_exec, exec_out = self._run_nargo(BET_COMMIT_DIR, ["execute", "witness"])
        if not success_exec:
            print(f"Failed to execute bet_commit: {exec_out}")
            return False
            
        success_prove, prove_out = self._run_nargo(BET_COMMIT_DIR, ["prove"])
        if not success_prove:
            print(f"Failed to prove bet_commit: {prove_out}")
            return False
            
        return True

    def verify_bet_commit_proof(self) -> bool:
        """Verifies the generated bet proof."""
        success, out = self._run_nargo(BET_COMMIT_DIR, ["verify"])
        return success

    def generate_strategy_proof(self, aggression: int, risk: int, bluff: int, secret: str, commitment: str) -> bool:
        """
        Generates a ZK proof for the strategy vault.
        """
        prover_toml = os.path.join(STRATEGY_VAULT_DIR, "Prover.toml")
        
        self._write_toml(prover_toml, {
            "aggression": aggression,
            "risk_tolerance": risk,
            "bluff_frequency": bluff,
            "secret": secret,
            "commitment": commitment
        })
        
        success_exec, exec_out = self._run_nargo(STRATEGY_VAULT_DIR, ["execute", "witness"])
        if not success_exec:
            print(f"Failed to execute strategy_vault: {exec_out}")
            return False
            
        success_prove, prove_out = self._run_nargo(STRATEGY_VAULT_DIR, ["prove"])
        return success_prove

    def verify_strategy_proof(self) -> bool:
        """Verifies the strategy proof."""
        success, out = self._run_nargo(STRATEGY_VAULT_DIR, ["verify"])
        return success

# Singleton client instance
aztec_client = AztecNoirClient()
