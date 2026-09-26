"use client";

import { useMemo, useState } from "react";
import { Bookmark, Loader2, MessageCircle, ShieldCheck, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PrivateProfilePreview } from "@/components/talent-profile";
import { useAuthStore } from "@/providers/auth-store-provider";
import { useConnectionRequest, useSaveTalent, useStartConversation } from "@/hooks/use-talent-actions";
import { usePublicTalentProfile, useTalentAchievements } from "@/hooks/use-talent-profile";
import {
  isPrivateTalentProfileResponse,
  type PrivateTalentProfileResponse,
  type TalentProfile,
} from "@/lib/api/talent";
import { AchievementFilters } from "./AchievementFilters";
import { AchievementHero } from "./AchievementHero";
import { AchievementSection } from "./AchievementSection";
import { AchievementStats } from "./AchievementStats";
import { isVerifiedAchievement, PUBLIC_ACHIEVEMENT_TYPES, type AchievementFilter } from "./achievement-types";

function PublicPageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-4 px-3 py-4 sm:px-6 sm:py-6">
      <div className="h-[254px] animate-pulse rounded-[30px] bg-[#eeecf8]" />
      <div className="h-24 animate-pulse rounded-[24px] bg-[#eeecf8]" />
      <div className="h-12 animate-pulse rounded-[22px] bg-[#eeecf8]" />
      <div className="h-40 animate-pulse rounded-[24px] bg-[#eeecf8]" />
      <div className="h-40 animate-pulse rounded-[24px] bg-[#eeecf8]" />
    </div>
  );
}

