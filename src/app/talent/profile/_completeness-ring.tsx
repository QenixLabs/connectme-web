"use client";

import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface CompletenessRingProps {
  percentage: number;
  onCompleteProfile?: () => void;
}

function Ring({ percentage }: { percentage: number }) {
  const size = 80;
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="sm:hidden">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-muted-bg"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-brand"
          style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>

      <svg width={96} height={96} viewBox={`0 0 ${96} ${96}`} className="hidden sm:block">
        <circle
          cx={48}
          cy={48}
          r={(96 - stroke) / 2}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-muted-bg"
        />
        <circle
          cx={48}
          cy={48}
          r={(96 - stroke) / 2}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={2 * Math.PI * ((96 - stroke) / 2)}
          strokeDashoffset={2 * Math.PI * ((96 - stroke) / 2) - (percentage / 100) * 2 * Math.PI * ((96 - stroke) / 2)}
          className="text-brand"
          style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        {percentage >= 100 ? (
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-success flex items-center justify-center">
            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-on-success" strokeWidth={2.5} />
          </div>
        ) : (
          <span className="text-sm sm:text-base font-bold text-text-primary">{percentage}%</span>
        )}
      </div>
    </div>
  );
}

export function CompletenessRing({ percentage, onCompleteProfile }: CompletenessRingProps) {
  const isComplete = percentage >= 100;

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 space-y-3">
            <h2 className="text-sm sm:text-base font-semibold text-text-primary">Profile Completeness</h2>

            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-success flex-shrink-0" strokeWidth={2} />
              <span className="text-xs sm:text-sm text-text-secondary">{isComplete ? "Profile Complete" : "Complete Profile"}</span>
            </div>

            {!isComplete && onCompleteProfile && (
              <Button
                variant="outline"
                onClick={onCompleteProfile}
                className="text-xs h-8 px-3"
              >
                Complete Profile
              </Button>
            )}
          </div>

          <Ring percentage={percentage} />
        </div>
      </CardContent>
    </Card>
  );
}

export function CompletenessRingSkeleton() {
  return (
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
          <div className="relative w-20 h-20 sm:w-24 sm:h-24">
            <Skeleton className="w-full h-full rounded-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
