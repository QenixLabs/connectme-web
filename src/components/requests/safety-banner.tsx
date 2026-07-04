"use client";

import Link from "next/link";
import { Shield, ChevronRight } from "lucide-react";

export function SafetyBanner() {
  return (
    <Link
      href="/talent/safety"
      className="block rounded-xl bg-card border border-border hover:bg-cream-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div className="w-9 h-9 rounded-full bg-brand-light flex items-center justify-center flex-shrink-0">
          <Shield className="w-[18px] h-[18px] text-brand" strokeWidth={2} />
        </div>
        <span className="flex-1 text-sm font-medium text-text-primary">
          Your safety is our priority
        </span>
        <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" strokeWidth={1.5} />
      </div>
    </Link>
  );
}
