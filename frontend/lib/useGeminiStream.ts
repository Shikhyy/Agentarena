/**
 * AgentArena — Gemini AI Streaming Hook
 *
 * useGeminiStream: streams SSE from backend Gemini endpoints
 * useAgentReasoning: get live agent move reasoning
 * useMatchAnalysis: post-match narrative analysis
 * useAgentBio: generate agent biography
 * useStrategyTip: daily strategy tip
 */

"use client";

import { useState, useCallback, useRef } from "react";
import { BACKEND_URL } from "./api";

// ── SSE Streaming ───────────────────────────────────────────────────

interface StreamState {
  text: string;
  isStreaming: boolean;
  isDone: boolean;
  error: string | null;
}

/**
 * Core SSE streaming hook.
 * Calls a backend endpoint that returns text/event-stream.
 * Each SSE data line must be JSON: { token: string, done: boolean, error?: string }
 */
export function useGeminiStream() {
  const [state, setState] = useState<StreamState>({
    text: "",
    isStreaming: false,
    isDone: false,
    error: null,
  });
  const abortRef = useRef<AbortController | null>(null);

  const stream = useCallback(
    async (endpoint: string, body: unknown) => {
      // Cancel any in-flight request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setState({ text: "", isStreaming: true, isDone: false, error: null });

      try {
        const res = await fetch(`${BACKEND_URL}${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`Gemini endpoint error: ${res.status}`);
        }

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) throw new Error("No response body");

        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const parsed = JSON.parse(line.slice(6));
              if (parsed.error) {
                setState((s) => ({ ...s, error: parsed.error, isStreaming: false, isDone: true }));
                return;
              }
              if (parsed.token) {
                accumulated += parsed.token;
                setState((s) => ({ ...s, text: accumulated }));
              }
              if (parsed.done) {
                setState((s) => ({
                  ...s,
                  text: parsed.full_text || accumulated,
                  isStreaming: false,
                  isDone: true,
                }));
                return;
              }
            } catch {
              // Skip malformed SSE lines
            }
          }
        }

        setState((s) => ({ ...s, isStreaming: false, isDone: true }));
      } catch (err: unknown) {
        if ((err as Error)?.name === "AbortError") return;
        setState((s) => ({
          ...s,
          isStreaming: false,
          isDone: true,
          error: (err as Error)?.message ?? "Stream failed",
        }));
      }
    },
    [],
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState({ text: "", isStreaming: false, isDone: false, error: null });
  }, []);

  return { ...state, stream, reset };
}

// ── GET streaming (strategy tips) ───────────────────────────────────

export function useGeminiGetStream() {
  const [state, setState] = useState<StreamState>({
    text: "",
    isStreaming: false,
    isDone: false,
    error: null,
  });

  const streamGet = useCallback(async (endpoint: string) => {
    setState({ text: "", isStreaming: true, isDone: false, error: null });
    try {
      const res = await fetch(`${BACKEND_URL}${endpoint}`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No body");
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.token) { acc += parsed.token; setState((s) => ({ ...s, text: acc })); }
            if (parsed.done) { setState((s) => ({ ...s, text: parsed.full_text || acc, isStreaming: false, isDone: true })); return; }
          } catch { /* skip */ }
        }
      }
      setState((s) => ({ ...s, isStreaming: false, isDone: true }));
    } catch (err: unknown) {
      setState((s) => ({ ...s, isStreaming: false, error: (err as Error)?.message ?? "Failed" }));
    }
  }, []);

  return { ...state, streamGet };
}

// ── Specific Gemini hooks ────────────────────────────────────────────

interface AgentReasoningPayload extends Record<string, unknown> {
  game_type: string;
  agent_name: string;
  personality?: string;
  move: string;
  game_state?: Record<string, unknown>;
  opponent_name?: string;
}

/**
 * Streams agent move reasoning from /gemini/agent-reasoning
 */
export function useAgentReasoning() {
  const { text, isStreaming, isDone, error, stream, reset } = useGeminiStream();

  const generateReasoning = useCallback(
    (payload: AgentReasoningPayload) => stream("/gemini/agent-reasoning", payload),
    [stream],
  );

  return { reasoning: text, isStreaming, isDone, error, generateReasoning, reset };
}

interface MatchAnalysisPayload extends Record<string, unknown> {
  game_type: string;
  winner_name: string;
  loser_name: string;
  move_count: number;
  key_moments?: string[];
  final_scores?: Record<string, unknown>;
  match_duration_seconds?: number;
}

/**
 * Streams post-match analysis from /gemini/match-analysis
 */
export function useMatchAnalysis() {
  const { text, isStreaming, isDone, error, stream, reset } = useGeminiStream();

  const analyzeMatch = useCallback(
    (payload: MatchAnalysisPayload) => stream("/gemini/match-analysis", payload),
    [stream],
  );

  return { analysis: text, isStreaming, isDone, error, analyzeMatch, reset };
}

interface AgentBioPayload extends Record<string, unknown> {
  agent_name: string;
  personality: string;
  skills?: string[];
  elo?: number;
  win_rate?: number;
  game_type?: string;
  level?: number;
}

/**
 * Fetches a generated agent bio (JSON, not streamed) from /gemini/agent-bio
 */
export function useAgentBio() {
  const [bio, setBio] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateBio = useCallback(async (payload: AgentBioPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/gemini/agent-bio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setBio(data.bio || "");
    } catch (err: unknown) {
      setError((err as Error)?.message ?? "Failed");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { bio, isLoading, error, generateBio };
}

/**
 * Streams a strategy tip from /gemini/strategy-tip
 */
export function useStrategyTip() {
  const { text, isStreaming, isDone, error, streamGet } = useGeminiGetStream();

  const getStrategyTip = useCallback(
    (gameType: string, skillLevel: string = "intermediate") =>
      streamGet(`/gemini/strategy-tip?game_type=${gameType}&skill_level=${skillLevel}`),
    [streamGet],
  );

  return { tip: text, isStreaming, isDone, error, getStrategyTip };
}
