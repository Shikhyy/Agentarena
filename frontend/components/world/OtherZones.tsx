"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { ArenaHall3D } from "./ArenaHall3D";
import { Text, Float } from "@react-three/drei";
import { COLORS } from "@/lib/theme";
import * as THREE from "three";

export function GrandArenaZone() {
    return (
        <group position={[0, 10, -120]}>
            <ArenaHall3D hallName="Grand Arena" hallColor={COLORS.accent} spectatorCount={0}>
                <mesh position={[0, 1, 0]}>
                    <cylinderGeometry args={[4, 5, 2, 32]} />
                    <meshStandardMaterial color={COLORS.accent} metalness={0.5} roughness={0.2} emissive={COLORS.accent} emissiveIntensity={0} />
                </mesh>
                <Text position={[0, 3, 0]} fontSize={0.5} color={COLORS.ivory}>Grand Prix</Text>
            </ArenaHall3D>
        </group>
    );
}

export function HallOfFameZone() {
    return (
        <group position={[-45, 0, -45]}>
            <ArenaHall3D hallName="Hall of Fame" hallColor={COLORS.accentSoft} spectatorCount={0}>
                {Array.from({length: 3}).map((_, i) => (
                    <group key={i} position={[(i-1)*3, 2, 0]}>
                        <mesh castShadow>
                            <boxGeometry args={[1, 4, 1]} />
                            <meshStandardMaterial color={COLORS.accentSoft} metalness={0.8} roughness={0.2} />
                        </mesh>
                        <mesh position={[0, 2.5, 0]}>
                            <sphereGeometry args={[0.5, 32, 32]} />
                            <meshStandardMaterial color={COLORS.ivory} emissive={COLORS.ivory} emissiveIntensity={0} />
                        </mesh>
                    </group>
                ))}
            </ArenaHall3D>
        </group>
    );
}

export function MarketplaceZone() {
    return (
        <group position={[45, 0, 45]}>
            <ArenaHall3D hallName="Marketplace" hallColor={COLORS.accentSoft} spectatorCount={0}>
                {Array.from({length: 5}).map((_, i) => (
                    <mesh key={i} position={[Math.cos(i*Math.PI*2/5)*3, 1, Math.sin(i*Math.PI*2/5)*3]}>
                        <cylinderGeometry args={[0.5, 0.5, 1, 8]} />
                        <meshStandardMaterial color={COLORS.structure} emissive={COLORS.accentSoft} emissiveIntensity={0} wireframe />
                    </mesh>
                ))}
                <Text position={[0, 2, 0]} fontSize={0.5} color={COLORS.accentSoft}>Marketplace</Text>
            </ArenaHall3D>
        </group>
    );
}

/* ── Archive District ──────────────────────────────────────── */
const ARCHIVE_VIOLET = "#9B9BFF";
const ARCHIVE_VIOLET_DIM = "#5A5ABB";

