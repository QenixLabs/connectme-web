"use client";

import { useState } from "react";
import { Star, Sparkles } from "lucide-react";
import { CollapsibleSection } from "../primitives";

const MAX_VISIBLE = 8;

export function SkillsSection({
  skills,
  collapsible = false,
}: {
  skills: string[];
  collapsible?: boolean;
}) {
  const [showAll, setShowAll] = useState(false);
  const hasMore = skills.length > MAX_VISIBLE;
  const visible = showAll ? skills : skills.slice(0, MAX_VISIBLE);

  return (
    <CollapsibleSection
      icon={<Star className="size-4" />}
      title="Top Skills"
      action={hasMore ? (showAll ? "Show Less" : "View All") : undefined}
      onAction={hasMore ? () => setShowAll((v) => !v) : undefined}
      collapsible={collapsible && skills.length > 0}
    >
      {skills.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground/60">
          No skills added yet.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {visible.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1.5 text-[11px] font-semibold text-foreground"
            >
              <Sparkles className="size-3 text-brand" /> {skill}
            </span>
          ))}
          {!showAll && hasMore && (
            <button
              onClick={() => setShowAll(true)}
              className="inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-semibold text-brand transition-colors hover:text-brand/80"
            >
              +{skills.length - MAX_VISIBLE} more
            </button>
          )}
        </div>
      )}
    </CollapsibleSection>
  );
}
