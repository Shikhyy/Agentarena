"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls, Text, RoundedBox, Float, Html } from "@react-three/drei";
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

/* ── Per-player colour palette ───────────────────────────── */
const PLAYER_COLORS = [COLORS.gold, COLORS.redBright, COLORS.tealLight, "#C0B8A8"];

/* ── Negotiation bubble colours (from design spec) ───────── */
const BUBBLE_COLORS: Record<string, { border: string; text: string }> = {
    offer:   { border: "#4DA6FF", text: "#C5BAD4" },
    counter: { border: "#FF8C1A", text: "#F0EAF5" },
    accept:  { border: "#39FF6B", text: "#F0EAF5" },
    reject:  { border: "#FF4444", text: "#F0EAF5" },
    taunt:   { border: "#FFAA4D", text: "#F0EAF5" },
    think:   { border: "#525260", text: "#8A7FA0" },
};

/* ── Negotiation message type ────────────────────────────── */
export interface NegotiationMessage {
    playerId: number;
    message: string;
    type?: "offer" | "counter" | "accept" | "reject" | "taunt" | "think";
}

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

/* ── Agent Token with hop animation + speech bubble ─────── */
const HOP_SPEED = 2.5; // completes arc in ~0.4 s

function AgentToken({
    playerId,
    squareIndex,
    slotOffset,
    color,
    negotiation,
}: {
    playerId: number;
    squareIndex: number;
    slotOffset: number;
    color: string;
    negotiation?: NegotiationMessage;
}) {
    const meshRef = useRef<THREE.Mesh>(null);
    const prevSquare = useRef(squareIndex);
    const animRef = useRef({
        from: new THREE.Vector3(),
        to: new THREE.Vector3(),
        t: 1,
        active: false,
    });

    // Trigger hop when square changes
    useEffect(() => {
        if (prevSquare.current !== squareIndex) {
            const [fx, , fz] = getSquarePosition(prevSquare.current);
            const [tx, , tz] = getSquarePosition(squareIndex);
            animRef.current = {
                from: new THREE.Vector3(fx + slotOffset, 0.15, fz),
                to:   new THREE.Vector3(tx + slotOffset, 0.15, tz),
                t: 0,
                active: true,
            };
            prevSquare.current = squareIndex;
        }
    }, [squareIndex, slotOffset]);

    useFrame((_, delta) => {
        if (!meshRef.current || !animRef.current.active) return;
        const a = animRef.current;
        a.t = Math.min(1, a.t + delta * HOP_SPEED);
        const t = a.t;
        // Parabolic arc
        const x = a.from.x + (a.to.x - a.from.x) * t;
        const z = a.from.z + (a.to.z - a.from.z) * t;
        const y = 0.15 + Math.sin(t * Math.PI) * 3;
        // Brief scale bump on landing (last 15% of arc)
        const scaleBump = t > 0.85 ? 1 + Math.sin(((t - 0.85) / 0.15) * Math.PI) * 0.02 : 1;
        meshRef.current.position.set(x, y, z);
        meshRef.current.scale.setScalar(scaleBump);
        if (t >= 1) {
            a.active = false;
            meshRef.current.position.set(a.to.x, 0.15, a.to.z);
            meshRef.current.scale.setScalar(1);
        }
    });

    // Auto-dismiss speech bubble after 4 s
    const [showBubble, setShowBubble] = useState(false);
    const bubbleKey = useRef(0);
    useEffect(() => {
        if (!negotiation) return;
        bubbleKey.current += 1;
        setShowBubble(true);
        const timer = setTimeout(() => setShowBubble(false), 4000);
        return () => clearTimeout(timer);
    }, [negotiation]);

    const [tx, , tz] = getSquarePosition(squareIndex);
    const bubbleStyle = BUBBLE_COLORS[negotiation?.type ?? "think"];

    return (
        <group>
            <mesh ref={meshRef} position={[tx + slotOffset, 0.15, tz]}>
                <sphereGeometry args={[0.18, 16, 16]} />
                <meshStandardMaterial
                    color={color}
                    metalness={0.8}
                    roughness={0.2}
                    emissive={color}
                    emissiveIntensity={0.8}
                />
                {showBubble && negotiation && (
                    <Html position={[0, 1.6, 0]} center distanceFactor={6} zIndexRange={[10, 0]}>
                        <div
                            key={bubbleKey.current}
                            style={{
                                background: "rgba(12,10,8,0.94)",
                                border: `1px solid ${bubbleStyle.border}`,
                                borderRadius: 6,
                                padding: "5px 10px",
                                color: bubbleStyle.text,
                                fontSize: 11,
                                maxWidth: 140,
                                whiteSpace: "pre-wrap",
                                pointerEvents: "none",
                                lineHeight: 1.4,
                            }}
                        >
                            {negotiation.message}
                        </div>
                    </Html>
                )}
            </mesh>
            <pointLight
                position={[tx + slotOffset, 0.3, tz]}
                intensity={0.3}
                color={color}
                distance={2}
                decay={2}
            />
        </group>
    );
}

