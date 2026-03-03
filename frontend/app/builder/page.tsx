"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const ARCHETYPES = [
    { id: "aggressive", name: "Aggressive", icon: "🔥", desc: "High risk, high reward. Attacks first, asks later.", color: "var(--danger-red)" },
    { id: "conservative", name: "Conservative", icon: "🛡️", desc: "Patient and methodical. Waits for the perfect moment.", color: "var(--neon-green)" },
    { id: "unpredictable", name: "Unpredictable", icon: "🎲", desc: "Random genius. Opponents never know what's coming.", color: "var(--arena-gold)" },
    { id: "adaptive", name: "Adaptive", icon: "🧠", desc: "Studies opponents and evolves strategy mid-game.", color: "var(--electric-purple-light)" },
    { id: "chaos", name: "Chaos", icon: "💀", desc: "Pure entropy. Breaks meta and exploits confusion.", color: "#FF6B6B" },
];

const SKILLS = [
    { id: "poker-face", name: "Poker Face", icon: "😐", desc: "Reduces bluff detection by opponents", game: "Poker", locked: false },
    { id: "grandmaster", name: "Grandmaster Openings", icon: "♟️", desc: "Top 20 chess openings pre-loaded", game: "Chess", locked: false },
    { id: "memory-palace", name: "Memory Palace", icon: "🏛️", desc: "Perfect recall of opponent patterns", game: "All", locked: true },
    { id: "bluff-detector", name: "Bluff Detector", icon: "🔍", desc: "ML-powered bluff probability analysis", game: "Poker", locked: true },
];

const STEPS = ["Personality", "Skills", "Strategy", "Review"];

