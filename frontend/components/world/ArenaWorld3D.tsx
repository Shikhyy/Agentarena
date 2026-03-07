"use client";

import React, { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, Environment, OrbitControls, PerspectiveCamera, AdaptiveDpr, AdaptiveEvents } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { useWorldStore, WORLD_ZONES } from "@/lib/worldStore";
import { WebGLSafeCanvas } from "./WebGLErrorBoundary";

/* ── Zone lazy imports ───────────────────────────────────── */
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

/* ── Loading fallback ────────────────────────────────────── */
function LoadingFallback() {
    const ref = useRef<THREE.Mesh>(null);
    useFrame((_, delta) => {
        if (ref.current) ref.current.rotation.y += delta * 2;
    });

    return (
        <mesh ref={ref} position={[0, 2, 0]}>
            <octahedronGeometry args={[0.5, 0]} />
            <meshStandardMaterial color="#6C3AED" emissive="#6C3AED" emissiveIntensity={0.6} wireframe />
        </mesh>
    );
}

/* ── Fog & atmosphere ────────────────────────────────────── */
function Atmosphere() {
    return <fogExp2 attach="fog" args={["#050210", 0.008]} />;
}



/* ── Chess arena zone ────────────────────────────────────── */
function ChessZone() {
    const agents = useWorldStore((s) => s.agents);
    const liveMatches = useWorldStore((s) => s.liveMatches);
    const selectAgent = useWorldStore((s) => s.selectAgent);

    const chessAgents = agents.filter((a) => a.zone === "arena-chess");
    const chessMatch = liveMatches.find((m) => m.gameType === "chess");

    return (
        <>
            {/* Arena hall structure (offset so its local origin = zone center) */}
            <group position={[0, 0, -60]}>
                <ArenaHall3D hallName="Chess Arena" hallColor="#6C3AED" spectatorCount={chessMatch?.spectators ?? 0}>
                    {/* Simplified chess table */}
                    <group position={[0, 1, 0]}>
                        {/* Board */}
                        <mesh position={[0, 0.5, 0]} castShadow>
                            <boxGeometry args={[4, 0.15, 4]} />
                            <meshStandardMaterial color="#2a1f5e" metalness={0.4} roughness={0.3} />
                        </mesh>
                        {/* Tiles 8×8 */}
                        {Array.from({ length: 64 }).map((_, i) => {
                            const row = Math.floor(i / 8);
                            const col = i % 8;
                            const isLight = (row + col) % 2 === 0;
                            return (
                                <mesh
                                    key={i}
                                    position={[(col - 3.5) * 0.48, 0.58, (row - 3.5) * 0.48]}
                                >
                                    <boxGeometry args={[0.46, 0.02, 0.46]} />
                                    <meshStandardMaterial
                                        color={isLight ? "#e0d4f5" : "#3b2d7a"}
                                        metalness={0.2}
                                        roughness={0.6}
                                    />
                                </mesh>
                            );
                        })}
                        {/* Table legs */}
                        {[[-1.5, -0.25, -1.5], [1.5, -0.25, -1.5], [-1.5, -0.25, 1.5], [1.5, -0.25, 1.5]].map(
                            (pos, i) => (
                                <mesh key={i} position={pos as [number, number, number]} castShadow>
                                    <cylinderGeometry args={[0.08, 0.08, 1, 6]} />
                                    <meshStandardMaterial color="#1a0f3a" metalness={0.5} roughness={0.4} />
                                </mesh>
                            )
                        )}
                    </group>
                </ArenaHall3D>
            </group>

            {/* Agents use absolute world coords from the store */}
            {chessAgents.map((a) => (
                <AgentCharacter3D key={a.id} agent={a} onClick={() => selectAgent(a.id)} />
            ))}

            {/* Commentator booth — absolute world position near chess zone */}
            {chessMatch && (
                <CommentatorAvatar3D
                    position={[8, 0, -60]}
                    matchLabel={`${chessMatch.agentA.name} vs ${chessMatch.agentB.name}`}
                    spectators={chessMatch.spectators}
                />
            )}

            {/* Betting terminal — absolute world position */}
            {chessMatch && (
                <BettingTerminal3D
                    position={[-8, 0, -55]}
                    matchLabel={`${chessMatch.agentA.name} vs ${chessMatch.agentB.name}`}
                    odds={chessMatch.odds}
                    pool={chessMatch.pool}
                />
            )}

            {/* Spectator orbs — absolute center */}
            <SpectatorOrbs count={chessMatch?.spectators ?? 10} center={[0, 4, -60]} />
        </>
    );
}

