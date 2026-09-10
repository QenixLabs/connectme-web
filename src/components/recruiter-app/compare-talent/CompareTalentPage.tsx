"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  Clapperboard,
  MessageSquare,
  Send,
  User,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BulkInviteDialog } from "@/components/recruiter-app/BulkInviteDialog";
import { CompareGrid } from "@/components/recruiter-app/compare-talent/CompareGrid";
import {
  MAX_COMPARE_TALENTS,
  useCompareTalents,
} from "@/hooks/use-compare-talent";
import { useRecruiterCampaigns } from "@/hooks/use-campaigns";

function parseUsernames(raw: string | null): string[] {
  if (!raw) return [];
  const seen = new Set<string>();
  const names: string[] = [];
  for (const part of raw.split(",")) {
    const username = part.trim();
    if (username && !seen.has(username)) {
      seen.add(username);
      names.push(username);
    }
  }
  return names;
}

export function CompareTalentPage() {
  const searchParams = useSearchParams();
  const { data: campaignsData } = useRecruiterCampaigns();

  const parsed = useMemo(
    () => parseUsernames(searchParams.get("ids")),
    [searchParams],
  );
  const dropped = Math.max(parsed.length - MAX_COMPARE_TALENTS, 0);
  const usernames = parsed.slice(0, MAX_COMPARE_TALENTS);
  const from = searchParams.get("from") === "saved" ? "saved" : "shortlist";
  const campaignParam = searchParams.get("campaign");

  const warnedRef = useRef(false);
  useEffect(() => {
    if (dropped > 0 && !warnedRef.current) {
      warnedRef.current = true;
      toast.info(
        `You can compare up to ${MAX_COMPARE_TALENTS} talents — extras were dropped`,
      );
    }
  }, [dropped]);

  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const visibleUsernames = usernames.filter((u) => !hidden.has(u));
  const columns = useCompareTalents(visibleUsernames);

  const removeColumn = (username: string) =>
    setHidden((current) => new Set(current).add(username));

  const backHref =
    from === "saved" ? "/recruiter/saved-talent" : "/recruiter/shortlist";

  const campaign = useMemo(() => {
    if (from !== "shortlist" || !campaignParam) return null;
    const campaigns = campaignsData?.pages.flatMap((page) => page.data) ?? [];
    return campaigns.find((c) => c._id === campaignParam) ?? null;
  }, [from, campaignParam, campaignsData]);

  const readyColumns = columns.filter((c) => c.status === "ready" && c.data);
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-40 text-foreground">
      <div className="mx-auto w-full max-w-[940px] px-4 pt-5">
        {/* Header */}
        <header className="flex items-start gap-2">
          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label="Go back"
            className="mt-1 shrink-0 rounded-full"
          >
            <Link href={backHref}>
              <ChevronLeft className="size-6" />
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="font-display text-3xl font-extrabold leading-tight text-foreground">
              Compare Talent
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Compare profiles side by side and choose the best fit for your
              project.
            </p>
          </div>
        </header>

        {usernames.length === 0 ? (
          <section className="mt-6 rounded-2xl border border-border/70 bg-card px-6 py-14 text-center shadow-card">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-primary/10 text-primary">
              <UsersRound className="size-7" />
            </span>
            <h2 className="mt-4 font-display text-lg font-bold text-foreground">
              No talent to compare
            </h2>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              Select talent from your shortlist or saved list, then come back
              to compare them here.
            </p>
            <Button
              asChild
              className="mt-5 gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Link href={backHref}>
                Back to {from === "saved" ? "saved talent" : "shortlist"}
              </Link>
            </Button>
          </section>
        ) : visibleUsernames.length === 0 ? (
          <section className="mt-6 rounded-2xl border border-border/70 bg-card px-6 py-14 text-center shadow-card">
            <h2 className="font-display text-lg font-bold text-foreground">
              All talent removed
            </h2>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              You removed everyone from the comparison.
            </p>
            <Button
              asChild
              variant="secondary"
              className="mt-5 gap-2 rounded-xl"
            >
              <Link href={backHref}>
                Back to {from === "saved" ? "saved talent" : "shortlist"}
              </Link>
            </Button>
          </section>
        ) : (
          <>
            {/* Brief card (shortlist entry only) */}
            {from === "shortlist" && (
              <section className="mt-5 rounded-2xl border border-primary/15 bg-card p-3 shadow-card">
                <div className="grid grid-cols-[52px_minmax(0,1fr)] items-center gap-3">
                  <span className="grid size-[52px] place-items-center rounded-xl bg-primary/10 text-primary">
                    <Clapperboard className="size-6" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase text-primary">
                      {campaign?.status === "active"
                        ? "Active campaign"
                        : "Campaign"}
                    </p>
                    <h2 className="truncate font-display text-sm font-bold text-foreground">
                      {campaign?.name ?? "General shortlist"}
                    </h2>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {[
                        campaign?.role_type,
                        campaign?.location?.city,
                        campaign?.status === "active"
                          ? "Casting ongoing"
                          : campaign?.status,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Comparison grid */}
            <section className="no-scrollbar -mx-4 mt-5 overflow-x-auto px-4 pb-2">
              <CompareGrid columns={columns} onRemove={removeColumn} />
            </section>
          </>
        )}
      </div>

      {/* Sticky action bar */}
      {visibleUsernames.length > 0 && (
        <div className="fixed inset-x-0 bottom-16 z-30 px-4 md:bottom-6">
          <div className="mx-auto max-w-[460px] rounded-2xl border bg-card p-3 shadow-card-lift">
            <div className="flex items-center gap-3">
              <div className="flex shrink-0 -space-x-3">
                {readyColumns.slice(0, 3).map((column) => (
                  <span
                    key={column.username}
                    className="relative grid size-9 place-items-center overflow-hidden rounded-full border-2 border-card bg-muted"
                  >
                    {column.data!.profilePhoto ? (
                      <Image
                        src={column.data!.profilePhoto}
                        alt=""
                        fill
                        sizes="36px"
                        className="object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <User className="size-4 text-muted-foreground/40" />
                    )}
                  </span>
                ))}
                <span className="grid size-9 place-items-center rounded-full border-2 border-card bg-primary text-xs font-bold text-primary-foreground">
                  {visibleUsernames.length}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-foreground">
                  {visibleUsernames.length}{" "}
                  {visibleUsernames.length === 1 ? "talent" : "talents"}{" "}
                  selected
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  Compare and invite to move forward
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                asChild
                className="h-11 rounded-xl text-sm font-bold"
              >
                <Link href="/recruiter/messages">
                  <MessageSquare className="size-4" /> Message All
                </Link>
              </Button>
              <Button
                onClick={() => setInviteOpen(true)}
                className="h-11 gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground hover:bg-primary/90"
              >
                <Send className="size-4" /> Invite Selected
              </Button>
            </div>
          </div>
        </div>
      )}

      <BulkInviteDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        talentIds={readyColumns.map((column) => column.data!.userId)}
        onSent={() => {}}
      />
    </div>
  );
}
