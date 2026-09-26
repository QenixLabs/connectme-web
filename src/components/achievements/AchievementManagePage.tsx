"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Search, ShieldCheck, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyAchievements, useDeleteAchievement } from "@/hooks/use-experience";
import { useMyProfile } from "@/hooks/use-talent-profile";
import type { Achievement } from "@/lib/api/talent";
import { AchievementFilters } from "./AchievementFilters";
import { AchievementForm } from "./AchievementForm";
import { AchievementHero } from "./AchievementHero";
import { AchievementManageRow } from "./AchievementManageRow";
import { AchievementStats } from "./AchievementStats";
import {
  getAchievementSearchText,
  isVerifiedAchievement,
  type AchievementFilter,
} from "./achievement-types";

function ManageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-4 px-3 py-4 sm:px-6">
      <Skeleton className="h-[254px] rounded-[30px]" />
      <Skeleton className="h-24 rounded-[24px]" />
      <Skeleton className="h-36 rounded-[26px]" />
      <Skeleton className="h-12 rounded-2xl" />
      <div className="space-y-3">
        <Skeleton className="h-24 rounded-[22px]" />
        <Skeleton className="h-24 rounded-[22px]" />
      </div>
    </div>
  );
}

export function AchievementManagePage() {
  const achievementsQuery = useMyAchievements();
  const profileQuery = useMyProfile();
  const deleteMutation = useDeleteAchievement();
  const [activeFilter, setActiveFilter] = useState<AchievementFilter>("all");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Achievement | null>(null);
  const deferredSearch = useDeferredValue(search);
  const achievements = achievementsQuery.data ?? [];
  const publicPath = profileQuery.data?.username
    ? `/talent/${encodeURIComponent(profileQuery.data.username)}/achievements`
    : undefined;

  function getPublicUrl() {
    if (typeof window === "undefined") return publicPath || "";
    return `${window.location.origin}${publicPath || window.location.pathname}`;
  }

  const filteredAchievements = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    return [...achievements]
      .filter((achievement) => activeFilter === "all" || achievement.type === activeFilter)
      .filter((achievement) => !query || getAchievementSearchText(achievement).includes(query))
      .sort((left, right) => {
        const yearDiff = (right.year ?? 0) - (left.year ?? 0);
        if (yearDiff !== 0) return yearDiff;
        return (left.order ?? 0) - (right.order ?? 0);
      });
  }, [activeFilter, achievements, deferredSearch]);

  const verifiedCount = achievements.filter(isVerifiedAchievement).length;
  const showCredits = achievements.some((achievement) => achievement.type === "credit");

  function startAdd() {
    setEditingAchievement(undefined);
    setFormOpen(true);
  }

  function startEdit(achievement: Achievement) {
    setEditingAchievement(achievement);
    setFormOpen(true);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget._id);
      toast.success("Achievement deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Could not delete achievement");
    }
  }

  if (achievementsQuery.isLoading || profileQuery.isLoading) return <ManageSkeleton />;

  return (
    <div className="min-h-[calc(100svh-4rem)] overflow-x-hidden bg-[linear-gradient(180deg,#faf9ff_0%,#f7f8ff_48%,#ffffff_100%)] pb-24">
      <div className="mx-auto w-full max-w-[1100px] space-y-4 px-3 py-4 sm:space-y-5 sm:px-6 sm:py-6 lg:px-8">
        <AchievementHero
          mode="manage"
          title="Manage Awards & Training"
          subtitle="Add, edit and organize your credits, awards, trainings and certifications."
          previewHref={publicPath}
          onShare={() => {
            if (typeof navigator !== "undefined" && navigator.share) {
              navigator.share({ title: "RootIn achievements", url: getPublicUrl() }).catch(() => undefined);
            } else {
              toast.info("Use Preview Profile to share your public achievements");
            }
          }}
          onCopyLink={async () => {
            try {
              await navigator.clipboard.writeText(getPublicUrl());
              toast.success("Link copied");
            } catch {
              toast.error("Could not copy link");
            }
          }}
        />

        <AchievementStats achievements={achievements} />

        <Card className="rounded-[26px] border-[#ded6fb] bg-[linear-gradient(115deg,#f5f0ff_0%,#ffffff_54%,#eef4ff_100%)] shadow-[0_12px_30px_rgba(75,61,157,0.08)]">
          <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex min-w-0 items-start gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-[15px] bg-white text-[#6840df] shadow-sm ring-1 ring-[#e7e0ff]">
                <Sparkles className="size-5" />
              </span>
              <div className="min-w-0">
                <h2 className="text-[16px] font-extrabold tracking-[-0.03em] text-[#14225b]">Add New Achievement</h2>
                <p className="mt-1 max-w-xl text-[11px] leading-relaxed text-[#777993]">
                  Add awards, nominations, trainings, workshops, certifications or institutions to your profile.
                </p>
              </div>
            </div>
            <Button
              type="button"
              onClick={startAdd}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#4d20ed] via-[#7732ed] to-[#c936ed] px-5 text-xs font-extrabold text-white shadow-[0_9px_22px_rgba(111,45,226,0.24)] transition-all hover:brightness-105 active:scale-[0.98] sm:w-auto"
            >
              <Plus className="size-4" /> Add Achievement
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <AchievementFilters value={activeFilter} onChange={setActiveFilter} showCredits={showCredits} />
          <Card className="rounded-[20px] border-[#e9e6f7] bg-white/90 shadow-[0_8px_20px_rgba(36,43,93,0.05)]">
            <CardContent className="flex items-center gap-2.5 p-2.5">
              <Search className="ml-2 size-4 shrink-0 text-[#8588a5]" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search achievements..."
                aria-label="Search achievements"
                className="h-10 border-0 bg-transparent px-1 text-xs shadow-none focus-visible:ring-0"
              />
              {search && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setSearch("")}
                  className="grid size-8 shrink-0 place-items-center rounded-full text-[#8588a5] hover:bg-[#f1edff] hover:text-[#5e34d7]"
                  aria-label="Clear search"
                >
                  <span aria-hidden="true">x</span>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {verifiedCount > 0 && (
          <Card className="rounded-[22px] border-[#d9cef9] bg-[#f9f6ff] shadow-none">
            <CardContent className="flex items-center gap-3 p-3.5">
              <span className="grid size-10 shrink-0 place-items-center rounded-[13px] bg-[#e9e0ff] text-[#6840df]"><ShieldCheck className="size-5" /></span>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-[#252267]">{verifiedCount} verified milestone{verifiedCount === 1 ? "" : "s"}</p>
                <p className="mt-0.5 text-[10px] text-[#7770ad]">Public records and recruiter-cosigned details stand out on your profile.</p>
              </div>
            </CardContent>
          </Card>
        )}

        <section className="space-y-3" aria-labelledby="your-achievements-heading">
          <div className="flex items-end justify-between gap-3 px-1">
            <div>
              <h2 id="your-achievements-heading" className="text-[20px] font-extrabold tracking-[-0.04em] text-[#14225b]">
                Your Achievements <span className="font-medium text-[#8588a6]">({achievements.length})</span>
              </h2>
              <p className="mt-1 text-[11px] text-[#8588a6]">
                {filteredAchievements.length === achievements.length
                  ? "Keep your strongest milestones easy to scan."
                  : `${filteredAchievements.length} result${filteredAchievements.length === 1 ? "" : "s"} matching your view.`}
              </p>
            </div>
          </div>

          {achievementsQuery.isError ? (
            <Card className="rounded-[24px] border-[#f1d8df] bg-[#fff8fa]">
              <CardContent className="p-6 text-center text-sm text-[#a53b57]">Could not load achievements. Please try again.</CardContent>
            </Card>
          ) : filteredAchievements.length === 0 ? (
            <Card className="rounded-[24px] border-dashed border-[#dcd6f2] bg-white/70">
              <CardContent className="flex flex-col items-center p-8 text-center">
                <span className="grid size-12 place-items-center rounded-[16px] bg-[#f1edff] text-[#6840df]"><Sparkles className="size-5" /></span>
                <h3 className="mt-3 text-sm font-extrabold text-[#14225b]">{achievements.length ? "No matching achievements" : "Your spotlight is ready"}</h3>
                <p className="mt-1 max-w-xs text-[11px] leading-relaxed text-[#8588a6]">{achievements.length ? "Try another search or category." : "Add a milestone to give recruiters a richer view of your journey."}</p>
                {!achievements.length && (
                  <Button type="button" variant="ghost" onClick={startAdd} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full bg-[#f1edff] px-4 text-xs font-bold text-[#5e34d7] hover:bg-[#e8e1ff]"><Plus className="size-4" /> Add Achievement</Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2.5">
              {filteredAchievements.map((achievement) => (
                <AchievementManageRow
                  key={achievement._id}
                  achievement={achievement}
                  onEdit={() => startEdit(achievement)}
                  onDelete={() => setDeleteTarget(achievement)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <AchievementForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingAchievement(undefined);
        }}
        achievement={editingAchievement}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-[24px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#14225b]">Delete this achievement?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove &quot;{deleteTarget?.title || deleteTarget?.project_name || "this milestone"}&quot; from your profile. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleteMutation.isPending} className="bg-[#d04462] text-white hover:bg-[#b93250]">
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
