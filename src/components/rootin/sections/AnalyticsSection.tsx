"use client";

import { BarChart3, Eye, Heart, Bookmark, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, SectionHead, EmptyState } from "../primitives";
import type { TalentProfile } from "@/lib/api/talent";

export interface AnalyticsSectionProps {
  profile: TalentProfile;
  className?: string;
}

export function AnalyticsSection({ profile, className }: AnalyticsSectionProps) {
  const analytics = profile.analytics;

  if (!analytics) {
    return (
      <Card className={cn("transition-all duration-300 ease-out", className)}>
        <SectionHead icon={<BarChart3 width={16} height={16} />} title="Analytics" />
        <EmptyState icon={<BarChart3 width={32} height={32} />} message="No analytics data available." />
      </Card>
    );
  }

  const stats = [
    {
      icon: Eye,
      label: "Profile Views (7d)",
      value: analytics.profile_views_7d ?? 0,
      color: "text-accent",
    },
    {
      icon: Eye,
      label: "Profile Views (30d)",
      value: analytics.profile_views_30d ?? 0,
      color: "text-accent",
    },
    {
      icon: Heart,
      label: "Likes",
      value: analytics.like_count ?? 0,
      color: "text-destructive",
    },
    {
      icon: Bookmark,
      label: "Shortlists",
      value: analytics.shortlist_count ?? 0,
      color: "text-accent",
    },
  ];

  return (
    <Card prominent className={cn("transition-all duration-300 ease-out", className)}>
      <SectionHead icon={<BarChart3 width={16} height={16} />} title="Analytics" />
      <div className="grid gap-3 sm:grid-cols-2">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-3 rounded-xl border bg-surface p-4 transition-all duration-200 hover:-translate-y-px hover:bg-surface/90"
            style={{ borderColor: "var(--border-card)" }}
          >
            <div className="rounded-full border border-accent/20 p-2">
              <stat.icon width={16} height={16} className={cn("text-accent/70", stat.color === "text-destructive" && "text-destructive/70")} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/40">
                {stat.label}
              </p>
              <p className="font-display text-2xl font-semibold text-foreground">
                {stat.value.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
