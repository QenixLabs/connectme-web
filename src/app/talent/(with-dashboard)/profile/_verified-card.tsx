"use client";

import { ChevronRight, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface VerifiedCardProps {
  onClick?: () => void;
}

export function VerifiedCard({ onClick }: VerifiedCardProps) {
  return (
    <Card
      className="border-msg-border shadow-sm cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="flex items-center gap-3 px-4 py-3">
          <div
            className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center shrink-0"
            style={{
              background: "var(--color-msg-gold-soft)",
              border: "0.5px solid var(--color-border-gold)",
            }}
          >
            <ShieldCheck className="w-5 h-5 text-msg-gold" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-semibold text-msg-ink">Verified</div>
            <div className="text-[12px] text-msg-ink-muted mt-0.5">Passed ID verification</div>
          </div>
          <ChevronRight className="w-4 h-4 shrink-0 text-msg-gold" strokeWidth={2} />
        </div>
      </CardContent>
    </Card>
  );
}
