"use client";

export function ParticleEffects({ active, type, position }: { active: boolean, type: string, position: [number, number, number] }) {
    if (!active) return null;

    // Very basic stand-in. In a real app this would use react-three-fiber instanced meshes
    return (
        <mesh position={position}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshBasicMaterial color={type === "capture" ? "#EF4444" : "#F59E0B"} wireframe />
        </mesh>
    );
}
