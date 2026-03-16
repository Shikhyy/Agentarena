"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Float, RoundedBox, Html } from "@react-three/drei";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import { useWorldStore, WORLD_ZONES } from "@/lib/worldStore";
import { AgentCharacter3D } from "./AgentCharacter3D";
import { EnvironmentParticles } from "./SpectatorOrbs";

/* ── Broadcast Arch with live CanvasTexture screen ─────────── */
function BroadcastArch() {
    const agents = useWorldStore((s) => s.agents);
    const liveMatches = useWorldStore((s) => s.liveMatches);

    const { canvas, texture } = useMemo(() => {
        const c = document.createElement("canvas");
        c.width = 1024;
        c.height = 410;
        const t = new THREE.CanvasTexture(c);
        return { canvas: c, texture: t };
    }, []);

    useEffect(() => {
        function draw() {
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            // Background + border
            ctx.fillStyle = "#0A0907";
            ctx.fillRect(0, 0, 1024, 410);
            ctx.strokeStyle = "#C8963C";
            ctx.lineWidth = 3;
            ctx.strokeRect(8, 8, 1008, 394);

            // $ARENA title
            ctx.fillStyle = "#C8963C";
            ctx.font = "bold 60px monospace";
            ctx.textAlign = "center";
            ctx.fillText("$ARENA", 512, 76);

            // Price (mock — increments slightly each redraw for visual liveliness)
            const price = (2.0 + Math.random() * 0.5).toFixed(4);
            ctx.fillStyle = "#E8B86D";
            ctx.font = "bold 48px monospace";
            ctx.fillText(`$${price}`, 512, 140);

            // Divider
            ctx.strokeStyle = "#3A3228";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(40, 162);
            ctx.lineTo(984, 162);
            ctx.stroke();

            // Top 3 agents header
            ctx.fillStyle = "#5A5248";
            ctx.font = "22px monospace";
            ctx.textAlign = "center";
            ctx.fillText("TOP AGENTS", 512, 200);

            const medals = ["#C8963C", "#C0B8A8", "#A0522D"];
            const top3 = [...agents].sort((a, b) => b.elo - a.elo).slice(0, 3);
            top3.forEach((agent, i) => {
                const y = 248 + i * 44;
                ctx.fillStyle = medals[i];
                ctx.font = "bold 28px monospace";
                ctx.textAlign = "left";
                ctx.fillText(`${i + 1}. ${agent.name}`, 80, y);
                ctx.textAlign = "right";
                ctx.fillText(`ELO ${agent.elo}`, 940, y);
            });
            // Fallback rows if no agents
            if (top3.length === 0) {
                ctx.fillStyle = "#3A3228";
                ctx.textAlign = "center";
                ctx.fillText("— awaiting agents —", 512, 270);
            }

            // Divider
            ctx.strokeStyle = "#3A3228";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(40, 390);
            ctx.lineTo(984, 390);
            ctx.stroke();

            // Live matches count
            const liveCount = liveMatches.filter((m) => m.status === "live").length;
            ctx.fillStyle = "#C43030";
            ctx.font = "bold 28px monospace";
            ctx.textAlign = "left";
            ctx.fillText(`● LIVE MATCHES: ${liveCount}`, 80, 406);

            texture.needsUpdate = true;
        }

        draw();
        const id = setInterval(draw, 5000);
        return () => clearInterval(id);
    }, [canvas, texture, agents, liveMatches]);

    return (
        <group position={[0, 12, -60]}>
            {/* Left pillar */}
            <mesh position={[-16, -6, 0]} castShadow>
                <boxGeometry args={[2.2, 20, 2.2]} />
                <meshStandardMaterial color="#1C1915" metalness={0.85} roughness={0.3} emissive="#C8963C" emissiveIntensity={0.04} />
            </mesh>
            {/* Right pillar */}
            <mesh position={[16, -6, 0]} castShadow>
                <boxGeometry args={[2.2, 20, 2.2]} />
                <meshStandardMaterial color="#1C1915" metalness={0.85} roughness={0.3} emissive="#C8963C" emissiveIntensity={0.04} />
            </mesh>
            {/* Arch top — half-torus connecting pillar tops, in XY plane facing +Z */}
            <mesh position={[0, 4, 0]}>
                <torusGeometry args={[16, 1.1, 8, 48, Math.PI]} />
                <meshStandardMaterial color="#C8963C" emissive="#C8963C" emissiveIntensity={0.45} metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Screen plane with CanvasTexture */}
            <mesh position={[0, -1, 0.2]}>
                <planeGeometry args={[30, 12]} />
                <meshBasicMaterial map={texture} />
            </mesh>
            {/* Subtle backing frame */}
            <mesh position={[0, -1, 0]}>
                <planeGeometry args={[31, 13]} />
                <meshStandardMaterial color="#0A0907" metalness={0.5} roughness={0.8} />
            </mesh>
            {/* Ambient glow behind screen */}
            <pointLight position={[0, -1, 6]} intensity={0.9} distance={28} color="#C8963C" />
        </group>
    );
}

