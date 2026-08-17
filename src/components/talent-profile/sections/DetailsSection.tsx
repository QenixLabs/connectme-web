"use client";

import { Calendar, Eye, Globe, MoveVertical, User } from "lucide-react";
import { GlassCard, SectionHeader } from "../primitives";
import type { ProfileFacts } from "../data";

const factIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  calendar: Calendar,
  height: MoveVertical,
  globe: Globe,
  eye: Eye,
};

export function DetailsSection({ facts }: { facts: ProfileFacts[] }) {
  return (
    <GlassCard>
      <SectionHeader icon={<User className="size-4" />} title="Details" />
      {facts.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground/60">
          No details added yet.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {facts.map((fact) => {
            const Icon = factIcons[fact.icon];
            return (
              <div
                key={fact.label}
                className="profile-inset flex items-start gap-3 rounded-xl p-3 transition-all hover:border-border-hover hover:bg-bg-surface"
              >
                <Icon className="mt-0.5 size-4 shrink-0 text-primary/60" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/40">
                    {fact.label}
                  </p>
                  <p className="text-sm font-medium text-foreground/85">{fact.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
}
