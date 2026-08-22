"use client";

import type { TalentProfilePreview } from "@/lib/api/talent";
import { HeroSection } from "./HeroSection";
import { GlassCard } from "./primitives";

export function PrivateProfilePreview({
  profile,
  viewerRole = null,
}: {
  profile: TalentProfilePreview;
  viewerRole?: "talent" | "recruiter" | "admin" | null;
}) {
  return (
    <div className="relative min-h-screen bg-bg-page pb-24">
      <HeroSection profile={profile} viewerRole={viewerRole} />

      <main className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
        <GlassCard hover={false}>
          <p className="text-sm font-medium text-foreground/85">Limited preview</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {profile.headline || "Only limited profile details are available."}
          </p>
        </GlassCard>
      </main>
    </div>
  );
}
