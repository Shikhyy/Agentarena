"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { HexPortrait } from "@/components/ui/HexPortrait";
import { ZKLockIcon } from "@/components/ui/ZKLockIcon";
import { apiPost } from "@/lib/api";
import { STAGGER } from "@/lib/springs";
import { useAgentBio, useStrategyTip } from "@/lib/useGeminiStream";

// ── Data ─────────────────────────────────────────────────────────────────

const ARCHETYPES = [
  {
    id: "aggressive",
    name: "Aggressive",
    icon: "⚔️",
    accent: "var(--color-red)",
    desc: "Strike first, dominate the tempo. High risk, high reward.",
  },
  {
    id: "conservative",
    name: "Conservative",
    icon: "🛡️",
    accent: "var(--color-teal)",
    desc: "Patience wins. Minimise exposure, maximise efficiency.",
  },
  {
    id: "chaotic",
    name: "Chaotic",
    icon: "🌀",
    accent: "var(--color-amber)",
    desc: "Unpredictable by nature. No pattern to exploit.",
  },
  {
    id: "adaptive",
    name: "Adaptive",
    icon: "🧬",
    accent: "var(--color-sage)",
    desc: "Read the room. Mirror and counter every opponent.",
  },
  {
    id: "balanced",
    name: "Balanced",
    icon: "⚖️",
    accent: "var(--color-gold)",
    desc: "All skills, no weakness. The generalist advantage.",
  },
] as const;

const SKILLS = [
  { id: "lightning_strike",     name: "Lightning Strike",    icon: "⚡", desc: "First-move advantage multiplier" },
  { id: "iron_defense",         name: "Iron Defense",        icon: "🛡️", desc: "Reduces damage from aggressive plays" },
  { id: "chaos_theory",         name: "Chaos Theory",        icon: "🌀", desc: "Random edge cases confound opponents" },
  { id: "pattern_recognition",  name: "Pattern Recognition", icon: "🔍", desc: "Detects and counters repeating strategies" },
  { id: "adaptive_logic",       name: "Adaptive Logic",      icon: "🧬", desc: "Mid-game strategy pivoting" },
  { id: "bluff_master",         name: "Bluff Master",        icon: "🃏", desc: "Sends false signals to opponents" },
] as const;

const STEPS = ["Archetype", "Personality", "Skills", "Strategy", "Avatar", "Mint"];

const ARCHETYPE_ACCENT: Record<string, string> = {
  aggressive:   "var(--color-red)",
  conservative: "var(--color-teal)",
  chaotic:      "var(--color-amber)",
  adaptive:     "var(--color-sage)",
  balanced:     "var(--color-gold)",
};

// ── Types ─────────────────────────────────────────────────────────────────

interface Personality {
  aggression: number;
  creativity: number;
  risk: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

// ── Sub-components ────────────────────────────────────────────────────────

function StepIndicator({ active, total }: { active: number; total: number }) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 24, alignItems: "center" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i === active ? 24 : 8,
            height: 8,
            borderRadius: 4,
            background:
              i < active
                ? "var(--color-gold-lo)"
                : i === active
                ? "var(--color-gold)"
                : "var(--color-border)",
            transition: "all 0.3s var(--ease-premium)",
          }}
        />
      ))}
      <span
        style={{
          marginLeft: 8,
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          letterSpacing: "3px",
          textTransform: "uppercase",
          color: "var(--color-stone)",
        }}
      >
        Step {active + 1}/{total} · {STEPS[active]}
      </span>
    </div>
  );
}

function SliderRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span
          style={{
            fontFamily: "var(--font-head)",
            fontSize: 11,
            letterSpacing: "2px",
            textTransform: "uppercase",
            color: "var(--color-cream)",
          }}
        >
          {label}
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--color-gold)" }}>
          {value}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: "100%",
          height: 6,
          borderRadius: 3,
          appearance: "none",
          background: `linear-gradient(to right, var(--color-gold) ${value}%, var(--color-float) ${value}%)`,
          cursor: "pointer",
          outline: "none",
          border: "none",
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 4,
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          color: "var(--color-ash)",
        }}
      >
        <span>0</span>
        <span>100</span>
      </div>
    </div>
  );
}

function SkillCard({
  skill,
  selected,
  disabled,
  onToggle,
}: {
  skill: (typeof SKILLS)[number];
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      disabled={disabled && !selected}
      whileHover={!disabled || selected ? { scale: 1.02 } : {}}
      whileTap={!disabled || selected ? { scale: 0.98 } : {}}
      style={{
        textAlign: "left",
        padding: "14px 16px",
        borderRadius: 8,
        border: selected
          ? "1px solid var(--color-gold)"
          : disabled
          ? "1px solid var(--color-border)"
          : "1px solid var(--color-border)",
        background: selected
          ? "rgba(200,151,58,0.08)"
          : disabled
          ? "var(--color-base)"
          : "var(--color-base)",
        cursor: disabled && !selected ? "not-allowed" : "pointer",
        opacity: disabled && !selected ? 0.4 : 1,
        boxShadow: selected ? "var(--shadow-gold)" : "none",
        transition: "border-color 0.2s, box-shadow 0.2s",
        width: "100%",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <span style={{ fontSize: 20 }}>{skill.icon}</span>
        <span
          style={{
            fontFamily: "var(--font-head)",
            fontSize: 13,
            color: selected ? "var(--color-gold)" : "var(--color-ivory)",
          }}
        >
          {skill.name}
        </span>
        {selected && (
          <span
            style={{
              marginLeft: "auto",
              fontFamily: "var(--font-mono)",
              fontSize: 8,
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "var(--color-gold)",
              border: "1px solid var(--color-gold-lo)",
              borderRadius: 4,
              padding: "2px 6px",
            }}
          >
            Equipped
          </span>
        )}
      </div>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontStyle: "italic",
          fontSize: 12,
          color: "var(--color-stone)",
          margin: 0,
        }}
      >
        {skill.desc}
      </p>
    </motion.button>
  );
}

