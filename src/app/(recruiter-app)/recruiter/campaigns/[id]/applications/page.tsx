"use client";

/**
 * Recruiter campaign applications — visual port of talent-hub-pro
 * `src/routes/index.tsx` ("My Shortlist") wired to real backend data,
 * refined mobile-first for a 390×844 viewport.
 *
 * Sections (top to bottom): header, campaign card, 2×2 metric filters,
 * scrollable status tabs, full-width search, sort/filter row, bulk bar
 * (minimal when idle, toolbar when selecting), talent cards, load more.
 * The fixed `BottomNav` is dropped (recruiter-app layout renders `TopBar`
 * + `BottomBar`; `TopBar` additionally hides itself on this route).
 *
 * Data model notes: status tabs use the backend statuses (pending →
 * Applied, submitted task → To Review, `is_shortlisted`, accepted).
 * Rejected applicants are reachable via the All tab and the filter sheet.
 * The applications endpoint takes `limit` but no offset, so "Load more"
 * grows the window; results are held stale-while-revalidate so typing,
 * sorting, or loading more never flashes a full-page skeleton.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowUpDown,
  BarChart3,
  Bookmark,
  Check,
  ChevronDown,
  Clapperboard,
  Eye,
  Filter,
  Heart,
  Loader2,
  MapPin,
  MessageSquare,
  Plane,
  Plus,
  Search,
  SearchX,
  Send,
  Star,
  Trash2,
  Users,
  UsersRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  EMPTY_FILTERS,
  applyApplicantFilters,
  countActiveFilters,
  FilterSheet,
  type ApplicantFilters,
} from "@/components/campaign-applicants/filter-sheet";
import {
  useBulkUpdateApplications,
  useCampaign,
  useCampaignApplications,
  useRecruiterCampaigns,
  useShortlistApplication,
  useUnshortlistApplication,
} from "@/hooks/use-campaigns";
import { conversationsApi } from "@/lib/api";
import type {
  CampaignApplicationsResponse,
  EnrichedApplication,
} from "@/lib/api/campaigns";
import { cn } from "@/lib/utils";

type TabKey = "all" | "applied" | "shortlisted" | "review" | "accepted";

const PAGE_SIZE = 50;

const AVATAR_TONES = [
  "avatar-rose",
  "avatar-blue",
  "avatar-gold",
  "avatar-mint",
] as const;

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "–";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
}

function campaignInitials(name?: string): string {
  if (!name) return "CA";
  return initialsOf(name);
}

function displayNameOf(app: EnrichedApplication): string {
  const tp = app.talent_profile;
  if (tp?.full_legal_name) return tp.full_legal_name;
  if (tp?.username) return tp.username;
  const tid = app.talent_id;
  if (typeof tid === "object")
    return tid.full_legal_name || tid.username || "Unknown";
  return "Unknown";
}

function usernameOf(app: EnrichedApplication): string | undefined {
  if (app.talent_profile?.username) return app.talent_profile.username;
  const tid = app.talent_id;
  if (typeof tid === "object") return tid.username;
  return undefined;
}

function locationOf(app: EnrichedApplication): string {
  const city = app.talent_profile?.location?.city;
  const state = app.talent_profile?.location?.state;
  const parts = [city, state].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "Location not set";
}

function availabilityLabel(app: EnrichedApplication): {
  label: string;
  busy: boolean;
} {
  const availability = app.talent_profile?.availability;
  if (availability === "busy") return { label: "Busy", busy: true };
  if (availability === "not_available")
    return { label: "Not available", busy: true };
  return { label: "Available now", busy: false };
}

function taskLabel(app: EnrichedApplication): string {
  if (app.status === "accepted") return "Accepted";
  if (app.status === "rejected") return "Rejected";
  switch (app.task_submission_status) {
    case "submitted":
      return "Under Review";
    case "reviewed":
      return "Task Completed";
    case "assigned":
      return "Task Assigned";
    default:
      return "Not Started";
  }
}

function CampaignSwitcher({
  open,
  onOpenChange,
  currentId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentId: string;
}) {
  const router = useRouter();
  const { data: campaignsData, isLoading } = useRecruiterCampaigns({
    limit: 30,
    sort: "newest",
  });

  const campaigns = useMemo(
    () => campaignsData?.pages.flatMap((page) => page.data) ?? [],
    [campaignsData],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Choose campaign</DialogTitle>
          <DialogDescription>
            Switch to another campaign to review its applicants.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2 space-y-2">
          {isLoading ? (
            <>
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
            </>
          ) : campaigns.length === 0 ? (
            <div className="rounded-xl border bg-muted p-4 text-sm text-muted-foreground">
              No campaigns yet.{" "}
              <Link
                href="/recruiter/campaigns/new"
                className="font-semibold text-primary hover:underline"
              >
                Create one
              </Link>{" "}
              to start receiving applications.
            </div>
          ) : (
            campaigns.map((campaign) => {
              const selected = campaign._id === currentId;
              return (
                <button
                  key={campaign._id}
                  type="button"
                  onClick={() => {
                    onOpenChange(false);
                    if (!selected) {
                      router.push(
                        `/recruiter/campaigns/${campaign._id}/applications`,
                      );
                    }
                  }}
                  className={cn(
                    "flex min-h-11 w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                    selected
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-primary/40",
                  )}
                >
                  <span
                    className={cn(
                      "relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl",
                      selected
                        ? "bg-primary text-primary-foreground"
                        : "bg-primary/10 text-primary",
                    )}
                  >
                    {campaign.cover_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={campaign.cover_image_url}
                        alt={`${campaign.name} campaign cover`}
                        className="absolute inset-0 h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <Clapperboard className="size-5" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold">
                      {campaign.name}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {[
                        campaign.role_type,
                        campaign.location?.city,
                        campaign.status,
                      ]
                        .filter(Boolean)
                        .join(" • ")}
                    </span>
                  </span>
                  {selected && <Check className="size-4 shrink-0 text-primary" />}
                </button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function RecruiterCampaignApplicationsPage() {
  const params = useParams<{ id: string }>();
  const campaignId = params.id;
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<ApplicantFilters>(EMPTY_FILTERS);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [messaging, setMessaging] = useState(false);

  const { data: campaign, isLoading: campaignLoading } =
    useCampaign(campaignId);
  const { data: appData, isFetching } = useCampaignApplications(campaignId, {
    search: search || undefined,
    sort,
    limit,
  });

  const bulkUpdate = useBulkUpdateApplications();
  const shortlist = useShortlistApplication();
  const unshortlist = useUnshortlistApplication();

  // Stale-while-revalidate: keep showing the last results while a refetch
  // (search keystrokes, sort toggle, load more) is in flight. Derived state
  // is adjusted during render (the documented pattern for syncing state from
  // props/query data), so there is no effect and no cascading render.
  const [displayData, setDisplayData] =
    useState<CampaignApplicationsResponse | null>(null);
  const [prevAppData, setPrevAppData] =
    useState<CampaignApplicationsResponse | null | undefined>(appData);
  if (prevAppData !== appData) {
    setPrevAppData(appData);
    if (appData) setDisplayData(appData);
  }

  // Reset per-campaign state when navigating between campaigns via the
  // switcher (the route reuses this component instance).
  const [prevCampaignId, setPrevCampaignId] = useState(campaignId);
  if (prevCampaignId !== campaignId) {
    setPrevCampaignId(campaignId);
    setSelected([]);
    setDisplayData(null);
  }

  const applications = useMemo(() => displayData?.data ?? [], [displayData]);

  const total = displayData?.total ?? 0;
  const shortlistedCount = displayData?.shortlisted ?? 0;
  const acceptedCount = displayData?.accepted ?? 0;

  const pendingReview = useMemo(
    () =>
      applications.filter((a) => a.task_submission_status === "submitted")
        .length,
    [applications],
  );

  const appliedCount = useMemo(
    () =>
      applications.filter((a) => a.status === "pending" && !a.is_shortlisted)
        .length,
    [applications],
  );

  const tabs = useMemo(
    () =>
      [
        { key: "all", label: `All (${total})` },
        { key: "applied", label: `Applied (${appliedCount})` },
        { key: "review", label: `To Review (${pendingReview})` },
        { key: "shortlisted", label: `Shortlisted (${shortlistedCount})` },
        { key: "accepted", label: `Accepted (${acceptedCount})` },
      ] as const,
    [total, appliedCount, pendingReview, shortlistedCount, acceptedCount],
  );

  // Metric cards double as filters. "Applied" shows the total, so it maps
  // to the All tab; the rest map 1:1 with matching counts.
  const metrics: {
    key: TabKey;
    icon: typeof Bookmark;
    value: number;
    label: string;
    tone: string;
  }[] = [
    { key: "all", icon: Bookmark, value: total, label: "Applied", tone: "metric-primary" },
    { key: "review", icon: Eye, value: pendingReview, label: "To Review", tone: "metric-sky" },
    { key: "shortlisted", icon: Users, value: shortlistedCount, label: "Shortlisted", tone: "metric-violet" },
    { key: "accepted", icon: Send, value: acceptedCount, label: "Accepted", tone: "metric-mint" },
  ];

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = applications.filter((app) => {
      switch (activeTab) {
        case "applied":
          if (!(app.status === "pending" && !app.is_shortlisted)) return false;
          break;
        case "shortlisted":
          if (!app.is_shortlisted) return false;
          break;
        case "review":
          if (app.task_submission_status !== "submitted") return false;
          break;
        case "accepted":
          if (app.status !== "accepted") return false;
          break;
        case "all":
        default:
          break;
      }
      if (q) {
        const name = displayNameOf(app).toLowerCase();
        const username = usernameOf(app)?.toLowerCase() ?? "";
        const professions = (app.talent_profile?.professions ?? [])
          .join(" ")
          .toLowerCase();
        const city = app.talent_profile?.location?.city?.toLowerCase() ?? "";
        if (
          !(
            name.includes(q) ||
            username.includes(q) ||
            professions.includes(q) ||
            city.includes(q)
          )
        ) {
          return false;
        }
      }
      return true;
    });
    const withFilters = applyApplicantFilters(filtered, filters);
    return [...withFilters].sort((a, b) => {
      const da = new Date(a.created_at).getTime();
      const db = new Date(b.created_at).getTime();
      return sort === "newest" ? db - da : da - db;
    });
  }, [applications, activeTab, search, filters, sort]);

  const activeFilterCount = countActiveFilters(filters);
  const selectedCount = selected.length;
  const allSelected = visible.length > 0 && selectedCount === visible.length;
  const canLoadMore = applications.length < total;
  const hasConstraints =
    search.trim() !== "" || activeTab !== "all" || activeFilterCount > 0;

  const clearConstraints = () => {
    setSearch("");
    setActiveTab("all");
    setFilters(EMPTY_FILTERS);
    setSelected([]);
  };

  const toggle = (id: string) =>
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );

  const toggleAll = () =>
    setSelected(allSelected ? [] : visible.map((app) => app._id));

  const selectedApps = useMemo(
    () => applications.filter((app) => selected.includes(app._id)),
    [applications, selected],
  );

  const compareSelected = () => {
    const usernames = selectedApps
      .map((app) => usernameOf(app))
      .filter((u): u is string => Boolean(u));
    if (usernames.length === 0) {
      toast.error("Selected applicants have no profile username");
      return;
    }
    const query = new URLSearchParams({
      ids: usernames.join(","),
      from: "applications",
      campaign: campaignId,
    });
    router.push(`/recruiter/compare?${query.toString()}`);
  };

  const messageSelected = async () => {
    if (selectedApps.length === 0 || messaging) return;
    setMessaging(true);
    try {
      if (selectedApps.length === 1) {
        const app = selectedApps[0]!;
        const username = usernameOf(app);
        if (!username) {
          toast.error("Talent username is unavailable");
          return;
        }
        try {
          const { conversation_id } =
            await conversationsApi.startByUsername(username);
          const query = new URLSearchParams();
          query.set("talent", displayNameOf(app));
          if (campaign?.name) query.set("campaign", campaign.name);
          router.push(
            `/recruiter/messages/${conversation_id}?${query.toString()}`,
          );
        } catch {
          toast.error("Could not open conversation");
        }
        return;
      }
      const results = await Promise.allSettled(
        selectedApps.map((app) => {
          const username = usernameOf(app);
          if (!username) {
            return Promise.reject(
              new Error(`No username for ${displayNameOf(app)}`),
            );
          }
          return conversationsApi.startByUsername(username);
        }),
      );
      const opened = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.length - opened;
      if (opened === 0) {
        toast.error("Could not open conversations");
      } else {
        toast.success(
          `Opened ${opened} conversation${opened === 1 ? "" : "s"}${failed > 0 ? `, ${failed} failed` : ""}`,
        );
        router.push("/recruiter/messages");
      }
    } finally {
      setMessaging(false);
    }
  };

  const acceptSelected = () => {
    if (selectedCount === 0) return;
    bulkUpdate.mutate(
      { campaignId, applicationIds: selected, status: "accepted" },
      {
        onSuccess: (data) => {
          toast.success(
            `Accepted ${data.updated} applicant${data.updated === 1 ? "" : "s"}`,
          );
          setSelected([]);
        },
        onError: () => toast.error("Failed to accept applicants"),
      },
    );
  };

  const removeSelected = () => {
    if (selectedCount === 0) return;
    bulkUpdate.mutate(
      { campaignId, applicationIds: selected, status: "rejected" },
      {
        onSuccess: (data) => {
          toast.success(
            `Removed ${data.updated} applicant${data.updated === 1 ? "" : "s"}`,
          );
          setSelected([]);
        },
        onError: () => toast.error("Failed to remove applicants"),
      },
    );
  };

  const toggleShortlist = (app: EnrichedApplication) => {
    if (app.is_shortlisted) {
      unshortlist.mutate(
        { campaignId, applicationId: app._id },
        { onError: () => toast.error("Failed to remove shortlist") },
      );
    } else {
      shortlist.mutate(
        { campaignId, applicationId: app._id },
        { onError: () => toast.error("Failed to shortlist applicant") },
      );
    }
  };

  const isLoading = campaignLoading || !displayData;

  if (isLoading) {
    return (
      <div className="campaign-applications-theme min-h-screen bg-background pb-24 text-foreground">
        <div className="mx-auto w-full max-w-6xl space-y-3 px-4 pb-6 pt-4 sm:px-6 lg:px-8">
          <Skeleton className="h-12 rounded-full" />
          <Skeleton className="h-[132px] rounded-lg" />
          <div className="grid grid-cols-2 gap-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-11 rounded-full" />
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
          <p className="flex items-center justify-center gap-2 pt-4 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Loading applications…
          </p>
        </div>
      </div>
    );
  }

  const campaignStatusLabel =
    campaign?.status === "active" ? "Casting Ongoing" : (campaign?.status ?? "Campaign");

  return (
    <div className="campaign-applications-theme min-h-screen bg-background pb-24 text-foreground">
      <div className="mx-auto w-full max-w-6xl px-4 pb-6 pt-4 sm:px-6 lg:px-8">
        {/* Header: back, title, add */}
        <header className="flex items-center gap-3 py-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Go back"
            className="size-11 shrink-0 rounded-full"
            asChild
          >
            <Link href={`/recruiter/campaigns/${campaignId}`}>
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[22px] font-bold leading-tight">
              Campaign Talent
            </h1>
            <p className="hidden truncate text-[13px] text-muted-foreground sm:block">
              Review, compare, and invite applicants for this campaign.
            </p>
          </div>
          <Button
            aria-label="Add talent"
            className="size-11 shrink-0 rounded-full p-0"
            asChild
          >
            <Link href="/recruiter/find-talent">
              <Plus className="size-5" />
            </Link>
          </Button>
        </header>

        {/* Campaign identity + explicit change action */}
        <section aria-label="Current campaign" className="mt-3 rounded-lg border bg-card p-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-campaign relative grid size-[52px] shrink-0 place-items-center overflow-hidden rounded-lg text-sm font-black text-primary">
              {campaign?.cover_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={campaign.cover_image_url}
                  alt={`${campaign.name} campaign cover`}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                campaignInitials(campaign?.name)
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                {campaign?.status === "active" ? "Active campaign" : "Campaign"}
              </p>
              <h2 className="truncate text-[15px] font-bold">
                {campaign?.name || "Campaign"}
              </h2>
              <p className="truncate text-xs text-muted-foreground">
                {[campaign?.role_type || "Casting", campaign?.location?.city, campaignStatusLabel]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSwitcherOpen(true)}
              aria-label="Choose campaign"
              className="grid size-11 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ChevronDown className="size-5" />
            </button>
          </div>
          <Button
            variant="secondary"
            onClick={() => setSwitcherOpen(true)}
            className="mt-3 h-11 w-full rounded-lg text-[13px] font-semibold text-primary"
          >
            <ArrowUpDown className="size-4" /> Change Campaign
          </Button>
        </section>

        {/* Stat filters: 2×2 grid, tinted icon backgrounds */}
        <section aria-label="Application summary" className="mt-3 grid grid-cols-2 gap-2">
          {metrics.map((metric) => (
            <Metric
              key={metric.key}
              icon={metric.icon}
              value={String(metric.value)}
              label={metric.label}
              tone={metric.tone}
              active={activeTab === metric.key}
              onClick={() => {
                setActiveTab(metric.key);
                setSelected([]);
              }}
            />
          ))}
        </section>

        {/* Status tabs: single scrollable row, full-bleed on mobile */}
        <nav
          aria-label="Applicant status"
          className="scrollbar-none -mx-4 mt-3 flex flex-nowrap gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
        >
          {tabs.map((tab) => (
            <Button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setSelected([]);
              }}
              variant={activeTab === tab.key ? "default" : "secondary"}
              aria-pressed={activeTab === tab.key}
              className="h-11 shrink-0 whitespace-nowrap rounded-full px-4 text-[13px] shadow-none"
            >
              {tab.label}
            </Button>
          ))}
        </nav>

        {/* Search: full-width, own row */}
        <div className="mt-3 flex h-12 items-center gap-1 rounded-lg border bg-card pl-3 pr-1 shadow-sm transition-colors focus-within:border-primary/60">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <label htmlFor="applicant-search" className="sr-only">
            Search applicants
          </label>
          <input
            id="applicant-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, profession, or city…"
            className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="grid size-11 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          ) : (
            isFetching && (
              <span className="grid size-11 shrink-0 place-items-center">
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              </span>
            )
          )}
        </div>

        {/* Sort (left) + Filter (right): the only filter controls besides tabs */}
        <div className="mt-3 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            aria-label="Change sort order"
            className="h-12 min-w-0 justify-start px-3"
            onClick={() => setSort(sort === "newest" ? "oldest" : "newest")}
          >
            <ArrowUpDown className="text-primary" />
            <span className="text-left text-xs font-normal text-muted-foreground">
              Sort by
              <br />
              <strong className="text-foreground">
                {sort === "newest" ? "Recently Added" : "Oldest First"}
              </strong>
            </span>
            <ChevronDown className="ml-2" />
          </Button>
          <Button
            variant="outline"
            aria-expanded={filtersOpen}
            className={cn(
              "h-12 shrink-0",
              activeFilterCount > 0 && "border-primary/60 bg-primary-soft text-primary",
            )}
            onClick={() => setFiltersOpen(true)}
          >
            <Filter className="text-primary" />
            Filter{activeFilterCount > 0 && ` (${activeFilterCount})`}
          </Button>
        </div>

        {/* Bulk area: minimal when idle, toolbar when selecting */}
        {selectedCount === 0 ? (
          <section
            aria-label="Bulk actions"
            className="mt-3 flex h-[52px] items-center gap-2 rounded-lg bg-muted/60 px-2"
          >
            <button
              type="button"
              onClick={toggleAll}
              disabled={visible.length === 0}
              aria-label="Select all applicants"
              className="flex h-11 min-w-0 flex-1 items-center gap-2.5 px-1 text-left disabled:opacity-50"
            >
              <span className="grid size-5 shrink-0 place-items-center rounded-md border border-input bg-background" />
              <span className="truncate text-sm text-muted-foreground">
                Select all
              </span>
            </button>
            <span className="shrink-0 pr-2 text-xs text-muted-foreground">
              {total} applicant{total === 1 ? "" : "s"}
            </span>
          </section>
        ) : (
          <section
            aria-label="Bulk actions"
            className="scrollbar-none mt-3 flex items-center gap-2 overflow-x-auto rounded-lg border bg-card p-2 shadow-sm"
          >
            <span className="grid h-11 shrink-0 place-items-center whitespace-nowrap rounded-lg bg-primary-soft px-3 text-[13px] font-bold text-primary">
              {selectedCount} selected
            </span>
            <Button
              variant="ghost"
              className="h-11 shrink-0 px-3 text-primary"
              onClick={compareSelected}
            >
              <BarChart3 /> Compare ({selectedCount})
            </Button>
            <Button
              variant="ghost"
              className="h-11 shrink-0 px-3 text-primary"
              onClick={messageSelected}
              disabled={messaging}
            >
              {messaging ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <MessageSquare />
              )}{" "}
              Message ({selectedCount})
            </Button>
            <Button
              variant="ghost"
              className="h-11 shrink-0 px-3 text-primary"
              onClick={acceptSelected}
              disabled={bulkUpdate.isPending}
            >
              <Send /> Accept ({selectedCount})
            </Button>
            <Button
              variant="ghost"
              className="h-11 shrink-0 px-3 text-destructive"
              onClick={removeSelected}
              disabled={bulkUpdate.isPending}
            >
              <Trash2 /> Remove ({selectedCount})
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Clear selection"
              className="h-11 w-11 shrink-0 rounded-lg"
              onClick={() => setSelected([])}
            >
              <X className="size-4" />
            </Button>
          </section>
        )}

        {/* Talent results */}
        {visible.length === 0 ? (
          <section
            aria-label="No applicants"
            className="flex flex-col items-center px-6 py-14 text-center"
          >
            <span className="grid size-16 place-items-center rounded-full bg-primary-soft text-primary">
              {hasConstraints ? (
                <SearchX className="size-7" />
              ) : (
                <UsersRound className="size-7" />
              )}
            </span>
            <h2 className="mt-4 text-lg font-bold">No applicants yet</h2>
            <p className="mt-1 max-w-[270px] text-sm text-muted-foreground">
              {hasConstraints
                ? "No one matches this view. Try clearing your search, tab, or filters."
                : "When talent applies to this campaign, they will show up here for review."}
            </p>
            {hasConstraints ? (
              <Button className="mt-5 h-11 rounded-lg px-6" onClick={clearConstraints}>
                Clear search & filters
              </Button>
            ) : (
              <Button className="mt-5 h-11 rounded-lg px-6" asChild>
                <Link href="/recruiter/find-talent">
                  <Plus /> Find talent
                </Link>
              </Button>
            )}
          </section>
        ) : (
          <section aria-label="Applicant results" className="mt-3 space-y-3">
            {visible.map((app, index) => (
              <TalentCard
                key={app._id}
                application={app}
                tone={AVATAR_TONES[index % AVATAR_TONES.length]!}
                selected={selected.includes(app._id)}
                onToggle={() => toggle(app._id)}
                onToggleShortlist={() => toggleShortlist(app)}
                shortlistPending={shortlist.isPending || unshortlist.isPending}
                campaignId={campaignId}
              />
            ))}
          </section>
        )}

        {/* Pagination — the endpoint takes `limit` but no offset, so loading
            more grows the window and replaces the list. */}
        {total > 0 && !isLoading && (
          <div className="mt-4 text-center">
            {canLoadMore ? (
              <>
                <p className="text-xs text-muted-foreground">
                  Showing {applications.length} of {total} applicants
                </p>
                <Button
                  variant="outline"
                  className="mt-2 h-11 border-primary px-6 text-primary"
                  onClick={() => setLimit((l) => l + PAGE_SIZE)}
                  disabled={isFetching}
                >
                  {isFetching && <Loader2 className="size-4 animate-spin" />}
                  Load more
                </Button>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                Showing all {total} applicant{total === 1 ? "" : "s"}
              </p>
            )}
          </div>
        )}
      </div>

      <FilterSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        initial={filters}
        onApply={(f) => {
          setFilters(f);
          setSelected([]);
        }}
      />

      <CampaignSwitcher
        open={switcherOpen}
        onOpenChange={setSwitcherOpen}
        currentId={campaignId}
      />
    </div>
  );
}

