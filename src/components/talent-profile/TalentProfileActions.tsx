"use client";

import { useState } from "react";
import {
  Send,
  Star,
  Bookmark,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/providers/auth-store-provider";
import {
  useSaveTalent,
  useShortlistTalent,
  useStartConversation,
} from "@/hooks/use-talent-actions";
import type { TalentProfile, TalentProfilePreview } from "@/lib/api/talent";
import type { Campaign } from "@/lib/api/campaigns";

interface TalentProfileActionsProps {
  profile: TalentProfile | TalentProfilePreview;
  viewerRole: "talent" | "recruiter" | "admin" | null;
  campaigns?: Campaign[];
  campaignsLoading?: boolean;
}

const secondaryButton =
  "flex h-10 w-full flex-col items-center justify-center gap-1 rounded-xl border px-1 text-[11px] font-medium transition-all active:scale-95 sm:h-11 sm:flex-row sm:gap-1.5 sm:text-xs";

export function TalentProfileActions({
  profile,
  viewerRole,
  campaigns = [],
  campaignsLoading = false,
}: TalentProfileActionsProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");

  const username = profile.username ?? "";

  const { isSaved, isPending: savePending, toggleSave } = useSaveTalent(username);
  const { isShortlisted, isPending: shortlistPending, toggleShortlist } =
    useShortlistTalent(username, selectedCampaignId);
  const { start: startConversation, isPending: messagePending } =
    useStartConversation(username, viewerRole ?? undefined);

  const showShortlist =
    viewerRole === "recruiter" || viewerRole === "admin" || !isAuthenticated;
  const showSave =
    viewerRole === "recruiter" || viewerRole === "admin" || !isAuthenticated;

  return (
    <div className="mt-4 space-y-2.5">
      {showShortlist && (
        <Select
          value={selectedCampaignId}
          onValueChange={setSelectedCampaignId}
          disabled={campaignsLoading || campaigns.length === 0}
        >
          <SelectTrigger className="h-10 w-full rounded-xl text-xs">
            <SelectValue placeholder="Select campaign to shortlist" />
          </SelectTrigger>
          <SelectContent>
            {campaigns.length === 0 ? (
              <SelectItem value="none" disabled>
                No campaigns
              </SelectItem>
            ) : (
              campaigns.map((campaign) => (
                <SelectItem key={campaign._id} value={campaign._id}>
                  {campaign.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      )}

      {/* Primary action */}
      <Button
        onClick={startConversation}
        disabled={messagePending}
        className="h-12 w-full gap-2 rounded-xl bg-rootin text-sm font-semibold text-white shadow-[0_4px_14px_-6px_var(--rootin-blue)] hover:bg-rootin/90"
      >
        {messagePending ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <Send className="size-[18px]" />
        )}
        Message
      </Button>

      {/* Secondary actions — only shown for recruiter/admin viewers */}
      {(showShortlist || showSave) && (
        <div className="grid grid-cols-2 gap-2">
          {showShortlist && (
            <button
              onClick={toggleShortlist}
              disabled={!selectedCampaignId || shortlistPending}
              className={cn(
                secondaryButton,
                isShortlisted
                  ? "border-gold/40 bg-gold/10 text-gold"
                  : "border-border bg-card text-foreground/75 hover:bg-bg-surface-inset",
              )}
            >
              {shortlistPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Star className={cn("size-4", isShortlisted && "fill-current")} />
              )}
              {isShortlisted ? "Shortlisted" : "Shortlist"}
            </button>
          )}

          {showSave && (
            <button
              onClick={toggleSave}
              disabled={savePending}
              className={cn(
                secondaryButton,
                isSaved
                  ? "border-rootin/40 bg-rootin/10 text-rootin"
                  : "border-border bg-card text-foreground/75 hover:bg-bg-surface-inset",
              )}
            >
              {savePending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Bookmark className={cn("size-4", isSaved && "fill-current")} />
              )}
              {isSaved ? "Saved" : "Save"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
