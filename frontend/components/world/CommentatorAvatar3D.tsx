"use client";

import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Float, Billboard } from "@react-three/drei";
import * as THREE from "three";
import { COLORS } from "@/lib/theme";

/* ── Data streams flowing through the avatar ─────────────── */
function DataStreams() {
    const ref = useRef<THREE.Points>(null);
    const count = 120;

    const [positions, setPositions] = useState(() => new Float32Array(count * 3));
    const velocitiesRef = useRef(new Float32Array(count));
    useEffect(() => {
        const pos = new Float32Array(count * 3);
        const vel = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 0.6;
            pos[i * 3 + 1] = Math.random() * 2.5;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
            vel[i] = 0.3 + Math.random() * 0.8;
        }
        setPositions(pos);
        velocitiesRef.current = vel;
    }, []);

    useFrame((_, delta) => {
        if (!ref.current) return;
        const posArray = ref.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < count; i++) {
            posArray[i * 3 + 1] += delta * velocitiesRef.current[i];
            if (posArray[i * 3 + 1] > 2.8) posArray[i * 3 + 1] = 0;
        }
        ref.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial size={0.03} color={COLORS.textMuted} transparent opacity={0.6} sizeAttenuation />
        </points>
    );
}

/* ── Holographic body ────────────────────────────────────── */
function HolographicBody({ isSpeaking }: { isSpeaking: boolean }) {
    const bodyRef = useRef<THREE.Mesh>(null);
    const mouthRef = useRef<THREE.Mesh>(null);

    useFrame(() => {
        if (bodyRef.current) {
            // Subtle hologram flicker
            const mat = bodyRef.current.material as THREE.MeshStandardMaterial;
            mat.emissiveIntensity = 0.03 + Math.sin(Date.now() * 0.005) * 0.02;
        }
        if (mouthRef.current && isSpeaking) {
            // Lipsync approximation
            mouthRef.current.scale.y = 0.5 + Math.abs(Math.sin(Date.now() * 0.015)) * 1.5;
        }
    });

    return (
        <group>
            {/* Torso */}
            <mesh ref={bodyRef} position={[0, 1.0, 0]} castShadow>
                <cylinderGeometry args={[0.3, 0.45, 1.2, 8]} />
                <meshStandardMaterial
                    color={COLORS.ivory}
                    emissive={COLORS.textMuted}
                    emissiveIntensity={0.05}
                    transparent
                    opacity={0.7}
                    wireframe={false}
                    metalness={0.8}
                    roughness={0.2}
                />
            </mesh>

            {/* Head */}
            <mesh position={[0, 1.9, 0]}>
                <sphereGeometry args={[0.28, 12, 12]} />
                <meshStandardMaterial
                    color={COLORS.ivory}
                    emissive={COLORS.textMuted}
                    emissiveIntensity={0.05}
                    transparent
                    opacity={0.8}
                    metalness={0.8}
                    roughness={0.2}
                />
            </mesh>

            {/* Eyes */}
            <mesh position={[-0.1, 1.95, 0.22]}>
                <sphereGeometry args={[0.04, 8, 8]} />
                <meshStandardMaterial color={COLORS.textMuted} emissive={COLORS.textMuted} emissiveIntensity={0.05} />
            </mesh>
            <mesh position={[0.1, 1.95, 0.22]}>
                <sphereGeometry args={[0.04, 8, 8]} />
                <meshStandardMaterial color={COLORS.textMuted} emissive={COLORS.textMuted} emissiveIntensity={0.05} />
            </mesh>

            {/* Mouth (animated during speech) */}
            <mesh ref={mouthRef} position={[0, 1.82, 0.24]}>
                <boxGeometry args={[0.12, 0.03, 0.04]} />
                <meshStandardMaterial color={COLORS.textMuted} emissive={COLORS.textMuted} emissiveIntensity={0.05} />
            </mesh>

            {/* Shoulder pads */}
            <mesh position={[-0.4, 1.4, 0]}>
                <sphereGeometry args={[0.12, 8, 8]} />
                <meshStandardMaterial
                    color={COLORS.ivory}
                    emissive={COLORS.accentSoft}
                    emissiveIntensity={0.05}
                    transparent
                    opacity={0.6}
                />
            </mesh>
            <mesh position={[0.4, 1.4, 0]}>
                <sphereGeometry args={[0.12, 8, 8]} />
                <meshStandardMaterial
                    color={COLORS.ivory}
                    emissive={COLORS.accentSoft}
                    emissiveIntensity={0.05}
                    transparent
                    opacity={0.6}
                />
            </mesh>

            {/* Holographic base ring */}
            <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.5, 0.6, 24]} />
                <meshStandardMaterial
                    color={COLORS.textMuted}
                    emissive={COLORS.textMuted}
                    emissiveIntensity={0.05}
                    transparent
                    opacity={0.5}
                    side={THREE.DoubleSide}
                />
            </mesh>
        </group>
    );
}

