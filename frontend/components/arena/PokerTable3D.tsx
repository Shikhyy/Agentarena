"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Float, RoundedBox, MeshReflectorMaterial } from "@react-three/drei";
import * as THREE from "three";
import { COLORS } from "@/lib/theme";
import { WebGLSafeCanvas } from "../world/WebGLErrorBoundary";

/* ── Card ────────────────────────────────────────────────── */
const FLIP_SPEED = Math.PI / 0.4; // full π in 400ms

function PokerCard({
    position,
    rotation = [0, 0, 0],
    faceUp = false,
    label = "",
    suit = "",
    animate = false,
    flipDelay = 0,
}: {
    position: [number, number, number];
    rotation?: [number, number, number];
    faceUp?: boolean;
    label?: string;
    suit?: string;
    animate?: boolean;
    flipDelay?: number;
}) {
    const flipRef = useRef<THREE.Group>(null);
    const flipAngle = useRef(animate ? Math.PI : 0);
    const delayAccum = useRef(0);
    const flipping = useRef(animate);
    const [showFace, setShowFace] = useState(!animate && faceUp);
    const isRed = suit === "\u2665" || suit === "\u2666";

    useFrame((_, delta) => {
        if (!flipping.current || !flipRef.current) return;
        delayAccum.current += delta * 1000;
        if (delayAccum.current < flipDelay) return;

        flipAngle.current = Math.max(0, flipAngle.current - delta * FLIP_SPEED);
        flipRef.current.rotation.y = flipAngle.current;

        // Switch face content at mid-flip
        if (!showFace && flipAngle.current < Math.PI / 2) setShowFace(true);
        if (flipAngle.current <= 0) flipping.current = false;
    });

    return (
        <group position={position} rotation={rotation as unknown as THREE.Euler}>
            <group ref={flipRef} rotation={[0, animate ? Math.PI : 0, 0]}>
                <RoundedBox args={[0.42, 0.58, 0.015]} radius={0.03} smoothness={4} castShadow>
                    <meshStandardMaterial
                        color={showFace ? "#FAFAF5" : COLORS.card}
                        metalness={showFace ? 0.05 : 0.5}
                        roughness={showFace ? 0.5 : 0.3}
                        emissive={showFace ? "#000000" : COLORS.tealLight}
                        emissiveIntensity={showFace ? 0 : 0.15}
                    />
                </RoundedBox>
                {showFace && (
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
                {!showFace && (
                    <>
                        <mesh position={[0, 0, 0.009]}>
                            <planeGeometry args={[0.34, 0.5]} />
                            <meshStandardMaterial color={COLORS.redBright} emissive={COLORS.redBright} emissiveIntensity={0.2} />
                        </mesh>
                        <mesh position={[0, 0, 0.01]}>
                            <planeGeometry args={[0.28, 0.44]} />
                            <meshStandardMaterial color={COLORS.card} />
                        </mesh>
                    </>
                )}
            </group>
        </group>
    );
}

/* ── Poker Chip ──────────────────────────────────────────── */
function PokerChip3D({
    position,
    color = COLORS.redBright,
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
                <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} emissive={color} emissiveIntensity={0.3} />
            </mesh>
            <mesh>
                <torusGeometry args={[0.15, 0.012, 8, 32]} />
                <meshStandardMaterial color={COLORS.gold} metalness={0.6} roughness={0.3} transparent opacity={0.7} emissive={COLORS.gold} emissiveIntensity={0.2} />
            </mesh>
            {value && (
                <Text position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.06} color="white" anchorX="center" fontWeight={700}>
                    {value}
                </Text>
            )}
        </group>
    );
}

/* ── Art Deco Felt Table ─────────────────────────────────── */
function Table() {
    return (
        <group>
            <mesh position={[0, 0, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[2.8, 64]} />
                <meshStandardMaterial color="#06301a" metalness={0.05} roughness={0.95} />
            </mesh>
            <mesh position={[0, -0.04, 0]}>
                <torusGeometry args={[2.85, 0.16, 16, 64]} />
                <meshStandardMaterial color={COLORS.card} metalness={0.5} roughness={0.4} emissive={COLORS.redBright} emissiveIntensity={0.05} />
            </mesh>
            <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[1.7, 1.73, 64]} />
                <meshStandardMaterial color={COLORS.gold} emissive={COLORS.gold} emissiveIntensity={0.5} transparent opacity={0.6} />
            </mesh>
            <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[2.78, 2.81, 64]} />
                <meshStandardMaterial color={COLORS.redBright} emissive={COLORS.redBright} emissiveIntensity={0.4} transparent opacity={0.5} />
            </mesh>
            <mesh position={[0, -0.2, 0]} receiveShadow>
                <cylinderGeometry args={[1.2, 1.4, 0.04, 32]} />
                <meshStandardMaterial color={COLORS.ink} metalness={0.5} roughness={0.4} />
            </mesh>
        </group>
    );
}

