"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useInView } from "react-intersection-observer";
import { FilePlus, Search, MapPin, Users, Calendar, Edit, Trash2, Play, RotateCcw, Copy, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { Campaign } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import { useCampaigns, useDeleteCampaign, usePublishCampaign, useCloseCampaign, useReopenCampaign, useCloneCampaign } from "@/lib/api/hooks/useCampaigns";
import { useSaveCampaignTemplate } from "@/lib/api/hooks/useCampaignTemplates";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

type StatusFilter = "all" | "draft" | "active" | "closed";

const STATUS_META: Record<
  string,
  { label: string; classes: string }
> = {
  draft: {
    label: "Draft",
    classes: "bg-muted-bg text-text-secondary border-border",
  },
  active: {
    label: "Active",
    classes: "bg-success-light text-success-text border-success-muted",
  },
  closed: {
    label: "Closed",
    classes: "bg-error-light text-error-text border-error-muted",
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
    [data],
  );


  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allCampaigns.length };
    for (const c of allCampaigns) {
      counts[c.status] = (counts[c.status] ?? 0) + 1;
    }
    return counts;
  }, [allCampaigns]);

  const STATUS_PILLS: Array<{ label: string; value: StatusFilter; count: number }> = [
    { label: "All", value: "all", count: statusCounts.all ?? 0 },
    { label: "Draft", value: "draft", count: statusCounts.draft ?? 0 },
    { label: "Active", value: "active", count: statusCounts.active ?? 0 },
    { label: "Closed", value: "closed", count: statusCounts.closed ?? 0 },
  ];

  if (isLoading) {
    return (
      <div className="max-w-[1280px] mx-auto w-full px-4 py-6 pb-24 lg:pb-8 space-y-6">
        <Skeleton className="h-8 w-40" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
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
    <div className="max-w-[1280px] mx-auto w-full px-4 py-6 pb-24 lg:pb-8 flex flex-col gap-5">
      <SectionHeader
        title="Campaigns"
        subtitle="Manage your casting calls and projects"
        action={
          <Button
            variant="primary"
            className="px-4 py-2 h-auto text-sm rounded-lg"
            onClick={() => router.push('/recruiter/campaigns/new')}
          >
            + New
          </Button>
        }
      />

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-2 overflow-x-auto [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {STATUS_PILLS.map((p) => (
            <button
              key={p.value}
              onClick={() => setStatusFilter(p.value)}
              className={cn(
                "shrink-0 px-3.5 py-1.5 rounded-full border-[1.5px] text-[13px] font-medium whitespace-nowrap min-h-9 transition-colors",
                statusFilter === p.value
                  ? "bg-brand text-white border-brand"
                  : "bg-card text-text-secondary border-border hover:border-brand hover:text-brand",
              )}
            >
              {p.label}
              {p.count > 0 && (
                <span
                  className={cn(
                    "ml-1 text-xs",
                    statusFilter === p.value ? "opacity-80" : "opacity-70",
                  )}
                >
                  {p.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-[240px]">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none z-10"
            strokeWidth={1.5}
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="search"
            placeholder="Search campaigns..."
            className="h-10 rounded-[10px] bg-card border-[1.5px] border-border pl-9 text-sm"
          />
        </div>
      </div>

      {allCampaigns.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-2xl">
          <FilePlus
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {allCampaigns.map((campaign) => (
              <CampaignCard key={campaign._id} campaign={campaign} />
            ))}
          </div>

          {hasNextPage && (
            <div ref={sentinelRef} className="py-4">
              {isFetchingNextPage ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-56 rounded-2xl" />
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

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const statusMeta = STATUS_META[campaign.status] ?? STATUS_META.draft;
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
      <article className="bg-card border border-border rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.07),0_4px_12px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(79,110,247,0.12),0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-200 flex flex-col gap-3">
        {campaign.cover_image_url && (
          <div className="w-full h-40 overflow-hidden">
            <img src={campaign.cover_image_url} alt={campaign.name} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="px-[18px] pt-[18px] flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-text-primary leading-tight line-clamp-1">
              {campaign.name}
            </h3>
            {campaign.industry && (
              <p className="text-xs text-text-muted mt-0.5">{campaign.industry}</p>
            )}
          </div>
          <Badge className={cn("shrink-0", statusMeta.classes)}>
            {statusMeta.label}
          </Badge>
        </div>

        {campaign.description && (
          <p className="px-[18px] text-[13px] text-text-secondary line-clamp-2 leading-[1.45]">
            {campaign.description}
          </p>
        )}

        <div className="px-[18px] flex flex-wrap gap-3 text-xs text-text-muted">
          {loc && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" strokeWidth={1.5} />
              <span>{loc}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" strokeWidth={1.5} />
            <span>{campaign.applications_count} application{campaign.applications_count !== 1 ? "s" : ""}</span>
          </div>
          {deadline && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" strokeWidth={1.5} />
              <span>Due {deadline}</span>
            </div>
          )}
        </div>

        {campaign.role_type && (
          <div className="px-[18px] flex flex-wrap gap-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-muted-bg text-text-secondary border border-border text-xs font-medium">
              {campaign.role_type}
            </span>
          </div>
        )}

        <div className="mt-auto px-[18px] pt-2 pb-[18px] border-t border-border-subtle flex flex-wrap gap-2">
          {campaign.status === 'draft' && (
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-[13px] flex-1 min-w-[80px]"
              onClick={() => publishCampaign.mutate(campaign._id)}
              disabled={isMutating}
            >
              <Play className="w-3.5 h-3.5 mr-1" strokeWidth={1.5} />
              Publish
            </Button>
          )}
          {campaign.status === 'active' && (
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-[13px] flex-1 min-w-[80px]"
              onClick={() => closeCampaign.mutate(campaign._id)}
              disabled={isMutating}
            >
              Close
            </Button>
          )}
          {campaign.status === 'closed' && (
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-[13px] flex-1 min-w-[80px]"
              onClick={() => reopenCampaign.mutate(campaign._id)}
              disabled={isMutating}
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" strokeWidth={1.5} />
              Reopen
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-[13px] flex-1 min-w-[80px]"
            onClick={() => router.push(`/recruiter/campaigns/${campaign._id}/edit`)}
          >
            <Edit className="w-3.5 h-3.5 mr-1" strokeWidth={1.5} />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-[13px] flex-1 min-w-[80px]"
            onClick={() => cloneCampaign.mutate(campaign._id)}
            disabled={isMutating}
          >
            <Copy className="w-3.5 h-3.5 mr-1" strokeWidth={1.5} />
            Clone
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-[13px] flex-1 min-w-[80px]"
            onClick={() => {
              setTemplateName(campaign.name);
              setSaveTemplateOpen(true);
            }}
            disabled={isMutating}
          >
            <Save className="w-3.5 h-3.5 mr-1" strokeWidth={1.5} />
            Template
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-[13px] flex-1 min-w-[80px] text-error-text hover:bg-error-light"
            onClick={() => setDeleteOpen(true)}
            disabled={isMutating}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" strokeWidth={1.5} />
            Delete
          </Button>
        </div>
      </article>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Campaign</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{campaign.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
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
            <Button variant="outline" onClick={() => setSaveTemplateOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                saveTemplate.mutate({ name: templateName, campaignId: campaign._id }, {
                  onSuccess: () => setSaveTemplateOpen(false),
                });
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