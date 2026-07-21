"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { TalentProfile, PortfolioItem } from "@/lib/validations/talent-profile.schema";
import type { MockCredit, MockAward, MockReview, MockStats } from "@/lib/mocks/public-profile";
import { ExperienceSection } from "./experience-section";
import { LooksSkillsCard } from "./looks-skills-card";
import { AwardsSection } from "./awards-section";
import { ReviewsSection } from "./reviews-section";
import { StatsBand } from "./stats-band";

interface OverviewPaneProps {
  profile: TalentProfile;
  portfolioItems: PortfolioItem[];
  credits: MockCredit[];
  awards: MockAward[];
  reviews: MockReview[];
  stats: MockStats;
  onPortfolioItemClick?: (item: PortfolioItem) => void;
}

export function OverviewPane({
  profile,
  portfolioItems,
  credits,
  awards,
  reviews,
  stats,
  onPortfolioItemClick,
}: OverviewPaneProps) {
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const aboutText = profile.about || "No bio added yet.";

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left column */}
        <div className="space-y-6">
          {/* About */}
          <Card className="border-border shadow-card">
            <CardContent className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">About</h2>
                <button className="text-muted-foreground hover:text-foreground">
                  <ChevronDown className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {aboutExpanded
                  ? aboutText
                  : aboutText.length > 250
                    ? aboutText.slice(0, 250) + "..."
                    : aboutText}
              </p>
              {aboutText.length > 250 && (
                <button
                  onClick={() => setAboutExpanded(!aboutExpanded)}
                  className="mt-2 text-sm font-semibold text-amber hover:underline"
                >
                  {aboutExpanded ? "Show Less" : "Show More"}
                </button>
              )}
            </CardContent>
          </Card>

          {/* Experience preview */}
          {credits.length > 0 && <ExperienceSection credits={credits} preview />}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <LooksSkillsCard profile={profile} />
          <AwardsSection awards={awards} />
        </div>
      </div>

      {/* Reviews (full width below columns) */}
      {reviews.length > 0 && (
        <ReviewsSection reviews={reviews} />
      )}

      {/* Stats band */}
      <StatsBand stats={stats} />
    </div>
  );
}
