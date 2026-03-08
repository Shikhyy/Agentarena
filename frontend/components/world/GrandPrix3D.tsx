"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Float, Box, Cylinder, Sphere } from "@react-three/drei";
import * as THREE from "three";
import { WebGLSafeCanvas } from "./WebGLErrorBoundary";

/* ── Floating Trophies ────────────────────────────────────── */
function Trophy({ position, glowColor }: { position: [number, number, number], glowColor: string }) {
    const trophyRef = useRef<THREE.Group>(null);

    useFrame((_, delta) => {
        if (trophyRef.current) {
            trophyRef.current.rotation.y += delta * 0.5;
            trophyRef.current.position.y = position[1] + Math.sin(Date.now() * 0.002) * 0.1;
        }
    });

    return (
        <group ref={trophyRef} position={position}>
            <Cylinder args={[0.2, 0.1, 0.4, 16]} castShadow>
                <meshStandardMaterial color="#FFB800" metalness={0.8} roughness={0.2} />
            </Cylinder>
            <Sphere args={[0.15, 32, 32]} position={[0, 0.3, 0]} castShadow>
                <meshStandardMaterial color="#FFB800" metalness={1} roughness={0.1} emissive="#FFB800" emissiveIntensity={0.2} />
            </Sphere>
            <mesh position={[0, -0.2, 0]}>
                <cylinderGeometry args={[0.3, 0.3, 0.05, 32]} />
                <meshStandardMaterial color="#1a1035" metalness={0.5} />
            </mesh>
            <pointLight distance={3} intensity={0.8} color={glowColor} />
            <Cylinder args={[0.3, 0.3, 1, 32]} position={[0, -0.6, 0]}>
                <meshStandardMaterial color={glowColor} transparent opacity={0.1} emissive={glowColor} emissiveIntensity={0.5} />
            </Cylinder>
        </group>
    );
}

/* ── Tournament Display ──────────────────────────────────── */
function TournamentBracket({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            {/* Massive Display Screen */}
            <Box args={[12, 6, 0.2]} castShadow receiveShadow>
                <meshStandardMaterial color="#0C0C24" metalness={0.5} roughness={0.4} />
            </Box>
            {/* Screen Inner Glowing Frame */}
            <Box args={[11.8, 5.8, 0.05]} position={[0, 0, 0.1]}>
                <meshStandardMaterial color="#FF2D9B" emissive="#FF2D9B" emissiveIntensity={0.3} transparent opacity={0.4} />
            </Box>
            {/* Main Title */}
            <Text position={[0, 2, 0.15]} fontSize={0.6} color="#FFB800" anchorX="center" anchorY="middle">
                SEASONAL GRAND PRIX
            </Text>
            {/* Bracket Structure */}
            <group position={[0, 0, 0.15]}>
                <Text position={[-3, 0.5, 0]} fontSize={0.3} color="#00E5FF">ZEUS</Text>
                <Text position={[-1.5, 0.5, 0]} fontSize={0.2} color="#ffffff">vs</Text>
                <Text position={[0, 0.5, 0]} fontSize={0.3} color="#FF2D9B">APOLLO</Text>

                <Box args={[4, 0.02, 0.01]} position={[-1.5, 0.2, 0]}>
                    <meshBasicMaterial color="#3A3A6A" />
                </Box>
                <Text position={[-1.5, -0.2, 0]} fontSize={0.2} color="#FFB800" anchorX="center">Final Match Live</Text>

                <Box args={[8, 0.02, 0.01]} position={[0, -1, 0]}>
                    <meshBasicMaterial color="#3A3A6A" />
                </Box>
                <Text position={[0, -1.3, 0]} fontSize={0.2} color="#E2E2FF" anchorX="center">Pool: 50,000 $ARENA</Text>
            </group>
        </group>
    );
}

/* ── Sky Deck Environment ─────────────────────────────────── */
function SkyDeckEnvironment() {
    return (
        <group>
            {/* Sky Deck Platform */}
            <mesh position={[0, -0.5, 0]} receiveShadow>
                <cylinderGeometry args={[15, 12, 1, 64]} />
                <meshStandardMaterial color="#04040F" metalness={0.3} roughness={0.8} />
            </mesh>
            {/* Glowing Edge */}
            <mesh position={[0, 0.01, 0]}>
                <ringGeometry args={[14.8, 15, 64]} />
                <meshBasicMaterial color="#FFB800" transparent opacity={0.5} />
            </mesh>

            <ambientLight intensity={0.2} />
            <spotLight position={[0, 15, 10]} intensity={1.5} angle={Math.PI / 4} penumbra={0.5} castShadow />
            <pointLight position={[0, 5, 5]} intensity={0.5} color="#FFB800" />

            <TournamentBracket position={[0, 4, -8]} />

            <Trophy position={[-6, 1.5, -4]} glowColor="#FFB800" />
            <Trophy position={[6, 1.5, -4]} glowColor="#00E5FF" />

            <OrbitControls minDistance={8} maxDistance={25} maxPolarAngle={Math.PI / 2.2} autoRotate={true} autoRotateSpeed={0.2} />
        </group>
    );
}

export default function GrandPrix3D() {
    return (
        <WebGLSafeCanvas camera={{ position: [0, 6, 18], fov: 45 }} style={{ width: '100%', height: '100%' }}>
            <color attach="background" args={["#04040F"]} />
            {/* Low atmospheric fog for epic look */}
            <fog attach="fog" args={["#04040F", 10, 35]} />
            <SkyDeckEnvironment />
        </WebGLSafeCanvas>
    );
}
