"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Layers3,
  Package,
  Plus,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";
import { productsApi, type ProductListing } from "@/lib/api/products";
import {
  servicesApi,
  type MyServicesResponse,
  type ServiceListing,
} from "@/lib/api/marketplace";
import { getApiErrorMessage } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PAGE_SIZE = 50;
const EMPTY_ITEMS: PublishItem[] = [];

type PublishItem =
  | { type: "product"; item: ProductListing }
  | { type: "service"; item: ServiceListing };

type ItemStatus = "all" | "published" | "draft" | "paused";
type ListingType = "all" | "service" | "product";

const TYPE_FILTERS: Array<{ value: ListingType; label: string }> = [
  { value: "all", label: "Everything" },
  { value: "service", label: "Services" },
  { value: "product", label: "Products" },
];

const STATUS_FILTERS: Array<{ value: ItemStatus; label: string }> = [
  { value: "all", label: "All items" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
  { value: "paused", label: "Paused" },
];

async function getAllPages<T>(
  fetchPage: (page: number) => Promise<{ data: T[]; hasMore: boolean }>,
): Promise<T[]> {
  const items: T[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await fetchPage(page);
    items.push(...response.data);
    hasMore = response.hasMore;
    page += 1;
  }

  return items;
}

function itemStatus(item: PublishItem): Exclude<ItemStatus, "all"> {
  if (item.type === "product") {
    return item.item.status === "paused" ? "paused" : item.item.status;
  }
  return item.item.status === "unpublished" ? "paused" : item.item.status;
}

function itemDate(item: PublishItem): number {
  const date = item.item.updated_at ?? item.item.created_at;
  return date ? new Date(date).getTime() : 0;
}

function itemImage(item: PublishItem): string | undefined {
  if (item.type === "product") {
    return item.item.media.find((media) => media.type === "image")?.url;
  }
  return item.item.image_urls[0];
}

function itemPrice(item: PublishItem): string | null {
  if (item.type === "product") {
    const amount =
      item.item.pricing.mode === "single"
        ? item.item.pricing.price
        : item.item.variants[0]?.price;
    if (amount === undefined) return null;
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: item.item.pricing.currency || "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  }

  const price = item.item.indicative_price;
  if (!price) return null;
  const formatted = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: price.currency || "INR",
    maximumFractionDigits: 2,
  }).format(price.amount);
  return price.unit ? `${formatted} / ${price.unit}` : formatted;
}

function statusLabel(status: Exclude<ItemStatus, "all">): string {
  return status === "draft" ? "Draft" : status === "paused" ? "Paused" : "Published";
}

function statusClassName(status: Exclude<ItemStatus, "all">): string {
  if (status === "published") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "paused") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-slate-200 bg-slate-50 text-slate-600";
}

