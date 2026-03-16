"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text, MeshReflectorMaterial, Float } from "@react-three/drei";
import * as THREE from "three";
import { COLORS } from "@/lib/theme";
import { WebGLSafeCanvas } from "../world/WebGLErrorBoundary";

/* ── Chess-Specific Colour Tokens (arena spec) ───────────── */
const CHESS = {
    lightSquare:  { color: '#141E20', emissive: '#1A3840', emissiveIntensity: 0.06, roughness: 0.55, metalness: 0.25 },
    darkSquare:   { color: '#060810', emissive: '#000000', emissiveIntensity: 0,    roughness: 0.85, metalness: 0.05 },
    activeSquare: { color: '#1A3840', emissive: '#1E8080' },
    threatSquare: { color: '#200808', emissive: '#8C1A1A' },
    lastMoveFrom: { emissive: '#1E8080', emissiveIntensity: 0.35 },
    lastMoveTo:   { emissive: '#1E8080', emissiveIntensity: 0.45 },
    border:       { color: '#1A2830', emissive: '#1E8080', emissiveIntensity: 0.15, roughness: 0.3, metalness: 0.6 },
    torch:        '#D4921A',
    boardAccent:  '#4DA6FF',
    gothicAmbient:'#060C14',
    checkRed:     '#8C1A1A',
    evalGreen:    '#39FF6B',
    evalEmber:    '#FF8C1A',
};

/* ── Helpers ──────────────────────────────────────────────── */
function algebraicToRC(sq: string): [number, number] {
    const col = sq.charCodeAt(0) - 97;
    const rank = parseInt(sq[1]) - 1;
    return [7 - rank, col];
}

function algebraicToWorld(sq: string): [number, number] {
    const col = sq.charCodeAt(0) - 97;
    const rank = parseInt(sq[1]) - 1;
    return [(col - 3.5) * 0.5, (rank - 3.5) * -0.5];
}

type MovePhase = 'idle' | 'lift' | 'travel' | 'land';
type DynamicCameraMode = 'tension' | 'check' | 'sacrifice' | 'checkmate' | null;

/* ── Camera Controller ───────────────────────────────────── */
function CameraController({
    mode,
    dynamicMode,
    checkKingPos,
    captureSquare,
}: {
    mode: "cinematic" | "tactical" | "free";
    dynamicMode?: DynamicCameraMode;
    checkKingPos?: [number, number];
    captureSquare?: [number, number];
}) {
    const { camera } = useThree();
    const dynamicTimer = useRef(0);

    useFrame((_, delta) => {
        if (dynamicMode) dynamicTimer.current += delta;
        else dynamicTimer.current = 0;

        // Dynamic camera behaviors take priority
        if (dynamicMode === 'checkmate') {
            camera.position.lerp(new THREE.Vector3(0, 4.0, 6), 0.015);
        } else if (dynamicMode === 'check' && checkKingPos) {
            const target = new THREE.Vector3(checkKingPos[0] * 0.3, 7.0, checkKingPos[1] * 0.3 + 2);
            camera.position.lerp(target, 0.025);
        } else if (dynamicMode === 'sacrifice' && captureSquare) {
            const target = new THREE.Vector3(captureSquare[0] * 0.3, 8.0, captureSquare[1] * 0.3 + 1.5);
            camera.position.lerp(target, 0.02);
        } else if (dynamicMode === 'tension' && dynamicTimer.current < 2) {
            camera.position.lerp(new THREE.Vector3(0, 6.5, 3), 0.02);
        } else if (mode === "tactical") {
            camera.position.lerp(new THREE.Vector3(0, 7, 0.5), 0.03);
            camera.lookAt(0, 0, 0);
        }
    });

    return (
        <OrbitControls
            enablePan={mode === "free"}
            enableZoom={true}
            minDistance={3}
            maxDistance={10}
            maxPolarAngle={mode === "tactical" ? Math.PI / 6 : Math.PI / 2.2}
            autoRotate={mode === "cinematic" || dynamicMode === "checkmate"}
            autoRotateSpeed={dynamicMode === "checkmate" ? 0.15 : 0.3}
            enableDamping
            dampingFactor={0.05}
        />
    );
}

/* ── Refined Chess Piece Shapes — Obsidian + Neon ────────── */
function Pawn({ color, isActive }: { color: "white" | "black"; isActive: boolean }) {
    const mat = color === "white" ? COLORS.surface : "#0a0a18";
    const accent = color === "white" ? COLORS.gold : COLORS.redBright;
    const emissive = isActive ? accent : mat;
    const emissiveIntensity = isActive ? 1.2 : 0.05;
    return (
        <group>
            <mesh position={[0, 0.03, 0]} castShadow>
                <cylinderGeometry args={[0.16, 0.18, 0.06, 24]} />
                <meshStandardMaterial color={mat} metalness={0.7} roughness={0.2} emissive={emissive} emissiveIntensity={emissiveIntensity * 0.3} />
            </mesh>
            <mesh position={[0, 0.22, 0]} castShadow>
                <cylinderGeometry args={[0.06, 0.13, 0.32, 16]} />
                <meshStandardMaterial color={mat} metalness={0.7} roughness={0.2} emissive={emissive} emissiveIntensity={emissiveIntensity * 0.5} />
            </mesh>
            <mesh position={[0, 0.42, 0]} castShadow>
                <sphereGeometry args={[0.08, 24, 24]} />
                <meshStandardMaterial color={mat} metalness={0.8} roughness={0.15} emissive={emissive} emissiveIntensity={emissiveIntensity} />
            </mesh>
        </group>
    );
}