/* ── Broadcast Booth ─────────────────────────────────────── */
function BroadcastBooth() {
    return (
        <group>
            {/* Booth platform */}
            <mesh position={[0, -0.1, 0]} receiveShadow>
                <cylinderGeometry args={[2, 2.2, 0.2, 6]} />
                <meshStandardMaterial color={COLORS.structure} metalness={0.5} roughness={0.5} />
            </mesh>

            {/* Glass walls (transparent) */}
            {[0, 1, 2, 3, 4].map((i) => {
                const angle = (i / 6) * Math.PI * 2 + Math.PI / 6;
                return (
                    <mesh
                        key={i}
                        position={[Math.cos(angle) * 1.8, 1.2, Math.sin(angle) * 1.8]}
                        rotation={[0, -angle + Math.PI / 2, 0]}
                    >
                        <planeGeometry args={[1.5, 2.4]} />
                        <meshStandardMaterial
                            color={COLORS.surface}
                            transparent
                            opacity={0.15}
                            emissive={COLORS.accentSoft}
                            emissiveIntensity={0.05}
                            side={THREE.DoubleSide}
                        />
                    </mesh>
                );
            })}

            {/* Booth edge glow ring */}
            <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[1.9, 2.1, 6]} />
                <meshStandardMaterial
                    color={COLORS.accentSoft}
                    emissive={COLORS.accentSoft}
                    emissiveIntensity={0.05}
                    transparent
                    opacity={0.4}
                    side={THREE.DoubleSide}
                />
            </mesh>
        </group>
    );
}

/* ── Broadcast screens ───────────────────────────────────── */
function BroadcastScreens({ matchLabel, spectators }: { matchLabel: string; spectators: number }) {
    return (
        <group>
            {/* Main screen behind commentator */}
            <mesh position={[0, 2.0, -1.6]}>
                <planeGeometry args={[2.5, 1.2]} />
                <meshStandardMaterial
                    color={COLORS.surface}
                    emissive={COLORS.accentSoft}
                    emissiveIntensity={0.05}
                />
            </mesh>
            <Text
                position={[0, 2.3, -1.55]}
                fontSize={0.2}
                color={COLORS.textPrimary}
                anchorX="center"
            >
                {matchLabel}
            </Text>
            <Text
                position={[0, 1.95, -1.55]}
                fontSize={0.12}
                color={COLORS.textSecondary}
                anchorX="center"
            >
                {` ${spectators.toLocaleString()} watching`}
            </Text>
            <Text
                position={[0, 1.7, -1.55]}
                fontSize={0.1}
                color={COLORS.textPrimary}
                anchorX="center"
            >
                LIVE COMMENTARY
            </Text>
        </group>
    );
}

/* ── Full Commentator Component ──────────────────────────── */
interface CommentatorAvatar3DProps {
    position?: [number, number, number];
    isSpeaking?: boolean;
    matchLabel?: string;
    spectators?: number;
    currentLine?: string;
}

export function CommentatorAvatar3D({
    position = [0, 5, -8],
    isSpeaking = true,
    matchLabel = "TITAN vs ORACLE",
    spectators = 1247,
    currentLine = "",
}: CommentatorAvatar3DProps) {
    const groupRef = useRef<THREE.Group>(null);

    useFrame(() => {
        if (groupRef.current && isSpeaking) {
            // Subtle gesturing
            groupRef.current.rotation.y = Math.sin(Date.now() * 0.001) * 0.15;
        }
    });

    return (
        <group position={position}>
            <BroadcastBooth />

            <group ref={groupRef}>
                <HolographicBody isSpeaking={isSpeaking} />
                <DataStreams />
            </group>

            <BroadcastScreens matchLabel={matchLabel} spectators={spectators} />

            {/* Label */}
            <Billboard position={[0, 3.2, 0]}>
                <Text
                    fontSize={0.15}
                    color={COLORS.textMuted}
                    anchorX="center"
                    outlineWidth={0.01}
                    outlineColor="#000000"
                >
                    LIVE COMMENTARY
                </Text>
            </Billboard>

            {/* Commentary text bubble */}
            {currentLine && (
                <Billboard position={[0, 2.8, 1]}>
                    <Text
                        fontSize={0.1}
                        color={COLORS.textSecondary}
                        anchorX="center"
                        maxWidth={3}
                        textAlign="center"
                    >
                        {currentLine}
                    </Text>
                </Billboard>
            )}
        </group>
    );
}
