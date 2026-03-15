"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { COLORS } from "@/lib/theme";

/* ── Instanced spectator orbs ────────────────────────────── */
interface SpectatorOrbsProps {
    count?: number;
    zone?: string;
    center?: [number, number, number];
    radius?: number;
}

export function SpectatorOrbs({
    count = 50,
    center = [0, 4, 0],
    radius = 8,
}: SpectatorOrbsProps) {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    const offsets = useMemo(() => {
        return Array.from({ length: count }, () => ({
            angle: Math.random() * Math.PI * 2,
            height: 3 + Math.random() * 3,
            r: radius * 0.4 + Math.random() * radius * 0.6,
            speed: 0.1 + Math.random() * 0.3,
            phase: Math.random() * Math.PI * 2,
        }));
    }, [count, radius]);

    useFrame((_, delta) => {
        if (!meshRef.current) return;
        for (let i = 0; i < count; i++) {
            const o = offsets[i];
            o.angle += delta * o.speed * 0.1;
            const x = center[0] + Math.cos(o.angle) * o.r;
            const y = center[1] + o.height + Math.sin(Date.now() * 0.001 + o.phase) * 0.3;
            const z = center[2] + Math.sin(o.angle) * o.r;
            dummy.position.set(x, y, z);
            dummy.scale.setScalar(0.06 + Math.sin(Date.now() * 0.003 + o.phase) * 0.02);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshStandardMaterial
                color={COLORS.textMuted}
                emissive={COLORS.textMuted}
                emissiveIntensity={0.1}
                transparent
                opacity={0.6}
            />
        </instancedMesh>
    );
}

/* ── Environmental particle system ───────────────────────── */
interface EnvironmentParticlesProps {
    count?: number;
    area?: number;
    color?: string;
    speed?: number;
}

export function EnvironmentParticles({
    count = 300,
    area = 40,
    color = COLORS.textMuted,
    speed = 0.05,
}: EnvironmentParticlesProps) {
    const ref = useRef<THREE.Points>(null);

    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * area;
            pos[i * 3 + 1] = Math.random() * 15;
            pos[i * 3 + 2] = (Math.random() - 0.5) * area;
        }
        return pos;
    }, [count, area]);

    useFrame((_, delta) => {
        if (!ref.current) return;
        const posArray = ref.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < count; i++) {
            posArray[i * 3 + 1] += delta * speed * 2;
            if (posArray[i * 3 + 1] > 15) {
                posArray[i * 3 + 1] = 0;
                posArray[i * 3] = (Math.random() - 0.5) * area;
                posArray[i * 3 + 2] = (Math.random() - 0.5) * area;
            }
        }
        ref.current.geometry.attributes.position.needsUpdate = true;
        ref.current.rotation.y += delta * 0.01;
    });

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial
                size={0.04}
                color={color}
                transparent
                opacity={0.3}
                sizeAttenuation
            />
        </points>
    );
}

/* ── Victory particle burst ──────────────────────────────── */
interface VictoryParticlesProps {
    position?: [number, number, number];
    active?: boolean;
    color?: string;
}

export function VictoryParticles({
    position = [0, 0, 0],
    active = false,
    color = COLORS.gold,
}: VictoryParticlesProps) {
    const ref = useRef<THREE.Points>(null);
    const count = 200;
    const time = useRef(0);

    const positions = useMemo(() => new Float32Array(count * 3), []);

    useFrame((_, delta) => {
        if (!ref.current || !active) return;
        time.current += delta;

        const posArray = ref.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < count; i++) {
            const t = time.current * 2 + i * 0.05;
            const angle = (i / count) * Math.PI * 2;
            const r = Math.sin(t) * 2 + 1;
            posArray[i * 3] = position[0] + Math.cos(angle + t * 0.5) * r;
            posArray[i * 3 + 1] = position[1] + Math.abs(Math.sin(t + i * 0.1)) * 4;
            posArray[i * 3 + 2] = position[2] + Math.sin(angle + t * 0.5) * r;
        }
        ref.current.geometry.attributes.position.needsUpdate = true;
    });

    if (!active) return null;

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial size={0.08} color={color} transparent opacity={0.8} sizeAttenuation />
        </points>
    );
}

/* ── Token rain (bet payout visualization) ───────────────── */
interface TokenRainProps {
    position?: [number, number, number];
    active?: boolean;
    amount?: number;
}

export function TokenRain({
    position = [0, 8, 0],
    active = false,
    amount = 100,
}: TokenRainProps) {
    const ref = useRef<THREE.Points>(null);
    const count = Math.min(amount, 200);

    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = position[0] + (Math.random() - 0.5) * 2;
            pos[i * 3 + 1] = position[1] + Math.random() * 3;
            pos[i * 3 + 2] = position[2] + (Math.random() - 0.5) * 2;
        }
        return pos;
    }, [count, position]);

    useFrame((_, delta) => {
        if (!ref.current || !active) return;
        const posArray = ref.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < count; i++) {
            posArray[i * 3 + 1] -= delta * (1 + Math.random());
            if (posArray[i * 3 + 1] < 0) {
                posArray[i * 3 + 1] = position[1] + Math.random() * 2;
            }
        }
        ref.current.geometry.attributes.position.needsUpdate = true;
    });

    if (!active) return null;

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial size={0.1} color={COLORS.gold} transparent opacity={0.9} sizeAttenuation />
        </points>
    );
}
