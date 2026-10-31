"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Building2,
  MapPin,
  MessageCircle,
  Search,
  Star,
  X,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { useRecruiterDirectory } from "@/hooks/use-recruiter-directory";
import { useStartConversation } from "@/hooks/use-recruiter-actions";
import type { PublicRecruiterDirectoryItem } from "@/lib/api/recruiter";
import { cn } from "@/lib/utils";

const QUICK_SEARCHES = ["Design", "Casting", "Fashion", "Film", "Music", "Advertising"];

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function RecruiterResultCard({ recruiter }: { recruiter: PublicRecruiterDirectoryItem }) {
  const conversation = useStartConversation(recruiter.slug, "talent");
  const location =
    [recruiter.location?.city, recruiter.location?.state, recruiter.location?.country]
      .filter(Boolean)
      .join(", ") || "Location not listed";
  const industries = recruiter.industries?.length
    ? recruiter.industries
    : recruiter.industry
      ? [recruiter.industry]
      : [];
  const tags = [...(recruiter.specialties ?? []), ...(recruiter.casting_categories ?? [])]
    .filter((tag, index, all) => all.indexOf(tag) === index)
    .slice(0, 4);

  return (
    <article className="card-soft p-4">
      <div className="flex gap-3">
        <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-brand-soft text-sm font-bold text-brand">
          {recruiter.profile_photo ? (
            <img
              src={recruiter.profile_photo}
              alt={`${recruiter.company_name} logo`}
              className="size-full object-cover"
              loading="lazy"
            />
          ) : (
            initials(recruiter.company_name)
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-1.5">
            <Link
              href={`/recruiter/${recruiter.slug}`}
              className="truncate font-bold leading-tight hover:text-brand"
            >
              {recruiter.company_name}
            </Link>
            {recruiter.is_verified ? (
              <BadgeCheck
                className="mt-0.5 size-4 shrink-0 fill-brand text-brand-foreground"
                aria-label="Verified recruiter"
              />
            ) : null}
          </div>
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
            {industries.join(", ") || recruiter.position || "Recruiter"}
            {recruiter.headline ? ` · ${recruiter.headline}` : ""}
          </p>
          <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" /> {location}
          </p>
        </div>
      </div>

      {tags.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-medium text-brand"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Star className="size-3.5 text-warning" />
          {recruiter.average_rating != null
            ? `${recruiter.average_rating.toFixed(1)} (${recruiter.total_reviews_count})`
            : "No reviews yet"}
        </span>
        <span className="flex items-center gap-1">
          <Building2 className="size-3.5" /> {recruiter.project_count} projects
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Link
          href={`/recruiter/${recruiter.slug}`}
          className="rounded-xl border border-primary/50 py-2 text-center text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
        >
          View Profile
        </Link>
        <button
          type="button"
          onClick={conversation.start}
          disabled={conversation.isPending}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-teal py-2 text-sm font-semibold text-accent-foreground transition-all hover:brightness-110 disabled:opacity-60"
        >
          <MessageCircle className="size-4" />
          {conversation.isPending ? "Opening…" : "Message"}
        </button>
      </div>
    </article>
  );
}

function RecruiterResultSkeleton() {
  return (
    <div className="card-soft p-4">
      <div className="flex gap-3">
        <Skeleton className="size-14 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
      <Skeleton className="mt-3 h-5 w-40 rounded-full" />
      <Skeleton className="mt-3 h-px w-full" />
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Skeleton className="h-9 rounded-xl" />
        <Skeleton className="h-9 rounded-xl" />
      </div>
    </div>
  );
}

export function RecruiterSearchPanel() {
  const [input, setInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(input.trim()), 300);
    return () => clearTimeout(timeout);
  }, [input]);

  const params = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      sort: "relevance" as const,
      limit: 12,
    }),
    [debouncedSearch],
  );

  const query = useRecruiterDirectory(params);
  const recruiters = query.data?.pages.flatMap((page) => page.data) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;

  const runSearch = (value: string) => {
    setInput(value);
    setDebouncedSearch(value.trim());
  };

  return (
    <section className="mt-4 px-4">
      <div className="sticky top-16 z-40 -mx-4 border-b border-border bg-background/95 px-4 pb-3 pt-3 backdrop-blur-xl">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            type="search"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Search recruiters, agencies, skills… e.g. design"
            aria-label="Search recruiters and agencies"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {input ? (
            <button
              type="button"
              onClick={() => runSearch("")}
              aria-label="Clear recruiter search"
              className="grid size-6 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-medium text-muted-foreground">Try</span>
          {QUICK_SEARCHES.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => runSearch(term)}
              className={cn(
                "rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-brand-soft hover:text-brand",
                debouncedSearch.toLowerCase() === term.toLowerCase() &&
                  "bg-brand-soft text-brand",
              )}
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <h2 className="truncate text-base font-extrabold tracking-tight">
          {query.isLoading
            ? "Searching recruiters…"
            : debouncedSearch
              ? `${total} recruiter${total === 1 ? "" : "s"} for “${debouncedSearch}”`
              : `${total} recruiter${total === 1 ? "" : "s"} & agencies`}
        </h2>
        <span className="shrink-0 text-[11px] font-medium text-muted-foreground">
          Best match
        </span>
      </div>

      <div className="mt-4 space-y-4">
        {query.isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <RecruiterResultSkeleton key={index} />
          ))
        ) : query.isError ? (
          <div className="flex flex-col items-center rounded-2xl border border-border bg-card py-12 text-center">
            <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-destructive/10">
              <X className="size-7 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold">Couldn&apos;t load recruiters</h3>
            <p className="mt-1 max-w-xs px-4 text-sm text-muted-foreground">
              Something went wrong while searching. Please try again in a moment.
            </p>
            <button
              type="button"
              onClick={() => query.refetch()}
              className="mt-4 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary"
            >
              Try again
            </button>
          </div>
        ) : recruiters.length > 0 ? (
          recruiters.map((recruiter) => (
            <RecruiterResultCard key={recruiter.slug} recruiter={recruiter} />
          ))
        ) : (
          <div className="flex flex-col items-center rounded-2xl border border-border bg-card py-16 text-center">
            <div className="mb-4 grid size-16 place-items-center rounded-2xl bg-primary/10">
              <Building2 className="size-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">No recruiters found</h3>
            <p className="mt-1 max-w-xs px-4 text-sm text-muted-foreground">
              {debouncedSearch
                ? `No recruiters match “${debouncedSearch}”. Try another skill, city, or agency name.`
                : "No recruiters or agencies are listed yet. Check back soon."}
            </p>
            {debouncedSearch ? (
              <button
                type="button"
                onClick={() => runSearch("")}
                className="mt-5 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary"
              >
                Clear search
              </button>
            ) : null}
          </div>
        )}
      </div>

      {query.hasNextPage ? (
        <button
          type="button"
          onClick={() => {
            if (!query.isFetchingNextPage) void query.fetchNextPage();
          }}
          disabled={query.isFetchingNextPage}
          className="mt-4 w-full rounded-xl border border-border bg-card py-2.5 text-sm font-semibold text-primary transition-colors hover:border-primary/40 disabled:opacity-60"
        >
          {query.isFetchingNextPage ? "Loading more…" : "Load more recruiters"}
        </button>
      ) : null}
    </section>
  );
}
