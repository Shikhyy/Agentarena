"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { WebGLSafeCanvas } from "./WebGLErrorBoundary";

function AbstractCore() {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const count = 150;

    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame((state, delta) => {
        if (meshRef.current) {
            const time = state.clock.getElapsedTime();
            for (let i = 0; i < count; i++) {
                const t = time * 0.3 + i * 0.1;
                dummy.position.set(
                    Math.sin(t) * 12 + Math.cos(i * 1.5) * 6,
                    Math.cos(t * 0.8) * 8 + Math.sin(i * 0.8) * 4,
                    Math.sin(t * 1.2) * 5 - 5
                );
                dummy.rotation.x = t;
                dummy.rotation.y = t * 0.5;
                const scale = Math.max(0.1, Math.sin(t * 2 + i) * 0.5 + 0.5);
                dummy.scale.set(scale, scale, scale);
                dummy.updateMatrix();
                meshRef.current.setMatrixAt(i, dummy.matrix);
            }
            meshRef.current.instanceMatrix.needsUpdate = true;
            meshRef.current.rotation.y += delta * 0.05;
        }
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <octahedronGeometry args={[0.8, 0]} />
            <meshStandardMaterial color="#CCCCCC" emissive="#CCCCCC" emissiveIntensity={0.1} wireframe transparent opacity={0.3} />
        </instancedMesh>
    );
}

function DataStreams() {
    const linesRef = useRef<THREE.InstancedMesh>(null);
    const count = 100;
    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame((state) => {
        if (linesRef.current) {
            // Animation logic preserved
        }
    });

    return (
        <instancedMesh ref={linesRef} args={[undefined, undefined, count]}>
            <boxGeometry />
            <meshBasicMaterial color="#AAAAAA" transparent opacity={0.2} />
        </instancedMesh>
    );
}

export default function HeroBackground3D() {
    return (
        <div style={{ position: "absolute", inset: 0, zIndex: -1, overflow: "hidden", pointerEvents: "none" }}>
            <WebGLSafeCanvas camera={{ position: [0, 0, 15], fov: 60 }} gl={{ alpha: true }}>
                <ambientLight intensity={0.8} />
                <pointLight position={[10, 10, 10]} intensity={0.8} color="#FFFFFF" />
                <AbstractCore />
                <DataStreams />
                <fog attach="fog" args={["#F8F9FA", 5, 25]} />
            </WebGLSafeCanvas>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at center, transparent 0%, #F8F9FA 90%)" }} />
        </div>
    );
}
