"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Float, RoundedBox, MeshReflectorMaterial } from "@react-three/drei";
import * as THREE from "three";
import { WebGLSafeCanvas } from "../world/WebGLErrorBoundary";

/* ── Card ────────────────────────────────────────────────── */
function PokerCard({
    position,
    rotation = [0, 0, 0],
    faceUp = false,
    label = "",
    suit = "",
}: {
    position: [number, number, number];
    rotation?: [number, number, number];
    faceUp?: boolean;
    label?: string;
    suit?: string;
}) {
    const ref = useRef<THREE.Group>(null);
    const isRed = suit === "♥" || suit === "♦";

    return (
        <group ref={ref} position={position} rotation={rotation as unknown as THREE.Euler}>
            <RoundedBox args={[0.42, 0.58, 0.015]} radius={0.03} smoothness={4} castShadow>
                <meshStandardMaterial
                    color={faceUp ? "#FAFAF5" : "#1A1535"}
                    metalness={0.05}
                    roughness={faceUp ? 0.5 : 0.4}
                />
            </RoundedBox>
            {faceUp && (
                <>
                    <Text
                        position={[0, 0.06, 0.01]}
                        fontSize={0.16}
                        color={isRed ? "#DC2626" : "#111827"}
                        anchorX="center"
                        anchorY="middle"
                        fontWeight={700}
                    >
                        {label}
                    </Text>
                    <Text
                        position={[0, -0.1, 0.01]}
                        fontSize={0.12}
                        color={isRed ? "#DC2626" : "#111827"}
                        anchorX="center"
                        anchorY="middle"
                    >
                        {suit}
                    </Text>
                </>
            )}
            {!faceUp && (
                <>
                    {/* Card back — elegant pattern */}
                    <mesh position={[0, 0, 0.009]}>
                        <planeGeometry args={[0.34, 0.5]} />
                        <meshStandardMaterial color="#6C3AED" emissive="#6C3AED" emissiveIntensity={0.15} />
                    </mesh>
                    <mesh position={[0, 0, 0.01]}>
                        <planeGeometry args={[0.28, 0.44]} />
                        <meshStandardMaterial color="#1A1535" />
                    </mesh>
                </>
            )}
        </group>
    );
}

/* ── Poker Chip ──────────────────────────────────────────── */
function PokerChip({
    position,
    color = "#6C3AED",
    value = "",
}: {
    position: [number, number, number];
    color?: string;
    value?: string;
}) {
    return (
        <group position={position}>
            <mesh castShadow>
                <cylinderGeometry args={[0.16, 0.16, 0.05, 32]} />
                <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
            </mesh>
            {/* Edge rim */}
            <mesh>
                <torusGeometry args={[0.15, 0.012, 8, 32]} />
                <meshStandardMaterial color="#ffffff" metalness={0.4} roughness={0.5} transparent opacity={0.6} />
            </mesh>
            {value && (
                <Text position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.06} color="white" anchorX="center" fontWeight={700}>
                    {value}
                </Text>
            )}
        </group>
    );
}

/* ── Felt Table ──────────────────────────────────────────── */
function Table() {
    return (
        <group>
            {/* Green felt surface */}
            <mesh position={[0, 0, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[2.8, 64]} />
                <meshStandardMaterial color="#0B4D2C" metalness={0.05} roughness={0.95} />
            </mesh>
            {/* Wood rail */}
            <mesh position={[0, -0.04, 0]}>
                <torusGeometry args={[2.85, 0.16, 16, 64]} />
                <meshStandardMaterial color="#2A1505" metalness={0.35} roughness={0.65} />
            </mesh>
            {/* Inner gold line */}
            <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[1.7, 1.73, 64]} />
                <meshStandardMaterial color="#D4A842" emissive="#D4A842" emissiveIntensity={0.25} transparent opacity={0.5} />
            </mesh>
            {/* Table leg shadow base */}
            <mesh position={[0, -0.2, 0]} receiveShadow>
                <cylinderGeometry args={[1.2, 1.4, 0.04, 32]} />
                <meshStandardMaterial color="#1A0E03" metalness={0.4} roughness={0.6} />
            </mesh>
        </group>
    );
}

