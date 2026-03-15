"use client";

import { COLORS, SHADOWS } from "@/lib/theme";

/**
 * AgentAvatar3D — Styled neon avatar card for agent A/B display.
 * This is a DOM component (not R3F), used in the arena hall page UI overlays.
 */
export function AgentAvatar3D({
    modelUrl,
    idleAnimation = true,
}: {
    modelUrl?: string;
    idleAnimation?: boolean;
}) {
    const isAgentA = modelUrl?.includes("agent-a");
    const letter = isAgentA ? "A" : "B";

    const accent = isAgentA ? COLORS.gold : COLORS.redBright;
    const gradientStart = isAgentA ? COLORS.gold : COLORS.redBright;
    const gradientEnd = isAgentA ? "#0088aa" : "#aa1060";
    const shadow = isAgentA ? SHADOWS.gold : SHADOWS.red;

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.6rem",
                fontWeight: 800,
                fontFamily: "var(--font-display)",
                color: COLORS.ink,
                border: `2px solid ${accent}`,
                boxShadow: `${shadow}, inset 0 0 20px rgba(255,255,255,0.1)`,
                animation: idleAnimation ? "pulse 2s infinite" : undefined,
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Scanline overlay for cyberpunk effect */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background: `repeating-linear-gradient(
                        0deg,
                        transparent,
                        transparent 2px,
                        rgba(0, 0, 0, 0.08) 2px,
                        rgba(0, 0, 0, 0.08) 4px
                    )`,
                    pointerEvents: "none",
                }}
            />
            {letter}
        </div>
    );
}
