"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api/client";
import { providersApi } from "@/lib/api/marketplace";
import { queryKeys } from "@/lib/api/query-keys";
import { useAuthStore } from "@/providers/auth-store-provider";
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

  return (
    <section className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center justify-between gap-2">
            <span>Reviews</span>
            <span className="flex items-center gap-1 text-sm font-normal text-muted-foreground">
              <Star className="size-4 fill-current text-amber-500" />
              {summaryQuery.data?.average_rating == null
                ? "No ratings yet"
                : `${summaryQuery.data.average_rating.toFixed(2)} · ${summaryQuery.data.review_count} review${summaryQuery.data.review_count === 1 ? "" : "s"}`}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Reviews require a closed inquiry and messages from both
            participants. This records an interaction, not proof that a service
            was completed or verified.
          </p>
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
              {getApiErrorMessage(
                reviewsQuery.error,
                "Could not load reviews.",
              )}
            </p>
          )}
          {reviewsQuery.data?.data.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No public reviews yet.
            </p>
          )}
          {reviewsQuery.data?.data.map((review) => (
            <article key={review.id} className="space-y-2 border-t pt-4">
              <div
                className="flex items-center gap-1"
                aria-label={`${review.rating} out of 5 stars`}
              >
                {Array.from({ length: 5 }, (_, index) => (
                  <Star
                    key={index}
                    className={`size-4 ${index < review.rating ? "fill-amber-500 text-amber-500" : "text-muted-foreground"}`}
                  />
                ))}
                <span className="ml-1 text-xs text-muted-foreground">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="whitespace-pre-line text-sm">{review.text}</p>
              {user && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={reportMutation.isPending}
                  onClick={() => reportMutation.mutate(review.id)}
                >
                  Report
                </Button>
              )}
            </article>
          ))}
          {reviewsQuery.data && reviewsQuery.data.total > 0 && (
            <div className="flex items-center justify-between border-t pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1 || reviewsQuery.isFetching}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Previous
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {reviewsQuery.data.page} · {reviewsQuery.data.total}{" "}
                reviews
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!reviewsQuery.data.hasMore || reviewsQuery.isFetching}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {canEdit ? "Edit your review" : `Review ${providerName}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!user ? (
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                router.push(
                  `/auth/login?redirect=${encodeURIComponent(pathname)}`,
                )
              }
            >
              Sign in to review
            </Button>
          ) : eligibilityQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">
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
                <p className="text-sm text-muted-foreground">
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
                <Button type="submit" disabled={submitMutation.isPending}>
                  {submitMutation.isPending ? "Saving…" : "Save review"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
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
              <Button type="submit" disabled={submitMutation.isPending}>
                {submitMutation.isPending ? "Submitting…" : "Submit review"}
              </Button>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground">
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
