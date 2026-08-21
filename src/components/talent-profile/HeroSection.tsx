"use client";

/* eslint-disable @next/next/no-img-element */

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "motion/react";
import { ArrowLeft, Share2, Heart, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLikeTalent } from "@/hooks/use-talent-profile";
import type { TalentProfile, TalentProfilePreview } from "@/lib/api/talent";
import type { Campaign } from "@/lib/api/campaigns";
import { VerifiedBadge, AvailabilityBadge } from "./primitives";
import { formatLocation } from "./data";
import { TalentProfileActions } from "./TalentProfileActions";

export interface HeroSectionProps {
  profile: TalentProfile | TalentProfilePreview;
  viewerRole: "talent" | "recruiter" | "admin" | null;
  campaigns?: Campaign[];
  campaignsLoading?: boolean;
}

export function HeroSection({
  profile,
  viewerRole,
  campaigns,
  campaignsLoading,
}: HeroSectionProps) {
  const router = useRouter();
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
      <div className="relative h-[60vh] min-h-[440px] w-full md:h-[64vh]">
        <img
          src={heroImage}
          alt={displayName}
          className="absolute inset-0 h-full w-full object-cover object-top"
        />

        {/* Glow + fade overlays */}
        <div
          className="absolute inset-0"
          style={{ backgroundImage: "var(--hero-glow)" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "var(--profile-hero-overlay)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "var(--profile-hero-edge-overlay)",
          }}
        />

        {/* Top nav */}
        <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between p-4 pt-[max(1rem,env(safe-area-inset-top))] sm:p-6 sm:pt-[max(1.5rem,env(safe-area-inset-top))]">
          <button
            onClick={() => router.back()}
            className="grid h-11 w-11 place-items-center rounded-full glass-strong text-white transition-transform hover:scale-105 active:scale-95"
            aria-label="Go back"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="grid h-11 w-11 place-items-center rounded-full glass-strong text-white transition-transform hover:scale-105 active:scale-95"
              aria-label="Share profile"
            >
              <Share2 className="size-5" />
            </button>
            <button
              onClick={toggleLike}
              disabled={isPending}
              className={cn(
                "grid h-11 w-11 place-items-center rounded-full glass-strong transition-transform hover:scale-105 active:scale-95",
                isLiked ? "text-destructive" : "text-white",
              )}
              aria-label={isLiked ? "Unlike" : "Like"}
            >
              <Heart
                className={cn("size-5", isLiked && "fill-current")}
              />
            </button>
          </div>
        </div>

        {/* Badges stay anchored to the image edge. */}
        <div className="absolute bottom-0 left-0 right-0 z-20 px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto max-w-5xl"
          >
            <div className="flex flex-wrap items-center gap-2">
              {profile.is_verified && <VerifiedBadge large />}
              <AvailabilityBadge status={profile.availability} />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Identity flows directly after the image frame. */}
      <div className="relative z-20 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-0 sm:px-6 sm:pb-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-5xl"
        >
          <div className="w-full min-w-0">
            <h1 className="mt-2 break-words text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              {displayName}
            </h1>

            {roles.length > 0 && (
              <p className="mt-1 break-words text-base text-muted-foreground sm:text-lg">
                {roles.join(" • ")}
              </p>
            )}

            {location && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-4" />
                {location}
              </p>
            )}
          </div>

          <TalentProfileActions
            profile={profile}
            viewerRole={viewerRole}
            campaigns={campaigns}
            campaignsLoading={campaignsLoading}
          />
        </motion.div>
      </div>
    </section>
  );
}
