"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Bell, Check, CheckCheck } from "lucide-react";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotifications,
} from "@/hooks/use-notifications";
import { getApiErrorMessage } from "@/lib/api/client";
import type { Notification } from "@/lib/api/notifications";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";

function notificationHref(notification: Notification): string {
  if (
    notification.resource_type === "service_inquiry" &&
    /^[a-f\d]{24}$/i.test(notification.resource_id ?? "")
  ) {
    return `/inquiries/${notification.resource_id}`;
  }
  if (notification.type === "marketplace_review_reported") {
    return "/admin/reports";
  }
  const href = notification.data?.href;
  return typeof href === "string" && /^\/providers\/[a-z\d-]+#reviews$/.test(href)
    ? href
    : "/providers";
}

function readableTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Recently"
    : formatDistanceToNow(date, { addSuffix: true });
}

function newest(items: Notification[]) {
  return [...items].sort(
    (left, right) =>
      new Date(right.created_at).getTime() -
      new Date(left.created_at).getTime(),
  );
}

export function MarketplaceNotificationBell() {
  const unreadQuery = useUnreadNotifications();
  const unreadList = useNotifications(
    { history: false, page: 1, limit: 8, unreadOnly: true },
    60_000,
  );
  const readList = useNotifications(
    { history: true, page: 1, limit: 8 },
    60_000,
  );
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const unreadCount = unreadQuery.data?.count ?? 0;
  const items = newest([
    ...(unreadList.data?.data ?? []),
    ...(readList.data?.data ?? []),
  ]);
  const isLoading = unreadList.isLoading || readList.isLoading;
  const isError = unreadList.isError || readList.isError;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={
            unreadCount > 0
              ? `Notifications, ${unreadCount} unread`
              : "Notifications"
          }
        >
          <Bell className="size-5" aria-hidden="true" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[min(24rem,calc(100vw-2rem))] p-0"
      >
        <PopoverHeader className="flex-row items-center justify-between border-b p-4">
          <PopoverTitle>Notifications</PopoverTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={unreadCount === 0 || markAllRead.isPending}
            onClick={() => markAllRead.mutate()}
          >
            <CheckCheck className="size-4" />
            Mark all read
          </Button>
        </PopoverHeader>
        {markAllRead.isError && (
          <p role="alert" className="px-4 pt-3 text-sm text-destructive">
            {getApiErrorMessage(
              markAllRead.error,
              "Could not mark notifications as read.",
            )}
          </p>
        )}
        <div className="max-h-[min(70vh,28rem)] overflow-y-auto">
          {isLoading ? (
            <p role="status" className="p-6 text-center text-sm text-muted-foreground">
              Loading notifications…
            </p>
          ) : isError ? (
            <div className="space-y-3 p-5 text-center">
              <p role="alert" className="text-sm text-destructive">
                {getApiErrorMessage(
                  unreadList.error ?? readList.error,
                  "Could not load notifications.",
                )}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  void unreadList.refetch();
                  void readList.refetch();
                }}
              >
                Try again
              </Button>
            </div>
          ) : items.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">
              You’re all caught up. New inquiry and review updates will appear here.
            </p>
          ) : (
            <ul aria-label="Recent notifications">
              {items.map((notification) => {
                const unread = notification.status === "unread";
                return (
                  <li
                    key={notification._id}
                    className={`flex items-start gap-2 border-b p-3 last:border-b-0 ${
                      unread ? "bg-primary/5" : ""
                    }`}
                  >
                    <Link
                      href={notificationHref(notification)}
                      onClick={() => {
                        if (unread) markRead.mutate(notification._id);
                      }}
                      className="min-w-0 flex-1 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="block text-sm font-medium">
                        {notification.title}
                      </span>
                      <span className="mt-1 block text-sm text-muted-foreground">
                        {notification.body}
                      </span>
                      <time
                        className="mt-1 block text-xs text-muted-foreground"
                        dateTime={notification.created_at}
                      >
                        {readableTime(notification.created_at)}
                      </time>
                    </Link>
                    {unread ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Mark as read: ${notification.title}`}
                        disabled={markRead.isPending}
                        onClick={() => markRead.mutate(notification._id)}
                      >
                        <Check className="size-4" />
                      </Button>
                    ) : (
                      <span
                        className="mt-1 size-2 shrink-0 rounded-full bg-transparent"
                        aria-label="Read"
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
