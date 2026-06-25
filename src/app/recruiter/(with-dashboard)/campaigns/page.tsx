"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useInView } from "react-intersection-observer";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  MapPin,
  Users,
  Calendar,
  Play,
  Pencil,
  Copy,
  FileText,
  Trash2,
  RotateCcw,
  MoreHorizontal,
  Search,
  Sparkles,
  Film,
  Megaphone,
  Tv,
  Palette,
  Theater,
  Music,
  X,
  Briefcase,
  TrendingUp,
  FileEdit,
  SlidersHorizontal,
  ArrowUpRight,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Campaign } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import {
  useCampaigns,
  useDeleteCampaign,
  usePublishCampaign,
  useCloseCampaign,
  useReopenCampaign,
  useCloneCampaign,
} from "@/lib/api/hooks/useCampaigns";
import { useSaveCampaignTemplate } from "@/lib/api/hooks/useCampaignTemplates";
import { useTierGuard } from "@/hooks/use-tier-guard";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type StatusFilter = "all" | "draft" | "active" | "closed";

const STATUS_CONFIG = {
  draft: {
    label: "Draft",
    icon: FileEdit,
    cardBg: "bg-amber-50/80",
    cardBorder: "border-amber-200/60",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
  },
  active: {
    label: "Active",
    icon: TrendingUp,
    cardBg: "bg-emerald-50/60",
    cardBorder: "border-emerald-200/60",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  closed: {
    label: "Closed",
    icon: CheckCircle2,
    cardBg: "bg-slate-50/80",
    cardBorder: "border-slate-200/60",
    badge: "bg-slate-100 text-slate-600 border-slate-200",
  },
};

const INDUSTRY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  film: Film,
  tv: Tv,
  commercial: Megaphone,
  modeling: Palette,
  theater: Theater,
  music: Music,
};

const INDUSTRY_BG: Record<string, string> = {
  film: "bg-violet-100 text-violet-700",
  tv: "bg-sky-100 text-sky-700",
  commercial: "bg-rose-100 text-rose-700",
  modeling: "bg-teal-100 text-teal-700",
  theater: "bg-fuchsia-100 text-fuchsia-700",
  music: "bg-indigo-100 text-indigo-700",
};

const INDUSTRY_GRADIENTS: Record<string, string> = {
  film: "from-violet-600 via-purple-700 to-indigo-800",
  tv: "from-sky-600 via-blue-700 to-indigo-800",
  commercial: "from-rose-600 via-pink-700 to-fuchsia-800",
  modeling: "from-teal-600 via-emerald-700 to-green-800",
  theater: "from-fuchsia-600 via-purple-700 to-violet-800",
  music: "from-indigo-600 via-violet-700 to-purple-800",
};

const ROLE_COLORS: Record<string, string> = {
  "lead": "bg-amber-50 text-amber-700 border-amber-200",
  "supporting": "bg-blue-50 text-blue-700 border-blue-200",
  "background / extra": "bg-slate-50 text-slate-600 border-slate-200",
  "voice over": "bg-purple-50 text-purple-700 border-purple-200",
  "model": "bg-pink-50 text-pink-700 border-pink-200",
  "dancer": "bg-orange-50 text-orange-700 border-orange-200",
  "musician": "bg-cyan-50 text-cyan-700 border-cyan-200",
  "anchor / host": "bg-lime-50 text-lime-700 border-lime-200",
};

const INDUSTRY_FILTERS = [
  { key: "film", label: "Film", icon: Film },
  { key: "tv", label: "TV", icon: Tv },
  { key: "commercial", label: "Commercial", icon: Megaphone },
  { key: "modeling", label: "Modeling", icon: Palette },
  { key: "theater", label: "Theater", icon: Theater },
  { key: "music", label: "Music", icon: Music },
] as const;

function getTagClass(value?: string): string {
  if (!value) return "bg-slate-50 text-slate-600 border-slate-200";
  const key = value.toLowerCase();
  for (const [k, v] of Object.entries(ROLE_COLORS)) {
    if (key.includes(k)) return v;
  }
  return "bg-slate-50 text-slate-600 border-slate-200";
}

