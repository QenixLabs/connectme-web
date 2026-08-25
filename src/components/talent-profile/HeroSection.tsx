"use client";

/* eslint-disable @next/next/no-img-element */

import { toast } from "sonner";
import { motion } from "motion/react";
import { Share2, MoreHorizontal, Heart, Flag, Ban, MapPin, BadgeCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useLikeTalent } from "@/hooks/use-talent-profile";
import type { TalentProfile, TalentProfilePreview } from "@/lib/api/talent";
import type { Campaign } from "@/lib/api/campaigns";
import { AvailabilityBadge } from "./primitives";
import { formatLocation } from "./data";
import { TalentProfileActions } from "./TalentProfileActions";

export interface HeroSectionProps {
  profile: TalentProfile | TalentProfilePreview;
  viewerRole: "talent" | "recruiter" | "admin" | null;
  campaigns?: Campaign[];
  campaignsLoading?: boolean;
  showActions?: boolean;
}

export function HeroSection({
  profile,
  viewerRole,
  campaigns,
  campaignsLoading,
  showActions = true,
}: HeroSectionProps) {
  const displayName = profile.full_legal_name?.trim() || profile.username?.trim() || "Talent";
  const roles = profile.professions || [];
  const location = formatLocation(profile.location);
  const heroImage =
    profile.profile_photo || profile.hero_background || "/heroimage.jfif";

  const { isLiked, isPending, toggleLike } = useLikeTalent(profile.username);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <section className="relative w-full">
      {/* Compact hero image with a subtle fade into the page background. */}
      <div className="relative h-[44vh] max-h-[480px] min-h-[300px] w-full md:h-[50vh]">
        <img
          src={heroImage}
          alt={displayName}
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
        <div
          className="absolute inset-0"
          style={{ background: "var(--profile-hero-overlay)" }}
        />

        {/* Floating controls over the image */}
        <div className="absolute right-0 top-0 z-20 flex items-center gap-2 p-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:p-4 sm:pt-[max(1rem,env(safe-area-inset-top))]">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="grid size-10 place-items-center rounded-full glass-strong text-white transition-transform hover:scale-105 active:scale-95"
                aria-label="More actions"
              >
                <MoreHorizontal className="size-[18px]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onSelect={toggleLike}
                disabled={isPending}
                className="cursor-pointer"
              >
                <Heart
                  className={cn("mr-2 size-4", isLiked && "fill-destructive text-destructive")}
                />
                {isLiked ? "Liked" : "Like"}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleShare} className="cursor-pointer">
                <Share2 className="mr-2 size-4" />
                Copy link
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Flag className="mr-2 size-4" />
                Report profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
                <Ban className="mr-2 size-4" />
                Block
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            onClick={handleShare}
            className="grid size-10 place-items-center rounded-full glass-strong text-white transition-transform hover:scale-105 active:scale-95"
            aria-label="Share profile"
          >
            <Share2 className="size-[18px]" />
          </button>
        </div>
      </div>

      {/* Identity */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mx-auto max-w-5xl px-4 pt-4 sm:px-6 sm:pt-5"
      >
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h1 className="break-words text-[28px] font-bold leading-tight tracking-tight text-foreground sm:text-[32px]">
            {displayName}
          </h1>
          {profile.is_verified && (
            <span title="RootVerified" aria-label="Verified talent">
              <BadgeCheck
                className="size-6 fill-rootin text-white drop-shadow-sm sm:size-7"
              />
            </span>
          )}
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {roles.map((role) => (
            <span
              key={role}
              className="inline-flex items-center rounded-full border border-border bg-bg-surface-inset px-2.5 py-1 text-xs font-medium text-foreground/80"
            >
              {role}
            </span>
          ))}
          <AvailabilityBadge status={profile.availability} />
        </div>

        {location && (
          <p className="mt-2 flex items-center gap-1 text-[13px] text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            {location}
          </p>
        )}

        {showActions && (
          <TalentProfileActions
            profile={profile}
            viewerRole={viewerRole}
            campaigns={campaigns}
            campaignsLoading={campaignsLoading}
          />
        )}
      </motion.div>
    </section>
  );
}
