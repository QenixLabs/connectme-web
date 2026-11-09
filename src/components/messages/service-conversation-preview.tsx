"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ImageIcon, Tag } from "lucide-react";
import { serviceInquiriesApi } from "@/lib/api";
import { servicesApi } from "@/lib/api/marketplace";
import { queryKeys } from "@/lib/api/query-keys";
import { formatIndicativePrice } from "@/components/marketplace/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ServiceConversationPreview({
  conversationId,
  resolveInquiry = false,
}: {
  conversationId?: string;
  resolveInquiry?: boolean;
}) {
  const queryServiceId = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("popstate", onStoreChange);
      return () => window.removeEventListener("popstate", onStoreChange);
    },
    () => new URLSearchParams(window.location.search).get("serviceId") ?? "",
    () => "",
  );
  const inquiryQuery = useQuery({
    queryKey: ["service-inquiries", "conversation", conversationId],
    queryFn: () => serviceInquiriesApi.getForConversation(conversationId!),
    enabled: resolveInquiry && Boolean(conversationId) && !queryServiceId,
    retry: false,
    staleTime: 0,
  });
  const serviceId =
    queryServiceId ||
    inquiryQuery.data?.service_id ||
    inquiryQuery.data?.inquiry?.service_id ||
    "";

  const serviceQuery = useQuery({
    queryKey: queryKeys.services.publicDetail(serviceId),
    queryFn: () => servicesApi.getPublicListing(serviceId),
    enabled: Boolean(serviceId),
    retry: false,
  });

  if (!serviceId) {
    if (inquiryQuery.isLoading) {
      return (
        <div className="shrink-0 px-3 py-3 sm:px-4">
          <Card className="overflow-hidden">
            <CardContent className="flex items-center gap-3 p-3">
              <Skeleton className="size-16 shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
    if (inquiryQuery.isError) {
      return (
        <div className="shrink-0 px-3 py-3 sm:px-4">
          <Card className="border-dashed">
            <CardContent className="p-3 text-sm text-muted-foreground">
              Could not load inquiry details.
            </CardContent>
          </Card>
        </div>
      );
    }
    return null;
  }

  if (serviceQuery.isLoading) {
    return (
      <div className="shrink-0 px-3 py-3 sm:px-4">
        <Card className="overflow-hidden py-3">
          <CardContent className="flex items-center gap-3 p-3">
            <Skeleton className="size-16 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-9 w-28 shrink-0" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const service = serviceQuery.data?.service;
  if (!service) {
    return (
      <div className="shrink-0 px-3 py-3 sm:px-4">
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-between gap-3 p-3">
            <p className="text-sm text-muted-foreground">
              {serviceQuery.isError
                ? "Could not load this service preview."
                : "This service is no longer available."}
            </p>
            <Button asChild size="sm" variant="outline">
              <Link href={`/services/${encodeURIComponent(serviceId)}`}>View details</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="shrink-0 px-3 py-3 sm:px-4">
      <Card className="overflow-hidden border-border/70 shadow-sm py-1">
        <CardContent className="flex items-center gap-3 p-3 sm:gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
            {service.images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={service.images[0]}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              <ImageIcon className="size-6 text-muted-foreground" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              {service.category && (
                <span className="hidden shrink-0 items-center gap-1 text-xs text-muted-foreground sm:flex">
                  <Tag className="size-3" />
                  {service.category}
                </span>
              )}
              <h2 className="truncate text-sm font-semibold">{service.title}</h2>
            </div>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {service.description}
            </p>
            <p className="mt-1 text-xs font-medium">
              {formatIndicativePrice(service.indicative_price)}
            </p>
          </div>

          <Button asChild size="sm" variant="outline" className="shrink-0">
            <Link href={`/services/${encodeURIComponent(service.id)}`}>View details</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
