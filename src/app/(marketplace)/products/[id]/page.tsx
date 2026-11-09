"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Package,
  Star,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { productsApi, type ProductListing } from "@/lib/api/products";
import { getApiErrorMessage } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function ProductPrice({ product }: { product: ProductListing }) {
  const price =
    product.pricing.mode === "single"
      ? product.pricing.price
      : product.variants[0]?.price;
  const original = product.pricing.mode === "single" ? product.pricing.original_price : undefined;
  const discount =
    original && price && original > price
      ? Math.round(((original - price) / original) * 100)
      : null;
  const format = (amount: number) =>
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: product.pricing.currency || "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  return (
    <div className="flex flex-wrap items-baseline gap-2">
      <p className="text-2xl font-bold text-slate-950">{price === undefined ? "Contact for price" : format(price)}</p>
      {original !== undefined && price !== undefined && original > price && (
        <>
          <p className="text-sm text-slate-400 line-through">{format(original)}</p>
          {discount !== null && <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">{discount}% off</Badge>}
        </>
      )}
    </div>
  );
}

function availability(product: ProductListing): string {
  if (product.product_type === "digital") return "Digital delivery";
  if (product.inventory.unlimited) return "In stock";
  if (product.pricing.mode === "variants") {
    const stock = product.variants.reduce(
      (count, variant) => count + (variant.stock_quantity ?? 0),
      0,
    );
    return stock > 0 ? `${stock} available across variants` : "Currently out of stock";
  }
  const quantity = product.inventory.quantity ?? 0;
  return quantity > 0 ? `${quantity} in stock` : "Currently out of stock";
}

