"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text, MeshReflectorMaterial } from "@react-three/drei";
import * as THREE from "three";
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

/* ── Refined Chess Piece Shapes ─────────────────────────── */
function Pawn({ color, isActive }: { color: "white" | "black"; isActive: boolean }) {
    const mat = color === "white" ? "#E8DCC8" : "#1A1A2E";
    const emissive = isActive ? (color === "white" ? "#7B5CFA" : "#00D4FF") : "#000000";
    return (
        <group>
            {/* Base disk */}
            <mesh position={[0, 0.03, 0]} castShadow>
                <cylinderGeometry args={[0.16, 0.18, 0.06, 24]} />
                <meshStandardMaterial color={mat} metalness={0.5} roughness={0.3} />
            </mesh>
            {/* Body - tapered column */}
            <mesh position={[0, 0.22, 0]} castShadow>
                <cylinderGeometry args={[0.06, 0.13, 0.32, 16]} />
                <meshStandardMaterial color={mat} metalness={0.5} roughness={0.3} emissive={emissive} emissiveIntensity={0.3} />
            </mesh>
            {/* Head sphere */}
            <mesh position={[0, 0.42, 0]} castShadow>
                <sphereGeometry args={[0.08, 24, 24]} />
                <meshStandardMaterial color={mat} metalness={0.6} roughness={0.2} emissive={emissive} emissiveIntensity={0.5} />
            </mesh>
        </group>
    );
}

function Rook({ color, isActive }: { color: "white" | "black"; isActive: boolean }) {
    const mat = color === "white" ? "#E8DCC8" : "#1A1A2E";
    const emissive = isActive ? (color === "white" ? "#7B5CFA" : "#00D4FF") : "#000000";
    return (
        <group>
            <mesh position={[0, 0.03, 0]} castShadow>
                <cylinderGeometry args={[0.17, 0.19, 0.06, 24]} />
                <meshStandardMaterial color={mat} metalness={0.5} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.25, 0]} castShadow>
                <cylinderGeometry args={[0.1, 0.15, 0.38, 16]} />
                <meshStandardMaterial color={mat} metalness={0.5} roughness={0.3} emissive={emissive} emissiveIntensity={0.3} />
            </mesh>
            {/* Crenellated top */}
            <mesh position={[0, 0.46, 0]} castShadow>
                <cylinderGeometry args={[0.13, 0.1, 0.06, 4]} />
                <meshStandardMaterial color={mat} metalness={0.6} roughness={0.2} emissive={emissive} emissiveIntensity={0.4} />
            </mesh>
        </group>
    );
}

function Knight({ color, isActive }: { color: "white" | "black"; isActive: boolean }) {
    const mat = color === "white" ? "#E8DCC8" : "#1A1A2E";
    const emissive = isActive ? (color === "white" ? "#7B5CFA" : "#00D4FF") : "#000000";
    return (
        <group>
            <mesh position={[0, 0.03, 0]} castShadow>
                <cylinderGeometry args={[0.16, 0.18, 0.06, 24]} />
                <meshStandardMaterial color={mat} metalness={0.5} roughness={0.3} />
            </mesh>
            {/* Body column */}
            <mesh position={[0, 0.22, 0]} castShadow>
                <cylinderGeometry args={[0.07, 0.14, 0.32, 16]} />
                <meshStandardMaterial color={mat} metalness={0.5} roughness={0.3} emissive={emissive} emissiveIntensity={0.3} />
            </mesh>
            {/* Horse head - angled box + sphere */}
            <mesh position={[0, 0.44, 0.04]} rotation={[0.3, 0, 0]} castShadow>
                <boxGeometry args={[0.1, 0.16, 0.14]} />
                <meshStandardMaterial color={mat} metalness={0.6} roughness={0.2} emissive={emissive} emissiveIntensity={0.5} />
            </mesh>
            <mesh position={[0, 0.5, 0.08]} castShadow>
                <sphereGeometry args={[0.05, 16, 16]} />
                <meshStandardMaterial color={mat} metalness={0.7} roughness={0.2} emissive={emissive} emissiveIntensity={0.5} />
            </mesh>
        </group>
    );
}

