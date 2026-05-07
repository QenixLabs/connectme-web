"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { talentApi } from "@/lib/api";

interface CompletenessBannerProps {
  version: number;
}

export function CompletenessBanner({ version }: CompletenessBannerProps) {
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

  if (error || !data) return null;

  if (data.isComplete) {
    return (
      <Card className="p-4 mb-6">
        <div className="flex items-start gap-2.5 text-sm text-success-text">
          <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
          <span>Your profile is complete.</span>
        </div>
      </Card>
    );
  }

  const total = 35;
  const filled = Math.max(0, total - data.missingFields.length);
  const pct = Math.round((filled / total) * 100);

  return (
    <Card className="p-4 mb-6" progress={pct}>
      <div className="flex items-start gap-2.5 text-sm">
        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-brand-hover" strokeWidth={1.5} />
        <div className="flex-1">
          <p className="text-text-primary font-medium">
            Profile {pct}% complete
          </p>
          <p className="text-text-tertiary text-xs mt-1">
            Missing: {data.missingFields.slice(0, 6).join(", ")}
            {data.missingFields.length > 6 && ` +${data.missingFields.length - 6} more`}
          </p>
        </div>
      </div>
    </Card>
  );
}
