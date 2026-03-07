"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Float, Billboard } from "@react-three/drei";
import * as THREE from "three";
import { type WorldAgent } from "@/lib/worldStore";

/* ── Aura particles ──────────────────────────────────────── */
function AgentAura({ color, winRate, isActive }: { color: string; winRate: number; isActive: boolean }) {
    const ref = useRef<THREE.Points>(null);
    const count = 80;

    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const radius = 0.5 + Math.random() * 0.3;
            const height = (Math.random() - 0.3) * 2;
            pos[i * 3] = Math.cos(angle) * radius;
            pos[i * 3 + 1] = height;
            pos[i * 3 + 2] = Math.sin(angle) * radius;
        }
        return pos;
    }, []);

    useFrame((_, delta) => {
        if (ref.current) {
            ref.current.rotation.y += delta * (isActive ? 1.5 : 0.3);
        }
    });

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial
                size={0.04}
                color={color}
                transparent
                opacity={isActive ? 0.8 : 0.4}
                sizeAttenuation
            />
        </points>
    );
}

/* ── Body shape derived from personality ─────────────────── */
function AgentBody({ personality, color }: { personality: WorldAgent["personality"]; color: string }) {
    const bodyRef = useRef<THREE.Group>(null);

    // Body archetype from PRD: aggressive=tall/angular, conservative=compact/rounded, chaotic=asymmetric, adaptive=fluid
    const bodyConfig = useMemo(() => {
        switch (personality) {
            case "aggressive":
                return { height: 1.8, width: 0.35, topRadius: 0.15, segments: 6 };
            case "conservative":
                return { height: 1.3, width: 0.4, topRadius: 0.3, segments: 16 };
            case "chaotic":
                return { height: 1.5, width: 0.3, topRadius: 0.2, segments: 5 };
            case "adaptive":
                return { height: 1.5, width: 0.35, topRadius: 0.25, segments: 12 };
        }
    }, [personality]);

    useFrame((_, delta) => {
        if (bodyRef.current) {
            // Idle floating bob
            bodyRef.current.position.y = Math.sin(Date.now() * 0.002) * 0.03;
        }
    });

    return (
        <group ref={bodyRef}>
            {/* Torso / Core */}
            <mesh position={[0, bodyConfig.height * 0.4, 0]} castShadow>
                <cylinderGeometry args={[bodyConfig.topRadius, bodyConfig.width, bodyConfig.height * 0.5, bodyConfig.segments]} />
                <meshStandardMaterial
                    color={color}
                    metalness={0.6}
                    roughness={0.3}
                    emissive={color}
                    emissiveIntensity={0.15}
                />
            </mesh>

            {/* Head */}
            <mesh position={[0, bodyConfig.height * 0.75, 0]} castShadow>
                <sphereGeometry args={[0.2, bodyConfig.segments, bodyConfig.segments]} />
                <meshStandardMaterial
                    color={color}
                    metalness={0.7}
                    roughness={0.2}
                    emissive={color}
                    emissiveIntensity={0.2}
                />
            </mesh>

            {/* Visor / face strip */}
            <mesh position={[0, bodyConfig.height * 0.76, 0.15]} castShadow>
                <boxGeometry args={[0.28, 0.06, 0.08]} />
                <meshStandardMaterial
                    color="#0a0a1a"
                    emissive={color}
                    emissiveIntensity={0.8}
                    metalness={0.9}
                    roughness={0.1}
                />
            </mesh>

            {/* Legs */}
            <mesh position={[-0.1, 0.15, 0]} castShadow>
                <cylinderGeometry args={[0.06, 0.08, 0.3, 8]} />
                <meshStandardMaterial color="#1a1a2e" metalness={0.5} roughness={0.4} />
            </mesh>
            <mesh position={[0.1, 0.15, 0]} castShadow>
                <cylinderGeometry args={[0.06, 0.08, 0.3, 8]} />
                <meshStandardMaterial color="#1a1a2e" metalness={0.5} roughness={0.4} />
            </mesh>

            {/* Platform glow disc */}
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.4, 24]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={0.5}
                    transparent
                    opacity={0.3}
                />
            </mesh>
        </group>
    );
}

