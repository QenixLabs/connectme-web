"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Bookmark,
  Check,
  MapPin,
  Plus,
  Search,
  Send,
  Share2,
  User,
  UsersRound,
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
import {
  useRemoveSavedTalent,
  useSavedTalents,
} from "@/hooks/use-saved-talents";
import { InviteTalentDialog } from "@/components/recruiter-app/InviteTalentDialog";
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

export default function SavedTalentPage() {
  const { data: talents, isLoading } = useSavedTalents();
  const removeSaved = useRemoveSavedTalent();
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [inviteTarget, setInviteTarget] = useState<SavedTalentItem | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<SavedTalentItem | null>(null);

  const toggleSelected = (userId: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });

  const compareSelected = () => {
    const usernames = (talents ?? [])
      .filter((t) => selected.has(t.user_id))
      .map((t) => t.username);
    if (usernames.length === 0) return;
    const params = new URLSearchParams({
      ids: usernames.join(","),
      from: "saved",
    });
    router.push(`/recruiter/compare?${params.toString()}`);
  };

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
                  className={`relative grid grid-cols-[64px_minmax(0,1fr)] gap-4 rounded-2xl border bg-surface p-3 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.25)] sm:grid-cols-[96px_minmax(0,1fr)_220px] sm:gap-5 sm:p-4 ${
                    selected.has(talent.user_id)
                      ? "border-primary/50 ring-1 ring-primary/10"
                      : "border-border/70"
                  }`}
                >
                  <Button
                    type="button"
                    variant={selected.has(talent.user_id) ? "default" : "outline"}
                    size="icon"
                    aria-label={`${selected.has(talent.user_id) ? "Deselect" : "Select"} ${name}`}
                    onClick={() => toggleSelected(talent.user_id)}
                    className="absolute right-3 top-3 z-10 size-8 rounded-full"
                  >
                    {selected.has(talent.user_id) ? <Check /> : <Plus />}
                  </Button>
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

      <InviteTalentDialog
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

      {selected.size > 0 && (
        <div className="fixed inset-x-0 bottom-16 z-30 px-4 md:bottom-6">
          <div className="mx-auto flex max-w-[460px] gap-2 rounded-2xl border bg-card p-2 shadow-card-lift">
            <Button
              className="h-11 min-w-0 flex-1 rounded-xl"
              onClick={compareSelected}
            >
              <UsersRound /> Compare {selected.size}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-11 rounded-xl"
              aria-label="Clear selection"
              onClick={() => setSelected(new Set())}
            >
              <X />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
