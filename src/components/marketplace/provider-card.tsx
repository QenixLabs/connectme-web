import Link from "next/link";
import { MapPin, Star } from "lucide-react";
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
    <Link href={`/providers/${provider.slug}`} className="group block h-full">
      <Card className="h-full transition-shadow group-hover:shadow-md">
        <CardContent className="flex h-full flex-col p-5">
          <div className="flex items-start gap-4">
            <Avatar className="size-16 ring-2 ring-border">
              <AvatarImage src={provider.profile_photo} alt={name} />
              <AvatarFallback className="text-lg font-semibold">{initials || "P"}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-lg font-semibold tracking-tight">{name}</h3>
              {provider.business_name && provider.display_name && (
                <p className="truncate text-sm text-muted-foreground">{provider.business_name}</p>
              )}
              {provider.location?.city && (
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3.5" />
                  {[provider.location.city, provider.location.state]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
            </div>
          </div>

          {provider.about && (
            <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{provider.about}</p>
          )}

          {provider.categories.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {provider.categories.slice(0, 3).map((category) => (
                <Badge key={category} variant="secondary" className="font-normal">
                  {category}
                </Badge>
              ))}
              {provider.categories.length > 3 && (
                <Badge variant="outline" className="font-normal">
                  +{provider.categories.length - 3}
                </Badge>
              )}
            </div>
          )}

          <div className="mt-auto flex items-center justify-between gap-2 pt-4 text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Star className="size-4 text-amber-500" />
              {provider.services_count} service{provider.services_count === 1 ? "" : "s"}
            </span>
            <span className="font-medium">
              {provider.starting_price !== null
                ? `From ${formatAmount(provider.starting_price)}`
                : "Contact for pricing"}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
