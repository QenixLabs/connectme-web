"use client";

import { useState, type KeyboardEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BadgeCheck,
  Bookmark,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  Languages,
  Loader2,
  MapPin,
  Star,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSaveTalent } from "@/hooks/use-talent-actions";
import type { TalentProfile } from "@/lib/api/talent";

function formatLocation(loc?: TalentProfile["location"]): string {
  if (!loc) return "Location not set";
  const parts = [loc.city, loc.state].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "Location not set";
}

function availabilityStyles(status?: string) {
  switch (status) {
    case "available":
      return {
        badge: "bg-accent-green text-white",
        dot: "bg-current",
      };
    case "busy":
      return {
        badge: "bg-accent-amber text-white",
        dot: "bg-current",
      };
    case "not_available":
      return {
        badge: "bg-foreground/75 text-background",
        dot: "bg-current",
      };
    default:
      return {
        badge: "bg-foreground/75 text-background",
        dot: "bg-current",
      };
  }
}

function availabilityLabel(status?: string) {
  switch (status) {
    case "available":
      return "Available";
    case "busy":
      return "Busy";
    case "not_available":
      return "Not available";
    default:
      return "Unknown";
  }
}

interface TalentCardProps {
  talent: TalentProfile & { match_score?: number; matched_campaign?: string };
}

