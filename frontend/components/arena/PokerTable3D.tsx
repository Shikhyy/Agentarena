"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Float, RoundedBox } from "@react-three/drei";
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
    const meshRef = useRef<THREE.Group>(null);

    return (
        <group ref={meshRef} position={position} rotation={rotation as unknown as THREE.Euler}>
            <RoundedBox args={[0.45, 0.6, 0.02]} radius={0.03} smoothness={4} castShadow>
                <meshStandardMaterial
                    color={faceUp ? "#f8f4ef" : "#1E1B4B"}
                    metalness={0.1}
                    roughness={0.6}
                />
            </RoundedBox>
            {faceUp && (
                <Text
                    position={[0, 0, 0.015]}
                    fontSize={0.18}
                    color={suit === "" || suit === "" ? "#EF4444" : "#1a1a2e"}
                    anchorX="center"
                    anchorY="middle"
                >
                    {`${label}${suit}`}
                </Text>
            )}
            {!faceUp && (
                <>
                    {/* Card back pattern */}
                    <mesh position={[0, 0, 0.012]}>
                        <planeGeometry args={[0.35, 0.5]} />
                        <meshStandardMaterial color="#6C3AED" emissive="#6C3AED" emissiveIntensity={0.2} />
                    </mesh>
                    <mesh position={[0, 0, 0.013]}>
                        <planeGeometry args={[0.28, 0.43]} />
                        <meshStandardMaterial color="#1E1B4B" />
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
                <cylinderGeometry args={[0.18, 0.18, 0.06, 24]} />
                <meshStandardMaterial color={color} metalness={0.4} roughness={0.5} />
            </mesh>
            {/* Edge stripe */}
            <mesh>
                <torusGeometry args={[0.17, 0.015, 8, 24]} />
                <meshStandardMaterial color="#ffffff" metalness={0.3} roughness={0.6} transparent opacity={0.7} />
            </mesh>
            {value && (
                <Text position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.08} color="white" anchorX="center">
                    {value}
                </Text>
            )}
        </group>
    );
}

/* ── Table ────────────────────────────────────────────────── */
function Table() {
    return (
        <group>
            {/* Table surface */}
            <mesh position={[0, 0, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[3, 48]} />
                <meshStandardMaterial color="#0a3d1f" metalness={0.1} roughness={0.9} />
            </mesh>
            {/* Table edge */}
            <mesh position={[0, -0.05, 0]}>
                <torusGeometry args={[3, 0.15, 16, 48]} />
                <meshStandardMaterial color="#2a1505" metalness={0.3} roughness={0.7} />
            </mesh>
            {/* Inner ring */}
            <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[1.8, 1.85, 48]} />
                <meshStandardMaterial color="#F59E0B" emissive="#F59E0B" emissiveIntensity={0.3} transparent opacity={0.6} />
            </mesh>
        </group>
    );
}

