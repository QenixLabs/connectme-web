"use client";

import { ChevronRight, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface VerifiedCardProps {
  onClick?: () => void;
}

export function VerifiedCard({ onClick }: VerifiedCardProps) {
  return (
    <Card
      className="border-[#e0d9ce] shadow-sm cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="flex items-center gap-3 px-4 py-3">
          <div
            className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center shrink-0"
            style={{
              background: "#fdf3dc",
              border: "0.5px solid #e8c87a",
            }}
          >
            <ShieldCheck className="w-5 h-5" style={{ color: "#c8a040" }} strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-semibold text-[#1e1a14]">Verified</div>
            <div className="text-[12px] text-[#8a7d6b] mt-0.5">Passed ID verification</div>
          </div>
          <ChevronRight className="w-4 h-4 shrink-0" style={{ color: "#c8a040" }} strokeWidth={2} />
        </div>
      </CardContent>
    </Card>
  );
}
