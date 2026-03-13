"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text, Float, Html, ContactShadows, Billboard, Sphere, Grid, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { WebGLSafeCanvas } from "@/components/world/WebGLErrorBoundary";
import { apiPost } from "@/lib/api";

// ── Agent Data & Constants ─────────────────────────────────────
const PERSONALITIES = [
    { id: "aggressive", label: "Aggressive", desc: "High-risk, high-reward.", color: "#10B981", shape: "tetrahedron" },
    { id: "conservative", label: "Conservative", desc: "Patient and methodical.", color: "#60A5FA", shape: "box" },
    { id: "adaptive", label: "Adaptive", desc: "Shifts strategy dynamically.", color: "#8B5CF6", shape: "dodecahedron" },
    { id: "chaotic", label: "Chaos Agent", desc: "Pure unpredictable anarchy.", color: "#EF4444", shape: "icosahedron" },
];

const ALL_SKILLS = [
    { id: "endgame_master", label: "Endgame Master", game: "chess" },
    { id: "opening_book", label: "Opening Book", game: "chess" },
    { id: "pot_odds", label: "Pot Odds Expert", game: "poker" },
    { id: "bluff_master", label: "Bluff Master", game: "poker" },
    { id: "property_hoarder", label: "Property Hoarder", game: "monopoly" },
    { id: "risk_taker", label: "Risk Taker", game: "all" },
];

// ── 3D Components for Neural Interface ───────────────────────

function NeuralCore({ personality, color, isCompiling, traits }: any) {
    const coreRef = useRef<THREE.Mesh>(null);
    const shellRef = useRef<THREE.Group>(null);
    const particlesRef = useRef<THREE.Points>(null);

    const ShellGeometry = useMemo(() => {
        const p = PERSONALITIES.find(x => x.id === personality);
        switch (p?.shape) {
            case "tetrahedron": return <tetrahedronGeometry args={[1.5]} />;
            case "box": return <boxGeometry args={[1.6, 1.6, 1.6]} />;
            case "icosahedron": return <icosahedronGeometry args={[1.6, 0]} />;
            case "dodecahedron": return <dodecahedronGeometry args={[1.6, 0]} />;
            default: return <octahedronGeometry args={[1.6, 0]} />;
        }
    }, [personality]);

    useFrame((state, delta) => {
        const t = state.clock.elapsedTime;
        if (coreRef.current) {
            coreRef.current.scale.setScalar(1 + Math.sin(t * (isCompiling ? 12 : 3)) * (isCompiling ? 0.15 : 0.05));
        }
        if (shellRef.current) {
            shellRef.current.rotation.x += delta * (isCompiling ? 2 : 0.15 + traits.aggression * 0.5);
            shellRef.current.rotation.y += delta * (isCompiling ? 3 : 0.2 + traits.risk * 0.5);
            shellRef.current.position.y = Math.sin(t * 1.5) * 0.2;
        }
        if (particlesRef.current) {
            particlesRef.current.rotation.y -= delta * (isCompiling ? 1 : 0.1);
        }
    });

    return (
        <group position={[0, 0, 0]}>
            <spotLight position={[0, 5, 0]} intensity={isCompiling ? 5 : 2} color={color} angle={0.8} penumbra={1} distance={15} />

            {/* Inner Brain Core */}
            <mesh ref={coreRef}>
                <sphereGeometry args={[0.5, 32, 32]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isCompiling ? 4 : 2} toneMapped={false} />
            </mesh>

            {/* Neural Shell */}
            <group ref={shellRef}>
                <mesh>
                    {ShellGeometry}
                    <meshPhysicalMaterial
                        color="#0A0A14"
                        emissive={color}
                        emissiveIntensity={0.15 + traits.creativity * 0.5}
                        metalness={0.9}
                        roughness={0.1}
                        transmission={0.98}
                        thickness={0.8}
                        transparent
                        opacity={0.8}
                    />
                </mesh>
                {/* Wireframe inner shell */}
                <mesh scale={0.99}>
                    {ShellGeometry}
                    <meshBasicMaterial color={color} wireframe transparent opacity={0.2} />
                </mesh>
            </group>

            {/* Orbiting Particles */}
            <points ref={particlesRef}>
                <sphereGeometry args={[2.5, 32, 32]} />
                <pointsMaterial size={0.05} color={color} sizeAttenuation transparent opacity={0.4} blending={THREE.AdditiveBlending} />
            </points>
            <Sparkles count={100} scale={6} size={4} speed={0.4} opacity={0.3} color={color} />
        </group>
    );
}