function Rook({ color, isActive }: { color: "white" | "black"; isActive: boolean }) {
    const mat = color === "white" ? COLORS.surface : "#0a0a18";
    const accent = color === "white" ? COLORS.gold : COLORS.redBright;
    const emissive = isActive ? accent : mat;
    const ei = isActive ? 1.2 : 0.05;
    return (
        <group>
            <mesh position={[0, 0.03, 0]} castShadow>
                <cylinderGeometry args={[0.17, 0.19, 0.06, 24]} />
                <meshStandardMaterial color={mat} metalness={0.7} roughness={0.2} emissive={emissive} emissiveIntensity={ei * 0.3} />
            </mesh>
            <mesh position={[0, 0.25, 0]} castShadow>
                <cylinderGeometry args={[0.1, 0.15, 0.38, 16]} />
                <meshStandardMaterial color={mat} metalness={0.7} roughness={0.2} emissive={emissive} emissiveIntensity={ei * 0.5} />
            </mesh>
            <mesh position={[0, 0.46, 0]} castShadow>
                <cylinderGeometry args={[0.13, 0.1, 0.06, 4]} />
                <meshStandardMaterial color={mat} metalness={0.8} roughness={0.15} emissive={emissive} emissiveIntensity={ei} />
            </mesh>
        </group>
    );
}

function Knight({ color, isActive }: { color: "white" | "black"; isActive: boolean }) {
    const mat = color === "white" ? COLORS.surface : "#0a0a18";
    const accent = color === "white" ? COLORS.gold : COLORS.redBright;
    const emissive = isActive ? accent : mat;
    const ei = isActive ? 1.2 : 0.05;
    return (
        <group>
            <mesh position={[0, 0.03, 0]} castShadow>
                <cylinderGeometry args={[0.16, 0.18, 0.06, 24]} />
                <meshStandardMaterial color={mat} metalness={0.7} roughness={0.2} emissive={emissive} emissiveIntensity={ei * 0.3} />
            </mesh>
            <mesh position={[0, 0.22, 0]} castShadow>
                <cylinderGeometry args={[0.07, 0.14, 0.32, 16]} />
                <meshStandardMaterial color={mat} metalness={0.7} roughness={0.2} emissive={emissive} emissiveIntensity={ei * 0.5} />
            </mesh>
            <mesh position={[0, 0.44, 0.04]} rotation={[0.3, 0, 0]} castShadow>
                <boxGeometry args={[0.1, 0.16, 0.14]} />
                <meshStandardMaterial color={mat} metalness={0.8} roughness={0.15} emissive={emissive} emissiveIntensity={ei} />
            </mesh>
            <mesh position={[0, 0.5, 0.08]} castShadow>
                <sphereGeometry args={[0.05, 16, 16]} />
                <meshStandardMaterial color={mat} metalness={0.8} roughness={0.15} emissive={emissive} emissiveIntensity={ei} />
            </mesh>
        </group>
    );
}

function Bishop({ color, isActive }: { color: "white" | "black"; isActive: boolean }) {
    const mat = color === "white" ? COLORS.surface : "#0a0a18";
    const accent = color === "white" ? COLORS.gold : COLORS.redBright;
    const emissive = isActive ? accent : mat;
    const ei = isActive ? 1.2 : 0.05;
    return (
        <group>
            <mesh position={[0, 0.03, 0]} castShadow>
                <cylinderGeometry args={[0.16, 0.18, 0.06, 24]} />
                <meshStandardMaterial color={mat} metalness={0.7} roughness={0.2} emissive={emissive} emissiveIntensity={ei * 0.3} />
            </mesh>
            <mesh position={[0, 0.28, 0]} castShadow>
                <cylinderGeometry args={[0.06, 0.14, 0.44, 16]} />
                <meshStandardMaterial color={mat} metalness={0.7} roughness={0.2} emissive={emissive} emissiveIntensity={ei * 0.5} />
            </mesh>
            <mesh position={[0, 0.54, 0]} castShadow>
                <coneGeometry args={[0.06, 0.12, 16]} />
                <meshStandardMaterial color={mat} metalness={0.8} roughness={0.15} emissive={emissive} emissiveIntensity={ei} />
            </mesh>
            <mesh position={[0, 0.62, 0]} castShadow>
                <sphereGeometry args={[0.03, 16, 16]} />
                <meshStandardMaterial color={mat} metalness={0.8} roughness={0.1} emissive={emissive} emissiveIntensity={ei * 1.2} />
            </mesh>
        </group>
    );
}

function Queen({ color, isActive }: { color: "white" | "black"; isActive: boolean }) {
    const mat = color === "white" ? COLORS.surface : "#0a0a18";
    const accent = color === "white" ? COLORS.gold : COLORS.redBright;
    const emissive = isActive ? accent : mat;
    const ei = isActive ? 1.4 : 0.05;
    return (
        <group>
            <mesh position={[0, 0.03, 0]} castShadow>
                <cylinderGeometry args={[0.17, 0.19, 0.06, 24]} />
                <meshStandardMaterial color={mat} metalness={0.7} roughness={0.2} emissive={emissive} emissiveIntensity={ei * 0.3} />
            </mesh>
            <mesh position={[0, 0.32, 0]} castShadow>
                <cylinderGeometry args={[0.06, 0.15, 0.52, 16]} />
                <meshStandardMaterial color={mat} metalness={0.7} roughness={0.2} emissive={emissive} emissiveIntensity={ei * 0.5} />
            </mesh>
            <mesh position={[0, 0.58, 0]} castShadow>
                <torusGeometry args={[0.07, 0.02, 8, 24]} />
                <meshStandardMaterial color={mat} metalness={0.8} roughness={0.1} emissive={accent} emissiveIntensity={ei * 0.8} />
            </mesh>
            <mesh position={[0, 0.64, 0]} castShadow>
                <sphereGeometry args={[0.04, 24, 24]} />
                <meshStandardMaterial color={mat} metalness={0.8} roughness={0.1} emissive={accent} emissiveIntensity={ei} />
            </mesh>
        </group>
    );
}

