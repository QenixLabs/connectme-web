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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

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
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="-ml-2 w-fit" asChild>
        <Link href="/services">
          <ArrowLeft className="mr-2 size-4" />
          All services
        </Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="relative aspect-[16/9] bg-muted">
              {images[activeImage] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={images[activeImage]}
                  alt={service.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ImageIcon className="size-12 text-muted-foreground" />
                </div>
              )}
              {service.category && (
                <Badge className="absolute left-4 top-4 bg-background/90 text-foreground hover:bg-background/90">
                  {service.category}
                </Badge>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto p-3">
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    aria-label={`View image ${index + 1}`}
                    onClick={() => setActiveImage(index)}
                    className={`h-16 w-24 shrink-0 overflow-hidden rounded-md border-2 transition-colors ${
                      index === activeImage ? "border-primary" : "border-transparent"
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

          <Card>
            <CardContent className="space-y-5 p-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {service.title}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {service.service_areas.length > 0 && (
                    <span className="flex items-center gap-1">
                      <MapPin className="size-4" />
                      {service.service_areas.join(", ")}
                    </span>
                  )}
                  {published && (
                    <span className="flex items-center gap-1">
                      <CalendarDays className="size-4" />
                      Published {published}
                    </span>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  About this service
                </h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>

              {service.service_areas.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Service areas
                  </h2>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {service.service_areas.map((area) => (
                      <Badge key={area} variant="outline" className="font-normal">
                        <MapPin className="mr-1 size-3" />
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Tag className="size-4 text-primary" />
                Price indication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-2xl font-bold">
                {formatIndicativePrice(service.indicative_price)}
              </p>
              {service.indicative_price?.note && (
                <p className="text-sm text-muted-foreground">{service.indicative_price.note}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Indicative only. Pricing, scope, and delivery are agreed directly with the
                provider.
              </p>
              {provider?.slug && (
                <ContactProviderButton
                  providerSlug={provider.slug}
                  providerName={providerName}
                  className="w-full"
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Provided by</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                {provider?.profile_photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={provider.profile_photo}
                    alt={providerName}
                    className="size-14 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex size-14 items-center justify-center rounded-full bg-muted text-lg font-semibold">
                    {providerName[0]?.toUpperCase()}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="flex items-center gap-1 truncate font-semibold">
                    {providerName}
                    <BadgeCheck className="size-4 shrink-0 text-primary" />
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
                <p className="line-clamp-3 text-sm text-muted-foreground">{provider.about}</p>
              )}

              {providerHref ? (
                <Button variant="outline" className="w-full" asChild>
                  <Link href={providerHref}>View full profile</Link>
                </Button>
              ) : (
                <p className="text-xs text-muted-foreground">
                  This provider profile is not publicly available yet.
                </p>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
