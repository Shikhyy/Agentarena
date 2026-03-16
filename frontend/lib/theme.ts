/**
 * AgentArena v4 — Dark Premium Theme Configuration
 * Warm gold, copper, teal, sage on ink-black surfaces
 */

/* ── 3D Material Colors ─────────────────────────────────── */
export const COLORS = {
  // Surfaces
  ink: "#0A0907",
  deep: "#0F0D0B",
  surface: "#161310",
  panel: "#1C1915",
  raised: "#242018",
  rim: "#2E2820",
  border: "#3A3228",
  line: "#4A4035",

  // 3D Materials
  floor: "#0F0D0B",
  grid: "#2E2820",
  gridSection: "#1C1915",
  structure: "#161310",
  structureDark: "#0F0D0B",
  fog: "#0A0907",

  // Text
  ivory: "#F0E8D8",
  parchment: "#C8B89A",
  stone: "#8C7C68",
  ash: "#5A5248",
  text: "#E8DCC8",
  textPrimary: "#F0E8D8",
  textSecondary: "#C8B89A",
  textMuted: "#8C7C68",
  textLabel: "#5A5248",

  // Brand Accents
  gold: "#C8963C",
  goldLight: "#E8B86D",
  goldDim: "#7A5C28",
  amber: "#D4791A",
  copper: "#A0522D",

  // Semantic
  teal: "#2A5C58",
  tealLight: "#4A8C86",
  sage: "#4A6040",
  sageLight: "#7A9A6A",
  red: "#8B2020",
  redBright: "#C43030",
  silver: "#C0B8A8",

  // Status
  live: "#C8963C",
  success: "#4A8C86",
  warning: "#D4791A",
  error: "#C43030",

  // Agent personalities — warm coded
  aggressive: "#C43030",
  conservative: "#4A8C86",
  chaotic: "#D4791A",
  adaptive: "#7A9A6A",

  // Rank tiers
  rankGold: "#C8963C",
  rankSilver: "#C0B8A8",
  rankBronze: "#A0522D",
  rankDefault: "#5A5248",

  // Elevated
  card: "#161310",
  elevated: "#1C1915",
  dim: "#242018",

  // Legacy compat aliases
  accent: "#C8963C",
  accentSoft: "#8C7C68",
  white: "#F0E8D8",
  background: "#0A0907",
  muted: "#1C1915",
} as const;

/* ── Zone Styling ────────────────────────────────────────── */
export const ZONE_COLORS: Record<string, string> = {
  "central-nexus": "#C8963C",
  "arena-chess": "#4A8C86",
  "arena-poker": "#C43030",
  "arena-monopoly": "#D4791A",
  workshop: "#4A8C86",
  marketplace: "#C8963C",
  "hall-of-fame": "#E8B86D",
  "grand-arena": "#C8963C",
  "archive": "#9B9BFF",
  "sky-deck": "#4DA6FF",
};

/* ── Aura color from win rate ────────────────────────────── */
export function getAuraColor(winRate: number): string {
  if (winRate >= 0.8) return COLORS.gold;       // Legendary
  if (winRate >= 0.6) return COLORS.silver;     // Veteran
  if (winRate >= 0.4) return COLORS.tealLight;  // Contender
  return COLORS.ash;                             // Initiate
}

/* ── Agent personality color ─────────────────────────────── */
export function getPersonalityColor(
  personality: "aggressive" | "conservative" | "chaotic" | "adaptive"
): string {
  return COLORS[personality];
}

/* ── Level badge color ───────────────────────────────────── */
export function getLevelColor(level: number): string {
  if (level >= 20) return COLORS.gold;
  if (level >= 10) return COLORS.tealLight;
  return COLORS.copper;
}

/* ── Glow Shadows ────────────────────────────────────────── */
export const SHADOWS = {
  gold: "0 0 40px rgba(200, 150, 60, 0.20)",
  amber: "0 0 40px rgba(212, 121, 26, 0.22)",
  teal: "0 0 40px rgba(74, 140, 134, 0.18)",
  red: "0 0 40px rgba(139, 32, 32, 0.25)",
  deep: "0 8px 48px rgba(0, 0, 0, 0.6)",
} as const;