function Bishop({ color, isActive }: { color: "white" | "black"; isActive: boolean }) {
    const mat = color === "white" ? "#E8DCC8" : "#1A1A2E";
    const emissive = isActive ? (color === "white" ? "#7B5CFA" : "#00D4FF") : "#000000";
    return (
        <group>
            <mesh position={[0, 0.03, 0]} castShadow>
                <cylinderGeometry args={[0.16, 0.18, 0.06, 24]} />
                <meshStandardMaterial color={mat} metalness={0.5} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.28, 0]} castShadow>
                <cylinderGeometry args={[0.06, 0.14, 0.44, 16]} />
                <meshStandardMaterial color={mat} metalness={0.5} roughness={0.3} emissive={emissive} emissiveIntensity={0.3} />
            </mesh>
            {/* Mitre tip */}
            <mesh position={[0, 0.54, 0]} castShadow>
                <coneGeometry args={[0.06, 0.12, 16]} />
                <meshStandardMaterial color={mat} metalness={0.7} roughness={0.2} emissive={emissive} emissiveIntensity={0.6} />
            </mesh>
            <mesh position={[0, 0.62, 0]} castShadow>
                <sphereGeometry args={[0.03, 16, 16]} />
                <meshStandardMaterial color={mat} metalness={0.8} roughness={0.15} emissive={emissive} emissiveIntensity={0.7} />
            </mesh>
        </group>
    );
}

function Queen({ color, isActive }: { color: "white" | "black"; isActive: boolean }) {
    const mat = color === "white" ? "#E8DCC8" : "#1A1A2E";
    const emissive = isActive ? (color === "white" ? "#7B5CFA" : "#00D4FF") : "#000000";
    return (
        <group>
            <mesh position={[0, 0.03, 0]} castShadow>
                <cylinderGeometry args={[0.17, 0.19, 0.06, 24]} />
                <meshStandardMaterial color={mat} metalness={0.5} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.32, 0]} castShadow>
                <cylinderGeometry args={[0.06, 0.15, 0.52, 16]} />
                <meshStandardMaterial color={mat} metalness={0.5} roughness={0.3} emissive={emissive} emissiveIntensity={0.3} />
            </mesh>
            {/* Crown ring */}
            <mesh position={[0, 0.58, 0]} castShadow>
                <torusGeometry args={[0.07, 0.02, 8, 24]} />
                <meshStandardMaterial color={mat} metalness={0.8} roughness={0.15} emissive={emissive} emissiveIntensity={0.7} />
            </mesh>
            {/* Crown ball */}
            <mesh position={[0, 0.64, 0]} castShadow>
                <sphereGeometry args={[0.04, 24, 24]} />
                <meshStandardMaterial color={mat} metalness={0.8} roughness={0.1} emissive={emissive} emissiveIntensity={0.8} />
            </mesh>
        </group>
    );
}

function King({ color, isActive }: { color: "white" | "black"; isActive: boolean }) {
    const mat = color === "white" ? "#E8DCC8" : "#1A1A2E";
    const emissive = isActive ? (color === "white" ? "#7B5CFA" : "#00D4FF") : "#000000";
    return (
        <group>
            <mesh position={[0, 0.03, 0]} castShadow>
                <cylinderGeometry args={[0.18, 0.2, 0.06, 24]} />
                <meshStandardMaterial color={mat} metalness={0.5} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.34, 0]} castShadow>
                <cylinderGeometry args={[0.07, 0.16, 0.56, 16]} />
                <meshStandardMaterial color={mat} metalness={0.5} roughness={0.3} emissive={emissive} emissiveIntensity={0.3} />
            </mesh>
            {/* Crown platform */}
            <mesh position={[0, 0.62, 0]} castShadow>
                <cylinderGeometry args={[0.09, 0.07, 0.04, 24]} />
                <meshStandardMaterial color={mat} metalness={0.7} roughness={0.2} emissive={emissive} emissiveIntensity={0.5} />
            </mesh>
            {/* Cross — vertical */}
            <mesh position={[0, 0.72, 0]} castShadow>
                <boxGeometry args={[0.02, 0.12, 0.02]} />
                <meshStandardMaterial color={mat} metalness={0.8} roughness={0.15} emissive={emissive} emissiveIntensity={0.8} />
            </mesh>
            {/* Cross — horizontal */}
            <mesh position={[0, 0.72, 0]} castShadow>
                <boxGeometry args={[0.08, 0.02, 0.02]} />
                <meshStandardMaterial color={mat} metalness={0.8} roughness={0.15} emissive={emissive} emissiveIntensity={0.8} />
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
                <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.18, 0.24, 32]} />
                    <meshBasicMaterial
                        color={color === "white" ? "#7B5CFA" : "#00D4FF"}
                        transparent opacity={0.5}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            )}
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
            {/* Board base — dark wood with chamfered edges */}
            <mesh position={[0, -0.08, 0]} receiveShadow castShadow>
                <boxGeometry args={[4.4, 0.16, 4.4]} />
                <meshStandardMaterial color="#0E0E1A" metalness={0.6} roughness={0.4} />
            </mesh>
            {/* Edge accent strip */}
            <mesh position={[0, -0.005, 0]} receiveShadow>
                <boxGeometry args={[4.2, 0.01, 4.2]} />
                <meshStandardMaterial color="#7B5CFA" emissive="#7B5CFA" emissiveIntensity={0.15} metalness={0.9} roughness={0.1} transparent opacity={0.4} />
            </mesh>
            {/* Squares */}
            {squares.map((sq, i) => (
                <mesh key={i} position={sq.pos} receiveShadow>
                    <boxGeometry args={[0.49, 0.02, 0.49]} />
                    <meshStandardMaterial
                        color={sq.isLight ? "#2A2A40" : "#111120"}
                        metalness={sq.isLight ? 0.3 : 0.5}
                        roughness={sq.isLight ? 0.7 : 0.6}
                    />
                </mesh>
            ))}
            {/* File/Rank labels */}
            {["a", "b", "c", "d", "e", "f", "g", "h"].map((l, i) => (
                <Text key={`f${i}`} position={[(i - 3.5) * 0.5, 0.01, 2.3]} rotation={[-Math.PI / 2, 0, 0]}
                    fontSize={0.08} color="rgba(255,255,255,0.15)" anchorX="center" anchorY="middle">{l}</Text>
            ))}
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <Text key={`r${n}`} position={[-2.3, 0.01, ((n - 1) - 3.5) * -0.5]} rotation={[-Math.PI / 2, 0, 0]}
                    fontSize={0.08} color="rgba(255,255,255,0.15)" anchorX="center" anchorY="middle">{n.toString()}</Text>
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
                mirror={0.15}
                blur={[300, 100]}
                resolution={512}
                mixBlur={1}
                mixStrength={0.4}
                color="#040408"
                metalness={0.8}
                roughness={0.7}
            />
        </mesh>
    );
}