/* ── Community Cards ─────────────────────────────────────── */
function CommunityCards({ cards }: { cards: { label: string; suit: string }[] }) {
    return (
        <group position={[0, 0.04, 0]}>
            {cards.map((card, i) => (
                <PokerCard
                    key={i}
                    position={[(i - 2) * 0.52, 0, 0]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    faceUp={true}
                    label={card.label}
                    suit={card.suit}
                />
            ))}
        </group>
    );
}

/* ── Player Position ─────────────────────────────────────── */
function PlayerPosition({
    angle,
    name,
    holeCards,
    chips,
    isActive = false,
    color = "#8B5CF6",
}: {
    angle: number;
    name: string;
    holeCards: { label: string; suit: string }[];
    chips: number;
    isActive?: boolean;
    color?: string;
}) {
    const x = Math.sin(angle) * 2.2;
    const z = Math.cos(angle) * 2.2;

    return (
        <group position={[x, 0, z]} rotation={[0, -angle, 0]}>
            {/* Hole cards */}
            {holeCards.map((card, i) => (
                <PokerCard
                    key={i}
                    position={[(i - 0.5) * 0.28, 0.03, 0]}
                    rotation={[-Math.PI / 2.3, 0, (i - 0.5) * 0.08]}
                    faceUp={isActive}
                    label={card.label}
                    suit={card.suit}
                />
            ))}

            {/* Chip stack */}
            {Array.from({ length: Math.min(Math.ceil(chips / 250), 4) }, (_, i) => (
                <PokerChip
                    key={i}
                    position={[0.45, 0.025 + i * 0.055, -0.15]}
                    color={isActive ? "#D4A842" : "#6C3AED"}
                />
            ))}

            {/* Player name tag */}
            <Float speed={isActive ? 2.5 : 0.8} floatIntensity={isActive ? 0.3 : 0.08}>
                <Text
                    position={[0, 0.7, 0]}
                    fontSize={0.16}
                    color={isActive ? "#D4A842" : color}
                    anchorX="center"
                    fontWeight={700}
                >
                    {name}
                </Text>
                {isActive && (
                    <Text position={[0, 0.5, 0]} fontSize={0.08} color="#22C55E" anchorX="center">
                        THINKING...
                    </Text>
                )}
            </Float>
        </group>
    );
}

/* ── Pot Display ─────────────────────────────────────────── */
function PotDisplay({ amount }: { amount: number }) {
    // Use stable positions instead of random
    const chipPositions = useMemo(() => {
        return Array.from({ length: 5 }, (_, i) => ({
            x: Math.cos((i / 5) * Math.PI * 2) * 0.2,
            z: Math.sin((i / 5) * Math.PI * 2) * 0.15,
        }));
    }, []);

    return (
        <group position={[0, 0.04, -0.9]}>
            {chipPositions.map((pos, i) => (
                <PokerChip
                    key={i}
                    position={[pos.x, i * 0.055, pos.z]}
                    color={i % 2 === 0 ? "#D4A842" : "#6C3AED"}
                />
            ))}
            <Text position={[0, 0.5, 0]} fontSize={0.12} color="#D4A842" anchorX="center" fontWeight={700}>
                {`POT: ${amount}`}
            </Text>
        </group>
    );
}

/* ── Reflective Floor ────────────────────────────────────── */
function Floor() {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.25, 0]} receiveShadow>
            <planeGeometry args={[20, 20]} />
            <MeshReflectorMaterial
                mirror={0.12}
                blur={[200, 100]}
                resolution={512}
                mixBlur={1}
                mixStrength={0.3}
                color="#050508"
                metalness={0.8}
                roughness={0.7}
            />
        </mesh>
    );
}

/* ── Scene ────────────────────────────────────────────────── */
function PokerScene({
    players = [
        { name: "BLITZ", cards: [{ label: "A", suit: "♠" }, { label: "K", suit: "♠" }], chips: 950, isActive: true },
        { name: "SHADOW", cards: [{ label: "Q", suit: "♥" }, { label: "J", suit: "♦" }], chips: 780, isActive: false },
    ],
    pot = 540,
    communityCards = [
        { label: "A", suit: "♥" },
        { label: "K", suit: "♦" },
        { label: "10", suit: "♣" },
        { label: "7", suit: "♠" },
        { label: "3", suit: "♥" },
    ],
}: {
    players?: { name: string; cards: { label: string; suit: string }[]; chips: number; isActive: boolean }[];
    pot?: number;
    communityCards?: { label: string; suit: string }[];
}) {
    return (
        <>
            {/* Lighting */}
            <ambientLight intensity={0.15} />
            <directionalLight position={[3, 8, 3]} intensity={0.8} castShadow shadow-mapSize={[2048, 2048]} color="#FFFAF0" />
            {/* Spotlight on table */}
            <spotLight position={[0, 7, 0]} angle={0.5} penumbra={0.7} intensity={1.8} color="#FFF8E7" castShadow />
            {/* Accent lights */}
            <pointLight position={[-3, 2, -3]} intensity={0.4} color="#6C3AED" distance={8} />
            <pointLight position={[3, 2, 3]} intensity={0.4} color="#D4A842" distance={8} />

            <Table />
            <Floor />
            <CommunityCards cards={communityCards} />
            <PotDisplay amount={pot} />

            {players.map((player, i) => {
                const angle = (i / players.length) * Math.PI * 2 + Math.PI;
                return (
                    <PlayerPosition
                        key={player.name}
                        angle={angle}
                        name={player.name}
                        holeCards={player.cards || []}
                        chips={player.chips}
                        isActive={player.isActive}
                        color={i === 0 ? "#8B5CF6" : "#22C55E"}
                    />
                );
            })}

            <OrbitControls
                enablePan={false}
                enableZoom={true}
                minDistance={4}
                maxDistance={9}
                maxPolarAngle={Math.PI / 2.3}
                autoRotate
                autoRotateSpeed={0.2}
                enableDamping
                dampingFactor={0.05}
            />
        </>
    );
}

/* ── Exported Component ──────────────────────────────────── */
export default function PokerTable3D({
    players,
    pot = 540,
    communityCards,
}: {
    players?: { name: string; cards: { label: string; suit: string }[]; chips: number; isActive: boolean }[];
    pot?: number;
    communityCards?: { label: string; suit: string }[];
}) {
    return (
        <WebGLSafeCanvas
            shadows
            camera={{ position: [0, 4.5, 5.5], fov: 38 }}
            style={{ width: "100%", height: "100%" }}
            gl={{ antialias: true }}
        >
            <color attach="background" args={["#030308"]} />
            <fog attach="fog" args={["#030308", 8, 16]} />
            <PokerScene players={players} pot={pot} communityCards={communityCards} />
        </WebGLSafeCanvas>
    );
}
