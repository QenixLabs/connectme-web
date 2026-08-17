import { Skeleton } from "@/components/ui/skeleton";

export function TalentListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-border bg-surface p-5 shadow-[0_1px_2px_rgba(0,0,0,0.4),0_16px_40px_-20px_rgba(0,0,0,0.35)]"
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:gap-6">
            <Skeleton className="mx-auto h-64 w-full rounded-xl md:mx-0 md:h-44 md:w-36" />
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3.5 w-48" />
              <div className="flex flex-wrap gap-2 pt-1">
                <Skeleton className="h-6 w-16 rounded-md" />
                <Skeleton className="h-6 w-20 rounded-md" />
                <Skeleton className="h-6 w-14 rounded-md" />
                <Skeleton className="h-6 w-12 rounded-md" />
              </div>
            </div>
            <div className="flex shrink-0 flex-row gap-2 md:w-44 md:flex-col">
              <Skeleton className="h-10 flex-1 rounded-xl md:w-full" />
              <div className="flex flex-1 gap-2 md:w-full md:flex-row">
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
