"use client";

import { useEffect, useState } from "react";
import { talentApi } from "@/lib/api";
import { CompletenessRing, CompletenessRingSkeleton } from "./_completeness-ring";

interface CompletenessBannerProps {
  version: number;
  onCompleteProfile?: () => void;
}

export function CompletenessBanner({ version, onCompleteProfile }: CompletenessBannerProps) {
  const [data, setData] = useState<{ isComplete: boolean; missingFields: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    talentApi
      .getCompleteness()
      .then((res) => {
        if (!cancelled) {
          setData(res);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) setError("Could not load profile completeness");
      });
    return () => {
      cancelled = true;
    };
  }, [version]);

  if (error) return null;
  if (!data) return <CompletenessRingSkeleton />;

  const total = 35;
  const filled = Math.max(0, total - data.missingFields.length);
  const pct = Math.round((filled / total) * 100);

  return <CompletenessRing percentage={pct} onCompleteProfile={onCompleteProfile} />;
}
