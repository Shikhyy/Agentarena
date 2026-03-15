"use client";

import { useMemo } from "react";
import { OrbitControls, Text, RoundedBox, Float } from "@react-three/drei";
import * as THREE from "three";
import { COLORS } from "@/lib/theme";
import { WebGLSafeCanvas } from "../world/WebGLErrorBoundary";

/* ── Board square color mapping — neon palette ───────────── */
const SQUARE_COLORS: Record<string, string> = {
    brown: "#4a2000",
    light_blue: COLORS.gold,
    pink: COLORS.redBright,
    orange: "#ff6600",
    red: "#cc1133",
    yellow: COLORS.gold,
    green: COLORS.tealLight,
    dark_blue: COLORS.tealLight,
    railroad: COLORS.card,
    utility: COLORS.textMuted,
    corner: COLORS.surface,
    tax: "#661122",
    chance: "#006688",
    community: "#005522",
};

const BOARD_SQUARES_PER_SIDE = 11;
const SQUARE_W = 1.4;
const SQUARE_L = 2.0;
const BOARD_DIM = SQUARE_L * (BOARD_SQUARES_PER_SIDE - 1) + SQUARE_L;

function getSquarePosition(index: number): [number, number, number] {
    const side = Math.floor(index / 10);
    const pos = index % 10;
    const half = (BOARD_SQUARES_PER_SIDE - 1) * SQUARE_L / 2;

    if (side === 0) return [half - pos * SQUARE_L, 0, half];
    if (side === 1) return [-half, 0, half - pos * SQUARE_L];
    if (side === 2) return [-half + pos * SQUARE_L, 0, -half];
    return [half, 0, -half + pos * SQUARE_L];
}

function getSquareColor(index: number): string {
    const colorMap: [number[], string][] = [
        [[1, 3], "brown"],
        [[6, 8, 9], "light_blue"],
        [[11, 13, 14], "pink"],
        [[16, 18, 19], "orange"],
        [[21, 23, 24], "red"],
        [[26, 27, 29], "yellow"],
        [[31, 32, 34], "green"],
        [[37, 39], "dark_blue"],
        [[5, 15, 25, 35], "railroad"],
        [[12, 28], "utility"],
        [[0, 10, 20, 30], "corner"],
        [[4, 38], "tax"],
        [[7, 22, 36], "chance"],
        [[2, 17, 33], "community"],
    ];

    for (const [indices, color] of colorMap) {
        if (indices.includes(index)) return SQUARE_COLORS[color];
    }
    return COLORS.surface;
}

/* ── Board Square ────────────────────────────────────────── */
function BoardSquare({ index, playerTokens }: { index: number; playerTokens?: number[] }) {
    const pos = getSquarePosition(index);
    const color = getSquareColor(index);
    const hasPlayers = playerTokens && playerTokens.length > 0;

    return (
        <group position={pos}>
            <RoundedBox args={[SQUARE_W, 0.15, SQUARE_L]} radius={0.02}>
                <meshStandardMaterial
                    color={COLORS.card}
                    metalness={0.4}
                    roughness={0.4}
                    emissive={color}
                    emissiveIntensity={hasPlayers ? 0.5 : 0.15}
                />
            </RoundedBox>
            {/* Color strip on top */}
            <mesh position={[0, 0.08, -0.7]} receiveShadow>
                <boxGeometry args={[SQUARE_W - 0.1, 0.02, 0.4]} />
                <meshStandardMaterial
                    color={color}
                    metalness={0.6}
                    roughness={0.2}
                    emissive={color}
                    emissiveIntensity={0.4}
                />
            </mesh>
            {/* Player tokens */}
            {playerTokens?.map((playerId, i) => {
                const tokenColor = [COLORS.gold, COLORS.redBright, COLORS.gold, COLORS.tealLight][playerId % 4];
                return (
                    <group key={playerId}>
                        <mesh position={[i * 0.3 - 0.3, 0.15, 0.2]}>
                            <sphereGeometry args={[0.18, 16, 16]} />
                            <meshStandardMaterial
                                color={tokenColor}
                                metalness={0.8}
                                roughness={0.2}
                                emissive={tokenColor}
                                emissiveIntensity={0.8}
                            />
                        </mesh>
                        <pointLight
                            position={[i * 0.3 - 0.3, 0.3, 0.2]}
                            intensity={0.3}
                            color={tokenColor}
                            distance={2}
                            decay={2}
                        />
                    </group>
                );
            })}
        </group>
    );
}

