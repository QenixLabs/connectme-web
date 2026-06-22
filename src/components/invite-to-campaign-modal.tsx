"use client";

import { useState } from "react";
import { Send, FolderOpen } from "lucide-react";
import { useCampaigns } from "@/lib/api/hooks/useCampaigns";
import { useInviteTalent, useBulkInviteTalent } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePopup } from "@/hooks/use-popup";
import { useTierGuard } from "@/hooks/use-tier-guard";
import { useFeatureGuard } from "@/hooks/use-feature-guard";
import Link from "next/link";

interface InviteToCampaignModalProps {
  open: boolean;
  onClose: () => void;
  talentId?: string;
  talentIds?: string[];
  talentName?: string;
}

export function InviteToCampaignModal({
  open,
  onClose,
  talentId,
  talentIds,
  talentName,
}: InviteToCampaignModalProps) {
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [message, setMessage] = useState("");
  const { data: campaignsData } = useCampaigns({ status: "active" });
  const invite = useInviteTalent();
  const bulkInvite = useBulkInviteTalent();
  const { show } = usePopup();
  const { guard } = useTierGuard(3);
  const { handleFeatureError } = useFeatureGuard();

  const campaigns = campaignsData?.pages.flatMap((p) => p.data) ?? [];
  const isBulk = (talentIds?.length ?? 0) > 0;
  const ids = isBulk ? talentIds! : talentId ? [talentId] : [];

  const handleSend = async () => {
    if (!selectedCampaign || ids.length === 0) return;
    guard(async () => {
      try {
        if (isBulk) {
          const result = await bulkInvite.mutateAsync({
            campaignId: selectedCampaign,
            talentIds: ids,
            message: message.trim() || undefined,
          });
          const campaign = campaigns.find((c) => c._id === selectedCampaign);
          show({
            title: `Invites sent`,
            description: `${result.successful.length} of ${ids.length} to ${campaign?.name || "campaign"}`,
            variant: "success",
            position: "bottom-center",
          });
        } else {
          await invite.mutateAsync({
            campaignId: selectedCampaign,
            talentId: ids[0],
            message: message.trim() || undefined,
          });
          const campaign = campaigns.find((c) => c._id === selectedCampaign);
          show({
            title: `Invite sent to ${talentName || "talent"}`,
            description: campaign?.name || "campaign",
            variant: "success",
            position: "bottom-center",
          });
        }
        onClose();
        setSelectedCampaign("");
        setMessage("");
      } catch (err) {
        if (handleFeatureError(err)) return;
        const error = err as { response?: { data?: { message?: string } } };
        show({
          title: isBulk ? "Failed to send invites" : "Failed to send invite",
          description: error.response?.data?.message,
          variant: "error",
          position: "bottom-center",
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {isBulk ? `Invite ${ids.length} talents to Campaign` : 'Invite to Campaign'}
          </DialogTitle>
        </DialogHeader>

        {campaigns.length === 0 ? (
          <div className="text-center py-8">
            <FolderOpen className="w-10 h-10 text-text-muted mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-sm text-text-secondary">No active campaigns</p>
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
                Campaign
              </label>
              <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select campaign" />
                </SelectTrigger>
                <SelectContent>
                  {campaigns.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name}
                      {c.deadline ? ` · Due ${new Date(c.deadline).toLocaleDateString()}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-text-secondary mb-1.5 block">
                Message (optional)
              </label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a personal note..."
                maxLength={500}
                rows={3}
                className="resize-none"
              />
              <p className="text-2xs text-text-muted mt-1 text-right">
                {message.length}/500
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                disabled={!selectedCampaign || invite.isPending || bulkInvite.isPending}
              >
                <Send className="w-4 h-4 mr-1.5" strokeWidth={1.5} />
                {isBulk ? 'Send Invites' : 'Send Invite'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
