"use client";

import type { TalentProfile } from "@/lib/validations/talent-profile.schema";

interface SkillsPaneProps {
  profile: TalentProfile;
  showSkills?: boolean;
}

export function SkillsPane({ profile, showSkills = true }: SkillsPaneProps) {
  if (!showSkills) return null;

  const skills = (profile.skills ?? []).slice(0, 4).map((s) => ({
    name: s.name,
    level: s.proficiency || "Intermediate",
    value:
      s.proficiency === "expert" ? 90 :
      s.proficiency === "intermediate" ? 65 :
      40,
  }));

  if (skills.length === 0) {
    return (
      <Card label="Skills">
        <p className="text-[13.5px] text-ink-muted text-center py-4">No skills listed yet.</p>
      </Card>
    );
  }

  return (
    <Card label="Skills">
      <div className="grid grid-cols-2 gap-2.5">
        {skills.map((s) => (
          <SkillRing key={s.name} {...s} />
        ))}
      </div>
    </Card>
  );
}

function SkillRing({ name, level, value }: { name: string; level: string; value: number }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="rounded-xl bg-cream/70 border border-border/60 p-3 flex items-center gap-3">
      <div className="relative h-14 w-14 shrink-0">
        <svg viewBox="0 0 56 56" className="h-full w-full -rotate-90">
          <circle cx="28" cy="28" r={r} stroke="oklch(0.90 0.015 80)" strokeWidth="4" fill="none" />
          <circle
            cx="28"
            cy="28"
            r={r}
            stroke="oklch(0.74 0.13 80)"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <span className="text-[11px] font-semibold text-ink">{value}%</span>
        </div>
      </div>
      <div className="min-w-0">
        <div className="text-[13px] font-medium text-ink leading-tight truncate">{name}</div>
        <div className="text-[11px] text-gold mt-0.5 capitalize">{level}</div>
      </div>
    </div>
  );
}

function Card({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <div className="rounded-2xl bg-card border border-border/60 shadow-luxe">
      {label && (
        <div className="flex items-center justify-between px-5 pt-4">
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted">{label}</p>
        </div>
      )}
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}
