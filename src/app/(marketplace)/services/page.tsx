"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Briefcase,
  CalendarDays,
  Camera,
  Code2,
  GraduationCap,
  LayoutGrid,
  List,
  Music2,
  Palette,
  Scissors,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Store,
  X,
} from "lucide-react";
import { useStore } from "zustand/react";
import { servicesApi } from "@/lib/api/marketplace";
import type { ServiceQuery } from "@/lib/api/marketplace";
import { getApiErrorMessage } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { SERVICE_CATEGORIES } from "@/lib/service-catalog";
import { authStore } from "@/stores/auth-store";
import {
  readServiceSearchFilters,
  updateMarketplaceSearchParams,
} from "@/lib/marketplace-search";
import { ServiceCard } from "@/components/marketplace/service-card";
import { DiscoveryTabs } from "@/components/marketplace/discovery-tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const PAGE_SIZE = 12;
const SERVICE_SHORTCUTS = [
  { label: "Photography & Video", category: "Photography & Video", icon: Camera, tone: "bg-blue-50 text-blue-600" },
  { label: "Studios & Locations", category: "Studios & Venues", icon: Building2, tone: "bg-violet-50 text-violet-600" },
  { label: "Makeup & Styling", category: "Makeup & Styling", icon: Scissors, tone: "bg-orange-50 text-orange-600" },
  { label: "Equipment Rental", category: "Equipment Rental", icon: Camera, tone: "bg-cyan-50 text-cyan-700" },
  { label: "Post-Production & Editing", category: "Post-Production", icon: Code2, tone: "bg-purple-50 text-purple-600" },
  { label: "Music & Audio Production", category: "Sound & Music", icon: Music2, tone: "bg-sky-50 text-sky-600" },
  { label: "Training & Workshops", category: "Training & Coaching", icon: GraduationCap, tone: "bg-teal-50 text-teal-700" },
  { label: "Production Services", category: "Production Services", icon: CalendarDays, tone: "bg-rose-50 text-rose-600" },
  { label: "Marketing & PR", category: "Marketing & PR", icon: Palette, tone: "bg-amber-50 text-amber-700" },
  { label: "Creative Services", category: "Other Specialized", icon: Sparkles, tone: "bg-indigo-50 text-indigo-600" },
] as const;

const SORT_OPTIONS: {
  value: NonNullable<ServiceQuery["sort"]>;
  label: string;
}[] = [
  { value: "relevance", label: "Best match" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "price_low", label: "Price: low to high" },
  { value: "price_high", label: "Price: high to low" },
  { value: "highest_rating", label: "Highest rated" },
];

