"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useInView } from "react-intersection-observer";
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
  Image,
  Video,
  ImagePlus,
  Square,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type StatusFilter = "all" | "draft" | "active" | "closed";

const STATUS_META: Record<string, { label: string; badgeClass: string; mediaBadgeClass: string }> = {
  draft: {
    label: "Draft",
    badgeClass: "bg-white/88 text-slate-700",
    mediaBadgeClass: "bg-black/50 text-white",
  },
  active: {
    label: "Active",
    badgeClass: "bg-emerald-500 text-white",
    mediaBadgeClass: "bg-black/50 text-white",
  },
  closed: {
    label: "Closed",
    badgeClass: "bg-slate-500 text-white",
    mediaBadgeClass: "bg-black/50 text-white",
  },
};

const TAG_COLORS: Record<string, string> = {
  film: "bg-violet-100 text-violet-800",
  lead: "bg-amber-100 text-amber-800",
  brand: "bg-emerald-100 text-emerald-800",
  tv: "bg-sky-100 text-sky-800",
  commercial: "bg-rose-100 text-rose-800",
  theater: "bg-pink-100 text-pink-800",
  modeling: "bg-teal-100 text-teal-800",
  music: "bg-indigo-100 text-indigo-800",
};

function getTagClass(value?: string): string {
  if (!value) return "bg-slate-100 text-slate-700";
  const key = value.toLowerCase();
  for (const [k, v] of Object.entries(TAG_COLORS)) {
    if (key.includes(k)) return v;
  }
  return "bg-slate-100 text-slate-700";
}

function formatDateRange(dates?: { start?: string; end?: string }) {
  if (!dates?.start && !dates?.end) return null;
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const start = dates.start ? new Date(dates.start).toLocaleDateString("en-US", opts) : "";
  const end = dates.end ? new Date(dates.end).toLocaleDateString("en-US", opts) : "";
  if (start && end) return `${start} – ${end}`;
  return start || end;
}

