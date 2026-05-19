"use client";

import { useState } from "react";
import { Send, FolderOpen } from "lucide-react";
import { useCampaigns } from "@/lib/api/hooks/useCampaigns";
import { useInviteTalent } from "@/lib/api";
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
import { toast } from "sonner";
import Link from "next/link";

interface InviteToCampaignModalProps {
  open: boolean;
  onClose: () => void;
  talentId: string;
  talentName: string;
}

export function InviteToCampaignModal({
  open,
  onClose,
  talentId,
  talentName,
}: InviteToCampaignModalProps) {
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [message, setMessage] = useState("");
  const { data: campaignsData } = useCampaigns({ status: "active" });
  const invite = useInviteTalent();

  const campaigns = campaignsData?.pages.flatMap((p) => p.data) ?? [];

  const handleSend = async () => {
    if (!selectedCampaign) return;
    try {
      await invite.mutateAsync({
        campaignId: selectedCampaign,
        talentId,
        message: message.trim() || undefined,
      });
      const campaign = campaigns.find((c) => c._id === selectedCampaign);
      toast.success(`Invite sent to ${talentName} for ${campaign?.name || "campaign"}`);
      onClose();
      setSelectedCampaign("");
      setMessage("");
    } catch {
      toast.error("Failed to send invite");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Invite to Campaign</DialogTitle>
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
                disabled={!selectedCampaign || invite.isPending}
              >
                <Send className="w-4 h-4 mr-1.5" strokeWidth={1.5} />
                Send Invite
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
