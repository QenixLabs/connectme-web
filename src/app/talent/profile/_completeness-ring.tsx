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
  const padding = 6;
  const radius = (size - stroke) / 2 - padding;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0">
      <svg className="w-full h-full" viewBox={`0 0 ${size} ${size}`}>
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
          style={{
            transform: "rotate(-90deg)",
            transformOrigin: "50% 50%",
            transition: "stroke-dashoffset 0.5s ease",
          }}
        />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        {percentage >= 100 ? (
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-success flex items-center justify-center">
            <Check className="w-3 h-3 text-on-success" strokeWidth={2.5} />
          </div>
        ) : (
          <span className="text-[10px] sm:text-xs font-bold text-text-primary">
            {percentage}%
          </span>
        )}
      </div>
    </div>
  );
}

export function CompletenessRing({
  percentage,
  onCompleteProfile,
}: CompletenessRingProps) {
  const isComplete = percentage >= 100;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex-1 min-w-0 space-y-2">
            <h2 className="text-sm font-semibold text-text-primary truncate">
              Profile Completeness
            </h2>

            <div className="flex items-center gap-2">
              <Check
                className="w-4 h-4 text-success flex-shrink-0"
                strokeWidth={2}
              />
              <span className="text-xs text-text-secondary">
                {isComplete ? "Profile Complete" : "Complete Profile"}
              </span>
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
    <Card className="overflow-hidden">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-4 w-32" />
            <div className="flex items-center gap-2">
              <Skeleton className="w-4 h-4 rounded-full flex-shrink-0" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-8 w-28 rounded-lg" />
          </div>
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0">
            <Skeleton className="w-full h-full rounded-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
