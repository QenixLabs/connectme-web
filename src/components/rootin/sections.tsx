"use client";

import { useState, createContext, useContext, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Bookmark,
  Heart,
  MapPin,
  MessageCircle,
  Send,
  Share2,
  Star,
  Clock,
  BadgeCheck,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Pill, Card, Stars } from "./primitives";
import { useLikeTalent } from "@/hooks/use-talent-profile";
import type { TalentProfile } from "@/lib/api/talent";

export { Card, SectionHead, Pill, Stars, EmptyState } from "./primitives";
export {
  AboutSection,
  PortfolioSection,
  ExperienceSection,
  SkillsSection,
  AwardsSection,
  ReviewsSection,
  MediaKitSection,
  AnalyticsSection,
} from "./sections/index";
export type {
  AboutSectionProps,
  PortfolioSectionProps,
  ExperienceSectionProps,
  SkillsSectionProps,
  AwardsSectionProps,
  ReviewsSectionProps,
  MediaKitSectionProps,
  AnalyticsSectionProps,
} from "./sections/index";
export { getDisplayMode } from "./sections/index";
export type {
  DisplayMode,
  SectionProps,
  Fact,
  TalentData,
  PortfolioItem,
  ExperienceItem,
  AwardItem,
  ReviewItem,
} from "./sections/index";

const ProfileContext = createContext<TalentProfile | null>(null);

export function ProfileProvider({
  profile,
  children,
}: {
  profile: TalentProfile;
  children: ReactNode;
}) {
  return (
    <ProfileContext.Provider value={profile}>{children}</ProfileContext.Provider>
  );
}

function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("ProfileProvider missing");
  return ctx;
}

function formatLocation(location?: { country?: string; state?: string; city?: string }): string {
  if (!location) return "";
  return [location.city, location.state, location.country].filter(Boolean).join(", ");
}

function formatAvailability(status?: string): string {
  if (status === "available") return "Available";
  if (status === "busy") return "Busy";
  if (status === "not_available") return "Not Available";
  return "Available";
}

export function ScoreRing({ size = 140 }: { size?: number | undefined }) {
  const profile = useProfile();
  const trustScore = profile.trust_score ?? 0;
  const stroke = 9;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const progress = trustScore / 100;
  const targetOffset = c * (1 - progress);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <radialGradient id="ring-glow" cx="50%" cy="50%" r="50%">
            <stop offset="55%" stopColor="var(--accent)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r + 18} fill="url(#ring-glow)" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          stroke="oklch(1 0 0 / 0.05)"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${c * progress} ${c}`}
          stroke="var(--accent)"
          strokeOpacity="0.95"
          strokeDashoffset={targetOffset}
          style={
            {
              animation: "ring-progress 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
              "--ring-circumference": c,
              "--ring-offset-target": targetOffset,
            } as React.CSSProperties
          }
        />
      </svg>
      <span
        className="absolute inset-0 grid place-items-center font-display font-semibold leading-none tracking-tight text-accent"
        style={{ fontSize: `${Math.round(size * 0.34)}px` }}
      >
        {trustScore}
      </span>
    </div>
  );
}

export function ScoreCard({ ringSize = 112 }: { ringSize?: number | undefined }) {
  return (
    <Card prominent className="flex flex-col items-center justify-center gap-0.5 text-center p-2.5 sm:p-3" hover={false}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/30">
        RootScore
      </p>
      <div className="my-0.5" style={{ filter: "drop-shadow(var(--glow-ring))" }}>
        <ScoreRing size={ringSize} />
      </div>
      <p className="flex items-center gap-1.5 text-sm font-semibold text-success">
        <TrendingUp width={14} height={14} /> +12%
      </p>
      <p className="text-[10px] text-muted-foreground/30">vs last month</p>
    </Card>
  );
}

