'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Search,
  X,
  LayoutGrid,
  List,
  Loader2,
  Users,
  Filter,
  CheckSquare,
  Square,
  BookmarkCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useCampaignApplications,
  useUpdateApplicationStatus,
  useBulkUpdateApplicationStatus,
  useAddToShortlist,
  useRemoveFromShortlist,
  useUpsertApplicantNote,
  useDeleteApplicantNote,
} from '@/lib/api/hooks/useCampaignApplications';
import { useCampaign } from '@/lib/api/hooks/useCampaign';
import { getApiErrorMessage } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { CampaignApplicationCard } from '@/components/campaign-application-card';
import { CampaignApplicationRow } from '@/components/campaign-application-row';
import { ApplicationNoteSheet } from '@/components/application-note-sheet';
import { useSendAcceptanceMessage } from '@/lib/api/hooks/useCampaignTask';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'match_desc', label: 'Match score' },
  { value: 'name_asc', label: 'Name A-Z' },
  { value: 'name_desc', label: 'Name Z-A' },
];

export default function CampaignApplicationsPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [shortlisted, setShortlisted] = useState('all');
  const [sort, setSort] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [noteSheetOpen, setNoteSheetOpen] = useState(false);
  const [noteApplication, setNoteApplication] = useState<Record<string, unknown> | null>(null);
  const [toolbarStuck, setToolbarStuck] = useState(false);
  const toolbarSentinelRef = useRef<HTMLDivElement>(null);

  const {
    data: campaign,
    isLoading: isLoadingCampaign,
    error: campaignError,
  } = useCampaign(campaignId);

  const filters = useMemo(() => ({
    status: status !== 'all' ? status : undefined,
    shortlisted: shortlisted === 'true' ? 'true' : undefined,
    search: debouncedSearch || undefined,
    sort,
  }), [status, shortlisted, debouncedSearch, sort]);

  const {
    data: appsResponse,
    isLoading: isLoadingApps,
    error: appsError,
    isFetching,
  } = useCampaignApplications(campaignId, filters);

  const applications = appsResponse?.data;
  const summary = appsResponse ? {
    total: appsResponse.total,
    pending: appsResponse.pending,
    accepted: appsResponse.accepted,
    rejected: appsResponse.rejected,
    shortlisted: appsResponse.shortlisted,
  } : null;

  const updateStatus = useUpdateApplicationStatus();
  const bulkUpdateStatus = useBulkUpdateApplicationStatus();
  const addToShortlist = useAddToShortlist();
  const removeFromShortlist = useRemoveFromShortlist();
  const upsertNote = useUpsertApplicantNote();
  const deleteNote = useDeleteApplicantNote();
  const sendAcceptanceMsg = useSendAcceptanceMessage();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const sentinel = toolbarSentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setToolbarStuck(!entry.isIntersecting);
      },
      { threshold: 1, rootMargin: '-49px 0px 0px 0px' },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const handleStatusChange = async (appId: string, newStatus: string) => {
    await updateStatus.mutateAsync({ campaignId, applicationId: appId, status: newStatus });
    if (newStatus === 'accepted') {
      const app = applications?.find((a) => a._id === appId);
      const talentId = typeof app?.talent_id === 'object' && app.talent_id !== null
        ? app.talent_id._id
        : typeof app?.talent_id === 'string' ? app.talent_id : null;
      if (talentId) {
        sendAcceptanceMsg.mutate({ campaignId, talentId });
      }
    }
  };

  const handleToggleShortlist = (appId: string, isShortlisted: boolean) => {
    if (isShortlisted) {
      removeFromShortlist.mutate({ campaignId, applicationId: appId });
    } else {
      addToShortlist.mutate({ campaignId, applicationId: appId });
    }
  };

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

  const handleBulkUpdate = async (bulkStatus: string) => {
    if (selectedIds.size === 0) return;
    await bulkUpdateStatus.mutateAsync({
      campaignId,
      applicationIds: Array.from(selectedIds),
      status: bulkStatus,
    });
    setSelectedIds(new Set());
  };

  const handleOpenNote = (app: Record<string, unknown>) => {
    setNoteApplication(app);
    setNoteSheetOpen(true);
  };

  const handleSaveNote = (noteText: string, rating: number) => {
    if (!noteApplication) return;
    upsertNote.mutate(
      {
        campaignId,
        applicationId: noteApplication._id as string,
        payload: { note_text: noteText, rating: rating || undefined },
      },
      {
        onSuccess: () => {
          setNoteSheetOpen(false);
          setNoteApplication(null);
        },
      },
    );
  };

  const handleDeleteNote = () => {
    if (!noteApplication) return;
    deleteNote.mutate(
      { campaignId, applicationId: noteApplication._id as string },
      {
        onSuccess: () => {
          setNoteSheetOpen(false);
          setNoteApplication(null);
        },
      },
    );
  };

  const clearFilters = useCallback(() => {
    setSearch('');
    setDebouncedSearch('');
    setStatus('all');
    setShortlisted('all');
    setSort('newest');
  }, []);

  const hasActiveFilters = status !== 'all' || shortlisted === 'true' || !!debouncedSearch;

  const activeChips: { key: string; label: string; onRemove: () => void }[] = [];
  if (status !== 'all')
    activeChips.push({ key: 'status', label: STATUS_OPTIONS.find(o => o.value === status)?.label || status, onRemove: () => setStatus('all') });
  if (shortlisted === 'true')
    activeChips.push({ key: 'shortlisted', label: 'Shortlisted', onRemove: () => setShortlisted('all') });

  const isLoading = isLoadingCampaign;
  const error = campaignError;

  if (isLoading) {
    return (
      <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 py-6 pb-24 lg:pb-8">
        <Skeleton className="h-8 w-36 mb-2" />
        <Skeleton className="h-4 w-48 mb-6" />
        <Skeleton className="h-14 w-full rounded-2xl mb-5" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 py-6">
        <Alert variant="destructive">
          <AlertDescription>
            {getApiErrorMessage(error, 'Failed to load applications')}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 py-6 pb-24 lg:pb-8 flex flex-col gap-5">
      {/* Select mode banner */}
      {selectMode && selectedIds.size > 0 && (
        <div className="sticky top-[49px] z-40 flex items-center justify-between gap-3 rounded-2xl bg-surface-dark px-5 py-3.5 text-on-surface-dark shadow-luxe-lg">
          <span className="text-sm font-semibold">
            {selectedIds.size} application{selectedIds.size !== 1 ? 's' : ''} selected
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
              onClick={() => handleBulkUpdate('accepted')}
              disabled={bulkUpdateStatus.isPending}
            >
              Accept All
            </Button>
            <Button
              size="sm"
              className="h-9 rounded-xl text-xs bg-rose-600 text-white hover:bg-rose-700 font-semibold"
              onClick={() => handleBulkUpdate('rejected')}
              disabled={bulkUpdateStatus.isPending}
            >
              Reject All
            </Button>
          </div>
        </div>
      )}

      {/* Header + stats summary */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="w-fit -ml-2 text-ink-muted hover:text-ink group font-medium mb-1"
              onClick={() => router.push(`/recruiter/campaigns/${campaignId}`)}
            >
              <ArrowLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-0.5" strokeWidth={1.5} />
              Back to Campaign
            </Button>
            <h1 className="text-2xl font-serif font-semibold text-ink">
              {campaign?.name ?? 'Applications'}
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              Manage and review all talent applications
            </p>
          </div>
          {summary && (
            <div className="hidden sm:flex items-center gap-4">
              <div className="text-center">
                <p className="text-lg font-semibold text-ink">{summary.total}</p>
                <p className="text-2xs uppercase tracking-wider text-ink-muted">Total</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <p className="text-lg font-semibold text-amber-600">{summary.pending}</p>
                <p className="text-2xs uppercase tracking-wider text-ink-muted">Pending</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <p className="text-lg font-semibold text-emerald-600">{summary.accepted}</p>
                <p className="text-2xs uppercase tracking-wider text-ink-muted">Accepted</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <p className="text-lg font-semibold text-gold">{summary.shortlisted}</p>
                <p className="text-2xs uppercase tracking-wider text-ink-muted">Shortlisted</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sentinel for sticky detection */}
      <div ref={toolbarSentinelRef} className="h-0" />

      {/* Toolbar */}
      <div
        className={cn(
          "flex flex-col gap-3",
          toolbarStuck &&
            "sticky top-[49px] z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-background/95 backdrop-blur-sm border-b border-border/60",
        )}
      >
        {/* Search bar */}
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted pointer-events-none"
            strokeWidth={1.5}
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="search"
            placeholder="Search by name or email..."
            aria-label="Search applications"
            className="h-12 rounded-2xl border-border/60 bg-card pl-11 pr-10 text-sm shadow-luxe placeholder:text-ink-muted/60 focus-visible:ring-gold/30"
          />
          {isFetching && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-ink-muted" />
          )}
          {search && !isFetching && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-ink-muted hover:text-ink transition-colors"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          )}
        </div>

        {/* Filters row */}
        <ScrollArea className="w-full">
          <div className="flex items-center gap-2 pb-0.5">
            {/* View toggle */}
            <div className="flex items-center rounded-xl border border-border/60 bg-card p-0.5 mr-1">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200",
                  viewMode === "grid"
                    ? "bg-ink text-white shadow-sm"
                    : "text-ink-muted hover:text-ink"
                )}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-4 w-4" strokeWidth={1.5} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200",
                  viewMode === "list"
                    ? "bg-ink text-white shadow-sm"
                    : "text-ink-muted hover:text-ink"
                )}
                aria-label="List view"
              >
                <List className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="w-px h-6 bg-border/60 mx-0.5" />

            {/* Status filter */}
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-9 rounded-xl border-border/60 bg-card text-xs w-auto min-w-[120px] shadow-luxe hover:border-brand/30 transition-colors data-[state=open]:border-brand">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Shortlisted toggle */}
            <button
              onClick={() => setShortlisted(shortlisted === 'true' ? 'all' : 'true')}
              className={cn(
                "flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-medium transition-all duration-200",
                shortlisted === 'true'
                  ? "border-amber-200 bg-amber-50 text-amber-700 shadow-sm"
                  : "border-border/60 bg-card text-ink-muted hover:text-ink hover:border-border shadow-luxe"
              )}
            >
              <BookmarkCheck className="h-3.5 w-3.5" strokeWidth={1.5} />
              Shortlisted
            </button>

            {/* Sort */}
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="h-9 rounded-xl border-border/60 bg-card text-xs w-auto min-w-[120px] shadow-luxe hover:border-brand/30 transition-colors data-[state=open]:border-brand">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-9 shrink-0 rounded-xl text-xs font-medium text-ink-muted hover:text-ink hover:bg-cream-deep/60"
              >
                <X className="h-3 w-3 mr-1" strokeWidth={2} />
                Clear all
              </Button>
            )}

            <button
              onClick={toggleSelectMode}
              className={cn(
                "ml-auto flex h-9 shrink-0 items-center gap-1.5 rounded-xl border px-3 text-xs font-medium transition-all duration-200",
                selectMode
                  ? "border-ink bg-ink text-white shadow-sm"
                  : "border-border/60 bg-card text-ink-muted hover:text-ink hover:border-border shadow-luxe"
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
        </ScrollArea>

        {/* Active filter chips */}
        {activeChips.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter className="h-3 w-3 text-ink-muted mr-0.5" strokeWidth={1.5} />
            {activeChips.map((chip) => (
              <Badge
                key={chip.key}
                variant="secondary"
                className="h-7 rounded-lg gap-1.5 pl-2.5 pr-1.5 text-xs font-medium bg-gold-soft text-gold-ink border-gold/20 hover:bg-gold-soft/80 cursor-default"
              >
                {chip.label}
                <button
                  onClick={chip.onRemove}
                  className="ml-0.5 rounded-md p-0.5 hover:bg-gold/20 transition-colors"
                >
                  <X className="h-3 w-3" strokeWidth={2} />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 min-w-0">
        {isLoadingApps ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-[72px] rounded-xl" />
              ))}
            </div>
          )
        ) : appsError ? (
          <Alert variant="destructive" className="rounded-xl border-error-muted">
            <AlertDescription>
              {getApiErrorMessage(appsError, 'Failed to load applications')}
            </AlertDescription>
          </Alert>
        ) : applications && applications.length > 0 ? (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {applications.map((app) => (
                  <CampaignApplicationCard
                    key={app._id}
                    application={app}
                    onViewProfile={() => {
                      const talent = typeof app.talent_id === 'object' && app.talent_id !== null ? app.talent_id : null;
                      if (talent?.username) router.push(`/talent/${talent.username}`);
                    }}
                    onStatusChange={(s) => handleStatusChange(app._id, s)}
                    onToggleShortlist={() => handleToggleShortlist(app._id, app.is_shortlisted ?? false)}
                    onAddNote={() => handleOpenNote(app as unknown as Record<string, unknown>)}
                    selectable={selectMode}
                    isSelected={selectedIds.has(app._id)}
                    onToggleSelect={() => toggleTalentSelection(app._id)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {applications.map((app) => (
                  <CampaignApplicationRow
                    key={app._id}
                    application={app}
                    onViewProfile={() => {
                      const talent = typeof app.talent_id === 'object' && app.talent_id !== null ? app.talent_id : null;
                      if (talent?.username) router.push(`/talent/${talent.username}`);
                    }}
                    onStatusChange={(s) => handleStatusChange(app._id, s)}
                    onToggleShortlist={() => handleToggleShortlist(app._id, app.is_shortlisted ?? false)}
                    onAddNote={() => handleOpenNote(app as unknown as Record<string, unknown>)}
                    selectable={selectMode}
                    isSelected={selectedIds.has(app._id)}
                    onToggleSelect={() => toggleTalentSelection(app._id)}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-cream-pale/50 px-6 py-20 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-soft shadow-luxe">
              <Users className="h-7 w-7 text-gold-ink" strokeWidth={1.5} />
            </div>
            <p className="text-base font-semibold text-ink">
              {hasActiveFilters ? 'No applications match your filters' : 'No applications yet'}
            </p>
            <p className="mt-1.5 max-w-sm text-sm text-ink-muted leading-relaxed">
              {hasActiveFilters
                ? 'Try broadening your search by adjusting or clearing your filters.'
                : 'Applications will appear here when talents apply to your campaign.'}
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
        )}
      </div>

      {/* Note Sheet */}
      <ApplicationNoteSheet
        open={noteSheetOpen}
        onClose={() => { setNoteSheetOpen(false); setNoteApplication(null); }}
        application={noteApplication as unknown as import('@/components/campaign-application-card').EnrichedApplication | null}
        onSave={handleSaveNote}
        onDelete={handleDeleteNote}
        isSaving={upsertNote.isPending}
        isDeleting={deleteNote.isPending}
      />
    </div>
  );
}