function DataRings({ color, isCompiling, traits }: any) {
    const groupRef = useRef<THREE.Group>(null);
    const ring1 = useRef<THREE.Mesh>(null);
    const ring2 = useRef<THREE.Mesh>(null);
    const ring3 = useRef<THREE.Mesh>(null);

    useFrame((_, delta) => {
        const speed = isCompiling ? 5 : 1;
        if (groupRef.current) groupRef.current.rotation.y += delta * 0.1;
        if (ring1.current) ring1.current.rotation.z += delta * speed * (0.3 + traits.aggression * 0.5);
        if (ring2.current) {
            ring2.current.rotation.x += delta * speed * (-0.2);
            ring2.current.rotation.y += delta * speed * (0.4 + traits.risk * 0.5);
        }
        if (ring3.current) {
            ring3.current.rotation.x -= delta * speed * 0.5;
            ring3.current.rotation.z += delta * speed * 0.2;
        }
    });

    return (
        <group ref={groupRef}>
            <mesh ref={ring1} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[3.2, 0.015, 16, 120]} />
                <meshBasicMaterial color={color} transparent opacity={0.5} blending={THREE.AdditiveBlending} />
            </mesh>
            <mesh ref={ring2} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
                <torusGeometry args={[4.5, 0.01, 16, 120]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.15} />
            </mesh>
            <mesh ref={ring3} rotation={[-Math.PI / 4, 0, Math.PI / 6]}>
                <torusGeometry args={[5.5, 0.02, 16, 120]} />
                <meshBasicMaterial color={color} transparent opacity={0.2} blending={THREE.AdditiveBlending} />
            </mesh>
        </group>
    );
}

