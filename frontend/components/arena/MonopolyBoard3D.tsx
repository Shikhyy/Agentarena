"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text, RoundedBox } from "@react-three/drei";

// Board square color mapping
const SQUARE_COLORS: Record<string, string> = {
    brown: "#8B4513",
    light_blue: "#ADD8E6",
    pink: "#FF69B4",
    orange: "#FF8C00",
    red: "#DC143C",
    yellow: "#FFD700",
    green: "#228B22",
    dark_blue: "#00008B",
    railroad: "#333333",
    utility: "#888888",
    corner: "#1a1a2e",
    tax: "#4a1a1a",
    chance: "#2a2a4a",
    community: "#2a4a2a",
};

const BOARD_SIZE = 40;
const BOARD_SQUARES_PER_SIDE = 11;
const SQUARE_W = 1.4;
const SQUARE_H = 0.15;
const SQUARE_L = 2.0;
const BOARD_DIM = SQUARE_L * (BOARD_SQUARES_PER_SIDE - 1) + SQUARE_L;

function getSquarePosition(index: number): [number, number, number] {
    const side = Math.floor(index / 10);
    const pos = index % 10;
    const half = (BOARD_SQUARES_PER_SIDE - 1) * SQUARE_L / 2;

    if (side === 0) return [half - pos * SQUARE_L, 0, half];           // bottom
    if (side === 1) return [-half, 0, half - pos * SQUARE_L];          // left
    if (side === 2) return [-half + pos * SQUARE_L, 0, -half];          // top
    return [half, 0, -half + pos * SQUARE_L];                           // right
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
    return "#1a1a2e";
}

function BoardSquare({ index, playerTokens }: { index: number, playerTokens?: number[] }) {
    const pos = getSquarePosition(index);
    const color = getSquareColor(index);
    const hasPlayers = playerTokens && playerTokens.length > 0;

    return (
        <group position={pos}>
            <RoundedBox args={[SQUARE_W, SQUARE_H, SQUARE_L]} radius={0.02}>
                <meshStandardMaterial
                    color={color}
                    metalness={0.1}
                    roughness={0.6}
                    emissive={hasPlayers ? "white" : "black"}
                    emissiveIntensity={hasPlayers ? 0.1 : 0}
                />
            </RoundedBox>
            {/* Player tokens */}
            {playerTokens?.map((playerId, i) => (
                <mesh key={playerId} position={[i * 0.3 - 0.3, 0.15, 0]}>
                    <sphereGeometry args={[0.18, 16, 16]} />
                    <meshStandardMaterial color={["#10B981", "#6C3AED", "#EF4444", "#F59E0B"][playerId % 4]} metalness={0.8} roughness={0.2} />
                </mesh>
            ))}
        </group>
    );
}

function BoardCenter() {
    return (
        <group>
            {/* Green felt center */}
            <mesh position={[0, -0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[BOARD_DIM * 0.7, BOARD_DIM * 0.7]} />
                <meshStandardMaterial color="#0d4f1c" roughness={0.9} />
            </mesh>
            {/* AGENT ARENA logo */}
            <Text
                position={[0, 0.01, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={0.9}
                color="#F59E0B"
                anchorX="center"
                anchorY="middle"
                font="/fonts/SpaceGrotesk-Bold.ttf"
            >
                🏟️{"\n"}AGENT ARENA
            </Text>
        </group>
    );
}

function Lighting() {
    return (
        <>
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 20, 10]} intensity={1.2} castShadow />
            <pointLight position={[0, 10, 0]} intensity={0.8} color="#6C3AED" />
            <pointLight position={[0, 5, 0]} intensity={0.4} color="#F59E0B" />
        </>
    );
}

interface MonopolyBoard3DProps {
    playerPositions?: Record<number, number>;  // playerId → square index
}

export function MonopolyBoard3D({ playerPositions = {} }: MonopolyBoard3DProps) {
    // Build reverse map: squareIndex → playerIds
    const squarePlayers: Record<number, number[]> = {};
    for (const [pid, sq] of Object.entries(playerPositions)) {
        if (!squarePlayers[sq]) squarePlayers[sq] = [];
        squarePlayers[sq].push(Number(pid));
    }

    return (
        <div style={{ width: "100%", height: "100%", background: "#0f0a1a" }}>
            <Canvas
                camera={{ position: [0, 25, 25], fov: 45 }}
                shadows
                style={{ borderRadius: "var(--radius-lg)" }}
            >
                <Lighting />
                <OrbitControls
                    enablePan={false}
                    minPolarAngle={Math.PI / 6}
                    maxPolarAngle={Math.PI / 2.2}
                    minDistance={15}
                    maxDistance={40}
                />

                {/* Board base */}
                <mesh position={[0, -0.15, 0]} receiveShadow>
                    <boxGeometry args={[BOARD_DIM + 2, 0.3, BOARD_DIM + 2]} />
                    <meshStandardMaterial color="#1a0a0a" metalness={0.3} roughness={0.5} />
                </mesh>

                {/* 40 squares */}
                {Array.from({ length: 40 }, (_, i) => (
                    <BoardSquare
                        key={i}
                        index={i}
                        playerTokens={squarePlayers[i]}
                    />
                ))}

                <BoardCenter />
            </Canvas>
        </div>
    );
}
