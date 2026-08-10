"use client";

import { useParams } from "next/navigation";
import { DesktopView } from "@/components/rootin/DesktopView";
import { MobileView } from "@/components/rootin/MobileView";
import {
  usePublicTalentProfile,
  useTalentPortfolio,
  useTalentCredits,
  useTalentTestimonials,
  useTalentAwards,
} from "@/hooks/use-talent-profile";

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="hidden lg:block">
        <div className="ml-[220px] p-6 pt-3">
          <div className="h-[420px] animate-pulse rounded-3xl bg-muted" />
          <div className="mt-5 h-10 w-96 animate-pulse rounded-xl bg-muted" />
          <div className="mt-5 grid grid-cols-3 gap-6">
            <div className="col-span-2 h-64 animate-pulse rounded-2xl bg-muted" />
            <div className="row-span-2 h-96 animate-pulse rounded-2xl bg-muted" />
            <div className="col-span-2 h-64 animate-pulse rounded-2xl bg-muted" />
          </div>
        </div>
      </div>
      <div className="space-y-6 px-4 pb-24 pt-6 lg:hidden">
        <div className="h-[52vh] animate-pulse rounded-3xl bg-muted" />
        <div className="h-48 animate-pulse rounded-2xl bg-muted" />
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    </div>
  );
}

function ProfileNotFound({ username }: { username: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Profile not found</h1>
        <p className="mt-2 text-muted-foreground">
          The talent profile <span className="font-medium text-foreground">@{username}</span> doesn&apos;t exist.
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  const params = useParams();
  const username = (params?.username as string) || "";

  const { data: profile, isLoading: profileLoading, error: profileError } = usePublicTalentProfile(username);
  const { data: portfolioItems = [], isLoading: portfolioLoading } = useTalentPortfolio(username);
  const { data: credits = [], isLoading: creditsLoading } = useTalentCredits(username);
  const { data: testimonials = [], isLoading: testimonialsLoading } = useTalentTestimonials(username);
  const { data: awards = [], isLoading: awardsLoading } = useTalentAwards(username);

  const isLoading = profileLoading || portfolioLoading || creditsLoading || testimonialsLoading || awardsLoading;

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (profileError || !profile) {
    return <ProfileNotFound username={username} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <DesktopView
        profile={profile}
        portfolioItems={portfolioItems}
        credits={credits}
        testimonials={testimonials}
        awards={awards}
      />
      <MobileView
        profile={profile}
        portfolioItems={portfolioItems}
        credits={credits}
        testimonials={testimonials}
        awards={awards}
      />
    </div>
  );
}