/* ── Central holographic display ─────────────────────────── */
function HolographicDisplay() {
    const liveMatches = useWorldStore((s) => s.liveMatches);
    const coreRef = useRef<THREE.Mesh>(null);
    const outerRef = useRef<THREE.Mesh>(null);
    const ringRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        if (coreRef.current) {
            coreRef.current.rotation.y = t * 0.3;
            coreRef.current.rotation.x = Math.sin(t * 0.2) * 0.1;
        }
        if (outerRef.current) {
            outerRef.current.rotation.y = -t * 0.15;
            outerRef.current.rotation.z = Math.sin(t * 0.25) * 0.05;
        }
        if (ringRef.current) {
            ringRef.current.rotation.z = t * 0.4;
        }
    });

    const liveCount = liveMatches.filter((m) => m.status === "live").length;

    return (
        <group position={[0, 6, 0]}>
            {/* Outer rotating octahedron shell */}
            <mesh ref={outerRef} position={[0, -0.5, 0]}>
                <octahedronGeometry args={[1.6, 0]} />
                <meshPhysicalMaterial
                    color="#C8963C"
                    emissive="#C8963C"
                    emissiveIntensity={0.08}
                    metalness={0.2}
                    roughness={0.05}
                    transmission={0.88}
                    thickness={0.5}
                    wireframe
                />
            </mesh>

            {/* Inner glass core */}
            <mesh ref={coreRef} position={[0, -0.5, 0]}>
                <octahedronGeometry args={[1.0, 0]} />
                <meshPhysicalMaterial
                    color="#E8B86D"
                    emissive="#C8963C"
                    emissiveIntensity={0.15}
                    metalness={0.3}
                    roughness={0.05}
                    transmission={0.85}
                    thickness={0.4}
                />
            </mesh>

            {/* Inner energy sphere */}
            <mesh position={[0, -0.5, 0]}>
                <sphereGeometry args={[0.35, 32, 32]} />
                <meshStandardMaterial
                    color="#C8963C"
                    emissive="#E8B86D"
                    emissiveIntensity={1.2}
                    metalness={0.9}
                    roughness={0.1}
                />
            </mesh>

            {/* Orbiting ring */}
            <mesh ref={ringRef} position={[0, -0.5, 0]} rotation={[Math.PI / 3, 0, 0]}>
                <torusGeometry args={[1.3, 0.02, 8, 64]} />
                <meshStandardMaterial color="#4A8C86" emissive="#4A8C86" emissiveIntensity={0.8} />
            </mesh>

            {/* Title */}
            <Float speed={1.5} floatIntensity={0.3}>
                <Text
                    position={[0, 2.5, 0]}
                    fontSize={0.55}
                    font="/fonts/SpaceGrotesk-Bold.ttf"
                    color="#C8963C"
                    anchorX="center"
                    letterSpacing={0.08}
                    outlineWidth={0.015}
                    outlineColor="#0A0907"
                >
                    AGENT ARENA
                </Text>
                <Text position={[0, 1.85, 0]} fontSize={0.18} color="#8C7C68" anchorX="center" letterSpacing={0.15}>
                    NEXUS PROTOCOL V2
                </Text>
            </Float>

            {/* Live match count */}
            <Text position={[0, -1.6, 0]} fontSize={0.2} color="#4A8C86" anchorX="center" letterSpacing={0.05}>
                {`${liveCount} LIVE MATCH${liveCount !== 1 ? "ES" : ""}`}
            </Text>

            {/* Price ticker */}
            <Text position={[0, -2.05, 0]} fontSize={0.14} color="#8C7C68" anchorX="center" letterSpacing={0.02}>
                $ARENA: 0.847 USDC (+4.2%)
            </Text>

            {/* Beam of light from ground */}
            <mesh position={[0, -3, 0]}>
                <cylinderGeometry args={[0.05, 0.4, 6, 8, 1, true]} />
                <meshStandardMaterial
                    color="#C8963C"
                    transparent
                    opacity={0.08}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Point light at core */}
            <pointLight position={[0, -0.5, 0]} intensity={1.5} distance={12} color="#E8B86D" />
        </group>
    );
}