/* ── Board Square ────────────────────────────────────────── */
function BoardSquare({ index, ownerColor }: { index: number; ownerColor?: string }) {
    const pos = getSquarePosition(index);
    const color = getSquareColor(index);
    const activeColor = ownerColor ?? color;

    return (
        <group position={pos}>
            <RoundedBox args={[SQUARE_W, 0.15, SQUARE_L]} radius={0.02}>
                <meshStandardMaterial
                    color={COLORS.card}
                    metalness={0.4}
                    roughness={0.4}
                    emissive={activeColor}
                    emissiveIntensity={ownerColor ? 0.4 : 0.15}
                />
            </RoundedBox>
            {/* Color strip on top */}
            <mesh position={[0, 0.08, -0.7]} receiveShadow>
                <boxGeometry args={[SQUARE_W - 0.1, 0.02, 0.4]} />
                <meshStandardMaterial
                    color={activeColor}
                    metalness={0.6}
                    roughness={0.2}
                    emissive={activeColor}
                    emissiveIntensity={ownerColor ? 0.7 : 0.4}
                />
            </mesh>
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
    propertyOwnership?: Record<number, number>; // squareIndex → playerId
    negotiations?: NegotiationMessage[];
}

export function MonopolyBoard3D({
    playerPositions = {},
    propertyOwnership = {},
    negotiations = [],
}: MonopolyBoard3DProps) {
    // squareIndex → list of playerIds (for slot offset computation)
    const squarePlayers = useMemo(() => {
        const map: Record<number, number[]> = {};
        for (const [pid, sq] of Object.entries(playerPositions)) {
            if (!map[sq]) map[sq] = [];
            map[sq].push(Number(pid));
        }
        return map;
    }, [playerPositions]);

    // playerId → active negotiation message
    const negotiationMap = useMemo(() => {
        const map: Record<number, NegotiationMessage> = {};
        for (const n of negotiations) map[n.playerId] = n;
        return map;
    }, [negotiations]);

    // squareIndex → owner colour (from propertyOwnership)
    const ownerColors = useMemo(() => {
        const map: Record<number, string> = {};
        for (const [sq, pid] of Object.entries(propertyOwnership)) {
            map[Number(sq)] = PLAYER_COLORS[Number(pid) % PLAYER_COLORS.length];
        }
        return map;
    }, [propertyOwnership]);

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
                    <BoardSquare key={i} index={i} ownerColor={ownerColors[i]} />
                ))}

                {/* Agent tokens rendered independently so hop animation works across squares */}
                {Object.entries(playerPositions).map(([pidStr, sq]) => {
                    const pid = Number(pidStr);
                    const slotIdx = squarePlayers[sq]?.indexOf(pid) ?? 0;
                    return (
                        <AgentToken
                            key={pid}
                            playerId={pid}
                            squareIndex={sq}
                            slotOffset={slotIdx * 0.3 - 0.3}
                            color={PLAYER_COLORS[pid % PLAYER_COLORS.length]}
                            negotiation={negotiationMap[pid]}
                        />
                    );
                })}

                <BoardCenter />
            </WebGLSafeCanvas>
        </div>
    );
}
