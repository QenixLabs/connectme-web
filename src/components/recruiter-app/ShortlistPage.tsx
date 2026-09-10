"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Check,
  ChevronDown,
  CircleEllipsis,
  Clapperboard,
  Eye,
  Filter,
  MapPin,
  MessageSquare,
  Plane,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  User,
  UsersRound,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useRecruiterShortlists,
  useRemoveFromShortlist,
} from "@/hooks/use-shortlists";
import { useRecruiterCampaigns } from "@/hooks/use-campaigns";
import { InviteTalentDialog } from "@/components/recruiter-app/InviteTalentDialog";
import { BulkInviteDialog } from "@/components/recruiter-app/BulkInviteDialog";
import type {
  RecruiterShortlist,
  ShortlistCampaignSummary,
  ShortlistTalentItem,
} from "@/lib/api/talent";

type AvailabilityKey = "all" | "available" | "busy" | "not_available";

const AVAILABILITY_LABEL: Record<Exclude<AvailabilityKey, "all">, string> = {
  available: "Available now",
  busy: "Busy",
  not_available: "Not available",
};

function availabilityOf(talent: ShortlistTalentItem): Exclude<AvailabilityKey, "all"> {
  if (talent.availability === "available") return "available";
  if (talent.availability === "busy") return "busy";
  return "not_available";
}

function talentName(talent: ShortlistTalentItem): string {
  return talent.full_legal_name || talent.username;
}

function formatLocation(talent: ShortlistTalentItem): string {
  const parts = [talent.location?.city, talent.location?.state].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "Location not set";
}

