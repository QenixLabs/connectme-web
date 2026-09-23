"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  BadgeCheck,
  Check,
  Eye,
  Filter,
  Inbox,
  Loader2,
  Search,
  SearchX,
  Star,
  X,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  campaignKeys,
  useBulkUpdateApplications,
  useCampaignApplications,
  useShortlistApplication,
  useUnshortlistApplication,
} from "@/hooks/use-campaigns";
import {
  EMPTY_FILTERS,
  applyApplicantFilters,
  countActiveFilters,
  FilterSheet,
  type ApplicantFilters,
} from "@/components/campaign-applicants/filter-sheet";
import {
  campaignsApi,
  type CampaignApplicationsResponse,
  type EnrichedApplication,
} from "@/lib/api/campaigns";
import { AcceptCandidateSheet } from "@/components/campaign-detail/accept-candidate-sheet";

type StatusFilter = "all" | "pending" | "shortlisted" | "accepted" | "rejected";

const PAGE_SIZE = 20;

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

function professionLineOf(app: EnrichedApplication): string {
  const profession =
    app.talent_profile?.professions?.[0]?.trim() || "Talent";
  const city = app.talent_profile?.location?.city?.trim();
  const state = app.talent_profile?.location?.state?.trim();
  const location = [city, state].filter(Boolean).join(", ");
  return location ? `${profession} · ${location}` : profession;
}

function skillsOf(app: EnrichedApplication): string[] {
  const specialties = (app.talent_profile?.specialties ?? [])
    .map((s) => s?.trim())
    .filter(Boolean);
  if (specialties.length > 0) return specialties;
  const languages = (app.talent_profile?.languages ?? [])
    .map((l) => l?.name?.trim())
    .filter(Boolean) as string[];
  return languages;
}

function summaryOf(app: EnrichedApplication): string {
  return app.message?.trim() ?? "";
}

function appliedLabel(createdAt: string): string {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "Applied recently";
  return `Applied ${format(date, "d MMM")}`;
}

function statusOf(app: EnrichedApplication): {
  key: Exclude<StatusFilter, "all">;
  label: string;
  pill: string;
} {
  if (app.status === "rejected")
    return {
      key: "rejected",
      label: "Rejected",
      pill: "bg-alert-soft text-alert",
    };
  if (app.status === "accepted")
    return {
      key: "accepted",
      label: "Accepted",
      pill: "bg-success-soft text-success",
    };
  if (app.is_shortlisted)
    return {
      key: "shortlisted",
      label: "Shortlisted",
      pill: "bg-primary-soft text-primary",
    };
  return {
    key: "pending",
    label: "Pending Review",
    pill: "bg-warning-soft text-warning",
  };
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "–";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
}

const emptyCopy: Record<StatusFilter, { title: string; body: string }> = {
  all: {
    title: "No applications yet",
    body: "New applicants will appear here when talent applies to this campaign.",
  },
  pending: {
    title: "No pending applications",
    body: "New applicants waiting for review will appear here.",
  },
  shortlisted: {
    title: "No shortlisted applications",
    body: "Shortlist applicants to track your top picks here.",
  },
  accepted: {
    title: "No accepted applications",
    body: "Applicants you accept will appear here.",
  },
  rejected: {
    title: "No rejected applications",
    body: "Applicants you reject will appear here.",
  },
};

