"use client";

import { ArenaHall3D } from "./ArenaHall3D";
import { Text } from "@react-three/drei";
import { COLORS } from "@/lib/theme";

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
