"use client";

import Link from "next/link";
import { Lock, Sparkles, UserRound } from "lucide-react";
import { useAuthStore } from "@/providers/auth-store-provider";

const SIGN_UP_HREF = "/auth?mode=signup";
const LOG_IN_HREF = "/auth?mode=signin";

/**
 * Floating sign-up / log-in bar for public (guest) profile pages.
 *
 * It is fixed to the bottom of the viewport so registration stays reachable
 * while scrolling, and it renders nothing once a session is known so signed-in
 * visitors never see a sign-up prompt flash on hydration.
 */
export function SignUpLoginBar() {
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  if (!hasHydrated || user) return null;

  return (
    <>
      <aside
        aria-label="Join RootIn"
        className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] md:px-6"
      >
        <div className="flex w-full max-w-3xl flex-wrap items-center gap-2.5 rounded-[22px] border border-[#e6e1f5] bg-gradient-to-r from-white/95 via-white/95 to-[#f4f0ff]/95 px-4 py-3 shadow-[0_18px_45px_-22px_rgba(75,44,160,0.45)] backdrop-blur-xl dark:border-border dark:from-card/95 dark:via-card/95 dark:to-card/95 md:flex-nowrap md:gap-4 md:px-5 md:py-3.5">
          {/* Left — profile icon with a lock badge */}
          <span className="relative grid size-9 shrink-0 place-items-center rounded-full bg-purple-50 text-[#7C3AED] dark:bg-surface-2 dark:text-primary md:size-11">
            <UserRound className="size-[18px] md:size-5" strokeWidth={2} />
            <span className="absolute -bottom-0.5 -right-0.5 grid size-4 place-items-center rounded-full bg-[#7C3AED] text-white ring-2 ring-white dark:bg-primary dark:ring-card">
              <Lock className="size-2.5" strokeWidth={2.5} />
            </span>
          </span>

          {/* Center — headline + supporting copy */}
          <div className="min-w-0 flex-1">
            <h2 className="text-[13px] font-bold leading-tight text-[#1c274c] dark:text-foreground md:text-sm">
              Join RootIn to unlock the full experience
            </h2>
            <p className="mt-1 text-[11px] leading-snug text-muted-foreground md:text-xs">
              Create a free account to save talent, start conversations and get
              matched to opportunities.
            </p>
          </div>

          {/* Right — primary + secondary actions */}
          <div className="flex w-full shrink-0 items-center justify-center gap-1.5 md:w-auto md:justify-end md:gap-2">
            <Link
              href={SIGN_UP_HREF}
              className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full px-5 text-sm font-semibold text-white shadow-[0_10px_22px_-10px_rgba(109,40,217,0.75)] transition-transform hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]/50 md:flex-none"
              style={{ background: "linear-gradient(120deg, #8B5CF6 0%, #6D28D9 100%)" }}
            >
              <Sparkles className="size-4" />
              Sign Up
            </Link>
            <Link
              href={LOG_IN_HREF}
              className="flex h-10 items-center justify-center rounded-full px-3 text-sm font-semibold text-[#6D28D9] transition-colors hover:bg-[#f1eaff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]/40 dark:text-primary dark:hover:bg-surface-2 md:flex-none"
            >
              Log In
            </Link>
          </div>
        </div>
      </aside>

      {/*
        Reserves room at the end of the page so the fixed bar never covers the
        last content. `-mb-24` cancels the `pb-24` the profile containers
        already reserve for the mobile bottom bar.
      */}
      <div aria-hidden="true" className="h-[11rem] -mb-24 md:h-[7rem]" />
    </>
  );
}
