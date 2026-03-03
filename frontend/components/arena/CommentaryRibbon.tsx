"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

export function CommentaryRibbon({ transcripts, isActive }: { transcripts: string[], isActive: boolean }) {
    if (!isActive) return null;

    return (
        <div style={{
            position: "absolute",
            bottom: "var(--space-md)",
            left: "50%",
            transform: "translateX(-50%)",
            width: "80%",
            maxWidth: 800,
            background: "rgba(15, 10, 26, 0.8)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-sm) var(--space-md)",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-md)",
            zIndex: 10
        }}>
            {/* Mock Audio Waveform */}
            <div style={{ display: "flex", gap: 2, height: 24, alignItems: "center" }}>
                {[1, 2, 3, 4, 5].map((i) => (
                    <motion.div
                        key={i}
                        animate={{ height: [8, 20, 8] }}
                        transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                        style={{ width: 3, background: "var(--neon-green)", borderRadius: 2 }}
                    />
                ))}
            </div>

            <div style={{ flex: 1, overflow: "hidden", position: "relative", height: 24 }}>
                <motion.div
                    key={transcripts[transcripts.length - 1]}
                    initial={{ y: 24, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    style={{ position: "absolute", width: "100%", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}
                >
                    <span style={{ color: "var(--electric-purple)", fontWeight: "bold", marginRight: 8 }}>Gemini Live:</span>
                    {transcripts[transcripts.length - 1] || "Waiting for action..."}
                </motion.div>
            </div>
        </div>
    );
}
