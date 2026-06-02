"use client";

import Link from "next/link";
import { Star, AlertCircle, ShieldCheck, Pencil, Globe, FolderKanban, Bookmark } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/providers/auth-store-provider";
import { getGreeting } from "@/lib/greeting";
import { talentApi, Campaign } from "@/lib/api";
import { useRecommendedCampaigns } from "@/lib/api/hooks/useCampaigns";
import type { TalentProfile } from "@/lib/validations/talent-profile.schema";
import { SectionHeader } from "@/components/ui/section-header";
import { StatCard } from "@/components/ui/stat-card";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

function DashboardRecommendations() {
  const { data, isLoading } = useRecommendedCampaigns(5);
  const campaigns: Campaign[] = data || [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        <SectionHeader title="Opportunities for You" subtitle="Matched based on your profile" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div>
        <SectionHeader title="Opportunities for You" subtitle="Matched based on your profile" />
        <p className="text-sm text-text-muted">No recommendations yet. Complete your profile to get matched.</p>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader
        title="Opportunities for You"
        subtitle="Matched based on your profile"
        action={
          <Link
            href="/talent/opportunities"
            className="text-sm text-brand-hover hover:text-brand-active font-medium"
          >
            View all
          </Link>
        }
      />
      <div className="space-y-3">
        {campaigns.map((campaign) => (
          <RecommendationCard key={campaign._id} campaign={campaign} />
        ))}
      </div>
    </div>
  );
}

