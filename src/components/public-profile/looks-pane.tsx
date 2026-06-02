"use client";

import {
  Ruler,
  Dumbbell,
  User,
  Palette,
  Scissors,
  Eye,
  Languages,
} from "lucide-react";
import type { ComponentType } from "react";
import type { TalentProfile } from "@/lib/validations/talent-profile.schema";

interface LooksPaneProps {
  profile: TalentProfile;
  showPhysical?: boolean;
  showLanguages?: boolean;
}

export function LooksPane({ profile, showPhysical = true, showLanguages = true }: LooksPaneProps) {
  const pa = profile.physical_attributes;
  const attrs: { label: string; value: string; icon: ComponentType<{ className?: string }> }[] = [
    { label: "Height", value: pa?.height_cm ? `${pa.height_cm} cm` : "—", icon: Ruler },
    { label: "Weight", value: pa?.weight_kg ? `${pa.weight_kg} kg` : "—", icon: Dumbbell },
    { label: "Build", value: pa?.body_type || "—", icon: User },
    { label: "Complexion", value: pa?.complexion || "—", icon: Palette },
    { label: "Hair", value: `${pa?.hair_color || ""} · ${pa?.hair_length || ""}`.replace("· ", "").replace(" ·", "") || "—", icon: Scissors },
    { label: "Eyes", value: pa?.eye_color || "—", icon: Eye },
  ];

  if (!showPhysical && !showLanguages) return null;

  return (
    <>
      {showPhysical && (
        <Card label="Physical attributes">
          <div className="grid grid-cols-3 gap-2.5">
            {attrs.map((a) => {
              const Icon = a.icon;
              return (
                <div
                  key={a.label}
                  className="rounded-xl bg-cream/70 border border-border/60 p-3 flex flex-col items-start gap-1.5"
                >
                  <div className="h-7 w-7 rounded-lg bg-gold-soft grid place-items-center">
                    <Icon className="h-3.5 w-3.5 text-gold-ink" />
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.1em] text-ink-muted">{a.label}</div>
                  <div className="text-[13px] font-medium text-ink leading-tight">{a.value}</div>
                </div>
              );
            })}
          </div>
          {pa?.distinctive_features && (
            <div className="mt-3 rounded-xl bg-gold-soft/60 border border-gold/20 px-3.5 py-3">
              <div className="text-[10px] uppercase tracking-[0.12em] text-gold-ink/80">Distinct features</div>
              <div className="mt-1 text-[13px] text-ink">{pa.distinctive_features}</div>
            </div>
          )}
        </Card>
      )}

      {showLanguages && (
        <Card label="Languages & Accents">
          <div className="space-y-2">
            {(profile.languages ?? []).map((l) => (
              <div
                key={l.name}
                className="flex items-center justify-between rounded-xl bg-cream/60 border border-border/50 px-3.5 py-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <Languages className="h-4 w-4 text-gold" />
                  <span className="text-[13.5px] text-ink font-medium">{l.name}</span>
                </div>
                <LevelBadge>{l.fluency || "Native"}</LevelBadge>
              </div>
            ))}
          </div>
          {(profile.accents?.length ?? 0) > 0 && (
            <div className="mt-4 pt-4 border-t border-border/60">
              <p className="text-[10px] uppercase tracking-[0.12em] text-ink-muted mb-2">Accents</p>
              <div className="flex flex-wrap gap-2">
                {profile.accents?.map((a) => (
                  <Pill key={a}>{a}</Pill>
                ))}
              </div>
            </div>
          )}
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

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-full border bg-cream border-border text-ink-soft">
      {children}
    </span>
  );
}

function LevelBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-medium px-2.5 py-1 rounded-full border bg-gold-soft text-gold-ink border-gold/30">
      {children}
    </span>
  );
}
