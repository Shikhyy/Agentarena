"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Float, Box } from "@react-three/drei";
import * as THREE from "three";
import { WebGLSafeCanvas } from "./WebGLErrorBoundary";

/* ── Trivia Stage element ───────────────────────────────────── */
function TriviaStage({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            {/* Stage Floor */}
            <mesh receiveShadow>
                <cylinderGeometry args={[2.5, 2.5, 0.2, 32]} />
                <meshStandardMaterial color="#2d1b4e" metalness={0.7} roughness={0.2} />
            </mesh>
            {/* Glowing Border */}
            <mesh position={[0, -0.05, 0]}>
                <cylinderGeometry args={[2.6, 2.6, 0.25, 32]} />
                <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={0.5} transparent opacity={0.3} />
            </mesh>
        </group>
    );
}

function Podium({ position, color, agentName }: { position: [number, number, number], color: string, agentName: string }) {
    return (
        <group position={position}>
            <mesh position={[0, 0.4, 0]} receiveShadow castShadow>
                <cylinderGeometry args={[0.3, 0.3, 0.8, 16]} />
                <meshStandardMaterial color="#1a1035" metalness={0.5} />
            </mesh>
            <mesh position={[0, 0.8, 0]}>
                <cylinderGeometry args={[0.32, 0.32, 0.05, 16]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
            </mesh>
            {/* Agent Label */}
            <Float floatIntensity={0.2} speed={1.5}>
                <Text position={[0, 1.3, 0]} fontSize={0.15} color="#ffffff" anchorX="center" anchorY="bottom">
                    {agentName}
                </Text>
            </Float>
        </group>
    );
}

/* ── World Location (TriviaZone) ─────────────────────────── */
function TriviaEnvironment({ gameState }: { gameState?: any }) {
    const questionText = gameState?.current_question || "Waiting for next question...";
    const scoreA = gameState?.scores?.[gameState?.agent_a?.id || "agent_trivia_a"] || 0;
    const scoreB = gameState?.scores?.[gameState?.agent_b?.id || "agent_trivia_b"] || 0;
    const buzzedIn = gameState?.buzzed_in;

    return (
        <group>
            {/* Main World Floor (Extended) */}
            <mesh position={[0, -0.1, 0]} receiveShadow>
                <cylinderGeometry args={[8, 8, 0.1, 64]} />
                <meshStandardMaterial color="#04040F" metalness={0.8} roughness={0.5} />
            </mesh>

            {/* Giant Background Screens */}
            <group position={[0, 3, -4]}>
                <Box args={[7, 3.5, 0.2]} castShadow receiveShadow>
                    <meshStandardMaterial color="#1A1A3E" />
                </Box>
                <Box args={[6.8, 3.3, 0.02]} position={[0, 0, 0.12]}>
                    <meshStandardMaterial color="#000000" emissive="#0C0C24" emissiveIntensity={0.5} />
                </Box>
                <Text position={[0, 0.5, 0.15]} fontSize={0.3} color="#00E5FF" textAlign="center" maxWidth={6}>
                    TRIVIA MATCH
                </Text>
                <Text position={[0, -0.3, 0.15]} fontSize={0.25} color="#FFFFFF" textAlign="center" maxWidth={6}>
                    {questionText}
                </Text>

                {/* Active Round Info */}
                <Text position={[0, -1.2, 0.15]} fontSize={0.15} color="#FF2D9B" textAlign="center">
                    Round: {gameState?.current_round || "Preshow"}
                </Text>
            </group>

            <ambientLight intensity={0.4} />
            <spotLight position={[0, 8, 4]} intensity={1.5} angle={Math.PI / 4} penumbra={0.5} castShadow />
            <pointLight position={[-2, 2, 2]} color={buzzedIn === gameState?.agent_a?.id ? "#FFFFFF" : "#00E5FF"} intensity={buzzedIn === gameState?.agent_a?.id ? 2 : 0.8} />
            <pointLight position={[2, 2, 2]} color={buzzedIn === gameState?.agent_b?.id ? "#FFFFFF" : "#FF2D9B"} intensity={buzzedIn === gameState?.agent_b?.id ? 2 : 0.8} />

            <TriviaStage position={[0, 0, 0]} />
            <Podium position={[-1.5, 0.1, 1]} color="#FF2D9B" agentName={`Team A: ${scoreA}`} />
            <Podium position={[1.5, 0.1, 1]} color="#00E5FF" agentName={`Team B: ${scoreB}`} />

            {/* Orbital controls for 3D world view */}
            <OrbitControls minDistance={5} maxDistance={15} maxPolarAngle={Math.PI / 2.1} autoRotate={true} autoRotateSpeed={0.3} />
        </group>
    );
}

export default function TriviaZone({ gameState }: { gameState?: any }) {
    return (
        <WebGLSafeCanvas shadows camera={{ position: [0, 4, 8], fov: 50 }} style={{ width: '100%', height: '100%' }}>
            <color attach="background" args={["#04040F"]} />
            <fog attach="fog" args={["#04040F", 5, 20]} />
            <TriviaEnvironment gameState={gameState} />
        </WebGLSafeCanvas>
    );
}
