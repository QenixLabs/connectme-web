"use client";

import { Trophy } from "lucide-react";
import { GlassCard, SectionHeader } from "../primitives";
import type { AwardItem } from "../data";

export function AwardsSection({ data }: { data: AwardItem[] }) {
  return (
    <GlassCard>
      <SectionHeader icon={<Trophy className="size-4 text-gold" />} title="Awards" />
      {data.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground/60">
          No awards added yet.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {data.map((award) => (
            <div
              key={award.id}
              className="profile-inset group flex items-start gap-3 rounded-xl p-4 transition-all duration-200 hover:border-gold/20 hover:bg-gold/[0.03]"
            >
              <Trophy className="mt-0.5 size-5 shrink-0 text-gold transition-transform group-hover:scale-110" />
              <div>
                <p className="text-sm font-semibold text-foreground/90">{award.name}</p>
                <p className="text-xs text-muted-foreground/55">{award.issuer}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