function getIndustryGradient(industry?: string): string {
  if (!industry) return "from-slate-700 to-slate-900";
  const key = industry.toLowerCase();
  for (const [k, v] of Object.entries(INDUSTRY_GRADIENTS)) {
    if (key.includes(k)) return v;
  }
  return "from-slate-700 to-slate-900";
}

function getIndustryIcon(industry?: string) {
  if (!industry) return Film;
  const key = industry.toLowerCase();
  for (const [k, v] of Object.entries(INDUSTRY_ICONS)) {
    if (key.includes(k)) return v;
  }
  return Film;
}

function getIndustryBg(industry?: string): string {
  if (!industry) return "bg-slate-100 text-slate-700";
  const key = industry.toLowerCase();
  for (const [k, v] of Object.entries(INDUSTRY_BG)) {
    if (key.includes(k)) return v;
  }
  return "bg-slate-100 text-slate-700";
}

function formatDateRange(dates?: { start?: string; end?: string }) {
  if (!dates?.start && !dates?.end) return null;
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const start = dates.start
    ? new Date(dates.start).toLocaleDateString("en-US", opts)
    : "";
  const end = dates.end
    ? new Date(dates.end).toLocaleDateString("en-US", opts)
    : "";
  if (start && end) return `${start} \u2013 ${end}`;
  return start || end;
}

import type { LucideIcon } from "lucide-react";

const STATUS_PILLS: Array<{ label: string; value: StatusFilter; icon: LucideIcon }> = [
  { label: "All", value: "all", icon: SlidersHorizontal },
  { label: "Active", value: "active", icon: TrendingUp },
  { label: "Draft", value: "draft", icon: FileEdit },
  { label: "Closed", value: "closed", icon: CheckCircle2 },
];

