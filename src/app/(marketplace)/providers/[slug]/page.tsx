"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  ExternalLink,
  Mail,
  MapPin,
  Sparkles,
} from "lucide-react";
import { providersApi } from "@/lib/api/marketplace";
import { getApiErrorMessage } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { ContactProviderButton } from "@/components/marketplace/contact-provider-button";
import { ServiceInquiryForm } from "@/components/marketplace/service-inquiry-form";
import { ServiceCard } from "@/components/marketplace/service-card";
import { ProviderReviewsSection } from "@/components/marketplace/provider-reviews-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function PublicProviderProfilePage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";

  const profileQuery = useQuery({
    queryKey: queryKeys.provider.publicProfile(slug),
    queryFn: () => providersApi.getPublicProfile(slug),
    enabled: Boolean(slug),
    retry: false,
  });

  if (profileQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-52 w-full rounded-2xl" />
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-4">
            <Skeleton className="h-40" />
            <Skeleton className="h-64" />
          </div>
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  const status = (profileQuery.error as { response?: { status?: number } } | null)?.response
    ?.status;

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <Card className="mx-auto max-w-lg border-dashed">
        <CardContent className="flex flex-col items-center p-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-muted">
            <AlertCircle className="size-6 text-muted-foreground" />
          </span>
          <h1 className="mt-4 text-xl font-semibold">
            {status === 404 ? "Provider not found" : "Could not load this provider"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {status === 404
              ? "This profile may not be published yet, or the link may be incorrect."
              : getApiErrorMessage(profileQuery.error, "Please try again in a moment.")}
          </p>
          <Button variant="outline" className="mt-4" asChild>
            <Link href="/providers">
              <ArrowLeft className="mr-2 size-4" />
              Browse providers
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const profile = profileQuery.data;
  const name = profile.display_name || profile.business_name || "Service provider";
  const location = [profile.location?.city, profile.location?.state, profile.location?.country]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="-ml-2 w-fit" asChild>
        <Link href="/providers">
          <ArrowLeft className="mr-2 size-4" />
          All providers
        </Link>
      </Button>

      <Card className="overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-primary/25 via-primary/10 to-transparent sm:h-32" />
        <CardContent className="p-6 pt-0">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end">
            {profile.profile_photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.profile_photo}
                alt={name}
                className="size-24 rounded-2xl border-4 border-background object-cover shadow-sm sm:size-28"
              />
            ) : (
              <span className="flex size-24 items-center justify-center rounded-2xl border-4 border-background bg-muted text-3xl font-bold shadow-sm sm:size-28">
                {name[0]?.toUpperCase()}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{name}</h1>
              {profile.business_name && profile.display_name && (
                <p className="text-muted-foreground">{profile.business_name}</p>
              )}
              {location && (
                <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="size-4" />
                  {location}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.services_count > 0 && (
                <Badge variant="secondary" className="h-8 px-3">
                  <Briefcase className="mr-1 size-3.5" />
                  {profile.services_count} service{profile.services_count === 1 ? "" : "s"}
                </Badge>
              )}
              <ContactProviderButton
                providerSlug={profile.slug}
                providerName={name}
                variant="outline"
              />
            </div>
          </div>

          {profile.categories.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {profile.categories.map((category) => (
                <Badge key={category} variant="outline" className="font-normal">
                  {category}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.about ? (
                <p className="whitespace-pre-line text-sm leading-relaxed">{profile.about}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  This provider has not added a description yet.
                </p>
              )}
            </CardContent>
          </Card>

          {profile.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  Skills
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-1.5">
                {profile.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="font-normal">
                    {skill}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}

          {profile.portfolio.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Portfolio</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {profile.portfolio.map((item, index) => (
                  <div key={`${item.title}-${index}`} className="overflow-hidden rounded-xl border">
                    <div className="aspect-[16/10] bg-muted">
                      {item.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Briefcase className="size-7 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-1 p-3">
                      <p className="font-medium">{item.title}</p>
                      {item.description && (
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      )}
                      {item.link_url && (
                        <a
                          href={item.link_url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                        >
                          View project
                          <ExternalLink className="size-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <ProviderReviewsSection providerSlug={profile.slug} providerName={name} />

          <div className="space-y-4">
            <div className="flex items-end justify-between gap-2">
              <h2 className="text-xl font-semibold tracking-tight">Services</h2>
              {profile.services.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  {profile.services_count} published
                </span>
              )}
            </div>
            {profile.services.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center p-8 text-center">
                  <Briefcase className="size-8 text-muted-foreground" />
                  <p className="mt-3 font-semibold">No published services yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Contact {name.split(" ")[0]} to ask about availability and custom work.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                {profile.services.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    providerName={name}
                    providerPhoto={profile.profile_photo}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <ServiceInquiryForm providerSlug={profile.slug} providerName={name} />
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Work with {name.split(" ")[0]}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Send a message describing your project. You will continue the conversation in
                your RootIn inbox.
              </p>
              <ContactProviderButton
                providerSlug={profile.slug}
                providerName={name}
                className="w-full"
              />
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <Mail className="size-3.5" />
                Contact details are shared inside the conversation.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {location && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Based in
                  </p>
                  <p className="mt-1 flex items-center gap-1">
                    <MapPin className="size-4 text-muted-foreground" />
                    {location}
                  </p>
                </div>
              )}
              {profile.service_areas.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Service areas
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {profile.service_areas.map((area) => (
                        <Badge key={area} variant="outline" className="font-normal">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
              {profile.member_since && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Member since
                    </p>
                    <p className="mt-1">
                      {new Date(profile.member_since).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                      })}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
