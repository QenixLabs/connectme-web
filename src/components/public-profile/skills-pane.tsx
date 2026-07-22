"use client";

import type { TalentProfile } from "@/lib/validations/talent-profile.schema";

interface SkillsPaneProps {
  profile: TalentProfile;
  showSkills?: boolean;
}

export function SkillsPane({ profile, showSkills = true }: SkillsPaneProps) {
  if (!showSkills) return null;

  const skills = profile.skills ?? [];

  if (skills.length === 0) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card shadow-luxe">
        <div className="px-5 pt-4">
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted">
            Skills
          </p>
        </div>
        <div className="px-5 py-4">
          <p className="py-4 text-center text-[13.5px] text-ink-muted">
            No skills listed yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-luxe">
      <div className="flex items-center justify-between px-5 pt-4">
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted">
          Skills
        </p>
      </div>
      <div className="px-5 py-4">
        <div className="flex flex-wrap gap-2">
          {skills.map((s) => (
            <span
              key={s.name}
              className="rounded-full bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary"
            >
              {s.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
