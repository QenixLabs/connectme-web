"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Share2,
  Heart,
  Plug,
  MessageSquare,
  Bookmark,
  MonitorPlay,
} from "lucide-react";
import { talentApi, messagesApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import type { TalentProfile, PortfolioItem } from "@/lib/validations/talent-profile.schema";
import type { MediaKitData } from "@/types/media-kit";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/providers/auth-store-provider";
import { useTierGuard } from "@/hooks/use-tier-guard";
import { usePopup } from "@/hooks/use-popup";
import { isFeatureForbidden } from "@/hooks/use-feature-guard";
import { FeatureGateAlert } from "@/components/feature-gate-alert";
import { useSectionVisibility } from "@/hooks/use-section-visibility";
import { useCreateCollaborationRequest } from "@/lib/api/hooks/useCreateCollaborationRequest";
import { ShortlistOrInviteModal } from "@/components/shortlist-or-invite-modal";
import { ShareProfileDialog } from "@/components/share-profile-dialog";
import { TalentGridCard } from "@/components/talent-grid-card";
import { HeroCard } from "@/components/public-profile/hero-card";
import { FirstMessageDialog } from "@/components/public-profile/first-message-dialog";
import { ConnectDialog } from "@/components/public-profile/connect-dialog";
import { TabNavigation, type TabId } from "@/components/public-profile/tab-navigation";
import { OverviewPane } from "@/components/public-profile/overview-pane";
import { SkillsPane } from "@/components/public-profile/skills-pane";
import { PortfolioSection } from "@/components/public-profile/portfolio-section";
import { PortfolioLightbox } from "@/components/portfolio/portfolio-lightbox";
import { MediaKitStats } from "@/components/public-profile/media-kit-stats";
import { ExperienceSection } from "@/components/public-profile/experience-section";
import { ReviewsSection } from "@/components/public-profile/reviews-section";
import { AwardsSection } from "@/components/public-profile/awards-section";
import { StatsBand } from "@/components/public-profile/stats-band";
import { MediaKitPane } from "@/components/public-profile/media-kit-pane";
import { AboutPane } from "@/components/public-profile/about-pane";
import {
  MOCK_CREDITS,
  MOCK_AWARDS,
  MOCK_REVIEWS,
  getMockStats,
} from "@/lib/mocks/public-profile";

export default function PublicTalentProfilePage() {
  const router = useRouter();
  const params = useParams();
  const rawUsername = params.username as string;
  const username = rawUsername.startsWith("@") ? rawUsername.slice(1) : rawUsername;
  const { user, fetchUser, hasHydrated } = useAuthStore();
  const isRecruiter = user?.role === "recruiter";

  const [profile, setProfile] = useState<TalentProfile | null>(null);
  const [mediaKit, setMediaKit] = useState<MediaKitData | null>(null);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [featureError, setFeatureError] = useState<{ feature: string; plan?: string } | null>(null);
  const [shortlistModalOpen, setShortlistModalOpen] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [tab, setTab] = useState<TabId>("overview");
  const [lightboxItem, setLightboxItem] = useState<PortfolioItem | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [similarTalents, setSimilarTalents] = useState<
    Array<{
      username?: string;
      full_legal_name?: string;
      profile_photo?: string;
      location?: Record<string, string>;
      professions?: string[];
      is_verified?: boolean;
    }>
  >([]);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [firstMessageOpen, setFirstMessageOpen] = useState(false);
  const [isSendingFirstMessage, setIsSendingFirstMessage] = useState(false);
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [isSendingConnectRequest, setIsSendingConnectRequest] = useState(false);

  const { guard } = useTierGuard(3);
  const createRequest = useCreateCollaborationRequest();
  const popup = usePopup();

  const hasFetchedUser = useRef(false);
  useEffect(() => {
    if (hasHydrated && user && !hasFetchedUser.current) {
      hasFetchedUser.current = true;
      fetchUser();
    }
  }, [hasHydrated, user, fetchUser]);

  const handleConnect = useCallback(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    if (!profile?.user_id) return;
    guard(() => {
      setConnectDialogOpen(true);
    });
  }, [user, router, profile?.user_id, guard]);

  const handleLike = useCallback(() => {
    popup.show({
      title: "Coming Soon",
      description: "Like feature coming soon",
      variant: "info",
    });
  }, [popup]);

  const handleSendMessage = useCallback(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    if (!profile?.user_id) return;
    setFirstMessageOpen(true);
  }, [user, router, profile?.user_id]);

  const handleSendFirstMessage = useCallback(
    async (content: string) => {
      const talentId = profile?.user_id;
      if (!talentId) return;
      setIsSendingFirstMessage(true);
      try {
        const clientMessageId = `first-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        await messagesApi.sendFirstMessage(talentId, content, clientMessageId);
        setFirstMessageOpen(false);
        popup.show({
          title: "Message sent",
          description: "Your message has been sent. They'll need to reply before you can send another.",
          variant: "success",
        });
      } catch (err: unknown) {
        if ((err as { response?: { status?: number } })?.response?.status === 409) {
          try {
            const { conversation } = await messagesApi.startDirectConversation(talentId);
            setFirstMessageOpen(false);
            const base = user?.role === "recruiter" ? "/recruiter/messages" : "/talent/messages";
            router.push(`${base}/${conversation._id}`);
            return;
          } catch {
            /* fall through */
          }
        }
        popup.show({
          title: "Failed to send message",
          description: getApiErrorMessage(err, "Something went wrong"),
          variant: "error",
        });
      } finally {
        setIsSendingFirstMessage(false);
      }
    },
    [profile, popup, user, router],
  );

  const handleConnectRequest = useCallback(
    async (reason: "collaboration" | "mentorship" | "referral") => {
      const talentId = profile?.user_id;
      if (!talentId) return;
      setIsSendingConnectRequest(true);
      createRequest.mutate(
        { receiverId: talentId, reason },
        {
          onSuccess: (data) => {
            setConnectDialogOpen(false);
            if (data.wasAccepted && data.conversationId) {
              const base =
                user?.role === "recruiter" ? "/recruiter/messages" : "/talent/messages";
              router.push(`${base}/${data.conversationId}`);
            } else {
              popup.show({
                title: "Request sent",
                description: `Connection request sent to ${profile?.full_legal_name || profile?.username || "this talent"}.`,
                variant: "success",
              });
            }
          },
          onError: (err: unknown) => {
            popup.show({
              title: "Failed to send request",
              description: getApiErrorMessage(err, "Something went wrong"),
              variant: "error",
            });
          },
          onSettled: () => {
            setIsSendingConnectRequest(false);
          },
        },
      );
    },
    [profile, popup, createRequest, router, user],
  );

  /* ── Data loading ── */

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const profileRes = await talentApi.getPublicProfile(username);
        if ((profileRes as Record<string, unknown>).private) {
          if (!cancelled) {
            setProfile((profileRes as { preview?: TalentProfile }).preview ?? null);
            setIsPrivate(true);
            setLoading(false);
          }
          return;
        }
        if (!cancelled) setIsPrivate(false);

        const [portfolioRes, mediaKitRes] = await Promise.all([
          talentApi.getPublicPortfolio(username),
          talentApi.getMediaKit(username).catch(() => null),
        ]);

        if (!cancelled) {
          setProfile(profileRes as TalentProfile);
          if (portfolioRes && !(portfolioRes as Record<string, unknown>).private) {
            setPortfolioItems((portfolioRes as { items: PortfolioItem[] }).items || []);
          }
          if (mediaKitRes && !(mediaKitRes as { private?: boolean }).private) {
            setMediaKit(mediaKitRes as MediaKitData);
          }
        }
      } catch (err) {
        const denied = isFeatureForbidden(err);
        if (denied) {
          if (!cancelled) setFeatureError(denied);
        } else if (!cancelled) {
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
  }, [username]);

  useEffect(() => {
    if (!profile || isPrivate) return;
    const profession = profile.professions?.[0];
    if (!profession) return;
    let cancelled = false;
    setSimilarLoading(true);
    talentApi
      .getAllTalent({ profession, limit: 4 })
      .then((res) => {
        if (!cancelled) {
          setSimilarTalents((res.data ?? []).filter((t) => t.username !== username));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setSimilarLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [profile, isPrivate, username]);

  useEffect(() => {
    if (!profile) return;
    const hasInstagramLink = !!profile.social_links?.instagram?.url;
    const hasYoutubeLink = !!profile.social_links?.youtube?.url;
    if (!hasInstagramLink && !hasYoutubeLink) return;
    const statsPresent =
      (!hasInstagramLink || mediaKit?.instagramFollowers != null) &&
      (!hasYoutubeLink || mediaKit?.youtubeSubscribers != null);
    if (statsPresent) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      if (controller.signal.aborted) return;
      try {
        const refreshed = await talentApi.getMediaKit(username);
        if (!controller.signal.aborted && refreshed && !(refreshed as { private?: boolean }).private) {
          setMediaKit(refreshed as MediaKitData);
        }
      } catch {
        /* silently ignore poll failures */
      }
    }, 10000);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [username, profile, mediaKit]);

  /* ── Derived data ── */

  const activeProfile = profile;
  const { tabVisibility } = useSectionVisibility(activeProfile);

  const trustScore = activeProfile?.trust_score ?? 0;
  const responseRate = 95;

  const mockStats = useMemo(
    () => getMockStats(activeProfile?.analytics),
    [activeProfile?.analytics],
  );

  const instagramUrl = activeProfile?.social_links?.instagram?.url;
  const youtubeUrl = activeProfile?.social_links?.youtube?.url;
  const hasInstagramLink = !!instagramUrl;
  const hasYoutubeLink = !!youtubeUrl;

  const visibleTabs = useMemo(() => {
    const tabs: { id: TabId; label: string }[] = [];
    tabs.push({ id: "overview", label: "Overview" });
    if (tabVisibility.portfolio && portfolioItems.length > 0)
      tabs.push({ id: "portfolio", label: "Portfolio" });
    tabs.push({ id: "experience", label: "Experience" });
    if (tabVisibility.skills) tabs.push({ id: "skills", label: "Skills" });
    if (tabVisibility["media-kit"])
      tabs.push({ id: "media-kit", label: "Media Kit" });
    tabs.push({ id: "reviews", label: "Reviews" });
    tabs.push({ id: "about", label: "About" });
    return tabs;
  }, [tabVisibility, portfolioItems.length]);

  useEffect(() => {
    if (visibleTabs.length > 0 && !visibleTabs.some((t) => t.id === tab)) {
      setTab(visibleTabs[0].id);
    }
  }, [visibleTabs, tab]);

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

  if (error || featureError) {
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
          {featureError ? (
            <FeatureGateAlert {...featureError} />
          ) : (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    );
  }

  /* ── Main render ── */

  return (
    <div className="rootin-theme min-h-screen bg-background pb-28 md:pb-10">
      {/* Top bar */}
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
              onClick={handleLike}
              className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card shadow-sm"
            >
              <Heart className="h-5 w-5 text-amber" />
            </button>
            <ShareProfileDialog
              username={username}
              profilePhoto={profile?.profile_photo}
              name={profile?.full_legal_name}
            >
              <button className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card shadow-sm">
                <Share2 className="h-5 w-5 text-amber" />
              </button>
            </ShareProfileDialog>
          </div>
        </div>
      </header>

      {activeProfile && (
        <>
          <HeroCard
            profile={activeProfile}
            username={username}
            trustScore={trustScore}
            responseRate={responseRate}
            onMessage={handleSendMessage}
            onShortlist={() => setShortlistModalOpen(true)}
            onLike={handleLike}
          />

          {!isPrivate && (
            <>
              {/* Media Kit Stats */}
              <MediaKitStats
                instagramFollowers={mediaKit?.instagramFollowers}
                youtubeSubscribers={mediaKit?.youtubeSubscribers}
                youtubeViews={mediaKit?.youtubeViews}
                monthlyViews={activeProfile.analytics?.profile_views_30d ?? 0}
                hasInstagramLink={hasInstagramLink}
                hasYoutubeLink={hasYoutubeLink}
                instagramUrl={instagramUrl}
                youtubeUrl={youtubeUrl}
                instagramLoading={hasInstagramLink && mediaKit?.instagramFollowers == null}
                youtubeLoading={hasYoutubeLink && mediaKit?.youtubeSubscribers == null}
              />

              {/* Tabs */}
              {visibleTabs.length > 1 && (
                <TabNavigation
                  value={tab}
                  onChange={setTab}
                />
              )}

              {/* Tab content */}
              <main className="px-4 mt-4 md:px-6 md:mt-6">
                {tab === "overview" && (
                  <OverviewPane
                    profile={activeProfile}
                    portfolioItems={portfolioItems.filter((i) => i.is_pinned)}
                    credits={MOCK_CREDITS}
                    awards={MOCK_AWARDS}
                    reviews={MOCK_REVIEWS}
                    stats={mockStats}
                    onPortfolioItemClick={(item) => {
                      setLightboxItem(item);
                      setLightboxOpen(true);
                    }}
                  />
                )}

                {tab === "portfolio" && (
                  <PortfolioSection
                    items={portfolioItems}
                    showStats
                    showCategoryFilter
                    onItemClick={(item) => {
                      setLightboxItem(item);
                      setLightboxOpen(true);
                    }}
                  />
                )}

                {tab === "experience" && (
                  <ExperienceSection credits={MOCK_CREDITS} />
                )}

                {tab === "skills" && (
                  <div className="space-y-4">
                    <SkillsPane profile={activeProfile} showSkills />
                    <AwardsSection awards={MOCK_AWARDS} />
                  </div>
                )}

                {tab === "media-kit" && (
                  <MediaKitPane profile={activeProfile} mediaKit={mediaKit} />
                )}

                {tab === "reviews" && (
                  <ReviewsSection reviews={MOCK_REVIEWS} />
                )}

                {tab === "about" && (
                  <AboutPane about={activeProfile?.about} />
                )}
              </main>

              {/* Similar Talents */}
              {(() => {
                if (similarLoading) {
                  return (
                    <section className="px-4 mt-6">
                      <Skeleton className="mb-3 h-4 w-28 rounded-full" />
                      <div className="grid grid-cols-2 gap-3">
                        {[0, 1, 2, 3].map((i) => (
                          <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
                        ))}
                      </div>
                    </section>
                  );
                }
                if (similarTalents.length > 0) {
                  return (
                    <section className="px-4 mt-6 md:px-6">
                      <p className="mb-3 text-[13px] font-semibold text-foreground">
                        Similar Talent
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {similarTalents.map((talent) => (
                          <TalentGridCard
                            key={talent.username}
                            profile={talent}
                            onViewProfile={() =>
                              router.push("/talent/" + talent.username)
                            }
                          />
                        ))}
                      </div>
                    </section>
                  );
                }
                return null;
              })()}
            </>
          )}

          {isPrivate && (
            <div className="mt-6 px-4 text-center">
              <button
                onClick={handleConnect}
                disabled={isSendingConnectRequest}
                className="inline-flex items-center justify-center rounded-xl bg-amber px-6 py-3 text-sm font-medium text-amber-foreground shadow-sm transition hover:bg-amber/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSendingConnectRequest
                  ? "Sending..."
                  : "Send a connect request to view full profile"}
              </button>
            </div>
          )}
        </>
      )}

      {/* Mobile action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
          <button
            onClick={handleConnect}
            className="flex flex-1 flex-col items-center gap-1.5 rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <Plug className="h-6 w-6" />
            Connect
          </button>
          <button
            onClick={handleSendMessage}
            className="flex flex-1 flex-col items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-3 text-sm font-medium text-primary"
          >
            <MessageSquare className="h-6 w-6 text-primary" />
            Message
          </button>
          <button
            onClick={() => router.push(`/talent/${username}/portfolio`)}
            className="flex flex-1 flex-col items-center gap-1.5 rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <MonitorPlay className="h-6 w-6" />
            Media Kit
          </button>
          {isRecruiter && (
            <button
              onClick={() => setShortlistModalOpen(true)}
              className="flex flex-1 flex-col items-center gap-1.5 rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <Bookmark className="h-6 w-6" />
              Shortlist
            </button>
          )}
        </div>
      </div>

      {/* Modals */}
      <ShortlistOrInviteModal
        open={shortlistModalOpen}
        onClose={() => setShortlistModalOpen(false)}
        talentUserId={activeProfile?.user_id || ""}
        talentName={(activeProfile?.full_legal_name || username).split(" ")[0]}
      />
      <PortfolioLightbox
        item={lightboxItem}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
      />
      <FirstMessageDialog
        open={firstMessageOpen}
        onOpenChange={setFirstMessageOpen}
        recipientName={profile?.full_legal_name || profile?.username || "this talent"}
        onSend={handleSendFirstMessage}
        isSending={isSendingFirstMessage}
      />
      <ConnectDialog
        open={connectDialogOpen}
        onOpenChange={setConnectDialogOpen}
        recipientName={profile?.full_legal_name || profile?.username || "this talent"}
        onConnect={handleConnectRequest}
        isSending={isSendingConnectRequest}
      />
    </div>
  );
}
