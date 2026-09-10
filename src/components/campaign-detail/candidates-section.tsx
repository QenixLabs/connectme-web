"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BadgeCheck,
  Bookmark,
  CheckCircle2,
  ChevronRight,
  Clock3,
  MapPin,
  Search,
  Send,
  Star,
  User,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useCampaignApplications, useCampaignInvites } from "@/hooks/use-campaigns";
import { useSavedTalents } from "@/hooks/use-saved-talents";
import { useRecruiterShortlists } from "@/hooks/use-shortlists";
import {
  ApplicationsSection,
  type ApplicationSegment,
} from "@/components/campaign-detail/applications-section";
import { InviteTalentDialog } from "@/components/recruiter-app/InviteTalentDialog";
import type { SavedTalentItem } from "@/lib/api/talent";
import type { ShortlistTalentItem } from "@/lib/api/talent";
import type { CampaignInvite } from "@/lib/api/campaigns";

const POOL_PREVIEW_LIMIT = 5;

type PoolKey = "saved" | "shortlist" | "invited";

const poolTabs: Array<{ key: PoolKey; label: string; href: string }> = [
  { key: "saved", label: "Saved", href: "/recruiter/saved-talent" },
  { key: "shortlist", label: "Shortlist", href: "/recruiter/shortlist" },
  { key: "invited", label: "Invited", href: "/recruiter/invites" },
];

function locationOf(loc?: { city?: string; state?: string }): string {
  const parts = [loc?.city, loc?.state].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "";
}

function TalentAvatar({
  photo,
  name,
  size = "size-9",
}: {
  photo?: string;
  name: string;
  size?: string;
}) {
  return (
    <span
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-secondary",
        size,
      )}
    >
      {photo ? (
        <Image
          src={photo}
          alt={name}
          fill
          sizes="40px"
          className="object-cover"
          loading="lazy"
        />
      ) : (
        <User className="size-4 text-muted-foreground/40" />
      )}
    </span>
  );
}

function PoolsSkeleton() {
  return (
    <div className="mt-4 space-y-2.5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-full" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function PoolsEmpty({
  icon: Icon,
  message,
}: {
  icon: typeof Bookmark;
  message: string;
}) {
  return (
    <div className="mt-4 flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-card/50 px-4 py-8 text-center">
      <Icon className="size-6 text-muted-foreground" />
      <p className="text-xs text-muted-foreground">{message}</p>
      <Button
        asChild
        variant="outline"
        size="sm"
        className="mt-1 gap-1.5 rounded-lg border-primary/40 text-xs font-semibold text-primary hover:bg-primary/10 hover:text-primary"
      >
        <Link href="/recruiter/find-talent">
          <Search className="size-3.5" /> Find talent
        </Link>
      </Button>
    </div>
  );
}

function InviteStatusBadge({ status }: { status: CampaignInvite["status"] }) {
  const config = {
    pending: {
      icon: Clock3,
      label: "Pending",
      className: "bg-amber-tag/20 text-[var(--warning)]",
    },
    accepted: {
      icon: CheckCircle2,
      label: "Accepted",
      className: "bg-[var(--success)]/20 text-[var(--success)]",
    },
    declined: {
      icon: XCircle,
      label: "Declined",
      className: "bg-destructive/20 text-destructive",
    },
  };
  const c = config[status];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
        c.className,
      )}
    >
      <c.icon className="size-3" />
      {c.label}
    </span>
  );
}

