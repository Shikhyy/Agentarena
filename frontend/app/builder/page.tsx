"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";

// ── Step types ─────────────────────────────────────────────────
const STEPS = ["Identity", "Personality", "Skills", "Strategy", "Review"];

const PERSONALITIES = [
    { id: "aggressive", emoji: "🔥", label: "Aggressive", desc: "High-risk, high-reward. Attacks relentlessly." },
    { id: "conservative", emoji: "🛡️", label: "Conservative", desc: "Patient and methodical. Rarely makes mistakes." },
    { id: "adaptive", emoji: "🧠", label: "Adaptive", desc: "Reads the game state and shifts strategy dynamically." },
    { id: "unpredictable", emoji: "🎲", label: "Unpredictable", desc: "Random enough to confuse opponents." },
    { id: "chaos", emoji: "💀", label: "Chaos Agent", desc: "Pure anarchy. Opponents cannot predict a thing." },
];

const ALL_SKILLS = [
    { id: "endgame_master", label: "Endgame Master", icon: "♟️", game: "chess" },
    { id: "opening_book", label: "Opening Book", icon: "📖", game: "chess" },
    { id: "sacrifice_gambit", label: "Sacrifice Gambit", icon: "⚡", game: "chess" },
    { id: "bluff_master", label: "Bluff Master", icon: "🎭", game: "poker" },
    { id: "pot_odds", label: "Pot Odds Expert", icon: "🧮", game: "poker" },
    { id: "property_hoarder", label: "Property Hoarder", icon: "🏠", game: "monopoly" },
    { id: "negotiator", label: "Master Negotiator", icon: "🤝", game: "monopoly" },
    { id: "risk_taker", label: "Risk Taker", icon: "🎯", game: "all" },
    { id: "adaptability", label: "Quick Adapter", icon: "🔄", game: "all" },
];

