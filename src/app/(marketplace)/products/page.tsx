"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertCircle, Package, Search, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { productsApi } from "@/lib/api/products";
import { getApiErrorMessage } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const PAGE_SIZE = 12;

export default function PublicProductsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const filters = useMemo(
    () => ({
      search: search.trim() || undefined,
      category: category || undefined,
      page,
      limit: PAGE_SIZE,
    }),
    [category, page, search],
  );
  const listingsQuery = useQuery({
    queryKey: queryKeys.products.publicList(filters),
    queryFn: ({ signal }) => productsApi.getPublicListings(filters, signal),
  });
  const categoriesQuery = useQuery({
    queryKey: queryKeys.products.categories(),
    queryFn: productsApi.getCategories,
  });
  const products = listingsQuery.data?.data ?? [];
  const totalPages = Math.max(
    1,
    Math.ceil((listingsQuery.data?.total ?? 0) / PAGE_SIZE),
  );

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-violet-100 bg-gradient-to-br from-white to-violet-50 p-5 sm:p-8">
        <p className="text-sm font-semibold text-violet-700">RootIn Marketplace</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          Products from creative providers
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Explore costumes, props, equipment, and digital products listed by
          service providers.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_260px]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search products..."
            aria-label="Search products"
            className="h-11 rounded-xl bg-white pl-9"
          />
        </label>
        <select
          value={category}
          onChange={(event) => {
            setCategory(event.target.value);
            setPage(1);
          }}
          aria-label="Filter by product category"
          className="h-11 rounded-xl border border-input bg-white px-3 text-sm"
        >
          <option value="">All categories</option>
          {(categoriesQuery.data ?? []).map((item) => (
            <option key={item.name} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      {listingsQuery.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-80 rounded-2xl" />
          ))}
        </div>
      ) : listingsQuery.isError ? (
        <Card className="border-red-200">
          <CardContent className="flex flex-col items-center p-8 text-center">
            <AlertCircle className="size-7 text-red-600" />
            <h2 className="mt-3 font-semibold text-slate-950">Products could not be loaded</h2>
            <p className="mt-1 text-sm text-slate-600">
              {getApiErrorMessage(listingsQuery.error, "Please try again.")}
            </p>
            <Button className="mt-4" variant="outline" onClick={() => void listingsQuery.refetch()}>
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : products.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center p-12 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-violet-50 text-violet-700">
              <Package className="size-6" />
            </span>
            <h2 className="mt-4 font-semibold text-slate-950">No products found</h2>
            <p className="mt-1 text-sm text-slate-600">
              Try a different search or category.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const cover = product.media.find((item) => item.type === "image");
              const price =
                product.pricing.mode === "single"
                  ? product.pricing.price
                  : product.variants[0]?.price;
              return (
                <Link
                  key={product.id}
                  href={`/products/${encodeURIComponent(product.id)}`}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-[1.25] bg-violet-50">
                    {cover?.url ? (
                      <Image
                        src={cover.url}
                        alt={product.title}
                        fill
                        unoptimized
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="grid size-full place-items-center text-violet-300">
                        <Package className="size-10" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 p-4">
                    <p className="text-xs font-medium text-violet-700">{product.category}</p>
                    <h2 className="line-clamp-1 font-semibold text-slate-950">{product.title}</h2>
                    <p className="line-clamp-2 min-h-10 text-sm text-slate-600">
                      {product.short_description}
                    </p>
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <p className="font-bold text-slate-950">
                        {price === undefined
                          ? "View price"
                          : new Intl.NumberFormat(undefined, {
                              style: "currency",
                              currency: product.pricing.currency || "INR",
                              maximumFractionDigits: 2,
                            }).format(price)}
                      </p>
                      {product.provider?.average_rating != null && (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                          <Star className="size-3.5 fill-amber-400 text-amber-400" />
                          {product.provider.average_rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs text-slate-500">
                      {product.provider?.display_name || product.provider?.business_name || "RootIn provider"}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</Button>
                <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)}>Next</Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