export function ArchiveZone() {
    // Slowly-rotating statues
    const statueRefs = [useRef<THREE.Group>(null), useRef<THREE.Group>(null), useRef<THREE.Group>(null)];
    useFrame((_, delta) => {
        statueRefs.forEach(r => {
            if (r.current) r.current.rotation.y += delta * 0.15;
        });
    });

    return (
        <group position={[-280, 0, 280]}>
            {/* Dim blue-violet ambient glow */}
            <pointLight position={[0, 12, 0]} intensity={1.2} distance={60} color={ARCHIVE_VIOLET} />
            <pointLight position={[-15, 6, 10]} intensity={0.5} distance={30} color="#6060DD" />
            <pointLight position={[15, 6, -10]} intensity={0.5} distance={30} color="#6060DD" />

            {/* Ground slab */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
                <planeGeometry args={[80, 80]} />
                <meshStandardMaterial color="#080814" metalness={0.2} roughness={0.8} />
            </mesh>

            {/* Archive towers — 4 corner towers with dome tops */}
            {([[-18, 0, -18], [18, 0, -18], [-18, 0, 18], [18, 0, 18]] as [number, number, number][]).map(([x, , z], i) => (
                <group key={i} position={[x, 0, z]}>
                    {/* Tower shaft */}
                    <mesh castShadow>
                        <cylinderGeometry args={[1.4, 1.8, 14, 10]} />
                        <meshStandardMaterial color="#0D0D22" metalness={0.4} roughness={0.6}
                            emissive={ARCHIVE_VIOLET_DIM} emissiveIntensity={0.08} />
                    </mesh>
                    {/* Dome cap */}
                    <mesh position={[0, 7.8, 0]}>
                        <sphereGeometry args={[1.5, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
                        <meshStandardMaterial color={ARCHIVE_VIOLET} emissive={ARCHIVE_VIOLET}
                            emissiveIntensity={0.35} metalness={0.6} roughness={0.2} transparent opacity={0.85} />
                    </mesh>
                    {/* Pulsing ring at base */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
                        <ringGeometry args={[1.9, 2.2, 20]} />
                        <meshStandardMaterial color={ARCHIVE_VIOLET} emissive={ARCHIVE_VIOLET}
                            emissiveIntensity={0.4} transparent opacity={0.3} side={THREE.DoubleSide} />
                    </mesh>
                </group>
            ))}

            {/* Hall of Fame podium — colonnade */}
            {([-6, 0, 6] as number[]).map((x, i) => (
                <group key={i} position={[x, 0, -5]}>
                    {/* Podium column */}
                    <mesh castShadow>
                        <boxGeometry args={[1.2, 8, 1.2]} />
                        <meshStandardMaterial color="#12122A" metalness={0.5} roughness={0.4}
                            emissive={ARCHIVE_VIOLET_DIM} emissiveIntensity={0.06} />
                    </mesh>
                    {/* Rotating agent statue orb */}
                    <group ref={statueRefs[i]} position={[0, 5.2, 0]}>
                        <mesh>
                            <sphereGeometry args={[0.7, 16, 16]} />
                            <meshStandardMaterial color="#C8C8FF" emissive="#9B9BFF"
                                emissiveIntensity={0.45} metalness={0.3} roughness={0.5}
                                transparent opacity={0.75} />
                        </mesh>
                        {/* Ghost particle ring */}
                        <mesh rotation={[-Math.PI / 2, 0, 0]}>
                            <torusGeometry args={[1.0, 0.05, 6, 24]} />
                            <meshStandardMaterial color={ARCHIVE_VIOLET} emissive={ARCHIVE_VIOLET}
                                emissiveIntensity={0.6} transparent opacity={0.5} />
                        </mesh>
                    </group>
                    {/* Plaque */}
                    <mesh position={[0, -0.2, 0.7]}>
                        <boxGeometry args={[1.0, 0.4, 0.05]} />
                        <meshStandardMaterial color={ARCHIVE_VIOLET_DIM} metalness={0.7} roughness={0.3} />
                    </mesh>
                </group>
            ))}

            {/* Replay Theatre — sunken ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 10]}>
                <ringGeometry args={[5, 9, 36]} />
                <meshStandardMaterial color="#0A0A1E" roughness={0.9} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.48, 10]}>
                <ringGeometry args={[4.8, 5.05, 36]} />
                <meshStandardMaterial color={ARCHIVE_VIOLET} emissive={ARCHIVE_VIOLET}
                    emissiveIntensity={0.5} transparent opacity={0.4} side={THREE.DoubleSide} />
            </mesh>
            {/* Theatre floor glow */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.49, 10]}>
                <circleGeometry args={[4.7, 36]} />
                <meshStandardMaterial color="#10103A" emissive="#3030BB" emissiveIntensity={0.12} />
            </mesh>

            {/* Zone label */}
            <Float speed={0.6} floatIntensity={0.2}>
                <Text
                    position={[0, 18, 0]}
                    fontSize={2.0}
                    color={ARCHIVE_VIOLET}
                    anchorX="center"
                    anchorY="middle"
                    letterSpacing={0.12}
                    outlineWidth={0.08}
                    outlineColor="#0A0907"
                >
                    ARCHIVE
                </Text>
            </Float>
        </group>
    );
}

/* ── Sky Deck District ─────────────────────────────────────── */
const SKY_BLUE = "#4DA6FF";
const SKY_BLUE_DIM = "#2A6099";

export function SkyDeckZone() {
    const searchlight1 = useRef<THREE.SpotLight>(null);
    const searchlight2 = useRef<THREE.SpotLight>(null);
    const searchlight3 = useRef<THREE.SpotLight>(null);

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        if (searchlight1.current) {
            searchlight1.current.target.position.set(Math.sin(t * 0.4) * 20, 0, Math.cos(t * 0.4) * 20);
            searchlight1.current.target.updateMatrixWorld();
        }
        if (searchlight2.current) {
            searchlight2.current.target.position.set(Math.sin(t * 0.27 + 2) * 18, 0, Math.cos(t * 0.27 + 2) * 18);
            searchlight2.current.target.updateMatrixWorld();
        }
        if (searchlight3.current) {
            searchlight3.current.target.position.set(Math.sin(t * 0.35 + 4) * 22, 0, Math.cos(t * 0.35 + 4) * 22);
            searchlight3.current.target.updateMatrixWorld();
        }
    });

    return (
        <group position={[0, 80, -300]}>
            {/* Electric blue ambient fill */}
            <pointLight position={[0, 10, 0]} intensity={1.8} distance={80} color={SKY_BLUE} />
            <pointLight position={[-20, 4, 0]} intensity={0.6} distance={40} color="#2A80CC" />
            <pointLight position={[20, 4, 0]} intensity={0.6} distance={40} color="#2A80CC" />

            {/* Sweeping searchlights */}
            <spotLight ref={searchlight1} position={[-12, 30, -5]} angle={0.08} penumbra={0.3}
                intensity={60} distance={120} color={SKY_BLUE} castShadow={false} />
            <spotLight ref={searchlight2} position={[12, 30, -5]} angle={0.08} penumbra={0.3}
                intensity={60} distance={120} color="#7EC8FF" castShadow={false} />
            <spotLight ref={searchlight3} position={[0, 30, 10]} angle={0.07} penumbra={0.4}
                intensity={50} distance={120} color={SKY_BLUE} castShadow={false} />

            {/* Main elevated platform */}
            <mesh position={[0, -1, 0]} receiveShadow castShadow>
                <cylinderGeometry args={[28, 30, 2, 40]} />
                <meshStandardMaterial color="#080C14" metalness={0.55} roughness={0.35}
                    emissive={SKY_BLUE_DIM} emissiveIntensity={0.04} />
            </mesh>
            {/* Platform edge glow — plasma blue rail */}
            <mesh position={[0, 0.2, 0]}>
                <torusGeometry args={[29, 0.18, 8, 64]} />
                <meshStandardMaterial color={SKY_BLUE} emissive={SKY_BLUE}
                    emissiveIntensity={1.2} transparent opacity={0.9} />
            </mesh>

            {/* Sky bridge — descending glass walkway toward nexus (positive Z = toward nexus) */}
            <group>
                {/* Bridge deck — angled downward (toward Z+) */}
                <mesh position={[0, -8, 25]} rotation={[Math.PI / 8, 0, 0]} castShadow>
                    <boxGeometry args={[6, 0.3, 55]} />
                    <meshStandardMaterial color="#0A1020" metalness={0.6} roughness={0.3}
                        emissive={SKY_BLUE_DIM} emissiveIntensity={0.05} transparent opacity={0.9} />
                </mesh>
                {/* Bridge side rail lights — left */}
                <mesh position={[-3.1, -6, 25]} rotation={[Math.PI / 8, 0, 0]}>
                    <boxGeometry args={[0.12, 0.12, 55]} />
                    <meshStandardMaterial color={SKY_BLUE} emissive={SKY_BLUE} emissiveIntensity={0.9} />
                </mesh>
                {/* Bridge side rail lights — right */}
                <mesh position={[3.1, -6, 25]} rotation={[Math.PI / 8, 0, 0]}>
                    <boxGeometry args={[0.12, 0.12, 55]} />
                    <meshStandardMaterial color={SKY_BLUE} emissive={SKY_BLUE} emissiveIntensity={0.9} />
                </mesh>
                {/* Bridge support pillars */}
                {[10, 28, 46].map((z, i) => (
                    <mesh key={i} position={[0, -14 - i * 4, z]}>
                        <cylinderGeometry args={[0.3, 0.4, 8 + i * 8, 8]} />
                        <meshStandardMaterial color="#0A1020" metalness={0.5} roughness={0.5}
                            emissive={SKY_BLUE_DIM} emissiveIntensity={0.06} />
                    </mesh>
                ))}
            </group>

            {/* Grand Prix oval racing track */}
            <group position={[0, -0.5, 0]}>
                {/* Track surface */}
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[16, 22, 64]} />
                    <meshStandardMaterial color="#050A14" roughness={0.95} metalness={0.05} />
                </mesh>
                {/* Inner track glow line */}
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[15.85, 16.1, 64]} />
                    <meshStandardMaterial color={SKY_BLUE} emissive={SKY_BLUE}
                        emissiveIntensity={0.7} transparent opacity={0.6} side={THREE.DoubleSide} />
                </mesh>
                {/* Outer track glow line */}
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[21.9, 22.15, 64]} />
                    <meshStandardMaterial color={SKY_BLUE} emissive={SKY_BLUE}
                        emissiveIntensity={0.7} transparent opacity={0.6} side={THREE.DoubleSide} />
                </mesh>
                {/* Dashed lane markers */}
                {Array.from({ length: 16 }).map((_, i) => {
                    const angle = (i / 16) * Math.PI * 2;
                    return (
                        <mesh key={i} rotation={[-Math.PI / 2, 0, angle]} position={[0, 0.02, 0]}>
                            <planeGeometry args={[0.15, 2.5]} />
                            <meshStandardMaterial color="#7EC8FF" emissive="#7EC8FF"
                                emissiveIntensity={0.5} transparent opacity={0.5} side={THREE.DoubleSide} />
                        </mesh>
                    );
                })}
            </group>

            {/* Central Grand Prix trophy stage */}
            <group position={[0, 0.5, 0]}>
                <mesh castShadow>
                    <cylinderGeometry args={[5, 6, 1.5, 20]} />
                    <meshStandardMaterial color="#0C1428" metalness={0.6} roughness={0.3}
                        emissive={SKY_BLUE_DIM} emissiveIntensity={0.08} />
                </mesh>
                {/* Trophy display */}
                <mesh position={[0, 2.5, 0]} castShadow>
                    <cylinderGeometry args={[0.5, 0.8, 3, 8]} />
                    <meshStandardMaterial color="#C8963C" emissive="#C8963C" emissiveIntensity={0.5}
                        metalness={0.9} roughness={0.1} />
                </mesh>
                <mesh position={[0, 4.2, 0]}>
                    <sphereGeometry args={[0.6, 16, 16]} />
                    <meshStandardMaterial color="#E8B86D" emissive="#E8B86D" emissiveIntensity={0.8}
                        metalness={0.95} roughness={0.05} />
                </mesh>
            </group>

            {/* Tiered premium seating rings */}
            {[10, 12.5].map((r, i) => (
                <mesh key={i} position={[0, 0.5 + i * 0.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[r, r + 1.8, 48]} />
                    <meshStandardMaterial color="#0A1020" metalness={0.3} roughness={0.7}
                        emissive={SKY_BLUE_DIM} emissiveIntensity={0.04} />
                </mesh>
            ))}

            {/* Zone label */}
            <Float speed={0.5} floatIntensity={0.25}>
                <Text
                    position={[0, 22, 0]}
                    fontSize={2.2}
                    color={SKY_BLUE}
                    anchorX="center"
                    anchorY="middle"
                    letterSpacing={0.14}
                    outlineWidth={0.09}
                    outlineColor="#080C14"
                >
                    SKY DECK
                </Text>
            </Float>
        </group>
    );
}
