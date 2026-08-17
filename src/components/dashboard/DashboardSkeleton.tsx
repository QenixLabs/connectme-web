"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function StatSkeleton() {
  return (
    <Card className="min-w-[calc(50%-6px)] snap-start border-border/60 bg-surface/40 py-0 sm:min-w-0">
      <CardContent className="flex flex-col p-4">
        <Skeleton className="mb-3 size-10 rounded-xl" />
        <Skeleton className="mb-1 h-8 w-16" />
        <Skeleton className="h-3 w-16" />
      </CardContent>
    </Card>
  );
}

function ActionSkeleton() {
  return (
    <Card className="h-full min-h-[96px] border-border/60 bg-surface/40 py-0">
      <CardContent className="flex h-full flex-col items-start justify-between p-4">
        <Skeleton className="size-11 rounded-xl" />
        <Skeleton className="mt-4 h-4 w-20" />
      </CardContent>
    </Card>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-5 py-4 sm:py-6 lg:space-y-8">
      {/* Hero */}
      <Card className="border-border/60 bg-surface/40 py-0">
        <CardContent className="relative flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:gap-6 lg:p-6">
          <Skeleton className="size-24 shrink-0 rounded-full sm:size-28" />
          <div className="min-w-0 flex-1 space-y-3">
            <Skeleton className="h-5 w-28 rounded-full" />
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="absolute top-4 right-4 size-9 rounded-full sm:static lg:hidden" />
          <Skeleton className="hidden h-9 w-28 rounded-full lg:block" />
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0 lg:grid-cols-5 snap-x-mandatory">
        {Array.from({ length: 5 }).map((_, i) => (
          <StatSkeleton key={i} />
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <ActionSkeleton key={i} />
        ))}
      </div>

      {/* Main columns */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.38fr)_minmax(0,0.62fr)] lg:gap-6">
        <div className="space-y-5 lg:space-y-6">
          <Card className="border-border/60 bg-surface/40 py-0">
            <CardContent className="p-5">
              <div className="flex items-center gap-5 lg:flex-col lg:items-stretch">
                <Skeleton className="mx-auto size-32 shrink-0 rounded-full lg:size-36" />
                <div className="min-w-0 flex-1 space-y-3">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
              <Skeleton className="mt-5 h-9 w-full rounded-full" />
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-surface/40 py-0">
            <CardContent className="space-y-3 p-5">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-9 w-full rounded-full" />
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-surface/40 py-0">
            <CardContent className="space-y-3 p-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-5 lg:space-y-6">
          <Card className="border-border/60 bg-surface/40 py-0">
            <CardContent className="p-5">
              <Skeleton className="mb-3 h-4 w-40" />
              <div className="flex gap-3">
                <Skeleton className="h-48 w-[88%] rounded-2xl sm:w-[62%] lg:w-1/2" />
                <Skeleton className="hidden h-48 w-1/2 rounded-2xl lg:block" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-surface/40 py-0">
            <CardContent className="p-5">
              <Skeleton className="mb-3 h-4 w-32" />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-xl" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
