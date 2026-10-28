import Link from "next/link";
import { ImageIcon, MapPin, Star } from "lucide-react";
import type { PublicServiceSummary } from "@/lib/api/marketplace";
import { formatIndicativePrice } from "@/components/marketplace/format";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ServiceCardProps {
  service: PublicServiceSummary;
  providerName?: string;
  providerPhoto?: string;
}

export function ServiceCard({
  service,
  providerName,
  providerPhoto,
}: ServiceCardProps) {
  const name =
    providerName ||
    service.provider?.display_name ||
    service.provider?.business_name;
  const photo = providerPhoto || service.provider?.profile_photo;

  return (
    <Link href={`/services/${service.id}`} className="group block h-full">
      <Card className="h-full overflow-hidden transition-shadow group-hover:shadow-md">
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
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
            <Badge className="absolute left-3 top-3 bg-background/90 text-foreground hover:bg-background/90">
              {service.category}
            </Badge>
          )}
        </div>
        <CardContent className="flex flex-col p-4">
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
            <p className="shrink-0 text-right text-sm font-semibold">
              {formatIndicativePrice(service.indicative_price)}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
