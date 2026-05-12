"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { talentApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import type { TalentProfile } from "@/lib/validations/talent-profile.schema";
import { TalentCard } from "@/components/talent-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function FindTalentPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Array<Partial<TalentProfile> & { privacy_mode?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestSentMap, setRequestSentMap] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState<string | "all">("all");

  useEffect(() => {
    talentApi
      .getAllTalent()
      .then((data) => {
        setProfiles(data as Array<Partial<TalentProfile> & { privacy_mode?: string }>);
      })
      .catch((err) => setError(getApiErrorMessage(err, "Failed to load talent")))
      .finally(() => setLoading(false));
  }, []);

  const handleRequestAccess = async (username: string) => {
    try {
      await talentApi.requestAccess(username);
      setRequestSentMap((prev) => ({ ...prev, [username]: true }));
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to send request"));
    }
  };

  const filtered = useMemo(() => {
    let result = profiles;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((p) =>
        (p.username?.toLowerCase().includes(q) ?? false) ||
        (p.full_legal_name?.toLowerCase().includes(q) ?? false) ||
        (p.headline?.toLowerCase().includes(q) ?? false) ||
        (p.professions?.some((prof) => prof.toLowerCase().includes(q)) ?? false)
      );
    }
    if (availabilityFilter !== "all") {
      result = result.filter((p) => p.availability === availabilityFilter);
    }
    return result;
  }, [profiles, search, availabilityFilter]);

  const availabilityCounts = useMemo(() => {
    const counts: Record<string, number> = { all: profiles.length };
    for (const p of profiles) {
      const av = p.availability ?? "unknown";
      counts[av] = (counts[av] ?? 0) + 1;
    }
    return counts;
  }, [profiles]);

  const FilterPill = ({
    label,
    value,
    count,
  }: {
    label: string;
    value: string;
    count: number;
  }) => (
    <button
      onClick={() => setAvailabilityFilter(value)}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
        availabilityFilter === value
          ? "bg-brand text-white border-brand"
          : "bg-card text-text-secondary border-border hover:bg-muted-bg"
      }`}
    >
      {label}
      <span className="ml-1 opacity-60">{count}</span>
    </button>
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="max-w-xl mx-auto space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 lg:px-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 lg:px-8 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Find Talent</h1>
          <p className="text-sm text-text-muted mt-1">
            {filtered.length} of {profiles.length} talent shown
          </p>
        </div>
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" strokeWidth={1.5} />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, profession..."
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar filters */}
        <aside className="lg:w-56 shrink-0 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <SlidersHorizontal className="w-4 h-4 text-text-muted" strokeWidth={1.5} />
              <p className="text-sm font-semibold text-text-primary">Filters</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <FilterPill label="All" value="all" count={availabilityCounts.all ?? 0} />
              <FilterPill label="Available" value="available" count={availabilityCounts.available ?? 0} />
              <FilterPill label="Busy" value="busy" count={availabilityCounts.busy ?? 0} />
              <FilterPill label="Not avail." value="not_available" count={availabilityCounts.not_available ?? 0} />
            </div>
          </div>

          {search && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                setSearch("");
                setAvailabilityFilter("all");
              }}
            >
              Clear filters
            </Button>
          )}
        </aside>

        {/* Grid */}
        <div className="flex-1 min-w-0">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm text-text-muted">No talent matches your filters.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => {
                  setSearch("");
                  setAvailabilityFilter("all");
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="max-w-xl mx-auto space-y-4">
              {filtered.map((profile) => {
                const username = profile.username ?? "";
                const isPrivate = profile.privacy_mode === "private";

                return (
                  <TalentCard
                    key={username}
                    profile={profile as TalentProfile}
                    privacyMode={profile.privacy_mode}
                    onViewProfile={
                      !isPrivate
                        ? () => router.push(`/talent/${username}`)
                        : undefined
                    }
                    onRequestAccess={
                      isPrivate
                        ? () => handleRequestAccess(username)
                        : undefined
                    }
                    requestSent={requestSentMap[username]}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
