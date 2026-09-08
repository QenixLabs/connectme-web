"use client";

import { useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  FileText,
  Loader2,
  MessageSquare,
  Megaphone,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  useClearNotificationHistory,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useMoveNotificationToHistory,
  useNotificationsInfinite,
  useUnreadNotifications,
} from "@/hooks/use-notifications";
import { cn, relativeTime } from "@/lib/utils";
import {
  notificationTypeLabel,
  type Notification,
} from "@/lib/api/notifications";

type Category = "All" | "Action Required" | "Applications" | "Messages";
type Tone = "alert" | "violet" | "mint" | "sky" | "amber" | "neutral";
type Tab = "active" | "history";

const filters: Category[] = ["All", "Action Required", "Applications", "Messages"];

const toneClass: Record<Tone, string> = {
  alert: "bg-destructive/10 text-destructive",
  violet: "bg-primary/10 text-primary",
  mint: "bg-success/10 text-success",
  sky: "bg-info/10 text-info",
  amber: "bg-warning/10 text-warning",
  neutral: "bg-muted text-muted-foreground",
};

function actorName(notification: Notification): string {
  const actor = notification.actor_id;
  if (!actor) return "ConnectMe";
  return actor.full_legal_name || actor.company_name || actor.email || "ConnectMe";
}

function getCategory(notification: Notification): Category {
  const text = `${notification.title} ${notification.body}`.toLowerCase();

  if (
    notification.action_status === "pending" ||
    text.includes("review") ||
    text.includes("request") ||
    text.includes("approve")
  ) {
    return "Action Required";
  }
  if (text.includes("message") || text.includes("replied") || text.includes("sent you")) {
    return "Messages";
  }
  if (notification.type.startsWith("application")) return "Applications";
  return "All";
}

function getTone(notification: Notification): Tone {
  const category = getCategory(notification);
  if (category === "Action Required") return "alert";
  if (category === "Applications") return "violet";
  if (category === "Messages") return "mint";
  if (notification.type === "campaign_invite" || notification.type === "campaign_recommendation") {
    return "sky";
  }
  if (notification.type.startsWith("subscription")) return "amber";
  return "neutral";
}

function getIcon(notification: Notification): LucideIcon {
  const category = getCategory(notification);
  if (category === "Messages") return MessageSquare;
  if (category === "Applications") return UserPlus;
  if (category === "Action Required") return CalendarDays;
  if (notification.type.startsWith("campaign")) return Megaphone;
  if (notification.type.startsWith("application")) return FileText;
  return Bell;
}

function getActionLabel(notification: Notification): string {
  const category = getCategory(notification);
  if (category === "Action Required") return "Review";
  if (category === "Applications") return "View Profile";
  if (category === "Messages") return "Reply";
  if (notification.type.startsWith("campaign")) return "View Campaign";
  return "View Details";
}

function getLabel(notification: Notification): string {
  const category = getCategory(notification);
  if (category !== "All") {
    if (category === "Applications") return "New Application";
    if (category === "Messages") return "Talent Message";
    return category;
  }
  return notificationTypeLabel(notification.type);
}

function getTimeLabel(createdAt: string): string {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return relativeTime(createdAt);
  if (isToday(date)) return format(date, "hh:mm a");
  if (isYesterday(date)) return "Yesterday";
  return format(date, "d MMM");
}

function NotificationSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
      <div className="size-12 shrink-0 animate-pulse rounded-xl bg-muted" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
      </div>
      <div className="hidden w-28 space-y-2 sm:block">
        <div className="ml-auto h-3 w-16 animate-pulse rounded bg-muted" />
        <div className="h-8 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

function NotificationRow({
  notification,
  onClick,
}: {
  notification: Notification;
  onClick: () => void;
}) {
  const category = getCategory(notification);
  const tone = getTone(notification);
  const Icon = getIcon(notification);
  const isUnread = notification.status === "unread";

  return (
    <article
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/40",
        tone === "alert" && "border-destructive/20 bg-destructive/5",
      )}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onClick();
      }}
      role="button"
      tabIndex={0}
    >
      <div className={cn("grid size-12 shrink-0 place-items-center rounded-xl", toneClass[tone])}>
        <Icon className="size-6" strokeWidth={2.25} />
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn("text-xs font-semibold", tone === "alert" ? "text-destructive" : toneClass[tone].split(" ")[1])}>
          {getLabel(notification)}
        </p>
        <h3 className="truncate text-sm font-bold text-foreground sm:text-base">
          {notification.title}
        </h3>
        <p className="truncate text-xs text-muted-foreground sm:text-sm">
          {notification.body || actorName(notification)}
        </p>
      </div>
      <div className="flex w-28 shrink-0 flex-col items-end gap-2 sm:w-36">
        <div className="flex items-center gap-2">
          <time className="text-xs font-medium text-muted-foreground" dateTime={notification.created_at}>
            {getTimeLabel(notification.created_at)}
          </time>
          {isUnread && (
            <span
              className={cn("size-2 rounded-full", tone === "alert" ? "bg-destructive" : "bg-primary")}
              aria-label="Unread"
            />
          )}
        </div>
        <Button
          variant={tone === "alert" ? "destructive" : "outline"}
          size="sm"
          className="w-full"
          onClick={(event) => {
            event.stopPropagation();
            onClick();
          }}
        >
          <span className="truncate">{getActionLabel(notification)}</span>
          <ChevronRight className="size-3.5 sm:hidden" />
        </Button>
      </div>
    </article>
  );
}

