import { Suspense } from "react";
import { ProviderListings } from "@/components/provider/provider-listings";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProviderListingsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-6xl space-y-5">
          <Skeleton className="h-40 rounded-3xl" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-20 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      }
    >
      <ProviderListings />
    </Suspense>
  );
}
