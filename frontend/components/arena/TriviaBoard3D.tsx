"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import { WebGLSafeCanvas } from "../world/WebGLErrorBoundary";

/* ── Trivia colour palette ─────────────────────────────────── */
const T = {
  bg:           "#02020A",
  stage:        "#0A0A0A",
  podium:       "#1A1824",
  screen:       "#0A0C14",
  neonGreen:    "#39FF6B",
  neonOrange:   "#FF8C1A",
  neonBlue:     "#4DA6FF",
  neonGold:     "#FFD700",
  correct:      "#39FF6B",
  wrong:        "#FF4444",
  ivory:        "#F0EAF5",
  stone:        "#8C7C68",
  gold:         "#C8963C",
} as const;

const NEON_TUBES = [
  { colour: T.neonGreen,  x: -6, y: 4.5, z: -6,  hz: 0.65 },
  { colour: T.neonOrange, x:  6, y: 4.5, z: -6,  hz: 0.82 },
  { colour: T.neonBlue,   x: -6, y: 4.5, z:  2,  hz: 0.71 },
  { colour: T.neonGold,   x:  6, y: 4.5, z:  2,  hz: 0.90 },
] as const;

const AGENT_COLOURS = ["#4DA6FF", "#FF8C1A", "#39FF6B", "#FFD700"];

const CATEGORY_COLOURS: Record<string, string> = {
  science:    T.neonBlue,
  history:    T.neonGold,
  geography:  T.neonGreen,
  crypto:     T.neonOrange,
  pop_culture: "#FF69B4",
};

interface TriviaQuestion {
    question: string;
    category: string;
    difficulty: number;
    round_number: number;
    time_limit: number;
    buzzed_by: string | null;
}

interface TriviaBoardProps {
    scores: Record<string, number>;
    currentQuestion: TriviaQuestion | null;
    agents: string[];
    currentRound: number;
    totalRounds: number;
    onBuzz?: () => void;
    thinkingAgentId?: string | null;
}

/* ── Helpers ──────────────────────────────────────────────── */

function wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
): void {
    const words = text.split(" ");
    let line = "";
    let currentY = y;
    for (const word of words) {
        const testLine = line + (line ? " " : "") + word;
        if (ctx.measureText(testLine).width > maxWidth && line) {
            ctx.fillText(line, x, currentY);
            line = word;
            currentY += lineHeight;
        } else {
            line = testLine;
        }
    }
    if (line) ctx.fillText(line, x, currentY);
}

/* ── Neon Tube ────────────────────────────────────────────── */
function NeonTube({
    colour,
    x,
    y,
    z,
    hz,
}: {
    colour: string;
    x: number;
    y: number;
    z: number;
    hz: number;
}) {
    const meshRef = useRef<THREE.Mesh>(null!);
    const lightRef = useRef<THREE.PointLight>(null!);

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        const intensity = 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(t * hz * Math.PI * 2));
        if (meshRef.current) {
            (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = intensity;
        }
        if (lightRef.current) {
            lightRef.current.intensity = intensity * 1.2;
        }
    });

    return (
        <group position={[x, y, z]}>
            {/* Core tube — runs along X axis */}
            <mesh ref={meshRef} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.025, 0.025, 16, 8]} />
                <meshStandardMaterial
                    color={colour}
                    emissive={colour}
                    emissiveIntensity={0.8}
                    roughness={0.1}
                    metalness={0.0}
                />
            </mesh>
            {/* Glow halo */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.1, 0.1, 16, 8]} />
                <meshStandardMaterial
                    color={colour}
                    emissive={colour}
                    emissiveIntensity={0.15}
                    transparent
                    opacity={0.12}
                    roughness={1}
                />
            </mesh>
            <pointLight ref={lightRef} color={colour} intensity={1.0} distance={20} decay={2} />
        </group>
    );
}

/* ── Stage Floor ──────────────────────────────────────────── */
function StageFloor() {
    return (
        <>
            {/* Main stage platform */}
            <mesh position={[0, -0.05, 0]} receiveShadow>
                <boxGeometry args={[20, 0.1, 16]} />
                <meshStandardMaterial color={T.stage} roughness={0.15} metalness={0.4} />
            </mesh>
            {/* Audience area — stepped seating (3 rows) */}
            {[1, 2, 3].map((row) => (
                <mesh key={row} position={[0, row * 0.3 - 0.2, 6 + row * 1.2]} receiveShadow>
                    <boxGeometry args={[18, 0.28, 1.0]} />
                    <meshStandardMaterial color="#050508" roughness={0.9} metalness={0.05} />
                </mesh>
            ))}
        </>
    );
}

