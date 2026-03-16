"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { OddsBar } from "@/components/ui/OddsBar";
import { BettingChip } from "@/components/ui/BettingChip";
import { ZKLockIcon } from "@/components/ui/ZKLockIcon";
import { PostMatchOverlay } from "@/components/ui/PostMatchOverlay";
import { CommentaryRibbon } from "@/components/arena/CommentaryRibbon";
import { AgentThinkingStream } from "@/components/arena/AgentThinkingStream";
import { NegotiationPanel, type TradeOffer } from "@/components/arena/NegotiationPanel";
import { hallSpecs } from "@/lib/pdfContent";
import { apiGet, wsUrl } from "@/lib/api";
import { COLORS } from "@/lib/theme";

/* Lazy-load heavy 3D boards — avoids SSR and keeps initial bundle small */
const ChessBoard3D = dynamic(() => import("@/components/arena/ChessBoard3D"), { ssr: false });
const PokerTable3D = dynamic(() => import("@/components/arena/PokerTable3D"), { ssr: false });
const MonopolyBoard3D = dynamic(
  () => import("@/components/arena/MonopolyBoard3D").then((m) => ({ default: m.MonopolyBoard3D })),
  { ssr: false },
);
const TriviaBoard3D = dynamic(
  () => import("@/components/arena/TriviaBoard3D").then((m) => ({ default: m.TriviaBoard3D })),
  { ssr: false },
);

const BET_CHIPS = [1, 5, 10, 25, 50];

interface MatchState {
  matchId: string;
  agents: string[];
  status: string;
  round: number;
  fen?: string;
  activeColor?: "white" | "black";
  pot?: number;
  communityCards?: { label: string; suit: string }[];
  players?: { name: string; cards: { label: string; suit: string }[]; chips: number; isActive: boolean }[];
  playerPositions?: Record<number, number>;
  currentQuestion?: { question: string; category: string; difficulty: number; round_number: number; time_limit: number; buzzed_by: string | null } | null;
  scores?: Record<string, number>;
  totalRounds?: number;
  odds?: { a: number; b: number };
  spectators?: number;
  activeBets?: number;
  timePerTurn?: number;
}

const HALL_NAMES: Record<string, string> = {
  chess: "Hall of Chess",
  poker: "Hall of Poker",
  monopoly: "Hall of Monopoly",
  trivia: "Hall of Trivia",
};

