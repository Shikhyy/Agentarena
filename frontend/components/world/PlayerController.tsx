"use client";

import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useWorldStore, WORLD_ZONES } from "@/lib/worldStore";

const WALK_SPEED = 15;

export function PlayerController() {
    const { camera } = useThree();
    const playerPos = useWorldStore((s) => s.playerPosition);
    const setPlayerPosition = useWorldStore((s) => s.setPlayerPosition);
    const playerTarget = useWorldStore((s) => s.playerTarget);
    const setPlayerTarget = useWorldStore((s) => s.setPlayerTarget);
    const appState = useWorldStore((s) => s.appState);
    const setAppState = useWorldStore((s) => s.setAppState);
    const setZone = useWorldStore((s) => s.setZone);

    const playerRef = useRef<THREE.Group>(null);
    const posVec = useRef(new THREE.Vector3(...playerPos));

    // Input state
    const keys = useRef({ w: false, a: false, s: false, d: false });

    // Cinematics state
    const cinematicTime = useRef(0);
    const cinematicStart = new THREE.Vector3(0, 80, 80);
    const entryTarget = new THREE.Vector3(0, 0, 10);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === ' ' && appState === "spawning") {
                setAppState("roaming");
                setPlayerPosition([entryTarget.x, 0, entryTarget.z]);
                posVec.current.set(entryTarget.x, 0, entryTarget.z);
            }
            if (e.key.toLowerCase() in keys.current) {
                keys.current[e.key.toLowerCase() as keyof typeof keys.current] = true;
                setPlayerTarget(null); // Cancel click-to-move if using WASD
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() in keys.current) {
                keys.current[e.key.toLowerCase() as keyof typeof keys.current] = false;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [appState, setAppState, setPlayerPosition, setPlayerTarget]);

    // Keep logical position synced with store teleport jumps
    useEffect(() => {
        posVec.current.set(...playerPos);
    }, [playerPos]);

    useFrame((_, delta) => {
        if (appState === "spawning") {
            cinematicTime.current += delta * 0.4;
            const t = Math.min(cinematicTime.current, 1);
            // Ease out cubic
            const ease = 1 - Math.pow(1 - t, 3);
            
            camera.position.lerpVectors(cinematicStart, new THREE.Vector3(entryTarget.x, entryTarget.y + 6, entryTarget.z + 12), ease);
            camera.lookAt(0, 2, 0);
            
            if (t >= 1) {
                setAppState("roaming");
                setPlayerPosition([entryTarget.x, 0, entryTarget.z]);
                posVec.current.set(entryTarget.x, 0, entryTarget.z);
            }
            return;
        }

        if (appState === "roaming") {
            let moved = false;

            // 1. WASD Movement
            const moveDir = new THREE.Vector3();
            if (keys.current.w) moveDir.z -= 1;
            if (keys.current.s) moveDir.z += 1;
            if (keys.current.a) moveDir.x -= 1;
            if (keys.current.d) moveDir.x += 1;

            if (moveDir.lengthSq() > 0) {
                moveDir.normalize().multiplyScalar(WALK_SPEED * delta);
                posVec.current.add(moveDir);
                moved = true;
            } 
            // 2. Click-to-Move interpolation
            else if (playerTarget) {
                const targetVec = new THREE.Vector3(...playerTarget);
                const dist = posVec.current.distanceTo(targetVec);
                if (dist > 0.1) {
                    const dir = targetVec.clone().sub(posVec.current).normalize();
                    const step = Math.min(dist, WALK_SPEED * delta);
                    posVec.current.add(dir.multiplyScalar(step));
                    moved = true;
                } else {
                    setPlayerTarget(null);
                }
            }

            // Sync visual representation
            if (playerRef.current) {
                playerRef.current.position.lerp(posVec.current, 0.3);
            }

            if (moved) {
                setPlayerPosition([posVec.current.x, posVec.current.y, posVec.current.z]);
                
                // Determine current zone based on proximity
                let closestZone = WORLD_ZONES[0].id;
                let minDist = Infinity;
                WORLD_ZONES.forEach(z => {
                    const dx = posVec.current.x - z.position[0];
                    const dz = posVec.current.z - z.position[2];
                    const d = Math.sqrt(dx*dx + dz*dz);
                    if (d < minDist) {
                        minDist = d;
                        closestZone = z.id;
                    }
                });
                
                // If within reasonable radius, set it
                if (minDist < 30) {
                    setZone(closestZone);
                } else {
                    setZone("central-nexus"); // Fallback
                }
            }

            // Camera smoothly follows player
            const idealCamPos = posVec.current.clone().add(new THREE.Vector3(0, 10, 15));
            camera.position.lerp(idealCamPos, 0.05);
            camera.lookAt(posVec.current.clone().add(new THREE.Vector3(0, 2, 0)));
        }
    });

    if (appState === "spawning") return null;

    return (
        <group ref={playerRef} position={playerPos}>
            <mesh position={[0, 1, 0]}>
                <sphereGeometry args={[0.4, 16, 16]} />
                <meshStandardMaterial color="#F59E0B" emissive="#F59E0B" emissiveIntensity={1} />
            </mesh>
            <pointLight position={[0, 2, 0]} color="#F59E0B" intensity={2} distance={10} />
            <mesh position={[0, 0.05, 0]} rotation={[-Math.PI/2, 0, 0]}>
                <ringGeometry args={[0.5, 0.7, 32]} />
                <meshBasicMaterial color="#F59E0B" transparent opacity={0.8} />
            </mesh>
            
            {/* If clicking to move, show indicator */}
            {playerTarget && (
                <mesh position={[playerTarget[0] - posVec.current.x, 0.1, playerTarget[2] - posVec.current.z]} rotation={[-Math.PI/2, 0, 0]}>
                    <ringGeometry args={[0.6, 0.8, 32]} />
                    <meshBasicMaterial color="#10B981" transparent opacity={0.6} />
                </mesh>
            )}
        </group>
    );
}
