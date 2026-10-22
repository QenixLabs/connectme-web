"use client";

import { useMemo } from "react";
import {
  Send,
  Star,
  Bookmark,
  MoreHorizontal,
  Loader2,
  Link as LinkIcon,
  Check,
  Heart,
  Share2,
  UserPlus,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ShareProfileDialog } from "@/components/shared/share-profile-dialog";
import {
  useStartConversation,
  useSaveTalent,
  useShortlistTalent,
  useConnectionRequest,
} from "@/hooks/use-talent-actions";
import { useLikeTalent } from "@/hooks/use-talent-profile";
import { useShareProfile } from "@/hooks/use-share-profile";
import { useAuthStore } from "@/providers/auth-store-provider";
import type {
  TalentProfile,
  TalentProfilePreview,
  PortfolioApiResponse,
  Credit,
  Testimonial,
  Award as AwardType,
} from "@/lib/api/talent";
import type { Campaign } from "@/lib/api/campaigns";
import type { ShareProfileTarget } from "@/lib/share";
import { selectBestTalentStats } from "@/lib/share-card";

interface TalentProfileActionsProps {
  profile: TalentProfile | TalentProfilePreview;
  viewerRole: "talent" | "recruiter" | "admin" | null;
  campaigns?: Campaign[];
  portfolioItems?: PortfolioApiResponse[];
  credits?: Credit[];
  testimonials?: Testimonial[];
  awards?: AwardType[];
}

function CampaignShortlistItem({
  username,
  campaign,
}: {
  username: string;
  campaign: Campaign;
}) {
  const { isShortlisted, isPending, toggleShortlist } = useShortlistTalent(
    username,
    campaign._id,
  );

  return (
    <DropdownMenuItem
      onSelect={(e) => {
        e.preventDefault();
        toggleShortlist();
      }}
      disabled={isPending}
      className="flex cursor-pointer items-center justify-between gap-2"
    >
      <span className="truncate">{campaign.name}</span>
      {isShortlisted && <Check className="size-4 shrink-0 text-brand" />}
    </DropdownMenuItem>
  );
}