export function NotificationsPage() {
  const [filter, setFilter] = useState<Category>("All");
  const [tab, setTab] = useState<Tab>("active");
  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useNotificationsInfinite(tab === "history");
  const { data: unreadData } = useUnreadNotifications();
  const markAll = useMarkAllNotificationsRead();
  const markRead = useMarkNotificationRead();
  const moveToHistory = useMoveNotificationToHistory();
  const clearHistory = useClearNotificationHistory();

  const items = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
  );
  const visible = useMemo(
    () => items.filter((item) => filter === "All" || getCategory(item) === filter),
    [filter, items],
  );
  const counts = useMemo(
    () =>
      filters.reduce<Record<Category, number>>(
        (result, category) => {
          result[category] = category === "All" ? items.length : items.filter((item) => getCategory(item) === category).length;
          return result;
        },
        { All: 0, "Action Required": 0, Applications: 0, Messages: 0 },
      ),
    [items],
  );
  const unreadCount = unreadData?.count ?? 0;

  function handleItemClick(notification: Notification) {
    if (tab === "active" && notification.status === "unread") {
      markRead.mutate(notification._id);
    } else if (tab === "active") {
      moveToHistory.mutate(notification._id);
    }
  }

  function handleMarkAll() {
    if (unreadCount === 0) return;
    markAll.mutate(undefined, {
      onSuccess: (response) => toast.success(`${response.modified || unreadCount} notification${response.modified === 1 ? "" : "s"} marked as read`),
      onError: () => toast.error("Failed to mark notifications as read"),
    });
  }

  function handleClearHistory() {
    clearHistory.mutate(undefined, {
      onSuccess: () => toast.success("History cleared"),
      onError: () => toast.error("Failed to clear history"),
    });
  }

  return (
    <div className="relative isolate mx-auto min-h-[calc(100vh-4rem)] w-full max-w-5xl overflow-hidden px-4 pb-28 pt-6 sm:px-6 lg:px-8">
      <div className="ambient-glow right-[-8rem] top-[-5rem] size-72 bg-primary/30" />

      <header className="relative mb-7 overflow-hidden rounded-2xl bg-[url('/images/notifications-hero.png')] bg-cover bg-center bg-no-repeat">
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
        <div className="relative px-6 py-8">
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Notifications
          </h1>
          <p className="mt-1 text-base font-medium text-muted-foreground sm:text-lg">
            Stay updated on your talent pipeline.
          </p>
        </div>
      </header>

      <div className="relative mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Notification filters">
          {filters.map((category) => {
            const active = filter === category;
            return (
              <Button
                key={category}
                type="button"
                role="tab"
                aria-selected={active}
                variant={active ? "default" : "outline"}
                size="sm"
                className={cn("rounded-full px-3", active && "shadow-button")}
                onClick={() => setFilter(category)}
              >
                {category}
                <span className={cn("grid size-5 place-items-center rounded-full text-[10px]", active ? "bg-primary-foreground/20" : "bg-muted text-muted-foreground")}>
                  {counts[category]}
                </span>
              </Button>
            );
          })}
        </div>
        <div className="flex shrink-0 items-center gap-1 self-start rounded-lg border border-border bg-card p-1">
          {(["active", "history"] as const).map((value) => (
            <Button
              key={value}
              type="button"
              variant={tab === value ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-3 text-xs capitalize"
              onClick={() => {
                setTab(value);
                setFilter("All");
              }}
            >
              {value}
            </Button>
          ))}
        </div>
      </div>

      <div className="mb-4 flex min-h-8 items-center justify-between gap-3">
        <p className="text-xs font-medium text-muted-foreground">
          {tab === "active" && unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}` : `${visible.length} notification${visible.length === 1 ? "" : "s"}`}
        </p>
        {tab === "active" ? (
          <Button variant="ghost" size="sm" className="h-8 text-xs" disabled={markAll.isPending || unreadCount === 0} onClick={handleMarkAll}>
            Mark all as read
          </Button>
        ) : (
          <Button variant="ghost" size="sm" className="h-8 text-xs text-destructive hover:text-destructive" disabled={clearHistory.isPending || items.length === 0} onClick={handleClearHistory}>
            Clear history
          </Button>
        )}
      </div>

      <main className="relative">
        {isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => <NotificationSkeleton key={index} />)}
          </div>
        )}

        {!isLoading && isError && (
          <div className="rounded-xl border border-border bg-card px-5 py-12 text-center text-sm text-muted-foreground">
            Failed to load notifications. Please try again later.
          </div>
        )}

        {!isLoading && !isError && visible.length === 0 && (
          <div className="rounded-xl border border-border bg-card px-5 py-12 text-center text-sm text-muted-foreground">
            No {tab} notifications.
          </div>
        )}

        {!isLoading && !isError && (["Today", "Earlier"] as const).map((group) => {
          const grouped = visible.filter((notification) => {
            const date = new Date(notification.created_at);
            return group === "Today" && !Number.isNaN(date.getTime()) && isToday(date) || group === "Earlier" && (Number.isNaN(date.getTime()) || !isToday(date));
          });
          if (!grouped.length) return null;
          return (
            <section key={group} aria-labelledby={group.toLowerCase()} className="mb-6">
              <h2 id={group.toLowerCase()} className="px-2 py-2 font-display text-2xl font-bold">
                {group}
              </h2>
              <div className="space-y-2">
                {grouped.map((notification) => (
                  <NotificationRow
                    key={notification._id}
                    notification={notification}
                    onClick={() => handleItemClick(notification)}
                  />
                ))}
              </div>
            </section>
          );
        })}

        {isFetchingNextPage && <NotificationSkeleton />}
      </main>

      {hasNextPage && (
        <div className="relative mt-5 flex justify-center">
          <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? <><Loader2 className="size-4 animate-spin" /> Loading...</> : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}
