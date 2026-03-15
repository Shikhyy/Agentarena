"use client";

import { HexPortrait } from "@/components/ui/HexPortrait";
import { SkillOrb } from "@/components/ui/SkillOrb";
import { StatusBadge, type AgentStatus } from "@/components/ui/StatusBadge";
import { motion } from "motion/react";

export interface AgentShowcaseCardProps {
  name: string;
  elo: number;
  status: AgentStatus;
  /** Optional image URL for the hex portrait */
  imageUrl?: string;
  /** Accent color override */
  accent?: string;
  /** Skills to display (defaults to demo skills if omitted) */
  skills?: Array<{ skillType: string; equipped?: boolean; level?: number }>;
  className?: string;
}

const defaultSkills: Array<{ skillType: string; equipped?: boolean; level?: number }> = [
  { skillType: "risk", equipped: true },
  { skillType: "tempo", equipped: false },
  { skillType: "bluff", equipped: true },
];

export function AgentShowcaseCard({
  name,
  elo,
  status,
  imageUrl,
  accent,
  skills,
  className,
}: AgentShowcaseCardProps) {
  const displaySkills = skills ?? defaultSkills;

  return (
    <motion.section
      className={`glass panel bg-pattern ${className ?? ""}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <HexPortrait
          name={name}
          size={64}
          accent={accent}
          imageUrl={imageUrl}
          pulse={status === "live" || status === "battling"}
        />
        <div>
          <div className="display" style={{ fontSize: 34 }}>
            {name}
          </div>
          <div className="mono muted">ELO {elo}</div>
          <StatusBadge status={status} />
        </div>
      </div>
      <div className="nav-row" style={{ marginTop: 10, display: "flex", gap: 6 }}>
        {displaySkills.map((skill) => (
          <SkillOrb
            key={skill.skillType}
            skillType={skill.skillType}
            equipped={skill.equipped}
            level={skill.level}
          />
        ))}
      </div>
    </motion.section>
  );
}
