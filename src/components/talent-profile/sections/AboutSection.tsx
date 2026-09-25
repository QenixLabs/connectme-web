"use client";

import { useState } from "react";
import { UserRound, ChevronDown } from "lucide-react";
import { GlassCard } from "../primitives";
import { cn } from "@/lib/utils";

export function AboutSection({ bio }: { bio: string }) {
  const [expanded, setExpanded] = useState(false);
  const hasLongBio = bio.length > 160;
  const text = bio || "No bio added yet.";

  return (
    <GlassCard
      className="relative"
      style={{
        background:
          "linear-gradient(135deg, rgba(239,246,255,0.96), rgba(245,243,255,0.92) 62%, rgba(255,255,255,0.98))",
      }}
    >
      <div className="pointer-events-none absolute -right-8 -top-10 size-28 rounded-full bg-purple-200/20 blur-2xl" />
      <div className="relative flex items-center gap-2">
        <span className="grid size-7 place-items-center rounded-lg bg-blue-100 text-[#2563EB]">
          <UserRound className="size-4" />
        </span>
        <h2 className="text-[15px] font-bold text-foreground">About Me</h2>
      </div>
      <div className="relative mt-3">
        <p
          className={cn(
            "text-[13px] leading-relaxed text-slate-600",
            !expanded && hasLongBio && "line-clamp-3",
          )}
        >
          {text}
        </p>
      </div>
      {hasLongBio && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/75 px-3 py-1.5 text-[12px] font-bold text-[#2563EB] shadow-sm transition-colors hover:bg-white"
        >
          {expanded ? "Show less" : "Read More"}
          <ChevronDown
            className={cn("size-4 transition-transform", expanded && "rotate-180")}
          />
        </button>
      )}
    </GlassCard>
  );
}
