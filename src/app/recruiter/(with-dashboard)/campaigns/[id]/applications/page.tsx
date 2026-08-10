"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Search,
  Loader2,
  Users,
  SlidersHorizontal,
  Square,
  CheckSquare,
  X,
  Clock,
  CheckCircle2,
  BookmarkCheck,
  LayoutGrid,
  LayoutList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  useCampaignApplications,
  useUpdateApplicationStatus,
  useBulkUpdateApplicationStatus,
  useAddToShortlist,
  useRemoveFromShortlist,
  useUpsertApplicantNote,
  useDeleteApplicantNote,
} from "@/lib/api/hooks/useCampaignApplications";
import { useCampaign } from "@/lib/api/hooks/useCampaign";
import { useSendAcceptanceMessage } from "@/lib/api/hooks/useCampaignTask";
import { useReviewTaskSubmission } from "@/lib/api/hooks/useCampaignTask";
import { getApiErrorMessage } from "@/lib/formatters";
import type { EnrichedApplication } from "@/components/campaign-application-card";
import { TalentPreviewPanel } from "@/components/campaigns/TalentPreviewPanel";
import { ApplicantPipelineView } from "@/components/campaigns/ApplicantPipelineView";
import { ApplicantFiltersSidebar } from "@/components/campaigns/ApplicantFiltersSidebar";
import { BulkActionBar } from "@/components/campaigns/BulkActionBar";

const COLUMN_COLORS = {
  "column-pending": { bg: "bg-amber-50/40", color: "#f59e0b" },
  "column-shortlisted": { bg: "bg-violet-50/40", color: "#8b5cf6" },
  "column-accepted": { bg: "bg-emerald-50/40", color: "#10b981" },
  "column-rejected": { bg: "bg-rose-50/40", color: "#ef4444" },
};

type PipelineColumn = {
  id: string;
  label: string;
  color: string;
  bgColor: string;
  applications: EnrichedApplication[];
};

