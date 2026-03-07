"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { WorldHUD } from "@/components/world/WorldHUD";
import { useWorldStore } from "@/lib/worldStore";

const ArenaWorld3D = dynamic(() => import("@/components/world/ArenaWorld3D"), {
    ssr: false,
    loading: () => (
        <div className="world-loading">
            <div className="world-loading-spinner" />
            <p>Entering the Arena…</p>
        </div>
    ),
});

export default function WorldPage() {
    const connectBackendEvents = useWorldStore((s) => s.connectBackendEvents);

    useEffect(() => {
        connectBackendEvents();
    }, [connectBackendEvents]);

    return (
        <div className="world-container">
            <ArenaWorld3D />
            <WorldHUD />
        </div>
    );
}
