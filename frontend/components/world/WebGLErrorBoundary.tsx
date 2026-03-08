"use client";

import React, { useState, useEffect } from 'react';
import { Canvas } from "@react-three/fiber";

interface Props extends React.ComponentProps<typeof Canvas> {
    children: React.ReactNode;
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
        } catch (e) {
            setWebGlError(true);
        } finally {
            setIsChecking(false);
        }
    }, []);

    if (isChecking) {
        return <div style={{ width: '100%', height: '100%', background: '#050210' }} />;
    }

    if (webGlError) {
        return (
            <div style={{
                position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                background: "#050210", color: "white", padding: "20px", textAlign: "center", fontFamily: "var(--font-body)",
                width: "100%", height: "100%", zIndex: 100
            }}>
                <div style={{ maxWidth: "500px", padding: "40px", background: "rgba(239, 68, 68, 0.1)", borderRadius: "16px", border: "1px solid rgba(239, 68, 68, 0.3)" }}>
                    <div style={{ fontSize: "4rem", marginBottom: "20px" }}>️</div>
                    <h2 style={{ color: "var(--danger-red)", marginBottom: "16px", fontFamily: "var(--font-display)", fontWeight: 800 }}>WebGL Unavailable</h2>
                    <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "24px" }}>
                        Your browser or environment failed to create a 3D WebGL context. Hardware acceleration might be disabled, or your environment is sandboxed.
                    </p>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", padding: "12px", background: "rgba(0,0,0,0.4)", borderRadius: "8px" }}>
                        This 3D view requires a GPU. Please enable Hardware Acceleration in your browser settings.
                    </div>
                </div>
            </div>
        );
    }

    // Pass all props through to the actual R3F Canvas
    return <Canvas {...props} />;
}
