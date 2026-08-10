"use client";

import { useState, useMemo } from "react";
import {
  ArrowLeft,
  TrendingUp,
  Star,
  MessageCircle,
} from "lucide-react";
import { MobileBottomNav } from "@/components/navigation/MobileBottomNav";
import {
  AboutSection,
  AwardsSection,
  ExperienceSection,
  PortfolioSection,
  ReviewsSection,
  SkillsSection,
  MediaKitSection,
  AnalyticsSection,
  TabBar,
  ProfileProvider,
} from "./sections";
import {
  ActionButtons,
  MetaRow,
  NameBlock,
  RoleTags,
  RootVerifiedBadge,
  ScoreRing,
} from "./sections";
import type { TalentProfile, PortfolioApiResponse, Credit, Testimonial, Award } from "@/lib/api/talent";
import type { TalentData, Fact, PortfolioItem, ExperienceItem, AwardItem, ReviewItem } from "./sections/types";

const tabs = ["Overview", "Portfolio", "Experience", "Skills", "Media Kit", "Reviews", "Analytics"];

function mapProfileToTalentData(profile: TalentProfile): TalentData {
  return {
    name: profile.full_legal_name || profile.username,
    roles: profile.professions || [],
    location: [profile.location?.city, profile.location?.state, profile.location?.country]
      .filter(Boolean)
      .join(", "),
    responds: "Responds in 2 hours",
    bio: profile.about || "",
    likes: profile.analytics?.like_count ?? 0,
  };
}

function mapProfileToFact(profile: TalentProfile): Fact[] {
  const facts: Fact[] = [];

  if (profile.physical_attributes?.height_cm) {
    const feet = Math.floor(profile.physical_attributes.height_cm / 30.48);
    const inches = Math.round((profile.physical_attributes.height_cm / 25.4) % 12);
    facts.push({ icon: "height", label: "Height", value: `${feet}'${inches}"` });
  }

  if (profile.languages && profile.languages.length > 0) {
    facts.push({
      icon: "globe",
      label: "Languages",
      value: profile.languages.map((l) => l.name).join(", "),
    });
  }

  if (profile.physical_attributes?.eye_color) {
    facts.push({ icon: "eye", label: "Eye Color", value: profile.physical_attributes.eye_color });
  }

  if (profile.date_of_birth) {
    const birth = new Date(profile.date_of_birth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    facts.push({ icon: "calendar", label: "Age", value: String(age) });
  }

  return facts;
}

function mapPortfolioToItems(items: PortfolioApiResponse[]): PortfolioItem[] {
  return items.map((item, i) => ({
    img: item.thumbnail_url || item.url,
    duration: undefined,
    category: item.category || "work",
    title: item.title || item.caption || `Item ${i + 1}`,
    type: item.type === "video" ? "video" : "photo",
  }));
}

function mapCreditsToExperience(credits: Credit[]): ExperienceItem[] {
  return credits
    .filter((c) => c.type === "credit")
    .map((c) => ({
      years: c.year ? String(c.year) : "N/A",
      role: c.role_played || "",
      pill: c.platform || "Film",
      company: [c.project_name, c.director].filter(Boolean).join(" \u2022 "),
      description: c.description || "",
    }));
}

function mapAwardsToItems(awards: Award[]): AwardItem[] {
  return awards.map((a) => ({
    name: a.title,
    issuer: [a.awarding_body, a.year ? String(a.year) : ""].filter(Boolean).join(" \u2022 "),
  }));
}

function mapTestimonialsToReviews(testimonials: Testimonial[]): ReviewItem[] {
  return testimonials.map((t) => ({
    avatar: "/images/portfolio/p1.jpg",
    name: t.author_name,
    role: [t.author_role, t.author_company].filter(Boolean).join(", "),
    rating: t.rating ?? 5,
    when: formatRelativeTime(t.created_at),
    quote: t.content || "",
  }));
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

function HeroPortrait({ profile }: { profile: TalentProfile }) {
  const heroImage = profile.profile_photo || profile.hero_background || "/heroimage.jfif";
  const displayName = profile.full_legal_name || profile.username;

  return (
    <div
      className="relative overflow-hidden"
      style={{
        maskImage:
          "radial-gradient(ellipse 95% 92% at 50% 35%, black 60%, transparent 100%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 95% 92% at 50% 35%, black 60%, transparent 100%)",
      }}
    >
      <img
        src={heroImage}
        alt={`${displayName} portrait`}
        width={1200}
        height={1200}
        className="h-[52vh] max-h-[416px] min-h-[288px] w-full object-cover scale-90"
        style={{
          objectPosition: "center 20%",
          filter: "contrast(1.04) brightness(1.02) saturate(1.05)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{ backgroundImage: "var(--hero-overlay)" }}
      />
      <div
        className="absolute inset-0"
        style={{ backgroundImage: "var(--hero-horizontal-fade)" }}
      />
      <div
        className="absolute inset-0"
        style={{ backgroundImage: "var(--gradient-hero)" }}
      />
      <div
        className="absolute inset-0"
        style={{ backgroundImage: "var(--hero-edge-fade)" }}
      />
      <button className="absolute left-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-black/30 backdrop-blur-sm transition-all duration-200 hover:bg-black/50">
        <ArrowLeft width={20} height={20} className="text-white" />
      </button>
      <div className="absolute inset-x-4 bottom-5 space-y-5">
        <div className="flex items-center gap-2.5">
          <NameBlock />
          <RootVerifiedBadge />
        </div>
        <RoleTags />
        <MetaRow />
      </div>
    </div>
  );
}

function MetricsSection() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-panel-border bg-card">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent" />

      <div className="flex items-center justify-center gap-3 px-4 pt-5 pb-4">
        <div className="h-px flex-1 bg-panel-border" />
        <div className="flex shrink-0 items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
          <TrendingUp className="h-4 w-4 text-accent" />
          Professional Metrics
        </div>
        <div className="h-px flex-1 bg-panel-border" />
      </div>

      <div className="grid grid-cols-3">
        <div className="flex flex-col items-center px-4 pb-5">
          <div className="mb-3 rounded-full border border-accent/30 p-2">
            <TrendingUp className="h-3.5 w-3.5 text-accent" />
          </div>
          <p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            RootScore
          </p>
          <ScoreRing size={72} />
          <p className="mt-1.5 text-xs font-medium text-accent">Top 5% Talent</p>
        </div>

        <div className="relative">
          <div className="absolute left-0 top-6 bottom-6 w-px bg-panel-border" />
          <div className="flex flex-col items-center px-4 pb-5">
            <div className="mb-3 rounded-full border border-accent/30 p-2">
              <Star className="h-3.5 w-3.5 text-accent" />
            </div>
            <p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Rating
            </p>
            <div className="font-display text-3xl text-foreground">4.8</div>
            <div className="mt-2 flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-gold text-gold" />
              ))}
            </div>
            <p className="mt-1.5 text-[10px] text-muted-foreground">120 Reviews</p>
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-0 top-6 bottom-6 w-px bg-panel-border" />
          <div className="flex flex-col items-center px-4 pb-5">
            <div className="mb-3 rounded-full border border-accent/30 p-2">
              <MessageCircle className="h-3.5 w-3.5 text-accent" />
            </div>
            <p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Response Rate
            </p>
            <div className="font-display text-3xl text-foreground">95%</div>
            <p className="mt-2 text-xs text-accent">Replies within 2 hours</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 px-4 pb-4">
        <div className="h-px flex-1 bg-panel-border" />
        <div className="shrink-0 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Trusted by Top Recruiters
        </div>
        <div className="h-px flex-1 bg-panel-border" />
      </div>
    </section>
  );
}