export default function PublicProductDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const [activeMedia, setActiveMedia] = useState<number | null>(null);
  const productQuery = useQuery({
    queryKey: queryKeys.products.publicDetail(id),
    queryFn: () => productsApi.getPublicProduct(id),
    enabled: Boolean(id),
    retry: false,
  });
  const product = productQuery.data?.product;
  const provider = product?.provider;
  const providerName = provider?.display_name || provider?.business_name || "RootIn provider";
  const providerHref = provider?.slug ? `/providers/${encodeURIComponent(provider.slug)}` : undefined;

  if (productQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="aspect-square rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }
  if (productQuery.isError || !product) {
    const status = (productQuery.error as { response?: { status?: number } } | null)?.response?.status;
    return (
      <Card className="mx-auto max-w-lg border-dashed">
        <CardContent className="flex flex-col items-center p-10 text-center">
          <AlertCircle className="size-7 text-slate-400" />
          <h1 className="mt-3 text-xl font-semibold text-slate-950">
            {status === 404 ? "Product not available" : "Could not load this product"}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {status === 404
              ? "This product may have been paused or removed by the provider."
              : getApiErrorMessage(productQuery.error, "Please try again in a moment.")}
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/products"><ArrowLeft className="mr-2 size-4" />Browse products</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const activeIndex =
    activeMedia ?? Math.max(0, product.media.findIndex((item) => item.type === "image"));
  const active = product.media[activeIndex];
  const inStock = product.product_type === "digital" || product.inventory.unlimited ||
    (product.pricing.mode === "single"
      ? (product.inventory.quantity ?? 0) > 0
      : product.variants.some((variant) => (variant.stock_quantity ?? 0) > 0));
  const related = productQuery.data?.related_products ?? [];

  return (
    <div className="space-y-10 pb-8">
      <Button variant="ghost" size="sm" className="-ml-2 w-fit text-slate-600" asChild>
        <Link href="/products"><ArrowLeft className="mr-2 size-4" />All products</Link>
      </Button>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
        <section className="space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-violet-50">
            {active?.type === "image" && active.url ? (
              <Image src={active.url} alt={product.title} fill priority unoptimized className="object-cover" />
            ) : active?.type === "video" && active.url ? (
              <video src={active.url} controls className="size-full object-contain" />
            ) : (
              <div className="grid size-full place-items-center text-violet-300"><Package className="size-14" /></div>
            )}
            {product.media.length > 0 && (
              <span className="absolute bottom-3 right-3 rounded-full bg-slate-950/70 px-3 py-1 text-xs text-white">
                {activeIndex + 1} / {product.media.length}
              </span>
            )}
          </div>
          {product.media.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {product.media.map((media, index) => (
                <button
                  type="button"
                  key={media.path}
                  aria-label={`View media ${index + 1}`}
                  aria-pressed={index === activeIndex}
                  onClick={() => setActiveMedia(index)}
                  className={`relative aspect-square overflow-hidden rounded-xl border-2 ${index === activeIndex ? "border-violet-700" : "border-transparent"}`}
                >
                  {media.type === "image" && media.url ? (
                    <Image src={media.url} alt="" fill unoptimized className="object-cover" />
                  ) : <span className="grid size-full place-items-center bg-slate-100 text-xs text-slate-500">Video</span>}
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div>
            <Badge variant="secondary" className="bg-violet-50 text-violet-800">{product.category}</Badge>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{product.title}</h1>
            {product.subcategory && <p className="mt-1 text-sm text-slate-500">{product.subcategory}</p>}
          </div>
          <Link
            href={providerHref ?? "#provider"}
            className="flex items-center gap-3 rounded-xl border border-slate-100 p-3"
            onClick={(event) => {
              if (!providerHref) event.preventDefault();
            }}
          >
            {provider?.profile_photo ? (
              <Image src={provider.profile_photo} alt="" width={42} height={42} unoptimized className="size-10 rounded-full object-cover" />
            ) : <span className="grid size-10 place-items-center rounded-full bg-violet-100 font-bold text-violet-800">{providerName.slice(0, 1)}</span>}
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1 font-semibold text-slate-900">
              {providerName}
              </span>
              <span className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                {provider?.average_rating != null && <span className="inline-flex items-center gap-1"><Star className="size-3.5 fill-amber-400 text-amber-400" />{provider.average_rating.toFixed(1)}</span>}
                <span>{provider?.review_count ?? 0} reviews</span>
              </span>
            </span>
            {providerHref && <span className="text-sm font-semibold text-violet-700">Profile</span>}
          </Link>

          <ProductPrice product={product} />
          <p className={`inline-flex items-center gap-2 text-sm font-medium ${inStock ? "text-emerald-700" : "text-red-700"}`}>
            <CheckCircle2 className="size-4" />{availability(product)}
          </p>

          {product.pricing.mode === "variants" && product.variants.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-slate-900">Available variants</h2>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant, index) => (
                  <span key={index} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-700">
                    {variant.attributes.map(({ name, value }) => `${name}: ${value}`).join(" · ")}
                    {variant.price !== undefined ? ` · ${product.pricing.currency} ${variant.price}` : ""}
                  </span>
                ))}
              </div>
            </div>
          )}
          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => <Badge key={tag} variant="outline" className="text-slate-600">{tag}</Badge>)}
            </div>
          )}
          <div className="rounded-xl border border-violet-100 bg-violet-50/60 p-4 text-sm">
            <h2 className="font-semibold text-slate-900">Delivery information</h2>
            {product.product_type === "physical" ? (
              <ul className="mt-2 space-y-1 text-slate-600">
                {product.delivery.shipping_time && <li>Ships in {product.delivery.shipping_time}</li>}
                {product.delivery.locations?.length ? <li>Available in {product.delivery.locations.join(", ")}</li> : null}
                <li>{product.delivery.international ? "Domestic and international delivery" : product.delivery.domestic ? "Domestic delivery" : "Contact provider to confirm delivery"}</li>
                {product.delivery.cash_on_delivery && <li>Cash on delivery available</li>}
              </ul>
            ) : (
              <p className="mt-2 text-slate-600">
                {product.delivery.digital_delivery === "instant" ? "Instant access" : "Digital delivery arranged by the provider"}
                {product.delivery.delivery_information ? ` · ${product.delivery.delivery_information}` : ""}
              </p>
            )}
            {product.delivery.return_exchange && <p className="mt-2 text-slate-600">Returns and exchanges are available.</p>}
          </div>
          <p className="text-xs leading-5 text-slate-500">
            RootIn does not currently support product checkout or payments. Contact the provider to ask about this listing and confirm availability.
          </p>
          {providerHref && (
            <Button asChild className="h-11 w-full rounded-xl bg-violet-700 hover:bg-violet-800">
              <Link href={providerHref}>View provider and contact</Link>
            </Button>
          )}
        </section>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-950">About this product</h2>
        <p className="max-w-3xl whitespace-pre-wrap text-sm leading-7 text-slate-700">{product.description}</p>
      </section>

      {related.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-950">Related products</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => {
              const image = item.media.find((media) => media.type === "image");
              return (
                <Link key={item.id} href={`/products/${encodeURIComponent(item.id)}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white hover:shadow-sm">
                  <div className="relative aspect-square bg-violet-50">
                    {image?.url ? <Image src={image.url} alt={item.title} fill unoptimized className="object-cover" /> : <div className="grid size-full place-items-center text-violet-300"><Package className="size-8" /></div>}
                  </div>
                  <div className="p-3"><p className="truncate text-sm font-semibold text-slate-900">{item.title}</p><p className="mt-1 text-xs text-slate-500">{item.category}</p></div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
