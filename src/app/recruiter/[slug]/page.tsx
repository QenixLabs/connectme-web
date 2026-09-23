"use client";

import { useParams } from "next/navigation";
import {
  Check,
  Copy,
  Heart,
  MoreHorizontal,
  Send,
  Share2,
  UserPlus,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  usePublicRecruiterProfile,
  usePublicRecruiterCampaigns,
  usePublicRecruiterTeam,
  usePublicRecruiterReviews,
  useSubmitRecruiterReview,
} from "@/hooks/use-recruiter-public-profile";
import { useMyApplications } from "@/hooks/use-campaigns";
import { useSaveRecruiter, useStartConversation } from "@/hooks/use-recruiter-actions";
import { useConnectionRequest } from "@/hooks/use-talent-actions";
import { useAuthStore } from "@/providers/auth-store-provider";
import type { SubmitRecruiterReviewPayload } from "@/lib/api/recruiter";
import { Skeleton } from "@/components/ui/skeleton";
import { RecruiterProfileView } from "./profile-view";
import styles from "./page.module.css";

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="mx-auto max-w-md border-x border-border/60 bg-surface px-5">
        <Skeleton className="h-44 w-full rounded-none" />
        <div className="relative z-10 -mt-20 size-28 rounded-2xl border border-border bg-card" />
        <Skeleton className="mt-5 h-8 w-64" />
        <Skeleton className="mt-2 h-4 w-48" />
        <div className="mt-4 flex gap-3">
          <Skeleton className="h-12 flex-1 rounded-xl" />
          <Skeleton className="h-12 flex-1 rounded-xl" />
          <Skeleton className="h-12 w-12 rounded-xl" />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <Skeleton className="mt-6 h-10 w-full rounded-lg" />
        <Skeleton className="mt-5 h-40 rounded-2xl" />
        <Skeleton className="mt-4 h-32 rounded-2xl" />
      </div>
    </div>
  );
}

function ProfileNotFound({ slug }: { slug: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Profile not found</h1>
        <p className="mt-2 text-muted-foreground">
          The recruiter profile{" "}
          <span className="font-medium text-foreground">/{slug}</span> doesn&apos;t
          exist.
        </p>
      </div>
    </div>
  );
}