export default function BuilderPage() {
    const [step, setStep] = useState(0);
    const [agentName, setAgentName] = useState("");
    const [selectedArchetype, setSelectedArchetype] = useState<string | null>(null);
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

    const toggleSkill = (id: string) => {
        setSelectedSkills((prev) =>
            prev.includes(id) ? prev.filter((s) => s !== id) : prev.length < 2 ? [...prev, id] : prev
        );
    };

    return (
        <div className="page container" style={{ maxWidth: 900 }}>
            {/* Header */}
            <div style={{ marginBottom: "var(--space-xl)" }}>
                <h1>🛠️ <span className="text-gradient">Agent Builder</span></h1>
                <p className="text-muted" style={{ marginTop: "var(--space-sm)" }}>
                    Craft your AI warrior. Choose personality, assign skills, set strategy.
                </p>
            </div>

            {/* Progress Steps */}
            <div className="flex justify-center gap-md" style={{ marginBottom: "var(--space-2xl)" }}>
                {STEPS.map((s, i) => (
                    <div
                        key={s}
                        className="flex items-center gap-sm"
                        style={{ cursor: "pointer" }}
                        onClick={() => setStep(i)}
                    >
                        <div
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: "var(--radius-full)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 700,
                                fontSize: "0.8125rem",
                                background: i <= step
                                    ? "linear-gradient(135deg, var(--electric-purple), var(--electric-purple-light))"
                                    : "var(--midnight-navy)",
                                color: i <= step ? "white" : "var(--text-muted)",
                                border: i <= step ? "none" : "1px solid var(--border-subtle)",
                                transition: "all 0.3s",
                            }}
                        >
                            {i < step ? "✓" : i + 1}
                        </div>
                        <span
                            style={{
                                fontFamily: "var(--font-heading)",
                                fontWeight: 600,
                                fontSize: "0.875rem",
                                color: i <= step ? "var(--text-primary)" : "var(--text-muted)",
                            }}
                        >
                            {s}
                        </span>
                        {i < STEPS.length - 1 && (
                            <div style={{
                                width: 40,
                                height: 2,
                                background: i < step ? "var(--electric-purple)" : "var(--midnight-navy)",
                                borderRadius: 1,
                            }} />
                        )}
                    </div>
                ))}
            </div>

            {/* Step Content */}
            <AnimatePresence mode="wait">
                {step === 0 && (
                    <motion.div key="personality" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                        {/* Agent Name */}
                        <div style={{ marginBottom: "var(--space-xl)" }}>
                            <label style={{ fontFamily: "var(--font-heading)", fontWeight: 600, display: "block", marginBottom: "var(--space-sm)" }}>
                                Agent Name
                            </label>
                            <input
                                className="input"
                                placeholder="Enter a legendary name..."
                                value={agentName}
                                onChange={(e) => setAgentName(e.target.value)}
                                style={{ maxWidth: 400 }}
                            />
                        </div>

                        {/* Personality Archetypes */}
                        <label style={{ fontFamily: "var(--font-heading)", fontWeight: 600, display: "block", marginBottom: "var(--space-md)" }}>
                            Choose Personality Archetype
                        </label>
                        <div className="grid-3" style={{ gap: "var(--space-md)" }}>
                            {ARCHETYPES.map((a) => (
                                <motion.div
                                    key={a.id}
                                    className="glass-card"
                                    style={{
                                        padding: "var(--space-lg)",
                                        cursor: "pointer",
                                        textAlign: "center",
                                        borderColor: selectedArchetype === a.id ? a.color : undefined,
                                        boxShadow: selectedArchetype === a.id ? `0 0 20px ${a.color}40` : undefined,
                                    }}
                                    onClick={() => setSelectedArchetype(a.id)}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div style={{ fontSize: "2.5rem", marginBottom: "var(--space-sm)" }}>{a.icon}</div>
                                    <h4 style={{ color: a.color, marginBottom: "var(--space-xs)" }}>{a.name}</h4>
                                    <p className="text-muted" style={{ fontSize: "0.8125rem" }}>{a.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {step === 1 && (
                    <motion.div key="skills" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                        <label style={{ fontFamily: "var(--font-heading)", fontWeight: 600, display: "block", marginBottom: "var(--space-sm)" }}>
                            Assign Skill Slots (max 2)
                        </label>
                        <p className="text-muted" style={{ marginBottom: "var(--space-lg)", fontSize: "0.875rem" }}>
                            Unlock more skills by purchasing Skill NFTs in the marketplace.
                        </p>
                        <div className="grid-2" style={{ gap: "var(--space-md)" }}>
                            {SKILLS.map((skill) => (
                                <motion.div
                                    key={skill.id}
                                    className="glass-card"
                                    style={{
                                        padding: "var(--space-lg)",
                                        cursor: skill.locked ? "not-allowed" : "pointer",
                                        opacity: skill.locked ? 0.5 : 1,
                                        display: "flex",
                                        gap: "var(--space-md)",
                                        alignItems: "center",
                                        borderColor: selectedSkills.includes(skill.id) ? "var(--neon-green)" : undefined,
                                    }}
                                    onClick={() => !skill.locked && toggleSkill(skill.id)}
                                    whileHover={skill.locked ? {} : { scale: 1.02 }}
                                >
                                    <div style={{ fontSize: "2rem", flexShrink: 0 }}>{skill.icon}</div>
                                    <div>
                                        <div className="flex items-center gap-sm">
                                            <h4>{skill.name}</h4>
                                            {skill.locked && <span className="badge badge-gold">🔒 NFT</span>}
                                            <span className="badge badge-purple">{skill.game}</span>
                                        </div>
                                        <p className="text-muted" style={{ fontSize: "0.8125rem", marginTop: 4 }}>{skill.desc}</p>
                                    </div>
                                    {selectedSkills.includes(skill.id) && (
                                        <div style={{ marginLeft: "auto", color: "var(--neon-green)", fontWeight: 700, fontSize: "1.25rem" }}>✓</div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div key="strategy" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                        <label style={{ fontFamily: "var(--font-heading)", fontWeight: 600, display: "block", marginBottom: "var(--space-sm)" }}>
                            Strategy Prompt
                        </label>
                        <p className="text-muted" style={{ marginBottom: "var(--space-md)", fontSize: "0.875rem" }}>
                            Describe your agent&apos;s strategy in natural language. This will be committed via ZK proof before battle.
                        </p>
                        <textarea
                            className="input"
                            rows={6}
                            placeholder="e.g. Play aggressively in the opening. If losing material, switch to defensive and look for counter-attacks..."
                            style={{ resize: "vertical", fontFamily: "var(--font-mono)", fontSize: "0.875rem" }}
                        />
                        <div style={{ marginTop: "var(--space-lg)" }}>
                            <h4 style={{ marginBottom: "var(--space-md)" }}>Or use a template:</h4>
                            <div className="flex gap-sm" style={{ flexWrap: "wrap" }}>
                                {["Aggressive Bluffer", "Patient Strategist", "Chaos Agent", "Counter-Puncher"].map((t) => (
                                    <button key={t} className="btn btn-secondary btn-sm">{t}</button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div key="review" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                        <div className="glass-card" style={{ padding: "var(--space-xl)", textAlign: "center", maxWidth: 500, margin: "0 auto" }}>
                            <div style={{ fontSize: "4rem", marginBottom: "var(--space-md)" }}>🤖</div>
                            <h2 style={{ marginBottom: "var(--space-sm)" }}>{agentName || "Unnamed Agent"}</h2>
                            <span className="badge badge-purple" style={{ marginBottom: "var(--space-md)", display: "inline-block" }}>
                                {ARCHETYPES.find((a) => a.id === selectedArchetype)?.name || "No Personality"}
                            </span>
                            <div className="flex justify-center gap-sm" style={{ marginBottom: "var(--space-lg)" }}>
                                {selectedSkills.map((id) => {
                                    const skill = SKILLS.find((s) => s.id === id);
                                    return <span key={id} className="badge badge-win">{skill?.icon} {skill?.name}</span>;
                                })}
                            </div>
                            <button className="btn btn-gold btn-lg w-full">
                                ⚡ Deploy to Arena
                            </button>
                            <p className="text-mono" style={{ marginTop: "var(--space-md)", fontSize: "0.6875rem", color: "var(--text-muted)" }}>
                                Strategy will be committed via Noir ZK circuit
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between" style={{ marginTop: "var(--space-2xl)" }}>
                <button className="btn btn-secondary" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
                    ← Back
                </button>
                <button
                    className="btn btn-primary"
                    onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))}
                    disabled={step === STEPS.length - 1}
                >
                    Next →
                </button>
            </div>
        </div>
    );
}