export default function RecruiterCampaignsPage() {
  const router = useRouter();
  const { guard } = useTierGuard(3);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");

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

  const allCampaigns = useMemo(
    () => (data ? data.pages.flatMap((p) => p.data) : []),
    [data]
  );

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allCampaigns.length };
    for (const c of allCampaigns) {
      counts[c.status] = (counts[c.status] ?? 0) + 1;
    }
    return counts;
  }, [allCampaigns]);

  const STATS = [
    { label: "Total", value: statusCounts.all ?? 0, color: "text-slate-900" },
    { label: "Active", value: statusCounts.active ?? 0, color: "text-emerald-600" },
    { label: "Draft", value: statusCounts.draft ?? 0, color: "text-amber-600" },
  ];

  const STATUS_PILLS: Array<{ label: string; value: StatusFilter }> = [
    { label: "All", value: "all" },
    { label: "Active", value: "active" },
    { label: "Draft", value: "draft" },
    { label: "Closed", value: "closed" },
  ];

  if (isLoading) {
    return (
      <div className="max-w-[1280px] mx-auto w-full px-4 py-6 pb-24 lg:pb-8 space-y-4">
        <Skeleton className="h-7 w-32" />
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[360px] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1280px] mx-auto w-full px-4 py-6">
        <Alert variant="destructive">
          <AlertDescription>
            {getApiErrorMessage(error, "Failed to load campaigns")}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto w-full px-4 py-6 lg:pb-8 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-[20px] font-semibold text-slate-900 leading-tight" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
          Campaigns
        </h1>
        <button
          onClick={() => guard(() => router.push("/recruiter/campaigns/new"))}
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 h-auto text-[13px] font-semibold rounded-full transition-colors"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          New campaign
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5"
          >
            <div className={cn("text-xl font-semibold leading-none", s.color)}>
              {s.value}
            </div>
            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1.5">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Filter pills */}
      <div
        className="flex gap-2 overflow-x-auto pb-0.5"
        style={{ scrollbarWidth: "none" }}
      >
        {STATUS_PILLS.map((p) => (
          <button
            key={p.value}
            onClick={() => setStatusFilter(p.value)}
            className={cn(
              "shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors",
              statusFilter === p.value
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-500 border-slate-300 hover:border-slate-400"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          type="search"
          placeholder="Search campaigns…"
          className="h-10 rounded-xl bg-white border-slate-200 pl-10 text-sm"
        />
      </div>

      {/* Campaigns list */}
      {allCampaigns.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl">
          <ImagePlus
            className="w-10 h-10 text-slate-300 mx-auto mb-3"
            strokeWidth={1.5}
          />
          <p className="text-sm text-slate-400 mb-1">
            {statusFilter === "all" && !search
              ? "No campaigns yet"
              : "No campaigns match your filters"}
          </p>
          <p className="text-xs text-slate-400">
            {statusFilter === "all" && !search
              ? "Post your first casting call to start receiving applications."
              : "Try adjusting your filters or search term."}
          </p>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="mt-3 inline-flex items-center text-xs font-medium text-amber-600 hover:text-amber-700 transition-colors"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {allCampaigns.map((campaign) => (
              <CampaignCard key={campaign._id} campaign={campaign} guard={guard} />
            ))}
          </div>

          {hasNextPage && (
            <div ref={sentinelRef} className="py-4">
              {isFetchingNextPage ? (
                <div className="flex flex-col gap-3">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className="h-[360px] rounded-2xl" />
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function BannerPlaceholder() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950">
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 400 130">
          <rect width="400" height="130" fill="#1e293b" />
          <rect x="0" y="70" width="400" height="60" fill="#0f172a" />
          <rect x="155" y="50" width="65" height="80" fill="#172033" />
          <line x1="187" y1="52" x2="187" y2="130" stroke="#f59e0b" strokeWidth="2" strokeDasharray="14 8" />
          <rect x="0" y="46" width="400" height="26" fill="#243447" opacity="0.8" />
          <circle cx="55" cy="30" r="16" fill="#263d52" />
          <circle cx="300" cy="22" r="22" fill="#1a3048" />
          <rect x="16" y="49" width="7" height="22" fill="#2d4760" />
          <rect x="345" y="43" width="7" height="28" fill="#2d4760" />
        </svg>
      </div>
    </div>
  );
}

function CampaignBanner({
  campaign,
}: {
  campaign: Campaign;
}) {
  const statusMeta = STATUS_META[campaign.status] ?? STATUS_META.draft;
  const loc = [campaign.location?.city, campaign.location?.state]
    .filter((s): s is string => !!s && s.trim() !== "")
    .join(", ");

  const hasImage = campaign.banner?.type === "image" || campaign.cover_image_url;
  const hasVideo = campaign.banner?.type === "video";
  const imageUrl = campaign.banner?.type === "image" ? campaign.banner.url : campaign.cover_image_url;

  return (
    <div className="relative w-full h-[130px] overflow-hidden bg-slate-900">
      {hasImage ? (
        <img src={imageUrl} alt={campaign.name} className="w-full h-full object-cover" />
      ) : hasVideo ? (
        <>
          <img
            src={campaign.banner?.thumbnail || campaign.banner?.url}
            alt={campaign.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
              <Play className="w-4 h-4 text-white ml-0.5" strokeWidth={1.5} fill="white" />
            </div>
          </div>
        </>
      ) : (
        <BannerPlaceholder />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Top badges */}
      <div className="absolute top-2.5 left-2.5 right-2.5 flex justify-between items-start">
        <span className={cn("px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide", statusMeta.badgeClass)}>
          {statusMeta.label}
        </span>
        {hasVideo && (
          <span className="bg-black/50 text-white px-2 py-1 rounded-full text-[10px] font-medium flex items-center gap-1">
            <Video className="w-3 h-3" strokeWidth={1.5} />
            Video
          </span>
        )}
        {hasImage && !hasVideo && (
          <span className="bg-black/50 text-white px-2 py-1 rounded-full text-[10px] font-medium flex items-center gap-1">
            <Image className="w-3 h-3" strokeWidth={1.5} />
            Photo
          </span>
        )}
      </div>

      {/* Bottom overlay text */}
      <div className="absolute bottom-2 left-3 right-3">
        <h3 className="text-white text-[15px] font-medium leading-tight" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
          {campaign.name}
        </h3>
        {loc && (
          <p className="text-white/70 text-[11px] mt-0.5">{loc}</p>
        )}
      </div>
    </div>
  );
}

function CampaignCard({ campaign, guard }: { campaign: Campaign; guard: (action: () => void) => void }) {
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

  const isMutating =
    deleteCampaign.isPending ||
    publishCampaign.isPending ||
    closeCampaign.isPending ||
    reopenCampaign.isPending ||
    cloneCampaign.isPending ||
    saveTemplate.isPending;

  const tags = [
    campaign.industry,
    campaign.role_type,
  ].filter(Boolean);

  return (
    <>
      <article className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
        <CampaignBanner campaign={campaign} />

        {/* Info */}
        <div className="px-3.5 py-3 flex flex-col gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Users className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} />
              {campaign.applications_count} application
              {campaign.applications_count !== 1 ? "s" : ""}
            </span>
            {dateRange && (
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} />
                {dateRange}
              </span>
            )}
          </div>

          {tags.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className={cn(
                    "px-2.5 py-0.5 rounded-full text-[11px] font-medium",
                    getTagClass(tag)
                  )}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-slate-100 flex items-stretch">
          {campaign.status === "draft" && (
            <ActionBtn
              icon={<Play className="w-4 h-4" strokeWidth={1.5} />}
              label="Publish"
              accent="emerald"
              onClick={() => guard(() => publishCampaign.mutate(campaign._id))}
              disabled={isMutating}
            />
          )}
          {campaign.status === "active" && (
            <ActionBtn
              icon={<Square className="w-4 h-4" strokeWidth={1.5} />}
              label="Close"
              accent="amber"
              onClick={() => guard(() => closeCampaign.mutate(campaign._id))}
              disabled={isMutating}
            />
          )}
          {campaign.status === "closed" && (
            <ActionBtn
              icon={<RotateCcw className="w-4 h-4" strokeWidth={1.5} />}
              label="Reopen"
              accent="emerald"
              onClick={() => guard(() => reopenCampaign.mutate(campaign._id))}
              disabled={isMutating}
            />
          )}
          <ActionBtn
            icon={<Users className="w-4 h-4" strokeWidth={1.5} />}
            label="Apps"
            onClick={() =>
              router.push(`/recruiter/campaigns/${campaign._id}/applications`)
            }
            disabled={isMutating}
          />
          <ActionBtn
            icon={<Pencil className="w-4 h-4" strokeWidth={1.5} />}
            label="Edit"
            onClick={() =>
              guard(() => router.push(`/recruiter/campaigns/${campaign._id}/edit`))
            }
            disabled={isMutating}
          />
          <ActionBtn
            icon={<Copy className="w-4 h-4" strokeWidth={1.5} />}
            label="Clone"
            onClick={() => guard(() => cloneCampaign.mutate(campaign._id))}
            disabled={isMutating}
          />
          <ActionBtn
            icon={<FileText className="w-4 h-4" strokeWidth={1.5} />}
            label="Tmpl"
            onClick={() => guard(() => {
              setTemplateName(campaign.name);
              setSaveTemplateOpen(true);
            })}
            disabled={isMutating}
          />
          <ActionBtn
            icon={<Trash2 className="w-4 h-4" strokeWidth={1.5} />}
            label="Delete"
            danger
            onClick={() => guard(() => setDeleteOpen(true))}
            disabled={isMutating}
          />
        </div>
      </article>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Campaign</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{campaign.name}&quot;? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
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
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={saveTemplateOpen} onOpenChange={setSaveTemplateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
            <DialogDescription>
              Save &quot;{campaign.name}&quot; as a reusable template.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <label className="text-sm text-slate-500">Template name</label>
            <Input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., Summer Casting Template"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveTemplateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                saveTemplate.mutate(
                  { name: templateName, campaignId: campaign._id },
                  {
                    onSuccess: () => setSaveTemplateOpen(false),
                  }
                );
              }}
              disabled={saveTemplate.isPending || !templateName.trim()}
            >
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ActionBtn({
  icon,
  label,
  onClick,
  disabled,
  accent,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  accent?: "emerald" | "amber";
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex-1 flex flex-col items-center justify-center gap-1 py-2.5 border-r border-slate-100 last:border-r-0 transition-colors disabled:opacity-50 min-h-[52px]",
        danger
          ? "text-red-500 hover:bg-red-50"
          : accent === "emerald"
            ? "text-emerald-600 hover:bg-emerald-50"
            : accent === "amber"
              ? "text-amber-600 hover:bg-amber-50"
              : "text-slate-600 hover:bg-slate-50"
      )}
    >
      {icon}
      <span className="text-[9px] font-medium tracking-wide">{label}</span>
    </button>
  );
}
