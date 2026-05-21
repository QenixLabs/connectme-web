"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock3,
} from "lucide-react";
import { useCampaigns } from "@/lib/api/hooks/useCampaigns";
import { Campaign } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import { SectionHeader } from "@/components/ui/section-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function formatDeadline(deadline?: string) {
  if (!deadline) return null;
  const date = new Date(deadline);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) return { label: "Expired", urgent: false };
  if (daysLeft === 0) return { label: "Due today", urgent: true };
  if (daysLeft <= 3) return { label: `${daysLeft}d left`, urgent: true };
  return {
    label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    urgent: false,
  };
}

function ApplicationStatusBadge({ status }: { status: string }) {
  const config = {
    pending: { icon: Clock3, className: "bg-amber-100 text-amber-700 border-amber-200" },
    accepted: { icon: CheckCircle2, className: "bg-green-100 text-green-700 border-green-200" },
    rejected: { icon: XCircle, className: "bg-red-100 text-red-700 border-red-200" },
  } as const;

  const { icon: Icon, className } = config[status as keyof typeof config] || config.pending;

  return (
    <Badge variant="outline" className={cn("text-xs font-medium capitalize", className)}>
      <Icon className="w-3 h-3 mr-1" strokeWidth={1.5} />
      {status}
    </Badge>
  );
}

function ApplicationCard({ campaign }: { campaign: Campaign }) {
  const router = useRouter();
  const deadline = formatDeadline(campaign.deadline);
  const loc = [campaign.location?.city, campaign.location?.state]
    .filter((s): s is string => !!s && s.trim() !== "")
    .join(", ");

  return (
    <div
      className="bg-card border border-border rounded-2xl p-[18px] shadow-[0_1px_3px_rgba(0,0,0,0.07),0_4px_12px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(79,110,247,0.12),0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-200 flex flex-col gap-3 cursor-pointer"
      onClick={() => router.push(`/talent/opportunities/${campaign._id}`)}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-text-primary leading-tight line-clamp-2">
            {campaign.name}
          </h3>
          {campaign.industry && (
            <p className="text-xs text-text-muted mt-0.5">{campaign.industry}</p>
          )}
        </div>
        <ApplicationStatusBadge status={campaign.my_application?.status || "pending"} />
      </div>

      {campaign.description && (
        <p className="text-[13px] text-text-secondary line-clamp-2 leading-[1.45]">
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
          <div className={cn("flex items-center gap-1", deadline.urgent ? "text-error-text font-semibold" : "")}>
            <Calendar className="w-3 h-3" strokeWidth={1.5} />
            <span>{deadline.label}</span>
          </div>
        )}
        {campaign.role_type && (
          <div className="flex items-center gap-1">
            <Briefcase className="w-3 h-3" strokeWidth={1.5} />
            <span>{campaign.role_type}</span>
          </div>
        )}
      </div>

      {campaign.my_application?.created_at && (
        <p className="text-[11px] text-text-muted">
          Applied on{" "}
          {new Date(campaign.my_application.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      )}
    </div>
  );
}

export default function TalentApplicationsPage() {
  const router = useRouter();

  const filters = useMemo(
    () => ({
      applied: "true" as const,
      limit: 50,
    }),
    []
  );

  const { data, isLoading, error } = useCampaigns(filters);
  const campaigns = data ? data.pages.flatMap((p) => p.data) : [];

  return (
    <div className="max-w-[1280px] mx-auto w-full px-3 sm:px-4 py-4 sm:py-6 pb-24 lg:pb-8 flex flex-col gap-4 sm:gap-5">
      <Button
        variant="ghost"
        size="sm"
        className="w-fit -ml-2 text-text-secondary"
        onClick={() => router.push("/talent/dashboard")}
      >
        <ArrowLeft className="w-4 h-4 mr-1" strokeWidth={1.5} />
        Back to Dashboard
      </Button>

      <SectionHeader title="My Applications" />

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {getApiErrorMessage(error, "Failed to load applications")}
          </AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && campaigns.length === 0 && (
        <div className="text-center py-20 bg-card border border-border rounded-2xl">
          <Clock className="w-10 h-10 text-text-muted mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-sm text-text-muted mb-1">No applications yet</p>
          <p className="text-xs text-text-muted">
            Browse opportunities and apply to campaigns that match your profile.
          </p>
          <Button
            className="mt-4"
            onClick={() => router.push("/talent/opportunities")}
          >
            Browse Opportunities
          </Button>
        </div>
      )}

      {!isLoading && !error && campaigns.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {campaigns.map((campaign) => (
            <ApplicationCard key={campaign._id} campaign={campaign} />
          ))}
        </div>
      )}
    </div>
  );
}
