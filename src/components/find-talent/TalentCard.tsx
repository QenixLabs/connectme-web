import Link from "next/link";
import Image from "next/image";
import {
  BadgeCheck,
  Bookmark,
  Briefcase,
  MapPin,
  MessageSquare,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { TalentProfile } from "@/lib/api/talent";

function formatExperience(years?: number): string {
  if (!years || years === 0) return "New talent";
  return `${years}+ yrs experience`;
}

function formatLocation(loc?: TalentProfile["location"]): string {
  if (!loc) return "Location not set";
  const parts = [loc.city, loc.state].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "Location not set";
}

function availabilityStyles(status?: string) {
  switch (status) {
    case "available":
      return {
        badge: "border-accent-green/30 bg-accent-green-bg text-accent-green",
        dot: "bg-accent-green",
      };
    case "busy":
      return {
        badge: "border-accent-amber/30 bg-accent-amber-bg text-accent-amber",
        dot: "bg-accent-amber",
      };
    case "not_available":
      return {
        badge: "border-border bg-muted text-muted-foreground",
        dot: "bg-muted-foreground",
      };
    default:
      return {
        badge: "border-border bg-muted text-muted-foreground",
        dot: "bg-muted-foreground",
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
  talent: TalentProfile;
}

export function TalentCard({ talent }: TalentCardProps) {
  const name = talent.full_legal_name || talent.username;
  const primaryRole = talent.professions?.[0] ?? "Talent";
  const tags = talent.professions?.slice(0, 4) ?? [];
  const extraTags = Math.max(0, (talent.professions?.length ?? 0) - 4);
  const styles = availabilityStyles(talent.availability);
  const trustScore = talent.trust_score ?? 0;

  return (
    <article className="card-surface group/card relative overflow-hidden rounded-2xl transition-all duration-300 hover:border-border-hover hover:shadow-card-hover">
      {/* Top highlight sheen */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-0 transition-opacity duration-300 group-hover/card:opacity-100" />

      <div className="flex flex-col gap-5 p-5 md:flex-row md:items-center md:gap-6">
        {/* Photo */}
        <div className="relative mx-auto h-64 w-full shrink-0 overflow-hidden rounded-xl border border-border bg-muted md:mx-0 md:h-44 md:w-36">
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
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <User className="size-10 text-muted-foreground/40" />
            </div>
          )}

          {/* Availability pill */}
          <div className="absolute bottom-3 left-3">
            <Badge
              variant="outline"
              className={`gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${styles.badge}`}
            >
              <span className={`size-1.5 rounded-full ${styles.dot} ${talent.availability === "available" ? "shadow-[0_0_6px_currentColor]" : ""}`} />
              {availabilityLabel(talent.availability)}
            </Badge>
          </div>
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-2">
            <h2 className="truncate text-lg font-semibold tracking-tight text-foreground">
              {name}
            </h2>
            {talent.is_verified && (
              <Badge
                variant="outline"
                className="w-fit gap-1 rounded-full border-accent-amber/30 bg-accent-amber-bg px-2 py-0.5 text-[10px] font-semibold text-accent-amber"
              >
                <BadgeCheck className="size-3" />
                Verified
              </Badge>
            )}
          </div>

          <p className="mt-0.5 text-sm font-medium text-primary">{primaryRole}</p>

          {talent.headline && (
            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {talent.headline}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5 text-muted-foreground/70" />
              {formatLocation(talent.location)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Briefcase className="size-3.5 text-muted-foreground/70" />
              {formatExperience(talent.years_of_experience)}
            </span>
            {trustScore > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-flex h-4 items-center rounded-full bg-primary/10 px-1.5 text-[10px] font-semibold text-primary">
                  {trustScore}
                </span>
                trust score
              </span>
            )}
          </div>

          {tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-border bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors group-hover/card:border-border-hover group-hover/card:text-foreground"
                >
                  {tag}
                </span>
              ))}
              {extraTags > 0 && (
                <span className="rounded-md border border-border bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                  +{extraTags}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 flex-row gap-2 md:w-44 md:flex-col">
          <Button
            asChild
            className="flex-1 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-button transition-all hover:bg-primary/90 hover:shadow-button-hover active:scale-[0.98] md:w-full"
          >
            <Link href={`/talent/${talent.username}`}>View Profile</Link>
          </Button>
          <div className="flex flex-1 gap-2 md:w-full md:flex-row">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-full rounded-xl border-border bg-surface/60 text-muted-foreground hover:border-border-hover hover:bg-surface hover:text-foreground active:scale-[0.98]"
              aria-label="Shortlist talent"
            >
              <Bookmark className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-full rounded-xl border-border bg-surface/60 text-muted-foreground hover:border-border-hover hover:bg-surface hover:text-foreground active:scale-[0.98]"
              aria-label="Message talent"
            >
              <MessageSquare className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
