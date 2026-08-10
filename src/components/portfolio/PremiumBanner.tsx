"use client";

import { Crown, ArrowRight } from "lucide-react";

export function PremiumBanner() {
  return (
    <button className="mt-6 grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-accent/40 bg-accent/10 p-4 text-left lg:hidden">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent/20 text-accent">
        <Crown className="size-5" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-foreground">Go Premium</span>
        <span className="block text-xs leading-relaxed text-muted-foreground">
          Unlock unlimited searches, advanced filters, and exclusive insights.
        </span>
      </span>
      <ArrowRight className="size-5 shrink-0 text-accent" />
    </button>
  );
}
