"""
AgentArena — Trivia Engine
Question bank (20 questions per category), buzz-in logic, scoring.
Aesthetic: neon game show stage, two podiums, giant center screen.
"""

import random
import time
from dataclasses import dataclass, field
from typing import Optional, List, Dict

# ─── Question Bank ────────────────────────────────────────────────
QUESTION_BANK: Dict[str, List[dict]] = {
    "science": [
        {"q": "What is the speed of light in a vacuum?", "a": "299,792,458 m/s", "difficulty": 3},
        {"q": "What planet has the most moons?", "a": "Saturn", "difficulty": 2},
        {"q": "What is the atomic number of gold?", "a": "79", "difficulty": 3},
        {"q": "What particle has no electric charge?", "a": "Neutron", "difficulty": 2},
        {"q": "What is the powerhouse of the cell?", "a": "Mitochondria", "difficulty": 1},
        {"q": "What is the chemical symbol for iron?", "a": "Fe", "difficulty": 1},
        {"q": "What type of bond involves sharing electrons?", "a": "Covalent bond", "difficulty": 2},
        {"q": "What is absolute zero in Celsius?", "a": "-273.15°C", "difficulty": 3},
        {"q": "What is the half-life of Carbon-14?", "a": "5,730 years", "difficulty": 3},
        {"q": "What is the Heisenberg Uncertainty Principle?", "a": "Position and momentum cannot both be precisely known simultaneously", "difficulty": 4},
        {"q": "Who discovered penicillin?", "a": "Alexander Fleming", "difficulty": 2},
        {"q": "What is the SI unit of electrical resistance?", "a": "Ohm", "difficulty": 2},
        {"q": "What is the most abundant gas in Earth's atmosphere?", "a": "Nitrogen", "difficulty": 1},
        {"q": "What is the formula for water?", "a": "H2O", "difficulty": 1},
        {"q": "What force keeps planets in orbit around the sun?", "a": "Gravity", "difficulty": 1},
        {"q": "What is the name of the theory describing the universe's origin?", "a": "The Big Bang Theory", "difficulty": 2},
        {"q": "What is the smallest unit of matter?", "a": "Atom (or quark at subatomic level)", "difficulty": 2},
        {"q": "How many chromosomes does a human cell have?", "a": "46", "difficulty": 2},
        {"q": "What is the process by which plants make food?", "a": "Photosynthesis", "difficulty": 1},
        {"q": "What is the pH of a neutral solution?", "a": "7", "difficulty": 2},
    ],
    "history": [
        {"q": "In what year did World War II end?", "a": "1945", "difficulty": 1},
        {"q": "Who was the first US President?", "a": "George Washington", "difficulty": 1},
        {"q": "In what year did the Berlin Wall fall?", "a": "1989", "difficulty": 2},
        {"q": "Who wrote the Magna Carta?", "a": "English barons (forced on King John)", "difficulty": 3},
        {"q": "What empire did Julius Caesar lead?", "a": "Roman Empire", "difficulty": 1},
        {"q": "Who was the first person to walk on the moon?", "a": "Neil Armstrong", "difficulty": 1},
        {"q": "What year did the French Revolution begin?", "a": "1789", "difficulty": 2},
        {"q": "Who was the Egyptian queen who allied with Julius Caesar?", "a": "Cleopatra", "difficulty": 2},
        {"q": "What was the name of the ship that sank in 1912?", "a": "RMS Titanic", "difficulty": 1},
        {"q": "Who invented the telephone?", "a": "Alexander Graham Bell", "difficulty": 1},
        {"q": "What ancient wonder was located in Alexandria?", "a": "The Lighthouse of Alexandria", "difficulty": 3},
        {"q": "In what year did the Soviet Union dissolve?", "a": "1991", "difficulty": 2},
        {"q": "Who was the first female Prime Minister of the UK?", "a": "Margaret Thatcher", "difficulty": 2},
        {"q": "What civilization built Machu Picchu?", "a": "The Inca", "difficulty": 2},
        {"q": "What was the period of European exploration in the 15th/16th centuries called?", "a": "The Age of Discovery", "difficulty": 2},
        {"q": "Who led the Cuban Revolution?", "a": "Fidel Castro", "difficulty": 2},
        {"q": "What was the name of the first artificial satellite?", "a": "Sputnik 1", "difficulty": 2},
        {"q": "Who signed the Emancipation Proclamation?", "a": "Abraham Lincoln", "difficulty": 1},
        {"q": "What year did India gain independence from Britain?", "a": "1947", "difficulty": 2},
        {"q": "What was the name of the first computer?", "a": "ENIAC", "difficulty": 3},
    ],
    "geography": [
        {"q": "What is the capital of Australia?", "a": "Canberra", "difficulty": 2},
        {"q": "What is the longest river in the world?", "a": "The Nile", "difficulty": 2},
        {"q": "How many countries are in Africa?", "a": "54", "difficulty": 3},
        {"q": "What is the smallest country in the world?", "a": "Vatican City", "difficulty": 2},
        {"q": "What is the highest mountain in the world?", "a": "Mount Everest", "difficulty": 1},
        {"q": "What country has the most time zones?", "a": "France", "difficulty": 3},
        {"q": "What is the largest ocean?", "a": "Pacific Ocean", "difficulty": 1},
        {"q": "What river runs through Egypt?", "a": "The Nile", "difficulty": 1},
        {"q": "What is the capital of Brazil?", "a": "Brasília", "difficulty": 2},
        {"q": "What is the largest country by area?", "a": "Russia", "difficulty": 1},
        {"q": "What is the smallest continent?", "a": "Australia", "difficulty": 1},
        {"q": "What country shares the longest border with the US?", "a": "Canada", "difficulty": 1},
        {"q": "What sea is the saltiest in the world?", "a": "The Dead Sea", "difficulty": 2},
        {"q": "What mountain range contains Mount Everest?", "a": "The Himalayas", "difficulty": 2},
        {"q": "What is the capital of Japan?", "a": "Tokyo", "difficulty": 1},
        {"q": "What is the largest desert in the world?", "a": "Antarctica (cold desert)", "difficulty": 3},
        {"q": "What country has the most natural lakes?", "a": "Canada", "difficulty": 3},
        {"q": "What is the capital of Nigeria?", "a": "Abuja", "difficulty": 3},
        {"q": "What strait separates Europe from Africa?", "a": "Strait of Gibraltar", "difficulty": 2},
        {"q": "What is the largest island?", "a": "Greenland", "difficulty": 2},
    ],
    "crypto": [
        {"q": "Who created Bitcoin?", "a": "Satoshi Nakamoto", "difficulty": 1},
        {"q": "What year was Bitcoin's whitepaper published?", "a": "2008", "difficulty": 2},
        {"q": "What is Bitcoin's maximum supply?", "a": "21 million", "difficulty": 2},
        {"q": "What is a blockchain?", "a": "A distributed, immutable ledger of transactions", "difficulty": 1},
        {"q": "What is a smart contract?", "a": "Self-executing code on a blockchain", "difficulty": 1},
        {"q": "What consensus mechanism does Ethereum use post-Merge?", "a": "Proof of Stake", "difficulty": 2},
        {"q": "What is the ERC-20 standard?", "a": "A standard for fungible tokens on Ethereum", "difficulty": 2},
        {"q": "What does NFT stand for?", "a": "Non-Fungible Token", "difficulty": 1},
        {"q": "What network does AgentArena deploy on?", "a": "Polygon zkEVM", "difficulty": 2},
        {"q": "What is a ZK proof?", "a": "A cryptographic proof that a statement is true without revealing private data", "difficulty": 3},
        {"q": "What is DeFi?", "a": "Decentralized Finance", "difficulty": 1},
        {"q": "What is a 51% attack?", "a": "When a group controls >50% of mining/staking power", "difficulty": 3},
        {"q": "What is gas in Ethereum?", "a": "A fee for computational work on the network", "difficulty": 2},
        {"q": "What is a DAO?", "a": "Decentralized Autonomous Organization", "difficulty": 2},
        {"q": "What is the Aztec Network?", "a": "A ZK rollup for private transactions on Ethereum", "difficulty": 3},
        {"q": "What is a Pedersen hash?", "a": "A ZK-friendly hash function used in circuits", "difficulty": 4},
        {"q": "What is a cold wallet?", "a": "A hardware wallet disconnected from the internet", "difficulty": 1},
        {"q": "What is bridging in crypto?", "a": "Moving assets between different blockchain networks", "difficulty": 2},
        {"q": "What is yield farming?", "a": "Providing liquidity to earn rewards/interest", "difficulty": 2},
        {"q": "What is a merkle tree?", "a": "A hash-based data structure for efficiently verifying data integrity", "difficulty": 3},
    ],
    "pop_culture": [
        {"q": "What streaming platform produced Stranger Things?", "a": "Netflix", "difficulty": 1},
        {"q": "Who directed Inception?", "a": "Christopher Nolan", "difficulty": 2},
        {"q": "What year was the first iPhone released?", "a": "2007", "difficulty": 2},
        {"q": "Who plays Iron Man in the MCU?", "a": "Robert Downey Jr.", "difficulty": 1},
        {"q": "What game uses the phrase 'Battle Royale'?", "a": "Fortnite (popularized it)", "difficulty": 1},
        {"q": "What is the highest-grossing film of all time?", "a": "Avatar (2009)", "difficulty": 2},
        {"q": "Who founded Tesla?", "a": "Elon Musk (co-founded)", "difficulty": 2},
        {"q": "What anime series features characters called 'Titans'?", "a": "Attack on Titan", "difficulty": 1},
        {"q": "What company makes the PlayStation?", "a": "Sony", "difficulty": 1},
        {"q": "Who created the World Wide Web?", "a": "Tim Berners-Lee", "difficulty": 2},
        {"q": "What social network is known for 'tweets'?", "a": "Twitter (now X)", "difficulty": 1},
        {"q": "What programming language is Python named after?", "a": "Monty Python (comedy group)", "difficulty": 3},
        {"q": "What game features 'Among Us'?", "a": "Among Us", "difficulty": 1},
        {"q": "What tech giant owns YouTube?", "a": "Google (Alphabet)", "difficulty": 1},
        {"q": "Who created Minecraft?", "a": "Markus 'Notch' Persson", "difficulty": 2},
        {"q": "What is the best-selling video game of all time?", "a": "Minecraft", "difficulty": 2},
        {"q": "What is the name of Google's AI chatbot launched in 2023?", "a": "Bard / Gemini", "difficulty": 2},
        {"q": "Who is the CEO of OpenAI?", "a": "Sam Altman", "difficulty": 2},
        {"q": "What does AI stand for?", "a": "Artificial Intelligence", "difficulty": 1},
        {"q": "What year did ChatGPT launch publicly?", "a": "2022", "difficulty": 2},
    ],
}


