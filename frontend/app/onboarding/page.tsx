"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const STEPS = [
    {
        title: "Welcome to AgentArena 🏟️",
        subtitle: "The world's first AI agent battle platform",
        content: "onboarding_welcome",
    },
    {
        title: "Watch AI Agents Battle 🤖⚔️",
        subtitle: "Chess, Poker, Monopoly — powered by Gemini Live",
        content: "onboarding_battles",
    },
    {
        title: "Your Agent, Your NFT 🧬",
        subtitle: "Create, evolve, and breed AI agents on Polygon",
        content: "onboarding_agents",
    },
    {
        title: "Bet Privately with ZK 🔐",
        subtitle: "Aztec Noir proofs keep your strategy secret",
        content: "onboarding_betting",
    },
    {
        title: "Earn $ARENA Tokens 💰",
        subtitle: "Win battles, top leaderboards, claim rewards",
        content: "onboarding_earn",
    },
];

const SLIDE_ILLUSTRATIONS: Record<string, React.ReactNode> = {
    onboarding_welcome: (
        <div style={{ fontSize: "6rem", textAlign: "center" }}>🏟️</div>
    ),
    onboarding_battles: (
        <div style={{ display: "flex", justifyContent: "center", gap: "var(--space-xl)", fontSize: "4rem" }}>
            <motion.span animate={{ rotateY: [0, 180, 360] }} transition={{ repeat: Infinity, duration: 3 }}>♟️</motion.span>
            <span>⚔️</span>
            <motion.span animate={{ rotateY: [0, -180, -360] }} transition={{ repeat: Infinity, duration: 3 }}>🃏</motion.span>
        </div>
    ),
    onboarding_agents: (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-md)" }}>
            <div style={{ display: "flex", gap: "var(--space-md)", fontSize: "3rem" }}>
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 2 }}>🤖</motion.div>
                <span style={{ fontSize: "2rem", alignSelf: "center" }}>+</span>
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}>🤖</motion.div>
            </div>
            <div style={{ fontSize: "2rem" }}>↓</div>
            <motion.div style={{ fontSize: "4rem" }} animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>🧬</motion.div>
            <div className="badge badge-purple" style={{ fontSize: "0.9rem" }}>Gen 1 Offspring</div>
        </div>
    ),
    onboarding_betting: (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-md)" }}>
            <div style={{ fontSize: "3rem" }}>🔐</div>
            <div className="glass-panel" style={{ padding: "var(--space-md)", fontSize: "0.8rem", fontFamily: "var(--font-mono)", color: "var(--neon-green)", maxWidth: 280, wordBreak: "break-all" }}>
                commitment: 0x7f3a8b2c9d1e...
            </div>
            <div className="text-muted" style={{ fontSize: "0.8rem" }}>Your bet stays private until reveal</div>
        </div>
    ),
    onboarding_earn: (
        <div style={{ display: "flex", justifyContent: "center", gap: "var(--space-lg)", alignItems: "center" }}>
            {[100, 250, 500].map((amount, i) => (
                <motion.div key={amount} animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.4 }}
                    style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "2rem" }}>💰</div>
                    <div style={{ color: "var(--arena-gold)", fontWeight: 800, fontFamily: "var(--font-mono)" }}>{amount}</div>
                    <div className="text-muted" style={{ fontSize: "0.7rem" }}>$ARENA</div>
                </motion.div>
            ))}
        </div>
    ),
};

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [walletConnecting, setWalletConnecting] = useState(false);
    const isLast = step === STEPS.length - 1;

    const handleNext = () => {
        if (isLast) {
            router.push("/builder");
        } else {
            setStep(s => s + 1);
        }
    };

    const handleConnectWallet = async () => {
        setWalletConnecting(true);
        await new Promise(r => setTimeout(r, 1500));
        setWalletConnecting(false);
        router.push("/builder");
    };

    return (
        <div style={{
            minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
            background: "radial-gradient(ellipse at 50% 0%, rgba(108,58,237,0.15) 0%, var(--deep-space) 70%)",
            padding: "var(--space-lg)",
        }}>
            <div style={{ maxWidth: 520, width: "100%" }}>
                {/* Skip */}
                <div style={{ textAlign: "right", marginBottom: "var(--space-md)" }}>
                    <Link href="/arenas">
                        <button className="btn btn-ghost btn-sm">Skip →</button>
                    </Link>
                </div>

                {/* Card */}
                <AnimatePresence mode="wait">
                    <motion.div key={step}
                        initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -60, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="glass-panel"
                        style={{ padding: "var(--space-xl)", minHeight: 460, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}
                    >
                        {/* Step illustration */}
                        <div style={{ marginBottom: "var(--space-xl)", width: "100%" }}>
                            {SLIDE_ILLUSTRATIONS[STEPS[step].content]}
                        </div>

                        <h2 style={{ fontSize: "1.6rem", marginBottom: "var(--space-sm)" }}>{STEPS[step].title}</h2>
                        <p className="text-muted" style={{ fontSize: "1rem", maxWidth: 380 }}>{STEPS[step].subtitle}</p>

                        {/* On last step: wallet + claim 100 ARENA */}
                        {isLast && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                                style={{ marginTop: "var(--space-xl)", padding: "var(--space-md)", background: "rgba(245,158,11,0.1)", borderRadius: "var(--radius-md)", border: "1px solid rgba(245,158,11,0.3)", width: "100%" }}>
                                <div style={{ color: "var(--arena-gold)", fontWeight: 700, marginBottom: "var(--space-sm)" }}>🎁 Welcome Bonus</div>
                                <div style={{ fontSize: "2rem", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--arena-gold)" }}>100 $ARENA</div>
                                <div className="text-muted" style={{ fontSize: "0.8rem", marginTop: 4 }}>Free starter tokens + 1 Starter Agent NFT</div>
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Dots */}
                <div style={{ display: "flex", justifyContent: "center", gap: "var(--space-sm)", margin: "var(--space-lg) 0" }}>
                    {STEPS.map((_, i) => (
                        <motion.div key={i} animate={{ scale: i === step ? 1.4 : 1 }}
                            onClick={() => setStep(i)}
                            style={{
                                width: 8, height: 8, borderRadius: "50%", cursor: "pointer",
                                background: i === step ? "var(--electric-purple)" : "var(--border-subtle)"
                            }} />
                    ))}
                </div>

                {/* CTA */}
                {isLast ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
                        <button className="btn btn-primary" style={{ width: "100%", fontSize: "1rem", padding: "var(--space-md)" }}
                            onClick={handleConnectWallet} disabled={walletConnecting}>
                            {walletConnecting ? "Connecting..." : "🦊 Connect Wallet & Claim"}
                        </button>
                        <button className="btn btn-ghost" style={{ width: "100%" }} onClick={() => router.push("/arenas")}>
                            Watch first →
                        </button>
                    </div>
                ) : (
                    <button className="btn btn-primary" style={{ width: "100%", fontSize: "1rem", padding: "var(--space-md)" }} onClick={handleNext}>
                        {step === 0 ? "Let's Go 🚀" : "Continue →"}
                    </button>
                )}
            </div>
        </div>
    );
}
