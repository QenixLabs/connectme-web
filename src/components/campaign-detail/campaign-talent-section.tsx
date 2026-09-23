"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Check,
  Loader2,
  MapPin,
  MessageCircle,
  Search,
  Send,
  SlidersHorizontal,
  Sparkles,
  User,
  UserSearch,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { MessageTalentButton } from "@/components/campaign-detail/message-talent-button";
import { cn } from "@/lib/utils";
import type { MatchingTalent } from "@/lib/api/campaigns";
import {
  useBulkInviteMatchingTalent,
  useBulkInvitePreview,
  useCampaignMatchingTalents,
  useInviteSingleTalent,
} from "@/hooks/use-campaigns";
import { useProfessions } from "@/hooks/use-talent-search";

/* -------------------------------------------------------------------------- */
/*                                   constants                                */
/* -------------------------------------------------------------------------- */

const PAGE_LIMIT = 20;

const QUICK_MATCHES: Array<{ label: string; value: number | null }> = [
  { label: "All", value: null },
  { label: "90%+", value: 90 },
  { label: "80%+", value: 80 },
  { label: "70%+", value: 70 },
  { label: "60%+", value: 60 },
];

const BULK_THRESHOLDS = [90, 80, 70, 60] as const;

const CITY_OPTIONS = [
  "Mumbai",
  "Delhi",
  "Hyderabad",
  "Chennai",
  "Bengaluru",
  "Kolkata",
  "Pune",
  "Remote",
];

const GENDER_OPTIONS = ["Female", "Male"];

const LANGUAGE_OPTIONS = [
  "Hindi",
  "Telugu",
  "Tamil",
  "English",
  "Marathi",
  "Malayalam",
];

const SKILL_OPTIONS = [
  "Drama",
  "Commercial",
  "Dance",
  "Theatre",
  "Voice Over",
  "Fashion",
  "Classical",
  "Ad Films",
];

const AVAILABILITY_OPTIONS = [
  { label: "Available", value: "available" },
  { label: "Busy", value: "busy" },
  { label: "Not available", value: "not_available" },
];

export interface TalentFilters {
  profession: string;
  location: string;
  gender: string;
  ageMin: number | null;
  ageMax: number | null;
  skills: string[];
  languages: string[];
  availability: string;
  verifiedOnly: boolean;
  minMatch: number | null;
}

const emptyFilters: TalentFilters = {
  profession: "",
  location: "",
  gender: "",
  ageMin: null,
  ageMax: null,
  skills: [],
  languages: [],
  availability: "",
  verifiedOnly: false,
  minMatch: null,
};

/* -------------------------------------------------------------------------- */
/*                                   helpers                                  */
/* -------------------------------------------------------------------------- */

function computeAge(dateOfBirth?: string): number | null {
  if (!dateOfBirth) return null;
  const birth = new Date(dateOfBirth);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age >= 0 ? age : null;
}

function locationLabel(loc?: MatchingTalent["location"]): string {
  const parts = [loc?.city, loc?.state].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "";
}

function skillNames(talent: MatchingTalent): string[] {
  const fromSkills = (talent.skills ?? []).map((s) =>
    typeof s === "string" ? s : s.name,
  );
  const fromLanguages = Array.isArray(talent.languages)
    ? talent.languages
        .slice(0, 2)
        .map((l) => (typeof l === "string" ? l : l.name))
    : [];
  const merged = [...fromSkills, ...fromLanguages].filter(Boolean);
  return Array.from(new Set(merged));
}

function availabilityLabel(status?: string): string | null {
  if (!status) return null;
  if (status === "available") return "Available";
  if (status === "busy") return "Busy";
  if (status === "not_available") return "Not available";
  return status;
}

function hasActiveFilters(f: TalentFilters, search: string): boolean {
  return (
    search.trim().length > 0 ||
    !!f.profession ||
    !!f.location ||
    !!f.gender ||
    f.ageMin != null ||
    f.ageMax != null ||
    f.skills.length > 0 ||
    f.languages.length > 0 ||
    !!f.availability ||
    f.verifiedOnly ||
    f.minMatch != null
  );
}

function toApiParams(f: TalentFilters, search: string) {
  return {
    search: search.trim() || undefined,
    profession: f.profession || undefined,
    location_city: f.location || undefined,
    gender: f.gender || undefined,
    ageMin: f.ageMin ?? undefined,
    ageMax: f.ageMax ?? undefined,
    skills: f.skills.length ? f.skills.join(",") : undefined,
    languages: f.languages.length ? f.languages.join(",") : undefined,
    availability: f.availability || undefined,
    verified_only: f.verifiedOnly || undefined,
    minMatch: f.minMatch ?? undefined,
  };
}

