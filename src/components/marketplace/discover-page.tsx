"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useStore } from "zustand/react";
import { toast } from "sonner";
import {
  ArrowRight,
  Bookmark,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Camera,
  Check,
  Clapperboard,
  Grid2X2,
  Megaphone,
  MapPin,
  Music2,
  Palette,
  Search,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBookmarkCampaign, useCampaigns } from "@/hooks/use-campaigns";
import { getApiErrorMessage } from "@/lib/api/client";
import type { Campaign, QueryCampaignsParams } from "@/lib/api/campaigns";
import {
  providersApi,
  type ProviderDirectoryQuery,
  type PublicProviderSummary,
} from "@/lib/api/marketplace";
import { queryKeys } from "@/lib/api/query-keys";
import { MARKETPLACE_CATEGORIES } from "@/lib/marketplace-categories";
import { authStore } from "@/stores/auth-store";
import { formatAmount } from "@/components/marketplace/format";
import { DiscoveryTabs, type DiscoveryMode } from "@/components/marketplace/discovery-tabs";
import { RecruiterSearchPanel } from "@/components/talent-app/RecruiterSearchPanel";

const DISCOVERY_HEROES: Record<
  DiscoveryMode,
  { title: string; accent: string; description: string; image: string }
> = {
  opportunities: {
    title: "Find the best opportunities for your talent",
    accent: "opportunities",
    description: "Explore auditions, casting calls, projects, and creative roles.",
    image: "/images/landing/morporfile-opportunity-banner.webp",
  },
  recruiters: {
    title: "Discover recruiters and companies",
    accent: "recruiters",
    description: "Connect with production houses, agencies, and creative brands.",
    image: "/images/landing/morporfile-recruiter-banner.webp",
  },
  talent: {
    title: "Find the right talent for your next project",
    accent: "right talent",
    description: "Search creative profiles and connect with your next collaborator.",
    image: "/images/landing/morporfile-talent-banner.webp",
  },
  services: {
    title: "Book creative services for your next project",
    accent: "creative services",
    description: "Find trusted studios, professionals, and production teams.",
    image: "/images/landing/morporfile-service-banner.webp",
  },
};

const OPPORTUNITY_CATEGORIES = [
  { label: "All", value: undefined },
  { label: "Casting", value: "casting" },
  { label: "Actor", value: "actor" },
  { label: "Model", value: "model" },
  { label: "Dancer", value: "dancer" },
  { label: "Influencer", value: "influencer" },
  { label: "Musician", value: "musician" },
] as const;

function getCategoryIcon(label: string) {
  const category = label.toLowerCase();
  if (category === "all") return Grid2X2;
  if (category.includes("casting")) return Clapperboard;
  if (category.includes("dance")) return Users;
  if (category.includes("music")) return Music2;
  if (category.includes("influencer") || category.includes("advertis")) return Megaphone;
  if (category.includes("makeup") || category.includes("styling")) return Sparkles;
  if (category.includes("actor") || category.includes("model") || category.includes("photo")) return Camera;
  if (category.includes("studio") || category.includes("location")) return Building2;
  if (category.includes("design")) return Palette;
  if (category.includes("video") || category.includes("editing")) return Clapperboard;
  return BriefcaseBusiness;
}

function formatLocation(location?: { city?: string; state?: string }) {
  return (
    [location?.city, location?.state].filter(Boolean).join(", ") || "Remote"
  );
}

function formatBudget(budget?: Campaign["budget_range"]) {
  if (!budget || (budget.min == null && budget.max == null))
    return "Budget not listed";
  const currency =
    budget.currency === "INR" ? "â‚¹" : `${budget.currency ?? ""} `;
  if (budget.min != null && budget.max != null) {
    return `${currency}${budget.min.toLocaleString()} â€“ ${currency}${budget.max.toLocaleString()}`;
  }
  if (budget.min != null)
    return `From ${currency}${budget.min.toLocaleString()}`;
  return `Up to ${currency}${budget.max?.toLocaleString()}`;
}

