"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Bookmark,
  Briefcase,
  Calendar,
  ChevronRight,
  Clock,
  Clapperboard,
  Drama,
  Film,
  Loader2,
  MapPin,
  Megaphone,
  Music,
  PersonStanding,
  SlidersHorizontal,
  Star,
  Target,
  Video,
  X,
} from "lucide-react";
import { useMemo, useState, type ComponentType } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useMyApplications,
  useWithdrawApplication,
} from "@/hooks/use-campaigns";
import type { Campaign } from "@/lib/api/campaigns";

const roleIconMap: Record<string, ComponentType<{ className?: string }>> = {
  casting: Clapperboard,
  actor: Video,
  dancer: PersonStanding,
  influencer: Megaphone,
  model: Drama,
  musician: Music,
  singer: Star,
};

const DefaultIcon = Film;

function RoleIcon({ roleType, className }: { roleType?: string; className?: string }) {
  const Icon = roleIconMap[roleType?.toLowerCase() ?? ""] ?? DefaultIcon;
  return <Icon className={className} />;
}

const filters = ["All", "Pending", "Accepted", "Rejected", "Expired"] as const;
type Filter = (typeof filters)[number];

const sortOptions = [
  { label: "Recent", value: "newest" },
  { label: "Oldest", value: "oldest" },
] as const;

