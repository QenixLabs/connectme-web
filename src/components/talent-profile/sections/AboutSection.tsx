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
      style={{ backgroundColor: "color-mix(in oklab, #91adab 60%, transparent)" }}
    >
      <div className="flex items-center gap-2">
        <UserRound className="size-4.5 text-brand" />
        <h2 className="text-[15px] font-bold text-foreground">About Me</h2>
      </div>
      <div className="mt-2">
        <p
          className={cn(
            "text-[13px] leading-relaxed text-muted-foreground",
            !expanded && hasLongBio && "line-clamp-3",
          )}
        >
          {text}
        </p>
      </div>
      {hasLongBio && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 flex items-center gap-1 text-[13px] font-semibold text-brand"
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