export function CandidatesSection({ campaignId }: { campaignId: string }) {
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<ApplicantFilters>(EMPTY_FILTERS);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [bulkShortlisting, setBulkShortlisting] = useState(false);
  // Candidate awaiting accept confirmation. The first Accept click only
  // opens the sheet; the mutation runs from "Confirm & Accept" inside it.
  const [acceptTarget, setAcceptTarget] =
    useState<EnrichedApplication | null>(null);

  const {
    data: appData,
    isLoading: queryLoading,
    isFetching,
    isError,
    refetch,
  } = useCampaignApplications(campaignId, {
    search: search.trim() || undefined,
    limit,
  });

  const bulkUpdate = useBulkUpdateApplications();
  const shortlist = useShortlistApplication();
  const unshortlist = useUnshortlistApplication();

  // Stale-while-revalidate: keep the last results on screen while a refetch
  // (search keystrokes, load more) is in flight so the layout never shifts.
  const [displayData, setDisplayData] =
    useState<CampaignApplicationsResponse | null>(null);
  const [prevAppData, setPrevAppData] =
    useState<CampaignApplicationsResponse | null | undefined>(appData);
  if (prevAppData !== appData) {
    setPrevAppData(appData);
    if (appData) setDisplayData(appData);
  }

  // The route reuses this component when switching campaigns.
  const [prevCampaignId, setPrevCampaignId] = useState(campaignId);
  if (prevCampaignId !== campaignId) {
    setPrevCampaignId(campaignId);
    setSelected([]);
    setActiveFilter("all");
    setSearch("");
    setSearchOpen(false);
    setFilters(EMPTY_FILTERS);
    setLimit(PAGE_SIZE);
    setDisplayData(null);
  }

  const applications = useMemo(() => displayData?.data ?? [], [displayData]);
  const total = displayData?.total ?? 0;

  const counts: Record<StatusFilter, number> = {
    all: displayData?.total ?? 0,
    pending: displayData?.pending ?? 0,
    shortlisted: displayData?.shortlisted ?? 0,
    accepted: displayData?.accepted ?? 0,
    rejected: displayData?.rejected ?? 0,
  };

  const chips: Array<{ key: StatusFilter; label: string }> = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "shortlisted", label: "Shortlisted" },
    { key: "accepted", label: "Accepted" },
    { key: "rejected", label: "Rejected" },
  ];

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = applications.filter((app) => {
      switch (activeFilter) {
        case "pending":
          if (app.status !== "pending") return false;
          break;
        case "shortlisted":
          if (!app.is_shortlisted) return false;
          break;
        case "accepted":
          if (app.status !== "accepted") return false;
          break;
        case "rejected":
          if (app.status !== "rejected") return false;
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
    return [...withFilters].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [applications, activeFilter, search, filters]);

  const activeFilterCount = countActiveFilters(filters);
  const selectedCount = selected.length;
  const allSelected = visible.length > 0 && selectedCount === visible.length;
  const loadedCount = displayData?.data.length ?? 0;
  const canLoadMore = loadedCount >= limit && loadedCount < total;
  const hasConstraints =
    search.trim() !== "" || activeFilter !== "all" || activeFilterCount > 0;
  const isLoading = queryLoading && !displayData;

  const clearConstraints = () => {
    setSearch("");
    setActiveFilter("all");
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

  const acceptSelected = (ids: string[]) => {
    if (ids.length === 0) return;
    bulkUpdate.mutate(
      { campaignId, applicationIds: ids, status: "accepted" },
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

  const rejectSelected = (ids: string[]) => {
    if (ids.length === 0) return;
    bulkUpdate.mutate(
      { campaignId, applicationIds: ids, status: "rejected" },
      {
        onSuccess: (data) => {
          toast.success(
            `Rejected ${data.updated} applicant${data.updated === 1 ? "" : "s"}`,
          );
          setSelected([]);
        },
        onError: () => toast.error("Failed to reject applicants"),
      },
    );
  };

  const shortlistSelected = async (ids: string[]) => {
    const targets = selectedApps.filter(
      (app) => ids.includes(app._id) && !app.is_shortlisted,
    );
    if (targets.length === 0 || bulkShortlisting) return;
    setBulkShortlisting(true);
    try {
      const results = await Promise.allSettled(
        targets.map((app) =>
          campaignsApi.shortlistApplication(campaignId, app._id),
        ),
      );
      const done = results.filter((r) => r.status === "fulfilled").length;
      if (done === 0) {
        toast.error("Failed to shortlist applicants");
      } else {
        toast.success(
          `Shortlisted ${done} applicant${done === 1 ? "" : "s"}`,
        );
        setSelected([]);
      }
      await queryClient.invalidateQueries({
        queryKey: [...campaignKeys.all, "campaign-applications", campaignId],
      });
    } finally {
      setBulkShortlisting(false);
    }
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

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="mt-1.5 h-4 w-52" />
          </div>
          <div className="flex shrink-0 gap-2">
            <Skeleton className="size-11 rounded-full" />
            <Skeleton className="size-11 rounded-full" />
          </div>
        </div>
        <div className="scrollbar-none mt-3 flex gap-2 overflow-hidden">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-28 shrink-0 rounded-full" />
          ))}
        </div>
        <div className="mt-3 space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-3"
            >
              <div className="flex gap-2.5">
                <Skeleton className="size-11 shrink-0 rounded-lg" />
                <Skeleton className="size-[88px] shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
              <Skeleton className="mt-2.5 h-11 rounded-lg" />
            </div>
          ))}
        </div>
        <p className="flex items-center justify-center gap-2 pt-5 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading applications…
        </p>
      </div>
    );
  }

  if (isError && !displayData) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-2 py-14 text-center">
        <span className="grid size-16 place-items-center rounded-full bg-muted text-muted-foreground">
          <Inbox className="size-7" />
        </span>
        <h2 className="mt-4 text-lg font-bold">Unable to load applications</h2>
        <p className="mt-1 max-w-[280px] text-sm text-muted-foreground">
          Check your connection and try again.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-5 flex h-11 items-center rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground"
        >
          Retry
        </button>
      </div>
    );
  }

  const copy = emptyCopy[activeFilter];
  const bulkBusy =
    bulkUpdate.isPending || shortlist.isPending || unshortlist.isPending;

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Compact header — no large card */}
      <header className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-bold leading-tight">
            Applications{" "}
            <span className="font-semibold text-muted-foreground">
              ({total})
            </span>
          </h2>
          <p className="truncate text-[13px] text-muted-foreground">
            Review and manage applications
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Search applicants"
            aria-expanded={searchOpen}
            aria-pressed={searchOpen}
            className={cn(
              "grid size-11 place-items-center rounded-full border transition-colors",
              searchOpen || search
                ? "border-primary bg-primary-soft text-primary"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            <Search className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            aria-label="Filter applicants"
            aria-expanded={filtersOpen}
            className={cn(
              "relative grid size-11 place-items-center rounded-full border transition-colors",
              activeFilterCount > 0
                ? "border-primary bg-primary-soft text-primary"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            <Filter className="size-5" />
            {activeFilterCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Expandable search — keeps the header compact until needed */}
      {searchOpen && (
        <div className="mt-3 flex h-12 items-center gap-1 rounded-xl border border-border bg-card pl-3 pr-1 shadow-sm transition-colors focus-within:border-primary/60">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <label htmlFor="campaign-applicant-search" className="sr-only">
            Search applicants
          </label>
          <input
            id="campaign-applicant-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, profession, or city…"
            autoFocus
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
      )}

      {/* Horizontally scrollable status filters */}
      <nav
        aria-label="Filter applications by status"
        className="scrollbar-none -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
      >
        {chips.map((chip) => {
          const active = activeFilter === chip.key;
          return (
            <button
              key={chip.key}
              type="button"
              onClick={() => {
                setActiveFilter(chip.key);
                setSelected([]);
              }}
              aria-pressed={active}
              className={cn(
                "flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-[13px] font-semibold transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {chip.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[11px] font-bold leading-none",
                  active
                    ? "bg-white/25 text-primary-foreground"
                    : "bg-card text-foreground",
                )}
              >
                {counts[chip.key]}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Minimal select-all row — not a permanent bulk card */}
      {visible.length > 0 && selectedCount === 0 && (
        <div className="mt-1 flex min-h-11 items-center justify-between gap-2">
          <p className="truncate text-xs text-muted-foreground">
            Showing {visible.length} of {total} applicant
            {total === 1 ? "" : "s"}
            {isFetching && " · Updating…"}
          </p>
          <button
            type="button"
            onClick={toggleAll}
            className="flex h-11 shrink-0 items-center rounded-lg px-2 text-xs font-bold text-primary hover:underline"
          >
            Select all
          </button>
        </div>
      )}

      {/* Results */}
      {visible.length === 0 ? (
        <section
          aria-label="No applicants"
          className="flex flex-col items-center px-6 py-14 text-center"
        >
          <span className="grid size-16 place-items-center rounded-full bg-muted text-muted-foreground">
            {hasConstraints ? (
              <SearchX className="size-7" />
            ) : (
              <Inbox className="size-7" />
            )}
          </span>
          <h3 className="mt-4 text-lg font-bold">{copy.title}</h3>
          <p className="mt-1 max-w-[280px] text-sm text-muted-foreground">
            {hasConstraints && activeFilter === "all"
              ? "No one matches this view. Try clearing your search or filters."
              : copy.body}
          </p>
          {hasConstraints && (
            <button
              type="button"
              onClick={clearConstraints}
              className="mt-5 flex h-11 items-center rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground"
            >
              Clear search & filters
            </button>
          )}
        </section>
      ) : (
        <section aria-label="Applicant results" className="mt-2 space-y-3">
          {visible.map((app) => (
            <ApplicantCard
              key={app._id}
              application={app}
              selected={selected.includes(app._id)}
              onToggle={() => toggle(app._id)}
              onToggleShortlist={() => toggleShortlist(app)}
              onAccept={() => setAcceptTarget(app)}
              onReject={() => rejectSelected([app._id])}
              actionPending={bulkBusy}
            />
          ))}
        </section>
      )}

      {/* Paged loading — the endpoint takes `limit` but no offset */}
      {total > 0 && visible.length > 0 && (
        <div className="mt-4 text-center">
          {canLoadMore ? (
            <>
              <p className="text-xs text-muted-foreground">
                Showing {loadedCount} of {total} applicants
              </p>
              <button
                type="button"
                onClick={() => setLimit((l) => l + PAGE_SIZE)}
                disabled={isFetching}
                className="mt-2 inline-flex h-11 items-center gap-2 rounded-xl border border-primary px-6 text-sm font-bold text-primary disabled:opacity-50"
              >
                {isFetching && <Loader2 className="size-4 animate-spin" />}
                Load more
              </button>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">
              Showing {visible.length} of {total} applicant
              {total === 1 ? "" : "s"}
            </p>
          )}
        </div>
      )}

      {/* Compact sticky bulk-action bar — only while selecting */}
      {selectedCount > 0 && (
        <div
          aria-label="Bulk actions"
          className="sticky bottom-24 z-30 mt-3 flex items-center gap-1.5 overflow-x-auto rounded-xl border border-border bg-card p-2 shadow-lg scrollbar-none"
        >
          <span className="shrink-0 whitespace-nowrap rounded-lg bg-primary-soft px-3 py-2.5 text-[13px] font-bold text-primary">
            {selectedCount} selected
          </span>
          {!allSelected && (
            <button
              type="button"
              onClick={toggleAll}
              className="h-11 shrink-0 whitespace-nowrap rounded-lg px-3 text-xs font-bold text-primary hover:bg-muted"
            >
              Select all
            </button>
          )}
          <button
            type="button"
            onClick={() => shortlistSelected(selected)}
            disabled={bulkShortlisting || bulkBusy}
            className="flex h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-xs font-bold text-primary hover:bg-muted disabled:opacity-50"
          >
            {bulkShortlisting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Star className="size-4" />
            )}
            Shortlist
          </button>
          <button
            type="button"
            onClick={() => acceptSelected(selected)}
            disabled={bulkUpdate.isPending}
            className="flex h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-xs font-bold text-primary hover:bg-muted disabled:opacity-50"
          >
            <Check className="size-4" />
            Accept
          </button>
          <button
            type="button"
            onClick={() => rejectSelected(selected)}
            disabled={bulkUpdate.isPending}
            className="flex h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-xs font-bold text-destructive hover:bg-muted disabled:opacity-50"
          >
            <X className="size-4" />
            Reject
          </button>
          <button
            type="button"
            onClick={() => setSelected([])}
            aria-label="Clear selection"
            className="grid size-11 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      <FilterSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        initial={filters}
        onApply={(f) => {
          setFilters(f);
          setSelected([]);
        }}
      />

      <AcceptCandidateSheet
        open={acceptTarget !== null}
        onOpenChange={(next) => {
          if (!next) setAcceptTarget(null);
        }}
        campaignId={campaignId}
        application={acceptTarget}
        onAccepted={() => setSelected([])}
      />
    </div>
  );
}

function ApplicantCard({
  application: app,
  selected,
  onToggle,
  onToggleShortlist,
  onAccept,
  onReject,
  actionPending,
}: {
  application: EnrichedApplication;
  selected: boolean;
  onToggle: () => void;
  onToggleShortlist: () => void;
  onAccept: () => void;
  onReject: () => void;
  actionPending: boolean;
}) {
  const name = displayNameOf(app);
  const username = usernameOf(app);
  const professionLine = professionLineOf(app);
  const skills = skillsOf(app);
  const summary = summaryOf(app);
  const match = app.match_score ?? 0;
  const photo = app.talent_profile?.profile_photo;
  const verified = app.talent_profile?.is_verified;
  const status = statusOf(app);
  const visibleSkills = skills.slice(0, 3);
  const remainingSkills = Math.max(0, skills.length - visibleSkills.length);

  return (
    <article
      className={cn(
        "rounded-2xl border border-border/60 bg-card p-3.5 shadow-sm transition-colors sm:p-4",
        selected ? "border-primary" : "hover:border-primary/30",
      )}
    >
      <div className="flex gap-3">
        <div className="relative size-[92px] shrink-0 overflow-hidden rounded-xl bg-muted sm:size-[96px]">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo}
              alt={name}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <span className="absolute inset-0 grid place-items-center text-2xl font-bold text-muted-foreground">
              {initialsOf(name)}
            </span>
          )}
          <button
            type="button"
            onClick={onToggle}
            aria-label={`${selected ? "Deselect" : "Select"} ${name}`}
            aria-pressed={selected}
            className="absolute left-2 top-2 z-10 grid size-6 place-items-center rounded-md bg-white/90 shadow-sm ring-1 ring-black/10 backdrop-blur-sm dark:bg-background/90"
          >
            <span
              className={cn(
                "grid size-4 place-items-center rounded-[4px] border transition-colors",
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-background/80",
              )}
            >
              {selected && <Check className="size-3" />}
            </span>
          </button>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-1">
              <h3 className="truncate text-base font-semibold leading-snug text-foreground">
                {name}
              </h3>
              {verified && (
                <BadgeCheck
                  aria-label="Verified talent"
                  className="size-4 shrink-0 text-primary"
                />
              )}
            </div>
            <span className="inline-flex shrink-0 items-center whitespace-nowrap rounded-full bg-primary-soft px-2 py-1 text-[11px] font-bold leading-none text-primary">
              {match}% Match
            </span>
          </div>

          <p className="mt-1 truncate text-[13px] text-muted-foreground">
            {professionLine}
          </p>

          <div className="mt-1.5 flex min-w-0 items-center gap-1.5 truncate text-xs text-muted-foreground">
            <span className="truncate">
              {appliedLabel(app.created_at)}
            </span>
            <span aria-hidden="true">·</span>
            {app.is_shortlisted ? (
              <span className="inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap font-semibold text-primary">
                <Star className="size-3" fill="currentColor" />
                Shortlisted
              </span>
            ) : (
              <span
                className={cn(
                  "truncate whitespace-nowrap",
                  status.key === "accepted" && "text-success",
                  status.key === "rejected" && "text-alert",
                )}
              >
                {status.label}
              </span>
            )}
          </div>
        </div>
      </div>

      {summary && (
        <div className="mt-2.5 min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Message
          </p>
          <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-foreground">
            {summary}
          </p>
        </div>
      )}

      {skills.length > 0 && (
        <div className="mt-2.5 flex min-w-0 flex-nowrap gap-1.5 overflow-hidden">
          {visibleSkills.map((skill) => (
            <span
              key={skill}
              className="min-w-0 truncate rounded-lg bg-primary-soft px-2.5 py-1 text-xs font-medium text-muted-foreground"
            >
              {skill}
            </span>
          ))}
          {remainingSkills > 0 && (
            <span className="shrink-0 rounded-lg bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              +{remainingSkills}
            </span>
          )}
        </div>
      )}

      <div className="mt-2.5 grid grid-cols-4 gap-2">
        {username ? (
          <Link
            href={`/talent/${username}`}
            aria-label={`Review ${name}`}
            className="flex h-10 min-w-0 items-center justify-center gap-1 rounded-lg border border-primary/30 px-1.5 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/5 sm:h-11 sm:px-2 sm:text-xs"
          >
            <Eye className="size-4 shrink-0" />
            <span className="truncate max-[359px]:hidden">Review</span>
          </Link>
        ) : (
          <button
            type="button"
            disabled
            aria-label={`Review ${name}`}
            className="flex h-10 min-w-0 cursor-not-allowed items-center justify-center gap-1 rounded-lg border border-border px-1.5 text-[11px] font-semibold text-muted-foreground opacity-50 sm:h-11 sm:px-2 sm:text-xs"
          >
            <Eye className="size-4 shrink-0" />
            <span className="truncate max-[359px]:hidden">Review</span>
          </button>
        )}
        <button
          type="button"
          onClick={onToggleShortlist}
          disabled={actionPending}
          aria-label={`${app.is_shortlisted ? "Shortlisted — remove shortlist for" : "Shortlist"} ${name}`}
          aria-pressed={app.is_shortlisted}
          title={app.is_shortlisted ? "Shortlisted" : "Shortlist"}
          className={cn(
            "flex h-10 min-w-0 items-center justify-center gap-1 rounded-lg border px-1.5 text-[11px] font-semibold transition-colors disabled:opacity-50 sm:h-11 sm:px-2 sm:text-xs",
            app.is_shortlisted
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border text-foreground hover:border-primary/40 hover:text-primary",
          )}
        >
          <Star
            className="size-4 shrink-0"
            fill={app.is_shortlisted ? "currentColor" : "none"}
          />
          <span className="hidden truncate min-[420px]:inline">
            {app.is_shortlisted ? "Shortlisted" : "Shortlist"}
          </span>
          <span className="truncate min-[420px]:hidden max-[359px]:hidden">
            Shortlist
          </span>
        </button>
        <button
          type="button"
          onClick={onAccept}
          disabled={actionPending || app.status === "accepted"}
          aria-label={`Accept ${name}`}
          title="Accept"
          className={cn(
            "flex h-10 min-w-0 items-center justify-center gap-1 rounded-lg border px-1.5 text-[11px] font-semibold transition-colors disabled:opacity-50 sm:h-11 sm:px-2 sm:text-xs",
            app.status === "accepted"
              ? "border-transparent bg-success-soft text-success"
              : "border-border text-foreground hover:border-success/50 hover:text-success",
          )}
        >
          <Check className="size-4 shrink-0" />
          <span className="truncate max-[359px]:hidden">Accept</span>
        </button>
        <button
          type="button"
          onClick={onReject}
          disabled={actionPending || app.status === "rejected"}
          aria-label={`Reject ${name}`}
          title="Reject"
          className={cn(
            "flex h-10 min-w-0 items-center justify-center gap-1 rounded-lg border px-1.5 text-[11px] font-semibold transition-colors disabled:opacity-50 sm:h-11 sm:px-2 sm:text-xs",
            app.status === "rejected"
              ? "border-transparent bg-alert-soft text-alert"
              : "border-border text-muted-foreground hover:border-destructive/50 hover:text-destructive",
          )}
        >
          <X className="size-4 shrink-0" />
          <span className="truncate max-[359px]:hidden">Reject</span>
        </button>
      </div>
    </article>
  );
}