export default function CampaignApplicationsPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  // Core filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [shortlisted, setShortlisted] = useState("all");
  const [sort, setSort] = useState("newest");

  // Client-side filters
  const [matchMin, setMatchMin] = useState(0);
  const [hasSubmission, setHasSubmission] = useState("all");
  const [selectedProfession, setSelectedProfession] = useState("");

  // UI state
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewApp, setPreviewApp] = useState<EnrichedApplication | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Mutations
  const updateStatus = useUpdateApplicationStatus();
  const bulkUpdateStatus = useBulkUpdateApplicationStatus();
  const addToShortlist = useAddToShortlist();
  const removeFromShortlist = useRemoveFromShortlist();
  const upsertNote = useUpsertApplicantNote();
  const deleteNote = useDeleteApplicantNote();
  const sendAcceptanceMsg = useSendAcceptanceMessage();
  const reviewSubmission = useReviewTaskSubmission();

  // Data
  const {
    data: campaign,
    isLoading: isLoadingCampaign,
    error: campaignError,
  } = useCampaign(campaignId);

  const filters = useMemo(
    () => ({
      status: status !== "all" ? status : undefined,
      shortlisted: shortlisted === "true" ? "true" : undefined,
      search: debouncedSearch || undefined,
      sort,
    }),
    [status, shortlisted, debouncedSearch, sort],
  );

  const {
    data: appsResponse,
    isLoading: isLoadingApps,
    error: appsError,
    isFetching,
  } = useCampaignApplications(campaignId, filters);

  const allApplications = useMemo(() => {
    const apps = (appsResponse?.data || []) as EnrichedApplication[];
    return apps.filter((app) => {
      if (matchMin > 0 && app.match_score < matchMin) return false;
      if (hasSubmission === "true") {
        const hasSub =
          app.task_submission_status &&
          app.task_submission_status !== "assigned";
        if (!hasSub) return false;
      }
      if (selectedProfession) {
        const profs = app.talent_profile?.professions || [];
        if (!profs.includes(selectedProfession)) return false;
      }
      return true;
    });
  }, [appsResponse?.data, matchMin, hasSubmission, selectedProfession]);

  const summary = appsResponse
    ? {
        total: appsResponse.total,
        pending: appsResponse.pending,
        accepted: appsResponse.accepted,
        rejected: appsResponse.rejected,
        shortlisted: appsResponse.shortlisted,
      }
    : null;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Build pipeline columns
  const pipelineColumns = useMemo<PipelineColumn[]>(() => {
    const pending: EnrichedApplication[] = [];
    const shortlistedApps: EnrichedApplication[] = [];
    const accepted: EnrichedApplication[] = [];
    const rejected: EnrichedApplication[] = [];

    allApplications.forEach((app) => {
      if (app.is_shortlisted) {
        shortlistedApps.push(app);
      } else if (app.status === "accepted") {
        accepted.push(app);
      } else if (app.status === "rejected") {
        rejected.push(app);
      } else {
        pending.push(app);
      }
    });

    return [
      {
        id: "column-pending",
        label: "Pending",
        color: COLUMN_COLORS["column-pending"].color,
        bgColor: COLUMN_COLORS["column-pending"].bg,
        applications: pending,
      },
      {
        id: "column-shortlisted",
        label: "Shortlisted",
        color: COLUMN_COLORS["column-shortlisted"].color,
        bgColor: COLUMN_COLORS["column-shortlisted"].bg,
        applications: shortlistedApps,
      },
      {
        id: "column-accepted",
        label: "Accepted",
        color: COLUMN_COLORS["column-accepted"].color,
        bgColor: COLUMN_COLORS["column-accepted"].bg,
        applications: accepted,
      },
      {
        id: "column-rejected",
        label: "Rejected",
        color: COLUMN_COLORS["column-rejected"].color,
        bgColor: COLUMN_COLORS["column-rejected"].bg,
        applications: rejected,
      },
    ];
  }, [allApplications]);

  // Handlers
  const handleDragEnd = useCallback(
    async (appId: string, fromColumn: string, toColumn: string) => {
      const app = allApplications.find((a) => a._id === appId);
      if (!app) return;

      // Determine mutations needed
      const fromShortlisted = fromColumn === "column-shortlisted";
      const toShortlisted = toColumn === "column-shortlisted";

      try {
        // Handle shortlist changes
        if (fromShortlisted && !toShortlisted) {
          await removeFromShortlist.mutateAsync({ campaignId, applicationId: appId });
        }
        if (!fromShortlisted && toShortlisted) {
          await addToShortlist.mutateAsync({ campaignId, applicationId: appId });
        }

        // Handle status changes (only if moving between non-shortlist columns)
        if (!toShortlisted) {
          const newStatus =
            toColumn === "column-accepted"
              ? "accepted"
              : toColumn === "column-rejected"
                ? "rejected"
                : "pending";

          if (app.status !== newStatus) {
            await updateStatus.mutateAsync({
              campaignId,
              applicationId: appId,
              status: newStatus,
            });

            if (newStatus === "accepted") {
              const talentId =
                typeof app.talent_id === "object" && app.talent_id !== null
                  ? app.talent_id._id
                  : typeof app.talent_id === "string"
                    ? app.talent_id
                    : null;
              if (talentId) {
                sendAcceptanceMsg.mutate({ campaignId, talentId });
              }
            }
          }
        }
      } catch {
        // Mutation errors handled by the hook's onError
      }
    },
    [
      campaignId,
      allApplications,
      addToShortlist,
      removeFromShortlist,
      updateStatus,
      sendAcceptanceMsg,
    ],
  );

  const handleStatusChange = useCallback(
    async (appId: string, newStatus: string) => {
      await updateStatus.mutateAsync({ campaignId, applicationId: appId, status: newStatus });
      if (newStatus === "accepted") {
        const app = allApplications.find((a) => a._id === appId);
        const talentId =
          app && typeof app.talent_id === "object" && app.talent_id !== null
            ? app.talent_id._id
            : typeof app?.talent_id === "string"
              ? app.talent_id
              : null;
        if (talentId) {
          sendAcceptanceMsg.mutate({ campaignId, talentId });
        }
      }
    },
    [campaignId, allApplications, updateStatus, sendAcceptanceMsg],
  );

  const handleToggleShortlist = useCallback(
    async (appId: string) => {
      const app = allApplications.find((a) => a._id === appId);
      if (!app) return;
      if (app.is_shortlisted) {
        await removeFromShortlist.mutateAsync({ campaignId, applicationId: appId });
      } else {
        await addToShortlist.mutateAsync({ campaignId, applicationId: appId });
      }
    },
    [campaignId, allApplications, addToShortlist, removeFromShortlist],
  );

  const handleViewProfile = useCallback(
    (app: EnrichedApplication) => {
      const username = app.talent_profile?.username;
      if (!username) return;
      router.push(`/talent/${username}`);
    },
    [router],
  );

  const toggleSelectMode = useCallback(() => {
    setSelectMode((v) => !v);
    setSelectedIds(new Set());
  }, []);

  const toggleTalentSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleBulkUpdate = useCallback(
    async (bulkStatus: string) => {
      if (selectedIds.size === 0) return;
      await bulkUpdateStatus.mutateAsync({
        campaignId,
        applicationIds: Array.from(selectedIds),
        status: bulkStatus,
      });
      setSelectedIds(new Set());
    },
    [campaignId, selectedIds, bulkUpdateStatus],
  );

  const handleBulkShortlist = useCallback(async () => {
    const toShortlist = Array.from(selectedIds).filter((id) => {
      const app = allApplications.find((a) => a._id === id);
      return app && !app.is_shortlisted;
    });
    for (const appId of toShortlist) {
      await addToShortlist.mutateAsync({ campaignId, applicationId: appId });
    }
    setSelectedIds(new Set());
  }, [campaignId, selectedIds, allApplications, addToShortlist]);

  const handleNoteSave = useCallback(
    (noteText: string, rating: number) => {
      if (!previewApp) return;
      upsertNote.mutate(
        {
          campaignId,
          applicationId: previewApp._id,
          payload: { note_text: noteText, rating: rating || undefined },
        },
        {
          onSuccess: () => {
            setPreviewApp(null);
          },
        },
      );
    },
    [campaignId, previewApp, upsertNote],
  );

  const handleNoteDelete = useCallback(() => {
    if (!previewApp) return;
    deleteNote.mutate(
      { campaignId, applicationId: previewApp._id },
      {
        onSuccess: () => {
          setPreviewApp(null);
        },
      },
    );
  }, [campaignId, previewApp, deleteNote]);

  const handleReviewSubmission = useCallback(
    (notes: string, rating: number) => {
      const sub = previewApp?.task_submission;
      if (!sub) return;
      reviewSubmission.mutate(
        {
          campaignId,
          submissionId: sub._id,
          payload: { recruiter_notes: notes, recruiter_rating: rating },
        },
        {
          onSuccess: () => {},
        },
      );
    },
    [campaignId, previewApp, reviewSubmission],
  );

  const handleAcceptFromSubmission = useCallback(async () => {
    const sub = previewApp?.task_submission;
    if (!sub?.application_id || !previewApp) return;
    const talentId =
      typeof previewApp.talent_id === "object" && previewApp.talent_id !== null
        ? previewApp.talent_id._id
        : typeof previewApp.talent_id === "string"
          ? previewApp.talent_id
          : null;
    await updateStatus.mutateAsync({
      campaignId,
      applicationId: sub.application_id,
      status: "accepted",
    });
    if (talentId) {
      sendAcceptanceMsg.mutate({ campaignId, talentId });
    }
  }, [campaignId, previewApp, updateStatus, sendAcceptanceMsg]);

  const handleRejectFromSubmission = useCallback(async () => {
    const sub = previewApp?.task_submission;
    if (!sub?.application_id) return;
    await updateStatus.mutateAsync({
      campaignId,
      applicationId: sub.application_id,
      status: "rejected",
    });
  }, [campaignId, previewApp, updateStatus]);

  const clearFilters = useCallback(() => {
    setSearch("");
    setDebouncedSearch("");
    setStatus("all");
    setShortlisted("all");
    setSort("newest");
    setMatchMin(0);
    setHasSubmission("all");
    setSelectedProfession("");
  }, []);

  const hasActiveFilters =
    status !== "all" ||
    shortlisted === "true" ||
    !!debouncedSearch ||
    matchMin > 0 ||
    hasSubmission === "true" ||
    !!selectedProfession;

  const activeChips: { key: string; label: string; onRemove: () => void }[] = [];
  if (status !== "all")
    activeChips.push({
      key: "status",
      label: status.charAt(0).toUpperCase() + status.slice(1),
      onRemove: () => setStatus("all"),
    });
  if (shortlisted === "true")
    activeChips.push({ key: "shortlisted", label: "Shortlisted", onRemove: () => setShortlisted("all") });
  if (matchMin > 0)
    activeChips.push({ key: "match", label: `Match \u2265 ${matchMin}%`, onRemove: () => setMatchMin(0) });
  if (hasSubmission === "true")
    activeChips.push({ key: "submission", label: "Has submission", onRemove: () => setHasSubmission("all") });
  if (selectedProfession)
    activeChips.push({
      key: "profession",
      label: selectedProfession,
      onRemove: () => setSelectedProfession(""),
    });

  const isLoading = isLoadingCampaign;
  const error = campaignError;

  const activeFilterCount = activeChips.length;
  const bannerVisible = selectMode && selectedIds.size > 0;

  const SORT_OPTIONS = [
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
    { value: "match_desc", label: "Match score" },
    { value: "name_asc", label: "Name A–Z" },
    { value: "name_desc", label: "Name Z–A" },
  ];

  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 py-6">
        <Skeleton className="h-8 w-36 mb-2 rounded-lg" />
        <Skeleton className="h-4 w-48 mb-6 rounded-lg" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-10 w-full rounded-xl mb-6" />
        <div className="flex gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="w-[280px] h-[500px] rounded-2xl shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 py-6">
        <Alert variant="destructive" className="rounded-xl border-error-muted">
          <AlertDescription>
            {getApiErrorMessage(error, "Failed to load applications")}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <AnimatePresence>
        {bannerVisible && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="sticky top-[49px] z-40 flex items-center justify-between gap-3 rounded-2xl bg-surface-dark px-5 py-3.5 text-on-surface-dark shadow-luxe-lg mx-4 sm:mx-6 mt-4"
          >
            <span className="text-sm font-semibold">
              {selectedIds.size} application{selectedIds.size !== 1 ? "s" : ""} selected
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="h-9 rounded-xl text-xs text-white/70 hover:text-white hover:bg-white/10"
                onClick={() => setSelectedIds(new Set())}
              >
                Clear
              </Button>
              <Button
                size="sm"
                className="h-9 rounded-xl text-xs bg-emerald-600 text-white hover:bg-emerald-700 font-semibold"
                onClick={() => handleBulkUpdate("accepted")}
                disabled={bulkUpdateStatus.isPending}
              >
                Accept All
              </Button>
              <Button
                size="sm"
                className="h-9 rounded-xl text-xs bg-rose-600 text-white hover:bg-rose-700 font-semibold"
                onClick={() => handleBulkUpdate("rejected")}
                disabled={bulkUpdateStatus.isPending}
              >
                Reject All
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="shrink-0 px-4 sm:px-6 pt-6 pb-4">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit -ml-2 text-ink-muted hover:text-ink group font-medium mb-1"
          onClick={() => router.push(`/recruiter/campaigns/${campaignId}`)}
        >
          <ArrowLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-0.5" strokeWidth={1.5} />
          Back to Campaign
        </Button>
        <div className="mt-2 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-serif font-semibold text-ink">
              {campaign?.name ?? "Applications"}
            </h1>
            {allApplications.length > 0 && (
              <p className="mt-1 text-sm text-ink-muted">
                {allApplications.length} applicant{allApplications.length !== 1 ? "s" : ""}
                {pipelineColumns[1].applications.length > 0 &&
                  ` · ${pipelineColumns[1].applications.length} shortlisted`}
              </p>
            )}
          </div>
          {summary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Users, label: "Total", value: summary.total, color: "text-ink", gradient: "from-slate-500 to-slate-600" },
                { icon: Clock, label: "Pending", value: summary.pending, color: "text-amber-600", gradient: "from-amber-400 to-amber-500" },
                { icon: BookmarkCheck, label: "Shortlisted", value: summary.shortlisted, color: "text-violet-600", gradient: "from-violet-400 to-violet-500" },
                { icon: CheckCircle2, label: "Accepted", value: summary.accepted, color: "text-emerald-600", gradient: "from-emerald-400 to-emerald-500" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="relative overflow-hidden rounded-2xl bg-card border border-border/60 shadow-luxe p-4 hover:shadow-luxe-lg transition-shadow duration-300"
                >
                  <div className={cn("h-9 w-9 rounded-xl bg-gradient-to-br grid place-items-center text-white mb-2", stat.gradient)}>
                    <stat.icon className="h-4 w-4" strokeWidth={1.5} />
                  </div>
                  <p className={cn("font-serif text-2xl font-semibold", stat.color)}>
                    {stat.value}
                  </p>
                  <p className="mt-0.5 text-2xs font-semibold uppercase tracking-[0.08em] text-ink-muted">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sticky toolbar */}
      {!bannerVisible && (
        <div className="sticky top-[49px] z-30 bg-page/80 backdrop-blur-sm border-b border-border/60">
          <div className="px-4 sm:px-6 py-3">
            <div className="flex items-center gap-2.5">
              <div className="relative flex-1 max-w-xs">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-muted pointer-events-none"
                  strokeWidth={1.5}
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  type="search"
                  placeholder="Search applicants..."
                  className="w-full h-9 rounded-xl border border-border/60 bg-card pl-9 pr-8 text-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-gold/30"
                />
                {isFetching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-ink-muted" />
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-xl border-border/60 bg-card text-xs font-medium text-ink-muted hover:text-ink"
                onClick={() => setFilterSidebarOpen(true)}
              >
                <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" strokeWidth={1.5} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-1.5 h-5 min-w-5 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center px-1">
                    {activeFilterCount}
                  </span>
                )}
              </Button>

              <div className="flex h-9 rounded-xl border border-border/60 bg-card overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "flex items-center justify-center w-9 h-full transition-colors",
                    viewMode === "grid"
                      ? "bg-brand text-white"
                      : "text-ink-muted hover:text-ink",
                  )}
                >
                  <LayoutGrid className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "flex items-center justify-center w-9 h-full transition-colors",
                    viewMode === "list"
                      ? "bg-brand text-white"
                      : "text-ink-muted hover:text-ink",
                  )}
                >
                  <LayoutList className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              </div>

              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="h-9 w-[130px] rounded-xl border-border/60 bg-card text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex-1" />

              <button
                onClick={toggleSelectMode}
                className={cn(
                  "flex h-9 shrink-0 items-center gap-1.5 rounded-xl border px-3 text-xs font-medium transition-all",
                  selectMode
                    ? "border-ink bg-ink text-white shadow-sm"
                    : "border-border/60 bg-card text-ink-muted hover:text-ink hover:border-border",
                )}
              >
                {selectMode ? (
                  <>
                    <CheckSquare className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Done
                  </>
                ) : (
                  <>
                    <Square className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Select
                  </>
                )}
              </button>
            </div>

            {activeChips.length > 0 && (
              <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                {activeChips.map((chip) => (
                  <span
                    key={chip.key}
                    className="inline-flex items-center h-7 rounded-lg gap-1 pl-2.5 pr-1 text-xs font-medium bg-cream-deep/60 text-ink-soft border border-border/30"
                  >
                    {chip.label}
                    <button
                      onClick={chip.onRemove}
                      className="ml-0.5 rounded-md p-0.5 hover:bg-ink/10 transition-colors"
                    >
                      <X className="h-3 w-3" strokeWidth={2} />
                    </button>
                  </span>
                ))}
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center h-7 rounded-lg gap-1 px-2 text-xs font-medium text-ink-muted hover:text-ink hover:bg-cream-deep/80 transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pipeline */}
      <div className="flex-1 px-4 sm:px-6 py-4 min-h-0 overflow-x-auto">
        {isLoadingApps ? (
          <div className="flex gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-[280px] shrink-0">
                <Skeleton className="h-[500px] rounded-2xl" />
              </div>
            ))}
          </div>
        ) : appsError ? (
          <Alert variant="destructive" className="rounded-xl border-error-muted">
            <AlertDescription>
              {getApiErrorMessage(appsError, "Failed to load applications")}
            </AlertDescription>
          </Alert>
        ) : allApplications.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-cream-pale/50 px-6 py-20 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-soft shadow-luxe">
              <Users className="h-7 w-7 text-gold-ink" strokeWidth={1.5} />
            </div>
            <p className="text-base font-serif font-semibold text-ink">
              {hasActiveFilters ? "No applications match your filters" : "No applications yet"}
            </p>
            <p className="mt-1.5 max-w-sm text-sm text-ink-muted leading-relaxed">
              {hasActiveFilters
                ? "Try broadening your search by adjusting or clearing your filters."
                : "Applications will appear here when talents apply to your campaign."}
            </p>
            {hasActiveFilters && (
              <Button
                onClick={clearFilters}
                className="mt-5 h-10 rounded-xl bg-ink text-white hover:bg-ink-hover shadow-sm text-sm font-medium px-5"
              >
                Clear all filters
              </Button>
            )}
          </div>
        ) : (
          <ApplicantPipelineView
            columns={pipelineColumns}
            onDragEnd={handleDragEnd}
            onViewProfile={handleViewProfile}
            onViewPreview={(app) => setPreviewApp(app)}
            onStatusChange={handleStatusChange}
            onToggleShortlist={handleToggleShortlist}
            selectable={selectMode}
            selectedIds={selectedIds}
            onToggleSelect={toggleTalentSelection}
            viewMode={viewMode}
          />
        )}
      </div>

      {/* Filter Sheet */}
      <Sheet open={filterSidebarOpen} onOpenChange={setFilterSidebarOpen}>
        <SheetContent side="left" className="w-72 sm:w-80 p-0 border-r-border/60">
          <ApplicantFiltersSidebar
            open={true}
            onClose={() => setFilterSidebarOpen(false)}
            search={search}
            onSearchChange={setSearch}
            status={status}
            onStatusChange={setStatus}
            shortlisted={shortlisted}
            onShortlistedChange={setShortlisted}
            sort={sort}
            onSortChange={setSort}
            matchMin={matchMin}
            onMatchMinChange={setMatchMin}
            hasSubmission={hasSubmission}
            onHasSubmissionChange={setHasSubmission}
            selectedProfession={selectedProfession}
            onSelectedProfessionChange={setSelectedProfession}
            applications={allApplications}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
          />
        </SheetContent>
      </Sheet>

      {/* Talent Preview Sheet */}
      <Sheet
        open={!!previewApp}
        onOpenChange={(open) => {
          if (!open) setPreviewApp(null);
        }}
      >
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl p-0 border-l-border/60"
        >
          <TalentPreviewPanel
            application={previewApp}
            onClose={() => setPreviewApp(null)}
            onStatusChange={(status) => {
              if (previewApp) handleStatusChange(previewApp._id, status);
            }}
            onToggleShortlist={() => {
              if (previewApp) handleToggleShortlist(previewApp._id);
            }}
            onNoteSave={handleNoteSave}
            onNoteDelete={handleNoteDelete}
            onReviewSubmission={handleReviewSubmission}
            onAcceptFromSubmission={handleAcceptFromSubmission}
            onRejectFromSubmission={handleRejectFromSubmission}
            isSavingNote={upsertNote.isPending}
            isDeletingNote={deleteNote.isPending}
            isReviewing={reviewSubmission.isPending}
            isUpdatingStatus={updateStatus.isPending}
          />
        </SheetContent>
      </Sheet>

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedIds.size}
        onClear={() => setSelectedIds(new Set())}
        onAcceptAll={() => handleBulkUpdate("accepted")}
        onRejectAll={() => handleBulkUpdate("rejected")}
        onShortlistAll={handleBulkShortlist}
        isProcessing={bulkUpdateStatus.isPending || addToShortlist.isPending}
      />
    </div>
  );
}
