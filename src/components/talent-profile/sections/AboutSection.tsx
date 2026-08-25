"use client";

import { useState } from "react";
import { User, ChevronDown, ChevronUp } from "lucide-react";
import { GlassCard, SectionHeader } from "../primitives";
import { cn } from "@/lib/utils";

export function AboutSection({ bio }: { bio: string }) {
  const [expanded, setExpanded] = useState(false);
  const hasLongBio = bio.length > 160;
  const text = bio || "No bio added yet.";

  return (
    <GlassCard>
      <SectionHeader icon={<User className="size-4" />} title="About" />
      <p
        className={cn(
          "text-sm leading-6 text-foreground/75 sm:text-[15px] sm:leading-7",
          !expanded && hasLongBio && "line-clamp-3",
        )}
      >
        {text}
      </p>
      {hasLongBio && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-rootin transition-colors hover:text-rootin/80"
        >
          {expanded ? (
            <>
              Show less <ChevronUp className="size-3.5" />
            </>
          ) : (
            <>
              Show more <ChevronDown className="size-3.5" />
            </>
          )}
        </button>
      )}
    </GlassCard>
  );
}
