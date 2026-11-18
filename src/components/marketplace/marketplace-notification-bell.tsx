"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useUnreadNotifications } from "@/hooks/use-notifications";
import { Button } from "@/components/ui/button";

export function MarketplaceNotificationBell({
  role = "provider",
}: {
  role?: "talent" | "recruiter" | "provider" | "admin";
}) {
  const unreadQuery = useUnreadNotifications();
  const unreadCount = unreadQuery.data?.count ?? 0;
  const notificationsHref = `/${role}/notifications`;

  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      className="relative size-10 rounded-full text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
    >
      <Link
        href={notificationsHref}
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
      >
          <Bell className="size-5" aria-hidden="true" />
          {unreadCount > 0 && (
            <span className="absolute right-0 top-0 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground ring-2 ring-bg-surface">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
      </Link>
    </Button>
  );
}
