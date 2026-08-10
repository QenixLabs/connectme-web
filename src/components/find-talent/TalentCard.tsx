import Link from "next/link";
import {
  BadgeCheck,
  Briefcase,
  CalendarDays,
  MapPin,
  MoreVertical,
  Send,
  Star,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TalentProfile } from "@/lib/api/talent";

function formatExperience(years?: number): string {
  if (!years || years === 0) return "N/A";
  return `${years}+ Years`;
}

function formatLocation(loc?: TalentProfile["location"]): string {
  if (!loc) return "Not specified";
  const parts = [loc.city, loc.state].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "Not specified";
}

function availabilityColor(status?: string) {
  switch (status) {
    case "available":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "busy":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case "not_available":
      return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    default:
      return "bg-slate-500/10 text-slate-400 border-slate-500/20";
  }
}

function availabilityLabel(status?: string) {
  switch (status) {
    case "available":
      return "Available";
    case "busy":
      return "Busy";
    case "not_available":
      return "Not Available";
    default:
      return "Unknown";
  }
}

interface TalentCardProps {
  talent: TalentProfile;
}

export function TalentCard({ talent }: TalentCardProps) {
  const name = talent.full_legal_name || talent.username;
  const role = talent.professions?.[0] || "Talent";
  const tags = talent.professions?.slice(0, 3) ?? [];
  const extraTags = Math.max(0, (talent.professions?.length ?? 0) - 3);

  return (
    <article className="rounded-xl border border-slate-800 bg-[#0a1420] p-4 transition-colors hover:border-slate-700">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Photo */}
        <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-lg border border-slate-800 bg-slate-800 sm:h-40 sm:w-36">
          {talent.profile_photo ? (
            <img
              src={talent.profile_photo}
              alt={name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-600">
              <User size={32} />
            </div>
          )}
          <span
            className={`absolute bottom-2 left-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${availabilityColor(talent.availability)}`}
          >
            <span className="size-1.5 rounded-full bg-current" />
            {availabilityLabel(talent.availability)}
          </span>
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-lg font-semibold text-white">
              {name}
            </h2>
            {talent.is_verified && (
              <BadgeCheck className="size-5 shrink-0 text-teal-400" />
            )}
          </div>
          <p className="mt-0.5 text-sm text-slate-400">{role}</p>
          <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="size-3.5" />
            {formatLocation(talent.location)}
          </p>

          {tags.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-slate-700 bg-slate-800/50 px-2 py-0.5 text-[11px] text-slate-400"
                >
                  {tag}
                </span>
              ))}
              {extraTags > 0 && (
                <span className="rounded-md border border-slate-700 bg-slate-800/50 px-2 py-0.5 text-[11px] text-slate-400">
                  +{extraTags}
                </span>
              )}
            </div>
          )}

          <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Briefcase className="size-3.5" />
              {formatExperience(talent.years_of_experience)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex w-full shrink-0 flex-col gap-2 sm:w-40">
          <div className="flex justify-end">
            <button className="text-slate-500 transition-colors hover:text-slate-300">
              <MoreVertical className="size-4" />
            </button>
          </div>
          <Link
            href={`/talent/${talent.username}`}
            className="rounded-lg border border-teal-700/60 px-4 py-2 text-center text-sm font-medium text-teal-400 transition-colors hover:bg-teal-950/40"
          >
            View Profile
          </Link>
          <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800/50">
            <Star className="size-4" />
            Shortlist
          </button>
          <button className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-4 py-2 text-slate-400 transition-colors hover:bg-slate-800/50">
            <Send className="size-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