function ServiceFilters({
  filters,
  categories,
  locations,
  currencies,
  onChange,
  onClear,
}: {
  filters: ServiceQuery;
  categories: readonly string[];
  locations: string[];
  currencies: string[];
  onChange: (patch: Record<string, string | undefined>) => void;
  onClear: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Filters</h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-primary"
          onClick={onClear}
        >
          Clear all
        </Button>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold">Category</label>
        <Select
          value={filters.category ?? "all"}
          onValueChange={(value) =>
            onChange({ category: value === "all" ? undefined : value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold">Location</label>
        <Select
          value={filters.location ?? "all"}
          onValueChange={(value) =>
            onChange({ location: value === "all" ? undefined : value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Anywhere" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Anywhere</SelectItem>
            {locations.map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold">Price range</label>
        <Select
          value={filters.currency ?? "INR"}
          onValueChange={(value) => onChange({ currency: value })}
        >
          <SelectTrigger aria-label="Price currency">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(currencies.length ? currencies : ["INR"]).map((currency) => (
              <SelectItem key={currency} value={currency}>
                {currency}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            aria-label={`Minimum price in ${filters.currency ?? "INR"}`}
            value={filters.min_price?.toString() ?? ""}
            onChange={(event) =>
              onChange({
                min_price:
                  event.target.value && Number(event.target.value) >= 0
                    ? event.target.value
                    : undefined,
                currency: filters.currency ?? "INR",
              })
            }
            placeholder="Min"
          />
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            aria-label={`Maximum price in ${filters.currency ?? "INR"}`}
            value={filters.max_price?.toString() ?? ""}
            onChange={(event) =>
              onChange({
                max_price:
                  event.target.value && Number(event.target.value) >= 0
                    ? event.target.value
                    : undefined,
                currency: filters.currency ?? "INR",
              })
            }
            placeholder="Max"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold">Minimum rating</label>
        <Select
          value={filters.min_rating?.toString() ?? "any"}
          onValueChange={(value) =>
            onChange({ min_rating: value === "any" ? undefined : value })
          }
        >
          <SelectTrigger aria-label="Minimum rating">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any rating</SelectItem>
            <SelectItem value="4">4 stars and up</SelectItem>
            <SelectItem value="3">3 stars and up</SelectItem>
            <SelectItem value="2">2 stars and up</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function ServicesBrowser() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const user = useStore(authStore, (state) => state.user);
  const hasHydrated = useStore(authStore, (state) => state.hasHydrated);
  const isServiceProvider =
    user?.role === "provider" || (user?.account_capabilities ?? []).includes("provider");
  const filters = useMemo(
    () => readServiceSearchFilters(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const [searchInput, setSearchInput] = useState(filters.search ?? "");
  const [view, setView] = useState<"grid" | "list">("list");
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const [syncedSearch, setSyncedSearch] = useState(filters.search ?? "");
  if (syncedSearch !== (filters.search ?? "")) {
    setSyncedSearch(filters.search ?? "");
    setSearchInput(filters.search ?? "");
  }

  function pushParams(
    patch: Record<string, string | undefined>,
    resetPage = true,
  ) {
    const next = updateMarketplaceSearchParams(
      new URLSearchParams(searchParams.toString()),
      patch,
      resetPage,
    );
    const query = next.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function clearFilters() {
    setSearchInput("");
    pushParams({
      search: undefined,
      category: undefined,
      location: undefined,
      currency: undefined,
      min_price: undefined,
      max_price: undefined,
      min_rating: undefined,
      sort: undefined,
    });
  }

  useEffect(() => {
    const current = filters.search ?? "";
    if (searchInput.trim() === current) return;
    const timer = setTimeout(() => {
      pushParams({ search: searchInput.trim() || undefined });
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const { page: initialPage = 1, ...listingFilters } = filters;
  const listingsQuery = useInfiniteQuery({
    queryKey: queryKeys.services.publicList(filters as Record<string, unknown>),
    queryFn: ({ pageParam, signal }) =>
      servicesApi.getPublicListings(
        { ...listingFilters, page: pageParam, limit: PAGE_SIZE },
        signal,
      ),
    initialPageParam: initialPage,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
  });
  const facetsQuery = useQuery({
    queryKey: queryKeys.services.facets(),
    queryFn: servicesApi.getFacets,
    staleTime: 5 * 60 * 1000,
  });

  const data = listingsQuery.data;
  const {
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = listingsQuery;
  const services = data?.pages.flatMap((page) => page.data) ?? [];
  const total = data?.pages[0]?.total ?? 0;
  const categories = SERVICE_CATEGORIES;
  const selectedCategoryIsHidden = SERVICE_SHORTCUTS.slice(4).find(
    ({ category }) => category === filters.category,
  );
  const visibleCategories =
    showAllCategories
      ? SERVICE_SHORTCUTS
      : selectedCategoryIsHidden
        ? [...SERVICE_SHORTCUTS.slice(0, 4), selectedCategoryIsHidden]
        : SERVICE_SHORTCUTS.slice(0, 4);
  const locations = facetsQuery.data?.locations ?? [];
  const currencies = facetsQuery.data?.currencies ?? ["INR"];
  const activeFilters = [
    filters.search,
    filters.category,
    filters.location,
    filters.currency,
    filters.min_price !== undefined,
    filters.max_price !== undefined,
    filters.min_rating !== undefined,
  ].filter(Boolean);

  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (
      !sentinel ||
      !hasNextPage ||
      isFetchingNextPage ||
      isFetchNextPageError
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.unobserve(sentinel);
          void fetchNextPage();
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [
    fetchNextPage,
    hasNextPage,
    isFetchNextPageError,
    isFetchingNextPage,
  ]);

  return (
    <div className="space-y-7 pb-8">
      <div className="hidden sm:block">
        <DiscoveryTabs />
      </div>

      <section className="relative isolate flex min-h-[300px] overflow-hidden rounded-3xl bg-slate-950 shadow-md sm:min-h-[360px]">
        <Image
          src="/providers-marketplace-hero.png"
          alt=""
          fill
          priority
          sizes="(max-width: 640px) 100vw, 1152px"
          className="object-cover object-[66%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/65 to-slate-950/20 sm:bg-gradient-to-r sm:from-slate-950/90 sm:via-slate-950/55 sm:to-slate-950/10" />
        <div className="relative flex w-full flex-col justify-end px-4 py-5 sm:max-w-3xl sm:px-8 sm:py-8">
          <Badge className="mb-3 w-fit gap-1.5 rounded-full border-white/25 bg-white/10 text-white backdrop-blur">
            <Sparkles className="size-3.5 text-amber-300" />
            Creative services, all in one place
          </Badge>
          <h1 className="max-w-2xl text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
            Find trusted creative services for your next project
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/85 sm:text-base">
            From studios and equipment to production, find the right people and places in one search.
          </p>

          <div className="mt-4 flex w-full max-w-2xl items-center gap-2 rounded-xl bg-white p-1.5 shadow-lg sm:mt-6 sm:rounded-full sm:p-2">
            <Search className="ml-2 size-5 shrink-0 text-slate-500" />
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  pushParams({ search: searchInput.trim() || undefined });
                }
              }}
              placeholder="Search services, providers..."
              className="h-11 min-w-0 border-0 bg-transparent text-slate-900 shadow-none placeholder:text-slate-500 focus-visible:ring-0"
              aria-label="Search services"
            />
            {searchInput && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearchInput("")}
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="size-4" />
              </button>
            )}
            <Button
              type="button"
              aria-label="Search services"
              onClick={() => pushParams({ search: searchInput.trim() || undefined })}
              className="h-11 shrink-0 rounded-lg bg-orange-500 px-4 text-white hover:bg-orange-600 sm:rounded-full"
            >
              <Search className="size-4 sm:mr-2" />
              <span className="hidden sm:inline">Search</span>
            </Button>
          </div>
        </div>
      </section>

      <section aria-label="Browse service categories">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight sm:text-xl">Explore Categories</h2>
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">Find the right service for your project</p>
          </div>
          {filters.category && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => pushParams({ category: undefined })}
            >
              Clear category
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-expanded={showAllCategories}
            onClick={() => setShowAllCategories((expanded) => !expanded)}
          >
            {showAllCategories ? "Show less" : "Show all"}
          </Button>
        </div>
        <div
          className={`grid gap-1.5 sm:gap-3 ${
            showAllCategories
              ? "grid-cols-2"
              : "grid-cols-4 md:grid-cols-5"
          }`}
        >
          {visibleCategories.map(({ label, category, icon: Icon, tone }) => {
            const selected = filters.category === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() =>
                  pushParams({ category: selected ? undefined : category })
                }
                aria-pressed={selected}
                className={`flex min-h-[100px] flex-col items-center justify-center gap-1.5 rounded-2xl border bg-card px-1.5 py-2 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:min-h-[108px] sm:gap-2 sm:px-2 ${
                  selected ? "border-orange-400 ring-2 ring-orange-100" : "border-border/70"
                }`}
              >
                <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${tone}`}>
                  <Icon className="size-5" />
                </span>
                <span className="line-clamp-3 text-[9px] font-semibold leading-tight sm:max-w-28 sm:text-xs">
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {services.length > 0 && (
        <section aria-label="Featured services">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight sm:text-xl">
                Featured Services
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                Discover popular services from independent providers
              </p>
            </div>
            <Link
              href="#service-list"
              className="flex shrink-0 items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 sm:text-sm"
            >
              View all <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
            {services.slice(0, 6).map((service) => (
              <ServiceCard
                key={`featured-${service.id}`}
                service={service}
                layout="featured"
              />
            ))}
          </div>
        </section>
      )}

      <section
        id="service-list"
        className="scroll-mt-20 grid items-start gap-6 lg:grid-cols-[250px_minmax(0,1fr)]"
      >
        <aside className="sticky top-24 hidden rounded-2xl border bg-card p-5 lg:block">
          <ServiceFilters
            filters={filters}
            categories={categories}
            locations={locations}
            currencies={currencies}
            onChange={pushParams}
            onClear={clearFilters}
          />
        </aside>

        <div className="min-w-0">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold tracking-tight sm:text-xl">
                {activeFilters.length === 0 ? "Recommended services" : "Services for you"}
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {listingsQuery.isLoading
                  ? "Finding services…"
                  : listingsQuery.hasNextPage
                    ? `${services.length} of ${total} services loaded`
                    : `${total} service${total === 1 ? "" : "s"} found`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Sheet
                open={mobileFiltersOpen}
                onOpenChange={setMobileFiltersOpen}
              >
                <SheetTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="lg:hidden"
                  >
                    <SlidersHorizontal className="size-4" />
                    Filters
                    {activeFilters.length > 0 && (
                      <span className="ml-1 grid size-5 place-items-center rounded-full bg-primary text-[11px] text-primary-foreground">
                        {activeFilters.length}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-[min(22rem,90vw)] overflow-y-auto p-5"
                >
                  <SheetTitle className="mb-5 pr-8">Filter services</SheetTitle>
                  <ServiceFilters
                    filters={filters}
                    categories={categories}
                    locations={locations}
                    currencies={currencies}
                    onChange={pushParams}
                    onClear={clearFilters}
                  />
                </SheetContent>
              </Sheet>

              <Select
                value={filters.sort ?? "relevance"}
                onValueChange={(value) =>
                  pushParams({
                    sort: value === "relevance" ? undefined : value,
                    currency:
                      value === "price_low" || value === "price_high"
                        ? filters.currency ?? "INR"
                        : filters.currency || undefined,
                  })
                }
              >
                <SelectTrigger className="w-40" aria-label="Sort services">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="hidden items-center rounded-lg border p-0.5 sm:flex">
                <Button
                  type="button"
                  variant={view === "grid" ? "secondary" : "ghost"}
                  size="icon-sm"
                  aria-label="Grid view"
                  aria-pressed={view === "grid"}
                  onClick={() => setView("grid")}
                >
                  <LayoutGrid className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant={view === "list" ? "secondary" : "ghost"}
                  size="icon-sm"
                  aria-label="List view"
                  aria-pressed={view === "list"}
                  onClick={() => setView("list")}
                >
                  <List className="size-4" />
                </Button>
              </div>
            </div>
          </div>

          {activeFilters.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {filters.search && (
                <FilterChip
                  label={`Search: ${filters.search}`}
                  onRemove={() => {
                    setSearchInput("");
                    pushParams({ search: undefined });
                  }}
                />
              )}
              {filters.category && (
                <FilterChip
                  label={filters.category}
                  onRemove={() => pushParams({ category: undefined })}
                />
              )}
              {filters.location && (
                <FilterChip
                  label={filters.location}
                  onRemove={() => pushParams({ location: undefined })}
                />
              )}
              {filters.currency && (
                <FilterChip
                  label={`Currency: ${filters.currency}`}
                  onRemove={() => pushParams({ currency: undefined })}
                />
              )}
              {filters.min_price !== undefined && (
                <FilterChip
                  label={`Min: ${filters.min_price} ${filters.currency ?? "INR"}`}
                  onRemove={() => pushParams({ min_price: undefined })}
                />
              )}
              {filters.max_price !== undefined && (
                <FilterChip
                  label={`Max: ${filters.max_price} ${filters.currency ?? "INR"}`}
                  onRemove={() => pushParams({ max_price: undefined })}
                />
              )}
              {filters.min_rating !== undefined && (
                <FilterChip
                  label={`${filters.min_rating}+ stars`}
                  onRemove={() => pushParams({ min_rating: undefined })}
                />
              )}
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto px-1 text-xs"
                onClick={clearFilters}
              >
                Clear all
              </Button>
            </div>
          )}

          {listingsQuery.isLoading ? (
            <div
              className={`grid gap-5 ${
                view === "grid" ? "sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
              }`}
            >
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-80 rounded-xl" />
              ))}
            </div>
          ) : listingsQuery.isError && !listingsQuery.data ? (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertTitle>Could not load services</AlertTitle>
              <AlertDescription>
                {getApiErrorMessage(
                  listingsQuery.error,
                  "Please try again in a moment.",
                )}
              </AlertDescription>
            </Alert>
          ) : services.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center p-12 text-center">
                <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Briefcase className="size-6" />
                </span>
                <h2 className="mt-4 text-xl font-semibold">
                  No services match your filters
                </h2>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  Try a broader search term, a different category, or clear the
                  filters to see all published services.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  onClick={clearFilters}
                >
                  Clear filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div
              className={`grid gap-5 ${
                view === "grid" ? "sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
              }`}
            >
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  layout={view}
                />
              ))}
            </div>
          )}

          {isFetchNextPageError && (
            <Alert variant="destructive" className="mt-6">
              <AlertCircle className="size-4" />
              <AlertTitle>Could not load more services</AlertTitle>
              <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
                <span>
                  {getApiErrorMessage(
                    listingsQuery.error,
                    "Please try again in a moment.",
                  )}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void fetchNextPage()}
                >
                  Try again
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {(hasNextPage || isFetchingNextPage) && (
            <div
              ref={loadMoreRef}
              className="mt-8 flex min-h-10 items-center justify-center text-sm text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              {isFetchingNextPage && (
                <>
                  <span className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                  Loading more services…
                </>
              )}
            </div>
          )}
          {!hasNextPage && services.length > 0 && (
            <p className="mt-8 text-center text-sm text-muted-foreground">
              You’ve reached the end of the services.
            </p>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-2xl bg-primary/5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <Star className="size-5" />
          </span>
          <div>
            <h2 className="font-semibold">Find the right person for your project</h2>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Browse provider profiles to see their services, work, and ways to
              get in touch.
            </p>
          </div>
        </div>
        <Button asChild variant="outline" className="shrink-0 border-success/30 text-success hover:bg-success/10">
          <Link href="/providers">
            Browse providers <ArrowRight className="size-4" />
          </Link>
        </Button>
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-success/20 bg-success/5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <h2 className="font-semibold">Looking for your next project?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Explore campaigns and connect with recruiters on RootIn.
          </p>
        </div>
        <Button asChild variant="outline" className="shrink-0 border-success/30 text-success hover:bg-success/10">
          <Link href="/talent/opportunities">
            Explore Opportunities <ArrowRight className="size-4" />
          </Link>
        </Button>
      </section>

      {hasHydrated && !isServiceProvider && (
        <section className="flex flex-col gap-4 rounded-2xl border border-orange-200 bg-orange-50 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-orange-100 text-orange-700">
              <Store className="size-5" />
            </span>
            <div>
              <h2 className="font-semibold text-slate-900">Offer your creative services</h2>
              <p className="mt-1 text-sm text-slate-600">
                Create a provider profile and connect with clients looking for your expertise.
              </p>
            </div>
          </div>
          <Button asChild className="shrink-0 bg-orange-500 text-white hover:bg-orange-600">
            <Link href="/provider/onboarding">
              Join as a provider <ArrowRight className="size-4" />
            </Link>
          </Button>
        </section>
      )}
    </div>
  );
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <Badge variant="secondary" className="gap-1 font-normal">
      {label}
      <button type="button" aria-label={`Remove ${label}`} onClick={onRemove}>
        <X className="size-3" />
      </button>
    </Badge>
  );
}

export default function ServicesPage() {
  return (
    <Suspense
      fallback={
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-80 rounded-xl" />
          ))}
        </div>
      }
    >
      <ServicesBrowser />
    </Suspense>
  );
}
