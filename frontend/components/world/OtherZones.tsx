"use client";

import { ArenaHall3D } from "./ArenaHall3D";
import { Text } from "@react-three/drei";

export function GrandArenaZone() {
    return (
        <group position={[0, 10, -120]}>
            <ArenaHall3D hallName="Grand Arena" hallColor="#EF4444" spectatorCount={0}>
                <mesh position={[0, 1, 0]}>
                    <cylinderGeometry args={[4, 5, 2, 32]} />
                    <meshStandardMaterial color="#EF4444" metalness={0.5} roughness={0.2} emissive="#EF4444" emissiveIntensity={0.2} />
                </mesh>
                <Text position={[0, 3, 0]} fontSize={0.5} color="#FFF">GRAND PRIX WEEKLY</Text>
            </ArenaHall3D>
        </group>
    );
}

export function HallOfFameZone() {
    return (
        <group position={[-45, 0, -45]}>
            <ArenaHall3D hallName="Hall of Fame" hallColor="#F59E0B" spectatorCount={0}>
                {Array.from({length: 3}).map((_, i) => (
                    <group key={i} position={[(i-1)*3, 2, 0]}>
                        <mesh castShadow>
                            <boxGeometry args={[1, 4, 1]} />
                            <meshStandardMaterial color="#F59E0B" metalness={0.8} roughness={0.2} />
                        </mesh>
                        <mesh position={[0, 2.5, 0]}>
                            <sphereGeometry args={[0.5, 32, 32]} />
                            <meshStandardMaterial color="#FFF" emissive="#FFF" emissiveIntensity={2} />
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
            <ArenaHall3D hallName="Marketplace" hallColor="#FBBF24" spectatorCount={0}>
                {Array.from({length: 5}).map((_, i) => (
                    <mesh key={i} position={[Math.cos(i*Math.PI*2/5)*3, 1, Math.sin(i*Math.PI*2/5)*3]}>
                        <cylinderGeometry args={[0.5, 0.5, 1, 8]} />
                        <meshStandardMaterial color="#000" emissive="#FBBF24" emissiveIntensity={0.5} wireframe />
                    </mesh>
                ))}
                <Text position={[0, 2, 0]} fontSize={0.5} color="#FBBF24">P2P TRADING</Text>
            </ArenaHall3D>
        </group>
    );
}
