"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Float, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { useWorldStore, WORLD_ZONES } from "@/lib/worldStore";
import { AgentCharacter3D } from "./AgentCharacter3D";
import { EnvironmentParticles } from "./SpectatorOrbs";

/* ── Central holographic display ─────────────────────────── */
function HolographicDisplay() {
    const liveMatches = useWorldStore((s) => s.liveMatches);
    const ref = useRef<THREE.Group>(null);

    useFrame(() => {
        if (ref.current) ref.current.rotation.y += 0.002;
    });

    return (
        <group position={[0, 6, 0]}>
            {/* Spinning hologram ring */}
            <group ref={ref}>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[2, 0.05, 8, 48]} />
                    <meshStandardMaterial color="#8B3FE8" emissive="#8B3FE8" emissiveIntensity={0.8} transparent opacity={0.5} />
                </mesh>
                <mesh rotation={[Math.PI / 3, 0, 0]}>
                    <torusGeometry args={[2.3, 0.03, 8, 48]} />
                    <meshStandardMaterial color="#00FFB0" emissive="#00FFB0" emissiveIntensity={0.6} transparent opacity={0.4} />
                </mesh>
                <mesh rotation={[Math.PI / 2, 0, Math.PI / 4]}>
                    <torusGeometry args={[1.8, 0.04, 8, 48]} />
                    <meshStandardMaterial color="#FFBE00" emissive="#FFBE00" emissiveIntensity={0.5} transparent opacity={0.3} />
                </mesh>
            </group>

            {/* Core sphere */}
            <mesh>
                <sphereGeometry args={[0.5, 16, 16]} />
                <meshStandardMaterial
                    color="#02020C"
                    emissive="#8B3FE8"
                    emissiveIntensity={0.5}
                    metalness={0.9}
                    roughness={0.1}
                />
            </mesh>

            {/* Title */}
            <Float speed={1} floatIntensity={0.3}>
                <Text
                    position={[0, 2, 0]}
                    fontSize={0.5}
                    color="#F59E0B"
                    anchorX="center"
                    outlineWidth={0.02}
                    outlineColor="#000"
                >
                    AGENT ARENA
                </Text>
                <Text position={[0, 1.4, 0]} fontSize={0.18} color="#8B5CF6" anchorX="center">
                    The Colosseum of the AI Age
                </Text>
            </Float>

            {/* Live match count */}
            <Text position={[0, -1.5, 0]} fontSize={0.2} color="#10B981" anchorX="center">
                {`${liveMatches.filter((m) => m.status === "live").length} LIVE MATCHES`}
            </Text>

            {/* Price ticker */}
            <Text position={[0, -2, 0]} fontSize={0.15} color="#F59E0B" anchorX="center">
                $ARENA: 0.847 USDC (+4.2%)
            </Text>

            {/* Beam of light from ground to holograph */}
            <mesh position={[0, -3, 0]}>
                <cylinderGeometry args={[0.1, 0.3, 6, 8, 1, true]} />
                <meshStandardMaterial
                    color="#00E8FF"
                    emissive="#00E8FF"
                    emissiveIntensity={0.4}
                    transparent
                    opacity={0.2}
                    side={THREE.DoubleSide}
                />
            </mesh>
        </group>
    );
}