/* -------------------------------------------------------------------------- */
/*                                 result card                                */
/* -------------------------------------------------------------------------- */

function TalentCard({
  talent,
  selected,
  inviting,
  invited,
  onToggle,
  onInvite,
}: {
  talent: MatchingTalent;
  selected: boolean;
  inviting: boolean;
  invited: boolean;
  onToggle: () => void;
  onInvite: () => void;
}) {
  const name = talent.full_legal_name || talent.username || "Talent";
  const profession =
    talent.professions?.slice(0, 2).join(" · ") || "Talent";
  const location = locationLabel(talent.location);
  const match = Math.round(talent.match_score ?? 0);
  const age = computeAge(talent.date_of_birth);
  const meta: string[] = [];
  if (age != null) meta.push(`Age ${age}`);
  if (talent.years_of_experience != null)
    meta.push(`${talent.years_of_experience}+ yrs exp`);
  const chips = skillNames(talent);
  const chipCount = chips.length;
  const chipSignature = chips.join("\u0000");
  const [visibleChipCount, setVisibleChipCount] = useState(0);
  const skillsRowRef = useRef<HTMLDivElement>(null);
  const visibleChips = chips.slice(0, visibleChipCount);
  const extraChips = chips.length - visibleChips.length;
  const availability = availabilityLabel(talent.availability);

  useEffect(() => {
    const row = skillsRowRef.current;
    if (!row || chipCount === 0) return;

    const measure = () => {
      const availableWidth = row.clientWidth;
      const skillElements = Array.from(
        row.querySelectorAll<HTMLElement>("[data-skill-measure]"),
      );
      const moreElements = Array.from(
        row.querySelectorAll<HTMLElement>("[data-more-measure]"),
      );
      const gap = Number.parseFloat(getComputedStyle(row).columnGap) || 0;
      let nextVisibleCount = 0;

      for (let count = chipCount; count >= 0; count -= 1) {
        const extra = chipCount - count;
        const itemWidths = skillElements
          .slice(0, count)
          .reduce((total, element) => total + element.offsetWidth, 0);
        const moreWidth = extra > 0 ? moreElements[extra - 1]?.offsetWidth ?? 0 : 0;
        const itemCount = count + (extra > 0 ? 1 : 0);
        const totalWidth = itemWidths + moreWidth + Math.max(0, itemCount - 1) * gap;

        if (totalWidth <= availableWidth) {
          nextVisibleCount = count;
          break;
        }
      }

      setVisibleChipCount((current) =>
        current === nextVisibleCount ? current : nextVisibleCount,
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(row);
    return () => observer.disconnect();
  }, [chipCount, chipSignature]);

  return (
    <article
      className={cn(
        "rounded-xl border bg-card p-3 shadow-card transition-colors",
        selected ? "border-primary/60 ring-1 ring-primary/30" : "border-border/70",
      )}
    >
      <div className="flex min-w-0 gap-3">
        <div className="relative h-[104px] w-[92px] shrink-0 overflow-hidden rounded-xl border border-border/70 bg-secondary sm:h-[112px] sm:w-[100px]">
          {talent.profile_photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={talent.profile_photo}
              alt={`${name}`}
              loading="lazy"
              className="size-full object-cover"
            />
          ) : (
            <span className="grid size-full place-items-center">
              <User className="size-8 text-muted-foreground/40" />
            </span>
          )}
          <Checkbox
            checked={selected}
            onCheckedChange={onToggle}
            aria-label={`Select ${name}`}
            className="absolute left-2 top-2 z-10 rounded-md border-border bg-white/95 shadow-sm"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="flex min-w-0 items-center gap-1 text-[16px] font-bold leading-tight text-foreground">
                <span className="truncate">{name}</span>
                {talent.is_verified && (
                  <BadgeCheck className="size-4 shrink-0 text-primary" />
                )}
              </p>
              <p className="mt-0.5 truncate text-[13px] font-medium text-muted-foreground">
                {profession}
              </p>
              {location && (
                <p className="mt-1 flex items-center gap-1 truncate text-[12px] text-muted-foreground">
                  <MapPin className="size-3 shrink-0" />
                  <span className="truncate">{location}</span>
                </p>
              )}
              {meta.length > 0 && (
                <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
                  {meta.join(" · ")}
                </p>
              )}
              {availability && (
                <p
                  className={cn(
                    "mt-1 flex items-center gap-1 text-[11px] font-medium",
                    talent.availability === "available"
                      ? "text-success"
                      : talent.availability === "busy"
                        ? "text-warning"
                        : "text-muted-foreground",
                  )}
                >
                  <span className="size-1.5 shrink-0 rounded-full bg-current" />
                  {availability}
                </p>
              )}
            </div>
            <span
              className={cn(
                "w-[54px] shrink-0 rounded-xl px-2 py-1.5 text-center",
                match >= 80
                  ? "bg-primary text-primary-foreground"
                  : match >= 60
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground",
              )}
              aria-label={`${match}% match`}
            >
              <span className="block text-[14px] font-extrabold leading-none">
                {match}%
              </span>
              <span className="mt-0.5 block text-[9px] font-bold uppercase tracking-wide opacity-80">
                Match
              </span>
            </span>
          </div>
        </div>
      </div>

      {chipCount > 0 && (
        <div
          ref={skillsRowRef}
          className="relative mt-2.5 flex min-w-0 flex-nowrap items-center gap-2 overflow-hidden"
        >
          {visibleChips.map((chip) => (
            <span
              key={chip}
              className="shrink-0 whitespace-nowrap rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-medium text-secondary-foreground"
            >
              {chip}
            </span>
          ))}
          {extraChips > 0 && (
            <span className="shrink-0 whitespace-nowrap rounded-lg bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              +{extraChips}
            </span>
          )}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 flex w-max gap-2 opacity-0"
          >
            {chips.map((chip, index) => (
              <span
                key={`measure-${chip}-${index}`}
                data-skill-measure
                className="shrink-0 whitespace-nowrap rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-medium"
              >
                {chip}
              </span>
            ))}
            {Array.from({ length: chipCount }, (_, index) => (
              <span
                key={`measure-more-${index + 1}`}
                data-more-measure
                className="shrink-0 whitespace-nowrap rounded-lg bg-muted px-2.5 py-1 text-xs font-medium"
              >
                +{index + 1}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-2.5 grid grid-cols-3 gap-2">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-10 min-w-0 rounded-xl border-border px-1.5 text-[12px] font-semibold text-foreground hover:bg-muted sm:px-2"
        >
          <Link href={`/talent/${talent.username}`}>
            <span className="truncate sm:hidden">Profile</span>
            <span className="hidden truncate sm:inline">View Profile</span>
          </Link>
        </Button>
        <div className="relative min-w-0">
          <MessageCircle
            aria-hidden="true"
            className="pointer-events-none absolute left-2 top-1/2 z-10 size-4 -translate-y-1/2"
          />
          <MessageTalentButton
            username={talent.username}
            talentName={name}
            variant="button"
            className="h-10 w-full min-w-0 gap-1 rounded-xl border-border px-1.5 pl-7 text-[12px] text-foreground hover:bg-muted sm:px-2 sm:pl-7 [&_svg]:hidden"
          />
        </div>
        <Button
          size="sm"
          disabled={inviting || invited}
          onClick={onInvite}
          className="h-10 min-w-0 gap-1 rounded-xl px-1.5 text-[12px] font-semibold sm:px-2"
        >
          {inviting ? (
            <Loader2 className="size-4 shrink-0 animate-spin" />
          ) : invited ? (
            <Check className="size-4 shrink-0" />
          ) : (
            <Send className="size-4 shrink-0" />
          )}
          <span className="truncate">{inviting ? "Sending…" : invited ? "Invited" : "Invite"}</span>
        </Button>
      </div>
    </article>
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-xl border border-border/70 bg-card p-3">
      <div className="flex gap-3">
        <Skeleton className="h-[104px] w-[92px] shrink-0 rounded-xl sm:h-[112px] sm:w-[100px]" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex justify-between gap-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-10 w-[54px] rounded-xl" />
          </div>
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-3 w-2/5" />
        </div>
      </div>
      <div className="mt-2.5 flex gap-1.5">
        <Skeleton className="h-6 w-28 rounded-lg" />
        <Skeleton className="h-6 w-24 rounded-lg" />
      </div>
      <div className="mt-2.5 grid grid-cols-3 gap-2">
        <Skeleton className="h-10 rounded-xl" />
        <Skeleton className="h-10 rounded-xl" />
        <Skeleton className="h-10 rounded-xl" />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              filter sheet body                             */
/* -------------------------------------------------------------------------- */

function FilterSheetBody({
  draft,
  setDraft,
  professions,
  onReset,
  onApply,
}: {
  draft: TalentFilters;
  setDraft: (next: TalentFilters) => void;
  professions: string[] | undefined;
  onReset: () => void;
  onApply: () => void;
}) {
  const set = (patch: Partial<TalentFilters>) =>
    setDraft({ ...draft, ...patch });
  const toggleList = (key: "skills" | "languages", value: string) => {
    const list = draft[key];
    set({
      [key]: list.includes(value)
        ? list.filter((v) => v !== value)
        : [...list, value],
    } as Partial<TalentFilters>);
  };
  const selectClass =
    "h-10 w-full rounded-lg border border-border bg-background px-2.5 text-[13px] text-foreground outline-none focus:border-primary";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pb-4">
        <div>
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            Minimum match
          </p>
          <div className="rounded-xl border border-border/70 bg-muted/40 p-3">
            <div className="flex items-center justify-between text-[13px] font-bold">
              <span>Match score</span>
              <span className="text-primary">{draft.minMatch ?? 0}%+</span>
            </div>
            <Slider
              className="mt-3"
              min={0}
              max={100}
              step={5}
              value={[draft.minMatch ?? 0]}
              onValueChange={([v]) =>
                set({ minMatch: v === 0 ? null : v })
              }
            />
            <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        <label className="block text-xs font-semibold text-muted-foreground">
          Profession
          <select
            value={draft.profession}
            onChange={(e) => set({ profession: e.target.value })}
            className={`${selectClass} mt-1`}
          >
            <option value="">Any profession</option>
            {(professions ?? []).map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs font-semibold text-muted-foreground">
          Location
          <select
            value={draft.location}
            onChange={(e) => set({ location: e.target.value })}
            className={`${selectClass} mt-1`}
          >
            <option value="">Any location</option>
            {CITY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-2">
          <label className="block text-xs font-semibold text-muted-foreground">
            Min age
            <Input
              type="number"
              min={18}
              max={70}
              value={draft.ageMin ?? ""}
              onChange={(e) =>
                set({
                  ageMin: e.target.value === "" ? null : Number(e.target.value),
                })
              }
              placeholder="18"
              className="mt-1"
            />
          </label>
          <label className="block text-xs font-semibold text-muted-foreground">
            Max age
            <Input
              type="number"
              min={18}
              max={70}
              value={draft.ageMax ?? ""}
              onChange={(e) =>
                set({
                  ageMax: e.target.value === "" ? null : Number(e.target.value),
                })
              }
              placeholder="60"
              className="mt-1"
            />
          </label>
        </div>

        <label className="block text-xs font-semibold text-muted-foreground">
          Gender
          <select
            value={draft.gender}
            onChange={(e) => set({ gender: e.target.value })}
            className={`${selectClass} mt-1`}
          >
            <option value="">Any gender</option>
            {GENDER_OPTIONS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs font-semibold text-muted-foreground">
          Availability
          <select
            value={draft.availability}
            onChange={(e) => set({ availability: e.target.value })}
            className={`${selectClass} mt-1`}
          >
            <option value="">Any availability</option>
            {AVAILABILITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <div>
          <p className="mb-1.5 text-xs font-semibold text-muted-foreground">
            Skills
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SKILL_OPTIONS.map((s) => {
              const active = draft.skills.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleList("skills", s)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground",
                  )}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-xs font-semibold text-muted-foreground">
            Languages
          </p>
          <div className="flex flex-wrap gap-1.5">
            {LANGUAGE_OPTIONS.map((l) => {
              const active = draft.languages.includes(l);
              return (
                <button
                  key={l}
                  type="button"
                  onClick={() => toggleList("languages", l)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground",
                  )}
                >
                  {l}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/40 px-3 py-2.5">
          <span className="text-[13px] font-bold">Verified only</span>
          <Switch
            checked={draft.verifiedOnly}
            onCheckedChange={(v) => set({ verifiedOnly: v })}
            aria-label="Verified only"
          />
        </div>
      </div>

      <div className="flex shrink-0 gap-2 border-t border-border bg-background p-4">
        <Button variant="ghost" onClick={onReset} className="flex-1">
          Reset
        </Button>
        <Button onClick={onApply} className="flex-[2]">
          Apply Filters
        </Button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              bulk invite dialog                            */
/* -------------------------------------------------------------------------- */

function BulkInviteDialog({
  open,
  onOpenChange,
  mode,
  currentCount,
  currentFiltersSummary,
  defaultThreshold,
  filterParams,
  campaignId,
  onDone,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "threshold" | "filters";
  currentCount: number;
  currentFiltersSummary: string[];
  defaultThreshold: number | null;
  filterParams: ReturnType<typeof toApiParams>;
  campaignId: string;
  onDone: (invited: number, skipped: number) => void;
}) {
  const [threshold, setThreshold] = useState<number | "custom">(defaultThreshold ?? 60);
  const [custom, setCustom] = useState(defaultThreshold ?? 60);
  const bulk = useBulkInviteMatchingTalent();

  const effectiveMin: number | undefined =
    mode === "filters"
      ? (filterParams.minMatch as number | undefined)
      : threshold === "custom"
        ? custom
        : threshold;

  const previewParams = useMemo(
    () => ({ ...filterParams, minMatch: effectiveMin }),
    [filterParams, effectiveMin],
  );
  const preview = useBulkInvitePreview(campaignId, previewParams, open);

  useEffect(() => {
    if (open) {
      setThreshold(defaultThreshold ?? 60);
      setCustom(defaultThreshold ?? 60);
    }
  }, [open, defaultThreshold]);

  const send = () => {
    bulk.mutate(
      {
        campaignId,
        payload:
          mode === "filters"
            ? { filters: (filterParams as never) ?? {}, minMatch: effectiveMin }
            : { filters: (filterParams as never) ?? {}, minMatch: effectiveMin },
      },
      {
        onSuccess: (result) => {
          toast.success(
            `${result.invited} talent invited · ${result.skipped} skipped`,
          );
          onOpenChange(false);
          onDone(result.invited, result.skipped);
        },
        onError: (err) => {
          const message =
            (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message || "Could not send invitations";
          toast.error(message);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "filters" ? "Invite matching talent" : "Bulk invite"}
          </DialogTitle>
          <DialogDescription>
            {mode === "filters"
              ? "Send invitations to everyone matching the current filters. This runs on the server — no need to select profiles one by one."
              : "Choose a minimum match score. We’ll preview how many eligible talents will be invited before anything is sent."}
          </DialogDescription>
        </DialogHeader>

        {mode === "threshold" ? (
          <div className="mt-1 space-y-2">
            <p className="text-[12px] font-bold uppercase tracking-wide text-muted-foreground">
              Invite talent matching at least
            </p>
            <div className="grid grid-cols-2 gap-2">
              {BULK_THRESHOLDS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setThreshold(t)}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-sm font-bold transition-colors",
                    threshold === t
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background",
                  )}
                >
                  {t}%+
                </button>
              ))}
              <button
                type="button"
                onClick={() => setThreshold("custom")}
                className={cn(
                  "col-span-2 rounded-xl border px-3 py-2.5 text-sm font-bold transition-colors",
                  threshold === "custom"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background",
                )}
              >
                Custom
              </button>
            </div>
            {threshold === "custom" && (
              <div className="rounded-xl border border-border/70 bg-muted/40 p-3">
                <div className="flex items-center justify-between text-[13px] font-bold">
                  <span>Minimum match</span>
                  <span className="text-primary">{custom}%</span>
                </div>
                <Slider
                  className="mt-3"
                  min={0}
                  max={100}
                  step={5}
                  value={[custom]}
                  onValueChange={([v]) => setCustom(v)}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-border/70 bg-muted/40 p-3">
            <p className="text-[12px] font-bold uppercase tracking-wide text-muted-foreground">
              Current filters
            </p>
            {currentFiltersSummary.length === 0 ? (
              <p className="mt-1 text-[13px]">No filters — all matching talent.</p>
            ) : (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {currentFiltersSummary.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-background px-2.5 py-1 text-[12px] font-semibold"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
            <p className="mt-2 text-[13px] font-bold">
              Invite all {currentCount} matching talents
            </p>
          </div>
        )}

        <div className="rounded-xl border border-border/70 bg-card p-3 text-[13px]">
          {preview.isLoading ? (
            <p className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Checking eligibility…
            </p>
          ) : preview.isError ? (
            <p className="text-muted-foreground">
              Could not load a preview. You can still continue — ineligible
              talent will be skipped automatically.
            </p>
          ) : preview.data ? (
            <div className="space-y-1">
              <p className="font-bold">
                Invite talent with match ≥ {preview.data.min_match}%
              </p>
              <p className="text-muted-foreground">
                Eligible talent: {preview.data.eligible}
              </p>
              <p className="text-muted-foreground">
                Already invited/applied: {preview.data.already_excluded} excluded
              </p>
              <p className="font-bold">
                Invitations to send: {preview.data.to_send}
              </p>
            </div>
          ) : null}
        </div>

        <DialogFooter className="flex-row gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={send}
            disabled={bulk.isPending || (preview.data?.to_send ?? 1) === 0}
            className="flex-[2]"
          >
            {bulk.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            {bulk.isPending
              ? "Sending…"
              : `Send ${preview.data?.to_send ?? ""} Invitations`.trim()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  main section                              */
/* -------------------------------------------------------------------------- */

export function CampaignTalentSection({ campaignId }: { campaignId: string }) {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [applied, setApplied] = useState<TalentFilters>(emptyFilters);
  const [draft, setDraft] = useState<TalentFilters>(emptyFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<MatchingTalent[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [confirmSelectedOpen, setConfirmSelectedOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkMode, setBulkMode] = useState<"threshold" | "filters">("threshold");
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { data: professions } = useProfessions();

  // Debounced search — server-side filtering only.
  useEffect(() => {
    const t = window.setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  const apiParams = useMemo(
    () => ({ ...toApiParams(applied, search), page, limit: PAGE_LIMIT, sort: "match_desc" as const }),
    [applied, search, page],
  );

  const query = useCampaignMatchingTalents(campaignId, apiParams);
  const inviteSingle = useInviteSingleTalent();
  const bulkInvite = useBulkInviteMatchingTalent();

  // Accumulate pages; reset when filters/search change.
  useEffect(() => {
    if (page === 1) setItems([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, applied]);

  useEffect(() => {
    if (!query.data?.data) return;
    setItems((prev) => {
      if (page === 1) return query.data.data;
      const seen = new Set(prev.map((t) => t.user_id));
      return [...prev, ...query.data.data.filter((t) => !seen.has(t.user_id))];
    });
  }, [query.data, page]);

  const visible = useMemo(
    () => items.filter((t) => !invitedIds.has(t.user_id)),
    [items, invitedIds],
  );

  const total = (query.data?.total ?? 0) - invitedIds.size;
  const hasMore = page < (query.data?.totalPages ?? 1);

  // Infinite scroll — auto-advance when the sentinel scrolls into view.
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !hasMore || query.isFetching) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setPage((p) => p + 1);
      },
      { rootMargin: "480px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, query.isFetching, visible.length]);

  const allVisibleSelected =
    visible.length > 0 && visible.every((t) => selected.has(t.user_id));

  const toggle = (userId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        visible.forEach((t) => next.delete(t.user_id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        visible.forEach((t) => next.add(t.user_id));
        return next;
      });
    }
  };

  const handleInviteSingle = (talent: MatchingTalent) => {
    setInvitingId(talent.user_id);
    inviteSingle.mutate(
      { campaignId, talentId: talent.user_id },
      {
        onSuccess: () => {
          toast.success(`Invited ${talent.full_legal_name || talent.username}`);
          setInvitedIds((prev) => new Set(prev).add(talent.user_id));
          setSelected((prev) => {
            const next = new Set(prev);
            next.delete(talent.user_id);
            return next;
          });
          query.refetch();
        },
        onError: (err) => {
          const message =
            (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message || "Could not send invite";
          toast.error(message);
        },
        onSettled: () => setInvitingId(null),
      },
    );
  };

  const handleInviteSelected = () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    bulkInvite.mutate(
      { campaignId, payload: { talent_ids: ids } },
      {
        onSuccess: (result) => {
          toast.success(
            `${result.invited} talent invited · ${result.skipped} skipped`,
          );
          setInvitedIds((prev) => new Set([...prev, ...ids]));
          setSelected(new Set());
          setConfirmSelectedOpen(false);
          query.refetch();
        },
        onError: (err) => {
          const message =
            (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message || "Could not send invitations";
          toast.error(message);
        },
      },
    );
  };

  const activeFilterSummary = useMemo(() => {
    const out: string[] = [];
    if (applied.profession) out.push(applied.profession);
    if (applied.location) out.push(applied.location);
    if (applied.gender) out.push(applied.gender);
    if (applied.ageMin != null && applied.ageMax != null)
      out.push(`Age ${applied.ageMin}–${applied.ageMax}`);
    else if (applied.ageMin != null) out.push(`Age ${applied.ageMin}+`);
    else if (applied.ageMax != null) out.push(`Age ≤${applied.ageMax}`);
    applied.languages.forEach((l) => out.push(l));
    applied.skills.forEach((s) => out.push(s));
    if (applied.availability) out.push(applied.availability);
    if (applied.verifiedOnly) out.push("Verified");
    if (applied.minMatch != null) out.push(`Match ≥ ${applied.minMatch}%`);
    return out;
  }, [applied]);

  const isFiltered = hasActiveFilters(applied, search);
  const quickValue = applied.minMatch;

  return (
    <section className="py-3">
      {/* Compact header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="flex items-center gap-1.5 font-display text-[16px] font-extrabold tracking-tight">
            <UserSearch className="size-4 text-primary" />
            Talent
          </h2>
          <p className="mt-0.5 truncate text-[12.5px] text-muted-foreground">
            Discover people who match this campaign
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setBulkMode("threshold");
            setBulkOpen(true);
          }}
          className="h-8 shrink-0 gap-1.5 rounded-lg text-[12px]"
        >
          <Sparkles className="size-3.5" />
          Bulk Invite
        </Button>
      </div>

      {/* Search + filters */}
      <div className="mt-2.5 flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search talent..."
            aria-label="Search talent"
            className="h-10 rounded-xl bg-card pl-9"
          />
          {searchInput && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearchInput("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setDraft(applied);
            setFiltersOpen(true);
          }}
          className="h-10 shrink-0 gap-1.5 rounded-xl"
        >
          <SlidersHorizontal className="size-4" />
          Filters
          {activeFilterSummary.length > 0 && (
            <span className="grid size-5 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
              {activeFilterSummary.length}
            </span>
          )}
        </Button>
      </div>

      {/* Quick match chips */}
      <div className="no-scrollbar mt-2 flex gap-1.5 overflow-x-auto pb-0.5">
        {QUICK_MATCHES.map((chip) => {
          const active = quickValue === chip.value;
          return (
            <button
              key={chip.label}
              type="button"
              onClick={() => {
                setApplied((prev) => ({ ...prev, minMatch: chip.value }));
                setPage(1);
              }}
              aria-pressed={active}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-[12px] font-bold transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* Count + sort */}
      <div className="mt-2 flex items-center justify-between gap-2 text-[12.5px]">
        <p className="font-bold" aria-live="polite">
          {query.isLoading && page === 1
            ? "Finding matching talent…"
            : `${Math.max(0, total)} matching talent${total === 1 ? "" : "s"}`}
        </p>
        <p className="shrink-0 text-muted-foreground">Sorted by: Best match</p>
      </div>

      {/* Invite-all-matching-filters */}
      {isFiltered && total > 0 && (
        <button
          type="button"
          onClick={() => {
            setBulkMode("filters");
            setBulkOpen(true);
          }}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-primary/40 bg-primary/5 px-3 py-2.5 text-[13px] font-bold text-primary hover:bg-primary/10"
        >
          <Send className="size-3.5" />
          Invite all {total} matching talents
        </button>
      )}

      {/* Results */}
      <div className="mt-3">
        {query.isLoading && page === 1 ? (
          <div className="grid gap-2.5 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : query.isError ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-card/50 px-4 py-10 text-center">
            <p className="text-sm font-semibold">Could not load matching talent</p>
            <p className="text-xs text-muted-foreground">
              Check your connection and try again.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => query.refetch()}
              className="mt-1"
            >
              Retry
            </Button>
          </div>
        ) : visible.length === 0 ? (
          isFiltered ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-card/50 px-4 py-10 text-center">
              <UserSearch className="size-7 text-muted-foreground" />
              <p className="text-sm font-semibold">
                No talent match these filters yet.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-1"
                onClick={() => {
                  setApplied(emptyFilters);
                  setSearchInput("");
                  setSearch("");
                  setPage(1);
                  setSelected(new Set());
                }}
              >
                Reset filters
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-card/50 px-4 py-10 text-center">
              <Check className="size-7 text-success" />
              <p className="text-sm font-semibold">
                You’ve already contacted all matching talent for this campaign.
              </p>
              <p className="max-w-xs text-xs text-muted-foreground">
                New talent that matches this campaign will appear here.
              </p>
            </div>
          )
        ) : (
          <>
            {visible.length > 1 && (
              <button
                type="button"
                onClick={toggleSelectAllVisible}
                className="mb-2 flex items-center gap-1.5 text-[12px] font-bold text-primary hover:underline"
              >
                {allVisibleSelected ? "Deselect all visible" : "Select all visible"}
              </button>
            )}
            <div className="grid gap-2.5 lg:grid-cols-2">
              {visible.map((talent) => (
                <TalentCard
                  key={talent.user_id}
                  talent={talent}
                  selected={selected.has(talent.user_id)}
                  inviting={invitingId === talent.user_id}
                  invited={invitedIds.has(talent.user_id)}
                  onToggle={() => toggle(talent.user_id)}
                  onInvite={() => handleInviteSingle(talent)}
                />
              ))}
            </div>
            {query.isFetching && page > 1 && (
              <div className="mt-3 grid gap-2.5 lg:grid-cols-2" aria-hidden="true">
                <CardSkeleton />
                <CardSkeleton />
              </div>
            )}
            {hasMore && (
              <div ref={loadMoreRef} className="mt-3">
                {!query.isFetching && (
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => p + 1)}
                    className="w-full rounded-xl"
                  >
                    Load more talent
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Sticky selection bar (above bottom nav) */}
      {selected.size > 0 && (
        <div className="fixed inset-x-0 bottom-[76px] z-40 px-4 sm:bottom-24">
          <div className="mx-auto flex w-full max-w-[1160px] items-center gap-2 rounded-2xl border border-border bg-card/95 p-2.5 pl-3.5 shadow-nav backdrop-blur">
            <p className="min-w-0 flex-1 truncate text-[13px] font-bold">
              {selected.size} selected
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelected(new Set())}
              className="h-9 shrink-0"
            >
              Clear
            </Button>
            <Button
              size="sm"
              onClick={() => setConfirmSelectedOpen(true)}
              className="h-9 shrink-0 gap-1.5"
            >
              <Send className="size-3.5" />
              Invite selected
            </Button>
          </div>
        </div>
      )}

      {/* Filters sheet: bottom on mobile, side panel on desktop */}
      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent
          side="bottom"
          className="inset-x-0 bottom-0 top-auto flex h-[88vh] flex-col gap-0 overflow-hidden rounded-t-2xl border-t p-0 sm:inset-y-0 sm:bottom-auto sm:left-auto sm:right-0 sm:top-0 sm:h-full sm:w-[420px] sm:max-w-md sm:rounded-none sm:rounded-l-2xl sm:border-l sm:border-t-0"
        >
          <SheetHeader className="shrink-0 text-left">
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>
              Only talent matching these filters will be shown.
            </SheetDescription>
          </SheetHeader>
          <div className="flex min-h-0 flex-1 flex-col">
            <FilterSheetBody
              draft={draft}
              setDraft={setDraft}
              professions={professions}
              onReset={() => setDraft(emptyFilters)}
              onApply={() => {
                setApplied(draft);
                setPage(1);
                setSelected(new Set());
                setFiltersOpen(false);
              }}
            />
          </div>
          <SheetFooter className="sr-only" />
        </SheetContent>
      </Sheet>

      {/* Confirm invite-selected */}
      <Dialog open={confirmSelectedOpen} onOpenChange={setConfirmSelectedOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite {selected.size} talent?</DialogTitle>
            <DialogDescription>
              They’ll be invited to this campaign. Anyone already
              invited, applied, shortlisted or decided will be skipped
              automatically.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-2">
            <Button
              variant="ghost"
              onClick={() => setConfirmSelectedOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleInviteSelected}
              disabled={bulkInvite.isPending}
              className="flex-[2]"
            >
              {bulkInvite.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              {bulkInvite.isPending ? "Sending…" : `Send ${selected.size} Invites`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk invite (threshold + invite-all-filters) */}
      <BulkInviteDialog
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        mode={bulkMode}
        currentCount={Math.max(0, total)}
        currentFiltersSummary={activeFilterSummary}
        defaultThreshold={applied.minMatch}
        filterParams={toApiParams(applied, search)}
        campaignId={campaignId}
        onDone={(invited) => {
          // Invited talent are no longer eligible — refresh discovery.
          setSelected(new Set());
          setPage(1);
          query.refetch();
          void invited;
        }}
      />
    </section>
  );
}