/* ── Community Cards ─────────────────────────────────────── */
function CommunityCards({ cards }: { cards: { label: string; suit: string }[] }) {
    // Cards present on first render don't animate; new ones flip in with 200ms stagger.
    const mountedCount = useRef(cards.length);

    return (
        <group position={[0, 0.04, 0]}>
            {cards.map((card, i) => {
                const isNew = i >= mountedCount.current;
                return (
                    <PokerCard
                        key={i}
                        position={[(i - 2) * 0.52, 0, 0]}
                        rotation={[-Math.PI / 2, 0, 0]}
                        faceUp={true}
                        label={card.label}
                        suit={card.suit}
                        animate={isNew}
                        flipDelay={isNew ? (i - mountedCount.current) * 200 : 0}
                    />
                );
            })}
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
    color = COLORS.redBright,
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
            {Array.from({ length: Math.min(Math.ceil(chips / 250), 4) }, (_, i) => (
                <PokerChip3D
                    key={i}
                    position={[0.45, 0.025 + i * 0.055, -0.15]}
                    color={isActive ? COLORS.gold : COLORS.redBright}
                />
            ))}
            <Float speed={isActive ? 2.5 : 0.8} floatIntensity={isActive ? 0.3 : 0.08}>
                <Text
                    position={[0, 0.7, 0]}
                    fontSize={0.16}
                    color={isActive ? COLORS.gold : color}
                    anchorX="center"
                    fontWeight={700}
                    outlineWidth={0.01}
                    outlineColor="#000000"
                >
                    {name}
                </Text>
                {isActive && (
                    <Text position={[0, 0.5, 0]} fontSize={0.08} color={COLORS.tealLight} anchorX="center" outlineWidth={0.005} outlineColor="#000000">
                        THINKING...
                    </Text>
                )}
            </Float>
            {isActive && (
                <pointLight position={[0, 0.5, 0]} intensity={0.6} color={COLORS.gold} distance={2} decay={2} />
            )}
        </group>
    );
}

/* ── Pot Display ─────────────────────────────────────────── */
function PotDisplay({ amount }: { amount: number }) {
    const chipPositions = useMemo(() => {
        return Array.from({ length: 5 }, (_, i) => ({
            x: Math.cos((i / 5) * Math.PI * 2) * 0.2,
            z: Math.sin((i / 5) * Math.PI * 2) * 0.15,
        }));
    }, []);

    return (
        <group position={[0, 0.04, -0.9]}>
            {chipPositions.map((pos, i) => (
                <PokerChip3D
                    key={i}
                    position={[pos.x, i * 0.055, pos.z]}
                    color={i % 2 === 0 ? COLORS.gold : COLORS.redBright}
                />
            ))}
            <Float speed={1.5} floatIntensity={0.15}>
                <Text position={[0, 0.5, 0]} fontSize={0.12} color={COLORS.gold} anchorX="center" fontWeight={700} outlineWidth={0.008} outlineColor="#000000">
                    {`POT: ${amount}`}
                </Text>
            </Float>
        </group>
    );
}

/* ── Reflective Floor ────────────────────────────────────── */
function Floor() {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.25, 0]} receiveShadow>
            <planeGeometry args={[20, 20]} />
            <MeshReflectorMaterial
                mirror={0.15}
                blur={[200, 100]}
                resolution={512}
                mixBlur={1}
                mixStrength={0.4}
                color={COLORS.ink}
                metalness={0.8}
                roughness={0.6}
            />
        </mesh>
    );
}

/* ── Scene ────────────────────────────────────────────────── */
function PokerScene({
    players = [
        { name: "BLITZ", cards: [{ label: "A", suit: "\u2660" }, { label: "K", suit: "\u2660" }], chips: 950, isActive: true },
        { name: "SHADOW", cards: [{ label: "Q", suit: "\u2665" }, { label: "J", suit: "\u2666" }], chips: 780, isActive: false },
    ],
    pot = 540,
    communityCards = [
        { label: "A", suit: "\u2665" },
        { label: "K", suit: "\u2666" },
        { label: "10", suit: "\u2663" },
        { label: "7", suit: "\u2660" },
        { label: "3", suit: "\u2665" },
    ],
}: {
    players?: { name: string; cards: { label: string; suit: string }[]; chips: number; isActive: boolean }[];
    pot?: number;
    communityCards?: { label: string; suit: string }[];
}) {
    return (
        <>
            <ambientLight intensity={0.08} color={COLORS.surface} />
            <directionalLight position={[3, 8, 3]} intensity={0.5} castShadow shadow-mapSize={[2048, 2048]} color="#665588" />
            <spotLight position={[0, 7, 0]} angle={0.5} penumbra={0.7} intensity={1.5} color="#ffeecc" castShadow />
            <pointLight position={[-3, 2, -3]} intensity={0.6} color={COLORS.redBright} distance={10} decay={2} />
            <pointLight position={[3, 2, 3]} intensity={0.6} color={COLORS.gold} distance={10} decay={2} />
            <pointLight position={[0, 5, 0]} intensity={0.3} color={COLORS.gold} distance={8} />

            <Table />
            <Floor />
            <CommunityCards cards={communityCards} />
            <PotDisplay amount={pot} />

            {players.map((player, i) => {
                const angle = (i / players.length) * Math.PI * 2 + Math.PI;
                const x = Math.sin(angle) * 2.2;
                const z = Math.cos(angle) * 2.2;
                return (
                    <group key={player.name}>
                        <PlayerPosition
                            angle={angle}
                            name={player.name}
                            holeCards={player.cards || []}
                            chips={player.chips}
                            isActive={player.isActive}
                            color={i === 0 ? COLORS.gold : COLORS.redBright}
                        />
                        {/* All-in spotlight: intensified when player has no chips */}
                        {player.chips === 0 && (
                            <spotLight
                                position={[x, 4, z]}
                                target-position={[x, 0, z]}
                                angle={0.35}
                                penumbra={0.4}
                                intensity={6}
                                color={COLORS.gold}
                                castShadow
                            />
                        )}
                    </group>
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
            <color attach="background" args={[COLORS.ink]} />
            <fog attach="fog" args={[COLORS.ink, 8, 18]} />
            <PokerScene players={players} pot={pot} communityCards={communityCards} />
        </WebGLSafeCanvas>
    );
}
