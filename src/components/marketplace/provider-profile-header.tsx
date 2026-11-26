"use client";

import Link from "next/link";
import { MorporfiilLogo } from "@/components/MorporfiilLogo";

export function ProviderProfileHeader() {
  return (
    <header className="sticky top-0 z-40 -mx-4 border-b border-provider-border bg-provider-surface/95 px-2 backdrop-blur-xl sm:mx-0 sm:rounded-t-provider-card sm:px-3">
      <nav
        aria-label="Provider profile"
        className="mx-auto flex h-14 max-w-6xl items-center gap-1"
      >
        <Link
          href="/"
          className="min-w-0 flex-1 pl-4"
          aria-label="Morporfiil home"
        >
          <MorporfiilLogo className="w-[5.5rem]" />
        </Link>
      </nav>
    </header>
  );
}
