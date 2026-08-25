"use client";

import { User, Trophy } from "lucide-react";
import { GlassCard, SectionHeader } from "../primitives";
import { getDetailGroups } from "../data";
import type { TalentProfile } from "@/lib/api/talent";
import type { AwardItem } from "../data";

export function DetailsSection({
  profile,
  awards,
}: {
  profile: TalentProfile;
  awards: AwardItem[];
}) {
  const groups = getDetailGroups(profile, awards);

  if (groups.length === 0) {
    return (
      <GlassCard>
        <SectionHeader icon={<User className="size-4" />} title="Details" />
        <p className="py-8 text-center text-sm text-muted-foreground/60">
          No details added yet.
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <GlassCard key={group.title}>
          <SectionHeader
            icon={
              group.title === "Awards & Recognitions" ? (
                <Trophy className="size-4" />
              ) : (
                <User className="size-4" />
              )
            }
            title={group.title}
          />
          {group.title === "Awards & Recognitions" ? (
            <div className="space-y-2">
              {group.fields.map((field, i) => (
                <div
                  key={i}
                  className="group flex items-start gap-3 rounded-xl border border-transparent p-2.5 transition-all duration-200 hover:border-gold/20 hover:bg-gold/[0.04]"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent-amber-bg">
                    <Trophy className="size-4 text-gold transition-transform group-hover:scale-110" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground/90">
                      {field.value}
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                      {field.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {group.fields.map((field) => (
                <div
                  key={field.label}
                  className="min-w-0 rounded-xl border border-transparent p-2.5 transition-all hover:border-border-hover hover:bg-bg-surface"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/45">
                    {field.label}
                  </p>
                  <p className="mt-0.5 text-[13px] font-medium text-foreground/85">
                    {field.value}
                  </p>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      ))}
    </div>
  );
}