function seededUnit(seed: number) {
    const value = Math.sin(seed * 12.9898) * 43758.5453;
    return value - Math.floor(value);
}

/* ── Subtle Ambient Particles ────────────────────────────── */
function AmbientDust() {
    const ref = useRef<THREE.Points>(null);
    const count = 120;

    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (seededUnit(i * 3 + 1) - 0.5) * 8;
            pos[i * 3 + 1] = seededUnit(i * 3 + 2) * 4;
            pos[i * 3 + 2] = (seededUnit(i * 3 + 3) - 0.5) * 8;
        }
        return pos;
    }, []);

    useFrame((_, delta) => {
        if (ref.current) {
            ref.current.rotation.y += delta * 0.01;
            const arr = ref.current.geometry.attributes.position.array as Float32Array;
            for (let i = 0; i < count; i++) {
                arr[i * 3 + 1] += delta * 0.02;
                if (arr[i * 3 + 1] > 4) arr[i * 3 + 1] = 0;
            }
            ref.current.geometry.attributes.position.needsUpdate = true;
        }
    });

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial size={0.015} color="#7B5CFA" transparent opacity={0.2} sizeAttenuation />
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
            {/* Lighting rig */}
            <ambientLight intensity={0.1} color="#0C0C28" />
            <directionalLight
                position={[4, 8, 3]}
                intensity={1.2}
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-bias={-0.0001}
                color="#FFFAF0"
            />
            {/* Accent rim lights */}
            <pointLight position={[-5, 3, -5]} intensity={0.6} color="#7B5CFA" distance={12} decay={2} />
            <pointLight position={[5, 3, 5]} intensity={0.6} color="#00D4FF" distance={12} decay={2} />
            {/* Soft fill from below */}
            <pointLight position={[0, -1, 0]} intensity={0.1} color="#7B5CFA" distance={5} />

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
        { key: "cinematic" as const, label: "🎬", title: "Cinematic" },
        { key: "tactical" as const, label: "📐", title: "Top-Down" },
        { key: "free" as const, label: "🖱", title: "Free Roam" },
    ];

    return (
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
            {/* Minimal camera mode switcher */}
            <div style={{
                position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
                zIndex: 50, display: "flex", gap: 2,
                background: "rgba(10,10,20,0.8)", backdropFilter: "blur(16px)",
                borderRadius: 12, padding: 3,
                border: "1px solid rgba(255,255,255,0.06)",
            }}>
                {modes.map(m => (
                    <button
                        key={m.key}
                        onClick={() => setCamMode(m.key)}
                        title={m.title}
                        style={{
                            width: 36, height: 32, borderRadius: 9,
                            border: "none", cursor: "pointer",
                            fontSize: "0.8rem",
                            background: camMode === m.key ? "rgba(123,92,250,0.2)" : "transparent",
                            color: camMode === m.key ? "#fff" : "rgba(255,255,255,0.35)",
                            boxShadow: camMode === m.key ? "inset 0 0 0 1px rgba(123,92,250,0.4)" : "none",
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
                <color attach="background" args={["#030308"]} />
                <fog attach="fog" args={["#030308", 8, 18]} />
                <ChessScene activeColor={activeColor} fen={fen} camMode={camMode} />
            </WebGLSafeCanvas>
        </div>
    );
}