export default function ProviderPublishPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ItemStatus>("all");
  const [type, setType] = useState<ListingType>("all");
  const [isChoosingType, setIsChoosingType] = useState(false);

  const listingsQuery = useQuery({
    queryKey: ["provider", "publish", "items"],
    queryFn: async () => {
      const [products, services] = await Promise.all([
        getAllPages((page) =>
          productsApi.getMine({ status: "all", page, limit: PAGE_SIZE }),
        ),
        getAllPages((page): Promise<MyServicesResponse> =>
          servicesApi.getMine({ status: "all", sort: "recent", page, limit: PAGE_SIZE }),
        ),
      ]);
      return [
        ...products.map((item): PublishItem => ({ type: "product", item })),
        ...services.map((item): PublishItem => ({ type: "service", item })),
      ].sort((a, b) => itemDate(b) - itemDate(a));
    },
  });

  const items = listingsQuery.data ?? EMPTY_ITEMS;
  const counts = useMemo(
    () => ({
      all: items.length,
      services: items.filter((item) => item.type === "service").length,
      products: items.filter((item) => item.type === "product").length,
      published: items.filter((item) => itemStatus(item) === "published").length,
      draft: items.filter((item) => itemStatus(item) === "draft").length,
      paused: items.filter((item) => itemStatus(item) === "paused").length,
    }),
    [items],
  );
  const filteredItems = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    return items.filter((entry) => {
      const matchesStatus = status === "all" || itemStatus(entry) === status;
      const matchesType = type === "all" || entry.type === type;
      const title = (entry.item.title || "").toLocaleLowerCase();
      const category = (entry.item.category || "").toLocaleLowerCase();
      const description = (
        "short_description" in entry.item ? entry.item.short_description : ""
      )?.toLocaleLowerCase() ?? "";
      return (
        matchesStatus &&
        matchesType &&
        (!term ||
          title.includes(term) ||
          category.includes(term) ||
          description.includes(term))
      );
    });
  }, [items, search, status, type]);
  const hasActiveFilters = search.trim().length > 0 || status !== "all" || type !== "all";

  function clearFilters() {
    setSearch("");
    setStatus("all");
    setType("all");
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 pb-8 sm:space-y-6">
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2b0b72] via-[#5b21b6] to-[#7c3aed] p-5 text-white shadow-[0_24px_50px_-32px_rgba(76,29,149,0.85)] sm:p-8">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-24 size-56 rounded-full bg-white/10 blur-2xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 left-1/3 size-48 rounded-full bg-fuchsia-400/20 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">
              <Layers3 className="size-3.5" />
              Your business
            </p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-4xl">
              Your listings, together
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/80">
              Keep your services and products organized, and see what customers can find.
            </p>
          </div>
          <Button
            className="h-11 w-full shrink-0 rounded-xl bg-white px-5 font-semibold text-[#4c1d95] shadow-sm hover:bg-white/90 sm:w-auto"
            onClick={() => setIsChoosingType(true)}
          >
            <Plus className="mr-2 size-4" />
            Publish new item
          </Button>
        </div>
      </header>

      <section aria-label="Listing totals" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total listings", value: counts.all, icon: Layers3, tone: "bg-violet-50 text-violet-700" },
          { label: "Services", value: counts.services, icon: BriefcaseBusiness, tone: "bg-blue-50 text-blue-700", type: "service" as const },
          { label: "Products", value: counts.products, icon: Package, tone: "bg-fuchsia-50 text-fuchsia-700", type: "product" as const },
          { label: "Published", value: counts.published, icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-700", status: "published" as const },
        ].map((stat) => (
          <button
            key={stat.label}
            type="button"
            onClick={() => {
              setType(stat.type ?? "all");
              setStatus(stat.status ?? "all");
            }}
            aria-label={`Filter by ${stat.label.toLowerCase()}`}
            className="text-left"
          >
            <Card className={`h-full rounded-2xl border-slate-200 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${stat.type && type === stat.type ? "ring-2 ring-violet-300" : ""} ${stat.status && status === stat.status ? "ring-2 ring-violet-300" : ""}`}>
              <CardContent className="flex items-center gap-3 p-4">
                <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${stat.tone}`}>
                  <stat.icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-slate-500">{stat.label}</p>
                  <p className="text-xl font-bold text-slate-950">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </button>
        ))}
      </section>

      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardContent className="space-y-4 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-slate-950">Manage listings</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Search, filter, and update your marketplace items.
              </p>
            </div>
            <p className="text-sm font-medium text-slate-500" aria-live="polite">
              {listingsQuery.isLoading
                ? "Loading listings..."
                : `Showing ${filteredItems.length} of ${items.length}`}
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, category or description..."
                aria-label="Search your listings"
                className="h-11 rounded-xl pl-9"
              />
            </label>
            <div className="flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1" role="tablist" aria-label="Filter listings by type">
              {TYPE_FILTERS.map((filter) => {
                const count = filter.value === "all"
                  ? counts.all
                  : filter.value === "service"
                    ? counts.services
                    : counts.products;
                return (
                  <button
                    key={filter.value}
                    type="button"
                    role="tab"
                    aria-selected={type === filter.value}
                    onClick={() => setType(filter.value)}
                    className={`shrink-0 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                      type === filter.value
                        ? "bg-white text-violet-800 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {filter.label} <span className="ml-1 text-xs opacity-70">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
            <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filter listings by status">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                role="tab"
                aria-selected={status === filter.value}
                onClick={() => setStatus(filter.value)}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  status === filter.value
                    ? "border-violet-200 bg-violet-50 text-violet-800"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {filter.label} <span className="ml-1 opacity-70">({counts[filter.value]})</span>
              </button>
            ))}
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="shrink-0 text-slate-500">
                <X className="mr-1.5 size-4" />
                Clear filters
              </Button>
            )}
          </div>

          {listingsQuery.isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }, (_, index) => (
                <Skeleton key={index} className="h-64 rounded-2xl" />
              ))}
            </div>
          ) : listingsQuery.isError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
              <div className="flex items-center gap-2 font-semibold">
                <AlertCircle className="size-4" />
                Could not load your listings
              </div>
              <p className="mt-1">{getApiErrorMessage(listingsQuery.error, "Please try again.")}</p>
              <Button
                variant="outline"
                className="mt-3"
                onClick={() => void listingsQuery.refetch()}
              >
                Try again
              </Button>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-violet-200 bg-gradient-to-b from-violet-50/70 to-white px-5 py-10 text-center">
              <div className="max-w-sm">
                <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-white text-violet-700 shadow-sm">
                  {items.length > 0 ? <Search className="size-6" /> : <Package className="size-6" />}
                </span>
                <h2 className="mt-4 font-semibold text-slate-950">
                  {items.length === 0
                    ? "Your listing space is ready"
                    : hasActiveFilters
                      ? "No listings match these filters"
                      : "No listings here yet"}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {items.length === 0
                    ? "Publish a service or product to help customers discover your business."
                    : hasActiveFilters
                      ? "Try changing the type, status, or search term."
                      : `Add your first ${type === "all" ? "listing" : type} to get started.`}
                </p>
                {hasActiveFilters ? (
                  <Button variant="outline" className="mt-4 rounded-xl" onClick={clearFilters}>
                    Clear filters
                  </Button>
                ) : (
                  <Button
                    className="mt-4 rounded-xl bg-violet-700 hover:bg-violet-800"
                    onClick={() => setIsChoosingType(true)}
                  >
                    <Plus className="mr-2 size-4" />
                    Publish {items.length === 0 ? "your first item" : `a ${type}`}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filteredItems.map((entry) => {
                const image = itemImage(entry);
                const statusValue = itemStatus(entry);
                const isProduct = entry.type === "product";
                const editHref = isProduct
                  ? `/provider/products/${encodeURIComponent(entry.item.id)}/edit`
                  : `/provider/services/${encodeURIComponent(entry.item.id)}/edit`;
                return (
                  <article
                    key={`${entry.type}-${entry.item.id}`}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-950/5"
                  >
                    <div className="relative aspect-[1.8] overflow-hidden bg-gradient-to-br from-violet-50 to-slate-100">
                      {image ? (
                        <Image
                          src={image}
                          alt={entry.item.title}
                          fill
                          unoptimized
                          sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="grid size-full place-items-center text-violet-300">
                          {isProduct ? (
                            <Package className="size-10" />
                          ) : (
                            <BriefcaseBusiness className="size-10" />
                          )}
                        </div>
                      )}
                      <Badge
                        variant="outline"
                        className={`absolute left-3 top-3 ${statusClassName(statusValue)}`}
                      >
                        {statusLabel(statusValue)}
                      </Badge>
                      <Badge variant="outline" className="absolute right-3 top-3 border-white/80 bg-white/95 text-slate-700">
                        {isProduct ? "Product" : "Service"}
                      </Badge>
                    </div>
                    <div className="space-y-3 p-4">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-violet-700">
                        {isProduct ? <Package className="size-3.5" /> : <BriefcaseBusiness className="size-3.5" />}
                        {entry.item.category || "Uncategorized"}
                      </div>
                      <h2 className="truncate font-semibold text-slate-950">
                        {entry.item.title || "Untitled listing"}
                      </h2>
                      <p className="line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
                        {entry.item.short_description || entry.item.description || "Add a description to help customers understand this listing."}
                      </p>
                      <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {itemPrice(entry) ?? "Price not set"}
                        </p>
                        <Button asChild size="sm" variant="outline" className="shrink-0 rounded-lg">
                          <Link href={editHref}>
                            Manage
                            <ArrowRight className="ml-1.5 size-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isChoosingType} onOpenChange={setIsChoosingType}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>What would you like to publish?</DialogTitle>
            <DialogDescription>
              Choose a listing type to continue with its existing setup flow.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              asChild
              variant="outline"
              className="h-auto justify-start gap-3 rounded-xl p-4 text-left"
            >
              <Link href="/provider/services/new">
                <ShoppingBag className="size-5 shrink-0 text-violet-700" />
                <span>
                  <span className="block font-semibold">Service</span>
                  <span className="mt-1 block whitespace-normal text-xs font-normal text-slate-500">
                    Offer a professional service to customers.
                  </span>
                </span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-auto justify-start gap-3 rounded-xl p-4 text-left"
            >
              <Link href="/provider/products/new">
                <Package className="size-5 shrink-0 text-violet-700" />
                <span>
                  <span className="block font-semibold">Product</span>
                  <span className="mt-1 block whitespace-normal text-xs font-normal text-slate-500">
                    List a physical or digital product.
                  </span>
                </span>
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
