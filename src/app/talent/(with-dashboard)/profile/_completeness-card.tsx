"use client";

import { ShieldCheck, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface CompletenessCardProps {
  percentage: number;
  onCompleteProfile?: () => void;
}

function CompletionRing({
  percent,
  size = 96,
  stroke = 8,
}: {
  percent: number;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const filled = (percent / 100) * c;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-cream-deep)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#cm-gold-gradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${c - filled}`}
          style={{ transition: "stroke-dashoffset 0.7s ease-out" }}
        />
        <defs>
          <linearGradient
            id="cm-gold-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="var(--color-gold-bright)" />
            <stop offset="100%" stopColor="var(--color-gold)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[28px] font-bold text-ink font-serif">
        {percent}%
      </div>
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-gold">
        <Check size={14} className="text-white" strokeWidth={3} />
      </div>
    </div>
  );
}

export function CompletenessCard({
  percentage,
  onCompleteProfile,
}: CompletenessCardProps) {
  const isComplete = percentage >= 100;

  return (
    <Card>
      <CardContent className="p-5">
        <h2 className="text-[17px] font-medium text-ink mb-4">
          Profile Completeness
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <div className="mb-3 flex items-center gap-1.5 text-[14px] text-ink-soft">
              <ShieldCheck size={16} className="text-gold" strokeWidth={1.5} />
              Complete Profile
            </div>
            {!isComplete && onCompleteProfile && (
              <button
                onClick={onCompleteProfile}
                className="rounded-full border border-ink/15 px-4 py-2 text-[13px] text-ink-soft hover:bg-cream transition-colors"
              >
                Complete Profile
              </button>
            )}
          </div>
          <CompletionRing percent={percentage} />
        </div>
      </CardContent>
    </Card>
  );
}

export function CompletenessCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-5">
        <Skeleton className="h-5 w-44 mb-4" />
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-9 w-36 rounded-full" />
          </div>
          <Skeleton className="h-24 w-24 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}
