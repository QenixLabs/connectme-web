import { Skeleton } from "@/components/ui/skeleton";

export function TalentListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-800 bg-[#0a1420] p-4"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Skeleton className="h-40 w-full rounded-lg sm:h-40 sm:w-36" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-40" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded-md" />
                <Skeleton className="h-5 w-16 rounded-md" />
                <Skeleton className="h-5 w-16 rounded-md" />
              </div>
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="flex w-full shrink-0 flex-col gap-2 sm:w-40">
              <Skeleton className="h-8 w-full rounded-lg" />
              <Skeleton className="h-8 w-full rounded-lg" />
              <Skeleton className="h-8 w-full rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
