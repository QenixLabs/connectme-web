"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeCheck, Bell, BriefcaseBusiness, Check, ChevronRight, CircleAlert,
  CircleCheck, CircleDollarSign, ClipboardCheck, CreditCard, Inbox,
  Loader2, Megaphone, MessageCircle, MoreVertical, Search, ShieldAlert,
  Sparkles, Star, Trash2, X,
} from "lucide-react";
import { isToday, isYesterday } from "date-fns";
import { toast } from "sonner";

import { cn, relativeTime } from "@/lib/utils";
import {
  useNotificationsInfinite, useUnreadNotifications,
  useMarkAllNotificationsRead, useMarkNotificationRead,
  useMoveNotificationToHistory, useClearNotificationHistory,
  useRespondToNotification,
} from "@/hooks/use-notifications";
import { notificationTypeLabel, type Notification, type NotificationType } from "@/lib/api/notifications";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CommunicationNotificationDialog } from "@/components/content/communication-notification-dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Tab = "all" | "unread" | "history";
type NotificationVisual = { icon: typeof Bell; className: string };

const visuals: Partial<Record<NotificationType, NotificationVisual>> = {
  system: { icon: Megaphone, className: "bg-blue-50 text-blue-600" },
  verification_status: { icon: BadgeCheck, className: "bg-emerald-50 text-emerald-600" },
  campaign_invite: { icon: Megaphone, className: "bg-violet-50 text-violet-600" },
  campaign_recommendation: { icon: Sparkles, className: "bg-violet-50 text-violet-600" },
  application_received: { icon: BriefcaseBusiness, className: "bg-blue-50 text-blue-600" },
  application_status_changed: { icon: ClipboardCheck, className: "bg-emerald-50 text-emerald-600" },
  task_assigned: { icon: ClipboardCheck, className: "bg-blue-50 text-blue-600" },
  task_submitted: { icon: ClipboardCheck, className: "bg-blue-50 text-blue-600" },
  task_reviewed: { icon: Star, className: "bg-amber-50 text-amber-600" },
  subscription_status: { icon: CreditCard, className: "bg-blue-50 text-blue-600" },
  subscription_renewal_reminder: { icon: CircleDollarSign, className: "bg-amber-50 text-amber-600" },
  subscription_payment_failed: { icon: CircleAlert, className: "bg-red-50 text-red-600" },
  subscription_invoice_receipt: { icon: CreditCard, className: "bg-emerald-50 text-emerald-600" },
  subscription_expired: { icon: CircleAlert, className: "bg-red-50 text-red-600" },
  subscription_cancelled: { icon: CircleAlert, className: "bg-amber-50 text-amber-600" },
  subscription_activated: { icon: CircleCheck, className: "bg-emerald-50 text-emerald-600" },
  subscription_plan_offer: { icon: CreditCard, className: "bg-violet-50 text-violet-600" },
  marketplace_inquiry_received: { icon: MessageCircle, className: "bg-blue-50 text-blue-600" },
  marketplace_inquiry_responded: { icon: MessageCircle, className: "bg-blue-50 text-blue-600" },
  marketplace_inquiry_closed: { icon: CircleCheck, className: "bg-slate-100 text-slate-600" },
  marketplace_review_moderated: { icon: Star, className: "bg-amber-50 text-amber-600" },
  marketplace_review_reported: { icon: ShieldAlert, className: "bg-red-50 text-red-600" },
  moderation_violation: { icon: ShieldAlert, className: "bg-red-50 text-red-600" },
};

function actorName(n: Notification) {
  const actor = n.actor_id;
  return actor?.full_legal_name || actor?.company_name || actor?.email || "RootIn";
}

function visualFor(n: Notification): NotificationVisual {
  return visuals[n.type] ?? { icon: Bell, className: "bg-blue-50 text-blue-600" };
}

function hasDetail(n: Notification) {
  return (n.type === "system" && Boolean(n.data.communication_id)) ||
    (typeof n.data.href === "string" && n.data.href.startsWith("/"));
}

function sectionFor(n: Notification) {
  const date = new Date(n.created_at);
  if (Number.isNaN(date.getTime())) return "Earlier";
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return "Earlier";
}

function SkeletonRow() {
  return <div className="flex gap-3 border-b border-slate-100 px-1 py-4"><Skeleton className="size-10 rounded-xl" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-2/3 rounded" /><Skeleton className="h-3 w-full rounded" /><Skeleton className="h-3 w-1/3 rounded" /></div></div>;
}

