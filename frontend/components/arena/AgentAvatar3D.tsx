"use client";

import { useGLTF, useAnimations } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { Group } from "three";

export function AgentAvatar3D({ modelUrl, idleAnimation = true }: { modelUrl?: string, idleAnimation?: boolean }) {
    // Basic placeholder for the 3D Agent Avatar
    return (
        <mesh position={[0, -1, 0]}>
            <cylinderGeometry args={[1, 1, 2, 32]} />
            <meshStandardMaterial color={modelUrl?.includes("agent-a") ? "#10B981" : "#6C3AED"} />
        </mesh>
    );
}
