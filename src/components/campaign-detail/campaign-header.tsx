"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  Briefcase,
  Activity,
  MapPin,
  CalendarDays,
  Clock,
  UserRound,
  XCircle,
  Copy,
  Pencil,
  Share2,
  Download,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

function ActionButton({
  icon: Icon,
  children,
  onClick,
  disabled,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2 rounded-lg border-border bg-secondary/40 text-sm font-medium text-foreground/90 hover:bg-secondary"
      onClick={onClick}
      disabled={disabled}
    >
      <Icon className="size-4" />
      {children}
    </Button>
  );
}

export function CampaignHeader({ campaign }: { campaign: Campaign }) {
  const router = useRouter();
  const closeMutation = useCloseCampaign();
  const cloneMutation = useCloneCampaign();
  const [exporting, setExporting] = useState(false);

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

  return (
    <Card className="overflow-hidden border-border bg-card p-5 lg:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-2">
          <Badge
            variant="outline"
            className={statusColor}
          >
            {campaign.status.toUpperCase()}
          </Badge>
          <Badge variant="secondary" className="text-foreground/80">
            {campaign.visibility.toUpperCase().replace("_", " ")}
          </Badge>
        </div>
        <div className="hidden flex-wrap items-center gap-2 md:flex">
          {campaign.status !== "closed" && (
            <ActionButton icon={XCircle} onClick={handleClose} disabled={closeMutation.isPending}>
              Close
            </ActionButton>
          )}
          <ActionButton icon={Copy} onClick={handleClone} disabled={cloneMutation.isPending}>
            Clone
          </ActionButton>
          <Link href={`/recruiter/campaigns/${campaign._id}/edit`}>
            <ActionButton icon={Pencil}>Edit</ActionButton>
          </Link>
          <ActionButton icon={Share2} onClick={handleShare}>
            Share
          </ActionButton>
          <ActionButton icon={Download} onClick={handleExport} disabled={exporting}>
            {exporting ? <Loader2 className="size-4 animate-spin" /> : null}
            Export
          </ActionButton>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="size-9 rounded-lg border-border bg-secondary/40 hover:bg-secondary">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCopyId}>Copy Campaign ID</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-lg p-1 text-muted-foreground md:hidden">
              <MoreHorizontal className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleClose}>Close</DropdownMenuItem>
            <DropdownMenuItem onClick={handleClone}>Clone</DropdownMenuItem>
            <DropdownMenuItem onClick={handleShare}>Share</DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyId}>Copy ID</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <h1 className="mt-4 font-display text-2xl font-bold tracking-tight lg:text-[27px]">
        {campaign.name}
      </h1>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-foreground/80">
        {campaign.role_type && (
          <>
            <span className="flex items-center gap-2">
              <Briefcase className="size-4 text-muted-foreground" /> {campaign.role_type}
            </span>
            <span className="hidden h-4 w-px bg-border sm:block" />
          </>
        )}
        {locationStr && (
          <>
            <span className="flex items-center gap-2">
              <MapPin className="size-4 text-muted-foreground" /> {locationStr}
            </span>
            <span className="hidden h-4 w-px bg-border sm:block" />
          </>
        )}
        {campaign.deadline && (
          <span className="flex items-center gap-2">
            <CalendarDays className="size-4 text-muted-foreground" />
            Deadline: {format(new Date(campaign.deadline), "MMM d, yyyy")}
          </span>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_auto_320px]">
        <div>
          <h2 className="text-sm font-semibold">Brief</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-foreground/75">
            {campaign.description || "No description provided."}
          </p>
        </div>
        <div className="hidden w-px bg-border lg:block" />
        <dl className="space-y-3 text-sm">
          {campaign.recruiter && (
            <div className="flex items-start gap-3">
              <UserRound className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <dt className="w-24 shrink-0 text-muted-foreground">Created by</dt>
              <dd className="text-foreground/90">
                {campaign.recruiter.company_name || "Recruiter"}
              </dd>
            </div>
          )}
          <div className="flex items-start gap-3">
            <CalendarDays className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <dt className="w-24 shrink-0 text-muted-foreground">Created on</dt>
            <dd className="text-foreground/90">
              {format(new Date(campaign.created_at), "MMM d, yyyy")}
            </dd>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <dt className="w-24 shrink-0 text-muted-foreground">Last updated</dt>
            <dd className="text-foreground/90">
              {format(new Date(campaign.updated_at), "MMM d, yyyy 'at' h:mm a")}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 md:hidden">
        <ActionButton icon={XCircle} onClick={handleClose} disabled={closeMutation.isPending}>
          Close
        </ActionButton>
        <ActionButton icon={Copy} onClick={handleClone} disabled={cloneMutation.isPending}>
          Clone
        </ActionButton>
        <Link href={`/recruiter/campaigns/${campaign._id}/edit`}>
          <ActionButton icon={Pencil}>Edit</ActionButton>
        </Link>
        <ActionButton icon={Share2} onClick={handleShare}>
          Share
        </ActionButton>
      </div>
    </Card>
  );
}