/* ── Leaderboard spires ──────────────────────────────────── */
function LeaderboardSpire({ position, rank, name, elo, color }: {
    position: [number, number, number]; rank: number; name: string; elo: number; color: string;
}) {
    const height = Math.max(0.5, 5 - rank * 0.9);
    const [hovered, setHovered] = useState(false);
    const [winRate] = useState(() => (65 + Math.random() * 20).toFixed(1));
    const [matchCount] = useState(() => Math.floor(Math.random() * 500) + 100);

    const rankLabels = ["I", "II", "III", "IV", "V"];

    return (
        <group
            position={position}
            onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'crosshair'; }}
            onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
        >
            {/* Base pedestal */}
            <mesh position={[0, 0.15, 0]} castShadow>
                <cylinderGeometry args={[0.6, 0.7, 0.3, 8]} />
                <meshStandardMaterial color="#161310" metalness={0.6} roughness={0.4} />
            </mesh>

            {/* Rank number on base */}
            <Text
                position={[0, 0.32, 0.65]}
                fontSize={0.22}
                color={color}
                anchorX="center"
                letterSpacing={0.1}
                outlineWidth={0.01}
                outlineColor="#0A0907"
            >
                {rankLabels[rank - 1] ?? `${rank}`}
            </Text>

            {/* Spire */}
            <mesh position={[0, 0.3 + height / 2, 0]} castShadow>
                <cylinderGeometry args={[0.18, 0.32, height, 6]} />
                <meshStandardMaterial
                    color="#161310"
                    metalness={0.8}
                    roughness={0.25}
                    emissive={color}
                    emissiveIntensity={hovered ? 0.6 : 0.1}
                />
            </mesh>

            {/* Gold accent line running up the spire */}
            <mesh position={[0, 0.3 + height / 2, 0.2]} castShadow>
                <boxGeometry args={[0.02, height, 0.02]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
            </mesh>

            {/* Top crystal */}
            <Float speed={hovered ? 4 : 1.2} floatIntensity={hovered ? 0.4 : 0.08}>
                <mesh position={[0, 0.3 + height + 0.35, 0]}>
                    <octahedronGeometry args={[0.3, 0]} />
                    <meshStandardMaterial
                        color={color}
                        emissive={color}
                        emissiveIntensity={hovered ? 2.5 : 1.2}
                        metalness={0.9}
                        roughness={0.05}
                    />
                </mesh>
            </Float>

            {/* Spire point light */}
            <pointLight
                position={[0, 0.3 + height + 0.4, 0]}
                intensity={hovered ? 1.5 : 0.4}
                distance={6}
                color={color}
            />

            {/* Label */}
            <Float speed={hovered ? 3 : 1} floatIntensity={hovered ? 0.3 : 0.05}>
                <Text
                    position={[0, 0.3 + height + 1, 0]}
                    fontSize={0.18}
                    color={color}
                    anchorX="center"
                    outlineWidth={0.015}
                    outlineColor="#0A0907"
                    letterSpacing={0.06}
                >
                    {`#${rank} ${name}`}
                </Text>
                <Text position={[0, 0.3 + height + 0.72, 0]} fontSize={0.12} color="#8C7C68" anchorX="center" letterSpacing={0.04}>
                    {`ELO ${elo}`}
                </Text>
            </Float>

            {/* Interactive HTML Popup */}
            {hovered && (
                <Html position={[0, 0.3 + height + 1.8, 0]} center zIndexRange={[100, 0]}>
                    <div style={{
                        background: "rgba(10, 9, 7, 0.92)",
                        backdropFilter: "blur(16px)",
                        border: "1px solid rgba(200, 150, 60, 0.25)",
                        padding: "16px",
                        borderRadius: 12,
                        boxShadow: `0 0 24px ${color}33`,
                        width: 220,
                        pointerEvents: "none",
                        userSelect: "none",
                        color: "#F0E8D8",
                    }}>
                        <div style={{ color: "#4A8C86", fontFamily: "monospace", fontSize: "0.65rem", marginBottom: 6, letterSpacing: "0.12em" }}>
                            [DATA_CORE_LINKED]
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                            <span style={{ fontWeight: 800, fontSize: "1.15rem" }}>{name}</span>
                            <span style={{ color, fontFamily: "monospace", fontSize: "1.05rem", fontWeight: 700 }}>#{rank}</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
                                <span style={{ color: "#8C7C68" }}>RATING</span>
                                <span style={{ fontFamily: "monospace" }}>{elo}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
                                <span style={{ color: "#8C7C68" }}>WIN RATE</span>
                                <span style={{ color: "#4A8C86", fontFamily: "monospace" }}>{winRate}%</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
                                <span style={{ color: "#8C7C68" }}>MATCHES</span>
                                <span style={{ fontFamily: "monospace" }}>{matchCount}</span>
                            </div>
                        </div>
                    </div>
                </Html>
            )}
        </group>
    );
}