export default function BuilderPage() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [agentName, setAgentName] = useState("");
    const [selectedPersonality, setSelectedPersonality] = useState<string | null>(null);
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [traits, setTraits] = useState({ aggression: 0.5, risk: 0.5, creativity: 0.5 });
    const [gameTypes, setGameTypes] = useState<string[]>(["chess"]);
    const [creating, setCreating] = useState(false);

    const toggleSkill = (id: string) => {
        setSelectedSkills(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : prev.length < 3 ? [...prev, id] : prev
        );
    };

    const handleCreate = async () => {
        setCreating(true);
        await new Promise(r => setTimeout(r, 1500)); // simulate API call
        setCreating(false);
        router.push("/my-agents");
    };

    const canNext = () => {
        if (step === 0) return agentName.trim().length >= 3;
        if (step === 1) return selectedPersonality !== null;
        if (step === 2) return selectedSkills.length >= 1;
        return true;
    };

    return (
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "var(--space-xl) var(--space-lg)" }}>
            {/* Progress bar */}
            <div style={{ marginBottom: "var(--space-xl)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-sm)" }}>
                    {STEPS.map((s, i) => (
                        <div key={s} style={{ textAlign: "center", flex: 1 }}>
                            <div style={{
                                width: 32, height: 32, borderRadius: "50%",
                                background: i <= step ? "var(--electric-purple)" : "var(--surface-elevated)",
                                margin: "0 auto var(--space-xs)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "0.8rem", fontWeight: 700,
                                border: i === step ? "2px solid var(--arena-gold)" : "none",
                                transition: "all 0.3s",
                            }}>
                                {i < step ? "✓" : i + 1}
                            </div>
                            <div className="text-muted" style={{ fontSize: "0.7rem", display: step >= i ? "block" : "block", color: i === step ? "var(--arena-gold)" : undefined }}>{s}</div>
                        </div>
                    ))}
                </div>
                <div style={{ height: 3, background: "var(--surface-elevated)", borderRadius: 2 }}>
                    <motion.div style={{ height: "100%", background: "linear-gradient(90deg, var(--electric-purple), var(--arena-gold))", borderRadius: 2 }}
                        animate={{ width: `${(step / (STEPS.length - 1)) * 100}%` }} transition={{ type: "spring" }} />
                </div>
            </div>

            {/* Step Content */}
            <AnimatePresence mode="wait">
                <motion.div key={step}
                    initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -40, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="glass-panel" style={{ padding: "var(--space-xl)", minHeight: 400 }}>

                    {/* Step 0: Identity */}
                    {step === 0 && (
                        <div>
                            <h2 style={{ marginBottom: "var(--space-sm)" }}>👤 Name Your Agent</h2>
                            <p className="text-muted" style={{ marginBottom: "var(--space-xl)" }}>Give your AI agent an identity it will carry on the blockchain forever.</p>
                            <input
                                className="input" type="text" placeholder="e.g. NeuralNinja, ChaosMaster..."
                                value={agentName} onChange={e => setAgentName(e.target.value)}
                                style={{ fontSize: "1.2rem", padding: "var(--space-md)", width: "100%" }}
                                maxLength={32}
                            />
                            <div className="text-muted" style={{ fontSize: "0.75rem", marginTop: "var(--space-xs)", textAlign: "right" }}>{agentName.length}/32</div>
                        </div>
                    )}

                    {/* Step 1: Personality */}
                    {step === 1 && (
                        <div>
                            <h2 style={{ marginBottom: "var(--space-sm)" }}>🧬 Choose Personality</h2>
                            <p className="text-muted" style={{ marginBottom: "var(--space-xl)" }}>Personality shapes how your agent thinks under pressure.</p>
                            <div style={{ display: "grid", gap: "var(--space-md)" }}>
                                {PERSONALITIES.map(p => (
                                    <motion.div key={p.id} whileTap={{ scale: 0.98 }} onClick={() => setSelectedPersonality(p.id)}
                                        style={{
                                            padding: "var(--space-md)", borderRadius: "var(--radius-md)",
                                            border: `2px solid ${selectedPersonality === p.id ? "var(--electric-purple)" : "var(--border-subtle)"}`,
                                            background: selectedPersonality === p.id ? "rgba(108,58,237,0.12)" : "var(--surface-elevated)",
                                            cursor: "pointer", display: "flex", alignItems: "center", gap: "var(--space-md)",
                                            transition: "all 0.2s",
                                        }}>
                                        <span style={{ fontSize: "2rem" }}>{p.emoji}</span>
                                        <div>
                                            <div style={{ fontWeight: 700 }}>{p.label}</div>
                                            <div className="text-muted" style={{ fontSize: "0.85rem" }}>{p.desc}</div>
                                        </div>
                                        {selectedPersonality === p.id && <div style={{ marginLeft: "auto", color: "var(--electric-purple)", fontWeight: 700 }}>✓</div>}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Skills */}
                    {step === 2 && (
                        <div>
                            <h2 style={{ marginBottom: "var(--space-sm)" }}>⚡ Equip Skills</h2>
                            <p className="text-muted" style={{ marginBottom: "var(--space-xl)" }}>Select up to 3 skills ({selectedSkills.length}/3 chosen).</p>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--space-sm)" }}>
                                {ALL_SKILLS.map(skill => {
                                    const selected = selectedSkills.includes(skill.id);
                                    const maxed = !selected && selectedSkills.length >= 3;
                                    return (
                                        <motion.div key={skill.id} whileTap={{ scale: 0.95 }} onClick={() => !maxed && toggleSkill(skill.id)}
                                            style={{
                                                padding: "var(--space-md)", textAlign: "center", borderRadius: "var(--radius-md)",
                                                border: `2px solid ${selected ? "var(--neon-green)" : "var(--border-subtle)"}`,
                                                background: selected ? "rgba(16,185,129,0.1)" : "var(--surface-elevated)",
                                                cursor: maxed ? "not-allowed" : "pointer", opacity: maxed ? 0.4 : 1,
                                                transition: "all 0.2s",
                                            }}>
                                            <div style={{ fontSize: "1.8rem", marginBottom: 4 }}>{skill.icon}</div>
                                            <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>{skill.label}</div>
                                            <div className="badge" style={{ fontSize: "0.6rem", marginTop: 4 }}>{skill.game}</div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Strategy */}
                    {step === 3 && (
                        <div>
                            <h2 style={{ marginBottom: "var(--space-sm)" }}>🎯 Fine-tune Strategy</h2>
                            <p className="text-muted" style={{ marginBottom: "var(--space-xl)" }}>Adjust behavioral sliders. These become the Noir circuit's private strategy commitment.</p>
                            {Object.entries(traits).map(([trait, value]) => (
                                <div key={trait} style={{ marginBottom: "var(--space-lg)" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-xs)" }}>
                                        <span style={{ textTransform: "capitalize", fontWeight: 600 }}>{trait}</span>
                                        <span style={{ fontFamily: "var(--font-mono)", color: "var(--arena-gold)" }}>{(value * 100).toFixed(0)}%</span>
                                    </div>
                                    <input type="range" min={0} max={1} step={0.01} value={value}
                                        onChange={e => setTraits(t => ({ ...t, [trait]: Number(e.target.value) }))}
                                        style={{ width: "100%", accentColor: "var(--electric-purple)" }} />
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "var(--text-muted)" }}>
                                        <span>{trait === "aggression" ? "Passive" : trait === "risk" ? "Safe" : "Predictable"}</span>
                                        <span>{trait === "aggression" ? "Aggressive" : trait === "risk" ? "Risk-taker" : "Creative"}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Step 4: Review */}
                    {step === 4 && (
                        <div>
                            <h2 style={{ marginBottom: "var(--space-lg)" }}>📋 Review & Mint</h2>
                            <div style={{ display: "grid", gap: "var(--space-sm)" }}>
                                {[
                                    { label: "Name", value: agentName },
                                    { label: "Personality", value: PERSONALITIES.find(p => p.id === selectedPersonality)?.label },
                                    { label: "Skills", value: selectedSkills.join(", ") || "None" },
                                    { label: "Aggression", value: `${(traits.aggression * 100).toFixed(0)}%` },
                                    { label: "Risk Tolerance", value: `${(traits.risk * 100).toFixed(0)}%` },
                                    { label: "Creativity", value: `${(traits.creativity * 100).toFixed(0)}%` },
                                ].map(({ label, value }) => (
                                    <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "var(--space-sm)", background: "var(--surface-sunken)", borderRadius: "var(--radius-sm)" }}>
                                        <span className="text-muted">{label}</span>
                                        <span style={{ fontWeight: 600 }}>{value}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="glass-panel" style={{ marginTop: "var(--space-lg)", padding: "var(--space-md)", borderLeft: "3px solid var(--neon-green)" }}>
                                <div style={{ fontSize: "0.8rem", color: "var(--neon-green)", fontWeight: 600 }}>🔐 ZK Strategy Commitment</div>
                                <div className="text-muted" style={{ fontSize: "0.75rem", marginTop: 4 }}>Strategy traits will be committed via Noir circuit before deployment — opponents cannot see your behavioral settings.</div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "var(--space-lg)" }}>
                <button className="btn btn-secondary" onClick={() => setStep(s => s - 1)} disabled={step === 0} style={{ opacity: step === 0 ? 0.4 : 1 }}>
                    ← Back
                </button>
                {step < STEPS.length - 1 ? (
                    <button className="btn btn-primary" onClick={() => setStep(s => s + 1)} disabled={!canNext()}>
                        Next →
                    </button>
                ) : (
                    <button className="btn btn-primary" onClick={handleCreate} disabled={creating} style={{ minWidth: 160 }}>
                        {creating ? "Minting Agent NFT..." : "🚀 Create Agent"}
                    </button>
                )}
            </div>
        </div>
    );
}
