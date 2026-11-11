import { Skeleton } from "@/components/ui/skeleton";

export function ServiceCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-3xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-12px_rgba(15,23,42,0.14)] ring-1 ring-slate-900/5"
    >
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-3.5 p-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="h-4 w-1/3" />
        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <Skeleton className="h-8 w-28 rounded-full" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    </div>
  );
}
