"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Send, Star, Bookmark, Share2, Heart, Loader2 } from "lucide-react";
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
import { useLikeTalent } from "@/hooks/use-talent-profile";
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

export function TalentProfileActions({
  profile,
  viewerRole,
  campaigns = [],
  campaignsLoading = false,
}: TalentProfileActionsProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");

  const username = profile.username ?? "";

  const { isLiked, isPending: likePending, toggleLike } = useLikeTalent(username);
  const { isSaved, isPending: savePending, toggleSave } = useSaveTalent(username);
  const { isShortlisted, isPending: shortlistPending, toggleShortlist } =
    useShortlistTalent(username, selectedCampaignId);
  const { start: startConversation, isPending: messagePending } =
    useStartConversation(username, viewerRole ?? undefined);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const showShortlist =
    viewerRole === "recruiter" || viewerRole === "admin" || !isAuthenticated;
  const showSave =
    viewerRole === "recruiter" || viewerRole === "admin" || !isAuthenticated;

  return (
    <div className="mt-5 space-y-3">
      {showShortlist && (
        <Select
          value={selectedCampaignId}
          onValueChange={setSelectedCampaignId}
          disabled={campaignsLoading || campaigns.length === 0}
        >
          <SelectTrigger className="h-12 w-full rounded-xl text-xs sm:text-sm">
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

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <Button
          onClick={startConversation}
          disabled={messagePending}
          className="h-12 w-full gap-2 rounded-xl bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-button)] hover:bg-primary/90 hover:shadow-[var(--shadow-button-hover)] sm:px-5 sm:text-sm"
        >
          {messagePending ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Send className="size-5" />
          )}
          Message
        </Button>

        {showShortlist && (
          <button
            onClick={toggleShortlist}
            disabled={!selectedCampaignId || shortlistPending}
            className={cn(
              "flex h-12 w-full items-center justify-center gap-2 rounded-xl border px-3 text-xs font-semibold transition-all active:scale-95 sm:px-5 sm:text-sm",
              isShortlisted
                ? "border-gold/40 bg-gold/10 text-gold"
                : "profile-action",
            )}
          >
            {shortlistPending ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Star className={cn("size-5", isShortlisted && "fill-current")} />
            )}
            {isShortlisted ? "Shortlisted" : "Shortlist"}
          </button>
        )}

        {showSave && (
          <button
            onClick={toggleSave}
            disabled={savePending}
            className={cn(
              "flex h-12 w-full items-center justify-center gap-2 rounded-xl border px-3 text-xs font-semibold transition-all active:scale-95 sm:px-5 sm:text-sm",
              isSaved
                ? "border-primary/40 bg-primary/10 text-primary"
                : "profile-action",
            )}
          >
            {savePending ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Bookmark className={cn("size-5", isSaved && "fill-current")} />
            )}
            {isSaved ? "Saved" : "Save"}
          </button>
        )}

        <button
          onClick={handleShare}
          className="profile-action flex h-12 w-full items-center justify-center gap-2 rounded-xl px-3 text-xs font-semibold transition-all active:scale-95 sm:px-5 sm:text-sm"
        >
          <Share2 className="size-5" />
          Share
        </button>

        <button
          onClick={toggleLike}
          disabled={likePending}
          className={cn(
            "profile-action flex h-12 w-full items-center justify-center gap-2 rounded-xl px-3 text-xs font-semibold transition-all active:scale-95 sm:px-5 sm:text-sm",
            isLiked ? "text-destructive" : "text-foreground",
          )}
        >
          {likePending ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Heart className={cn("size-5", isLiked && "fill-current")} />
          )}
          {isLiked ? "Liked" : "Like"}
        </button>
      </div>
    </div>
  );
}
