"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface IsometricBuildingProps {
  position?: [number, number, number];
  width?: number;
  depth?: number;
  height?: number;
  color?: string;
  roofColor?: string;
  windowColor?: string;
  windowRows?: number;
  windowCols?: number;
  flickerRate?: number;
}

/**
 * IsometricBuilding — three-face render (front, side, roof).
 * Windows have amber glow + independent flicker at ~2%/sec.
 */
export function IsometricBuilding({
  position = [0, 0, 0],
  width = 4,
  depth = 3,
  height = 6,
  color = "#18151C",
  roofColor = "#201D26",
  windowColor = "#C8973A",
  windowRows = 3,
  windowCols = 2,
  flickerRate = 0.02,
}: IsometricBuildingProps) {
  const windowRefs = useRef<THREE.Mesh[]>([]);

  // Pre-compute random phase offsets for each window
  const phasesRef = useRef<number[]>([]);
  useEffect(() => {
    const total = windowRows * windowCols * 2; // front + side
    phasesRef.current = Array.from({ length: total }, () => Math.random() * Math.PI * 2);
  }, [windowRows, windowCols]);

  // Front face brightness = 1.0, side = 0.75, roof = 0.6
  const frontColor = useMemo(() => new THREE.Color(color), [color]);
  const sideColor = useMemo(() => new THREE.Color(color).multiplyScalar(0.75), [color]);
  const roofFinal = useMemo(() => new THREE.Color(roofColor).multiplyScalar(0.6), [roofColor]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    windowRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      // ~2% chance per second to flicker; use sine wave for smooth variation
      const flicker = Math.sin(t * 1.5 + (phasesRef.current[i] ?? 0)) > 0.97 - flickerRate ? 0.3 : 1.0;
      mat.emissiveIntensity = 0.6 * flicker;
    });
  });

  const windowW = width * 0.18;
  const windowH = height / (windowRows + 1) * 0.5;

  const setWindowRef = (el: THREE.Mesh | null, idx: number) => {
    if (el) windowRefs.current[idx] = el;
  };

  return (
    <group position={position}>
      {/* Main body */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={frontColor} metalness={0.15} roughness={0.7} />
      </mesh>

      {/* Roof */}
      <mesh position={[0, height + 0.1, 0]}>
        <boxGeometry args={[width + 0.3, 0.2, depth + 0.3]} />
        <meshStandardMaterial color={roofFinal} metalness={0.3} roughness={0.5} />
      </mesh>

      {/* Front windows */}
      {Array.from({ length: windowRows * windowCols }).map((_, i) => {
        const row = Math.floor(i / windowCols);
        const col = i % windowCols;
        const x = (col - (windowCols - 1) / 2) * (width / (windowCols + 1));
        const y = (row + 1) * (height / (windowRows + 1));
        return (
          <mesh
            key={`f-${i}`}
            ref={(el) => setWindowRef(el, i)}
            position={[x, y, depth / 2 + 0.01]}
          >
            <planeGeometry args={[windowW, windowH]} />
            <meshStandardMaterial
              color={windowColor}
              emissive={windowColor}
              emissiveIntensity={0.6}
              transparent
              opacity={0.9}
            />
          </mesh>
        );
      })}

      {/* Side windows */}
      {Array.from({ length: windowRows * windowCols }).map((_, i) => {
        const row = Math.floor(i / windowCols);
        const col = i % windowCols;
        const z = (col - (windowCols - 1) / 2) * (depth / (windowCols + 1));
        const y = (row + 1) * (height / (windowRows + 1));
        const offset = windowRows * windowCols;
        return (
          <mesh
            key={`s-${i}`}
            ref={(el) => setWindowRef(el, i + offset)}
            position={[width / 2 + 0.01, y, z]}
            rotation={[0, Math.PI / 2, 0]}
          >
            <planeGeometry args={[windowW * (depth / width), windowH]} />
            <meshStandardMaterial
              color={windowColor}
              emissive={windowColor}
              emissiveIntensity={0.45}
              transparent
              opacity={0.8}
            />
          </mesh>
        );
      })}
    </group>
  );
}
