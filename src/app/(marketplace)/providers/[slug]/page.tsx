"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { providersApi } from "@/lib/api/marketplace";
import { getApiErrorMessage } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { ProviderProfileView } from "@/components/marketplace/provider-profile-view";
import { ProviderReviewsSection } from "@/components/marketplace/provider-reviews-section";
import { ServiceInquiryForm } from "@/components/marketplace/service-inquiry-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PublicProviderProfilePage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";

  const profileQuery = useQuery({
    queryKey: queryKeys.provider.publicProfile(slug),
    queryFn: () => providersApi.getPublicProfile(slug),
    enabled: Boolean(slug),
    retry: false,
  });

  const ratingQuery = useQuery({
    queryKey: queryKeys.provider.ratingSummary(slug),
    queryFn: () => providersApi.getRatingSummary(slug),
    enabled: Boolean(slug),
    retry: false,
  });

  if (profileQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-64" />
        <Skeleton className="h-64 w-full rounded-3xl" />
        <div className="flex items-end gap-4 px-1">
          <Skeleton className="size-24 rounded-full sm:size-32" />
          <div className="space-y-2 pb-2">
            <Skeleton className="h-7 w-52" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-4">
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  const status = (profileQuery.error as { response?: { status?: number } } | null)
    ?.response?.status;

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

  return (
    <ProviderProfileView
      profile={profile}
      ratingSummary={ratingQuery.data}
      inquirySlot={(selection) => (
        <ServiceInquiryForm
          key={`${selection?.serviceId ?? ""}-${selection?.packageTitle ?? ""}`}
          providerSlug={profile.slug}
          providerName={name}
          services={profile.services}
          serviceId={selection?.serviceId}
          packageTitle={selection?.packageTitle}
          inSheet
        />
      )}
      reviewsSlot={
        <ProviderReviewsSection providerSlug={profile.slug} providerName={name} />
      }
    />
  );
}
