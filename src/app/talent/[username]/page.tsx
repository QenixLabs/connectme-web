"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  PrivateProfilePreview,
  TalentProfileView,
} from "@/components/talent-profile";
import { isPrivateTalentProfileResponse } from "@/lib/api/talent";
import { useAuthStore } from "@/providers/auth-store-provider";
import { campaignsApi } from "@/lib/api/campaigns";
import {
  usePublicTalentProfile,
  useTalentPortfolio,
  useTalentCredits,
  useTalentTestimonials,
  useTalentAwards,
} from "@/hooks/use-talent-profile";

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-bg-page">
      <div className="h-[58vh] animate-pulse bg-muted md:h-[62vh]" />
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="relative -mt-8 rounded-2xl border border-border bg-bg-surface p-5 shadow-[var(--surface-shadow)] sm:p-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-2xl bg-muted"
              />
            ))}
          </div>
          <div className="mt-6 h-12 animate-pulse rounded-2xl bg-muted" />
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="h-48 animate-pulse rounded-2xl bg-muted" />
            <div className="h-48 animate-pulse rounded-2xl bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileNotFound({ username }: { username: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-page px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Profile not found</h1>
        <p className="mt-2 text-muted-foreground">
          The talent profile{" "}
          <span className="font-medium text-foreground">@{username}</span> doesn&apos;t exist.
        </p>
      </div>
    </div>
  );
}

export default function PublicTalentProfilePage() {
  const params = useParams();
  const username = (params?.username as string) || "";

  const { data: profile, isLoading: profileLoading, error: profileError } =
    usePublicTalentProfile(username);
  const { data: portfolioRaw, isLoading: portfolioLoading } =
    useTalentPortfolio(username);
  const { data: creditsRaw, isLoading: creditsLoading } = useTalentCredits(username);
  const { data: testimonialsRaw, isLoading: testimonialsLoading } =
    useTalentTestimonials(username);
  const { data: awardsRaw, isLoading: awardsLoading } = useTalentAwards(username);

  const portfolioItems = Array.isArray(portfolioRaw) ? portfolioRaw : [];
  const credits = Array.isArray(creditsRaw) ? creditsRaw : [];
  const testimonials = Array.isArray(testimonialsRaw) ? testimonialsRaw : [];
  const awards = Array.isArray(awardsRaw) ? awardsRaw : [];

  const user = useAuthStore((s) => s.user);
  const viewerRole = user?.role ?? null;

  const { data: campaignsData, isLoading: campaignsLoading } = useQuery({
    queryKey: ["recruiter-campaigns-for-shortlist", viewerRole],
    queryFn: () =>
      campaignsApi.getRecruiterCampaigns({ status: "active", limit: 100 }),
    enabled: viewerRole === "recruiter" || viewerRole === "admin",
  });

  const campaigns = campaignsData?.data ?? [];

  const isLoading =
    profileLoading ||
    portfolioLoading ||
    creditsLoading ||
    testimonialsLoading ||
    awardsLoading;

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (profileError || !profile) {
    return <ProfileNotFound username={username} />;
  }

  if (isPrivateTalentProfileResponse(profile)) {
    return (
      <PrivateProfilePreview
        profile={{
          ...profile.preview,
          is_verified: profile.is_verified ?? profile.preview.is_verified,
        }}
      />
    );
  }

  if (!profile.username) {
    return <ProfileNotFound username={username} />;
  }

  return (
    <TalentProfileView
      profile={profile}
      portfolioItems={portfolioItems}
      credits={credits}
      testimonials={testimonials}
      awards={awards}
      viewerRole={viewerRole}
      campaigns={campaigns}
      campaignsLoading={campaignsLoading}
    />
  );
}