/* ── Community Cards ─────────────────────────────────────── */
function CommunityCards({ cards }: { cards: { label: string; suit: string }[] }) {
    return (
        <group position={[0, 0.05, 0]}>
            {cards.map((card, i) => (
                <PokerCard
                    key={i}
                    position={[(i - 2) * 0.55, 0, 0]}
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
    const x = Math.sin(angle) * 2.3;
    const z = Math.cos(angle) * 2.3;

    return (
        <group position={[x, 0, z]} rotation={[0, -angle, 0]}>
            {/* Hole cards */}
            {holeCards.map((card, i) => (
                <PokerCard
                    key={i}
                    position={[(i - 0.5) * 0.3, 0.05, 0]}
                    rotation={[-Math.PI / 2.5, 0, (i - 0.5) * 0.1]}
                    faceUp={isActive}
                    label={card.label}
                    suit={card.suit}
                />
            ))}

            {/* Chip stack */}
            {Array.from({ length: Math.min(Math.ceil(chips / 200), 5) }, (_, i) => (
                <PokerChip
                    key={i}
                    position={[0.5, 0.03 + i * 0.065, -0.2]}
                    color={isActive ? "#F59E0B" : "#6C3AED"}
                />
            ))}

            {/* Player name */}
            <Float speed={isActive ? 3 : 1} floatIntensity={isActive ? 0.4 : 0.1}>
                <Text
                    position={[0, 0.8, 0]}
                    fontSize={0.2}
                    color={isActive ? "#F59E0B" : color}
                    anchorX="center"
                >
                    {name}
                </Text>
                {isActive && (
                    <Text position={[0, 0.55, 0]} fontSize={0.1} color="#10B981" anchorX="center">
                        THINKING...
                    </Text>
                )}
            </Float>
        </group>
    );
}

/* ── Pot Display ─────────────────────────────────────────── */
function PotDisplay({ amount }: { amount: number }) {
    return (
        <group position={[0, 0.05, -1]}>
            {/* Chips in pot */}
            {Array.from({ length: 6 }, (_, i) => (
                <PokerChip
                    key={i}
                    position={[
                        (Math.random() - 0.5) * 0.6,
                        i * 0.065,
                        (Math.random() - 0.5) * 0.3,
                    ]}
                    color={i % 2 === 0 ? "#F59E0B" : "#6C3AED"}
                />
            ))}
            <Text position={[0, 0.6, 0]} fontSize={0.15} color="#F59E0B" anchorX="center">
                {`POT: ${amount}`}
            </Text>
        </group>
    );
}

/* ── Ambient Particles ───────────────────────────────────── */
function AmbientParticles() {
    const ref = useRef<THREE.Points>(null);
    const count = 150;

    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 10;
            pos[i * 3 + 1] = Math.random() * 5;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
        }
        return pos;
    }, []);

    useFrame((_, delta) => {
        if (ref.current) {
            ref.current.rotation.y += delta * 0.02;
        }
    });

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial size={0.02} color="#F59E0B" transparent opacity={0.4} sizeAttenuation />
        </points>
    );
}

/* ── Scene ────────────────────────────────────────────────── */
function PokerScene({
    players = [
        { name: "BLITZ", cards: [{ label: "A", suit: "" }, { label: "K", suit: "" }], chips: 950, isActive: true },
        { name: "SHADOW", cards: [{ label: "Q", suit: "" }, { label: "J", suit: "" }], chips: 780, isActive: false },
    ],
    pot = 540,
    communityCards = [
        { label: "A", suit: "" },
        { label: "K", suit: "" },
        { label: "10", suit: "" },
        { label: "7", suit: "" },
        { label: "3", suit: "" },
    ],
}: {
    players?: { name: string; cards: { label: string; suit: string }[]; chips: number; isActive: boolean }[];
    pot?: number;
    communityCards?: { label: string; suit: string }[];
}) {
    return (
        <>
            {/* Lights */}
            <ambientLight intensity={0.2} />
            <directionalLight position={[3, 8, 3]} intensity={0.8} castShadow shadow-mapSize={1024} />
            <pointLight position={[0, 4, 0]} intensity={1} color="#F59E0B" distance={10} />
            <spotLight position={[0, 6, 0]} angle={0.4} penumbra={0.5} intensity={1.5} color="#ffffff" castShadow />

            {/* Table */}
            <Table />

            {/* Community cards */}
            <CommunityCards cards={communityCards} />

            {/* Pot */}
            <PotDisplay amount={pot} />

            {/* Players */}
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
                        color={i === 0 ? "#8B5CF6" : "#10B981"}
                    />
                );
            })}

            {/* Particles */}
            <AmbientParticles />

            {/* Camera controls */}
            <OrbitControls
                enablePan={false}
                enableZoom={true}
                minDistance={4}
                maxDistance={10}
                maxPolarAngle={Math.PI / 2.5}
                autoRotate
                autoRotateSpeed={0.3}
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
            camera={{ position: [0, 5, 6], fov: 40 }}
            style={{ width: "100%", height: "100%" }}
            gl={{ antialias: true }}
        >
            <color attach="background" args={["#0F0A1A"]} />
            <fog attach="fog" args={["#0F0A1A", 10, 18]} />
            <PokerScene players={players} pot={pot} communityCards={communityCards} />
        </WebGLSafeCanvas>
    );
}