function King({ color, isActive }: { color: "white" | "black"; isActive: boolean }) {
    const mat = color === "white" ? COLORS.surface : "#0a0a18";
    const accent = color === "white" ? COLORS.gold : COLORS.redBright;
    const emissive = isActive ? accent : mat;
    const ei = isActive ? 1.5 : 0.05;
    return (
        <group>
            <mesh position={[0, 0.03, 0]} castShadow>
                <cylinderGeometry args={[0.18, 0.2, 0.06, 24]} />
                <meshStandardMaterial color={mat} metalness={0.7} roughness={0.2} emissive={emissive} emissiveIntensity={ei * 0.3} />
            </mesh>
            <mesh position={[0, 0.34, 0]} castShadow>
                <cylinderGeometry args={[0.07, 0.16, 0.56, 16]} />
                <meshStandardMaterial color={mat} metalness={0.7} roughness={0.2} emissive={emissive} emissiveIntensity={ei * 0.5} />
            </mesh>
            <mesh position={[0, 0.62, 0]} castShadow>
                <cylinderGeometry args={[0.09, 0.07, 0.04, 24]} />
                <meshStandardMaterial color={mat} metalness={0.8} roughness={0.15} emissive={emissive} emissiveIntensity={ei * 0.7} />
            </mesh>
            {/* Cross — vertical */}
            <mesh position={[0, 0.72, 0]} castShadow>
                <boxGeometry args={[0.02, 0.12, 0.02]} />
                <meshStandardMaterial color={mat} metalness={0.8} roughness={0.1} emissive={accent} emissiveIntensity={ei} />
            </mesh>
            {/* Cross — horizontal */}
            <mesh position={[0, 0.72, 0]} castShadow>
                <boxGeometry args={[0.08, 0.02, 0.02]} />
                <meshStandardMaterial color={mat} metalness={0.8} roughness={0.1} emissive={accent} emissiveIntensity={ei} />
            </mesh>
        </group>
    );
}

/* ── Chess Piece Router ──────────────────────────────────── */
const PIECE_COMPONENTS: Record<string, React.FC<{ color: "white" | "black"; isActive: boolean }>> = {
    pawn: Pawn, rook: Rook, knight: Knight, bishop: Bishop, queen: Queen, king: King,
};

function ChessPiece({
    position,
    color,
    type,
    isActive = false,
    animateFrom,
    onLanded,
}: {
    position: [number, number, number];
    color: "white" | "black";
    type: string;
    isActive?: boolean;
    animateFrom?: [number, number, number];
    onLanded?: () => void;
}) {
    const ref = useRef<THREE.Group>(null);
    const Comp = PIECE_COMPONENTS[type] || Pawn;
    const accent = color === "white" ? COLORS.gold : COLORS.redBright;

    const phase = useRef<MovePhase>('idle');
    const animProgress = useRef(0);
    const startPos = useRef<THREE.Vector3 | null>(null);
    const endPos = useRef<THREE.Vector3>(new THREE.Vector3(...position));

    useEffect(() => {
        if (animateFrom) {
            startPos.current = new THREE.Vector3(...animateFrom);
            endPos.current = new THREE.Vector3(...position);
            phase.current = 'lift';
            animProgress.current = 0;
            if (ref.current) {
                ref.current.position.set(animateFrom[0], animateFrom[1], animateFrom[2]);
            }
        }
    }, [animateFrom, position]);

    useFrame((_, delta) => {
        if (!ref.current) return;
        const ms = delta * 1000;

        if (phase.current === 'lift') {
            animProgress.current += ms;
            const t = Math.min(animProgress.current / 200, 1);
            const spring = 1 - Math.pow(1 - t, 2) * Math.cos(t * Math.PI * 0.5);
            ref.current.position.y = (startPos.current?.y ?? 0.02) + spring * 0.3;
            if (t >= 1) { phase.current = 'travel'; animProgress.current = 0; }
        } else if (phase.current === 'travel') {
            animProgress.current += ms;
            const t = Math.min(animProgress.current / 480, 1);
            const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            const sx = startPos.current?.x ?? 0;
            const sz = startPos.current?.z ?? 0;
            ref.current.position.x = sx + (endPos.current.x - sx) * ease;
            ref.current.position.z = sz + (endPos.current.z - sz) * ease;
            ref.current.position.y = 0.02 + 0.3;
            if (t >= 1) { phase.current = 'land'; animProgress.current = 0; }
        } else if (phase.current === 'land') {
            animProgress.current += ms;
            const t = Math.min(animProgress.current / 200, 1);
            const spring = Math.pow(1 - t, 2) * Math.cos(t * Math.PI * 0.5);
            ref.current.position.y = 0.02 + spring * 0.3;
            ref.current.position.x = endPos.current.x;
            ref.current.position.z = endPos.current.z;
            if (t >= 1) {
                phase.current = 'idle';
                ref.current.position.set(endPos.current.x, 0.02, endPos.current.z);
                onLanded?.();
            }
        } else if (isActive) {
            ref.current.position.y = position[1] + Math.sin(Date.now() * 0.003) * 0.04;
        }
    });

    return (
        <group ref={ref} position={position}>
            <Comp color={color} isActive={isActive} />
            {/* Active glow ring */}
            {isActive && (
                <>
                    <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[0.18, 0.24, 32]} />
                        <meshBasicMaterial color={accent} transparent opacity={0.6} side={THREE.DoubleSide} />
                    </mesh>
                    {/* Point light for active piece glow */}
                    <pointLight position={[0, 0.4, 0]} intensity={0.8} color={accent} distance={1.5} decay={2} />
                </>
            )}
        </group>
    );
}

