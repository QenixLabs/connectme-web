"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Heart,
  Share2,
  MessageSquare,
  Ellipsis,
  Plug,
} from "lucide-react";
import { recruiterApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import type { RecruiterPublicProfile } from "@/lib/validations/recruiter-profile.schema";
import type { PublicCampaign } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/providers/auth-store-provider";
import { usePopup } from "@/hooks/use-popup";
import { ShareProfileDialog } from "@/components/share-profile-dialog";
import {
  RecruiterHeroCard,
  RecruiterAboutCard,
  ActiveJobsSection,
  RecruiterHighlightsCard,
  RecruiterTeamSection,
  RecruiterReviewsCard,
  SimilarRecruitersSection,
} from "@/components/recruiter-public-profile";

type RecruiterTabId = "overview" | "about" | "jobs" | "team" | "reviews";

const TABS: { id: RecruiterTabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "about", label: "About" },
  { id: "jobs", label: "Jobs" },
  { id: "team", label: "Team" },
  { id: "reviews", label: "Reviews" },
];

export default function PublicRecruiterProfilePage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const { user } = useAuthStore();
  const popup = usePopup();

  const [profile, setProfile] = useState<RecruiterPublicProfile | null>(null);
  const [campaigns, setCampaigns] = useState<PublicCampaign[]>([]);
  const [campaignsTotal, setCampaignsTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<RecruiterTabId>("overview");
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const handleFollow = useCallback(() => {
    popup.show({
      title: "Coming Soon",
      description: "Follow feature coming soon",
      variant: "info",
    });
  }, [popup]);

  const handleMessage = useCallback(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    popup.show({
      title: "Coming Soon",
      description: "Messaging feature coming soon",
      variant: "info",
    });
  }, [user, router, popup]);

  const handleConnect = useCallback(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    popup.show({
      title: "Coming Soon",
      description: "Connect feature coming soon",
      variant: "info",
    });
  }, [user, router, popup]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [profileRes, campaignsRes] = await Promise.all([
          recruiterApi.getPublicProfile(slug),
          recruiterApi.getPublicCampaigns(slug, 6),
        ]);
        if (!cancelled) {
          setProfile(profileRes);
          setCampaigns(campaignsRes.data);
          setCampaignsTotal(campaignsRes.total);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  /* ── Loading state ── */

  if (loading) {
    return (
      <div className="rootin-theme min-h-screen bg-background pb-10">
        <header className="sticky top-0 z-30 bg-background/75 backdrop-blur-xl">
          <div className="flex items-center justify-between px-5 py-3.5">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </header>
        <div className="px-4 pt-5 md:px-6 md:pt-6">
          <Skeleton className="h-[300px] rounded-xl" />
        </div>
        <div className="mt-4 space-y-4 px-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  /* ── Error state ── */

  if (error || !profile) {
    return (
      <div className="rootin-theme min-h-screen bg-background pb-10">
        <header className="sticky top-0 z-30 bg-background/75 backdrop-blur-xl">
          <div className="flex items-center justify-between px-5 py-3.5">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-foreground">
              <ArrowLeft className="h-4 w-4 text-amber" />
              <span className="text-[15px] font-semibold tracking-tight">
                Connect<span className="text-amber">Me</span>
              </span>
            </button>
            <div className="w-9" />
          </div>
        </header>
        <div className="px-4 py-6">
          <Alert variant="destructive">
            <AlertDescription>{error || "Profile not found"}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  /* ── Main render ── */

  const profileUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/recruiter/${profile.slug}`
      : `/recruiter/${profile.slug}`;

  return (
    <div className="rootin-theme min-h-screen bg-background pb-28 md:pb-10">
      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-30 md:hidden">
        <div className="flex items-center justify-between px-5 py-3.5">
          <button
            onClick={() => router.back()}
            className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card shadow-sm"
          >
            <ArrowLeft className="h-5 w-5 text-amber" />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleFollow}
              className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card shadow-sm"
            >
              <Heart className="h-5 w-5 text-amber" />
            </button>
            <ShareProfileDialog
              url={profileUrl}
              name={profile.company_name}
              profilePhoto={profile.profile_photo ?? null}
            >
              <button className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card shadow-sm">
                <Share2 className="h-5 w-5 text-amber" />
              </button>
            </ShareProfileDialog>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-3 pb-10 pt-4 md:px-6 md:pt-6">
        {/* Hero Card */}
        <RecruiterHeroCard
          profile={profile}
          trustScore={profile.trust_score}
          onMessage={handleMessage}
          onFollow={handleFollow}
        />

        {/* Tabs */}
        <div className="mt-6">
          <div className="overflow-x-auto">
            <div className="flex h-12 w-full gap-1 border-b border-border bg-transparent">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`h-12 shrink-0 border-b-2 px-4 text-sm font-medium transition ${
                    tab === t.id
                      ? "border-amber text-amber"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.label}
                  {t.id === "reviews" && (
                    <span className="ml-1 text-xs text-muted-foreground">(124)</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {tab === "overview" && (
              <div className="grid gap-6 lg:grid-cols-3">
                <RecruiterAboutCard profile={profile} />
                <ActiveJobsSection
                  jobs={campaigns.slice(0, 3)}
                  total={campaignsTotal}
                />
                <RecruiterHighlightsCard profile={profile} />
              </div>
            )}

            {tab === "about" && (
              <div className="grid gap-6 lg:grid-cols-1">
                <RecruiterAboutCard profile={profile} />
              </div>
            )}

            {tab === "jobs" && (
              <ActiveJobsSection
                jobs={campaigns}
                total={campaignsTotal}
              />
            )}

            {tab === "team" && (
              <div className="grid gap-6 lg:grid-cols-2">
                <RecruiterTeamSection />
                <RecruiterReviewsCard />
              </div>
            )}

            {tab === "reviews" && (
              <div className="grid gap-6 lg:grid-cols-2">
                <RecruiterReviewsCard />
              </div>
            )}
          </div>
        </div>

        {/* Similar Recruiters */}
        <SimilarRecruitersSection />
      </div>

      {/* Mobile action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur md:hidden">
        <div className="flex items-center gap-2 px-3 py-2">
          <button
            onClick={handleMessage}
            className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
          >
            <MessageSquare className="h-5 w-5" />
            Message
          </button>

          <div className="relative flex-1">
            <button
              onClick={() => setMoreMenuOpen(!moreMenuOpen)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 py-3 text-sm font-medium text-muted-foreground"
            >
              <Ellipsis className="h-5 w-5" />
              More
            </button>
            {moreMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMoreMenuOpen(false)}
                />
                <div className="absolute bottom-full left-0 right-0 z-20 mb-2 rounded-xl border border-border bg-card p-1.5 shadow-lg">
                  <button
                    onClick={() => {
                      setMoreMenuOpen(false);
                      handleConnect();
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-muted"
                  >
                    <Plug className="h-5 w-5" />
                    Connect
                  </button>
                  <button
                    onClick={() => {
                      setMoreMenuOpen(false);
                      handleFollow();
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-muted"
                  >
                    <Heart className="h-5 w-5" />
                    Follow
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
