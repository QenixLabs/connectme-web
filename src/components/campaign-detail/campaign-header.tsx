"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Briefcase,
  MapPin,
  Clock3,
  FolderKanban,
  XCircle,
  Copy,
  Pencil,
  Share2,
  Download,
  MoreHorizontal,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCloseCampaign, useCloneCampaign } from "@/hooks/use-campaigns";
import { campaignsApi } from "@/lib/api/campaigns";
import { toast } from "sonner";
import type { Campaign } from "@/lib/api/campaigns";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export type CampaignStatKey = "all" | "shortlisted" | "accepted";

interface CampaignStats {
  applications: number;
  shortlisted: number;
  accepted: number;
}

function formatBudget(campaign: Campaign) {
  const budget = campaign.budget_range;
  if (!budget?.min && !budget?.max) return null;

  const currencySymbols: Record<string, string> = { INR: "₹", USD: "$", EUR: "€", GBP: "£" };
  const code = budget.currency || "INR";
  const currency = currencySymbols[code] ?? `${code} `;
  const compact = (value: number) =>
    new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(value);

  if (budget.min && budget.max) return `${currency}${compact(budget.min)}–${compact(budget.max)}`;
  return `${currency}${compact(budget.min || budget.max || 0)}`;
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 text-xs">
      <dt className="w-24 shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-foreground/85">{value}</dd>
    </div>
  );
}

function StatButton({
  value,
  label,
  onClick,
}: {
  value: number;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-w-0 flex-col items-center gap-0.5 rounded-lg px-1 py-1 transition-colors hover:bg-secondary/60"
    >
      <span className="text-base font-bold leading-tight text-foreground">{value}</span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </button>
  );
}

