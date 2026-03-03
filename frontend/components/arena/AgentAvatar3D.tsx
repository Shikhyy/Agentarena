"use client";

// AgentAvatar3D renders a styled avatar div — NOT Three.js mesh.
// (Three.js geometry only works inside a R3F <Canvas>, not a plain <div>)
export function AgentAvatar3D({
    modelUrl,
    idleAnimation = true,
}: {
    modelUrl?: string;
    idleAnimation?: boolean;
}) {
    const isAgentA = modelUrl?.includes("agent-a");
    const letter = isAgentA ? "A" : "B";
    const colors = isAgentA
        ? { bg: "linear-gradient(135deg, #10B981, #059669)", border: "#10B981" }
        : { bg: "linear-gradient(135deg, #6C3AED, #4F1FB8)", border: "#6C3AED" };

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                background: colors.bg,
                borderRadius: "var(--radius-md)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.6rem",
                fontWeight: 800,
                color: "white",
                border: `2px solid ${colors.border}`,
                boxShadow: `0 0 12px ${colors.border}55`,
                animation: idleAnimation ? "pulse 2s infinite" : undefined,
            }}
        >
            {letter}
        </div>
    );
}
