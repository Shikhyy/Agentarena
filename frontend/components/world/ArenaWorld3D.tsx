"use client";

import { Suspense, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Stars, PerspectiveCamera, AdaptiveDpr, AdaptiveEvents, Text, Float, Grid } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { useWorldStore } from "@/lib/worldStore";
import { WebGLSafeCanvas } from "./WebGLErrorBoundary";

import { CentralNexus } from "./CentralNexus";
import { ArenaHall3D } from "./ArenaHall3D";
import { CommentatorAvatar3D } from "./CommentatorAvatar3D";
import { BettingTerminal3D } from "./BettingTerminal3D";
import { SpectatorOrbs } from "./SpectatorOrbs";
import { AgentCharacter3D } from "./AgentCharacter3D";
import { PlayerController } from "./PlayerController";
import { WorkshopZone } from "./Workshop3D";
import { MonopolyZone } from "./MonopolyZone";
import { GrandArenaZone, HallOfFameZone, MarketplaceZone, ArchiveZone, SkyDeckZone } from "./OtherZones";
import { RoadSystem } from "./RoadSystem";
import { FloatingVault } from "./FloatingVault";
import { NPCAgents } from "./NPCAgents";
import { TorchFlicker, DustMotes } from "./AmbientEffects";

/* ── Loading Spinner ────────────────────────────────── */
function LoadingFallback() {
    const ref = useRef<THREE.Mesh>(null);
    const ringRef = useRef<THREE.Mesh>(null);
    useFrame((_, delta) => {
        if (ref.current) {
            ref.current.rotation.x += delta * 1.2;
            ref.current.rotation.y += delta * 1.8;
        }
        if (ringRef.current) {
            ringRef.current.rotation.z += delta * 2.5;
        }
    });
    return (
        <group position={[0, 2, 0]}>
            <mesh ref={ref}>
                <icosahedronGeometry args={[0.5, 1]} />
                <meshStandardMaterial color="#C8963C" emissive="#C8963C" emissiveIntensity={1.5} wireframe />
            </mesh>
            <mesh ref={ringRef}>
                <torusGeometry args={[0.8, 0.02, 8, 32]} />
                <meshStandardMaterial color="#4A8C86" emissive="#4A8C86" emissiveIntensity={1} />
            </mesh>
            <Text position={[0, -1.2, 0]} fontSize={0.2} color="#8C7C68" anchorX="center" letterSpacing={0.1}>
                LOADING...
            </Text>
        </group>
    );
}

/* ── Animated Grid Floor ──────────────────────────── */
function GridFloor() {
    return (
        <group>
            {/* Main ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
                <planeGeometry args={[600, 600]} />
                <meshStandardMaterial color="#0F0D0B" metalness={0.15} roughness={0.7} />
            </mesh>
            {/* Subtle grid overlay */}
            <Grid
                position={[0, 0, 0]}
                args={[600, 600]}
                cellColor="#2E2820"
                sectionColor="#3A3228"
                sectionThickness={1}
                fadeDistance={180}
                cellThickness={0.3}
                cellSize={4}
                sectionSize={20}
                fadeStrength={1.5}
            />
        </group>
    );
}

/* ── Pulsing Beacon (clickable — teleports to zone) ── */
function ZoneBeacon({ position, color, label, zoneId }: { position: [number, number, number]; color: string; label: string; zoneId?: string }) {
    const ref = useRef<THREE.Mesh>(null);
    const pulseRef = useRef<THREE.Mesh>(null);
    const teleportToZone = useWorldStore(s => s.teleportToZone);

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        if (ref.current) {
            ref.current.position.y = position[1] + 6 + Math.sin(t * 0.8) * 0.4;
            ref.current.rotation.y += 0.015;
        }
        if (pulseRef.current) {
            const scale = 1 + Math.sin(t * 1.5) * 0.15;
            pulseRef.current.scale.set(scale, 1, scale);
            (pulseRef.current.material as THREE.MeshStandardMaterial).opacity =
                0.15 + Math.sin(t * 1.5) * 0.08;
        }
    });

    const handleClick = (e: THREE.Event) => {
        (e as any).stopPropagation?.();
        if (zoneId) teleportToZone(zoneId as any);
    };

    return (
        <group position={position} onClick={handleClick} onPointerOver={() => { document.body.style.cursor = "pointer"; }} onPointerOut={() => { document.body.style.cursor = "default"; }}>
            {/* Column beam */}
            <mesh position={[0, 3, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 6, 6]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} transparent opacity={0.25} />
            </mesh>

            {/* Diamond beacon — click target */}
            <mesh ref={ref}>
                <octahedronGeometry args={[0.45, 0]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} metalness={0.7} roughness={0.1} />
            </mesh>

            {/* Pulsing ring marker */}
            <mesh ref={pulseRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
                <ringGeometry args={[1.2, 1.35, 32]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} transparent opacity={0.2} side={THREE.DoubleSide} />
            </mesh>

            <pointLight position={[0, 6, 0]} intensity={0.6} distance={15} color={color} />

            <Float speed={0.8} floatIntensity={0.15}>
                <Text
                    position={[0, 7.5, 0]}
                    fontSize={0.5}
                    color={color}
                    anchorX="center"
                    anchorY="middle"
                    letterSpacing={0.06}
                    outlineWidth={0.02}
                    outlineColor="#0A0907"
                >
                    {label}
                </Text>
            </Float>
        </group>
    );
}

