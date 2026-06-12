"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CircularProgress } from "./_circular-progress";
import { ShieldCheck } from "lucide-react";

interface CompletenessRingProps {
  percentage: number;
  onCompleteProfile?: () => void;
}

export function CompletenessRing({ percentage, onCompleteProfile }: CompletenessRingProps) {
  const isComplete = percentage >= 100;

  return (
    <Card className="border-msg-border shadow-sm bg-white">
      <CardContent className="p-0">
        {/* Mobile: slim horizontal banner */}
        <div className="sm:hidden px-4 py-3">
          <button
            onClick={!isComplete ? onCompleteProfile : undefined}
            className="w-full flex items-center justify-between text-[13px] font-semibold text-msg-ink"
          >
            <span className="truncate">
              {isComplete
                ? "Profile complete — great job!"
                : "Fill missing sections to boost visibility."}
            </span>
            <span className="ml-2 shrink-0 text-msg-gold">
              {percentage}%
            </span>
          </button>
        </div>

        {/* Desktop: full card */}
        <div className="hidden sm:block p-5">
          <div className="flex items-center gap-5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-4 h-4 text-msg-gold" strokeWidth={1.5} />
                <h2 className="text-[13px] font-semibold text-msg-ink">Complete Profile</h2>
              </div>
              <p className="text-[12px] text-msg-ink-muted leading-relaxed mb-3">
                {isComplete
                  ? "Your profile is complete. Great job!"
                  : "Fill missing sections to boost your visibility"}
              </p>
              {!isComplete && onCompleteProfile && (
                <button
                  onClick={onCompleteProfile}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg border bg-white text-msg-ink transition-colors border-msg-ink"
                >
                  Complete Profile
                </button>
              )}
            </div>
            <div className="shrink-0">
              <CircularProgress percentage={percentage} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CompletenessRingSkeleton() {
  return (
    <Card className="border-msg-border shadow-sm bg-white">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <Skeleton className="w-[68px] h-[68px] rounded-full" />
          <div className="flex-1 min-w-0 w-full space-y-3">
            <Skeleton className="h-4 w-36 mx-auto sm:mx-0" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3 mx-auto sm:mx-0" />
            <Skeleton className="h-9 w-full sm:w-32 rounded-xl" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
