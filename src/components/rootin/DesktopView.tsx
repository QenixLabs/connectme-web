"use client";

import { useState, useMemo } from "react";
import { Sidebar } from "@/components/navigation/Sidebar";
import { Topbar } from "@/components/navigation/Topbar";
import {
  AboutSection,
  DetailsSection,
  AwardsSection,
  ExperienceSection,
  PortfolioSection,
  ReviewsSection,
  SkillsSection,
  MediaKitSection,
  AnalyticsSection,
} from "./sections";
import { TabBar } from "./sections";
import { TalentProfileHeader } from "./TalentProfileHeader";
import type { TalentProfile, PortfolioApiResponse, Credit, Testimonial, Award } from "@/lib/api/talent";
import type { TalentData, Fact, PortfolioItem, ExperienceItem, AwardItem, ReviewItem } from "./sections/types";

const desktopTabs = ["Overview", "Details", "Portfolio", "Experience", "Skills", "Media Kit", "Reviews", "Analytics"];

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

interface DesktopViewProps {
  profile: TalentProfile;
  portfolioItems: PortfolioApiResponse[];
  credits: Credit[];
  testimonials: Testimonial[];
  awards: Award[];
}

export function DesktopView({
  profile,
  portfolioItems: portfolioApiItems,
  credits,
  testimonials,
  awards,
}: DesktopViewProps) {
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
    <div className="hidden lg:block">
      <Sidebar />

      <div className="ml-[220px]">
        <Topbar />

        <main className="p-6 pt-3">
          <TalentProfileHeader profile={profile} />
          <div className="mt-5">
            <TabBar items={desktopTabs} active={tab} onChange={setTab} />
          </div>
          <div className="mt-5">
            {tab === "Overview" && (
              <div className="grid grid-cols-3 gap-6">
                <AboutSection talent={talentData} className="col-span-2" />
                <div className="row-span-2 flex flex-col gap-6">
                  <ExperienceSection data={experience} />
                  <AwardsSection data={awardsData} />
                </div>
                <PortfolioSection videos={portfolioVideos} photos={portfolioPhotos} className="col-span-2" />
                <SkillsSection data={skills} className="col-span-3" />
                <ReviewsSection data={reviews} columns={1} className="col-span-3" />
              </div>
            )}
            {tab === "Details" && (
              <DetailsSection facts={facts} />
            )}
            {tab === "Portfolio" && (
              <PortfolioSection videos={portfolioVideos} photos={portfolioPhotos} />
            )}
            {tab === "Experience" && (
              <div className="grid grid-cols-3 gap-6">
                <ExperienceSection data={experience} className="col-span-2" />
                <AwardsSection data={awardsData} />
              </div>
            )}
            {tab === "Skills" && (
              <SkillsSection data={skills} />
            )}
            {tab === "Media Kit" && (
              <MediaKitSection profile={profile} />
            )}
            {tab === "Reviews" && (
              <ReviewsSection data={reviews} columns={2} />
            )}
            {tab === "Analytics" && (
              <AnalyticsSection profile={profile} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