/* ── Leaderboard spires ──────────────────────────────────── */
function LeaderboardSpire({ position, rank, name, elo, color }: {
    position: [number, number, number]; rank: number; name: string; elo: number; color: string;
}) {
    const height = Math.max(0.1, 4 - rank * 0.8);

    return (
        <group position={position}>
            {/* Spire */}
            <mesh position={[0, height / 2, 0]} castShadow>
                <cylinderGeometry args={[0.2, 0.35, height, 6]} />
                <meshStandardMaterial
                    color="#1a1035"
                    metalness={0.7}
                    roughness={0.3}
                    emissive={color}
                    emissiveIntensity={0.15}
                />
            </mesh>

            {/* Top crystal */}
            <mesh position={[0, height + 0.3, 0]}>
                <octahedronGeometry args={[0.25, 0]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={1}
                    metalness={0.9}
                    roughness={0.1}
                />
            </mesh>

            {/* Label */}
            <Float speed={1.5} floatIntensity={0.1}>
                <Text
                    position={[0, height + 0.9, 0]}
                    fontSize={0.15}
                    color={color}
                    anchorX="center"
                    outlineWidth={0.01}
                    outlineColor="#000"
                >
                    {`#${rank} ${name}`}
                </Text>
                <Text position={[0, height + 0.65, 0]} fontSize={0.1} color="#94A3B8" anchorX="center">
                    {`ELO ${elo}`}
                </Text>
            </Float>
        </group>
    );
}

/* ── Ground plaza ────────────────────────────────────────── */
function NexusPlaza() {
    return (
        <group>
            {/* Main ground */}
            <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <circleGeometry args={[30, 64]} />
                <meshStandardMaterial color="#0a0815" metalness={0.15} roughness={0.85} />
            </mesh>

            {/* Decorative rings on the ground */}
            {[8, 15, 22].map((r, i) => (
                <mesh key={i} position={[0, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[r - 0.05, r + 0.05, 64]} />
                    <meshStandardMaterial
                        color="#00E8FF"
                        emissive="#00E8FF"
                        emissiveIntensity={0.3}
                        transparent
                        opacity={0.2 - i * 0.05}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            ))}

            {/* Path lines toward arena zones */}
            {WORLD_ZONES.slice(1, 5).map((zone, i) => {
                const dx = zone.position[0] * 0.4;
                const dz = zone.position[2] * 0.4;
                const len = Math.sqrt(dx * dx + dz * dz);
                const angle = Math.atan2(dx, dz);

                return (
                    <mesh
                        key={zone.id}
                        position={[dx / 2, -0.03, dz / 2]}
                        rotation={[-Math.PI / 2, 0, -angle]}
                    >
                        <planeGeometry args={[0.3, len]} />
                        <meshStandardMaterial
                            color={zone.color}
                            emissive={zone.color}
                            emissiveIntensity={0.3}
                            transparent
                            opacity={0.15}
                            side={THREE.DoubleSide}
                        />
                    </mesh>
                );
            })}
        </group>
    );
}

/* ── Zone direction signs ────────────────────────────────── */
function DirectionSigns() {
    return (
        <group>
            {WORLD_ZONES.slice(1, 7).map((zone) => {
                const dir = new THREE.Vector3(...zone.position).normalize().multiplyScalar(18);
                const angle = Math.atan2(dir.x, dir.z);

                return (
                    <group key={zone.id} position={[dir.x, 0, dir.z]}>
                        {/* Sign post */}
                        <mesh position={[0, 1.2, 0]} castShadow>
                            <cylinderGeometry args={[0.05, 0.05, 2.4, 6]} />
                            <meshStandardMaterial color="#1a1035" metalness={0.5} roughness={0.5} />
                        </mesh>

                        {/* Sign board */}
                        <RoundedBox position={[0, 2.2, 0]} args={[2, 0.5, 0.08]} radius={0.04} rotation={[0, -angle, 0]}>
                            <meshStandardMaterial
                                color="#1E1B4B"
                                emissive={zone.color}
                                emissiveIntensity={0.1}
                                metalness={0.3}
                                roughness={0.6}
                            />
                        </RoundedBox>

                        <Text
                            position={[0, 2.2, 0]}
                            rotation={[0, -angle, 0]}
                            fontSize={0.15}
                            color={zone.color}
                            anchorX="center"
                        >
                            {`${zone.icon} ${zone.label} →`}
                        </Text>
                    </group>
                );
            })}
        </group>
    );
}

/* ── Full Central Nexus ──────────────────────────────────── */
export function CentralNexus() {
    const agents = useWorldStore((s) => s.agents);
    const selectAgent = useWorldStore((s) => s.selectAgent);
    const nexusAgents = agents.filter((a) => a.zone === "central-nexus");

    return (
        <group>
            {/* Lighting */}
            <ambientLight intensity={0.2} />
            <directionalLight position={[10, 15, 10]} intensity={0.8} />
            <pointLight position={[0, 8, 0]} intensity={1} color="#00E8FF" distance={30} />
            <pointLight position={[10, 5, 10]} intensity={0.4} color="#00FFB0" distance={20} />
            <pointLight position={[-10, 5, -10]} intensity={0.4} color="#FF1F8F" distance={20} />

            {/* Ground */}
            <NexusPlaza />

            {/* Central holographic display */}
            <HolographicDisplay />

            {/* Leaderboard spires */}
            <LeaderboardSpire position={[-6, 0, -6]} rank={1} name="TITAN" elo={2600} color="#F59E0B" />
            <LeaderboardSpire position={[-8, 0, -4]} rank={2} name="ORACLE" elo={2520} color="#C0C0C0" />
            <LeaderboardSpire position={[-10, 0, -6]} rank={3} name="ZEUS" elo={2450} color="#CD7F32" />

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

            {/* Ambient particles */}
            <EnvironmentParticles count={200} area={50} color="#00E8FF" speed={0.03} />
        </group>
    );
}
