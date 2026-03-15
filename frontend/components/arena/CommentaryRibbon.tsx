"use client";

import { motion } from "motion/react";
import { COLORS } from "@/lib/theme";

export function CommentaryRibbon({ transcripts, isActive }: { transcripts: string[], isActive: boolean }) {
    if (!isActive) return null;

    return (
        <div style={{
            position: "absolute",
            bottom: 16,
            left: "50%",
            transform: "translateX(-50%)",
            width: "80%",
            maxWidth: 800,
            background: `rgba(7, 7, 31, 0.85)`,
            backdropFilter: "blur(16px)",
            border: `1px solid ${COLORS.border}`,
            borderRadius: 12,
            padding: "8px 16px",
            display: "flex",
            alignItems: "center",
            gap: 16,
            zIndex: 10,
        }}>
            {/* Audio Waveform Indicator */}
            <div style={{ display: "flex", gap: 2, height: 24, alignItems: "center" }}>
                {[1, 2, 3, 4, 5].map((i) => (
                    <motion.div
                        key={i}
                        animate={{ height: [8, 20, 8] }}
                        transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                        style={{ width: 3, background: COLORS.gold, borderRadius: 2, boxShadow: `0 0 4px ${COLORS.gold}` }}
                    />
                ))}
            </div>

            <div style={{ flex: 1, overflow: "hidden", position: "relative", height: 24 }}>
                <motion.div
                    key={transcripts[transcripts.length - 1]}
                    initial={{ y: 24, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    style={{
                        position: "absolute",
                        width: "100%",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        fontSize: "0.875rem",
                        color: COLORS.textSecondary,
                    }}
                >
                    <span style={{ color: COLORS.tealLight, fontWeight: "bold", marginRight: 8, textShadow: `0 0 6px ${COLORS.tealLight}` }}>
                        Gemini Live:
                    </span>
                    <span style={{ color: COLORS.textPrimary }}>
                        {transcripts[transcripts.length - 1] || "Waiting for action..."}
                    </span>
                </motion.div>
            </div>
        </div>
    );
}
