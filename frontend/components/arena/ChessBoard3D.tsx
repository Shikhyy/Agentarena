"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Float } from "@react-three/drei";
import * as THREE from "three";
import { WebGLSafeCanvas } from "../world/WebGLErrorBoundary";

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
    const emissive = color === "white" ? "#6C3AED" : "#10B981";

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
                <sphereGeometry args={[radius * 0.5, 16, 16]} />
                <meshStandardMaterial
                    color={pieceColor}
                    metalness={0.5}
                    roughness={0.4}
                    emissive={isActive ? emissive : "#000000"}
                    emissiveIntensity={isActive ? 0.6 : 0}
                />
            </mesh>
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
                <meshStandardMaterial color="#1a1035" metalness={0.4} roughness={0.6} />
            </mesh>
            {/* Board border glow */}
            <mesh position={[0, -0.01, 0]}>
                <boxGeometry args={[4.3, 0.02, 4.3]} />
                <meshStandardMaterial color="#6C3AED" emissive="#6C3AED" emissiveIntensity={0.3} transparent opacity={0.6} />
            </mesh>
            {/* Squares */}
            {squares.map((sq, i) => (
                <mesh key={i} position={sq.pos} receiveShadow>
                    <boxGeometry args={[0.48, 0.04, 0.48]} />
                    <meshStandardMaterial
                        color={sq.isLight ? "#2d2459" : "#0f0a1a"}
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

    // FEN maps from 8th rank to 1st rank.
    // In our 3D board, Z = -1.75 is Black's back rank (8), Z = 1.75 is White's back rank (1).
    // FEN row 0 -> rank 8 (black side, z=-1.75)
    // FEN row 7 -> rank 1 (white side, z=1.75)

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
                // Mapping board coordinates (0-7) to 3D world space
                const x = (c - 3.5) * 0.5;
                const z = ((7 - r) - 3.5) * -0.5; // (7-r) so rank 8 maps to z=-1.75

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
    const count = 200;

    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const radius = 2.8 + Math.random() * 0.4;
            pos[i * 3] = Math.cos(angle) * radius;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
            pos[i * 3 + 2] = Math.sin(angle) * radius;
        }
        return pos;
    }, []);

    useFrame((_, delta) => {
        if (ref.current) {
            ref.current.rotation.y += delta * 0.1;
        }
    });

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial size={0.03} color="#6C3AED" transparent opacity={0.6} sizeAttenuation />
        </points>
    );
}

/* ── Agent Label ─────────────────────────────────────────── */
function AgentLabel({
    name,
    position,
    color,
}: {
    name: string;
    position: [number, number, number];
    color: string;
}) {
    return (
        <Float speed={2} floatIntensity={0.3}>
            <Text
                position={position}
                fontSize={0.25}
                color={color}
                anchorX="center"
                anchorY="middle"
            >
                {name}
            </Text>
        </Float>
    );
}

/* ── Scene ────────────────────────────────────────────────── */
function ChessScene({
    agentWhite = "ZEUS",
    agentBlack = "ATHENA",
    activeColor = "white",
    fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
}: {
    agentWhite?: string;
    agentBlack?: string;
    activeColor?: "white" | "black";
    fen?: string;
}) {
    const currentPieces = useMemo(() => parseFEN(fen), [fen]);

    return (
        <>
            {/* Lights */}
            <ambientLight intensity={0.3} />
            <directionalLight position={[5, 8, 3]} intensity={1} castShadow shadow-mapSize={1024} />
            <pointLight position={[-3, 3, -3]} intensity={0.5} color="#6C3AED" />
            <pointLight position={[3, 3, 3]} intensity={0.5} color="#10B981" />

            {/* Board */}
            <Board />

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

            {/* Agent labels */}
            <AgentLabel name={agentWhite} position={[0, 0.8, 2.5]} color="#8B5CF6" />
            <AgentLabel name={agentBlack} position={[0, 0.8, -2.5]} color="#10B981" />

            {/* Camera controls */}
            <OrbitControls
                enablePan={false}
                enableZoom={true}
                minDistance={3}
                maxDistance={8}
                maxPolarAngle={Math.PI / 2.2}
                autoRotate
                autoRotateSpeed={0.5}
            />
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
    return (
        <WebGLSafeCanvas
            shadows
            camera={{ position: [0, 4, 5], fov: 45 }}
            style={{ width: "100%", height: "100%" }}
            gl={{ antialias: true }}
        >
            <color attach="background" args={["#0F0A1A"]} />
            <fog attach="fog" args={["#0F0A1A", 8, 15]} />
            <ChessScene agentWhite={agentWhite} agentBlack={agentBlack} activeColor={activeColor} fen={fen} />
        </WebGLSafeCanvas>
    );
}
