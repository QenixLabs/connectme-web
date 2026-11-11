"use client";

import { Check, Quote, Star, UserRound, type LucideIcon } from "lucide-react";
import type {
  ProviderRatingSummary,
  ProviderReview,
  PublicProviderPackage,
} from "@/lib/api/marketplace";
import { formatAmount } from "@/components/marketplace/format";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function StatTile({
  label,
  value,
  icon: Icon,
  onClick,
  clickLabel,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  onClick?: () => void;
  clickLabel?: string;
}) {
  const accent = {
    Services: {
      icon: "bg-sky-100 text-sky-700",
      border: "border-sky-200/80",
      value: "text-sky-900",
    },
    Specialties: {
      icon: "bg-violet-100 text-violet-700",
      border: "border-violet-200/80",
      value: "text-violet-900",
    },
    Portfolio: {
      icon: "bg-amber-100 text-amber-700",
      border: "border-amber-200/80",
      value: "text-amber-900",
    },
    Products: {
      icon: "bg-emerald-100 text-emerald-700",
      border: "border-emerald-200/80",
      value: "text-emerald-900",
    },
    Projects: {
      icon: "bg-rose-100 text-rose-700",
      border: "border-rose-200/80",
      value: "text-rose-900",
    },
  }[label] ?? {
    icon: "bg-provider-tint text-provider-primary",
    border: "border-provider-border",
    value: "text-provider-foreground",
  };

  const className = `flex min-w-0 items-center gap-2 rounded-xl border ${accent.border} bg-gradient-to-br from-white to-provider-canvas p-3 text-left shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-provider-card`;
  const content = (
    <>
      <span className={`grid size-9 shrink-0 place-items-center rounded-full ${accent.icon}`}>
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className={`block truncate text-base font-bold ${accent.value}`}>
          {value}
        </span>
        <span className="block truncate text-[11px] text-provider-muted">
          {label}
        </span>
      </span>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={clickLabel ?? `View ${label.toLowerCase()}`}
        className={`${className} cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
      >
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
}

export function PackageCard({
  package: providerPackage,
  onSelect,
}: {
  package: PublicProviderPackage;
  onSelect: () => void;
}) {
  if (!providerPackage.name) return null;

  return (
    <Card className="overflow-hidden rounded-provider-card border-provider-border bg-provider-surface p-3 shadow-provider-card sm:p-4">
      <div className="flex gap-3">
        {providerPackage.image_url && (
          <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-provider-canvas">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={providerPackage.image_url}
              alt={`${providerPackage.name} package`}
              className="size-full object-cover"
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-bold text-provider-foreground">
                {providerPackage.name}
              </h3>
              {providerPackage.subtitle && (
                <p className="mt-0.5 text-xs text-provider-muted">
                  {providerPackage.subtitle}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              {providerPackage.badge && (
                <Badge className="rounded-full bg-provider-tint text-provider-primary hover:bg-provider-tint">
                  {providerPackage.badge}
                </Badge>
              )}
              {providerPackage.savings_percent != null && (
                <Badge variant="secondary" className="rounded-full">
                  Save {providerPackage.savings_percent}%
                </Badge>
              )}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-baseline gap-2">
            {providerPackage.price ? (
              <span className="text-lg font-bold text-provider-primary">
                {formatAmount(
                  providerPackage.price.amount,
                  providerPackage.price.currency,
                )}
              </span>
            ) : (
              <span className="text-sm font-semibold text-provider-foreground">
                Price on request
              </span>
            )}
            {providerPackage.original_price && (
              <span className="text-xs text-provider-muted line-through">
                {formatAmount(
                  providerPackage.original_price.amount,
                  providerPackage.original_price.currency,
                )}
              </span>
            )}
          </div>
        </div>
      </div>

      {providerPackage.inclusions && providerPackage.inclusions.length > 0 && (
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {providerPackage.inclusions.map((inclusion) => (
            <li
              key={inclusion}
              className="flex items-start gap-2 text-xs text-provider-foreground"
            >
              <Check
                className="mt-0.5 size-3.5 shrink-0 text-provider-primary"
                aria-hidden="true"
              />
              {inclusion}
            </li>
          ))}
        </ul>
      )}

      <Button
        type="button"
        className="mt-4 h-11 w-full rounded-full shadow-provider-action"
        onClick={onSelect}
      >
        Select Package
      </Button>
    </Card>
  );
}

export function RatingBreakdown({
  ratingSummary,
}: {
  ratingSummary?: ProviderRatingSummary | null;
}) {
  if (!ratingSummary?.rating_distribution) return null;

  return (
    <div className="space-y-2" aria-label="Ratings by star level">
      {[5, 4, 3, 2, 1].map((rating) => {
        const count =
          ratingSummary.rating_distribution?.[
            rating as 1 | 2 | 3 | 4 | 5
          ] ?? 0;
        const percentage = ratingSummary.review_count
          ? (count / ratingSummary.review_count) * 100
          : 0;

        return (
          <div
            key={rating}
            className="grid grid-cols-[2.25rem_minmax(0,1fr)_2.5rem] items-center gap-2 text-xs"
          >
            <span className="flex items-center gap-1 text-provider-muted">
              {rating}
              <Star className="size-3 fill-provider-star text-provider-star" />
            </span>
            <Progress
              value={percentage}
              aria-label={`${rating} stars`}
              className="h-1.5 bg-provider-tint"
            />
            <span className="text-right text-provider-muted">
              {Math.round(percentage)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function ReviewCard({
  review,
  canReport,
  reportDisabled,
  onReport,
}: {
  review: ProviderReview;
  canReport: boolean;
  reportDisabled?: boolean;
  onReport: () => void;
}) {
  const media =
    review.media?.filter(
      (item): item is typeof item & { url: string; type: "image" | "video" } =>
        Boolean(item.url && item.type),
    ) ?? [];

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-provider-border bg-gradient-to-br from-white via-white to-violet-50/40 p-5 shadow-sm transition-shadow hover:shadow-provider-card sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-5 -top-7 size-24 rounded-full bg-violet-100/40 blur-2xl transition-colors group-hover:bg-fuchsia-100/50"
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="size-11 shrink-0 border border-provider-border shadow-sm">
            {review.reviewer?.avatar_url && (
              <AvatarImage src={review.reviewer.avatar_url} alt="" />
            )}
            <AvatarFallback className="bg-provider-tint text-provider-primary">
              {review.reviewer?.display_name ? (
                review.reviewer.display_name.slice(0, 1)
              ) : (
                <UserRound className="size-5" aria-hidden="true" />
              )}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-provider-foreground">
              {review.reviewer?.display_name || "Anonymous reviewer"}
            </p>
            <time
              dateTime={review.created_at}
              className="mt-0.5 block text-xs text-provider-muted"
            >
              {new Date(review.created_at).toLocaleDateString()}
            </time>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1.5">
          <span className="sr-only">{review.rating} out of 5 stars</span>
          <span className="flex items-center gap-0.5">
            {Array.from({ length: 5 }, (_, index) => (
              <Star
                key={index}
                className={`size-3.5 ${index < review.rating ? "fill-provider-star text-provider-star" : "text-amber-200"}`}
                aria-hidden="true"
              />
            ))}
          </span>
        </span>
      </div>

      <div className="relative mt-4 flex gap-2.5 border-t border-provider-border/70 pt-4">
        <Quote className="mt-0.5 size-4 shrink-0 fill-violet-100 text-provider-primary/60" aria-hidden="true" />
        <p className="whitespace-pre-line text-sm leading-relaxed text-provider-foreground sm:text-[15px]">
          {review.text}
        </p>
      </div>

      {media.length > 0 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {media.map((item, index) =>
            item.type === "video" ? (
              <video
                key={`${item.url}-${index}`}
                src={item.url}
                controls
                preload="metadata"
                aria-label={item.alt_text || `Review video ${index + 1}`}
                className="h-24 w-32 shrink-0 rounded-lg bg-provider-canvas object-cover"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`${item.url}-${index}`}
                src={item.url}
                alt={item.alt_text || `Review photo ${index + 1}`}
                className="h-24 w-24 shrink-0 rounded-lg object-cover"
              />
            ),
          )}
        </div>
      )}

      {canReport && (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="relative mt-3 min-h-10 rounded-full px-3 text-xs font-medium text-provider-muted hover:bg-provider-tint hover:text-provider-primary"
          disabled={reportDisabled}
          onClick={onReport}
        >
          Report
        </Button>
      )}
    </article>
  );
}