function FloatingData({ name, personality, skills, traits, color, isCompiling }: any) {
    if (isCompiling) return null;
    return (
        <Billboard position={[4.5, 2.5, 0]}>
            <Html transform distanceFactor={12} zIndexRange={[100, 0]}>
                <div style={{
                    width: 280,
                    background: "rgba(10,10,20,0.75)",
                    backdropFilter: "blur(12px)",
                    border: `1px solid ${color}40`,
                    boxShadow: `0 0 30px ${color}20, inset 0 0 20px ${color}10`,
                    borderRadius: 12,
                    padding: "16px 20px",
                    fontFamily: "var(--font-mono)",
                    color: "var(--text-primary)",
                    fontSize: "0.75rem",
                    userSelect: "none",
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 10, marginBottom: 12 }}>
                        <span style={{ fontWeight: 800, color: "var(--text-muted)", letterSpacing: "0.05em" }}>[AGENT_METADATA]</span>
                        <span style={{ color, animation: "flicker 2s infinite", textShadow: `0 0 8px ${color}` }}>● LIVE</span>
                    </div>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "var(--text-muted)" }}>ID_HASH:</span>
                            <span style={{ fontWeight: 700 }}>{name ? `${name.substring(0,8).toUpperCase()}...` : "0x0000..."}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "var(--text-muted)" }}>CLASS:</span>
                            <span style={{ color, fontWeight: 800, textShadow: `0 0 10px ${color}60` }}>{personality.toUpperCase()}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "var(--text-muted)" }}>MODULES:</span>
                            <span style={{ fontWeight: 700 }}>{skills.length}/3 EQUIPPED</span>
                        </div>
                        
                        <div style={{ marginTop: 8, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                            <div style={{ color: "var(--text-muted)", marginBottom: 8, fontSize: "0.65rem" }}>STRATEGY_MATRIX_DUMP</div>
                            
                            {[
                                { key: "AGR", val: traits.aggression },
                                { key: "RSK", val: traits.risk },
                                { key: "CRT", val: traits.creativity }
                            ].map(t => (
                                <div key={t.key} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                                    <div style={{ width: 28, fontWeight: 700, color: "var(--text-secondary)" }}>{t.key}</div>
                                    <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 99, overflow: "hidden" }}>
                                        <div style={{ width: `${t.val * 100}%`, height: "100%", background: color, boxShadow: `0 0 8px ${color}` }} />
                                    </div>
                                    <div style={{ width: 30, textAlign: "right", color }}>{(t.val * 100).toFixed(0)}%</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Html>
        </Billboard>
    );
}

function NeuralScene({ agentName, personality, skills, traits, color, isCompiling }: any) {
    return (
        <>
            {/* Dark atmospheric lighting */}
            <ambientLight intensity={0.15} color="#0A0A14" />
            <spotLight position={[8, 12, 5]} intensity={3} angle={0.8} penumbra={1} color="#ffffff" castShadow />
            <pointLight position={[-5, -5, -5]} intensity={1.5} color={color} distance={25} />

            <NeuralCore personality={personality} color={color} isCompiling={isCompiling} traits={traits} />
            <DataRings color={color} isCompiling={isCompiling} traits={traits} />
            <FloatingData name={agentName} personality={personality} skills={skills} traits={traits} color={color} isCompiling={isCompiling} />

            {/* Emissive Grid Floor */}
            <Grid position={[0, -4, 0]} args={[40, 40]} cellColor={color} sectionColor={color} sectionThickness={1.5} fadeDistance={30} cellThickness={0.5} />
            <ContactShadows position={[0, -3.9, 0]} opacity={0.6} scale={15} blur={3} far={5} color={color} />
            
            <OrbitControls enablePan={false} enableZoom={true} minDistance={6} maxDistance={20} autoRotate autoRotateSpeed={isCompiling ? 15 : 0.8} maxPolarAngle={Math.PI / 2 + 0.1} />
        </>
    );
}

// ── Main Page Component ───────────────────────────────────────
export default function BuilderPage() {
    const router = useRouter();
    const [agentName, setAgentName] = useState("");
    const [selectedPersonality, setSelectedPersonality] = useState("adaptive");
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [traits, setTraits] = useState({ aggression: 0.5, risk: 0.5, creativity: 0.5 });
    const [isCompiling, setIsCompiling] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const activeColor = PERSONALITIES.find(p => p.id === selectedPersonality)?.color || "#8B5CF6";

    const toggleSkill = (id: string) => {
        setSelectedSkills(prev => prev.includes(id) ? prev.filter(s => s !== id) : prev.length < 3 ? [...prev, id] : prev);
    };

    const handleCompile = async () => {
        if (agentName.trim().length < 3) {
            setError("Agent Name must be at least 3 characters.");
            return;
        }
        setIsCompiling(true);
        setError(null);

        try {
            await apiPost("/agents", {
                name: agentName,
                personality: selectedPersonality,
                skills: selectedSkills,
                traits: traits
            });

            // Let the compiling animation run for a bit
            setTimeout(() => {
                router.push("/my-agents");
            }, 3000);

        } catch (err: any) {
            console.error("Agent creation error:", err);
            setError(err.message || "An error occurred");
            setIsCompiling(false);
        }
    };

    return (
        <div style={{ display: "flex", height: "100vh", width: "100%", background: "var(--bg-void)", paddingTop: 80, overflow: "hidden" }}>

            {/* Left Panel: Neural Controls */}
            <div style={{ width: 440, background: "rgba(10,10,20,0.96)", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", zIndex: 10, boxShadow: "4px 0 32px rgba(0,0,0,0.5)", overflowY: "auto" }}>
                <div style={{ padding: "24px 28px", borderBottom: "1px solid rgba(255,255,255,0.05)", position: "sticky", top: 0, background: "rgba(8,8,16,0.95)", backdropFilter: "blur(20px)", zIndex: 20 }}>
                    <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.5rem", color: "var(--text-primary)", marginBottom: 4, letterSpacing: "-0.03em" }}>Neural Interface</h1>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Agent Synthesis Protocol v3.0</p>
                </div>

                {error && (
                    <div style={{ margin: "20px 28px 0", padding: "14px 16px", background: "var(--apex-red-dim)", border: "1px solid rgba(255,59,92,0.3)", color: "var(--apex-red)", fontSize: "0.8rem", fontFamily: "var(--font-mono)", borderRadius: 12 }}>
                        ⚠ ERR: {error}
                    </div>
                )}

                <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 28 }}>

                    {/* 01 Identity Matrix */}
                    <div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--apex-cyan)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 20, height: 1, background: "var(--apex-cyan)" }} />
                            01 · Identity Matrix
                        </div>
                        <input
                            id="agent-name-input"
                            type="text"
                            placeholder="INITIALIZE_NAME..."
                            value={agentName}
                            onChange={(e) => setAgentName(e.target.value)}
                            style={{
                                width: "100%",
                                background: "rgba(255,255,255,0.03)",
                                border: "1px solid rgba(255,255,255,0.08)",
                                borderBottom: `2px solid ${agentName ? activeColor : "rgba(255,255,255,0.1)"}`,
                                borderRadius: 10,
                                color: "var(--text-primary)",
                                fontSize: "1.1rem",
                                fontFamily: "var(--font-mono)",
                                fontWeight: 600,
                                padding: "13px 16px",
                                outline: "none",
                                transition: "all 0.2s ease",
                                letterSpacing: "0.04em",
                            }}
                            maxLength={32}
                            disabled={isCompiling}
                        />
                    </div>

                    {/* 02 Behavioral Core */}
                    <div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--apex-cyan)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 20, height: 1, background: "var(--apex-cyan)" }} />
                            02 · Behavioral Core
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                            {PERSONALITIES.map(p => (
                                <button
                                    key={p.id}
                                    id={`personality-${p.id}`}
                                    onClick={() => setSelectedPersonality(p.id)}
                                    disabled={isCompiling}
                                    style={{
                                        padding: "14px 16px",
                                        textAlign: "left",
                                        borderRadius: 12,
                                        cursor: "pointer",
                                        background: selectedPersonality === p.id ? `${p.color}10` : "rgba(255,255,255,0.02)",
                                        border: selectedPersonality === p.id ? `1px solid ${p.color}50` : "1px solid rgba(255,255,255,0.06)",
                                        borderLeft: selectedPersonality === p.id ? `3px solid ${p.color}` : "1px solid rgba(255,255,255,0.06)",
                                        boxShadow: selectedPersonality === p.id ? `inset 0 0 20px ${p.color}12, 0 0 20px ${p.color}10` : "none",
                                        transition: "all 0.2s ease",
                                    }}
                                >
                                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.9rem", color: selectedPersonality === p.id ? p.color : "var(--text-primary)", marginBottom: 4 }}>{p.label}</div>
                                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", lineHeight: 1.4 }}>{p.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 03 Tactical Hardwiring — Skill pills */}
                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--apex-cyan)", letterSpacing: "0.14em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ width: 20, height: 1, background: "var(--apex-cyan)" }} />
                                03 · Tactical Hardwiring
                            </div>
                            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--text-muted)", padding: "3px 10px", borderRadius: 99, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                {selectedSkills.length}/3 EQUIPPED
                            </div>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {ALL_SKILLS.map(skill => {
                                const sel = selectedSkills.includes(skill.id);
                                return (
                                    <button
                                        key={skill.id}
                                        id={`skill-${skill.id}`}
                                        onClick={() => toggleSkill(skill.id)}
                                        disabled={isCompiling}
                                        style={{
                                            padding: "7px 14px",
                                            borderRadius: 99,
                                            cursor: "pointer",
                                            fontFamily: "var(--font-mono)",
                                            fontSize: "0.75rem",
                                            fontWeight: 600,
                                            color: sel ? "var(--apex-green)" : "var(--text-muted)",
                                            background: sel ? "var(--apex-green-dim)" : "rgba(255,255,255,0.02)",
                                            border: sel ? "1px solid rgba(0,232,135,0.3)" : "1px solid rgba(255,255,255,0.08)",
                                            boxShadow: sel ? "0 0 12px rgba(0,232,135,0.15)" : "none",
                                            transition: "all 0.2s ease",
                                        }}
                                    >
                                        {sel ? "✓ " : ""}{skill.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 04 Strategy Parameters */}
                    <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)", padding: "18px 20px" }}>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--apex-cyan)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 20, height: 1, background: "var(--apex-cyan)" }} />
                            04 · Strategy Matrix
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                            {Object.entries(traits).map(([trait, value]) => (
                                <div key={trait}>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                                        <span style={{ color: "var(--text-secondary)" }}>{trait}</span>
                                        <span style={{ color: activeColor, fontWeight: 700 }}>{(value * 100).toFixed(0)}%</span>
                                    </div>
                                    <div style={{ position: "relative", height: 20, display: "flex", alignItems: "center" }}>
                                        {/* Visual track */}
                                        <div style={{ width: "100%", height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden", position: "absolute", top: "50%", transform: "translateY(-50%)" }}>
                                            <div style={{ height: "100%", width: `${value * 100}%`, background: `linear-gradient(90deg, ${activeColor}80, ${activeColor})`, borderRadius: 99, boxShadow: `0 0 8px ${activeColor}60`, transition: "width 0.1s ease" }} />
                                        </div>
                                        {/* Invisible native range input overlaid for interaction */}
                                        <input
                                            type="range" min={0} max={1} step={0.01} value={value}
                                            disabled={isCompiling}
                                            onChange={e => setTraits(t => ({ ...t, [trait]: Number(e.target.value) }))}
                                            style={{ position: "absolute", inset: 0, width: "100%", opacity: 0, cursor: "pointer", height: "100%" }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Compile Button */}
                <div style={{ padding: "20px 28px", borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(8,8,16,0.95)", backdropFilter: "blur(20px)", position: "sticky", bottom: 0, zIndex: 20 }}>
                    <button
                        id="compile-button"
                        onClick={handleCompile}
                        disabled={isCompiling || agentName.length < 3}
                        style={{
                            width: "100%",
                            padding: "14px",
                            borderRadius: 12,
                            fontFamily: "var(--font-mono)",
                            fontWeight: 700,
                            fontSize: "0.9rem",
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            cursor: isCompiling || agentName.length < 3 ? "not-allowed" : "pointer",
                            opacity: agentName.length < 3 ? 0.4 : 1,
                            background: isCompiling
                                ? `linear-gradient(135deg, ${activeColor}, ${activeColor}cc)`
                                : `linear-gradient(135deg, var(--apex-violet), #5A3AE8)`,
                            color: isCompiling ? "#000" : "#fff",
                            border: "none",
                            boxShadow: isCompiling
                                ? `0 0 40px ${activeColor}, 0 8px 30px ${activeColor}60`
                                : "0 6px 24px rgba(123,92,250,0.4)",
                            transition: "all 0.3s ease",
                        }}
                    >
                        {isCompiling ? (
                            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                                <span style={{ width: 14, height: 14, border: "2px solid rgba(0,0,0,0.3)", borderTopColor: "#000", borderRadius: "50%", animation: "rotate 1s linear infinite", display: "inline-block" }} />
                                COMPILING NEURAL NET...
                            </span>
                        ) : (
                            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                                ⚡ INITIATE COMPILE
                            </span>
                        )}
                    </button>
                    {!isCompiling && (
                        <p style={{ textAlign: "center", fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--text-muted)", marginTop: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                            ZK Circuit commitment generated on-chain
                        </p>
                    )}
                </div>
            </div>

            {/* Right Panel: Live 3D Preview */}
            <div style={{ flex: 1, position: "relative", background: "#020205" }}>
                {/* Subtle grid overlay */}
                <div style={{
                    position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
                    backgroundImage: "linear-gradient(rgba(123,92,250,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(123,92,250,0.04) 1px, transparent 1px)",
                    backgroundSize: "48px 48px",
                }} />

                {/* Top status bar */}
                <div style={{ position: "absolute", top: 16, right: 20, zIndex: 10, display: "flex", gap: 16, fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--text-muted)", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--apex-green)", boxShadow: "0 0 6px var(--apex-green-glow)", animation: "pulse-dot 2s ease infinite" }} />
                        ENGINE ONLINE
                    </div>
                    <div style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(13,13,26,0.7)", border: "1px solid rgba(255,255,255,0.06)" }}>FPS: 60</div>
                    <div style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(13,13,26,0.7)", border: "1px solid rgba(255,255,255,0.06)" }}>MEM: 450MB</div>
                </div>

                <WebGLSafeCanvas camera={{ position: [0, 2, 12], fov: 45 }} gl={{ antialias: true, alpha: false }}>
                    <color attach="background" args={["#020205"]} />
                    <fog attach="fog" args={["#020205", 10, 30]} />

                    <NeuralScene
                        agentName={agentName}
                        personality={selectedPersonality}
                        skills={selectedSkills}
                        traits={traits}
                        color={activeColor}
                        isCompiling={isCompiling}
                    />
                </WebGLSafeCanvas>

                {isCompiling && (
                    <div style={{ position: "absolute", inset: 0, zIndex: 20, pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
                            <div style={{ width: 60, height: 60, border: `2px solid ${activeColor}30`, borderTopColor: activeColor, borderRadius: "50%", animation: "rotate 0.8s linear infinite" }} />
                            <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1.1rem", letterSpacing: "0.4em", color: activeColor, textShadow: `0 0 30px ${activeColor}`, animation: "flicker 3s ease infinite" }}>
                                COMPILING
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
