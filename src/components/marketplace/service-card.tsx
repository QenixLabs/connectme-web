import Link from "next/link";
import { ImageIcon, MapPin, Star } from "lucide-react";
import type { PublicServiceSummary } from "@/lib/api/marketplace";
import { formatAmount, formatIndicativePrice } from "@/components/marketplace/format";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ServiceCardProps {
  service: PublicServiceSummary;
  providerName?: string;
  providerPhoto?: string;
  layout?: "grid" | "list" | "featured";
}

export function ServiceCard({
  service,
  providerName,
  providerPhoto,
  layout = "grid",
}: ServiceCardProps) {
  const name =
    providerName ||
    service.provider?.display_name ||
    service.provider?.business_name;
  const photo = providerPhoto || service.provider?.profile_photo;

  if (layout === "featured") {
    return (
      <Link
        href={`/services/${service.id}`}
        className="group block h-full shrink-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Card className="flex h-[448px] w-[240px] flex-col gap-0 overflow-hidden rounded-2xl border-border/70 bg-background py-0 shadow-sm transition-all group-hover:-translate-y-0.5 group-hover:border-blue-300 group-hover:shadow-md">
          <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-muted">
            {service.images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={service.images[0]}
                alt={service.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <ImageIcon className="size-9 text-muted-foreground" />
              </div>
            )}
            {service.category && (
              <Badge className="absolute left-2.5 top-2.5 max-w-[calc(100%-1.25rem)] truncate rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-blue-700 shadow-sm hover:bg-white/95">
                {service.category}
              </Badge>
            )}
          </div>
          <CardContent className="flex min-h-0 flex-1 flex-col p-4">
            <h3 className="line-clamp-2 min-h-10 text-[15px] font-bold leading-5 text-foreground">
              {service.title}
            </h3>
            <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-muted-foreground">
              {service.description}
            </p>
            <div className="mt-3 flex min-w-0 items-center justify-between gap-2">
              {name ? (
                <span className="flex min-w-0 items-center gap-1.5">
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photo}
                      alt=""
                      className="size-5 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-blue-50 text-[9px] font-semibold text-blue-700">
                      {name[0]?.toUpperCase()}
                    </span>
                  )}
                  <span className="truncate text-xs font-medium text-foreground">
                    {name}
                  </span>
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">Service provider</span>
              )}
              {service.provider?.average_rating != null &&
              service.provider.review_count > 0 ? (
                <span className="flex shrink-0 items-center gap-1 text-xs font-semibold">
                  <Star className="size-3 fill-amber-500 text-amber-500" aria-hidden="true" />
                  {service.provider.average_rating.toFixed(1)}
                </span>
              ) : (
                <span className="shrink-0 text-[10px] text-muted-foreground">New</span>
              )}
            </div>
            <div className="mt-auto flex items-end justify-between gap-2 border-t border-border/70 pt-3">
              {service.indicative_price ? (
                <div className="min-w-0">
                  <p className="truncate text-base font-bold leading-5 text-foreground">
                    {formatAmount(
                      service.indicative_price.amount,
                      service.indicative_price.currency,
                    )}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    per {service.indicative_price.unit ?? "project"}
                  </p>
                </div>
              ) : (
                <p className="text-sm font-semibold text-foreground">Price on request</p>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  if (layout === "list") {
    const providerDesignation =
      service.provider?.tagline || service.provider?.provider_type;
    const providerDisplayName = name || "Service provider";

    return (
      <Link
        href={`/services/${service.id}`}
        className="group block h-full rounded-[18px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Card className="flex min-w-0 flex-row items-center gap-3 rounded-[18px] border-border/70 bg-background p-2.5 shadow-sm transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/25 group-hover:shadow-md sm:gap-4 sm:p-3">
          <div className="relative aspect-square h-[88px] w-[88px] shrink-0 overflow-hidden rounded-xl bg-muted sm:size-[120px]">
            {service.images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={service.images[0]}
                alt={service.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <ImageIcon className="size-8 text-muted-foreground" />
              </div>
            )}
            <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-background/95 px-2 py-1 text-[10px] font-semibold text-foreground shadow-sm">
              {service.provider?.average_rating != null &&
              service.provider.review_count > 0 ? (
                <>
                  <Star className="size-3 fill-amber-500 text-amber-500" />
                  {service.provider.average_rating.toFixed(1)}
                  <span className="font-normal text-muted-foreground">
                    ({service.provider.review_count})
                  </span>
                </>
              ) : (
                "New"
              )}
            </span>
          </div>

          <CardContent className="flex min-h-[88px] min-w-0 flex-1 flex-col justify-between gap-2 p-0 sm:min-h-[120px]">
            <div className="min-w-0">
              <h3 className="line-clamp-2 text-sm font-bold leading-5 text-foreground sm:text-base">
                {service.title}
              </h3>
              {service.category && (
                <Badge
                  variant="secondary"
                  className="mt-1 max-w-full truncate rounded-full bg-primary/8 px-2.5 py-0.5 text-[10px] font-medium text-primary hover:bg-primary/8"
                >
                  {service.category}
                </Badge>
              )}
              <p className="mt-1 line-clamp-2 text-xs leading-4 text-muted-foreground sm:text-sm sm:leading-5">
                {service.description}
              </p>
            </div>

            <div className="flex min-w-0 items-center justify-between gap-2 border-t border-border/70 pt-2">
              <div className="flex min-w-0 items-center gap-2">
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo}
                    alt=""
                    className="size-8 shrink-0 rounded-full object-cover ring-1 ring-border"
                  />
                ) : (
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {providerDisplayName[0]?.toUpperCase()}
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold text-foreground">
                    {providerDisplayName}
                  </span>
                  {providerDesignation && (
                    <span className="block truncate text-[10px] text-muted-foreground sm:text-xs">
                      {providerDesignation}
                    </span>
                  )}
                </span>
              </div>
              <span className="max-w-[42%] shrink-0 text-right">
                {service.indicative_price ? (
                  <>
                    <span className="block truncate text-sm font-bold text-foreground sm:text-base">
                      {formatAmount(
                        Math.round(service.indicative_price.amount),
                        service.indicative_price.currency,
                      )}
                    </span>
                    <span className="block text-[10px] text-muted-foreground sm:text-xs">
                      per {service.indicative_price.unit ?? "project"}
                    </span>
                  </>
                ) : (
                  <span className="block text-[11px] font-semibold leading-4 text-foreground sm:text-xs">
                    Price on request
                  </span>
                )}
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`/services/${service.id}`} className="group block h-full">
      <Card className="h-full gap-0 overflow-hidden transition-all group-hover:border-success/30 group-hover:shadow-md">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {service.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={service.images[0]}
              alt={service.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ImageIcon className="size-9 text-muted-foreground" />
            </div>
          )}
          {service.category && (
            <Badge className="absolute left-3 top-3 bg-blue-600/90 text-white hover:bg-blue-600/90">
              {service.category}
            </Badge>
          )}
        </div>
        <CardContent className="flex min-w-0 flex-1 flex-col p-4">
          <h3 className="line-clamp-2 text-base font-semibold leading-snug">
            {service.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {service.description}
          </p>

          {service.service_areas.length > 0 && (
            <p className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3.5" />
              {service.service_areas.slice(0, 2).join(", ")}
            </p>
          )}

          <div className="mt-auto flex items-end justify-between gap-3 pt-4">
            <div className="min-w-0">
              {name && (
                <div className="flex items-center gap-2">
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photo}
                      alt={name}
                      className="size-6 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex size-6 items-center justify-center rounded-full bg-muted text-[10px] font-semibold">
                      {name[0]?.toUpperCase()}
                    </span>
                  )}
                  <span className="truncate text-xs text-muted-foreground">
                    {name}
                  </span>
                </div>
              )}
              {service.provider?.average_rating != null &&
              service.provider.review_count > 0 ? (
                <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="size-3 fill-amber-500 text-amber-500" />
                  <span className="font-medium text-foreground">
                    {service.provider.average_rating.toFixed(1)}
                  </span>
                  ({service.provider.review_count})
                </span>
              ) : (
                <span className="mt-1 block text-xs text-muted-foreground">No reviews yet</span>
              )}
            </div>
            <p className="max-w-[45%] shrink-0 text-right text-sm font-semibold">
              {formatIndicativePrice(service.indicative_price)}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
