"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  ChevronRight,
  CircleDashed,
  Clock3,
  Copy,
  FilePlus2,
  FileText,
  Inbox,
  Loader2,
  LockKeyhole,
  MapPin,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Share2,
  SlidersHorizontal,
  Star,
  Tag,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  campaignKeys,
  useCampaignApplications,
  useCampaignCount,
  useCloseCampaign,
  useCloneCampaign,
  useRecruiterCampaigns,
} from "@/hooks/use-campaigns";
import type { Campaign } from "@/lib/api/campaigns";
import { apiClient } from "@/lib/api/client";
import { cn, relativeTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type CampaignTab = "active" | "draft" | "closed";
type ClosingFilter = "any" | "7" | "30";
type CompensationFilter = "any" | "budget";

const tabs: { value: CampaignTab; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "draft", label: "Drafts" },
  { value: "closed", label: "Closed" },
];

type ArtworkKind = "studio" | "series" | "portrait";

function artworkFor(campaign: Campaign): ArtworkKind {
  if (campaign.cover_image_url) return "studio";
  let hash = 0;
  for (let i = 0; i < campaign._id.length; i += 1) {
    hash = (hash * 31 + campaign._id.charCodeAt(i)) >>> 0;
  }
  const kinds: ArtworkKind[] = ["studio", "series", "portrait"];
  return kinds[hash % kinds.length];
}

function isPrivate(campaign: Campaign): boolean {
  return (campaign.visibility ?? "").toLowerCase() !== "public";
}

function formatBudget(campaign: Campaign): string | null {
  const { min, max, currency } = campaign.budget_range ?? {};
  if (!min && !max) return null;
  const symbol = currency === "INR" ? "₹" : currency ? `${currency} ` : "₹";
  const fmt = (n: number) => (n >= 100000 ? `${Math.round(n / 100000)}L` : n >= 1000 ? `${Math.round(n / 1000)}k` : `${n}`);
  if (min && max) return `${symbol}${fmt(min)} – ${fmt(max)}`;
  if (min) return `${symbol}${fmt(min)}+`;
  return `Up to ${symbol}${fmt(max as number)}`;
}

function campaignDetail(campaign: Campaign): { text: string; kind: "task" | "budget" | "invite" } {
  if (campaign.task?.is_enabled) return { text: "Task enabled", kind: "task" };
  const budget = formatBudget(campaign);
  if (budget) return { text: budget, kind: "budget" };
  if (isPrivate(campaign)) return { text: "Invite only", kind: "invite" };
  return { text: "Budget not disclosed", kind: "budget" };
}

function daysUntilDeadline(value?: string): number | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((target.getTime() - startOfToday.getTime()) / 86_400_000);
}

