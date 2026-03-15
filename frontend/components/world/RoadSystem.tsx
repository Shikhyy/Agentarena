"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { COLORS } from "@/lib/theme";

interface RoadSegment {
  from: [number, number, number];
  to: [number, number, number];
}

/** District positions matching ArenaWorld3D zone placement. */
const DISTRICTS: Record<string, [number, number, number]> = {
  nexus: [0, 0, 0],
  chess: [0, 0, -60],
  poker: [60, 0, 0],
  monopoly: [-60, 0, 0],
  workshop: [0, 0, 60],
  marketplace: [45, 0, 45],
  hallOfFame: [-45, 0, -45],
  grandArena: [0, 0, -120],
};

/** Road connections between districts. */
const ROAD_SEGMENTS: RoadSegment[] = [
  { from: DISTRICTS.nexus, to: DISTRICTS.chess },
  { from: DISTRICTS.nexus, to: DISTRICTS.poker },
  { from: DISTRICTS.nexus, to: DISTRICTS.monopoly },
  { from: DISTRICTS.nexus, to: DISTRICTS.workshop },
  { from: DISTRICTS.nexus, to: DISTRICTS.marketplace },
  { from: DISTRICTS.nexus, to: DISTRICTS.hallOfFame },
  { from: DISTRICTS.chess, to: DISTRICTS.grandArena },
  { from: DISTRICTS.marketplace, to: DISTRICTS.workshop },
  { from: DISTRICTS.hallOfFame, to: DISTRICTS.monopoly },
];

function Road({ from, to }: RoadSegment) {
  const { position, rotation, length } = useMemo(() => {
    const dx = to[0] - from[0];
    const dz = to[2] - from[2];
    const len = Math.sqrt(dx * dx + dz * dz);
    const angle = Math.atan2(dx, dz);
    return {
      position: [
        (from[0] + to[0]) / 2,
        0.03,
        (from[2] + to[2]) / 2,
      ] as [number, number, number],
      rotation: [0, angle, 0] as [number, number, number],
      length: len,
    };
  }, [from, to]);

  // Dashed centre line
  const dashCount = Math.floor(length / 3);

  return (
    <group position={position} rotation={rotation}>
      {/* Road surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[3, length]} />
        <meshStandardMaterial
          color="#0F0D0B"
          metalness={0.1}
          roughness={0.85}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Road borders */}
      {[-1.5, 1.5].map((offset, i) => (
        <mesh key={i} position={[offset, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.06, length]} />
          <meshStandardMaterial
            color={COLORS.goldDim}
            emissive={COLORS.goldDim}
            emissiveIntensity={0.15}
            transparent
            opacity={0.4}
          />
        </mesh>
      ))}

      {/* Dashed centre line */}
      {Array.from({ length: dashCount }).map((_, i) => {
        const zPos = (i - dashCount / 2 + 0.5) * 3;
        return (
          <mesh key={i} position={[0, 0.02, zPos]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.08, 1.2]} />
            <meshStandardMaterial
              color={COLORS.goldDim}
              emissive={COLORS.goldDim}
              emissiveIntensity={0.1}
              transparent
              opacity={0.3}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/**
 * RoadSystem — renders road meshes connecting all districts.
 * Dashed centre lines, gold edge markers.
 */
export function RoadSystem() {
  return (
    <group>
      {ROAD_SEGMENTS.map((seg, i) => (
        <Road key={i} from={seg.from} to={seg.to} />
      ))}
    </group>
  );
}

/** Exported for pathfinding: intersection nodes. */
export const ROAD_NODES = DISTRICTS;
