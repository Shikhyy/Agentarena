"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { COLORS } from "@/lib/theme";

/**
 * TorchFlicker — 0.6Hz flickering PointLights for atmospheric torch effects.
 */
export function TorchFlicker({
  position = [0, 3, 0] as [number, number, number],
  color = COLORS.goldLight,
  intensity = 1.5,
  distance = 15,
}) {
  const lightRef = useRef<THREE.PointLight>(null);
  const phaseRef = useRef(0);
  useEffect(() => { phaseRef.current = Math.random() * Math.PI * 2; }, []);

  useFrame((state) => {
    if (!lightRef.current) return;
    const t = state.clock.elapsedTime;
    // 0.6Hz base flicker + high-frequency noise
    const flicker =
      0.7 +
      Math.sin(t * 3.77 + phaseRef.current) * 0.15 +
      Math.sin(t * 7.3 + phaseRef.current * 2) * 0.08 +
      Math.sin(t * 0.5 + phaseRef.current) * 0.07;
    lightRef.current.intensity = intensity * flicker;
  });

  return <pointLight ref={lightRef} position={position} color={color} intensity={intensity} distance={distance} />;
}

/**
 * DustMotes — 300 GPU Points drifting with Perlin-like noise.
 */
export function DustMotes({
  count = 300,
  spread = 100,
  height = 20,
  color = COLORS.goldDim,
}) {
  const ref = useRef<THREE.Points>(null);
  const velocitiesRef = useRef(new Float32Array(count * 3));

  // Pre-compute initial positions so the first frame isn't all-zeros
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * spread;
      pos[i * 3 + 1] = Math.random() * height;
      pos[i * 3 + 2] = (Math.random() - 0.5) * spread;
      vel[i * 3] = (Math.random() - 0.5) * 0.3;
      vel[i * 3 + 1] = Math.random() * 0.1 + 0.02;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
    }
    velocitiesRef.current = vel;
    return pos;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, spread, height]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const geo = ref.current.geometry;
    const posAttr = geo.getAttribute("position") as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      arr[i * 3] += velocitiesRef.current[i * 3] * delta;
      arr[i * 3 + 1] += velocitiesRef.current[i * 3 + 1] * delta;
      arr[i * 3 + 2] += velocitiesRef.current[i * 3 + 2] * delta;

      // Wrap around
      if (arr[i * 3 + 1] > height) arr[i * 3 + 1] = 0;
      if (Math.abs(arr[i * 3]) > spread / 2) arr[i * 3] *= -0.9;
      if (Math.abs(arr[i * 3 + 2]) > spread / 2) arr[i * 3 + 2] *= -0.9;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.08} color={color} transparent opacity={0.3} sizeAttenuation />
    </points>
  );
}

/**
 * SpireBreathe — Subtle scale pulsing for tall structures.
 */
export function SpireBreathe({
  children,
  speed = 0.4,
  amplitude = 0.02,
}: {
  children: React.ReactNode;
  speed?: number;
  amplitude?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const phaseRef = useRef(0);
  useEffect(() => { phaseRef.current = Math.random() * Math.PI * 2; }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const scale = 1 + Math.sin(state.clock.elapsedTime * speed + phaseRef.current) * amplitude;
    groupRef.current.scale.setScalar(scale);
  });

  return <group ref={groupRef}>{children}</group>;
}

/**
 * WindowFlicker — Emissive intensity modulation for building windows.
 * Applied to a mesh material, flickers at ~2% chance per second.
 */
export function WindowFlicker({
  children,
  flickerChance = 0.02,
}: {
  children: React.ReactNode;
  flickerChance?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        const t = state.clock.elapsedTime;
        const hash = child.id * 12.9898;
        const shouldFlicker = Math.sin(t * 1.5 + hash) > 1 - flickerChance * 2;
        child.material.emissiveIntensity = shouldFlicker ? 0.15 : 0.6;
      }
    });
  });

  return <group ref={groupRef}>{children}</group>;
}

/**
 * OrbDrift — Perlin noise drift for spectator orbs / ambient particles.
 */
export function OrbDrift({
  position = [0, 5, 0] as [number, number, number],
  color = COLORS.gold,
  radius = 0.15,
  driftSpeed = 0.3,
  driftRange = 2,
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const offsetRef = useRef([0, 0, 0]);
  useEffect(() => { offsetRef.current = [Math.random() * 100, Math.random() * 100, Math.random() * 100]; }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime * driftSpeed;
    meshRef.current.position.x = position[0] + Math.sin(t + offsetRef.current[0]) * driftRange;
    meshRef.current.position.y = position[1] + Math.sin(t * 0.7 + offsetRef.current[1]) * driftRange * 0.5;
    meshRef.current.position.z = position[2] + Math.cos(t * 0.8 + offsetRef.current[2]) * driftRange;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[radius, 8, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={0.6} />
    </mesh>
  );
}

/**
 * VaultBob — Gentle vertical bobbing for the floating vault.
 */
export function VaultBob({
  children,
  speed = 0.4,
  amplitude = 0.3,
  baseY = 8,
}: {
  children: React.ReactNode;
  speed?: number;
  amplitude?: number;
  baseY?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.position.y = baseY + Math.sin(state.clock.elapsedTime * speed) * amplitude;
  });

  return <group ref={groupRef}>{children}</group>;
}
