"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function GuestTopBar() {
  const pathname = usePathname();

  if (pathname?.match(/^\/talent\/[^/]+\/portfolio(\/|$)/)) return null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="font-semibold text-foreground">
          RootIn
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="text-sm text-muted-foreground hover:text-primary"
          >
            Log in
          </Link>
          <Link
            href="/auth/talent/signup"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
}
