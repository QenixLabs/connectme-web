import type {
  ProviderDirectoryQuery,
  ServiceQuery,
} from "@/lib/api/marketplace";

const PAGE_SIZE = 12;

const providerSorts: NonNullable<ProviderDirectoryQuery["sort"]>[] = [
  "relevance",
  "newest",
  "highest_rating",
  "name_asc",
  "name_desc",
];

const serviceSorts: NonNullable<ServiceQuery["sort"]>[] = [
  "relevance",
  "newest",
  "oldest",
  "price_low",
  "price_high",
  "highest_rating",
];

function readPage(params: URLSearchParams): number {
  const page = Number(params.get("page") ?? "1");
  return Number.isFinite(page) && page > 0
    ? Math.min(10000, Math.floor(page))
    : 1;
}

function readRating(params: URLSearchParams): number | undefined {
  const raw = params.get("min_rating");
  if (!raw) return undefined;
  const rating = Number(raw);
  return Number.isFinite(rating) && rating >= 1 && rating <= 5
    ? rating
    : undefined;
}

function readPrice(params: URLSearchParams, name: string): number | undefined {
  const raw = params.get(name);
  if (raw === null || raw.trim() === "") return undefined;
  const price = Number(raw);
  return Number.isFinite(price) && price >= 0 && price <= 1_000_000_000
    ? price
    : undefined;
}

function readSort<T extends string>(
  params: URLSearchParams,
  allowed: T[],
): T {
  const value = params.get("sort");
  return allowed.includes(value as T) ? (value as T) : allowed[0];
}

export function readProviderDirectoryFilters(
  params: URLSearchParams,
): ProviderDirectoryQuery {
  return {
    search: params.get("search")?.trim() || undefined,
    category: params.get("category")?.trim() || undefined,
    location: params.get("location")?.trim() || undefined,
    min_rating: readRating(params),
    sort: readSort(params, providerSorts),
    page: readPage(params),
    limit: PAGE_SIZE,
  };
}

export function readServiceSearchFilters(params: URLSearchParams): ServiceQuery {
  const currency = params.get("currency")?.trim() ?? "";
  return {
    search: params.get("search")?.trim() || undefined,
    category: params.get("category")?.trim() || undefined,
    location: params.get("location")?.trim() || undefined,
    currency: /^[A-Za-z]{3}$/.test(currency) ? currency.toUpperCase() : undefined,
    min_price: readPrice(params, "min_price"),
    max_price: readPrice(params, "max_price"),
    min_rating: readRating(params),
    sort: readSort(params, serviceSorts),
    page: readPage(params),
    limit: PAGE_SIZE,
  };
}

export function updateMarketplaceSearchParams(
  current: URLSearchParams,
  patch: Record<string, string | undefined>,
  resetPage = true,
): URLSearchParams {
  const next = new URLSearchParams(current);
  for (const [key, value] of Object.entries(patch)) {
    if (value) next.set(key, value);
    else next.delete(key);
  }
  if (resetPage) next.delete("page");
  return next;
}
