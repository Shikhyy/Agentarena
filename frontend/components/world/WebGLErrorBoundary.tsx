"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Canvas } from "@react-three/fiber";

interface Props extends React.ComponentProps<typeof Canvas> {
    children: React.ReactNode;
}

const ZONES = [
    { href: "/arenas", label: "Arenas", icon: "⚔️", desc: "Watch live AI matches", color: "#C8963C" },
    { href: "/world/workshop", label: "Workshop", icon: "🔧", desc: "Build & train agents", color: "#4A8C86" },
    { href: "/marketplace", label: "Market", icon: "💎", desc: "Trade agents & skills", color: "#D4791A" },
    { href: "/leaderboard", label: "Rankings", icon: "🏆", desc: "Global leaderboard", color: "#C8963C" },
    { href: "/tournaments", label: "Tournaments", icon: "🎯", desc: "Compete for prizes", color: "#A0522D" },
    { href: "/my-agents", label: "My Agents", icon: "🤖", desc: "Manage your roster", color: "#4A8C86" },
];

function WebGLFallback() {
    return (
        <div style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
            background: "var(--color-ink, #0A0907)", color: "white", padding: "20px", textAlign: "center",
            fontFamily: "var(--font-body, serif)", width: "100%", height: "100%", zIndex: 100,
        }}>
            <div style={{ maxWidth: 640, width: "100%" }}>
                <h2 style={{
                    fontFamily: "var(--font-display, serif)", fontSize: "clamp(28px, 5vw, 48px)",
                    color: "var(--color-gold, #C8963C)", marginBottom: 8, fontWeight: 700,
                }}>
                    AgentArena World
                </h2>
                <p style={{ color: "var(--color-parchment, #C8B89A)", marginBottom: 32, fontSize: 15, lineHeight: 1.6 }}>
                    3D view requires WebGL. Navigate the arena using the links below.
                </p>
                <div style={{
                    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                    gap: 12, marginBottom: 32,
                }}>
                    {ZONES.map(z => (
                        <Link key={z.href} href={z.href} style={{
                            display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                            padding: "20px 12px", borderRadius: 12,
                            background: "var(--color-surface, #161310)",
                            border: `1px solid var(--color-border, #3A3228)`,
                            textDecoration: "none", transition: "border-color 0.2s, box-shadow 0.2s",
                        }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = z.color; e.currentTarget.style.boxShadow = `0 0 20px ${z.color}33`; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--color-border, #3A3228)"; e.currentTarget.style.boxShadow = "none"; }}
                        >
                            <span style={{ fontSize: 28 }}>{z.icon}</span>
                            <span style={{ fontFamily: "var(--font-heading, serif)", fontSize: 13, letterSpacing: 2, textTransform: "uppercase", color: "var(--color-ivory, #F0E8D8)" }}>
                                {z.label}
                            </span>
                            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 10, color: "var(--color-stone, #8C7C68)" }}>
                                {z.desc}
                            </span>
                        </Link>
                    ))}
                </div>
                <div style={{
                    color: "var(--color-ash, #5A5248)", fontSize: 12,
                    fontFamily: "var(--font-mono, monospace)",
                    padding: "10px 16px", background: "rgba(0,0,0,0.3)", borderRadius: 8,
                }}>
                    Tip: Enable Hardware Acceleration in your browser for the full 3D experience.
                </div>
            </div>
        </div>
    );
}

export function WebGLSafeCanvas(props: Props) {
    const [webGlError, setWebGlError] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (!gl) {
                setWebGlError(true);
            }
        } catch {
            setWebGlError(true);
        } finally {
            setIsChecking(false);
        }
    }, []);

    if (isChecking) {
        return <div style={{ width: '100%', height: '100%', background: 'var(--color-ink, #0A0907)' }} />;
    }

    if (webGlError) {
        return <WebGLFallback />;
    }

    return <Canvas {...props} />;
}
