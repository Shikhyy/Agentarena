/**
 * AgentArena — Centralized API Client
 * Automatically injects auth tokens and handles errors consistently.
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("agentarena_token");
}

function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, body: unknown) {
    super(`API error ${status}`);
    this.status = status;
    this.body = body;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let body: unknown;
    try { body = await res.json(); } catch { body = await res.text(); }
    throw new ApiError(res.status, body);
  }
  return res.json() as Promise<T>;
}

/** GET with auth */
export async function apiGet<T = any>(path: string): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, { headers: authHeaders() });
  return handleResponse<T>(res);
}

/** POST with auth */
export async function apiPost<T = any>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: "POST",
    headers: authHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(res);
}

/** Raw backend URL for WebSocket connections */
export function wsUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_BACKEND_WS_URL ||
    BACKEND_URL.replace(/^http/, "ws");
  return `${base}${path}`;
}

export { BACKEND_URL };
