"use client";

import { BarChart3, Eye, Heart, Bookmark } from "lucide-react";
import { GlassCard, SectionHeader, StatCard } from "../primitives";
import type { TalentProfile } from "@/lib/api/talent";

export function AnalyticsSection({ profile }: { profile: TalentProfile }) {
  const analytics = profile.analytics;

  return (
    <GlassCard>
      <SectionHeader icon={<BarChart3 className="size-4" />} title="Analytics" />
      {!analytics ? (
        <p className="py-8 text-center text-sm text-muted-foreground/60">
          No analytics data available.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <StatCard
            label="Views (7d)"
            value={analytics.profile_views_7d.toLocaleString()}
            icon={<Eye className="size-5" />}
          />
          <StatCard
            label="Views (30d)"
            value={analytics.profile_views_30d.toLocaleString()}
            icon={<Eye className="size-5" />}
          />
          <StatCard
            label="Likes"
            value={analytics.like_count.toLocaleString()}
            icon={<Heart className="size-5" />}
            accent="gold"
          />
          <StatCard
            label="Shortlists"
            value={analytics.shortlist_count.toLocaleString()}
            icon={<Bookmark className="size-5" />}
          />
        </div>
      )}
    </GlassCard>
  );
}
