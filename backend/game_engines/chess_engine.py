"""
AgentArena — Chess Game Engine
Full chess rules implementation using python-chess.
"""

import chess
import uuid
from typing import Dict, List, Optional
from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class ChessGame:
    """Represents a single chess game between two AI agents."""
    game_id: str
    agent_white: dict
    agent_black: dict
    board: chess.Board = field(default_factory=chess.Board)
    status: str = "active"  # active, checkmate, stalemate, draw, resigned
    move_history: List[dict] = field(default_factory=list)
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    winner: Optional[str] = None

    def to_dict(self) -> dict:
        return {
            "game_id": self.game_id,
            "agent_white": self.agent_white,
            "agent_black": self.agent_black,
            "fen": self.board.fen(),
            "status": self.status,
            "turn": "white" if self.board.turn == chess.WHITE else "black",
            "move_count": len(self.move_history),
            "move_history": self.move_history,
            "legal_moves": [m.uci() for m in self.board.legal_moves],
            "is_check": self.board.is_check(),
            "is_checkmate": self.board.is_checkmate(),
            "is_stalemate": self.board.is_stalemate(),
            "winner": self.winner,
            "created_at": self.created_at,
        }


class ChessEngine:
    """Manages multiple chess games and validates moves."""

    def __init__(self):
        self.games: Dict[str, ChessGame] = {}

    def create_game(self, agent_white: dict, agent_black: dict) -> ChessGame:
        """Create a new chess game between two agents."""
        game_id = str(uuid.uuid4())[:8]
        game = ChessGame(
            game_id=game_id,
            agent_white=agent_white,
            agent_black=agent_black,
        )
        self.games[game_id] = game
        return game

    def get_game(self, game_id: str) -> Optional[ChessGame]:
        return self.games.get(game_id)

    def get_legal_moves(self, game_id: str) -> List[str]:
        """Get all legal moves for the current position."""
        game = self.games.get(game_id)
        if not game:
            return []
        return [move.uci() for move in game.board.legal_moves]

    def make_move(self, game_id: str, move_uci: str) -> dict:
        """
        Validate and apply a move. Returns the result with game state.
        """
        game = self.games.get(game_id)
        if not game:
            return {"error": "Game not found"}
        if game.status != "active":
            return {"error": "Game is not active"}

        try:
            move = chess.Move.from_uci(move_uci)
        except ValueError:
            return {"error": f"Invalid move format: {move_uci}"}

        if move not in game.board.legal_moves:
            return {"error": f"Illegal move: {move_uci}"}

        # Capture info before move
        is_capture = game.board.is_capture(move)
        is_castling = game.board.is_castling(move)
        piece = game.board.piece_at(move.from_square)
        piece_name = chess.piece_name(piece.piece_type) if piece else "unknown"
        moving_side = "white" if game.board.turn == chess.WHITE else "black"

        # Apply the move
        san = game.board.san(move)
        game.board.push(move)

        # Record move history
        move_record = {
            "move_number": len(game.move_history) + 1,
            "side": moving_side,
            "uci": move_uci,
            "san": san,
            "piece": piece_name,
            "is_capture": is_capture,
            "is_castling": is_castling,
            "is_check": game.board.is_check(),
            "is_checkmate": game.board.is_checkmate(),
            "fen_after": game.board.fen(),
        }
        game.move_history.append(move_record)

        # Check game end conditions
        drama_score = 0
        if game.board.is_checkmate():
            game.status = "checkmate"
            game.winner = moving_side
            drama_score = 10
        elif game.board.is_stalemate():
            game.status = "stalemate"
            drama_score = 7
        elif game.board.is_fifty_moves():
            game.status = "draw"
            drama_score = 3
        elif game.board.is_repetition(3):
            game.status = "draw"
            drama_score = 3
        elif game.board.is_insufficient_material():
            game.status = "draw"
            drama_score = 2
        else:
            # Assign drama score based on move type
            if is_capture:
                drama_score = 5
            elif is_castling:
                drama_score = 4
            elif game.board.is_check():
                drama_score = 6
            else:
                drama_score = 2

        return {
            "success": True,
            "move": move_record,
            "game_state": game.to_dict(),
            "drama_score": drama_score,
            "commentary_hint": self._generate_commentary_hint(move_record, drama_score),
        }

    def _generate_commentary_hint(self, move: dict, drama_score: int) -> str:
        """Generate a hint for the commentary engine."""
        if move["is_checkmate"]:
            return f"CHECKMATE! {move['side'].upper()} delivers the final blow with {move['san']}!"
        if move["is_check"]:
            return f"{move['side'].upper()} plays {move['san']} — CHECK! The pressure is mounting!"
        if move["is_capture"]:
            return f"{move['side'].upper()} captures with {move['san']}! A {move['piece']} strikes!"
        if move["is_castling"]:
            return f"{move['side'].upper()} castles — fortifying the king's position."
        return f"{move['side'].upper()} plays {move['san']}."

    def resign(self, game_id: str, side: str) -> dict:
        """Handle a resignation."""
        game = self.games.get(game_id)
        if not game:
            return {"error": "Game not found"}
        game.status = "resigned"
        game.winner = "black" if side == "white" else "white"
        return {"success": True, "winner": game.winner}

    def get_board_evaluation(self, game_id: str) -> dict:
        """Simple material count evaluation."""
        game = self.games.get(game_id)
        if not game:
            return {"error": "Game not found"}

        piece_values = {
            chess.PAWN: 1, chess.KNIGHT: 3, chess.BISHOP: 3,
            chess.ROOK: 5, chess.QUEEN: 9, chess.KING: 0,
        }

        white_material = 0
        black_material = 0
        for square in chess.SQUARES:
            piece = game.board.piece_at(square)
            if piece:
                value = piece_values.get(piece.piece_type, 0)
                if piece.color == chess.WHITE:
                    white_material += value
                else:
                    black_material += value

        advantage = white_material - black_material
        return {
            "white_material": white_material,
            "black_material": black_material,
            "advantage": advantage,
            "advantage_side": "white" if advantage > 0 else "black" if advantage < 0 else "equal",
        }
