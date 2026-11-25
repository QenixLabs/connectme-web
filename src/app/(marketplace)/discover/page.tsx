import { Suspense } from "react";
import type { Metadata } from "next";
import { DiscoverPage } from "@/components/marketplace/discover-page";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Discover opportunities and creative providers | Morporfile",
  description:
    "Browse live creative opportunities and service providers on Morporfile.",
};

function DiscoverSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-36 rounded-2xl sm:h-56" />
      <Skeleton className="h-14 rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-72 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function DiscoverRoute() {
  return (
    <Suspense fallback={<DiscoverSkeleton />}>
      <DiscoverPage />
    </Suspense>
  );
}
