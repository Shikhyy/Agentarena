"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text, Float, Html, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { WebGLSafeCanvas } from "../world/WebGLErrorBoundary";

/* ── Camera Controller ───────────────────────────────────── */
function CameraController({ mode }: { mode: "cinematic" | "tactical" | "free" }) {
    const { camera } = useThree();

    useFrame(() => {
        if (mode === "tactical") {
            camera.position.lerp(new THREE.Vector3(0, 8, 0.1), 0.05);
            camera.lookAt(0, 0, 0);
        }
    });

    return (
        <OrbitControls
            enablePan={mode === "free"}
            enableZoom={true}
            minDistance={2}
            maxDistance={12}
            maxPolarAngle={mode === "tactical" ? Math.PI / 8 : Math.PI / 2.2}
            autoRotate={mode === "cinematic"}
            autoRotateSpeed={0.5}
        />
    );
}

/* ── Interactive Betting Pools ────────────────────────────── */
function BettingPools() {
    const [hoverA, setHoverA] = useState(false);
    const [hoverB, setHoverB] = useState(false);

    return (
        <group>
            {/* Pool A (White Support) */}
            <group position={[-3.5, 0, 1.5]}>
                <mesh
                    onPointerOver={(e) => { e.stopPropagation(); setHoverA(true); document.body.style.cursor = 'pointer'; }}
                    onPointerOut={() => { setHoverA(false); document.body.style.cursor = 'default'; }}
                    onClick={(e) => { e.stopPropagation(); alert("Betting interface triggered for Agent White"); }}
                >
                    <cylinderGeometry args={[0.4, 0.5, 0.2, 16]} />
                    <meshStandardMaterial color="#2d2459" emissive="#8B3FE8" emissiveIntensity={hoverA ? 1.5 : 0.5} metalness={0.8} roughness={0.2} />
                </mesh>
                <mesh position={[0, 0.5, 0]}>
                    <cylinderGeometry args={[0.35, 0.35, 1, 16, 1, true]} />
                    <meshBasicMaterial color="#8B3FE8" transparent opacity={hoverA ? 0.3 : 0.1} side={THREE.DoubleSide} />
                </mesh>
                <Float speed={2} floatIntensity={0.2}>
                    <Text position={[0, 1.5, 0]} fontSize={0.15} color="#8B3FE8" anchorX="center">[LONG_POOL]</Text>
                </Float>
            </group>

            {/* Pool B (Black Support) */}
            <group position={[3.5, 0, -1.5]}>
                <mesh
                    onPointerOver={(e) => { e.stopPropagation(); setHoverB(true); document.body.style.cursor = 'pointer'; }}
                    onPointerOut={() => { setHoverB(false); document.body.style.cursor = 'default'; }}
                    onClick={(e) => { e.stopPropagation(); alert("Betting interface triggered for Agent Black"); }}
                >
                    <cylinderGeometry args={[0.4, 0.5, 0.2, 16]} />
                    <meshStandardMaterial color="#0f0a1a" emissive="#00FFB0" emissiveIntensity={hoverB ? 1.5 : 0.5} metalness={0.8} roughness={0.2} />
                </mesh>
                <mesh position={[0, 0.5, 0]}>
                    <cylinderGeometry args={[0.35, 0.35, 1, 16, 1, true]} />
                    <meshBasicMaterial color="#00FFB0" transparent opacity={hoverB ? 0.3 : 0.1} side={THREE.DoubleSide} />
                </mesh>
                <Float speed={2} floatIntensity={0.2}>
                    <Text position={[0, 1.5, 0]} fontSize={0.15} color="#00FFB0" anchorX="center">[SHORT_POOL]</Text>
                </Float>
            </group>
        </group>
    );
}

