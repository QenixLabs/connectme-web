"use client";

import { useMemo } from "react";
import {
  Home,
  Image as ImageIcon,
  Briefcase,
  Gem,
  Award,
  MessageSquare,
  FileText,
  User,
  BarChart3,
  FolderOpen,
} from "lucide-react";
import type {
  TalentProfile,
  PortfolioApiResponse,
  Credit,
  Testimonial,
  Award as AwardType,
} from "@/lib/api/talent";
import { useAuthStore } from "@/providers/auth-store-provider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { HeroSection } from "./HeroSection";
import { StatsBento } from "./StatsBento";
import { TalentProfileActions } from "./TalentProfileActions";
import { SocialConnectBar } from "./SocialConnectBar";
import {
  AboutSection,
  ShowReelSection,
  PortfolioSection,
  ExperienceSection,
  SkillsSection,
  ReviewsSection,
  AwardsSection,
  DetailsSection,
  MediaKitSection,
  AnalyticsSection,
} from "./sections";
import {
  toExperienceItems,
  toAwardItems,
  toReviewItems,
} from "./data";

const tabItems = [
  { id: "overview", icon: Home, label: "Overview" },
  { id: "portfolio", icon: ImageIcon, label: "Portfolio" },
  { id: "experience", icon: Briefcase, label: "Experience" },
  { id: "skills", icon: Gem, label: "Skills" },
  { id: "details", icon: User, label: "Details" },
  { id: "awards", icon: Award, label: "Awards" },
  { id: "reviews", icon: MessageSquare, label: "Reviews" },
  { id: "media", icon: FolderOpen, label: "Media Kit" },
  { id: "analytics", icon: BarChart3, label: "Analytics" },
];

export function TalentProfileView({
  profile,
  portfolioItems,
  credits,
  testimonials,
  awards,
  viewerRole,
}: {
  profile: TalentProfile;
  portfolioItems: PortfolioApiResponse[];
  credits: Credit[];
  testimonials: Testimonial[];
  awards: AwardType[];
  viewerRole: "talent" | "recruiter" | "admin" | null;
}) {
  const authUser = useAuthStore((s) => s.user);
  const isOwner =
    viewerRole === "talent" &&
    !!authUser?.username &&
    profile.username === authUser.username;

  const experience = useMemo(() => toExperienceItems(credits), [credits]);
  const awardItems = useMemo(() => toAwardItems(awards), [awards]);
  const reviewItems = useMemo(() => toReviewItems(testimonials), [testimonials]);
  const skills = useMemo(
    () => (profile.skills || []).map((s) => s.name),
    [profile],
  );

  return (
    <div className="mx-auto w-full max-w-md pb-24">
      <HeroSection
        profile={profile}
        viewerRole={viewerRole}
        showActions={false}
        isOwner={isOwner}
      />

      <div className="space-y-3 px-5 pt-3">
        <StatsBento profile={profile} testimonials={testimonials} />
        <TalentProfileActions profile={profile} viewerRole={viewerRole} />
        <SocialConnectBar profile={profile} />

        {/* Tab bar */}
        <Tabs defaultValue="overview">
          <div className="overflow-x-auto rounded-2xl bg-card px-1 py-2 shadow-[var(--shadow-card)] scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]">
            <TabsList variant="line" className="w-full justify-start">
              {tabItems.map((t) => (
                <TabsTrigger
                  key={t.id}
                  value={t.id}
                  className="min-w-[25%] shrink-0 flex-col items-center gap-1 border-b-2 border-transparent px-0.5 pb-1.5 pt-1 text-[9px] font-semibold data-[state=active]:border-brand data-[state=active]:text-brand data-[state=active]:bg-transparent data-[state=active]:shadow-none [&_svg]:size-4"
                >
                  <t.icon />
                  <span>{t.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-3">
            <AboutSection bio={profile.about || ""} />
            <ShowReelSection items={portfolioItems} collapsible />
            <PortfolioSection
              items={portfolioItems}
              username={profile.username}
              collapsible
            />
            <SkillsSection skills={skills} collapsible />
            <AwardsSection data={awardItems} collapsible />
            <ReviewsSection data={reviewItems} initialShowAll collapsible />
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-3">
            <ShowReelSection items={portfolioItems} />
            <PortfolioSection
              items={portfolioItems}
              username={profile.username}
              showAllAction={false}
            />
          </TabsContent>

          <TabsContent value="experience" className="space-y-3">
            <ExperienceSection data={experience} isOwner={isOwner} />
          </TabsContent>

          <TabsContent value="skills" className="space-y-3">
            <SkillsSection skills={skills} />
          </TabsContent>

          <TabsContent value="awards" className="space-y-3">
            <AwardsSection data={awardItems} />
          </TabsContent>

          <TabsContent value="reviews" className="space-y-3">
            <ReviewsSection data={reviewItems} initialShowAll />
          </TabsContent>

          <TabsContent value="details" className="space-y-3">
            <DetailsSection profile={profile} awards={awardItems} />
          </TabsContent>

          <TabsContent value="media" className="space-y-3">
            <MediaKitSection profile={profile} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-3">
            <AnalyticsSection profile={profile} />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <p className="flex items-center justify-center gap-1 pt-1 text-[10px] text-muted-foreground">
          <FileText className="size-3" /> Profile last updated Aug 2026
        </p>
      </div>
    </div>
  );
}
