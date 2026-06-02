"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { useAuthStore } from "@/providers/auth-store-provider";
import { getGreeting } from "@/lib/greeting";
import {
  useRecruiterDashboardStats,
  useRecruiterProfile,
  useRecommendedTalent,
} from "@/lib/api";
import { StatCard } from "@/components/ui/stat-card";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TalentGridCard } from "@/components/talent-grid-card";

export default function RecruiterDashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const greeting = getGreeting();

  const { data: profile } = useRecruiterProfile();
  const { data: stats, isLoading: statsLoading } = useRecruiterDashboardStats();
  const { data: recommendations, isLoading: recommendationsLoading } =
    useRecommendedTalent(4);

  const companyName = profile?.company_name || user?.email.split("@")[0] || "Recruiter";
  const showVerified = profile?.verification_status !== "pending";

  return (
    <div className="px-4 pt-2.5 pb-6 space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          {greeting}, {companyName}
        </h1>
        {showVerified && (
          <div className="mt-2">
            <VerifiedBadge label="Verified Recruiter" />
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {statsLoading ? (
          <>
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </>
        ) : (
          <>
            <StatCard
              label="Active Projects"
              value={stats?.active_campaigns ?? 0}
              align="left"
            />
            <StatCard
              label="Shortlisted Talent"
              value={0}
              align="left"
            />
            <StatCard
              label="Messages"
              value={0}
              align="left"
            />
          </>
        )}
      </div>

      {/* Recommended Talent */}
      <div>
        <h2 className="text-lg font-bold text-text-primary">
          Recommended Talent for You
        </h2>
        <p className="text-sm text-text-muted mt-0.5">
          Only verified talent shown
        </p>

        {recommendationsLoading ? (
          <div className="grid grid-cols-2 gap-3 mt-4">
            <Skeleton className="h-72 rounded-2xl" />
            <Skeleton className="h-72 rounded-2xl" />
          </div>
        ) : recommendations && recommendations.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 mt-4">
            {recommendations.map((talent) => (
              <TalentGridCard
                key={talent._id}
                profile={{
                  ...talent,
                  is_verified: true,
                  access_status: "allowed",
                }}
                onViewProfile={() => router.push(`/talent/${talent.username}`)}
              />
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center mt-4">
            <p className="text-sm text-text-secondary">
              No recommended talent yet
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
