"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Bell,
  Bookmark,
  Briefcase,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Loader2,
  MapPin,
  Megaphone,
  MessageCircle,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useMyApplications,
  useWithdrawApplication,
} from "@/hooks/use-campaigns";
import { useTalentProfile } from "@/hooks/use-talent-dashboard";
import {
  useUnreadMessages,
  useUnreadNotifications,
} from "@/hooks/use-unread-counts";
import { useAuthStore } from "@/providers/auth-store-provider";
import type { Campaign } from "@/lib/api/campaigns";

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

type AppStatus =
  | "under_review"
  | "shortlisted"
  | "audition_scheduled"
  | "selected"
  | "not_selected";

type FilterKey = "all" | "active" | "shortlisted" | "offers" | "not_selected";

/* -------------------------------------------------------------------------- */
/*                                   CONFIG                                   */
/* -------------------------------------------------------------------------- */

const STATUS_META: Record<
  AppStatus,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    tone: string;
  }
> = {
  under_review: {
    label: "Under Review",
    icon: Clock,
    tone: "text-success bg-success/10 border-success/20",
  },
  shortlisted: {
    label: "Shortlisted",
    icon: Star,
    tone: "text-primary bg-primary/10 border-primary/20",
  },
  audition_scheduled: {
    label: "Audition Scheduled",
    icon: CalendarDays,
    tone: "text-violet bg-violet/10 border-violet/20",
  },
  selected: {
    label: "Selected",
    icon: CheckCircle2,
    tone: "text-success bg-success/10 border-success/20",
  },
  not_selected: {
    label: "Not Selected",
    icon: XCircle,
    tone: "text-destructive bg-destructive/10 border-destructive/20",
  },
};

const OVERVIEW_ITEMS: {
  key: AppStatus | "all";
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
}[] = [
  { key: "all", label: "All", icon: FileText, tone: "text-primary bg-primary/10" },
  { key: "under_review", label: "Under Review", icon: Clock, tone: "text-success bg-success/10" },
  { key: "shortlisted", label: "Shortlisted", icon: Star, tone: "text-warning bg-warning/10" },
  { key: "audition_scheduled", label: "Auditions", icon: CalendarDays, tone: "text-violet bg-violet/10" },
  { key: "selected", label: "Offers", icon: CheckCircle2, tone: "text-success bg-success/10" },
  { key: "not_selected", label: "Not Selected", icon: XCircle, tone: "text-destructive bg-destructive/10" },
];

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All Applications" },
  { key: "active", label: "Active" },
  { key: "shortlisted", label: "Shortlisted" },
  { key: "offers", label: "Offers" },
  { key: "not_selected", label: "Not Selected" },
];

const ROLE_BADGES: Record<string, { label: string; className: string }> = {
  casting: { label: "Casting Call", className: "bg-violet-600" },
  actor: { label: "Audition", className: "bg-blue-600" },
  dancer: { label: "Audition", className: "bg-blue-600" },
  model: { label: "Brand Shoot", className: "bg-orange-500" },
  influencer: { label: "Brand Deal", className: "bg-pink-500" },
  musician: { label: "Music", className: "bg-purple-600" },
  singer: { label: "Music", className: "bg-purple-600" },
};

/* -------------------------------------------------------------------------- */
/*                                   HELPERS                                  */
/* -------------------------------------------------------------------------- */

