"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  BookmarkPlus,
  Download,
  Check,
  Play,
  ChevronRight,
  Share2,
} from "lucide-react";
import { talentApi, messagesApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import type { TalentProfile } from "@/lib/validations/talent-profile.schema";
import type { PortfolioItem } from "@/lib/validations/talent-profile.schema";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/providers/auth-store-provider";
import { useTierGuard } from "@/hooks/use-tier-guard";
import { usePopup } from "@/hooks/use-popup";
import { useCreateCollaborationRequest } from "@/lib/api/hooks/useCreateCollaborationRequest";
import { ShortlistOrInviteModal } from "@/components/shortlist-or-invite-modal";
import { ShareProfileDialog } from "@/components/share-profile-dialog";

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function getProfileHighlights(profile: TalentProfile): string[] {
  const reasons: string[] = [];
  if (profile.professions?.length) {
    reasons.push(`Professions: ${profile.professions.slice(0, 2).join(", ")}`);
  }
  if (profile.languages?.length) {
    reasons.push(`Fluent in ${profile.languages.map((l) => l.name).filter(Boolean).slice(0, 2).join(" and ")}`);
  }
  if (profile.location?.city) {
    reasons.push(`Based in ${profile.location.city}`);
  }
  if (profile.availability === "available") {
    reasons.push("Currently available for new opportunities");
  }
  if (profile.skills?.length) {
    reasons.push(`Strong ${profile.skills[0].name?.toLowerCase()} skills`);
  }
  return reasons.length ? reasons.slice(0, 3) : [
    "Complete profile to unlock matching insights",
  ];
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                    */
/* ------------------------------------------------------------------ */

function GoldShieldBadge({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="#D4A017"
      width="20"
      height="20"
      className={cn("inline-block shrink-0", className)}
    >
      <path d="M12 2l1.9 2.1 2.8-.5.7 2.8 2.6 1.1-.6 2.8 1.8 2.2-1.8 2.2.6 2.8-2.6 1.1-.7 2.8-2.8-.5L12 22l-1.9-2.1-2.8.5-.7-2.8-2.6-1.1.6-2.8-1.8-2.2 1.8-2.2-.6-2.8 2.6-1.1.7-2.8 2.8.5z" />
      <path d="M9.5 15.5l-3.5-3.5 1.4-1.4 2.1 2.1 5.6-5.6 1.4 1.4z" fill="#ffffff" />
    </svg>
  );
}

function ProfileHighlights({ profile }: { profile: TalentProfile }) {
  const reasons = useMemo(() => getProfileHighlights(profile), [profile]);

  return (
    <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-text-primary">
          Profile highlights
        </h3>
      </div>
      <div className="h-px bg-border" />
      <ul className="space-y-2.5">
        {reasons.map((r, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <Check className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" strokeWidth={2.5} />
            <span className="text-[13px] text-text-secondary leading-snug">{r}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PortfolioSection({
  items,
  username,
}: {
  items: PortfolioItem[];
  username: string;
}) {
  const router = useRouter();

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      if (a.is_pinned === b.is_pinned) return 0;
      return a.is_pinned ? -1 : 1;
    });
  }, [items]);

  if (sorted.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-text-primary">Portfolio</h3>
        <button
          onClick={() => router.push(`/talent/${username}/portfolio`)}
          className="flex items-center gap-0.5 text-[13px] text-text-muted hover:text-text-primary transition-colors"
        >
          View All
          <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {sorted.map((item) => (
          <div
            key={item.id}
            className="group relative rounded-xl border border-border overflow-hidden bg-muted"
          >
            <div className="relative w-full pt-[100%]">
              {item.type === "image" ? (
                <img
                  src={item.url}
                  alt={item.caption || "Portfolio image"}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <>
                  <video
                    src={item.url}
                    className="absolute inset-0 w-full h-full object-cover"
                    preload="metadata"
                    muted
                    playsInline
                    draggable={false}
                    onMouseEnter={(e) => {
                      e.currentTarget.play()?.catch(() => {});
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.pause();
                      e.currentTarget.currentTime = 0;
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Play className="w-8 h-8 text-white/80" strokeWidth={1.5} />
                  </div>
                </>
              )}

              {/* Pinned badge */}
              {item.is_pinned && (
                <div className="absolute top-2 left-2">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-medium rounded-md bg-amber-500 text-white">
                    <BookmarkPlus className="w-3 h-3" strokeWidth={2} />
                    Pinned
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

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
          onError: (err: any) => {
            const msg = err?.response?.data?.message || "";
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
            setLoading(false);
          }
          return;
        }

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

  if (loading) {
    return (
      <div className="max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto pb-20">
        <div className="h-56 sm:h-64 bg-muted" />
        <div className="mx-4 -mt-10 relative">
          <Skeleton className="w-20 h-20 rounded-full border-4 border-background shrink-0" />
        </div>
        <div className="px-4 mt-3 space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
          <div className="grid grid-cols-3 gap-2">
            <Skeleton className="h-10 rounded-lg" />
            <Skeleton className="h-10 rounded-lg" />
            <Skeleton className="h-10 rounded-lg" />
          </div>
          <Skeleton className="h-32 rounded-2xl" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
          </div>
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto px-4 py-6 pb-20">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          Back
        </button>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const displayName = activeProfile?.full_legal_name || activeProfile?.username || "Talent";
  const loc = [activeProfile?.location?.city, activeProfile?.location?.state]
    .filter(Boolean)
    .join(", ");
  const professionStr = activeProfile?.professions?.slice(0, 2).join(" / ") || "";

  return (
    <div className="max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto pb-[calc(5rem+env(safe-area-inset-bottom))] sm:pb-6">
      {/* Topbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-20">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-[12px] text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          Back
        </button>
        <span className="text-[17px] font-medium text-text-primary">
          Connect<span className="text-brand">Me</span>
        </span>
        <div className="w-10" />
      </div>

      {activeProfile && (
        <>
          {/* Cover + Hero */}
          <div className="relative">
            {/* Cover image */}
            <div className="relative h-56 sm:h-64 overflow-hidden">
              {activeProfile.profile_photo ? (
                <img
                  src={activeProfile.profile_photo}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              {/* Text overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">
                    {displayName}
                  </h1>
                  {activeProfile.is_verified && (
                    <GoldShieldBadge className="w-6 h-6" />
                  )}
                </div>
                <p className="text-sm text-white/80">
                  {professionStr}
                  {professionStr && loc ? " · " : ""}
                  {loc}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 pt-4 space-y-4">
            {/* Action buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                onClick={handleConnect}
                disabled={isConnecting || !isRecruiter}
                className="flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-medium bg-muted-bg text-text-primary border border-border hover:bg-muted-bg/80 transition-colors disabled:opacity-50"
              >
                <Mail className="w-3.5 h-3.5" strokeWidth={1.5} />
                {isConnecting ? "Connecting..." : "Connect"}
              </button>
              <button
                onClick={() => {
                  if (isRecruiter) {
                    setShortlistModalOpen(true);
                  } else {
                    router.push("/auth/login");
                  }
                }}
                className="flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-medium bg-muted-bg text-text-primary border border-border hover:bg-muted-bg/80 transition-colors"
              >
                <BookmarkPlus className="w-3.5 h-3.5" strokeWidth={1.5} />
                Shortlist
              </button>
              <button
                onClick={() => router.push(`/talent/${username}/portfolio`)}
                className="flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-medium bg-amber-500 hover:bg-amber-600 text-white transition-colors"
              >
                <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
                Media Kit
              </button>
              <ShareProfileDialog
                username={username}
                profilePhoto={profile?.profile_photo}
                name={profile?.full_legal_name}
              >
                <button className="flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-medium bg-muted-bg text-text-primary border border-border hover:bg-muted-bg/80 transition-colors w-full">
                  <Share2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                  Share
                </button>
              </ShareProfileDialog>
            </div>

            {/* Profile highlights */}
            {profile && (
              <ProfileHighlights profile={profile} />
            )}

            {/* Portfolio */}
            {profile && (
              <PortfolioSection items={portfolioItems} username={username} />
            )}
          </div>
        </>
      )}


      <ShortlistOrInviteModal
        open={shortlistModalOpen}
        onClose={() => setShortlistModalOpen(false)}
        talentUserId={activeProfile?.user_id || ""}
        talentName={displayName.split(" ")[0]}
      />
    </div>
  );
}