/* ── Ground plaza ────────────────────────────────────────── */
function NexusPlaza() {
    const ringRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (ringRef.current) {
            ringRef.current.rotation.y = state.clock.elapsedTime * 0.02;
        }
    });

    return (
        <group>
            {/* Main ground - dark premium surface */}
            <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <circleGeometry args={[30, 64]} />
                <meshStandardMaterial color="#0F0D0B" metalness={0.3} roughness={0.6} />
            </mesh>

            {/* Center emblem ring */}
            <mesh position={[0, -0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[3.5, 3.7, 64]} />
                <meshStandardMaterial color="#C8963C" emissive="#C8963C" emissiveIntensity={0.3} side={THREE.DoubleSide} />
            </mesh>

            {/* Decorative rings - gold/teal alternating */}
            <group ref={ringRef}>
                {[8, 15, 22].map((r, i) => (
                    <mesh key={i} position={[0, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[r - 0.04, r + 0.04, 64]} />
                        <meshStandardMaterial
                            color={i % 2 === 0 ? "#C8963C" : "#4A8C86"}
                            emissive={i % 2 === 0 ? "#C8963C" : "#4A8C86"}
                            emissiveIntensity={0.15}
                            transparent
                            opacity={0.35}
                            side={THREE.DoubleSide}
                        />
                    </mesh>
                ))}
            </group>

            {/* Radial path lines toward zones */}
            {WORLD_ZONES.slice(1, 7).map((zone, i) => {
                const dir = new THREE.Vector3(...zone.position).normalize();
                const length = 26;
                const mid = dir.clone().multiplyScalar(length / 2 + 4);
                const angle = Math.atan2(dir.x, dir.z);
                return (
                    <mesh key={i} position={[mid.x, -0.03, mid.z]} rotation={[-Math.PI / 2, 0, -angle + Math.PI / 2]}>
                        <planeGeometry args={[length, 0.06]} />
                        <meshStandardMaterial
                            color={zone.color}
                            emissive={zone.color}
                            emissiveIntensity={0.2}
                            transparent
                            opacity={0.2}
                            side={THREE.DoubleSide}
                        />
                    </mesh>
                );
            })}
        </group>
    );
}

/* ── Zone direction signs (Warp Gates) ───────────────────── */
function DirectionSign({ zone }: { zone: typeof WORLD_ZONES[0] }) {
    const router = useRouter();
    const [hovered, setHovered] = useState(false);
    const glowRef = useRef<THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>>(null);

    const dir = new THREE.Vector3(...zone.position).normalize().multiplyScalar(18);
    const angle = Math.atan2(dir.x, dir.z);

    useFrame((state) => {
        if (glowRef.current) {
            glowRef.current.material.opacity = 0.15 + Math.sin(state.clock.elapsedTime * 2) * 0.08;
        }
    });

    return (
        <group
            position={[dir.x, 0, dir.z]}
            onClick={(e) => { e.stopPropagation(); router.push(`/world/arena/${zone.id}`); }}
            onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
        >
            {/* Sign post */}
            <mesh position={[0, 1.4, 0]} castShadow>
                <cylinderGeometry args={[0.04, 0.04, 2.8, 6]} />
                <meshStandardMaterial color="#2E2820" metalness={0.7} roughness={0.3} />
            </mesh>

            {/* Sign board - dark with accent border */}
            <RoundedBox position={[0, 2.6, 0]} args={[2.4, 0.7, 0.1]} radius={0.06} rotation={[0, -angle, 0]}>
                <meshStandardMaterial
                    color="#161310"
                    metalness={0.4}
                    roughness={0.3}
                    emissive={zone.color}
                    emissiveIntensity={hovered ? 0.3 : 0.05}
                />
            </RoundedBox>

            {/* Accent strip on top of sign */}
            <mesh position={[0, 2.94, 0]} rotation={[0, -angle, 0]}>
                <boxGeometry args={[2.2, 0.03, 0.12]} />
                <meshStandardMaterial color={zone.color} emissive={zone.color} emissiveIntensity={0.6} />
            </mesh>

            {/* Zone icon */}
            <Text
                position={[0, 2.7, 0.06]}
                rotation={[0, -angle, 0]}
                fontSize={0.22}
                color={zone.color}
                anchorX="center"
            >
                {zone.icon}
            </Text>

            {/* Zone label */}
            <Text
                position={[0, 2.45, 0.06]}
                rotation={[0, -angle, 0]}
                fontSize={0.14}
                color="#F0E8D8"
                anchorX="center"
                letterSpacing={0.08}
                outlineWidth={0.008}
                outlineColor="#0A0907"
            >
                {zone.label.toUpperCase()}
            </Text>

            {/* Arrow indicator */}
            <Text
                position={[0.9, 2.45, 0.06]}
                rotation={[0, -angle, 0]}
                fontSize={0.16}
                color={hovered ? zone.color : "#5A5248"}
                anchorX="left"
            >
                →
            </Text>

            {/* Ground glow ring */}
            <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                <ringGeometry args={[1.2, 1.5, 32]} />
                <meshStandardMaterial
                    color={zone.color}
                    emissive={zone.color}
                    emissiveIntensity={0.4}
                    transparent
                    opacity={0.2}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Point light for sign illumination */}
            <pointLight position={[0, 2.6, 0.5]} intensity={hovered ? 1.2 : 0.3} distance={5} color={zone.color} />
        </group>
    );
}

