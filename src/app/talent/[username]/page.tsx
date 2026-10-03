"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  PrivateProfilePreview,
  TalentProfileView,
} from "@/components/talent-profile";
import {
  isPrivateTalentProfileResponse,
  type Achievement,
  type Award,
} from "@/lib/api/talent";
import { useAuthStore } from "@/providers/auth-store-provider";
import { campaignsApi } from "@/lib/api/campaigns";
import {
  usePublicTalentProfile,
  useTalentPortfolio,
  useTalentCredits,
  useTalentTestimonials,
  useTalentAchievements,
} from "@/hooks/use-talent-profile";

function toProfileAwards(achievements: Achievement[]): Award[] {
  return achievements
    .filter((achievement) => achievement.type === "award")
    .map((achievement) => ({
      _id: achievement._id,
      user_id: achievement.user_id,
      type: "award",
      title: achievement.title ?? achievement.project_name ?? "Untitled award",
      awarding_body: achievement.awarding_body ?? achievement.organization ?? "",
      year: achievement.year,
      description: achievement.description,
      media_url: achievement.media_url,
      order: achievement.order,
      created_at: achievement.created_at,
    }));
}

function ProfileSkeleton() {
  return (
      <div className="public-talent-profile min-h-screen bg-background text-foreground">
      <div className="h-[44vh] min-h-[300px] animate-pulse bg-muted md:h-[50vh]" />
      <div className="mx-auto max-w-5xl space-y-4 px-4 pt-4 sm:px-6">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-2xl bg-muted"
            />
          ))}
        </div>
        <div className="h-12 animate-pulse rounded-xl bg-muted" />
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-xl bg-muted"
            />
          ))}
        </div>
        <div className="h-48 animate-pulse rounded-2xl bg-muted" />
      </div>
    </div>
  );
}

function ProfileNotFound({ username }: { username: string }) {
  return (
    <div className="public-talent-profile flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
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
  const { data: achievementsRaw, isLoading: achievementsLoading } =
    useTalentAchievements(username);

  const portfolioItems = Array.isArray(portfolioRaw) ? portfolioRaw : [];
  const credits = Array.isArray(creditsRaw) ? creditsRaw : [];
  const testimonials = Array.isArray(testimonialsRaw) ? testimonialsRaw : [];
  const awards = toProfileAwards(
    Array.isArray(achievementsRaw) ? (achievementsRaw as Achievement[]) : [],
  );

  const user = useAuthStore((s) => s.user);
  const viewerRole = user?.role ?? null;

  const { data: campaignsData } = useQuery({
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
    achievementsLoading;

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
        viewerRole={viewerRole}
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
    />
  );
}
