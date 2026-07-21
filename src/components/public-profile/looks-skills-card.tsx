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
import { Card, CardContent } from "@/components/ui/card";
import type { TalentProfile } from "@/lib/validations/talent-profile.schema";

interface LooksSkillsCardProps {
  profile: TalentProfile;
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary">
      {children}
    </span>
  );
}

function LevelBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-medium rounded-full border bg-amber-soft text-amber-foreground border-amber/30 px-2.5 py-1">
      {children}
    </span>
  );
}

export function LooksSkillsCard({ profile }: LooksSkillsCardProps) {
  const pa = profile.physical_attributes;

  const physAttrs: {
    label: string;
    value: string;
    icon: ComponentType<{ className?: string }>;
  }[] = [
    { label: "Age", value: "—", icon: User },
    { label: "Height", value: pa?.height_cm ? `${pa.height_cm} cm` : "—", icon: Ruler },
    { label: "Weight", value: pa?.weight_kg ? `${pa.weight_kg} kg` : "—", icon: Dumbbell },
    { label: "Build", value: pa?.body_type || "—", icon: User },
    { label: "Complexion", value: pa?.complexion || "—", icon: Palette },
    { label: "Hair", value: `${pa?.hair_color || ""} · ${pa?.hair_length || ""}`.replace("· ", "").replace(" ·", "") || "—", icon: Scissors },
    { label: "Eyes", value: pa?.eye_color || "—", icon: Eye },
  ];

  const skills = profile.skills ?? [];
  const languages = profile.languages ?? [];
  const accents = profile.accents ?? [];

  return (
    <div className="space-y-4">
      <Card className="border-border shadow-card">
        <CardContent className="p-5">
          <h2 className="mb-4 text-lg font-bold text-foreground">
            Physical Attributes
          </h2>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {physAttrs.map((a) => {
              const Icon = a.icon;
              return (
                <div
                  key={a.label}
                  className="flex items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-2"
                >
                  <span className="text-muted-foreground">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      {a.label}
                    </div>
                    <div className="truncate text-sm font-semibold text-foreground">
                      {a.value}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {pa?.distinctive_features && (
            <div className="mt-3 rounded-xl border border-amber/20 bg-amber-soft/60 px-3.5 py-3">
              <div className="text-[10px] uppercase tracking-[0.12em] text-amber-foreground/80">
                Distinct features
              </div>
              <div className="mt-1 text-[13px] text-foreground">
                {pa.distinctive_features}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {languages.length > 0 && (
        <Card className="border-border shadow-card">
          <CardContent className="p-5">
            <h2 className="mb-4 text-lg font-bold text-foreground">
              Languages & Accents
            </h2>
            <div className="space-y-2">
              {languages.map((l) => (
                <div
                  key={l.name}
                  className="flex items-center justify-between rounded-xl border border-border/50 bg-background/60 px-3.5 py-2.5"
                >
                  <div className="flex items-center gap-2.5">
                    <Languages className="h-4 w-4 text-amber" />
                    <span className="text-[13.5px] font-medium text-foreground">
                      {l.name}
                    </span>
                  </div>
                  <LevelBadge>{l.fluency || "Native"}</LevelBadge>
                </div>
              ))}
            </div>
            {accents.length > 0 && (
              <div className="mt-4 border-t border-border/60 pt-4">
                <p className="mb-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  Accents
                </p>
                <div className="flex flex-wrap gap-2">
                  {accents.map((a) => (
                    <Pill key={a}>{a}</Pill>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {skills.length > 0 && (
        <Card className="border-border shadow-card">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Skills</h2>
              {skills.length > 4 && (
                <button className="text-sm font-semibold text-amber hover:underline">
                  View All &rsaquo;
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.slice(0, 4).map((s) => (
                <Pill key={s.name}>{s.name}</Pill>
              ))}
              {skills.length > 4 && (
                <span className="rounded-full px-3 py-1.5 text-xs font-semibold text-amber">
                  + {skills.length - 4} more
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
