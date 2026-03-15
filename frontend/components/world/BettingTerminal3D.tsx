"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, RoundedBox, Billboard, Html } from "@react-three/drei";
import * as THREE from "three";
import { COLORS } from "@/lib/theme";

/* ── Betting Terminal 3D ─────────────────────────────────── */
interface BettingTerminal3DProps {
    position?: [number, number, number];
    rotation?: [number, number, number];
    matchLabel?: string;
    odds?: [number, number];
    pool?: number;
    isActive?: boolean;
    onClick?: () => void;
}

export function BettingTerminal3D({
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    matchLabel = "TITAN vs ORACLE",
    odds = [52, 48],
    pool = 24500,
    isActive = true,
    onClick,
}: BettingTerminal3DProps) {
    const glowRef = useRef<THREE.Mesh>(null);
    const screenRef = useRef<THREE.Mesh>(null);
    const [isInteracting, setIsInteracting] = useState(false);
    const [betAmount, setBetAmount] = useState(10);
    const [sealedEnvelope, setSealedEnvelope] = useState<{ y: number, visible: boolean }>({ y: 1.5, visible: false });

    useFrame((_, delta) => {
        if (glowRef.current) {
            const mat = glowRef.current.material as THREE.MeshStandardMaterial;
            mat.emissiveIntensity = 0.03 + Math.sin(Date.now() * 0.003) * 0.02;
        }

        // Animate sealed envelope flying to vault
        if (sealedEnvelope.visible) {
            setSealedEnvelope(prev => {
                if (prev.y > 5) return { y: 1.5, visible: false }; // disappear in vault
                return { y: prev.y + delta * 3, visible: true };
            });
        }
    });

    return (
        <group
            position={position}
            rotation={rotation as unknown as THREE.Euler}
            onClick={(e) => {
                e.stopPropagation();
                if (!isInteracting) {
                    setIsInteracting(true);
                    onClick?.();
                }
            }}
        >
            {/* Base stand */}
            <mesh position={[0, 0.5, 0]} castShadow>
                <cylinderGeometry args={[0.3, 0.4, 1.0, 8]} />
                <meshStandardMaterial color={COLORS.structure} metalness={0.6} roughness={0.4} />
            </mesh>

            {/* Terminal body */}
            <RoundedBox position={[0, 1.3, 0]} args={[0.8, 0.9, 0.3]} radius={0.04} smoothness={4} castShadow>
                <meshStandardMaterial color={COLORS.ivory} metalness={0.4} roughness={0.5} />
            </RoundedBox>

            {/* Sub-interactive UI */}
            {isInteracting && (
                <Html position={[0, 2.5, 0]} center transform style={{
                    width: '240px', background: 'linear-gradient(135deg, rgba(15, 10, 26, 0.85), rgba(10, 5, 20, 0.95))',
                    padding: '20px', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '16px',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6), inset 0 0 15px rgba(16, 185, 129, 0.15)',
                    backdropFilter: 'blur(12px)', color: 'white', fontFamily: 'var(--font-body)',
                    display: 'flex', flexDirection: 'column', gap: '12px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(16, 185, 129, 0.2)', paddingBottom: '12px' }}>
                        <span style={{ fontSize: '1.2rem' }}></span>
                        <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--neon-green)', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Place Bet</h4>
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500, display: 'flex', justifyContent: 'space-between' }}>
                        <span>Target: <strong style={{ color: 'white' }}>AGENT A</strong></span>
                        <span style={{ color: 'var(--neon-green)' }}>{odds[0]}% Odds</span>
                    </div>

                    <input
                        type="range" style={{ width: "100%", accentColor: "var(--neon-green)", background: "rgba(255,255,255,0.1)", height: "4px", borderRadius: "2px", outline: "none", cursor: "pointer" }} min="10" max="1000" step="10"
                        value={betAmount} onChange={(e) => setBetAmount(parseInt(e.target.value))}
                    />

                    <div style={{ textAlign: "center", fontSize: '1.2rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--arena-gold)', textShadow: '0 0 10px rgba(245, 158, 11, 0.3)' }}>
                        {betAmount} $ARENA
                    </div>

                    <button
                        style={{
                            width: "100%", padding: "10px",
                            background: "linear-gradient(135deg, var(--neon-green), var(--neon-green-light))",
                            border: "1px solid var(--neon-green-light)", color: "#0F0A1A",
                            cursor: "pointer", borderRadius: "8px", fontFamily: "var(--font-heading)",
                            fontWeight: 800, fontSize: "13px", letterSpacing: "0.05em",
                            boxShadow: "0 4px 15px rgba(16, 185, 129, 0.4)", textTransform: "uppercase",
                            transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                        onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                        onClick={() => {
                            setSealedEnvelope({ y: 1.5, visible: true });
                            setIsInteracting(false);
                        }}
                    >
                        Confirm Bet
                    </button>
                </Html>
            )}

            {/* Envelope Animation */}
            {sealedEnvelope.visible && (
                <mesh position={[0, sealedEnvelope.y, 0]}>
                    <boxGeometry args={[0.4, 0.2, 0.05]} />
                    <meshStandardMaterial color={COLORS.accentSoft} emissive={COLORS.accentSoft} emissiveIntensity={0.05} />
                </mesh>
            )}

            {/* Screen */}
            <mesh ref={screenRef} position={[0, 1.35, 0.16]}>
                <planeGeometry args={[0.65, 0.7]} />
                <meshStandardMaterial
                    color={COLORS.surface}
                    emissive={isActive ? COLORS.accent : COLORS.textMuted}
                    emissiveIntensity={0.05}
                />
            </mesh>

            {/* Screen content */}
            <group position={[0, 0, 0.17]}>
                {/* Match label */}
                <Text position={[0, 1.6, 0]} fontSize={0.06} color={COLORS.accentSoft} anchorX="center">
                    {matchLabel}
                </Text>

                {/* LIVE badge */}
                {isActive && (
                    <Text position={[0, 1.52, 0]} fontSize={0.04} color={COLORS.textPrimary} anchorX="center">
                        ● LIVE
                    </Text>
                )}

                {/* Odds bars */}
                <mesh position={[-0.12, 1.38, 0]}>
                    <planeGeometry args={[Math.max(0.001, 0.25 * ((odds?.[0] || 50) / 100)), 0.05]} />
                    <meshStandardMaterial color={COLORS.textPrimary} emissive={COLORS.textPrimary} emissiveIntensity={0.05} />
                </mesh>
                <mesh position={[0.12, 1.38, 0]}>
                    <planeGeometry args={[Math.max(0.001, 0.25 * ((odds?.[1] || 50) / 100)), 0.05]} />
                    <meshStandardMaterial color={COLORS.textSecondary} emissive={COLORS.textSecondary} emissiveIntensity={0.05} />
                </mesh>

                <Text position={[-0.15, 1.3, 0]} fontSize={0.04} color={COLORS.textPrimary} anchorX="center">
                    {`${odds[0]}%`}
                </Text>
                <Text position={[0.15, 1.3, 0]} fontSize={0.04} color={COLORS.textSecondary} anchorX="center">
                    {`${odds[1]}%`}
                </Text>

                {/* Pool */}
                <Text position={[0, 1.18, 0]} fontSize={0.05} color={COLORS.accentSoft} anchorX="center">
                    {`Pool: $${pool.toLocaleString()}`}
                </Text>

                {/* Place bet prompt */}
                <Text position={[0, 1.06, 0]} fontSize={0.04} color={COLORS.textMuted} anchorX="center">
                    Click to Place Bet
                </Text>
            </group>

            {/* Edge glow strip */}
            <mesh ref={glowRef} position={[0, 1.3, 0.155]}>
                <planeGeometry args={[0.72, 0.02]} />
                <meshStandardMaterial
                    color={COLORS.accent}
                    emissive={COLORS.accent}
                    emissiveIntensity={0.05}
                    transparent
                    opacity={0.8}
                />
            </mesh>

            {/* Top beacon light */}
            <mesh position={[0, 1.85, 0]}>
                <sphereGeometry args={[0.05, 8, 8]} />
                <meshStandardMaterial
                    color={COLORS.textPrimary}
                    emissive={COLORS.textPrimary}
                    emissiveIntensity={0.05}
                />
            </mesh>

            {/* Interactive label */}
            <Billboard position={[0, 2.1, 0]}>
                <Text fontSize={0.08} color={COLORS.accentSoft} anchorX="center" outlineWidth={0.005} outlineColor="#000">
                    Terminal
                </Text>
            </Billboard>
        </group>
    );
}
