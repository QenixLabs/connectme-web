"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BadgeCheck,
  Bookmark,
  FolderKanban,
  MapPin,
  Search,
  Send,
  Share2,
  User,
  X,
} from "lucide-react";
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
import {
  useInviteTalentToCampaign,
  useRemoveSavedTalent,
  useSavedTalents,
} from "@/hooks/use-saved-talents";
import { useRecruiterCampaigns } from "@/hooks/use-campaigns";
import type { SavedTalentItem } from "@/lib/api/talent";

function timeAgo(iso?: string): string {
  if (!iso) return "";
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString();
}

function formatLocation(loc?: SavedTalentItem["location"]): string {
  if (!loc) return "Location not set";
  const parts = [loc.city, loc.state].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "Location not set";
}

function InviteDialog({
  talent,
  open,
  onOpenChange,
}: {
  talent: SavedTalentItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

  const send = () => {
    if (!talent || !campaignId) return;
    invite.mutate(
      { campaignId, talentId: talent.user_id, message: message.trim() || undefined },
      {
        onSuccess: () => {
          setCampaignId(null);
          setMessage("");
          onOpenChange(false);
        },
      },
    );
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
          <DialogTitle>
            Invite {talent?.full_legal_name || talent?.username || "talent"} to a campaign
          </DialogTitle>
          <DialogDescription>
            Pick one of your active campaigns to send an invite. They will see
            it in their opportunities.
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
                      selected ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                    }`}
                  >
                    <FolderKanban className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-foreground">
                      {campaign.name}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {[campaign.role_type, campaign.location?.city]
                        .filter(Boolean)
                        .join(" • ")}
                      {campaign.applications_count > 0 &&
                        ` • ${campaign.applications_count} applicants`}
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
            {invite.isPending ? "Sending..." : "Send Invite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function SavedTalentPage() {
  const { data: talents, isLoading } = useSavedTalents();
  const removeSaved = useRemoveSavedTalent();
  const [inviteTarget, setInviteTarget] = useState<SavedTalentItem | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<SavedTalentItem | null>(null);

  const share = (talent: SavedTalentItem) => {
    const url = `${window.location.origin}/talent/${talent.username}`;
    navigator.clipboard
      .writeText(url)
      .then(() => toast.success("Profile link copied"))
      .catch(() => toast.error("Could not copy link"));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(80%_60%_at_50%_0%,rgba(26,91,219,0.12),transparent_60%)]" />

      <div className="container-page relative pb-16 pt-8">
        {/* Hero header */}
        <header className="relative isolate overflow-hidden rounded-[2rem] border border-border/60 bg-surface px-6 py-8 shadow-[0_8px_40px_-20px_rgba(0,0,0,0.35)] md:px-8 md:py-10">
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-background/95 via-background/85 to-background/40" />
          <div className="relative z-20 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Bookmark className="size-3.5" />
                <span>Your shortlist</span>
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                Saved Talent
              </h1>
              <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
                Everyone you have bookmarked, in one place. Invite them to a
                campaign, share their profile, or dive into the full profile.
              </p>
            </div>
            <Button
              asChild
              className="h-12 shrink-0 gap-2 rounded-xl bg-primary px-6 text-base font-bold text-primary-foreground shadow-button hover:bg-primary/90"
            >
              <Link href="/recruiter/find-talent">
                <Search className="size-5" /> Find Talent
              </Link>
            </Button>
          </div>
        </header>

        {/* List */}
        {isLoading ? (
          <div className="mt-6 space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        ) : (talents?.length ?? 0) === 0 ? (
          <div className="mt-6 flex flex-col items-center rounded-2xl border border-border/70 bg-surface px-6 py-16 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-primary/10 text-primary">
              <Bookmark className="size-7" />
            </span>
            <h2 className="mt-4 text-xl font-bold text-foreground">
              No saved talent yet
            </h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Bookmark talent while browsing to build your shortlist, then
              invite them to your campaigns from here.
            </p>
            <Button
              asChild
              className="mt-5 gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Link href="/recruiter/find-talent">
                <Search className="size-4" /> Discover talent
              </Link>
            </Button>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {talents!.map((talent) => {
              const name = talent.full_legal_name || talent.username;
              const roles = talent.professions?.slice(0, 3) ?? [];
              const tags = [
                ...(talent.specialties ?? []),
                ...(talent.professions ?? []),
              ]
                .filter((tag, index, all) => all.indexOf(tag) === index)
                .slice(0, 4);
              const extraCount =
                (talent.specialties?.length ?? 0) +
                (talent.professions?.length ?? 0) -
                tags.length;

              return (
                <article
                  key={talent.user_id}
                  className="grid grid-cols-[64px_minmax(0,1fr)] gap-4 rounded-2xl border border-border/70 bg-surface p-3 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.25)] sm:grid-cols-[96px_minmax(0,1fr)_220px] sm:gap-5 sm:p-4"
                >
                  <div className="relative size-16 overflow-hidden rounded-xl bg-muted sm:size-24">
                    {talent.profile_photo ? (
                      <Image
                        src={talent.profile_photo}
                        alt={name}
                        fill
                        sizes="96px"
                        className="object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center bg-secondary">
                        <User className="size-8 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 self-center">
                    <h2 className="flex items-center gap-1.5 truncate text-base font-extrabold text-foreground sm:text-lg">
                      <span className="truncate">{name}</span>
                      {talent.is_verified && (
                        <BadgeCheck className="size-4 shrink-0 text-primary" />
                      )}
                    </h2>
                    <p className="mt-1 truncate text-xs font-semibold text-muted-foreground sm:text-sm">
                      {roles.length > 0 ? roles.join("  |  ") : "Talent"}
                    </p>
                    <p className="mt-1 flex items-center gap-1 truncate text-xs font-semibold text-muted-foreground sm:text-sm">
                      <MapPin className="size-4 shrink-0 text-primary" />
                      {formatLocation(talent.location)}
                    </p>
                    {tags.length > 0 && (
                      <div className="mt-2 hidden flex-wrap gap-1.5 sm:flex">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-lg bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                        {extraCount > 0 && (
                          <span className="rounded-lg bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                            +{extraCount}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="col-span-2 flex flex-col gap-2 border-t border-border/70 pt-3 sm:col-span-1 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
                    <div className="flex gap-2">
                      <Button
                        asChild
                        className="flex-1 rounded-xl bg-primary text-xs font-bold text-primary-foreground hover:bg-primary/90"
                      >
                        <Link href={`/talent/${talent.username}`}>
                          View Profile
                        </Link>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setInviteTarget(talent)}
                        className="flex-1 gap-1 rounded-xl border-primary/40 px-2 text-xs font-bold text-primary hover:bg-primary/10 hover:text-primary"
                      >
                        <Send className="size-3.5" /> Invite
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        aria-label={`Share ${name}'s profile`}
                        onClick={() => share(talent)}
                        className="rounded-xl border-primary/40 px-2 text-primary hover:bg-primary/10 hover:text-primary"
                      >
                        <Share2 className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Remove ${name} from saved`}
                        onClick={() => setConfirmRemove(talent)}
                        className="rounded-full text-muted-foreground hover:text-foreground"
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                    <p className="mt-auto flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                      <span className="size-2.5 rounded-full bg-emerald-500" />
                      Saved {timeAgo(talent.saved_at)}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <InviteDialog
        talent={inviteTarget}
        open={inviteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setInviteTarget(null);
        }}
      />

      <Dialog
        open={confirmRemove !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmRemove(null);
        }}
      >
        <DialogContent className="border-border bg-card sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove from saved?</DialogTitle>
            <DialogDescription>
              {confirmRemove?.full_legal_name || confirmRemove?.username} will be
              removed from your saved talent list.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmRemove(null)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={removeSaved.isPending}
              onClick={() => {
                if (!confirmRemove) return;
                removeSaved.mutate(confirmRemove.username, {
                  onSuccess: () => setConfirmRemove(null),
                });
              }}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
