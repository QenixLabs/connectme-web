"use client";

import { TrendingUp, Heart, Eye, Clapperboard, Star } from "lucide-react";
import type { TalentProfile } from "@/lib/api/talent";
import type { PortfolioApiResponse, Testimonial } from "@/lib/api/talent";
import { StatCard } from "./primitives";
import { computeRating } from "./data";

export function StatsBento({
  profile,
  portfolioItems,
  testimonials,
}: {
  profile: TalentProfile;
  portfolioItems: PortfolioApiResponse[];
  testimonials: Testimonial[];
}) {
  const analytics = profile.analytics;
  const trustScore = profile.trust_score ?? 0;
  const portfolioCount = portfolioItems.length;
  const views = analytics?.profile_views_30d ?? 0;
  const likes = analytics?.like_count ?? 0;
  const { average, count } = computeRating(testimonials);

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
      <StatCard
        label="RootScore"
        value={trustScore}
        sub="Trust & completeness"
        icon={<TrendingUp className="size-5" />}
        accent="primary"
      />
      <StatCard
        label="Profile Views"
        value={views.toLocaleString()}
        sub="Last 30 days"
        icon={<Eye className="size-5" />}
        accent="primary"
      />
      <StatCard
        label="Likes"
        value={likes.toLocaleString()}
        sub="From recruiters"
        icon={<Heart className="size-5" />}
        accent="gold"
      />
      <StatCard
        label={average > 0 ? `Rating (${count})` : "Portfolio"}
        value={
          average > 0 ? (
            <span className="flex items-center gap-2">
              {average}
              <Star className="inline size-5 fill-gold text-gold" />
            </span>
          ) : (
            portfolioCount
          )
        }
        sub={average > 0 ? "Average review" : "Work samples"}
        icon={average > 0 ? <Star className="size-5" /> : <Clapperboard className="size-5" />}
        accent={average > 0 ? "gold" : "success"}
      />
    </div>
  );
}
