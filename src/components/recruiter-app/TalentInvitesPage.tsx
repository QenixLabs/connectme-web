"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BadgeCheck,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Eye,
  FolderKanban,
  MapPin,
  MessageSquare,
  Search,
  Send,
  Trash2,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCancelCampaignInvite,
  useRecruiterInvites,
  useSendCampaignInviteReminder,
} from "@/hooks/use-campaigns";
import type { RecruiterInvite } from "@/lib/api/campaigns";

type Status = "Pending" | "Accepted" | "Declined";

const TABS: Array<{ label: string; note: string; status?: Status; icon: typeof Send }> = [
  { label: "Sent", note: "All invitations you've sent", icon: Send },
  { label: "Pending", note: "Awaiting response", status: "Pending", icon: Clock3 },
  { label: "Accepted", note: "Talent confirmed", status: "Accepted", icon: Check },
  { label: "Declined", note: "Not interested", status: "Declined", icon: X },
];

function statusOf(invite: RecruiterInvite): Status {
  if (invite.status === "accepted") return "Accepted";
  if (invite.status === "declined") return "Declined";
  return "Pending";
}

function formatSentDate(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatusPill({ status }: { status: Status }) {
  const Icon = status === "Accepted" ? Check : status === "Declined" ? X : Clock3;
  const styles =
    status === "Accepted"
      ? "bg-emerald-500/10 text-emerald-600"
      : status === "Declined"
        ? "bg-rose-500/10 text-rose-600"
        : "bg-amber-500/10 text-amber-600";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${styles}`}
    >
      <Icon className="size-3.5" />
      {status}
    </span>
  );
}

export default function TalentInvitesPage() {
  const { data: invites, isLoading } = useRecruiterInvites();
  const cancelInvite = useCancelCampaignInvite();
  const sendReminder = useSendCampaignInviteReminder();

  const [activeTab, setActiveTab] = useState("Sent");
  const [query, setQuery] = useState("");
  const [campaignFilter, setCampaignFilter] = useState("all");
  const [sort, setSort] = useState<"latest" | "oldest">("latest");
  const [confirmCancel, setConfirmCancel] = useState<RecruiterInvite | null>(null);

  const items = useMemo(() => invites ?? [], [invites]);

  const campaignOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const invite of items) {
      if (invite.campaign) map.set(invite.campaign._id, invite.campaign.name);
    }
    return [...map.entries()];
  }, [items]);

  const counts = useMemo(
    () => ({
      Sent: items.length,
      Pending: items.filter((i) => i.status === "pending").length,
      Accepted: items.filter((i) => i.status === "accepted").length,
      Declined: items.filter((i) => i.status === "declined").length,
    }),
    [items],
  );

  const filtered = useMemo(() => {
    const tab = TABS.find((t) => t.label === activeTab);
    let source = items;
    if (tab?.status) {
      source = source.filter(
        (invite) => statusOf(invite) === tab.status,
      );
    }
    if (campaignFilter !== "all") {
      source = source.filter((invite) => invite.campaign_id === campaignFilter);
    }
    const q = query.trim().toLowerCase();
    if (q) {
      source = source.filter((invite) =>
        `${invite.talent.full_legal_name ?? ""} ${invite.talent.username ?? ""} ${
          invite.campaign?.name ?? ""
        } ${invite.campaign?.role_type ?? ""}`
          .toLowerCase()
          .includes(q),
      );
    }
    return sort === "oldest"
      ? [...source].sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        )
      : source;
  }, [activeTab, campaignFilter, items, query, sort]);

  return (
    <div className="min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(80%_60%_at_50%_0%,rgba(26,91,219,0.12),transparent_60%)]" />

      <div className="container-page relative pb-16 pt-8">
        {/* Header */}
        <header className="relative isolate overflow-hidden rounded-[2rem] border border-border/60 bg-surface px-6 py-8 shadow-[0_8px_40px_-20px_rgba(0,0,0,0.35)] md:px-8 md:py-10">
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-background/95 via-background/85 to-background/40" />
          <div className="relative z-20 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Send className="size-3.5" />
                <span>Invitations</span>
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                Talent Invitations
              </h1>
              <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
                Manage your invitations and track responses. See who accepted,
                who declined, and who is still thinking it over.
              </p>
            </div>
            <Button
              asChild
              className="h-12 shrink-0 gap-2 rounded-xl bg-primary px-6 text-base font-bold text-primary-foreground shadow-button hover:bg-primary/90"
            >
              <Link href="/recruiter/find-talent">
                <Send className="size-5" /> Invite Talent
              </Link>
            </Button>
          </div>
        </header>

        {/* Status tabs */}
        <section
          className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4"
          aria-label="Invitation status"
        >
          {TABS.map(({ label, note, icon: Icon }) => {
            const active = activeTab === label;
            const count = counts[label as keyof typeof counts];
            return (
              <button
                key={label}
                type="button"
                onClick={() => setActiveTab(label)}
                className={`flex min-w-0 items-center gap-3 rounded-2xl border p-3 text-left transition-colors ${
                  active
                    ? "border-primary bg-primary text-primary-foreground shadow-button"
                    : "border-border/70 bg-surface text-foreground hover:border-primary/40"
                }`}
              >
                <span
                  className={`grid size-9 shrink-0 place-items-center rounded-full ${
                    active ? "bg-primary-foreground/15" : "bg-primary/10 text-primary"
                  }`}
                >
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0">
                  <strong className="block truncate text-sm font-bold">
                    {label}
                    {label !== "Sent" ? ` (${count})` : ""}
                  </strong>
                  <small
                    className={`block truncate text-[11px] ${
                      active ? "text-primary-foreground/80" : "text-muted-foreground"
                    }`}
                  >
                    {note}
                  </small>
                </span>
              </button>
            );
          })}
        </section>

        {/* Filters */}
        <section
          className="mt-4 flex flex-wrap items-center gap-2"
          aria-label="Invitation filters"
        >
          <div className="w-full sm:w-[220px]">
            <Select value={campaignFilter} onValueChange={setCampaignFilter}>
              <SelectTrigger className="h-11 w-full rounded-xl border-border/70 bg-surface">
                <SelectValue placeholder="All Campaigns" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Campaigns</SelectItem>
                {campaignOptions.map(([id, name]) => (
                  <SelectItem key={id} value={id}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="relative min-w-[180px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search invitations..."
              className="h-11 rounded-xl border-border/70 bg-surface pl-9"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-11 justify-between rounded-xl border-border/70 bg-surface px-3"
              >
                <span className="text-left text-[10px] leading-3 text-muted-foreground">
                  Sort
                  <br />
                  <strong className="text-sm font-bold text-foreground">
                    {sort === "latest" ? "Latest First" : "Oldest First"}
                  </strong>
                </span>
                <ChevronDown className="size-4 shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSort("latest")}>
                Latest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort("oldest")}>
                Oldest First
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </section>

        {/* List */}
        {isLoading ? (
          <div className="mt-6 space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-40 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-6 flex flex-col items-center rounded-2xl border border-border/70 bg-surface px-6 py-16 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-primary/10 text-primary">
              <Send className="size-7" />
            </span>
            <h2 className="mt-4 text-xl font-bold text-foreground">
              No invitations found
            </h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {items.length === 0
                ? "Invite talent to your campaigns and track their responses here."
                : "Try a different tab, search, or campaign filter."}
            </p>
            {items.length === 0 && (
              <Button
                asChild
                className="mt-5 gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Link href="/recruiter/find-talent">
                  <Search className="size-4" /> Find talent
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="mt-6 space-y-3" aria-live="polite">
            {filtered.map((invite) => (
              <InvitationCard
                key={invite._id}
                invite={invite}
                onCancel={() => setConfirmCancel(invite)}
                onReminder={() => sendReminder.mutate(invite._id)}
                reminderPending={sendReminder.isPending}
              />
            ))}
          </div>
        )}
      </div>

      {/* Cancel confirmation */}
      <Dialog
        open={confirmCancel !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmCancel(null);
        }}
      >
        <DialogContent className="border-border bg-card sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Cancel invitation?</DialogTitle>
            <DialogDescription>
              {confirmCancel?.talent.full_legal_name ||
                confirmCancel?.talent.username}{" "}
              will be uninvited from{" "}
              {confirmCancel?.campaign?.name ?? "this campaign"}. You can invite
              them again later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmCancel(null)}
              className="rounded-xl"
            >
              Keep Invitation
            </Button>
            <Button
              type="button"
              disabled={cancelInvite.isPending}
              onClick={() => {
                if (!confirmCancel) return;
                cancelInvite.mutate(confirmCancel._id, {
                  onSuccess: () => setConfirmCancel(null),
                });
              }}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancel Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InvitationCard({
  invite,
  onCancel,
  onReminder,
  reminderPending,
}: {
  invite: RecruiterInvite;
  onCancel: () => void;
  onReminder: () => void;
  reminderPending: boolean;
}) {
  const status = statusOf(invite);
  const pending = status === "Pending";
  const name = invite.talent.full_legal_name || invite.talent.username || "Talent";
  const roles = invite.talent.professions.slice(0, 3);
  const tags = [
    ...invite.talent.specialties,
    ...invite.talent.professions,
  ]
    .filter((tag, index, all) => all.indexOf(tag) === index)
    .slice(0, 4);

  return (
    <article className="rounded-2xl border border-border/70 bg-surface p-3 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.25)] sm:p-4">
      <div className="grid gap-4 sm:grid-cols-[96px_minmax(0,1fr)_minmax(0,1fr)]">
        {/* Talent */}
        <div className="relative size-24 overflow-hidden rounded-xl bg-muted">
          {invite.talent.profile_photo ? (
            <Image
              src={invite.talent.profile_photo}
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
          <h2 className="flex items-center gap-1.5 text-base font-extrabold text-foreground sm:text-lg">
            <span className="truncate">{name}</span>
            {invite.talent.is_verified && (
              <BadgeCheck className="size-4 shrink-0 text-primary" />
            )}
          </h2>
          <p className="mt-1 truncate text-xs font-semibold text-muted-foreground sm:text-sm">
            {roles.length > 0 ? roles.join("  |  ") : "Talent"}
          </p>
          <p className="mt-1 flex items-center gap-1 truncate text-xs font-semibold text-muted-foreground sm:text-sm">
            <MapPin className="size-4 shrink-0 text-primary" />
            {[invite.talent.location?.city, invite.talent.location?.state]
              .filter(Boolean)
              .join(", ") || "Location not set"}
          </p>
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Campaign + status */}
        <div className="min-w-0 self-center border-t border-border/70 pt-3 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
          <div className="flex items-start gap-3">
            <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
              {invite.campaign?.cover_image_url ? (
                <Image
                  src={invite.campaign.cover_image_url}
                  alt=""
                  fill
                  sizes="48px"
                  className="object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex size-full items-center justify-center bg-secondary">
                  <FolderKanban className="size-5 text-muted-foreground/40" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-foreground">
                {invite.campaign?.name ?? "Unknown campaign"}
              </h3>
              <p className="truncate text-xs font-semibold text-muted-foreground">
                {invite.campaign?.role_type || "Campaign"}
                {invite.campaign?.location?.city
                  ? ` • ${invite.campaign.location.city}`
                  : ""}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <CalendarDays className="size-4 shrink-0 text-primary" />
                Sent on {formatSentDate(invite.created_at)}
              </p>
            </div>
          </div>
          <div className="mt-3">
            <StatusPill status={status} />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border/70 pt-3 sm:grid-cols-4">
        <Button
          asChild
          variant="outline"
          className="gap-1 rounded-xl border-primary/40 text-xs font-bold text-primary hover:bg-primary/10 hover:text-primary"
        >
          <Link href={`/talent/${invite.talent.username}`}>
            <Eye className="size-3.5" /> View Profile
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="gap-1 rounded-xl border-primary/40 text-xs font-bold text-primary hover:bg-primary/10 hover:text-primary"
        >
          <Link href="/recruiter/messages">
            <MessageSquare className="size-3.5" /> Message
          </Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!pending || reminderPending}
          onClick={onReminder}
          className="gap-1 rounded-xl border-primary/40 text-xs font-bold text-primary hover:bg-primary/10 hover:text-primary"
        >
          <Send className="size-3.5" />
          {reminderPending ? "Sending..." : "Send Reminder"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!pending}
          onClick={onCancel}
          className="gap-1 rounded-xl border-destructive/40 text-xs font-bold text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-3.5" /> Cancel Invitation
        </Button>
      </div>
    </article>
  );
}