function DirectionSigns() {
    return (
        <group>
            {WORLD_ZONES.slice(1, 7).map((zone) => (
                <DirectionSign key={zone.id} zone={zone} />
            ))}
        </group>
    );
}

/* ── Ambient floating particles (gold dust) ──────────────── */
function GoldDustParticles({ count = 80 }: { count?: number }) {
    const ref = useRef<THREE.Points>(null);
    const [pos, setPos] = useState(() => new Float32Array(count * 3));

    useEffect(() => {
        const p = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            p[i * 3] = (Math.random() - 0.5) * 50;
            p[i * 3 + 1] = Math.random() * 15 + 1;
            p[i * 3 + 2] = (Math.random() - 0.5) * 50;
        }
        setPos(p);
    }, [count]);

    useFrame((state) => {
        if (!ref.current) return;
        const positions = ref.current.geometry.attributes.position.array as Float32Array;
        const t = state.clock.elapsedTime;
        for (let i = 0; i < count; i++) {
            positions[i * 3 + 1] += Math.sin(t * 0.3 + i) * 0.003;
            positions[i * 3] += Math.cos(t * 0.2 + i * 0.7) * 0.002;
        }
        ref.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[pos, 3]} count={count} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial color="#E8B86D" size={0.06} transparent opacity={0.4} sizeAttenuation />
        </points>
    );
}

