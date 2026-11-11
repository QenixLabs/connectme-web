"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Heart, MapPin, Star } from "lucide-react";
import type { PublicServiceSummary } from "@/lib/api/marketplace";

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function isProviderVerified(
  provider: PublicServiceSummary["provider"],
): boolean {
  return provider?.is_verified === true;
}

function getServiceLocations(service: PublicServiceSummary): string[] {
  const serviceAreas = service.service_areas.filter(Boolean);
  if (serviceAreas.length) return [...new Set(serviceAreas)];

  const location = service.provider?.location;
  const providerLocation = [location?.city, location?.state]
    .filter(Boolean)
    .join(", ");
  return providerLocation ? [providerLocation] : ["Remote"];
}

interface ServiceCardProps {
  service: PublicServiceSummary;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const [failedImageUrl, setFailedImageUrl] = useState<string>();
  const [isSaved, setIsSaved] = useState(false);
  const imageUrl = service.images[0];
  const showImage = Boolean(imageUrl && failedImageUrl !== imageUrl);
  const locations = getServiceLocations(service);
  const providerName =
    service.provider?.display_name ||
    service.provider?.business_name ||
    "Service provider";
  const price = service.indicative_price;
  const unit = price?.unit ?? "project";
  const hasRating =
    service.provider?.average_rating != null &&
    service.provider.review_count > 0;

  return (
    <article className="group relative overflow-hidden rounded-3xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-12px_rgba(15,23,42,0.14)] ring-1 ring-slate-900/5 transition-[box-shadow,transform] duration-200 hover:shadow-[0_1px_2px_rgba(15,23,42,0.06),0_20px_40px_-12px_rgba(76,29,149,0.2)] active:scale-[0.98] motion-reduce:transition-none">
      <Link
        href={`/services/${service.id}`}
        aria-label={`View ${service.title}`}
        className="block rounded-3xl focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-700"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[linear-gradient(130deg,#30206f_0%,#334d9e_55%,#c05b31_100%)]">
          {showImage && imageUrl && (
            <Image
              src={imageUrl}
              alt={`${service.title} cover`}
              fill
              unoptimized
              sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
              onError={() => setFailedImageUrl(imageUrl)}
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          )}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/10 to-slate-950/45"
          />
          <span className="absolute left-3 top-3 max-w-[calc(100%-5.5rem)] truncate rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-slate-900 backdrop-blur-md">
            {service.category}
          </span>
          {hasRating && (
            <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-slate-950/70 px-2.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
              <Star
                className="size-3.5 fill-amber-400 text-amber-400"
                aria-hidden="true"
              />
              {service.provider?.average_rating?.toFixed(1)}
              <span className="font-medium text-white/80">
                ({service.provider?.review_count})
              </span>
            </span>
          )}
        </div>

        <div className="space-y-3.5 p-4">
          <div className="space-y-1">
            <h3 className="line-clamp-1 text-[17px] font-semibold leading-snug tracking-tight text-slate-900">
              {service.title}
            </h3>
            <p className="line-clamp-2 min-h-10 text-sm leading-5 text-slate-600">
              {service.short_description || service.description}
            </p>
          </div>

          <p className="flex min-w-0 items-center gap-1.5 text-xs text-slate-600">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{locations[0]}</span>
            {locations.length > 1 && (
              <span className="shrink-0 rounded-full bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-700">
                +{locations.length - 1}
              </span>
            )}
          </p>

          <div className="flex min-w-0 items-end justify-between gap-3 border-t border-slate-200 pt-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-violet-100 text-xs font-bold text-violet-900">
                {providerName[0]?.toUpperCase()}
              </span>
              <span className="truncate text-[13px] font-medium text-slate-800">
                {providerName}
              </span>
              {isProviderVerified(service.provider) && (
                <BadgeCheck
                  className="size-4 shrink-0 fill-violet-700 text-white"
                  aria-label="Verified provider"
                />
              )}
            </div>
            <p className="shrink-0 text-right leading-tight">
              {price ? (
                <>
                  <span className="block text-[11px] font-medium text-slate-600">
                    From
                  </span>
                  <span className="text-[17px] font-bold tabular-nums text-slate-950">
                    {inrFormatter.format(price.amount)}
                  </span>
                  <span className="text-xs font-medium text-slate-600">
                    {" "}
                    / {unit}
                  </span>
                </>
              ) : (
                <span className="text-sm font-semibold text-slate-900">
                  Price on request
                </span>
              )}
            </p>
          </div>
        </div>
      </Link>

      <button
        type="button"
        aria-label={isSaved ? "Remove service from saved" : "Save service"}
        aria-pressed={isSaved}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setIsSaved((saved) => !saved);
        }}
        className="absolute right-3 top-3 z-10 grid size-10 place-items-center rounded-full bg-white/90 text-slate-800 shadow-sm backdrop-blur-md transition-colors hover:text-violet-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-700 focus-visible:ring-offset-2 motion-reduce:transition-none"
      >
        <Heart
          className={`size-[18px] ${isSaved ? "fill-violet-700 text-violet-700" : ""}`}
          aria-hidden="true"
        />
      </button>
    </article>
  );
}
