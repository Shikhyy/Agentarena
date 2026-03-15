"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, Text, Html } from "@react-three/drei";
import * as THREE from "three";
import { ArenaHall3D } from "./ArenaHall3D";
import { COLORS } from "@/lib/theme";

// Workshop Zone Setup
export function WorkshopZone() {
    const [sliderVal, setSliderVal] = useState(0.5);
    const [isMinting, setIsMinting] = useState(false);

    // Positioned at [0, 0, 60] per WORLD_ZONES
    return (
        <group position={[0, 0, 60]}>
            <ArenaHall3D hallName="Agent Workshop" hallColor={COLORS.accent} spectatorCount={0}>

                {/* Workbench Component */}
                <group position={[0, 1, 0]}>
                    {/* Table Base */}
                    <RoundedBox args={[6, 0.2, 2.5]} radius={0.05} position={[0, 0.5, 0]}>
                        <meshStandardMaterial color={COLORS.surface} metalness={0.7} roughness={0.3} />
                    </RoundedBox>
                    <cylinderGeometry args={[0.2, 0.2, 1, 8]} />
                    <meshStandardMaterial color={COLORS.structure} />

                    {/* Left side: Terminal Hologram */}
                    <group position={[-2, 1.2, 0]}>
                        <mesh position={[0, 0, -0.5]} rotation={[0.2, 0, 0]}>
                            <planeGeometry args={[1.5, 1]} />
                            <meshStandardMaterial color={COLORS.surface} emissive={COLORS.accent} emissiveIntensity={0.05} />
                        </mesh>
                        <Text position={[0, 0.2, -0.45]} fontSize={0.15} color={COLORS.textPrimary} anchorX="center" rotation={[0.2, 0, 0]}>
                            Strategy Vault
                        </Text>
                    </group>

                    {/* Center Base for Agent Chassis morphing */}
                    <group position={[0, 0.6, 0]}>
                        <mesh rotation={[-Math.PI / 2, 0, 0]}>
                            <ringGeometry args={[0.6, 1.0, 32]} />
                            <meshStandardMaterial color={COLORS.textMuted} emissive={COLORS.textMuted} emissiveIntensity={0.05} />
                        </mesh>

                        {/* Chassis Morph - simple vertical scale & horizontal scale based on slider */}
                        <mesh position={[0, 0.5 + sliderVal, 0]}>
                            <cylinderGeometry args={[0.2 + sliderVal * 0.2, 0.2 + sliderVal * 0.2, 1 + sliderVal * 2, 16]} />
                            <meshStandardMaterial color={isMinting ? COLORS.textPrimary : COLORS.accent} wireframe={!isMinting} emissive={isMinting ? COLORS.textPrimary : "#000"} emissiveIntensity={isMinting ? 0.05 : 0} />
                        </mesh>
                    </group>

                    {/* Right side: HTML UI Sliders for morphing */}
                    <Html position={[2, 0.8, 0]} transform rotation={[-0.2, 0, 0]} occlude>
                        <div style={{
                            background: "rgba(255, 255, 255, 0.95)",
                            backdropFilter: "blur(12px)",
                            padding: "20px",
                            borderRadius: "8px",
                            border: "1px solid #DEE2E6",
                            width: "240px",
                            color: "#111",
                            fontFamily: "var(--font-body)",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid #E9ECEF", paddingBottom: "12px" }}>
                                <h3 style={{ margin: 0, color: "#111", fontSize: "14px", fontFamily: "var(--font-display)", fontWeight: 600, letterSpacing: "0.02em" }}>Agent Builder</h3>
                            </div>

                            <div>
                                <label style={{ fontSize: "11px", display: "flex", justifyContent: "space-between", color: "#555", marginBottom: "6px", letterSpacing: "0.02em", fontWeight: 500 }}>
                                    <span>Aggression</span>
                                    <span style={{ color: "#111" }}>{Math.round(sliderVal * 100)}%</span>
                                </label>
                                <input
                                    type="range" min="0" max="1" step="0.01"
                                    value={sliderVal}
                                    onChange={(e) => setSliderVal(parseFloat(e.target.value))}
                                    style={{
                                        width: "100%", cursor: "pointer", accentColor: "#111",
                                        height: "4px", background: "#E9ECEF", borderRadius: "2px", outline: "none"
                                    }}
                                />
                            </div>

                            <button
                                onClick={() => {
                                    setIsMinting(true);
                                    setTimeout(() => setIsMinting(false), 2000);
                                }}
                                style={{
                                    marginTop: "8px", width: "100%",
                                    background: isMinting ? "#555" : "#111",
                                    border: "none",
                                    color: "#fff", padding: "10px", cursor: "pointer", borderRadius: "6px",
                                    fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "13px",
                                    letterSpacing: "0.02em", transition: "all 0.3s",
                                }}
                            >
                                {isMinting ? "Processing..." : "Build Agent"}
                            </button>
                        </div>
                    </Html>

                    {/* Wall of Skills behind */}
                    <group position={[0, 2, -1.2]}>
                        <mesh>
                            <boxGeometry args={[5, 2, 0.1]} />
                            <meshStandardMaterial color={COLORS.surface} />
                        </mesh>
                        {Array.from({ length: 8 }).map((_, i) => (
                            <mesh key={i} position={[-2 + (i % 4) * 1.3, 0.5 - Math.floor(i / 4) * 1, 0.1]}>
                                <sphereGeometry args={[0.2, 16, 16]} />
                                <meshStandardMaterial color={[COLORS.textMuted, COLORS.accentSoft, COLORS.textSecondary, COLORS.textPrimary][i % 4]} emissive={[COLORS.textMuted, COLORS.accentSoft, COLORS.textSecondary, COLORS.textPrimary][i % 4]} emissiveIntensity={0.05} />
                            </mesh>
                        ))}
                    </group>

                </group>
            </ArenaHall3D>
        </group>
    );
}
