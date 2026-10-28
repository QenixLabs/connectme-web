"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ClipboardList } from "lucide-react";
import { serviceInquiriesApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { InquiryStatus } from "@/components/service-inquiries/inquiry-status";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function MyServiceInquiriesPage() {
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: queryKeys.serviceInquiries.mine({ page, limit: 20 }),
    queryFn: () => serviceInquiriesApi.getMine({ page, limit: 20 }),
    retry: false,
  });

  if (query.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    );
  }
  if (query.isError) {
    return (
      <Card>
        <CardContent className="space-y-3 p-6">
          <h1 className="text-xl font-semibold">
            Could not load your inquiries
          </h1>
          <p role="alert" className="text-sm text-destructive">
            {getApiErrorMessage(query.error, "Please try again.")}
          </p>
          <Button variant="outline" onClick={() => void query.refetch()}>
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const result = query.data;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          My service inquiries
        </h1>
        <p className="text-sm text-muted-foreground">
          Keep track of requests you have sent to providers.
        </p>
      </div>
      {!result?.data.length ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center p-10 text-center">
            <ClipboardList className="size-8 text-muted-foreground" />
            <p className="mt-3 font-semibold">No inquiries yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Browse providers and services to send an inquiry.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/services">Browse services</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {result.data.map((inquiry) => (
            <Card key={inquiry.id}>
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <InquiryStatus status={inquiry.status} />
                    <span className="text-xs text-muted-foreground">
                      {new Date(inquiry.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm">
                    {inquiry.description}
                  </p>
                  {inquiry.location && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {inquiry.location}
                    </p>
                  )}
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/inquiries/${inquiry.id}`}>
                    View inquiry <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
          <div className="flex justify-between">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((value) => value - 1)}
            >
              Previous
            </Button>
            <span className="self-center text-sm text-muted-foreground">
              Page {result.page}
            </span>
            <Button
              variant="outline"
              disabled={!result.hasMore}
              onClick={() => setPage((value) => value + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