@dataclass
class TriviaQuestion:
    question_id: str
    category: str
    question: str
    answer: str
    difficulty: int  # 1-4
    time_limit_seconds: int = 15
    points: int = 0

    def __post_init__(self):
        self.points = self.difficulty * 100


@dataclass
class AgentBuzzer:
    agent_id: str
    buzzed_at: Optional[float] = None
    answered: bool = False
    answer_correct: Optional[bool] = None


@dataclass
class TriviaRound:
    round_number: int
    question: TriviaQuestion
    started_at: float = field(default_factory=time.time)
    buzzers: Dict[str, AgentBuzzer] = field(default_factory=dict)
    winner_agent_id: Optional[str] = None
    completed: bool = False


@dataclass
class TriviaGameState:
    game_id: str
    agents: List[str]          # agent_ids
    scores: Dict[str, int]     # agent_id -> score
    current_round: int = 0
    total_rounds: int = 15
    rounds: List[TriviaRound] = field(default_factory=list)
    status: str = "waiting"    # waiting, active, completed
    winner_id: Optional[str] = None
    categories: List[str] = field(default_factory=list)


class TriviaEngine:
    """
    Trivia game engine for 2-6 agents.
    Questions drawn from 5 categories, escalating difficulty.
    Buzz-in logic: first to buzz gets to answer within 5 seconds.
    """

    def __init__(self):
        self.games: Dict[str, TriviaGameState] = {}

    def create_game(self, game_id: str, agent_ids: List[str], total_rounds: int = 15) -> TriviaGameState:
        """Initialize a new trivia game."""
        if len(agent_ids) < 2 or len(agent_ids) > 6:
            raise ValueError("Trivia requires 2-6 agents")

        state = TriviaGameState(
            game_id=game_id,
            agents=agent_ids,
            scores={agent_id: 0 for agent_id in agent_ids},
            total_rounds=total_rounds,
            categories=list(QUESTION_BANK.keys()),
        )
        self.games[game_id] = state
        return state

    def _draw_question(self, round_number: int) -> TriviaQuestion:
        """Draw a question. Difficulty scales with round number."""
        categories = list(QUESTION_BANK.keys())
        category = categories[round_number % len(categories)]
        questions = QUESTION_BANK[category]

        # Scale difficulty with round
        target_difficulty = min(4, (round_number // 3) + 1)
        matching = [q for q in questions if q["difficulty"] == target_difficulty]
        if not matching:
            matching = questions

        q = random.choice(matching)
        return TriviaQuestion(
            question_id=f"q_{round_number}_{category}",
            category=category,
            question=q["q"],
            answer=q["a"],
            difficulty=q["difficulty"],
            time_limit_seconds=max(8, 15 - (round_number // 5)),
        )

    def start_round(self, game_id: str) -> Optional[TriviaRound]:
        """Start the next round."""
        state = self.games.get(game_id)
        if not state:
            return None

        if state.current_round >= state.total_rounds:
            self._end_game(game_id)
            return None

        question = self._draw_question(state.current_round)
        round_obj = TriviaRound(
            round_number=state.current_round + 1,
            question=question,
            buzzers={a: AgentBuzzer(agent_id=a) for a in state.agents},
        )
        state.rounds.append(round_obj)
        state.current_round += 1
        state.status = "active"
        return round_obj

    def buzz_in(self, game_id: str, agent_id: str) -> dict:
        """Agent presses buzzer. First arrival wins the right to answer."""
        state = self.games.get(game_id)
        if not state or not state.rounds:
            return {"error": "No active round"}

        current_round = state.rounds[-1]
        if current_round.completed:
            return {"error": "Round already complete"}
        if current_round.winner_agent_id:
            return {"success": False, "message": f"Too slow! {current_round.winner_agent_id} buzzed first"}

        buzzer = current_round.buzzers.get(agent_id)
        if not buzzer:
            return {"error": "Agent not in game"}
        if buzzer.buzzed_at:
            return {"success": False, "message": "Already buzzed"}

        buzzer.buzzed_at = time.time()
        current_round.winner_agent_id = agent_id
        return {
            "success": True,
            "agent_id": agent_id,
            "time_to_answer_seconds": 5,
            "question": current_round.question.question,
        }

    def submit_answer(self, game_id: str, agent_id: str, answer: str) -> dict:
        """Submit an answer for the buzzed-in agent."""
        state = self.games.get(game_id)
        if not state or not state.rounds:
            return {"error": "No active round"}

        current_round = state.rounds[-1]
        if current_round.winner_agent_id != agent_id:
            return {"error": "You didn't buzz in first"}

        buzzer = current_round.buzzers[agent_id]
        if buzzer.answered:
            return {"error": "Already answered"}

        correct_answer = current_round.question.answer.lower().strip()
        given_answer = answer.lower().strip()

        # Flexible matching: check if key words match
        is_correct = (
            given_answer == correct_answer or
            given_answer in correct_answer or
            correct_answer in given_answer
        )

        buzzer.answered = True
        buzzer.answer_correct = is_correct

        if is_correct:
            points = current_round.question.points
            state.scores[agent_id] = state.scores.get(agent_id, 0) + points
            current_round.completed = True
            result_msg = f"✅ CORRECT! +{points} points"
        else:
            # Wrong answer — other agents can buzz in for half points
            penalty = current_round.question.points // 4
            state.scores[agent_id] = max(0, state.scores.get(agent_id, 0) - penalty)
            current_round.winner_agent_id = None  # Allow others to buzz
            result_msg = f"❌ WRONG! -{penalty} points. Other agents may buzz in."

        return {
            "correct": is_correct,
            "correct_answer": current_round.question.answer,
            "message": result_msg,
            "scores": state.scores,
            "round_complete": current_round.completed,
        }

    def timeout_round(self, game_id: str) -> dict:
        """Called when time runs out. No points awarded."""
        state = self.games.get(game_id)
        if not state or not state.rounds:
            return {"error": "No active round"}

        current_round = state.rounds[-1]
        current_round.completed = True
        return {
            "message": "Time's up! No points awarded.",
            "correct_answer": current_round.question.answer,
            "scores": state.scores,
        }

    def _end_game(self, game_id: str):
        """End the game and determine winner."""
        state = self.games.get(game_id)
        if not state:
            return

        state.status = "completed"
        if state.scores:
            state.winner_id = max(state.scores, key=state.scores.get)

    def get_state(self, game_id: str) -> Optional[dict]:
        """Get serializable game state."""
        state = self.games.get(game_id)
        if not state:
            return None

        current_round = state.rounds[-1] if state.rounds else None
        return {
            "game_id": state.game_id,
            "agents": state.agents,
            "scores": state.scores,
            "current_round": state.current_round,
            "total_rounds": state.total_rounds,
            "status": state.status,
            "winner_id": state.winner_id,
            "current_question": {
                "question": current_round.question.question,
                "category": current_round.question.category,
                "difficulty": current_round.question.difficulty,
                "time_limit": current_round.question.time_limit_seconds,
                "round_number": current_round.round_number,
                "buzzed_by": current_round.winner_agent_id,
            } if current_round and not current_round.completed else None,
        }


# Singleton
trivia_engine = TriviaEngine()
