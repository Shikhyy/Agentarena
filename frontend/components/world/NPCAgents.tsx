"use client";

import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useWorldStore, WORLD_ZONES, type WorldAgent } from "@/lib/worldStore";
import { findPath, type Vec2 } from "@/lib/pathfinding";
import { AgentCharacter3D } from "./AgentCharacter3D";

/** NPC state machine states */
type NPCState = "IDLE" | "PATHFINDING" | "WALKING" | "ARRIVED" | "ACTION";

const NPC_SPEED = 3.2; // m/s
const IDLE_DURATION = [3000, 8000] as const;  // ms range to wait at destination
const ACTION_DURATION = [2000, 5000] as const;

interface NPCController {
  agentId: string;
  state: NPCState;
  path: Vec2[];
  pathIndex: number;
  stateTimer: number;
}

function randomRange(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function randomZonePosition(): [number, number, number] {
  const zone = WORLD_ZONES[Math.floor(Math.random() * WORLD_ZONES.length)];
  const spread = 12;
  return [
    zone.position[0] + (Math.random() - 0.5) * spread,
    0,
    zone.position[2] + (Math.random() - 0.5) * spread,
  ];
}

/**
 * NPCAgents — 18 autonomous agents that walk between zones.
 * State machine: IDLE → PATHFINDING → WALKING → ARRIVED → ACTION → IDLE
 */
export function NPCAgents() {
  const agents = useWorldStore((s) => s.agents);
  const updateAgentPosition = useWorldStore((s) => s.updateAgentPosition);
  const selectAgent = useWorldStore((s) => s.selectAgent);

  // Filter non-competing agents for NPC behavior
  const npcAgents = useMemo(
    () => agents.filter((a) => a.status === "idle" || a.status === "walking"),
    [agents]
  );

  const controllers = useRef<Map<string, NPCController>>(new Map());

  // Initialize controllers for idle/walking agents
  useEffect(() => {
    npcAgents.forEach((agent) => {
      if (!controllers.current.has(agent.id)) {
        controllers.current.set(agent.id, {
          agentId: agent.id,
          state: "IDLE",
          path: [],
          pathIndex: 0,
          stateTimer: randomRange(...IDLE_DURATION),
        });
      }
    });
  }, [npcAgents]);

  useFrame((_, delta) => {
    const deltaMs = delta * 1000;

    controllers.current.forEach((ctrl) => {
      const agent = agents.find((a) => a.id === ctrl.agentId);
      if (!agent || agent.status === "competing" || agent.status === "celebrating") return;

      switch (ctrl.state) {
        case "IDLE": {
          ctrl.stateTimer -= deltaMs;
          if (ctrl.stateTimer <= 0) {
            ctrl.state = "PATHFINDING";
          }
          break;
        }

        case "PATHFINDING": {
          const dest = randomZonePosition();
          const start: Vec2 = { x: agent.position[0], z: agent.position[2] };
          const end: Vec2 = { x: dest[0], z: dest[2] };
          const path = findPath(start, end);

          if (path && path.length > 1) {
            ctrl.path = path;
            ctrl.pathIndex = 1;
            ctrl.state = "WALKING";
            // Update agent status in store
            useWorldStore.setState((s) => ({
              agents: s.agents.map((a) =>
                a.id === ctrl.agentId ? { ...a, status: "walking" as const, targetPosition: dest } : a
              ),
            }));
          } else {
            // No path found, try again after short delay
            ctrl.state = "IDLE";
            ctrl.stateTimer = 1000;
          }
          break;
        }

        case "WALKING": {
          if (ctrl.pathIndex >= ctrl.path.length) {
            ctrl.state = "ARRIVED";
            ctrl.stateTimer = 500;
            break;
          }

          const target = ctrl.path[ctrl.pathIndex];
          const dx = target.x - agent.position[0];
          const dz = target.z - agent.position[2];
          const dist = Math.sqrt(dx * dx + dz * dz);

          if (dist < 0.3) {
            ctrl.pathIndex++;
          } else {
            const step = NPC_SPEED * delta;
            const nx = agent.position[0] + (dx / dist) * Math.min(step, dist);
            const nz = agent.position[2] + (dz / dist) * Math.min(step, dist);
            updateAgentPosition(ctrl.agentId, [nx, 0, nz]);
          }
          break;
        }

        case "ARRIVED": {
          ctrl.stateTimer -= deltaMs;
          if (ctrl.stateTimer <= 0) {
            ctrl.state = "ACTION";
            ctrl.stateTimer = randomRange(...ACTION_DURATION);
            // Set agent to idle/thinking at destination
            useWorldStore.setState((s) => ({
              agents: s.agents.map((a) =>
                a.id === ctrl.agentId ? { ...a, status: "idle" as const } : a
              ),
            }));
          }
          break;
        }

        case "ACTION": {
          ctrl.stateTimer -= deltaMs;
          if (ctrl.stateTimer <= 0) {
            ctrl.state = "IDLE";
            ctrl.stateTimer = randomRange(...IDLE_DURATION);
          }
          break;
        }
      }
    });
  });

  return (
    <>
      {npcAgents.map((agent) => (
        <AgentCharacter3D
          key={agent.id}
          agent={agent}
          onClick={() => selectAgent(agent.id)}
        />
      ))}
    </>
  );
}
