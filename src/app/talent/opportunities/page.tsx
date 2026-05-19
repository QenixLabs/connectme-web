"use client";

import { useState, useMemo, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPin, Calendar, Clock, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { campaignApi, Campaign } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import { useCampaigns } from "@/lib/api/hooks/useCampaigns";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type IndustryFilter = "all" | "Film" | "Fashion" | "TV" | "Theater" | "Commercial";
type RoleTypeFilter = "all" | "Actor" | "Model" | "Influencer" | "Dancer" | "Voice Over";

function formatDeadline(deadline?: string) {
  if (!deadline) return null;
  const date = new Date(deadline);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) return { label: "Expired", urgent: false };
  if (daysLeft === 0) return { label: "Due today", urgent: true };
  if (daysLeft <= 3) return { label: `${daysLeft}d left`, urgent: true };
  if (daysLeft <= 7) return { label: `${daysLeft}d left`, urgent: false };
  return {
    label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    urgent: false,
  };
}

export default function TalentOpportunitiesPage() {
  const [industryFilter, setIndustryFilter] = useState<IndustryFilter>("all");
  const [roleTypeFilter, setRoleTypeFilter] = useState<RoleTypeFilter>("all");
  const [applyModal, setApplyModal] = useState<{ campaign?: Campaign; message: string }>({
    campaign: undefined,
    message: "",
  });

  const { ref: sentinelRef, inView } = useInView({ threshold: 0 });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useCampaigns({
    industry: industryFilter === "all" ? undefined : industryFilter,
    role_type: roleTypeFilter === "all" ? undefined : roleTypeFilter,
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


  const industryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allCampaigns.length };
    for (const c of allCampaigns) {
      if (c.industry) counts[c.industry] = (counts[c.industry] ?? 0) + 1;
    }
    return counts;
  }, [allCampaigns]);

  const INDUSTRY_PILLS: Array<{ label: string; value: IndustryFilter; count: number }> = [
    { label: "All", value: "all", count: industryCounts.all ?? 0 },
    { label: "Film", value: "Film", count: industryCounts.Film ?? 0 },
    { label: "Fashion", value: "Fashion", count: industryCounts.Fashion ?? 0 },
    { label: "TV", value: "TV", count: industryCounts.TV ?? 0 },
    { label: "Theater", value: "Theater", count: industryCounts.Theater ?? 0 },
    { label: "Commercial", value: "Commercial", count: industryCounts.Commercial ?? 0 },
  ];

  const ROLE_PILLS: Array<{ label: string; value: RoleTypeFilter }> = [
    { label: "All", value: "all" },
    { label: "Actor", value: "Actor" },
    { label: "Model", value: "Model" },
    { label: "Influencer", value: "Influencer" },
    { label: "Dancer", value: "Dancer" },
    { label: "Voice Over", value: "Voice Over" },
  ];

  if (isLoading) {
    return (
      <div className="max-w-[1280px] mx-auto w-full px-4 py-6 pb-24 lg:pb-8 space-y-6">
        <Skeleton className="h-8 w-40" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
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
            {getApiErrorMessage(error, "Failed to load opportunities")}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto w-full px-4 py-6 pb-24 lg:pb-8 flex flex-col gap-5">
      <SectionHeader
        title="Opportunities"
        subtitle="Casting calls matched to your profile"
      />

      <div className="flex gap-2 overflow-x-auto [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {INDUSTRY_PILLS.map((p) => (
          <button
            key={p.value}
            onClick={() => setIndustryFilter(p.value)}
            className={cn(
              "shrink-0 px-3.5 py-1.5 rounded-full border-[1.5px] text-[13px] font-medium whitespace-nowrap min-h-9 transition-colors",
              industryFilter === p.value
                ? "bg-brand text-white border-brand"
                : "bg-card text-text-secondary border-border hover:border-brand hover:text-brand",
            )}
          >
            {p.label}
            {p.count > 0 && (
              <span
                className={cn(
                  "ml-1 text-xs",
                  industryFilter === p.value ? "opacity-80" : "opacity-70",
                )}
              >
                {p.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {ROLE_PILLS.map((p) => (
          <button
            key={p.value}
            onClick={() => setRoleTypeFilter(p.value)}
            className={cn(
              "shrink-0 px-3.5 py-1.5 rounded-full border-[1.5px] text-[13px] font-medium whitespace-nowrap min-h-9 transition-colors",
              roleTypeFilter === p.value
                ? "bg-brand text-white border-brand"
                : "bg-card text-text-secondary border-border hover:border-brand hover:text-brand",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {allCampaigns.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-2xl">
          <Clock
            className="w-10 h-10 text-text-muted mx-auto mb-3"
            strokeWidth={1.5}
          />
          <p className="text-sm text-text-muted mb-1">No opportunities yet</p>
          <p className="text-xs text-text-muted">
            {industryFilter !== "all" || roleTypeFilter !== "all"
              ? "Try adjusting your filters."
              : "Complete your profile to get matched with casting calls."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {allCampaigns.map((campaign) => (
              <OpportunityCard
                key={campaign._id}
                campaign={campaign}
                onApply={() =>
                  setApplyModal({ campaign, message: "" })
                }
              />
            ))}
          </div>

          {hasNextPage && (
            <div ref={sentinelRef} className="py-4">
              {isFetchingNextPage ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-64 rounded-2xl" />
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </>
      )}

      <ApplyModal
        campaign={applyModal.campaign}
        message={applyModal.message}
        onMessageChange={(message) =>
          setApplyModal((prev) => ({ ...prev, message }))
        }
        onClose={() =>
          setApplyModal({ campaign: undefined, message: "" })
        }
      />
    </div>
  );
}

function OpportunityCard({
  campaign,
  onApply,
}: {
  campaign: Campaign;
  onApply: () => void;
}) {
  const deadline = formatDeadline(campaign.deadline);
  const loc = [campaign.location?.city, campaign.location?.state]
    .filter((s): s is string => !!s && s.trim() !== "")
    .join(", ");

  return (
    <article className="bg-card border border-border rounded-2xl p-[18px] shadow-[0_1px_3px_rgba(0,0,0,0.07),0_4px_12px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(79,110,247,0.12),0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-200 flex flex-col gap-3">
      <div>
        <h3 className="text-base font-bold text-text-primary leading-tight line-clamp-2">
          {campaign.name}
        </h3>
        {campaign.industry && (
          <p className="text-xs text-text-muted mt-0.5">{campaign.industry}</p>
        )}
      </div>

      {campaign.description && (
        <p className="text-[13px] text-text-secondary line-clamp-3 leading-[1.45]">
          {campaign.description}
        </p>
      )}

      <div className="flex flex-wrap gap-3 text-xs text-text-muted">
        {loc && (
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" strokeWidth={1.5} />
            <span>{loc}</span>
          </div>
        )}
        {deadline && (
          <div
            className={cn(
              "flex items-center gap-1",
              deadline.urgent ? "text-error-text font-semibold" : "",
            )}
          >
            <Calendar className="w-3 h-3" strokeWidth={1.5} />
            <span>{deadline.label}</span>
          </div>
        )}
      </div>

      {(campaign.role_type || campaign.requirements?.gender) && (
        <div className="flex flex-wrap gap-1.5">
          {campaign.role_type && (
            <span className="px-2.5 py-0.5 rounded-full bg-muted-bg text-text-secondary border border-border text-xs font-medium">
              {campaign.role_type}
            </span>
          )}
          {campaign.requirements?.gender && (
            <span className="px-2.5 py-0.5 rounded-full bg-muted-bg text-text-secondary border border-border text-xs font-medium">
              {campaign.requirements.gender}
            </span>
          )}
        </div>
      )}

      {campaign.budget_range && (
        <div className="pt-2 border-t border-border-subtle">
          <p className="text-xs text-text-muted">
            Budget:{" "}
            <span className="font-medium text-text-secondary">
              {campaign.budget_range.currency ?? "USD"}{" "}
              {campaign.budget_range.min?.toLocaleString()}
              {campaign.budget_range.max
                ? ` - ${campaign.budget_range.max.toLocaleString()}`
                : "+"}
            </span>
          </p>
        </div>
      )}

      <div className="mt-auto pt-2 flex gap-2">
        <Button
          variant="outline"
          className="flex-1 h-10 text-[13px]"
          onClick={onApply}
        >
          Apply Now
        </Button>
      </div>
    </article>
  );
}

function ApplyModal({
  campaign,
  message,
  onMessageChange,
  onClose,
}: {
  campaign?: Campaign;
  message: string;
  onMessageChange: (message: string) => void;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () =>
      campaignApi.apply(campaign!._id, { message: message || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns", "list"] });
      toast.success("Application sent!", {
        description: `Your application for "${campaign?.name}" has been submitted.`,
      });
      onClose();
    },
    onError: (err) => {
      toast.error("Failed to apply", {
        description: getApiErrorMessage(err, "Something went wrong. Please try again."),
      });
    },
  });

  if (!campaign) return null;

  return (
    <Dialog open={!!campaign} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Apply to {campaign.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {campaign.description && (
            <p className="text-sm text-text-secondary">{campaign.description}</p>
          )}
          <div>
            <label className="text-xs font-medium text-text-secondary mb-1.5 block">
              Message to recruiter (optional)
            </label>
            <Textarea
              value={message}
              onChange={(e) => onMessageChange(e.target.value)}
              placeholder="Introduce yourself, mention relevant experience..."
              rows={4}
              maxLength={1000}
              className="resize-none"
            />
            <p className="text-[11px] text-text-muted mt-1 text-right">
              {message.length}/1000
            </p>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            <Send className="w-4 h-4 mr-2" strokeWidth={1.5} />
            {mutation.isPending ? "Sending..." : "Send Application"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}