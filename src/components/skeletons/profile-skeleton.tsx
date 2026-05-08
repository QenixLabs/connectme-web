import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function CompletenessRingSkeleton() {
  return (
    <div className="relative w-20 h-20 sm:w-24 sm:h-24">
      <Skeleton className="w-full h-full rounded-full" />
      <div className="absolute inset-0 flex items-center justify-center">
        <Skeleton className="w-12 h-12 rounded-full bg-card" />
      </div>
    </div>
  );
}

function ChecklistItemSkeleton() {
  return (
    <div className="flex items-center gap-2.5">
      <Skeleton className="w-4 h-4 rounded-full flex-shrink-0" />
      <Skeleton className="h-3.5 w-3/4" />
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-4 pb-8">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex-shrink-0" />
            <div className="flex-1 min-w-0 space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-36" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="w-5 h-5 rounded-full flex-shrink-0" />
          </div>
        </CardContent>
      </Card>

      {/* Completeness */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 space-y-3">
              <Skeleton className="h-4 w-36" />
              <div className="flex items-center gap-2">
                <Skeleton className="w-4 h-4 rounded-full flex-shrink-0" />
                <Skeleton className="h-3.5 w-28" />
              </div>
              <Skeleton className="h-8 w-28 rounded-lg" />
            </div>
            <CompletenessRingSkeleton />
          </div>
        </CardContent>
      </Card>

      {/* Trust Score */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="space-y-3">
            <ChecklistItemSkeleton />
            <ChecklistItemSkeleton />
            <ChecklistItemSkeleton />
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <Skeleton className="h-4 w-48 mb-4" />
          <div className="space-y-3">
            <ChecklistItemSkeleton />
            <ChecklistItemSkeleton />
            <ChecklistItemSkeleton />
          </div>
        </CardContent>
      </Card>

      {/* TalentCard Preview */}
      <div className="pt-2">
        <Skeleton className="h-3.5 w-40 mb-3" />
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex-shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
