"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, Star } from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api/client";
import { providersApi } from "@/lib/api/marketplace";
import { queryKeys } from "@/lib/api/query-keys";
import { useAuthStore } from "@/providers/auth-store-provider";
import {
  RatingBreakdown,
  ReviewCard,
} from "@/components/marketplace/provider-profile-components";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface ProviderReviewsSectionProps {
  providerSlug: string;
  providerName: string;
}

export function ProviderReviewsSection({
  providerSlug,
  providerName,
}: ProviderReviewsSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [mediaFilter, setMediaFilter] = useState<"all" | "photos" | "videos">(
    "all",
  );
  const [draft, setDraft] = useState<{ rating: number; text: string } | null>(
    null,
  );
  const [error, setError] = useState("");

  const summaryQuery = useQuery({
    queryKey: queryKeys.provider.ratingSummary(providerSlug),
    queryFn: () => providersApi.getRatingSummary(providerSlug),
  });
  const reviewsQuery = useQuery({
    queryKey: queryKeys.provider.reviews(providerSlug, page),
    queryFn: () => providersApi.getPublicReviews(providerSlug, page),
  });
  const eligibilityQuery = useQuery({
    queryKey: queryKeys.provider.reviewEligibility(providerSlug),
    queryFn: () => providersApi.getReviewEligibility(providerSlug),
    enabled: Boolean(user),
  });
  const ownReview = eligibilityQuery.data?.my_review;
  const canEdit =
    ownReview?.moderation_state === "pending" ||
    ownReview?.moderation_state === "approved";

  const rating = draft?.rating ?? ownReview?.rating ?? 5;
  const text = draft?.text ?? ownReview?.text ?? "";
  const setRating = (value: number) =>
    setDraft((current) => ({
      rating: value,
      text: current?.text ?? ownReview?.text ?? "",
    }));
  const setText = (value: string) =>
    setDraft((current) => ({
      rating: current?.rating ?? ownReview?.rating ?? 5,
      text: value,
    }));

  async function invalidateReviewQueries() {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: queryKeys.provider.reviews(providerSlug),
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.provider.ratingSummary(providerSlug),
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.provider.reviewEligibility(providerSlug),
      }),
    ]);
  }

  const submitMutation = useMutation({
    mutationFn: () => {
      if (ownReview && canEdit) {
        return providersApi.updateReview(ownReview.id, {
          rating,
          text: text.trim(),
        });
      }
      const inquiryId = eligibilityQuery.data?.inquiry_id;
      if (!inquiryId)
        throw new Error("A qualifying closed inquiry is required.");
      return providersApi.createReview(providerSlug, {
        inquiry_id: inquiryId,
        rating,
        text: text.trim(),
      });
    },
    onSuccess: async () => {
      setError("");
      toast.success(
        ownReview
          ? "Review updated and sent for moderation"
          : "Review submitted",
      );
      await invalidateReviewQueries();
    },
    onError: (reason) =>
      setError(getApiErrorMessage(reason, "Could not submit your review.")),
  });

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!ownReview) throw new Error("No review is available to delete.");
      return providersApi.deleteReview(ownReview.id);
    },
    onSuccess: async () => {
      setDraft(null);
      setError("");
      toast.success("Review deleted");
      await invalidateReviewQueries();
    },
    onError: (reason) =>
      setError(getApiErrorMessage(reason, "Could not delete your review.")),
  });

  const reportMutation = useMutation({
    mutationFn: (id: string) =>
      providersApi.reportReview(id, "Potentially inappropriate or inaccurate"),
    onSuccess: () => toast.success("Review reported for moderation"),
    onError: (reason) =>
      toast.error(getApiErrorMessage(reason, "Could not report this review.")),
  });

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!user) {
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!text.trim()) {
      setError("Write a few words about your interaction.");
      return;
    }
    submitMutation.mutate();
  }

  const reviews = reviewsQuery.data?.data ?? [];
  const filteredReviews = reviews.filter((review) => {
    if (mediaFilter === "all") return true;
    const type = mediaFilter === "photos" ? "image" : "video";
    return review.media?.some((item) => item.type === type);
  });
  const averageRating = summaryQuery.data?.average_rating;
  const reviewCount = summaryQuery.data?.review_count ?? 0;

  return (
    <section className="space-y-5">
      <Card className="relative isolate overflow-hidden rounded-provider-card border-provider-border bg-gradient-to-br from-white via-white to-violet-50/70 shadow-provider-card">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-14 -top-20 size-48 rounded-full bg-fuchsia-100/50 blur-3xl"
        />
        <CardHeader className="relative flex items-center justify-between gap-3 border-b border-provider-border/70 px-5 pb-4 pt-5 sm:px-7 sm:pt-6">
          <div className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-provider-tint text-provider-primary shadow-sm">
              <Star className="size-5 fill-current" aria-hidden="true" />
            </span>
            <div>
              <CardTitle className="text-lg font-bold tracking-tight text-provider-foreground sm:text-xl">
                Customer Reviews
              </CardTitle>
              <p className="mt-0.5 text-xs text-provider-muted sm:text-sm">
                Feedback from the community
              </p>
            </div>
          </div>
          <span className="shrink-0 rounded-full border border-provider-border bg-white/80 px-3 py-1 text-xs font-semibold text-provider-muted">
            {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
          </span>
        </CardHeader>
        <CardContent className="relative space-y-4 px-5 pb-5 pt-4 sm:space-y-5 sm:px-7 sm:pb-7">
          <div className="grid gap-4 rounded-2xl border border-violet-100/90 bg-gradient-to-r from-violet-50/90 via-white to-fuchsia-50/60 p-4 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:items-center sm:p-5">
            <div className="flex items-center gap-4">
              <div className="flex size-[76px] shrink-0 flex-col items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-violet-100 sm:size-[84px]">
                <span className="text-3xl font-bold leading-none tracking-tight text-provider-foreground sm:text-4xl">
                  {averageRating == null ? "—" : averageRating.toFixed(1)}
                </span>
                <span className="mt-1 text-[10px] font-medium uppercase tracking-wide text-provider-muted">
                  out of 5
                </span>
              </div>
              <div className="min-w-0">
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star
                      key={index}
                      className={`size-4 ${averageRating != null && index < Math.round(averageRating) ? "fill-provider-star text-provider-star" : "text-provider-border"}`}
                      aria-hidden="true"
                    />
                  ))}
                </span>
                <span className="mt-1.5 block text-xs font-medium text-provider-muted">
                  {reviewCount === 0
                    ? "Be the first to leave feedback"
                    : `Based on ${reviewCount} ${reviewCount === 1 ? "review" : "reviews"}`}
                </span>
              </div>
            </div>
            <RatingBreakdown ratingSummary={summaryQuery.data} />
          </div>

          {summaryQuery.isError && (
            <p role="alert" className="text-sm text-destructive">
              {getApiErrorMessage(
                summaryQuery.error,
                "Could not load the rating summary.",
              )}
            </p>
          )}
          {reviewsQuery.isError && (
            <p role="alert" className="text-sm text-destructive">
              {getApiErrorMessage(reviewsQuery.error, "Could not load reviews.")}
            </p>
          )}

          <Button
            asChild
            className="h-12 w-full rounded-full bg-gradient-to-r from-provider-primary-strong to-provider-primary font-semibold shadow-provider-action transition-transform hover:brightness-105 active:scale-[0.99]"
          >
            <a href="#write-review">Write a Review</a>
          </Button>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-provider-foreground">
              Browse reviews
            </span>
            <div
              className="flex gap-2 overflow-x-auto"
              role="group"
              aria-label="Filter reviews by media"
            >
              {(["all", "photos", "videos"] as const).map((filter) => (
                <Button
                  key={filter}
                  type="button"
                  size="sm"
                  variant={mediaFilter === filter ? "default" : "outline"}
                  className={`min-h-10 shrink-0 rounded-full px-4 text-xs font-semibold transition-colors ${
                    mediaFilter === filter
                      ? "shadow-sm"
                      : "border-provider-border bg-white/80 text-provider-muted hover:border-provider-primary/30 hover:bg-provider-tint hover:text-provider-primary"
                  }`}
                  aria-pressed={mediaFilter === filter}
                  onClick={() => {
                    setMediaFilter(filter);
                    setPage(1);
                  }}
                >
                  {filter === "all"
                    ? "All"
                    : filter[0].toUpperCase() + filter.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl border border-provider-border/70 bg-white/70 px-3.5 py-3">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-provider-primary/70" aria-hidden="true" />
            <p className="text-xs leading-relaxed text-provider-muted">
              Reviews reflect interactions after a closed inquiry; they are not
              proof that a service was completed or verified.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            canReport={Boolean(user)}
            reportDisabled={reportMutation.isPending}
            onReport={() => reportMutation.mutate(review.id)}
          />
        ))}
        {reviewsQuery.data?.total === 0 && mediaFilter === "all" && (
          <div className="rounded-provider-card border border-provider-border bg-gradient-to-br from-white to-violet-50/60 p-6 text-center shadow-sm">
            <span className="mx-auto grid size-11 place-items-center rounded-2xl bg-provider-tint text-provider-primary">
              <Star className="size-5" aria-hidden="true" />
            </span>
            <p className="mt-3 text-sm font-semibold text-provider-foreground">
              No public reviews yet
            </p>
            <p className="mt-1 text-xs text-provider-muted">
              Be the first to share feedback after a closed inquiry.
            </p>
          </div>
        )}
        {reviewsQuery.data &&
          reviewsQuery.data.total > 0 &&
          filteredReviews.length === 0 && (
            <p className="rounded-provider-card border border-provider-border bg-provider-surface p-5 text-center text-sm text-provider-muted shadow-sm">
              No {mediaFilter} reviews on this page.
            </p>
          )}
      </div>

      {reviewsQuery.data && reviewsQuery.data.total > 0 && (
        <div className="flex items-center justify-between border-t border-provider-border pt-4">
          <Button
            type="button"
            variant="outline"
            className="min-h-11 rounded-full border-provider-border"
            disabled={page <= 1 || reviewsQuery.isFetching}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </Button>
          <span className="text-xs text-provider-muted">
            Page {reviewsQuery.data.page} · {reviewsQuery.data.total} reviews
          </span>
          <Button
            type="button"
            variant="outline"
            className="min-h-11 rounded-full border-provider-border"
            disabled={!reviewsQuery.data.hasMore || reviewsQuery.isFetching}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </Button>
        </div>
      )}

      <Card
        id="write-review"
        className="scroll-mt-24 rounded-provider-card border-provider-border bg-provider-surface shadow-provider-card"
      >
        <CardHeader>
          <CardTitle className="text-lg text-provider-foreground">
            {canEdit ? "Edit your review" : `Review ${providerName}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!user ? (
            <Button
              type="button"
              variant="outline"
              className="min-h-11 rounded-full"
              onClick={() =>
                router.push(
                  `/auth/login?redirect=${encodeURIComponent(pathname)}`,
                )
              }
            >
              Sign in to review
            </Button>
          ) : eligibilityQuery.isLoading ? (
            <p className="text-sm text-provider-muted">
              Checking review eligibility…
            </p>
          ) : eligibilityQuery.isError ? (
            <p role="alert" className="text-sm text-destructive">
              {getApiErrorMessage(
                eligibilityQuery.error,
                "Could not check review eligibility.",
              )}
            </p>
          ) : canEdit ? (
            <form className="space-y-3" onSubmit={submit}>
              {ownReview?.moderation_state === "pending" && (
                <p className="text-sm text-provider-muted">
                  Your review is awaiting moderation. Editing it sends it back
                  for review.
                </p>
              )}
              <ReviewEditor
                rating={rating}
                setRating={setRating}
                text={text}
                setText={setText}
              />
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="submit"
                  className="min-h-11 rounded-full"
                  disabled={submitMutation.isPending}
                >
                  {submitMutation.isPending ? "Saving…" : "Save review"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11 rounded-full"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate()}
                >
                  Delete review
                </Button>
              </div>
            </form>
          ) : eligibilityQuery.data?.can_review ? (
            <form className="space-y-3" onSubmit={submit}>
              <ReviewEditor
                rating={rating}
                setRating={setRating}
                text={text}
                setText={setText}
              />
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                className="min-h-11 rounded-full"
                disabled={submitMutation.isPending}
              >
                {submitMutation.isPending ? "Submitting…" : "Submit review"}
              </Button>
            </form>
          ) : (
            <p className="text-sm text-provider-muted">
              {eligibilityQuery.data?.reason === "already_reviewed"
                ? "You have already reviewed this provider."
                : eligibilityQuery.data?.reason === "provider_self_review"
                  ? "Providers cannot review their own profiles."
                  : "You can review after a closed inquiry with messages from both participants."}
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function ReviewEditor({
  rating,
  setRating,
  text,
  setText,
}: {
  rating: number;
  setRating: (rating: number) => void;
  text: string;
  setText: (text: string) => void;
}) {
  return (
    <>
      <div className="flex gap-1" aria-label="Choose a rating">
        {Array.from({ length: 5 }, (_, index) => {
          const value = index + 1;
          return (
            <button
              key={value}
              type="button"
              className="grid size-11 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label={`${value} star${value === 1 ? "" : "s"}`}
              onClick={() => setRating(value)}
            >
              <Star
                className={`size-6 ${value <= rating ? "fill-amber-500 text-amber-500" : "text-muted-foreground"}`}
              />
            </button>
          );
        })}
      </div>
      <Textarea
        required
        maxLength={2000}
        rows={4}
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Share your experience communicating with this provider."
      />
    </>
  );
}
