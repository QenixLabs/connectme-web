"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { GlassCard, SectionHeader } from "../primitives";

const MAX_VISIBLE = 8;

export function SkillsSection({ skills }: { skills: string[] }) {
  const [showAll, setShowAll] = useState(false);
  const hasMore = skills.length > MAX_VISIBLE;
  const visible = showAll ? skills : skills.slice(0, MAX_VISIBLE);

  return (
    <GlassCard>
      <SectionHeader
        icon={<Sparkles className="size-4" />}
        title="Skills"
        action={hasMore ? (showAll ? "Show Less" : "View All") : undefined}
        onAction={hasMore ? () => setShowAll((v) => !v) : undefined}
      />
      {skills.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground/60">
          No skills added yet.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {visible.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center rounded-full border border-border bg-bg-surface-inset px-3 py-1.5 text-[13px] font-medium text-foreground/80 transition-colors hover:border-rootin/30 hover:text-rootin"
            >
              {skill}
            </span>
          ))}
          {!showAll && hasMore && (
            <button
              onClick={() => setShowAll(true)}
              className="inline-flex items-center rounded-full px-3 py-1.5 text-[13px] font-semibold text-rootin transition-colors hover:text-rootin/80"
            >
              +{skills.length - MAX_VISIBLE} more
            </button>
          )}
        </div>
      )}
    </GlassCard>
  );
}
