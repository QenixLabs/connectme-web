"use client";

import { Check, Film, Tv, Drama, Megaphone } from "lucide-react";
import type { TalentProfile } from "@/lib/validations/talent-profile.schema";

interface OverviewPaneProps {
  profile: TalentProfile;
  showAbout?: boolean;
}

export function OverviewPane({ profile, showAbout = true }: OverviewPaneProps) {
  const highlights = [
    profile.professions?.length
      ? profile.professions.slice(0, 3).join(" · ")
      : "Actor · Voice Artist · OTT",
    profile.languages?.length
      ? `${profile.languages[0]?.name} (Native)${profile.languages[1] ? ` · ${profile.languages[1].name} (${profile.languages[1].fluency})` : ""}`
      : "Hindi (Native) · English (Fluent)",
    profile.location?.city
      ? `${profile.location.city} · Open to travel`
      : "Mumbai · Open to travel",
    `Verified · Tier ${profile.verification_tier || 1}`,
  ];

  const about = profile.about ||
    "Versatile actor with 6+ years across film, OTT & stage. Known for naturalistic performances and command over dialects. Open to lead and supporting roles.";

  return (
    <>
      <Card label="Highlights">
        <ul className="space-y-2.5">
          {highlights.map((h) => (
            <li key={h} className="flex items-center gap-3 text-[13.5px] text-ink-soft">
              <span className="h-5 w-5 rounded-full bg-gold-soft grid place-items-center shrink-0">
                <Check className="h-3 w-3 text-gold-ink" strokeWidth={3} />
              </span>
              {h}
            </li>
          ))}
        </ul>
      </Card>

      {showAbout && (
        <Card label="About">
          <p className="text-[13.5px] leading-[1.65] text-ink-soft">{about}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Pill gold><Film className="h-3 w-3" /> Film</Pill>
            <Pill gold><Tv className="h-3 w-3" /> OTT</Pill>
            <Pill gold><Drama className="h-3 w-3" /> Stage</Pill>
            <Pill><Megaphone className="h-3 w-3" /> Commercial</Pill>
          </div>
        </Card>
      )}
    </>
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

function Pill({ children, gold }: { children: React.ReactNode; gold?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-full border ${
        gold
          ? "bg-gold-soft border-gold/40 text-gold-ink"
          : "bg-cream border-border text-ink-soft"
      }`}
    >
      {children}
    </span>
  );
}