export function RatingCard() {
  return (
    <Card prominent className="flex flex-col items-center justify-center gap-1.5 text-center p-2.5 sm:p-3">
      <Star width={22} height={22} className="fill-gold text-gold drop-shadow-[0_0_4px_var(--gold)]" />
      <div className="flex items-baseline gap-1.5">
        <span className="font-display text-[40px] font-semibold leading-none tracking-tight">4.8</span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/30">
          rating
        </span>
      </div>
      <Stars value={4.8} size={16} />
      <p className="text-xs leading-relaxed text-foreground/60">
        &ldquo;Brings unmatched dedication and depth to every role.&rdquo;
      </p>
      <p className="text-[10px] text-muted-foreground/30">&mdash; Neha Kapoor</p>
    </Card>
  );
}

export function ResponseCard() {
  return (
    <Card prominent className="flex flex-col items-center justify-center gap-1 text-center p-2.5 sm:p-3">
      <MessageCircle width={22} height={22} className="text-accent" />
      <div className="flex items-baseline gap-1.5">
        <span className="font-display text-[44px] font-semibold leading-none tracking-tight">95%</span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/30">
          rate
        </span>
      </div>
      <p className="text-xs font-medium text-accent/60">Typically within 2 hours</p>
    </Card>
  );
}

export function TabBar({
  items,
  active,
  onChange,
  scroll = false,
}: {
  items: string[];
  active: string;
  onChange: (t: string) => void;
  scroll?: boolean;
}) {
  return (
    <nav
      className={cn(
        "rounded-xl border bg-card px-4",
        scroll && "no-scrollbar overflow-x-auto",
      )}
      style={{ borderColor: "var(--border-card)", backgroundImage: "var(--gradient-card)", boxShadow: "var(--shadow-tab)" }}
    >
      <ul className="flex min-w-max items-center gap-1.5">
        {items.map((t) => (
          <li key={t}>
            <button
              onClick={() => onChange(t)}
              className={cn(
                "relative px-5 py-3.5 text-[13px] font-medium uppercase tracking-[0.06em] transition-all duration-200",
                active === t
                  ? "text-accent"
                  : "text-muted-foreground/40 hover:text-foreground/60",
              )}
            >
              {t}
              <span
                className={cn(
                  "absolute inset-x-3 -bottom-px h-[3px] rounded-full bg-accent shadow-[var(--glow-accent)]",
                  "transition-all duration-200 ease-out",
                  active === t ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0",
                )}
                style={{ transformOrigin: "center" }}
              />
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function MetaRow() {
  const profile = useProfile();
  const locationStr = formatLocation(profile.location);
  const availability = formatAvailability(profile.availability);

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs">
      {locationStr && (
        <span className="flex items-center gap-1.5 text-muted-foreground/50">
          <MapPin width={14} height={14} /> {locationStr}
        </span>
      )}
      <span className="flex items-center gap-1.5 text-accent/70">
        <Clock width={14} height={14} /> Responds in 2 hours
      </span>
      <span className="flex items-center gap-1.5 text-muted-foreground/50">
        <span className="h-2 w-2 rounded-full bg-success shadow-[var(--glow-success)]" /> {availability}
      </span>
    </div>
  );
}

export function RoleTags() {
  const profile = useProfile();
  const roles = profile.professions || [];

  return (
    <div className="flex flex-wrap items-center gap-3">
      {roles.map((r, i) => (
        <span key={r} className="flex items-center gap-2.5">
          <Pill className="bg-card/70 backdrop-blur-sm">{r}</Pill>
          {i < roles.length - 1 ? (
            <span className="h-1 w-1 rounded-full bg-accent/60" />
          ) : null}
        </span>
      ))}
    </div>
  );
}

export function RootVerifiedBadge({ large = false }: { large?: boolean }) {
  const profile = useProfile();
  if (!profile.is_verified) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-accent/25 bg-black/40 backdrop-blur-sm",
        large ? "px-3 py-1.5" : "px-2 py-0.5",
      )}
    >
      <BadgeCheck
        width={large ? 14 : 11}
        height={large ? 14 : 11}
        className="shrink-0 fill-accent text-accent"
      />
      <span
        className={cn(
          "font-medium uppercase tracking-[0.12em] text-accent/90",
          large ? "text-xs" : "text-[10px]",
        )}
      >
        RootVerified
      </span>
    </span>
  );
}

export function NameBlock({ large = false }: { large?: boolean }) {
  const profile = useProfile();
  const displayName = profile.full_legal_name || profile.username;

  return (
    <h1
      className={cn(
        "font-display font-semibold leading-[0.95] tracking-tight text-white",
        large ? "text-[32px]" : "text-4xl",
      )}
    >
      {displayName}
    </h1>
  );
}

export function ActionButtons() {
  const profile = useProfile();
  const router = useRouter();
  const likes = profile.analytics?.like_count ?? 0;
  const { isLiked, isPending, toggleLike } = useLikeTalent(profile.username);
  const [saved, setSaved] = useState(false);
  const [shortlisted, setShortlisted] = useState(false);

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

  const primaryBtn =
    "flex items-center justify-center gap-3 rounded-xl px-7 py-3 text-base font-semibold tracking-tight text-white transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background shadow-[var(--shadow-button)]";

  const secondaryBtn =
    "flex items-center justify-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

  return (
    <div className="grid grid-cols-3 gap-3">
      <button
        onClick={handleMessage}
        className={cn(
          primaryBtn,
          "col-span-2",
          "hover:-translate-y-0.5 hover:shadow-[var(--shadow-button-hover),0_0_20px_-6px_var(--accent)]",
        )}
        style={{
          backgroundImage: "var(--gradient-hero-cta)",
        }}
      >
        <Send width={18} height={18} />
        <span className="text-left leading-tight">
          Message
          <span className="hidden text-xs font-normal opacity-70 lg:block">
            Start a conversation
          </span>
        </span>
      </button>
      <button
        onClick={toggleLike}
        disabled={isPending}
        className={cn(
          secondaryBtn,
          "text-foreground/50 hover:-translate-y-0.5 hover:bg-surface/60 hover:text-destructive/60",
          isLiked && "text-destructive",
        )}
      >
        <Heart width={18} height={18} className={isLiked ? "fill-destructive" : ""} />{" "}
        {likes + (isLiked ? 1 : 0)}
      </button>
      <button
        onClick={handleSave}
        className={cn(
          secondaryBtn,
          "border bg-surface hover:-translate-y-0.5",
          saved
            ? "border-accent/35 text-accent shadow-[var(--glow-accent)]"
            : "text-foreground/55 hover:text-foreground hover:bg-surface/90",
        )}
        style={{ borderColor: saved ? undefined : "var(--border-card)" }}
      >
        <Bookmark width={18} height={18} /> {saved ? "Saved" : "Save"}
      </button>
      <button
        onClick={handleShortlist}
        className={cn(
          secondaryBtn,
          "border hover:-translate-y-0.5",
          shortlisted
            ? "border-accent/35 text-accent shadow-[var(--glow-accent)]"
            : "border-accent/15 text-accent/70 hover:text-accent hover:border-accent/25",
        )}
        style={{
          borderColor: shortlisted ? undefined : "oklch(var(--accent) / 0.15)",
          backgroundColor: shortlisted ? undefined : "oklch(var(--accent) / 0.06)",
        }}
      >
        <Star width={18} height={18} className={shortlisted ? "fill-accent" : ""} />{" "}
        {shortlisted ? "Shortlisted" : "Shortlist"}
      </button>
      <button
        onClick={handleShare}
        className={cn(
          secondaryBtn,
          "text-foreground/40 hover:-translate-y-0.5 hover:text-foreground/65 hover:bg-surface/50",
        )}
      >
        <Share2 width={18} height={18} /> Share
      </button>
    </div>
  );
}
