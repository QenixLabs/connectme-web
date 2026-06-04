"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Share2, User, Scan, Award, Link as LinkIcon } from "lucide-react";
import { talentApi, messagesApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import type { TalentProfile } from "@/lib/validations/talent-profile.schema";
import type { PortfolioItem } from "@/lib/validations/talent-profile.schema";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/providers/auth-store-provider";
import { useTierGuard } from "@/hooks/use-tier-guard";
import { usePopup } from "@/hooks/use-popup";
import { useSectionVisibility } from "@/hooks/use-section-visibility";
import { useCreateCollaborationRequest } from "@/lib/api/hooks/useCreateCollaborationRequest";
import { ShortlistOrInviteModal } from "@/components/shortlist-or-invite-modal";
import { ShareProfileDialog } from "@/components/share-profile-dialog";
import { HeroCard } from "@/components/public-profile/hero-card";
import { ActionBar } from "@/components/public-profile/action-bar";
import { SegmentedTabs, type TabId } from "@/components/public-profile/segmented-tabs";
import { OverviewPane } from "@/components/public-profile/overview-pane";
import { LooksPane } from "@/components/public-profile/looks-pane";
import { SkillsPane } from "@/components/public-profile/skills-pane";
import { LinksPane } from "@/components/public-profile/links-pane";

/* ------------------------------------------------------------------ */
/*  Main Page                                                         */
/* ------------------------------------------------------------------ */

export default function PublicTalentProfilePage() {
  const router = useRouter();
  const params = useParams();
  const rawUsername = params.username as string;
  const username = rawUsername.startsWith("@") ? rawUsername.slice(1) : rawUsername;
  const { user } = useAuthStore();
  const isRecruiter = user?.role === "recruiter";

  const [profile, setProfile] = useState<TalentProfile | null>(null);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shortlistModalOpen, setShortlistModalOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [tab, setTab] = useState<TabId>("overview");

  const { guard } = useTierGuard(3);
  const createRequest = useCreateCollaborationRequest();
  const popup = usePopup();

  const handleConnect = useCallback(() => {
    const talentId = profile?.user_id;
    if (!talentId || !isRecruiter) return;

    guard(() => {
      if (profile?.privacy_mode === "private") {
        const name = profile?.full_legal_name || profile?.username || "Talent";
        createRequest.mutate({ receiverId: talentId }, {
          onSuccess: () => {
            popup.show({
              title: "Request sent",
              description: `Collaboration request sent to ${name}. You can message once they accept.`,
              variant: "success",
            });
          },
          onError: (err: unknown) => {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "";
            if (msg.toLowerCase().includes("already accepted")) {
              messagesApi
                .startDirectConversation(talentId)
                .then(({ conversation }) => {
                  router.push(`/recruiter/messages?conversationId=${conversation._id}`);
                })
                .catch((err2) => {
                  popup.show({
                    title: "Could not open messages",
                    description: getApiErrorMessage(err2, "Something went wrong"),
                    variant: "error",
                  });
                });
            } else if (msg.toLowerCase().includes("already pending")) {
              popup.show({
                title: "Request pending",
                description: "You already have a pending request with this talent.",
                variant: "info",
              });
            } else {
              popup.show({
                title: "Failed to send request",
                description: getApiErrorMessage(err, "Something went wrong"),
                variant: "error",
              });
            }
          },
        });
        return;
      }

      setIsConnecting(true);
      messagesApi
        .startDirectConversation(talentId)
        .then(({ conversation }) => {
          const draft = "Hi, I came across your profile and would love to connect regarding a potential opportunity. Looking forward to hearing from you!";
          router.push(`/recruiter/messages?conversationId=${conversation._id}&draft=${encodeURIComponent(draft)}`);
        })
        .catch((err) => {
          popup.show({
            title: "Could not start conversation",
            description: getApiErrorMessage(err, "Something went wrong"),
            variant: "error",
          });
        })
        .finally(() => setIsConnecting(false));
    });
  }, [profile, isRecruiter, guard, createRequest, popup, router]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const profileRes = await talentApi.getPublicProfile(username);
        if ((profileRes as any).private) {
          if (!cancelled) {
            setProfile((profileRes as any).preview ?? null);
            setIsPrivate(true);
            setLoading(false);
          }
          return;
        }

        if (!cancelled) setIsPrivate(false);

        const [portfolioRes] = await Promise.all([
          talentApi.getPublicPortfolio(username),
        ]);

        if (!cancelled) {
          setProfile(profileRes as TalentProfile);
          if (portfolioRes && !(portfolioRes as any).private) {
            setPortfolioItems((portfolioRes as any).items || []);
          }
        }
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [username]);

  const activeProfile = profile;
  const { tabVisibility, cardVisibility, heroVisibility } = useSectionVisibility(activeProfile);

  const visibleTabs = useMemo(
    () =>
      [
        { id: "overview" as TabId, label: "Overview", icon: User },
        { id: "looks" as TabId, label: "Looks", icon: Scan },
        { id: "skills" as TabId, label: "Skills", icon: Award },
        { id: "links" as TabId, label: "Links", icon: LinkIcon },
      ].filter((t) => tabVisibility[t.id]),
    [tabVisibility]
  );

  useEffect(() => {
    if (visibleTabs.length > 0 && !visibleTabs.some((t) => t.id === tab)) {
      setTab(visibleTabs[0].id);
    }
  }, [visibleTabs, tab]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background font-sans pb-10">
        {/* Top bar skeleton */}
        <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/75 border-b border-border/60">
          <div className="flex items-center justify-between px-5 py-3.5">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </header>
        <div className="px-4 pt-5">
          <Skeleton className="h-[300px] rounded-[28px]" />
        </div>
        <div className="px-4 mt-2">
          <Skeleton className="h-12 rounded-2xl" />
        </div>
        <div className="px-4 mt-4 space-y-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background font-sans pb-10">
        <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/75 border-b border-border/60">
          <div className="flex items-center justify-between px-5 py-3.5">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-ink">
              <ArrowLeft className="h-4 w-4 text-gold" />
              <span className="font-serif text-[15px] font-semibold tracking-tight">
                Connect<span className="text-gold">Me</span>
              </span>
            </button>
            <div className="w-9" />
          </div>
        </header>
        <div className="px-4 py-6">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans pb-10">
      {/* Top bar */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/75 border-b border-border/60">
        <div className="flex items-center justify-between px-5 py-3.5">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-ink">
            <ArrowLeft className="h-4 w-4 text-gold" />
            <span className="font-serif text-[15px] font-semibold tracking-tight">
              Connect<span className="text-gold">Me</span>
            </span>
          </button>
          <ShareProfileDialog
            username={username}
            profilePhoto={profile?.profile_photo}
            name={profile?.full_legal_name}
          >
            <button className="h-9 w-9 rounded-full border border-border bg-card grid place-items-center shadow-sm">
              <Share2 className="h-4 w-4 text-gold" />
            </button>
          </ShareProfileDialog>
        </div>
      </header>

      {activeProfile && (
        <>
          <HeroCard
            profile={activeProfile}
            showLocation={heroVisibility.location}
            showAvailability={heroVisibility.availability}
          />
          <ActionBar
            username={username}
            onConnect={handleConnect}
            onBookmark={() => setShortlistModalOpen(true)}
            isConnecting={isConnecting}
            connectDisabled={!isRecruiter}
          />
          {isPrivate ? (
            <div className="px-4 mt-6 text-center">
              <button
                onClick={handleConnect}
                disabled={isConnecting || !isRecruiter}
                className="inline-flex items-center justify-center rounded-xl bg-gold px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-gold/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConnecting ? "Sending..." : "Send a connect request to view full profile"}
              </button>
              {!isRecruiter && (
                <p className="mt-2 text-xs text-ink-muted">Only recruiters can send connection requests.</p>
              )}
            </div>
          ) : (
            <>
              {visibleTabs.length > 0 && (
                <SegmentedTabs tabs={visibleTabs} value={tab} onChange={setTab} />
              )}

              <main className="px-4 mt-4 space-y-4">
                {tab === "overview" && (
                  <OverviewPane profile={activeProfile} showAbout={cardVisibility.bio} />
                )}
                {tab === "looks" && (
                  <LooksPane
                    profile={activeProfile}
                    showPhysical={cardVisibility.physical_attributes}
                    showLanguages={cardVisibility.languages}
                  />
                )}
                {tab === "skills" && (
                  <SkillsPane profile={activeProfile} showSkills={cardVisibility.skills} />
                )}
                {tab === "links" && (
                  <LinksPane
                    profile={activeProfile}
                    showSocial={cardVisibility.social_links}
                    showDocuments={cardVisibility.documents}
                  />
                )}
              </main>
            </>
          )}
        </>
      )}

      <ShortlistOrInviteModal
        open={shortlistModalOpen}
        onClose={() => setShortlistModalOpen(false)}
        talentUserId={activeProfile?.user_id || ""}
        talentName={(activeProfile?.full_legal_name || username).split(" ")[0]}
      />
    </div>
  );
}
