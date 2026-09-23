"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
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
  Video,
  Images,
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
  ShowreelPlayerCard,
  HighlightRow,
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
  const publicPortfolioItems = useMemo(() => {
    const itemsById = new Map(portfolioItemsConverted.map((item) => [item.id, item]));
    // The portfolio endpoint applies the ordered showcase IDs to each item.
    // Prefer that current source over the older profile snapshot when present.
    const configuredItems = portfolioItemsConverted.filter((item) => !!item.profileHighlightType);
    if (configuredItems.length > 0) return configuredItems;

    if (profile.portfolioHighlights?.length) {
      return profile.portfolioHighlights
        .map((item) => itemsById.get(item.id))
        .filter((item): item is (typeof portfolioItemsConverted)[number] => !!item);
    }

    return [];
  }, [portfolioItemsConverted, profile.portfolioHighlights]);
  const videoItems = useMemo(
    () =>
      publicPortfolioItems.filter(
        (i) => i.type !== "image" && i.profileHighlightType !== "showreel",
      ),
    [publicPortfolioItems],
  );
  const imageItems = useMemo(
    () => publicPortfolioItems.filter((i) => i.type === "image"),
    [publicPortfolioItems],
  );

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxItemId, setLightboxItemId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState("overview");
  const tabScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = tabScrollRef.current;
    if (!container) return;
    const activeBtn = container.querySelector(`[data-tab="${activeTab}"]`);
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeTab]);

  const handleOpenLightbox = useCallback((itemId: string) => {
    setLightboxItemId(itemId);
    setLightboxOpen(true);
  }, []);

  return (
    <>
      <div className="mx-auto w-full max-w-md pb-24">
        {/* Cover + identity band */}
        <HeroSection
          profile={profile}
          viewerRole={viewerRole}
          isOwner={isOwner}
          statsOverlap
        />

        {/* Stats card overlapping the identity band (pure-white reference) */}
        <div className="relative z-10 -mt-9 px-5">
          <StatsBento profile={profile} testimonials={testimonials} />
        </div>

      <div className="space-y-3 px-5 pt-3">

        {/* CTA + secondary buttons */}
        <TalentProfileActions
          profile={profile}
          viewerRole={viewerRole}
          campaigns={campaigns}
        />

        {/* Social connect */}
        <SocialConnectBar profile={profile} />

        {/* Tab bar */}
        <nav
          ref={tabScrollRef}
          className="no-scrollbar flex snap-x snap-mandatory items-end overflow-x-auto rounded-2xl bg-card px-1 py-2 shadow-[var(--shadow-card)]"
        >
          {tabItems.map((t) => (
            <button
              key={t.id}
              data-tab={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                "w-1/4 min-w-[25%] snap-center flex flex-col items-center gap-1 border-b-2 px-0.5 pb-1.5 pt-1 transition-colors",
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
            <SkillsSection skills={skills} />
            {(isOwner || publicPortfolioItems.length > 0) && (
              <div className="flex items-center justify-between rounded-2xl bg-card px-4 py-3 shadow-[var(--shadow-card)]">
                <h2 className="text-sm font-bold text-foreground">Portfolio Highlights</h2>
                {isOwner && <Link href="/talent/portfolio/showcase" className="text-xs font-semibold text-brand hover:underline">Manage Profile Showcase</Link>}
              </div>
            )}
            <ShowreelPlayerCard
              items={publicPortfolioItems}
              onOpenReel={handleOpenLightbox}
            />
            <HighlightRow
              icon={Video}
              title="Video Highlights"
              variant="video"
              items={videoItems}
              onOpenReel={handleOpenLightbox}
            />
            <HighlightRow
              icon={Images}
              title="Image Highlights"
              variant="image"
              items={imageItems}
              onOpenReel={handleOpenLightbox}
            />
            <Link
              href={`/talent/${profile.username}/portfolio`}
              className="block rounded-xl border border-border bg-card px-4 py-3 text-center text-sm font-semibold text-brand transition-colors hover:bg-secondary"
            >
              View Full Portfolio →
            </Link>
            <AwardsSection data={awardItems} />
            <ReviewsSection data={reviewItems} />
          </div>
        )}

        {activeTab === "portfolio" && (
          <div className="space-y-3">
            {isOwner && (
              <Link href="/talent/portfolio/showcase" className="block rounded-xl border border-border bg-card px-4 py-3 text-center text-sm font-semibold text-brand transition-colors hover:bg-secondary">
                Manage Profile Showcase
              </Link>
            )}
            <ShowReelSection
              items={portfolioItems.filter((item) =>
                publicPortfolioItems.some((highlight) => highlight.id === item.id),
              )}
              onOpenReel={handleOpenLightbox}
            />
            <PortfolioSection
              items={portfolioItems.filter((item) =>
                publicPortfolioItems.some((highlight) => highlight.id === item.id),
              )}
              username={profile.username}
              onOpenReel={handleOpenLightbox}
            />
            <Link
              href={`/talent/${profile.username}/portfolio`}
              className="block rounded-xl border border-border bg-card px-4 py-3 text-center text-sm font-semibold text-brand transition-colors hover:bg-secondary"
            >
              View Full Portfolio →
            </Link>
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
        items={publicPortfolioItems}
        initialItemId={lightboxItemId}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}
