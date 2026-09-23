"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  Bookmark,
  BookmarkPlus,
  Briefcase,
  CalendarDays,
  Check,
  ChevronRight,
  Clock,
  Drama,
  Expand,
  Heart,
  Languages,
  Loader2,
  MapPin,
  Plane,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  TrendingUp,
  User,
  Users,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfessions, useTalentSearch } from "@/hooks/use-talent-search";
import {
  useDeleteSavedSearch,
  useMarkSavedSearchViewed,
  useSavedSearches,
  useUpsertSavedSearch,
} from "@/hooks/use-saved-searches";
import { useSaveTalent } from "@/hooks/use-talent-actions";
import { useRecruiterCampaigns } from "@/hooks/use-campaigns";
import {
  useRecruiterShortlists,
  useRemoveFromShortlist,
} from "@/hooks/use-shortlists";
import { talentApi, type TalentProfile } from "@/lib/api/talent";
import logoImage from "@/assets/rootin-logo-orange.png";
import type { SavedSearch } from "@/lib/api/saved-searches";
import {
  fromSavedSearchCriteria,
  toSavedSearchCriteria,
} from "@/lib/api/saved-searches";
import {
  AGE_BANDS,
  AVAILABILITY_OPTIONS,
  EXPERIENCE_BANDS,
  GENDER_OPTIONS,
  LANGUAGE_OPTIONS,
  SKILL_OPTIONS,
  availabilityLabel,
  bandToRange,
  criteriaSummary,
  emptyCriteria,
  hasAnyCriteria,
  toApiParams,
  toSearchParams,
  type SearchCriteria,
} from "@/lib/find-talent/search-model";

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

const TABS = ["Search", "Saved Searches", "Shortlisted"] as const;
type Tab = (typeof TABS)[number];

const SORT_OPTIONS = [
  { label: "Most Relevant", value: "relevance" },
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Name A-Z", value: "name_asc" },
  { label: "Name Z-A", value: "name_desc" },
] as const;
type SortValue = (typeof SORT_OPTIONS)[number]["value"];

type TalentHit = TalentProfile & {
  match_score?: number;
  matched_campaign?: string;
};

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

function formatLocation(loc?: TalentProfile["location"]): string {
  if (!loc) return "Location not set";
  const parts = [loc.city, loc.state].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "Location not set";
}

function computeAge(dateOfBirth: string): number | null {
  const birth = new Date(dateOfBirth);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age >= 0 ? age : null;
}

function formatHeight(cm: number): string {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet}'${inches}" (${Math.round(cm)} cm)`;
}

function availabilityText(status?: string): string {
  if (status === "available") return "Available";
  if (status === "busy") return "Busy";
  if (status === "not_available") return "Not available";
  return "Unknown";
}

function VerifiedBadge() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-label="Verified">
      <path
        fill="currentColor"
        d="M12 1.5 14.6 3l3-.2 1.1 2.8 2.5 1.7-.9 2.9.9 2.9-2.5 1.7-1.1 2.8-3-.2L12 22.5 9.4 21l-3 .2-1.1-2.8-2.5-1.7.9-2.9-.9-2.9 2.5-1.7L6.4 2.8l3 .2z"
        className="text-primary"
      />
      <path
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m8.5 12 2.4 2.4 4.6-4.8"
      />
    </svg>
  );
}

/* ---------------- Filter tile (mirror look, real dropdown) ---------------- */

