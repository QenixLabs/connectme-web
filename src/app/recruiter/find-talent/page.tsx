"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useInView } from "react-intersection-observer";
import {
  Search,
  ListFilter,
  MapPin,
  Check,
  Images,
  MessageSquare,
  ChevronDown,
  Lock,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { talentApi, Campaign } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import { useTalentSearch } from "@/lib/api/hooks/useTalentSearch";
import { useDistinctProfessions } from "@/lib/api/hooks/useDistinctProfessions";
import { useRequestProfileAccess } from "@/lib/api/hooks/useRequestProfileAccess";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

type AvailabilityFilter = "all" | "available" | "busy" | "not_available";
type GenderFilter = "all" | "male" | "female" | "other";

type ProfileWithAccess = Partial<{
  username?: string;
  full_legal_name?: string;
  headline?: string;
  profile_photo?: string;
  location?: { country?: string; state?: string; city?: string };
  professions?: string[];
  industries?: string[];
  availability?: string;
  privacy_mode?: string;
  access_status?: "allowed" | "pending" | "none";
  is_verified?: boolean;
  gender?: string;
}>;

function availabilityMeta(v?: string | null) {
  switch (v) {
    case "available":
      return {
        label: "Available",
        classes: "bg-success-light text-success-text border-success-muted",
      };
    case "busy":
      return {
        label: "Busy",
        classes: "bg-brand-light text-brand-hover border-brand-muted",
      };
    case "not_available":
      return {
        label: "Not available",
        classes: "bg-error-light text-error-text border-error-muted",
      };
    default:
      return {
        label: "Unknown",
        classes: "bg-muted-bg text-text-secondary border-border",
      };
  }
}

export default function FindTalentPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [availabilityFilter, setAvailabilityFilter] =
    useState<AvailabilityFilter>("all");
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("all");
  const [professionInput, setProfessionInput] = useState("");
  const [debouncedProfessionInput, setDebouncedProfessionInput] = useState("");
  const [selectedProfession, setSelectedProfession] = useState("");
  const [showProfessionDropdown, setShowProfessionDropdown] = useState(false);
  const professionDropdownRef = useRef<HTMLDivElement>(null);

  const { ref: sentinelRef, inView } = useInView({ threshold: 0 });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useTalentSearch({
    profession: selectedProfession || undefined,
    availability:
      availabilityFilter === "all" ? undefined : availabilityFilter,
    gender: genderFilter === "all" ? undefined : genderFilter,
  });

  const {
    data: professionOptions,
    isLoading: professionsLoading,
  } = useDistinctProfessions(debouncedProfessionInput);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedProfessionInput(professionInput), 300);
    return () => clearTimeout(timer);
  }, [professionInput]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        professionDropdownRef.current &&
        !professionDropdownRef.current.contains(e.target as Node)
      ) {
        setShowProfessionDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const allProfiles = useMemo(
    () => (data ? data.pages.flatMap((p) => p.data) : []),
    [data],
  );

  const filtered = useMemo(() => {
    let result = allProfiles;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          (p.username?.toLowerCase().includes(q) ?? false) ||
          (p.full_legal_name?.toLowerCase().includes(q) ?? false) ||
          (p.headline?.toLowerCase().includes(q) ?? false) ||
          (p.professions?.some((prof) =>
            prof.toLowerCase().includes(q),
          ) ?? false),
      );
    }
    return result;
  }, [allProfiles, search]);

  const availabilityCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allProfiles.length };
    for (const p of allProfiles) {
      const av = p.availability ?? "unknown";
      counts[av] = (counts[av] ?? 0) + 1;
    }
    return counts;
  }, [allProfiles]);

  const AVAIL_PILLS = [
    {
      label: "All",
      value: "all" as const,
      count: availabilityCounts.all ?? 0,
    },
    {
      label: "Available",
      value: "available" as const,
      count: availabilityCounts.available ?? 0,
    },
    {
      label: "Busy",
      value: "busy" as const,
      count: availabilityCounts.busy ?? 0,
    },
    {
      label: "Not avail.",
      value: "not_available" as const,
      count: availabilityCounts.not_available ?? 0,
    },
  ];

  const GENDER_PILLS = [
    { label: "All", value: "all" as const },
    { label: "Male", value: "male" as const },
    { label: "Female", value: "female" as const },
    { label: "Other", value: "other" as const },
  ];

  if (isLoading) {
    return (
      <div className="max-w-[1280px] mx-auto w-full px-4 py-6 pb-24 lg:pb-8">
        <Skeleton className="h-8 w-40 mb-2" />
        <Skeleton className="h-4 w-32 mb-6" />
        <div className="flex flex-col lg:flex-row gap-6">
          <Skeleton className="h-64 w-[220px] rounded-2xl shrink-0 hidden lg:block" />
          <div className="flex-1 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-56 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1280px] mx-auto w-full px-4 py-6">
        <Alert variant="destructive">
          <AlertDescription>
            {getApiErrorMessage(error, "Failed to load talent")}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto w-full px-4 py-6 pb-24 lg:pb-8 flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-[22px] leading-tight font-bold text-text-primary">
            Find Talent
          </h1>
          <p className="text-[13px] text-text-muted mt-0.5">
            {filtered.length} of {allProfiles.length} talent shown
          </p>
        </div>
        <div className="relative w-full sm:w-[280px] lg:w-[320px]">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none z-10"
            strokeWidth={1.5}
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="search"
            placeholder="Search by name, profession..."
            aria-label="Search talent"
            className="h-10 rounded-[10px] bg-card border-[1.5px] border-border pl-9 text-sm"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-0.5 lg:hidden [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {AVAIL_PILLS.map((p) => (
          <Chip
            key={`avail-${p.value}`}
            label={p.label}
            count={p.count}
            active={availabilityFilter === p.value}
            onClick={() => setAvailabilityFilter(p.value)}
          />
        ))}
        {GENDER_PILLS.map((p) => (
          <Chip
            key={`gender-${p.value}`}
            label={p.label}
            active={genderFilter === p.value}
            onClick={() => setGenderFilter(p.value)}
          />
        ))}
      </div>

      <div className="flex gap-6 items-start">
        <aside className="hidden lg:block w-[220px] shrink-0 bg-card border border-border rounded-2xl p-[18px] sticky top-[72px]">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted mb-3.5">
            <ListFilter className="w-3.5 h-3.5" strokeWidth={1.5} />
            Filters
          </div>

          <div className="mb-[22px]">
            <div className="text-xs font-semibold text-text-secondary mb-2.5">
              Availability
            </div>
            <div className="flex flex-col gap-1">
              {AVAIL_PILLS.map((p) => (
                <FilterPill
                  key={p.value}
                  label={p.label}
                  count={p.count}
                  active={availabilityFilter === p.value}
                  onClick={() => setAvailabilityFilter(p.value)}
                />
              ))}
            </div>
          </div>

          <div className="mb-[22px]">
            <div className="text-xs font-semibold text-text-secondary mb-2.5">
              Gender
            </div>
            <div className="flex flex-col gap-1">
              {GENDER_PILLS.map((p) => (
                <FilterPill
                  key={p.value}
                  label={p.label}
                  active={genderFilter === p.value}
                  onClick={() => setGenderFilter(p.value)}
                />
              ))}
            </div>
          </div>

          <div className="mb-[22px]">
            <div className="text-xs font-semibold text-text-secondary mb-2.5">
              Profession
            </div>
            <div className="relative">
              <Input
                value={professionInput}
                onChange={(e) => {
                  setProfessionInput(e.target.value);
                  setSelectedProfession("");
                  setShowProfessionDropdown(true);
                }}
                onFocus={() => setShowProfessionDropdown(true)}
                placeholder="Search..."
                className="h-9 rounded-lg text-xs"
              />
              {(showProfessionDropdown && (professionOptions?.length ?? 0) > 0) && (
                <div ref={professionDropdownRef} className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-20 max-h-40 overflow-y-auto">
                  {professionsLoading && (
                    <div className="p-2 text-xs text-text-muted">
                      Loading...
                    </div>
                  )}
                  {professionOptions?.map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setSelectedProfession(p);
                        setProfessionInput(p);
                        setShowProfessionDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-muted-bg transition-colors"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
              {selectedProfession && (
                <button
                  onClick={() => {
                    setSelectedProfession("");
                    setProfessionInput("");
                  }}
                  className="mt-1 w-full text-[11px] text-brand hover:text-brand-hover transition-colors"
                >
                  Clear profession
                </button>
              )}
            </div>
          </div>

          {(search || availabilityFilter !== "all" || genderFilter !== "all" || selectedProfession) && (
            <button
              onClick={() => {
                setSearch("");
                setAvailabilityFilter("all");
                setGenderFilter("all");
                setSelectedProfession("");
                setProfessionInput("");
              }}
              className="mt-2 w-full text-[12px] font-medium text-brand hover:text-brand-hover transition-colors"
            >
              Clear filters
            </button>
          )}
        </aside>

        <div className="flex-1 min-w-0 flex flex-col gap-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border rounded-2xl">
              <p className="text-sm text-text-muted">
                No talent matches your filters.
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setAvailabilityFilter("all");
                  setGenderFilter("all");
                  setSelectedProfession("");
                  setProfessionInput("");
                }}
                className="mt-3 inline-flex items-center text-xs font-medium text-brand hover:text-brand-hover transition-colors"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              {filtered.map((profile) => {
                const username = profile.username ?? "";
                return (
                  <TalentRow
                    key={username}
                    profile={profile}
                    onViewProfile={() => router.push(`/talent/${username}`)}
                    onViewPortfolio={() =>
                      router.push(`/talent/${username}/portfolio`)
                    }
                    onContact={() =>
                      router.push(`/recruiter/messages?talent=${username}`)
                    }
                  />
                );
              })}
              {hasNextPage && (
                <div ref={sentinelRef} className="py-4 flex justify-center">
                  {isFetchingNextPage ? (
                    <div className="flex gap-2">
                      <Skeleton className="h-56 w-full rounded-2xl" />
                      <Skeleton className="h-56 w-full rounded-2xl hidden sm:block" />
                    </div>
                  ) : null}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Chip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 px-3.5 py-1.5 rounded-full border-[1.5px] text-[13px] font-medium whitespace-nowrap min-h-9 transition-colors",
        active
          ? "bg-brand text-white border-brand"
          : "bg-card text-text-secondary border-border hover:border-brand hover:text-brand",
      )}
    >
      {label}
      {typeof count === "number" && (
        <span
          className={cn(
            "ml-1 text-xs",
            active ? "opacity-80" : "opacity-70",
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function FilterPill({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-[13px] transition-colors",
        active
          ? "bg-brand-light text-brand font-semibold"
          : "text-text-secondary hover:bg-muted-bg",
      )}
    >
      <span>{label}</span>
      {typeof count === "number" && (
        <span
          className={cn(
            "text-[11px] font-medium font-mono rounded-full px-[7px] py-px",
            active ? "bg-brand/15 text-brand" : "bg-muted-bg text-text-muted",
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function TalentRow({
  profile,
  onViewProfile,
  onViewPortfolio,
  onContact,
}: {
  profile: ProfileWithAccess;
  onViewProfile: () => void;
  onViewPortfolio: () => void;
  onContact: () => void;
}) {
  const requestAccess = useRequestProfileAccess();
  const loc = [profile.location?.city, profile.location?.state, profile.location?.country]
    .filter((s): s is string => !!s && s.trim() !== "")
    .join(", ");
  const avail = availabilityMeta(profile.availability);
  const displayName = profile.full_legal_name || profile.username || "Talent";
  const isPrivateLocked =
    profile.privacy_mode === 'private' && profile.access_status !== 'allowed';
  const isPending = profile.access_status === 'pending';

  return (
    <article className="bg-card border border-border rounded-2xl p-[18px] shadow-[0_1px_3px_rgba(0,0,0,0.07),0_4px_12px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(79,110,247,0.12),0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="flex gap-3.5 items-start">
        <Avatar
          name={displayName}
          src={profile.profile_photo}
          className="w-[60px] h-[60px] sm:w-[72px] sm:h-[72px] text-xl shrink-0 border-2 border-border"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-base font-bold text-text-primary leading-tight break-words">
              {displayName}
            </span>
            {profile.is_verified && (
              <span className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full bg-amber-500 shrink-0">
                <Check className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />
              </span>
            )}
            {profile.privacy_mode === 'private' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-semibold">
                <Lock className="w-3 h-3" strokeWidth={1.5} />
                Private
              </span>
            )}
          </div>
          {profile.username && (
            <div className="text-xs text-text-tertiary mt-px font-mono break-all">
              @{profile.username}
            </div>
          )}
          {profile.headline && (
            <p className="text-[13px] text-text-secondary mt-1 line-clamp-2 leading-[1.45]">
              {profile.headline}
            </p>
          )}
          {loc && (
            <div className="flex items-center gap-1 mt-1 text-xs text-text-muted min-w-0">
              <MapPin className="w-3 h-3 shrink-0" strokeWidth={1.5} />
              <span className="truncate">{loc}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5 items-center">
        <span
          className={cn(
            "px-2.5 py-0.5 rounded-full text-[11px] font-semibold border",
            avail.classes,
          )}
        >
          {avail.label}
        </span>
        {profile.professions?.map((p) => (
          <span
            key={p}
            className="px-2.5 py-0.5 rounded-full bg-muted-bg text-text-secondary border border-border text-xs font-medium"
          >
            {p}
          </span>
        ))}
      </div>

      {isPrivateLocked ? (
        <div className="mt-3.5 flex items-center gap-2">
          {isPending ? (
            <button
              disabled
              className="flex-1 min-h-11 rounded-[10px] border-[1.5px] border-border bg-muted-bg text-text-muted text-[13px] font-medium flex items-center justify-center gap-1.5 cursor-not-allowed"
            >
              <Clock className="w-[15px] h-[15px]" strokeWidth={1.5} />
              Request Pending
            </button>
          ) : (
            <button
              onClick={() =>
                profile.username && requestAccess.mutate(profile.username)
              }
              disabled={requestAccess.isPending || !profile.username}
              className="flex-1 min-h-11 rounded-[10px] border-[1.5px] border-amber-500 bg-amber-50 text-amber-700 text-[13px] font-medium flex items-center justify-center gap-1.5 transition-colors hover:bg-amber-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Lock className="w-[15px] h-[15px]" strokeWidth={1.5} />
              Request Access
            </button>
          )}
          <button
            onClick={onViewProfile}
            className="min-h-11 px-4 rounded-[10px] border-[1.5px] border-border bg-card text-text-secondary text-[13px] font-medium flex items-center gap-1.5 transition-colors hover:border-brand hover:text-brand hover:bg-brand-light whitespace-nowrap"
          >
            View Profile
          </button>
        </div>
      ) : (
        <>
          <div className="mt-3.5 flex items-center gap-2">
            <button
              onClick={onViewPortfolio}
              className="flex-1 min-h-11 rounded-[10px] border-[1.5px] border-border bg-card text-text-secondary text-[13px] font-medium flex items-center justify-center gap-1.5 transition-colors hover:border-brand hover:text-brand hover:bg-brand-light"
            >
              <Images className="w-[15px] h-[15px]" strokeWidth={1.5} />
              Portfolio
            </button>
            <button
              onClick={onContact}
              className="min-h-11 px-4 rounded-[10px] bg-brand text-white text-[13px] font-semibold flex items-center gap-1.5 transition-colors hover:bg-brand-hover whitespace-nowrap"
            >
              <MessageSquare className="w-3.5 h-3.5" strokeWidth={1.5} />
              Contact
            </button>
          </div>
          <button
            onClick={onViewProfile}
            className="mt-2.5 w-full min-h-9 flex items-center justify-center gap-1 text-xs font-medium text-text-muted rounded-lg py-1 transition-colors hover:text-text-secondary hover:bg-muted-bg"
          >
            View full profile
            <ChevronDown className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        </>
      )}
    </article>
  );
}