export default function RecruiterCampaignsPage() {
  const router = useRouter();
  const { guard } = useTierGuard(3);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState<string | null>(null);
  const [toolbarStuck, setToolbarStuck] = useState(false);
  const toolbarSentinelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { ref: sentinelRef, inView } = useInView({ threshold: 0 });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useCampaigns({
    status: statusFilter === "all" ? undefined : statusFilter,
    search: search || undefined,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const sentinel = toolbarSentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setToolbarStuck(!entry.isIntersecting);
      },
      { threshold: 1, rootMargin: "-49px 0px 0px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const allCampaigns = useMemo(
    () => (data ? data.pages.flatMap((p) => p.data) : []),
    [data],
  );

  const filteredCampaigns = useMemo(() => {
    if (!industryFilter) return allCampaigns;
    return allCampaigns.filter((c) =>
      c.industry?.toLowerCase().includes(industryFilter),
    );
  }, [allCampaigns, industryFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of allCampaigns) {
      counts[c.status] = (counts[c.status] ?? 0) + 1;
    }
    return counts;
  }, [allCampaigns]);

  const totalApplications = useMemo(
    () => allCampaigns.reduce((sum, c) => sum + (c.applications_count ?? 0), 0),
    [allCampaigns],
  );

  const activeCount = statusCounts.active ?? 0;
  const draftCount = statusCounts.draft ?? 0;
  const closedCount = statusCounts.closed ?? 0;
  const totalCount = (data?.pages?.[0] as Record<string, unknown>)?.total as number ?? allCampaigns.length;

  if (isLoading) {
    return (
      <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 py-8 pb-24 lg:pb-12 space-y-8">
        <div className="flex items-end justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-40 rounded-lg" />
            <Skeleton className="h-5 w-64 rounded-md" />
          </div>
          <Skeleton className="h-11 w-44 rounded-xl" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[100px] rounded-2xl" />
          ))}
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-24 rounded-xl" />
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[280px] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 py-8">
        <Alert variant="destructive" className="rounded-xl border-error-muted">
          <AlertDescription>
            {getApiErrorMessage(error, "Failed to load campaigns")}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 py-8 lg:pb-12 flex flex-col gap-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
      >
        <div>
          <h1 className="text-[28px] font-serif font-semibold text-ink tracking-tight leading-tight">
            Campaigns
          </h1>
          <p className="mt-1.5 text-[15px] text-ink-muted leading-relaxed">
            Create and manage casting calls, track applications, and build your talent shortlist.
          </p>
        </div>
        <Button
          onClick={() => guard(() => router.push("/recruiter/campaigns/new"))}
          className="h-11 rounded-xl bg-gradient-to-br from-gold to-gold-hover text-white hover:from-gold-bright hover:to-gold shadow-[0_4px_14px_-4px_oklch(0.74_0.13_80/0.45)] text-sm font-semibold px-5 transition-all active:scale-[0.98] self-start sm:self-auto"
        >
          <Plus className="h-4 w-4 mr-1.5" strokeWidth={2} />
          New Campaign
        </Button>
      </motion.div>

      {allCampaigns.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.06, ease: "easeOut" }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <StatCard
            label="Total"
            value={totalCount}
            icon={Briefcase}
            color="slate"
          />
          <StatCard
            label="Active"
            value={activeCount}
            icon={TrendingUp}
            color="emerald"
          />
          <StatCard
            label="Drafts"
            value={draftCount}
            icon={FileEdit}
            color="amber"
          />
          <StatCard
            label="Applications"
            value={totalApplications}
            icon={Users}
            color="blue"
          />
        </motion.div>
      )}

      <div ref={toolbarSentinelRef} className="h-0" />

      <div
        className={cn(
          "flex flex-col gap-3",
          toolbarStuck &&
            "sticky top-[49px] z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 bg-background/95 backdrop-blur-md border-b border-border/60",
        )}
      >
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="relative flex-1 sm:max-w-[360px]">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted pointer-events-none"
              strokeWidth={1.5}
            />
            <Input
              ref={searchInputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="search"
              placeholder="Search by name, role, or location..."
              className="h-11 rounded-xl border-border/60 bg-card pl-10 pr-10 text-sm shadow-luxe placeholder:text-ink-muted/60 focus-visible:ring-gold/30"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-ink-muted hover:text-ink transition-colors"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            )}
          </div>

          <div className="flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {STATUS_PILLS.map((p) => {
              const isActive = statusFilter === p.value;
              const Icon = p.icon;
              return (
                <button
                  key={p.value}
                  onClick={() => setStatusFilter(p.value)}
                  className={cn(
                    "shrink-0 rounded-xl px-4 py-2.5 text-xs font-semibold border transition-all duration-200 flex items-center gap-1.5",
                    isActive
                      ? "bg-ink text-white border-ink shadow-sm"
                      : "bg-card text-ink-muted border-border/60 shadow-luxe hover:border-border hover:text-ink",
                  )}
                >
                  <Icon className="h-3 w-3" strokeWidth={1.5} />
                  {p.label}
                  {p.value === "all" && totalCount > 0 && (
                    <span
                      className={cn(
                        "ml-1 text-[10px] px-1.5 py-0.5 rounded-md",
                        isActive ? "bg-white/15" : "bg-muted-bg",
                      )}
                    >
                      {totalCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          <button
            onClick={() => setIndustryFilter(null)}
            className={cn(
              "shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-semibold border transition-all duration-200 flex items-center gap-1.5",
              !industryFilter
                ? "bg-ink text-white border-ink shadow-sm"
                : "bg-card text-ink-muted border-border/60 shadow-luxe hover:border-border hover:text-ink",
            )}
          >
            All Industries
          </button>
          {INDUSTRY_FILTERS.map((item) => {
            const Icon = item.icon;
            const isActive = industryFilter === item.key;
            return (
              <button
                key={item.key}
                onClick={() =>
                  setIndustryFilter(
                    industryFilter === item.key ? null : item.key,
                  )
                }
                className={cn(
                  "shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-semibold border transition-all duration-200 flex items-center gap-1.5",
                  isActive
                    ? "bg-ink text-white border-ink shadow-sm"
                    : "bg-card text-ink-muted border-border/60 shadow-luxe hover:border-border hover:text-ink",
                )}
              >
                <Icon className="h-3 w-3" strokeWidth={1.5} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {filteredCampaigns.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <EmptyState
              statusFilter={statusFilter}
              search={search}
              industryFilter={industryFilter}
              onClearSearch={() => setSearch("")}
              onClearIndustry={() => setIndustryFilter(null)}
              onCreateCampaign={() =>
                guard(() => router.push("/recruiter/campaigns/new"))
              }
            />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {filteredCampaigns.map((campaign, idx) => (
              <CampaignCard
                key={campaign._id}
                campaign={campaign}
                guard={guard}
                index={idx}
              />
            ))}

            <div ref={sentinelRef} className="py-6">
              {isFetchingNextPage && (
                <div className="space-y-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className="h-[280px] rounded-2xl" />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  STAT CARD                                                         */
/* ------------------------------------------------------------------ */

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  color: "slate" | "emerald" | "amber" | "blue";
}) {
  const gradients: Record<string, string> = {
    slate: "from-slate-500 to-slate-600",
    emerald: "from-emerald-500 to-emerald-600",
    amber: "from-amber-500 to-amber-600",
    blue: "from-blue-500 to-blue-600",
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-card border border-border/60 shadow-luxe p-5 hover:shadow-luxe-lg transition-shadow duration-300">
      <div className="flex items-center justify-between mb-3">
        <div
          className={cn(
            "h-10 w-10 rounded-xl bg-gradient-to-br grid place-items-center text-white",
            gradients[color],
          )}
        >
          <Icon className="h-4 w-4" strokeWidth={1.5} />
        </div>
      </div>
      <p className="font-serif text-[28px] font-semibold text-ink leading-none tracking-tight">
        {value.toLocaleString()}
      </p>
      <p className="mt-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
        {label}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  EMPTY STATE                                                       */
/* ------------------------------------------------------------------ */

function EmptyState({
  statusFilter,
  search,
  industryFilter,
  onClearSearch,
  onClearIndustry,
  onCreateCampaign,
}: {
  statusFilter: StatusFilter;
  search: string;
  industryFilter: string | null;
  onClearSearch: () => void;
  onClearIndustry: () => void;
  onCreateCampaign: () => void;
}) {
  const isDefault = statusFilter === "all" && !search && !industryFilter;

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted-bg/40 px-6 py-28 text-center">
      <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[28px] bg-gradient-to-br from-gold-soft to-cream-deep shadow-luxe">
        {isDefault ? (
          <Sparkles className="h-10 w-10 text-gold-ink" strokeWidth={1.5} />
        ) : (
          <Search className="h-10 w-10 text-gold-ink" strokeWidth={1.5} />
        )}
      </div>
      <p className="text-xl font-serif font-semibold text-ink">
        {isDefault ? "No campaigns yet" : "No campaigns found"}
      </p>
      <p className="mt-2.5 max-w-md text-[15px] text-ink-muted leading-relaxed">
        {isDefault
          ? "Create your first casting call to start receiving applications from talented professionals across the industry."
          : "Try adjusting your filters or search term to find what you're looking for."}
      </p>
      <div className="mt-8 flex gap-3 flex-wrap justify-center">
        {(search || industryFilter) && (
          <>
            {search && (
              <Button
                variant="outline"
                onClick={onClearSearch}
                className="h-10 rounded-xl border-border/60 text-sm font-medium"
              >
                Clear search
              </Button>
            )}
            {industryFilter && (
              <Button
                variant="outline"
                onClick={onClearIndustry}
                className="h-10 rounded-xl border-border/60 text-sm font-medium"
              >
                Clear industry
              </Button>
            )}
          </>
        )}
        {isDefault && (
          <Button
            onClick={onCreateCampaign}
            className="h-11 rounded-xl bg-gradient-to-br from-gold to-gold-hover text-white hover:from-gold-bright hover:to-gold shadow-[0_4px_14px_-4px_oklch(0.74_0.13_80/0.45)] text-sm font-semibold px-6"
          >
            <Plus className="h-4 w-4 mr-1.5" strokeWidth={2} />
            Create Campaign
          </Button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CAMPAIGN BANNER                                                   */
/* ------------------------------------------------------------------ */

function CampaignBanner({ campaign }: { campaign: Campaign }) {
  const gradient = getIndustryGradient(campaign.industry);
  const IndustryIcon = getIndustryIcon(campaign.industry);

  const hasMedia =
    campaign.banner?.type === "image" || campaign.cover_image_url;
  const imageUrl =
    campaign.banner?.type === "image"
      ? campaign.banner.url
      : campaign.cover_image_url;

  return (
    <div className="relative h-[220px] w-full overflow-hidden group/banner">
      {hasMedia ? (
        <>
          <img
            src={imageUrl}
            alt={campaign.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover/banner:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </>
      ) : (
        <div className={cn("absolute inset-0 bg-gradient-to-br", gradient)}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.10),_transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(255,255,255,0.08),_transparent_50%)]" />

          <div className="absolute bottom-8 right-6 opacity-[0.08] group-hover/banner:opacity-[0.12] transition-opacity duration-500">
            <IndustryIcon className="h-40 w-40 text-white" strokeWidth={0.5} />
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-white/20 via-white/40 to-white/20" />
        </div>
      )}

      <div className="absolute bottom-6 left-6 right-6">
        <h3 className="text-xl font-serif font-semibold leading-tight text-white tracking-tight line-clamp-2">
          {campaign.name}
        </h3>
        {[campaign.location?.city, campaign.location?.state]
          .filter((s): s is string => !!s && s.trim() !== "")
          .join(", ") && (
          <div className="mt-2 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-white/50" strokeWidth={1.5} />
            <p className="text-sm text-white/60 font-medium">
              {[campaign.location?.city, campaign.location?.state]
                .filter((s): s is string => !!s && s.trim() !== "")
                .join(", ")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CAMPAIGN CARD                                                     */
/* ------------------------------------------------------------------ */

function CampaignCard({
  campaign,
  guard,
  index,
}: {
  campaign: Campaign;
  guard: (action: () => void) => void;
  index: number;
}) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const dateRange = formatDateRange(campaign.dates);

  const deleteCampaign = useDeleteCampaign();
  const publishCampaign = usePublishCampaign();
  const closeCampaign = useCloseCampaign();
  const reopenCampaign = useReopenCampaign();
  const cloneCampaign = useCloneCampaign();
  const saveTemplate = useSaveCampaignTemplate();

  const statusCfg = STATUS_CONFIG[campaign.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.draft;
  const StatusIcon = statusCfg.icon;
  const tags = [campaign.industry, campaign.role_type].filter(Boolean);

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          delay: 0.04 + index * 0.05,
          ease: "easeOut",
        }}
        className={cn(
          "group overflow-hidden rounded-2xl border shadow-luxe transition-all duration-300 hover:shadow-luxe-lg hover:-translate-y-0.5",
          statusCfg.cardBorder,
          statusCfg.cardBg,
        )}
      >
        <div
          className="cursor-pointer"
          onClick={() => router.push(`/recruiter/campaigns/${campaign._id}`)}
        >
          <CampaignBanner campaign={campaign} />
        </div>

        <div className="px-6 py-5 space-y-4 bg-card">
          <div className="flex items-center gap-4 text-sm text-ink-muted">
            <span className="flex items-center gap-1.5 font-medium">
              <Users
                className="h-4 w-4 text-ink-muted/60"
                strokeWidth={1.5}
              />
              {campaign.applications_count}{" "}
              <span className="hidden sm:inline">applications</span>
            </span>
            {dateRange && (
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar
                  className="h-4 w-4 text-ink-muted/60"
                  strokeWidth={1.5}
                />
                {dateRange}
              </span>
            )}
            <Badge
              className={cn(
                "rounded-full text-[10px] font-semibold px-2.5 py-0.5 border ml-auto",
                statusCfg.badge,
              )}
            >
              <StatusIcon className="h-3 w-3 mr-1" strokeWidth={1.5} />
              {statusCfg.label}
            </Badge>
          </div>

          {tags.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className={cn(
                    "rounded-full text-[10px] font-semibold px-2.5 py-0.5 border",
                    getTagClass(tag),
                  )}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center border-t border-border/60 px-4 py-2.5 bg-card">
          {campaign.status === "draft" && (
            <PrimaryAction
              icon={<Play className="h-3.5 w-3.5" strokeWidth={1.5} />}
              label="Publish"
              onClick={() => guard(() => publishCampaign.mutate(campaign._id))}
            />
          )}
          {campaign.status === "active" && (
            <PrimaryAction
              icon={<XCircle className="h-3.5 w-3.5" strokeWidth={1.5} />}
              label="Close"
              onClick={() => guard(() => closeCampaign.mutate(campaign._id))}
            />
          )}
          {campaign.status === "closed" && (
            <PrimaryAction
              icon={<RotateCcw className="h-3.5 w-3.5" strokeWidth={1.5} />}
              label="Reopen"
              onClick={() =>
                guard(() => reopenCampaign.mutate(campaign._id))
              }
            />
          )}

          <SecondaryAction
            icon={<Eye className="h-3.5 w-3.5" strokeWidth={1.5} />}
            label="View"
            onClick={() =>
              router.push(`/recruiter/campaigns/${campaign._id}`)
            }
          />

          <div className="ml-auto flex items-center gap-0.5">
            <ActionButton
              icon={<Pencil className="h-4 w-4" strokeWidth={1.5} />}
              label="Edit"
              onClick={() =>
                guard(() =>
                  router.push(`/recruiter/campaigns/${campaign._id}/edit`),
                )
              }
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex h-9 w-9 items-center justify-center text-ink-muted hover:text-ink transition-colors rounded-lg hover:bg-cream-soft"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl p-1.5">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    guard(() => cloneCampaign.mutate(campaign._id));
                  }}
                  className="rounded-lg text-sm py-2.5"
                >
                  <Copy className="h-4 w-4 mr-2.5" strokeWidth={1.5} />
                  Clone
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    guard(() => {
                      setTemplateName(campaign.name);
                      setSaveTemplateOpen(true);
                    });
                  }}
                  className="rounded-lg text-sm py-2.5"
                >
                  <FileText className="h-4 w-4 mr-2.5" strokeWidth={1.5} />
                  Save as Template
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    guard(() => setDeleteOpen(true));
                  }}
                  className="rounded-lg text-sm py-2.5 text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2.5" strokeWidth={1.5} />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.article>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl gap-0">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-lg font-serif">
              Delete Campaign
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Are you sure you want to delete &quot;{campaign.name}&quot;? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                deleteCampaign.mutate(campaign._id, {
                  onSuccess: () => setDeleteOpen(false),
                });
              }}
              disabled={deleteCampaign.isPending}
              className="rounded-xl"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={saveTemplateOpen} onOpenChange={setSaveTemplateOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl gap-0">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-lg font-serif">
              Save as Template
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Save &quot;{campaign.name}&quot; as a reusable template for future
              campaigns.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pb-2">
            <label className="text-sm font-semibold text-ink">
              Template name
            </label>
            <Input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., Summer Casting Template"
              className="rounded-xl"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setSaveTemplateOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                saveTemplate.mutate(
                  { name: templateName, campaignId: campaign._id },
                  { onSuccess: () => setSaveTemplateOpen(false) },
                );
              }}
              disabled={saveTemplate.isPending || !templateName.trim()}
              className="rounded-xl bg-gradient-to-br from-gold to-gold-hover text-white hover:from-gold-bright hover:to-gold"
            >
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  ACTION COMPONENTS                                                 */
/* ------------------------------------------------------------------ */

function PrimaryAction({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-ink-soft active:scale-[0.98] shadow-sm"
    >
      {icon}
      {label}
    </button>
  );
}

function SecondaryAction({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="flex items-center gap-1.5 rounded-xl border border-border/60 bg-card px-4 py-2 text-xs font-semibold text-ink-soft transition-all hover:border-border hover:text-ink hover:bg-cream-soft active:scale-[0.98] ml-2"
    >
      {icon}
      {label}
    </button>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="flex h-9 w-9 items-center justify-center text-ink-muted transition-colors hover:text-ink rounded-lg hover:bg-cream-soft"
      aria-label={label}
    >
      {icon}
    </button>
  );
}
