"use client";

import { useCallback, useMemo, useState } from "react";
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
import type { Campaign } from "@/lib/api/campaigns";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/providers/auth-store-provider";
import { BottomBar } from "@/components/shared/bottom-bar";
import { useTalentNavItems } from "@/hooks/use-talent-nav-items";
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
  toPortfolioItems,
} from "./data";
import { MediaLightbox } from "@/components/portfolio/MediaLightbox";

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
  campaigns,
}: {
  profile: TalentProfile;
  portfolioItems: PortfolioApiResponse[];
  credits: Credit[];
  testimonials: Testimonial[];
  awards: AwardType[];
  viewerRole: "talent" | "recruiter" | "admin" | null;
  campaigns?: Campaign[];
}) {
  const authUser = useAuthStore((s) => s.user);
  const navItems = useTalentNavItems();
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

  const portfolioItemsConverted = useMemo(
    () => toPortfolioItems(portfolioItems),
    [portfolioItems],
  );

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxItemId, setLightboxItemId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState("overview");

  const handleOpenLightbox = useCallback((itemId: string) => {
    setLightboxItemId(itemId);
    setLightboxOpen(true);
  }, []);

  return (
    <>
      <div className="mx-auto w-full max-w-md pb-24">
        {/* Cover + profile card */}
        <HeroSection
          profile={profile}
          viewerRole={viewerRole}
          showActions={false}
          isOwner={isOwner}
        />

      <div className="space-y-3 px-5 pt-3">
        <StatsBento profile={profile} testimonials={testimonials} />

        {/* CTA + secondary buttons */}
        <TalentProfileActions
          profile={profile}
          viewerRole={viewerRole}
          campaigns={campaigns}
        />

        {/* Social connect */}
        <SocialConnectBar profile={profile} />

        {/* Tab bar */}
        <nav className="flex items-end justify-between rounded-2xl bg-card px-1 py-2 shadow-[var(--shadow-card)]">
          {tabItems.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 border-b-2 px-0.5 pb-1.5 pt-1 transition-colors",
                activeTab === t.id
                  ? "border-brand text-brand"
                  : "border-transparent text-muted-foreground",
              )}
            >
              <t.icon className="size-4" />
              <span className="text-[9px] font-semibold">{t.label}</span>
            </button>
          ))}
        </nav>

        {/* Tab content */}
        {activeTab === "overview" && (
          <div className="space-y-3">
            <AboutSection bio={profile.about || ""} />
            <ShowReelSection items={portfolioItems} collapsible onOpenReel={handleOpenLightbox} />
            <PortfolioSection
              items={portfolioItems}
              username={profile.username}
              collapsible
              onOpenReel={handleOpenLightbox}
            />
            <SkillsSection skills={skills} collapsible />
            <AwardsSection data={awardItems} collapsible />
            <ReviewsSection data={reviewItems} initialShowAll collapsible />
          </div>
        )}

        {activeTab === "portfolio" && (
          <div className="space-y-3">
            <ShowReelSection items={portfolioItems} onOpenReel={handleOpenLightbox} />
            <PortfolioSection
              items={portfolioItems}
              username={profile.username}
              showAllAction={false}
              onOpenReel={handleOpenLightbox}
            />
          </div>
        )}

        {activeTab === "experience" && (
          <div className="space-y-3">
            <ExperienceSection data={experience} isOwner={isOwner} />
          </div>
        )}

        {activeTab === "skills" && (
          <div className="space-y-3">
            <SkillsSection skills={skills} />
          </div>
        )}

        {activeTab === "awards" && (
          <div className="space-y-3">
            <AwardsSection data={awardItems} />
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-3">
            <ReviewsSection data={reviewItems} initialShowAll />
          </div>
        )}

        {activeTab === "details" && (
          <div className="space-y-3">
            <DetailsSection profile={profile} awards={awardItems} />
          </div>
        )}

        {activeTab === "media" && (
          <div className="space-y-3">
            <MediaKitSection profile={profile} />
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-3">
            <AnalyticsSection profile={profile} />
          </div>
        )}

        {/* Footer */}
        <p className="flex items-center justify-center gap-1 pt-1 text-[10px] text-muted-foreground">
          <FileText className="size-3" /> Profile last updated Aug 2026
        </p>
      </div>
      </div>

      {isOwner && <BottomBar navItems={navItems} iconOnly />}

      <MediaLightbox
        items={portfolioItemsConverted}
        initialItemId={lightboxItemId}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}
