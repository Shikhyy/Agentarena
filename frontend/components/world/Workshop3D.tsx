"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, Text, Html } from "@react-three/drei";
import * as THREE from "three";
import { ArenaHall3D } from "./ArenaHall3D";

// Workshop Zone Setup
export function WorkshopZone() {
    const [sliderVal, setSliderVal] = useState(0.5);
    const [isMinting, setIsMinting] = useState(false);

    // Positioned at [0, 0, 60] per WORLD_ZONES
    return (
        <group position={[0, 0, 60]}>
            <ArenaHall3D hallName="Agent Workshop" hallColor="#8B5CF6" spectatorCount={0}>

                {/* Workbench Component */}
                <group position={[0, 1, 0]}>
                    {/* Table Base */}
                    <RoundedBox args={[6, 0.2, 2.5]} radius={0.05} position={[0, 0.5, 0]}>
                        <meshStandardMaterial color="#2E1065" metalness={0.7} roughness={0.3} />
                    </RoundedBox>
                    <cylinderGeometry args={[0.2, 0.2, 1, 8]} />
                    <meshStandardMaterial color="#1a1035" />

                    {/* Left side: Terminal Hologram */}
                    <group position={[-2, 1.2, 0]}>
                        <mesh position={[0, 0, -0.5]} rotation={[0.2, 0, 0]}>
                            <planeGeometry args={[1.5, 1]} />
                            <meshStandardMaterial color="#0a0a1a" emissive="#8B5CF6" emissiveIntensity={0.2} />
                        </mesh>
                        <Text position={[0, 0.2, -0.45]} fontSize={0.15} color="#F59E0B" anchorX="center" rotation={[0.2, 0, 0]}>
                            Strategy Vault ZK
                        </Text>
                    </group>

                    {/* Center Base for Agent Chassis morphing */}
                    <group position={[0, 0.6, 0]}>
                        <mesh rotation={[-Math.PI / 2, 0, 0]}>
                            <ringGeometry args={[0.6, 1.0, 32]} />
                            <meshStandardMaterial color="#3B82F6" emissive="#3B82F6" emissiveIntensity={0.5} />
                        </mesh>

                        {/* Chassis Morph - simple vertical scale & horizontal scale based on slider */}
                        <mesh position={[0, 0.5 + sliderVal, 0]}>
                            <cylinderGeometry args={[0.2 + sliderVal * 0.2, 0.2 + sliderVal * 0.2, 1 + sliderVal * 2, 16]} />
                            <meshStandardMaterial color={isMinting ? "#F59E0B" : "#8B5CF6"} wireframe={!isMinting} emissive={isMinting ? "#F59E0B" : "#000"} emissiveIntensity={isMinting ? 1 : 0} />
                        </mesh>
                    </group>

                    {/* Right side: HTML UI Sliders for morphing */}
                    <Html position={[2, 0.8, 0]} transform rotation={[-0.2, 0, 0]} occlude>
                        <div style={{
                            background: "linear-gradient(135deg, rgba(15, 10, 26, 0.85), rgba(10, 5, 20, 0.95))",
                            backdropFilter: "blur(12px)",
                            padding: "20px",
                            borderRadius: "16px",
                            border: "1px solid rgba(139, 92, 246, 0.4)",
                            width: "240px",
                            color: "white",
                            fontFamily: "var(--font-body)",
                            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6), inset 0 0 15px rgba(139, 92, 246, 0.15)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid rgba(139, 92, 246, 0.2)", paddingBottom: "12px" }}>
                                <span style={{ fontSize: "1.2rem" }}></span>
                                <h3 style={{ margin: 0, color: "var(--arena-gold)", fontSize: "16px", fontFamily: "var(--font-display)", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>Genetic Splicer</h3>
                            </div>

                            <div>
                                <label style={{ fontSize: "11px", display: "flex", justifyContent: "space-between", color: "var(--text-secondary)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
                                    <span>Aggression</span>
                                    <span style={{ color: "var(--electric-purple-light)" }}>{Math.round(sliderVal * 100)}%</span>
                                </label>
                                <input
                                    type="range" min="0" max="1" step="0.01"
                                    value={sliderVal}
                                    onChange={(e) => setSliderVal(parseFloat(e.target.value))}
                                    style={{
                                        width: "100%", cursor: "pointer", accentColor: "var(--electric-purple)",
                                        height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: "2px", outline: "none"
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
                                    background: isMinting ? "linear-gradient(135deg, var(--arena-gold), #b45309)" : "linear-gradient(135deg, var(--electric-purple), var(--electric-purple-dark))",
                                    border: `1px solid ${isMinting ? "var(--arena-gold)" : "var(--electric-purple-light)"}`,
                                    color: "white", padding: "10px", cursor: "pointer", borderRadius: "8px",
                                    fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "13px",
                                    letterSpacing: "0.05em", transition: "all 0.3s",
                                    boxShadow: isMinting ? "0 0 20px rgba(245, 158, 11, 0.5)" : "0 4px 15px rgba(139, 92, 246, 0.4)",
                                    position: "relative", overflow: "hidden"
                                }}
                            >
                                {isMinting ? "️ SPLICING DNA..." : " RENDER & MINT"}
                            </button>
                        </div>
                    </Html>

                    {/* Wall of Skills behind */}
                    <group position={[0, 2, -1.2]}>
                        <mesh>
                            <boxGeometry args={[5, 2, 0.1]} />
                            <meshStandardMaterial color="#0A0A1A" />
                        </mesh>
                        {Array.from({ length: 8 }).map((_, i) => (
                            <mesh key={i} position={[-2 + (i % 4) * 1.3, 0.5 - Math.floor(i / 4) * 1, 0.1]}>
                                <sphereGeometry args={[0.2, 16, 16]} />
                                <meshStandardMaterial color={["#EF4444", "#3B82F6", "#10B981", "#F59E0B"][i % 4]} emissive={["#EF4444", "#3B82F6", "#10B981", "#F59E0B"][i % 4]} emissiveIntensity={0.8} />
                            </mesh>
                        ))}
                    </group>

                </group>
            </ArenaHall3D>
        </group>
    );
}