/* ── Chess Zone ─────────────────────────────────── */
function ChessZone() {
    const agents = useWorldStore(s => s.agents);
    const liveMatches = useWorldStore(s => s.liveMatches);
    const selectAgent = useWorldStore(s => s.selectAgent);
    const chessAgents = agents.filter(a => a.zone === "arena-chess");
    const chessMatch = liveMatches.find(m => m.gameType === "chess");

    return (
        <>
            <group position={[0, 0, -60]}>
                <ArenaHall3D hallName="Chess Arena" hallColor="#4A8C86" spectatorCount={chessMatch?.spectators ?? 0}>
                    <group position={[0, 1, 0]}>
                        <mesh position={[0, 0.5, 0]} castShadow>
                            <boxGeometry args={[4.2, 0.12, 4.2]} />
                            <meshStandardMaterial color="#161310" metalness={0.5} roughness={0.3} />
                        </mesh>
                        {Array.from({ length: 64 }).map((_, i) => {
                            const row = Math.floor(i / 8);
                            const col = i % 8;
                            const isLight = (row + col) % 2 === 0;
                            return (
                                <mesh key={i} position={[(col - 3.5) * 0.49, 0.58, (row - 3.5) * 0.49]}>
                                    <boxGeometry args={[0.47, 0.025, 0.47]} />
                                    <meshStandardMaterial
                                        color={isLight ? "#C8B89A" : "#2E2820"}
                                        metalness={0.15}
                                        roughness={0.5}
                                        emissive={isLight ? "#C8B89A" : "#2E2820"}
                                        emissiveIntensity={0.03}
                                    />
                                </mesh>
                            );
                        })}
                    </group>
                </ArenaHall3D>
            </group>
            <ZoneBeacon position={[0, 0, -60]} color="#4A8C86" label="Chess" zoneId="arena-chess" />
            {chessAgents.map(a => <AgentCharacter3D key={a.id} agent={a} onClick={() => selectAgent(a.id)} />)}
            {chessMatch && <CommentatorAvatar3D position={[8, 0, -60]} matchLabel={`${chessMatch.agentA.name} vs ${chessMatch.agentB.name}`} spectators={chessMatch.spectators} />}
            {chessMatch && <BettingTerminal3D position={[-8, 0, -55]} matchLabel={`${chessMatch.agentA.name} vs ${chessMatch.agentB.name}`} odds={chessMatch.odds} pool={chessMatch.pool} />}
            <SpectatorOrbs count={chessMatch?.spectators ?? 10} center={[0, 4, -60]} />
        </>
    );
}

/* ── Poker Zone ─────────────────────────────────── */
function PokerZone() {
    const agents = useWorldStore(s => s.agents);
    const liveMatches = useWorldStore(s => s.liveMatches);
    const selectAgent = useWorldStore(s => s.selectAgent);
    const pokerAgents = agents.filter(a => a.zone === "arena-poker");
    const pokerMatch = liveMatches.find(m => m.gameType === "poker");

    return (
        <>
            <group position={[60, 0, 0]}>
                <ArenaHall3D hallName="Poker Den" hallColor="#C43030" spectatorCount={pokerMatch?.spectators ?? 0}>
                    <group position={[0, 1, 0]}>
                        <mesh position={[0, 0.5, 0]} castShadow>
                            <cylinderGeometry args={[2.7, 2.7, 0.18, 32]} />
                            <meshStandardMaterial color="#161310" metalness={0.25} roughness={0.6} />
                        </mesh>
                        <mesh position={[0, 0.6, 0]}>
                            <cylinderGeometry args={[2.5, 2.5, 0.01, 32]} />
                            <meshStandardMaterial color="#1A3028" roughness={0.95} />
                        </mesh>
                        <mesh position={[0, 0.55, 0]}>
                            <torusGeometry args={[2.6, 0.1, 8, 32]} />
                            <meshStandardMaterial color="#C8963C" emissive="#C8963C" emissiveIntensity={0.3} metalness={0.8} roughness={0.2} />
                        </mesh>
                    </group>
                </ArenaHall3D>
            </group>
            <ZoneBeacon position={[60, 0, 0]} color="#C43030" label="Poker" zoneId="arena-poker" />
            {pokerAgents.map(a => <AgentCharacter3D key={a.id} agent={a} onClick={() => selectAgent(a.id)} />)}
            {pokerMatch && <CommentatorAvatar3D position={[68, 0, 8]} matchLabel={`${pokerMatch.agentA.name} vs ${pokerMatch.agentB.name}`} spectators={pokerMatch.spectators} />}
            {pokerMatch && <BettingTerminal3D position={[55, 0, 8]} matchLabel={`${pokerMatch.agentA.name} vs ${pokerMatch.agentB.name}`} odds={pokerMatch.odds} pool={pokerMatch.pool} />}
            <SpectatorOrbs count={pokerMatch?.spectators ?? 8} center={[60, 4, 0]} />
        </>
    );
}