/* ── Mind Camera (PiP Reasoning Stream) ──────────────────── */
function MindCamera({ activeColor, agentWhite, agentBlack }: { activeColor: string, agentWhite: string, agentBlack: string }) {
    const [thoughts, setThoughts] = useState<string[]>([
        "Analyzing position...",
        "Evaluating control of e4...",
        "Candidate moves: Nf3, d4, Nc3",
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            setThoughts(prev => {
                const newT = [...prev, `Evaluating depth ${Math.floor(Math.random() * 10 + 10)}... score +${(Math.random() * 2).toFixed(2)}`];
                if (newT.length > 4) return newT.slice(newT.length - 4);
                return newT;
            });
        }, 2000);
        return () => clearInterval(interval);
    }, [activeColor]);

    const isWhite = activeColor === "white";
    const xPos = isWhite ? 2 : -2;
    const zPos = isWhite ? 2.5 : -2.5;
    const color = isWhite ? "#8B3FE8" : "#00FFB0";
    const bgGlow = isWhite ? "rgba(139, 63, 232, 0.15)" : "rgba(0, 255, 176, 0.15)";
    const agentName = isWhite ? agentWhite : agentBlack;

    return (
        <group position={[xPos, 2, zPos]}>
            <Float speed={3} floatIntensity={0.2}>
                {/* 3D Frame */}
                <RoundedBox args={[2.2, 1.6, 0.05]} radius={0.02}>
                    <meshStandardMaterial color="#0A0A14" metalness={0.8} roughness={0.2} emissive={color} emissiveIntensity={0.2} />
                </RoundedBox>
                <mesh position={[0, 0, 0.03]}>
                    <planeGeometry args={[2.1, 1.5]} />
                    <meshBasicMaterial color="#020205" transparent opacity={0.9} />
                </mesh>

                {/* HTML Overlay */}
                <Html position={[0, 0, 0.04]} transform distanceFactor={5} zIndexRange={[100, 0]}>
                    <div
                        className="w-[300px] h-[220px] p-3 box-border flex flex-col font-mono text-xs overflow-hidden"
                        style={{ background: bgGlow, border: `1px solid ${color}`, boxShadow: `0 0 15px ${bgGlow}` }}
                    >
                        <div className="flex justify-between items-center border-b pb-1 mb-2" style={{ borderColor: color, color: color }}>
                            <span className="font-bold tracking-widest">[MIND_CAMERA_LIVE]</span>
                            <span className="animate-pulse">● REC</span>
                        </div>
                        <div className="text-white mb-2 uppercase opacity-80">{agentName} // NEURAL_STREAM</div>
                        <div className="flex-1 flex flex-col gap-1 justify-end">
                            {thoughts.map((t, i) => (
                                <div key={i} className="opacity-80 flex gap-2" style={{ color: i === thoughts.length - 1 ? color : '#a0a0a0' }}>
                                    <span>&gt;</span>
                                    <span className="truncate">{t}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Html>
            </Float>
        </group>
    );
}


/* ── Chess Piece shapes (simplified geometry) ───────────────── */
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
    const meshRef = useRef<THREE.Mesh>(null);
    const pieceColor = color === "white" ? "#e8e0d0" : "#2a1f3d";
    const emissive = color === "white" ? "#8B3FE8" : "#00FFB0";

    useFrame((_, delta) => {
        if (meshRef.current && isActive) {
            meshRef.current.position.y = position[1] + Math.sin(Date.now() * 0.003) * 0.08;
        }
    });

    const height = type === "king" ? 0.7 : type === "queen" ? 0.65 : type === "rook" ? 0.45 : type === "bishop" ? 0.55 : type === "knight" ? 0.5 : 0.3;
    const radius = type === "pawn" ? 0.12 : 0.15;

    return (
        <group position={position}>
            {/* Base */}
            <mesh ref={meshRef} castShadow>
                <cylinderGeometry args={[radius, radius * 1.3, 0.08, 16]} />
                <meshStandardMaterial color={pieceColor} metalness={0.3} roughness={0.6} />
            </mesh>
            {/* Body */}
            <mesh position={[0, height / 2, 0]} castShadow>
                <cylinderGeometry args={[radius * 0.6, radius, height, 16]} />
                <meshStandardMaterial
                    color={pieceColor}
                    metalness={0.3}
                    roughness={0.6}
                    emissive={isActive ? emissive : "#000000"}
                    emissiveIntensity={isActive ? 0.4 : 0}
                />
            </mesh>
            {/* Top */}
            <mesh position={[0, height + 0.05, 0]} castShadow>
                <sphereGeometry args={[radius * 0.5, 32, 32]} />
                <meshStandardMaterial
                    color={pieceColor}
                    metalness={0.7}
                    roughness={0.2}
                    emissive={isActive ? emissive : "#000000"}
                    emissiveIntensity={isActive ? 0.8 : 0}
                />
            </mesh>
            {isActive && (
                <mesh position={[0, 0, 0]}>
                    <cylinderGeometry args={[radius * 1.5, radius * 1.5, 0.05, 32]} />
                    <meshBasicMaterial color={emissive} transparent opacity={0.3} />
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
            {/* Board base */}
            <mesh position={[0, -0.06, 0]} receiveShadow>
                <boxGeometry args={[4.2, 0.12, 4.2]} />
                <meshStandardMaterial color="#141424" metalness={0.4} roughness={0.6} />
            </mesh>
            {/* Board border glass */}
            <mesh position={[0, -0.01, 0]}>
                <boxGeometry args={[4.3, 0.02, 4.3]} />
                <meshPhysicalMaterial
                    color="#ffffff"
                    emissive="#ffffff"
                    emissiveIntensity={0.1}
                    transparent
                    opacity={0.15}
                    metalness={0.9}
                    roughness={0.1}
                    transmission={0.9}
                />
            </mesh>
            {/* Squares */}
            {squares.map((sq, i) => (
                <mesh key={i} position={sq.pos} receiveShadow>
                    <boxGeometry args={[0.48, 0.04, 0.48]} />
                    <meshStandardMaterial
                        color={sq.isLight ? "#24243A" : "#0A0A14"}
                        metalness={0.2}
                        roughness={0.8}
                    />
                </mesh>
            ))}
        </group>
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

                pieces.push({ pos: [x, 0.05, z], color, type, id: `${type}_${color}_${r}_${c}` });
                c += 1;
            }
        }
    }
    return pieces;
}

/* ── Particle Ring ───────────────────────────────────────── */
function ParticleRing() {
    const ref = useRef<THREE.Points>(null);
    const count = 300;

    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const radius = 2.4 + Math.random() * 0.8;
            pos[i * 3] = Math.cos(angle) * radius;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
            pos[i * 3 + 2] = Math.sin(angle) * radius;
        }
        return pos;
    }, []);

    useFrame((_, delta) => {
        if (ref.current) {
            ref.current.rotation.y += delta * 0.05;
        }
    });

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial size={0.02} color="#ffffff" transparent opacity={0.3} sizeAttenuation />
        </points>
    );
}

