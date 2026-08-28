"use client";

import { BarChart3, Eye, Heart, Bookmark } from "lucide-react";
import { GlassCard, SectionHeader } from "../primitives";
import type { TalentProfile } from "@/lib/api/talent";

function StatItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      {icon}
      <p className="mt-1.5 text-lg font-extrabold leading-none text-foreground">
        {value}
      </p>
      <p className="mt-0.5 text-[10px] leading-tight text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

export function AnalyticsSection({ profile }: { profile: TalentProfile }) {
  const analytics = profile.analytics;

  return (
    <GlassCard hover={false}>
      <SectionHeader icon={<BarChart3 className="size-4" />} title="Analytics" />
      {!analytics ? (
        <p className="py-8 text-center text-sm text-muted-foreground/60">
          No analytics data available.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <StatItem
            label="Views (7d)"
            value={analytics.profile_views_7d.toLocaleString()}
            icon={<Eye className="size-4 text-brand" />}
          />
          <StatItem
            label="Views (30d)"
            value={analytics.profile_views_30d.toLocaleString()}
            icon={<Eye className="size-4 text-brand" />}
          />
          <StatItem
            label="Likes"
            value={analytics.like_count.toLocaleString()}
            icon={<Heart className="size-4 text-warning" />}
          />
          <StatItem
            label="Shortlists"
            value={analytics.shortlist_count.toLocaleString()}
            icon={<Bookmark className="size-4 text-brand" />}
          />
        </div>
      )}
    </GlassCard>
  );
}