interface MobileViewProps {
  profile: TalentProfile;
  portfolioItems: PortfolioApiResponse[];
  credits: Credit[];
  testimonials: Testimonial[];
  awards: Award[];
}

export function MobileView({
  profile,
  portfolioItems: portfolioApiItems,
  credits,
  testimonials,
  awards,
}: MobileViewProps) {
  const [tab, setTab] = useState("Overview");

  const talentData = useMemo(() => mapProfileToTalentData(profile), [profile]);
  const facts = useMemo(() => mapProfileToFact(profile), [profile]);
  const safePortfolioItems = Array.isArray(portfolioApiItems) ? portfolioApiItems : [];
  const portfolioVideos = useMemo(
    () => mapPortfolioToItems(safePortfolioItems.filter((i) => i.type === "video")),
    [safePortfolioItems],
  );
  const portfolioPhotos = useMemo(
    () => mapPortfolioToItems(safePortfolioItems.filter((i) => i.type !== "video")),
    [safePortfolioItems],
  );
  const experience = useMemo(() => mapCreditsToExperience(credits), [credits]);
  const skills = useMemo(() => (profile.skills || []).map((s) => s.name), [profile]);
  const awardsData = useMemo(() => mapAwardsToItems(awards), [awards]);
  const reviews = useMemo(() => mapTestimonialsToReviews(testimonials), [testimonials]);

  return (
    <ProfileProvider profile={profile}>
      <div className="pb-24 lg:hidden">
        <HeroPortrait profile={profile} />

        <div className="space-y-6 px-4 pt-6">
          <ActionButtons />
          <MetricsSection />
          <TabBar items={tabs} active={tab} onChange={setTab} scroll />

          {tab === "Overview" && (
            <>
              <AboutSection talent={talentData} facts={facts} stacked />
              <PortfolioSection videos={portfolioVideos} photos={portfolioPhotos} scroll />
              <ExperienceSection data={experience} />
              <SkillsSection data={skills} />
              <AwardsSection data={awardsData} />
              <ReviewsSection data={reviews} columns={1} />
            </>
          )}
          {tab === "Portfolio" && (
            <PortfolioSection videos={portfolioVideos} photos={portfolioPhotos} scroll />
          )}
          {tab === "Experience" && (
            <>
              <ExperienceSection data={experience} />
              <AwardsSection data={awardsData} />
            </>
          )}
          {tab === "Skills" && (
            <SkillsSection data={skills} />
          )}
          {tab === "Media Kit" && (
            <MediaKitSection profile={profile} />
          )}
          {tab === "Reviews" && (
            <ReviewsSection data={reviews} columns={1} />
          )}
          {tab === "Analytics" && (
            <AnalyticsSection profile={profile} />
          )}
        </div>

        <MobileBottomNav />
      </div>
    </ProfileProvider>
  );
}