/* ── Gothic Arch Columns ─────────────────────────────────── */
function GothicArches() {
    const archPositions = useMemo(() => [
        [-3.2, 0, -3.2], [3.2, 0, -3.2], [-3.2, 0, 3.2], [3.2, 0, 3.2],
        [-3.2, 0, 0], [3.2, 0, 0],
    ] as [number, number, number][], []);

    return (
        <group>
            {archPositions.map((pos, i) => (
                <group key={i} position={pos}>
                    {/* Pillar body */}
                    <mesh position={[0, 2, 0]} castShadow>
                        <cylinderGeometry args={[0.08, 0.12, 4, 8]} />
                        <meshStandardMaterial color={COLORS.card} metalness={0.6} roughness={0.3} emissive={COLORS.tealLight} emissiveIntensity={0.08} />
                    </mesh>
                    {/* Neon tip */}
                    <mesh position={[0, 4.1, 0]}>
                        <octahedronGeometry args={[0.1, 0]} />
                        <meshStandardMaterial color={COLORS.tealLight} emissive={COLORS.tealLight} emissiveIntensity={1.5} />
                    </mesh>
                    {/* Base ring */}
                    <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[0.12, 0.16, 16]} />
                        <meshStandardMaterial color={COLORS.tealLight} emissive={COLORS.tealLight} emissiveIntensity={0.5} side={THREE.DoubleSide} />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

/* ── Board Square (per-square animation) ──────────────────── */
function BoardSquare({
    position,
    base,
    isLastFrom,
    isLastTo,
    isThreat,
    isLandPulse = false,
}: {
    position: [number, number, number];
    base: { color: string; emissive: string; emissiveIntensity: number; roughness: number; metalness: number };
    isLastFrom: boolean;
    isLastTo: boolean;
    isThreat: boolean;
    isLandPulse?: boolean;
}) {
    const ref = useRef<THREE.Mesh>(null);
    const landPulseTime = useRef(-1);

    useEffect(() => {
        if (isLandPulse) landPulseTime.current = 0;
    }, [isLandPulse]);

    useFrame(({ clock }, delta) => {
        if (!ref.current) return;
        const mat = ref.current.material as THREE.MeshStandardMaterial;

        // Scale pulse on piece land: 1.0 → 1.02 → 1.0 over 100ms
        if (landPulseTime.current >= 0) {
            landPulseTime.current += delta;
            if (landPulseTime.current < 0.1) {
                const t = landPulseTime.current / 0.1;
                const scale = 1 + 0.02 * Math.sin(t * Math.PI);
                ref.current.scale.set(scale, 1, scale);
            } else {
                ref.current.scale.set(1, 1, 1);
                landPulseTime.current = -1;
            }
        }

        if (isThreat) {
            mat.color.set(CHESS.threatSquare.color);
            mat.emissive.set(CHESS.threatSquare.emissive);
            // Pulse around 0.15 opacity equivalent — subtle red wash per spec
            mat.emissiveIntensity = 0.15 + Math.sin(clock.elapsedTime * 5) * 0.08;
        } else if (isLastTo) {
            mat.emissive.set(CHESS.lastMoveTo.emissive);
            mat.emissiveIntensity = CHESS.lastMoveTo.emissiveIntensity;
        } else if (isLastFrom) {
            mat.emissive.set(CHESS.lastMoveFrom.emissive);
            mat.emissiveIntensity = CHESS.lastMoveFrom.emissiveIntensity;
        } else {
            mat.color.set(base.color);
            mat.emissive.set(base.emissive);
            mat.emissiveIntensity = base.emissiveIntensity;
        }
    });

    return (
        <mesh ref={ref} position={position} receiveShadow>
            <boxGeometry args={[0.49, 0.02, 0.49]} />
            <meshStandardMaterial
                color={base.color}
                emissive={base.emissive}
                emissiveIntensity={base.emissiveIntensity}
                roughness={base.roughness}
                metalness={base.metalness}
            />
        </mesh>
    );
}

/* ── Board ────────────────────────────────────────────────── */
function Board({
    lastMove,
    isCheck,
    activeColor,
    fen,
    landedSquare,
}: {
    lastMove?: { from: string; to: string };
    isCheck?: boolean;
    activeColor?: "white" | "black";
    fen?: string;
    landedSquare?: string;
}) {
    const borderRef = useRef<THREE.Mesh>(null);
    const boardGroupRef = useRef<THREE.Group>(null);

    // Find king position for check/threat highlighting
    const kingSquare = useMemo(() => {
        if (!isCheck || !fen) return null;
        const [board] = fen.split(" ");
        const rows = board.split("/");
        const kingChar = activeColor === "white" ? "K" : "k";
        for (let r = 0; r < 8; r++) {
            let c = 0;
            for (let i = 0; i < rows[r].length; i++) {
                const ch = rows[r][i];
                if (!isNaN(parseInt(ch))) { c += parseInt(ch); }
                else {
                    if (ch === kingChar) return [r, c] as [number, number];
                    c++;
                }
            }
        }
        return null;
    }, [isCheck, fen, activeColor]);

    const lastMoveRC = useMemo(() => {
        if (!lastMove) return null;
        return { from: algebraicToRC(lastMove.from), to: algebraicToRC(lastMove.to) };
    }, [lastMove]);

    const squares = useMemo(() => {
        const result: { pos: [number, number, number]; isLight: boolean; row: number; col: number }[] = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const x = (col - 3.5) * 0.5;
                const z = (row - 3.5) * 0.5;
                result.push({ pos: [x, 0, z], isLight: (row + col) % 2 === 0, row, col });
            }
        }
        return result;
    }, []);

    // Check border pulse at 2.5Hz
    useFrame(({ clock }) => {
        if (borderRef.current) {
            const mat = borderRef.current.material as THREE.MeshStandardMaterial;
            if (isCheck) {
                mat.emissive.set(CHESS.checkRed);
                mat.emissiveIntensity = 0.4 + Math.sin(clock.elapsedTime * 2.5 * Math.PI * 2) * 0.3;
            } else {
                mat.emissive.set(CHESS.border.emissive);
                mat.emissiveIntensity = CHESS.border.emissiveIntensity;
            }
        }
    });

    // Board vibration trigger: scale pulse 1.0→1.02→1.0
    const triggerVibrate = () => {
        if (boardGroupRef.current) {
            boardGroupRef.current.scale.set(1.02, 1.02, 1.02);
        }
    };

    // Trigger whole-board vibration when a piece lands
    useEffect(() => {
        if (landedSquare) triggerVibrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [landedSquare]);

    // Compute landed RC for per-tile pulse
    const landRC = useMemo(() => {
        if (!landedSquare) return null;
        return algebraicToRC(landedSquare);
    }, [landedSquare]);

    useFrame(() => {
        if (boardGroupRef.current) {
            const s = boardGroupRef.current.scale;
            if (s.x > 1.001) s.lerp(new THREE.Vector3(1, 1, 1), 0.15);
        }
    });

    return (
        <group ref={boardGroupRef}>
            {/* Board border — spec material */}
            <mesh ref={borderRef} position={[0, -0.08, 0]} receiveShadow castShadow>
                <boxGeometry args={[4.4, 0.16, 4.4]} />
                <meshStandardMaterial
                    color={CHESS.border.color}
                    emissive={CHESS.border.emissive}
                    emissiveIntensity={CHESS.border.emissiveIntensity}
                    roughness={CHESS.border.roughness}
                    metalness={CHESS.border.metalness}
                />
            </mesh>
            {/* Squares — obsidian + dark teal per spec */}
            {squares.map((sq, i) => {
                const isLastFrom = !!(lastMoveRC && sq.row === lastMoveRC.from[0] && sq.col === lastMoveRC.from[1]);
                const isLastTo   = !!(lastMoveRC && sq.row === lastMoveRC.to[0] && sq.col === lastMoveRC.to[1]);
                const isThreat   = !!(isCheck && kingSquare && sq.row === kingSquare[0] && sq.col === kingSquare[1]);
                const isLandPulse = !!(landRC && sq.row === landRC[0] && sq.col === landRC[1]);
                const base = sq.isLight ? CHESS.lightSquare : CHESS.darkSquare;
                return (
                    <BoardSquare
                        key={i}
                        position={sq.pos}
                        base={base}
                        isLastFrom={isLastFrom}
                        isLastTo={isLastTo}
                        isThreat={isThreat}
                        isLandPulse={isLandPulse}
                    />
                );
            })}
            {/* File labels */}
            {["a", "b", "c", "d", "e", "f", "g", "h"].map((l, i) => (
                <Text key={`f${i}`} position={[(i - 3.5) * 0.5, 0.01, 2.3]} rotation={[-Math.PI / 2, 0, 0]}
                    fontSize={0.08} color={COLORS.textMuted} anchorX="center" anchorY="middle">{l}</Text>
            ))}
            {/* Rank labels */}
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <Text key={`r${n}`} position={[-2.3, 0.01, ((n - 1) - 3.5) * -0.5]} rotation={[-Math.PI / 2, 0, 0]}
                    fontSize={0.08} color={COLORS.textMuted} anchorX="center" anchorY="middle">{n.toString()}</Text>
            ))}
        </group>
    );
}

