"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text, Float, Html, ContactShadows, Billboard } from "@react-three/drei";
import * as THREE from "three";
import { WebGLSafeCanvas } from "@/components/world/WebGLErrorBoundary";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

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

function NeuralCore({ personality, color, isCompiling }: { personality: string, color: string, isCompiling: boolean }) {
    const coreRef = useRef<THREE.Mesh>(null);
    const shellRef = useRef<THREE.Mesh>(null);

    const ShellGeometry = useMemo(() => {
        const p = PERSONALITIES.find(x => x.id === personality);
        switch (p?.shape) {
            case "tetrahedron": return <tetrahedronGeometry args={[1.5]} />;
            case "box": return <boxGeometry args={[2, 2, 2]} />;
            case "icosahedron": return <icosahedronGeometry args={[1.5, 0]} />;
            case "dodecahedron": return <dodecahedronGeometry args={[1.5, 0]} />;
            default: return <octahedronGeometry args={[1.5, 0]} />;
        }
    }, [personality]);

    useFrame((state, delta) => {
        if (coreRef.current) {
            coreRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * (isCompiling ? 15 : 2)) * (isCompiling ? 0.2 : 0.05));
        }
        if (shellRef.current) {
            shellRef.current.rotation.x += delta * (isCompiling ? 2 : 0.2);
            shellRef.current.rotation.y += delta * (isCompiling ? 3 : 0.3);
            shellRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.2;
        }
    });

    return (
        <group position={[0, 0, 0]}>
            {/* Inner Brain */}
            <mesh ref={coreRef}>
                <sphereGeometry args={[0.5, 32, 32]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isCompiling ? 3 : 1.5} toneMapped={false} />
            </mesh>

            {/* Neural Shell */}
            <mesh ref={shellRef}>
                {ShellGeometry}
                <meshPhysicalMaterial
                    color="#0C0C28"
                    emissive={color}
                    emissiveIntensity={0.2}
                    metalness={0.9}
                    roughness={0.1}
                    transmission={0.95}
                    thickness={0.5}
                    wireframe={isCompiling}
                />
            </mesh>

            {/* Compile Particles */}
            {isCompiling && (
                <particles count={500} color={color} /> // Fake element, actually using separate component below
            )}
        </group>
    );
}

function DataRings({ color, isCompiling }: { color: string, isCompiling: boolean }) {
    const ring1 = useRef<THREE.Mesh>(null);
    const ring2 = useRef<THREE.Mesh>(null);

    useFrame((_, delta) => {
        if (ring1.current) ring1.current.rotation.z += delta * (isCompiling ? 5 : 0.5);
        if (ring2.current) {
            ring2.current.rotation.x += delta * (isCompiling ? -4 : -0.3);
            ring2.current.rotation.y += delta * (isCompiling ? 3 : 0.4);
        }
    });

    return (
        <group>
            <mesh ref={ring1} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[3, 0.02, 16, 100]} />
                <meshBasicMaterial color={color} transparent opacity={0.3} />
            </mesh>
            <mesh ref={ring2}>
                <torusGeometry args={[4, 0.01, 16, 100]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.1} />
            </mesh>
        </group>
    );
}

