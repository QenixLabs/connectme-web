import Link from "next/link";
import { ArrowRight, Briefcase, MapPin, Star } from "lucide-react";
import type { PublicProviderSummary } from "@/lib/api/marketplace";
import { formatAmount } from "@/components/marketplace/format";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ProviderCard({ provider }: { provider: PublicProviderSummary }) {
  const name = provider.display_name || provider.business_name || "Service provider";
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <Link
      href={`/providers/${provider.slug}`}
      className="group block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Card className="h-full gap-0 overflow-hidden rounded-2xl border-border/70 bg-background py-0 shadow-sm transition-all group-hover:-translate-y-0.5 group-hover:border-primary/30 group-hover:shadow-md">
        <CardContent className="flex h-full flex-col p-4 sm:p-5">
          <div className="flex items-center gap-4 sm:gap-5">
            <Avatar className="size-16 shrink-0 rounded-full bg-primary/5 ring-2 ring-background shadow-sm sm:size-20">
              <AvatarImage src={provider.profile_photo} alt={name} />
              <AvatarFallback className="bg-primary/5 text-xl font-semibold text-primary sm:text-2xl">
                {initials || "P"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-lg font-bold tracking-tight sm:text-2xl">{name}</h3>
              {provider.business_name && provider.display_name && (
                <Badge variant="secondary" className="mt-1 gap-1.5 rounded-lg bg-primary/5 px-2.5 py-1 text-primary">
                  <Briefcase aria-hidden="true" className="size-3.5" />
                  <span className="max-w-[min(60vw,20rem)] truncate">{provider.business_name}</span>
                </Badge>
              )}
              {provider.provider_type && (
                <p className="mt-1 truncate text-sm font-medium text-muted-foreground">
                  {provider.provider_type}
                </p>
              )}
              {provider.location?.city ? (
                <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin aria-hidden="true" className="size-4 shrink-0" />
                  {[provider.location.city, provider.location.state]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              ) : provider.tagline ? (
                <p className="mt-2 truncate text-sm text-muted-foreground">{provider.tagline}</p>
              ) : null}
            </div>
          </div>

          {provider.about && (
            <p className="mt-4 line-clamp-2 min-h-12 text-sm leading-6 text-muted-foreground sm:text-base">
              {provider.about}
            </p>
          )}

          {provider.categories.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {provider.categories.slice(0, 2).map((category) => (
                <Badge key={category} variant="secondary" className="font-normal">
                  {category}
                </Badge>
              ))}
              {provider.categories.length > 2 && (
                <Badge variant="outline" className="font-normal">
                  +{provider.categories.length - 2}
                </Badge>
              )}
            </div>
          )}
          {provider.skills.length > 0 && (
            <p className="mt-2 line-clamp-1 text-xs text-muted-foreground">
              Expertise: {provider.skills.slice(0, 3).join(", ")}
            </p>
          )}

          <div className="mt-auto pt-5">
            <div className="grid grid-cols-2 gap-3 border-t border-border/60 pt-4">
              <div className="flex min-w-0 items-start gap-2.5 sm:border-r sm:border-border/60 sm:py-1">
                <Star aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-amber-500" />
                <div className="min-w-0">
                  {provider.average_rating !== null && provider.review_count > 0 ? (
                    <>
                      <p className="text-sm font-semibold text-foreground">
                        {provider.average_rating.toFixed(1)}
                        <span className="ml-1 font-normal text-muted-foreground">
                          ({provider.review_count})
                        </span>
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">Customer reviews</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-foreground">No reviews yet</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">Be the first to review</p>
                    </>
                  )}
                </div>
              </div>
              <div className="flex min-w-0 items-start gap-2.5 sm:border-r sm:border-border/60 sm:py-1">
                <Briefcase aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {provider.services_count} service{provider.services_count === 1 ? "" : "s"}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Services offered</p>
                </div>
              </div>
              <div className="col-span-2 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-success px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition-colors group-hover:bg-success/90">
                View Profile
                <ArrowRight aria-hidden="true" className="size-4 shrink-0" />
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              {provider.starting_price !== null
                ? `Services from ${formatAmount(provider.starting_price)}`
                : "Contact for pricing"}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
