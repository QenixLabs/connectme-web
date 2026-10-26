"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Briefcase, Search, SlidersHorizontal, X } from "lucide-react";
import { servicesApi } from "@/lib/api/marketplace";
import type { ServiceQuery } from "@/lib/api/marketplace";
import { getApiErrorMessage } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { ServiceCard } from "@/components/marketplace/service-card";
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

const PAGE_SIZE = 12;

const SORT_OPTIONS: { value: NonNullable<ServiceQuery["sort"]>; label: string }[] = [
  { value: "relevance", label: "Best match" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "price_low", label: "Price: low to high" },
  { value: "price_high", label: "Price: high to low" },
];

function readFilters(params: URLSearchParams): ServiceQuery {
  const page = Number(params.get("page") ?? "1");
  const sortParam = params.get("sort") ?? "relevance";
  const sort = SORT_OPTIONS.some((option) => option.value === sortParam)
    ? (sortParam as NonNullable<ServiceQuery["sort"]>)
    : "relevance";

  return {
    search: params.get("search")?.trim() || undefined,
    category: params.get("category")?.trim() || undefined,
    location: params.get("location")?.trim() || undefined,
    sort,
    page: Number.isFinite(page) && page > 0 ? Math.floor(page) : 1,
    limit: PAGE_SIZE,
  };
}

function ServicesBrowser() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo(
    () => readFilters(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const [searchInput, setSearchInput] = useState(filters.search ?? "");

  /* Render-phase sync: when the URL search term changes (refresh, back/forward,
     shared links) mirror it into the input. Keyed by the last synced value so
     active typing is never clobbered. */
  const [syncedSearch, setSyncedSearch] = useState(filters.search ?? "");
  if (syncedSearch !== (filters.search ?? "")) {
    setSyncedSearch(filters.search ?? "");
    setSearchInput(filters.search ?? "");
  }

  function pushParams(patch: Record<string, string | undefined>, resetPage = true) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    if (resetPage) next.delete("page");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
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

  const listingsQuery = useQuery({
    queryKey: queryKeys.services.publicList(filters as Record<string, unknown>),
    queryFn: () => servicesApi.getPublicListings(filters),
  });

  const facetsQuery = useQuery({
    queryKey: queryKeys.services.facets(),
    queryFn: servicesApi.getFacets,
    staleTime: 5 * 60 * 1000,
  });

  const data = listingsQuery.data;
  const services = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const activeFilters = [filters.search, filters.category, filters.location].filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
        <h1 className="text-3xl font-bold tracking-tight">Find a service provider</h1>
        <p className="mt-1 max-w-2xl text-muted-foreground">
          Browse services published by verified providers. Compare indicative pricing and contact
          the provider directly — no booking is handled by RootIn.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search services, categories, or locations"
              className="pl-9"
              aria-label="Search services"
            />
            {searchInput && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearchInput("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Category</label>
              <Select
                value={filters.category ?? "all"}
                onValueChange={(value) =>
                  pushParams({ category: value === "all" ? undefined : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {(facetsQuery.data?.categories ?? []).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Location</label>
              <Select
                value={filters.location ?? "all"}
                onValueChange={(value) =>
                  pushParams({ location: value === "all" ? undefined : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Anywhere" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Anywhere</SelectItem>
                  {(facetsQuery.data?.locations ?? []).map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Sort by</label>
              <Select
                value={filters.sort ?? "relevance"}
                onValueChange={(value) => pushParams({ sort: value === "relevance" ? undefined : value })}
              >
                <SelectTrigger>
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
            </div>
          </div>

          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <SlidersHorizontal className="size-3.5" />
                Filters
              </span>
              {filters.search && (
                <FilterChip
                  label={`Search: ${filters.search}`}
                  onRemove={() => pushParams({ search: undefined })}
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
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto px-1 text-xs"
                onClick={() => {
                  setSearchInput("");
                  pushParams({
                    search: undefined,
                    category: undefined,
                    location: undefined,
                    sort: undefined,
                  });
                }}
              >
                Clear all
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {listingsQuery.isLoading
            ? "Loading services…"
            : `${total} service${total === 1 ? "" : "s"} found`}
        </p>
        {totalPages > 1 && (
          <p className="text-sm text-muted-foreground">
            Page {filters.page ?? 1} of {totalPages}
          </p>
        )}
      </div>

      {listingsQuery.isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-80 rounded-xl" />
          ))}
        </div>
      ) : listingsQuery.isError ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Could not load services</AlertTitle>
          <AlertDescription>
            {getApiErrorMessage(listingsQuery.error, "Please try again in a moment.")}
          </AlertDescription>
        </Alert>
      ) : services.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center p-12 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Briefcase className="size-6" />
            </span>
            <h2 className="mt-4 text-xl font-semibold">No services match your filters</h2>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Try a broader search term, a different category, or clear the filters to see all
              published services.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchInput("");
                pushParams({
                  search: undefined,
                  category: undefined,
                  location: undefined,
                  sort: undefined,
                });
              }}
            >
              Clear filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={(filters.page ?? 1) <= 1}
            onClick={() => pushParams({ page: String((filters.page ?? 1) - 1) }, false)}
          >
            Previous
          </Button>
          <span className="px-2 text-sm text-muted-foreground">
            {filters.page ?? 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={(filters.page ?? 1) >= totalPages}
            onClick={() => pushParams({ page: String((filters.page ?? 1) + 1) }, false)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
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
