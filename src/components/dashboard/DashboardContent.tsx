"use client";

import { useAuthStore } from "@/providers/auth-store-provider";
import {
  useTalentProfile,
  useTalentCompleteness,
  useTalentSubscription,
  useTalentUsage,
  useCampaignRecommendations,
  useMyApplications,
  useDashboardNotifications,
  useUnreadMessages,
  useMyPortfolio,
  usePortfolioStats,
  useMyCredits,
  useMyTestimonials,
} from "@/hooks/use-talent-dashboard";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { WelcomeHero } from "./WelcomeHero";
import { StatsGrid } from "./StatsGrid";
import { QuickActions } from "./QuickActions";
import { ProfileStrength } from "./ProfileStrength";
import { PlanUsageCard } from "./PlanUsageCard";
import { ActivityFeed } from "./ActivityFeed";
import { Opportunities } from "./Opportunities";
import { PortfolioPreview } from "./PortfolioPreview";
import { CreditsTeaser } from "./CreditsTeaser";

function calculateCompleteness(missingFields: string[] | undefined): number {
  if (!missingFields) return 0;
  return Math.round(((30 - missingFields.length) / 30) * 100);
}

export function DashboardContent() {
  const user = useAuthStore((s) => s.user);

  const { data: profile, isPending: loadingProfile } = useTalentProfile();
  const { data: completenessData, isPending: loadingCompleteness } =
    useTalentCompleteness();
  const { data: subscription, isPending: loadingSubscription } =
    useTalentSubscription();
  const { data: usage, isPending: loadingUsage } = useTalentUsage();
  const { data: recommendations, isPending: loadingRecommendations } =
    useCampaignRecommendations();
  const { data: applications, isPending: loadingApplications } =
    useMyApplications();
  const { data: notifications, isPending: loadingNotifications } =
    useDashboardNotifications();
  const { data: unreadData, isPending: loadingUnread } = useUnreadMessages();
  const { data: portfolio, isPending: loadingPortfolio } = useMyPortfolio();
  const { data: portfolioStats, isPending: loadingPortfolioStats } =
    usePortfolioStats();
  const { data: credits, isPending: loadingCredits } = useMyCredits();
  const { data: testimonials, isPending: loadingTestimonials } =
    useMyTestimonials();

  const isLoading =
    loadingProfile ||
    loadingCompleteness ||
    loadingSubscription ||
    loadingUsage ||
    loadingRecommendations ||
    loadingApplications ||
    loadingNotifications ||
    loadingUnread ||
    loadingPortfolio ||
    loadingPortfolioStats ||
    loadingCredits ||
    loadingTestimonials;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const completeness = calculateCompleteness(completenessData?.missingFields);
  const unreadCount = unreadData?.count ?? 0;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 overflow-x-hidden px-0 py-4 sm:py-6 lg:space-y-8">
      <WelcomeHero profile={profile} user={user} />
      <StatsGrid
        profile={profile}
        unreadCount={unreadCount}
        applications={applications}
      />
      <QuickActions unreadCount={unreadCount} />

      <div className="grid max-w-full gap-5 lg:grid-cols-[minmax(0,0.38fr)_minmax(0,0.62fr)] lg:gap-6">
        <div className="min-w-0 space-y-5 lg:space-y-6">
          <ProfileStrength profile={profile} completeness={completeness} />
          <PlanUsageCard subscription={subscription} usage={usage} />
          <ActivityFeed notifications={notifications} />
        </div>
        <div className="min-w-0 space-y-5 lg:space-y-6">
          <Opportunities campaigns={recommendations} />
          <PortfolioPreview items={portfolio} stats={portfolioStats} />
          <CreditsTeaser credits={credits} testimonials={testimonials} />
        </div>
      </div>
    </div>
  );
}
