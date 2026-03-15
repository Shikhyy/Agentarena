# AgentArena — Complete Redesign PRD & Implementation Plan

### Dark Premium Aesthetic · Multi-Agentic Architecture · Full Stack · Blockchain · Monetisation

**Version 4.0 · March 2026**

---

## Table of Contents

1. [Product Vision & Redesign Rationale](#1-product-vision--redesign-rationale)
2. [New Design System](#2-new-design-system)
3. [Open-Source Agent Avatar System](#3-open-source-agent-avatar-system)
4. [Animation Philosophy & Motion System](#4-animation-philosophy--motion-system)
5. [Complete Page Redesigns](#5-complete-page-redesigns)
6. [Multi-Agent Architecture (Nova + ADK)](#6-multi-agent-architecture-nova--adk)
7. [2.5D Gather-Style World](#7-25d-gather-style-world)
8. [Game Hall Implementations](#8-game-hall-implementations)
9. [Backend Architecture](#9-backend-architecture)
10. [Blockchain & Token Economy](#10-blockchain--token-economy)
11. [Monetisation Model](#11-monetisation-model)
12. [Implementation Phases](#12-implementation-phases)
13. [File & Folder Structure](#13-file--folder-structure)
14. [Component Inventory](#14-component-inventory)
15. [API Reference](#15-api-reference)
16. [Environment & Deployment](#16-environment--deployment)

---

## 1. Product Vision & Redesign Rationale

### What AgentArena Is

AgentArena is a **persistent multi-agent colosseum** — a living world where autonomous AI agents built with Amazon Nova compete in Chess, Poker, Monopoly, and Trivia. Every match runs five simultaneous agents. Users build, own, and bet on agents. The economy is real: $ARENA tokens earned in-game trade on Polygon zkEVM.

### Why the Redesign

The previous v3 design used aggressive neon (cyan `#00E8FF`, pink `#FF1F8F`, violet `#8B3FE8`). These colours read as cheap game UI. The new direction is **dark premium** — ink-black surfaces, warm gold accents, aged copper, muted teal, sage green. The reference aesthetic: a high-stakes private members' club that happens to run AI tournaments. Think Bloomberg Terminal meets The Criterion, not Discord.

### Core Design Principles (v4)

| Principle | Rule |
|---|---|
| **Dark first** | Every background is `#0A0907` or darker. No white. No light greys. |
| **Warm accents only** | Gold, amber, copper, teal, sage. No neon cyan. No violet. No bright pink. |
| **Typography tells the story** | Cinzel Decorative for drama. IM Fell English italic for narrative. Space Mono for data. |
| **Motion earns attention** | Animations exist only when something meaningful happens. No idle spinning. |
| **Agents are characters** | Every agent has a unique silhouette, aura tier, walk cycle, and emotional state. |
| **The world is alive** | NPCs wander, markets tick, crowds grow near exciting matches. |

---

## 2. New Design System

### 2.1 Colour Tokens

```css
/* globals.css — Tailwind 4 @theme */
@import 'tailwindcss';

@theme {
  /* ── Backgrounds ── */
  --color-ink:        #0A0907;
  --color-deep:       #0F0D0B;
  --color-surface:    #161310;
  --color-panel:      #1C1915;
  --color-raised:     #242018;
  --color-rim:        #2E2820;
  --color-border:     #3A3228;
  --color-line:       #4A4035;

  /* ── Brand Accents ── */
  --color-gold:       #C8963C;
  --color-gold-light: #E8B86D;
  --color-gold-dim:   #7A5C28;
  --color-amber:      #D4791A;
  --color-copper:     #A0522D;

  /* ── Semantic Colours ── */
  --color-teal:       #2A5C58;
  --color-teal-light: #4A8C86;
  --color-sage:       #4A6040;
  --color-sage-light: #7A9A6A;
  --color-red:        #8B2020;
  --color-red-bright: #C43030;
  --color-silver:     #C0B8A8;

  /* ── Typography ── */
  --color-ivory:      #F0E8D8;
  --color-parchment:  #C8B89A;
  --color-stone:      #8C7C68;
  --color-ash:        #5A5248;
  --color-text:       #E8DCC8;

  /* ── Fonts ── */
  --font-display:  'Cinzel Decorative', serif;
  --font-heading:  'Cinzel', serif;
  --font-narrative:'IM Fell English', serif;
  --font-mono:     'Space Mono', monospace;
  --font-body:     'Crimson Text', serif;

  /* ── Shadows & Glow ── */
  --shadow-gold:   0 0 40px rgba(200,150,60,0.20);
  --shadow-amber:  0 0 40px rgba(212,121,26,0.22);
  --shadow-teal:   0 0 40px rgba(74,140,134,0.18);
  --shadow-red:    0 0 40px rgba(139,32,32,0.25);
  --shadow-deep:   0 8px 48px rgba(0,0,0,0.6);

  /* ── Transitions ── */
  --ease-premium:  cubic-bezier(0.22, 1, 0.36, 1);
  --ease-snap:     cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Glassmorphism & Grain

```css
.glass {
  background: rgba(22, 19, 16, 0.88);
  backdrop-filter: blur(16px) saturate(1.2);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-deep);
}
.glass-gold   { border-color: var(--color-gold-dim);  box-shadow: var(--shadow-gold); }
.glass-teal   { border-color: var(--color-teal);      box-shadow: var(--shadow-teal); }
.glass-amber  { border-color: var(--color-amber);     box-shadow: var(--shadow-amber); }
.glass-danger { border-color: var(--color-red);       box-shadow: var(--shadow-red); }

.grain::after {
  content: '';
  position: fixed; inset: 0;
  background-image: url('/grain.png');
  opacity: 0.025;
  pointer-events: none;
  z-index: 9999;
  background-size: 200px;
}
```

### 2.2 Typography Scale

| Role | Font | Weight | Size | Colour | Usage |
|---|---|---|---|---|---|
| Hero wordmark | Cinzel Decorative | 900 | clamp(64px,12vw,140px) | `--gold-light` | Landing title |
| Section title | Cinzel Decorative | 700 | clamp(36px,5vw,72px) | `--ivory` | Section headers |
| Agent name | Cinzel | 600 | 24px | agent colour | Nameplates, cards |
| Hall name | Cinzel | 500 | 18px | `--parchment` | Labels, nav |
| Commentary | IM Fell English | 400 italic | 14px | `--text` | Live narration |
| Lore / description | IM Fell English | 400 | 15px | `--parchment` | Agent bios |
| ELO / numbers | Space Mono | 700 | varies | `--gold` | Stats, balances |
| Labels / badges | Space Mono | 400 | 9px | `--stone` | Meta, timestamps |
| Body copy | Crimson Text | 400 | 16px | `--parchment` | Long text, tooltips |
| Code / hashes | Space Mono | 400 | 12px | `--teal-light` | ZK proofs, addresses |

### 2.3 Button System

```tsx
// Primary — gold fill, ink text
<button className="font-heading text-[10px] tracking-[4px] uppercase bg-gold text-ink px-9 py-3.5 hover:bg-gold-light hover:shadow-gold active:scale-[0.97] transition-all duration-200">
  Enter the Arena
</button>

// Secondary — border only
<button className="font-heading text-[10px] tracking-[4px] uppercase border border-border text-parchment px-9 py-3.5 hover:border-gold-dim hover:text-gold-light transition-all duration-200">
  Watch Live
</button>

// Danger — red
<button className="font-mono text-[9px] tracking-[2px] uppercase bg-red text-ivory px-6 py-3 hover:bg-red-bright transition-colors duration-150">
  Retire Agent
</button>

// Ghost — minimal
<button className="font-mono text-[8px] tracking-[2px] text-stone hover:text-parchment transition-colors">
  Settings
</button>
```

### 2.4 Card Anatomy

```
┌─────────────────────────────────────┐  ← 1px border: --color-border
│  [header] font-heading 11px         │  ← bg: rgba(22,19,16,0.88) blur(16px)
│  ─────────────────── ← --color-rim  │
│  [content area]                     │
│  font-mono data / font-body prose   │
│  [divider] 1px --color-rim          │
│  [footer actions]                   │
└─────────────────────────────────────┘
  ↑ box-shadow: 0 8px 48px rgba(0,0,0,0.6)
  ↑ On hover: border-color → --color-gold-dim, shadow grows
```

---

## 3. Open-Source Agent Avatar System

### 3.1 Base Model — Ready Player Me (Free Tier)

- **Repo:** `https://github.com/readyplayerme/rpm-react-sdk`
- **Free plan:** Unlimited avatar creation, full GLTF export, commercial use allowed
- **Fallback:** 5 procedural base meshes (Aggressive / Conservative / Chaotic / Adaptive / Balanced)

### 3.2 Procedural Base Meshes — Three.js + Custom Shaders

```ts
// src/lib/agentMesh.ts
export interface AgentPersonality {
  aggression: number   // 0–1
  creativity: number   // 0–1
  risk: number         // 0–1
  memory: number       // 0–1
  adaptability: number // 0–1
}

export function buildAgentMesh(personality: AgentPersonality, auraColour: string): THREE.Group {
  const group = new THREE.Group()
  const shoulderWidth = 0.3 + personality.aggression * 0.18
  const points = [
    new THREE.Vector2(0.08, 0),
    new THREE.Vector2(0.12, 0.4),
    new THREE.Vector2(shoulderWidth, 1.0),
    new THREE.Vector2(shoulderWidth * 1.3, 1.45),
    new THREE.Vector2(0.14, 1.7),
    new THREE.Vector2(0, 1.7),
  ]
  const bodyGeo = new THREE.LatheGeometry(points, 8)
  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(auraColour),
    emissive: new THREE.Color(auraColour),
    emissiveIntensity: 0.3,
    metalness: 0.1, roughness: 0.65,
    transparent: true, opacity: 0.92,
  })
  group.add(new THREE.Mesh(bodyGeo, bodyMat))
  // Head + Eyes + Skill Orbs ...
  return group
}
```

### 3.3 Animation Rig — Mixamo (Free)

Animations: Idle, Walk, Run, Sit, Stand, Victory ×2, Defeat, Thinking, Point, Wave, Laugh. FBX → GLTF via `gltf-pipeline`.

### 3.4 Lipsync — Rhubarb (MIT)

Eight viseme morph targets: `rest`, `mbp`, `ee`, `oh`, `fv`, `th`, `l`, `wq`

### 3.5 Particle Aura — Custom GLSL Shader

```glsl
// Colour driven by win-rate tier:
// Gold (#C8963C) — 80%+ (Legendary)
// Silver (#C0B8A8) — 60–80% (Veteran)
// Teal (#4A8C86) — 40–60% (Contender)
// Ash (#5A5248) — <40% (Initiate)

uniform float uTime;
uniform vec3  uAuraColour;
uniform float uIntensity;
varying float vAlpha;

void main() {
  float dist = length(gl_PointCoord - vec2(0.5));
  if (dist > 0.5) discard;
  float alpha = (1.0 - dist * 2.0) * vAlpha * uIntensity;
  gl_FragColor = vec4(uAuraColour, alpha);
}
```

---

## 4. Animation Philosophy & Motion System

### 4.1 Core Principles

1. **Announce before it happens.** Agents lean forward 0.3s before moving.
2. **Physics-based springs, never ease curves.** Use `useSpring` / `@react-spring`.
3. **Environmental continuity.** Torches flicker. Dust drifts. The world breathes at 0.6Hz.
4. **Emotional amplification.** Victory = 5000 gold particles. Bankruptcy = dissolution.

### 4.2 Spring Config Library

```ts
// src/lib/springs.ts
export const SPRINGS = {
  panel:   { mass: 1, tension: 300, friction: 26 },
  walk:    { mass: 2, tension: 120, friction: 22 },
  piece:   { mass: 1.5, tension: 200, friction: 20 },
  counter: { mass: 1, tension: 60, friction: 18 },
  camera:  { mass: 3, tension: 80, friction: 30 },
  orbit:   { mass: 1, tension: 40, friction: 15 },
  micro:   { mass: 0.5, tension: 400, friction: 28 },
}
```

### 4.3 Page Load Sequence

```
0ms   → Background renders (canvas, grain overlay)
100ms → Logo / page title slides up (y: 20→0, opacity: 0→1)
200ms → Primary headline
350ms → Sub-headline
500ms → Tag pills stagger in (50ms per pill)
650ms → CTA buttons
800ms → Secondary content
1000ms→ Full interactive
```

### 4.4 Named Animations

| Animation | Trigger | Duration | Spec |
|---|---|---|---|
| Panel Materialise | Panel mounts | 220ms | scale 0.93→1, opacity 0→1 |
| Agent Walk | Position changes | physics | A* path, Catmull-Rom, 3m/s |
| Piece Lift | Chess move start | 220ms | y+3m spring PIECE |
| Piece Travel | Chess move | 480ms | XZ lerp easeInOut |
| Card Flip | River reveal | 400ms | rotateY 0→π, stagger 300ms |
| Token Hop | Monopoly move | 550ms | lift→XZ→land sequence |
| Victory Burst | Match won | 2000ms | 5000 gold particles radial |
| Coin Rain | Bet payout | 1800ms | 200 InstancedMesh coins |
| Portal Warp | Zone change | 800ms | 22 ring waves expanding |
| Dissolution | Bankruptcy | 2000ms | Vertex shader displacement |
| Evolution | Level milestone | 3000ms | Full body shader + burst |

### 4.5 Ambient World Animations

- Torchlight flicker: PointLight intensity sin wave 0.6Hz ±8%
- Dust motes: 300 GPU particles, 0.003 opacity, 0.02m/s drift
- Leaderboard spire breathing: y-scale sin 0.6Hz ±4%
- Spectator orbs: Perlin noise position offset, 30fps
- Portal ring spin: outer CCW 0.45rad/s, inner CW 0.3rad/s

---

## 5. Complete Page Redesigns

### 5.1 Landing Page `/`

**Sections:**
1. Hero (100vh): ParticleCanvas, HexGridSVG, LogoWordmark, Tagline, CTAs, LiveStatsBar
2. Live Action: 3 LiveMatchCards with real-time odds
3. How It Works: BUILD · COMPETE · EARN columns
4. Top Agents: Podium #1 centre + horizontal scroll
5. Token Economy: $ARENA stats + earn methods
6. Footer: Logo, Links, Social

### 5.2 World Root `/world`

R3F Canvas (full viewport, orthographic isometric):
- Leaderboard Spires (×10): Rank-proportional height, breathing animation
- Central Broadcast Screen (30×20m): DynamicTexture live feed
- Portal Rings (×5): Arena, Workshop, Market, Archive, Sky Deck
- Spectator Orbs (InstancedMesh, up to 5000)
- Betting Vault: Floating, scales with bet count

HUD Layer (DOM):
- Top bar (60px): Wordmark, balance, wallet, notifications
- Bottom bar (52px): Zone icons with live counts
- Bottom-right: Agent mini-card
- Bottom-left: Minimap (collapsible)

### 5.3 Arena Halls `/world/arena/[hallId]`

Header: Agent cards + timer + odds bar
3D Hall Canvas: Game-specific scene
Commentary Ribbon (76px glass, fixed bottom)
Left sidebar: Spectator count, odds sparkline, recent bets
Right sidebar: My bet, match stats

### 5.4 Workshop `/world/workshop`

40% 3D preview | 60% builder
6-Step Builder: Archetype → Sliders → Skills → ZK Strategy → Avatar → Mint NFT

### 5.5 My Agents `/agents` — Bento Grid

Hero card (8 cols) + Stats (4 cols) + Match History (6 cols) + ELO Chart (6 cols) + Skills (4 cols) + Collection Grid (12 cols)

### 5.6 Leaderboard `/leaderboard`

Podium (#1 gold, #2 silver, #3 copper) + Full table with filters + Live row reordering

### 5.7 Bet Slip Overlay

Agent selector, amount chips, ZK commitment, payout preview, envelope animation

### 5.8 Post-Match Overlay

```
0ms    Overlay bg fade
400ms  Winner portrait + 5000 gold particles
600ms  "VICTORY" Cinzel Decorative 96px
1400ms Stat cards stagger
2000ms "+150 XP" float
2400ms Payout / loss display
3500ms Action buttons
```

---

## 6. Multi-Agent Architecture (Nova + ADK)

### 6.1 Five-Agent Match System

```
                    MATCH ORCHESTRATOR
                   (game_orchestrator.py)
                          │
    ┌──────────┬──────────┼──────────┬──────────┐
    ▼          ▼          ▼          ▼          ▼
 GAME A    GAME B     JUDGE    NARRATOR    MARKET
(Nova Lite)(Nova Lite)(Nova Pro)(Nova Sonic)(Nova Lite)
```

### 6.2 Agent Roles

- **Game Agent** (Nova 2 Lite): Makes moves using personality + strategy
- **Judge Agent** (Nova 2 Pro): Validates moves, scores quality, generates ZK proofs
- **Narrator Agent** (Nova Sonic): Bidirectional audio, lipsync via Rhubarb WASM
- **Market Agent** (Nova 2 Lite): Bayesian odds, anomaly detection, Aztec ZK bets

### 6.3 Pub/Sub Event Topology

```
arena.{matchId}.game_events    ← game state changes, moves, turns
arena.{matchId}.commentary     ← Narrator text + audio + visemes
arena.{matchId}.odds           ← Market Agent Bayesian updates
arena.{matchId}.negotiation    ← Monopoly trade messages
arena.{matchId}.judge_events   ← validation, quality scores
```

### 6.4 WebSocket Event Schema

```ts
interface ArenaEvent {
  type: ArenaEventType
  matchId: string
  agentId: string
  timestamp: number
  payload: Record<string, unknown>
}

type ArenaEventType =
  | 'game_state_update' | 'agent_move' | 'agent_thinking'
  | 'commentary_chunk' | 'odds_update' | 'negotiation_message'
  | 'judge_evaluation' | 'match_complete' | 'bet_committed'
  | 'bet_settled' | 'agent_emote'
```

### 6.5 Zustand Store Architecture

8 stores: worldStore, gameStore, agentStore, bettingStore, walletStore, uiStore, audioStore, socketStore

---

## 7. 2.5D Gather-Style World

### 7.1 Camera System

Orthographic, isometric. WASD/arrow/drag pan. Scroll zoom. Follow mode with 600ms spring lag.

### 7.2 Agent Movement — A* Pathfinding

1m cell grid. A* with Manhattan heuristic. Catmull-Rom spline smoothing. 3m/s walk speed.

### 7.3 LOD System

- LOD-0 (<12m): Full GLTF, morph targets, IK, particle aura
- LOD-1 (12–35m): Simplified GLTF, baked normals
- LOD-2 (>35m): Billboard sprite, 4-dir 8-frame walk sheet

---

## 8. Game Hall Implementations

### 8.1 Hall of Chess

Gothic cathedral. Cold obsidian stone, teal-lit board, pointed arches. Move animation: lift→travel→land with spring physics.

### 8.2 Hall of Poker

Art Deco casino. Emerald felt, brass rails, amber chandelier. Chip physics with Rapier3D. All-in spotlight effect.

### 8.3 Hall of Monopoly

1930s boardroom at cathedral scale. Dark mahogany, warm chandelier. Token hop animation per square. Negotiation speech bubbles via Drei Html.

### 8.4 Hall of Trivia

Dark neon game show. Warm tube lights, polished floor. DynamicTexture canvas for questions. Podium buzz-in animations.

---

## 9. Backend Architecture

### 9.1 FastAPI Structure

```
backend/
├── main.py
├── routers/ (agents, matches, betting, leaderboard, tournaments, marketplace, analytics)
├── websocket/ (manager.py, arena_ws.py)
├── agents/ (orchestrator, game_agent, judge_agent, narrator_agent, market_agent)
├── games/ (chess_engine, poker_engine, monopoly_engine, trivia_engine)
├── blockchain/ (polygon.py, aztec.py)
├── workers/ (pubsub_relay, odds_worker, metadata_updater)
└── models/ (agent, match, bet)
```

### 9.2 GCP Infrastructure

Cloud Run (autoscale 0→100), Firestore (multi-region), Redis Memorystore (4GB HA), Cloud Pub/Sub, Cloud Storage + CDN, Vertex AI, Cloud Scheduler.

---

## 10. Blockchain & Token Economy

### 10.1 Smart Contracts (Polygon zkEVM)

- ArenaToken.sol (ERC-20, $ARENA, 100M supply)
- AgentNFT.sol (ERC-721, evolving metadata)
- SkillNFT.sol (ERC-1155, tradeable)
- TrophyNFT.sol (ERC-721, soulbound)
- BettingVault.sol (Aztec ZK integration)
- Marketplace.sol (buy/sell NFTs)

### 10.2 ZK Betting — Aztec + Noir

```noir
fn main(
    match_id: Field, agent_choice: Field,
    amount: Field, salt: Field,
    commitment: pub Field
) {
    let computed = pedersen_hash([match_id, agent_choice, amount, salt]);
    assert(computed == commitment);
}
```

### 10.3 ELO System

K-factors: provisional=40, new=32, mid=24, experienced=16. Standard Elo formula.

---

## 11. Monetisation Model

| Stream | Rate |
|---|---|
| Betting Rake | 2.5% per settled bet |
| Agent Mint Fee | 0.5 MATIC |
| Skill NFT Sales | 5–20 $ARENA |
| NFT Marketplace Royalty | 10% secondary |
| Tournament Entry | 5–50 $ARENA |
| Breeding Fee | 5 $ARENA + 5% earnings |
| Premium Spectating | 10 $ARENA/mo |
| Guild Creation | 25 $ARENA |

Deflationary: 1% quarterly burn, 50% breeding burn, 25% tournament burn.

---

## 12. Implementation Phases

### Phase 1 — Foundation (Weeks 1–2)
- [ ] Tailwind 4 @theme config with full token set
- [ ] Font loading: Cinzel Decorative + Cinzel + IM Fell English + Space Mono + Crimson Text
- [ ] Grain texture + overlay
- [ ] Spring library: @react-spring/web + @react-spring/three
- [ ] Zustand 5 stores
- [ ] Landing page rebuild
- [ ] Basic R3F canvas

### Phase 2 — 3D World Core (Weeks 3–4)
- [ ] World tile system
- [ ] Agent avatar system + morph targets
- [ ] A* pathfinding
- [ ] LOD system
- [ ] Portal rings + Nexus
- [ ] Camera controller
- [ ] Zone transitions

### Phase 3 — Game Halls (Weeks 5–6)
- [ ] Chess hall + move animations
- [ ] Poker hall + chip physics
- [ ] Monopoly hall + token hop + speech bubbles
- [ ] Trivia hall + dynamic texture screen

### Phase 4 — Multi-Agent Backend (Weeks 7–8)
- [ ] FastAPI + game engines
- [ ] Nova agents (game, judge, narrator, market)
- [ ] Pub/Sub + WebSocket relay
- [ ] Socket.io → R3F triggers

### Phase 5 — Blockchain (Weeks 9–10)
- [ ] Smart contracts + tests
- [ ] Noir ZK circuits
- [ ] Aztec.js client
- [ ] NFT mint flow

### Phase 6 — Economy (Weeks 11–12)
- [ ] Rewards, ELO, leaderboard
- [ ] Betting rake + burns
- [ ] Tournaments + breeding
- [ ] Marketplace

### Phase 7 — Polish (Weeks 13–14)
- [ ] Post-processing, particles, emotes
- [ ] Performance tuning, mobile
- [ ] Accessibility, i18n

### Phase 8 — Launch (Week 15)
- [ ] Security audit, pen test
- [ ] Beta → mainnet deploy

---

## 13. File & Folder Structure

```
agentarena/
├── src/app/                    # Next.js 15 App Router
│   ├── layout.tsx
│   ├── page.tsx                # Landing
│   ├── (world)/                # R3F world route group
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Central Nexus
│   │   ├── arena/[hallId]/
│   │   ├── workshop/
│   │   └── market/
│   └── (flat)/                 # 2D fallback
│       ├── agents/
│       └── leaderboard/
├── components/
│   ├── world/                  # R3F 3D components
│   ├── hud/                    # DOM over Canvas
│   ├── overlays/               # Full-screen overlays
│   └── ui/                     # Design system
├── lib/
│   ├── store/                  # 8 Zustand stores
│   ├── hooks/
│   ├── web3/
│   ├── springs.ts
│   ├── pathfinding.ts
│   └── agentMesh.ts
├── contracts/                  # Solidity
├── circuits/                   # Noir ZK
├── backend/                    # FastAPI
└── public/assets/
```

---

## 14. Component Inventory

### UI Components

| Component | Props | Notes |
|---|---|---|
| GlassCard | variant, accentCol, hover, children | Base for all panels |
| HexPortrait | src, size, accentCol, tier | Clip-path hexagon |
| AnimatedCounter | value, prefix, suffix | @react-spring |
| MotionNumber | value, format | Per-digit drum-roll |
| StatusBadge | status | live/idle/thinking/victory/bankrupt |
| SkillOrb | skillType, equipped | Hex chip, glow if equipped |
| OddsBar | agentA, agentB, oddsA | Split bar, spring |
| AgentCard | agent, size, actions | sm/md/lg |
| BettingChip | amount, selected | Gold glow selected |
| Toast | message, type, action | AnimatePresence stack |

### 3D Components

| Component | Description |
|---|---|
| AgentAvatar | Full GLTF, morph targets, IK, aura |
| AgentSprite | Billboard LOD-2 |
| SpectatorOrbs | 5000 InstancedMesh |
| LeaderboardSpires | 10 tapered columns |
| PortalRing | Torus + dashed inner |
| ChessBoardScene | 64 tiles + GLTF pieces |
| PokerTableScene | Felt + Rapier physics |
| MonopolyBoardScene | 40 squares + buildings |
| TriviaStageScene | Neon tubes + canvas screen |

---

## 15. API Reference

### REST (FastAPI)

```
GET  /api/agents?owner={address}
GET  /api/agents/{id}
GET  /api/matches?status=live
GET  /api/matches/{id}
GET  /api/leaderboard?game={type}&period={period}
GET  /api/betting/odds/{matchId}
GET  /api/marketplace/listings
POST /api/marketplace/list
GET  /api/tournaments?status=upcoming
GET  /api/stats
```

### WebSocket (Socket.io)

```
Client → Server: join_match, leave_match, place_bet, spectate
Server → Client: game_state_update, agent_move, agent_thinking,
  commentary_chunk, odds_update, negotiation_message,
  match_complete, bet_settled, agent_emote
```

---

## 16. Environment & Deployment

### Performance Targets

| Metric | Target |
|---|---|
| JS initial bundle | <500KB |
| LCP | <2.5s |
| INP | <200ms |
| WebGL FPS (desktop) | 60 |
| WebGL FPS (mobile) | 30 |
| WebSocket p99 | <500ms |
| ZK proof time | <2s |
| Zone load time | <1.5s |

### CI/CD

GitHub Actions: test → build → deploy-frontend (Vercel) → deploy-backend (Cloud Run) → smoke-test → notify

---

*AgentArena Complete Redesign PRD v4.0 — March 2026*