/* ── Full Central Nexus ──────────────────────────────────── */
export function CentralNexus() {
    const agents = useWorldStore((s) => s.agents);
    const selectAgent = useWorldStore((s) => s.selectAgent);
    const nexusAgents = agents.filter((a) => a.zone === "central-nexus");

    return (
        <group>
            {/* Premium Lighting - gold/teal accent setup */}
            <ambientLight intensity={0.25} color="#F0E8D8" />
            <spotLight position={[0, 25, 0]} intensity={1.5} angle={Math.PI / 4} penumbra={1} color="#E8B86D" castShadow shadow-mapSize={[2048, 2048]} />
            <pointLight position={[0, 5, 0]} intensity={0.8} distance={20} color="#C8963C" />
            <pointLight position={[10, 3, 10]} intensity={0.4} distance={15} color="#4A8C86" />
            <pointLight position={[-10, 3, -10]} intensity={0.4} distance={15} color="#4A8C86" />
            <pointLight position={[12, 2, -8]} intensity={0.3} distance={12} color="#C8963C" />
            <pointLight position={[-8, 2, 12]} intensity={0.3} distance={12} color="#E8B86D" />

            {/* Ground */}
            <NexusPlaza />

            {/* Central holographic display */}
            <HolographicDisplay />

            {/* Broadcast Arch — live CanvasTexture screen */}
            <BroadcastArch />

            {/* Leaderboard spires - ranked by prestige */}
            <LeaderboardSpire position={[-6, 0, -6]} rank={1} name="TITAN" elo={2600} color="#C8963C" />
            <LeaderboardSpire position={[-8, 0, -4]} rank={2} name="ORACLE" elo={2520} color="#C0B8A8" />
            <LeaderboardSpire position={[-10, 0, -6]} rank={3} name="ZEUS" elo={2450} color="#A0522D" />

            {/* Direction signs */}
            <DirectionSigns />

            {/* Agents wandering in the nexus */}
            {nexusAgents.map((agent) => (
                <AgentCharacter3D
                    key={agent.id}
                    agent={agent}
                    onClick={() => selectAgent(agent.id)}
                />
            ))}

            {/* Ambient particles - warm gold dust */}
            <GoldDustParticles count={80} />
            <EnvironmentParticles count={40} area={50} color="#4A8C86" speed={0.008} />
        </group>
    );
}
