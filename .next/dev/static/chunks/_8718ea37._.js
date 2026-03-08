(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/contracts.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AGENT_NFT_ABI",
    ()=>AGENT_NFT_ABI,
    "ARENA_TOKEN_ABI",
    ()=>ARENA_TOKEN_ABI,
    "CONTRACTS",
    ()=>CONTRACTS,
    "ZK_BETTING_POOL_ABI",
    ()=>ZK_BETTING_POOL_ABI,
    "computeCommitHash",
    ()=>computeCommitHash,
    "fetchArenaBalance",
    ()=>fetchArenaBalance,
    "getAgentNFTRead",
    ()=>getAgentNFTRead,
    "getArenaTokenRead",
    ()=>getArenaTokenRead,
    "getArenaTokenWrite",
    ()=>getArenaTokenWrite,
    "getBrowserProvider",
    ()=>getBrowserProvider,
    "getReadContract",
    ()=>getReadContract,
    "getWriteContract",
    ()=>getWriteContract,
    "getZKBettingPoolRead",
    ()=>getZKBettingPoolRead,
    "getZKBettingPoolWrite",
    ()=>getZKBettingPoolWrite
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
// ─── AgentArena Contract Configuration ───────────────────────────────
// Central config for all on-chain contract interactions via ethers.js.
// Contract addresses are read from environment variables so they can be
// changed per-network (local Hardhat, Polygon Amoy testnet, mainnet).
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$ethers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__ethers$3e$__ = __turbopack_context__.i("[project]/node_modules/ethers/lib.esm/ethers.js [app-client] (ecmascript) <export * as ethers>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$providers$2f$provider$2d$browser$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/ethers/lib.esm/providers/provider-browser.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$contract$2f$contract$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/ethers/lib.esm/contract/contract.js [app-client] (ecmascript)");
;
const CONTRACTS = {
    ARENA_TOKEN: ("TURBOPACK compile-time value", "") || "",
    ZK_BETTING_POOL: ("TURBOPACK compile-time value", "") || "",
    AGENT_NFT: ("TURBOPACK compile-time value", "") || ""
};
const ARENA_TOKEN_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)"
];
const ZK_BETTING_POOL_ABI = [
    "function commitBetArena(uint256 gameId, uint256 amount, bytes32 commitHash, bytes32 noirCommit) external",
    "function commitBetETH(uint256 gameId, bytes32 commitHash, bytes32 noirCommit) external payable",
    "function revealAndClaim(uint256 gameId, uint8 side, uint256 secret, bytes calldata noirProof) external",
    "function getGameOdds(uint256 gameId) external view returns (uint256 totalA, uint256 totalB, uint256 impliedProbA)",
    "function getCommitHash(uint256 amount, uint8 side, uint256 secret) external pure returns (bytes32)",
    "function games(uint256) view returns (bytes32 agentAId, bytes32 agentBId, string gameType, uint8 status, uint8 currency, uint256 totalPoolA, uint256 totalPoolB, uint8 winner, uint64 startedAt, uint64 resolvedAt)"
];
const AGENT_NFT_ABI = [
    "function agentStats(uint256 tokenId) view returns (string name, string personality, uint256 xp, uint256 elo, uint16 level, uint32 wins, uint32 losses, uint32 gamesPlayed, uint64 createdAt, uint64 lastBattleAt, bool isRetired)",
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function balanceOf(address owner) view returns (uint256)",
    "function mintAgent(string name, string personality, string metadataURI) external payable returns (uint256)",
    "function mintPrice() view returns (uint256)"
];
function getBrowserProvider() {
    if (("TURBOPACK compile-time value", "object") === "undefined" || !window.ethereum) return null;
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$providers$2f$provider$2d$browser$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BrowserProvider"](window.ethereum);
}
function getReadContract(address, abi) {
    const provider = getBrowserProvider();
    if (!provider || !address) return null;
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$contract$2f$contract$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Contract"](address, abi, provider);
}
async function getWriteContract(address, abi) {
    const provider = getBrowserProvider();
    if (!provider || !address) return null;
    const signer = await provider.getSigner();
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$contract$2f$contract$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Contract"](address, abi, signer);
}
function getArenaTokenRead() {
    return getReadContract(CONTRACTS.ARENA_TOKEN, ARENA_TOKEN_ABI);
}
async function getArenaTokenWrite() {
    return getWriteContract(CONTRACTS.ARENA_TOKEN, ARENA_TOKEN_ABI);
}
function getZKBettingPoolRead() {
    return getReadContract(CONTRACTS.ZK_BETTING_POOL, ZK_BETTING_POOL_ABI);
}
async function getZKBettingPoolWrite() {
    return getWriteContract(CONTRACTS.ZK_BETTING_POOL, ZK_BETTING_POOL_ABI);
}
function getAgentNFTRead() {
    return getReadContract(CONTRACTS.AGENT_NFT, AGENT_NFT_ABI);
}
async function fetchArenaBalance(address) {
    try {
        const token = getArenaTokenRead();
        if (!token) return "0";
        const raw = await token.balanceOf(address);
        const formatted = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$ethers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__ethers$3e$__["ethers"].formatUnits(raw, 18);
        // Format with commas and 2 decimals
        const num = parseFloat(formatted);
        return num.toLocaleString("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });
    } catch  {
        return "0";
    }
}
function computeCommitHash(amount, side, secret) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$ethers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__ethers$3e$__["ethers"].solidityPackedKeccak256([
        "uint256",
        "uint8",
        "uint256"
    ], [
        amount,
        side,
        secret
    ]);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/wallet.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WalletProvider",
    ()=>WalletProvider,
    "useWallet",
    ()=>useWallet
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$siwe$2f$dist$2f$siwe$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/siwe/dist/siwe.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$contracts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/contracts.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
const WalletContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
// ── Polygon chain config ─────────────────────────────────────
const POLYGON_CHAIN = {
    chainId: "0x89",
    chainName: "Polygon Mainnet",
    rpcUrls: [
        "https://polygon-rpc.com"
    ],
    nativeCurrency: {
        name: "MATIC",
        symbol: "MATIC",
        decimals: 18
    },
    blockExplorerUrls: [
        "https://polygonscan.com"
    ]
};
function WalletProvider({ children }) {
    _s();
    const [state, setState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        address: null,
        chainId: null,
        isConnected: false,
        isConnecting: false,
        balance: "0",
        arenaBalance: "0",
        token: ("TURBOPACK compile-time truthy", 1) ? localStorage.getItem("agentarena_token") : "TURBOPACK unreachable"
    });
    const connect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "WalletProvider.useCallback[connect]": async ()=>{
            if (("TURBOPACK compile-time value", "object") === "undefined" || !window.ethereum) {
                alert("Please install MetaMask to connect your wallet.");
                return;
            }
            setState({
                "WalletProvider.useCallback[connect]": (s)=>({
                        ...s,
                        isConnecting: true
                    })
            }["WalletProvider.useCallback[connect]"]);
            try {
                const ethereum = window.ethereum;
                const accounts = await ethereum.request({
                    method: "eth_requestAccounts"
                });
                const address = accounts[0];
                const chainIdHex = await ethereum.request({
                    method: "eth_chainId"
                });
                const chainId = parseInt(chainIdHex, 16);
                // 1. Get Nonce from Backend
                const nonceRes = await fetch("http://localhost:8000/auth/nonce");
                const { nonce } = await nonceRes.json();
                // 2. Create SIWE Message
                const message = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$siwe$2f$dist$2f$siwe$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SiweMessage"]({
                    domain: window.location.host,
                    address,
                    statement: "Sign in to AgentArena. This will issue a session token for secure API access.",
                    uri: window.location.origin,
                    version: "1",
                    chainId,
                    nonce
                });
                const preparedMessage = message.prepareMessage();
                // 3. Prompt user signature
                const signature = await ethereum.request({
                    method: "personal_sign",
                    params: [
                        preparedMessage,
                        address
                    ]
                });
                // 4. Verify signature on backend
                const verifyRes = await fetch("http://localhost:8000/auth/verify", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        message: message,
                        signature
                    })
                });
                if (!verifyRes.ok) {
                    throw new Error("SIWE verification failed");
                }
                const { token } = await verifyRes.json();
                localStorage.setItem("agentarena_token", token);
                const balanceHex = await ethereum.request({
                    method: "eth_getBalance",
                    params: [
                        address,
                        "latest"
                    ]
                });
                const balanceEth = (parseInt(balanceHex, 16) / 1e18).toFixed(4);
                // Fetch real $ARENA balance from contract (falls back to "0" if not deployed)
                const arenaBalanceStr = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$contracts$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchArenaBalance"])(address);
                setState({
                    address,
                    chainId,
                    isConnected: true,
                    isConnecting: false,
                    balance: balanceEth,
                    arenaBalance: arenaBalanceStr,
                    token
                });
            } catch (err) {
                console.error("Connection failed:", err);
                setState({
                    "WalletProvider.useCallback[connect]": (s)=>({
                            ...s,
                            isConnecting: false
                        })
                }["WalletProvider.useCallback[connect]"]);
            }
        }
    }["WalletProvider.useCallback[connect]"], []);
    const disconnect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "WalletProvider.useCallback[disconnect]": ()=>{
            localStorage.removeItem("agentarena_token");
            setState({
                address: null,
                chainId: null,
                isConnected: false,
                isConnecting: false,
                balance: "0",
                arenaBalance: "0",
                token: null
            });
        }
    }["WalletProvider.useCallback[disconnect]"], []);
    const switchToPolygon = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "WalletProvider.useCallback[switchToPolygon]": async ()=>{
            if (!window.ethereum) return;
            try {
                await window.ethereum.request({
                    method: "wallet_switchEthereumChain",
                    params: [
                        {
                            chainId: POLYGON_CHAIN.chainId
                        }
                    ]
                });
            } catch (err) {
                if (err.code === 4902) {
                    await window.ethereum.request({
                        method: "wallet_addEthereumChain",
                        params: [
                            POLYGON_CHAIN
                        ]
                    });
                }
            }
        }
    }["WalletProvider.useCallback[switchToPolygon]"], []);
    // Listen for account/chain changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "WalletProvider.useEffect": ()=>{
            if (("TURBOPACK compile-time value", "object") === "undefined" || !window.ethereum) return;
            const ethereum = window.ethereum;
            const handleAccountsChanged = {
                "WalletProvider.useEffect.handleAccountsChanged": (accounts)=>{
                    if (accounts.length === 0) {
                        disconnect();
                    } else {
                        setState({
                            "WalletProvider.useEffect.handleAccountsChanged": (s)=>({
                                    ...s,
                                    address: accounts[0]
                                })
                        }["WalletProvider.useEffect.handleAccountsChanged"]);
                    }
                }
            }["WalletProvider.useEffect.handleAccountsChanged"];
            const handleChainChanged = {
                "WalletProvider.useEffect.handleChainChanged": (chainId)=>{
                    setState({
                        "WalletProvider.useEffect.handleChainChanged": (s)=>({
                                ...s,
                                chainId: parseInt(chainId, 16)
                            })
                    }["WalletProvider.useEffect.handleChainChanged"]);
                }
            }["WalletProvider.useEffect.handleChainChanged"];
            ethereum.on("accountsChanged", handleAccountsChanged);
            ethereum.on("chainChanged", handleChainChanged);
            return ({
                "WalletProvider.useEffect": ()=>{
                    ethereum.removeListener("accountsChanged", handleAccountsChanged);
                    ethereum.removeListener("chainChanged", handleChainChanged);
                }
            })["WalletProvider.useEffect"];
        }
    }["WalletProvider.useEffect"], [
        disconnect
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(WalletContext.Provider, {
        value: {
            ...state,
            connect,
            disconnect,
            switchToPolygon
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/lib/wallet.tsx",
        lineNumber: 175,
        columnNumber: 9
    }, this);
}
_s(WalletProvider, "BSFWR9MybS9J+HwJldLw93BI7hI=");
_c = WalletProvider;
function useWallet() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(WalletContext);
    if (!context) throw new Error("useWallet must be used within WalletProvider");
    return context;
}
_s1(useWallet, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "WalletProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/providers.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Providers",
    ()=>Providers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$wallet$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/wallet.tsx [app-client] (ecmascript)");
"use client";
;
;
function Providers({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$wallet$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WalletProvider"], {
        children: children
    }, void 0, false, {
        fileName: "[project]/app/providers.tsx",
        lineNumber: 6,
        columnNumber: 12
    }, this);
}
_c = Providers;
var _c;
__turbopack_context__.k.register(_c, "Providers");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/layout/Navbar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Navbar",
    ()=>Navbar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$wallet$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/wallet.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function Navbar() {
    _s();
    const { isConnected, isConnecting, address, connect, disconnect } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$wallet$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWallet"])();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    // Hide navbar on immersive 3D world page
    if (pathname === "/world") return null;
    const shortenAddress = (addr)=>`${addr.slice(0, 6)}...${addr.slice(-4)}`;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
        className: "nav",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                href: "/",
                className: "nav-logo",
                children: "⚔️ AgentArena"
            }, void 0, false, {
                fileName: "[project]/components/layout/Navbar.tsx",
                lineNumber: 18,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                className: "nav-links",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            href: "/",
                            className: `nav-link ${pathname === "/" ? "active" : ""}`,
                            children: "Home"
                        }, void 0, false, {
                            fileName: "[project]/components/layout/Navbar.tsx",
                            lineNumber: 23,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/layout/Navbar.tsx",
                        lineNumber: 22,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            href: "/world",
                            className: `nav-link ${pathname === "/world" ? "active" : ""}`,
                            children: "3D World"
                        }, void 0, false, {
                            fileName: "[project]/components/layout/Navbar.tsx",
                            lineNumber: 28,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/layout/Navbar.tsx",
                        lineNumber: 27,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            href: "/arenas",
                            className: `nav-link ${pathname === "/arenas" ? "active" : ""}`,
                            children: "Arenas"
                        }, void 0, false, {
                            fileName: "[project]/components/layout/Navbar.tsx",
                            lineNumber: 33,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/layout/Navbar.tsx",
                        lineNumber: 32,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            href: "/builder",
                            className: `nav-link ${pathname === "/builder" ? "active" : ""}`,
                            children: "Build Agent"
                        }, void 0, false, {
                            fileName: "[project]/components/layout/Navbar.tsx",
                            lineNumber: 38,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/layout/Navbar.tsx",
                        lineNumber: 37,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            href: "/leaderboard",
                            className: `nav-link ${pathname === "/leaderboard" ? "active" : ""}`,
                            children: "Leaderboard"
                        }, void 0, false, {
                            fileName: "[project]/components/layout/Navbar.tsx",
                            lineNumber: 43,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/layout/Navbar.tsx",
                        lineNumber: 42,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            href: "/my-agents",
                            className: `nav-link ${pathname?.startsWith("/my-agents") || pathname?.startsWith("/agents") ? "active" : ""}`,
                            children: "My Agents"
                        }, void 0, false, {
                            fileName: "[project]/components/layout/Navbar.tsx",
                            lineNumber: 48,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/layout/Navbar.tsx",
                        lineNumber: 47,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            href: "/tournaments",
                            className: `nav-link ${pathname?.startsWith("/tournaments") ? "active" : ""}`,
                            children: "Tournaments"
                        }, void 0, false, {
                            fileName: "[project]/components/layout/Navbar.tsx",
                            lineNumber: 53,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/layout/Navbar.tsx",
                        lineNumber: 52,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            href: "/marketplace",
                            className: `nav-link ${pathname?.startsWith("/marketplace") ? "active" : ""}`,
                            children: "Marketplace"
                        }, void 0, false, {
                            fileName: "[project]/components/layout/Navbar.tsx",
                            lineNumber: 58,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/layout/Navbar.tsx",
                        lineNumber: 57,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            href: "/profile",
                            className: `nav-link ${pathname === "/profile" ? "active" : ""}`,
                            children: "Profile"
                        }, void 0, false, {
                            fileName: "[project]/components/layout/Navbar.tsx",
                            lineNumber: 63,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/layout/Navbar.tsx",
                        lineNumber: 62,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/layout/Navbar.tsx",
                lineNumber: 21,
                columnNumber: 13
            }, this),
            isConnected && address ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: "btn btn-secondary btn-sm",
                onClick: disconnect,
                children: shortenAddress(address)
            }, void 0, false, {
                fileName: "[project]/components/layout/Navbar.tsx",
                lineNumber: 70,
                columnNumber: 17
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: "btn btn-primary btn-sm",
                onClick: connect,
                disabled: isConnecting,
                children: isConnecting ? "Connecting..." : "Connect Wallet"
            }, void 0, false, {
                fileName: "[project]/components/layout/Navbar.tsx",
                lineNumber: 74,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/layout/Navbar.tsx",
        lineNumber: 17,
        columnNumber: 9
    }, this);
}
_s(Navbar, "UaRbp1V/O1u6XXsiajYbvmw/opo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$wallet$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWallet"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"]
    ];
});
_c = Navbar;
var _c;
__turbopack_context__.k.register(_c, "Navbar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_8718ea37._.js.map