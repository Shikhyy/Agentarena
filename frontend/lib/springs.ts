/**
 * AgentArena v4 — Spring Config Library
 * Physics-based springs for all animations. No ease curves.
 */

export const SPRINGS = {
  /** UI panels — snappy materialise */
  panel: { mass: 1, tension: 300, friction: 26 },

  /** Agent movement — weighted walk */
  walk: { mass: 2, tension: 120, friction: 22 },

  /** Piece movement — chess/board pieces */
  piece: { mass: 1.5, tension: 200, friction: 20 },

  /** Number counters — satisfying count-up */
  counter: { mass: 1, tension: 60, friction: 18 },

  /** Camera — cinematic, slow */
  camera: { mass: 3, tension: 80, friction: 30 },

  /** Orb orbit — perpetual gentle */
  orbit: { mass: 1, tension: 40, friction: 15 },

  /** Quick UI micro-interaction */
  micro: { mass: 0.5, tension: 400, friction: 28 },
} as const;

/** Stagger delays for page-load sequence (ms) */
export const STAGGER = {
  background: 0,
  logo: 100,
  headline: 200,
  subheadline: 350,
  pills: 500,
  pillGap: 50,
  cta: 650,
  secondary: 800,
  interactive: 1000,
} as const;