/* ── Board Center ────────────────────────────────────────── */
function BoardCenter() {
    return (
        <group>
            {/* Dark felt center */}
            <mesh position={[0, -0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[BOARD_DIM * 0.7, BOARD_DIM * 0.7]} />
                <meshStandardMaterial color={COLORS.surface} roughness={0.8} metalness={0.3} />
            </mesh>
            {/* Neon text */}
            <Float speed={0.8} floatIntensity={0.1}>
                <Text
                    position={[0, 0.05, -0.8]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    fontSize={1.2}
                    color={COLORS.gold}
                    anchorX="center"
                    anchorY="middle"
                    fontWeight={700}
                    outlineWidth={0.03}
                    outlineColor={COLORS.ink}
                >
                    AGENT
                </Text>
                <Text
                    position={[0, 0.05, 0.8]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    fontSize={1.2}
                    color={COLORS.gold}
                    anchorX="center"
                    anchorY="middle"
                    fontWeight={700}
                    outlineWidth={0.03}
                    outlineColor={COLORS.ink}
                >
                    ARENA
                </Text>
            </Float>
            {/* Center neon ring */}
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[3, 3.1, 64]} />
                <meshStandardMaterial color={COLORS.gold} emissive={COLORS.gold} emissiveIntensity={0.3} transparent opacity={0.5} side={THREE.DoubleSide} />
            </mesh>
        </group>
    );
}

/* ── Lighting ────────────────────────────────────────────── */
function Lighting() {
    return (
        <>
            <ambientLight intensity={0.1} color={COLORS.surface} />
            <directionalLight position={[10, 20, 10]} intensity={0.6} castShadow color="#665588" />
            <pointLight position={[0, 12, 0]} intensity={0.8} color={COLORS.gold} distance={30} />
            <pointLight position={[0, 5, 0]} intensity={0.4} color={COLORS.gold} distance={15} />
            <pointLight position={[10, 3, 10]} intensity={0.3} color={COLORS.redBright} distance={12} />
            <pointLight position={[-10, 3, -10]} intensity={0.3} color={COLORS.gold} distance={12} />
        </>
    );
}

/* ── Exported Component ──────────────────────────────────── */
interface MonopolyBoard3DProps {
    playerPositions?: Record<number, number>;
}

export function MonopolyBoard3D({ playerPositions = {} }: MonopolyBoard3DProps) {
    const squarePlayers: Record<number, number[]> = {};
    for (const [pid, sq] of Object.entries(playerPositions)) {
        if (!squarePlayers[sq]) squarePlayers[sq] = [];
        squarePlayers[sq].push(Number(pid));
    }

    return (
        <div style={{ width: "100%", height: "100%", background: COLORS.ink }}>
            <WebGLSafeCanvas
                camera={{ position: [0, 25, 25], fov: 45 }}
                shadows
                style={{ borderRadius: 12 }}
            >
                <color attach="background" args={[COLORS.ink]} />
                <fog attach="fog" args={[COLORS.ink, 30, 60]} />
                <Lighting />
                <OrbitControls
                    enablePan={false}
                    minPolarAngle={Math.PI / 6}
                    maxPolarAngle={Math.PI / 2.2}
                    minDistance={15}
                    maxDistance={40}
                    autoRotate
                    autoRotateSpeed={0.1}
                    enableDamping
                    dampingFactor={0.05}
                />

                {/* Board base — dark obsidian */}
                <mesh position={[0, -0.15, 0]} receiveShadow>
                    <boxGeometry args={[BOARD_DIM + 2, 0.3, BOARD_DIM + 2]} />
                    <meshStandardMaterial color={COLORS.ink} metalness={0.5} roughness={0.4} emissive={COLORS.gold} emissiveIntensity={0.02} />
                </mesh>

                {Array.from({ length: 40 }, (_, i) => (
                    <BoardSquare key={i} index={i} playerTokens={squarePlayers[i]} />
                ))}

                <BoardCenter />
            </WebGLSafeCanvas>
        </div>
    );
}
