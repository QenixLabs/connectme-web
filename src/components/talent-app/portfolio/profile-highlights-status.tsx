"use client";

import { Image, Play, Star, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ProfileHighlightsResponse } from "@/lib/api/talent";
type HighlightItem = {
  highlightType?: "showreel" | "video" | "image";
  profileHighlightType?: "showreel" | "video" | "image";
  kind?: "image" | "video" | "document" | "link";
  type?: string;
};

const counters = [
  { key: "showreel", label: "Showreel", limit: 1, Icon: Star },
  { key: "video", label: "Videos", limit: 3, Icon: Play },
  { key: "image", label: "Photos", limit: 4, Icon: Image },
] as const;

export function ProfileHighlightsStatus({ items, showcase }: { items: HighlightItem[]; showcase?: ProfileHighlightsResponse }) {
  const isShowcaseItem = (item: HighlightItem, type: (typeof counters)[number]["key"]) => {
    const highlightType = item.highlightType || item.profileHighlightType;
    if (highlightType !== type) return false;
    if (type === "image") return item.kind === "image" || item.type === "image";
    return item.kind === "video" || item.type === "video" || item.type === "youtube";
  };

  const count = (type: (typeof counters)[number]["key"]) => {
    if (showcase) {
      if (type === "showreel") return showcase.showreel_id ? 1 : 0;
      if (type === "video") return showcase.video_ids.length;
      return showcase.image_ids.length;
    }
    return items.filter((item) => isShowcaseItem(item, type)).length;
  };

  const selected = counters.reduce((total, counter) => total + count(counter.key), 0);
  const progress = Math.min(100, Math.round((selected / 8) * 100));

  return (
    <section className="rounded-[16px] border border-[#e8e7f5] bg-gradient-to-r from-white to-[#faf9ff] px-4 py-3.5 shadow-[0_8px_26px_-24px_rgba(45,39,120,0.7)] sm:px-5">
      <div className="flex items-center gap-3">
        <div className="relative grid size-[58px] shrink-0 place-items-center">
          <svg viewBox="0 0 40 40" className="absolute inset-0 size-full -rotate-90" aria-hidden="true">
            <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="3.5" className="text-[#eceafa]" />
            <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" className="text-primary transition-all" strokeDasharray={`${progress} 100`} pathLength="100" />
          </svg>
          <span className="text-[12px] font-bold text-[#25336f]">{progress}%</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <div><h2 className="text-[13px] font-bold text-[#172653]">Profile Showcase</h2><p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">These items appear on your public profile. Everything else stays in your full portfolio.</p></div>
            <Link href="/talent/portfolio/showcase" className="inline-flex shrink-0 items-center gap-1 text-[11px] font-bold text-primary hover:underline">Manage arrangement <ArrowRight className="size-3" /></Link>
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5">
            {counters.map(({ key, label, limit, Icon }) => (
              <span key={key} className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <Icon className="size-3 text-primary" /> <span className="font-semibold text-foreground">{label}:</span> {count(key)} / {limit}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