/* ── Reflective Floor ────────────────────────────────────── */
function ReflectiveFloor() {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.17, 0]} receiveShadow>
            <planeGeometry args={[30, 30]} />
            <MeshReflectorMaterial
                mirror={0.2}
                blur={[300, 100]}
                resolution={512}
                mixBlur={1}
                mixStrength={0.5}
                color={COLORS.ink}
                metalness={0.8}
                roughness={0.6}
            />
        </mesh>
    );
}

function seededUnit(seed: number) {
    const value = Math.sin(seed * 12.9898) * 43758.5453;
    return value - Math.floor(value);
}

/* ── Neon Ambient Particles ──────────────────────────────── */
function AmbientDust() {
    const ref = useRef<THREE.Points>(null);
    const count = 150;

    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (seededUnit(i * 3 + 1) - 0.5) * 10;
            pos[i * 3 + 1] = seededUnit(i * 3 + 2) * 5;
            pos[i * 3 + 2] = (seededUnit(i * 3 + 3) - 0.5) * 10;
        }
        return pos;
    }, []);

    useFrame((_, delta) => {
        if (ref.current) {
            ref.current.rotation.y += delta * 0.008;
            const arr = ref.current.geometry.attributes.position.array as Float32Array;
            for (let i = 0; i < count; i++) {
                arr[i * 3 + 1] += delta * 0.015;
                if (arr[i * 3 + 1] > 5) arr[i * 3 + 1] = 0;
            }
            ref.current.geometry.attributes.position.needsUpdate = true;
        }
    });

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial
                size={0.02}
                color={COLORS.tealLight}
                transparent
                opacity={0.4}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    );
}