/* ── Scene ────────────────────────────────────────────────── */
function ChessScene({
    agentWhite = "ZEUS",
    agentBlack = "ATHENA",
    activeColor = "white",
    fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    camMode = "cinematic",
}: {
    agentWhite?: string;
    agentBlack?: string;
    activeColor?: "white" | "black";
    fen?: string;
    camMode?: "cinematic" | "tactical" | "free";
}) {
    const currentPieces = useMemo(() => parseFEN(fen), [fen]);

    return (
        <>
            {/* Premium Lighting */}
            <ambientLight intensity={0.15} color="#0C0C28" />
            <spotLight position={[5, 10, 5]} intensity={1.5} angle={Math.PI / 4} penumbra={1} color="#ffffff" castShadow />
            <pointLight position={[-4, 4, -4]} intensity={1} color="#8B3FE8" distance={15} />
            <pointLight position={[4, 4, 4]} intensity={1} color="#00FFB0" distance={15} />

            {/* Board & Interactive Elements */}
            <Board />
            <BettingPools />
            <MindCamera activeColor={activeColor} agentWhite={agentWhite} agentBlack={agentBlack} />

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

            {/* Particles */}
            <ParticleRing />

            {/* Camera Controls */}
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

    return (
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
            {/* dynamic camera control UI */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex gap-4 bg-surface-bg/90 backdrop-blur-md border border-border-color p-3 rounded-2xl shadow-card">
                <button
                    className={`btn btn-sm ${camMode === 'cinematic' ? 'btn-primary' : 'btn-secondary'} mono`}
                    onClick={() => setCamMode("cinematic")}
                    style={camMode === 'cinematic' ? { backgroundColor: 'var(--primary-cyan)', color: 'var(--void-bg)', boxShadow: 'var(--shadow-glow-cyan)' } : {}}
                >
                    [CINEMATIC]
                </button>
                <button
                    className={`btn btn-sm ${camMode === 'tactical' ? 'btn-primary' : 'btn-secondary'} mono`}
                    onClick={() => setCamMode("tactical")}
                    style={camMode === 'tactical' ? { backgroundColor: 'var(--primary-cyan)', color: 'var(--void-bg)', boxShadow: 'var(--shadow-glow-cyan)' } : {}}
                >
                    [TACTICAL]
                </button>
                <button
                    className={`btn btn-sm ${camMode === 'free' ? 'btn-primary' : 'btn-secondary'} mono`}
                    onClick={() => setCamMode("free")}
                    style={camMode === 'free' ? { backgroundColor: 'var(--primary-cyan)', color: 'var(--void-bg)', boxShadow: 'var(--shadow-glow-cyan)' } : {}}
                >
                    [FREE_ROAM]
                </button>
            </div>

            <WebGLSafeCanvas
                shadows
                camera={{ position: [0, 4, 6], fov: 45 }}
                style={{ width: "100%", height: "100%" }}
                gl={{ antialias: true }}
            >
                <color attach="background" args={["#0A0A14"]} />
                <fog attach="fog" args={["#0A0A14", 8, 15]} />
                <ChessScene agentWhite={agentWhite} agentBlack={agentBlack} activeColor={activeColor} fen={fen} camMode={camMode} />
            </WebGLSafeCanvas>
        </div>
    );
}
