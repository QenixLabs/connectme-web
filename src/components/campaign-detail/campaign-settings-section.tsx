"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CalendarDays,
  Check,
  Copy,
  Download,
  Eye,
  Globe,
  Loader2,
  Lock,
  MessageSquare,
  Power,
  RotateCcw,
  Timer,
  Trash2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  useCloseCampaign,
  useCloneCampaign,
  useDeleteCampaign,
  useReopenCampaign,
  useUpdateCampaign,
} from "@/hooks/use-campaigns";
import { campaignsApi, type Campaign } from "@/lib/api/campaigns";
import { cn } from "@/lib/utils";

function Card({
  children,
  danger,
}: {
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <section
      className={cn(
        "rounded-lg border border-border bg-card p-5 shadow-card",
        danger && "border-destructive/40",
      )}
    >
      {children}
    </section>
  );
}

function CardHeader({
  icon: Icon,
  title,
  subtitle,
  tone = "bg-primary-soft text-primary",
}: {
  icon: typeof Power;
  title: string;
  subtitle: string;
  tone?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-lg",
          tone,
        )}
      >
        <Icon className="size-5" />
      </div>
      <div>
        <h2 className="text-xl font-extrabold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

function toDateInputValue(iso?: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function isDeadlineExpired(iso?: string): boolean {
  if (!iso) return false;
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return false;
  return time < Date.now();
}

export function CampaignSettingsSection({ campaign }: { campaign: Campaign }) {
  const router = useRouter();
  const update = useUpdateCampaign();
  const close = useCloseCampaign();
  const reopen = useReopenCampaign();
  const clone = useCloneCampaign();
  const remove = useDeleteCampaign();

  const [message, setMessage] = useState(campaign.audition_message ?? "");
  const [visibility, setVisibility] = useState(
    campaign.visibility === "invite_only" ? "invite_only" : "public",
  );
  const [autoClose, setAutoClose] = useState(
    campaign.auto_close_on_deadline ?? false,
  );
  const [deadline, setDeadline] = useState(toDateInputValue(campaign.deadline));
  const [exporting, setExporting] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [reopenOpen, setReopenOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const isClosed = campaign.status === "closed";
  const deadlineExpired = isDeadlineExpired(campaign.deadline);
  const unchangedMessage = message === (campaign.audition_message ?? "");
  const unchangedVisibility = visibility === campaign.visibility;
  const unchangedDeadline =
    toDateInputValue(campaign.deadline) === deadline;

  const handleUpdateError = (error: unknown, fallback: string) => {
    const err = error as { response?: { data?: { message?: string } } };
    toast.error(err.response?.data?.message ?? fallback);
  };

  const handleVisibilitySave = () => {
    update.mutate(
      { id: campaign._id, payload: { visibility } },
      {
        onSuccess: () => toast.success("Visibility updated"),
        onError: (error) => handleUpdateError(error, "Failed to update visibility"),
      },
    );
  };

  const handleAutoCloseToggle = (checked: boolean) => {
    setAutoClose(checked);
    update.mutate(
      { id: campaign._id, payload: { auto_close_on_deadline: checked } },
      {
        onSuccess: () =>
          toast.success(
            checked ? "Campaign will auto-close on deadline" : "Auto-close disabled",
          ),
        onError: (error) => {
          setAutoClose(!checked);
          handleUpdateError(error, "Failed to update auto-close");
        },
      },
    );
  };

  const handleDeadlineSave = () => {
    if (!deadline) return;
    update.mutate(
      { id: campaign._id, payload: { deadline: new Date(deadline).toISOString() } },
      {
        onSuccess: () => toast.success("Application deadline updated"),
        onError: (error) => handleUpdateError(error, "Failed to update deadline"),
      },
    );
  };

  const handleClone = () => {
    clone.mutate(campaign._id, {
      onSuccess: (data) => {
        toast.success("Campaign duplicated");
        router.push(`/recruiter/campaigns/${data._id}/edit`);
      },
      onError: () => toast.error("Failed to duplicate campaign"),
    });
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await campaignsApi.exportCampaign(campaign._id);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${campaign.name.replace(/\s+/g, "-").toLowerCase()}-applications.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      toast.success("Applications exported");
    } catch {
      toast.error("Export failed. You may need a paid plan for this feature.");
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = () => {
    setDeleteOpen(false);
    remove.mutate(campaign._id, {
      onSuccess: () => router.push("/recruiter/campaigns"),
      // Error toast is handled inside the hook.
    });
  };

  return (
    <div className="space-y-4">
      {/* 1 — Audition message (existing) */}
      <Card>
        <CardHeader
          icon={MessageSquare}
          title="Audition message"
          subtitle="Set the default message used when inviting shortlisted talent to an audition."
        />
        <label
          htmlFor="audition-message"
          className="mt-6 block text-sm font-semibold"
        >
          Default message
        </label>
        <Textarea
          id="audition-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          maxLength={1000}
          placeholder="Hi, we would love to see you audition for this campaign..."
          className="mt-2 min-h-32 resize-y"
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {message.length}/1000 characters
          </p>
          <Button
            onClick={() =>
              update.mutate(
                {
                  id: campaign._id,
                  payload: { audition_message: message.trim() || undefined },
                },
                {
                  onSuccess: () => toast.success("Audition message saved"),
                  onError: (error) =>
                    handleUpdateError(error, "Failed to save message"),
                },
              )
            }
            disabled={update.isPending || unchangedMessage}
          >
            {update.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Check className="size-4" />
            )}
            Save message
          </Button>
        </div>
      </Card>

      {/* 2 — Campaign status: close / reopen */}
      <Card>
        <CardHeader
          icon={Power}
          title="Campaign status"
          subtitle="Close applications when hiring is done, or reopen a closed campaign."
        />
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              "px-2.5 py-1 text-xs font-bold uppercase",
              isClosed
                ? "border-destructive/40 bg-destructive/10 text-destructive"
                : campaign.status === "draft"
                  ? "border-muted-foreground/40 bg-muted/50 text-muted-foreground"
                  : "border-accent/40 bg-accent/10 text-accent",
            )}
          >
            {campaign.status}
          </Badge>
          {deadlineExpired && (
            <span className="text-xs font-medium text-destructive">
              Application deadline has passed
            </span>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {isClosed ? (
            <Button
              onClick={() => setReopenOpen(true)}
              disabled={reopen.isPending || deadlineExpired}
              title={
                deadlineExpired
                  ? "Cannot reopen a campaign with an expired deadline"
                  : undefined
              }
            >
              {reopen.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <RotateCcw className="size-4" />
              )}
              Reopen campaign
            </Button>
          ) : (
            <Button
              variant="destructive"
              onClick={() => setCloseOpen(true)}
              disabled={close.isPending}
            >
              {close.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <XCircle className="size-4" />
              )}
              Close campaign
            </Button>
          )}
        </div>
        {deadlineExpired && isClosed && (
          <p className="mt-2 text-xs text-muted-foreground">
            Update the application deadline below before reopening.
          </p>
        )}
      </Card>

      {/* 3 — Visibility */}
      <Card>
        <CardHeader
          icon={Eye}
          title="Campaign visibility"
          subtitle="Control who can discover and apply to this campaign."
        />
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setVisibility("public")}
            className={cn(
              "flex items-start gap-3 rounded-lg border p-3 text-left transition-colors",
              visibility === "public"
                ? "border-primary bg-primary-soft/40"
                : "border-border hover:bg-secondary/40",
            )}
          >
            <Globe className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>
              <span className="flex items-center gap-1.5 text-sm font-bold">
                Public
                {visibility === "public" && <Check className="size-4 text-primary" />}
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                Anyone can find and apply.
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => setVisibility("invite_only")}
            className={cn(
              "flex items-start gap-3 rounded-lg border p-3 text-left transition-colors",
              visibility === "invite_only"
                ? "border-primary bg-primary-soft/40"
                : "border-border hover:bg-secondary/40",
            )}
          >
            <Lock className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>
              <span className="flex items-center gap-1.5 text-sm font-bold">
                Invite only
                {visibility === "invite_only" && (
                  <Check className="size-4 text-primary" />
                )}
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                Only talent you invite can apply.
              </span>
            </span>
          </button>
        </div>
        <div className="mt-3 flex justify-end">
          <Button
            onClick={handleVisibilitySave}
            disabled={update.isPending || unchangedVisibility}
          >
            {update.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Check className="size-4" />
            )}
            Save visibility
          </Button>
        </div>
      </Card>

      {/* 4 — Auto-close on deadline */}
      <Card>
        <CardHeader
          icon={Timer}
          title="Auto-close on deadline"
          subtitle="Automatically close the campaign once the application deadline passes."
        />
        <div className="mt-4 flex items-center justify-between gap-4 rounded-lg border border-border bg-secondary/30 p-3">
          <div className="text-sm">
            <p className="font-bold">
              {autoClose ? "Auto-close enabled" : "Auto-close disabled"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {autoClose
                ? "Status will switch to closed after the deadline."
                : "Campaign stays open until you close it manually."}
            </p>
          </div>
          <Switch
            checked={autoClose}
            onCheckedChange={handleAutoCloseToggle}
            disabled={update.isPending}
            aria-label="Toggle auto-close on deadline"
          />
        </div>
      </Card>

      {/* 5 — Application deadline */}
      <Card>
        <CardHeader
          icon={CalendarDays}
          title="Application deadline"
          subtitle="Last date talent can apply. Talent sees a countdown on the campaign."
        />
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Input
            type="date"
            value={deadline}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(event) => setDeadline(event.target.value)}
            className="sm:max-w-xs"
          />
          <Button
            onClick={handleDeadlineSave}
            disabled={update.isPending || !deadline || unchangedDeadline}
          >
            {update.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Check className="size-4" />
            )}
            Save deadline
          </Button>
        </div>
        {campaign.deadline && (
          <p className="mt-2 text-xs text-muted-foreground">
            Current deadline:{" "}
            {new Date(campaign.deadline).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        )}
      </Card>

      {/* 6 — Duplicate & export */}
      <Card>
        <CardHeader
          icon={Copy}
          title="Duplicate & export"
          subtitle="Reuse this campaign as a template or download applicant data."
        />
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={handleClone}
            disabled={clone.isPending}
          >
            {clone.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Copy className="size-4" />
            )}
            Duplicate campaign
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            Export applications (CSV)
          </Button>
        </div>
      </Card>

      {/* 7 — Danger zone: delete */}
      <Card danger>
        <CardHeader
          icon={AlertTriangle}
          title="Danger zone"
          subtitle="Permanently delete this campaign and its applications. This cannot be undone."
          tone="bg-destructive/10 text-destructive"
        />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
            <Trash2 className="size-4" />
            Delete this campaign
          </div>
          <Button
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
            disabled={remove.isPending}
          >
            {remove.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            Delete campaign
          </Button>
        </div>
      </Card>

      {/* Confirm dialogs */}
      <AlertDialog open={closeOpen} onOpenChange={setCloseOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close this campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              New applications will stop immediately. You can still view and
              manage existing applications, and reopen the campaign later if
              the deadline has not passed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setCloseOpen(false);
                close.mutate(campaign._id);
              }}
              disabled={close.isPending}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {close.isPending && <Loader2 className="size-4 animate-spin" />}
              Close campaign
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={reopenOpen} onOpenChange={setReopenOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reopen this campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              Talent will be able to discover and apply to this campaign again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setReopenOpen(false);
                reopen.mutate(campaign._id);
              }}
              disabled={reopen.isPending}
            >
              {reopen.isPending && <Loader2 className="size-4 animate-spin" />}
              Reopen campaign
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{campaign.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the campaign, its applications, invites
              and tasks. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={remove.isPending}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {remove.isPending && <Loader2 className="size-4 animate-spin" />}
              Delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