/* ── Torch Lights (spec: 4 corners, flicker 0.6Hz ±20%) ── */
function TorchLights({ isCheck, checkKingWorldPos }: { isCheck?: boolean; checkKingWorldPos?: [number, number] }) {
    const torches = useRef<(THREE.PointLight | null)[]>([]);
    const checkLightRef = useRef<THREE.PointLight>(null);
    const checkFlashTime = useRef(0);
    const corners: [number, number, number][] = [[-2.8, 2.5, -2.8], [2.8, 2.5, -2.8], [-2.8, 2.5, 2.8], [2.8, 2.5, 2.8]];

    useFrame(({ clock }) => {
        const t = clock.elapsedTime;
        torches.current.forEach((light, i) => {
            if (light) {
                light.intensity = 1.8 + Math.sin(t * 0.6 * Math.PI * 2 + i * 1.5) * 0.36;
            }
        });
        if (checkLightRef.current) {
            if (isCheck) {
                // Brief red flash: ramp up then decay
                checkFlashTime.current += 0.016;
                const flash = Math.max(0, 3 * Math.exp(-checkFlashTime.current * 2));
                checkLightRef.current.intensity = flash;
            } else {
                checkLightRef.current.intensity = 0;
                checkFlashTime.current = 0;
            }
        }
    });

    return (
        <>
            {corners.map((pos, i) => (
                <pointLight
                    key={i}
                    ref={(el) => { torches.current[i] = el; }}
                    position={pos}
                    color={CHESS.torch}
                    intensity={1.8}
                    decay={2}
                    distance={60}
                    castShadow
                />
            ))}
            {/* Board accent spotlight from above */}
            <spotLight position={[0, 6, 0]} color={CHESS.boardAccent} intensity={2.0} angle={0.4} penumbra={0.5} castShadow />
            {/* Gothic arch ambient */}
            <ambientLight color={CHESS.gothicAmbient} intensity={0.4} />
            {/* Check red light above king */}
            <pointLight
                ref={checkLightRef}
                position={checkKingWorldPos ? [checkKingWorldPos[0], 2, checkKingWorldPos[1]] : [0, 2, 0]}
                color={CHESS.checkRed}
                intensity={0}
                distance={4}
                decay={2}
            />
        </>
    );
}

/* ── Evaluation Bar (left edge, centipawn display) ────────── */
function EvalBar({ centipawnEval = 0 }: { centipawnEval?: number }) {
    const fillRef = useRef<THREE.Mesh>(null);
    const targetFill = useRef(0.5);
    const barHeight = 3.5;

    useFrame(() => {
        const clamped = Math.max(-1000, Math.min(1000, centipawnEval));
        const fill = 0.5 + (clamped / 2000);
        targetFill.current += (fill - targetFill.current) * 0.04;
        if (fillRef.current) {
            const f = targetFill.current;
            fillRef.current.scale.y = Math.max(0.001, f);
            fillRef.current.position.y = (f * barHeight) / 2;
        }
    });

    const displayEval = centipawnEval / 100;
    const evalText = displayEval >= 0 ? `+${displayEval.toFixed(1)}` : displayEval.toFixed(1);

    return (
        <group position={[-2.55, 0, 0]}>
            {/* Background (ember — black advantage side) */}
            <mesh position={[0, barHeight / 2, 0]}>
                <boxGeometry args={[0.12, barHeight, 0.12]} />
                <meshStandardMaterial color={CHESS.evalEmber} emissive={CHESS.evalEmber} emissiveIntensity={0.15} />
            </mesh>
            {/* White advantage fill (acid green) — grows from bottom */}
            <mesh ref={fillRef} position={[0, barHeight / 4, 0]}>
                <boxGeometry args={[0.13, barHeight, 0.13]} />
                <meshStandardMaterial color={CHESS.evalGreen} emissive={CHESS.evalGreen} emissiveIntensity={0.3} />
            </mesh>
            {/* Numeric value label */}
            <Text position={[0, barHeight + 0.2, 0]} fontSize={0.1}
                color={centipawnEval >= 0 ? CHESS.evalGreen : CHESS.evalEmber}
                anchorX="center" anchorY="middle">{evalText}</Text>
        </group>
    );
}

/* ── Move Notation Panel (right edge, last 10 half-moves) ── */
function MoveNotationPanel({ moveHistory = [] }: { moveHistory?: string[] }) {
    const recentMoves = moveHistory.slice(-10);
    const startIdx = Math.max(0, moveHistory.length - 10);

    return (
        <group position={[2.8, 1.5, 0]}>
            {recentMoves.map((move, i) => {
                const moveNum = Math.floor((startIdx + i) / 2) + 1;
                const isWhite = (startIdx + i) % 2 === 0;
                const isLast = i === recentMoves.length - 1;
                const isCapture = move.includes('x');
                const label = isWhite ? `${moveNum}. ${move}` : `   ${move}`;
                return (
                    <Text
                        key={`${startIdx + i}-${move}`}
                        position={[0, -i * 0.18, 0]}
                        fontSize={0.09}
                        color={isLast ? COLORS.gold : isCapture ? CHESS.evalEmber : COLORS.textMuted}
                        anchorX="left"
                        anchorY="middle"
                    >
                        {label}
                    </Text>
                );
            })}
        </group>
    );
}