export function CampaignHeader({
  campaign,
  stats,
  onStatClick,
}: {
  campaign: Campaign;
  stats: CampaignStats;
  onStatClick: (key: CampaignStatKey) => void;
}) {
  const router = useRouter();
  const closeMutation = useCloseCampaign();
  const cloneMutation = useCloneCampaign();
  const [exporting, setExporting] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);

  const statusColor =
    campaign.status === "active"
      ? "border-accent/40 bg-accent/10 text-accent"
      : campaign.status === "closed"
        ? "border-destructive/40 bg-destructive/10 text-destructive"
        : "border-muted-foreground/40 bg-muted/50 text-muted-foreground";

  const handleCopyId = () => {
    navigator.clipboard.writeText(campaign._id);
    toast.success("Campaign ID copied");
  };

  const handleShare = () => {
    const url = `${window.location.origin}/recruiter/campaigns/${campaign._id}`;
    navigator.clipboard.writeText(url);
    toast.success("Campaign link copied to clipboard");
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await campaignsApi.exportCampaign(campaign._id);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Export failed. You may need a paid plan for this feature.");
    } finally {
      setExporting(false);
    }
  };

  const handleClose = () => {
    setCloseOpen(false);
    closeMutation.mutate(campaign._id, {
      onSuccess: () => toast.success("Campaign closed"),
      onError: () => toast.error("Failed to close campaign"),
    });
  };

  const handleClone = () => {
    cloneMutation.mutate(campaign._id, {
      onSuccess: (data) => {
        toast.success("Campaign cloned");
        router.push(`/recruiter/campaigns/${data._id}/edit`);
      },
      onError: () => toast.error("Failed to clone campaign"),
    });
  };

  const locationStr = [campaign.location?.city, campaign.location?.state]
    .filter(Boolean)
    .join(", ");

  const budget = formatBudget(campaign);
  const skills = campaign.specialties?.length
    ? campaign.specialties
    : campaign.requirements?.skills;
  const dateRange =
    campaign.dates?.start || campaign.dates?.end
      ? [
          campaign.dates?.start ? format(new Date(campaign.dates.start), "MMM d, yyyy") : null,
          campaign.dates?.end ? format(new Date(campaign.dates.end), "MMM d, yyyy") : null,
        ]
          .filter(Boolean)
          .join(" – ")
      : null;

  const hasFullDetails = Boolean(
    budget ||
      skills?.length ||
      campaign.requirements?.languages?.length ||
      campaign.requirements?.gender ||
      campaign.requirements?.age_range?.min ||
      dateRange ||
      campaign.task?.is_enabled,
  );

  return (
    <Card className="border-border bg-card p-3.5 sm:p-4 lg:p-5">
      {/* Status pills + menu */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1.5">
          <Badge variant="outline" className={cn("px-2 py-0.5 text-[10px] font-bold", statusColor)}>
            {campaign.status.toUpperCase()}
          </Badge>
          <Badge variant="secondary" className="px-2 py-0.5 text-[10px] font-semibold text-foreground/70">
            {campaign.visibility.toUpperCase().replace("_", " ")}
          </Badge>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Campaign options"
              className="-mr-1.5 text-muted-foreground hover:text-foreground"
            >
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleCopyId}>Copy Campaign ID</DropdownMenuItem>
            <DropdownMenuItem onClick={handleExport} disabled={exporting}>
              {exporting ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
              Export applications
            </DropdownMenuItem>
            {campaign.status !== "closed" && (
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setCloseOpen(true)}
              >
                <XCircle className="size-3.5" />
                Close campaign
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Identity: square cover + title/meta */}
      <div className="mt-3 grid grid-cols-[112px_minmax(0,1fr)] gap-3 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-3.5">
        <div className="relative aspect-square w-full self-start overflow-hidden rounded-xl bg-muted">
          {campaign.cover_image_url ? (
            <img
              src={campaign.cover_image_url}
              alt={`${campaign.name} campaign cover`}
              className="absolute inset-0 size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-primary/70">
              <FolderKanban className="size-7" />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col">
          <h1 className="font-display text-lg font-bold leading-tight tracking-tight text-foreground sm:text-xl">
            {campaign.name}
          </h1>
          <div className="mt-1.5 space-y-1 text-xs text-foreground/75">
            {campaign.role_type && (
              <p className="flex items-center gap-1.5">
                <Briefcase className="size-3.5 shrink-0 text-primary" />
                <span className="truncate capitalize">{campaign.role_type}</span>
              </p>
            )}
            {locationStr && (
              <p className="flex items-center gap-1.5">
                <MapPin className="size-3.5 shrink-0 text-primary" />
                <span className="truncate">{locationStr}</span>
              </p>
            )}
            {campaign.deadline && (
              <p className="flex items-center gap-1.5">
                <Clock3 className="size-3.5 shrink-0 text-primary" />
                Deadline: {format(new Date(campaign.deadline), "MMM d, yyyy")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Compact metadata row */}
      <p className="mt-3 text-[11px] text-muted-foreground">
        Created {format(new Date(campaign.created_at), "MMM d, yyyy")}
        {" · "}Updated {format(new Date(campaign.updated_at), "MMM d, h:mm a")}
      </p>

      {/* Performance strip */}
      <div className="mt-3 grid grid-cols-3 divide-x divide-border/70 border-y border-border/70 py-1.5">
        <StatButton
          label="Applications"
          value={stats.applications}
          onClick={() => onStatClick("all")}
        />
        <StatButton
          label="Shortlisted"
          value={stats.shortlisted}
          onClick={() => onStatClick("shortlisted")}
        />
        <StatButton
          label="Accepted"
          value={stats.accepted}
          onClick={() => onStatClick("accepted")}
        />
      </div>

      {/* Brief */}
      <div className="mt-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Brief
        </h2>
        <p className="mt-1.5 line-clamp-4 text-sm leading-relaxed text-foreground/75">
          {campaign.description || "No description provided."}
        </p>
        {(hasFullDetails || campaign.description) && (
          <button
            type="button"
            onClick={() => setDetailsOpen((v) => !v)}
            className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            {detailsOpen ? "Hide details" : "View full details"}
            <ChevronRight
              className={cn("size-3.5 transition-transform", detailsOpen && "rotate-90")}
            />
          </button>
        )}

        {detailsOpen && (
          <dl className="mt-2.5 space-y-2 rounded-lg bg-secondary/40 p-3">
            <DetailRow label="Compensation" value={budget} />
            <DetailRow
              label="Skills"
              value={skills?.length ? skills.join(", ") : null}
            />
            <DetailRow
              label="Languages"
              value={campaign.requirements?.languages?.join(", ") || null}
            />
            <DetailRow
              label="Preferred"
              value={
                [
                  campaign.requirements?.gender,
                  campaign.requirements?.age_range?.min != null ||
                  campaign.requirements?.age_range?.max != null
                    ? `Age ${campaign.requirements?.age_range?.min ?? "…"}–${
                        campaign.requirements?.age_range?.max ?? "…"
                      }`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ") || null
              }
            />
            <DetailRow label="Campaign dates" value={dateRange} />
            <DetailRow label="Visibility" value={campaign.visibility.replaceAll("_", " ")} />
            {campaign.recruiter && (
              <DetailRow
                label="Posted by"
                value={campaign.recruiter.company_name || "Recruiter"}
              />
            )}
            {campaign.task?.is_enabled && (
              <DetailRow label="Task" value={campaign.task.title || "Screening task included"} />
            )}
          </dl>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2">
        <Button asChild size="sm" className="h-9 flex-1 rounded-lg font-semibold">
          <Link href={`/recruiter/campaigns/${campaign._id}/edit`}>
            <Pencil className="size-4" />
            Edit campaign
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleClone}
          disabled={cloneMutation.isPending}
          className="h-9 rounded-lg border-border bg-secondary/40 font-medium text-foreground/90 hover:bg-secondary"
        >
          {cloneMutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Copy className="size-4" />
          )}
          Clone
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="h-9 rounded-lg border-border bg-secondary/40 font-medium text-foreground/90 hover:bg-secondary"
        >
          <Share2 className="size-4" />
          Share
        </Button>
      </div>

      {/* Close confirmation */}
      <AlertDialog open={closeOpen} onOpenChange={setCloseOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close this campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              New applications will stop immediately. You can still view and manage existing
              applications, but the campaign can&apos;t be reopened.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClose}
              disabled={closeMutation.isPending}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {closeMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              Close campaign
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