/* ── Audience Orbs ────────────────────────────────────────── */
function AudienceOrbs({ correctFlash }: { correctFlash: boolean }) {
    const COUNT = 200;
    const meshRef = useRef<THREE.InstancedMesh>(null!);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    const basePositions = useMemo(() => {
        const pos: [number, number, number][] = [];
        for (let i = 0; i < COUNT; i++) {
            const row = Math.floor(i / 40);
            const col = i % 40;
            pos.push([
                (col / 40) * 18 - 9 + (Math.random() - 0.5) * 0.4,
                row * 0.3 + 0.4 + Math.random() * 0.2,
                7 + row * 1.2 + (Math.random() - 0.5) * 0.6,
            ]);
        }
        return pos;
    }, []);

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        for (let i = 0; i < COUNT; i++) {
            const [bx, by, bz] = basePositions[i];
            const bounce = correctFlash ? Math.max(0, Math.sin(t * 8) * 1.5) : 0;
            dummy.position.set(bx, by + bounce * (Math.random() * 0.5 + 0.5), bz);
            dummy.scale.setScalar(0.06 + Math.sin(t * 0.7 + i * 0.3) * 0.01);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
            <sphereGeometry args={[1, 6, 6]} />
            <meshStandardMaterial
                color={correctFlash ? T.neonGreen : T.neonBlue}
                emissive={correctFlash ? T.neonGreen : T.neonBlue}
                emissiveIntensity={correctFlash ? 1.5 : 0.4}
                roughness={0.3}
            />
        </instancedMesh>
    );
}

/* ── Question Screen ──────────────────────────────────────── */
function QuestionScreen({
    question,
    timeLeft,
    timeLimit,
    currentRound,
    totalRounds,
}: {
    question: TriviaQuestion | null;
    timeLeft: number;
    timeLimit: number;
    currentRound: number;
    totalRounds: number;
}) {
    const textureRef = useRef<THREE.CanvasTexture | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // Build canvas texture once
    const texture = useMemo(() => {
        const canvas = document.createElement("canvas");
        canvas.width = 1024;
        canvas.height = 640;
        canvasRef.current = canvas;
        const tex = new THREE.CanvasTexture(canvas);
        textureRef.current = tex;
        return tex;
    }, []);

    // Redraw whenever question or timer changes
    useEffect(() => {
        const canvas = canvasRef.current;
        const tex = textureRef.current;
        if (!canvas || !tex) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const W = 1024, H = 640;
        ctx.fillStyle = T.screen;
        ctx.fillRect(0, 0, W, H);

        // Border frame
        ctx.strokeStyle = T.neonBlue;
        ctx.lineWidth = 3;
        ctx.strokeRect(4, 4, W - 8, H - 8);

        // Round indicator
        ctx.fillStyle = T.stone;
        ctx.font = "bold 13px monospace";
        ctx.textAlign = "right";
        ctx.fillText(`ROUND ${currentRound} / ${totalRounds}`, W - 40, 36);

        if (!question) {
            ctx.fillStyle = T.stone;
            ctx.font = "700 26px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("Awaiting next question...", W / 2, H / 2);
        } else {
            // Category badge
            const catCol = CATEGORY_COLOURS[question.category] ?? T.neonGold;
            ctx.fillStyle = catCol + "33";
            ctx.fillRect(40, 24, 220, 38);
            ctx.strokeStyle = catCol;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(40, 24, 220, 38);
            ctx.fillStyle = catCol;
            ctx.font = "bold 13px monospace";
            ctx.textAlign = "left";
            ctx.fillText(question.category.toUpperCase(), 56, 48);

            // Difficulty dots
            const diffCol = ["", T.neonGreen, T.neonGold, T.neonOrange, T.wrong][question.difficulty] ?? T.stone;
            ctx.fillStyle = diffCol;
            ctx.font = "11px monospace";
            ctx.textAlign = "right";
            ctx.fillText(["", "EASY", "MEDIUM", "HARD", "EXPERT"][question.difficulty] ?? "", W - 40, 48);

            // Question text
            ctx.fillStyle = T.ivory;
            ctx.font = "700 26px sans-serif";
            ctx.textAlign = "center";
            wrapText(ctx, question.question, W / 2, 130, 920, 38);

            // Buzz-in indicator
            if (question.buzzed_by) {
                ctx.fillStyle = T.neonGreen + "33";
                ctx.fillRect(40, 380, W - 80, 48);
                ctx.strokeStyle = T.neonGreen;
                ctx.lineWidth = 1.5;
                ctx.strokeRect(40, 380, W - 80, 48);
                ctx.fillStyle = T.neonGreen;
                ctx.font = "bold 18px monospace";
                ctx.textAlign = "center";
                ctx.fillText(`⚡ ${question.buzzed_by.toUpperCase()} BUZZED IN`, W / 2, 410);
            }

            // Timer bar
            const pct = Math.max(0, Math.min(1, timeLeft / timeLimit));
            const barCol = pct > 0.5 ? T.neonGreen : pct > 0.2 ? T.neonOrange : T.wrong;
            ctx.fillStyle = "#1A1A2A";
            ctx.fillRect(40, 580, W - 80, 14);
            ctx.fillStyle = barCol;
            ctx.fillRect(40, 580, (W - 80) * pct, 14);

            // Timer text
            ctx.fillStyle = barCol;
            ctx.font = "bold 13px monospace";
            ctx.textAlign = "center";
            ctx.fillText(`${timeLeft}s`, W / 2, 574);
        }

        tex.needsUpdate = true;
    }, [question, timeLeft, currentRound, totalRounds]);

    return (
        <group position={[0, 2.8, -5.5]}>
            {/* Screen backing panel */}
            <mesh>
                <boxGeometry args={[8.4, 5.4, 0.08]} />
                <meshStandardMaterial color="#050510" metalness={0.3} roughness={0.7} />
            </mesh>
            {/* Screen surface */}
            <mesh position={[0, 0, 0.05]}>
                <planeGeometry args={[8, 5]} />
                <meshBasicMaterial map={texture} />
            </mesh>
        </group>
    );
}