/* ── Capture Particles (24 particles, 800ms burst) ────────── */
function CaptureParticles({ active, position }: { active: boolean; position: [number, number, number] }) {
    const ref = useRef<THREE.Points>(null);
    const startTime = useRef(0);
    const count = 24;

    const { positions: particlePositions, velocities } = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const vel = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = 0; pos[i * 3 + 1] = 0; pos[i * 3 + 2] = 0;
            const angle = (i / count) * Math.PI * 2;
            const speed = 0.5 + seededUnit(i * 7) * 1.5;
            vel[i * 3] = Math.cos(angle) * speed;
            vel[i * 3 + 1] = 1.0 + seededUnit(i * 13) * 2.0;
            vel[i * 3 + 2] = Math.sin(angle) * speed;
        }
        return { positions: pos, velocities: vel };
    }, []);

    useEffect(() => {
        if (active) startTime.current = Date.now();
    }, [active]);

    useFrame(() => {
        if (!ref.current || !active) {
            if (ref.current) ref.current.visible = false;
            return;
        }
        ref.current.visible = true;
        const elapsed = (Date.now() - startTime.current) / 1000;
        if (elapsed > 0.8) { ref.current.visible = false; return; }
        const arr = ref.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < count; i++) {
            arr[i * 3] = velocities[i * 3] * elapsed;
            arr[i * 3 + 1] = velocities[i * 3 + 1] * elapsed - 2.0 * elapsed * elapsed;
            arr[i * 3 + 2] = velocities[i * 3 + 2] * elapsed;
        }
        ref.current.geometry.attributes.position.needsUpdate = true;
    });

    if (!active) return null;

    return (
        <points ref={ref} position={position}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[particlePositions, 3]} />
            </bufferGeometry>
            <pointsMaterial
                size={0.04}
                color={COLORS.gold}
                transparent
                opacity={0.8}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    );
}

/* ── FEN Parser ────────────────────────────────────────────── */
function parseFEN(fen: string): { pos: [number, number, number]; color: "white" | "black"; type: string; id: string }[] {
    const pieces: { pos: [number, number, number]; color: "white" | "black"; type: string; id: string }[] = [];
    if (!fen) return pieces;

    const [board] = fen.split(" ");
    const rows = board.split("/");

    const typeMap: Record<string, string> = {
        'r': 'rook', 'n': 'knight', 'b': 'bishop', 'q': 'queen', 'k': 'king', 'p': 'pawn'
    };

    for (let r = 0; r < 8; r++) {
        let c = 0;
        const rowString = rows[r];
        for (let i = 0; i < rowString.length; i++) {
            const char = rowString[i];
            if (!isNaN(parseInt(char))) {
                c += parseInt(char);
            } else {
                const color = char === char.toLowerCase() ? "black" : "white";
                const type = typeMap[char.toLowerCase()];
                const x = (c - 3.5) * 0.5;
                const z = ((7 - r) - 3.5) * -0.5;
                pieces.push({ pos: [x, 0.02, z], color, type, id: `${type}_${color}_${r}_${c}` });
                c += 1;
            }
        }
    }
    return pieces;
}

