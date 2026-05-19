"use client";

import Link from "next/link";
import { Plus, Search, FolderOpen, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/providers/auth-store-provider";
import { getGreeting } from "@/lib/greeting";
import { useRecruiterDashboardStats, useCampaigns } from "@/lib/api";
import { SectionHeader } from "@/components/ui/section-header";
import { StatCard } from "@/components/ui/stat-card";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function RecruiterDashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const firstName = user!.email.split("@")[0];
  const greeting = getGreeting();

  const { data: stats, isLoading: statsLoading } = useRecruiterDashboardStats();
  const { data: campaignsData, isLoading: campaignsLoading } = useCampaigns({ status: "active", limit: 5 });
  const activeCampaigns = campaignsData?.pages.flatMap((p) => p.data) ?? [];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          {greeting}, {firstName}
        </h1>
        <div className="mt-2">
          <VerifiedBadge label="Verified Recruiter" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statsLoading ? (
          <>
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </>
        ) : (
          <>
            <StatCard
              label="Active Campaigns"
              value={stats?.active_campaigns ?? 0}
              align="left"
            />
            <StatCard
              label="Apps This Week"
              value={stats?.total_applications_this_week ?? 0}
              align="left"
            />
            <StatCard
              label="Response Rate"
              value={`${Math.round((stats?.response_rate ?? 0) * 100)}%`}
              align="left"
            />
            <StatCard
              label="Pending Reviews"
              value={stats?.pending_reviews ?? 0}
              align="left"
            />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/recruiter/campaigns/new"
          className="flex items-center justify-center gap-2 h-11 rounded-xl bg-surface-dark text-on-surface-dark text-sm font-medium hover:bg-surface-darker active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" strokeWidth={1.5} />
          Post Campaign
        </Link>
        <Link
          href="/recruiter/find-talent"
          className="flex items-center justify-center gap-2 h-11 rounded-xl border border-border text-text-secondary text-sm font-medium hover:bg-page active:scale-[0.98] transition-all"
        >
          <Search className="w-4 h-4" strokeWidth={1.2} />
          Search Talent
        </Link>
      </div>

      {/* Active Campaigns */}
      <div>
        <SectionHeader
          title="Active Campaigns"
          action={
            <Link
              href="/recruiter/campaigns"
              className="text-xs font-medium text-brand hover:text-brand-hover"
            >
              View all
            </Link>
          }
        />

        {campaignsLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-20 rounded-2xl" />
          </div>
        ) : activeCampaigns.length === 0 ? (
          <Card className="p-6 text-center">
            <AlertCircle className="w-8 h-8 text-text-muted mx-auto mb-2" strokeWidth={1.5} />
            <p className="text-sm text-text-secondary">No active campaigns</p>
            <Link
              href="/recruiter/campaigns/new"
              className="mt-2 inline-block text-xs font-medium text-brand hover:text-brand-hover"
            >
              Create your first campaign
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {activeCampaigns.map((campaign) => (
              <Card
                key={campaign._id}
                className="p-4 cursor-pointer hover:shadow-sm transition-shadow"
                onClick={() => router.push(`/recruiter/campaigns/${campaign._id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-text-primary truncate">
                      {campaign.name}
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      {campaign.applications_count} applicant
                      {campaign.applications_count !== 1 ? "s" : ""}
                      {campaign.deadline
                        ? ` · Due ${new Date(campaign.deadline).toLocaleDateString()}`
                        : ""}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-2xs shrink-0">
                    {campaign.visibility === "invite_only" ? "Invite Only" : "Public"}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
