"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowDownUp,
  Copy,
  Eye,
  Loader2,
  MoreHorizontal,
  Package,
  Pencil,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { productsApi, type ProductListing, type ProductStatus } from "@/lib/api/products";
import { getApiErrorMessage } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PAGE_SIZE = 12;

const STATUS_FILTERS: Array<{ value: "all" | ProductStatus; label: string }> = [
  { value: "all", label: "All products" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
  { value: "paused", label: "Paused" },
];

function getStockLabel(product: ProductListing): string {
  if (product.product_type === "digital") return "Digital delivery";
  if (product.inventory.unlimited) return "Unlimited stock";
  if (product.pricing.mode === "variants") {
    const stock = product.variants.reduce(
      (total, variant) => total + (variant.stock_quantity ?? 0),
      0,
    );
    return `${stock} in stock`;
  }
  return `${product.inventory.quantity ?? 0} in stock`;
}

function formatPrice(product: ProductListing): string {
  const amount =
    product.pricing.mode === "single"
      ? product.pricing.price
      : product.variants[0]?.price;
  if (amount === undefined) return "Price not set";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: product.pricing.currency || "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function StatusBadge({ status }: { status: ProductStatus }) {
  const classes = {
    published: "border-emerald-200 bg-emerald-50 text-emerald-700",
    draft: "border-slate-200 bg-slate-50 text-slate-600",
    paused: "border-amber-200 bg-amber-50 text-amber-700",
  } satisfies Record<ProductStatus, string>;
  const labels = { published: "Published", draft: "Draft", paused: "Paused" };
  return (
    <Badge variant="outline" className={classes[status]}>
      {labels[status]}
    </Badge>
  );
}

export default function ProviderProductsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<"all" | ProductStatus>("all");
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [actionsProduct, setActionsProduct] = useState<ProductListing | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<ProductListing | null>(null);

  const filters = useMemo(
    () => ({
      status,
      category: category || undefined,
      search: search.trim() || undefined,
      page,
      limit: PAGE_SIZE,
    }),
    [category, page, search, status],
  );
  const productsQuery = useQuery({
    queryKey: queryKeys.products.mine(filters),
    queryFn: () => productsApi.getMine(filters),
  });
  const categoriesQuery = useQuery({
    queryKey: queryKeys.products.categories(),
    queryFn: productsApi.getCategories,
  });
  const products = productsQuery.data?.data ?? [];
  const totalPages = Math.max(
    1,
    Math.ceil((productsQuery.data?.total ?? 0) / PAGE_SIZE),
  );

  async function refreshProducts() {
    await queryClient.invalidateQueries({ queryKey: ["products", "mine"] });
  }

  async function refreshPublicProducts() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["products", "public"] }),
      queryClient.invalidateQueries({ queryKey: ["products", "mine"] }),
    ]);
  }

  const pauseMutation = useMutation({
    mutationFn: productsApi.pause,
    onSuccess: async () => {
      toast.success("Product paused");
      setActionsProduct(null);
      await refreshPublicProducts();
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Could not pause product")),
  });
  const duplicateMutation = useMutation({
    mutationFn: productsApi.duplicate,
    onSuccess: async ({ product }) => {
      toast.success("Draft copy created");
      setActionsProduct(null);
      await refreshProducts();
      router.push(`/provider/products/${encodeURIComponent(product.id)}/edit`);
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Could not duplicate product")),
  });
  const deleteMutation = useMutation({
    mutationFn: productsApi.remove,
    onSuccess: async () => {
      toast.success("Product deleted");
      setDeleteProduct(null);
      setActionsProduct(null);
      await refreshPublicProducts();
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Could not delete product")),
  });

  function editAt(product: ProductListing, step: number) {
    router.push(
      `/provider/products/${encodeURIComponent(product.id)}/edit?step=${step}`,
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 pb-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-violet-700">Service provider</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            My Products
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Keep your product listings, pricing, and stock in one place.
          </p>
        </div>
        <Button
          asChild
          className="h-11 rounded-xl bg-violet-700 px-5 text-white hover:bg-violet-800"
        >
          <Link href="/provider/products/new">
            <Plus className="mr-2 size-4" />
            Add new product
          </Link>
        </Button>
      </header>

      <section
        aria-label="Product totals"
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        {[
          ["Total products", productsQuery.data?.summary.total ?? 0, Package],
          ["Published", productsQuery.data?.summary.published ?? 0, ShoppingBag],
          ["Drafts", productsQuery.data?.summary.draft ?? 0, Pencil],
          ["Paused", productsQuery.data?.summary.paused ?? 0, ArrowDownUp],
        ].map(([label, count, Icon]) => {
          const IconComponent = Icon as typeof Package;
          return (
            <Card key={label as string} className="rounded-2xl border-slate-200 shadow-sm">
              <CardContent className="flex items-center gap-3 p-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-700">
                  <IconComponent className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-500">{label as string}</p>
                  <p className="text-xl font-bold text-slate-950">{count as number}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardContent className="space-y-4 p-4 sm:p-5">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
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
                className="h-11 rounded-xl pl-9"
              />
            </label>
            <select
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                setPage(1);
              }}
              aria-label="Filter by category"
              className="h-11 rounded-xl border border-input bg-background px-3 text-sm"
            >
              <option value="">All categories</option>
              {(categoriesQuery.data ?? []).map((item) => (
                <option key={item.name} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Product status">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                role="tab"
                aria-selected={status === filter.value}
                onClick={() => {
                  setStatus(filter.value);
                  setPage(1);
                }}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  status === filter.value
                    ? "border-violet-200 bg-violet-50 text-violet-800"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {productsQuery.isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }, (_, index) => (
                <Skeleton key={index} className="h-56 rounded-2xl" />
              ))}
            </div>
          ) : productsQuery.isError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
              <div className="flex items-center gap-2 font-semibold">
                <AlertCircle className="size-4" />
                Could not load your products
              </div>
              <p className="mt-1">
                {getApiErrorMessage(productsQuery.error, "Please try again.")}
              </p>
              <Button
                variant="outline"
                className="mt-3"
                onClick={() => void productsQuery.refetch()}
              >
                Try again
              </Button>
            </div>
          ) : products.length === 0 ? (
            <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-violet-200 bg-violet-50/40 px-5 py-10 text-center">
              <div className="max-w-sm">
                <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-white text-violet-700 shadow-sm">
                  <Package className="size-6" />
                </span>
                <h2 className="mt-4 font-semibold text-slate-950">
                  {search || category || status !== "all"
                    ? "No products match these filters"
                    : "Your product shelf is ready"}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {search || category || status !== "all"
                    ? "Try another search or clear a filter."
                    : "Add a product to start building your marketplace listing."}
                </p>
                {!search && !category && status === "all" && (
                  <Button asChild className="mt-4 rounded-xl bg-violet-700 hover:bg-violet-800">
                    <Link href="/provider/products/new">
                      <Plus className="mr-2 size-4" />
                      Add your first product
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => {
                const cover = product.media.find((item) => item.type === "image");
                return (
                  <article
                    key={product.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-md"
                  >
                    <div className="relative aspect-[1.65] bg-violet-50">
                      {cover?.url ? (
                        <Image
                          src={cover.url}
                          alt={product.title}
                          fill
                          unoptimized
                          sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="grid size-full place-items-center text-violet-300">
                          <Package className="size-10" />
                        </div>
                      )}
                      <div className="absolute left-3 top-3">
                        <StatusBadge status={product.status} />
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        aria-label={`Actions for ${product.title || "untitled product"}`}
                        className="absolute right-3 top-3 size-9 rounded-full bg-white/95 shadow-sm"
                        onClick={() => setActionsProduct(product)}
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </div>
                    <div className="space-y-3 p-4">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-violet-700">{product.category || "Uncategorized"}</p>
                        <h2 className="mt-1 truncate font-semibold text-slate-950">
                          {product.title || "Untitled product"}
                        </h2>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-slate-950">{formatPrice(product)}</p>
                        <p className="truncate text-xs text-slate-500">{getStockLabel(product)}</p>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Eye className="size-3.5" />
                          {product.views_count} views
                        </span>
                        {product.status === "published" && (
                          <Link
                            href={`/products/${encodeURIComponent(product.id)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-violet-700 hover:underline"
                          >
                            View listing
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {!productsQuery.isLoading && productsQuery.data && totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <p className="text-sm text-slate-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(actionsProduct)}
        onOpenChange={(open) => {
          if (!open) setActionsProduct(null);
        }}
      >
        <DialogContent className="max-w-md rounded-t-2xl sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle>Product actions</DialogTitle>
            <DialogDescription>
              {actionsProduct?.title || "Choose an action for this product."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => actionsProduct && editAt(actionsProduct, 1)}
            >
              <Pencil className="mr-2 size-4" />
              Edit product
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => actionsProduct && editAt(actionsProduct, 3)}
            >
              <ArrowDownUp className="mr-2 size-4" />
              Update price / stock
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => actionsProduct && editAt(actionsProduct, 3)}
            >
              <ShoppingBag className="mr-2 size-4" />
              Manage variants
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              disabled={duplicateMutation.isPending}
              onClick={() => actionsProduct && duplicateMutation.mutate(actionsProduct.id)}
            >
              {duplicateMutation.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Copy className="mr-2 size-4" />
              )}
              Duplicate product
            </Button>
            {actionsProduct?.status === "published" ? (
              <Button
                variant="outline"
                className="justify-start"
                disabled={pauseMutation.isPending}
                onClick={() => actionsProduct && pauseMutation.mutate(actionsProduct.id)}
              >
                <ArrowDownUp className="mr-2 size-4" />
                Pause listing
              </Button>
            ) : (
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => actionsProduct && editAt(actionsProduct, 6)}
              >
                <ShoppingBag className="mr-2 size-4" />
                Publish / resume
              </Button>
            )}
            <Button
              variant="outline"
              className="justify-start border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
              onClick={() => {
                setDeleteProduct(actionsProduct);
                setActionsProduct(null);
              }}
            >
              <Trash2 className="mr-2 size-4" />
              Delete product
            </Button>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setActionsProduct(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deleteProduct)}
        onOpenChange={(open) => {
          if (!open) setDeleteProduct(null);
        }}
      >
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Delete this product?</DialogTitle>
            <DialogDescription>
              “{deleteProduct?.title || "Untitled product"}” will be removed from your listings.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteProduct(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleteProduct && deleteMutation.mutate(deleteProduct.id)}
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Delete product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