/* ── Scene ────────────────────────────────────────────────── */
function ChessScene({
    activeColor = "white",
    fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    camMode = "cinematic",
    lastMove,
    isCheck = false,
    isCheckmate = false,
    centipawnEval = 0,
    moveHistory = [],
}: {
    activeColor?: "white" | "black";
    fen?: string;
    camMode?: "cinematic" | "tactical" | "free";
    lastMove?: { from: string; to: string; notation: string };
    isCheck?: boolean;
    isCheckmate?: boolean;
    centipawnEval?: number;
    moveHistory?: string[];
}) {
    const currentPieces = useMemo(() => parseFEN(fen), [fen]);
    const [capturePos, setCapturePos] = useState<[number, number, number] | null>(null);
    const [captureActive, setCaptureActive] = useState(false);
    const [landedSquare, setLandedSquare] = useState<string | undefined>();
    const prevEvalRef = useRef(centipawnEval);

    // Compute dynamic camera mode
    const dynamicCamMode = useMemo<DynamicCameraMode>(() => {
        if (isCheckmate) return 'checkmate';
        if (isCheck) return 'check';
        const evalDelta = Math.abs(centipawnEval - prevEvalRef.current);
        if (evalDelta > 200) return 'tension';
        if (lastMove?.notation?.includes('x')) return 'sacrifice';
        return null;
    }, [isCheckmate, isCheck, centipawnEval, lastMove]);

    useEffect(() => { prevEvalRef.current = centipawnEval; }, [centipawnEval]);

    // Capture particle trigger
    useEffect(() => {
        if (lastMove?.notation?.includes('x')) {
            const [wx, wz] = algebraicToWorld(lastMove.to);
            setCapturePos([wx, 0.2, wz]);
            setCaptureActive(true);
            const timer = setTimeout(() => setCaptureActive(false), 800);
            return () => clearTimeout(timer);
        }
    }, [lastMove]);

    // Checked king world position for camera + check light
    const checkKingWorldPos = useMemo<[number, number] | undefined>(() => {
        if (!isCheck || !fen) return undefined;
        const [board] = fen.split(" ");
        const rows = board.split("/");
        const kingChar = activeColor === "white" ? "K" : "k";
        for (let r = 0; r < 8; r++) {
            let c = 0;
            for (let i = 0; i < rows[r].length; i++) {
                const ch = rows[r][i];
                if (!isNaN(parseInt(ch))) { c += parseInt(ch); }
                else {
                    if (ch === kingChar) {
                        return [(c - 3.5) * 0.5, ((7 - r) - 3.5) * -0.5];
                    }
                    c++;
                }
            }
        }
        return undefined;
    }, [isCheck, fen, activeColor]);

    // Determine which piece should animate from lastMove.from → lastMove.to
    const animateInfo = useMemo(() => {
        if (!lastMove) return null;
        const [fx, fz] = algebraicToWorld(lastMove.from);
        const [tx, tz] = algebraicToWorld(lastMove.to);
        return { from: [fx, 0.02, fz] as [number, number, number], toX: tx, toZ: tz };
    }, [lastMove]);

    return (
        <>
            {/* Lighting rig — spec torch lights + accents */}
            <TorchLights isCheck={isCheck} checkKingWorldPos={checkKingWorldPos} />

            {/* Gothic architecture */}
            <GothicArches />

            {/* Board with spec materials */}
            <Board lastMove={lastMove} isCheck={isCheck} activeColor={activeColor} fen={fen} landedSquare={landedSquare} />
            <ReflectiveFloor />
            <AmbientDust />

            {/* Evaluation Bar */}
            <EvalBar centipawnEval={centipawnEval} />

            {/* Move Notation Panel */}
            <MoveNotationPanel moveHistory={moveHistory} />

            {/* Capture Particles */}
            {capturePos && <CaptureParticles active={captureActive} position={capturePos} />}

            {/* Pieces */}
            {currentPieces.map((piece) => {
                const isAnimTarget = animateInfo
                    && Math.abs(piece.pos[0] - animateInfo.toX) < 0.01
                    && Math.abs(piece.pos[2] - animateInfo.toZ) < 0.01;
                return (
                    <ChessPiece
                        key={piece.id}
                        position={piece.pos}
                        color={piece.color}
                        type={piece.type}
                        isActive={piece.color === activeColor && piece.type === "king"}
                        animateFrom={isAnimTarget ? animateInfo!.from : undefined}
                        onLanded={isAnimTarget ? () => {
                            setLandedSquare(lastMove!.to);
                            // Clear after pulse duration so re-triggering is possible
                            setTimeout(() => setLandedSquare(undefined), 200);
                        } : undefined}
                    />
                );
            })}

            {/* Camera */}
            <CameraController
                mode={camMode}
                dynamicMode={dynamicCamMode}
                checkKingPos={checkKingWorldPos}
                captureSquare={capturePos ? [capturePos[0], capturePos[2]] : undefined}
            />
        </>
    );
}

/* ── Exported Component ──────────────────────────────────── */
export interface ChessBoard3DProps {
    agentWhite?: string;
    agentBlack?: string;
    activeColor?: "white" | "black";
    fen?: string;
    lastMove?: { from: string; to: string; notation: string };
    isCheck?: boolean;
    isCheckmate?: boolean;
    centipawnEval?: number;
    moveHistory?: string[];
    capturedPieces?: string[];
}

export default function ChessBoard3D({
    agentWhite = "ZEUS",
    agentBlack = "ATHENA",
    activeColor = "white",
    fen,
    lastMove,
    isCheck = false,
    isCheckmate = false,
    centipawnEval = 0,
    moveHistory = [],
    capturedPieces = [],
}: ChessBoard3DProps) {
    const [camMode, setCamMode] = useState<"cinematic" | "tactical" | "free">("cinematic");

    const modes = [
        { key: "cinematic" as const, label: "CIN", title: "Cinematic" },
        { key: "tactical" as const, label: "TAC", title: "Top-Down" },
        { key: "free" as const, label: "FREE", title: "Free Roam" },
    ];

    return (
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
            {/* Camera mode switcher */}
            <div style={{
                position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
                zIndex: 50, display: "flex", gap: 2,
                background: `${COLORS.surface}cc`, backdropFilter: "blur(16px)",
                borderRadius: 12, padding: 3,
                border: `1px solid ${COLORS.border}`,
            }}>
                {modes.map(m => (
                    <button
                        key={m.key}
                        onClick={() => setCamMode(m.key)}
                        title={m.title}
                        style={{
                            width: 42, height: 32, borderRadius: 9,
                            border: "none", cursor: "pointer",
                            fontSize: "0.65rem", fontFamily: "var(--font-mono)",
                            fontWeight: 700, letterSpacing: "0.05em",
                            background: camMode === m.key ? `${COLORS.tealLight}33` : "transparent",
                            color: camMode === m.key ? COLORS.gold : COLORS.textMuted,
                            boxShadow: camMode === m.key ? `inset 0 0 0 1px ${COLORS.tealLight}66` : "none",
                            transition: "all 0.2s",
                        }}
                    >
                        {m.label}
                    </button>
                ))}
            </div>

            <WebGLSafeCanvas
                shadows
                camera={{ position: [0, 3.5, 5.5], fov: 42 }}
                style={{ width: "100%", height: "100%" }}
                gl={{ antialias: true }}
            >
                <color attach="background" args={[COLORS.ink]} />
                <fog attach="fog" args={[COLORS.ink, 8, 20]} />
                <ChessScene
                    activeColor={activeColor}
                    fen={fen}
                    camMode={camMode}
                    lastMove={lastMove}
                    isCheck={isCheck}
                    isCheckmate={isCheckmate}
                    centipawnEval={centipawnEval}
                    moveHistory={moveHistory}
                />
            </WebGLSafeCanvas>
        </div>
    );
}
