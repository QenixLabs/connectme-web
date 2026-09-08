"use client";

import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Check,
  CircleDashed,
  Clock3,
  ExternalLink,
  Filter,
  FolderKanban,
  Loader2,
  MapPin,
  MoreVertical,
  Plus,
  Search,
  SlidersHorizontal,
  Star,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCampaignApplications, useCampaignCount, useRecruiterCampaigns } from "@/hooks/use-campaigns";
import type { Campaign } from "@/lib/api/campaigns";
import { cn, relativeTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type CampaignTab = "active" | "draft" | "closed";
type DisplayStatus = "Active" | "Draft" | "Closed";

const tabs: { value: CampaignTab; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "draft", label: "Drafts" },
  { value: "closed", label: "Closed" },
];

const statusMeta: Record<DisplayStatus, { label: string; className: string; iconClassName: string }> = {
  Active: {
    label: "Active",
    className: "bg-success/10 text-success",
    iconClassName: "bg-success",
  },
  Draft: {
    label: "Draft",
    className: "bg-muted text-muted-foreground",
    iconClassName: "bg-muted-foreground",
  },
  Closed: {
    label: "Closed",
    className: "bg-blue-500/10 text-blue-400",
    iconClassName: "bg-blue-400",
  },
};

function displayStatus(status: Campaign["status"]): DisplayStatus {
  return status === "active" ? "Active" : status === "draft" ? "Draft" : "Closed";
}

function formatDate(value?: string, options: Intl.DateTimeFormatOptions = {}) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  });
}

function formatBudget(campaign: Campaign) {
  const budget = campaign.budget_range;
  if (!budget?.min && !budget?.max) return "Not specified";

  const currency = budget.currency || "INR";
  const format = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);

  if (budget.min && budget.max) return `${currency} ${format(budget.min)} - ${format(budget.max)}`;
  return `${currency} ${format(budget.min || budget.max || 0)}`;
}

function campaignRoles(campaign: Campaign) {
  const roles = campaign.specialties?.length
    ? campaign.specialties
    : campaign.requirements?.skills;
  return roles?.length ? roles.join("  |  ") : campaign.description || "No role details added";
}

