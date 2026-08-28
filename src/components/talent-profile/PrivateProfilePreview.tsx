"use client";

import type { TalentProfilePreview } from "@/lib/api/talent";
import { HeroSection } from "./HeroSection";
import { GlassCard } from "./primitives";
import { BottomBar } from "@/components/shared/bottom-bar";
import { AuthBottomBar } from "@/components/shared/AuthBottomBar";
import { recruiterNavItems } from "@/components/shared/nav-config";
import { useTalentNavItems } from "@/hooks/use-talent-nav-items";

export function PrivateProfilePreview({
  profile,
  viewerRole = null,
}: {
  profile: TalentProfilePreview;
  viewerRole?: "talent" | "recruiter" | "admin" | null;
}) {
  const talentNavItems = useTalentNavItems();
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

      {viewerRole === "talent" && <BottomBar navItems={talentNavItems} iconOnly />}
      {viewerRole === "recruiter" && <BottomBar navItems={recruiterNavItems} iconOnly />}
      {!viewerRole && <AuthBottomBar />}
    </div>
  );
}
