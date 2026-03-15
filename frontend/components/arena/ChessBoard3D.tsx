"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text, MeshReflectorMaterial, Float } from "@react-three/drei";
import * as THREE from "three";
import { COLORS } from "@/lib/theme";
import { WebGLSafeCanvas } from "../world/WebGLErrorBoundary";

/* ── Camera Controller ───────────────────────────────────── */
function CameraController({ mode }: { mode: "cinematic" | "tactical" | "free" }) {
    const { camera } = useThree();

    useFrame(() => {
        if (mode === "tactical") {
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
            autoRotate={mode === "cinematic"}
            autoRotateSpeed={0.3}
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
}: {
    position: [number, number, number];
    color: "white" | "black";
    type: string;
    isActive?: boolean;
}) {
    const ref = useRef<THREE.Group>(null);
    const Comp = PIECE_COMPONENTS[type] || Pawn;
    const accent = color === "white" ? COLORS.gold : COLORS.redBright;

    useFrame(() => {
        if (ref.current && isActive) {
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

/* ── Board ────────────────────────────────────────────────── */
function Board() {
    const squares = useMemo(() => {
        const result: { pos: [number, number, number]; isLight: boolean }[] = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const x = (col - 3.5) * 0.5;
                const z = (row - 3.5) * 0.5;
                result.push({ pos: [x, 0, z], isLight: (row + col) % 2 === 0 });
            }
        }
        return result;
    }, []);

    return (
        <group>
            {/* Board base — dark obsidian */}
            <mesh position={[0, -0.08, 0]} receiveShadow castShadow>
                <boxGeometry args={[4.4, 0.16, 4.4]} />
                <meshStandardMaterial color={COLORS.ink} metalness={0.7} roughness={0.3} />
            </mesh>
            {/* Edge accent strip — neon purple */}
            <mesh position={[0, -0.005, 0]} receiveShadow>
                <boxGeometry args={[4.2, 0.01, 4.2]} />
                <meshStandardMaterial color={COLORS.tealLight} emissive={COLORS.tealLight} emissiveIntensity={0.3} metalness={0.9} roughness={0.1} transparent opacity={0.5} />
            </mesh>
            {/* Squares — obsidian + dark marble */}
            {squares.map((sq, i) => (
                <mesh key={i} position={sq.pos} receiveShadow>
                    <boxGeometry args={[0.49, 0.02, 0.49]} />
                    <meshStandardMaterial
                        color={sq.isLight ? COLORS.card : COLORS.ink}
                        metalness={sq.isLight ? 0.4 : 0.6}
                        roughness={sq.isLight ? 0.5 : 0.4}
                        emissive={sq.isLight ? COLORS.tealLight : COLORS.ink}
                        emissiveIntensity={sq.isLight ? 0.04 : 0}
                    />
                </mesh>
            ))}
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
}: {
    activeColor?: "white" | "black";
    fen?: string;
    camMode?: "cinematic" | "tactical" | "free";
}) {
    const currentPieces = useMemo(() => parseFEN(fen), [fen]);

    return (
        <>
            {/* Lighting rig — dark neon */}
            <ambientLight intensity={0.08} color={COLORS.surface} />
            <directionalLight
                position={[4, 8, 3]}
                intensity={0.8}
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-bias={-0.0001}
                color="#8866cc"
            />
            {/* Neon accent rim lights */}
            <pointLight position={[-5, 3, -5]} intensity={0.8} color={COLORS.gold} distance={14} decay={2} />
            <pointLight position={[5, 3, 5]} intensity={0.8} color={COLORS.redBright} distance={14} decay={2} />
            {/* Purple overhead */}
            <pointLight position={[0, 6, 0]} intensity={0.5} color={COLORS.tealLight} distance={12} />
            {/* Soft fill from below for reflections */}
            <pointLight position={[0, -1, 0]} intensity={0.05} color={COLORS.gold} distance={4} />

            {/* Gothic architecture */}
            <GothicArches />

            {/* Scene elements */}
            <Board />
            <ReflectiveFloor />
            <AmbientDust />

            {/* Pieces */}
            {currentPieces.map((piece) => (
                <ChessPiece
                    key={piece.id}
                    position={piece.pos}
                    color={piece.color}
                    type={piece.type}
                    isActive={piece.color === activeColor && piece.type === "king"}
                />
            ))}

            {/* Camera */}
            <CameraController mode={camMode} />
        </>
    );
}

/* ── Exported Component ──────────────────────────────────── */
export default function ChessBoard3D({
    agentWhite = "ZEUS",
    agentBlack = "ATHENA",
    activeColor = "white" as "white" | "black",
    fen,
}: {
    agentWhite?: string;
    agentBlack?: string;
    activeColor?: "white" | "black";
    fen?: string;
}) {
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
                <ChessScene activeColor={activeColor} fen={fen} camMode={camMode} />
            </WebGLSafeCanvas>
        </div>
    );
}
