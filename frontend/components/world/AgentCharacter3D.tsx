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

/* ── Premium Data Core Avatar ────────────────────────────── */
function AgentBody({ personality, color }: { personality: WorldAgent["personality"]; color: string }) {
    const coreRef = useRef<THREE.Mesh>(null);
    const shellRef = useRef<THREE.Mesh>(null);

    // Differentiate shell geometry based on personality
    const ShellGeometry = useMemo(() => {
        switch (personality) {
            case "aggressive": return <tetrahedronGeometry args={[0.6]} />; // Sharp and pointy
            case "conservative": return <boxGeometry args={[0.8, 0.8, 0.8]} />; // Solid and stable
            case "chaotic": return <icosahedronGeometry args={[0.7, 0]} />; // Complex and unpredictable
            case "adaptive": return <dodecahedronGeometry args={[0.65, 0]} />; // Fluid and multifaceted
            default: return <octahedronGeometry args={[0.6, 0]} />;
        }
    }, [personality]);

    useFrame((_, delta) => {
        if (coreRef.current) {
            coreRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.003) * 0.05); // Pulsing core
        }
        if (shellRef.current) {
            shellRef.current.rotation.x += delta * 0.2;
            shellRef.current.rotation.y += delta * 0.3;
            shellRef.current.position.y = Math.sin(Date.now() * 0.002) * 0.1; // Gentle hover
        }
    });

    return (
        <group position={[0, 1, 0]}>
            {/* The Inner AI "Brain" (Pulsing Sphere) */}
            <mesh ref={coreRef} castShadow>
                <sphereGeometry args={[0.25, 32, 32]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={1.5}
                    toneMapped={false}
                />
            </mesh>

            {/* The Outer Data Shell (Glassmorphic Polyhedron) */}
            <mesh ref={shellRef} castShadow receiveShadow>
                {ShellGeometry}
                <meshPhysicalMaterial
                    color="#0C0C28"
                    emissive={color}
                    emissiveIntensity={0.2}
                    metalness={0.9}
                    roughness={0.1}
                    transmission={0.95} /* Glass effect */
                    thickness={0.5}
                    clearcoat={1}
                    clearcoatRoughness={0.1}
                />
            </mesh>

            {/* Subtle Ground Reflection */}
            <mesh position={[0, -0.99, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.8, 32]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={0.15}
                    blending={THREE.AdditiveBlending}
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
                                position={[0, -0.25, 0]}
                                fontSize={0.12}
                                font="/fonts/SpaceGrotesk-Medium.ttf"
                                color={levelBadgeColor}
                                anchorX="center"
                                anchorY="middle"
                                letterSpacing={0.1}
                            >
                                {`LVL ${agent.level} — ELO ${agent.elo}`}
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
