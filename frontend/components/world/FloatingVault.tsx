"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Text } from "@react-three/drei";
import * as THREE from "three";
import { useWorldStore } from "@/lib/worldStore";
import { COLORS } from "@/lib/theme";

/**
 * FloatingVault — Gothic cylinder floating 8m above nexus centre.
 * Gold trim, breathing scale animation.
 * Sealed envelopes orbit when bets are active.
 * Scale grows with bet count (lerp 1.0→1.8).
 */
export function FloatingVault() {
  const groupRef = useRef<THREE.Group>(null);
  const cylinderRef = useRef<THREE.Mesh>(null);
  const trimRef = useRef<THREE.Mesh>(null);
  const envelopeRefs = useRef<THREE.Mesh[]>([]);

  const liveMatches = useWorldStore((s) => s.liveMatches);
  const activeBetCount = useMemo(() => {
    return liveMatches.reduce((acc, m) => acc + (m.pool > 0 ? 1 : 0), 0);
  }, [liveMatches]);

  const targetScale = useMemo(
    () => THREE.MathUtils.clamp(1.0 + activeBetCount * 0.15, 1.0, 1.8),
    [activeBetCount]
  );

  const envelopeCount = Math.min(activeBetCount, 8);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (groupRef.current) {
      // Breathing scale
      const breath = 1 + Math.sin(t * 0.6) * 0.03;
      const currentScale = groupRef.current.scale.x;
      const lerpedScale = THREE.MathUtils.lerp(currentScale, targetScale * breath, 0.02);
      groupRef.current.scale.setScalar(lerpedScale);

      // Gentle bob
      groupRef.current.position.y = 8 + Math.sin(t * 0.4) * 0.2;
    }

    if (cylinderRef.current) {
      cylinderRef.current.rotation.y = t * 0.1;
    }

    // Orbiting envelopes
    envelopeRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const angle = (i / envelopeCount) * Math.PI * 2 + t * 0.5;
      const radius = 2.5;
      mesh.position.x = Math.cos(angle) * radius;
      mesh.position.z = Math.sin(angle) * radius;
      mesh.position.y = Math.sin(t * 0.8 + i) * 0.3;
      mesh.rotation.y = -angle;
    });
  });

  return (
    <group ref={groupRef} position={[0, 8, 0]}>
      {/* Gothic cylinder body */}
      <mesh ref={cylinderRef} castShadow>
        <cylinderGeometry args={[1.5, 1.2, 3, 8]} />
        <meshPhysicalMaterial
          color="#18151C"
          metalness={0.4}
          roughness={0.3}
          emissive="#201D26"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Gold trim rings */}
      <mesh ref={trimRef} position={[0, 1.55, 0]}>
        <torusGeometry args={[1.55, 0.06, 8, 32]} />
        <meshStandardMaterial
          color={COLORS.gold}
          emissive={COLORS.gold}
          emissiveIntensity={0.5}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      <mesh position={[0, -1.55, 0]}>
        <torusGeometry args={[1.25, 0.06, 8, 32]} />
        <meshStandardMaterial
          color={COLORS.gold}
          emissive={COLORS.gold}
          emissiveIntensity={0.5}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Centre trim */}
      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[1.38, 0.04, 8, 32]} />
        <meshStandardMaterial
          color={COLORS.goldLight}
          emissive={COLORS.goldLight}
          emissiveIntensity={0.3}
          metalness={0.85}
          roughness={0.15}
        />
      </mesh>

      {/* Inner energy glow */}
      <mesh>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshStandardMaterial
          color={COLORS.gold}
          emissive={COLORS.gold}
          emissiveIntensity={0.8}
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Point light */}
      <pointLight color={COLORS.gold} intensity={1.5} distance={20} />

      {/* Orbiting sealed envelopes */}
      {Array.from({ length: envelopeCount }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) envelopeRefs.current[i] = el;
          }}
        >
          <boxGeometry args={[0.4, 0.25, 0.05]} />
          <meshStandardMaterial
            color={COLORS.goldDim}
            emissive={COLORS.gold}
            emissiveIntensity={0.4}
            metalness={0.6}
            roughness={0.3}
          />
        </mesh>
      ))}

      {/* Label */}
      <Float speed={0.5} floatIntensity={0.1}>
        <Text
          position={[0, 2.5, 0]}
          fontSize={0.3}
          color={COLORS.gold}
          anchorX="center"
          letterSpacing={0.15}
        >
          THE VAULT
        </Text>
      </Float>
    </group>
  );
}
