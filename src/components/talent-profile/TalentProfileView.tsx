"use client";

import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PortfolioReelOverlay } from "@/components/portfolio/PortfolioReelOverlay";
import { MobileBottomNav } from "@/components/navigation/MobileBottomNav";
import type { TalentProfile, PortfolioApiResponse, Credit, Testimonial, Award } from "@/lib/api/talent";
import type { Campaign } from "@/lib/api/campaigns";
import { useAuthStore } from "@/providers/auth-store-provider";
import { HeroSection } from "./HeroSection";
import { StatsBento } from "./StatsBento";
import { TalentProfileActions } from "./TalentProfileActions";
import { LetWorkTogetherCTA } from "./LetWorkTogetherCTA";
import {
  AboutSection,
  PortfolioSection,
  ExperienceSection,
  SkillsSection,
  ReviewsSection,
  MediaKitSection,
  AnalyticsSection,
  DetailsSection,
} from "./sections";
import {
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
  { id: "skills", label: "Skills" },
  { id: "reviews", label: "Reviews" },
];

export function TalentProfileView({
  profile,
  portfolioItems,
  credits,
  testimonials,
  awards,
  viewerRole,
  campaigns,
  campaignsLoading,
}: {
  profile: TalentProfile;
  portfolioItems: PortfolioApiResponse[];
  credits: Credit[];
  testimonials: Testimonial[];
  awards: Award[];
  viewerRole: "talent" | "recruiter" | "admin" | null;
  campaigns?: Campaign[];
  campaignsLoading?: boolean;
}) {
  const [reelItemId, setReelItemId] = useState<string | null>(null);
  const authUser = useAuthStore((s) => s.user);
  const isOwner =
    viewerRole === "talent" &&
    !!authUser?.username &&
    profile.username === authUser.username;

  const displayName =
    profile.full_legal_name?.trim() || profile.username?.trim() || "Talent";
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
    <div className="relative min-h-screen bg-bg-page">
      <HeroSection
        profile={profile}
        viewerRole={viewerRole}
        campaigns={campaigns}
        campaignsLoading={campaignsLoading}
        showActions={false}
      />

      <main className="relative z-10 mx-auto max-w-5xl px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-3 sm:px-6 lg:pb-12">
        <div className="space-y-4">
          <StatsBento profile={profile} testimonials={testimonials} />

          <TalentProfileActions
            profile={profile}
            viewerRole={viewerRole}
            campaigns={campaigns}
            campaignsLoading={campaignsLoading}
          />

          <Tabs defaultValue="overview" className="w-full pt-2">
            <TabsList
              variant="line"
              className="no-scrollbar sticky top-0 z-20 mb-0 flex h-11 w-full justify-start gap-1 overflow-x-auto rounded-none border-b border-border bg-bg-page p-0"
            >
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex-none rounded-none border-transparent px-3 text-sm font-medium text-muted-foreground after:bg-rootin data-[state=active]:text-rootin data-[state=active]:shadow-none dark:data-[state=active]:text-rootin sm:px-4"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent
              value="overview"
              className="mt-4 space-y-4 focus-visible:outline-none"
            >
              <AboutSection bio={profile.about || ""} />
            </TabsContent>

            <TabsContent
              value="details"
              className="mt-4 space-y-4 focus-visible:outline-none"
            >
              <DetailsSection profile={profile} awards={awardItems} />
            </TabsContent>

            <TabsContent
              value="portfolio"
              className="mt-4 space-y-4 focus-visible:outline-none"
            >
              <PortfolioSection
                items={portfolioItems}
                username={profile.username}
                onOpenReel={setReelItemId}
                showAllAction={false}
              />
              <MediaKitSection profile={profile} />
            </TabsContent>

            <TabsContent
              value="experience"
              className="mt-4 space-y-4 focus-visible:outline-none"
            >
              <ExperienceSection data={experience} isOwner={isOwner} />
              {isOwner && <AnalyticsSection profile={profile} />}
            </TabsContent>

            <TabsContent
              value="skills"
              className="mt-4 space-y-4 focus-visible:outline-none"
            >
              <SkillsSection skills={skills} />
            </TabsContent>

            <TabsContent
              value="reviews"
              className="mt-4 space-y-4 focus-visible:outline-none"
            >
              <ReviewsSection data={reviewItems} initialShowAll />
            </TabsContent>
          </Tabs>

          {!isOwner && (
            <LetWorkTogetherCTA
              username={profile.username}
              displayName={displayName}
              viewerRole={viewerRole}
            />
          )}
        </div>
      </main>

      <MobileBottomNav role={viewerRole} />

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
