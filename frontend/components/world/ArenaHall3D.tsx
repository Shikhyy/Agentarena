"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Float, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { SpectatorOrbs } from "./SpectatorOrbs";

/* ── Arena entrance pillars ──────────────────────────────── */
function ArenaPillars({ color, count = 6, radius = 12, height = 8 }: {
    color: string; count?: number; radius?: number; height?: number;
}) {
    return (
        <group>
            {Array.from({ length: count }, (_, i) => {
                const angle = (i / count) * Math.PI * 2;
                return (
                    <group key={i} position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}>
                        {/* Pillar */}
                        <mesh position={[0, height / 2, 0]} castShadow>
                            <cylinderGeometry args={[0.3, 0.4, height, 8]} />
                            <meshStandardMaterial color="#1a1035" metalness={0.6} roughness={0.4} />
                        </mesh>
                        {/* Top glow */}
                        <mesh position={[0, height, 0]}>
                            <sphereGeometry args={[0.5, 8, 8]} />
                            <meshStandardMaterial
                                color={color}
                                emissive={color}
                                emissiveIntensity={0.8}
                                transparent
                                opacity={0.6}
                            />
                        </mesh>
                        {/* Base light ring */}
                        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                            <ringGeometry args={[0.4, 0.6, 16]} />
                            <meshStandardMaterial
                                color={color}
                                emissive={color}
                                emissiveIntensity={0.5}
                                transparent
                                opacity={0.4}
                                side={THREE.DoubleSide}
                            />
                        </mesh>
                    </group>
                );
            })}
        </group>
    );
}

/* ── Spectator stands (stadium seating) ──────────────────── */
function SpectatorStands({ spectatorCount, color }: { spectatorCount: number; color: string }) {
    const rows = 3;
    const seatsPerRow = 12;
    const standRadius = 14;

    return (
        <group>
            {Array.from({ length: rows }, (_, row) => (
                <group key={row}>
                    {Array.from({ length: seatsPerRow }, (_, seat) => {
                        const angle = ((seat / seatsPerRow) * Math.PI * 1.2) - Math.PI * 0.6;
                        const r = standRadius + row * 1.5;
                        const y = 2 + row * 1.2;
                        return (
                            <mesh
                                key={seat}
                                position={[Math.cos(angle) * r, y, Math.sin(angle) * r]}
                                rotation={[0, -angle, 0]}
                            >
                                <boxGeometry args={[1.0, 0.15, 0.6]} />
                                <meshStandardMaterial
                                    color="#1E1B4B"
                                    metalness={0.3}
                                    roughness={0.7}
                                />
                            </mesh>
                        );
                    })}
                </group>
            ))}

            {/* Spectator orbs in the stands */}
            <SpectatorOrbs
                count={Math.min(Math.floor(spectatorCount / 20), 80)}
                center={[0, 4, standRadius]}
                radius={standRadius * 0.4}
            />
        </group>
    );
}

/* ── Floor with grid pattern ─────────────────────────────── */
function ArenaFloor({ color, size = 28 }: { color: string; size?: number }) {
    return (
        <group>
            {/* Main floor */}
            <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <circleGeometry args={[size / 2, 48]} />
                <meshStandardMaterial color="#0a0815" metalness={0.2} roughness={0.8} />
            </mesh>

            {/* Inner circle glow */}
            <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[5, 5.15, 48]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={0.5}
                    transparent
                    opacity={0.4}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Outer ring */}
            <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[size / 2 - 0.3, size / 2, 48]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={0.3}
                    transparent
                    opacity={0.3}
                    side={THREE.DoubleSide}
                />
            </mesh>
        </group>
    );
}

/* ── Entrance gate ───────────────────────────────────────── */
function EntranceGate({ color, label }: { color: string; label: string }) {
    return (
        <group position={[0, 0, 16]}>
            {/* Left post */}
            <mesh position={[-2, 2.5, 0]} castShadow>
                <boxGeometry args={[0.5, 5, 0.5]} />
                <meshStandardMaterial color="#1a1035" metalness={0.5} roughness={0.5} />
            </mesh>
            {/* Right post */}
            <mesh position={[2, 2.5, 0]} castShadow>
                <boxGeometry args={[0.5, 5, 0.5]} />
                <meshStandardMaterial color="#1a1035" metalness={0.5} roughness={0.5} />
            </mesh>
            {/* Top beam */}
            <mesh position={[0, 5, 0]} castShadow>
                <boxGeometry args={[5, 0.4, 0.5]} />
                <meshStandardMaterial color="#1a1035" metalness={0.5} roughness={0.5} />
            </mesh>
            {/* Glow arch */}
            <mesh position={[0, 5.2, 0.3]}>
                <planeGeometry args={[4.5, 0.1]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={1}
                    transparent
                    opacity={0.8}
                    side={THREE.DoubleSide}
                />
            </mesh>
            {/* Hall name */}
            <Text
                position={[0, 5.8, 0.3]}
                fontSize={0.4}
                color={color}
                anchorX="center"
                outlineWidth={0.02}
                outlineColor="#000"
            >
                {label}
            </Text>
        </group>
    );
}

/* ── Lighting rig (activates for popular matches) ────────── */
function ArenaLighting({ color, spectatorCount }: { color: string; spectatorCount: number }) {
    const intensity = spectatorCount > 500 ? 1.5 : spectatorCount > 100 ? 1.0 : 0.7;

    return (
        <>
            <ambientLight intensity={0.15} />
            <directionalLight position={[5, 12, 5]} intensity={intensity} />
            <pointLight position={[0, 8, 0]} intensity={0.8} color={color} distance={25} />
            <pointLight position={[-8, 6, -8]} intensity={0.4} color="#6C3AED" distance={20} />
            <pointLight position={[8, 6, 8]} intensity={0.4} color="#10B981" distance={20} />
            {/* Spotlight on the game table */}
            <spotLight
                position={[0, 10, 0]}
                angle={0.3}
                penumbra={0.5}
                intensity={spectatorCount > 100 ? 2.0 : 1.0}
                color="#ffffff"
                target-position={[0, 0, 0]}
            />
        </>
    );
}

/* ── Full Arena Hall wrapper ─────────────────────────────── */
interface ArenaHall3DProps {
    hallName: string;
    hallColor: string;
    spectatorCount?: number;
    children: React.ReactNode; // The actual game board (chess/poker/monopoly) goes here
}

export function ArenaHall3D({
    hallName,
    hallColor,
    spectatorCount = 200,
    children,
}: ArenaHall3DProps) {
    return (
        <group>
            {/* Lighting */}
            <ArenaLighting color={hallColor} spectatorCount={spectatorCount} />

            {/* Floor */}
            <ArenaFloor color={hallColor} />

            {/* Columns */}
            <ArenaPillars color={hallColor} />

            {/* Entrance */}
            <EntranceGate color={hallColor} label={hallName} />

            {/* Spectator stands */}
            <SpectatorStands spectatorCount={spectatorCount} color={hallColor} />

            {/* Game board content (passed as children) */}
            <group position={[0, 0, 0]}>{children}</group>
        </group>
    );
}