function FloatingData({ name, personality, skills, traits, color }: any) {
    return (
        <Billboard position={[4, 2, 0]}>
            <Html transform distanceFactor={10} zIndexRange={[100, 0]}>
                <div className="w-[280px] p-4 bg-black/60 backdrop-blur-md border rounded-xl font-mono text-xs" style={{ borderColor: color, boxShadow: `0 0 20px ${color}40` }}>
                    <div className="text-white font-bold mb-2 pb-2 border-b border-white/10 flex justify-between">
                        <span>[AGENT_METADATA]</span>
                        <span className="animate-pulse" style={{ color }}>●</span>
                    </div>
                    <div className="grid gap-2">
                        <div className="flex justify-between"><span className="text-text-muted">ID:</span><span className="text-white">{name || "UNTITLED_MODEL"}</span></div>
                        <div className="flex justify-between"><span className="text-text-muted">CLASS:</span><span style={{ color }}>{personality.toUpperCase()}</span></div>
                        <div className="flex justify-between"><span className="text-text-muted">SKILLS:</span><span className="text-white text-right">{skills.length} EQUIPPED</span></div>
                        <div className="mt-2 pt-2 border-t border-white/10">
                            <div className="text-text-muted mb-1">STRATEGY_MATRIX:</div>
                            <div className="flex items-center gap-2 mb-1"><div className="w-12">AGR</div><div className="flex-1 h-1 bg-white/10"><div className="h-full" style={{ width: `${traits.aggression * 100}%`, background: color }}></div></div></div>
                            <div className="flex items-center gap-2 mb-1"><div className="w-12">RSK</div><div className="flex-1 h-1 bg-white/10"><div className="h-full" style={{ width: `${traits.risk * 100}%`, background: color }}></div></div></div>
                            <div className="flex items-center gap-2"><div className="w-12">CRT</div><div className="flex-1 h-1 bg-white/10"><div className="h-full" style={{ width: `${traits.creativity * 100}%`, background: color }}></div></div></div>
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
            <ambientLight intensity={0.2} color="#0A0A14" />
            <spotLight position={[5, 10, 5]} intensity={2} angle={0.5} penumbra={1} color="#ffffff" castShadow />
            <pointLight position={[-5, -5, -5]} intensity={1} color={color} distance={20} />
            <pointLight position={[0, 5, 0]} intensity={isCompiling ? 5 : 0} color={color} distance={10} />

            <NeuralCore personality={personality} color={color} isCompiling={isCompiling} />
            <DataRings color={color} isCompiling={isCompiling} />
            <FloatingData name={agentName} personality={personality} skills={skills} traits={traits} color={color} />

            <ContactShadows position={[0, -3, 0]} opacity={0.4} scale={10} blur={2} far={4} color={color} />
            <OrbitControls enablePan={false} enableZoom={true} minDistance={5} maxDistance={15} autoRotate autoRotateSpeed={isCompiling ? 10 : 1} />
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
            const res = await fetch(`${BACKEND_URL}/agents`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: agentName,
                    personality: selectedPersonality,
                    skills: selectedSkills,
                    traits: traits
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || "Failed to compile agent");
            }

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
        <div className="flex h-screen w-full bg-void-bg pt-16 overflow-hidden">

            {/* Left Panel: Neural Controls */}
            <div className="w-[450px] bg-surface-bg border-r border-border-color flex flex-col z-10 shadow-xl overflow-y-auto">
                <div className="p-6 border-b border-border-color sticky top-0 bg-surface-bg/90 backdrop-blur z-20">
                    <h1 className="text-2xl font-bold font-heading mb-1 text-white">Neural Interface</h1>
                    <p className="text-sm text-text-muted mono uppercase">Agent Synthesis Protocol v3.0</p>
                </div>

                {error && (
                    <div className="m-6 p-4 bg-danger-red/10 border border-danger-red/50 text-danger-red text-sm font-mono rounded-lg">
                        ⚠ ERR: {error}
                    </div>
                )}

                <div className="p-6 flex flex-col gap-8">

                    {/* Identity Matrix */}
                    <div className="space-y-4">
                        <div className="text-xs font-mono text-primary-cyan tracking-widest">[01_IDENTITY_MATRIX]</div>
                        <input
                            type="text"
                            placeholder="INITIALIZE_NAME..."
                            value={agentName}
                            onChange={(e) => setAgentName(e.target.value)}
                            className="w-full bg-void-bg border-b-2 border-border-color focus:border-primary-cyan text-xl text-white py-3 px-4 font-mono transition-colors outline-none"
                            maxLength={32}
                            disabled={isCompiling}
                        />
                    </div>

                    {/* Behavioral Core */}
                    <div className="space-y-4">
                        <div className="text-xs font-mono text-primary-cyan tracking-widest">[02_BEHAVIORAL_CORE]</div>
                        <div className="grid grid-cols-2 gap-3">
                            {PERSONALITIES.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => setSelectedPersonality(p.id)}
                                    disabled={isCompiling}
                                    className={`p-4 text-left border rounded-xl transition-all ${selectedPersonality === p.id ? 'bg-white/5 border-l-4' : 'border-border-color/50 hover:bg-white/5'}`}
                                    style={selectedPersonality === p.id ? { borderLeftColor: p.color, boxShadow: `inset 0 0 20px ${p.color}20` } : {}}
                                >
                                    <div className="font-bold text-white mb-1">{p.label}</div>
                                    <div className="text-xs text-text-muted">{p.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tactical Hardwiring */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div className="text-xs font-mono text-primary-cyan tracking-widest">[03_TACTICAL_HARDWIRING]</div>
                            <div className="text-xs font-mono text-text-muted text-right">{selectedSkills.length}/3 SECURED</div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {ALL_SKILLS.map(skill => (
                                <button
                                    key={skill.id}
                                    onClick={() => toggleSkill(skill.id)}
                                    disabled={isCompiling}
                                    className={`px-3 py-2 text-sm border font-mono rounded-lg transition-colors ${selectedSkills.includes(skill.id) ? 'bg-success-green/20 border-success-green text-success-green' : 'bg-void-bg border-border-color text-text-muted hover:border-white/30'}`}
                                    style={selectedSkills.includes(skill.id) ? { boxShadow: '0 0 10px rgba(0,255,136,0.2)' } : {}}
                                >
                                    {skill.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Strategy Parameters */}
                    <div className="space-y-6 bg-void-bg p-5 rounded-xl border border-border-color">
                        <div className="text-xs font-mono text-primary-cyan tracking-widest">[04_STRATEGY_PARAMETERS]</div>
                        {Object.entries(traits).map(([trait, value]) => (
                            <div key={trait}>
                                <div className="flex justify-between text-xs font-mono mb-2 uppercase text-text-muted">
                                    <span>{trait}</span>
                                    <span style={{ color: activeColor }}>{(value * 100).toFixed(0)}%</span>
                                </div>
                                <input
                                    type="range" min={0} max={1} step={0.01} value={value}
                                    disabled={isCompiling}
                                    onChange={e => setTraits(t => ({ ...t, [trait]: Number(e.target.value) }))}
                                    className="w-full h-1 bg-border-color rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        ))}
                    </div>

                </div>

                {/* Compile Button */}
                <div className="p-6 mt-auto border-t border-border-color bg-surface-bg sticky bottom-0 z-20">
                    <button
                        onClick={handleCompile}
                        disabled={isCompiling || agentName.length < 3}
                        className="w-full py-4 rounded-xl font-mono font-bold text-lg tracking-widest transition-all relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            background: isCompiling ? activeColor : "var(--surface-sunken)",
                            color: isCompiling ? "#000" : activeColor,
                            border: `1px solid ${activeColor}`,
                            boxShadow: isCompiling ? `0 0 30px ${activeColor}` : "none"
                        }}
                    >
                        {isCompiling ? (
                            <span className="animate-pulse">COMPILING_NEURAL_NET...</span>
                        ) : (
                            <span className="flex items-center justify-center gap-3">
                                <span className="text-xl">⚡</span> INITIATE_COMPILE
                            </span>
                        )}
                        {!isCompiling && (
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        )}
                    </button>
                    {!isCompiling && <p className="text-center text-[10px] text-text-muted mono mt-3">ZK_CIRCUIT COMMITMENT WILL BE GENERATED ON-CHAIN</p>}
                </div>
            </div>

            {/* Right Panel: Live 3D Preview */}
            <div className="flex-1 relative bg-[#020205]">
                {/* Overlay Grid */}
                <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>

                {/* Top status bar */}
                <div className="absolute top-4 right-6 z-10 flex gap-4 text-xs font-mono text-text-muted">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-success-green animate-pulse"></div> ENGINE_ONLINE</div>
                    <div>FPS: 60</div>
                    <div>MEM: 450MB</div>
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
                    <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center bg-black/40 backdrop-blur-sm">
                        <div className="text-4xl font-mono font-bold tracking-[0.5em] animate-pulse" style={{ color: activeColor, textShadow: `0 0 20px ${activeColor}` }}>
                            COMPILING
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