/* ── Skill orbs orbiting the agent ───────────────────────── */
function SkillOrbs({ count = 2, color }: { count?: number; color: string }) {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((_, delta) => {
        if (groupRef.current) groupRef.current.rotation.y += delta * 0.8;
    });

    return (
        <group ref={groupRef}>
            {Array.from({ length: count }, (_, i) => {
                const angle = (i / count) * Math.PI * 2;
                return (
                    <mesh key={i} position={[Math.cos(angle) * 0.7, 1.0, Math.sin(angle) * 0.7]}>
                        <sphereGeometry args={[0.06, 8, 8]} />
                        <meshStandardMaterial
                            color={color}
                            emissive={color}
                            emissiveIntensity={1.0}
                            transparent
                            opacity={0.9}
                        />
                    </mesh>
                );
            })}
        </group>
    );
}

/* ── Thinking particles ────────────────────────────────────── */
function ThinkingParticles({ color }: { color: string }) {
    const ref = useRef<THREE.Points>(null);
    const count = 500;

    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 0.4;
            pos[i * 3 + 1] = Math.random() * 2 + 1; // Stream upwards
            pos[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
        }
        return pos;
    }, []);

    useFrame((_, delta) => {
        if (!ref.current) return;
        const positions = ref.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < count; i++) {
            positions[i * 3 + 1] += delta * 0.8; // Move up
            if (positions[i * 3 + 1] > 3) {
                positions[i * 3 + 1] = 1; // Reset to head level
            }
        }
        ref.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial size={0.03} color={color} transparent opacity={0.6} sizeAttenuation />
        </points>
    );
}

/* ── Full Agent Character ────────────────────────────────── */
interface AgentCharacter3DProps {
    agent: WorldAgent;
    onClick?: () => void;
    showLabel?: boolean;
}

export function AgentCharacter3D({ agent, onClick, showLabel = true }: AgentCharacter3DProps) {
    const groupRef = useRef<THREE.Group>(null);
    const walkPhase = useRef(0);

    // Color per personality
    const primaryColor = useMemo(() => {
        switch (agent.personality) {
            case "aggressive": return "#EF4444";
            case "conservative": return "#3B82F6";
            case "chaotic": return "#A855F7";
            case "adaptive": return "#10B981";
        }
    }, [agent.personality]);

    // Walk animation
    useFrame((_, delta) => {
        if (!groupRef.current) return;

        if (agent.status === "walking") {
            walkPhase.current += delta * 4;
            // Calculate direction to target
            const dx = agent.targetPosition[0] - agent.position[0];
            const dz = agent.targetPosition[2] - agent.position[2];
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist > 0.1) {
                groupRef.current.rotation.y = Math.atan2(dx, dz);
            }
            // Walking bob
            groupRef.current.position.y = Math.abs(Math.sin(walkPhase.current)) * 0.05;
        }
    });

    const levelBadgeColor = agent.level >= 20 ? "#F59E0B" : agent.level >= 10 ? "#8B5CF6" : "#64748B";

    return (
        <group position={agent.position} onClick={(e) => { e.stopPropagation(); onClick?.(); }}>
            <group ref={groupRef}>
                {/* Agent body */}
                <AgentBody personality={agent.personality} color={primaryColor} />

                {/* Aura */}
                <AgentAura
                    color={agent.auraColor}
                    winRate={agent.winRate}
                    isActive={agent.status === "competing" || agent.status === "thinking"}
                />

                {/* Thinking particles */}
                {agent.status === "thinking" && <ThinkingParticles color={primaryColor} />}

                {/* Skill orbs */}
                {agent.status !== "competing" && (
                    <SkillOrbs count={Math.min(Math.floor(agent.level / 8), 4)} color={primaryColor} />
                )}

                {/* Name tag + level */}
                {showLabel && (
                    <Billboard position={[0, 2.2, 0]}>
                        <Float speed={1.5} floatIntensity={0.1}>
                            <Text
                                fontSize={0.2}
                                color={primaryColor}
                                anchorX="center"
                                anchorY="middle"
                                outlineWidth={0.02}
                                outlineColor="#000000"
                            >
                                {agent.name}
                            </Text>
                            <Text
                                position={[0, -0.22, 0]}
                                fontSize={0.11}
                                color={levelBadgeColor}
                                anchorX="center"
                                anchorY="middle"
                            >
                                {`Lv.${agent.level}  ⚡${agent.elo}`}
                            </Text>
                            {agent.status === "competing" && (
                                <Text
                                    position={[0, -0.4, 0]}
                                    fontSize={0.09}
                                    color="#10B981"
                                    anchorX="center"
                                >
                                    IN MATCH
                                </Text>
                            )}
                        </Float>
                    </Billboard>
                )}
            </group>
        </group>
    );
}
