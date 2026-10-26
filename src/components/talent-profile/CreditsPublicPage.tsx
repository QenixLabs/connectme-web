"use client";

import Link from "next/link";
import { ArrowLeft, Clapperboard, Loader2 } from "lucide-react";
import { useAuthStore } from "@/providers/auth-store-provider";
import { usePublicTalentProfile, useTalentCredits } from "@/hooks/use-talent-profile";
import { isPrivateTalentProfileResponse } from "@/lib/api/talent";
import { PrivateProfilePreview } from "./PrivateProfilePreview";
import { CreditsSection } from "./sections/CreditsSection";
import { toExperienceItems } from "./data";

export function CreditsPublicPage({ username }: { username: string }) {
  const profileQuery = usePublicTalentProfile(username);
  const creditsQuery = useTalentCredits(username);
  const authUser = useAuthStore((state) => state.user);
  const viewerRole =
    (authUser?.role as "talent" | "recruiter" | "admin" | null) ?? null;

  if (profileQuery.isLoading || creditsQuery.isLoading) {
    return (
      <main className="mx-auto flex min-h-[60svh] max-w-3xl items-center justify-center px-4">
        <Loader2 className="size-6 animate-spin text-brand" aria-label="Loading credits" />
      </main>
    );
  }

  const profile = profileQuery.data;
  if (!profile || profileQuery.error) {
    return (
      <main className="flex min-h-[60svh] items-center justify-center px-4 text-center">
        <div>
          <h1 className="text-xl font-bold text-foreground">Profile not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This talent profile is not available right now.
          </p>
        </div>
      </main>
    );
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

  const credits = Array.isArray(creditsQuery.data)
    ? toExperienceItems(creditsQuery.data)
    : [];

  return (
    <main className="min-h-screen bg-background px-4 py-5 text-foreground sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-3xl space-y-5">
        <Link
          href={`/talent/${encodeURIComponent(profile.username)}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand/80"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to profile
        </Link>
        <header className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-blue-50 text-[#2563eb]">
            <Clapperboard aria-hidden="true" className="size-5" />
          </span>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-foreground">Credits</h1>
            <p className="break-words text-sm text-muted-foreground">
              {profile.username}&apos;s project history
            </p>
          </div>
        </header>
        {creditsQuery.error ? (
          <section
            role="alert"
            className="rounded-2xl border border-destructive/20 bg-card p-5 text-sm"
          >
            <p className="font-semibold text-foreground">Credits couldn&apos;t be loaded.</p>
            <button
              type="button"
              onClick={() => void creditsQuery.refetch()}
              className="mt-2 font-semibold text-brand hover:underline"
            >
              Try again
            </button>
          </section>
        ) : (
          <CreditsSection
            data={credits}
            showAllInitially
            showViewAll={false}
          />
        )}
      </div>
    </main>
  );
}
