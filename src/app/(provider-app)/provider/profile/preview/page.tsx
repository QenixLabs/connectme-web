"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  BatteryFull,
  Check,
  ExternalLink,
  PencilLine,
  Signal,
  Wifi,
} from "lucide-react";
import { providersApi, servicesApi } from "@/lib/api/marketplace";
import { productsApi } from "@/lib/api/products";
import type {
  ProviderProfile,
  PublicProviderProduct,
  PublicProviderProfile,
  PublicServiceSummary,
  ServiceListing,
} from "@/lib/api/marketplace";
import type { ProductListing } from "@/lib/api/products";
import { getApiErrorMessage } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { ProviderProfileView } from "@/components/marketplace/provider-profile-view";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function toPublicService(service: ServiceListing): PublicServiceSummary {
  return {
    id: service.id,
    title: service.title,
    description: service.description,
    category: service.category,
    images:
      service.images.length > 0 ? service.images : (service.image_urls ?? []),
    service_areas: service.service_areas ?? [],
    indicative_price: service.indicative_price ?? null,
    published_at: service.published_at ?? null,
  };
}

function toPublicProduct(product: ProductListing): PublicProviderProduct {
  return {
    id: product.id,
    title: product.title,
    short_description: product.short_description,
    category: product.category,
    product_type: product.product_type,
    images: product.media
      .filter((item) => item.type === "image" && item.url)
      .map((item) => item.url as string),
    pricing: product.pricing,
    price_from:
      product.pricing.mode === "variants"
        ? product.variants
            .map((variant) => variant.price)
            .filter((value): value is number => typeof value === "number" && value > 0)
            .sort((a, b) => a - b)[0] ?? null
        : null,
    published_at: product.published_at ?? null,
  };
}

function toPublicProfile(
  profile: ProviderProfile,
  services: PublicServiceSummary[],
  products: PublicProviderProduct[],
): PublicProviderProfile {
  return {
    id: profile.id,
    slug: profile.slug ?? "",
    display_name: profile.display_name,
    business_name: profile.business_name,
    provider_type: profile.provider_type,
    tagline: profile.tagline,
    profile_photo: profile.profile_photo,
    banner_image: profile.banner_image,
    about: profile.about,
    location: profile.location,
    categories: profile.categories ?? [],
    service_areas: profile.service_areas ?? [],
    skills: profile.skills ?? [],
    portfolio: (profile.portfolio ?? []).map((item) => ({
      title: item.title,
      description: item.description,
      image_url: item.image_url,
      link_url: item.link_url,
    })),
    services,
    services_count: services.length,
    products,
    products_count: products.length,
    member_since: profile.created_at ?? null,
  };
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-[400px] max-w-full">
      <div className="overflow-hidden rounded-[2.5rem] border-[6px] border-border bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border/60 bg-background px-6 py-2 text-xs font-semibold">
          <span>9:41</span>
          <span className="flex items-center gap-1">
            <Signal className="size-3.5" />
            <Wifi className="size-3.5" />
            <BatteryFull className="size-4" />
          </span>
        </div>
        <div className="h-[760px] overflow-y-auto overscroll-contain px-3 pb-8 pt-4">
          {children}
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Shown in a phone frame — your profile is responsive at every screen size.
      </p>
    </div>
  );
}

export default function ProviderProfilePreviewPage() {
  const profileQuery = useQuery({
    queryKey: queryKeys.provider.me(),
    queryFn: providersApi.getMyProfile,
    retry: false,
  });

  const servicesQuery = useQuery({
    queryKey: queryKeys.services.mine({ status: "published", limit: 50 }),
    queryFn: () => servicesApi.getMine({ status: "published", limit: 50 }),
    retry: false,
  });

  const productsQuery = useQuery({
    queryKey: queryKeys.products.mine({ status: "published", limit: 50 }),
    queryFn: () => productsApi.getMine({ status: "published", limit: 50 }),
    retry: false,
  });

  const slug = profileQuery.data?.profile.slug ?? "";
  const ratingQuery = useQuery({
    queryKey: queryKeys.provider.ratingSummary(slug),
    queryFn: () => providersApi.getRatingSummary(slug),
    enabled: Boolean(slug),
    retry: false,
  });

  if (profileQuery.isLoading || servicesQuery.isLoading || productsQuery.isLoading) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="mx-auto mt-10 h-[760px] w-[400px] max-w-full rounded-[2.5rem]" />
        </div>
      </div>
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <div className="grid min-h-screen place-items-center bg-muted/30 px-4">
        <div className="w-full max-w-lg rounded-2xl border border-dashed border-border bg-card p-8 text-center">
          <AlertCircle className="mx-auto size-8 text-muted-foreground" />
          <h1 className="mt-3 text-lg font-semibold">Could not load your profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {getApiErrorMessage(profileQuery.error, "Please try again.")}
          </p>
          <Button className="mt-4" asChild>
            <Link href="/provider/profile/edit">
              <ArrowLeft className="mr-2 size-4" />
              Back to edit
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const profile = profileQuery.data.profile;
  const services = (servicesQuery.data?.data ?? [])
    .filter((service) => service.status === "published")
    .map(toPublicService);
  const products = (productsQuery.data?.data ?? [])
    .filter((product) => product.status === "published")
    .map(toPublicProduct);
  const publicProfile = toPublicProfile(profile, services, products);

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" asChild aria-label="Back to edit">
            <Link href="/provider/profile/edit">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="flex items-center gap-2 text-lg font-bold tracking-tight">
              Profile preview
              <PencilLine className="size-4 text-primary" />
            </h1>
            <p className="truncate text-xs text-muted-foreground">
              Visitors see the last saved version of your profile.
            </p>
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/provider/profile/edit">Edit</Link>
            </Button>
            {profile.slug && (
              <Button asChild>
                <a
                  href={`/providers/${profile.slug}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="hidden sm:inline">View public</span>
                  <ExternalLink className="size-4 sm:ml-2" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </header>

      {servicesQuery.isError && (
        <div className="mx-auto max-w-5xl px-4 pt-4">
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>Could not load published services</AlertTitle>
            <AlertDescription>
              {getApiErrorMessage(
                servicesQuery.error,
                "The profile preview will not include services.",
              )}
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="hidden py-10 md:block">
        <PhoneFrame>
          <ProviderProfileView
            profile={publicProfile}
            ratingSummary={ratingQuery.data}
            variant="preview"
          />
        </PhoneFrame>
      </div>

      <div className="relative pb-10 md:hidden">
        <div className="pointer-events-none sticky top-[73px] z-30 flex justify-center py-3">
          <Badge className="bg-primary text-primary-foreground shadow">
            <Check className="mr-1 size-3" />
            Preview of your saved profile
          </Badge>
        </div>
        <div className="mx-auto max-w-3xl px-4">
          <ProviderProfileView
            profile={publicProfile}
            ratingSummary={ratingQuery.data}
            variant="preview"
          />
        </div>
      </div>
    </div>
  );
}
