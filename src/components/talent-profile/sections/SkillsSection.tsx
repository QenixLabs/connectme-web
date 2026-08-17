"use client";

import { Sparkles } from "lucide-react";
import { GlassCard, SectionHeader } from "../primitives";
import { cn } from "@/lib/utils";

export function SkillsSection({ skills }: { skills: string[] }) {
  return (
    <GlassCard>
      <SectionHeader icon={<Sparkles className="size-4" />} title="Skills" />
      {skills.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground/60">
          No skills added yet.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, i) => (
            <span
              key={skill}
              className={cn(
                "animate-in animate-in-delay",
                "profile-inset inline-flex items-center rounded-full px-3.5 py-1.5 text-sm font-medium text-foreground/85 transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-primary",
              )}
              style={{ animationDelay: `${Math.min(i * 0.03, 0.3)}s` }}
            >
              {skill}
            </span>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
