"use client";

import { Send, Users, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { CampaignInvite } from "@/lib/api/campaigns";

function InvitesEmptySkeleton() {
  return (
    <Card className="overflow-hidden border-border bg-card p-5 lg:p-6">
      <Skeleton className="h-5 w-24" />
      <div className="mt-4 flex flex-col items-center gap-5 md:flex-row md:justify-between">
        <div className="flex flex-col items-center gap-5 text-center md:flex-row md:text-left">
          <Skeleton className="size-20 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-10 w-full rounded-lg md:w-auto md:px-5" />
      </div>
    </Card>
  );
}

function InviteStatusBadge({ status }: { status: CampaignInvite["status"] }) {
  const config = {
    pending: { icon: Clock, label: "Pending", className: "bg-amber-tag/20 text-[var(--warning)]" },
    accepted: { icon: CheckCircle2, label: "Accepted", className: "bg-[var(--success)]/20 text-[var(--success)]" },
    declined: { icon: XCircle, label: "Declined", className: "bg-destructive/20 text-destructive" },
  };
  const c = config[status];
  return (
    <Badge variant="outline" className={`gap-1 border-0 ${c.className}`}>
      <c.icon className="size-3" />
      {c.label}
    </Badge>
  );
}

export function InvitesSection({
  invites,
  isLoading,
  onSendInvites,
}: {
  invites: CampaignInvite[] | undefined;
  isLoading: boolean;
  onSendInvites?: () => void;
}) {
  if (isLoading) return <InvitesEmptySkeleton />;

  const inviteList = invites ?? [];

  return (
    <Card className="overflow-hidden border-border bg-card p-5 lg:p-6">
      <div className="flex items-center gap-2">
        <h3 className="font-display text-base font-semibold">Invites</h3>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-foreground/70">
          {inviteList.length}
        </span>
      </div>

      {inviteList.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-5 md:flex-row md:justify-between">
          <div className="flex flex-col items-center gap-5 text-center md:flex-row md:text-left">
            <span className="grid size-20 place-items-center rounded-2xl bg-accent/10">
              <Send className="size-8 text-accent" strokeWidth={1.5} />
            </span>
            <div>
              <p className="font-medium">No invites sent yet</p>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                Invite curated talents to your campaign and start building your pipeline.
              </p>
            </div>
          </div>
          <button
            onClick={onSendInvites}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 md:w-auto"
          >
            <Send className="size-4" /> Send Invites
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {inviteList.map((invite) => {
            const talent =
              typeof invite.talent_id === "object" ? invite.talent_id : null;
            return (
              <div
                key={invite._id}
                className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 px-4 py-3"
              >
                <div className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-sm font-bold text-muted-foreground">
                  {talent?.full_legal_name?.charAt(0) ?? "?"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {talent?.full_legal_name || talent?.username || "Unknown"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {talent?.professions?.join(", ") || "Talent"}
                  </p>
                </div>
                <InviteStatusBadge status={invite.status} />
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
