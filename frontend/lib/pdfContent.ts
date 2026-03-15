export const districtSpecs = [
  { zone: "Central Nexus", floor: "Dark obsidian with cyan emissive grid", audio: "Low synth + crowd murmur", objects: "Leaderboard spires, broadcast screen, betting vault, guide agent" },
  { zone: "Arena District", floor: "Brushed titanium, pink edge LEDs", audio: "Match bleed", objects: "4 hall entrances, live windows, crowd seating" },
  { zone: "Workshop", floor: "Matte concrete + holographic grid", audio: "Blueprint scan + machinery hum", objects: "Workbench, skill wall, strategy vault, breeding chamber" },
  { zone: "Market District", floor: "Art Deco marble + gold inlay", audio: "Ticker + jazz", objects: "Skill kiosks, NFT gallery, swap terminal" },
  { zone: "Archive District", floor: "Dark worn stone", audio: "Quiet ambient", objects: "Hall of Fame statues, replay theater, timeline wall" },
  { zone: "Sky Deck", floor: "Floating carbon-fiber platform", audio: "Wind + aerial crowd", objects: "Grand Prix stage, camera tower, premium seating" },
];

export const hallSpecs = {
  chess: {
    name: "Chess Hall",
    theme: "Gothic cathedral interior, obsidian-marble pieces",
    overlays: ["Check warning", "Move notation", "Eval bar", "Checkmate overlay"],
    scene: ["8x8 board", "Lift-translate-drop move animation", "Threat rays", "Thinking particles"],
  },
  poker: {
    name: "Poker Hall",
    theme: "Art Deco casino interior, felt table + brass rail",
    overlays: ["Hand strength", "Bluff meter", "Pot odds", "Side pots"],
    scene: ["Chip physics", "Card flip + deal animation", "All-in spotlight", "Pot display"],
  },
  monopoly: {
    name: "Monopoly Hall",
    theme: "Corporate boardroom at cathedral scale",
    overlays: ["Agent bar", "Board minimap", "Negotiation panel", "Event feed"],
    scene: ["120x120 board", "Ownership states", "Building growth", "Speech bubbles"],
  },
  trivia: {
    name: "Trivia Hall",
    theme: "Neon game show stage",
    overlays: ["Question screen", "Speed bonus", "Score tracker", "Audience poll"],
    scene: ["Neon tube banks", "LED question screen", "Podiums + buzzers", "Audience orbs"],
  },
} as const;

export const zkFlow = [
  { step: "1", title: "Lock Bet", desc: "User taps lock; button becomes GENERATING ZK PROOF" },
  { step: "2", title: "Noir Proof", desc: "Browser generates pedersen commitment" },
  { step: "3", title: "Aztec Commit", desc: "commitBet(commitment, matchId) transaction" },
  { step: "4", title: "Envelope Anim", desc: "Sealed envelope flies to arena vault" },
  { step: "5", title: "Vault Update", desc: "Badge increments + toast BET LOCKED" },
  { step: "6", title: "Match End", desc: "Judge agent posts result, reveal phase starts" },
  { step: "7", title: "Reveal+Settle", desc: "ZK reveal and payout settlement" },
];

export const postMatchTimeline = [
  { t: "0ms", what: "Overlay fade in + HUD hide" },
  { t: "400ms", what: "Winner portrait spring reveal" },
  { t: "600ms", what: "VICTORY text drop" },
  { t: "1000ms", what: "Aura spike" },
  { t: "1400ms", what: "Stats cards stagger" },
  { t: "2000ms", what: "XP counter and level burst" },
  { t: "2400ms", what: "Payout reveal or loss toast" },
  { t: "3500ms", what: "Actions: rematch/share/return" },
];
