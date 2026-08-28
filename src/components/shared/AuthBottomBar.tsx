"use client";

import Link from "next/link";
import { LogIn } from "lucide-react";

export function AuthBottomBar() {
  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-border bg-bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
      <div className="flex h-16 items-center justify-center px-4">
        <Link
          href="/auth/login"
          className="flex items-center gap-2 rounded-full bg-rootin px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rootin/90"
        >
          <LogIn className="size-4" />
          Sign in to connect
        </Link>
      </div>
    </nav>
  );
}
