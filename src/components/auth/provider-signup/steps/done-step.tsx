"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles, Store } from "lucide-react";

export function DoneStep() {
  return (
    <div className="flex min-h-[640px] flex-col items-center justify-center px-6 py-12 text-center sm:px-10">
      <div className="relative mb-4">
        <span className="grid size-20 place-items-center rounded-3xl bg-[#F6F1FF] text-[#8738FF] shadow-lg shadow-[#8738FF]/15 dark:bg-[#8738FF]/20">
          <CheckCircle2 className="size-11 stroke-[2.2]" />
        </span>
        <span className="absolute -bottom-1 -right-1 grid size-7 place-items-center rounded-full bg-emerald-500 text-white shadow">
          <Sparkles className="size-4" />
        </span>
      </div>

      <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300">
        Account Created &amp; Verified
      </div>

      <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold text-[#101333] dark:text-white">
        You&rsquo;re all set!
      </h1>
      <p className="mt-2 max-w-sm text-xs sm:text-sm leading-relaxed text-[#7885A3] dark:text-white/70">
        Your Morporfile provider profile is active. Showcase your services, receive inquiries, and grow your creative business.
      </p>

      <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
        <Link
          href="/provider/dashboard"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8738FF] via-[#7E33F6] to-[#6C2BE8] text-sm font-bold text-white shadow-[0_12px_28px_-10px_rgba(135,56,255,0.65)] transition-all hover:brightness-105 active:scale-[0.99]"
        >
          <Store className="size-4.5" />
          <span>Go to Provider Dashboard</span>
          <ArrowRight className="size-4" />
        </Link>

        <Link
          href="/services"
          className="flex h-11 w-full items-center justify-center rounded-xl border border-[#E1E7F2] bg-white text-xs font-semibold text-[#4E5971] transition-all hover:bg-[#F7F8FC] dark:border-white/10 dark:bg-white/5 dark:text-white/80"
        >
          Explore Services Marketplace
        </Link>
      </div>
    </div>
  );
}
