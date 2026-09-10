"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Clapperboard, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useInviteTalentToCampaign } from "@/hooks/use-saved-talents";
import { useRecruiterCampaigns } from "@/hooks/use-campaigns";

export function BulkInviteDialog({
  open,
  onOpenChange,
  talentIds,
  onSent,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  talentIds: string[];
  onSent: () => void;
}) {
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const { data: campaignsData, isLoading } = useRecruiterCampaigns();
  const invite = useInviteTalentToCampaign();

  const campaigns = useMemo(
    () =>
      (campaignsData?.pages.flatMap((page) => page.data) ?? []).filter(
        (campaign) => campaign.status === "active",
      ),
    [campaignsData],
  );

  const send = async () => {
    if (!campaignId) return;
    const results = await Promise.allSettled(
      talentIds.map((talentId) =>
        invite.mutateAsync({
          campaignId,
          talentId,
          message: message.trim() || undefined,
        }),
      ),
    );
    const failed = results.filter((r) => r.status === "rejected").length;
    if (failed === 0) {
      toast.success(`Invited ${talentIds.length} talent`);
    } else {
      toast.error(
        `Sent ${results.length - failed} invites, ${failed} failed`,
      );
    }
    setCampaignId(null);
    setMessage("");
    onOpenChange(false);
    onSent();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setCampaignId(null);
          setMessage("");
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto border-border bg-card sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Invite {talentIds.length} talent</DialogTitle>
          <DialogDescription>
            Everyone selected will be invited to the campaign you pick.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-2">
          {isLoading ? (
            <>
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
            </>
          ) : campaigns.length === 0 ? (
            <div className="rounded-xl border border-border/70 bg-surface p-4 text-sm text-muted-foreground">
              No active campaigns yet.{" "}
              <Link
                href="/recruiter/campaigns/new"
                className="font-semibold text-primary hover:underline"
              >
                Create one
              </Link>{" "}
              to invite talent.
            </div>
          ) : (
            campaigns.map((campaign) => {
              const selected = campaignId === campaign._id;
              return (
                <button
                  key={campaign._id}
                  type="button"
                  onClick={() => setCampaignId(campaign._id)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                    selected
                      ? "border-primary bg-primary/10"
                      : "border-border/70 bg-surface hover:border-primary/40"
                  }`}
                >
                  <span
                    className={`grid size-10 shrink-0 place-items-center rounded-full ${
                      selected
                        ? "bg-primary text-primary-foreground"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    <Clapperboard className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-foreground">
                      {campaign.name}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {[campaign.role_type, campaign.location?.city]
                        .filter(Boolean)
                        .join(" • ")}
                    </span>
                  </span>
                </button>
              );
            })
          )}
        </div>

        <Textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Add a personal message (optional)..."
          maxLength={500}
          className="mt-4 resize-none rounded-xl border-border/70 bg-surface"
          rows={3}
        />

        <DialogFooter className="mt-4">
          <Button
            type="button"
            onClick={send}
            disabled={!campaignId || invite.isPending}
            className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Send className="size-4" />
            {invite.isPending ? "Sending..." : `Invite ${talentIds.length}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