function OpportunityCard({
  campaign,
  canSave,
}: {
  campaign: Campaign;
  canSave: boolean;
}) {
  const bookmarkMutation = useBookmarkCampaign();
  const saved = Boolean(campaign.is_bookmarked);
  const deadline = campaign.deadline
    ? new Date(campaign.deadline).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
      })
    : undefined;

  return (
    <Card className="overflow-hidden border-border/70 shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="grid gap-4 p-4 sm:grid-cols-[150px_minmax(0,1fr)] sm:p-5">
        <div className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-xl bg-muted text-center text-sm text-muted-foreground">
          <Clapperboard aria-hidden="true" className="size-7" />
          <span>
            Opportunity
            <br />
            preview
          </span>
        </div>
        <div className="min-w-0">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold leading-snug">{campaign.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {campaign.recruiter?.company_name ?? "Recruiter"}
                {campaign.role_type ? ` Â· ${campaign.role_type}` : ""}
              </p>
            </div>
            {canSave && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={
                  saved
                    ? `Remove ${campaign.name} from saved`
                    : `Save ${campaign.name}`
                }
                disabled={bookmarkMutation.isPending}
                onClick={() =>
                  bookmarkMutation.mutate(
                    { id: campaign._id, bookmarked: saved },
                    {
                      onError: (error) =>
                        toast.error(
                          getApiErrorMessage(
                            error,
                            "Unable to update saved opportunities.",
                          ),
                        ),
                    },
                  )
                }
              >
                <Bookmark className={saved ? "fill-current" : undefined} />
              </Button>
            )}
          </div>
          {campaign.description && (
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
              {campaign.description}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" />
              {formatLocation(campaign.location)}
            </span>
            {deadline && (
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="size-3.5" />
                Apply by {deadline}
              </span>
            )}
            <span>{formatBudget(campaign.budget_range)}</span>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {campaign.requirements?.age_range && (
                <Badge variant="secondary">
                  Age {campaign.requirements.age_range.min ?? "Any"}
                  {campaign.requirements.age_range.max
                    ? `â€“${campaign.requirements.age_range.max}`
                    : "+"}
                </Badge>
              )}
              {campaign.requirements?.gender && (
                <Badge variant="secondary">
                  {campaign.requirements.gender}
                </Badge>
              )}
              {campaign.my_application && (
                <Badge variant="outline">Application submitted</Badge>
              )}
            </div>
            <Button asChild size="sm">
              <Link href={`/talent/opportunities/${campaign._id}`}>
                {campaign.my_application
                  ? "View application"
                  : "View opportunity"}
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProviderResultCard({ provider }: { provider: PublicProviderSummary }) {
  const name =
    provider.display_name || provider.business_name || "Service provider";

  return (
    <Card className="overflow-hidden border-border/70 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex min-h-36 items-center justify-center bg-muted text-sm text-muted-foreground">
        <div className="flex flex-col items-center gap-2">
          <Camera aria-hidden="true" className="size-7" />
          <span>Provider preview</span>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate font-semibold">{name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {provider.provider_type ||
                provider.tagline ||
                "Creative service provider"}
            </p>
          </div>
          {provider.average_rating != null && (
            <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium">
              <Star
                aria-hidden="true"
                className="size-4 fill-current text-amber-500"
              />
              {provider.average_rating.toFixed(1)}
              <span className="font-normal text-muted-foreground">
                ({provider.review_count})
              </span>
            </span>
          )}
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin aria-hidden="true" className="size-4 shrink-0" />
          {formatLocation(provider.location)}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {provider.categories.slice(0, 3).map((category) => (
            <Badge key={category} variant="secondary">
              {category}
            </Badge>
          ))}
          {provider.categories.length === 0 &&
            provider.skills.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
        </div>
        <div className="mt-4 flex items-center justify-between gap-2 border-t pt-3">
          <span className="text-sm font-medium">
            {provider.starting_price != null
              ? `From ${formatAmount(provider.starting_price)}`
              : "Contact for pricing"}
          </span>
          <Button asChild size="sm">
            <Link href={`/providers/${provider.slug}`}>View profile</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function DiscoverPage() {
  const user = useStore(authStore, (state) => state.user);
  const isTalent = user?.role === "talent";
  const [selectedMode, setSelectedMode] = useState<DiscoveryMode | null>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [gender, setGender] = useState("");
  const [minimumRating, setMinimumRating] = useState("");
  const [sort, setSort] = useState("newest");

  const defaultMode: DiscoveryMode =
    user?.role === "provider"
      ? "services"
      : user?.role === "recruiter"
        ? "talent"
        : "opportunities";
  const availableModes: DiscoveryMode[] =
    user?.role === "provider"
      ? ["services"]
      : user?.role === "recruiter"
        ? ["talent", "services"]
        : ["opportunities", "recruiters", "services"];
  const mode =
    selectedMode && availableModes.includes(selectedMode)
      ? selectedMode
      : defaultMode;

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  const campaignParams = useMemo<QueryCampaignsParams>(
    () => ({
      status: "active",
      search: debouncedQuery || undefined,
      role_type: category || undefined,
      location_city: location.trim() || undefined,
      gender: gender || undefined,
      sort: sort === "oldest" ? "oldest" : "newest",
      limit: 12,
    }),
    [category, debouncedQuery, gender, location, sort],
  );
  const campaignsQuery = useCampaigns(
    campaignParams,
    isTalent && mode === "opportunities",
  );

  const providerParams = useMemo<ProviderDirectoryQuery>(
    () => ({
      search: debouncedQuery || undefined,
      category: category || undefined,
      location: location.trim() || undefined,
      min_rating: minimumRating ? Number(minimumRating) : undefined,
      sort: sort === "newest" ? "newest" : "highest_rating",
      page: 1,
      limit: 12,
    }),
    [category, debouncedQuery, location, minimumRating, sort],
  );
  const providersQuery = useQuery({
    queryKey: queryKeys.provider.directory(
      providerParams as Record<string, unknown>,
    ),
    queryFn: () => providersApi.getDirectory(providerParams),
    enabled: mode === "services",
  });

  const activeQuery =
    mode === "opportunities" ? campaignsQuery : providersQuery;
  const activeCategories =
    mode === "opportunities"
      ? OPPORTUNITY_CATEGORIES
      : [
          { label: "All", value: undefined },
          ...MARKETPLACE_CATEGORIES.map((value) => ({ label: value, value })),
        ];

  function changeMode(nextMode: DiscoveryMode) {
    setSelectedMode(nextMode);
    setQuery("");
    setLocation("");
    setCategory("");
    setGender("");
    setMinimumRating("");
    setSort("newest");
  }

  return (
    <div className="space-y-6">
      <section
        className="relative isolate overflow-hidden rounded-2xl bg-[#0a0827] bg-cover bg-[65%_center] bg-no-repeat text-white shadow-sm sm:bg-right"
        style={{ backgroundImage: `url(${DISCOVERY_HEROES[mode].image})` }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0a0827]/95 via-[#0a0827]/80 to-[#0a0827]/20 sm:via-[#0a0827]/65 sm:to-transparent"
        />
        <div className="relative z-10 flex min-h-36 items-stretch sm:min-h-56">
          <div className="flex w-full max-w-2xl flex-col justify-center px-5 py-4 sm:w-[65%] sm:px-8 sm:py-8 lg:px-10">
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-indigo-200 sm:text-xs sm:tracking-[0.2em]">
              Morporfile creative network <span aria-hidden="true">/</span> {mode}
            </p>
            <h1 className="mt-2 text-xl font-bold leading-tight sm:mt-3 sm:text-3xl md:text-4xl">
              {DISCOVERY_HEROES[mode].title.split(DISCOVERY_HEROES[mode].accent)[0]}
              <span className="text-fuchsia-300">{DISCOVERY_HEROES[mode].accent}</span>
              {DISCOVERY_HEROES[mode].title.split(DISCOVERY_HEROES[mode].accent)[1]}
            </h1>
            <p className="mt-1.5 max-w-xl text-[11px] leading-relaxed text-white/80 sm:mt-2 sm:text-sm md:text-base">
              {DISCOVERY_HEROES[mode].description}
            </p>
          </div>
        </div>
      </section>

      <DiscoveryTabs mode={mode} onModeChange={changeMode} searchTerm={query} />

      <div
        key={mode}
        className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300 motion-reduce:animate-none"
      >
      {(mode === "opportunities" || mode === "services") && (
        <Card className="gap-0 rounded-3xl border-border/60 bg-card py-0 shadow-[0_8px_24px_rgba(27,16,56,0.07)]">
          <CardContent className="space-y-3.5 p-3.5 sm:p-5">
            <div className="flex gap-2.5">
              <div className="relative min-w-0 flex-1">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={
                    mode === "opportunities"
                      ? "Search campaigns, roles, or skills"
                      : "Search services, providers, or skills"
                  }
                  aria-label={
                    mode === "opportunities"
                      ? "Search opportunities"
                      : "Search services"
                  }
                  className="h-11 rounded-xl border-border/70 bg-background pl-10 text-sm shadow-[0_2px_8px_rgba(27,16,56,0.04)]"
                />
              </div>
            </div>

            <div
              className="no-scrollbar flex gap-2 overflow-x-auto pb-1"
              role="group"
              aria-label="Browse categories"
            >
              {activeCategories.map(({ label, value }) => (
                (() => {
                  const Icon = getCategoryIcon(label);
                  const selected = category === (value ?? "");
                  return (
                    <button
                      key={label}
                      type="button"
                      aria-pressed={selected}
                      className={`flex h-[68px] w-[68px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-2xl border px-1.5 text-center text-[10px] font-semibold leading-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8614df] focus-visible:ring-offset-2 ${
                        selected
                          ? "border-[#8614df] bg-gradient-to-b from-[#a529f3] to-[#7410c9] text-white shadow-[0_5px_12px_rgba(126,19,205,0.25)]"
                          : "border-[#eee7f6] bg-gradient-to-b from-white to-[#faf7fd] text-[#494257] shadow-[0_2px_6px_rgba(27,16,56,0.05)] hover:border-[#d8c0f1] hover:text-[#7410c9]"
                      }`}
                      onClick={() => setCategory(value ?? "")}
                    >
                      <Icon aria-hidden="true" className="size-5" />
                      <span className="line-clamp-2">{label}</span>
                    </button>
                  );
                })()
              ))}
            </div>

            <div className="no-scrollbar flex gap-2 overflow-x-auto pb-0.5">
              <div className="relative w-[120px] shrink-0">
                <MapPin
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="Location"
                  aria-label="Location"
                  className="h-9 rounded-full border-border/70 bg-background pl-8 pr-2 text-xs shadow-[0_2px_6px_rgba(27,16,56,0.04)]"
                />
              </div>
              {mode === "opportunities" ? (
                <Select
                  value={gender || "any"}
                  onValueChange={(value) =>
                    setGender(value === "any" ? "" : value)
                  }
                >
                  <SelectTrigger aria-label="Gender" className="h-9 w-[126px] shrink-0 rounded-full border-border/70 bg-background px-3 text-xs shadow-[0_2px_6px_rgba(27,16,56,0.04)]">
                    <SelectValue placeholder="Any gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any gender</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="any gender">
                      Any gender specified
                    </SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Select
                  value={minimumRating || "any"}
                  onValueChange={(value) =>
                    setMinimumRating(value === "any" ? "" : value)
                  }
                >
                  <SelectTrigger aria-label="Minimum rating" className="h-9 w-[126px] shrink-0 rounded-full border-border/70 bg-background px-3 text-xs shadow-[0_2px_6px_rgba(27,16,56,0.04)]">
                    <SelectValue placeholder="Any rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any rating</SelectItem>
                    <SelectItem value="4">4 stars and up</SelectItem>
                    <SelectItem value="4.5">4.5 stars and up</SelectItem>
                  </SelectContent>
                </Select>
              )}
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger aria-label="Sort results" className="h-9 w-[126px] shrink-0 rounded-full border-border/70 bg-background px-3 text-xs shadow-[0_2px_6px_rgba(27,16,56,0.04)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mode === "opportunities" ? (
                    <>
                      <SelectItem value="newest">Most recent</SelectItem>
                      <SelectItem value="oldest">Oldest</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="highest_rating">Top rated</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {mode === "recruiters" ? (
        <RecruiterSearchPanel
          input={query}
          onSearchChange={setQuery}
          search={debouncedQuery}
        />
      ) : mode === "talent" ? (
        <Card className="gap-0 overflow-hidden rounded-2xl border-border/70 py-0 shadow-sm">
          <CardContent className="flex flex-col items-start gap-5 bg-gradient-to-br from-card to-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <div className="flex max-w-xl gap-4">
              <span className="hidden size-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary sm:grid">
                <Users aria-hidden="true" className="size-6" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  Talent directory
                </p>
                <h2 className="mt-1 text-xl font-bold">
                  Meet your next creative collaborator
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Search talent by name, profession, skills, location, and
                  availability.
                </p>
              </div>
            </div>
            <form
              action="/recruiter/find-talent/results"
              className="flex w-full max-w-md gap-2 sm:w-auto"
            >
              <div className="relative min-w-0 flex-1">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  name="q"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search talent or skills"
                  aria-label="Search talent"
                  className="h-11 min-w-0 rounded-xl bg-background pl-10"
                />
              </div>
              <Button type="submit" className="h-11 shrink-0 rounded-xl">
                Search
                <ArrowRight aria-hidden="true" className="ml-1 size-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : mode === "opportunities" && !isTalent ? (
        <Card className="rounded-2xl border-dashed border-border/80 bg-card/70 shadow-none">
          <CardContent className="flex flex-col items-center p-8 text-center sm:p-10">
            <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
              <Clapperboard aria-hidden="true" className="size-6" />
            </span>
            <h2 className="mt-4 font-semibold">
              {user
                ? "Opportunities are available to talent accounts"
                : "Sign in as talent to browse opportunities"}
            </h2>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Campaign listings are personalized and only available to signed-in
              talent.
            </p>
            {!user && (
              <Button asChild className="mt-4">
                <Link href="/auth/login">Log in</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : activeQuery.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Card key={index} className="h-56 animate-pulse bg-muted/50" />
          ))}
        </div>
      ) : activeQuery.isError ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="font-semibold">
              We couldn&apos;t load these results.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {getApiErrorMessage(
                activeQuery.error,
                "Please try again in a moment.",
              )}
            </p>
          </CardContent>
        </Card>
      ) : mode === "opportunities" ? (
        <section aria-label="Opportunities">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                For your next step
              </p>
              <h2 className="mt-1 text-lg font-bold tracking-tight">
                Open opportunities
              </h2>
            </div>
            <span className="shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
              {campaignsQuery.data?.length ?? 0} results
            </span>
          </div>
          {campaignsQuery.data?.length ? (
            <div className="space-y-3">
              {campaignsQuery.data.map((campaign) => (
                <OpportunityCard
                  key={campaign._id}
                  campaign={campaign}
                  canSave={isTalent}
                />
              ))}
            </div>
          ) : (
            <Card className="rounded-2xl border-dashed border-border/80 bg-card/70 shadow-none">
              <CardContent className="p-8 text-center">
                <p className="font-semibold">No matching opportunities</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try a different search or remove a filter.
                </p>
              </CardContent>
            </Card>
          )}
        </section>
      ) : (
        <section aria-label="Service providers">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Made for your project
              </p>
              <h2 className="mt-1 text-lg font-bold tracking-tight">
                Creative services and providers
              </h2>
            </div>
            <span className="shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
              {providersQuery.data?.total ?? 0} results
            </span>
          </div>
          {providersQuery.data?.data.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {providersQuery.data.data.map((provider) => (
                <ProviderResultCard key={provider.id} provider={provider} />
              ))}
            </div>
          ) : (
            <Card className="rounded-2xl border-dashed border-border/80 bg-card/70 shadow-none">
              <CardContent className="p-8 text-center">
                <div className="mx-auto grid size-12 place-items-center rounded-full bg-muted">
                  <Check
                    aria-hidden="true"
                    className="size-6 text-muted-foreground"
                  />
                </div>
                <p className="mt-3 font-semibold">No matching providers</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try a different search or remove a filter.
                </p>
              </CardContent>
            </Card>
          )}
        </section>
      )}
      </div>
    </div>
  );
}