// ── Preview Card ──────────────────────────────────────────────────────────

function PreviewCard({
  agentName,
  archetype,
  personality,
  skills,
  avatarGenerated,
}: {
  agentName: string;
  archetype: string | null;
  personality: Personality;
  skills: string[];
  avatarGenerated: boolean;
}) {
  const arc = ARCHETYPES.find((a) => a.id === archetype);
  const accent = arc ? arc.accent : "var(--color-gold)";

  return (
    <div style={{ height: "100%" }}>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          letterSpacing: "3px",
          textTransform: "uppercase",
          color: "var(--color-stone)",
          marginBottom: 12,
        }}
      >
        Live Preview
      </p>

      {/* Avatar area */}
      <div
        style={{
          border: "1px solid var(--color-border)",
          borderRadius: 8,
          minHeight: 260,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: `radial-gradient(circle at 50% 40%, ${accent}20, transparent 65%)`,
          marginBottom: 16,
          padding: 24,
          position: "relative",
        }}
      >
        <HexPortrait
          name={agentName || "?"}
          size={100}
          accent={accent}
          pulse={!!archetype}
        />
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 22,
            color: "var(--color-ivory)",
            marginTop: 12,
            marginBottom: 2,
            letterSpacing: "0.06em",
            textAlign: "center",
          }}
        >
          {agentName || "Agent Name"}
        </p>
        {archetype && (
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: accent,
              marginTop: 4,
            }}
          >
            {arc?.icon} {arc?.name}
          </p>
        )}
        {avatarGenerated && (
          <div
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              fontFamily: "var(--font-mono)",
              fontSize: 8,
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "var(--color-sage)",
              border: "1px solid var(--color-sage)",
              borderRadius: 4,
              padding: "2px 6px",
            }}
          >
            AI Generated
          </div>
        )}
      </div>

      {/* Stat rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {(["aggression", "creativity", "risk"] as const).map((key) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "var(--color-ash)",
                width: 80,
                flexShrink: 0,
              }}
            >
              {key}
            </span>
            <div
              style={{
                flex: 1,
                height: 4,
                background: "var(--color-float)",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <motion.div
                style={{
                  height: "100%",
                  background: accent,
                  borderRadius: 2,
                }}
                animate={{ width: `${personality[key]}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--color-cream)",
                width: 28,
                textAlign: "right",
              }}
            >
              {personality[key]}
            </span>
          </div>
        ))}
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: "var(--color-stone)",
              marginBottom: 8,
            }}
          >
            Skills ({skills.length}/3)
          </p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {skills.map((sk) => {
              const s = SKILLS.find((x) => x.id === sk);
              return s ? (
                <span
                  key={sk}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 9,
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    color: "var(--color-gold)",
                    border: "1px solid var(--color-gold-lo)",
                    borderRadius: 4,
                    padding: "2px 8px",
                  }}
                >
                  {s.icon} {s.name}
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────

export default function WorkshopPage() {
  const [step, setStep] = useState(0);

  // Form state
  const [agentName, setAgentName] = useState("");
  const [archetype, setArchetype] = useState<string | null>(null);
  const [personality, setPersonality] = useState<Personality>({ aggression: 50, creativity: 50, risk: 50 });
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [strategy, setStrategy] = useState("");
  const [zkEnabled, setZkEnabled] = useState(true);
  const [avatarGenerating, setAvatarGenerating] = useState(false);
  const [avatarGenerated, setAvatarGenerated] = useState(false);

  // Mint state
  const [deploying, setDeploying] = useState(false);
  const [deploySuccess, setDeploySuccess] = useState<{ id: string; name: string } | null>(null);
  const [deployError, setDeployError] = useState<string | null>(null);

  // Gemini AI features
  const { bio, isLoading: bioLoading, generateBio } = useAgentBio();
  const { tip, isStreaming: tipStreaming, getStrategyTip } = useStrategyTip();

  const toggleSkill = useCallback(
    (id: string) => {
      setSelectedSkills((prev) => {
        if (prev.includes(id)) return prev.filter((s) => s !== id);
        if (prev.length >= 3) return prev;
        return [...prev, id];
      });
    },
    []
  );

  const handleGenerateAvatar = useCallback(async () => {
    setAvatarGenerating(true);
    setAvatarGenerated(false);
    // Generate bio via Gemini while avatar "loads"
    if (agentName) {
      generateBio({
        agent_name: agentName,
        personality: archetype || "adaptive",
        skills: selectedSkills,
        level: 1,
      });
    }
    await sleep(2000);
    setAvatarGenerating(false);
    setAvatarGenerated(true);
  }, [agentName, archetype, selectedSkills, generateBio]);

  const handleDeploy = useCallback(async () => {
    if (!agentName.trim()) {
      setDeployError("Agent name is required.");
      return;
    }
    setDeploying(true);
    setDeployError(null);
    try {
      const data = await apiPost("/agents", {
        name: agentName.trim(),
        personality: {
          archetype: archetype || "balanced",
          ...personality,
        },
        strategy: strategy || "Default balanced strategy",
        skills: selectedSkills,
        model: "gemini-2.0-flash",
        zk_commitment: zkEnabled,
      });
      setDeploySuccess({ id: data.agent_id || data.id || "unknown", name: agentName.trim() });
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Deploy failed. Please check your connection and try again.";
      setDeployError(msg);
    } finally {
      setDeploying(false);
    }
  }, [agentName, archetype, personality, strategy, selectedSkills, zkEnabled]);

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-depth)",
        padding: "24px 24px 48px",
        paddingTop: "calc(var(--topbar-h) + var(--balance-h) + 24px)",
      }}
    >
      {/* Header */}
      <motion.section
        style={{ marginBottom: 32 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: STAGGER.headline / 1000, duration: 0.5 }}
      >
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            letterSpacing: "4px",
            textTransform: "uppercase",
            color: "var(--color-stone)",
            marginBottom: 8,
          }}
        >
          Workshop · Agent Forge
        </p>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(32px, 5vw, 56px)",
            color: "var(--color-ivory)",
            letterSpacing: "0.06em",
            margin: 0,
          }}
        >
          Build Your Agent
        </h1>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontStyle: "italic",
            color: "var(--color-cream)",
            marginTop: 8,
            maxWidth: 560,
          }}
        >
          Six steps from concept to colosseum. Choose wisely — your strategy is sealed by
          zero-knowledge proof.
        </p>
      </motion.section>

      {/* Main two-column grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 3fr",
          gap: 24,
          alignItems: "start",
        }}
        className="workshop-grid"
      >
        {/* Left — Preview (40%) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: STAGGER.secondary / 1000, duration: 0.5 }}
          style={{ position: "sticky", top: "calc(var(--topbar-h) + var(--balance-h) + 24px)" }}
        >
          <GlassCard accent="teal" glowIntensity={0.3}>
            <PreviewCard
              agentName={agentName}
              archetype={archetype}
              personality={personality}
              skills={selectedSkills}
              avatarGenerated={avatarGenerated}
            />
          </GlassCard>
        </motion.div>

        {/* Right — Builder (60%) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: STAGGER.secondary / 1000, duration: 0.5 }}
        >
          <GlassCard glowIntensity={0.3}>
            <StepIndicator active={step} total={STEPS.length} />

            {/* Step tabs */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                marginBottom: 20,
                paddingBottom: 16,
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              {STEPS.map((s, idx) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStep(idx)}
                  style={{
                    padding: "6px 14px",
                    fontFamily: "var(--font-head)",
                    fontSize: 10,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    border: "1px solid",
                    borderColor: step === idx ? "var(--color-gold)" : "var(--color-border)",
                    borderRadius: 4,
                    background:
                      step === idx
                        ? "rgba(200,151,58,0.08)"
                        : idx < step
                        ? "rgba(200,151,58,0.04)"
                        : "transparent",
                    color:
                      step === idx
                        ? "var(--color-gold)"
                        : idx < step
                        ? "var(--color-gold-lo)"
                        : "var(--color-stone)",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    boxShadow: step === idx ? "var(--shadow-gold)" : "none",
                  }}
                >
                  {idx + 1}. {s}
                  {idx < step && " ✓"}
                </button>
              ))}
            </div>

            {/* Step content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                style={{
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  padding: 20,
                  minHeight: 280,
                }}
              >
                {/* ── Step 1: Archetype ─────────────────────────────────── */}
                {step === 0 && (
                  <div>
                    <h3
                      style={{
                        fontFamily: "var(--font-head)",
                        fontSize: 20,
                        color: "var(--color-ivory)",
                        marginBottom: 4,
                        marginTop: 0,
                      }}
                    >
                      Choose Archetype
                    </h3>
                    <p
                      style={{
                        fontFamily: "var(--font-body)",
                        fontStyle: "italic",
                        color: "var(--color-stone)",
                        fontSize: 14,
                        marginBottom: 20,
                      }}
                    >
                      Your archetype shapes how your agent thinks, fights, and adapts to every
                      opponent.
                    </p>

                    {/* Agent name input at step 1 */}
                    <div style={{ marginBottom: 20 }}>
                      <label
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 9,
                          letterSpacing: "3px",
                          textTransform: "uppercase",
                          color: "var(--color-stone)",
                          display: "block",
                          marginBottom: 8,
                        }}
                      >
                        Agent Name
                      </label>
                      <input
                        type="text"
                        maxLength={16}
                        value={agentName}
                        onChange={(e) => setAgentName(e.target.value.toUpperCase())}
                        placeholder="E.G. ZEUS"
                        style={{
                          width: "100%",
                          background: "var(--color-base)",
                          border: "1px solid var(--color-border)",
                          borderRadius: 6,
                          padding: "10px 14px",
                          fontFamily: "var(--font-display)",
                          fontSize: 20,
                          color: "var(--color-ivory)",
                          outline: "none",
                          letterSpacing: "0.08em",
                          transition: "border-color 0.2s",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "var(--color-gold-lo)")}
                        onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
                      />
                      <p
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 9,
                          color: "var(--color-ash)",
                          marginTop: 4,
                        }}
                      >
                        {agentName.length}/16 chars · uppercase only
                      </p>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                        gap: 10,
                      }}
                    >
                      {ARCHETYPES.map((a) => (
                        <motion.button
                          key={a.id}
                          type="button"
                          onClick={() => {
                            setArchetype(a.id);
                            // Fetch a Gemini strategy tip for this archetype's game style
                            getStrategyTip("chess", a.id === "adaptive" ? "intermediate" : "expert");
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          style={{
                            textAlign: "left",
                            padding: "14px",
                            border: "1px solid",
                            borderColor:
                              archetype === a.id ? a.accent : "var(--color-border)",
                            borderRadius: 8,
                            background:
                              archetype === a.id
                                ? `${a.accent}15`
                                : "var(--color-base)",
                            cursor: "pointer",
                            boxShadow:
                              archetype === a.id
                                ? `0 0 20px ${a.accent}30`
                                : "none",
                            transition: "all 0.2s",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 24,
                              marginBottom: 6,
                            }}
                          >
                            {a.icon}
                          </div>
                          <span
                            style={{
                              fontFamily: "var(--font-head)",
                              fontSize: 13,
                              color:
                                archetype === a.id ? a.accent : "var(--color-ivory)",
                              display: "block",
                              marginBottom: 4,
                            }}
                          >
                            {a.name}
                          </span>
                          <span
                            style={{
                              fontFamily: "var(--font-body)",
                              fontStyle: "italic",
                              fontSize: 11,
                              color: "var(--color-stone)",
                              lineHeight: 1.4,
                            }}
                          >
                            {a.desc}
                          </span>
                        </motion.button>
                      ))}
                    </div>

                    {/* Gemini strategy tip — shown when archetype is selected */}
                    {archetype && (tip || tipStreaming) && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          marginTop: 16,
                          background: "rgba(22,19,16,0.9)",
                          border: "1px solid var(--color-teal)",
                          borderRadius: 6,
                          padding: "10px 14px",
                          boxShadow: "0 0 20px rgba(74,140,134,0.12)",
                        }}
                      >
                        <p style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 9,
                          color: "var(--color-teal-light)",
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          marginBottom: 6,
                        }}>
                          ✦ Gemini Strategy Tip
                        </p>
                        <p style={{
                          fontFamily: "var(--font-narrative)",
                          fontSize: 13,
                          fontStyle: "italic",
                          color: "var(--color-text)",
                          lineHeight: 1.6,
                          margin: 0,
                        }}>
                          {tip}
                          {tipStreaming && (
                            <span style={{ color: "var(--color-teal-light)" }}>▌</span>
                          )}
                        </p>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* ── Step 2: Personality ───────────────────────────────── */}
                {step === 1 && (
                  <div>
                    <h3
                      style={{
                        fontFamily: "var(--font-head)",
                        fontSize: 20,
                        color: "var(--color-ivory)",
                        marginBottom: 4,
                        marginTop: 0,
                      }}
                    >
                      Personality Sliders
                    </h3>
                    <p
                      style={{
                        fontFamily: "var(--font-body)",
                        fontStyle: "italic",
                        color: "var(--color-stone)",
                        fontSize: 14,
                        marginBottom: 24,
                      }}
                    >
                      Fine-tune aggression, creativity, and risk tolerance. These values shape
                      every decision your agent makes in the arena.
                    </p>
                    <SliderRow
                      label="Aggression"
                      value={personality.aggression}
                      onChange={(v) => setPersonality((p) => ({ ...p, aggression: v }))}
                    />
                    <SliderRow
                      label="Creativity"
                      value={personality.creativity}
                      onChange={(v) => setPersonality((p) => ({ ...p, creativity: v }))}
                    />
                    <SliderRow
                      label="Risk Tolerance"
                      value={personality.risk}
                      onChange={(v) => setPersonality((p) => ({ ...p, risk: v }))}
                    />
                    <div
                      style={{
                        marginTop: 16,
                        padding: "12px 16px",
                        background: "var(--color-base)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 8,
                      }}
                    >
                      <p
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 9,
                          letterSpacing: "3px",
                          textTransform: "uppercase",
                          color: "var(--color-stone)",
                          marginBottom: 8,
                        }}
                      >
                        Personality Profile
                      </p>
                      <p
                        style={{
                          fontFamily: "var(--font-body)",
                          fontStyle: "italic",
                          fontSize: 13,
                          color: "var(--color-cream)",
                        }}
                      >
                        {personality.aggression > 70
                          ? "Highly aggressive"
                          : personality.aggression < 30
                          ? "Calm and methodical"
                          : "Balanced approach"}{" "}
                        ·{" "}
                        {personality.creativity > 70
                          ? "creative problem-solver"
                          : personality.creativity < 30
                          ? "methodical executor"
                          : "adaptable thinker"}{" "}
                        ·{" "}
                        {personality.risk > 70
                          ? "embraces high risk"
                          : personality.risk < 30
                          ? "minimises variance"
                          : "calculated risk-taker"}
                        .
                      </p>
                    </div>
                  </div>
                )}

                {/* ── Step 3: Skills ────────────────────────────────────── */}
                {step === 2 && (
                  <div>
                    <h3
                      style={{
                        fontFamily: "var(--font-head)",
                        fontSize: 20,
                        color: "var(--color-ivory)",
                        marginBottom: 4,
                        marginTop: 0,
                      }}
                    >
                      Load Skills
                    </h3>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 16,
                      }}
                    >
                      <p
                        style={{
                          fontFamily: "var(--font-body)",
                          fontStyle: "italic",
                          color: "var(--color-stone)",
                          fontSize: 14,
                          margin: 0,
                        }}
                      >
                        Choose up to 3 skills. Each shapes how your agent approaches challenges.
                      </p>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 11,
                          color:
                            selectedSkills.length === 3
                              ? "var(--color-gold)"
                              : "var(--color-stone)",
                          background:
                            selectedSkills.length === 3
                              ? "rgba(200,151,58,0.12)"
                              : "transparent",
                          border: "1px solid",
                          borderColor:
                            selectedSkills.length === 3
                              ? "var(--color-gold-lo)"
                              : "var(--color-border)",
                          borderRadius: 4,
                          padding: "2px 8px",
                          flexShrink: 0,
                          marginLeft: 12,
                        }}
                      >
                        {selectedSkills.length}/3
                      </span>
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 8,
                      }}
                    >
                      {SKILLS.map((skill) => (
                        <SkillCard
                          key={skill.id}
                          skill={skill}
                          selected={selectedSkills.includes(skill.id)}
                          disabled={selectedSkills.length >= 3}
                          onToggle={() => toggleSkill(skill.id)}
                        />
                      ))}
                    </div>
                    {selectedSkills.length === 3 && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          marginTop: 12,
                          padding: "8px 12px",
                          background: "rgba(200,151,58,0.06)",
                          border: "1px solid var(--color-gold-lo)",
                          borderRadius: 6,
                          fontFamily: "var(--font-mono)",
                          fontSize: 10,
                          color: "var(--color-gold)",
                          letterSpacing: "1px",
                        }}
                      >
                        ✓ Skill loadout complete. Deselect a skill to swap.
                      </motion.div>
                    )}
                  </div>
                )}

                {/* ── Step 4: Strategy ──────────────────────────────────── */}
                {step === 3 && (
                  <div>
                    <h3
                      style={{
                        fontFamily: "var(--font-head)",
                        fontSize: 20,
                        color: "var(--color-ivory)",
                        marginBottom: 4,
                        marginTop: 0,
                      }}
                    >
                      Commit Strategy
                    </h3>
                    <p
                      style={{
                        fontFamily: "var(--font-body)",
                        fontStyle: "italic",
                        color: "var(--color-stone)",
                        fontSize: 14,
                        marginBottom: 20,
                      }}
                    >
                      Describe your agent&apos;s decision-making logic. This instruction set drives
                      every move in the arena.
                    </p>

                    <textarea
                      value={strategy}
                      onChange={(e) => setStrategy(e.target.value)}
                      placeholder="e.g. Prioritise board control in the opening. Sacrifice material for tempo when ahead. Never trade queens unless winning. Bluff heavily in the endgame..."
                      rows={6}
                      style={{
                        width: "100%",
                        background: "var(--color-base)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 6,
                        padding: "12px 14px",
                        fontFamily: "var(--font-mono)",
                        fontSize: 12,
                        color: "var(--color-teal)",
                        outline: "none",
                        resize: "vertical",
                        lineHeight: 1.6,
                        transition: "border-color 0.2s",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "var(--color-gold-lo)")}
                      onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
                    />
                    <p
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 9,
                        color: "var(--color-ash)",
                        marginTop: 4,
                        marginBottom: 20,
                      }}
                    >
                      {strategy.length} chars · No maximum
                    </p>

                    {/* ZK Toggle */}
                    <div
                      style={{
                        padding: "16px",
                        background: zkEnabled
                          ? "rgba(74,158,148,0.06)"
                          : "var(--color-base)",
                        border: "1px solid",
                        borderColor: zkEnabled ? "var(--color-teal-dim)" : "var(--color-border)",
                        borderRadius: 8,
                        transition: "all 0.3s",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: zkEnabled ? 12 : 0,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <ZKLockIcon locked={zkEnabled} txHash={zkEnabled ? "pending" : undefined} />
                          <div>
                            <p
                              style={{
                                fontFamily: "var(--font-head)",
                                fontSize: 13,
                                color: "var(--color-ivory)",
                                margin: 0,
                              }}
                            >
                              Zero-Knowledge Commitment
                            </p>
                            <p
                              style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: 9,
                                color: zkEnabled ? "var(--color-teal)" : "var(--color-ash)",
                                marginTop: 2,
                                letterSpacing: "1px",
                              }}
                            >
                              {zkEnabled ? "PRIVATE · Hash on-chain only" : "PUBLIC · Visible to all"}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setZkEnabled((v) => !v)}
                          style={{
                            width: 44,
                            height: 24,
                            borderRadius: 12,
                            border: "1px solid",
                            borderColor: zkEnabled ? "var(--color-teal)" : "var(--color-border)",
                            background: zkEnabled ? "var(--color-teal-dim)" : "var(--color-float)",
                            cursor: "pointer",
                            position: "relative",
                            transition: "all 0.2s",
                            padding: 0,
                          }}
                        >
                          <motion.div
                            animate={{ x: zkEnabled ? 20 : 0 }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: "50%",
                              background: zkEnabled ? "var(--color-teal)" : "var(--color-dim)",
                              position: "absolute",
                              top: 2,
                              left: 3,
                            }}
                          />
                        </button>
                      </div>

                      <AnimatePresence>
                        {zkEnabled && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            style={{ overflow: "hidden" }}
                          >
                            <p
                              style={{
                                fontFamily: "var(--font-body)",
                                fontStyle: "italic",
                                fontSize: 12,
                                color: "var(--color-stone)",
                                lineHeight: 1.6,
                                margin: 0,
                              }}
                            >
                              <strong style={{ color: "var(--color-teal)", fontStyle: "normal" }}>
                                What is ZK?
                              </strong>{" "}
                              A zero-knowledge proof lets you prove your strategy is valid without
                              revealing what it is. A Pedersen hash of your instructions is stored
                              on Polygon zkEVM. Opponents never see your plaintext strategy —
                              only that it exists and was committed before the match started.
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {/* ── Step 5: Avatar ────────────────────────────────────── */}
                {step === 4 && (
                  <div>
                    <h3
                      style={{
                        fontFamily: "var(--font-head)",
                        fontSize: 20,
                        color: "var(--color-ivory)",
                        marginBottom: 4,
                        marginTop: 0,
                      }}
                    >
                      Generate Avatar
                    </h3>
                    <p
                      style={{
                        fontFamily: "var(--font-body)",
                        fontStyle: "italic",
                        color: "var(--color-stone)",
                        fontSize: 14,
                        marginBottom: 24,
                      }}
                    >
                      Your agent&apos;s visual identity. The hex portrait will evolve as your agent
                      wins matches and gains experience.
                    </p>

                    {/* Hex preview */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        marginBottom: 24,
                      }}
                    >
                      <div
                        style={{
                          position: "relative",
                          display: "inline-flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <HexPortrait
                          name={agentName || "?"}
                          size={120}
                          accent={archetype ? ARCHETYPE_ACCENT[archetype] : "var(--color-gold)"}
                          pulse={avatarGenerated}
                        />
                        {avatarGenerating && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{
                              position: "absolute",
                              inset: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: "rgba(9,8,11,0.7)",
                              borderRadius: "50%",
                            }}
                          >
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              style={{
                                width: 32,
                                height: 32,
                                border: "2px solid var(--color-gold-lo)",
                                borderTopColor: "var(--color-gold)",
                                borderRadius: "50%",
                              }}
                            />
                          </motion.div>
                        )}
                        <div style={{ textAlign: "center" }}>
                          <p
                            style={{
                              fontFamily: "var(--font-display)",
                              fontSize: 20,
                              color: "var(--color-ivory)",
                              letterSpacing: "0.08em",
                              margin: "0 0 4px",
                            }}
                          >
                            {agentName || "Agent Name"}
                          </p>
                          <p
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: 9,
                              letterSpacing: "3px",
                              textTransform: "uppercase",
                              color: archetype
                                ? ARCHETYPE_ACCENT[archetype]
                                : "var(--color-stone)",
                            }}
                          >
                            {archetype
                              ? `${ARCHETYPES.find((a) => a.id === archetype)?.icon} ${archetype}`
                              : "No archetype selected"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Generate buttons */}
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <motion.button
                        type="button"
                        onClick={handleGenerateAvatar}
                        disabled={avatarGenerating}
                        whileHover={!avatarGenerating ? { scale: 1.02 } : {}}
                        whileTap={!avatarGenerating ? { scale: 0.98 } : {}}
                        style={{
                          flex: 1,
                          padding: "12px 20px",
                          fontFamily: "var(--font-head)",
                          fontSize: 11,
                          letterSpacing: "3px",
                          textTransform: "uppercase",
                          background: avatarGenerating
                            ? "var(--color-float)"
                            : "var(--color-gold)",
                          color: avatarGenerating ? "var(--color-stone)" : "var(--color-void)",
                          border: "none",
                          borderRadius: 6,
                          cursor: avatarGenerating ? "not-allowed" : "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        {avatarGenerating
                          ? "⟳ Generating..."
                          : avatarGenerated
                          ? "↺ Regenerate with AI"
                          : "✦ Generate with AI"}
                      </motion.button>
                      <button
                        type="button"
                        style={{
                          padding: "12px 20px",
                          fontFamily: "var(--font-head)",
                          fontSize: 11,
                          letterSpacing: "3px",
                          textTransform: "uppercase",
                          border: "1px solid var(--color-border)",
                          borderRadius: 6,
                          color: "var(--color-cream)",
                          background: "transparent",
                          cursor: "pointer",
                          transition: "border-color 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.borderColor = "var(--color-gold-lo)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.borderColor = "var(--color-border)")
                        }
                      >
                        Ready Player Me
                      </button>
                    </div>

                    {avatarGenerated && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ marginTop: 12 }}
                      >
                        <p
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 10,
                            color: "var(--color-sage)",
                            letterSpacing: "1px",
                            marginBottom: 8,
                          }}
                        >
                          ✓ Avatar generated. Personality traits mapped to visual signature.
                        </p>
                        {/* Gemini-generated agent biography */}
                        {(bio || bioLoading) && (
                          <div style={{
                            background: "rgba(22,19,16,0.9)",
                            border: "1px solid var(--color-gold-dim)",
                            borderRadius: 6,
                            padding: "10px 14px",
                          }}>
                            <p style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: 9,
                              color: "var(--color-gold-dim)",
                              letterSpacing: "0.12em",
                              textTransform: "uppercase",
                              marginBottom: 6,
                            }}>
                              ✦ Gemini Lore
                            </p>
                            <p style={{
                              fontFamily: "var(--font-narrative)",
                              fontSize: 13,
                              fontStyle: "italic",
                              color: "var(--color-parchment)",
                              lineHeight: 1.6,
                              margin: 0,
                            }}>
                              {bioLoading ? "Generating lore…" : bio}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                )}

                {/* ── Step 6: Mint ──────────────────────────────────────── */}
                {step === 5 && (
                  <div>
                    <h3
                      style={{
                        fontFamily: "var(--font-head)",
                        fontSize: 20,
                        color: "var(--color-ivory)",
                        marginBottom: 4,
                        marginTop: 0,
                      }}
                    >
                      Deploy Agent
                    </h3>

                    {deploySuccess ? (
                      /* ── Success State ─────────────────────────────────── */
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ textAlign: "center", paddingTop: 24 }}
                      >
                        <div style={{ fontSize: 56, marginBottom: 16 }}>🏆</div>
                        <p
                          style={{
                            fontFamily: "var(--font-display)",
                            fontSize: 28,
                            color: "var(--color-gold)",
                            letterSpacing: "0.08em",
                            marginBottom: 8,
                          }}
                        >
                          {deploySuccess.name} is Live
                        </p>
                        <p
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 10,
                            color: "var(--color-stone)",
                            letterSpacing: "2px",
                            marginBottom: 24,
                          }}
                        >
                          Agent ID: {deploySuccess.id}
                        </p>
                        <p
                          style={{
                            fontFamily: "var(--font-body)",
                            fontStyle: "italic",
                            color: "var(--color-cream)",
                            marginBottom: 24,
                          }}
                        >
                          Your agent has entered the arena. Track their progress in the world.
                        </p>
                        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                          <Link
                            href="/world"
                            style={{
                              padding: "10px 28px",
                              fontFamily: "var(--font-head)",
                              fontSize: 11,
                              letterSpacing: "3px",
                              textTransform: "uppercase",
                              background: "var(--color-gold)",
                              color: "var(--color-void)",
                              borderRadius: 6,
                              textDecoration: "none",
                              transition: "all 0.2s",
                            }}
                          >
                            Enter the World →
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setDeploySuccess(null);
                              setStep(0);
                              setAgentName("");
                              setArchetype(null);
                              setPersonality({ aggression: 50, creativity: 50, risk: 50 });
                              setSelectedSkills([]);
                              setStrategy("");
                              setAvatarGenerated(false);
                            }}
                            style={{
                              padding: "10px 28px",
                              fontFamily: "var(--font-head)",
                              fontSize: 11,
                              letterSpacing: "3px",
                              textTransform: "uppercase",
                              border: "1px solid var(--color-border)",
                              borderRadius: 6,
                              color: "var(--color-cream)",
                              background: "transparent",
                              cursor: "pointer",
                            }}
                          >
                            Build Another
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      /* ── Summary + Deploy ──────────────────────────────── */
                      <>
                        <p
                          style={{
                            fontFamily: "var(--font-body)",
                            fontStyle: "italic",
                            color: "var(--color-stone)",
                            fontSize: 14,
                            marginBottom: 20,
                          }}
                        >
                          Review your configuration and deploy to the arena. Once live, your
                          agent&apos;s strategy is immutable.
                        </p>

                        {/* Summary */}
                        <div
                          style={{
                            border: "1px solid var(--color-border)",
                            borderRadius: 8,
                            overflow: "hidden",
                            marginBottom: 20,
                          }}
                        >
                          {[
                            {
                              label: "Name",
                              value: agentName || (
                                <span style={{ color: "var(--color-red)" }}>
                                  Required ↑ Go to Step 1
                                </span>
                              ),
                            },
                            {
                              label: "Archetype",
                              value: archetype
                                ? `${ARCHETYPES.find((a) => a.id === archetype)?.icon} ${archetype}`
                                : "—",
                            },
                            {
                              label: "Personality",
                              value: `Aggression ${personality.aggression} · Creativity ${personality.creativity} · Risk ${personality.risk}`,
                            },
                            {
                              label: "Skills",
                              value:
                                selectedSkills.length > 0
                                  ? selectedSkills
                                      .map((sk) => SKILLS.find((s) => s.id === sk)?.name)
                                      .join(", ")
                                  : "None selected",
                            },
                            {
                              label: "Strategy",
                              value:
                                strategy.length > 0
                                  ? `${strategy.slice(0, 60)}${strategy.length > 60 ? "..." : ""}`
                                  : "Default",
                            },
                            {
                              label: "ZK Commitment",
                              value: zkEnabled ? "✓ Private (ZK-sealed)" : "Public",
                            },
                            {
                              label: "Avatar",
                              value: avatarGenerated ? "✓ AI Generated" : "Default hex portrait",
                            },
                            { label: "Model", value: "gemini-2.0-flash" },
                          ].map(({ label, value }, i) => (
                            <div
                              key={label}
                              style={{
                                display: "flex",
                                padding: "10px 14px",
                                background: i % 2 === 0 ? "transparent" : "var(--color-base)",
                                borderBottom: i < 7 ? "1px solid var(--color-border)" : "none",
                                gap: 16,
                              }}
                            >
                              <span
                                style={{
                                  fontFamily: "var(--font-mono)",
                                  fontSize: 9,
                                  letterSpacing: "2px",
                                  textTransform: "uppercase",
                                  color: "var(--color-stone)",
                                  width: 100,
                                  flexShrink: 0,
                                }}
                              >
                                {label}
                              </span>
                              <span
                                style={{
                                  fontFamily: "var(--font-mono)",
                                  fontSize: 11,
                                  color: "var(--color-cream)",
                                }}
                              >
                                {value}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Error */}
                        <AnimatePresence>
                          {deployError && (
                            <motion.div
                              initial={{ opacity: 0, y: -8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              style={{
                                padding: "10px 14px",
                                background: "rgba(184,56,56,0.1)",
                                border: "1px solid var(--color-red)",
                                borderRadius: 6,
                                marginBottom: 12,
                                fontFamily: "var(--font-mono)",
                                fontSize: 11,
                                color: "var(--color-red)",
                              }}
                            >
                              {deployError}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Deploy button */}
                        <motion.button
                          type="button"
                          onClick={handleDeploy}
                          disabled={deploying || !agentName.trim()}
                          whileHover={!deploying && !!agentName.trim() ? { scale: 1.01 } : {}}
                          whileTap={!deploying && !!agentName.trim() ? { scale: 0.99 } : {}}
                          style={{
                            width: "100%",
                            padding: "14px 24px",
                            fontFamily: "var(--font-head)",
                            fontSize: 12,
                            letterSpacing: "4px",
                            textTransform: "uppercase",
                            background:
                              deploying || !agentName.trim()
                                ? "var(--color-float)"
                                : "var(--color-gold)",
                            color:
                              deploying || !agentName.trim()
                                ? "var(--color-stone)"
                                : "var(--color-void)",
                            border: "none",
                            borderRadius: 6,
                            cursor:
                              deploying || !agentName.trim() ? "not-allowed" : "pointer",
                            transition: "all 0.2s",
                          }}
                        >
                          {deploying ? "⟳ Deploying Agent..." : "Deploy Agent →"}
                        </motion.button>
                        <p
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 9,
                            color: "var(--color-ash)",
                            textAlign: "center",
                            marginTop: 8,
                          }}
                        >
                          Est. gas: ~0.002 MATIC · Polygon zkEVM · Model: gemini-2.0-flash
                        </p>
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Prev / Next */}
            {!deploySuccess && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 20,
                }}
              >
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 9,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    color: "var(--color-stone)",
                    background: "none",
                    border: "none",
                    cursor: step === 0 ? "not-allowed" : "pointer",
                    opacity: step === 0 ? 0.3 : 1,
                    padding: "6px 0",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (step > 0) e.currentTarget.style.color = "var(--color-cream)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--color-stone)";
                  }}
                >
                  ← Previous
                </button>

                {step < STEPS.length - 1 && (
                  <button
                    type="button"
                    onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                    style={{
                      padding: "8px 24px",
                      fontFamily: "var(--font-head)",
                      fontSize: 10,
                      letterSpacing: "3px",
                      textTransform: "uppercase",
                      border: "1px solid var(--color-border)",
                      borderRadius: 6,
                      color: "var(--color-cream)",
                      background: "transparent",
                      cursor: "pointer",
                      transition: "border-color 0.2s, color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--color-gold-lo)";
                      e.currentTarget.style.color = "var(--color-gold)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--color-border)";
                      e.currentTarget.style.color = "var(--color-cream)";
                    }}
                  >
                    Continue →
                  </button>
                )}
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .workshop-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
