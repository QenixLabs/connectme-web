"use client";

import { ChevronRight, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface VerifiedCardProps {
  onClick?: () => void;
}

export function VerifiedCard({ onClick }: VerifiedCardProps) {
  return (
    <Card className="cursor-pointer" onClick={onClick}>
      <CardContent className="p-0">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-[38px] h-[38px] rounded-[10px] grid place-items-center shrink-0 bg-gold-soft border border-gold/30">
            <ShieldCheck className="w-5 h-5 text-gold-ink" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-semibold text-ink">Verified</div>
            <div className="text-[12px] text-ink-muted mt-0.5">Passed ID verification</div>
          </div>
          <ChevronRight className="w-4 h-4 shrink-0 text-gold" strokeWidth={2} />
        </div>
      </CardContent>
    </Card>
  );
}
