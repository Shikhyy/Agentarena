"use client";

import dynamic from "next/dynamic";
import { WorldHUD } from "@/components/world/WorldHUD";

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
    return (
        <div className="world-container">
            <ArenaWorld3D />
            <WorldHUD />
        </div>
    );
}
