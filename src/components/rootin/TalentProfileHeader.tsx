"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Bookmark,
  Clock,
  Heart,
  MapPin,
  MessageCircle,
  Send,
  Share2,
  Star,
  TrendingUp,
} from "lucide-react";
import { useLikeTalent } from "@/hooks/use-talent-profile";
import type { TalentProfile } from "@/lib/api/talent";

function ScoreRing({ value }: { value: number }) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const dash = (value / 100) * circumference;

  return (
    <div className="relative h-24 w-24">
      <svg viewBox="0 0 112 112" className="h-full w-full -rotate-[100deg]">
        <circle
          cx="56"
          cy="56"
          r={radius}
          fill="none"
          stroke="var(--track)"
          strokeWidth="8"
        />
        <circle
          cx="56"
          cy="56"
          r={radius}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-display text-4xl text-accent">
        {value}
      </span>
    </div>
  );
}

function formatLocation(location?: { country?: string; state?: string; city?: string }): string {
  if (!location) return "";
  const parts = [location.city, location.state, location.country].filter(Boolean);
  return parts.join(", ");
}

export function TalentProfileHeader({ profile }: { profile: TalentProfile }) {
  const router = useRouter();
  const { isLiked, isPending, toggleLike } = useLikeTalent(profile.username);
  const [saved, setSaved] = useState(false);
  const [shortlisted, setShortlisted] = useState(false);
  const displayName = profile.full_legal_name || profile.username;
  const roles = profile.professions || [];
  const locationStr = formatLocation(profile.location);
  const trustScore = profile.trust_score ?? 0;
  const likes = profile.analytics?.like_count ?? 0;
  const heroImage = profile.profile_photo || profile.hero_background || "/heroimage.jfif";

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleMessage = () => {
    router.push(`/talent/messages?user=${profile.username}`);
  };

  const handleSave = () => {
    setSaved((v) => !v);
    toast.success(saved ? "Removed from saved" : "Saved!");
  };

  const handleShortlist = () => {
    setShortlisted((v) => !v);
    toast.success(shortlisted ? "Removed from shortlist" : "Shortlisted!");
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-panel-border bg-card shadow-[var(--shadow-panel)]">
      <div className="grid gap-0 lg:grid-cols-2">
        {/* Portrait + identity */}
        <div className="relative lg:min-h-[420px]">
          <div className="relative aspect-[4/5] lg:absolute lg:inset-0 lg:aspect-auto">
            <img
              src={heroImage}
              alt={`Portrait of ${displayName}`}
              width={1024}
              height={1024}
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent hidden lg:block" />
          </div>

          {/* Identity */}
          <div className="relative p-6 lg:absolute lg:bottom-0 lg:left-0 lg:right-0">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <h1 className="min-w-0 flex-1 truncate font-display text-3xl font-semibold text-foreground sm:text-4xl">
                  {displayName}
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {roles.map((tag, i) => (
                  <div key={tag} className="flex items-center gap-2">
                    {i > 0 && <span className="text-accent">&bull;</span>}
                    <span className="rounded-full border border-panel-border bg-panel/80 px-4 py-1.5 text-sm text-foreground backdrop-blur">
                      {tag}
                    </span>
                  </div>
                ))}
                {profile.is_verified && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-teal/40 bg-panel/80 px-3 py-1.5 text-xs font-semibold tracking-[0.14em] text-foreground uppercase backdrop-blur">
                    <span className="h-2 w-2 rounded-full bg-accent" />
                    RootVerified
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                {locationStr && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" /> {locationStr}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 text-accent">
                  <Clock className="h-4 w-4" /> Responds in 2 hours
                </span>
                {profile.availability && (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-accent" />{" "}
                    {profile.availability === "available"
                      ? "Available"
                      : profile.availability === "busy"
                        ? "Busy"
                        : "Not Available"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats + actions */}
        <div className="flex flex-col gap-4 p-6">
          <section className="relative overflow-hidden rounded-2xl border border-panel-border bg-card">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent" />

            <div className="flex items-center justify-center gap-3 px-6 pt-5 pb-4">
              <div className="h-px flex-1 bg-panel-border" />
              <div className="flex shrink-0 items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-accent" />
                Professional Metrics
              </div>
              <div className="h-px flex-1 bg-panel-border" />
            </div>

            <div className="grid grid-cols-3">
              <div className="flex flex-col items-center px-6 pb-5">
                <div className="mb-4 rounded-full border border-accent/30 p-2.5">
                  <TrendingUp className="h-4 w-4 text-accent" />
                </div>
                <p className="mb-3 text-xs uppercase tracking-[0.25em] text-muted-foreground">
                  RootScore
                </p>
                <ScoreRing value={trustScore} />
                <p className="mt-2 text-sm font-medium text-accent">Top 5% Talent</p>
              </div>

              <div className="relative">
                <div className="absolute left-0 top-8 bottom-8 w-px bg-panel-border" />
                <div className="flex flex-col items-center px-6 pb-5">
                  <div className="mb-4 rounded-full border border-accent/30 p-2.5">
                    <Star className="h-4 w-4 text-accent" />
                  </div>
                  <p className="mb-3 text-xs uppercase tracking-[0.25em] text-muted-foreground">
                    Rating
                  </p>
                  <div className="font-display text-5xl text-foreground">4.8</div>
                  <div className="mt-3 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold" />
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">120 Reviews</p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-0 top-8 bottom-8 w-px bg-panel-border" />
                <div className="flex flex-col items-center px-6 pb-5">
                  <div className="mb-4 rounded-full border border-accent/30 p-2.5">
                    <MessageCircle className="h-4 w-4 text-accent" />
                  </div>
                  <p className="mb-3 text-xs uppercase tracking-[0.25em] text-muted-foreground">
                    Response Rate
                  </p>
                  <div className="font-display text-5xl text-foreground">95%</div>
                  <p className="mt-3 text-sm text-accent">Replies within 2 hours</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 px-6 pb-4">
              <div className="h-px flex-1 bg-panel-border" />
              <div className="shrink-0 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Trusted by Top Recruiters
              </div>
              <div className="h-px flex-1 bg-panel-border" />
            </div>
          </section>

          <button
            type="button"
            onClick={handleMessage}
            className="flex w-full items-center justify-center gap-3 rounded-2xl px-6 py-4 text-left text-primary-foreground shadow-[var(--shadow-message)] transition-opacity hover:opacity-90"
            style={{ backgroundImage: "var(--gradient-message)" }}
          >
            <Send className="h-5 w-5" />
            <span>
              <span className="block text-lg font-semibold">Message</span>
              <span className="block text-sm opacity-90">Start a conversation</span>
            </span>
          </button>

          <div className="grid items-center gap-4 sm:grid-cols-[1fr_1fr_auto]">
            <button
              type="button"
              onClick={handleSave}
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-6 py-3.5 text-sm font-medium transition-colors ${
                saved
                  ? "border-accent/35 bg-accent/10 text-accent"
                  : "border-panel-border bg-panel text-foreground hover:bg-muted"
              }`}
            >
              <Bookmark className="h-4 w-4" /> {saved ? "Saved" : "Save"}
            </button>
            <button
              type="button"
              onClick={handleShortlist}
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-6 py-3.5 text-sm font-medium transition-colors ${
                shortlisted
                  ? "border-accent/60 bg-accent/10 text-accent"
                  : "border-accent/60 text-accent hover:bg-accent/10"
              }`}
            >
              <Star className="h-4 w-4" /> {shortlisted ? "Shortlisted" : "Shortlist"}
            </button>
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <button
                type="button"
                onClick={toggleLike}
                disabled={isPending}
                className={`inline-flex items-center gap-2 transition-colors hover:text-foreground ${
                  isLiked ? "text-destructive" : ""
                }`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? "fill-destructive" : ""}`} />{" "}
                {likes + (isLiked ? 1 : 0)}
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
              >
                <Share2 className="h-4 w-4" /> Share
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
