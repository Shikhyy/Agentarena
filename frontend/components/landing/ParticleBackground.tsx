"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Animated particle field for the landing hero.
 * Floating dots with subtle drift, colored in cyan/pink/gold.
 */
function Particles({ count = 200 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particlesRef = useRef<{ x: number; y: number; z: number; vx: number; vy: number; scale: number; colorIdx: number }[]>([]);
  useEffect(() => {
    particlesRef.current = Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 40,
      y: (Math.random() - 0.5) * 20,
      z: (Math.random() - 0.5) * 20,
      vx: (Math.random() - 0.5) * 0.003,
      vy: (Math.random() - 0.5) * 0.002,
      scale: 0.02 + Math.random() * 0.05,
      colorIdx: Math.floor(Math.random() * 3),
    }));
  }, [count]);

  const colors = useMemo(
    () => [
      new THREE.Color("#C8963C"),
      new THREE.Color("#C43030"),
      new THREE.Color("#C8963C"),
    ],
    []
  );

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const d = Math.min(delta, 0.1);
    if (particlesRef.current.length === 0) return;
    for (let i = 0; i < count; i++) {
      const p = particlesRef.current[i];
      p.x += p.vx + Math.sin(Date.now() * 0.0003 + i) * 0.001;
      p.y += p.vy + Math.cos(Date.now() * 0.0004 + i) * 0.0008;

      // Wrap
      if (p.x > 20) p.x = -20;
      if (p.x < -20) p.x = 20;
      if (p.y > 10) p.y = -10;
      if (p.y < -10) p.y = 10;

      dummy.position.set(p.x, p.y, p.z);
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
      meshRef.current.setColorAt(i, colors[p.colorIdx]);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial transparent opacity={0.6} />
    </instancedMesh>
  );
}

/** Thin connecting lines between nearby particles — gives a network feel */
function ConnectionLines() {
  return null; // Keep light for perf; particles alone look great
}

export function ParticleBackground() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        opacity: 0.6,
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 15], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Particles count={180} />
      </Canvas>
    </div>
  );
}