function CampaignSwitcher({
  open,
  onOpenChange,
  options,
  selectedId,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options: Array<{
    campaign: ShortlistCampaignSummary | null;
    talentCount: number;
  }>;
  selectedId: string | null;
  onSelect: (campaignId: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto border-border bg-card sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Choose campaign</DialogTitle>
          <DialogDescription>
            Your shortlist is scoped per campaign. Pick one to review the
            talent you have shortlisted for it.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2 space-y-2">
          {options.length === 0 ? (
            <div className="rounded-xl border border-border/70 bg-surface p-4 text-sm text-muted-foreground">
              No campaigns yet.{" "}
              <Link
                href="/recruiter/campaigns/new"
                className="font-semibold text-primary hover:underline"
              >
                Create one
              </Link>{" "}
              to start shortlisting talent.
            </div>
          ) : (
            options.map(({ campaign, talentCount }) => {
              const id = campaign?._id ?? "none";
              const selected = selectedId === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    onSelect(id);
                    onOpenChange(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                    selected
                      ? "border-primary bg-primary/10"
                      : "border-border/70 bg-surface hover:border-primary/40"
                  }`}
                >
                  <span
                    className={`grid size-10 shrink-0 place-items-center rounded-xl ${
                      selected
                        ? "bg-primary text-primary-foreground"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    <Clapperboard className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-foreground">
                      {campaign?.name ?? "General shortlist"}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {[
                        campaign?.role_type,
                        campaign?.location?.city,
                        `${talentCount} shortlisted`,
                      ]
                        .filter(Boolean)
                        .join(" • ")}
                    </span>
                  </span>
                  {selected && <Check className="size-4 shrink-0 text-primary" />}
                </button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TalentCard({
  person,
  selected,
  onToggle,
  onInvite,
  onRemove,
}: {
  person: ShortlistTalentItem;
  selected: boolean;
  onToggle: () => void;
  onInvite: () => void;
  onRemove: () => void;
}) {
  const availability = availabilityOf(person);
  const tags = (person.specialties ?? []).slice(0, 3);
  const extraCount = Math.max(
    (person.specialties?.length ?? 0) - tags.length,
    0,
  );

  return (
    <article
      className={`relative rounded-2xl border bg-card p-3.5 shadow-card transition ${
        selected ? "border-primary/50 ring-1 ring-primary/10" : "border-border"
      }`}
    >
      <Button
        type="button"
        variant={selected ? "default" : "outline"}
        size="icon"
        aria-label={`${selected ? "Deselect" : "Select"} ${talentName(person)}`}
        onClick={onToggle}
        className="absolute right-3 top-3 z-10 size-8 rounded-full"
      >
        {selected ? <Check /> : <Plus />}
      </Button>

      <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-3">
        <div className="relative h-28 overflow-hidden rounded-xl bg-muted">
          {person.profile_photo ? (
            <Image
              src={person.profile_photo}
              alt={talentName(person)}
              fill
              sizes="88px"
              className="object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-secondary">
              <User className="size-8 text-muted-foreground/40" />
            </div>
          )}
        </div>

        <div className="min-w-0 pr-7">
          <h2 className="flex items-center gap-1 truncate font-display text-[15px] font-bold text-foreground">
            <span className="truncate">
              {talentName(person)} <span className="text-primary">●</span>
            </span>
            {person.is_verified && (
              <BadgeCheck className="size-4 shrink-0 text-primary" />
            )}
          </h2>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {(person.professions ?? []).join(" · ") || "Talent"}
          </p>
          <p className="mt-2 flex items-center gap-1 truncate text-[11px] text-muted-foreground">
            <MapPin className="size-3 shrink-0" />
            {formatLocation(person)}
          </p>
          <div className="mt-2 flex items-center gap-2 text-[11px]">
            <span
              className={
                availability === "available"
                  ? "text-success"
                  : availability === "busy"
                    ? "text-warning"
                    : "text-muted-foreground"
              }
            >
              ● {AVAILABILITY_LABEL[availability]}
            </span>
          </div>
        </div>
      </div>

      {tags.length > 0 && (
        <div className="mt-3 flex gap-1.5 overflow-hidden">
          {tags.map((tag) => (
            <span
              key={tag}
              className="truncate rounded-full bg-muted px-2 py-1 text-[10px] text-muted-foreground"
            >
              {tag}
            </span>
          ))}
          {extraCount > 0 && (
            <span className="shrink-0 rounded-full bg-muted px-2 py-1 text-[10px] text-muted-foreground">
              +{extraCount}
            </span>
          )}
        </div>
      )}

      <div className="mt-3 grid grid-cols-3 gap-2">
        <Button
          type="button"
          onClick={onInvite}
          className="h-10 rounded-xl text-xs"
        >
          <Plane /> Invite
        </Button>
        <Button
          variant="secondary"
          asChild
          className="h-10 rounded-xl text-xs"
        >
          <Link href="/recruiter/messages">
            <MessageSquare /> Message
          </Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-10 rounded-xl px-2 text-xs"
              aria-label={`More actions for ${talentName(person)}`}
            >
              <CircleEllipsis /> More
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href={`/talent/${person.username}`}>
                <Eye className="size-4" /> View profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={onRemove}
            >
              <Trash2 className="size-4" /> Remove from shortlist
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </article>
  );
}

export default function ShortlistPage() {
  const { data: shortlists, isLoading } = useRecruiterShortlists();
  const removeFromShortlist = useRemoveFromShortlist();
  const { data: campaignsData } = useRecruiterCampaigns();

  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<AvailabilityKey>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [inviteTarget, setInviteTarget] = useState<ShortlistTalentItem | null>(
    null,
  );
  const [bulkInviteOpen, setBulkInviteOpen] = useState(false);

  const campaigns = useMemo(
    () => campaignsData?.pages.flatMap((page) => page.data) ?? [],
    [campaignsData],
  );

  // Campaign options: union of shortlist campaigns and the recruiter's campaigns.
  const campaignOptions = useMemo(() => {
    const map = new Map<
      string,
      { campaign: ShortlistCampaignSummary | null; talentCount: number }
    >();
    for (const campaign of campaigns) {
      map.set(campaign._id, {
        campaign: {
          _id: campaign._id,
          name: campaign.name,
          role_type: campaign.role_type,
          industry: campaign.industry,
          location: campaign.location,
          status: campaign.status,
        },
        talentCount: 0,
      });
    }
    for (const shortlist of shortlists ?? []) {
      const id = shortlist.campaign?._id ?? "none";
      const existing = map.get(id);
      map.set(id, {
        campaign: shortlist.campaign ?? existing?.campaign ?? null,
        talentCount: shortlist.talent_count,
      });
    }
    return Array.from(map.values());
  }, [campaigns, shortlists]);

  useEffect(() => {
    if (selectedCampaignId !== null || campaignOptions.length === 0) return;
    const withTalent = campaignOptions.find((o) => o.talentCount > 0);
    setSelectedCampaignId(
      (withTalent?.campaign?._id ?? campaignOptions[0].campaign?._id ?? "none"),
    );
  }, [campaignOptions, selectedCampaignId]);

  const activeShortlist: RecruiterShortlist | undefined = useMemo(() => {
    if (!shortlists) return undefined;
    if (selectedCampaignId === "none") {
      return shortlists.find((s) => !s.campaign);
    }
    return shortlists.find((s) => s.campaign?._id === selectedCampaignId);
  }, [shortlists, selectedCampaignId]);

  const activeCampaign = useMemo(
    () =>
      campaignOptions.find(
        (o) => (o.campaign?._id ?? "none") === (selectedCampaignId ?? "none"),
      )?.campaign ?? null,
    [campaignOptions, selectedCampaignId],
  );

  const members = useMemo(
    () => activeShortlist?.talents ?? [],
    [activeShortlist],
  );

  const counts = useMemo(() => {
    const result: Record<AvailabilityKey, number> = {
      all: members.length,
      available: 0,
      busy: 0,
      not_available: 0,
    };
    for (const member of members) {
      result[availabilityOf(member)] += 1;
    }
    return result;
  }, [members]);

  const filters = useMemo(
    () => [
      { key: "all" as const, label: `All ${counts.all}` },
      { key: "available" as const, label: `Available ${counts.available}` },
      { key: "busy" as const, label: `Busy ${counts.busy}` },
      {
        key: "not_available" as const,
        label: `Not available ${counts.not_available}`,
      },
    ],
    [counts],
  );

  const visible = useMemo(
    () =>
      members.filter((person) => {
        if (activeTab !== "all" && availabilityOf(person) !== activeTab) {
          return false;
        }
        const q = query.toLowerCase();
        if (!q) return true;
        return (
          talentName(person).toLowerCase().includes(q) ||
          person.username.toLowerCase().includes(q) ||
          (person.professions ?? []).some((p) => p.toLowerCase().includes(q))
        );
      }),
    [members, activeTab, query],
  );

  const toggle = (userId: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });

  const removeOne = (talent: ShortlistTalentItem) => {
    if (!selectedCampaignId || selectedCampaignId === "none") {
      toast.error("This shortlist is not linked to a campaign");
      return;
    }
    removeFromShortlist.mutate({
      username: talent.username,
      campaignId: selectedCampaignId,
    });
    setSelected((current) => {
      const next = new Set(current);
      next.delete(talent.user_id);
      return next;
    });
  };

  const removeSelected = () => {
    if (!selectedCampaignId || selectedCampaignId === "none") {
      toast.error("This shortlist is not linked to a campaign");
      return;
    }
    if (!activeShortlist) return;
    for (const userId of selected) {
      const talent = activeShortlist.talents.find((t) => t.user_id === userId);
      if (talent) {
        removeFromShortlist.mutate({
          username: talent.username,
          campaignId: selectedCampaignId,
        });
      }
    }
    setSelected(new Set());
  };

  const router = useRouter();

  const compareSelected = () => {
    if (!activeShortlist) return;
    const usernames = activeShortlist.talents
      .filter((t) => selected.has(t.user_id))
      .map((t) => t.username);
    if (usernames.length === 0) return;
    const params = new URLSearchParams({
      ids: usernames.join(","),
      from: "shortlist",
    });
    if (selectedCampaignId && selectedCampaignId !== "none") {
      params.set("campaign", selectedCampaignId);
    }
    router.push(`/recruiter/compare?${params.toString()}`);
  };

  const loading = isLoading;

  return (
    <div className="min-h-screen bg-background pb-40 text-foreground">
      <div className="mx-auto w-full max-w-[940px] px-4 pt-5">
        <section className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase text-primary">
              Casting workspace
            </p>
            <h1 className="mt-1 font-display text-3xl font-extrabold leading-tight text-foreground">
              My Shortlist
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Compare and contact your best matches.
            </p>
          </div>
          <Button
            size="icon"
            asChild
            className="mt-5 size-11 shrink-0 rounded-full"
            aria-label="Add talent"
          >
            <Link href="/recruiter/find-talent">
              <Plus />
            </Link>
          </Button>
        </section>

        <section className="mt-5 rounded-2xl border border-primary/15 bg-card p-3 shadow-card">
          {loading ? (
            <div className="flex items-center gap-3">
              <Skeleton className="size-[52px] rounded-xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-3">
                <span className="grid size-[52px] place-items-center rounded-xl bg-primary/10 text-primary">
                  <Clapperboard className="size-6" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase text-primary">
                    {activeCampaign?.status === "active"
                      ? "Active campaign"
                      : "Campaign"}
                  </p>
                  <h2 className="truncate font-display text-sm font-bold text-foreground">
                    {activeCampaign?.name ?? "General shortlist"}
                  </h2>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {[
                      activeCampaign?.role_type,
                      activeCampaign?.location?.city,
                      activeCampaign?.status === "active"
                        ? "Casting ongoing"
                        : activeCampaign?.status,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Choose campaign"
                  onClick={() => setSwitcherOpen(true)}
                  className="rounded-full"
                >
                  <ChevronDown />
                </Button>
              </div>
              <Button
                variant="secondary"
                onClick={() => setSwitcherOpen(true)}
                className="mt-3 h-9 w-full rounded-xl text-xs"
              >
                <Clapperboard /> Change campaign
              </Button>
            </>
          )}
        </section>

        <section className="-mx-4 mt-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
          <div className="flex w-max gap-2">
            {filters.map((filter) => (
              <Button
                key={filter.key}
                size="sm"
                variant={activeTab === filter.key ? "default" : "secondary"}
                onClick={() => setActiveTab(filter.key)}
                className="rounded-full px-4"
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </section>

        <section className="sticky top-16 z-20 -mx-4 mt-3 border-y bg-background/95 px-4 py-3 backdrop-blur">
          <div className="flex gap-2">
            <label className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
              <input
                id="talent-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-10 w-full rounded-xl border bg-card pl-9 pr-3 text-sm text-foreground outline-hidden focus:ring-2 focus:ring-ring/30"
                placeholder="Search talent"
              />
            </label>
            <Button
              variant="outline"
              size="icon"
              className="size-10 rounded-xl"
              aria-label="Sort talent"
              onClick={() => toast.info("Sorting options coming soon")}
            >
              <SlidersHorizontal />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-10 rounded-xl"
              aria-label="Filter talent"
              onClick={() => toast.info("More filters coming soon")}
            >
              <Filter />
            </Button>
          </div>
        </section>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">
              Talent
            </h2>
            <p className="text-xs text-muted-foreground">
              {visible.length} {visible.length === 1 ? "person" : "people"} ·
              Recently added
            </p>
          </div>
          {selected.size > 0 && (
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              {selected.size} selected
            </span>
          )}
        </div>

        {loading ? (
          <section className="mt-3 space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </section>
        ) : members.length === 0 ? (
          <section className="mt-3 rounded-2xl border border-border/70 bg-card px-6 py-14 text-center shadow-card">
            <span className="grid size-14 place-items-center rounded-full bg-primary/10 text-primary">
              <UsersRound className="size-7" />
            </span>
            <h3 className="mt-4 font-display text-lg font-bold text-foreground">
              No shortlisted talent yet
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              Shortlist talent for this campaign while browsing, then review
              and invite them from here.
            </p>
            <Button
              asChild
              className="mt-5 gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Link href="/recruiter/find-talent">
                <Search className="size-4" /> Find talent
              </Link>
            </Button>
          </section>
        ) : (
          <section className="mt-3 space-y-3">
            {visible.map((person) => (
              <TalentCard
                key={person.user_id}
                person={person}
                selected={selected.has(person.user_id)}
                onToggle={() => toggle(person.user_id)}
                onInvite={() => setInviteTarget(person)}
                onRemove={() => removeOne(person)}
              />
            ))}
            {visible.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No talent matches your search or filter.
              </p>
            )}
          </section>
        )}
      </div>

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
              variant="secondary"
              size="icon"
              className="size-11 rounded-xl"
              aria-label={`Invite ${selected.size} selected talent`}
              onClick={() => setBulkInviteOpen(true)}
            >
              <Plane />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-11 rounded-xl text-destructive"
              aria-label={`Remove ${selected.size} selected talent`}
              disabled={removeFromShortlist.isPending}
              onClick={removeSelected}
            >
              <Trash2 />
            </Button>
          </div>
        </div>
      )}

      <CampaignSwitcher
        open={switcherOpen}
        onOpenChange={setSwitcherOpen}
        options={campaignOptions}
        selectedId={selectedCampaignId}
        onSelect={(id) => {
          setSelectedCampaignId(id);
          setSelected(new Set());
          setActiveTab("all");
          setQuery("");
        }}
      />

      <InviteTalentDialog
        talent={inviteTarget}
        open={inviteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setInviteTarget(null);
        }}
      />

      <BulkInviteDialog
        open={bulkInviteOpen}
        onOpenChange={setBulkInviteOpen}
        talentIds={Array.from(selected)}
        onSent={() => setSelected(new Set())}
      />
    </div>
  );
}
