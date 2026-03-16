"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GlassCard } from "@/components/ui/GlassCard";
import { SkillOrb } from "@/components/ui/SkillOrb";
import { HexPortrait } from "@/components/ui/HexPortrait";
import { MotionNumber } from "@/components/ui/MotionNumber";
import { motion } from "motion/react";
import { STAGGER } from "@/lib/springs";
import { apiGet } from "@/lib/api";
import { useAgentStore } from "@/lib/stores";
import Link from "next/link";

/* ── rarity palette ────────────────────────────────────── */
const RARITY_COLOR: Record<string, string> = {
  Legendary: "var(--color-gold)",
  Epic: "var(--color-copper)",
  Rare: "var(--color-teal-light)",
  Common: "var(--color-stone)",
};

const RARITY_GRADIENT: Record<string, string> = {
  Legendary: "from-yellow-700/40 via-amber-900/30 to-yellow-950/20",
  Epic: "from-orange-700/40 via-amber-950/30 to-stone-900/20",
  Rare: "from-teal-600/40 via-cyan-900/30 to-slate-900/20",
  Common: "from-stone-600/30 via-stone-800/20 to-stone-900/10",
};

/* ── category filter ───────────────────────────────────── */
type Category = "All" | "Agent NFTs" | "Skill Orbs" | "Cosmetics" | "Trophies";
const CATEGORIES: Category[] = ["All", "Agent NFTs", "Skill Orbs", "Cosmetics", "Trophies"];

type SortOption = "price-asc" | "price-desc" | "rarity" | "recent";
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "recent", label: "Recently Listed" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "rarity", label: "Rarity" },
];

const RARITY_RANK: Record<string, number> = {
  Legendary: 0,
  Epic: 1,
  Rare: 2,
  Common: 3,
};

const FLOOR_PRICES: { category: string; floor: number }[] = [
  { category: "Agent NFTs", floor: 680 },
  { category: "Skill Orbs", floor: 90 },
  { category: "Cosmetics", floor: 45 },
  { category: "Trophies", floor: 800 },
];

/* ── listings data ─────────────────────────────────────── */
interface Listing {
  id: number;
  name: string;
  collection: string;
  category: Category;
  rarity: "Legendary" | "Epic" | "Rare" | "Common";
  price: number;
  seller: string;
  skillType?: string;
  agentAccent?: string;
}

const LISTINGS: Listing[] = [
  // Agent NFTs
  { id: 1, name: "PHANTOM", collection: "AgentNFT", category: "Agent NFTs", rarity: "Legendary", price: 2400, seller: "0xA3f1…8b2C", agentAccent: "var(--color-gold)" },
  { id: 2, name: "GHOSTLINE", collection: "AgentNFT", category: "Agent NFTs", rarity: "Epic", price: 1200, seller: "0x7De4…c91F", agentAccent: "var(--color-copper)" },
  { id: 3, name: "DRIFT", collection: "AgentNFT", category: "Agent NFTs", rarity: "Rare", price: 680, seller: "0x1Bc8…47aD", agentAccent: "var(--color-teal-light)" },
  // Skill Orbs
  { id: 4, name: "Tempo Vision", collection: "SkillNFT", category: "Skill Orbs", rarity: "Epic", price: 240, seller: "0xF29a…0eB1", skillType: "tempo" },
  { id: 5, name: "Bluff Engine", collection: "SkillNFT", category: "Skill Orbs", rarity: "Rare", price: 180, seller: "0x83dC…5f3A", skillType: "bluff" },
  { id: 6, name: "Econ Mastery", collection: "SkillNFT", category: "Skill Orbs", rarity: "Epic", price: 320, seller: "0x4Ae7…b82D", skillType: "econ" },
  { id: 7, name: "Risk Matrix", collection: "SkillNFT", category: "Skill Orbs", rarity: "Common", price: 90, seller: "0xD61b…3c4E", skillType: "risk" },
  // Cosmetics
  { id: 8, name: "Aura Shader Pack", collection: "Cosmetic", category: "Cosmetics", rarity: "Rare", price: 150, seller: "0x52fB…d19C" },
  { id: 9, name: "Victory Trail", collection: "Cosmetic", category: "Cosmetics", rarity: "Common", price: 60, seller: "0xBa04…7e6F" },
  { id: 10, name: "Custom Nameplate", collection: "Cosmetic", category: "Cosmetics", rarity: "Common", price: 45, seller: "0x90cE…a23B" },
  // Trophies
  { id: 11, name: "Grand Prix Alpha Trophy", collection: "Trophy", category: "Trophies", rarity: "Legendary", price: 5000, seller: "0x1fA8…e47D" },
  { id: 12, name: "Season 1 Badge", collection: "Trophy", category: "Trophies", rarity: "Epic", price: 800, seller: "0xC73d…1b9A" },
];