function getInitials(name?: string | null): string {
  if (!name) return "ME";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatLocation(location?: { city?: string; state?: string }): string {
  if (!location) return "Remote";
  return [location.city, location.state].filter(Boolean).join(", ") || "Remote";
}

function formatAppliedDate(createdAt?: string): string {
  if (!createdAt) return "";
  return `Applied on ${new Date(createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
}

function getStatus(campaign: Campaign): AppStatus {
  const status = (campaign.my_application?.status ?? "pending") as string;
  switch (status) {
    case "pending":
      return "under_review";
    case "accepted":
      return "selected";
    case "rejected":
      return "not_selected";
    case "shortlisted":
      return "shortlisted";
    case "audition_scheduled":
      return "audition_scheduled";
    default:
      return "under_review";
  }
}

function getRoleBadge(roleType?: string) {
  return ROLE_BADGES[roleType?.toLowerCase() ?? ""] ?? { label: "Project", className: "bg-slate-500" };
}

function getCompanyName(campaign: Campaign): string {
  return (
    campaign.recruiter?.company_name ||
    campaign.recruiter?.headline ||
    "Production"
  );
}

/* -------------------------------------------------------------------------- */
/*                                 COMPONENTS                                 */
/* -------------------------------------------------------------------------- */

function Header({
  profilePhoto,
  name,
}: {
  profilePhoto?: string | null;
  name: string;
}) {
  const initials = getInitials(name);
  const { data: notifications } = useUnreadNotifications();
  const { data: messages } = useUnreadMessages();
  const notificationCount = notifications?.count ?? 0;
  const messageCount = messages?.count ?? 0;

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-gradient-to-br from-fuchsia-500 via-primary to-indigo-500 p-[2px]">
          {profilePhoto ? (
            <div className="relative size-12 overflow-hidden rounded-full border-2 border-card">
              <Image
                src={profilePhoto}
                alt={name}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex size-12 items-center justify-center rounded-full bg-muted text-sm font-bold text-foreground">
              {initials}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-foreground">
            My Applications
          </h1>
          <p className="text-xs text-muted-foreground">
            Track all the opportunities you&apos;ve applied for
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Link
          href="/talent/notifications"
          className="relative grid size-10 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted"
          aria-label="Notifications"
        >
          <Bell className="size-5" />
          {notificationCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-badge-red px-1 text-[10px] font-bold text-white">
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          )}
        </Link>
        <Link
          href="/talent/messages"
          className="relative grid size-10 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted"
          aria-label="Messages"
        >
          <MessageCircle className="size-5" />
          {messageCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-badge-red px-1 text-[10px] font-bold text-white">
              {messageCount > 9 ? "9+" : messageCount}
            </span>
          )}
        </Link>
      </div>
    </div>
  );
}

function HeaderSkeleton() {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Skeleton className="size-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="size-10 rounded-full" />
        <Skeleton className="size-10 rounded-full" />
      </div>
    </div>
  );
}

function OverviewStats({
  counts,
  active,
  onSelect,
}: {
  counts: Record<AppStatus | "all", number>;
  active: AppStatus | "all";
  onSelect: (key: AppStatus | "all") => void;
}) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
      {OVERVIEW_ITEMS.map((item) => {
        const selected = active === item.key;
        const Icon = item.icon;
        return (
          <button
            key={item.key}
            onClick={() => onSelect(item.key)}
            className={cn(
              "flex shrink-0 flex-col items-center gap-2 rounded-2xl border px-4 py-3 transition-all active:scale-95",
              selected
                ? "border-transparent bg-gradient-to-br from-primary to-indigo-600 text-white shadow-md"
                : "border-border bg-card text-foreground hover:bg-muted"
            )}
          >
            <span
              className={cn(
                "grid size-9 place-items-center rounded-xl",
                selected ? "bg-white/20 text-white" : item.tone
              )}
            >
              <Icon className="size-4" />
            </span>
            <span className="text-lg font-extrabold leading-none">
              {counts[item.key] ?? 0}
            </span>
            <span
              className={cn(
                "whitespace-nowrap text-[10px] font-medium leading-none",
                selected ? "text-white/90" : "text-muted-foreground"
              )}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function OverviewStatsSkeleton() {
  return (
    <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-[92px] w-[76px] shrink-0 rounded-2xl"
        />
      ))}
    </div>
  );
}

function FilterChips({
  counts,
  active,
  onSelect,
}: {
  counts: Record<FilterKey, number>;
  active: FilterKey;
  onSelect: (key: FilterKey) => void;
}) {
  return (
    <div className=" hidden no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      {FILTERS.map((filter) => {
        const selected = active === filter.key;
        return (
          <button
            key={filter.key}
            onClick={() => onSelect(filter.key)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all active:scale-95",
              selected
                ? "gradient-brand text-brand-foreground shadow-sm"
                : "border border-border bg-card text-foreground hover:bg-muted"
            )}
          >
            {filter.label} ({counts[filter.key] ?? 0})
          </button>
        );
      })}
    </div>
  );
}

function ApplicationCard({
  campaign,
  status,
  onWithdraw,
  isWithdrawing,
}: {
  campaign: Campaign;
  status: AppStatus;
  onWithdraw: (id: string) => void;
  isWithdrawing: boolean;
}) {
  const meta = STATUS_META[status];
  const StatusIcon = meta.icon;
  const badge = getRoleBadge(campaign.role_type);
  const company = getCompanyName(campaign);
  const location = formatLocation(campaign.location);
  const appliedDate = formatAppliedDate(campaign.my_application?.created_at);

  return (
    <Card className="overflow-hidden rounded-2xl border-border bg-card p-0 shadow-sm transition-all hover:shadow-card">
      <CardContent className="p-3">
        <div className="flex gap-3">
          {/* Thumbnail */}
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
            {campaign.cover_image_url ? (
              <Image
                src={campaign.cover_image_url}
                alt={campaign.name}
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                <Briefcase className="size-6 text-muted-foreground/40" />
              </div>
            )}
            <span
              className={cn(
                "absolute left-2 top-2 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow",
                badge.className
              )}
            >
              {badge.label}
            </span>
          </div>

          {/* Content */}
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-start justify-between gap-2">
              <h3 className="line-clamp-1 text-sm font-bold text-foreground">
                {campaign.name}
              </h3>
              <div className="flex shrink-0 items-center gap-0.5">
                <span
                  className={cn(
                    "flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                    meta.tone
                  )}
                >
                  <StatusIcon className="size-3" />
                  {meta.label}
                </span>
                <ChevronRight className="size-4 text-muted-foreground" />
              </div>
            </div>

            <p className="mt-0.5 text-xs text-muted-foreground">
              {campaign.role_type || "Role"}
            </p>

            <div className="mt-2 space-y-1">
              <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="grid size-4 place-items-center rounded bg-muted">
                  <Briefcase className="size-2.5" />
                </span>
                {company}
              </p>
              <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="grid size-4 place-items-center rounded bg-muted">
                  <MapPin className="size-2.5" />
                </span>
                {location}
              </p>
              <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="grid size-4 place-items-center rounded bg-muted">
                  <Calendar className="size-2.5" />
                </span>
                {appliedDate}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-3 grid grid-cols-1 gap-2">
          <Button
            variant="outline"
            className="w-full rounded-full border-border bg-background text-sm font-semibold text-brand hover:bg-brand/5"
            asChild
          >
            <Link href={`/talent/opportunities/${campaign._id}`}>
              View Details
              <ChevronRight className="ml-1 size-4" />
            </Link>
          </Button>
          {status === "under_review" && (
            <Button
              variant="outline"
              className="w-full rounded-full border-border text-sm font-semibold text-muted-foreground hover:text-destructive"
              onClick={() => onWithdraw(campaign._id)}
              disabled={isWithdrawing}
            >
              {isWithdrawing ? (
                <Loader2 className="mr-1 size-4 animate-spin" />
              ) : (
                <X className="mr-1 size-4" />
              )}
              Withdraw
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ApplicationCardSkeleton() {
  return (
    <Card className="overflow-hidden rounded-2xl border-border bg-card p-0">
      <CardContent className="p-3">
        <div className="flex gap-3">
          <Skeleton className="h-20 w-20 shrink-0 rounded-xl" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
        <Skeleton className="mt-3 h-9 w-full rounded-full" />
      </CardContent>
    </Card>
  );
}

function PremiumBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-indigo-600 p-4 text-white shadow-md">
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-2 top-2 grid size-7 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/10"
        aria-label="Dismiss"
      >
        <X className="size-4" />
      </button>

      <div className="relative z-10 flex items-center gap-4">
        <div className="flex-1">
          <p className="text-base font-extrabold">Get More Opportunities</p>
          <p className="mt-1 text-xs leading-snug text-white/85">
            Upgrade to Premium and get priority access to new opportunities.
          </p>
          <Button
            className="mt-3 h-9 rounded-full bg-white px-4 text-sm font-bold text-primary hover:bg-white/90"
            asChild
          >
            <Link href="/talent/billing">
              Upgrade Now
              <ChevronRight className="ml-1 size-4" />
            </Link>
          </Button>
        </div>
        <div className="relative hidden shrink-0 flex-col items-center gap-2 sm:flex">
          <div className="grid size-14 place-items-center rounded-full bg-white/15">
            <Megaphone className="size-7 text-white" />
          </div>
          <div className="grid size-12 place-items-center rounded-full bg-white/15">
            <Sparkles className="size-6 text-yellow-300" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    PAGE                                    */
/* -------------------------------------------------------------------------- */

export function ApplicationsPage() {
  const [activeOverview, setActiveOverview] = useState<AppStatus | "all">("all");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const user = useAuthStore((s) => s.user);
  const { data: profile } = useTalentProfile();
  const { data: applications, isLoading, isError } = useMyApplications();
  const withdrawMutation = useWithdrawApplication();

  const displayName = profile?.full_legal_name || user?.username || "Talent";
  const profilePhoto = profile?.profile_photo;

  const enriched = useMemo(() => {
    if (!applications) return [];
    return applications.map((campaign) => ({
      campaign,
      status: getStatus(campaign),
    }));
  }, [applications]);

  const counts = useMemo(() => {
    const all = enriched.length;
    const underReview = enriched.filter((c) => c.status === "under_review").length;
    const shortlisted = enriched.filter((c) => c.status === "shortlisted").length;
    const audition = enriched.filter((c) => c.status === "audition_scheduled").length;
    const selected = enriched.filter((c) => c.status === "selected").length;
    const notSelected = enriched.filter((c) => c.status === "not_selected").length;

    return {
      all,
      active: all - notSelected,
      under_review: underReview,
      shortlisted,
      audition_scheduled: audition,
      selected,
      offers: selected,
      not_selected: notSelected,
    };
  }, [enriched]);

  const overviewCounts: Record<AppStatus | "all", number> = useMemo(
    () => ({
      all: counts.all,
      under_review: counts.under_review,
      shortlisted: counts.shortlisted,
      audition_scheduled: counts.audition_scheduled,
      selected: counts.selected,
      not_selected: counts.not_selected,
    }),
    [counts]
  );

  const filterCounts: Record<FilterKey, number> = useMemo(
    () => ({
      all: counts.all,
      active: counts.active,
      shortlisted: counts.shortlisted,
      offers: counts.offers,
      not_selected: counts.not_selected,
    }),
    [counts]
  );

  const filtered = useMemo(() => {
    let data = [...enriched];

    // Apply overview selection
    if (activeOverview !== "all") {
      data = data.filter((c) => c.status === activeOverview);
    }

    // Apply chip filter
    if (activeFilter !== "all") {
      if (activeFilter === "active") {
        data = data.filter((c) => c.status !== "not_selected");
      } else if (activeFilter === "offers") {
        data = data.filter((c) => c.status === "selected");
      } else {
        data = data.filter((c) => c.status === activeFilter);
      }
    }

    // Search
    const q = search.trim().toLowerCase();
    if (q) {
      data = data.filter((c) => {
        const text = [
          c.campaign.name,
          c.campaign.role_type,
          c.campaign.recruiter?.company_name,
          c.campaign.recruiter?.headline,
          c.campaign.location?.city,
          c.campaign.location?.state,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return text.includes(q);
      });
    }

    // Sort by applied date, newest first
    return data.sort(
      (a, b) =>
        new Date(b.campaign.my_application?.created_at || b.campaign.created_at).getTime() -
        new Date(a.campaign.my_application?.created_at || a.campaign.created_at).getTime()
    );
  }, [enriched, activeOverview, activeFilter, search]);

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-background pb-10 pt-5">
      <div className="px-4">
        {isLoading ? (
          <HeaderSkeleton />
        ) : (
          <Header profilePhoto={profilePhoto} name={displayName} />
        )}
      </div>

      <div className="mt-5 px-4">
        {isLoading ? (
          <OverviewStatsSkeleton />
        ) : (
          <OverviewStats
            counts={overviewCounts}
            active={activeOverview}
            onSelect={(key) => {
              setActiveOverview(key);
              setActiveFilter("all");
            }}
          />
        )}
      </div>

      {/* Search + filters */}
      <div className="mt-5 px-4">
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by job title, company or location..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters((s) => !s)}
            aria-label="Toggle filters"
            className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-card text-foreground transition-colors hover:bg-muted"
          >
            <SlidersHorizontal className="size-5" />
          </button>
        </div>
      </div>

      {/* Filter chips */}
      {!isLoading && (
        <div className="mt-3">
          <FilterChips
            counts={filterCounts}
            active={activeFilter}
            onSelect={(key) => {
              setActiveFilter(key);
              setActiveOverview("all");
            }}
          />
        </div>
      )}

      {/* Results */}
      <div className="mt-5 space-y-4 px-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <ApplicationCardSkeleton key={i} />
          ))
        ) : isError ? (
          <Card className="rounded-2xl border-border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Failed to load applications. Please try again later.
            </p>
          </Card>
        ) : filtered.length > 0 ? (
          filtered.map((item) => (
            <ApplicationCard
              key={item.campaign._id}
              campaign={item.campaign}
              status={item.status}
              onWithdraw={(id) => withdrawMutation.mutate({ id })}
              isWithdrawing={withdrawMutation.isPending}
            />
          ))
        ) : (
          <Card className="rounded-2xl border-border bg-card p-8 text-center">
            <div className="mx-auto mb-3 grid size-14 place-items-center rounded-full bg-muted">
              <Bookmark className="size-7 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              {search || activeFilter !== "all" || activeOverview !== "all"
                ? "No matching applications"
                : "No applications yet"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {search || activeFilter !== "all" || activeOverview !== "all"
                ? "Try adjusting your search or filters."
                : "Explore opportunities and start applying."}
            </p>
            <Button
              className="mt-4 h-9 rounded-full bg-gradient-teal px-4 text-sm font-semibold text-accent-foreground hover:brightness-110"
              asChild
            >
              <Link href="/talent/opportunities">Explore Opportunities</Link>
            </Button>
          </Card>
        )}
      </div>

      {/* Premium banner */}
      {!isLoading && !isError && (
        <div className="mt-6 px-4">
          <PremiumBanner />
        </div>
      )}
    </div>
  );
}
