"use client";

import { motion } from "motion/react";
import { Image, Video, Eye, Film, Camera } from "lucide-react";
import type { PortfolioItem } from "@/lib/validations/talent-profile.schema";

interface PortfolioStatsBarProps {
  items: PortfolioItem[];
  views7d?: number;
  views30d?: number;
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

const statDefs = (items: PortfolioItem[], views7d: number, views30d: number) => {
  const images = items.filter((i) => i.type === "image").length;
  const videos = items.filter((i) => i.type === "video").length;
  const yt = items.filter((i) => i.type === "youtube").length;
  const ig = items.filter((i) => i.type === "instagram").length;

  return [
    { icon: Image, value: images, label: "Photos" },
    { icon: Video, value: videos, label: "Videos" },
    { icon: Film, value: yt, label: "YouTube" },
    { icon: Camera, value: ig, label: "Instagram" },
    { icon: Eye, value: formatCount(views30d), label: "Monthly Views" },
  ].filter((s) => s.value !== 0 && s.value !== "0");
};

export function PortfolioStatsBar({ items, views7d: _v7d, views30d: _v30d }: PortfolioStatsBarProps) {
  const stats = statDefs(items, _v7d ?? 0, _v30d ?? 0);

  if (stats.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="px-4 -mt-8 relative z-20"
    >
      <div className="overflow-x-auto no-scrollbar -mx-1 px-1">
        <div className="flex gap-2 min-w-max">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 + i * 0.05 }}
              className="flex items-center gap-2 rounded-2xl bg-card border border-border/60 shadow-luxe px-4 py-2.5 shrink-0"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gold/10 shrink-0">
                <s.icon className="h-3.5 w-3.5 text-gold" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col">
                <span className="text-[15px] font-bold text-ink leading-none tabular-nums">
                  {typeof s.value === "number" ? s.value : s.value}
                </span>
                <span className="text-[10px] text-ink-muted mt-0.5">{s.label}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
