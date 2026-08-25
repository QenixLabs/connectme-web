"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/providers/auth-store-provider";
import { useUnreadNotifications } from "@/hooks/use-unread-counts";
import logoImage from "@/assets/rootin-logo-orange.png";

export function ProfileHeader() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data: unreadData } = useUnreadNotifications(isAuthenticated);
  const unreadCount = unreadData?.count ?? 0;

  const role = user?.role;
  const notificationsHref = role ? `/${role}/notifications` : "/auth/login";
  const profileHref = role ? `/${role}/profile` : "/auth/login";

  const initials =
    user?.username?.slice(0, 2).toUpperCase() ||
    user?.email?.slice(0, 2).toUpperCase() ||
    "ME";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-bg-surface/95 backdrop-blur-xl">
      <div className="relative mx-auto flex h-14 max-w-5xl items-center justify-between px-3 sm:px-6">
        <button
          onClick={() => router.back()}
          className="grid size-10 shrink-0 place-items-center rounded-full text-foreground transition-colors hover:bg-bg-surface-inset active:bg-bg-surface-inset"
          aria-label="Go back"
        >
          <ArrowLeft className="size-5" />
        </button>

        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2"
          aria-label="RootIn home"
        >
          <Image
            src={logoImage}
            alt="RootIn"
            width={112}
            height={28}
            className="h-7 w-auto"
            priority
          />
        </Link>

        <div className="flex shrink-0 items-center gap-0.5">
          <Link
            href={notificationsHref}
            className="relative grid size-10 place-items-center rounded-full text-foreground transition-colors hover:bg-bg-surface-inset"
            aria-label="Notifications"
          >
            <Bell className="size-5" />
            {unreadCount > 0 && (
              <Badge className="pointer-events-none absolute right-1 top-1 flex size-4 min-w-4 items-center justify-center rounded-full bg-badge-red p-0 text-[10px] font-semibold leading-none text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </Link>
          <Link
            href={profileHref}
            className="grid size-10 place-items-center rounded-full transition-colors hover:bg-bg-surface-inset"
            aria-label="Your profile"
          >
            <Avatar className="size-8 border border-border">
              <AvatarFallback className="bg-bg-surface-inset text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </header>
  );
}
