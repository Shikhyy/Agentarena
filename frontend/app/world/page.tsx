"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useWorldStore } from "@/lib/worldStore";

/* Lazy-load the heavy 3D world — SSR disabled (WebGL requires browser) */
const ArenaWorld3D = dynamic(() => import("@/components/world/ArenaWorld3D"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 flex items-center justify-center bg-[var(--color-background)]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--color-surface)] border-t-[var(--color-gold)]" />
        <p className="font-mono text-sm text-[var(--color-textMuted)]">Loading World…</p>
      </div>
    </div>
  ),
});

export default function WorldPage() {
  const connectBackendEvents = useWorldStore((s) => s.connectBackendEvents);

  /* Connect to the live backend when the page mounts */
  useEffect(() => {
    connectBackendEvents();
  }, [connectBackendEvents]);

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      <ArenaWorld3D />
    </div>
  );
}
