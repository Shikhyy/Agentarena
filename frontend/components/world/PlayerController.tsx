"use client";

import { useRef, useEffect, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useWorldStore, WORLD_ZONES } from "@/lib/worldStore";
import { COLORS } from "@/lib/theme";

const WALK_SPEED = 15;
const ZOOM_MIN = 20;
const ZOOM_MAX = 180;
const ZOOM_SPEED = 8;
const ORBIT_SPEED = 0.004;

export function PlayerController() {
    const { camera, gl } = useThree();
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

    // Camera orbit state
    const orbitAngle = useRef(0); // horizontal angle in radians
    const orbitPitch = useRef(0.65); // vertical angle (0=horizontal, π/2=top-down)
    const zoomDist = useRef(60); // distance from player
    const isDragging = useRef(false);
    const lastMouse = useRef({ x: 0, y: 0 });

    // Cinematics state
    const cinematicTime = useRef(0);
    const cinematicStart = new THREE.Vector3(0, 100, 80);
    const entryTarget = new THREE.Vector3(0, 0, 10);

    // Scroll zoom
    const handleWheel = useCallback((e: WheelEvent) => {
        e.preventDefault();
        zoomDist.current = THREE.MathUtils.clamp(
            zoomDist.current + e.deltaY * 0.05 * ZOOM_SPEED,
            ZOOM_MIN,
            ZOOM_MAX,
        );
    }, []);

    // Right-mouse orbit
    const handlePointerDown = useCallback((e: PointerEvent) => {
        if (e.button === 2) {
            isDragging.current = true;
            lastMouse.current = { x: e.clientX, y: e.clientY };
        }
    }, []);
    const handlePointerMove = useCallback((e: PointerEvent) => {
        if (!isDragging.current) return;
        const dx = e.clientX - lastMouse.current.x;
        const dy = e.clientY - lastMouse.current.y;
        orbitAngle.current -= dx * ORBIT_SPEED;
        orbitPitch.current = THREE.MathUtils.clamp(
            orbitPitch.current + dy * ORBIT_SPEED,
            0.15,
            1.4,
        );
        lastMouse.current = { x: e.clientX, y: e.clientY };
    }, []);
    const handlePointerUp = useCallback((e: PointerEvent) => {
        if (e.button === 2) isDragging.current = false;
    }, []);
    const handleContextMenu = useCallback((e: Event) => e.preventDefault(), []);

    useEffect(() => {
        const dom = gl.domElement;
        dom.addEventListener("wheel", handleWheel, { passive: false });
        dom.addEventListener("pointerdown", handlePointerDown);
        dom.addEventListener("pointermove", handlePointerMove);
        dom.addEventListener("pointerup", handlePointerUp);
        dom.addEventListener("contextmenu", handleContextMenu);
        return () => {
            dom.removeEventListener("wheel", handleWheel);
            dom.removeEventListener("pointerdown", handlePointerDown);
            dom.removeEventListener("pointermove", handlePointerMove);
            dom.removeEventListener("pointerup", handlePointerUp);
            dom.removeEventListener("contextmenu", handleContextMenu);
        };
    }, [gl.domElement, handleWheel, handlePointerDown, handlePointerMove, handlePointerUp, handleContextMenu]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === ' ' && appState === "spawning") {
                setAppState("roaming");
                setPlayerPosition([entryTarget.x, 0, entryTarget.z]);
                posVec.current.set(entryTarget.x, 0, entryTarget.z);
            }
            if (e.key.toLowerCase() in keys.current) {
                keys.current[e.key.toLowerCase() as keyof typeof keys.current] = true;
                setPlayerTarget(null);
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
            cinematicTime.current += delta * 0.5;
            const t = Math.min(cinematicTime.current, 1);
            const ease = 1 - Math.pow(1 - t, 3);

            // Compute the orbit-based end position
            const dist = zoomDist.current;
            const endPos = new THREE.Vector3(
                entryTarget.x + Math.sin(orbitAngle.current) * Math.cos(orbitPitch.current) * dist,
                entryTarget.y + Math.sin(orbitPitch.current) * dist,
                entryTarget.z + Math.cos(orbitAngle.current) * Math.cos(orbitPitch.current) * dist,
            );

            camera.position.lerpVectors(cinematicStart, endPos, ease);
            camera.lookAt(entryTarget.x, 0, entryTarget.z);

            if (t >= 1) {
                setAppState("roaming");
                setPlayerPosition([entryTarget.x, 0, entryTarget.z]);
                posVec.current.set(entryTarget.x, 0, entryTarget.z);
            }
            return;
        }

        if (appState === "roaming") {
            let moved = false;

            // WASD movement relative to camera facing direction
            const moveDir = new THREE.Vector3();
            const forward = new THREE.Vector3(-Math.sin(orbitAngle.current), 0, -Math.cos(orbitAngle.current));
            const right = new THREE.Vector3(forward.z, 0, -forward.x);

            if (keys.current.w) moveDir.add(forward);
            if (keys.current.s) moveDir.sub(forward);
            if (keys.current.a) moveDir.sub(right);
            if (keys.current.d) moveDir.add(right);

            if (moveDir.lengthSq() > 0) {
                moveDir.normalize().multiplyScalar(WALK_SPEED * delta);
                posVec.current.add(moveDir);
                moved = true;
            }
            // Click-to-Move interpolation
            else if (playerTarget) {
                const targetVec = new THREE.Vector3(...playerTarget);
                const dist = posVec.current.distanceTo(targetVec);
                if (dist > 0.5) {
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

                let closestZone = WORLD_ZONES[0].id;
                let minDist = Infinity;
                WORLD_ZONES.forEach(z => {
                    const dx = posVec.current.x - z.position[0];
                    const dz = posVec.current.z - z.position[2];
                    const d = Math.sqrt(dx * dx + dz * dz);
                    if (d < minDist) { minDist = d; closestZone = z.id; }
                });
                setZone(minDist < 40 ? closestZone : "central-nexus");
            }

            // Orbit camera follows player
            const dist = zoomDist.current;
            const idealCamPos = new THREE.Vector3(
                posVec.current.x + Math.sin(orbitAngle.current) * Math.cos(orbitPitch.current) * dist,
                posVec.current.y + Math.sin(orbitPitch.current) * dist,
                posVec.current.z + Math.cos(orbitAngle.current) * Math.cos(orbitPitch.current) * dist,
            );
            camera.position.lerp(idealCamPos, 0.08);
            camera.lookAt(posVec.current);
        }
    });

    if (appState === "spawning") return null;

    return (
        <group ref={playerRef} position={playerPos}>
            <mesh position={[0, 1, 0]}>
                <sphereGeometry args={[0.4, 16, 16]} />
                <meshStandardMaterial color={COLORS.gold} emissive={COLORS.gold} emissiveIntensity={2} />
            </mesh>
            <pointLight position={[0, 2, 0]} color={COLORS.gold} intensity={3} distance={10} />
            <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.5, 0.7, 32]} />
                <meshStandardMaterial color={COLORS.gold} emissive={COLORS.gold} emissiveIntensity={1} transparent opacity={0.8} />
            </mesh>
            {playerTarget && (
                <mesh position={[playerTarget[0] - playerPos[0], 0.1, playerTarget[2] - playerPos[2]]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.6, 0.8, 32]} />
                    <meshStandardMaterial color={COLORS.tealLight} emissive={COLORS.tealLight} emissiveIntensity={1} transparent opacity={0.6} />
                </mesh>
            )}
        </group>
    );
}