function CandidatePoolsCard({ campaignId }: { campaignId: string }) {
  const [activePool, setActivePool] = useState<PoolKey>("saved");
  const [inviteTarget, setInviteTarget] = useState<SavedTalentItem | null>(null);

  const { data: savedTalents, isLoading: savedLoading } = useSavedTalents();
  const { data: shortlists, isLoading: shortlistsLoading } =
    useRecruiterShortlists();
  const { data: invites, isLoading: invitesLoading } =
    useCampaignInvites(campaignId);

  const campaignShortlist = useMemo(
    () => shortlists?.find((s) => s.campaign?._id === campaignId),
    [shortlists, campaignId],
  );
  const shortlistMembers: ShortlistTalentItem[] =
    campaignShortlist?.talents ?? [];

  const counts: Record<PoolKey, number> = {
    saved: savedTalents?.length ?? 0,
    shortlist: campaignShortlist?.talent_count ?? shortlistMembers.length,
    invited: invites?.length ?? 0,
  };

  const loading =
    activePool === "saved"
      ? savedLoading
      : activePool === "shortlist"
        ? shortlistsLoading
        : invitesLoading;

  const activeHref = poolTabs.find((t) => t.key === activePool)?.href ?? "#";

  return (
    <section className="rounded-lg border border-border bg-card p-5 shadow-card">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-display text-base font-semibold tracking-tight text-foreground">
          Talent Pools
        </h2>
        <Link
          href={activeHref}
          className="inline-flex shrink-0 items-center gap-0.5 text-xs font-semibold text-primary hover:underline"
        >
          View all <ChevronRight className="size-3.5" />
        </Link>
      </div>

      {/* Inline pool tabs */}
      <div
        role="tablist"
        aria-label="Talent pools"
        className="mt-3 flex overflow-x-auto rounded-lg bg-muted p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {poolTabs.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activePool === tab.key}
            onClick={() => setActivePool(tab.key)}
            className={cn(
              "min-w-0 flex-1 whitespace-nowrap rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
              activePool === tab.key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label} ({counts[tab.key]})
          </button>
        ))}
      </div>

      {/* Saved pool */}
      {activePool === "saved" &&
        (loading ? (
          <PoolsSkeleton />
        ) : counts.saved === 0 ? (
          <PoolsEmpty
            icon={Bookmark}
            message="No saved talent yet. Bookmark talent while browsing to find them here."
          />
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {savedTalents!.slice(0, POOL_PREVIEW_LIMIT).map((talent) => {
              const name = talent.full_legal_name || talent.username;
              return (
                <li
                  key={talent.user_id}
                  className="flex items-center gap-3 py-2.5"
                >
                  <TalentAvatar photo={talent.profile_photo} name={name} />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/talent/${talent.username}`}
                      className="flex items-center gap-1 truncate text-sm font-semibold text-foreground hover:text-primary"
                    >
                      <span className="truncate">{name}</span>
                      {talent.is_verified && (
                        <BadgeCheck className="size-3.5 shrink-0 text-primary" />
                      )}
                    </Link>
                    <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                      {(talent.professions ?? []).slice(0, 2).join(" · ") ||
                        "Talent"}
                      {locationOf(talent.location) && (
                        <>
                          <MapPin className="size-3 shrink-0" />
                          {locationOf(talent.location)}
                        </>
                      )}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInviteTarget(talent)}
                    className="h-8 shrink-0 gap-1 rounded-lg border-primary/40 px-2.5 text-xs font-semibold text-primary hover:bg-primary/10 hover:text-primary"
                  >
                    <Send className="size-3" /> Invite
                  </Button>
                </li>
              );
            })}
          </ul>
        ))}

      {/* Shortlist pool */}
      {activePool === "shortlist" &&
        (loading ? (
          <PoolsSkeleton />
        ) : counts.shortlist === 0 ? (
          <PoolsEmpty
            icon={Star}
            message="No shortlisted talent for this campaign yet. Shortlist talent while browsing to track your top picks."
          />
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {shortlistMembers.slice(0, POOL_PREVIEW_LIMIT).map((talent) => {
              const name = talent.full_legal_name || talent.username;
              const available = talent.availability === "available";
              const busy = talent.availability === "busy";
              return (
                <li
                  key={talent.user_id}
                  className="flex items-center gap-3 py-2.5"
                >
                  <TalentAvatar photo={talent.profile_photo} name={name} />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/talent/${talent.username}`}
                      className="flex items-center gap-1 truncate text-sm font-semibold text-foreground hover:text-primary"
                    >
                      <span className="truncate">{name}</span>
                      {talent.is_verified && (
                        <BadgeCheck className="size-3.5 shrink-0 text-primary" />
                      )}
                    </Link>
                    <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                      {(talent.professions ?? []).slice(0, 2).join(" · ") ||
                        "Talent"}
                      {locationOf(talent.location) && (
                        <>
                          <MapPin className="size-3 shrink-0" />
                          {locationOf(talent.location)}
                        </>
                      )}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 text-[10px] font-semibold",
                      available
                        ? "text-success"
                        : busy
                          ? "text-warning"
                          : "text-muted-foreground",
                    )}
                  >
                    ●{" "}
                    {available
                      ? "Available"
                      : busy
                        ? "Busy"
                        : "Not available"}
                  </span>
                </li>
              );
            })}
          </ul>
        ))}

      {/* Invited pool */}
      {activePool === "invited" &&
        (loading ? (
          <PoolsSkeleton />
        ) : counts.invited === 0 ? (
          <PoolsEmpty
            icon={Send}
            message="No invites sent for this campaign yet. Invite saved or shortlisted talent to apply."
          />
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {invites!.slice(0, POOL_PREVIEW_LIMIT).map((invite) => {
              const talent =
                typeof invite.talent_id === "object" ? invite.talent_id : null;
              const name =
                talent?.full_legal_name || talent?.username || "Talent";
              return (
                <li
                  key={invite._id}
                  className="flex items-center gap-3 py-2.5"
                >
                  <TalentAvatar
                    photo={undefined}
                    name={name}
                    size="size-9"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {name}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {(talent?.professions ?? []).slice(0, 2).join(" · ") ||
                        "Talent"}
                    </p>
                  </div>
                  <InviteStatusBadge status={invite.status} />
                </li>
              );
            })}
          </ul>
        ))}

      {counts[activePool] > POOL_PREVIEW_LIMIT && (
        <Link
          href={activeHref}
          className="mt-3 flex items-center justify-center gap-1 rounded-lg border border-border bg-card py-2 text-xs font-semibold text-primary hover:bg-secondary/50"
        >
          View all {counts[activePool]}{" "}
          {poolTabs.find((t) => t.key === activePool)?.label.toLowerCase()}{" "}
          talent
          <ChevronRight className="size-3.5" />
        </Link>
      )}

      <InviteTalentDialog
        talent={inviteTarget}
        open={inviteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setInviteTarget(null);
        }}
        initialCampaignId={campaignId}
      />
    </section>
  );
}

export function CandidatesSection({ campaignId }: { campaignId: string }) {
  const [segment, setSegment] = useState<ApplicationSegment>("all");
  const { data: appData, isLoading } = useCampaignApplications(campaignId);

  const applications = appData?.data ?? [];
  const counts: Record<ApplicationSegment, number> = {
    all: appData?.total ?? 0,
    shortlisted: appData?.shortlisted ?? 0,
    accepted: appData?.accepted ?? 0,
    rejected: appData?.rejected ?? 0,
  };

  const segmentApplications = useMemo(() => {
    if (segment === "all") return applications;
    if (segment === "shortlisted") {
      return applications.filter((a) => a.is_shortlisted);
    }
    return applications.filter((a) => a.status === segment);
  }, [applications, segment]);

  return (
    <div className="mt-4 space-y-4">
      <ApplicationsSection
        campaignId={campaignId}
        applications={segmentApplications}
        counts={counts}
        segment={segment}
        onSegmentChange={setSegment}
        isLoading={isLoading}
      />
      <CandidatePoolsCard campaignId={campaignId} />
    </div>
  );
}
