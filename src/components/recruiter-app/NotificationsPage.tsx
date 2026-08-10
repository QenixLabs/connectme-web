"use client";

import { useMemo, useState } from "react";
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock,
  Filter,
  Inbox,
  Loader2,
  Search,
  Trash2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { cn, relativeTime } from "@/lib/utils";
import {
  useNotificationsInfinite,
  useUnreadNotifications,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useMoveNotificationToHistory,
  useClearNotificationHistory,
} from "@/hooks/use-notifications";
import { notificationTypeLabel, type Notification } from "@/lib/api/notifications";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

type Tab = "active" | "history";

function actorName(notification: Notification): string {
  const actor = notification.actor_id;
  if (!actor) return "ConnectMe";
  return actor.full_legal_name || actor.company_name || actor.email || "ConnectMe";
}

function actorInitial(notification: Notification): string {
  const source = notification.title || actorName(notification);
  return source.charAt(0).toUpperCase();
}

function NotificationSkeleton() {
  return (
    <Card>
      <CardContent className="py-5">
        <div className="flex items-start gap-4">
          <Skeleton className="size-14 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-4 w-20 rounded" />
            </div>
            <Skeleton className="h-3 w-full rounded" />
            <Skeleton className="h-3 w-3/4 rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function NotificationItem({
  notification,
  onClick,
}: {
  notification: Notification;
  onClick: () => void;
}) {
  const isUnread = notification.status === "unread";

  return (
    <Card
      onClick={onClick}
      className={cn(
        "relative cursor-pointer transition-colors hover:border-primary/40",
        isUnread && "border-l-4 border-l-primary",
      )}
    >
      <CardContent className="py-5">
        <div className="flex items-start gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-medium text-muted-foreground">
            {actorInitial(notification)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-foreground">
                {notification.title}
              </h2>
              <Badge variant="secondary" className="text-xs font-medium">
                {notificationTypeLabel(notification.type)}
              </Badge>
              {isUnread && (
                <span className="size-2 rounded-full bg-primary" aria-hidden />
              )}
              <span className="ml-auto hidden items-center gap-1.5 text-xs text-muted-foreground lg:flex">
                <Clock className="size-3.5" />
                {relativeTime(notification.created_at)}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {actorName(notification)}
            </p>
            {notification.body && (
              <p className="mt-1.5 text-sm text-foreground/80 line-clamp-2">
                {notification.body}
              </p>
            )}
            <span className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground lg:hidden">
              <Clock className="size-3.5" />
              {relativeTime(notification.created_at)}
            </span>
          </div>
          <ChevronRight className="mt-6 size-5 shrink-0 self-center text-muted-foreground lg:hidden" />
        </div>
      </CardContent>
    </Card>
  );
}

export function NotificationsPage() {
  const [tab, setTab] = useState<Tab>("active");
  const [query, setQuery] = useState("");

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

  const unreadCount = unreadData?.count ?? 0;

  const items = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.body.toLowerCase().includes(q) ||
        notificationTypeLabel(n.type).toLowerCase().includes(q),
    );
  }, [items, query]);

  function handleTabChange(value: string) {
    setTab(value as Tab);
    setQuery("");
  }

  function handleMarkAll() {
    if (unreadCount === 0) return;
    markAll.mutate(undefined, {
      onSuccess: (res) => {
        toast.success(
          res.modified > 0
            ? `${res.modified} notification${res.modified === 1 ? "" : "s"} marked as read`
            : "Notifications marked as read",
        );
      },
      onError: () => toast.error("Failed to mark notifications as read"),
    });
  }

  function handleClearHistory() {
    clearHistory.mutate(undefined, {
      onSuccess: (res) => {
        toast.success(
          res.modified > 0
            ? `${res.modified} history item${res.modified === 1 ? "" : "s"} cleared`
            : "History cleared",
        );
      },
      onError: () => toast.error("Failed to clear history"),
    });
  }

  function handleItemClick(notification: Notification) {
    if (tab === "active" && notification.status === "unread") {
      markRead.mutate(notification._id);
      return;
    }
    if (tab === "active" && notification.status === "read") {
      moveToHistory.mutate(notification._id);
    }
  }

  function handleEnablePush() {
    toast.info("Push notification subscription is not available yet.");
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5 px-4 pb-28 pt-5 lg:px-6">
      {/* Hero */}
      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex items-start justify-between gap-6">
            <div>
              <CardTitle className="text-3xl font-bold tracking-tight lg:text-4xl">
                Notifications
              </CardTitle>
              <CardDescription className="mt-2 text-base">
                Stay updated with your latest recruiting activity — applications, messages, and campaign updates in one feed.
              </CardDescription>
            </div>
            <div className="flex size-24 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-primary lg:size-32">
              <Bell className="size-10 lg:size-12" strokeWidth={1.5} />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-2 sm:w-fit">
          <TabsTrigger value="active" className="gap-2">
            Active
            {unreadCount > 0 && (
              <Badge
                variant="default"
                className="grid size-5 place-items-center rounded-full p-0 text-[10px]"
              >
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Action bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {tab === "active" ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAll}
            disabled={markAll.isPending || unreadCount === 0}
            className="w-fit"
          >
            <CheckCircle2 className="size-4 text-primary" />
            Mark all as read
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearHistory}
            disabled={clearHistory.isPending || filtered.length === 0}
            className="w-fit text-destructive hover:text-destructive"
          >
            <Trash2 className="size-4" />
            Clear history
          </Button>
        )}

        <div className="flex items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 sm:min-w-[240px]">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search notifications..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <Button variant="outline" size="sm" disabled>
            <Filter className="size-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {isLoading &&
          Array.from({ length: 5 }).map((_, i) => <NotificationSkeleton key={i} />)}

        {!isLoading && isError && (
          <Card className="py-12 text-center">
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Failed to load notifications. Please try again later.
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <Card className="py-12 text-center">
            <CardContent>
              <Inbox className="mx-auto size-10 text-muted-foreground/50" />
              <p className="mt-4 text-sm text-muted-foreground">
                No {tab} notifications.
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading &&
          !isError &&
          filtered.map((n) => (
            <NotificationItem
              key={n._id}
              notification={n}
              onClick={() => handleItemClick(n)}
            />
          ))}

        {isFetchingNextPage && <NotificationSkeleton />}
      </div>

      {hasNextPage && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load more"
            )}
          </Button>
        </div>
      )}

      {/* Push promo (mobile) */}
      <Card className="lg:hidden">
        <CardContent className="flex flex-wrap items-center gap-4 py-5">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Zap className="size-6" />
          </div>
          <div className="min-w-[180px] flex-1">
            <p className="font-bold">Never miss important updates</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Enable push notifications and stay updated in real-time.
            </p>
          </div>
          <Button onClick={handleEnablePush} className="shrink-0">
            Enable Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
