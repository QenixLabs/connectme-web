"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface CompletenessRingProps {
  percentage: number;
  onCompleteProfile?: () => void;
}

export function CompletenessRing({ percentage, onCompleteProfile }: CompletenessRingProps) {
  const isComplete = percentage >= 100;

  return (
    <Card className="border-t-[2px] border-t-brand-muted overflow-hidden">
      <div className="flex items-center justify-between px-3.5 sm:px-4 pt-3 pb-2">
        <h2 className="text-[11px] uppercase tracking-[0.08em] font-medium text-brand-hover">Profile Completeness</h2>
        {!isComplete && onCompleteProfile && (
          <button
            onClick={onCompleteProfile}
            className="text-[11px] text-brand hover:text-brand-hover transition-colors font-medium"
          >
            Complete profile
          </button>
        )}
      </div>
      <CardContent className="px-3.5 sm:px-4 pb-3.5 pt-0 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[22px] font-medium text-brand leading-none">{percentage}%</span>
          <span className="text-[11px] text-text-secondary">
            {isComplete ? "All fields complete" : `${Math.round((percentage / 100) * 35)} fields filled`}
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted-bg overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${Math.min(percentage, 100)}%`,
              background: "linear-gradient(90deg, #F0C060, #E8A020)",
            }}
          />
        </div>
        <p className="text-[11px] text-text-secondary">
          Fill in missing sections to boost visibility and get more shortlists.
        </p>
      </CardContent>
    </Card>
  );
}

export function CompletenessRingSkeleton() {
  return (
    <Card className="border-t-[2px] border-t-brand-muted overflow-hidden">
      <div className="px-3.5 sm:px-4 pt-3 pb-2">
        <Skeleton className="h-3 w-32" />
      </div>
      <CardContent className="px-3.5 sm:px-4 pb-3.5 pt-0 space-y-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-1.5 w-full rounded-full" />
        <Skeleton className="h-3 w-48" />
      </CardContent>
    </Card>
  );
}