function Metric({
  icon: Icon,
  value,
  label,
  tone,
  active = false,
  onClick,
}: {
  icon: typeof Bookmark;
  value: string;
  label: string;
  tone: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={`Filter by ${label}`}
      className={cn(
        "flex min-h-[60px] items-center gap-2.5 rounded-lg border bg-card p-2.5 text-left shadow-sm transition-colors hover:border-primary/40",
        active && "border-primary bg-primary-soft",
      )}
    >
      <div className={cn("grid size-9 shrink-0 place-items-center rounded-full", tone)}>
        <Icon className="size-[18px]" />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-bold leading-none">{value}</p>
        <p className={cn("mt-1 truncate text-xs text-muted-foreground", active && "text-primary")}>
          {label}
        </p>
      </div>
    </button>
  );
}

function TalentCard({
  application: app,
  tone,
  selected,
  onToggle,
  onToggleShortlist,
  shortlistPending,
  campaignId,
}: {
  application: EnrichedApplication;
  tone: (typeof AVATAR_TONES)[number];
  selected: boolean;
  onToggle: () => void;
  onToggleShortlist: () => void;
  shortlistPending: boolean;
  campaignId: string;
}) {
  const name = displayNameOf(app);
  const username = usernameOf(app);
  const roles = (app.talent_profile?.professions ?? []).join(" · ") || "Talent";
  const location = locationOf(app);
  const availability = availabilityLabel(app);
  const skills = (app.talent_profile?.specialties ?? []).slice(0, 3);
  const extraSkills = Math.max((app.talent_profile?.specialties?.length ?? 0) - skills.length, 0);
  const rating = app.note?.rating;
  const match = app.match_score ?? 0;
  const photo = app.talent_profile?.profile_photo;
  const verified = app.talent_profile?.is_verified;

  return (
    <article
      className={cn(
        "grid grid-cols-[44px_84px_minmax(0,1fr)] gap-3 rounded-xl border bg-card p-3 shadow-sm transition-colors",
        selected ? "border-primary" : "hover:border-primary/30",
      )}
    >
      <div className="flex justify-center">
        <button
          type="button"
          onClick={onToggle}
          aria-label={`${selected ? "Deselect" : "Select"} ${name}`}
          aria-pressed={selected}
          className="grid size-11 place-items-center rounded-lg"
        >
          <span
            className={cn(
              "grid size-5 place-items-center rounded-md border transition-colors",
              selected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input bg-background",
            )}
          >
            {selected && <Check className="size-3.5" />}
          </span>
        </button>
      </div>

      <div className={cn("relative min-h-[128px] self-stretch overflow-hidden rounded-lg", tone)}>
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={`${name}`} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <span className="text-avatar text-3xl font-bold">{initialsOf(name)}</span>
          </div>
        )}
        <span className="absolute left-1.5 top-1.5 rounded-md bg-primary px-1.5 py-0.5 text-center text-[11px] font-bold leading-tight text-primary-foreground">
          {match}%
          <br />
          <span className="text-[9px] font-semibold">Match</span>
        </span>
      </div>

      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-1.5">
          <h2 className="truncate text-[15px] font-bold leading-snug">{name}</h2>
          {verified && (
            <span className="bg-verified grid size-4 shrink-0 place-items-center rounded-full text-[10px] text-primary-foreground">
              ✓
            </span>
          )}
        </div>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="text-rating size-3.5 shrink-0 fill-current" />
          <strong className="font-semibold text-foreground">
            {rating != null ? rating.toFixed(1) : "–"}
          </strong>
          <span aria-hidden="true">·</span>
          <span className="truncate">RootScore {match}</span>
        </p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{roles}</p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3 shrink-0" />
          <span className="truncate">{location}</span>
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium leading-none",
              availability.busy ? "bg-warning-soft text-warning" : "bg-success-soft text-success",
            )}
          >
            <span className="size-1.5 rounded-full bg-current" />
            {availability.label}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2 py-1 text-[11px] font-medium leading-none text-primary">
            <Plane className="size-3" />
            {taskLabel(app)}
          </span>
        </div>
      </div>

      {skills.length > 0 && (
        <div className="col-span-3 flex flex-wrap gap-1.5">
          {skills.map((skill) => (
            <span key={skill} className="max-w-full truncate rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground">
              {skill}
            </span>
          ))}
          {extraSkills > 0 && (
            <span className="shrink-0 rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground">
              +{extraSkills}
            </span>
          )}
        </div>
      )}

      <div className="col-span-3 grid grid-cols-[minmax(0,1fr)_repeat(4,44px)] gap-2">
        <Button
          variant="outline"
          className="h-11 min-w-0 rounded-lg border-primary px-2 text-[13px] font-semibold text-primary"
          asChild
        >
          <Link href={username ? `/talent/${username}` : "#"}>
            <span className="truncate">View Profile</span>
          </Link>
        </Button>
        <Button
          variant="secondary"
          aria-label={`Compare ${name}`}
          title={`Compare ${name}`}
          className="h-11 w-11 rounded-lg p-0 text-primary"
          asChild
        >
          <Link
            href={
              username
                ? `/recruiter/compare?${new URLSearchParams({ ids: username, from: "applications", campaign: campaignId }).toString()}`
                : "#"
            }
          >
            <BarChart3 className="size-5" />
          </Link>
        </Button>
        <CardMessageButton username={username} talentName={name} />
        <AcceptButton applicationId={app._id} accepted={app.status === "accepted"} talentName={name} />
        <Button
          variant="secondary"
          type="button"
          onClick={onToggleShortlist}
          disabled={shortlistPending}
          aria-label={`${app.is_shortlisted ? "Remove shortlist for" : "Shortlist"} ${name}`}
          aria-pressed={app.is_shortlisted}
          title={app.is_shortlisted ? "Shortlisted" : "Shortlist"}
          className={cn(
            "h-11 w-11 rounded-lg p-0",
            app.is_shortlisted
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "text-primary",
          )}
        >
          <Heart className="size-5" fill={app.is_shortlisted ? "currentColor" : "none"} />
        </Button>
      </div>
    </article>
  );
}

