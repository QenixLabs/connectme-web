"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useInView } from "react-intersection-observer";
import {
  Plus,
  Search,
  MapPin,
  Users,
  Clock,
  Play,
  Pencil,
  Copy,
  FileText,
  Trash2,
  RotateCcw,
  Image,
  Video,
  ImagePlus,
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

const STATUS_META: Record<
  string,
  { label: string; badgeClass: string }
> = {
  draft: {
    label: "Draft",
    badgeClass: "bg-[#FEF3E2] text-[#B45309]",
  },
  active: {
    label: "Active",
    badgeClass: "bg-[#D1FAE5] text-[#065F46]",
  },
  closed: {
    label: "Closed",
    badgeClass: "bg-[#F3F4F6] text-[#6B7280]",
  },
};

function formatDeadline(deadline?: string) {
  if (!deadline) return null;
  return new Date(deadline).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function RecruiterCampaignsPage() {
  const router = useRouter();
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

  const STATUS_PILLS: Array<{
    label: string;
    value: StatusFilter;
    count: number;
  }> = [
    { label: "All", value: "all", count: statusCounts.all ?? 0 },
    { label: "Draft", value: "draft", count: statusCounts.draft ?? 0 },
    { label: "Active", value: "active", count: statusCounts.active ?? 0 },
    { label: "Closed", value: "closed", count: statusCounts.closed ?? 0 },
  ];

  if (isLoading) {
    return (
      <div className="max-w-[1280px] mx-auto w-full px-4 py-6 pb-24 lg:pb-8 space-y-5">
        <Skeleton className="h-8 w-40" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-20 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-10 w-full rounded-xl" />
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-2xl" />
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
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-text-primary leading-tight tracking-tight">
            Campaigns
          </h1>
          <p className="text-[13px] text-text-secondary mt-0.5">
            Manage your casting calls
          </p>
        </div>
        <Button
          className="bg-brand hover:bg-brand/90 text-white px-4 py-2 h-auto text-[13px] rounded-xl flex items-center gap-1.5"
          onClick={() => router.push("/recruiter/campaigns/new")}
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          New
        </Button>
      </div>

      {/* Filter chips */}
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
                ? "bg-brand text-white border-brand"
                : "bg-card text-text-secondary border-border hover:border-brand/50"
            )}
          >
            {p.label}
            {p.count > 0 && (
              <span
                className={cn(
                  "ml-1",
                  statusFilter === p.value ? "opacity-80" : "opacity-60"
                )}
              >
                {p.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none"
          strokeWidth={1.5}
        />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          type="search"
          placeholder="Search campaigns…"
          className="h-10 rounded-xl bg-card border-border pl-10 text-sm"
        />
      </div>

      {/* Campaigns list */}
      {allCampaigns.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-2xl">
          <ImagePlus
            className="w-10 h-10 text-text-muted mx-auto mb-3"
            strokeWidth={1.5}
          />
          <p className="text-sm text-text-muted mb-1">
            {statusFilter === "all" && !search
              ? "No campaigns yet"
              : "No campaigns match your filters"}
          </p>
          <p className="text-xs text-text-muted">
            {statusFilter === "all" && !search
              ? "Post your first casting call to start receiving applications."
              : "Try adjusting your filters or search term."}
          </p>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="mt-3 inline-flex items-center text-xs font-medium text-brand hover:text-brand-hover transition-colors"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3.5">
            {allCampaigns.map((campaign) => (
              <CampaignCard key={campaign._id} campaign={campaign} />
            ))}
          </div>

          {hasNextPage && (
            <div ref={sentinelRef} className="py-4">
              {isFetchingNextPage ? (
                <div className="flex flex-col gap-3.5">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className="h-80 rounded-2xl" />
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

function CampaignBanner({
  campaign,
}: {
  campaign: Campaign;
}) {
  const statusMeta = STATUS_META[campaign.status] ?? STATUS_META.draft;

  if (campaign.banner?.type === "video") {
    return (
      <div className="relative w-full h-[140px] overflow-hidden bg-muted-bg">
        <img
          src={campaign.banner.thumbnail || campaign.banner.url}
          alt={campaign.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-11 h-11 rounded-full bg-black/50 flex items-center justify-center">
            <Play
              className="w-5 h-5 text-white ml-0.5"
              strokeWidth={1.5}
              fill="white"
            />
          </div>
        </div>
        <span
          className={cn(
            "absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md text-[11px] font-medium",
            statusMeta.badgeClass
          )}
        >
          {statusMeta.label}
        </span>
        <div className="absolute top-2.5 right-2.5 flex gap-1.5">
          <span className="bg-black/55 text-white rounded-md px-2 py-1 text-[11px] backdrop-blur-sm flex items-center gap-1">
            <Video className="w-3 h-3" strokeWidth={1.5} />
            Video
          </span>
        </div>
      </div>
    );
  }

  if (campaign.banner?.type === "image") {
    return (
      <div className="relative w-full h-[140px] overflow-hidden bg-muted-bg">
        <img
          src={campaign.banner.url}
          alt={campaign.name}
          className="w-full h-full object-cover"
        />
        <span
          className={cn(
            "absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md text-[11px] font-medium",
            statusMeta.badgeClass
          )}
        >
          {statusMeta.label}
        </span>
        <div className="absolute top-2.5 right-2.5 flex gap-1.5">
          <span className="bg-black/55 text-white rounded-md px-2 py-1 text-[11px] backdrop-blur-sm flex items-center gap-1">
            <Image className="w-3 h-3" strokeWidth={1.5} />
            Photo
          </span>
        </div>
      </div>
    );
  }

  if (campaign.cover_image_url) {
    return (
      <div className="relative w-full h-[140px] overflow-hidden bg-muted-bg">
        <img
          src={campaign.cover_image_url}
          alt={campaign.name}
          className="w-full h-full object-cover"
        />
        <span
          className={cn(
            "absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md text-[11px] font-medium",
            statusMeta.badgeClass
          )}
        >
          {statusMeta.label}
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[140px] bg-muted-bg flex flex-col items-center justify-center gap-2 border-b border-border-subtle">
      <ImagePlus
        className="w-7 h-7 text-text-tertiary"
        strokeWidth={1.5}
      />
      <span className="text-xs text-text-tertiary">Add campaign banner</span>
      <div className="flex items-center gap-2 mt-0.5">
        <span className="text-[11px] text-text-tertiary flex items-center gap-1">
          <Image className="w-3.5 h-3.5" strokeWidth={1.5} />
          Photo
        </span>
        <span className="text-[11px] text-text-tertiary">·</span>
        <span className="text-[11px] text-text-tertiary flex items-center gap-1">
          <Video className="w-3.5 h-3.5" strokeWidth={1.5} />
          Video
        </span>
      </div>
      <span
        className={cn(
          "absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md text-[11px] font-medium",
          statusMeta.badgeClass
        )}
      >
        {statusMeta.label}
      </span>
    </div>
  );
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const deadline = formatDeadline(campaign.deadline);
  const loc = [campaign.location?.city, campaign.location?.state]
    .filter((s): s is string => !!s && s.trim() !== "")
    .join(", ");

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

  return (
    <>
      <article className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
        <CampaignBanner campaign={campaign} />

        <div className="px-4 py-3.5">
          <div className="text-[11px] text-text-tertiary mb-1">
            {campaign.industry || "Campaign"}
          </div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-[15px] font-semibold text-text-primary leading-tight tracking-tight flex-1">
              {campaign.name}
            </h3>
          </div>

          {campaign.description && (
            <p className="text-[13px] text-text-secondary leading-relaxed mb-2.5 line-clamp-2">
              {campaign.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 mb-2.5">
            {loc && (
              <span className="flex items-center gap-1 text-xs text-text-secondary">
                <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
                {loc}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-text-secondary">
              <Users className="w-3.5 h-3.5" strokeWidth={1.5} />
              {campaign.applications_count} application
              {campaign.applications_count !== 1 ? "s" : ""}
            </span>
          </div>

          {campaign.role_type && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-muted-bg text-text-secondary border border-border text-[11px] font-medium mb-2.5">
              {campaign.role_type}
            </span>
          )}

          {deadline && (
            <div className="text-[11px] text-brand font-medium mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3" strokeWidth={1.5} />
              Due {deadline}
            </div>
          )}
        </div>

        <div className="h-px bg-border-subtle mx-4" />

        <div className="flex items-center gap-1.5 px-3 py-2.5">
          {campaign.status === "draft" && (
            <ActionBtn
              icon={
                <Play className="w-3.5 h-3.5" strokeWidth={1.5} fill="currentColor" />
              }
              label="Publish"
              accent
              onClick={() => publishCampaign.mutate(campaign._id)}
              disabled={isMutating}
            />
          )}
          {campaign.status === "active" && (
            <ActionBtn
              icon={<Play className="w-3.5 h-3.5" strokeWidth={1.5} />}
              label="Close"
              accent
              onClick={() => closeCampaign.mutate(campaign._id)}
              disabled={isMutating}
            />
          )}
          {campaign.status === "closed" && (
            <ActionBtn
              icon={<RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />}
              label="Reopen"
              accent
              onClick={() => reopenCampaign.mutate(campaign._id)}
              disabled={isMutating}
            />
          )}
          <ActionBtn
            icon={<Users className="w-3.5 h-3.5" strokeWidth={1.5} />}
            label="Applications"
            onClick={() =>
              router.push(`/recruiter/campaigns/${campaign._id}/applications`)
            }
            disabled={isMutating}
          />
          <ActionBtn
            icon={<Pencil className="w-3.5 h-3.5" strokeWidth={1.5} />}
            label="Edit"
            onClick={() =>
              router.push(`/recruiter/campaigns/${campaign._id}/edit`)
            }
            disabled={isMutating}
          />
          <ActionBtn
            icon={<Copy className="w-3.5 h-3.5" strokeWidth={1.5} />}
            label="Clone"
            onClick={() => cloneCampaign.mutate(campaign._id)}
            disabled={isMutating}
          />
          <ActionBtn
            icon={<FileText className="w-3.5 h-3.5" strokeWidth={1.5} />}
            label="Template"
            onClick={() => {
              setTemplateName(campaign.name);
              setSaveTemplateOpen(true);
            }}
            disabled={isMutating}
          />
          <ActionBtn
            icon={<Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />}
            label="Delete"
            danger
            onClick={() => setDeleteOpen(true)}
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
            <label className="text-sm text-text-secondary">Template name</label>
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
  accent?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border text-[11px] font-medium transition-colors disabled:opacity-50",
        accent
          ? "text-brand border-brand/30 hover:bg-brand/5"
          : danger
            ? "text-destructive border-destructive/20 hover:bg-destructive/5"
            : "text-text-secondary border-border hover:bg-muted-bg"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