export default function HallPage() {
  const params = useParams<{ hallId: string }>();
  const hallId = params?.hallId ?? "chess";
  const key = (hallId in hallSpecs ? hallId : "chess") as keyof typeof hallSpecs;
  const spec = hallSpecs[key];

  /* ── Match state ── */
  const [match, setMatch] = useState<MatchState | null>(null);
  const [commentary, setCommentary] = useState<string[]>(["Waiting for action..."]);
  const [loading, setLoading] = useState(true);
  const [lastMove, setLastMove] = useState<{ move: string; agentName: string; personality: string } | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  /* ── Post-match overlay ── */
  const [matchComplete, setMatchComplete] = useState<{
    winner: string;
    loser: string;
    stats: Record<string, unknown>;
  } | null>(null);

  /* ── Turn timer ── */
  const [turnTimer, setTurnTimer] = useState<number>(60);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timePerTurnRef = useRef<number>(60);

  /* ── Negotiations (Monopoly) ── */
  const [negotiations, setNegotiations] = useState<TradeOffer[]>([]);

  /* Fetch initial match data for this hall */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const liveMatches = await apiGet<any[]>("/matches/live");
        const hallMatch = liveMatches?.find(
          (m: any) => m.game_type === hallId || m.hallId === hallId
        );
        if (!cancelled && hallMatch) {
          setMatch({
            matchId: hallMatch.match_id || hallMatch.id,
            agents: hallMatch.agents || ["ZEUS", "ORACLE"],
            status: hallMatch.status || "live",
            round: hallMatch.round || 1,
            fen: hallMatch.fen,
            activeColor: hallMatch.active_color,
            pot: hallMatch.pot,
            communityCards: hallMatch.community_cards,
            players: hallMatch.players,
            playerPositions: hallMatch.player_positions,
            currentQuestion: hallMatch.current_question,
            scores: hallMatch.scores,
            totalRounds: hallMatch.total_rounds || 10,
            odds: hallMatch.odds || { a: 52, b: 48 },
            spectators: hallMatch.spectators || 0,
            activeBets: hallMatch.active_bets || 0,
          });
        }
      } catch {
        /* API unavailable — use demo state */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [hallId]);

  /* WebSocket for live updates */
  useEffect(() => {
    if (!match?.matchId) return;
    let ws: WebSocket;
    try {
      ws = new WebSocket(wsUrl(`/arenas/${match.matchId}/stream`));
      wsRef.current = ws;
      ws.onmessage = (e) => {
        try {
          const evt = JSON.parse(e.data);
          if (evt.type === "game_state_update") {
            setMatch((prev) => prev ? { ...prev, ...evt.payload } : prev);
          } else if (evt.type === "agent_move") {
            // Reset turn countdown on each new move
            setTurnTimer(timePerTurnRef.current);
            // Track last move for Gemini reasoning stream
            setLastMove({
              move: evt.payload?.move ?? evt.payload?.action ?? "unknown",
              agentName: evt.payload?.agent_name ?? agents[0],
              personality: evt.payload?.personality ?? "adaptive",
            });
            setMatch((prev) => prev ? { ...prev, ...evt.payload } : prev);
          } else if (evt.type === "commentary_chunk") {
            setCommentary((prev) => [...prev.slice(-19), evt.payload.text]);
          } else if (evt.type === "odds_update") {
            setMatch((prev) => prev ? { ...prev, odds: evt.payload } : prev);
          } else if (evt.type === "match_complete") {
            setMatchComplete({
              winner: evt.payload?.winner ?? agents[0],
              loser: evt.payload?.loser ?? agents[1],
              stats: evt.payload ?? {},
            });
          } else if (evt.type === "negotiation_message") {
            setNegotiations((prev) => {
              const offer: TradeOffer = {
                id: evt.payload?.id ?? `neg-${Date.now()}`,
                from: evt.payload?.from ?? "Agent",
                to: evt.payload?.to ?? "Agent",
                offerProperties: evt.payload?.offer_properties ?? [],
                offerCash: evt.payload?.offer_cash ?? 0,
                requestProperties: evt.payload?.request_properties ?? [],
                requestCash: evt.payload?.request_cash ?? 0,
                message: evt.payload?.message ?? "",
                timestamp: evt.payload?.timestamp ?? Date.now(),
                status: evt.payload?.status ?? "pending",
              };
              return [...prev.slice(-9), offer];
            });
          }
        } catch { /* ignore parse errors */ }
      };
    } catch { /* WS unavailable */ }
    return () => { ws?.close(); };
  }, [match?.matchId]);

  /* ── Sync timePerTurn ref so WS handler always resets to the correct duration ── */
  useEffect(() => {
    timePerTurnRef.current = match?.timePerTurn ?? 60;
  }, [match?.timePerTurn]);

  /* ── Turn timer countdown (ticks every second; reset via setTurnTimer in WS handler) ── */
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTurnTimer((t) => Math.max(0, t - 1));
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  /* ── Betting ── */
  const [selectedChip, setSelectedChip] = useState(10);
  const [betLocked, setBetLocked] = useState(false);
  const payout = useMemo(() => Math.round(selectedChip * 2.4), [selectedChip]);

  const handleLockBet = useCallback(() => {
    setBetLocked(true);
    // TODO: Wire to ZKBetFlow / Aztec commitment
  }, []);

  /* ── Derived values ── */
  const agents = match?.agents ?? ["ZEUS", "ORACLE"];
  const odds = match?.odds ?? { a: 52, b: 48 };
  const round = match?.round ?? 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: COLORS.ink }}>
      {/* ── Top: Match Header ── */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 24px", borderBottom: `1px solid ${COLORS.border}`,
        background: `${COLORS.surface}ee`, backdropFilter: "blur(16px)",
        zIndex: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/world" style={{ color: COLORS.stone, textDecoration: "none", fontSize: 12, fontFamily: "var(--font-mono)" }}>
            ← World
          </Link>
          <h2 className="heading" style={{ margin: 0, fontSize: 20, color: COLORS.ivory }}>
            {HALL_NAMES[hallId] || spec.name}
          </h2>
          <span className="mono" style={{ fontSize: 10, color: COLORS.stone, letterSpacing: "0.1em" }}>
            ROUND {round}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", gap: 16 }}>
            <span className="mono" style={{ fontSize: 11, color: COLORS.parchment }}>
              👁 {match?.spectators ?? 1247}
            </span>
            <span className="mono" style={{ fontSize: 11, color: COLORS.gold }}>
              🎯 {match?.activeBets ?? 318} bets
            </span>
          </div>
          {/* Turn Timer */}
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "4px 12px",
            border: `1px solid ${turnTimer < 30 ? COLORS.redBright ?? "#C43030" : COLORS.border}`,
            borderRadius: 4,
            background: turnTimer < 30 ? "rgba(139,32,32,0.18)" : "transparent",
            transition: "border-color 0.3s, background 0.3s",
            animation: turnTimer < 10 ? "pulse 0.8s ease-in-out infinite" : "none",
          }}>
            <span style={{ fontSize: 10, color: COLORS.stone, fontFamily: "var(--font-mono)", letterSpacing: "0.08em" }}>TURN</span>
            <span className="mono" style={{
              fontSize: 15, fontWeight: 700,
              color: turnTimer < 30 ? (COLORS.redBright ?? "#C43030") : COLORS.gold,
              minWidth: 28, textAlign: "right",
            }}>
              {turnTimer}s
            </span>
          </div>
        </div>
      </header>

      {/* ── Main: 3D Board + Sidebars ── */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "280px 1fr 280px", minHeight: 0 }}>
        {/* Left Sidebar — Agents + Odds */}
        <aside style={{
          padding: 16, borderRight: `1px solid ${COLORS.border}`,
          background: `${COLORS.deep}ee`, overflowY: "auto",
        }}>
          <div style={{ marginBottom: 16 }}>
            <p className="kicker">{agents[0]} vs {agents[1]}</p>
            <OddsBar a={odds.a} b={odds.b} leftLabel={agents[0]} rightLabel={agents[1]} />
          </div>

          <GlassCard>
            <p className="kicker" style={{ marginBottom: 8 }}>Match Info</p>
            <div className="stat-row">
              <div className="stat-card">
                <div className="kicker">Round</div>
                <div className="k-value">{round}</div>
              </div>
              <div className="stat-card">
                <div className="kicker">Status</div>
                <div className="k-value" style={{ color: COLORS.gold }}>{match?.status ?? "live"}</div>
              </div>
            </div>
          </GlassCard>

          <GlassCard style={{ marginTop: 12 }}>
            <p className="kicker" style={{ marginBottom: 6 }}>Hall Details</p>
            <p className="muted" style={{ fontSize: 12 }}>{spec.theme}</p>
            <ul style={{ margin: "8px 0 0", paddingLeft: 16 }}>
              {spec.scene.slice(0, 4).map((item) => (
                <li key={item} className="muted" style={{ marginBottom: 3, fontSize: 11 }}>{item}</li>
              ))}
            </ul>
          </GlassCard>
        </aside>

        {/* Center — 3D Game Board */}
        <main style={{ position: "relative", minHeight: 0, overflow: "hidden" }}>
          {loading ? (
            <div style={{ display: "grid", placeItems: "center", height: "100%", color: COLORS.stone }}>
              <div className="mono" style={{ fontSize: 12 }}>Loading {HALL_NAMES[hallId]}...</div>
            </div>
          ) : (
            <GameBoard
              hallId={hallId}
              agents={agents}
              activeColor={match?.activeColor}
              fen={match?.fen}
              pot={match?.pot}
              communityCards={match?.communityCards}
              players={match?.players}
              playerPositions={match?.playerPositions}
              currentQuestion={match?.currentQuestion}
              scores={match?.scores}
              totalRounds={match?.totalRounds}
              round={round}
            />
          )}

          {/* Commentary Ribbon */}
          <CommentaryRibbon transcripts={commentary} isActive={true} />
        </main>

        {/* Right Sidebar — Bet Slip */}
        <aside style={{
          padding: 16, borderLeft: `1px solid ${COLORS.border}`,
          background: `${COLORS.deep}ee`, overflowY: "auto",
        }}>
          <GlassCard accent="gold">
            <p className="kicker">Bet Slip — ZK Private</p>
            <div style={{ margin: "8px 0" }}>
              <ZKLockIcon locked={betLocked} txHash={betLocked ? "0x8a32...e11" : undefined} />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
              {BET_CHIPS.map((chip) => (
                <div key={chip} onClick={() => !betLocked && setSelectedChip(chip)} style={{ cursor: betLocked ? "default" : "pointer" }}>
                  <BettingChip amount={chip} selected={selectedChip === chip} />
                </div>
              ))}
            </div>
            <p className="mono" style={{ marginTop: 14, color: COLORS.goldLight }}>
              Potential Win: +{payout} ARENA
            </p>
            <p className="mono muted" style={{ fontSize: 10 }}>
              Rake 2.5% · Commitment via Noir + Aztec
            </p>
            <button
              type="button"
              className="btn btn-gold"
              style={{ marginTop: 10, width: "100%", opacity: betLocked ? 0.5 : 1 }}
              onClick={handleLockBet}
              disabled={betLocked}
            >
              {betLocked ? "Bet Locked ✓" : "Lock Bet (ZK Private)"}
            </button>
          </GlassCard>

          <div style={{ marginTop: 16 }}>
            <Link href="/match-result" className="btn" style={{ width: "100%", textAlign: "center", display: "block" }}>
              View Last Result
            </Link>
          </div>

          {/* Gemini Agent Reasoning — live move explanations */}
          <div style={{ marginTop: 16 }}>
            <AgentThinkingStream
              agentName={lastMove?.agentName ?? agents[0]}
              personality={lastMove?.personality ?? "adaptive"}
              gameType={hallId}
              move={lastMove?.move ?? null}
              opponentName={agents[1]}
              gameState={match ? { fen: match.fen, round: match.round } : {}}
            />
          </div>

          {/* Monopoly Negotiation Panel */}
          {hallId === "monopoly" && (
            <div style={{ marginTop: 16 }}>
              <NegotiationPanel
                negotiations={negotiations}
                myAgentId={agents[0]}
              />
            </div>
          )}
        </aside>
      </div>

      {/* ── Post-Match Overlay ── */}
      {matchComplete && (
        <PostMatchOverlay
          visible={true}
          result={{
            winner: (matchComplete.stats?.winner_side as "a" | "b") ?? "a",
            agentName: matchComplete.winner,
            gameType: hallId,
            round: round,
            method: (matchComplete.stats?.method as string) ?? "Decisive",
            eloBefore: (matchComplete.stats?.elo_before as number) ?? 1200,
            eloAfter: (matchComplete.stats?.elo_after as number) ?? 1224,
            winRateBefore: (matchComplete.stats?.win_rate_before as number) ?? 0.5,
            winRateAfter: (matchComplete.stats?.win_rate_after as number) ?? 0.52,
            winsBefore: (matchComplete.stats?.wins_before as number) ?? 0,
            winsAfter: (matchComplete.stats?.wins_after as number) ?? 1,
            matchBonus: (matchComplete.stats?.match_bonus as number) ?? 50,
            betPayout: (matchComplete.stats?.bet_payout as number) ?? 0,
            walletAddress: matchComplete.stats?.wallet_address as string | undefined,
          }}
          onClose={() => setMatchComplete(null)}
        />
      )}
    </div>
  );
}

