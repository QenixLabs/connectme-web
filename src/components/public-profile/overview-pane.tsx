"use client";

import { useState } from "react";
import {
  ChevronDown,
  User,
  Ruler,
  Languages,
  Palette,
  Eye,
  CheckCircle2,
  Play,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type {
  TalentProfile,
  PortfolioItem,
} from "@/lib/validations/talent-profile.schema";
import type {
  Credit,
  Award,
  Testimonial,
} from "@/lib/validations/credit-testimonial.schema";
import { ExperienceSection } from "./experience-section";
import { AwardsSection } from "./awards-section";
import { ReviewsSection } from "./reviews-section";
import { StatsBand } from "./stats-band";

interface OverviewPaneProps {
  profile: TalentProfile;
  portfolioItems: PortfolioItem[];
  credits: Credit[];
  awards: Award[];
  reviews: Testimonial[];
  onPortfolioItemClick?: (item: PortfolioItem) => void;
}

function InfoPill({
  icon,
  label,
  value,
  valueClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-2">
      <span className="text-muted-foreground">{icon}</span>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
        <div
          className={`truncate text-sm font-semibold ${valueClass ?? ""}`}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function computeAge(dob: string | undefined): string {
  if (!dob) return "\u2014";
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return "\u2014";
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return `${age} Years`;
}

export function OverviewPane({
  profile,
  portfolioItems,
  credits,
  awards,
  reviews,
  onPortfolioItemClick,
}: OverviewPaneProps) {
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const aboutText = profile.about || "No bio added yet.";
  const pa = profile.physical_attributes;
  const languages = profile.languages ?? [];
  const skills = profile.skills ?? [];
  const isAvailable = profile.availability === "available";

  const age = computeAge(profile.date_of_birth);

  const height =
    pa?.height_cm != null
      ? `${pa.height_cm} cm`
      : "\u2014";

  const langStr =
    languages.length > 0
      ? languages
          .slice(0, 3)
          .map((l) => l.name)
          .join(", ")
      : "\u2014";

  const hairStr =
    [pa?.hair_color, pa?.hair_length].filter(Boolean).join(", ") || "\u2014";

  const pinnedPortfolio = portfolioItems.filter((i) => i.is_pinned);
  const portfolioPreview =
    pinnedPortfolio.length > 0
      ? pinnedPortfolio.slice(0, 4)
      : portfolioItems.slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left column */}
        <div className="space-y-6">
          {/* About + Info Pills */}
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

              {/* Info pills grid */}
              <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-3">
                <InfoPill
                  icon={<User className="h-4 w-4" />}
                  label="Age"
                  value={age}
                />
                <InfoPill
                  icon={<Ruler className="h-4 w-4" />}
                  label="Height"
                  value={height}
                />
                <InfoPill
                  icon={<Languages className="h-4 w-4" />}
                  label="Languages"
                  value={langStr}
                />
                <InfoPill
                  icon={<Palette className="h-4 w-4" />}
                  label="Hair Color"
                  value={pa?.hair_color || "\u2014"}
                />
                <InfoPill
                  icon={<User className="h-4 w-4" />}
                  label="Skin Tone"
                  value={pa?.complexion || "\u2014"}
                />
                <InfoPill
                  icon={<Eye className="h-4 w-4" />}
                  label="Eye Color"
                  value={pa?.eye_color || "\u2014"}
                />
                <InfoPill
                  icon={
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  }
                  label="Availability"
                  value={
                    isAvailable ? "Available" : profile.availability || "\u2014"
                  }
                  valueClass={isAvailable ? "text-success" : ""}
                />
              </div>
            </CardContent>
          </Card>

          {/* Portfolio Highlights */}
          {portfolioPreview.length > 0 && (
            <Card className="border-border shadow-card">
              <CardContent className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-foreground">
                    Portfolio Highlights
                  </h2>
                  <button className="text-sm font-semibold text-amber hover:underline">
                    View All &rsaquo;
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {portfolioPreview.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="group text-left focus:outline-none"
                      onClick={() => onPortfolioItemClick?.(item)}
                    >
                      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
                        <img
                          src={item.thumbnail_url || item.url}
                          alt={item.caption || item.title || ""}
                          loading="lazy"
                          className="h-full w-full object-cover transition group-hover:scale-105"
                        />
                        {(item.type === "video" ||
                          item.type === "youtube") && (
                          <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background/90 text-primary">
                              <Play className="h-4 w-4 fill-current" />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="mt-2 truncate text-sm font-medium">
                        {item.caption || item.title || "Untitled"}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Experience preview */}
          {credits.length > 0 && (
            <ExperienceSection credits={credits} preview />
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Skills chips */}
          {skills.length > 0 && (
            <Card className="border-border shadow-card">
              <CardContent className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-foreground">
                    Skills
                  </h2>
                  {skills.length > 6 && (
                    <button className="text-sm font-semibold text-amber hover:underline">
                      View All &rsaquo;
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.slice(0, 6).map((s) => (
                    <span
                      key={s.name}
                      className="rounded-full bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary"
                    >
                      {s.name}
                    </span>
                  ))}
                  {skills.length > 6 && (
                    <span className="rounded-full px-3 py-1.5 text-xs font-semibold text-amber">
                      + {skills.length - 6} more
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <AwardsSection awards={awards} />
        </div>
      </div>

      {/* Reviews (full width below columns) */}
      {reviews.length > 0 && <ReviewsSection reviews={reviews} />}

      {/* Stats band */}
      <StatsBand
        projectsCompleted={profile.analytics?.projects_completed ?? 0}
        happyClients={profile.analytics?.happy_clients ?? 0}
        yearsExperience={profile.analytics?.years_of_experience ?? 0}
        profileViews30d={profile.analytics?.profile_views_30d ?? 0}
        shortlistCount={profile.analytics?.shortlist_count ?? 0}
      />
    </div>
  );
}