function RecruiterActions({ profile }: { profile: TalentProfile }) {
  const viewerRole = useAuthStore((state) => state.user?.role ?? null);
  const { start: startConversation, isPending: messagePending } = useStartConversation(profile.username, viewerRole);
  const { status: inviteStatus, isPending: invitePending, send: sendInvite } = useConnectionRequest(profile.user_id);
  const { isSaved, isPending: savePending, toggleSave } = useSaveTalent(profile.username);

  return (
    <Card className="rounded-[24px] border-[#e9e6f7] bg-white/95 shadow-[0_10px_28px_rgba(75,61,157,0.08)]">
      <CardContent className="grid grid-cols-3 gap-2 p-2.5">
        <Button
          type="button"
          variant="ghost"
          onClick={startConversation}
          disabled={messagePending}
          className="flex min-h-12 items-center justify-center gap-1.5 rounded-[16px] bg-gradient-to-r from-[#4d20ed] via-[#7732ed] to-[#c936ed] px-2 text-[11px] font-extrabold text-white shadow-[0_7px_18px_rgba(111,45,226,0.24)] transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-60"
        >
          {messagePending ? <Loader2 className="size-4 animate-spin" /> : <MessageCircle className="size-4" />}
          Message
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={sendInvite}
          disabled={invitePending || inviteStatus !== "none"}
          className="flex min-h-12 items-center justify-center gap-1.5 rounded-[16px] bg-[#f2f2fb] px-2 text-[11px] font-extrabold text-[#4f32c8] transition-colors hover:bg-[#e9e7fa] active:scale-[0.98] disabled:opacity-60"
        >
          {invitePending ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
          {inviteStatus === "pending" ? "Invited" : inviteStatus === "connected" ? "Connected" : "Invite"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={toggleSave}
          disabled={savePending}
          className="flex min-h-12 items-center justify-center gap-1.5 rounded-[16px] bg-[#f2f2fb] px-2 text-[11px] font-extrabold text-[#4f32c8] transition-colors hover:bg-[#e9e7fa] active:scale-[0.98] disabled:opacity-60"
        >
          {savePending ? <Loader2 className="size-4 animate-spin" /> : <Bookmark className={isSaved ? "size-4 fill-[#6840df]" : "size-4"} />}
          {isSaved ? "Saved" : "Save"}
        </Button>
      </CardContent>
    </Card>
  );
}

function PrivateAchievements({ profile, viewerRole }: { profile: PrivateTalentProfileResponse; viewerRole: "talent" | "recruiter" | "admin" | null }) {
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

export function AchievementPublicPage({ username }: { username: string }) {
  const profileQuery = usePublicTalentProfile(username);
  const achievementsQuery = useTalentAchievements(username);
  const viewerRole = useAuthStore((state) => state.user?.role ?? null);
  const authUser = useAuthStore((state) => state.user);
  const profile = profileQuery.data;
  const achievements = Array.isArray(achievementsQuery.data) ? achievementsQuery.data : [];
  const [activeFilter, setActiveFilter] = usePublicFilter();

  const grouped = useMemo(
    () =>
      PUBLIC_ACHIEVEMENT_TYPES.reduce<Record<string, typeof achievements>>((result, type) => {
        result[type] = achievements.filter((achievement) => achievement.type === type);
        return result;
      }, {}),
    [achievements],
  );
  const filteredGrouped = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(grouped).map(([type, items]) => [
          type,
          activeFilter === "all" || activeFilter === type ? items : [],
        ]),
      ) as Record<string, typeof achievements>,
    [activeFilter, grouped],
  );
  const filteredAchievements =
    activeFilter === "credit"
      ? achievements.filter((achievement) => achievement.type === "credit")
      : Object.values(filteredGrouped).flat();
  const verifiedCount = achievements.filter(isVerifiedAchievement).length;
  const isOwner = Boolean(authUser?.username && profile && "username" in profile && profile.username === authUser.username);
  const hasCreditSection = achievements.some((achievement) => achievement.type === "credit");

  if (profileQuery.isLoading || achievementsQuery.isLoading) return <PublicPageSkeleton />;
  if (!profile || profileQuery.error) {
    return (
      <div className="flex min-h-[70svh] items-center justify-center px-5 text-center">
        <div>
          <h1 className="text-xl font-extrabold text-[#14225b]">Profile not found</h1>
          <p className="mt-2 text-sm text-[#8588a6]">This talent profile is not available right now.</p>
        </div>
      </div>
    );
  }
  if (isPrivateTalentProfileResponse(profile)) {
    return <PrivateAchievements profile={profile} viewerRole={viewerRole} />;
  }

  const publicProfile = profile as TalentProfile;
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy link");
    }
  };
  const share = () => {
    if (navigator.share) {
      navigator.share({ title: `${publicProfile.username}'s achievements`, url: window.location.href }).catch(() => undefined);
    } else {
      copyLink();
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#faf9ff_0%,#f7f8ff_44%,#ffffff_100%)] pb-8">
      <div className="mx-auto w-full max-w-[1100px] space-y-4 px-3 py-4 sm:space-y-5 sm:px-6 sm:py-6 lg:px-8">
        <AchievementHero
          mode="public"
          title="Awards & Training"
          subtitle="Milestones that shape the journey."
          previewHref={`/talent/${publicProfile.username}`}
          onShare={share}
          onCopyLink={copyLink}
        />

        {!isOwner && <RecruiterActions profile={publicProfile} />}

        <AchievementStats achievements={achievements} />

        <AchievementFilters value={activeFilter} onChange={setActiveFilter} showCredits={hasCreditSection} />

        {verifiedCount > 0 && (
          <Card className="rounded-[22px] border-[#d9cef9] bg-[linear-gradient(105deg,#f8f4ff,#ffffff)] shadow-[0_8px_22px_rgba(111,76,207,0.07)]">
            <CardContent className="flex items-center gap-3 p-3.5 sm:p-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-[15px] bg-[#e8ddff] text-[#6840df]"><ShieldCheck className="size-6" /></span>
              <div className="min-w-0">
                <h2 className="text-xs font-extrabold text-[#252267]">Verified achievements available</h2>
                <p className="mt-1 text-[10px] leading-relaxed text-[#746cb0]">Awards, certifications and institutional details have been verified.</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-5">
          {PUBLIC_ACHIEVEMENT_TYPES.map((type) => (
            <AchievementSection key={type} type={type} achievements={filteredGrouped[type] ?? []} />
          ))}
          {hasCreditSection && activeFilter === "credit" && (
            <AchievementSection type="credit" achievements={achievements.filter((achievement) => achievement.type === "credit")} />
          )}
        </div>

        {filteredAchievements.length === 0 && (
          <Card className="rounded-[24px] border-dashed border-[#dcd6f2] bg-white/70">
            <CardContent className="p-8 text-center">
              <p className="text-sm font-bold text-[#14225b]">No achievements in this category yet.</p>
              <p className="mt-1 text-[11px] text-[#8588a6]">Try another category to explore this profile.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function usePublicFilter(): [AchievementFilter, (value: AchievementFilter) => void] {
  const [value, setValue] = useState("all" as AchievementFilter);
  return [value, setValue];
}
