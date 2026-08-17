"use client";

import { Eye, Heart, Bookmark, Sparkles, Target } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrustScoreRing } from "./trust-score-ring";
import type { TalentProfile } from "@/lib/api/talent";

interface ProfileAnalyticsProps {
  profile: TalentProfile;
  completeness?: { isComplete: boolean; missingFields: string[] } | null;
}

const TOTAL_FIELDS = 35;

export function ProfileAnalytics({ profile, completeness }: ProfileAnalyticsProps) {
  const analytics = profile.analytics ?? {
    profile_views_7d: 0,
    profile_views_30d: 0,
    shortlist_count: 0,
    like_count: 0,
  };

  const missingCount = completeness?.missingFields.length ?? TOTAL_FIELDS;
  const completeCount = Math.max(0, TOTAL_FIELDS - missingCount);
  const completenessPercent = Math.round((completeCount / TOTAL_FIELDS) * 100);

  const stats = [
    {
      label: "7d views",
      value: analytics.profile_views_7d ?? 0,
      icon: Eye,
      tone: "text-blue",
      bg: "bg-blue/10",
    },
    {
      label: "30d views",
      value: analytics.profile_views_30d ?? 0,
      icon: Eye,
      tone: "text-azure",
      bg: "bg-azure/10",
    },
    {
      label: "Shortlists",
      value: analytics.shortlist_count ?? 0,
      icon: Bookmark,
      tone: "text-warning",
      bg: "bg-warning/10",
    },
    {
      label: "Likes",
      value: analytics.like_count ?? 0,
      icon: Heart,
      tone: "text-rose",
      bg: "bg-rose/10",
    },
  ] as const;

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl border border-border bg-card shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 font-display text-base">
            <Sparkles className="size-4 text-primary" />
            Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-border bg-surface-raised p-3 transition-colors hover:border-border-hover"
            >
              <div className={`grid size-8 place-items-center rounded-lg ${s.bg} ${s.tone}`}>
                <s.icon className="size-4" />
              </div>
              <p className="mt-2 text-xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-border bg-card shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 font-display text-base">
            <Target className="size-4 text-warning" />
            Profile completeness
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <TrustScoreRing score={completenessPercent} size={52} stroke={4} />
            <div>
              <p className="text-2xl font-bold">{completenessPercent}%</p>
              <p className="text-xs text-muted-foreground">
                {completeCount} of {TOTAL_FIELDS} fields completed
              </p>
            </div>
          </div>
          <Progress value={completenessPercent} />
          {completeness && completeness.missingFields.length > 0 && (
            <div className="rounded-xl bg-muted/40 p-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Top missing fields
              </p>
              <ul className="space-y-1">
                {completeness.missingFields.slice(0, 4).map((field) => (
                  <li
                    key={field}
                    className="text-xs capitalize text-foreground/80"
                  >
                    {field.replace(/_/g, " ")}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