/* ── Poker arena zone ────────────────────────────────────── */
function PokerZone() {
    const agents = useWorldStore((s) => s.agents);
    const liveMatches = useWorldStore((s) => s.liveMatches);
    const selectAgent = useWorldStore((s) => s.selectAgent);

    const pokerAgents = agents.filter((a) => a.zone === "arena-poker");
    const pokerMatch = liveMatches.find((m) => m.gameType === "poker");

    return (
        <>
            {/* Arena hall structure */}
            <group position={[60, 0, 0]}>
                <ArenaHall3D hallName="Poker Den" hallColor="#10B981" spectatorCount={pokerMatch?.spectators ?? 0}>
                    {/* Poker table */}
                    <group position={[0, 1, 0]}>
                        <mesh position={[0, 0.5, 0]} castShadow>
                            <cylinderGeometry args={[2.5, 2.5, 0.2, 32]} />
                            <meshStandardMaterial color="#064e3b" metalness={0.2} roughness={0.7} />
                        </mesh>
                        {/* Felt */}
                        <mesh position={[0, 0.61, 0]}>
                            <cylinderGeometry args={[2.3, 2.3, 0.01, 32]} />
                            <meshStandardMaterial color="#047857" roughness={0.95} />
                        </mesh>
                        {/* Edge rim */}
                        <mesh position={[0, 0.55, 0]}>
                            <torusGeometry args={[2.4, 0.12, 8, 32]} />
                            <meshStandardMaterial color="#1a0f3a" metalness={0.6} roughness={0.3} />
                        </mesh>
                    </group>
                </ArenaHall3D>
            </group>

            {/* Agents at absolute world positions */}
            {pokerAgents.map((a) => (
                <AgentCharacter3D key={a.id} agent={a} onClick={() => selectAgent(a.id)} />
            ))}

            {/* Commentator — absolute world position near poker zone */}
            {pokerMatch && (
                <CommentatorAvatar3D
                    position={[68, 0, 8]}
                    matchLabel={`${pokerMatch.agentA.name} vs ${pokerMatch.agentB.name}`}
                    spectators={pokerMatch.spectators}
                />
            )}

            {/* Betting terminal — absolute world position */}
            {pokerMatch && (
                <BettingTerminal3D
                    position={[55, 0, 8]}
                    matchLabel={`${pokerMatch.agentA.name} vs ${pokerMatch.agentB.name}`}
                    odds={pokerMatch.odds}
                    pool={pokerMatch.pool}
                />
            )}

            <SpectatorOrbs count={pokerMatch?.spectators ?? 8} center={[60, 4, 0]} />
        </>
    );
}

/* ── Entire world scene ──────────────────────────────────── */
function WorldScene() {
    const setPlayerTarget = useWorldStore((s) => s.setPlayerTarget);

    return (
        <>
            <Atmosphere />
            <PerspectiveCamera makeDefault position={[0, 100, 100]} fov={75} near={0.1} far={2000} />
            <PlayerController />

            {/* Skybox & environment */}
            <Stars radius={200} depth={80} count={2000} factor={4} fade speed={0.5} />
            <color attach="background" args={["#050210"]} />

            {/* MVP 3D WORLD ENGINE TICK: 0.3 ambient + 3 directional (key, fill, rim) */}
            <ambientLight intensity={0.3} />
            <directionalLight position={[30, 50, 30]} intensity={1.5} color="#4C1D95" castShadow /> {/* Cool Key */}
            <directionalLight position={[-40, 20, -10]} intensity={1.0} color="#F59E0B" /> {/* Warm Fill */}
            <directionalLight position={[0, 40, -60]} intensity={2.0} color="#D8B4FE" /> {/* Rim Light */}

            {/* Post-Processing MVP Tick: Bloom (1.2), Vignette */}
            <EffectComposer>
                <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} intensity={1.2} />
                <Vignette eskil={false} offset={0.1} darkness={1.1} />
            </EffectComposer>

            {/* Zones */}
            <Suspense fallback={<LoadingFallback />}>
                <CentralNexus />
            </Suspense>

            <Suspense fallback={<LoadingFallback />}>
                <ChessZone />
            </Suspense>

            <Suspense fallback={<LoadingFallback />}>
                <PokerZone />
            </Suspense>

            <Suspense fallback={<LoadingFallback />}>
                <WorkshopZone />
            </Suspense>

            <Suspense fallback={<LoadingFallback />}>
                <MonopolyZone />
            </Suspense>

            <Suspense fallback={<LoadingFallback />}>
                <GrandArenaZone />
            </Suspense>

            <Suspense fallback={<LoadingFallback />}>
                <HallOfFameZone />
            </Suspense>

            <Suspense fallback={<LoadingFallback />}>
                <MarketplaceZone />
            </Suspense>

            {/* Ground plane extending beyond nexus - Click to move */}
            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -0.1, 0]}
                receiveShadow
                onPointerDown={(e) => {
                    e.stopPropagation();
                    setPlayerTarget([e.point.x, 0, e.point.z]);
                }}
            >
                <planeGeometry args={[600, 600]} />
                <meshStandardMaterial color="#030108" metalness={0} roughness={1} />
            </mesh>
        </>
    );
}

/* ── Exported Canvas wrapper ─────────────────────────────── */
export default function ArenaWorld3D() {
    const qualityPreset = useWorldStore((s) => s.qualityPreset);

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
            shadows
            gl={{ antialias: qualityPreset !== "low", powerPreference: "high-performance" }}
            style={{ position: "absolute", inset: 0 }}
            onCreated={({ gl }) => {
                if (gl && gl.domElement) {
                    gl.domElement.addEventListener('webglcontextlost', (e) => {
                        e.preventDefault();
                        console.error('WebGL context lost');
                    }, false);
                }
            }}
        >
            <AdaptiveDpr pixelated />
            <AdaptiveEvents />
            <WorldScene />
        </WebGLSafeCanvas>
    );
}
