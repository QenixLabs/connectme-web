"use client";

import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PortfolioReelOverlay } from "@/components/portfolio/PortfolioReelOverlay";
import type { TalentProfile, PortfolioApiResponse, Credit, Testimonial, Award } from "@/lib/api/talent";
import { HeroSection } from "./HeroSection";
import { StatsBento } from "./StatsBento";
import {
  AboutSection,
  PortfolioSection,
  ExperienceSection,
  SkillsSection,
  ReviewsSection,
  AwardsSection,
  MediaKitSection,
  AnalyticsSection,
  DetailsSection,
} from "./sections";
import {
  getFacts,
  toExperienceItems,
  toAwardItems,
  toReviewItems,
  toPortfolioItems,
} from "./data";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "details", label: "Details" },
  { id: "portfolio", label: "Portfolio" },
  { id: "experience", label: "Experience" },
  { id: "reviews", label: "Reviews" },
  { id: "media-kit", label: "Media Kit" },
  { id: "analytics", label: "Analytics" },
];

export function TalentProfileView({
  profile,
  portfolioItems,
  credits,
  testimonials,
  awards,
}: {
  profile: TalentProfile;
  portfolioItems: PortfolioApiResponse[];
  credits: Credit[];
  testimonials: Testimonial[];
  awards: Award[];
}) {
  const [reelItemId, setReelItemId] = useState<string | null>(null);

  const facts = useMemo(() => getFacts(profile), [profile]);
  const experience = useMemo(() => toExperienceItems(credits), [credits]);
  const awardItems = useMemo(() => toAwardItems(awards), [awards]);
  const reviewItems = useMemo(() => toReviewItems(testimonials), [testimonials]);
  const skills = useMemo(
    () => (profile.skills || []).map((s) => s.name),
    [profile],
  );
  const mappedPortfolioItems = useMemo(
    () => toPortfolioItems(portfolioItems),
    [portfolioItems],
  );

  return (
    <div className="relative min-h-screen bg-bg-page pb-24">
      <HeroSection profile={profile} />

      <main className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
        <div className="space-y-6">
          <StatsBento
            profile={profile}
            portfolioItems={portfolioItems}
            testimonials={testimonials}
          />

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="profile-card no-scrollbar mb-6 flex w-full justify-start gap-1 overflow-x-auto rounded-2xl p-1.5">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-bg-surface-inset hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview" className="space-y-6 focus-visible:outline-none">
              <AboutSection bio={profile.about || ""} />
              <PortfolioSection
                items={portfolioItems}
                username={profile.username}
                onOpenReel={setReelItemId}
              />
              <ExperienceSection data={experience} />
              <SkillsSection skills={skills} />
              <AwardsSection data={awardItems} />
            </TabsContent>

            <TabsContent value="details" className="space-y-6 focus-visible:outline-none">
              <DetailsSection facts={facts} />
            </TabsContent>

            <TabsContent value="portfolio" className="space-y-6 focus-visible:outline-none">
              <PortfolioSection
                items={portfolioItems}
                username={profile.username}
                onOpenReel={setReelItemId}
                showAllAction={false}
              />
            </TabsContent>

            <TabsContent value="experience" className="space-y-6 focus-visible:outline-none">
              <ExperienceSection data={experience} />
              <AwardsSection data={awardItems} />
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6 focus-visible:outline-none">
              <ReviewsSection data={reviewItems} />
            </TabsContent>

            <TabsContent value="media-kit" className="space-y-6 focus-visible:outline-none">
              <MediaKitSection profile={profile} />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6 focus-visible:outline-none">
              <AnalyticsSection profile={profile} />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <PortfolioReelOverlay
        items={mappedPortfolioItems}
        username={profile.username}
        initialItemId={reelItemId ?? undefined}
        open={!!reelItemId}
        onClose={() => setReelItemId(null)}
      />
    </div>
  );
}
