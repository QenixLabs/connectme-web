"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Bell, UserRound, Loader2 } from "lucide-react";
import {
  useCampaign,
  useCampaignApplications,
  useCampaignAnalytics,
  useCampaignDemographics,
  useCampaignInvites,
  useCampaignTeam,
  useCampaignSubmissions,
} from "@/hooks/use-campaigns";
import { useUnreadNotifications } from "@/hooks/use-unread-counts";
import { CampaignHeader } from "@/components/campaign-detail/campaign-header";
import { CampaignTabBar } from "@/components/campaign-detail/campaign-tab-bar";
import {
  ApplicationsChart,
  StatusBreakdownCard,
  GenderDistributionCard,
} from "@/components/campaign-detail/analytics-charts";
import { InvitesSection } from "@/components/campaign-detail/invites-section";

export default function RecruiterCampaignDetailPage() {
  const params = useParams<{ id: string }>();
  const campaignId = params.id;

  const { data: campaign, isLoading: campaignLoading } = useCampaign(campaignId);
  const { data: appData, isLoading: appsLoading } =
    useCampaignApplications(campaignId);
  const { data: analytics, isLoading: analyticsLoading } =
    useCampaignAnalytics(campaignId);
  const { data: demographics, isLoading: demographicsLoading } =
    useCampaignDemographics(campaignId);
  const { data: invites, isLoading: invitesLoading } =
    useCampaignInvites(campaignId);
  const { data: teamData, isLoading: teamLoading } =
    useCampaignTeam(campaignId);
  const { data: subsData, isLoading: subsLoading } =
    useCampaignSubmissions(campaignId);
  const { data: unreadData } = useUnreadNotifications();

  const unreadCount = unreadData?.count ?? 0;

  const tabs = [
    { label: "Applicants", count: appData?.total ?? 0, href: "/applications" },
    { label: "Invites", count: invites?.length ?? 0 },
    { label: "Team", count: teamData?.members?.length ?? 0 },
    { label: "Recommended", count: null },
    { label: "Analytics", count: null },
    {
      label: "Submissions",
      count: subsData?.total ?? 0,
    },
  ];

  const isLoading = campaignLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold">Campaign not found</p>
          <Link
            href="/recruiter/campaigns"
            className="mt-2 text-sm text-primary hover:underline"
          >
            Back to Campaigns
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-4 lg:px-6 lg:py-5">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/recruiter/campaigns"
            className="flex items-center gap-2 text-sm font-semibold text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Campaigns
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/recruiter/notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-full bg-card text-muted-foreground"
            >
              <Bell className="h-[18px] w-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
            <Link
              href="/recruiter/profile"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-card text-muted-foreground"
            >
              <UserRound className="h-[18px] w-[18px]" />
            </Link>
          </div>
        </div>

        {/* Campaign Header */}
        <div className="mt-4">
          <CampaignHeader campaign={campaign} />
        </div>

        {/* Tab Bar */}
        <div className="mt-4">
          <CampaignTabBar
            tabs={tabs}
            activeTab="Analytics"
            campaignId={campaignId}
          />
        </div>

        {/* Analytics Charts */}
        <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_300px_300px]">
          <ApplicationsChart
            analytics={analytics}
            isLoading={analyticsLoading}
          />
          <StatusBreakdownCard
            analytics={analytics}
            isLoading={analyticsLoading || appsLoading}
          />
          <GenderDistributionCard
            demographics={demographics}
            isLoading={demographicsLoading}
          />
        </div>

        {/* Invites Section */}
        <div className="mt-4">
          <InvitesSection
            invites={invites}
            isLoading={invitesLoading}
          />
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-2 pt-1 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <span>All times are shown in IST (UTC +5:30)</span>
          <span>
            Data last updated:{" "}
            {campaign.updated_at
              ? new Date(campaign.updated_at).toLocaleString("en-IN", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })
              : "—"}
          </span>
        </div>
      </main>
    </div>
  );
}