/* ── Agent Podium ─────────────────────────────────────────── */
function AgentPodium({
    agentId,
    score,
    colour,
    position,
    isBuzzed,
    isLeading,
}: {
    agentId: string;
    score: number;
    colour: string;
    position: [number, number, number];
    isBuzzed: boolean;
    isLeading: boolean;
}) {
    const groupRef = useRef<THREE.Group>(null!);
    const podiumRef = useRef<THREE.Mesh>(null!);
    const buzzerRef = useRef<THREE.Mesh>(null!);
    const spotRef = useRef<THREE.SpotLight>(null!);

    // Buzz-in scale spike animation
    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();

        if (isBuzzed) {
            // Podium scale spike: 1 → 1.15 → 1
            const scaleY = 1 + 0.15 * Math.max(0, Math.sin(t * 12) * Math.exp(-t * 4));
            if (groupRef.current) groupRef.current.scale.y = scaleY;

            // Spotlight brightens
            if (spotRef.current) spotRef.current.intensity = 3.0;

            // Buzzer glow pulse
            if (buzzerRef.current) {
                (buzzerRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
                    1.5 + Math.sin(t * 20) * 0.5;
            }
        } else {
            if (groupRef.current) groupRef.current.scale.y = 1;
            if (spotRef.current) spotRef.current.intensity = isLeading ? 1.0 : 0.3;
            if (buzzerRef.current) {
                (buzzerRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.3;
            }
        }
    });

    const label = agentId.replace("agent_", "").toUpperCase();

    return (
        <group ref={groupRef} position={position}>
            {/* Spotlight from above */}
            <spotLight
                ref={spotRef}
                color={colour}
                intensity={isLeading ? 1.0 : 0.3}
                angle={0.35}
                penumbra={0.4}
                distance={12}
                position={[0, 5, 0]}
                target-position={[0, 0, 0]}
                castShadow
            />

            {/* Podium body — semi-transparent acrylic look */}
            <mesh ref={podiumRef} position={[0, 0.6, 0]} castShadow>
                <boxGeometry args={[2.2, 1.2, 1.0]} />
                <meshPhysicalMaterial
                    color={colour}
                    emissive={colour}
                    emissiveIntensity={isBuzzed ? 1.0 : 0.15}
                    roughness={0.05}
                    metalness={0.1}
                    transmission={0.3}
                    thickness={0.5}
                    transparent
                    opacity={0.85}
                />
            </mesh>

            {/* Buzzer button on top */}
            <mesh ref={buzzerRef} position={[0, 1.27, 0]} castShadow>
                <cylinderGeometry args={[0.28, 0.28, 0.1, 20]} />
                <meshStandardMaterial
                    color={colour}
                    emissive={colour}
                    emissiveIntensity={isBuzzed ? 1.5 : 0.3}
                    roughness={0.2}
                    metalness={0.2}
                />
            </mesh>

            {/* Agent name */}
            <Text
                position={[0, 0.6, 0.52]}
                fontSize={0.22}
                color={colour}
                anchorX="center"
                anchorY="middle"
                maxWidth={2}
            >
                {label}
            </Text>

            {/* Score */}
            <Text
                position={[0, 0.25, 0.52]}
                fontSize={0.18}
                color={T.neonGold}
                anchorX="center"
                anchorY="middle"
            >
                {`${score} pts`}
            </Text>
        </group>
    );
}

