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
import { GrandArenaZone, HallOfFameZone, MarketplaceZone } from "./OtherZones";

/* ── Loading Spinner ────────────────────────────────── */
function LoadingFallback() {
    const ref = useRef<THREE.Mesh>(null);
    useFrame((_, delta) => {
        if (ref.current) {
            ref.current.rotation.x += delta * 1.5;
            ref.current.rotation.y += delta * 2;
        }
    });
    return (
        <mesh ref={ref} position={[0, 2, 0]}>
            <icosahedronGeometry args={[0.6, 1]} />
            <meshStandardMaterial color="#7B5CFA" emissive="#7B5CFA" emissiveIntensity={1} wireframe />
        </mesh>
    );
}

/* ── Animated Grid Floor ──────────────────────────── */
function GridFloor() {
    return (
        <group>
            {/* Main ground */}
            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -0.1, 0]}
                receiveShadow
            >
                <planeGeometry args={[600, 600]} />
                <meshStandardMaterial color="#04040E" metalness={0.3} roughness={0.8} />
            </mesh>
            {/* Optimized Grid helper instead of massive plane geometry wireframe */}
            <Grid 
                position={[0, 0.05, 0]} 
                args={[600, 600]} 
                cellColor="#7B5CFA" 
                sectionColor="#7B5CFA" 
                sectionThickness={1} 
                fadeDistance={200} 
                cellThickness={0.5} 
            />
        </group>
    );
}

/* ── Pulsing Beacon ─────────────────────────────── */
function ZoneBeacon({ position, color, label }: { position: [number, number, number]; color: string; label: string }) {
    const ref = useRef<THREE.Mesh>(null);
    const ringRef = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        if (ref.current) {
            ref.current.position.y = position[1] + 6 + Math.sin(state.clock.elapsedTime * 1.5) * 0.5;
        }
        if (ringRef.current) {
            const scale = 1 + (Math.sin(state.clock.elapsedTime * 2) * 0.5 + 0.5) * 1.5;
            ringRef.current.scale.setScalar(scale);
            const material = ringRef.current.material;
            if (!Array.isArray(material)) {
                material.opacity = 0.5 - scale * 0.1;
            }
        }
    });

    return (
        <group position={position}>
            {/* Column beam */}
            <mesh position={[0, 3, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 6, 6]} />
                <meshBasicMaterial color={color} transparent opacity={0.4} />
            </mesh>
            {/* Diamond beacon */}
            <mesh ref={ref}>
                <octahedronGeometry args={[0.4, 0]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} toneMapped={false} />
            </mesh>
            {/* Expanding ring */}
            <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
                <ringGeometry args={[1, 1.2, 32]} />
                <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} />
            </mesh>
            <Float speed={1.2} floatIntensity={0.25}>
                <Text
                    position={[0, 7.2, 0]}
                    fontSize={0.45}
                    color={color}
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.02}
                    outlineColor="#030308"
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
                <ArenaHall3D hallName="Chess Arena" hallColor="#7B5CFA" spectatorCount={chessMatch?.spectators ?? 0}>
                    <group position={[0, 1, 0]}>
                        <mesh position={[0, 0.5, 0]} castShadow>
                            <boxGeometry args={[4.2, 0.12, 4.2]} />
                            <meshStandardMaterial color="#1a1038" metalness={0.5} roughness={0.3} />
                        </mesh>
                        {Array.from({ length: 64 }).map((_, i) => {
                            const row = Math.floor(i / 8);
                            const col = i % 8;
                            const isLight = (row + col) % 2 === 0;
                            return (
                                <mesh key={i} position={[(col - 3.5) * 0.49, 0.58, (row - 3.5) * 0.49]}>
                                    <boxGeometry args={[0.47, 0.025, 0.47]} />
                                    <meshStandardMaterial
                                        color={isLight ? "#c8b8f0" : "#2d1f6e"}
                                        metalness={0.15}
                                        roughness={0.5}
                                        emissive={isLight ? "#c8b8f0" : "#2d1f6e"}
                                        emissiveIntensity={0.05}
                                    />
                                </mesh>
                            );
                        })}
                    </group>
                </ArenaHall3D>
            </group>
            <ZoneBeacon position={[0, 0, -60]} color="#7B5CFA" label="Chess" />
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
                <ArenaHall3D hallName="Poker Den" hallColor="#00D4FF" spectatorCount={pokerMatch?.spectators ?? 0}>
                    <group position={[0, 1, 0]}>
                        <mesh position={[0, 0.5, 0]} castShadow>
                            <cylinderGeometry args={[2.7, 2.7, 0.18, 32]} />
                            <meshStandardMaterial color="#052218" metalness={0.25} roughness={0.6} />
                        </mesh>
                        <mesh position={[0, 0.6, 0]}>
                            <cylinderGeometry args={[2.5, 2.5, 0.01, 32]} />
                            <meshStandardMaterial color="#036630" roughness={0.95} />
                        </mesh>
                        <mesh position={[0, 0.55, 0]}>
                            <torusGeometry args={[2.6, 0.1, 8, 32]} />
                            <meshStandardMaterial color="#00D4FF" emissive="#00D4FF" emissiveIntensity={0.3} metalness={0.8} roughness={0.2} />
                        </mesh>
                    </group>
                </ArenaHall3D>
            </group>
            <ZoneBeacon position={[60, 0, 0]} color="#00D4FF" label="Poker" />
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
            <fog attach="fog" args={["#030308", 80, 350]} />
            <color attach="background" args={["#030308"]} />

            <PerspectiveCamera makeDefault position={[0, 80, 120]} fov={65} near={0.1} far={2000} />
            <PlayerController />

            {/* Stars */}
            <Stars radius={250} depth={120} count={3000} factor={5} fade speed={0.3} />

            {/* Lighting */}
            <ambientLight intensity={0.15} color="#1a0a40" />
            <directionalLight position={[30, 80, 30]} intensity={2.5} color="#00D4FF" castShadow shadow-mapSize={[2048, 2048]} />
            <directionalLight position={[-50, 30, -10]} intensity={1.5} color="#FF3B5C" />
            <directionalLight position={[0, 50, -80]} intensity={2.5} color="#7B5CFA" />
            <pointLight position={[0, 20, 0]} intensity={3} color="#7B5CFA" distance={60} />

            {/* Ground + Grid */}
            <GridFloor />

            {/* Clickable ground (for player movement) */}
            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, 0.01, 0]}
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

            {/* Post-processing - lowered intensity to improve frame rate */}
            <EffectComposer multisampling={0}>
                <Bloom luminanceThreshold={0.7} luminanceSmoothing={0.9} intensity={0.4} mipmapBlur resolutionScale={0.5} />
                <Vignette eskil={false} offset={0.15} darkness={0.9} />
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
