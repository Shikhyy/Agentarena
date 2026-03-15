"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SkillOrb } from "@/components/ui/SkillOrb";
import { ZKLockIcon } from "@/components/ui/ZKLockIcon";
import { STAGGER } from "@/lib/springs";

const archetypes = [
  { id: "aggressive", name: "Aggressive", desc: "Strike first, dominate the tempo. High risk, high reward." },
  { id: "conservative", name: "Conservative", desc: "Patience wins. Minimise exposure, maximise efficiency." },
  { id: "chaotic", name: "Chaotic", desc: "Unpredictable by nature. No pattern to exploit." },
  { id: "adaptive", name: "Adaptive", desc: "Read the room. Mirror and counter every opponent." },
  { id: "balanced", name: "Balanced", desc: "All skills, no weakness. The generalist advantage." },
];

const steps = ["Archetype", "Personality", "Skills", "Strategy", "Avatar", "Mint"];

export default function BuilderPage() {
  const [active, setActive] = useState(0);
  const [archetype, setArchetype] = useState<string | null>(null);
  const [sliders, setSliders] = useState({ aggression: 50, creativity: 50, risk: 50 });

  return (
    <div className="min-h-screen bg-[var(--color-deep)] p-6 pt-20">
      {/* Header */}
      <motion.section
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: STAGGER.headline / 1000, duration: 0.5 }}
      >
        <p className="font-mono text-[9px] tracking-[4px] uppercase text-[var(--color-stone)] mb-2">
          Workshop · Agent Forge
        </p>
        <h2 className="font-display text-5xl text-[var(--color-ivory)] tracking-wide">
          Build Your Agent
        </h2>
        <p className="font-narrative italic text-[var(--color-parchment)] mt-2 max-w-xl">
          Six steps from concept to colosseum. Choose wisely — your strategy is sealed by zero-knowledge proof.
        </p>
      </motion.section>

      {/* Main Grid: 40% Preview | 60% Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left — 3D Preview */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: STAGGER.secondary / 1000, duration: 0.5 }}
        >
          <GlassCard accent="teal" glowIntensity={0.4}>
            <p className="font-mono text-[9px] tracking-[3px] uppercase text-[var(--color-stone)] mb-3">
              Live Preview
            </p>
            <div
              className="border border-[var(--color-border)] rounded min-h-[380px] grid place-items-center"
              style={{
                background: "radial-gradient(circle at 50% 30%, rgba(42,92,88,0.18), transparent 60%)",
              }}
            >
              <div className="text-center">
                <div className="font-display text-[88px] text-[var(--color-gold)] leading-none">A</div>
                <p className="font-narrative italic text-[var(--color-stone)] text-sm mt-2">
                  {archetype ? `${archetype} archetype` : "Select an archetype to begin"}
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-mono text-[var(--color-stone)] tracking-wider">ROTATION</span>
                <span className="font-mono text-[var(--color-teal-light)]">2 rpm idle</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="font-mono text-[var(--color-stone)] tracking-wider">AURA</span>
                <span className="font-mono text-[var(--color-gold)]">Win-rate tier band</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="font-mono text-[var(--color-stone)] tracking-wider">ORBIT</span>
                <span className="font-mono text-[var(--color-parchment)]">Inspect all angles</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Right — 6-Step Builder */}
        <motion.div
          className="lg:col-span-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: STAGGER.secondary / 1000, duration: 0.5 }}
        >
          <GlassCard glowIntensity={0.3}>
            {/* Step Navigation */}
            <div className="flex flex-wrap gap-2 mb-6">
              {steps.map((step, idx) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => setActive(idx)}
                  className={`px-4 py-2 text-[10px] font-heading tracking-[3px] uppercase border rounded transition-all duration-200 ${
                    active === idx
                      ? "border-[var(--color-gold)] text-[var(--color-gold)] bg-[var(--color-gold)]/10 shadow-[var(--shadow-gold)]"
                      : "border-[var(--color-border)] text-[var(--color-stone)] hover:border-[var(--color-gold-dim)] hover:text-[var(--color-parchment)]"
                  }`}
                >
                  {idx + 1}. {step}
                </button>
              ))}
            </div>

            {/* Step Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="border border-[var(--color-border)] rounded p-5"
              >
                {/* Step 1: Archetype */}
                {active === 0 && (
                  <div>
                    <h3 className="font-heading text-xl text-[var(--color-ivory)] mb-1">Choose Archetype</h3>
                    <p className="font-narrative italic text-[var(--color-stone)] text-sm mb-4">
                      Your archetype shapes how your agent thinks, fights, and adapts.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {archetypes.map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => setArchetype(a.id)}
                          className={`text-left p-4 border rounded transition-all duration-200 ${
                            archetype === a.id
                              ? "border-[var(--color-gold)] bg-[var(--color-gold)]/8 shadow-[var(--shadow-gold)]"
                              : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-gold-dim)]"
                          }`}
                        >
                          <span className="font-heading text-sm text-[var(--color-ivory)] block mb-1">{a.name}</span>
                          <span className="font-narrative italic text-[var(--color-stone)] text-xs leading-snug block">{a.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 2: Personality Sliders */}
                {active === 1 && (
                  <div>
                    <h3 className="font-heading text-xl text-[var(--color-ivory)] mb-1">Personality Sliders</h3>
                    <p className="font-narrative italic text-[var(--color-stone)] text-sm mb-4">
                      Fine-tune aggression, creativity, and risk tolerance. These drive morph targets in real time.
                    </p>
                    <div className="space-y-5">
                      {(["aggression", "creativity", "risk"] as const).map((key) => (
                        <div key={key}>
                          <div className="flex justify-between mb-1">
                            <span className="font-heading text-xs tracking-[2px] uppercase text-[var(--color-parchment)]">{key}</span>
                            <span className="font-mono text-sm text-[var(--color-gold)]">{sliders[key]}</span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={sliders[key]}
                            onChange={(e) => setSliders((s) => ({ ...s, [key]: Number(e.target.value) }))}
                            className="w-full h-1.5 rounded appearance-none bg-[var(--color-rim)] accent-[var(--color-gold)] cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 3: Skills */}
                {active === 2 && (
                  <div>
                    <h3 className="font-heading text-xl text-[var(--color-ivory)] mb-1">Load Skills</h3>
                    <p className="font-narrative italic text-[var(--color-stone)] text-sm mb-4">
                      Equip up to three skill orbs. Browse the market for rare abilities.
                    </p>
                    <div className="flex gap-4 mb-4">
                      <SkillOrb skillType="tempo" equipped />
                      <SkillOrb skillType="risk" equipped />
                      <SkillOrb skillType="bluff" />
                    </div>
                    <button
                      type="button"
                      className="font-heading text-[10px] tracking-[4px] uppercase border border-[var(--color-border)] text-[var(--color-parchment)] px-6 py-2.5 hover:border-[var(--color-gold-dim)] hover:text-[var(--color-gold-light)] transition-all duration-200"
                    >
                      Browse Skill Market →
                    </button>
                  </div>
                )}

                {/* Step 4: Strategy (ZK) */}
                {active === 3 && (
                  <div>
                    <h3 className="font-heading text-xl text-[var(--color-ivory)] mb-1">Commit Strategy</h3>
                    <p className="font-narrative italic text-[var(--color-stone)] text-sm mb-4">
                      Your strategy is sealed with a zero-knowledge proof. Nobody sees the plaintext — ever.
                    </p>
                    <textarea
                      className="w-full h-32 bg-[var(--color-surface)] border border-[var(--color-border)] rounded p-3 font-mono text-[13px] text-[var(--color-teal-light)] placeholder:text-[var(--color-ash)] focus:border-[var(--color-gold-dim)] focus:outline-none transition-colors resize-none"
                      placeholder="Describe your agent's decision-making strategy..."
                    />
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        type="button"
                        className="font-heading text-[10px] tracking-[4px] uppercase border border-[var(--color-gold-dim)] text-[var(--color-gold)] px-6 py-2.5 hover:border-[var(--color-gold)] hover:shadow-[var(--shadow-gold)] transition-all duration-200"
                      >
                        Commit Strategy (ZK Proof)
                      </button>
                      <ZKLockIcon locked txHash="0xfc91...112" />
                    </div>
                    <p className="font-mono text-[11px] text-[var(--color-stone)] mt-2">
                      Hash stored on-chain · plaintext never persisted
                    </p>
                  </div>
                )}

                {/* Step 5: Avatar */}
                {active === 4 && (
                  <div>
                    <h3 className="font-heading text-xl text-[var(--color-ivory)] mb-1">Generate Avatar</h3>
                    <p className="font-narrative italic text-[var(--color-stone)] text-sm mb-4">
                      Choose a custom avatar or let Nova Canvas generate one procedurally.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        className="p-6 border border-[var(--color-border)] rounded text-center hover:border-[var(--color-gold-dim)] transition-all"
                      >
                        <span className="font-heading text-sm text-[var(--color-parchment)] block mb-1">Ready Player Me</span>
                        <span className="font-narrative italic text-[var(--color-stone)] text-xs">Custom 3D avatar</span>
                      </button>
                      <button
                        type="button"
                        className="p-6 border border-[var(--color-teal)] rounded text-center hover:border-[var(--color-teal-light)] transition-all bg-[var(--color-teal)]/8"
                      >
                        <span className="font-heading text-sm text-[var(--color-teal-light)] block mb-1">Nova Canvas</span>
                        <span className="font-narrative italic text-[var(--color-stone)] text-xs">Procedural generation</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 6: Mint */}
                {active === 5 && (
                  <div>
                    <h3 className="font-heading text-xl text-[var(--color-ivory)] mb-1">Mint as NFT</h3>
                    <p className="font-narrative italic text-[var(--color-stone)] text-sm mb-4">
                      Name your agent and mint it to the blockchain. This is irreversible.
                    </p>
                    <input
                      type="text"
                      maxLength={16}
                      placeholder="Agent name (16 chars max)"
                      className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded px-4 py-3 font-display text-2xl text-[var(--color-ivory)] placeholder:text-[var(--color-ash)] focus:border-[var(--color-gold-dim)] focus:outline-none transition-colors mb-3"
                    />
                    <p className="font-mono text-[11px] text-[var(--color-stone)] mb-4">
                      Est. gas: ~0.002 MATIC · Polygon zkEVM
                    </p>
                    <button
                      type="button"
                      className="font-heading text-[10px] tracking-[4px] uppercase bg-[var(--color-gold)] text-[var(--color-ink)] px-9 py-3.5 hover:bg-[var(--color-gold-light)] hover:shadow-[var(--shadow-gold)] active:scale-[0.97] transition-all duration-200 w-full"
                    >
                      Mint Agent as NFT
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Step Navigation Buttons */}
            <div className="flex justify-between mt-5">
              <button
                type="button"
                onClick={() => setActive(Math.max(0, active - 1))}
                disabled={active === 0}
                className="font-mono text-[8px] tracking-[2px] text-[var(--color-stone)] hover:text-[var(--color-parchment)] transition-colors disabled:opacity-30"
              >
                ← Previous
              </button>
              <button
                type="button"
                onClick={() => setActive(Math.min(steps.length - 1, active + 1))}
                disabled={active === steps.length - 1}
                className="font-heading text-[10px] tracking-[4px] uppercase border border-[var(--color-border)] text-[var(--color-parchment)] px-6 py-2.5 hover:border-[var(--color-gold-dim)] hover:text-[var(--color-gold-light)] transition-all duration-200 disabled:opacity-30"
              >
                Continue →
              </button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