function Stat({ icon: Icon, value, label }: { icon: LucideIcon; value: string | number; label: string }) {
  return (
    <div className="flex h-12 min-w-0 items-center gap-2 rounded-lg bg-muted px-2.5 py-1.5 sm:gap-2.5 sm:px-3">
      <Icon className="size-4 shrink-0 text-primary sm:size-[17px]" />
      <div className="min-w-0">
        <strong className="block truncate text-xs font-semibold text-foreground sm:text-sm">{value}</strong>
        <span className="block truncate text-[9px] text-muted-foreground sm:text-[10px]">{label}</span>
      </div>
    </div>
  );
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const status = displayStatus(campaign.status);
  const meta = statusMeta[status];
  const { data: applicationData, isLoading: applicationsLoading } = useCampaignApplications(campaign._id, { limit: 1 });
  const applications = applicationData?.total ?? campaign.applications_count;
  const shortlisted = applicationData?.shortlisted ?? 0;
  const accepted = applicationData?.accepted ?? 0;
  const shortlistRate = applications > 0 ? Math.round((shortlisted / applications) * 100) : 0;
  const location = [campaign.location?.city, campaign.location?.state].filter(Boolean).join(", ");
  const deadline = formatDate(campaign.deadline, { month: "short", day: "numeric" });
  const dateRange = campaign.dates?.start || campaign.dates?.end
    ? [formatDate(campaign.dates?.start), formatDate(campaign.dates?.end)].filter(Boolean).join(" - ")
    : null;
  const progressStyle = { "--progress": `${shortlistRate}%` } as CSSProperties;

  return (
    <Card className="group grid grid-cols-[96px_minmax(0,1fr)] gap-0 overflow-hidden rounded-xl border-border bg-card p-1.5 shadow-sm transition-transform hover:-translate-y-px hover:border-primary/40 sm:grid-cols-[158px_minmax(0,1fr)] sm:p-2 lg:grid-cols-[180px_minmax(0,1fr)]">
      <div className="relative min-h-[164px] overflow-hidden rounded-lg bg-muted sm:min-h-[170px]">
        {campaign.cover_image_url ? (
          <img src={campaign.cover_image_url} alt={`${campaign.name} campaign cover`} className="absolute inset-0 size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center text-primary/70">
            <FolderKanban className="size-8" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/90 to-transparent" />
        <div className="absolute inset-x-2 bottom-2 text-white sm:inset-x-3">
          <strong className="block truncate font-display text-xs leading-tight sm:text-base">{campaign.name}</strong>
          <span className="mt-1 block truncate text-[8px] uppercase tracking-[0.14em] text-white/75 sm:text-[9px]">{campaign.role_type || "Campaign"}</span>
        </div>
      </div>

      <div className="flex min-w-0 flex-col px-2 py-1 sm:px-3 sm:py-1">
        <div className="flex min-w-0 items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex min-w-0 flex-wrap items-start gap-2">
              <h2 className="min-w-0 truncate font-display text-xs font-semibold text-foreground sm:text-[15px]">{campaign.name}<span className="font-sans font-bold">{campaign.role_type ? ` - ${campaign.role_type}` : ""}</span></h2>
              <Badge variant="outline" className={cn("shrink-0 gap-1.5 border-0 px-2 py-1 text-[9px] font-bold", meta.className)}>
                <span className={cn("size-1.5 rounded-full", meta.iconClassName)} />
                {meta.label}
              </Badge>
            </div>
            <p className="mt-1 line-clamp-2 text-[9px] text-muted-foreground sm:text-[11px]">{campaignRoles(campaign)}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label={`More options for ${campaign.name}`} className="-mr-1 -mt-1 shrink-0 text-muted-foreground hover:text-foreground">
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild><Link href={`/recruiter/campaigns/${campaign._id}`}>View details</Link></DropdownMenuItem>
              {campaign.status === "draft" && <DropdownMenuItem asChild><Link href={`/recruiter/campaigns/${campaign._id}/edit`}>Continue setup</Link></DropdownMenuItem>}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[8px] text-muted-foreground sm:gap-x-3 sm:text-[10px]">
          {dateRange && <span className="flex items-center gap-1"><CalendarDays className="size-3 text-primary sm:size-3.5" />{dateRange}</span>}
          {location && <span className="flex items-center gap-1"><MapPin className="size-3 text-primary sm:size-3.5" />{location}</span>}
          {deadline && <span className="flex items-center gap-1"><Clock3 className="size-3 text-primary sm:size-3.5" />Deadline: {deadline}</span>}
        </div>

        <div className="mt-auto grid grid-cols-3 gap-1.5 pt-2 sm:gap-2">
          <Stat icon={Users} value={applicationsLoading ? "..." : applications} label="Applications" />
          <Stat icon={Star} value={applicationsLoading ? "..." : shortlisted} label="Shortlisted" />
          <Stat icon={Check} value={applicationsLoading ? "..." : accepted} label="Accepted" />
        </div>

        <div className="mt-2 flex items-center gap-2">
          <div className="relative hidden size-10 shrink-0 place-items-center rounded-full bg-[conic-gradient(var(--primary)_var(--progress),var(--muted)_0)] sm:grid" style={progressStyle}>
            <div className="absolute inset-1.5 rounded-full bg-card" />
            <strong className="relative z-10 text-[9px] text-foreground">{shortlistRate}%</strong>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2 text-[8px] font-semibold text-muted-foreground sm:text-[9px]">
              <span>Shortlist rate</span>
              <span>Updated {relativeTime(campaign.updated_at)}</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${shortlistRate}%` }} />
            </div>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between gap-2 border-t border-border pt-2 text-[9px] text-muted-foreground sm:text-[10px]">
          <span className="truncate">{campaign.visibility?.replaceAll("_", " ") || "Visibility not set"} · {formatBudget(campaign)}</span>
          <Link href={campaign.status === "draft" ? `/recruiter/campaigns/${campaign._id}/edit` : `/recruiter/campaigns/${campaign._id}`} className="inline-flex shrink-0 items-center gap-1 font-medium text-primary hover:underline">
            {campaign.status === "draft" ? "Continue" : "View details"}<ExternalLink className="size-3" />
          </Link>
        </div>
      </div>
    </Card>
  );
}

function CampaignSkeleton() {
  return <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-3 rounded-xl border border-border bg-card p-2 sm:grid-cols-[158px_minmax(0,1fr)] lg:grid-cols-[180px_minmax(0,1fr)]"><div className="min-h-[170px] animate-pulse rounded-lg bg-muted" /><div className="space-y-3 p-2"><div className="h-5 animate-pulse rounded bg-muted" /><div className="h-4 w-2/3 animate-pulse rounded bg-muted" /><div className="mt-8 h-12 animate-pulse rounded bg-muted" /></div></div>;
}

export default function RecruiterCampaignsPage() {
  const [tab, setTab] = useState<CampaignTab>("active");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");

  const queryParams = useMemo(() => ({
    status: tab,
    search: search.trim() || undefined,
    role_type: typeFilter || undefined,
    sort: sortBy,
    limit: 10,
  }), [search, sortBy, tab, typeFilter]);

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useRecruiterCampaigns(queryParams);
  const { data: activeCount, isLoading: activeLoading } = useCampaignCount({ status: "active" });
  const { data: draftCount, isLoading: draftLoading } = useCampaignCount({ status: "draft" });
  const { data: closedCount, isLoading: closedLoading } = useCampaignCount({ status: "closed" });

  const campaigns = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);
  const typeOptions = useMemo(() => {
    const types = new Set(
      campaigns
        .map((campaign) => campaign.role_type)
        .filter((type): type is string => Boolean(type)),
    );
    if (typeFilter) types.add(typeFilter);
    return [...types].sort();
  }, [campaigns, typeFilter]);
  const countByTab: Record<CampaignTab, number | undefined> = {
    active: activeCount?.count,
    draft: draftCount?.count,
    closed: closedCount?.count,
  };
  const countLoading: Record<CampaignTab, boolean> = {
    active: activeLoading,
    draft: draftLoading,
    closed: closedLoading,
  };

  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_50%_0%,color-mix(in_oklab,var(--primary)_7%,transparent),transparent_28%),var(--background)] px-3 pb-24 pt-4 sm:px-6 lg:px-8">
      <main className="mx-auto w-full max-w-[1320px]">
        <section className="flex items-end justify-between gap-4 border-b border-border/70 pb-5 sm:pt-3">
          <div className="min-w-0">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">Recruiter workspace</p>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-4xl">My Campaigns</h1>
            <p className="mt-1.5 max-w-xl text-xs text-muted-foreground sm:text-sm">Manage your casting campaigns, track applications and find the right talent.</p>
          </div>
          <Button asChild className="size-9 rounded-lg px-0 sm:h-10 sm:w-auto sm:px-4">
            <Link href="/recruiter/campaigns/new"><Plus className="size-5" /><span className="hidden sm:inline">Create Campaign</span></Link>
          </Button>
        </section>

        <section className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 overflow-x-auto rounded-lg bg-muted p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist" aria-label="Campaign status">
            {tabs.map((item) => {
              const count = countByTab[item.value];
              return <Button key={item.value} role="tab" aria-selected={tab === item.value} variant={tab === item.value ? "default" : "ghost"} size="sm" onClick={() => setTab(item.value)} className="min-w-[82px] flex-1 text-xs sm:min-w-[105px]">{item.label} ({countLoading[item.value] ? "..." : count ?? 0})</Button>;
            })}
          </div>
          <div className="flex gap-2">
            <Select value={typeFilter || "all"} onValueChange={(value) => setTypeFilter(value === "all" ? "" : value)}>
              <SelectTrigger className="h-8 min-w-0 flex-1 text-xs sm:w-[150px] sm:flex-none"><Filter className="size-3.5" /><SelectValue placeholder="All Types" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Types</SelectItem>{typeOptions.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as "newest" | "oldest")}>
              <SelectTrigger className="h-8 min-w-0 flex-1 text-xs sm:w-[150px] sm:flex-none"><SlidersHorizontal className="size-3.5" /><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="newest">Latest First</SelectItem><SelectItem value="oldest">Oldest First</SelectItem></SelectContent>
            </Select>
          </div>
        </section>

        <div className="relative mt-3 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search campaigns" aria-label="Search campaigns" className="h-9 rounded-full pl-9 text-xs" />
        </div>

        <section className="mt-4 grid gap-2.5" aria-live="polite">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => <CampaignSkeleton key={index} />)
          ) : isError ? (
            <div className="rounded-xl border border-destructive/30 bg-card px-6 py-14 text-center"><CircleDashed className="mx-auto size-9 text-destructive" /><h2 className="mt-3 font-display font-semibold">Unable to load campaigns</h2><p className="mt-1 text-sm text-muted-foreground">Please refresh and try again.</p></div>
          ) : campaigns.length === 0 ? (
            <div className="rounded-xl border border-border bg-card px-6 py-16 text-center"><Search className="mx-auto size-9 text-muted-foreground" /><h2 className="mt-3 font-display font-semibold">No campaigns found</h2><p className="mt-1 text-sm text-muted-foreground">{search || typeFilter ? "Try another search or campaign type." : "Create your first campaign to get started."}</p>{!search && !typeFilter && <Button asChild size="sm" className="mt-4"><Link href="/recruiter/campaigns/new"><Plus className="size-4" />Create Campaign</Link></Button>}</div>
          ) : campaigns.map((campaign) => <CampaignCard key={campaign._id} campaign={campaign} />)}
        </section>

        {hasNextPage && <div className="mt-5 flex justify-center"><Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage} className="gap-2 rounded-lg">{isFetchingNextPage && <Loader2 className="size-4 animate-spin" />}{isFetchingNextPage ? "Loading..." : "Show more"}</Button></div>}
      </main>
    </div>
  );
}
