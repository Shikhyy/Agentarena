"use client";

import { useWorldStore } from "@/lib/worldStore";
import { ArenaHall3D } from "./ArenaHall3D";
import { CommentatorAvatar3D } from "./CommentatorAvatar3D";
import { BettingTerminal3D } from "./BettingTerminal3D";
import { SpectatorOrbs } from "./SpectatorOrbs";
import { AgentCharacter3D } from "./AgentCharacter3D";
import * as THREE from "three";

export function MonopolyZone({ gameState }: { gameState?: any }) {
    const agents = useWorldStore((s) => s.agents);
    const liveMatches = useWorldStore((s) => s.liveMatches);
    const selectAgent = useWorldStore((s) => s.selectAgent);

    const monopolyAgents = agents.filter((a) => a.zone === "arena-monopoly");
    const monopolyMatch = liveMatches.find((m) => m.gameType === "monopoly");

    // Position [-60, 0, 0] per WORLD_ZONES
    return (
        <>
            <group position={[-60, 0, 0]}>
                <ArenaHall3D hallName="Monopoly Square" hallColor="#EF4444" spectatorCount={monopolyMatch?.spectators ?? 0}>
                    {/* Monopoly Board Center */}
                    <group position={[0, 1, 0]}>
                        <mesh position={[0, 0.4, 0]} castShadow>
                            <boxGeometry args={[4, 0.2, 4]} />
                            <meshStandardMaterial color="#A5F3FC" metalness={0.1} roughness={0.9} />
                        </mesh>

                        {/* Fake properties bordering */}
                        {Array.from({ length: 40 }).map((_, i) => {
                            // Simple layout calculation
                            const side = Math.floor(i / 10);
                            const posOnSide = (i % 10) - 4.5;
                            let x = 0, z = 0;
                            if (side === 0) { x = posOnSide * 0.4; z = -1.8; }
                            else if (side === 1) { x = 1.8; z = posOnSide * 0.4; }
                            else if (side === 2) { x = -posOnSide * 0.4; z = 1.8; }
                            else { x = -1.8; z = -posOnSide * 0.4; }

                            const isCorner = i % 10 === 0;
                            // Optionally map gameState.properties[i].owner to a specific color
                            const owner = gameState?.properties?.find((p: any) => p.position === i)?.owner;
                            const dynamicColor = owner ? (owner === "agent_monopoly_a" ? "#00E5FF" : "#FF2D9B") : ["#EF4444", "#3B82F6", "#10B981", "#F59E0B"][i % 4];
                            const color = isCorner ? "#000" : dynamicColor;

                            return (
                                <mesh key={i} position={[x, 0.52, z]}>
                                    <boxGeometry args={isCorner ? [0.6, 0.05, 0.6] : [0.35, 0.05, 0.35]} />
                                    <meshStandardMaterial color={color} />
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

