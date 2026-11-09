"use client";

import Link from "next/link";
import { ArrowLeft, Heart, Search } from "lucide-react";
import { RootInLogo } from "@/components/RootInLogo";
import { Button } from "@/components/ui/button";

export function ProviderProfileHeader() {
  return (
    <header className="sticky top-0 z-40 -mx-4 border-b border-provider-border bg-provider-surface/95 px-2 backdrop-blur-xl sm:mx-0 sm:rounded-t-provider-card sm:px-3">
      <nav
        aria-label="Provider profile"
        className="mx-auto flex h-14 max-w-6xl items-center gap-1"
      >
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="size-11 shrink-0 rounded-full"
        >
          <Link href="/providers" aria-label="Back to providers">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <Link
          href="/"
          className="min-w-0 flex-1"
          aria-label="RootIn home"
        >
          <RootInLogo className="w-[5.5rem]" />
        </Link>
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="size-11 shrink-0 rounded-full"
        >
          <Link href="/providers" aria-label="Search providers">
            <Search className="size-5" />
          </Link>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-11 shrink-0 rounded-full"
          aria-label="Save provider (favorites are not available yet)"
          title="Favorites are not available yet"
          disabled
        >
          <Heart className="size-5" />
        </Button>
      </nav>
    </header>
  );
}
