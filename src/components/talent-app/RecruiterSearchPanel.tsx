"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Building2,
  Camera,
  Clapperboard,
  Megaphone,
  MapPin,
  MessageCircle,
  Music2,
  Palette,
  Search,
  Star,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useRecruiterDirectory } from "@/hooks/use-recruiter-directory";
import { useStartConversation } from "@/hooks/use-recruiter-actions";
import type { PublicRecruiterDirectoryItem } from "@/lib/api/recruiter";

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
    <article className="card-soft h-full rounded-2xl border border-border/70 p-4 transition-shadow hover:shadow-md">
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
          <Building2 className="size-3.5" />
          {recruiter.projects.length === 4
            ? "4+ active campaigns"
            : `${recruiter.projects.length} active campaign${recruiter.projects.length === 1 ? "" : "s"}`}
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
          className="flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          <MessageCircle className="size-4" />
          {conversation.isPending ? "Connecting…" : "Connect"}
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

export function RecruiterSearchPanel({
  input,
  onSearchChange,
  search: debouncedSearch,
}: {
  input: string;
  onSearchChange: (value: string) => void;
  search: string;
}) {
  const [category, setCategory] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sort, setSort] = useState<"relevance" | "rating">("relevance");

  const params = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      category: category || undefined,
      verified_only: verifiedOnly || undefined,
      sort,
      limit: 12,
    }),
    [category, debouncedSearch, sort, verifiedOnly],
  );

  const query = useRecruiterDirectory(params);
  const recruiters = query.data?.pages.flatMap((page) => page.data) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;

  const runSearch = (value: string) => {
    onSearchChange(value);
  };

  return (
    <section className="space-y-4">
      <div className="space-y-3.5 rounded-3xl border border-border/60 bg-card p-3.5 shadow-[0_8px_24px_rgba(27,16,56,0.07)] sm:p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={input}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search companies or recruiters"
            aria-label="Search recruiters and agencies"
            className="h-11 rounded-xl border-border/70 bg-background pl-10 pr-10 text-sm shadow-[0_2px_8px_rgba(27,16,56,0.04)]"
          />
          {input ? (
            <button
              type="button"
              onClick={() => runSearch("")}
              aria-label="Clear recruiter search"
              className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>

        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {["All", ...QUICK_SEARCHES].map((term) => {
            const value = term === "All" ? "" : term;
            const selected = category === value;
            const Icon =
              term === "All"
                ? Building2
                : term === "Casting"
                  ? Clapperboard
                  : term === "Design"
                    ? Palette
                    : term === "Fashion"
                      ? Sparkles
                      : term === "Film"
                        ? Camera
                        : term === "Music"
                          ? Music2
                          : term === "Advertising"
                            ? Megaphone
                            : UsersRound;
            return (
              <button
                key={term}
                type="button"
                aria-pressed={selected}
                onClick={() => setCategory(value)}
                className={`flex h-[68px] w-[68px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-2xl border px-1.5 text-center text-[10px] font-semibold leading-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8614df] focus-visible:ring-offset-2 ${
                  selected
                    ? "border-[#8614df] bg-gradient-to-b from-[#a529f3] to-[#7410c9] text-white shadow-[0_5px_12px_rgba(126,19,205,0.25)]"
                    : "border-[#eee7f6] bg-gradient-to-b from-white to-[#faf7fd] text-[#494257] shadow-[0_2px_6px_rgba(27,16,56,0.05)] hover:border-[#d8c0f1] hover:text-[#7410c9]"
                }`}
              >
                <Icon aria-hidden="true" className="size-5" />
                <span className="line-clamp-2">{term}</span>
              </button>
            );
          })}
        </div>

        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto border-t border-border/60 pt-3">
          <Button
            type="button"
            size="sm"
            variant={verifiedOnly ? "default" : "outline"}
            aria-pressed={verifiedOnly}
            onClick={() => setVerifiedOnly((value) => !value)}
            className={`h-9 shrink-0 rounded-full px-3 text-xs ${verifiedOnly ? "bg-[#8014d2] text-white hover:bg-[#6e0fbb]" : "border-border/70 bg-background"}`}
          >
            Verified
          </Button>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="sr-only">Sort</span>
            <Select
              value={sort}
              onValueChange={(value) =>
                setSort(value === "rating" ? "rating" : "relevance")
              }
            >
              <SelectTrigger
                aria-label="Sort recruiters"
                className="h-9 w-[140px] shrink-0 rounded-full border-border/70 bg-background px-3 text-xs shadow-[0_2px_6px_rgba(27,16,56,0.04)]"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Best match</SelectItem>
                <SelectItem value="rating">Highest rated</SelectItem>
              </SelectContent>
            </Select>
          </label>
        </div>
      </div>

      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Build your network</p>
          <h2 className="mt-1 truncate text-lg font-bold tracking-tight">
          {query.isLoading
            ? "Searching recruiters…"
            : debouncedSearch
              ? `${total} recruiter${total === 1 ? "" : "s"} for “${debouncedSearch}”`
              : `${total} recruiter${total === 1 ? "" : "s"} & agencies`}
          </h2>
        </div>
        <span className="shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
          Best match
        </span>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {query.isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <RecruiterResultSkeleton key={index} />
          ))
        ) : query.isError ? (
          <div className="col-span-full flex flex-col items-center rounded-2xl border border-border bg-card py-12 text-center">
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
          <div className="col-span-full flex flex-col items-center rounded-2xl border border-border bg-card py-16 text-center">
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
