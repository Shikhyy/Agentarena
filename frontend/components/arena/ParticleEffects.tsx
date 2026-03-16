"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { COLORS } from "@/lib/theme";

interface ParticleEffectsProps {
    active: boolean;
    type: string;
    position: [number, number, number];
    count?: number;
    radius?: number;
}

/** Instanced neon particle burst for arena events (captures, checks, wins, etc.) */
export function ParticleEffects({
    active,
    type,
    position,
    count = 40,
    radius = 2,
}: ParticleEffectsProps) {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const clock = useRef(0);

    // Map effect type to neon color
    const color = useMemo(() => {
        switch (type) {
            case "capture":
            case "check":
                return COLORS.red;
            case "win":
            case "victory":
            case "gold":
                return COLORS.gold;
            case "move":
                return COLORS.gold;
            case "buzz":
                return COLORS.tealLight;
            case "bet":
            case "pink":
                return COLORS.redBright;
            default:
                return COLORS.gold;
        }
    }, [type]);

    // Pre-compute random offsets per particle
    const offsetsRef = useRef<{ angle: number; speed: number; ySpeed: number; phase: number; size: number }[]>([]);
    useEffect(() => {
        const arr: { angle: number; speed: number; ySpeed: number; phase: number; size: number }[] = [];
        for (let i = 0; i < count; i++) {
            arr.push({
                angle: Math.random() * Math.PI * 2,
                speed: 0.3 + Math.random() * 1.2,
                ySpeed: 0.5 + Math.random() * 1.5,
                phase: Math.random() * Math.PI * 2,
                size: 0.02 + Math.random() * 0.06,
            });
        }
        offsetsRef.current = arr;
    }, [count]);

    useFrame((_, delta) => {
        if (!meshRef.current || !active) return;
        if (offsetsRef.current.length === 0) return;
        clock.current += delta;
        const t = clock.current;

        for (let i = 0; i < count; i++) {
            const o = offsetsRef.current[i];
            const r = radius * (0.3 + 0.7 * Math.sin(t * o.speed + o.phase));
            const x = Math.cos(o.angle + t * 0.5) * r;
            const z = Math.sin(o.angle + t * 0.5) * r;
            const y = Math.sin(t * o.ySpeed + o.phase) * radius * 0.6;

            dummy.position.set(x, y, z);
            dummy.scale.setScalar(o.size * (0.5 + 0.5 * Math.sin(t * 3 + o.phase)));
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    if (!active) return null;

    return (
        <group position={position}>
            <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
                <sphereGeometry args={[1, 8, 8]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={0.9}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </instancedMesh>

            {/* Central glow point light */}
            <pointLight color={color} intensity={2} distance={radius * 3} decay={2} />
        </group>
    );
}