function RecommendationCard({ campaign }: { campaign: Campaign }) {
  const loc = [campaign.location?.city, campaign.location?.state]
    .filter((s): s is string => !!s && s.trim() !== "")
    .join(", ");

  return (
    <Card
      key={campaign._id}
      className="overflow-hidden hover:shadow-sm transition-shadow rounded-xl"
    >
      {campaign.cover_image_url && (
        <div className="w-full h-32 overflow-hidden">
          <img src={campaign.cover_image_url} alt={campaign.name} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-text-primary truncate">
                {campaign.name}
              </h3>
            </div>
            <p className="text-xs text-text-tertiary mt-1">
              {campaign.industry || "Campaign"}
              {loc ? ` · ${loc}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex gap-2">
            {campaign.role_type && (
              <span className="text-xs text-text-tertiary bg-muted-bg px-2 py-0.5 rounded">
                {campaign.role_type}
              </span>
            )}
            {campaign.budget_range && (
              <span className="text-xs text-text-tertiary bg-muted-bg px-2 py-0.5 rounded">
                {campaign.budget_range.currency || "USD"}{" "}
                {campaign.budget_range.min?.toLocaleString()}
                {campaign.budget_range.max
                  ? ` - ${campaign.budget_range.max.toLocaleString()}`
                  : "+"}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

const MOCK_COACHING = [
  {
    title: "Add 3 work images",
    description: "Profiles with 5+ images get 3x more views from recruiters",
    action: "Update Portfolio",
    urgency: "high" as const,
  },
  {
    title: "Record your intro video",
    description: "Intro videos improve shortlist chances by 40%",
    action: "Record Now",
    urgency: "medium" as const,
  },
  {
    title: "Verify your identity",
    description: "Get the verified badge to unlock messaging from all recruiters",
    action: "Start Verification",
    urgency: "high" as const,
  },
];

const MOCK_STATS = {
  profileViews7d: 128,
  profileViews30d: 456,
  shortlists: 12,
  messages: 3,
};

export default function TalentDashboardPage() {
  const { user } = useAuthStore();
  const firstName = user!.email.split("@")[0];
  const greeting = getGreeting();
  const verificationTier = user!.verification_tier || 1;
  const isVerified = verificationTier >= 2;
  const [profile, setProfile] = useState<TalentProfile | null>(null);

  useEffect(() => {
    talentApi.getMyProfile().then((p) => setProfile(p)).catch(() => {});
  }, []);

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          {greeting}, {firstName}
        </h1>
        <p className="text-sm text-text-tertiary mt-1">
          Here&apos;s what&apos;s happening with your career today
        </p>
      </div>

      {/* Verification Banner */}
      {!isVerified && (
        <div className="bg-brand-light border border-brand-muted rounded-xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-soft flex items-center justify-center flex-shrink-0 mt-0.5">
            <Star className="w-4 h-4 text-brand-hover" strokeWidth={1.2} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-text-secondary">
              Complete your identity verification
            </p>
            <p className="text-xs text-text-tertiary mt-0.5">
              Verified talent get 5x more profile views and direct messages
              from recruiters
            </p>
          </div>
          <Button
            variant="primary"
            className="px-3 py-1.5 h-auto text-xs rounded-lg flex-shrink-0"
          >
            Verify
          </Button>
        </div>
      )}

      {isVerified && (
        <VerifiedBadge label="Identity Verified" />
      )}

      {/* Career Snapshot */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="7d Views" value={MOCK_STATS.profileViews7d} />
        <StatCard label="30d Views" value={MOCK_STATS.profileViews30d} />
        <StatCard label="Shortlists" value={MOCK_STATS.shortlists} />
        <StatCard label="Messages" value={MOCK_STATS.messages} />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/talent/profile"
          className="flex items-center justify-center gap-2 h-11 rounded-xl bg-surface-dark text-on-surface-dark text-sm font-medium hover:bg-surface-darker active:scale-[0.98] transition-all"
        >
          <Pencil className="w-4 h-4" strokeWidth={1.5} />
          Edit Profile
        </Link>
        <Link
          href={profile?.username ? `/talent/${profile.username}` : "#"}
          className="flex items-center justify-center gap-2 h-11 rounded-xl border border-border text-text-secondary text-sm font-medium hover:bg-page active:scale-[0.98] transition-all"
        >
          <Globe className="w-4 h-4" strokeWidth={1.2} />
          View Public Profile
        </Link>
        <Link
          href="/talent/applications"
          className="flex items-center justify-center gap-2 h-11 rounded-xl border border-border text-text-secondary text-sm font-medium hover:bg-page active:scale-[0.98] transition-all"
        >
          <FolderKanban className="w-4 h-4" strokeWidth={1.5} />
          My Applications
        </Link>
        <Link
          href="/talent/opportunities?tab=saved"
          className="flex items-center justify-center gap-2 h-11 rounded-xl border border-border text-text-secondary text-sm font-medium hover:bg-page active:scale-[0.98] transition-all"
        >
          <Bookmark className="w-4 h-4" strokeWidth={1.5} />
          Saved
        </Link>
      </div>

      {/* Opportunities */}
      <DashboardRecommendations />

      {/* Next Best Actions */}
      <div>
        <SectionHeader title="Recommended Next Steps" />
        <div className="space-y-3">
          {MOCK_COACHING.map((item, i) => (
            <Card
              key={i}
              className="p-4 flex items-start gap-3 rounded-xl"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  item.urgency === "high"
                    ? "bg-brand-light"
                    : "bg-page"
                }`}
              >
                <AlertCircle
                  className={`w-4 h-4 ${
                    item.urgency === "high"
                      ? "text-brand"
                      : "text-text-tertiary"
                  }`}
                  strokeWidth={1.5}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-text-secondary">
                  {item.title}
                </p>
                <p className="text-xs text-text-tertiary mt-0.5">
                  {item.description}
                </p>
              </div>
              <Button
                variant="dark"
                className="px-3 py-1.5 h-auto text-xs rounded-lg flex-shrink-0"
              >
                {item.action}
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Safety Note */}
      <div className="bg-surface-dark rounded-xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-surface-darker flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="w-4 h-4 text-brand-focus" strokeWidth={1.2} />
        </div>
        <div>
          <p className="text-sm font-medium text-on-surface-dark">
            Only verified recruiters can contact you
          </p>
          <p className="text-xs text-text-muted mt-0.5">
            We verify every recruiter before they can message or shortlist
            talent. If you receive suspicious messages, report them
            immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