function formatDeadline(deadline?: string): string {
  if (!deadline) return "No deadline";
  const diffMs = new Date(deadline).getTime() - Date.now();
  if (diffMs < 0) return "Expired";
  const days = Math.ceil(diffMs / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "1d left";
  if (days < 7) return `${days}d left`;
  if (days < 30) return `${Math.floor(days / 7)}w left`;
  return `${Math.floor(days / 30)}mo left`;
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

type ApplicationCategory = "Pending" | "Accepted" | "Rejected" | "Expired";

function getApplicationCategory(campaign: Campaign): ApplicationCategory {
  const status = campaign.my_application?.status;
  const deadline = campaign.deadline ? new Date(campaign.deadline).getTime() : null;
  const isExpired = deadline ? deadline < Date.now() : false;

  if (status === "accepted") return "Accepted";
  if (status === "rejected") return "Rejected";
  if (isExpired) return "Expired";
  return "Pending";
}

function ApplicationCardSkeleton() {
  return (
    <Card className="overflow-hidden border-border bg-card">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <Skeleton className="h-14 w-14 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
        <Skeleton className="mt-5 h-6 w-3/4" />
        <Skeleton className="mt-2 h-4 w-1/2" />
        <Skeleton className="mt-4 h-4 w-2/3" />
        <Skeleton className="mt-2 h-4 w-1/2" />
        <Skeleton className="mt-5 h-4 w-1/3" />
        <Skeleton className="mt-5 h-10 w-full rounded-lg" />
      </CardContent>
    </Card>
  );
}

function ApplicationCard({
  campaign,
  category,
  onWithdraw,
  isWithdrawing,
}: {
  campaign: Campaign;
  category: ApplicationCategory;
  onWithdraw: (id: string) => void;
  isWithdrawing: boolean;
}) {
  const roleType = campaign.role_type || "Campaign";
  const accent =
    category === "Expired"
      ? "destructive"
      : category === "Accepted"
        ? "success"
        : category === "Rejected"
          ? "rose"
          : "warning";

  const accentClasses = {
    destructive: "border-l-destructive text-destructive bg-destructive/10",
    success: "border-l-success text-success bg-success/10",
    rose: "border-l-rose text-rose bg-rose/10",
    warning: "border-l-warning text-warning bg-warning/10",
  };

  const badgeVariants: Record<ApplicationCategory, string> = {
    Pending: "bg-warning/10 text-warning border-warning/50",
    Accepted: "bg-success/10 text-success border-success/50",
    Rejected: "bg-rose/10 text-rose border-rose/50",
    Expired: "bg-destructive/10 text-destructive border-destructive/50",
  };

  return (
    <Card
      className={cn(
        "overflow-hidden border border-border bg-card transition-colors hover:bg-accent/5",
        "border-l-4",
        accentClasses[accent],
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div
            className={cn(
              "flex size-14 items-center justify-center rounded-full",
              accentClasses[accent],
            )}
          >
            <RoleIcon roleType={roleType} className="size-6" />
          </div>
          <Badge
            variant="outline"
            className={cn("flex items-center gap-1.5 rounded-full", badgeVariants[category])}
          >
            <Clock className="size-3.5" />
            {category}
          </Badge>
        </div>

        <CardTitle className="mt-5 text-2xl font-bold tracking-tight">
          {campaign.name}
        </CardTitle>
        <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
          <span>{roleType}</span>
          <span className="text-muted-foreground/60">•</span>
          <span>{campaign.industry || "Creative"}</span>
        </p>

        <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">
          {campaign.description || "No description provided."}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <MapPin className="size-4" />
            {formatLocation(campaign.location)}
          </span>
          <span className="text-border">|</span>
          <span className="flex items-center gap-1.5">
            <Calendar className="size-4" />
            {formatDeadline(campaign.deadline)}
          </span>
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Briefcase className="size-4" />
          {campaign.visibility === "invite_only" ? "Invite Only" : "Open"}
        </div>

        <p className="mt-5 text-sm text-muted-foreground">
          {formatAppliedDate(campaign.my_application?.created_at)}
        </p>
      </CardContent>

      <CardFooter className="grid gap-3 border-t border-border bg-card px-6 py-4 md:grid-cols-2">
        <Button
          variant="outline"
          className="w-full rounded-lg border-border"
          asChild
        >
          <Link href={`/talent/opportunities/${campaign._id}`}>
            View Details
            <ChevronRight className="size-4" />
          </Link>
        </Button>
        {category === "Pending" && (
          <Button
            variant="outline"
            className="w-full rounded-lg border-border text-muted-foreground hover:text-destructive"
            onClick={() => onWithdraw(campaign._id)}
            disabled={isWithdrawing}
          >
            {isWithdrawing ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <X className="size-4" />
            )}
            Withdraw
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export function ApplicationsPage() {
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  const { data: applications, isLoading, isError } = useMyApplications();
  const withdrawMutation = useWithdrawApplication();

  const categorized = useMemo(() => {
    if (!applications) return [];
    return applications.map((campaign) => ({
      ...campaign,
      category: getApplicationCategory(campaign),
    }));
  }, [applications]);

  const counts = useMemo(() => {
    const map: Record<Filter, number> = {
      All: categorized.length,
      Pending: 0,
      Accepted: 0,
      Rejected: 0,
      Expired: 0,
    };
    for (const item of categorized) {
      map[item.category]++;
    }
    return map;
  }, [categorized]);

  const filtered = useMemo(() => {
    let data = categorized;
    if (activeFilter !== "All") {
      data = data.filter((item) => item.category === activeFilter);
    }
    return data.sort((a, b) => {
      const aDate = new Date(a.my_application?.created_at || a.created_at).getTime();
      const bDate = new Date(b.my_application?.created_at || b.created_at).getTime();
      return sort === "newest" ? bDate - aDate : aDate - bDate;
    });
  }, [categorized, activeFilter, sort]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-28 pt-5 lg:px-6">
      <Link
        href="/talent/dashboard"
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-primary transition-opacity hover:opacity-80"
      >
        <ArrowLeft className="size-4" />
        Back to Dashboard
      </Link>

      <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Track every opportunity you&apos;ve applied for.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {filters.map((filter) => {
          const active = activeFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "border-primary/60 bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {filter === "Pending" && <Clock className="size-4" />}
              {filter === "Accepted" && <Bookmark className="size-4" />}
              {filter === "Rejected" && <X className="size-4" />}
              {filter === "Expired" && <Calendar className="size-4" />}
              {filter === "All" && <SlidersHorizontal className="size-4" />}
              {filter} ({counts[filter]})
            </button>
          );
        })}

        <div className="ml-auto flex items-center gap-3">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm hover:bg-accent"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>
                Sort by: {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-7 grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <ApplicationCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <Card className="mt-7 border-border bg-card">
          <CardContent className="p-12 text-center">
            <p className="text-sm text-muted-foreground">
              Failed to load applications. Please try again later.
            </p>
          </CardContent>
        </Card>
      ) : filtered.length > 0 ? (
        <div className="mt-7 grid gap-6 md:grid-cols-2">
          {filtered.map((item) => (
            <ApplicationCard
              key={item._id}
              campaign={item}
              category={item.category}
              onWithdraw={(id) => withdrawMutation.mutate({ id })}
              isWithdrawing={withdrawMutation.isPending}
            />
          ))}
        </div>
      ) : (
        <Card className="mt-7 border-border bg-card">
          <CardContent className="flex flex-col items-center p-12 text-center">
            <Film className="mb-3 size-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              {activeFilter === "All"
                ? "No applications yet. Explore opportunities and start applying."
                : `No ${activeFilter.toLowerCase()} applications.`}
            </p>
            <Button className="mt-4 rounded-lg bg-gradient-teal font-semibold text-accent-foreground hover:brightness-110" asChild>
              <Link href="/talent/opportunities">
                Explore Opportunities
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && (
        <Card className="mt-8 border-border bg-card">
          <CardContent className="flex flex-wrap items-center gap-6 p-6">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Target className="size-7" />
            </div>
            <div className="min-w-[220px] flex-1">
              <p className="text-lg font-semibold">
                Keep applying and making your profile stronger.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                The right opportunity is just around the corner.
              </p>
            </div>
            <Button className="rounded-lg bg-gradient-teal font-semibold text-accent-foreground hover:brightness-110" asChild>
              <Link href="/talent/opportunities">
                Explore Opportunities
                <ChevronRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
