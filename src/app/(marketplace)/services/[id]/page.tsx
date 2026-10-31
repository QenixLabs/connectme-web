"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  ImageIcon,
  MapPin,
  Tag,
} from "lucide-react";
import { servicesApi } from "@/lib/api/marketplace";
import { getApiErrorMessage } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { formatIndicativePrice } from "@/components/marketplace/format";
import { ContactProviderButton } from "@/components/marketplace/contact-provider-button";
import { ServiceInquiryForm } from "@/components/marketplace/service-inquiry-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

function formatDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ServiceDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const [activeImage, setActiveImage] = useState(0);

  const listingQuery = useQuery({
    queryKey: queryKeys.services.publicDetail(id),
    queryFn: () => servicesApi.getPublicListing(id),
    enabled: Boolean(id),
    retry: false,
  });

  const service = listingQuery.data?.service;
  const provider = service?.provider ?? null;
  const providerName =
    provider?.display_name || provider?.business_name || "Service provider";
  const providerHref = provider?.slug ? `/providers/${provider.slug}` : undefined;

  const images = useMemo(() => service?.images ?? [], [service]);
  const published = formatDate(service?.published_at);

  if (listingQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-80 w-full rounded-2xl" />
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  const status = (listingQuery.error as { response?: { status?: number } } | null)?.response
    ?.status;

  if (listingQuery.isError || !service) {
    return (
      <Card className="mx-auto max-w-lg border-dashed">
        <CardContent className="flex flex-col items-center p-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-muted">
            <AlertCircle className="size-6 text-muted-foreground" />
          </span>
          <h1 className="mt-4 text-xl font-semibold">
            {status === 404 ? "Service not available" : "Could not load this service"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {status === 404
              ? "This service may have been unpublished or removed by the provider."
              : getApiErrorMessage(listingQuery.error, "Please try again in a moment.")}
          </p>
          <Button variant="outline" className="mt-4" asChild>
            <Link href="/services">
              <ArrowLeft className="mr-2 size-4" />
              Back to services
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-7 pb-8">
      <Button variant="ghost" size="sm" className="-ml-2 w-fit text-muted-foreground" asChild>
        <Link href="/services">
          <ArrowLeft className="mr-2 size-4" />
          All services
        </Link>
      </Button>

      <header className="space-y-3">
        {service.category && (
          <Badge
            variant="secondary"
            className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary hover:bg-primary/10"
          >
            {service.category}
          </Badge>
        )}
        <h1 className="max-w-4xl text-3xl font-bold tracking-tight sm:text-4xl">
          {service.title}
        </h1>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          {service.service_areas.length > 0 && (
            <span className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MapPin className="size-4" />
              </span>
              {service.service_areas.slice(0, 3).join(", ")}
              {service.service_areas.length > 3 && ` +${service.service_areas.length - 3} more`}
            </span>
          )}
          {published && (
            <span className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-full bg-muted">
                <CalendarDays className="size-4" />
              </span>
              Published {published}
            </span>
          )}
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.9fr)] lg:gap-8">
        <div className="space-y-6">
          <Card className="overflow-hidden rounded-2xl border-border/70 bg-background shadow-sm">
            <div className="relative aspect-[16/10] bg-gradient-to-br from-primary/10 via-muted to-primary/5 sm:aspect-[16/9]">
              {images[activeImage] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={images[activeImage]}
                  alt={service.title}
                  className="h-full w-full object-cover transition-opacity duration-300"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                  <span className="flex size-16 items-center justify-center rounded-2xl bg-background/80 shadow-sm">
                    <ImageIcon className="size-8" />
                  </span>
                  <span className="text-sm font-medium">Service preview</span>
                </div>
              )}
              {images.length > 0 && (
                <span className="absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                  {activeImage + 1} / {images.length}
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto p-3 sm:p-4">
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    aria-label={`View image ${index + 1}`}
                    aria-pressed={index === activeImage}
                    onClick={() => setActiveImage(index)}
                    className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                      index === activeImage
                        ? "border-primary ring-2 ring-primary/15"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image}
                      alt={`${service.title} image ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </Card>

          <Card className="rounded-2xl border-border/70 shadow-sm">
            <CardContent className="space-y-6 p-5 sm:p-7">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  Service overview
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight">
                  About this service
                </h2>
                <p className="mt-3 whitespace-pre-line text-[15px] leading-7 text-muted-foreground">
                  {service.description}
                </p>
              </div>

              {service.service_areas.length > 0 && (
                <div className="border-t pt-5">
                  <h2 className="text-sm font-semibold">
                    Service areas
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {service.service_areas.map((area) => (
                      <Badge
                        key={area}
                        variant="outline"
                        className="rounded-full bg-muted/40 px-3 py-1 font-normal"
                      >
                        <MapPin className="mr-1.5 size-3 text-primary" />
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <Card className="overflow-hidden rounded-2xl border-primary/15 shadow-sm">
            <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background px-5 pb-5 pt-6 sm:px-6">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <span className="flex size-9 items-center justify-center rounded-xl bg-background text-primary shadow-sm">
                  <Tag className="size-4" />
                </span>
                Price indication
              </div>
              <p className="mt-4 text-3xl font-bold tracking-tight">
                {formatIndicativePrice(service.indicative_price)}
              </p>
              {service.indicative_price?.note && (
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {service.indicative_price.note}
                </p>
              )}
            </div>
            <CardContent className="space-y-4 p-5 sm:p-6">
              <p className="text-xs leading-relaxed text-muted-foreground">
                Indicative only. Pricing, scope, and delivery are agreed directly with the
                provider.
              </p>
              {provider?.slug && (
                <ContactProviderButton
                  providerSlug={provider.slug}
                  providerName={providerName}
                  serviceTitle={service.title}
                  className="h-11 w-full rounded-xl shadow-sm"
                />
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/70 shadow-sm">
            <CardHeader className="pb-0">
              <CardTitle className="text-base">Meet your provider</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5 pt-3 sm:p-6 sm:pt-4">
              <div className="flex items-center gap-3">
                {provider?.profile_photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={provider.profile_photo}
                    alt={providerName}
                    className="size-14 rounded-2xl object-cover ring-2 ring-primary/10"
                  />
                ) : (
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-lg font-semibold text-primary">
                    {providerName[0]?.toUpperCase()}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 truncate font-semibold">
                    {providerName}
                    <BadgeCheck className="size-4 shrink-0 text-primary" aria-label="Verified provider" />
                  </p>
                  {provider?.business_name && provider.display_name && (
                    <p className="truncate text-sm text-muted-foreground">
                      {provider.business_name}
                    </p>
                  )}
                  {provider?.location?.city && (
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3.5" />
                      {[provider.location.city, provider.location.state]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
                </div>
              </div>

              {provider?.about && (
                <p className="line-clamp-3 border-t pt-4 text-sm leading-relaxed text-muted-foreground">
                  {provider.about}
                </p>
              )}

              {providerHref ? (
                <Button variant="outline" className="h-10 w-full rounded-xl" asChild>
                  <Link href={providerHref}>View full profile</Link>
                </Button>
              ) : (
                <p className="text-xs text-muted-foreground">
                  This provider profile is not publicly available yet.
                </p>
              )}
            </CardContent>
          </Card>
          {provider?.slug && (
            <ServiceInquiryForm
              providerSlug={provider.slug}
              providerName={providerName}
              serviceId={service.id}
            />
          )}
        </aside>
      </div>
    </div>
  );
}
