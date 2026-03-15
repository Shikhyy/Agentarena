"use client";

import { motion, AnimatePresence } from "motion/react";
import { useUIStore } from "@/lib/stores/uiStore";

const variantStyles: Record<string, { bg: string; border: string; color: string; icon: string }> = {
  info: {
    bg: "rgba(0,232,255,0.08)",
    border: "rgba(0,232,255,0.3)",
    color: "var(--color-gold)",
    icon: "i",
  },
  success: {
    bg: "rgba(0,255,133,0.08)",
    border: "rgba(0,255,133,0.3)",
    color: "var(--color-teal-light)",
    icon: "\u2713",
  },
  error: {
    bg: "rgba(255,60,60,0.08)",
    border: "rgba(255,60,60,0.3)",
    color: "var(--color-red)",
    icon: "\u2717",
  },
  warning: {
    bg: "rgba(255,190,0,0.08)",
    border: "rgba(255,190,0,0.3)",
    color: "var(--color-gold)",
    icon: "!",
  },
};

export function ToastStack() {
  const toasts = useUIStore((s) => s.toasts);
  const removeToast = useUIStore((s) => s.removeToast);

  return (
    <div
      style={{
        position: "fixed",
        top: 72,
        right: 16,
        zIndex: 700,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        pointerEvents: "none",
        maxWidth: 380,
      }}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const style = variantStyles[toast.variant] ?? variantStyles.info;
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              style={{
                background: style.bg,
                backdropFilter: "blur(12px)",
                border: `1px solid ${style.border}`,
                borderRadius: 10,
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                pointerEvents: "auto",
                cursor: "pointer",
              }}
              onClick={() => removeToast(toast.id)}
            >
              {/* Icon circle */}
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 999,
                  border: `1px solid ${style.border}`,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 11,
                  fontWeight: 700,
                  color: style.color,
                  flexShrink: 0,
                  fontFamily: "var(--font-mono)",
                }}
              >
                {style.icon}
              </span>

              {/* Message */}
              <span
                className="mono"
                style={{
                  fontSize: 12,
                  color: "var(--color-text)",
                  lineHeight: 1.4,
                }}
              >
                {toast.message}
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