/* ── recent sales feed ─────────────────────────────────── */
const RECENT_SALES = [
  { item: "PHANTOM", price: 2380, time: "2m ago" },
  { item: "Tempo Vision", price: 235, time: "8m ago" },
  { item: "Season 1 Badge", price: 790, time: "14m ago" },
  { item: "Bluff Engine", price: 175, time: "21m ago" },
  { item: "Aura Shader Pack", price: 148, time: "33m ago" },
];

/* ── component ─────────────────────────────────────────── */
export default function MarketplacePage() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("recent");

  const { data: listings = LISTINGS } = useQuery({
    queryKey: ["marketplace-listings"],
    queryFn: () => apiGet<Listing[]>("/marketplace/listings"),
    staleTime: 30_000,
  });

  const myAgents = useAgentStore((s) => s.myAgents);

  const filtered = useMemo(() => {
    let result = activeCategory === "All"
      ? listings
      : listings.filter((l) => l.category === activeCategory);

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((l) => l.name.toLowerCase().includes(q));
    }

    switch (sort) {
      case "price-asc":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case "rarity":
        result = [...result].sort(
          (a, b) => (RARITY_RANK[a.rarity] ?? 9) - (RARITY_RANK[b.rarity] ?? 9)
        );
        break;
      // "recent" keeps original order
    }

    return result;
  }, [listings, activeCategory, search, sort]);

  return (
    <div className="min-h-screen bg-[var(--color-deep)] p-6 pt-20 max-w-[1400px] mx-auto">
      {/* ── cinematic header ─────────────────────────────── */}
      <motion.section
        className="mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: STAGGER.headline / 1000, duration: 0.5 }}
      >
        <p className="font-mono text-[9px] tracking-[4px] uppercase text-[var(--color-stone)] mb-2">
          Market District
        </p>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-3">
          <h1 className="font-display text-6xl md:text-7xl text-[var(--color-ivory)] tracking-wide">
            The Exchange
          </h1>
          <Link
            href="/marketplace/list"
            className="inline-flex items-center justify-center font-heading text-[10px] tracking-[4px] uppercase bg-[var(--color-gold)] text-[var(--color-ink)] px-9 py-3.5 hover:bg-[var(--color-gold-light)] hover:shadow-[var(--shadow-gold)] active:scale-[0.97] transition-all duration-200 rounded self-start md:self-auto"
          >
            List an Item
          </Link>
        </div>
        <p className="font-narrative italic text-[var(--color-parchment)] max-w-2xl leading-relaxed">
          A living bazaar where skill orbs change hands, legendary agents find new commanders,
          and rare cosmetics surface from the depths of the Arena. Every trade shapes
          the meta—choose wisely.
        </p>
      </motion.section>

      {/* ── market stats row ─────────────────────────────── */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: STAGGER.subheadline / 1000, duration: 0.5 }}
      >
        {[
          { label: "Floor Price", value: 420, suffix: " ARENA", color: "var(--color-gold)" },
          { label: "24h Volume", value: 98400, suffix: " ARENA", color: "var(--color-teal-light)" },
          { label: "Total Listings", value: 247, suffix: "", color: "var(--color-copper)" },
          { label: "Unique Traders", value: 1892, suffix: "", color: "var(--color-ivory)" },
        ].map((stat) => (
          <GlassCard key={stat.label} glowIntensity={0.15} noHover>
            <p className="font-mono text-[9px] tracking-[3px] uppercase text-[var(--color-ash)] mb-2">
              {stat.label}
            </p>
            <div className="flex items-baseline gap-1">
              <MotionNumber value={stat.value} color={stat.color} />
              {stat.suffix && (
                <span className="font-mono text-xs text-[var(--color-stone)]">{stat.suffix}</span>
              )}
            </div>
          </GlassCard>
        ))}
      </motion.div>

      {/* ── search & sort bar ─────────────────────────────── */}
      <motion.div
        className="flex flex-col sm:flex-row gap-3 mb-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: (STAGGER.pills - 50) / 1000, duration: 0.4 }}
      >
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-stone)] text-sm pointer-events-none">⌕</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search listings..."
            className="w-full pl-9 pr-4 py-2.5 rounded font-mono text-xs text-[var(--color-ivory)] placeholder:text-[var(--color-ash)] bg-[var(--color-surface)]/80 backdrop-blur-md border border-[var(--color-border)] focus:border-[var(--color-gold-dim)] focus:outline-none transition-colors"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="px-4 py-2.5 rounded font-mono text-xs text-[var(--color-parchment)] bg-[var(--color-surface)]/80 backdrop-blur-md border border-[var(--color-border)] focus:border-[var(--color-gold-dim)] focus:outline-none transition-colors appearance-none cursor-pointer sm:w-52"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </motion.div>

      {/* ── category filter tabs ─────────────────────────── */}
      <motion.div
        className="flex flex-wrap gap-2 mb-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: STAGGER.pills / 1000, duration: 0.4 }}
      >
        {CATEGORIES.map((cat, i) => {
          const active = activeCategory === cat;
          return (
            <motion.button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded font-mono text-[10px] tracking-[2px] uppercase border transition-colors ${
                active
                  ? "bg-[var(--color-gold)]/20 text-[var(--color-gold)] border-[var(--color-gold-dim)]"
                  : "bg-[var(--color-surface)]/40 text-[var(--color-stone)] border-[var(--color-border)]/40 hover:text-[var(--color-parchment)] hover:border-[var(--color-border)]"
              }`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (STAGGER.pills + i * 50) / 1000, duration: 0.3 }}
            >
              {cat}
            </motion.button>
          );
        })}
      </motion.div>

      {/* ── featured collection banner ───────────────────── */}
      <motion.div
        className="mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: STAGGER.secondary / 1000, duration: 0.5 }}
      >
        <GlassCard accent="gold" glowIntensity={0.5}>
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <p className="font-mono text-[9px] tracking-[4px] uppercase text-[var(--color-gold-dim)] mb-2">
                Featured Collection
              </p>
              <h2 className="font-heading text-3xl md:text-4xl text-[var(--color-gold)] mb-2">
                Legendary Agent Collection
              </h2>
              <p className="font-narrative italic text-sm text-[var(--color-parchment)] mb-4 max-w-md leading-relaxed">
                Three apex-tier agents forged in the crucible of ranked combat. Each carries
                unique tactical signatures that reshape any encounter.
              </p>
              <div className="flex gap-6 font-mono text-xs text-[var(--color-stone)]">
                <span><span className="text-[var(--color-gold)]">3</span> Items</span>
                <span><span className="text-[var(--color-gold)]">4,280</span> ARENA Floor</span>
                <span><span className="text-[var(--color-gold)]">12.4K</span> Volume</span>
              </div>
            </div>
            <div className="flex gap-4 items-center justify-center md:justify-end">
              <HexPortrait name="PHANTOM" size={80} accent="var(--color-gold)" pulse />
              <HexPortrait name="GHOSTLINE" size={80} accent="var(--color-copper)" />
              <HexPortrait name="DRIFT" size={80} accent="var(--color-teal-light)" />
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* ── main content: listings grid + sidebar ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* ── listings grid (3 cols on lg) ──────────────── */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {filtered.length === 0 ? (
            <motion.div
              className="col-span-full flex flex-col items-center justify-center py-20"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <span className="font-display text-5xl opacity-20 text-[var(--color-stone)] mb-4">✦</span>
              <p className="font-heading text-lg text-[var(--color-parchment)] mb-1">
                No items match your search
              </p>
              <p className="font-mono text-[10px] text-[var(--color-ash)]">
                Try adjusting your filters or search terms
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((listing, i) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (STAGGER.interactive + i * 60) / 1000, duration: 0.4 }}
                >
                  <GlassCard glowIntensity={0.2} className="h-full flex flex-col">
                    {/* image area */}
                    <div
                      className={`h-32 rounded mb-3 bg-gradient-to-br ${RARITY_GRADIENT[listing.rarity]} flex items-center justify-center`}
                    >
                      {listing.skillType ? (
                        <SkillOrb skillType={listing.skillType} equipped level={70} />
                      ) : listing.agentAccent ? (
                        <HexPortrait name={listing.name} size={64} accent={listing.agentAccent} />
                      ) : (
                        <span
                          className="font-display text-3xl opacity-30"
                          style={{ color: RARITY_COLOR[listing.rarity] }}
                        >
                          ✦
                        </span>
                      )}
                    </div>

                    {/* name */}
                    <h3 className="font-heading text-lg text-[var(--color-ivory)] mb-1">
                      {listing.name}
                    </h3>

                    {/* collection badge + rarity tag */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono tracking-wider uppercase bg-[var(--color-surface)] text-[var(--color-ash)] border border-[var(--color-border)]/30">
                        {listing.collection}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded text-[9px] font-mono tracking-wider uppercase border"
                        style={{
                          color: RARITY_COLOR[listing.rarity],
                          borderColor: RARITY_COLOR[listing.rarity],
                          backgroundColor: `color-mix(in srgb, ${RARITY_COLOR[listing.rarity]} 10%, transparent)`,
                        }}
                      >
                        {listing.rarity}
                      </span>
                    </div>

                    {/* price + seller */}
                    <div className="mt-auto">
                      <p className="font-mono text-lg text-[var(--color-gold)] mb-1">
                        {listing.price.toLocaleString()} <span className="text-xs">ARENA</span>
                      </p>
                      <p className="font-mono text-[10px] text-[var(--color-ash)] mb-3">
                        Seller: {listing.seller}
                      </p>
                      <button className="w-full py-2 text-[10px] font-mono tracking-[2px] uppercase bg-[var(--color-gold)]/15 text-[var(--color-gold)] border border-[var(--color-gold-dim)] rounded hover:bg-[var(--color-gold)]/25 transition-colors">
                        Buy Now
                      </button>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          )}

          {/* ── pagination hint ───────────────────────────── */}
          {filtered.length > 0 && (
            <p className="text-center font-mono text-[10px] text-[var(--color-ash)] mt-2">
              Showing {filtered.length} of {listings.length} listings
            </p>
          )}
        </div>

        {/* ── sidebar ──────────────────────────────────── */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          {/* your holdings */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: STAGGER.interactive / 1000, duration: 0.5 }}
          >
            <GlassCard glowIntensity={0.15}>
              <p className="font-mono text-[9px] tracking-[3px] uppercase text-[var(--color-ash)] mb-3">
                Your Holdings
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-body text-[var(--color-parchment)]">Agents</span>
                  <span className="font-mono text-[var(--color-ivory)]">{myAgents.length || 2}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-body text-[var(--color-parchment)]">Skill Orbs</span>
                  <span className="font-mono text-[var(--color-ivory)]">5</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-body text-[var(--color-parchment)]">Cosmetics</span>
                  <span className="font-mono text-[var(--color-ivory)]">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-body text-[var(--color-parchment)]">Trophies</span>
                  <span className="font-mono text-[var(--color-ivory)]">1</span>
                </div>
                <div className="border-t border-[var(--color-border)]/30 pt-2 mt-2 flex justify-between">
                  <span className="font-body text-[var(--color-parchment)]">Est. Value</span>
                  <span className="font-mono text-[var(--color-gold)]">4,820 ARENA</span>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* floor prices */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: STAGGER.interactive / 1000 + 0.05, duration: 0.5 }}
          >
            <GlassCard glowIntensity={0.15}>
              <p className="font-mono text-[9px] tracking-[3px] uppercase text-[var(--color-ash)] mb-3">
                Floor Prices
              </p>
              <div className="space-y-2 text-sm">
                {FLOOR_PRICES.map((fp) => (
                  <div key={fp.category} className="flex justify-between">
                    <span className="font-body text-[var(--color-parchment)]">{fp.category}</span>
                    <span className="font-mono text-[var(--color-gold)]">
                      {fp.floor.toLocaleString()} <span className="text-[var(--color-stone)] text-[10px]">ARENA</span>
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* recent sales */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: STAGGER.interactive / 1000 + 0.1, duration: 0.5 }}
          >
            <GlassCard glowIntensity={0.15}>
              <p className="font-mono text-[9px] tracking-[3px] uppercase text-[var(--color-ash)] mb-3">
                Recent Sales
              </p>
              <div className="space-y-3">
                {RECENT_SALES.map((sale) => (
                  <div key={sale.item + sale.time} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-body text-[var(--color-parchment)]">{sale.item}</p>
                      <p className="font-mono text-[9px] text-[var(--color-ash)]">{sale.time}</p>
                    </div>
                    <span className="font-mono text-[var(--color-gold)] text-xs">
                      {sale.price} <span className="text-[var(--color-stone)]">ARENA</span>
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* price history */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: STAGGER.interactive / 1000 + 0.2, duration: 0.5 }}
          >
            <GlassCard glowIntensity={0.15}>
              <p className="font-mono text-[9px] tracking-[3px] uppercase text-[var(--color-ash)] mb-3">
                Price History · 7d
              </p>
              {/* sparkline bars */}
              <div className="flex items-end gap-1 h-16">
                {[38, 52, 45, 61, 55, 72, 68].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm bg-[var(--color-gold)]/25"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2 font-mono text-[9px] text-[var(--color-ash)]">
                <span>Mon</span>
                <span>Today</span>
              </div>
              <div className="mt-3 flex justify-between text-xs">
                <span className="font-body text-[var(--color-parchment)]">Avg. Price</span>
                <span className="font-mono text-[var(--color-gold)]">412 ARENA</span>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