function draftCompleteness(campaign: Campaign): number {
  const checks = [
    Boolean(campaign.name),
    Boolean(campaign.description),
    Boolean(campaign.role_type),
    Boolean(campaign.location?.city),
    Boolean(campaign.deadline),
    Boolean(campaign.cover_image_url),
    Boolean(campaign.budget_range?.min || campaign.budget_range?.max),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function locationLabel(campaign: Campaign): string | null {
  const parts = [campaign.location?.city, campaign.location?.state].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : null;
}

/* -------------------------------------------------------------------------- */
/* Design primitives (ported from mobile-first-pages src/routes/index.tsx)     */
/* -------------------------------------------------------------------------- */

function Artwork({ kind, imageUrl, title }: { kind: ArtworkKind; imageUrl?: string; title: string }) {
  if (imageUrl) {
    return (
      <div className="artwork" role="img" aria-label={`${title} cover`}>
        <img src={imageUrl} alt="" loading="lazy" />
      </div>
    );
  }
  if (kind === "studio") {
    return (
      <div className="artwork artwork-studio" aria-label="Film studio artwork" role="img">
        <span className="studio-light studio-light-left" />
        <span className="studio-light studio-light-right" />
        <span className="camera-body" />
        <span className="camera-lens" />
        <span className="camera-tripod" />
        <span className="camera-person" />
      </div>
    );
  }

  if (kind === "series") {
    return (
      <div className="artwork artwork-series" aria-label="Production artwork" role="img">
        <span className="series-kicker">A ROOTIN ORIGINAL</span>
        <strong>{title.slice(0, 10).toUpperCase() || "CASTING"}</strong>
        <small>NOW CASTING</small>
      </div>
    );
  }

  return (
    <div className="artwork artwork-portrait" aria-label="Talent portrait artwork" role="img">
      <span className="portrait-hair" />
      <span className="portrait-face" />
      <span className="portrait-neck" />
      <span className="portrait-body" />
    </div>
  );
}

function Metric({
  icon,
  value,
  label,
  tone,
}: {
  icon: ReactNode;
  value: number | string;
  label: string;
  tone: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-xl bg-metric p-2.5 sm:gap-3 sm:p-3">
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${tone}`}>{icon}</span>
      <span className="min-w-0 leading-tight">
        <strong className="block text-sm font-bold text-foreground">{value}</strong>
        <span className="block truncate text-[11px] text-muted-foreground sm:text-sm">{label}</span>
      </span>
    </div>
  );
}

function DeadlineText({ deadline }: { deadline?: string }) {
  const days = daysUntilDeadline(deadline);
  if (days === null) return <span className="truncate">No deadline set</span>;
  if (days < 0) return <span className="truncate">Deadline passed</span>;
  const label = days === 0 ? "Closes today" : days === 1 ? "Closes tomorrow" : `Closes in ${days} days`;
  return <span className="truncate">{label}</span>;
}

function CampaignMenu({ campaign }: { campaign: Campaign }) {
  const queryClient = useQueryClient();
  const closeCampaign = useCloseCampaign();
  const cloneCampaign = useCloneCampaign();
  const [deleting, setDeleting] = useState(false);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: campaignKeys.all });

  const handleShare = async () => {
    const url = `${window.location.origin}/recruiter/campaigns/${campaign._id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Campaign link copied");
    } catch {
      toast.error("Could not copy link");
    }
  };

  const handleDuplicate = () => {
    cloneCampaign.mutate(campaign._id, {
      onSuccess: () => {
        invalidate();
        toast.success("Campaign duplicated");
      },
      onError: () => toast.error("Could not duplicate campaign"),
    });
  };

  const handleClose = () => {
    closeCampaign.mutate(campaign._id, {
      onSuccess: () => {
        invalidate();
        toast.success("Campaign closed");
      },
      onError: () => toast.error("Could not close campaign"),
    });
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${campaign.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/campaigns/${campaign._id}`);
      invalidate();
      toast.success("Campaign deleted");
    } catch {
      toast.error("Could not delete campaign");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`More options for ${campaign.name}`}
          title={`More options for ${campaign.name}`}
          onClick={(e) => e.stopPropagation()}
          className="grid h-8 w-6 shrink-0 place-items-center self-start rounded-full text-muted-foreground transition duration-200 hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link href={`/recruiter/campaigns/${campaign._id}`}>View details</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/recruiter/campaigns/${campaign._id}/edit`} className="flex items-center gap-2">
            <Pencil className="size-3.5" /> Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleDuplicate} className="flex items-center gap-2">
          <Copy className="size-3.5" /> Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleShare} className="flex items-center gap-2">
          <Share2 className="size-3.5" /> Share
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {campaign.status === "active" && (
          <DropdownMenuItem onSelect={handleClose} className="flex items-center gap-2">
            <XCircle className="size-3.5" /> Close campaign
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onSelect={handleDelete}
          disabled={deleting}
          className="flex items-center gap-2 text-destructive focus:text-destructive"
        >
          <Trash2 className="size-3.5" /> {deleting ? "Deleting…" : "Delete"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const router = useRouter();
  const isDraft = campaign.status === "draft";
  const isClosed = campaign.status === "closed";
  const { data: applicationData, isLoading: applicationsLoading } = useCampaignApplications(campaign._id, {
    limit: 1,
  });
  const applications = applicationData?.total ?? campaign.applications_count ?? 0;
  const shortlisted = applicationData?.shortlisted ?? 0;
  const pending = applicationData?.pending ?? 0;
  const location = locationLabel(campaign);
  const roleLine = [campaign.role_type, campaign.industry].filter(Boolean).join(" · ");
  const detail = campaignDetail(campaign);
  const days = daysUntilDeadline(campaign.deadline);
  const urgent = days !== null && days >= 0 && days <= 3;
  const detailsHref = `/recruiter/campaigns/${campaign._id}`;
  const editHref = `/recruiter/campaigns/${campaign._id}/edit`;
  const applicationsHref = isDraft ? editHref : `/recruiter/campaigns/${campaign._id}/applications`;
  const ctaLabel = isDraft ? "Continue editing" : isClosed ? "View results" : "View applications";
  const completeness = isDraft ? draftCompleteness(campaign) : null;

  return (
    <article
      onClick={() => router.push(detailsHref)}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && e.target === e.currentTarget) {
          e.preventDefault();
          router.push(detailsHref);
        }
      }}
      tabIndex={0}
      role="link"
      aria-label={`View ${campaign.name} campaign details`}
      className="campaign-card animate-rise cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="grid grid-cols-[112px_minmax(0,1fr)_24px] gap-3 sm:grid-cols-[172px_minmax(0,1fr)_28px] sm:gap-5">
        <Artwork kind={artworkFor(campaign)} imageUrl={campaign.cover_image_url} title={campaign.name} />
        <div className="min-w-0 py-0.5">
          <h2 className="truncate text-[15px] font-extrabold text-foreground sm:text-xl">
            <Link
              href={detailsHref}
              onClick={(e) => e.stopPropagation()}
              className="hover:underline focus-visible:outline-none"
            >
              {campaign.name}
            </Link>
          </h2>
          <div
            className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold sm:text-sm ${
              isDraft
                ? "bg-secondary text-muted-foreground"
                : isClosed
                  ? "bg-secondary text-muted-foreground"
                  : isPrivate(campaign)
                    ? "bg-private-soft text-private"
                    : "bg-success-soft text-success"
            }`}
          >
            {isDraft || isClosed ? (
              <span className="h-2 w-2 rounded-full bg-current" />
            ) : isPrivate(campaign) ? (
              <LockKeyhole className="h-3.5 w-3.5" />
            ) : (
              <span className="h-2 w-2 rounded-full bg-success" />
            )}
            {isDraft ? "Draft" : isClosed ? "Closed" : isPrivate(campaign) ? "Invite Only" : "Active"}
          </div>
          <p className="mt-1.5 truncate text-xs text-muted-foreground sm:text-base">
            {roleLine || "Campaign"}
          </p>
          {location ? (
            <p className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground sm:text-base">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate">{location}</span>
            </p>
          ) : (
            <p className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground sm:text-base">
              <Clock3 className="h-4 w-4 shrink-0" />
              <span className="truncate">Updated {relativeTime(campaign.updated_at)}</span>
            </p>
          )}
        </div>
        <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
          <CampaignMenu campaign={campaign} />
        </div>
      </div>

      {isDraft ? (
        <div className="mt-3 rounded-xl bg-metric px-3 py-2.5">
          <div className="flex items-center justify-between gap-2 text-xs sm:text-sm">
            <span className="text-muted-foreground">Profile {completeness}% complete</span>
            <Link
              href={editHref}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex shrink-0 items-center gap-0.5 font-semibold text-primary"
            >
              Continue editing <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-primary" style={{ width: `${completeness}%` }} />
          </div>
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:mt-4 sm:gap-3">
          <Metric
            icon={<Users className="h-5 w-5" />}
            value={applicationsLoading ? "…" : applications}
            label="Applicants"
            tone="bg-primary-soft text-primary"
          />
          <Metric
            icon={<Star className="h-5 w-5 fill-current" />}
            value={applicationsLoading ? "…" : shortlisted}
            label="Shortlisted"
            tone="bg-warning-soft text-warning"
          />
          <Metric
            icon={<FileText className="h-5 w-5 fill-current" />}
            value={applicationsLoading ? "…" : pending}
            label="Pending"
            tone="bg-alert-soft text-alert"
          />
        </div>
      )}

      <div className="mt-3 grid grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)] items-center gap-3 px-1 text-xs text-muted-foreground sm:text-base">
        <span className={`flex min-w-0 items-center gap-2 ${urgent ? "font-semibold text-alert" : ""}`}>
          <Clock3 className="h-5 w-5 shrink-0" />
          <DeadlineText deadline={campaign.deadline} />
        </span>
        <span className="h-6 bg-border" />
        <span className="flex min-w-0 items-center gap-2">
          {detail.kind === "task" ? (
            <FileText className="h-5 w-5 shrink-0" />
          ) : detail.kind === "invite" ? (
            <LockKeyhole className="h-5 w-5 shrink-0" />
          ) : (
            <Tag className="h-5 w-5 shrink-0" />
          )}
          <span className="truncate">{detail.text}</span>
        </span>
      </div>

      <Link
        href={applicationsHref}
        onClick={(e) => e.stopPropagation()}
        className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-action text-sm font-bold text-primary transition hover:bg-primary-soft active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-base"
      >
        {ctaLabel} <ArrowRight className="h-5 w-5" />
      </Link>
    </article>
  );
}

function CampaignSkeleton() {
  return (
    <div className="campaign-card" aria-hidden>
      <div className="grid grid-cols-[112px_minmax(0,1fr)_24px] gap-3 sm:grid-cols-[172px_minmax(0,1fr)_28px] sm:gap-5">
        <div className="artwork animate-pulse bg-secondary" />
        <div className="space-y-2 py-1">
          <div className="h-4 w-3/4 animate-pulse rounded bg-secondary" />
          <div className="h-3 w-16 animate-pulse rounded bg-secondary" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-secondary" />
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="h-[60px] animate-pulse rounded-xl bg-secondary" />
        <div className="h-[60px] animate-pulse rounded-xl bg-secondary" />
        <div className="h-[60px] animate-pulse rounded-xl bg-secondary" />
      </div>
      <div className="mt-3 h-12 animate-pulse rounded-full bg-secondary" />
    </div>
  );
}

function EmptyState({
  tab,
  hasFilters,
  onClear,
}: {
  tab: CampaignTab;
  hasFilters: boolean;
  onClear: () => void;
}) {
  const copy: Record<CampaignTab, { title: string; body: string }> = {
    active: {
      title: "No active campaigns found",
      body: hasFilters ? "Try another search term or filter." : "Create a campaign to start receiving applications.",
    },
    draft: {
      title: "No draft campaigns found",
      body: hasFilters ? "Try another search term or filter." : "Campaigns you haven't published will appear here.",
    },
    closed: {
      title: "No closed campaigns found",
      body: hasFilters ? "Try another search term or filter." : "Finished campaigns will appear here.",
    },
  };
  const { title, body } = copy[tab];
  return (
    <div className="grid min-h-64 place-items-center rounded-[1.75rem] border border-dashed border-border bg-card px-6 text-center shadow-control">
      <div className="py-10">
        {tab === "draft" ? (
          <FilePlus2 className="mx-auto h-9 w-9 text-muted-foreground" />
        ) : tab === "closed" ? (
          <Inbox className="mx-auto h-9 w-9 text-muted-foreground" />
        ) : (
          <BriefcaseBusiness className="mx-auto h-9 w-9 text-muted-foreground" />
        )}
        <h2 className="mt-3 font-bold text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{body}</p>
        {hasFilters ? (
          <button
            type="button"
            onClick={onClear}
            className="mt-4 h-11 rounded-full border border-border px-5 text-sm font-bold text-foreground transition hover:bg-secondary"
          >
            Clear search & filters
          </button>
        ) : tab !== "closed" ? (
          <Link
            href="/recruiter/campaigns/new"
            className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground shadow-primary transition hover:bg-primary-strong"
          >
            <Plus className="h-4 w-4" /> Create Campaign
          </Link>
        ) : null}
      </div>
    </div>
  );
}

const sortOptions = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
] as const;

const closingOptions: { value: ClosingFilter; label: string }[] = [
  { value: "any", label: "Any time" },
  { value: "7", label: "Closing in 7 days" },
  { value: "30", label: "Closing in 30 days" },
];

const compensationOptions: { value: CompensationFilter; label: string }[] = [
  { value: "any", label: "Any compensation" },
  { value: "budget", label: "Has budget set" },
];

export default function RecruiterCampaignsPage() {
  const [tab, setTab] = useState<CampaignTab>("active");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [locationFilter, setLocationFilter] = useState("");
  const [closingFilter, setClosingFilter] = useState<ClosingFilter>("any");
  const [compensationFilter, setCompensationFilter] = useState<CompensationFilter>("any");
  const [sheetOpen, setSheetOpen] = useState(false);

  const activeFilterCount =
    (typeFilter ? 1 : 0) +
    (locationFilter.trim() ? 1 : 0) +
    (closingFilter !== "any" ? 1 : 0) +
    (compensationFilter !== "any" ? 1 : 0) +
    (sortBy !== "newest" ? 1 : 0);

  const queryParams = useMemo(
    () => ({
      status: tab,
      search: search.trim() || undefined,
      role_type: typeFilter || undefined,
      sort: sortBy,
      limit: 10,
    }),
    [search, sortBy, tab, typeFilter],
  );

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useRecruiterCampaigns(queryParams);
  const { data: activeCount, isLoading: activeLoading } = useCampaignCount({ status: "active" });
  const { data: draftCount, isLoading: draftLoading } = useCampaignCount({ status: "draft" });
  const { data: closedCount, isLoading: closedLoading } = useCampaignCount({ status: "closed" });

  const campaigns = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

  const visibleCampaigns = useMemo(() => {
    const loc = locationFilter.trim().toLowerCase();
    return campaigns.filter((campaign) => {
      if (loc) {
        const haystack = [campaign.location?.city, campaign.location?.state].filter(Boolean).join(" ").toLowerCase();
        if (!haystack.includes(loc)) return false;
      }
      if (closingFilter !== "any" && campaign.status === "active") {
        const days = daysUntilDeadline(campaign.deadline);
        if (days === null || days < 0 || days > Number(closingFilter)) return false;
      }
      if (compensationFilter === "budget") {
        if (!campaign.budget_range?.min && !campaign.budget_range?.max) return false;
      }
      return true;
    });
  }, [campaigns, locationFilter, closingFilter, compensationFilter]);

  const typeOptions = useMemo(() => {
    const types = new Set(campaigns.map((c) => c.role_type).filter((t): t is string => Boolean(t)));
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

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("");
    setSortBy("newest");
    setLocationFilter("");
    setClosingFilter("any");
    setCompensationFilter("any");
  };

  return (
    <div className="campaigns-theme min-h-full bg-canvas font-sans text-foreground">
      <main className="mx-auto w-full max-w-[720px] px-5 pb-8 pt-6 sm:px-7 sm:pt-7">
        <section className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground sm:text-sm">
              Recruiter workspace
            </p>
            <h1 className="mt-1 text-[27px] font-extrabold leading-tight text-foreground sm:text-[34px]">
              My Campaigns
            </h1>
            <p className="mt-1 text-sm text-muted-foreground sm:text-lg">
              Create and manage your casting campaigns
            </p>
          </div>
          <Link
            href="/recruiter/campaigns/new"
            aria-label="Create campaign"
            title="Create campaign"
            className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-primary transition duration-200 hover:bg-primary-strong active:scale-95 sm:h-[70px] sm:w-[70px]"
          >
            <Plus className="h-7 w-7 sm:h-9 sm:w-9" strokeWidth={1.7} />
          </Link>
        </section>

        <div
          className="mt-5 grid grid-cols-3 rounded-full border border-border bg-card p-1 shadow-control"
          role="tablist"
          aria-label="Campaign status"
        >
          {tabs.map((item) => {
            const selected = tab === item.value;
            const count = countByTab[item.value];
            return (
              <button
                key={item.value}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setTab(item.value)}
                className={`flex h-11 items-center justify-center gap-1.5 rounded-full text-sm font-bold transition sm:h-13 sm:text-base ${
                  selected ? "bg-primary text-primary-foreground shadow-primary" : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                {item.label}
                <span
                  className={`grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-xs ${
                    selected ? "bg-primary-foreground/15 text-primary-foreground" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {countLoading[item.value] ? "…" : (count ?? 0)}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid grid-cols-[minmax(0,1fr)_52px] gap-3 sm:grid-cols-[minmax(0,1fr)_62px]">
          <label className="flex h-[52px] min-w-0 items-center gap-3 rounded-full border border-border bg-card px-4 shadow-control sm:h-[62px] sm:px-6">
            <Search className="h-5 w-5 shrink-0 text-muted-foreground sm:h-6 sm:w-6" />
            <span className="sr-only">Search campaigns</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground sm:text-base"
              placeholder="Search campaigns..."
            />
          </label>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Open campaign filters"
                title="Open campaign filters"
                className={`relative grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full border border-border shadow-control transition duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-[62px] sm:w-[62px] ${
                  activeFilterCount > 0
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:bg-secondary"
                }`}
              >
                <SlidersHorizontal className="h-5 w-5 sm:h-6 sm:w-6" />
                {activeFilterCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-alert px-1 text-[10px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="campaigns-theme mx-auto max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-[1.75rem] border-border bg-card px-5 pb-6 pt-3"
            >
              <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-border" aria-hidden />
              <SheetHeader className="items-start p-0 text-left">
                <SheetTitle className="text-base font-bold text-foreground">Filters</SheetTitle>
              </SheetHeader>

              <div className="mt-4 space-y-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Campaign type</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setTypeFilter("")}
                      className={cn(
                        "h-9 rounded-full border px-4 text-[13px] font-medium transition",
                        !typeFilter
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-muted-foreground hover:bg-secondary",
                      )}
                    >
                      All
                    </button>
                    {typeOptions.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setTypeFilter(type === typeFilter ? "" : type)}
                        className={cn(
                          "h-9 rounded-full border px-4 text-[13px] font-medium transition",
                          type === typeFilter
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card text-muted-foreground hover:bg-secondary",
                        )}
                      >
                        {type}
                      </button>
                    ))}
                    {typeOptions.length === 0 && (
                      <p className="text-xs text-muted-foreground">Types will appear once you create campaigns.</p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sort</p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setSortBy(option.value)}
                        className={cn(
                          "h-10 rounded-xl border text-[13px] font-medium transition",
                          sortBy === option.value
                            ? "border-primary bg-primary-soft text-primary"
                            : "border-border bg-card text-muted-foreground hover:bg-secondary",
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="filter-location"
                    className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    Location
                  </label>
                  <div className="relative mt-2">
                    <MapPin className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="filter-location"
                      value={locationFilter}
                      onChange={(event) => setLocationFilter(event.target.value)}
                      placeholder="City or state"
                      className="h-11 rounded-xl border-border bg-card pl-10 text-sm text-foreground"
                    />
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Closing date</p>
                  <div className="mt-2 space-y-2">
                    {closingOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setClosingFilter(option.value)}
                        className={cn(
                          "flex h-11 w-full items-center gap-2.5 rounded-xl border px-3.5 text-left text-[13px] font-medium transition",
                          closingFilter === option.value
                            ? "border-primary bg-primary-soft text-primary"
                            : "border-border bg-card text-muted-foreground hover:bg-secondary",
                        )}
                      >
                        <CalendarDays className="size-4 shrink-0" />
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Compensation</p>
                  <div className="mt-2 space-y-2">
                    {compensationOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setCompensationFilter(option.value)}
                        className={cn(
                          "h-11 w-full rounded-xl border px-3.5 text-left text-[13px] font-medium transition",
                          compensationFilter === option.value
                            ? "border-primary bg-primary-soft text-primary"
                            : "border-border bg-card text-muted-foreground hover:bg-secondary",
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <SheetFooter className="mt-6 flex-row gap-2 p-0 sm:flex-row">
                <Button
                  variant="outline"
                  className="h-12 flex-1 rounded-full border-border bg-card text-foreground hover:bg-secondary"
                  onClick={clearFilters}
                >
                  Reset
                </Button>
                <Button
                  className="h-12 flex-1 rounded-full bg-primary text-primary-foreground shadow-primary hover:bg-primary-strong"
                  onClick={() => setSheetOpen(false)}
                >
                  Show results
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>

        <div className="mt-4 hidden gap-2 sm:flex">
          <Select value={typeFilter || "all"} onValueChange={(value) => setTypeFilter(value === "all" ? "" : value)}>
            <SelectTrigger className="h-11 w-[150px] rounded-full border-border bg-card text-[13px] text-foreground shadow-control">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {typeOptions.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as "newest" | "oldest")}>
            <SelectTrigger className="h-11 w-[150px] rounded-full border-border bg-card text-[13px] text-foreground shadow-control">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Latest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <p className="mt-3 text-xs text-muted-foreground sm:text-sm" aria-live="polite">
          {isLoading
            ? "Loading campaigns…"
            : `${visibleCampaigns.length} ${tab} campaign${visibleCampaigns.length === 1 ? "" : "s"}${
                activeFilterCount > 0 || search.trim()
                  ? ` · ${activeFilterCount} filter${activeFilterCount === 1 ? "" : "s"} applied`
                  : ""
              }`}
        </p>

        <div className="mt-3 space-y-3" aria-live="polite">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => <CampaignSkeleton key={index} />)
          ) : isError ? (
            <div className="grid min-h-64 place-items-center rounded-[1.75rem] border border-border bg-card px-6 text-center shadow-control">
              <div className="py-10">
                <CircleDashed className="mx-auto h-9 w-9 text-destructive" />
                <h2 className="mt-3 font-bold text-foreground">Unable to load campaigns</h2>
                <p className="mt-1 text-sm text-muted-foreground">Please refresh and try again.</p>
              </div>
            </div>
          ) : visibleCampaigns.length === 0 ? (
            <EmptyState
              tab={tab}
              hasFilters={Boolean(search.trim()) || activeFilterCount > 0}
              onClear={clearFilters}
            />
          ) : (
            visibleCampaigns.map((campaign) => <CampaignCard key={campaign._id} campaign={campaign} />)
          )}
        </div>

        {hasNextPage && (
          <div className="mt-5 flex justify-center">
            <Button
              variant="outline"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="h-12 gap-2 rounded-full border-border bg-card px-6 text-foreground shadow-control hover:bg-secondary"
            >
              {isFetchingNextPage && <Loader2 className="size-4 animate-spin" />}
              {isFetchingNextPage ? "Loading..." : "Show more"}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
