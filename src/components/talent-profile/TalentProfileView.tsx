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
} from "lucide-react";
import type {
  TalentProfile,
  TalentSkill,
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
  ExperienceSection,
  SkillsSection,
  ReviewsSection,
  AwardsSection,
  DetailsSection,
  MediaKitSection,
  AnalyticsSection,
  PublicPortfolioSections,
  PublicDocumentsSection,
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
  const skills = useMemo<TalentSkill[]>(
    () =>
      [...(profile.skills || [])]
        .sort((left, right) => left.order - right.order)
        .map((skill, index) => ({ ...skill, order: skill.order ?? index })),
    [profile],
  );

  const publicMediaItems = useMemo(
    () => toPortfolioItems(
      portfolioItems.filter(
        (item) => item.type === "image" || item.type === "video" || item.type === "youtube",
      ),
    ),
    [portfolioItems],
  );
  const publicViewerItems = useMemo(() => toPortfolioItems(portfolioItems), [portfolioItems]);

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
      <div className="mx-auto w-full max-w-md bg-[#F7F8FC] pb-24">
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

      <div className="space-y-2.5 px-5 pt-3">

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
           className="no-scrollbar flex snap-x snap-mandatory items-end overflow-x-auto rounded-[20px] bg-white/90 px-1 py-1.5 shadow-[0_6px_24px_rgba(15,23,42,0.05)]"
        >
          {tabItems.map((t) => (
            <button
              key={t.id}
              data-tab={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                "w-1/4 min-w-[25%] snap-center flex flex-col items-center gap-1 border-b-2 px-0.5 pb-1.5 pt-1 transition-colors",
                activeTab === t.id
                   ? "border-[#2563EB] text-[#2563EB]"
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
           <div className="space-y-2.5">
            <AboutSection bio={profile.about || ""} />
            <SkillsSection skills={skills} />
            {(isOwner || publicMediaItems.length > 0) && (
               <div className="flex items-center justify-between gap-3 px-1 py-1">
                 <div className="flex min-w-0 items-center gap-2.5">
                   <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-purple-50 text-[#7C3AED]">
                     <FolderOpen className="size-4" />
                   </span>
                   <div className="min-w-0">
                     <h2 className="text-sm font-bold text-slate-800">Portfolio</h2>
                     <p className="truncate text-[10px] text-muted-foreground">Showcase your strongest work</p>
                   </div>
                 </div>
                 {isOwner && (
                   <Link href="/talent/portfolio/showcase" className="shrink-0 text-[11px] font-bold text-[#2563EB] hover:underline">
                     Manage -&gt;
                   </Link>
                 )}
               </div>
            )}
              <PublicPortfolioSections
                items={portfolioItems}
                username={profile.username}
                onOpenReel={handleOpenLightbox}
              />
            <AwardsSection data={awardItems} />
            <ReviewsSection data={reviewItems} />
          </div>
        )}

        {activeTab === "portfolio" && (
         <div className="space-y-2.5">
            {isOwner && (
              <Link href="/talent/portfolio/showcase" className="block rounded-xl border border-border bg-card px-4 py-3 text-center text-sm font-semibold text-brand transition-colors hover:bg-secondary">
                Manage Profile Showcase
              </Link>
             )}
             <PublicPortfolioSections
               items={portfolioItems}
               username={profile.username}
               onOpenReel={handleOpenLightbox}
             />
             <PublicDocumentsSection
               items={portfolioItems}
               username={profile.username}
               onOpen={handleOpenLightbox}
             />
           </div>
        )}

        {activeTab === "experience" && (
         <div className="space-y-2.5">
            <ExperienceSection data={experience} isOwner={isOwner} />
          </div>
        )}

        {activeTab === "skills" && (
         <div className="space-y-2.5">
            <SkillsSection skills={skills} />
          </div>
        )}

        {activeTab === "awards" && (
         <div className="space-y-2.5">
            <AwardsSection data={awardItems} />
          </div>
        )}

        {activeTab === "reviews" && (
         <div className="space-y-2.5">
            <ReviewsSection data={reviewItems} initialShowAll />
          </div>
        )}

        {activeTab === "details" && (
         <div className="space-y-2.5">
            <DetailsSection profile={profile} awards={awardItems} />
          </div>
        )}

        {activeTab === "media" && (
         <div className="space-y-2.5">
            <MediaKitSection profile={profile} />
          </div>
        )}

        {activeTab === "analytics" && (
           <div className="space-y-2.5">
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
        items={publicViewerItems}
        initialItemId={lightboxItemId}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}