function NotificationRow({ notification, onClick, onRespond, isResponding }: {
  notification: Notification;
  onClick: () => void;
  onRespond: (action: "accepted" | "declined") => void;
  isResponding: boolean;
}) {
  const unread = notification.status === "unread";
  const detail = hasDetail(notification);
  const visual = visualFor(notification);
  const Icon = visual.icon;
  const pendingOffer = notification.type === "subscription_plan_offer" && notification.action_status === "pending";
  const expiresAt = typeof notification.data.expires_at === "string" ? new Date(notification.data.expires_at) : null;
  const expired = notification.action_status === "expired";

  return <div className={cn("group flex min-h-[76px] items-start gap-3 border-b border-slate-100 px-1 py-3.5 last:border-b-0", unread && "bg-blue-50/35")}>
    <button type="button" onClick={onClick} aria-label={notification.title} className="flex min-w-0 flex-1 items-start gap-3 rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
      {notification.actor_id ? <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-sm font-semibold text-slate-600">{notification.title.charAt(0).toUpperCase()}</span> : <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", visual.className)}><Icon className="size-[18px]" aria-hidden="true" /></span>}
      <span className="min-w-0 flex-1">
        <span className="flex items-start gap-2"><span className="min-w-0 flex-1 text-[13px] font-semibold leading-5 text-slate-900">{notification.title}</span>{unread && <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-label="Unread" />}</span>
        <span className="mt-0.5 block line-clamp-2 text-[12px] leading-[18px] text-slate-500">{notification.body || actorName(notification)}</span>
        <span className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400"><span>{relativeTime(notification.created_at)}</span><span aria-hidden>·</span><span>{notificationTypeLabel(notification.type)}</span></span>
        {pendingOffer && <span className="mt-2 flex flex-wrap items-center gap-2" onClick={(event) => event.stopPropagation()}>{expired ? <Badge variant="outline" className="h-7 text-[11px]">Offer expired</Badge> : <><Button size="sm" className="h-8 px-3 text-xs" disabled={isResponding} onClick={() => onRespond("accepted")}>Accept</Button><Button size="sm" variant="outline" className="h-8 px-3 text-xs" disabled={isResponding} onClick={() => onRespond("declined")}>Decline</Button>{expiresAt && <span className="text-[11px] text-slate-400">Expires {expiresAt.toLocaleDateString()}</span>}</>}</span>}
      </span>
      {detail && <ChevronRight className="mt-3 size-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />}
    </button>
  </div>;
}

