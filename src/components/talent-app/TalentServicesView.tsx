"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { CategoryChips } from "@/components/marketplace/CategoryChips";
import { ServiceCard } from "@/components/marketplace/ServiceCard";
import { ServiceCardSkeleton } from "@/components/marketplace/ServiceCardSkeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/api/client";
import { servicesApi, type ServiceQuery } from "@/lib/api/marketplace";
import { MARKETPLACE_CATEGORIES } from "@/lib/marketplace-categories";
import { queryKeys } from "@/lib/api/query-keys";

const PAGE_SIZE = 12;

export function TalentServicesView({ initialSearch = "" }: { initialSearch?: string }) {
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedSearch(search.trim()),
      300,
    );
    return () => window.clearTimeout(timer);
  }, [search]);

  const filters = useMemo<ServiceQuery>(
    () => ({
      search: debouncedSearch || undefined,
      category: selectedCategory,
      sort: "newest",
      limit: PAGE_SIZE,
    }),
    [debouncedSearch, selectedCategory],
  );
  const servicesQuery = useInfiniteQuery({
    queryKey: queryKeys.services.publicList(filters as Record<string, unknown>),
    queryFn: ({ pageParam, signal }) =>
      servicesApi.getPublicListings(
        { ...filters, page: pageParam, limit: PAGE_SIZE },
        signal,
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
  });
  const services =
    servicesQuery.data?.pages.flatMap((page) => page.data) ?? [];
  const total = servicesQuery.data?.pages[0]?.total ?? 0;
  const {
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = servicesQuery;

  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (
      !sentinel ||
      !hasNextPage ||
      isFetchingNextPage ||
      isFetchNextPageError ||
      typeof IntersectionObserver === "undefined"
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
    isFetchingNextPage,
    isFetchNextPageError,
  ]);

  return (
    <div className="mx-4 space-y-4">
      <Card className="gap-0 rounded-3xl border-border/60 bg-card py-0 shadow-[0_8px_24px_rgba(27,16,56,0.07)]">
        <CardContent className="p-3.5 sm:p-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search creative services"
              aria-label="Search services"
              className="h-11 rounded-xl border-border/70 bg-background pl-10 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      <CategoryChips
        categories={MARKETPLACE_CATEGORIES}
        selectedCategory={selectedCategory}
        onSelect={setSelectedCategory}
      />

      <section aria-label="Creative services">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Marketplace
            </p>
            <h2 className="mt-1 text-lg font-bold tracking-tight">
              Creative services
            </h2>
          </div>
          <span className="shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
            {total} results
          </span>
        </div>

        {servicesQuery.isError && !servicesQuery.data ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="font-semibold">We couldn&apos;t load services.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {getApiErrorMessage(
                  servicesQuery.error,
                  "Please try again in a moment.",
                )}
              </p>
            </CardContent>
          </Card>
        ) : servicesQuery.isLoading ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <ServiceCardSkeleton key={index} />
            ))}
          </div>
        ) : services.length ? (
          <>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
            {isFetchNextPageError && (
              <p className="mt-4 text-center text-sm text-red-700" role="alert">
                Couldn&apos;t load more services. Use the button below to retry.
              </p>
            )}
            {isFetchingNextPage && (
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3">
                {Array.from({ length: 3 }, (_, index) => (
                  <ServiceCardSkeleton key={index} />
                ))}
              </div>
            )}
            {hasNextPage && (
              <div className="mt-5 flex flex-col items-center gap-3">
                <div
                  ref={loadMoreRef}
                  className="h-1 w-full"
                  aria-hidden="true"
                />
                <button
                  type="button"
                  onClick={() => void fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 ring-1 ring-slate-300 transition-colors hover:ring-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-700 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60 motion-reduce:transition-none"
                >
                  {isFetchingNextPage
                    ? "Loading more services…"
                    : "Load more services"}
                </button>
              </div>
            )}
            {!hasNextPage && (
              <p className="mt-6 text-center text-sm text-slate-600">
                You&apos;ve reached the end of the services.
              </p>
            )}
          </>
        ) : (
          <Card className="rounded-2xl border-dashed border-border/80 bg-card/70 shadow-none">
            <CardContent className="p-8 text-center">
              <p className="font-semibold">No matching services</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try a different search.
              </p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
