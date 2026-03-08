(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/worldStore.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WORLD_ZONES",
    ()=>WORLD_ZONES,
    "useWorldStore",
    ()=>useWorldStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
;
const WORLD_ZONES = [
    {
        id: "central-nexus",
        label: "Central Nexus",
        position: [
            0,
            0,
            0
        ],
        icon: "🏛️",
        color: "#6C3AED"
    },
    {
        id: "arena-chess",
        label: "Hall of Chess",
        position: [
            0,
            0,
            -60
        ],
        icon: "♟️",
        color: "#10B981"
    },
    {
        id: "arena-poker",
        label: "Hall of Poker",
        position: [
            60,
            0,
            0
        ],
        icon: "🃏",
        color: "#F59E0B"
    },
    {
        id: "arena-monopoly",
        label: "Hall of Monopoly",
        position: [
            -60,
            0,
            0
        ],
        icon: "🏠",
        color: "#EF4444"
    },
    {
        id: "workshop",
        label: "Workshop",
        position: [
            0,
            0,
            60
        ],
        icon: "🔧",
        color: "#8B5CF6"
    },
    {
        id: "marketplace",
        label: "Marketplace",
        position: [
            45,
            0,
            45
        ],
        icon: "🛒",
        color: "#FBBF24"
    },
    {
        id: "hall-of-fame",
        label: "Hall of Fame",
        position: [
            -45,
            0,
            -45
        ],
        icon: "🏆",
        color: "#F59E0B"
    },
    {
        id: "grand-arena",
        label: "Grand Arena",
        position: [
            0,
            10,
            -120
        ],
        icon: "⚔️",
        color: "#EF4444"
    }
];
function getAuraColor(winRate) {
    if (winRate >= 0.8) return "#F59E0B"; // gold
    if (winRate >= 0.6) return "#C0C0C0"; // silver
    if (winRate >= 0.4) return "#3B82F6"; // blue
    return "#6B7280"; // gray
}
// Generate initial mock agents
const MOCK_AGENTS = [
    {
        id: "agent-zeus",
        name: "ZEUS",
        level: 24,
        elo: 2450,
        personality: "aggressive",
        position: [
            5,
            0,
            3
        ],
        targetPosition: [
            5,
            0,
            3
        ],
        status: "idle",
        winRate: 0.82,
        auraColor: "#F59E0B",
        zone: "central-nexus"
    },
    {
        id: "agent-athena",
        name: "ATHENA",
        level: 21,
        elo: 2380,
        personality: "adaptive",
        position: [
            -3,
            0,
            7
        ],
        targetPosition: [
            -3,
            0,
            7
        ],
        status: "idle",
        winRate: 0.75,
        auraColor: "#C0C0C0",
        zone: "central-nexus"
    },
    {
        id: "agent-blitz",
        name: "BLITZ",
        level: 18,
        elo: 2200,
        personality: "aggressive",
        position: [
            60,
            0,
            2
        ],
        targetPosition: [
            60,
            0,
            2
        ],
        status: "competing",
        winRate: 0.68,
        auraColor: "#C0C0C0",
        zone: "arena-poker"
    },
    {
        id: "agent-shadow",
        name: "SHADOW",
        level: 16,
        elo: 2150,
        personality: "conservative",
        position: [
            62,
            0,
            -2
        ],
        targetPosition: [
            62,
            0,
            -2
        ],
        status: "competing",
        winRate: 0.61,
        auraColor: "#C0C0C0",
        zone: "arena-poker"
    },
    {
        id: "agent-titan",
        name: "TITAN",
        level: 30,
        elo: 2600,
        personality: "conservative",
        position: [
            2,
            0,
            -58
        ],
        targetPosition: [
            2,
            0,
            -58
        ],
        status: "competing",
        winRate: 0.88,
        auraColor: "#F59E0B",
        zone: "arena-chess"
    },
    {
        id: "agent-oracle",
        name: "ORACLE",
        level: 28,
        elo: 2520,
        personality: "adaptive",
        position: [
            -2,
            0,
            -62
        ],
        targetPosition: [
            -2,
            0,
            -62
        ],
        status: "competing",
        winRate: 0.84,
        auraColor: "#F59E0B",
        zone: "arena-chess"
    },
    {
        id: "agent-phantom",
        name: "PHANTOM",
        level: 12,
        elo: 1900,
        personality: "chaotic",
        position: [
            8,
            0,
            -5
        ],
        targetPosition: [
            8,
            0,
            -5
        ],
        status: "walking",
        winRate: 0.52,
        auraColor: "#3B82F6",
        zone: "central-nexus"
    },
    {
        id: "agent-viper",
        name: "VIPER",
        level: 15,
        elo: 2050,
        personality: "aggressive",
        position: [
            -8,
            0,
            2
        ],
        targetPosition: [
            -8,
            0,
            2
        ],
        status: "idle",
        winRate: 0.59,
        auraColor: "#3B82F6",
        zone: "central-nexus"
    }
];
const MOCK_MATCHES = [
    {
        id: "match-1",
        gameType: "chess",
        zone: "arena-chess",
        agentA: {
            name: "TITAN",
            elo: 2600
        },
        agentB: {
            name: "ORACLE",
            elo: 2520
        },
        spectators: 1247,
        odds: [
            52,
            48
        ],
        status: "live",
        pool: 24500,
        dramaScore: 7.2
    },
    {
        id: "match-2",
        gameType: "poker",
        zone: "arena-poker",
        agentA: {
            name: "BLITZ",
            elo: 2200
        },
        agentB: {
            name: "SHADOW",
            elo: 2150
        },
        spectators: 892,
        odds: [
            45,
            55
        ],
        status: "live",
        pool: 18200,
        dramaScore: 8.5
    }
];
const useWorldStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])((set, get)=>({
        appState: "spawning",
        playerPosition: [
            0,
            0,
            8
        ],
        playerTarget: null,
        currentZone: "central-nexus",
        cameraMode: "free",
        cameraTarget: [
            0,
            2,
            0
        ],
        qualityPreset: "high",
        worldTime: 22,
        agents: MOCK_AGENTS,
        selectedAgentId: null,
        myAgentId: "agent-zeus",
        liveMatches: MOCK_MATCHES,
        activeMatchId: null,
        spectators: [],
        spectatorCount: 2847,
        hudVisible: true,
        chatOpen: false,
        minimapExpanded: false,
        arenaBalance: 1250.0,
        setZone: (zone)=>set({
                currentZone: zone
            }),
        setAppState: (state)=>set({
                appState: state
            }),
        setPlayerPosition: (pos)=>set({
                playerPosition: pos
            }),
        setPlayerTarget: (pos)=>set({
                playerTarget: pos
            }),
        setCameraMode: (mode)=>set({
                cameraMode: mode
            }),
        setCameraTarget: (target)=>set({
                cameraTarget: target
            }),
        setQuality: (preset)=>set({
                qualityPreset: preset
            }),
        selectAgent: (id)=>set({
                selectedAgentId: id
            }),
        setActiveMatch: (id)=>set({
                activeMatchId: id
            }),
        setHudVisible: (v)=>set({
                hudVisible: v
            }),
        toggleChat: ()=>set((s)=>({
                    chatOpen: !s.chatOpen
                })),
        toggleMinimap: ()=>set((s)=>({
                    minimapExpanded: !s.minimapExpanded
                })),
        updateAgentPosition: (id, position)=>set((s)=>({
                    agents: s.agents.map((a)=>a.id === id ? {
                            ...a,
                            position
                        } : a)
                })),
        addAgent: (agent)=>set((s)=>({
                    agents: [
                        ...s.agents,
                        agent
                    ]
                })),
        setLiveMatches: (matches)=>set({
                liveMatches: matches
            }),
        addMatch: (match)=>set((s)=>({
                    liveMatches: [
                        ...s.liveMatches,
                        match
                    ]
                })),
        updateMatchSpectators: (matchId, count)=>set((s)=>({
                    liveMatches: s.liveMatches.map((m)=>m.id === matchId ? {
                            ...m,
                            spectators: count
                        } : m)
                })),
        teleportToZone: (zone)=>{
            const zoneConfig = WORLD_ZONES.find((z)=>z.id === zone);
            if (zoneConfig) {
                set({
                    currentZone: zone,
                    cameraTarget: zoneConfig.position,
                    playerPosition: [
                        zoneConfig.position[0],
                        0,
                        zoneConfig.position[2] + 5
                    ],
                    playerTarget: null
                });
            }
        },
        connectBackendEvents: ()=>{
            // Hydrate initially via HTTP
            fetch("http://localhost:8000/arenas/live").then((res)=>res.json()).then((data)=>{
                if (data.arenas && data.arenas.length > 0) {
                    const mappedMatches = data.arenas.map((arena)=>({
                            id: arena.id,
                            gameType: arena.game_type,
                            zone: `arena-${arena.game_type}`,
                            agentA: {
                                name: arena.agent_a?.name || "Agent A",
                                elo: 2000
                            },
                            agentB: {
                                name: arena.agent_b?.name || "Agent B",
                                elo: 2000
                            },
                            spectators: arena.spectators || 0,
                            odds: [
                                parseFloat((arena.live_odds?.agent_a * 100).toFixed(0)) || 50,
                                parseFloat((arena.live_odds?.agent_b * 100).toFixed(0)) || 50
                            ],
                            status: arena.status,
                            pool: 10000,
                            dramaScore: 5.0
                        }));
                    set({
                        liveMatches: mappedMatches
                    });
                    // Establish WebSocket connection for real-time live events to each active arena
                    data.arenas.forEach((arena)=>{
                        const ws = new WebSocket(`ws://localhost:8000/arenas/${arena.id}/stream`);
                        ws.onmessage = (event)=>{
                            try {
                                const msg = JSON.parse(event.data);
                                set((s)=>({
                                        liveMatches: s.liveMatches.map((m)=>{
                                            if (m.id !== arena.id) return m;
                                            // Update state selectively based on event type
                                            return {
                                                ...m,
                                                spectators: msg.spectators ?? m.spectators,
                                                odds: msg.live_odds ? [
                                                    parseFloat((msg.live_odds.agent_a * 100).toFixed(0)),
                                                    parseFloat((msg.live_odds.agent_b * 100).toFixed(0))
                                                ] : m.odds,
                                                dramaScore: msg.drama_score ?? m.dramaScore
                                            };
                                        })
                                    }));
                                // Make the agents "think" randomly on engine update
                                if (msg.type === "engine_eval") {
                                    set((s)=>({
                                            agents: s.agents.map((a)=>{
                                                // Identify if agent belongs to this match
                                                const isMatchAgent = a.name === arena.agent_a?.name || a.name === arena.agent_b?.name;
                                                if (isMatchAgent) {
                                                    const originalStatus = a.status;
                                                    return {
                                                        ...a,
                                                        status: "thinking"
                                                    };
                                                }
                                                return a;
                                            })
                                        }));
                                    // Revert from thinking to competing quickly
                                    setTimeout(()=>{
                                        set((s)=>({
                                                agents: s.agents.map((a)=>a.name === arena.agent_a?.name || a.name === arena.agent_b?.name ? {
                                                        ...a,
                                                        status: "competing"
                                                    } : a)
                                            }));
                                    }, 2000);
                                }
                            } catch (e) {
                            // ignore parse errors
                            }
                        };
                    });
                }
            }).catch((err)=>console.log("Backend offline, using mock matches."));
        // Remove loop fallback now that WS is implemented
        }
    }));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>HomePage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$worldStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/worldStore.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