export function NotificationsPage({ audience = "talent" }: { audience?: "talent" | "provider" } = {}) {
  const router = useRouter();
  const isProvider = audience === "provider";
  const [communication, setCommunication] = useState<Notification | null>(null);
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const { data, isLoading, isError, isFetchingNextPage, hasNextPage, fetchNextPage } = useNotificationsInfinite(tab === "history", 20, tab === "unread");
  const { data: unreadData } = useUnreadNotifications();
  const markAll = useMarkAllNotificationsRead();
  const markRead = useMarkNotificationRead();
  const moveToHistory = useMoveNotificationToHistory();
  const clearHistory = useClearNotificationHistory();
  const respond = useRespondToNotification();
  const unreadCount = unreadData?.count ?? 0;
  const items = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? items.filter((n) => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q) || notificationTypeLabel(n.type).toLowerCase().includes(q)) : items;
  }, [items, query]);
  const grouped = useMemo(() => ["Today", "Yesterday", "Earlier"].map((label) => ({ label, items: filtered.filter((n) => sectionFor(n) === label) })).filter((section) => section.items.length), [filtered]);

  function markAllRead() {
    if (!unreadCount) return;
    markAll.mutate(undefined, { onSuccess: (result) => toast.success(result.modified ? result.modified + " notifications marked as read" : "Notifications marked as read"), onError: () => toast.error("Failed to mark notifications as read") });
  }

  function clearHistoryMutation() {
    clearHistory.mutate(undefined, { onSuccess: (result) => toast.success(result.modified ? result.modified + " history items cleared" : "History cleared"), onError: () => toast.error("Failed to clear history") });
  }

  function openNotification(n: Notification) {
    if (n.type === "system" && n.data.communication_id) {
      if (n.status === "unread") markRead.mutate(n._id);
      setCommunication(n);
      return;
    }
    const href = n.data.href;
    if (typeof href === "string" && href.startsWith("/")) {
      if (n.status === "unread") markRead.mutate(n._id);
      router.push(href);
      return;
    }
    if (tab !== "history" && n.status === "unread") markRead.mutate(n._id);
    else if (tab === "all" && n.status === "read") moveToHistory.mutate(n._id);
  }

  function respondToOffer(n: Notification, action: "accepted" | "declined") {
    respond.mutate({ id: n._id, action, type: n.type }, { onSuccess: () => toast.success(action === "accepted" ? "Plan offer accepted" : "Plan offer declined"), onError: () => toast.error("Could not respond to this plan offer. Refresh and try again.") });
  }

  return <main className="min-h-screen bg-[#f7f9fc] px-3 pb-[calc(5rem+env(safe-area-inset-bottom))] pt-3 text-slate-900 sm:px-5 lg:mx-auto lg:max-w-3xl lg:bg-transparent lg:px-6 lg:pt-6">
    <CommunicationNotificationDialog notification={communication} close={() => setCommunication(null)} />
    <header className="flex items-center justify-between gap-3 px-1 py-1">
      <div className="min-w-0"><div className="flex items-center gap-2"><h1 className="truncate text-xl font-bold tracking-tight">Notifications</h1>{unreadCount > 0 && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">{unreadCount} unread</span>}</div><p className="mt-0.5 text-xs text-slate-500">{isProvider ? "Updates from your services and inquiries" : "Your latest activity and updates"}</p></div>
      <div className="flex shrink-0 items-center gap-1">
        <Button type="button" variant="ghost" size="icon" className="size-11 rounded-full text-slate-500 hover:bg-white hover:text-primary" onClick={() => setSearchOpen((open) => !open)} aria-label={searchOpen ? "Close search" : "Search notifications"}>{searchOpen ? <X className="size-[18px]" /> : <Search className="size-[18px]" />}</Button>
        <DropdownMenu><DropdownMenuTrigger asChild><Button type="button" variant="ghost" size="icon" className="size-11 rounded-full text-slate-500 hover:bg-white hover:text-primary" aria-label="Notification actions"><MoreVertical className="size-[18px]" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-52"><DropdownMenuItem disabled={!unreadCount || markAll.isPending} onSelect={markAllRead}><Check className="size-4" /> Mark all as read</DropdownMenuItem><DropdownMenuSeparator /><AlertDialog><AlertDialogTrigger asChild><DropdownMenuItem variant="destructive" disabled={clearHistory.isPending || !items.length} onSelect={(event) => event.preventDefault()}><Trash2 className="size-4" /> Clear history</DropdownMenuItem></AlertDialogTrigger><AlertDialogContent size="sm"><AlertDialogHeader><AlertDialogTitle>Clear notification history?</AlertDialogTitle><AlertDialogDescription>This permanently removes your notification history. Active notifications are not affected.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={clearHistoryMutation}>Clear history</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></DropdownMenuContent></DropdownMenu>
      </div>
    </header>
    {searchOpen && <div className="mt-3 flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 shadow-sm"><Search className="size-4 shrink-0 text-slate-400" /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search notifications" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" aria-label="Search notifications" />{query && <button type="button" className="grid size-7 place-items-center rounded-full text-slate-400 hover:bg-slate-100" onClick={() => setQuery("")} aria-label="Clear search"><X className="size-4" /></button>}</div>}
    <div className="mt-4 border-b border-slate-200"><div className="grid grid-cols-3" role="tablist" aria-label="Notification views">{([["all", "All"], ["unread", "Unread"], ["history", "History"]] as const).map(([value, label]) => <button key={value} type="button" role="tab" aria-selected={tab === value} onClick={() => { setTab(value); setQuery(""); }} className={cn("relative min-h-11 px-2 text-sm font-semibold transition-colors", tab === value ? "text-primary" : "text-slate-500 hover:text-slate-800")}>{label}{value === "unread" && unreadCount > 0 && <span className="ml-1.5 text-[11px] text-primary">{unreadCount}</span>}{tab === value && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary" />}</button>)}</div></div>
    <section className="mt-2 overflow-hidden rounded-[14px] bg-white px-3 shadow-[0_2px_12px_rgba(30,64,120,0.04)]" aria-live="polite">
      {isLoading && Array.from({ length: 5 }).map((_, index) => <SkeletonRow key={index} />)}
      {!isLoading && isError && <div className="px-4 py-12 text-center"><CircleAlert className="mx-auto size-8 text-amber-500" /><p className="mt-3 text-sm font-medium">Couldn’t load notifications</p><p className="mt-1 text-xs text-slate-500">Please try again in a moment.</p></div>}
      {!isLoading && !isError && !grouped.length && <div className="px-4 py-14 text-center"><Inbox className="mx-auto size-8 text-slate-300" /><p className="mt-3 text-sm font-semibold">{query ? "No matching notifications" : tab === "history" ? "No notification history" : tab === "unread" ? "You’re all caught up" : "No notifications yet"}</p><p className="mt-1 text-xs text-slate-500">{query ? "Try a different search term." : "New updates will appear here."}</p></div>}
      {!isLoading && !isError && grouped.map((section) => <div key={section.label}><h2 className="px-1 pb-1 pt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">{section.label}</h2>{section.items.map((n) => <NotificationRow key={n._id} notification={n} onClick={() => openNotification(n)} onRespond={(action) => respondToOffer(n, action)} isResponding={respond.isPending} />)}</div>)}
    </section>
    {hasNextPage && <div className="flex justify-center py-5"><Button variant="outline" className="min-h-11 rounded-xl bg-white" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>{isFetchingNextPage ? <><Loader2 className="size-4 animate-spin" /> Loading...</> : "Load more"}</Button></div>}
  </main>;
}
