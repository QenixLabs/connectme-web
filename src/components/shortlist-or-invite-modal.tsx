"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { FolderOpen, Loader2, Check, Send, UserPlus } from "lucide-react";
import { campaignApi } from "@/lib/api";
import type { Campaign } from "@/lib/api/campaign";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { usePopup } from "@/hooks/use-popup";
import { useTierGuard } from "@/hooks/use-tier-guard";
import Link from "next/link";

interface CampaignWithApps {
  campaign: Campaign;
  loading: boolean;
  application?: { _id: string; is_shortlisted: boolean } | null;
}

interface ShortlistOrInviteModalProps {
  open: boolean;
  onClose: () => void;
  talentUserId: string;
  talentName: string;
}

export function ShortlistOrInviteModal({
  open,
  onClose,
  talentUserId,
  talentName,
}: ShortlistOrInviteModalProps) {
  const [campaigns, setCampaigns] = useState<CampaignWithApps[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { show } = usePopup();
  const showRef = useRef(show);
  showRef.current = show;
  const { guard } = useTierGuard(3);

  const loadCampaigns = useCallback(async () => {
    if (!open) return;
    setLoading(true);
    try {
      const res = await campaignApi.getAll({ status: "active" });
      const initial = res.data.map((c) => ({ campaign: c, loading: true }));
      setCampaigns(initial);

      await Promise.all(
        initial.map(async ({ campaign }, idx) => {
          try {
            const apps = await campaignApi.getApplications(campaign._id);
            const app = apps.find((a) => {
              const tid =
                typeof a.talent_id === "object" && a.talent_id !== null
                  ? a.talent_id._id
                  : a.talent_id;
              return tid === talentUserId;
            });
            setCampaigns((prev) => {
              const next = [...prev];
              next[idx] = {
                campaign,
                loading: false,
                application: app
                  ? { _id: app._id, is_shortlisted: !!app.is_shortlisted }
                  : null,
              };
              return next;
            });
          } catch {
            setCampaigns((prev) => {
              const next = [...prev];
              next[idx] = { campaign, loading: false, application: null };
              return next;
            });
          }
        }),
      );
    } catch {
      showRef.current({
        title: "Failed to load campaigns",
        variant: "error",
        position: "bottom-center",
      });
    } finally {
      setLoading(false);
    }
  }, [open, talentUserId]);

  useEffect(() => {
    if (open) {
      loadCampaigns();
      setMessage("");
    }
  }, [open, loadCampaigns]);

  const handleShortlist = async (
    campaignId: string,
    applicationId: string,
  ) => {
    guard(async () => {
      setProcessingId(campaignId + "-shortlist");
      try {
        await campaignApi.addToShortlist(campaignId, applicationId);
        showRef.current({
          title: "Added to shortlist",
          variant: "success",
          position: "bottom-center",
        });
        setCampaigns((prev) =>
          prev.map((c) =>
            c.campaign._id === campaignId && c.application
              ? {
                  ...c,
                  application: { ...c.application, is_shortlisted: true },
                }
              : c,
          ),
        );
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        showRef.current({
          title:
            error?.response?.data?.message || "Failed to shortlist",
          variant: "error",
          position: "bottom-center",
        });
      } finally {
        setProcessingId(null);
      }
    });
  };

  const handleInvite = async (campaignId: string) => {
    guard(async () => {
      setProcessingId(campaignId + "-invite");
      try {
        await campaignApi.invite(campaignId, {
          talent_id: talentUserId,
          message: message.trim() || undefined,
        });
        showRef.current({
          title: "Invite sent",
          variant: "success",
          position: "bottom-center",
        });
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        showRef.current({
          title:
            error?.response?.data?.message || "Failed to send invite",
          variant: "error",
          position: "bottom-center",
        });
      } finally {
        setProcessingId(null);
      }
    });
  };

  const activeCampaigns = campaigns.filter(
    (c) => c.campaign.status === "active",
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">
            Shortlist or Invite {talentName}
          </DialogTitle>
        </DialogHeader>

        {loading && campaigns.length === 0 ? (
          <div className="space-y-3 py-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-16 bg-muted rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : activeCampaigns.length === 0 ? (
          <div className="text-center py-8">
            <FolderOpen
              className="w-10 h-10 text-text-muted mx-auto mb-3"
              strokeWidth={1.5}
            />
            <p className="text-sm text-text-secondary">
              No active campaigns
            </p>
            <Link
              href="/recruiter/campaigns"
              className="mt-3 inline-block text-sm text-brand hover:text-brand-hover font-medium"
            >
              Create a campaign
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-text-secondary mb-1.5 block">
                Message (optional for invites)
              </label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a personal note..."
                maxLength={500}
                rows={2}
                className="resize-none"
              />
              <p className="text-2xs text-text-muted mt-1 text-right">
                {message.length}/500
              </p>
            </div>

            <div className="space-y-2">
              {activeCampaigns.map((c) => (
                <div
                  key={c.campaign._id}
                  className="flex items-center justify-between p-3 rounded-xl border border-border bg-card"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {c.campaign.name}
                    </p>
                    <p className="text-2xs text-text-muted">
                      {c.campaign.applications_count} application
                      {c.campaign.applications_count !== 1 ? "s" : ""}
                      {c.campaign.deadline
                        ? ` · Due ${new Date(c.campaign.deadline).toLocaleDateString()}`
                        : ""}
                    </p>
                  </div>

                  <div className="ml-3 shrink-0">
                    {c.loading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-text-muted" />
                    ) : c.application ? (
                      c.application.is_shortlisted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-100 text-green-700 text-xs font-medium">
                          <Check className="w-3.5 h-3.5" />
                          Shortlisted
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleShortlist(
                              c.campaign._id,
                              c.application!._id,
                            )
                          }
                          disabled={!!processingId}
                        >
                          {processingId ===
                          c.campaign._id + "-shortlist" ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                          ) : (
                            <UserPlus className="w-3.5 h-3.5 mr-1" />
                          )}
                          Shortlist
                        </Button>
                      )
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleInvite(c.campaign._id)}
                        disabled={!!processingId}
                      >
                        {processingId ===
                        c.campaign._id + "-invite" ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                        ) : (
                          <Send className="w-3.5 h-3.5 mr-1" />
                        )}
                        Invite
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