/* ── Camera Controller ────────────────────────────────────── */
function CameraController() {
    return (
        <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={6}
            maxDistance={22}
            maxPolarAngle={Math.PI / 2.1}
            enableDamping
            dampingFactor={0.06}
            autoRotate={false}
        />
    );
}

/* ── Full Trivia Scene ────────────────────────────────────── */
function TriviaScene({
    scores,
    currentQuestion,
    agents,
    currentRound,
    totalRounds,
}: Omit<TriviaBoardProps, "onBuzz" | "thinkingAgentId">) {
    const [timeLeft, setTimeLeft] = useState(currentQuestion?.time_limit ?? 15);
    const [correctFlash, setCorrectFlash] = useState(false);

    // Countdown timer
    useEffect(() => {
        setTimeLeft(currentQuestion?.time_limit ?? 15);
        if (!currentQuestion) return;
        const id = setInterval(() => {
            setTimeLeft((t) => Math.max(0, t - 1));
        }, 1000);
        return () => clearInterval(id);
    }, [currentQuestion]);

    // Detect buzz-in and trigger effects
    useEffect(() => {
        if (currentQuestion?.buzzed_by) {
            setCorrectFlash(true);
            const id = setTimeout(() => setCorrectFlash(false), 800);
            return () => clearTimeout(id);
        }
    }, [currentQuestion?.buzzed_by]);

    const buzzedAgent = currentQuestion?.buzzed_by ?? null;

    // Podium layout: up to 4 agents
    const podiumPositions: [number, number, number][] = [
        [-3.5, 0, 1.5],
        [ 3.5, 0, 1.5],
        [-3.5, 0, 3.5],
        [ 3.5, 0, 3.5],
    ];

    const maxScore = Math.max(...Object.values(scores), 1);
    const leadingAgent = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    return (
        <>
            {/* Lighting */}
            <ambientLight color="#04040C" intensity={0.3} />
            <color attach="background" args={[T.bg]} />
            <fog attach="fog" args={[T.bg, 15, 35]} />

            {/* Neon tubes */}
            {NEON_TUBES.map((tube, i) => (
                <NeonTube key={i} {...tube} />
            ))}

            {/* Stage + seating */}
            <StageFloor />

            {/* Question screen */}
            <QuestionScreen
                question={currentQuestion ?? null}
                timeLeft={timeLeft}
                timeLimit={currentQuestion?.time_limit ?? 15}
                currentRound={currentRound}
                totalRounds={totalRounds}
            />

            {/* Round label above screen */}
            <Text
                position={[0, 5.6, -5.4]}
                fontSize={0.22}
                color={T.neonGold}
                anchorX="center"
                anchorY="middle"
                letterSpacing={0.08}
            >
                {`HALL OF TRIVIA  ·  ROUND ${currentRound} / ${totalRounds}`}
            </Text>

            {/* Agent podiums */}
            {agents.slice(0, 4).map((agentId, i) => (
                <AgentPodium
                    key={agentId}
                    agentId={agentId}
                    score={scores[agentId] ?? 0}
                    colour={AGENT_COLOURS[i % AGENT_COLOURS.length]}
                    position={podiumPositions[i]}
                    isBuzzed={buzzedAgent === agentId}
                    isLeading={agentId === leadingAgent}
                />
            ))}

            {/* Audience orbs */}
            <AudienceOrbs correctFlash={correctFlash} />

            {/* Camera */}
            <CameraController />
        </>
    );
}

/* ── Public Export ────────────────────────────────────────── */
export function TriviaBoard3D({
    scores,
    currentQuestion,
    agents,
    currentRound,
    totalRounds,
    onBuzz,
    thinkingAgentId,
}: TriviaBoardProps) {
    return (
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <WebGLSafeCanvas
                shadows
                camera={{ position: [0, 7, 12], fov: 45 }}
                style={{ width: "100%", height: "100%" }}
                gl={{ antialias: true }}
            >
                <TriviaScene
                    scores={scores}
                    currentQuestion={currentQuestion}
                    agents={agents}
                    currentRound={currentRound}
                    totalRounds={totalRounds}
                />
            </WebGLSafeCanvas>
        </div>
    );
}