function FilterTile({
  label,
  icon: Icon,
  value,
  options,
  onSelect,
}: {
  label: string;
  icon: typeof Drama;
  value: string;
  options: string[];
  onSelect: (v: string) => void;
}) {
  const active = Boolean(value);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`${label}${value ? `: ${value}` : ""}`}
        className={`flex min-h-[60px] w-full min-w-0 flex-col justify-center gap-1 rounded-[11px] border bg-white p-1.5 text-left shadow-[0_1px_3px_rgba(23,16,73,0.06)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6D28FF] ${
          active
            ? "border-[#6D28FF]/60 ring-1 ring-[#6D28FF]/30"
            : "border-[#ECEAF4]"
        }`}
      >
        <span className="flex w-full items-center justify-between">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-[#F3EEFF] text-[#6D28FF]">
            <Icon className="h-3.5 w-3.5" />
          </span>
          <ChevronRight className="h-3 w-3 shrink-0 text-[#6D28FF]/60" />
        </span>
        <span className="block w-full truncate text-[11px] font-semibold leading-tight text-[#07133D]">
          {label}
        </span>
        {active ? (
          <span className="block w-full truncate text-[9px] font-semibold leading-tight text-[#6D28FF]">
            {value}
          </span>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="max-h-72 overflow-auto rounded-xl border-border bg-popover"
      >
        <DropdownMenuItem onSelect={() => onSelect("")}>
          Any {label.toLowerCase()}
        </DropdownMenuItem>
        {options.map((o) => (
          <DropdownMenuItem key={o} onSelect={() => onSelect(o)}>
            {o}
            {o === value ? <Check className="ml-auto size-4" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ---------------- Talent quick preview (middle layer before full profile) ---------------- */

function TalentPreviewDialog({
  talent,
  open,
  onOpenChange,
  onShortlist,
}: {
  talent: TalentHit;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShortlist: (t: TalentHit) => void;
}) {
  const name = talent.full_legal_name || talent.username;
  const roles =
    talent.professions && talent.professions.length > 0
      ? talent.professions.slice(0, 3).join(" • ")
      : "Talent";
  const city = formatLocation(talent.location);
  const match =
    talent.match_score != null ? Math.round(talent.match_score) : null;
  const age = talent.date_of_birth ? computeAge(talent.date_of_birth) : null;
  const languages = talent.languages ?? [];
  const skills = (talent.skills ?? []).slice(0, 5);
  const pa = talent.physical_attributes;
  const appearance: string[] = [];
  if (pa?.height_cm) appearance.push(`Height ${formatHeight(pa.height_cm)}`);
  if (pa?.body_type) appearance.push(pa.body_type);
  if (pa?.complexion) appearance.push(`${pa.complexion} complexion`);
  const hair = [pa?.hair_color, pa?.hair_length].filter(Boolean).join(" ");
  if (hair) appearance.push(`${hair} hair`);
  if (pa?.eye_color) appearance.push(`${pa.eye_color} eyes`);
  if (pa?.distinctive_features) appearance.push(pa.distinctive_features);
  const travelBits = [
    talent.willing_to_travel,
    (talent.preferred_cities ?? []).join(", "),
  ].filter((b) => b && b.length > 0);
  const specialties = (talent.specialties ?? []).slice(0, 6);
  const accents = talent.accents ?? [];
  const trustScore =
    talent.trust_score != null ? Math.round(talent.trust_score) : null;
  const shortlistCount = talent.analytics?.shortlist_count ?? 0;
  const memberSinceYear = (() => {
    const d = new Date(talent.created_at);
    return Number.isNaN(d.getTime()) ? null : d.getFullYear();
  })();
  const isAvailable = talent.availability === "available";
  const isBusy = talent.availability === "busy";

  const facts = [
    {
      icon: Briefcase,
      label: "Experience",
      value:
        talent.years_of_experience != null
          ? `${talent.years_of_experience}+ yrs`
          : "Not listed",
    },
    {
      icon: CalendarDays,
      label: "Age",
      value:
        age != null
          ? `${age} yrs${talent.gender ? ` · ${talent.gender}` : ""}`
          : (talent.gender ?? "Not listed"),
    },
    {
      icon: Clock,
      label: "Availability",
      value: availabilityText(talent.availability),
    },
    {
      icon: TrendingUp,
      label: "Response",
      value:
        talent.response_rate != null
          ? `${talent.response_rate}%${
              talent.response_time ? ` · ${talent.response_time}` : ""
            }`
          : (talent.response_time ?? "Not shared"),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto border-border bg-card p-0 sm:max-w-lg">
        <DialogTitle className="sr-only">{name} quick preview</DialogTitle>
        <DialogDescription className="sr-only">
          Key details about {name} — experience, languages, skills and
          availability.
        </DialogDescription>
        <div className="flex gap-3 p-4 pb-0">
          <div className="relative h-40 w-28 shrink-0 overflow-hidden rounded-xl bg-muted">
            {talent.profile_photo ? (
              <img
                src={talent.profile_photo}
                alt={`${name}, ${roles}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="grid h-full w-full place-items-center bg-secondary">
                <User className="size-10 text-muted-foreground/40" />
              </div>
            )}
            <span
              className={`absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-semibold text-white ${
                isAvailable
                  ? "bg-success"
                  : isBusy
                    ? "bg-warning"
                    : "bg-foreground/70"
              }`}
            >
              <span className="h-1 w-1 rounded-full bg-white" />
              {availabilityText(talent.availability)}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2 pr-8">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="truncate text-base font-bold">{name}</h4>
                  {talent.is_verified ? <VerifiedBadge /> : null}
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {roles}
                </p>
                <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 shrink-0 text-primary" />
                  <span className="truncate">{city}</span>
                </p>
              </div>
              {match != null ? (
                <div className="shrink-0 rounded-lg bg-accent px-2 py-1.5 text-center">
                  <div className="text-sm font-bold leading-none text-accent-foreground">
                    {match}%
                  </div>
                  <div className="mt-0.5 text-[10px] leading-none text-accent-foreground/80">
                    Match
                  </div>
                </div>
              ) : null}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {facts.map((f) => (
                <div
                  key={f.label}
                  className="flex min-w-0 items-center gap-1.5 rounded-lg bg-muted/70 px-1.5 py-1.5"
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                    <f.icon className="size-3.5" />
                  </span>
                  <span className="min-w-0 leading-tight">
                    <span className="block text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {f.label}
                    </span>
                    <span className="block truncate text-[11px] font-bold text-foreground">
                      {f.value}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 pt-3">

          {talent.headline || talent.about ? (
            <div className="mt-4">
              {talent.headline ? (
                <p className="text-sm font-semibold text-foreground">
                  {talent.headline}
                </p>
              ) : null}
              {talent.about ? (
                <p className="mt-1 line-clamp-4 text-sm leading-relaxed text-muted-foreground">
                  {talent.about}
                </p>
              ) : null}
            </div>
          ) : null}

          {languages.length > 0 ? (
            <div className="mt-4">
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Languages
              </p>
              <p className="text-sm text-foreground">
                {languages
                  .slice(0, 5)
                  .map((l) => `${l.name}${l.fluency ? ` (${l.fluency})` : ""}`)
                  .join(" · ")}
              </p>
            </div>
          ) : null}

          {skills.length > 0 ? (
            <div className="mt-4">
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Top skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((s) => (
                  <span
                    key={s.name}
                    className="rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground"
                  >
                    {s.name}
                    {s.proficiency ? ` · ${s.proficiency}` : ""}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {appearance.length > 0 ? (
            <div className="mt-4">
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Appearance
              </p>
              <div className="flex flex-wrap gap-1.5">
                {appearance.map((a) => (
                  <span
                    key={a}
                    className="rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {specialties.length > 0 ? (
            <div className="mt-4">
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Specialties
              </p>
              <div className="flex flex-wrap gap-1.5">
                {specialties.map((s) => (
                  <span
                    key={s}
                    className="rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {accents.length > 0 ? (
            <div className="mt-4">
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Accents
              </p>
              <p className="text-sm text-foreground">
                {accents.slice(0, 6).join(" · ")}
              </p>
            </div>
          ) : null}

          {trustScore != null ||
          shortlistCount > 0 ||
          memberSinceYear != null ? (
            <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-muted/70 p-3 text-center">
              <div className="min-w-0">
                <p className="truncate text-base font-bold text-foreground">
                  {trustScore ?? "–"}
                </p>
                <p className="mt-0.5 text-[10px] font-medium text-muted-foreground">
                  RootScore
                </p>
              </div>
              <div className="min-w-0 border-x border-border px-1">
                <p className="truncate text-base font-bold text-foreground">
                  {shortlistCount}
                </p>
                <p className="mt-0.5 text-[10px] font-medium text-muted-foreground">
                  Shortlists
                </p>
              </div>
              <div className="min-w-0">
                <p className="truncate text-base font-bold text-foreground">
                  {memberSinceYear ?? "–"}
                </p>
                <p className="mt-0.5 text-[10px] font-medium text-muted-foreground">
                  Member since
                </p>
              </div>
            </div>
          ) : null}

          {travelBits.length > 0 ? (
            <p className="mt-4 flex items-center gap-1.5 text-sm text-foreground">
              <Plane className="h-4 w-4 shrink-0 text-primary" />
              <span className="truncate">{travelBits.join(" · ")}</span>
            </p>
          ) : null}
        </div>

        <DialogFooter className="flex-row gap-2 border-t border-border px-4 pb-4 pt-3">
          <Button
            asChild
            variant="outline"
            className="flex-1 rounded-xl border-primary py-2.5 text-sm font-semibold text-primary hover:bg-accent/50"
          >
            <Link href={`/talent/${talent.username}`}>View full profile</Link>
          </Button>
          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              onShortlist(talent);
            }}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Bookmark className="h-4 w-4" />
            Shortlist
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Talent card (mirror look, real data) ---------------- */

function TalentResultCard({
  talent,
  onShortlist,
}: {
  talent: TalentHit;
  onShortlist: (t: TalentHit) => void;
}) {
  const name = talent.full_legal_name || talent.username;
  const roles =
    talent.professions && talent.professions.length > 0
      ? talent.professions.slice(0, 3).join(" • ")
      : "Talent";
  const city = formatLocation(talent.location);
  const match =
    talent.match_score != null ? Math.round(talent.match_score) : null;
  const rootScore =
    talent.trust_score != null
      ? Math.round(talent.trust_score)
      : (match ?? null);
  const rating =
    talent.trust_score != null
      ? (talent.trust_score / 20).toFixed(1)
      : null;
  const reviews = talent.analytics?.shortlist_count;
  const tags = [
    ...(talent.specialties ?? []),
    ...(talent.professions ?? []),
    ...(talent.languages ?? []).map((l) => l.name),
  ].filter((t, i, all) => t && all.indexOf(t) === i);
  const visibleTags = tags.slice(0, 5);
  const extra = tags.length - visibleTags.length;
  const isAvailable = talent.availability === "available";
  const isBusy = talent.availability === "busy";

  const { isSaved, isPending: savePending, toggleSave } = useSaveTalent(
    talent.username,
  );
  const [previewOpen, setPreviewOpen] = useState(false);

  const openPreview = () => setPreviewOpen(true);
  const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPreview();
    }
  };

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`Preview ${name}'s profile`}
      onClick={openPreview}
      onKeyDown={handleCardKeyDown}
      className="cursor-pointer rounded-2xl bg-card p-2.5 shadow-[var(--shadow-card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className="flex gap-2.5">
        {/* LEFT COLUMN — image only */}
        <div className="relative min-h-[184px] w-[33%] shrink-0 self-stretch overflow-hidden rounded-xl bg-muted">
          {talent.profile_photo ? (
            <img
              src={talent.profile_photo}
              alt={`${name}, ${roles}`}
              loading="lazy"
              width={736}
              height={912}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center bg-secondary">
              <User className="size-10 text-muted-foreground/40" />
            </div>
          )}
          <button
            type="button"
            aria-label={`Save ${name}`}
            aria-pressed={isSaved}
            onClick={(e) => {
              e.stopPropagation();
              toggleSave();
            }}
            disabled={savePending}
            className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-card/80 backdrop-blur disabled:opacity-60"
          >
            {savePending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Heart
                className={`h-4 w-4 ${isSaved ? "fill-primary text-primary" : "text-foreground"}`}
              />
            )}
          </button>
          <span
            className={`absolute bottom-2 left-2 flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold text-white ${
              isAvailable
                ? "bg-success"
                : isBusy
                  ? "bg-warning"
                  : "bg-foreground/70"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            {talent.availability === "available"
              ? "Available"
              : talent.availability === "busy"
                ? "Busy"
                : talent.availability === "not_available"
                  ? "Not available"
                  : "Unknown"}
          </span>
          <span
            aria-hidden="true"
            className="absolute bottom-2 right-2 grid h-8 w-8 place-items-center rounded-full bg-card/80 text-foreground backdrop-blur"
          >
            <Expand className="h-4 w-4" />
          </span>
        </div>

        {/* RIGHT COLUMN — all content + CTAs */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-1.5">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h4 className="truncate text-lg font-bold leading-tight">{name}</h4>
                {talent.is_verified ? <VerifiedBadge /> : null}
              </div>
              <p className="truncate text-sm text-muted-foreground">{roles}</p>
              <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="truncate">{city}</span>
              </p>
            </div>
            {match != null ? (
              <div className="shrink-0 rounded-xl bg-accent px-2.5 py-1.5 text-center">
                <div className="text-base font-bold leading-none text-accent-foreground">
                  {match}%
                </div>
                <div className="mt-0.5 text-[11px] leading-none text-accent-foreground/80">
                  Match
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-1.5 flex items-center gap-1.5 text-sm">
            <Star className="h-4 w-4 shrink-0 fill-star text-star" />
            <span className="font-semibold">{rating ?? "New"}</span>
            {reviews != null ? (
              <span className="text-muted-foreground">({reviews})</span>
            ) : null}
            <span className="text-border">|</span>
            <span className="truncate text-muted-foreground">RootScore</span>
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 border-primary text-xs font-bold text-primary">
              {rootScore ?? "–"}
            </span>
          </div>

          {visibleTags.length > 0 ? (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {visibleTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
              {extra > 0 ? (
                <span className="rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground">
                  +{extra}
                </span>
              ) : null}
            </div>
          ) : null}

          <div className="mt-auto grid grid-cols-2 gap-1.5 pt-2">
            <Button
              asChild
              variant="outline"
              className="h-9 min-w-0 rounded-xl border-primary px-1 text-[13px] font-semibold text-primary transition-colors hover:bg-accent/50"
            >
              <Link
                href={`/talent/${talent.username}`}
                onClick={(e) => e.stopPropagation()}
                className="truncate"
              >
                View Profile
              </Link>
            </Button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onShortlist(talent);
              }}
              className="flex h-9 min-w-0 items-center justify-center gap-1 rounded-xl bg-primary px-1 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Bookmark className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Shortlist</span>
            </button>
          </div>
        </div>
      </div>
      <TalentPreviewDialog
        talent={talent}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        onShortlist={onShortlist}
      />
    </article>
  );
}

/* ---------------- Shortlist picker (real campaigns) ---------------- */

function ShortlistPicker({
  talent,
  open,
  onOpenChange,
}: {
  talent: TalentHit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const { data: campaignsData, isLoading } = useRecruiterCampaigns();

  const campaigns = useMemo(
    () =>
      (campaignsData?.pages.flatMap((p) => p.data) ?? []).filter(
        (c) => c.status === "active",
      ),
    [campaignsData],
  );

  const handleOpenChange = (next: boolean) => {
    if (next) setCampaignId(null);
    onOpenChange(next);
  };

  const confirm = async () => {
    if (!talent || !campaignId || pending) return;
    setPending(true);
    try {
      await talentApi.shortlistTalent(talent.username, campaignId);
      toast.success(`Shortlisted ${talent.full_legal_name || talent.username}`);
      queryClient.invalidateQueries({ queryKey: ["shortlists"] });
      queryClient.invalidateQueries({ queryKey: ["talent-shortlist"] });
      onOpenChange(false);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Failed to shortlist talent";
      toast.error(message);
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto border-border bg-card sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Shortlist {talent?.full_legal_name || talent?.username || "talent"}
          </DialogTitle>
          <DialogDescription>
            Pick one of your active campaigns. The talent will appear under
            Shortlisted for that campaign.
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
              to shortlist talent.
            </div>
          ) : (
            campaigns.map((c) => {
              const selected = campaignId === c._id;
              return (
                <button
                  key={c._id}
                  type="button"
                  onClick={() => setCampaignId(c._id)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                    selected
                      ? "border-primary bg-primary/10"
                      : "border-border/70 bg-surface hover:border-primary/40"
                  }`}
                >
                  <span
                    className={`grid size-10 shrink-0 place-items-center rounded-full ${
                      selected
                        ? "bg-primary text-primary-foreground"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    <Briefcase className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-foreground">
                      {c.name}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {[c.role_type, c.location?.city]
                        .filter(Boolean)
                        .join(" • ")}
                    </span>
                  </span>
                  {selected ? (
                    <Check className="size-4 shrink-0 text-primary" />
                  ) : null}
                </button>
              );
            })
          )}
        </div>
        <DialogFooter className="mt-4">
          <Button
            type="button"
            onClick={confirm}
            disabled={!campaignId || pending}
            className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Bookmark className="size-4" />
            )}
            {pending ? "Shortlisting..." : "Confirm shortlist"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- More-filters dialog (real controls) ---------------- */

function MoreFiltersDialog({
  open,
  onOpenChange,
  criteria,
  onApply,
  onClear,
  professions,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  criteria: SearchCriteria;
  onApply: (next: SearchCriteria) => void;
  onClear: () => void;
  professions: string[] | undefined;
}) {
  const [draft, setDraft] = useState<SearchCriteria>(criteria);

  const handleOpenChange = (next: boolean) => {
    if (next) setDraft(criteria);
    onOpenChange(next);
  };

  const set = (patch: Partial<SearchCriteria>) =>
    setDraft((prev) => ({ ...prev, ...patch }));
  const ageBand =
    draft.ageMin != null && draft.ageMax != null
      ? `${draft.ageMin}–${draft.ageMax}`
      : "";
  const experienceBand =
    EXPERIENCE_BANDS.find(
      (b) => b.min === draft.experienceMin && b.max === draft.experienceMax,
    )?.label ?? "";

  const selectClass =
    "h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto border-border bg-card sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>All filters</DialogTitle>
          <DialogDescription>
            Refine profession, location, demographics, skills and availability.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block text-xs font-semibold text-muted-foreground">
            Keyword
            <input
              value={draft.search}
              onChange={(e) => set({ search: e.target.value })}
              placeholder="Name, skill, profession..."
              className={`${selectClass} mt-1`}
            />
          </label>
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
          <label className="block text-xs font-semibold text-muted-foreground">
            Age
            <select
              value={ageBand}
              onChange={(e) => {
                const [ageMin, ageMax] = bandToRange(e.target.value);
                set({ ageMin, ageMax });
              }}
              className={`${selectClass} mt-1`}
            >
              <option value="">Any age</option>
              {AGE_BANDS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </label>
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
            Language
            <select
              value={draft.languages[0] ?? ""}
              onChange={(e) =>
                set({ languages: e.target.value ? [e.target.value] : [] })
              }
              className={`${selectClass} mt-1`}
            >
              <option value="">Any language</option>
              {LANGUAGE_OPTIONS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-semibold text-muted-foreground">
            Experience
            <select
              value={experienceBand}
              onChange={(e) => {
                const band = EXPERIENCE_BANDS.find(
                  (b) => b.label === e.target.value,
                );
                set({
                  experienceMin: band?.min ?? null,
                  experienceMax: band?.max ?? null,
                });
              }}
              className={`${selectClass} mt-1`}
            >
              <option value="">Any experience</option>
              {EXPERIENCE_BANDS.map((b) => (
                <option key={b.label} value={b.label}>
                  {b.label}
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
          <label className="block text-xs font-semibold text-muted-foreground sm:col-span-2">
            Skill
            <select
              value={draft.skills[0] ?? ""}
              onChange={(e) =>
                set({ skills: e.target.value ? [e.target.value] : [] })
              }
              className={`${selectClass} mt-1`}
            >
              <option value="">Any skill</option>
              {SKILL_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>
        <DialogFooter className="mt-4 flex-row justify-between gap-2 sm:justify-between">
          <Button type="button" variant="ghost" onClick={onClear}>
            Clear all
          </Button>
          <Button
            type="button"
            onClick={() => {
              onApply(draft);
              onOpenChange(false);
            }}
            className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Apply filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Main page ---------------- */

export default function RecruiterFindTalentPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("Search");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchCriteria>(emptyCriteria);
  const [sortBy, setSortBy] = useState<SortValue>("relevance");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [moreOpen, setMoreOpen] = useState(false);
  const [shortlistTarget, setShortlistTarget] = useState<TalentHit | null>(
    null,
  );
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const recordedSig = useRef("");

  const { data: professions } = useProfessions();
  const { data: saved, isLoading: savedLoading } = useSavedSearches("saved");
  const markViewed = useMarkSavedSearchViewed();
  const deleteSaved = useDeleteSavedSearch();
  const upsertSearch = useUpsertSavedSearch();
  const { data: shortlists, isLoading: shortlistsLoading } =
    useRecruiterShortlists();
  const removeFromShortlist = useRemoveFromShortlist();

  const queryParams = useMemo(
    () => ({
      ...toApiParams(filters),
      sort: sortBy,
      limit: 12,
    }),
    [filters, sortBy],
  );
  const search = useTalentSearch(queryParams);
  const talents = useMemo(
    () => (search.data?.pages.flatMap((p) => p.data) ?? []) as TalentHit[],
    [search.data],
  );
  const total = search.data?.pages[0]?.total ?? 0;
  const criteriaSig = new URLSearchParams(
    toSearchParams(filters),
  ).toString();
  const sortLabel =
    SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? "Most Relevant";

  const set = (patch: Partial<SearchCriteria>) =>
    setFilters((prev) => ({ ...prev, ...patch }));

  const clearAll = () => {
    setFilters(emptyCriteria);
    setQuery("");
    setSortBy("relevance");
    setAiError("");
  };

  // Record real search history (powers Recent; Saved tab reuses same API).
  useEffect(() => {
    if (search.isFetching || !hasAnyCriteria(filters)) return;
    if (recordedSig.current === `${criteriaSig}|${total}`) return;
    recordedSig.current = `${criteriaSig}|${total}`;
    upsertSearch.mutate({
      kind: "recent",
      title: criteriaSummary(filters),
      subtitle: filters.location || undefined,
      criteria: toSavedSearchCriteria(filters),
      result_count: total,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [criteriaSig, search.isFetching, total]);

  // Infinite scroll.
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !search.hasNextPage || search.isFetching) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) search.fetchNextPage();
      },
      { rootMargin: "480px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.hasNextPage, search.isFetching, talents.length]);

  const submitAiSearch = async () => {
    const text = query.trim();
    if (!text || aiLoading) return;
    setAiLoading(true);
    setAiError("");
    try {
      const parsed = await talentApi.extractSearchCriteria(text);
      setFilters({
        search: parsed.search || "",
        profession: parsed.profession ?? "",
        location: parsed.location ?? "",
        gender:
          parsed.gender === "Female" || parsed.gender === "Male"
            ? parsed.gender
            : "",
        availability: parsed.availability ?? "",
        languages: parsed.languages ?? [],
        skills: parsed.skills ?? [],
        ageMin: parsed.ageMin,
        ageMax: parsed.ageMax,
        experienceMin: parsed.experienceMin,
        experienceMax: parsed.experienceMax,
      });
      setTab("Search");
    } catch {
      // Fall back to plain keyword search so the button always works.
      setFilters((prev) => ({ ...prev, search: text }));
      setTab("Search");
      setAiError(
        "AI parsing failed — showing keyword matches instead. Try again or use filters.",
      );
    } finally {
      setAiLoading(false);
    }
  };

  const applySaved = (s: SavedSearch) => {
    if (s.new_results && s.new_results > 0) markViewed.mutate(s.id);
    const next = fromSavedSearchCriteria(s.criteria);
    setFilters(next);
    setQuery(next.search);
    setTab("Search");
  };

  const saveCurrentSearch = () => {
    if (!hasAnyCriteria(filters)) {
      toast.error("Add a keyword or filter before saving this search.");
      return;
    }
    upsertSearch.mutate(
      {
        kind: "saved",
        title: criteriaSummary(filters),
        subtitle: filters.location || undefined,
        criteria: toSavedSearchCriteria(filters),
        result_count: total,
      },
      {
        onSuccess: () => {
          toast.success("Search saved — find it under Saved Searches.");
          setTab("Saved Searches");
        },
        onError: () => toast.error("Could not save this search."),
      },
    );
  };

  const shortlistedEntries = useMemo(() => {
    const out: Array<{
      key: string;
      campaignId: string;
      campaignName: string;
      talent: {
        username: string;
        full_legal_name?: string;
        profile_photo?: string;
        professions?: string[];
        location?: { city?: string; state?: string };
        availability?: string;
        is_verified: boolean;
      };
    }> = [];
    for (const list of shortlists ?? []) {
      for (const t of list.talents) {
        out.push({
          key: `${list._id}:${t.username}`,
          campaignId: list.campaign?._id ?? "",
          campaignName: list.campaign?.name ?? list.name,
          talent: t,
        });
      }
    }
    return out;
  }, [shortlists]);

  const ageBand =
    filters.ageMin != null && filters.ageMax != null
      ? `${filters.ageMin}–${filters.ageMax}`
      : "";
  const experienceBand =
    EXPERIENCE_BANDS.find(
      (b) => b.min === filters.experienceMin && b.max === filters.experienceMax,
    )?.label ?? "";

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-background pb-24 text-foreground">
      <header className="px-4 pt-4">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            aria-label="Go back"
            onClick={() => router.back()}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[#07133D] transition-colors hover:bg-[#F3EEFF]"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-[22px] font-bold leading-tight tracking-tight text-[#07133D]">
              Talent Search
            </h1>
            <p className="truncate text-xs text-[#667085]">
              Find the perfect talent for your next project.
            </p>
          </div>
          <Image
            src={logoImage}
            alt="Rootin"
            height={28}
            className="h-7 w-auto shrink-0"
            priority
          />
        </div>

        <nav
          className="mt-3 grid grid-cols-3 gap-1.5"
          aria-label="Talent search tabs"
        >
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              aria-pressed={tab === t}
              className={`h-[42px] truncate rounded-full px-1 text-xs font-semibold transition-colors ${
                tab === t
                  ? "bg-gradient-to-r from-[#7C3AED] to-[#651FFF] text-white shadow-[0_6px_16px_-6px_rgba(109,40,255,0.55)]"
                  : "bg-[#F8F5FF] text-[#07133D]"
              }`}
            >
              {t}
            </button>
          ))}
        </nav>
      </header>

      {tab === "Search" ? (
        <>
          <section
            className="mx-4 mt-4 overflow-hidden rounded-[18px] border border-[#E9E2FB] p-4 shadow-[0_10px_30px_-14px_rgba(109,40,255,0.28)]"
            style={{
              background:
                "linear-gradient(135deg, #FBF9FF 0%, #F1EAFF 100%)",
            }}
          >
            <div className="relative">
              <div className="max-w-[62%]">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 shrink-0 text-[#6D28FF]" />
                  <span className="truncate text-[13px] font-semibold text-[#07133D]">
                    AI Talent Search
                  </span>
                  <span className="shrink-0 rounded-full bg-[#E9E0FF] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#6D28FF]">
                    Beta
                  </span>
                </div>
                <h2 className="mt-2.5 text-[22px] font-bold leading-[1.15] text-[#07133D]">
                  Who are you looking for?
                </h2>
                <p className="mt-1 text-xs text-[#667085]">
                  Try “Female actor, 25–30, Hindi, Mumbai”
                </p>
              </div>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-1 right-0 flex w-[34%] flex-col items-center text-center"
              >
                <span
                  className="font-script text-[17px] font-semibold leading-[1.1] text-[#6D28FF]"
                  style={{ fontFamily: "var(--font-script), cursive" }}
                >
                  Smarter
                  <br />
                  Search
                  <br />
                  Better
                  <br />
                  Matches
                </span>
                <svg
                  viewBox="0 0 96 96"
                  className="mt-1 h-[76px] w-[76px]"
                >
                  <ellipse
                    cx="48"
                    cy="89"
                    rx="24"
                    ry="5"
                    fill="#6D28FF"
                    opacity="0.14"
                  />
                  <line
                    x1="48"
                    y1="12"
                    x2="48"
                    y2="24"
                    stroke="#6D28FF"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <circle cx="48" cy="9" r="4" fill="#7C3AED" />
                  <rect
                    x="19"
                    y="38"
                    width="9"
                    height="20"
                    rx="4.5"
                    fill="#C4B5FD"
                  />
                  <rect
                    x="68"
                    y="38"
                    width="9"
                    height="20"
                    rx="4.5"
                    fill="#C4B5FD"
                  />
                  <rect
                    x="25"
                    y="23"
                    width="46"
                    height="38"
                    rx="13"
                    fill="#FFFFFF"
                    stroke="#DCD2FA"
                    strokeWidth="2"
                  />
                  <circle cx="40" cy="40" r="5.5" fill="#6D28FF" />
                  <circle cx="56" cy="40" r="5.5" fill="#6D28FF" />
                  <circle cx="42" cy="38" r="1.8" fill="#FFFFFF" />
                  <circle cx="58" cy="38" r="1.8" fill="#FFFFFF" />
                  <path
                    d="M41 50 Q48 55 55 50"
                    stroke="#6D28FF"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <rect
                    x="31"
                    y="62"
                    width="34"
                    height="22"
                    rx="9"
                    fill="#7C3AED"
                  />
                  <circle cx="48" cy="71" r="5" fill="#FFFFFF" opacity="0.9" />
                  <circle cx="48" cy="71" r="2.4" fill="#6D28FF" />
                </svg>
              </div>
            </div>

            <form
              className="mt-3 flex h-[50px] items-center gap-1.5 rounded-[13px] border border-[#ECEAF4] bg-white py-1.5 pl-3 pr-1.5 shadow-[0_2px_10px_rgba(109,40,255,0.08)]"
              onSubmit={(e) => {
                e.preventDefault();
                submitAiSearch();
              }}
            >
              <Search className="h-[18px] w-[18px] shrink-0 text-[#6D28FF]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Describe the talent you're looking for..."
                aria-label="Describe the talent you're looking for"
                className="min-w-0 flex-1 bg-transparent py-2 text-[13px] text-[#07133D] outline-none placeholder:text-[#98A2B3]"
              />
              {query ? (
                <button
                  type="button"
                  aria-label="Clear AI search"
                  onClick={() => {
                    setQuery("");
                    setFilters((prev) => ({ ...prev, search: "" }));
                  }}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#667085] hover:text-[#07133D]"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
              <button
                type="submit"
                aria-label="Search"
                disabled={aiLoading || !query.trim()}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-gradient-to-br from-[#7C3AED] to-[#651FFF] text-white shadow-[0_6px_14px_-6px_rgba(109,40,255,0.6)] transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {aiLoading ? (
                  <Loader2 className="h-[18px] w-[18px] animate-spin" />
                ) : (
                  <ArrowRight className="h-[18px] w-[18px]" />
                )}
              </button>
            </form>
            {aiLoading ? (
              <p className="mt-2 text-xs text-[#667085]">
                Understanding your brief with AI...
              </p>
            ) : null}
            {aiError ? (
              <p className="mt-2 text-xs font-medium text-destructive">
                {aiError}
              </p>
            ) : null}
            {hasAnyCriteria(filters) ? (
              <div className="mt-2 flex items-center justify-end">
                <button
                  type="button"
                  onClick={saveCurrentSearch}
                  disabled={upsertSearch.isPending}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6D28FF] hover:underline disabled:opacity-60"
                >
                  <BookmarkPlus className="size-3.5" />
                  {upsertSearch.isPending ? "Saving..." : "Save this search"}
                </button>
              </div>
            ) : null}
          </section>

          <section
            className="mt-2.5 grid grid-cols-4 gap-1.5 px-4"
            aria-label="Search filters"
          >
            <FilterTile
              label="Profession"
              icon={Drama}
              value={filters.profession}
              options={professions ?? []}
              onSelect={(v) => set({ profession: v })}
            />
            <FilterTile
              label="Location"
              icon={MapPin}
              value={filters.location}
              options={CITY_OPTIONS}
              onSelect={(v) => set({ location: v })}
            />
            <FilterTile
              label="Age"
              icon={CalendarDays}
              value={ageBand}
              options={AGE_BANDS}
              onSelect={(v) => {
                const [ageMin, ageMax] = bandToRange(v);
                set({ ageMin, ageMax });
              }}
            />
            <FilterTile
              label="Gender"
              icon={Users}
              value={filters.gender}
              options={GENDER_OPTIONS}
              onSelect={(v) => set({ gender: v })}
            />
            <FilterTile
              label="Language"
              icon={Languages}
              value={filters.languages[0] ?? ""}
              options={LANGUAGE_OPTIONS}
              onSelect={(v) => set({ languages: v ? [v] : [] })}
            />
            <FilterTile
              label="Skills"
              icon={Star}
              value={filters.skills[0] ?? ""}
              options={SKILL_OPTIONS}
              onSelect={(v) => set({ skills: v ? [v] : [] })}
            />
            <FilterTile
              label="Experience"
              icon={Briefcase}
              value={experienceBand}
              options={EXPERIENCE_BANDS.map((b) => b.label)}
              onSelect={(v) => {
                const band = EXPERIENCE_BANDS.find((b) => b.label === v);
                set({
                  experienceMin: band?.min ?? null,
                  experienceMax: band?.max ?? null,
                });
              }}
            />
            <FilterTile
              label="Availability"
              icon={Clock}
              value={availabilityLabel(filters.availability)}
              options={AVAILABILITY_OPTIONS.map((o) => o.label)}
              onSelect={(v) =>
                set({
                  availability:
                    AVAILABILITY_OPTIONS.find((o) => o.label === v)?.value ??
                    "",
                })
              }
            />
          </section>

          <div className="mb-6 mt-2.5 flex items-center justify-between px-4">
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              className="flex items-center gap-1.5 text-[13px] font-semibold text-[#6D28FF]"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              More Filters
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="text-[13px] font-semibold text-[#6D28FF]"
            >
              Clear All
            </button>
          </div>

          {filters.search ? (
            <div className="mx-5 mt-3 flex items-center gap-2 rounded-xl border border-border/60 bg-card px-3 py-2.5 text-sm">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate">
                <span className="font-semibold">{filters.search}</span>
              </span>
              <button
                type="button"
                aria-label="Clear keyword"
                onClick={() => {
                  set({ search: "" });
                  setQuery("");
                }}
                className="grid size-7 place-items-center rounded-full hover:bg-muted"
              >
                <X className="size-4 text-muted-foreground" />
              </button>
            </div>
          ) : null}

          <div className="mt-5 flex items-center justify-between px-5">
            <h3 className="text-lg font-bold">
              {search.isFetching && talents.length === 0
                ? "Searching..."
                : `${total.toLocaleString()} Talent${total === 1 ? "" : "s"} Found`}
            </h3>
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label={`Sort by ${sortLabel}`}
                className="flex items-center gap-2 rounded-xl bg-card px-3 py-2.5 text-sm font-medium shadow-[var(--shadow-card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                {sortLabel}
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="rounded-xl border-border bg-popover"
              >
                {SORT_OPTIONS.map((o) => (
                  <DropdownMenuItem
                    key={o.value}
                    onSelect={() => setSortBy(o.value)}
                  >
                    {o.label}
                    {o.value === sortBy ? (
                      <Check className="ml-auto size-4" />
                    ) : null}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <section className="mt-4 space-y-4 px-5" aria-live="polite">
            {search.isError ? (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
                <p className="font-semibold">
                  We couldn&apos;t load talent right now.
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Check your connection and try again.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => search.refetch()}
                  className="mt-4 rounded-xl"
                >
                  Try again
                </Button>
              </div>
            ) : search.isPending ? (
              <>
                {[0, 1].map((i) => (
                  <div
                    key={i}
                    className="rounded-2xl bg-card p-3 shadow-[var(--shadow-card)]"
                  >
                    <div className="flex gap-3">
                      <Skeleton className="h-44 w-28 shrink-0 rounded-xl" />
                      <div className="flex-1 space-y-2 py-1">
                        <Skeleton className="h-5 w-2/3" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-8 w-full" />
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <Skeleton className="h-10 rounded-xl" />
                      <Skeleton className="h-10 rounded-xl" />
                    </div>
                  </div>
                ))}
              </>
            ) : talents.length === 0 ? (
              <div className="rounded-2xl border border-border/60 bg-card p-6 text-center shadow-[var(--shadow-card)]">
                <p className="font-bold">No talent matches those filters</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try a different keyword or clear a filter.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearAll}
                  className="mt-4 rounded-xl"
                >
                  Clear all filters
                </Button>
              </div>
            ) : (
              talents.map((t) => (
                <TalentResultCard
                  key={t._id}
                  talent={t}
                  onShortlist={setShortlistTarget}
                />
              ))
            )}
          </section>

          <div
            ref={loadMoreRef}
            className="flex min-h-16 items-center justify-center px-5 py-5"
            aria-live="polite"
          >
            {search.isFetchingNextPage ? (
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Loading more
                talent...
              </span>
            ) : search.hasNextPage ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => search.fetchNextPage()}
                className="rounded-xl"
              >
                Load more talent
              </Button>
            ) : talents.length > 0 ? (
              <span className="text-xs text-muted-foreground">
                You&apos;ve reached the end of the results.
              </span>
            ) : null}
          </div>
        </>
      ) : null}

      {tab === "Saved Searches" ? (
        <section className="mt-4 space-y-3 px-5">
          <div className="flex items-end justify-between">
            <h3 className="text-lg font-bold">Saved Searches</h3>
            {hasAnyCriteria(filters) ? (
              <button
                type="button"
                onClick={saveCurrentSearch}
                disabled={upsertSearch.isPending}
                className="inline-flex items-center gap-1.5 text-sm font-bold text-primary disabled:opacity-60"
              >
                <BookmarkPlus className="size-4" />
                {upsertSearch.isPending ? "Saving..." : "Save current"}
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-primary">
                <Bookmark className="size-4" /> Save from search
              </span>
            )}
          </div>
          {savedLoading ? (
            <>
              <Skeleton className="h-16 rounded-2xl" />
              <Skeleton className="h-16 rounded-2xl" />
            </>
          ) : (saved?.length ?? 0) === 0 ? (
            <div className="rounded-2xl border border-border/60 bg-card p-6 text-center shadow-[var(--shadow-card)]">
              <p className="font-bold">No saved searches yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Run a search, then tap “Save this search” to get alerts on new
                talent.
              </p>
              <Button
                type="button"
                onClick={() => setTab("Search")}
                className="mt-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Start searching
              </Button>
            </div>
          ) : (
            saved!.map((s) => (
              <div
                key={s.id}
                className="flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-card p-3 text-left shadow-[var(--shadow-card)]"
              >
                <button
                  type="button"
                  onClick={() => applySaved(s)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                    <Bookmark className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold">
                      {s.title}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {[s.subtitle, s.last_run_at ? timeAgo(s.last_run_at) : ""]
                        .filter(Boolean)
                        .join(" • ")}
                    </span>
                  </span>
                  {s.new_results && s.new_results > 0 ? (
                    <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
                      New ({s.new_results})
                    </span>
                  ) : (
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => deleteSaved.mutate(s.id)}
                  aria-label={`Delete saved search ${s.title}`}
                  className="shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))
          )}
        </section>
      ) : null}

      {tab === "Shortlisted" ? (
        <section className="mt-4 space-y-4 px-5">
          <div className="flex items-end justify-between">
            <h3 className="text-lg font-bold">Shortlisted</h3>
            <Link
              href="/recruiter/shortlist"
              className="text-sm font-bold text-primary hover:underline"
            >
              Manage all
            </Link>
          </div>
          {shortlistsLoading ? (
            <>
              <Skeleton className="h-44 rounded-2xl" />
              <Skeleton className="h-44 rounded-2xl" />
            </>
          ) : shortlistedEntries.length === 0 ? (
            <div className="rounded-2xl border border-border/60 bg-card p-6 text-center shadow-[var(--shadow-card)]">
              <p className="font-bold">No shortlisted talent yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Tap Shortlist on any talent card to build your casting list.
              </p>
              <Button
                type="button"
                onClick={() => setTab("Search")}
                className="mt-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Browse talent
              </Button>
            </div>
          ) : (
            shortlistedEntries.map(({ key, campaignId, campaignName, talent }) => {
              const displayName =
                talent.full_legal_name || talent.username;
              return (
                <article
                  key={key}
                  className="rounded-2xl bg-card p-3 shadow-[var(--shadow-card)]"
                >
                  <div className="flex gap-3">
                    <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                      {talent.profile_photo ? (
                        <img
                          src={talent.profile_photo}
                          alt={displayName}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center bg-secondary">
                          <User className="size-8 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="truncate font-bold">{displayName}</h4>
                        {talent.is_verified ? <VerifiedBadge /> : null}
                      </div>
                      <p className="truncate text-sm text-muted-foreground">
                        {(talent.professions ?? []).slice(0, 2).join(" • ") ||
                          "Talent"}
                      </p>
                      <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        {formatLocation(talent.location)}
                      </p>
                      <p className="mt-1 truncate text-xs font-semibold text-primary">
                        {campaignName}
                      </p>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="rounded-xl border-primary text-xs font-semibold text-primary"
                        >
                          <Link href={`/talent/${talent.username}`}>
                            View Profile
                          </Link>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={
                            !campaignId || removeFromShortlist.isPending
                          }
                          onClick={() => {
                            if (!campaignId) {
                              toast.error(
                                "This shortlist is not linked to a campaign.",
                              );
                              return;
                            }
                            removeFromShortlist.mutate({
                              username: talent.username,
                              campaignId,
                            });
                          }}
                          className="rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>
      ) : null}

      <MoreFiltersDialog
        open={moreOpen}
        onOpenChange={setMoreOpen}
        criteria={filters}
        professions={professions}
        onApply={(next) => setFilters(next)}
        onClear={clearAll}
      />
      <ShortlistPicker
        key={shortlistTarget?.username ?? "none"}
        talent={shortlistTarget}
        open={Boolean(shortlistTarget)}
        onOpenChange={(open) => {
          if (!open) setShortlistTarget(null);
        }}
      />
    </div>
  );
}