/* ── Game Board Renderer ── */
function GameBoard({
  hallId, agents, activeColor, fen, pot, communityCards,
  players, playerPositions, currentQuestion, scores, totalRounds, round,
}: {
  hallId: string;
  agents: string[];
  activeColor?: "white" | "black";
  fen?: string;
  pot?: number;
  communityCards?: { label: string; suit: string }[];
  players?: { name: string; cards: { label: string; suit: string }[]; chips: number; isActive: boolean }[];
  playerPositions?: Record<number, number>;
  currentQuestion?: MatchState["currentQuestion"];
  scores?: Record<string, number>;
  totalRounds?: number;
  round: number;
}) {
  const boardStyle = { width: "100%", height: "100%" };

  switch (hallId) {
    case "chess":
      return (
        <div style={boardStyle}>
          <ChessBoard3D
            agentWhite={agents[0]}
            agentBlack={agents[1]}
            activeColor={activeColor ?? "white"}
            fen={fen}
          />
        </div>
      );

    case "poker":
      return (
        <div style={boardStyle}>
          <PokerTable3D
            players={players}
            pot={pot ?? 540}
            communityCards={communityCards}
          />
        </div>
      );

    case "monopoly":
      return (
        <div style={boardStyle}>
          <MonopolyBoard3D playerPositions={playerPositions ?? {}} />
        </div>
      );

    case "trivia":
      return (
        <div style={boardStyle}>
          <TriviaBoard3D
            scores={scores ?? {}}
            currentQuestion={currentQuestion ?? null}
            agents={agents}
            currentRound={round}
            totalRounds={totalRounds ?? 10}
          />
        </div>
      );

    default:
      return (
        <div style={{ display: "grid", placeItems: "center", height: "100%", color: COLORS.stone }}>
          <p className="mono">Unknown hall: {hallId}</p>
        </div>
      );
  }
}