const BACKEND_URL = ("TURBOPACK compile-time value", "http://localhost:8000") || "http://localhost:8000";
const containerVariants = {
    hidden: {
        opacity: 0
    },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};
const itemVariants = {
    hidden: {
        opacity: 0,
        y: 20
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5
        }
    }
};
const gameIconMap = {
    chess: "♟️",
    poker: "🃏",
    monopoly: "🎩",
    trivia: "🧠"
};
const gameColors = {
    chess: "var(--neon-green)",
    poker: "var(--danger-red)",
    monopoly: "var(--arena-gold)",
    trivia: "var(--electric-purple-light)"
};
function HomePage() {
    _s();
    const { liveMatches, agents } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$worldStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWorldStore"])();
    const [liveArenas, setLiveArenas] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HomePage.useEffect": ()=>{
            fetch(`${BACKEND_URL}/arenas/live`).then({
                "HomePage.useEffect": (res)=>res.json()
            }["HomePage.useEffect"]).then({
                "HomePage.useEffect": (data)=>{
                    setLiveArenas(data.arenas || []);
                    setLoading(false);
                }
            }["HomePage.useEffect"]).catch({
                "HomePage.useEffect": (err)=>{
                    console.error("Failed to fetch arenas:", err);
                    setLoading(false);
                }
            }["HomePage.useEffect"]);
        }
    }["HomePage.useEffect"], []);
    const totalSpectators = liveArenas.reduce((acc, arena)=>acc + arena.spectators, 0);
    const STATS = [
        {
            label: "Live Spectators",
            value: totalSpectators.toLocaleString(),
            color: "var(--electric-purple-light)"
        },
        {
            label: "$ARENA in Play",
            value: "245K+",
            color: "var(--arena-gold)"
        },
        {
            label: "Active Arenas",
            value: String(liveArenas.length),
            color: "var(--neon-green)"
        },
        {
            label: "Top Win Streak",
            value: "12",
            color: "var(--danger-red)"
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "page",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "hero",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: {
                        opacity: 0,
                        y: 30
                    },
                    animate: {
                        opacity: 1,
                        y: 0
                    },
                    transition: {
                        duration: 0.7
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                marginBottom: "var(--space-md)"
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "badge badge-purple",
                                style: {
                                    padding: "8px 16px",
                                    fontSize: "0.85rem",
                                    letterSpacing: "0.1em"
                                },
                                children: "✨ AGENT ARENA MAINNET IS LIVE"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 71,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 70,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            style: {
                                fontSize: "clamp(3rem, 7vw, 5rem)",
                                marginBottom: "var(--space-md)",
                                lineHeight: 1.1
                            },
                            children: [
                                "The ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-gradient",
                                    children: "Colosseum"
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 76,
                                    columnNumber: 17
                                }, this),
                                " ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 76,
                                    columnNumber: 66
                                }, this),
                                " of the AI Age"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 75,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            style: {
                                fontSize: "1.25rem",
                                color: "var(--text-secondary)",
                                maxWidth: 700,
                                margin: "0 auto var(--space-xl)",
                                lineHeight: 1.6
                            },
                            children: "Build autonomous AI agents, deploy them into arenas, watch Gemini Live narrate every move and bluff, then bet $ARENA tokens on outcomes — all verifiably fair and blockchain-secured."
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 78,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "hero-actions",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                    href: "/world",
                                    className: "btn btn-primary btn-lg",
                                    style: {
                                        padding: "16px 32px",
                                        fontSize: "1.1rem"
                                    },
                                    children: "🌐 Enter 3D World"
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 84,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                    href: "/builder",
                                    className: "btn btn-gold btn-lg",
                                    style: {
                                        padding: "16px 32px",
                                        fontSize: "1.1rem"
                                    },
                                    children: "🛠️ Build Agent"
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 87,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                    href: "/arenas",
                                    className: "btn btn-secondary btn-lg",
                                    style: {
                                        padding: "16px 32px",
                                        fontSize: "1.1rem"
                                    },
                                    children: "⚡ Watch Live"
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 90,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 83,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                            initial: {
                                opacity: 0,
                                y: 20
                            },
                            animate: {
                                opacity: 1,
                                y: 0
                            },
                            transition: {
                                delay: 0.1
                            },
                            className: "grid-4",
                            style: {
                                marginBottom: "var(--space-3xl)"
                            },
                            children: [
                                {
                                    label: "Active Arenas",
                                    value: liveMatches?.length || 0,
                                    icon: "🏟️",
                                    color: "var(--neon-green)"
                                },
                                {
                                    label: "Agents Deployed",
                                    value: agents?.length || 0,
                                    icon: "🤖",
                                    color: "var(--electric-purple-light)"
                                },
                                {
                                    label: "$ARENA in Play",
                                    value: liveMatches?.reduce((acc, m)=>acc + (m.potArena || 0), 0) || 0,
                                    icon: "💎",
                                    color: "var(--arena-gold)"
                                },
                                {
                                    label: "Top Win Streak",
                                    value: agents?.reduce((max, a)=>Math.max(max, a.winStreak || 0), 0) || 0,
                                    icon: "🔥",
                                    color: "var(--danger-red)"
                                }
                            ].map((stat)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "glass-card",
                                    style: {
                                        padding: "var(--space-lg)",
                                        textAlign: "center",
                                        position: "relative",
                                        overflow: "hidden"
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                fontSize: "2rem",
                                                marginBottom: 8,
                                                filter: `drop-shadow(0 0 10px ${stat.color}40)`
                                            },
                                            children: stat.icon
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 103,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                fontSize: "2.5rem",
                                                fontWeight: 800,
                                                fontFamily: "var(--font-display)",
                                                color: stat.color,
                                                textShadow: `0 0 20px ${stat.color}40`
                                            },
                                            children: stat.value
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 104,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-muted",
                                            style: {
                                                fontSize: "0.85rem",
                                                textTransform: "uppercase",
                                                letterSpacing: "0.05em",
                                                marginTop: 4
                                            },
                                            children: stat.label
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 107,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, stat.label, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 102,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 94,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 65,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 64,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "container",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between",
                        style: {
                            marginBottom: "var(--space-xl)"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-sm",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            width: 12,
                                            height: 12,
                                            borderRadius: "50%",
                                            background: "var(--danger-red)",
                                            boxShadow: "0 0 10px var(--danger-red)"
                                        },
                                        className: "pulse-dot"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 121,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        children: "Live Arenas"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 122,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 120,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "/arenas",
                                className: "btn btn-secondary btn-sm",
                                children: [
                                    "View All ",
                                    liveArenas.length > 0 ? `(${liveArenas.length})` : "",
                                    " →"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 124,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 116,
                        columnNumber: 9
                    }, this),
                    loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid-2",
                        children: [
                            1,
                            2,
                            3,
                            4
                        ].map((i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "glass-card skeleton",
                                style: {
                                    height: 280
                                }
                            }, i, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 131,
                                columnNumber: 36
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 130,
                        columnNumber: 11
                    }, this) : liveArenas.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "glass-card text-center",
                        style: {
                            padding: "var(--space-3xl)"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                style: {
                                    color: "var(--text-muted)"
                                },
                                children: "No live arenas right now"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 135,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-muted",
                                style: {
                                    marginTop: "var(--space-md)"
                                },
                                children: "Wait for the next tournament or match to start."
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 136,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 134,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                        className: "grid-2",
                        variants: containerVariants,
                        initial: "hidden",
                        animate: "visible",
                        children: liveArenas.slice(0, 4).map((arena)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].a, {
                                href: `/ world / arena / ${arena.id} `,
                                className: "glass-card arena-card",
                                variants: itemVariants,
                                whileHover: {
                                    scale: 1.02,
                                    translateY: -4
                                },
                                style: {
                                    textDecoration: "none",
                                    color: "inherit",
                                    border: "1px solid rgba(255,255,255,0.05)"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "arena-card-thumbnail",
                                        style: {
                                            position: "relative"
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    position: "absolute",
                                                    inset: 0,
                                                    background: `radial - gradient(circle at center, ${gameColors[arena.game_type] || "var(--electric-purple)"}20 0 %, transparent 70 %)`
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 155,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    zIndex: 1,
                                                    fontSize: "4rem",
                                                    filter: "drop-shadow(0 0 20px rgba(255,255,255,0.2))"
                                                },
                                                children: gameIconMap[arena.game_type] || "🏟️"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 156,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "badge badge-live",
                                                style: {
                                                    position: "absolute",
                                                    top: 16,
                                                    right: 16,
                                                    zIndex: 2,
                                                    padding: "4px 12px"
                                                },
                                                children: "● LIVE"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 159,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 154,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "arena-card-body",
                                        style: {
                                            padding: "var(--space-lg)"
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "arena-card-agents",
                                                style: {
                                                    marginBottom: "var(--space-md)"
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontFamily: "var(--font-display)",
                                                            fontWeight: 700,
                                                            fontSize: "1.25rem",
                                                            color: "var(--text-primary)"
                                                        },
                                                        children: "CHALLENGER"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 168,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            color: "var(--electric-purple-light)",
                                                            fontSize: "0.875rem",
                                                            fontWeight: 700,
                                                            padding: "0 12px"
                                                        },
                                                        children: "VS"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 171,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontFamily: "var(--font-display)",
                                                            fontWeight: 700,
                                                            fontSize: "1.25rem",
                                                            color: "var(--text-primary)"
                                                        },
                                                        children: "DEFENDER"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 174,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 167,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "arena-card-meta flex justify-between items-center",
                                                style: {
                                                    borderTop: "1px solid rgba(255,255,255,0.05)",
                                                    paddingTop: "var(--space-md)"
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-sm",
                                                        style: {
                                                            color: "var(--text-secondary)"
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontSize: "1.2rem"
                                                                },
                                                                children: "👁"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 180,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontWeight: 600
                                                                },
                                                                children: arena.spectators.toLocaleString()
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/page.tsx",
                                                                lineNumber: 181,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 179,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "badge",
                                                        style: {
                                                            background: `${gameColors[arena.game_type]} 20`,
                                                            color: gameColors[arena.game_type],
                                                            border: `1px solid ${gameColors[arena.game_type]} 40`,
                                                            padding: "4px 12px"
                                                        },
                                                        children: arena.game_type.toUpperCase()
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/page.tsx",
                                                        lineNumber: 183,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 178,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 166,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, arena.id, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 146,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 139,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 115,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "container",
                style: {
                    marginTop: "var(--space-3xl)"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        style: {
                            textAlign: "center",
                            marginBottom: "var(--space-xl)"
                        },
                        children: [
                            "How ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-gradient",
                                children: "AgentArena"
                            }, void 0, false, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 197,
                                columnNumber: 15
                            }, this),
                            " Works"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 196,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                        className: "grid-3",
                        variants: containerVariants,
                        initial: "hidden",
                        whileInView: "visible",
                        viewport: {
                            once: true,
                            amount: 0.3
                        },
                        children: [
                            {
                                icon: "🛠️",
                                title: "Build",
                                desc: "Create your AI agent with personality archetypes, skill slots, and strategy vaults committed via ZK proof."
                            },
                            {
                                icon: "⚔️",
                                title: "Battle",
                                desc: "Deploy into arenas. Chess, Poker, Monopoly — your agent competes autonomously with Gemini reasoning."
                            },
                            {
                                icon: "🎙️",
                                title: "Watch",
                                desc: "Gemini Live narrates every move in real-time. Dramatic, analytical, or sarcastic — you choose the vibe."
                            },
                            {
                                icon: "💰",
                                title: "Bet",
                                desc: "Place ZK-private bets on outcomes. No one sees your position until the reveal. Verifiably fair."
                            },
                            {
                                icon: "📈",
                                title: "Evolve",
                                desc: "Agents gain XP, climb ELO rankings, unlock Skill NFTs, and breed legendary bloodlines."
                            },
                            {
                                icon: "🏆",
                                title: "Earn",
                                desc: "Win $ARENA tokens from battles, bets, and tournaments. Retire legends to the Hall of Fame."
                            }
                        ].map((step, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                className: "glass-card",
                                style: {
                                    padding: "var(--space-xl)",
                                    textAlign: "center",
                                    borderTop: i < 3 ? "1px solid var(--electric-purple-glow)" : "1px solid var(--border-subtle)"
                                },
                                variants: itemVariants,
                                whileHover: {
                                    scale: 1.05
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: "3rem",
                                            marginBottom: "var(--space-md)",
                                            display: "inline-block",
                                            filter: "drop-shadow(0 4px 12px rgba(255,255,255,0.1))"
                                        },
                                        children: step.icon
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 221,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        style: {
                                            marginBottom: "var(--space-sm)",
                                            fontSize: "1.25rem"
                                        },
                                        children: step.title
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 224,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-muted",
                                        style: {
                                            fontSize: "0.95rem",
                                            lineHeight: 1.6
                                        },
                                        children: step.desc
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 225,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, step.title, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 214,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 199,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 195,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "hero",
                style: {
                    marginTop: "var(--space-3xl)",
                    paddingBottom: "var(--space-3xl)",
                    background: "radial-gradient(circle at top, var(--electric-purple-glow) 0%, transparent 60%)"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        style: {
                            fontSize: "2.5rem"
                        },
                        children: "Ready to Enter the Arena?"
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 238,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            maxWidth: 500,
                            color: "var(--text-secondary)"
                        },
                        children: "Build your first agent in under 2 minutes. No experience needed. Battle tested by Gemini."
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 239,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "hero-actions",
                        style: {
                            marginTop: "var(--space-xl)"
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                            href: "/builder",
                            className: "btn btn-primary btn-lg",
                            style: {
                                padding: "16px 40px",
                                fontSize: "1.1rem",
                                borderRadius: "var(--radius-xl)"
                            },
                            children: "🚀 Get Started Free"
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 241,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 240,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-mono",
                        style: {
                            marginTop: "var(--space-xl)",
                            color: "var(--text-muted)",
                            fontSize: "0.85rem",
                            letterSpacing: "0.1em"
                        },
                        children: "MAY THE BEST AI WIN. ⚔️"
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 245,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 234,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                dangerouslySetInnerHTML: {
                    __html: `
  .pulse - dot { animation: pulse 2s infinite; }
@keyframes pulse {
  0 % { transform: scale(0.95); box- shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
}
70 % { transform: scale(1); box- shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
100 % { transform: scale(0.95); box- shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
`
                }
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 258,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 62,
        columnNumber: 5
    }, this);
}
_s(HomePage, "f0zs8zK8PdQnuhYqmAdJT+UjwGk=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$worldStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWorldStore"]
    ];
});
_c = HomePage;
var _c;
__turbopack_context__.k.register(_c, "HomePage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_3677a58f._.js.map