export function TalentCard({ talent }: TalentCardProps) {
  const [summaryOpen, setSummaryOpen] = useState(false);
  const name = talent.full_legal_name || talent.username;
  const roles = talent.professions?.slice(0, 3) ?? [];
  const allTags = [...(talent.specialties ?? []), ...(talent.professions ?? [])].filter(
    (tag, index, all) => all.indexOf(tag) === index,
  );
  const styles = availabilityStyles(talent.availability);
  const matchScore = talent.match_score;
  const { isSaved, isPending: savePending, toggleSave } = useSaveTalent(talent.username);

  const openSummary = () => setSummaryOpen(true);
  const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openSummary();
    }
  };

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`Preview ${name}'s talent profile`}
      onClick={openSummary}
      onKeyDown={handleCardKeyDown}
      className="group/card cursor-pointer overflow-hidden rounded-2xl bg-card shadow-[var(--shadow-card)] transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
          {talent.profile_photo ? (
            <Image
              src={talent.profile_photo}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, 144px"
              className="object-cover transition-transform duration-500 group-hover/card:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-secondary">
              <User className="size-12 text-muted-foreground/40" />
            </div>
          )}

        {matchScore != null && (
          <span className="absolute left-2 top-2 rounded-xl bg-primary px-2.5 py-1.5 text-primary-foreground">
            <span className="block text-sm font-bold leading-none">{Math.round(matchScore)}%</span>
            <span className="block text-[10px] font-medium leading-tight opacity-90">AI match</span>
          </span>
        )}
        <span className={`absolute right-2 top-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles.badge}`}>
          <span className={`size-1.5 rounded-full ${styles.dot}`} />
          {availabilityLabel(talent.availability)}
        </span>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/95 via-foreground/65 to-transparent p-3 pt-12 text-background">
          <h2 className="flex items-center gap-1.5 truncate text-base font-bold leading-tight">
            <span className="truncate">{name}</span>
            {talent.is_verified && <BadgeCheck className="size-4 shrink-0 text-primary" />}
          </h2>
          <p className="mt-0.5 truncate text-xs opacity-90">
            {roles.length > 0 ? roles.join(" | ") : "Talent"}
          </p>
          <p className="mt-1 flex items-center gap-1 truncate text-xs opacity-85">
            <MapPin className="size-3.5 shrink-0" />
            {formatLocation(talent.location)}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
            {talent.years_of_experience != null && (
              <span>{talent.years_of_experience}+ yrs experience</span>
            )}
            {matchScore != null && (
              <span className="flex items-center gap-1 rounded-full bg-background/20 px-2 py-0.5">
                <Star className="size-3 fill-warning text-warning" />
                Match {Math.round(matchScore)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="px-3 pt-3">
        {allTags.length > 0 && (
          <div className="max-h-7 overflow-hidden transition-[max-height] duration-300 group-hover/card:max-h-[999px]">
            <div className="flex flex-wrap gap-1.5">
              {allTags.map((tag) => (
                <span key={tag} className="whitespace-nowrap rounded-lg bg-muted px-2.5 py-1.5 text-[11px] font-medium text-secondary-foreground">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="my-3">
          <div className="flex gap-2">
            <Button asChild className="flex-[2] rounded-xl bg-primary text-xs font-bold text-primary-foreground hover:bg-primary/90">
              <Link href={`/talent/${talent.username}`} onClick={(event) => event.stopPropagation()}>
                View Profile
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              aria-label={`${isSaved ? "Remove" : "Save"} ${name}`}
              onClick={(event) => {
                event.stopPropagation();
                toggleSave();
              }}
              disabled={savePending}
              className="flex-1 gap-1 rounded-xl border-primary/40 px-2 text-primary hover:bg-primary/10 hover:text-primary disabled:opacity-70"
            >
              {savePending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Bookmark className={`size-4 ${isSaved ? "fill-current" : ""}`} />
              )}
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={summaryOpen} onOpenChange={setSummaryOpen}>
        <DialogContent className="max-h-[90vh] max-w-[calc(100%-2.5rem)] overflow-y-auto border-border bg-card p-0 sm:max-w-2xl">
          <div className="grid sm:grid-cols-[180px_1fr]">
            <div className="relative aspect-[4/3] overflow-hidden bg-muted sm:aspect-auto sm:min-h-[220px]">
              {talent.profile_photo ? (
                <Image
                  src={talent.profile_photo}
                  alt={name}
                  fill
                  sizes="(max-width: 640px) 100vw, 180px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-secondary">
                  <User className="size-14 text-muted-foreground/40" />
                </div>
              )}
            </div>

            <div className="p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4 pr-6">
                <div>
                  <DialogTitle className="flex items-center gap-1.5 text-xl">
                    {name}
                    {talent.is_verified && <BadgeCheck className="size-5 text-primary" />}
                  </DialogTitle>
                  <DialogDescription className="mt-1">
                    {roles.length > 0 ? roles.join(" | ") : "Creative professional"}
                  </DialogDescription>
                </div>
                {matchScore != null && (
                  <span className="shrink-0 rounded-xl bg-primary px-2.5 py-1.5 text-center text-primary-foreground">
                    <span className="block text-sm font-bold leading-none">{Math.round(matchScore)}%</span>
                    <span className="block text-[10px] font-medium opacity-90">AI match</span>
                  </span>
                )}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                <div className="rounded-xl bg-muted/70 p-3">
                  <MapPin className="mb-1 size-4 text-primary" />
                  <p className="font-medium text-foreground">Location</p>
                  <p className="mt-0.5 truncate text-muted-foreground">{formatLocation(talent.location)}</p>
                </div>
                <div className="rounded-xl bg-muted/70 p-3">
                  <CalendarDays className="mb-1 size-4 text-primary" />
                  <p className="font-medium text-foreground">Experience</p>
                  <p className="mt-0.5 text-muted-foreground">
                    {talent.years_of_experience != null ? `${talent.years_of_experience}+ years` : "Not listed"}
                  </p>
                </div>
                <div className="rounded-xl bg-muted/70 p-3">
                  <BriefcaseBusiness className="mb-1 size-4 text-primary" />
                  <p className="font-medium text-foreground">Availability</p>
                  <p className="mt-0.5 text-muted-foreground">{availabilityLabel(talent.availability)}</p>
                </div>
                <div className="rounded-xl bg-muted/70 p-3">
                  <Check className="mb-1 size-4 text-primary" />
                  <p className="font-medium text-foreground">Status</p>
                  <p className="mt-0.5 text-muted-foreground">{talent.is_verified ? "Verified" : "Unverified"}</p>
                </div>
              </div>

              {(talent.headline || talent.about) && (
                <div className="mt-5">
                  {talent.headline && <p className="font-semibold text-foreground">{talent.headline}</p>}
                  {talent.about && <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{talent.about}</p>}
                </div>
              )}

              {allTags.length > 0 && (
                <div className="mt-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Specialties</p>
                  <div className="flex flex-wrap gap-1.5">
                    {allTags.slice(0, 8).map((tag) => (
                      <span key={tag} className="rounded-lg bg-muted px-2.5 py-1.5 text-xs font-medium text-secondary-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {talent.skills && talent.skills.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Top skills</p>
                    <p className="text-sm text-foreground">{talent.skills.slice(0, 4).map((skill) => skill.name).join(" · ")}</p>
                  </div>
                )}
                {talent.languages && talent.languages.length > 0 && (
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      <Languages className="size-3.5" /> Languages
                    </p>
                    <p className="text-sm text-foreground">{talent.languages.slice(0, 4).map((language) => language.name).join(" · ")}</p>
                  </div>
                )}
              </div>

              <DialogFooter className="mt-6 border-t border-border pt-4 sm:justify-start">
                <Button asChild className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link href={`/talent/${talent.username}`}>View full profile</Link>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={toggleSave}
                  disabled={savePending}
                  className="gap-2 rounded-xl border-primary/40 text-primary hover:bg-primary/10 hover:text-primary"
                >
                  {savePending ? <Loader2 className="size-4 animate-spin" /> : <Bookmark className={`size-4 ${isSaved ? "fill-current" : ""}`} />}
                  {isSaved ? "Saved" : "Save talent"}
                </Button>
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </article>
  );
}