export default function PublicRecruiterProfilePage() {
  const params = useParams();
  const slug = (params?.slug as string) || "";

  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = usePublicRecruiterProfile(slug);
  const { data: campaignsData, isLoading: campaignsLoading } =
    usePublicRecruiterCampaigns(slug, 50);
  const { data: teamData } = usePublicRecruiterTeam(slug);
  const user = useAuthStore((state) => state.user);
  const {
    data: reviewsData,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = usePublicRecruiterReviews(slug, user?._id);
  const firstReviewsPage = reviewsData?.pages[0];
  const canReview =
    user?.role === "talent" &&
    !!firstReviewsPage &&
    firstReviewsPage.has_reviewed !== true;
  const { data: applicationsData } = useMyApplications(
    { recruiter_id: profile?.user_id, limit: 100 },
    canReview && !!profile?.user_id,
  );
  const reviewMutation = useSubmitRecruiterReview(slug);

  const { isSaved: followed, toggleSave: toggleFollow } = useSaveRecruiter(slug);
  const { start: startConversation, isPending: messagePending } = useStartConversation(slug, "recruiter");
  const { status: connectionStatus, isPending: connectPending, send: sendConnection } = useConnectionRequest(profile?.user_id || "");

  const [notice, setNotice] = useState("");
  const [moreOpen, setMoreOpen] = useState(false);
  const moreWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!moreOpen) return;
    const close = (e: MouseEvent) => {
      if (moreWrapRef.current && !moreWrapRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [moreOpen]);

  const notify = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2200);
  };

  const copyProfileLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      notify("Link copied");
    } catch {
      notify("Couldn't copy link");
    }
  };

  const handleShare = async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: profile?.company_name ?? "ConnectMe",
          text:
            profile?.headline ??
            (profile ? `Check out ${profile.company_name} on ConnectMe` : ""),
          url: window.location.href,
        });
        return;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
      }
    }
    await copyProfileLink();
  };

  const isLoading = profileLoading || campaignsLoading;

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (profileError || !profile) {
    return <ProfileNotFound slug={slug} />;
  }

  const campaigns = campaignsData?.data ?? [];
  const team = teamData ?? [];
  const reviews = reviewsData?.pages.flatMap((page) => page.data) ?? [];
  const totalReviews = firstReviewsPage?.total ?? profile.total_reviews_count ?? 0;
  const verifiedReviews = firstReviewsPage?.verified_total ?? 0;
  const averageRating = profile.average_rating ?? 0;
  const reviewCampaigns = (applicationsData ?? [])
    .filter((campaign) => campaign.my_application)
    .map((campaign) => ({ _id: campaign._id, name: campaign.name }));

  const submitReview = async (payload: SubmitRecruiterReviewPayload) => {
    try {
      await reviewMutation.mutateAsync(payload);
      notify("Review submitted");
    } catch (error) {
      const response = error as { response?: { data?: { message?: string } } };
      notify(response.response?.data?.message || "Couldn't submit review");
      throw error;
    }
  };

  const actions = (
    <>
      <div className={styles.primaryRow}>
        <button
          className={styles.primaryAction}
          onClick={sendConnection}
          disabled={connectPending || connectionStatus === "connected" || connectionStatus === "pending"}
        >
          {connectionStatus === "connected" ? (
            <>
              <Check size={16} /> Connected
            </>
          ) : connectionStatus === "pending" ? (
            "Pending"
          ) : (
            <>
              <UserPlus size={16} /> Connect
            </>
          )}
        </button>
        <button
          className={styles.secondaryAction}
          onClick={startConversation}
          disabled={messagePending}
        >
          <Send size={16} />
          {messagePending ? "Starting..." : "Message"}
        </button>
      </div>

      <div className={styles.secondaryRow}>
        <button
          className={`${styles.ghostAction} ${followed ? styles.on : ""}`}
          onClick={toggleFollow}
        >
          <Heart size={14} fill={followed ? "currentColor" : "none"} />
          {followed ? "Following" : "Follow"}
        </button>
        <button className={styles.ghostAction} onClick={() => void handleShare()}>
          <Share2 size={14} />
          Share
        </button>
        <div className={styles.moreWrap} ref={moreWrapRef}>
          <button
            className={styles.moreAction}
            aria-label="More profile actions"
            aria-expanded={moreOpen}
            aria-haspopup="menu"
            onClick={() => setMoreOpen((v) => !v)}
          >
            <MoreHorizontal size={18} />
          </button>
          {moreOpen && (
            <div className={styles.moreMenu} role="menu">
              <button
                role="menuitem"
                onClick={() => {
                  setMoreOpen(false);
                  void copyProfileLink();
                }}
              >
                <Copy size={13} />
                Copy profile link
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      <RecruiterProfileView
        profile={profile}
        campaigns={campaigns}
        team={team}
        reviews={reviews}
        totalReviews={totalReviews}
        averageRating={averageRating}
        verifiedReviews={verifiedReviews}
        hasMoreReviews={hasNextPage}
        loadingMoreReviews={isFetchingNextPage}
        onLoadMoreReviews={async () => {
          let nextPage = hasNextPage;
          while (nextPage) {
            const result = await fetchNextPage();
            nextPage = result.hasNextPage;
          }
        }}
        reviewCampaigns={reviewCampaigns}
        reviewPending={reviewMutation.isPending}
        onSubmitReview={canReview ? submitReview : undefined}
        actions={actions}
        onBack={() => window.history.back()}
        scrollOnTabChange
      />
      {notice && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background shadow-lg"
        >
          {notice}
        </div>
      )}
    </>
  );
}