/* ── World scene ────────────────────────────────── */
function WorldScene() {
    const setPlayerTarget = useWorldStore(s => s.setPlayerTarget);

    return (
        <>
            <fog attach="fog" args={["#0A0907", 80, 500]} />
            <color attach="background" args={["#0A0907"]} />

            <PerspectiveCamera makeDefault position={[0, 45, 55]} fov={55} near={0.5} far={2000} />
            <PlayerController />

            {/* Ambient star field for atmosphere */}
            <Stars radius={300} depth={100} count={1500} factor={3} saturation={0.1} fade speed={0.3} />

            {/* Lighting - warm premium setup */}
            <ambientLight intensity={0.15} color="#F0E8D8" />
            <directionalLight
                position={[50, 80, 50]}
                intensity={0.6}
                color="#E8B86D"
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-camera-far={300}
                shadow-camera-left={-100}
                shadow-camera-right={100}
                shadow-camera-top={100}
                shadow-camera-bottom={-100}
            />
            <directionalLight position={[-30, 50, -30]} intensity={0.3} color="#4A8C86" />
            {/* Subtle rim light */}
            <directionalLight position={[0, 30, -80]} intensity={0.15} color="#C8963C" />

            {/* Ground + Grid */}
            <GridFloor />

            {/* Clickable ground (for player movement) */}
            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, 0.02, 0]}
                onPointerDown={e => { e.stopPropagation(); setPlayerTarget([e.point.x, 0, e.point.z]); }}
                visible={false}
            >
                <planeGeometry args={[600, 600]} />
                <meshBasicMaterial />
            </mesh>

            {/* Zones */}
            <Suspense fallback={<LoadingFallback />}><CentralNexus /></Suspense>
            <Suspense fallback={<LoadingFallback />}><ChessZone /></Suspense>
            <Suspense fallback={<LoadingFallback />}><PokerZone /></Suspense>
            <Suspense fallback={<LoadingFallback />}><WorkshopZone /></Suspense>
            <Suspense fallback={<LoadingFallback />}><MonopolyZone /></Suspense>
            <Suspense fallback={<LoadingFallback />}><GrandArenaZone /></Suspense>
            <Suspense fallback={<LoadingFallback />}><HallOfFameZone /></Suspense>
            <Suspense fallback={<LoadingFallback />}><MarketplaceZone /></Suspense>
            <Suspense fallback={<LoadingFallback />}><ArchiveZone /></Suspense>
            <Suspense fallback={<LoadingFallback />}><SkyDeckZone /></Suspense>

            {/* Road network + Vault + NPC agents */}
            <RoadSystem />
            <FloatingVault />
            <NPCAgents />

            {/* Ambient effects */}
            <DustMotes count={300} spread={200} height={25} />
            <TorchFlicker position={[10, 3, 10]} />
            <TorchFlicker position={[-10, 3, -10]} />
            <TorchFlicker position={[60, 3, 5]} />
            <TorchFlicker position={[5, 3, -60]} />

            {/* Post-processing - premium dark atmosphere */}
            <EffectComposer multisampling={0}>
                <Bloom luminanceThreshold={0.6} luminanceSmoothing={0.7} intensity={0.5} mipmapBlur resolutionScale={0.5} />
                <Vignette eskil={false} offset={0.15} darkness={0.7} />
            </EffectComposer>
        </>
    );
}

export default function ArenaWorld3D() {
    const qualityPreset = useWorldStore(s => s.qualityPreset);

    const dpr = useMemo((): [number, number] => {
        switch (qualityPreset) {
            case "low": return [0.5, 1];
            case "medium": return [0.75, 1.5];
            case "high": return [1, 2];
            case "ultra": return [1.5, 2];
            default: return [1, 2];
        }
    }, [qualityPreset]);

    return (
        <WebGLSafeCanvas
            dpr={dpr}
            gl={{ antialias: qualityPreset !== "low", powerPreference: "high-performance", logarithmicDepthBuffer: true }}
            shadows
            style={{ position: "absolute", inset: 0 }}
            onCreated={({ gl }) => {
                gl.domElement.addEventListener("webglcontextlost", e => { e.preventDefault(); }, false);
            }}
        >
            <AdaptiveDpr pixelated />
            <AdaptiveEvents />
            <WorldScene />
        </WebGLSafeCanvas>
    );
}
