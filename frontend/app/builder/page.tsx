"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

// ── Step types ─────────────────────────────────────────────────
const STEPS = ["Identity", "Personality", "Skills", "Strategy", "Review"];

const PERSONALITIES = [
    { id: "aggressive", emoji: "", label: "Aggressive", desc: "High-risk, high-reward. Attacks relentlessly.", color: "var(--neon-green)" },
    { id: "conservative", emoji: "️", label: "Conservative", desc: "Patient and methodical. Rarely makes mistakes.", color: "#60A5FA" },
    { id: "adaptive", emoji: "", label: "Adaptive", desc: "Reads the game state and shifts strategy dynamically.", color: "var(--electric-purple-light)" },
    { id: "unpredictable", emoji: "", label: "Unpredictable", desc: "Random enough to confuse opponents.", color: "var(--arena-gold)" },
    { id: "chaos", emoji: "", label: "Chaos Agent", desc: "Pure anarchy. Opponents cannot predict a thing.", color: "var(--danger-red)" },
];

const ALL_SKILLS = [
    { id: "endgame_master", label: "Endgame Master", icon: "️", game: "chess" },
    { id: "opening_book", label: "Opening Book", icon: "", game: "chess" },
    { id: "sacrifice_gambit", label: "Sacrifice Gambit", icon: "", game: "chess" },
    { id: "bluff_master", label: "Bluff Master", icon: "", game: "poker" },
    { id: "pot_odds", label: "Pot Odds Expert", icon: "", game: "poker" },
    { id: "property_hoarder", label: "Property Hoarder", icon: "", game: "monopoly" },
    { id: "negotiator", label: "Master Negotiator", icon: "", game: "monopoly" },
    { id: "risk_taker", label: "Risk Taker", icon: "", game: "all" },
    { id: "adaptability", label: "Quick Adapter", icon: "", game: "all" },
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
    const [error, setError] = useState<string | null>(null);

    const toggleSkill = (id: string) => {
        setSelectedSkills(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : prev.length < 3 ? [...prev, id] : prev
        );
    };

    const handleCreate = async () => {
        setCreating(true);
        setError(null);

        try {
            const res = await fetch(`${BACKEND_URL}/agents`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: agentName,
                    personality: selectedPersonality || "adaptive",
                    skills: selectedSkills,
                    traits: traits
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || "Failed to create agent");
            }

            // await new Promise(r => setTimeout(r, 1000)); // Artificial delay for effect
            router.push("/my-agents");
        } catch (err: any) {
            console.error("Agent creation error:", err);
            setError(err.message || "An error occurred");
            setCreating(false);
        }
    };

    const canNext = () => {
        if (step === 0) return agentName.trim().length >= 3;
        if (step === 1) return selectedPersonality !== null;
        if (step === 2) return selectedSkills.length >= 1;
        return true;
    };

    return (
        <div className="page" style={{ maxWidth: 800, margin: "0 auto", paddingBottom: "var(--space-3xl)" }}>

            {/* Header */}
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ textAlign: "center", marginBottom: "var(--space-2xl)" }}>
                <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", marginBottom: "var(--space-xs)" }}>
                    <span className="text-gradient">Agent Forge</span>
                </h1>
                <p className="text-muted" style={{ fontSize: "1.1rem" }}>Construct and parameterize your AI champion.</p>
            </motion.div>

            {/* Progress bar */}
            <div style={{ marginBottom: "var(--space-2xl)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-md)" }}>
                    {STEPS.map((s, i) => (
                        <div key={s} style={{ textAlign: "center", flex: 1, position: "relative" }}>
                            <div style={{
                                width: i === step ? 40 : 32,
                                height: i === step ? 40 : 32,
                                borderRadius: "50%",
                                background: i < step ? "var(--electric-purple-light)" : i === step ? "rgba(10,5,20,0.8)" : "var(--surface-sunken)",
                                margin: "0 auto var(--space-xs)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: i === step ? "1rem" : "0.85rem",
                                fontWeight: 800, color: i < step ? "#000" : "var(--text-primary)",
                                border: i === step ? "2px solid var(--electric-purple-light)" : i < step ? "none" : "1px solid rgba(255,255,255,0.1)",
                                boxShadow: i === step ? "0 0 15px rgba(139, 92, 246, 0.5)" : "none",
                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                textShadow: i === step ? "0 0 10px rgba(255,255,255,0.5)" : "none",
                                zIndex: 2, position: "relative"
                            }}>
                                {i < step ? "" : i + 1}
                            </div>
                            <div className="text-muted" style={{ fontSize: "0.8rem", fontWeight: i === step ? 700 : 500, color: i === step ? "var(--text-primary)" : "var(--text-muted)", transition: "color 0.3s" }}>{s}</div>
                        </div>
                    ))}
                </div>
                {/* Track */}
                <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 3, position: "relative", overflow: "hidden", marginTop: "-48px", marginBottom: "42px", zIndex: 0, width: "calc(100% - 20%)", marginLeft: "10%" }}>
                    <motion.div
                        style={{ height: "100%", background: "linear-gradient(90deg, var(--neon-green), var(--electric-purple-light))", borderRadius: 3, boxShadow: "0 0 10px var(--electric-purple-light)" }}
                        animate={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
                        transition={{ type: "spring", stiffness: 50, damping: 15 }}
                    />
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: "var(--space-md)", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.5)", color: "var(--danger-red)", marginBottom: "var(--space-lg)", textAlign: "center", borderRadius: "var(--radius-md)" }}>
                    ️ {error}
                </motion.div>
            )}

            {/* Step Content */}
            <AnimatePresence mode="wait">
                <motion.div key={step}
                    initial={{ x: 40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -40, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="glass-card"
                    style={{ padding: "var(--space-2xl)", minHeight: 450, background: "rgba(10,5,20,0.6)" }}
                >

                    {/* Step 0: Identity */}
                    {step === 0 && (
                        <div>
                            <h2 style={{ marginBottom: "var(--space-sm)", fontSize: "1.8rem" }}> Name Your Agent</h2>
                            <p className="text-muted" style={{ marginBottom: "var(--space-2xl)", fontSize: "1.05rem" }}>Give your AI agent an identity it will carry on the blockchain forever.</p>

                            <div style={{ position: "relative" }}>
                                <input
                                    type="text" placeholder="e.g. NeuralNinja, ChaosMaster..."
                                    value={agentName} onChange={e => setAgentName(e.target.value)}
                                    style={{
                                        fontSize: "1.5rem", padding: "var(--space-lg)", width: "100%",
                                        background: "rgba(0,0,0,0.5)", border: "2px solid rgba(255,255,255,0.1)",
                                        borderRadius: "var(--radius-md)", color: "var(--text-primary)",
                                        outline: "none", transition: "border-color 0.3s, box-shadow 0.3s",
                                        boxShadow: agentName.trim().length >= 3 ? "0 0 15px rgba(139, 92, 246, 0.3)" : "none",
                                        borderColor: agentName.trim().length >= 3 ? "var(--electric-purple-light)" : "rgba(255,255,255,0.1)"
                                    }}
                                    maxLength={32}
                                />
                                <div className="text-muted" style={{ position: "absolute", bottom: "-24px", right: "8px", fontSize: "0.8rem", color: agentName.length === 32 ? "var(--arena-gold)" : "var(--text-muted)" }}>
                                    {agentName.length}/32
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 1: Personality */}
                    {step === 1 && (
                        <div>
                            <h2 style={{ marginBottom: "var(--space-sm)", fontSize: "1.8rem" }}> Choose Personality</h2>
                            <p className="text-muted" style={{ marginBottom: "var(--space-2xl)", fontSize: "1.05rem" }}>Personality shapes how your agent thinks under pressure. This will affect their in-game chat and fundamental playstyle.</p>

                            <div style={{ display: "grid", gap: "var(--space-md)" }}>
                                {PERSONALITIES.map(p => (
                                    <motion.div key={p.id} whileTap={{ scale: 0.98 }} onClick={() => setSelectedPersonality(p.id)}
                                        style={{
                                            padding: "var(--space-lg)", borderRadius: "var(--radius-lg)",
                                            border: `2px solid ${selectedPersonality === p.id ? p.color : "rgba(255,255,255,0.05)"}`,
                                            background: selectedPersonality === p.id ? `linear-gradient(90deg, ${p.color}20, transparent)` : "rgba(0,0,0,0.4)",
                                            cursor: "pointer", display: "flex", alignItems: "center", gap: "var(--space-xl)",
                                            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                            boxShadow: selectedPersonality === p.id ? `0 0 20px ${p.color}20` : "none"
                                        }}>
                                        <div style={{
                                            fontSize: "2.5rem", width: 64, height: 64, borderRadius: "50%",
                                            background: selectedPersonality === p.id ? `${p.color}20` : "rgba(255,255,255,0.05)",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            border: `1px solid ${selectedPersonality === p.id ? p.color : "transparent"}`
                                        }}>{p.emoji}</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 800, fontSize: "1.2rem", color: selectedPersonality === p.id ? p.color : "var(--text-primary)", marginBottom: 4 }}>{p.label}</div>
                                            <div className="text-muted" style={{ fontSize: "0.95rem", lineHeight: 1.4 }}>{p.desc}</div>
                                        </div>
                                        <div style={{
                                            width: 28, height: 28, borderRadius: "50%", border: `2px solid ${selectedPersonality === p.id ? p.color : "rgba(255,255,255,0.2)"}`,
                                            background: selectedPersonality === p.id ? p.color : "transparent",
                                            display: "flex", alignItems: "center", justifyContent: "center", color: "#000", fontWeight: "bold"
                                        }}>
                                            {selectedPersonality === p.id && ""}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Skills */}
                    {step === 2 && (
                        <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "var(--space-sm)" }}>
                                <h2 style={{ fontSize: "1.8rem" }}> Equip Skills</h2>
                                <span className="badge" style={{ background: selectedSkills.length === 3 ? "var(--neon-green)" : "rgba(255,255,255,0.1)", color: selectedSkills.length === 3 ? "#000" : "var(--text-primary)", fontSize: "0.9rem", padding: "6px 12px" }}>
                                    {selectedSkills.length}/3 Chosen
                                </span>
                            </div>
                            <p className="text-muted" style={{ marginBottom: "var(--space-2xl)", fontSize: "1.05rem" }}>Select up to 3 specialized skills to give your agent an edge in specific scenarios.</p>

                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-md)" }}>
                                {ALL_SKILLS.map(skill => {
                                    const selected = selectedSkills.includes(skill.id);
                                    const maxed = !selected && selectedSkills.length >= 3;
                                    return (
                                        <motion.div key={skill.id} whileTap={{ scale: 0.95 }} onClick={() => !maxed && toggleSkill(skill.id)}
                                            style={{
                                                padding: "var(--space-xl) var(--space-md)", textAlign: "center", borderRadius: "var(--radius-lg)",
                                                border: `2px solid ${selected ? "var(--neon-green)" : "rgba(255,255,255,0.05)"}`,
                                                background: selected ? "rgba(16,185,129,0.1)" : "rgba(0,0,0,0.4)",
                                                cursor: maxed ? "not-allowed" : "pointer", opacity: maxed ? 0.4 : 1,
                                                transition: "all 0.2s", boxShadow: selected ? "0 0 20px rgba(16,185,129,0.2)" : "none",
                                                position: "relative", overflow: "hidden"
                                            }}>
                                            {selected && <div style={{ position: "absolute", top: 8, right: 8, color: "var(--neon-green)" }}></div>}
                                            <div style={{ fontSize: "2.5rem", marginBottom: "var(--space-sm)", filter: selected ? "drop-shadow(0 0 10px rgba(16,185,129,0.5))" : "none" }}>{skill.icon}</div>
                                            <div style={{ fontSize: "1.05rem", fontWeight: 700, color: selected ? "var(--text-primary)" : "var(--text-secondary)", marginBottom: 8 }}>{skill.label}</div>
                                            <div className="badge" style={{ fontSize: "0.7rem", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-muted)", textTransform: "capitalize" }}>{skill.game}</div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Strategy */}
                    {step === 3 && (
                        <div>
                            <h2 style={{ marginBottom: "var(--space-sm)", fontSize: "1.8rem" }}> Fine-tune Strategy</h2>
                            <p className="text-muted" style={{ marginBottom: "var(--space-2xl)", fontSize: "1.05rem" }}>Adjust behavioral sliders. These become the Noir circuit's private strategy commitment.</p>

                            <div style={{ background: "rgba(0,0,0,0.3)", padding: "var(--space-xl)", borderRadius: "var(--radius-md)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                {Object.entries(traits).map(([trait, value], i) => {
                                    const isLast = i === Object.keys(traits).length - 1;
                                    return (
                                        <div key={trait} style={{ marginBottom: isLast ? 0 : "var(--space-xl)" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-md)" }}>
                                                <span style={{ textTransform: "capitalize", fontWeight: 700, fontSize: "1.1rem", color: "var(--text-primary)" }}>{trait}</span>
                                                <span style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", color: "var(--electric-purple-light)", fontWeight: 800, textShadow: "0 0 10px rgba(139, 92, 246, 0.4)" }}>{(value * 100).toFixed(0)}%</span>
                                            </div>
                                            <div style={{ position: "relative", padding: "10px 0" }}>
                                                <input type="range" min={0} max={1} step={0.01} value={value}
                                                    onChange={e => setTraits(t => ({ ...t, [trait]: Number(e.target.value) }))}
                                                    style={{
                                                        width: "100%", accentColor: "var(--electric-purple-light)",
                                                        cursor: "pointer"
                                                    }}
                                                />
                                            </div>
                                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, marginTop: 4 }}>
                                                <span>{trait === "aggression" ? "Passive / Defensive" : trait === "risk" ? "Calculated / Safe" : "Conventional"}</span>
                                                <span>{trait === "aggression" ? "Highly Aggressive" : trait === "risk" ? "High-Risk Taker" : "Unorthodox"}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Step 4: Review */}
                    {step === 4 && (
                        <div>
                            <h2 style={{ marginBottom: "var(--space-xl)", fontSize: "1.8rem" }}> Review & Mint</h2>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-lg)" }}>
                                <div style={{ display: "grid", gap: "var(--space-xs)" }}>
                                    <div className="text-muted" style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700, marginBottom: 8 }}>Identity & Core</div>
                                    {[
                                        { label: "Name", value: agentName, color: "var(--text-primary)" },
                                        { label: "Personality", value: PERSONALITIES.find(p => p.id === selectedPersonality)?.label, color: PERSONALITIES.find(p => p.id === selectedPersonality)?.color || "white" },
                                        { label: "Skills", value: selectedSkills.map(id => ALL_SKILLS.find(s => s.id === id)?.label).join(", ") || "None Equipped", color: "var(--text-secondary)" },
                                    ].map(({ label, value, color }) => (
                                        <div key={label} style={{ display: "flex", flexDirection: "column", gap: 4, padding: "var(--space-md)", background: "rgba(0,0,0,0.4)", borderRadius: "var(--radius-sm)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                            <span className="text-muted" style={{ fontSize: "0.8rem" }}>{label}</span>
                                            <span style={{ fontWeight: 700, color: color, fontSize: "1.1rem" }}>{value}</span>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: "grid", gap: "var(--space-xs)" }}>
                                    <div className="text-muted" style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700, marginBottom: 8 }}>Parametric Strategy</div>
                                    {[
                                        { label: "Aggression", value: `${(traits.aggression * 100).toFixed(0)}%` },
                                        { label: "Risk Tolerance", value: `${(traits.risk * 100).toFixed(0)}%` },
                                        { label: "Creativity", value: `${(traits.creativity * 100).toFixed(0)}%` },
                                    ].map(({ label, value }) => (
                                        <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "var(--space-md)", background: "rgba(0,0,0,0.4)", borderRadius: "var(--radius-sm)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                            <span className="text-muted" style={{ fontSize: "0.9rem" }}>{label}</span>
                                            <span style={{ fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--electric-purple-light)", fontSize: "1.2rem", textShadow: "0 0 10px rgba(139, 92, 246, 0.3)" }}>{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="glass-panel" style={{ marginTop: "var(--space-2xl)", padding: "var(--space-lg)", borderLeft: "4px solid var(--neon-green)", background: "linear-gradient(90deg, rgba(16,185,129,0.05), transparent)" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", marginBottom: 8 }}>
                                    <span style={{ fontSize: "1.5rem" }}></span>
                                    <div style={{ fontSize: "1rem", color: "var(--neon-green)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>ZK Strategy Commitment Generation</div>
                                </div>
                                <div className="text-muted" style={{ fontSize: "0.95rem", lineHeight: 1.5 }}>
                                    Upon creation, your agent's strategy parameters (Aggression, Risk, Creativity) will be hashed into a Noir zero-knowledge circuit commitment.
                                    This ensures opponents cannot see your exact settings while cryptographically proving you are playing by them.
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "var(--space-2xl)", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "var(--space-xl)" }}>
                <button className="btn" onClick={() => setStep(s => s - 1)} disabled={step === 0 || creating} style={{ opacity: step === 0 ? 0 : 1, padding: "12px 24px", background: "rgba(255,255,255,0.05)", pointerEvents: step === 0 ? "none" : "auto" }}>
                    ← Back
                </button>
                {step < STEPS.length - 1 ? (
                    <button className="btn btn-primary" onClick={() => setStep(s => s + 1)} disabled={!canNext()} style={{ padding: "12px 48px", fontSize: "1.1rem" }}>
                        Next Step
                    </button>
                ) : (
                    <button className="btn btn-primary" onClick={handleCreate} disabled={creating} style={{
                        padding: "16px 48px", fontSize: "1.1rem", minWidth: 200,
                        background: creating ? "rgba(139, 92, 246, 0.5)" : "linear-gradient(45deg, var(--electric-purple), var(--electric-purple-light))",
                        boxShadow: creating ? "none" : "0 0 20px rgba(139, 92, 246, 0.6)"
                    }}>
                        {creating ? "Minting Protocol..." : " Finalize & Deploy Agent"}
                    </button>
                )}
            </div>
        </div>
    );
}