function ShortlistButton({
  username,
  campaigns,
}: {
  username: string;
  campaigns: Campaign[];
}) {
  if (campaigns.length === 0) {
    return (
      <button
        onClick={() => toast.error("No active campaigns to shortlist to")}
        className="flex items-center justify-center gap-1.5 rounded-2xl bg-card py-3.5 text-xs font-semibold text-foreground shadow-[0_6px_24px_rgba(15,23,42,0.05)] transition-all active:scale-95"
      >
        <Star className="size-4" /> Shortlist
      </button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center justify-center gap-1.5 rounded-2xl bg-card py-3.5 text-xs font-semibold text-foreground shadow-[0_6px_24px_rgba(15,23,42,0.05)] transition-all active:scale-95">
          <Star className="size-4" /> Shortlist
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-56">
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
          Select campaign
        </div>
        {campaigns.map((campaign) => (
          <CampaignShortlistItem
            key={campaign._id}
            username={username}
            campaign={campaign}
          />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TalentProfileActions({
  profile,
  viewerRole,
  campaigns = [],
  portfolioItems = [],
  credits = [],
  testimonials = [],
  awards = [],
}: TalentProfileActionsProps) {
  const username = profile.username ?? "";
  const isRecruiter = viewerRole === "recruiter" || viewerRole === "admin";

  const authUser = useAuthStore((s) => s.user);
  const isOwnProfile = !!authUser && authUser._id === profile.user_id;
  const requiresTier3 = !!authUser && authUser.verification_tier < 3;

  const statItems = useMemo(
    () =>
      selectBestTalentStats({
        profile: profile as TalentProfile,
        portfolioItems,
        credits,
        testimonials,
        awards,
      }),
    [profile, portfolioItems, credits, testimonials, awards],
  );

  const { start: startConversation, isPending: messagePending } =
    useStartConversation(username, viewerRole ?? undefined);
  const { isSaved, isPending: savePending, toggleSave } = useSaveTalent(username);
  const { isLiked, isPending: likePending, toggleLike } = useLikeTalent(username);
  const {
    status: connectionStatus,
    isPending: connectPending,
    send: sendConnectionRequest,
  } = useConnectionRequest(profile.user_id ?? "");

  // The shared profile always points at the canonical public URL — never at
  // `window.location.href`, which may carry a portfolio deep link such as
  // `?item=<id>`.
  const shareTarget = useMemo<ShareProfileTarget>(
    () => ({
      role: "talent",
      slug: username,
      name:
        profile.professional_name?.trim() ||
        profile.full_legal_name?.trim() ||
        username,
      headline:
        profile.headline?.trim() ||
        profile.professions?.join(" · ") ||
        undefined,
      photoUrl: profile.profile_photo,
      isVerified: profile.is_verified,
      tags:
        profile.professions && profile.professions.length > 0
          ? profile.professions.slice(0, 4)
          : undefined,
      statItems,
    }),
    [
      username,
      profile.professional_name,
      profile.full_legal_name,
      profile.headline,
      profile.professions,
      profile.profile_photo,
      profile.is_verified,
      statItems,
    ],
  );

  const share = useShareProfile({
    target: shareTarget,
    source: "public_talent_profile",
  });

  return (
    <>
      {/* Primary row: Connect + Message */}
      <div className="mb-1 flex gap-2">
        {!isOwnProfile && (
          <button
            onClick={sendConnectionRequest}
            disabled={
              connectPending ||
              connectionStatus === "pending" ||
              connectionStatus === "connected" ||
              requiresTier3
            }
            title={
              requiresTier3
                ? "Tier 3 verification is required to connect"
                : undefined
            }
            className="flex h-[52px] shrink-0 items-center justify-center gap-2 rounded-2xl bg-card px-4 text-sm font-semibold text-foreground shadow-[0_6px_24px_rgba(15,23,42,0.05)] transition-all active:scale-95 disabled:opacity-70"
          >
            {connectPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : connectionStatus === "connected" ? (
              <UserCheck className="size-4 text-brand" />
            ) : (
              <UserPlus className="size-4" />
            )}
            {connectionStatus === "pending"
              ? "Pending"
              : connectionStatus === "connected"
                ? "Connected"
                : requiresTier3
                  ? "Tier 3 Required"
                  : "Connect"}
          </button>
        )}

        <button
          onClick={startConversation}
          disabled={messagePending}
          className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-2xl text-sm font-semibold text-brand-foreground shadow-[0_6px_24px_rgba(15,23,42,0.05)] disabled:opacity-70"
          style={{ background: "var(--gradient-brand)" }}
        >
          {messagePending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          Message Talent
        </button>
      </div>

      {/* Icon row: Like + Share */}
      <div className="mb-1 flex gap-2">
        <button
          onClick={toggleLike}
          disabled={likePending}
          aria-label={isLiked ? "Unlike talent" : "Like talent"}
           className="grid h-12 flex-1 place-items-center rounded-2xl bg-card text-foreground shadow-[0_6px_24px_rgba(15,23,42,0.05)] transition-all active:scale-95 disabled:opacity-70"
        >
          <Heart
            className={`size-5 transition-colors ${
              isLiked ? "fill-red-500 text-red-500" : ""
            }`}
          />
        </button>

        <button
          type="button"
          onClick={() => void share.shareDestination("whatsapp")}
          disabled={share.isBusy}
          aria-label="Share profile"
          className="grid h-12 flex-1 place-items-center rounded-2xl bg-card text-foreground shadow-[0_6px_24px_rgba(15,23,42,0.05)] transition-all active:scale-95 disabled:opacity-70"
        >
          {share.isBusy ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Share2 className="size-5" />
          )}
        </button>
      </div>

      {/* Secondary buttons — hidden for talent viewers (and guests) */}
      {isRecruiter && (
        <div className="grid grid-cols-3 gap-2">
          <ShortlistButton username={username} campaigns={campaigns} />

          <button
            onClick={toggleSave}
            disabled={savePending}
            className="flex items-center justify-center gap-1.5 rounded-2xl bg-card py-3.5 text-xs font-semibold text-foreground shadow-[0_6px_24px_rgba(15,23,42,0.05)] transition-all active:scale-95 disabled:opacity-70"
          >
            {savePending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Bookmark className="size-4" />
            )}
            {isSaved ? "Saved" : "Save"}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center justify-center gap-1.5 rounded-2xl bg-card py-3.5 text-xs font-semibold text-foreground shadow-[0_6px_24px_rgba(15,23,42,0.05)] transition-all active:scale-95">
                <MoreHorizontal className="size-4" /> More
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                  void share.copyLink();
                }}
                className="cursor-pointer"
              >
                <LinkIcon className="mr-2 size-4" /> Copy link
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <ShareProfileDialog
        open={share.isOpen}
        onOpenChange={(next) => {
          if (!next) share.close();
        }}
        target={shareTarget}
        canonicalUrl={share.canonicalUrl}
        copyStatus={share.copyStatus}
        error={share.error}
        status={share.status}
        offerLinkCopy={share.offerLinkCopy}
        isPreparingCard={share.isPreparingCard}
        isBusy={share.isBusy}
        isLocalLink={share.isLocalLink}
        showInstagramInstructions={share.showInstagramInstructions}
        instagramPreview={share.instagramPreview}
        instagramCaption={share.instagramCaption}
        captionCopied={share.captionCopied}
        onDismissInstagramInstructions={() =>
          share.setShowInstagramInstructions(false)
        }
        onCopyLink={() => void share.copyLink()}
        onCopyCaption={() => void share.copyCaption()}
        onShareDestination={(destination) =>
          void share.shareDestination(destination)
        }
        onDownloadCard={() => void share.downloadCard()}
      />
    </>
  );
}
