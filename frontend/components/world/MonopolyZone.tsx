"use client";

import { useWorldStore } from "@/lib/worldStore";
import { ArenaHall3D } from "./ArenaHall3D";
import { CommentatorAvatar3D } from "./CommentatorAvatar3D";
import { BettingTerminal3D } from "./BettingTerminal3D";
import { SpectatorOrbs } from "./SpectatorOrbs";
import { AgentCharacter3D } from "./AgentCharacter3D";
import * as THREE from "three";
import { COLORS } from "@/lib/theme";

export function MonopolyZone({ gameState }: { gameState?: any }) {
    const agents = useWorldStore((s) => s.agents);
    const liveMatches = useWorldStore((s) => s.liveMatches);
    const selectAgent = useWorldStore((s) => s.selectAgent);

    const monopolyAgents = agents.filter((a) => a.zone === "arena-monopoly");
    const monopolyMatch = liveMatches.find((m) => m.gameType === "monopoly");

    return (
        <>
            <group position={[-60, 0, 0]}>
                <ArenaHall3D hallName="Monopoly Square" hallColor={COLORS.gold} spectatorCount={monopolyMatch?.spectators ?? 0}>
                    {/* Monopoly Board Center */}
                    <group position={[0, 1, 0]}>
                        {/* Dark board base */}
                        <mesh position={[0, 0.4, 0]} castShadow>
                            <boxGeometry args={[4, 0.2, 4]} />
                            <meshStandardMaterial
                                color={COLORS.card}
                                emissive={COLORS.gold}
                                emissiveIntensity={0.05}
                                metalness={0.3}
                                roughness={0.6}
                            />
                        </mesh>

                        {/* Property squares with neon colors */}
                        {Array.from({ length: 40 }).map((_, i) => {
                            const side = Math.floor(i / 10);
                            const posOnSide = (i % 10) - 4.5;
                            let x = 0, z = 0;
                            if (side === 0) { x = posOnSide * 0.4; z = -1.8; }
                            else if (side === 1) { x = 1.8; z = posOnSide * 0.4; }
                            else if (side === 2) { x = -posOnSide * 0.4; z = 1.8; }
                            else { x = -1.8; z = -posOnSide * 0.4; }

                            const isCorner = i % 10 === 0;
                            const owner = gameState?.properties?.find((p: any) => p.position === i)?.owner;
                            const dynamicColor = owner
                                ? (owner === "agent_monopoly_a" ? COLORS.gold : COLORS.redBright)
                                : [COLORS.redBright, COLORS.gold, COLORS.tealLight, COLORS.gold][i % 4];
                            const color = isCorner ? COLORS.structure : dynamicColor;

                            return (
                                <mesh key={i} position={[x, 0.52, z]}>
                                    <boxGeometry args={isCorner ? [0.6, 0.05, 0.6] : [0.35, 0.05, 0.35]} />
                                    <meshStandardMaterial
                                        color={color}
                                        emissive={color}
                                        emissiveIntensity={isCorner ? 0.1 : 0.5}
                                    />
                                </mesh>
                            );
                        })}
                    </group>
                </ArenaHall3D>
            </group>

            {monopolyAgents.map((a) => (
                <AgentCharacter3D key={a.id} agent={a} onClick={() => selectAgent(a.id)} />
            ))}

            {monopolyMatch && (
                <CommentatorAvatar3D
                    position={[-68, 0, -8]}
                    matchLabel={`${monopolyMatch.agentA.name} vs ${monopolyMatch.agentB.name}`}
                    spectators={monopolyMatch.spectators}
                />
            )}

            {monopolyMatch && (
                <BettingTerminal3D
                    position={[-55, 0, -8]}
                    matchLabel={`${monopolyMatch.agentA.name} vs ${monopolyMatch.agentB.name}`}
                    odds={monopolyMatch.odds}
                    pool={monopolyMatch.pool}
                />
            )}

            <SpectatorOrbs count={monopolyMatch?.spectators ?? 10} center={[-60, 4, 0]} />
        </>
    );
}