function CardMessageButton({
  username,
  talentName,
}: {
  username?: string;
  talentName: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const openConversation = async () => {
    if (pending) return;
    if (!username) {
      toast.error("Talent username is unavailable");
      return;
    }
    setPending(true);
    try {
      const { conversation_id } =
        await conversationsApi.startByUsername(username);
      const query = new URLSearchParams({ talent: talentName });
      router.push(`/recruiter/messages/${conversation_id}?${query.toString()}`);
    } catch {
      toast.error("Could not open conversation");
    } finally {
      setPending(false);
    }
  };

  return (
    <Button
      variant="secondary"
      type="button"
      onClick={openConversation}
      disabled={pending || !username}
      aria-label={`Message ${talentName}`}
      title={`Message ${talentName}`}
      className="h-11 w-11 rounded-lg p-0 text-primary"
    >
      {pending ? (
        <Loader2 className="size-5 animate-spin" />
      ) : (
        <MessageSquare className="size-5" />
      )}
    </Button>
  );
}

function AcceptButton({
  applicationId,
  accepted,
  talentName,
}: {
  applicationId: string;
  accepted: boolean;
  talentName: string;
}) {
  const params = useParams<{ id: string }>();
  const bulkUpdate = useBulkUpdateApplications();
  return (
    <Button
      variant="secondary"
      type="button"
      aria-label={accepted ? `${talentName} accepted` : `Accept ${talentName}`}
      title={accepted ? "Accepted" : "Accept"}
      disabled={accepted || bulkUpdate.isPending}
      onClick={() =>
        bulkUpdate.mutate(
          { campaignId: params.id, applicationIds: [applicationId], status: "accepted" },
          {
            onSuccess: () => toast.success("Applicant accepted"),
            onError: () => toast.error("Failed to accept applicant"),
          },
        )
      }
      className={cn(
        "h-11 w-11 rounded-lg p-0",
        accepted ? "text-success" : "text-primary",
      )}
    >
      {accepted ? <Check className="size-5" /> : <Send className="size-5" />}
    </Button>
  );
}
