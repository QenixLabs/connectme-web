"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Share2,
  Heart,
  MapPin,
  BadgeCheck,
  LayoutGrid,
  Image as ImageIcon,
  Briefcase,
  Sparkles,
  MoreHorizontal,
  CheckCircle2,
  Play,
  Trophy,
  Star,
  MessageCircle,
  Send,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AwardsSection,
  DetailsSection,
  ExperienceSection,
  PortfolioSection,
  ReviewsSection,
  SkillsSection,
  MediaKitSection,
  AnalyticsSection,
} from "./sections";
import { useLikeTalent } from "@/hooks/use-talent-profile";
import type {
  TalentProfile,
  PortfolioApiResponse,
  Credit,
  Testimonial,
  Award,
} from "@/lib/api/talent";
import type {
  TalentData,
  Fact,
  PortfolioItem,
  ExperienceItem,
  AwardItem,
  ReviewItem,
} from "./sections/types";

const TABS = [
  { id: "Overview", icon: LayoutGrid },
  { id: "Details", icon: Info },
  { id: "Portfolio", icon: ImageIcon },
  { id: "Experience", icon: Briefcase },
  { id: "Skills", icon: Sparkles },
  { id: "More", icon: MoreHorizontal },
];

function formatLocation(
  location?: { country?: string; state?: string; city?: string },
): string {
  if (!location) return "";
  return [location.city, location.state, location.country]
    .filter(Boolean)
    .join(", ");
}

function formatAvailability(status?: string): string {
  if (status === "available") return "Available";
  if (status === "busy") return "Busy";
  if (status === "not_available") return "Not Available";
  return "Available";
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

function mapProfileToTalentData(profile: TalentProfile): TalentData {
  return {
    name: profile.full_legal_name || profile.username,
    roles: profile.professions || [],
    location: formatLocation(profile.location),
    responds: "Responds in 2 hours",
    bio: profile.about || "",
    likes: profile.analytics?.like_count ?? 0,
  };
}

function mapProfileToFact(profile: TalentProfile): Fact[] {
  const facts: Fact[] = [];

  if (profile.physical_attributes?.height_cm) {
    const feet = Math.floor(profile.physical_attributes.height_cm / 30.48);
    const inches = Math.round((profile.physical_attributes.height_cm / 25.4) % 12);
    facts.push({ icon: "height", label: "Height", value: `${feet}'${inches}"` });
  }

  if (profile.languages && profile.languages.length > 0) {
    facts.push({
      icon: "globe",
      label: "Languages",
      value: profile.languages.map((l) => l.name).join(", "),
    });
  }

  if (profile.physical_attributes?.eye_color) {
    facts.push({ icon: "eye", label: "Eye Color", value: profile.physical_attributes.eye_color });
  }

  if (profile.date_of_birth) {
    const birth = new Date(profile.date_of_birth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    facts.push({ icon: "calendar", label: "Age", value: String(age) });
  }

  return facts;
}

function mapPortfolioToItems(items: PortfolioApiResponse[]): PortfolioItem[] {
  return items.map((item, i) => ({
    img: item.thumbnail_url || item.url,
    duration: undefined,
    category: item.category || "work",
    title: item.title || item.caption || `Item ${i + 1}`,
    type: item.type === "video" ? "video" : "photo",
  }));
}

function mapCreditsToExperience(credits: Credit[]): ExperienceItem[] {
  return credits
    .filter((c) => c.type === "credit")
    .map((c) => ({
      years: c.year ? String(c.year) : "N/A",
      role: c.role_played || "",
      pill: c.platform || "Film",
      company: [c.project_name, c.director].filter(Boolean).join(" \u2022 "),
      description: c.description || "",
    }));
}

function mapAwardsToItems(awards: Award[]): AwardItem[] {
  return awards.map((a) => ({
    name: a.title,
    issuer: [a.awarding_body, a.year ? String(a.year) : ""]
      .filter(Boolean)
      .join(" \u2022 "),
  }));
}

function mapTestimonialsToReviews(testimonials: Testimonial[]): ReviewItem[] {
  return testimonials.map((t) => ({
    avatar: "/images/portfolio/p1.jpg",
    name: t.author_name,
    role: [t.author_role, t.author_company].filter(Boolean).join(", "),
    rating: t.rating ?? 5,
    when: formatRelativeTime(t.created_at),
    quote: t.content || "",
  }));
}

function HeroHeader({ profile }: { profile: TalentProfile }) {
  const router = useRouter();
  const { isLiked, isPending, toggleLike } = useLikeTalent(profile.username);
  const heroImage =
    profile.profile_photo || profile.hero_background || "/heroimage.jfif";
  const displayName = profile.full_legal_name || profile.username;

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="relative h-[45vh] min-h-[320px] max-h-[480px]">
      <img
        src={heroImage}
        alt={displayName}
        className="h-full w-full object-cover object-top"
      />
      <div
        className="absolute inset-0"
        style={{ backgroundImage: "var(--gradient-hero)" }}
      />
      <div
        className="absolute inset-0"
        style={{ backgroundImage: "var(--hero-overlay)" }}
      />
      <div
        className="absolute inset-0"
        style={{ backgroundImage: "var(--hero-horizontal-fade)" }}
      />
      <div
        className="absolute inset-0"
        style={{ backgroundImage: "var(--hero-edge-fade)" }}
      />

      <div className="absolute left-4 top-4 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="grid h-10 w-10 place-items-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      <div className="absolute right-4 top-4 flex items-center gap-3">
        <button
          onClick={handleShare}
          className="grid h-10 w-10 place-items-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
        >
          <Share2 className="h-5 w-5" />
        </button>
        <button
          onClick={toggleLike}
          disabled={isPending}
          className={cn(
            "grid h-10 w-10 place-items-center rounded-full bg-black/30 backdrop-blur-sm transition-colors hover:bg-black/50",
            isLiked ? "text-destructive" : "text-white",
          )}
        >
          <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
        </button>
      </div>

      {profile.is_verified && (
        <div className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-black/40 px-3 py-1.5 backdrop-blur-sm">
          <BadgeCheck className="h-4 w-4 shrink-0 fill-primary text-primary" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-primary/90">
            RootVerified
          </span>
        </div>
      )}
    </div>
  );
}

function ProfileInfo({ profile }: { profile: TalentProfile }) {
  const displayName = profile.full_legal_name || profile.username;
  const roles = profile.professions || [];
  const location = formatLocation(profile.location);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          {displayName}
        </h1>
        {profile.is_verified && (
          <BadgeCheck className="h-6 w-6 shrink-0 fill-primary text-primary" />
        )}
      </div>

      {roles.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {roles.join(" \u2022 ")}
        </p>
      )}

      {location && (
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 text-primary" />
          {location}
        </p>
      )}
    </div>
  );
}

function Sparkline() {
  return (
    <svg
      viewBox="0 0 80 24"
      className="mt-3 h-6 w-full"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        d="M2 18 C 12 18, 18 12, 28 14 S 42 6, 52 10 S 68 2, 78 4"
        className="text-success"
      />
    </svg>
  );
}

function MetricsCards({ profile }: { profile: TalentProfile }) {
  const score = profile.trust_score ?? 0;

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-2xl border border-white/5 bg-card p-4">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>RootScore</span>
        </div>
        <div className="mt-1 flex items-end gap-2">
          <span className="text-4xl font-bold text-white">{score}</span>
          <span className="mb-1 text-xs font-medium text-success">Excellent</span>
        </div>
        <Sparkline />
      </div>

      <div className="rounded-2xl border border-white/5 bg-card p-4">
        <div className="text-xs text-muted-foreground">Response Rate</div>
        <div className="mt-1">
          <span className="text-4xl font-bold text-white">95%</span>
        </div>
        <div className="mt-1 text-xs font-medium text-primary">
          Very Responsive
        </div>
      </div>
    </div>
  );
}

function ActionRow({ profile }: { profile: TalentProfile }) {
  const router = useRouter();
  const [shortlisted, setShortlisted] = useState(false);

  const handleMessage = () => {
    router.push(`/talent/messages?user=${profile.username}`);
  };

  const handleShortlist = () => {
    setShortlisted((v) => !v);
    toast.success(shortlisted ? "Removed from shortlist" : "Shortlisted!");
  };

  return (
    <div className="grid grid-cols-[1fr_auto] gap-3">
      <Button
        onClick={handleMessage}
        className="col-span-2 h-12 gap-2 rounded-xl bg-primary text-base font-semibold text-white hover:bg-primary/90"
      >
        <Send className="h-5 w-5" />
        Message
      </Button>

      <Button
        onClick={handleShortlist}
        variant="outline"
        className={cn(
          "h-12 gap-2 rounded-xl border-primary/30 text-base font-semibold text-white hover:bg-primary/10",
          shortlisted && "bg-primary/10 text-primary",
        )}
      >
        <Star className={cn("h-5 w-5", shortlisted && "fill-current")} />
        Shortlist
      </Button>

      <Button
        variant="outline"
        className="h-12 w-12 rounded-xl border-primary/30 p-0 text-white hover:bg-primary/10"
      >
        <MoreHorizontal className="h-5 w-5" />
      </Button>
    </div>
  );
}

function IconTabBar({
  active,
  onChange,
}: {
  active: string;
  onChange: (t: string) => void;
}) {
  return (
    <nav className="rounded-2xl border border-white/5 bg-card p-2">
      <ul className="flex items-center justify-between">
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = active === t.id;
          return (
            <li key={t.id} className="flex-1">
              <button
                onClick={() => onChange(t.id)}
                className={cn(
                  "flex w-full flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground",
                  )}
                />
                {t.id}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function MobileAboutCard({
  talent,
  availability,
}: {
  talent: TalentData;
  availability: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasLongBio = talent.bio.length > 120;

  return (
    <section className="rounded-2xl border border-white/5 bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">About</h2>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          {expanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>
      </div>

      <p
        className={cn(
          "text-sm leading-relaxed text-muted-foreground",
          !expanded && hasLongBio && "line-clamp-3",
        )}
      >
        {talent.bio || "No bio added yet."}
      </p>

      {hasLongBio && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 text-sm font-medium text-primary"
        >
          {expanded ? "Show Less" : "Show More"}
        </button>
      )}

      <div className="mt-4 flex items-center gap-2 rounded-xl bg-background p-3">
        <CheckCircle2 className="h-4 w-4 text-success" />
        <div>
          <p className="text-[10px] text-muted-foreground">Availability</p>
          <p className="text-sm font-medium text-success">{availability}</p>
        </div>
      </div>
    </section>
  );
}

function MobilePortfolioCarousel({
  items,
}: {
  items: PortfolioApiResponse[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      const width = el.firstElementChild?.clientWidth ?? 1;
      const gap = 12;
      const idx = Math.round(el.scrollLeft / (width + gap));
      setActive(Math.min(Math.max(idx, 0), items.length - 1));
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <section className="rounded-2xl border border-white/5 bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          Portfolio Highlights
        </h2>
        <button className="flex items-center gap-0.5 text-sm font-medium text-primary">
          View All <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div
        ref={scrollRef}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4"
      >
        {items.map((item, i) => {
          const img = item.thumbnail_url || item.url;
          const title = item.title || item.caption || `Item ${i + 1}`;
          const isVideo = item.type === "video";

          return (
            <button
              key={item.id || i}
              className="group w-40 shrink-0 snap-start text-left"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                <img
                  src={img}
                  alt={title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {isVideo && (
                  <span className="absolute inset-0 grid place-items-center">
                    <span className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-black/30 backdrop-blur-sm transition-transform duration-200 group-hover:scale-110">
                      <Play className="h-4 w-4 fill-current text-white" />
                    </span>
                  </span>
                )}
              </div>
              <p className="mt-2 truncate text-xs text-muted-foreground">
                {title}
              </p>
            </button>
          );
        })}
      </div>

      {items.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5">
          {items.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-colors",
                i === active ? "bg-primary" : "bg-white/20",
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function MobileSkillsCloud({ skills }: { skills: string[] }) {
  const visible = skills.slice(0, 8);
  const more = skills.length - visible.length;

  return (
    <section className="rounded-2xl border border-white/5 bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Skills</h2>
        <button className="flex items-center gap-0.5 text-sm font-medium text-primary">
          View All <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {visible.map((s) => (
          <span
            key={s}
            className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
          >
            {s}
          </span>
        ))}
        {more > 0 && (
          <span className="rounded-full border border-primary/20 px-3 py-1 text-xs font-medium text-primary">
            + {more} more
          </span>
        )}
      </div>
    </section>
  );
}

function MobileAwardsList({ awards }: { awards: AwardItem[] }) {
  if (awards.length === 0) return null;

  return (
    <section className="rounded-2xl border border-white/5 bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          Awards & Recognitions
        </h2>
        <button className="flex items-center gap-0.5 text-sm font-medium text-primary">
          View All <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3">
        {awards.map((a, i) => {
          const Icon = i % 2 === 0 ? Trophy : Star;
          return (
            <div key={a.name} className="flex items-start gap-3">
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
              <div>
                <p className="text-sm font-medium text-white">{a.name}</p>
                <p className="text-xs text-muted-foreground">{a.issuer}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ProfileBottomBar({ profile }: { profile: TalentProfile }) {
  const router = useRouter();
  const [shortlisted, setShortlisted] = useState(false);

  const handleMessage = () => {
    router.push(`/talent/messages?user=${profile.username}`);
  };

  const whatsappUrl = profile.social_links?.whatsapp?.url;
  const phone =
    profile.social_links?.phone?.url || profile.social_links?.mobile?.url;

  const handleWhatsApp = () => {
    if (whatsappUrl) {
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      return;
    }
    if (phone) {
      const clean = phone.replace(/\D/g, "");
      window.open(`https://wa.me/${clean}`, "_blank", "noopener,noreferrer");
      return;
    }
    toast("WhatsApp contact not available");
  };

  const handleCall = () => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    } else {
      toast("Phone number not available");
    }
  };

  const handleShortlist = () => {
    setShortlisted((v) => !v);
    toast.success(shortlisted ? "Removed from shortlist" : "Shortlisted!");
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-white/5 bg-card px-6 py-2 lg:hidden">
      <ul className="mx-auto flex max-w-lg items-center justify-between">
        <li>
          <button
            onClick={handleMessage}
            className="flex w-16 flex-col items-center gap-1 py-1 text-[11px] font-medium text-primary"
          >
            <Mail className="h-5 w-5" />
            Message
          </button>
        </li>
        <li>
          <button
            onClick={handleWhatsApp}
            className="flex w-16 flex-col items-center gap-1 py-1 text-[11px] font-medium text-[#25D366]"
          >
            <MessageCircle className="h-5 w-5" />
            WhatsApp
          </button>
        </li>
        <li>
          <button
            onClick={handleCall}
            className="flex w-16 flex-col items-center gap-1 py-1 text-[11px] font-medium text-white"
          >
            <Phone className="h-5 w-5" />
            Call
          </button>
        </li>
        <li>
          <button
            onClick={handleShortlist}
            className={cn(
              "flex w-16 flex-col items-center gap-1 py-1 text-[11px] font-medium",
              shortlisted ? "text-destructive" : "text-white",
            )}
          >
            <Heart
              className={cn("h-5 w-5", shortlisted && "fill-current")}
            />
            Shortlist
          </button>
        </li>
      </ul>
    </nav>
  );
}

interface MobileViewProps {
  profile: TalentProfile;
  portfolioItems: PortfolioApiResponse[];
  credits: Credit[];
  testimonials: Testimonial[];
  awards: Award[];
}

export function MobileView({
  profile,
  portfolioItems: portfolioApiItems,
  credits,
  testimonials,
  awards,
}: MobileViewProps) {
  const [tab, setTab] = useState("Overview");

  const talentData = useMemo(() => mapProfileToTalentData(profile), [profile]);
  const facts = useMemo(() => mapProfileToFact(profile), [profile]);
  const availability = useMemo(
    () => formatAvailability(profile.availability),
    [profile],
  );

  const safePortfolioItems = useMemo(
    () => (Array.isArray(portfolioApiItems) ? portfolioApiItems : []),
    [portfolioApiItems],
  );
  const portfolioVideos = useMemo(
    () =>
      mapPortfolioToItems(safePortfolioItems.filter((i) => i.type === "video")),
    [safePortfolioItems],
  );
  const portfolioPhotos = useMemo(
    () =>
      mapPortfolioToItems(safePortfolioItems.filter((i) => i.type !== "video")),
    [safePortfolioItems],
  );
  const experience = useMemo(() => mapCreditsToExperience(credits), [credits]);
  const skills = useMemo(
    () => (profile.skills || []).map((s) => s.name),
    [profile],
  );
  const awardsData = useMemo(() => mapAwardsToItems(awards), [awards]);
  const reviews = useMemo(
    () => mapTestimonialsToReviews(testimonials),
    [testimonials],
  );

  return (
    <div className="relative min-h-screen bg-background pb-28 lg:hidden">
      <HeroHeader profile={profile} />

      <div className="relative -mt-12 space-y-5 px-4 sm:mx-auto sm:max-w-md">
        <ProfileInfo profile={profile} />
        <MetricsCards profile={profile} />
        <ActionRow profile={profile} />
        <IconTabBar active={tab} onChange={setTab} />

        {tab === "Overview" && (
          <div className="space-y-5">
            <MobileAboutCard
              talent={talentData}
              availability={availability}
            />
            <MobilePortfolioCarousel items={safePortfolioItems} />
            <MobileSkillsCloud skills={skills} />
            <MobileAwardsList awards={awardsData} />
          </div>
        )}

        {tab === "Details" && (
          <DetailsSection facts={facts} />
        )}

        {tab === "Portfolio" && (
          <PortfolioSection
            videos={portfolioVideos}
            photos={portfolioPhotos}
            scroll
          />
        )}

        {tab === "Experience" && (
          <div className="space-y-5">
            <ExperienceSection data={experience} />
            <AwardsSection data={awardsData} />
          </div>
        )}

        {tab === "Skills" && <SkillsSection data={skills} />}

        {tab === "More" && (
          <div className="space-y-5">
            <ReviewsSection data={reviews} columns={1} />
            <AnalyticsSection profile={profile} />
            <MediaKitSection profile={profile} />
          </div>
        )}
      </div>

      <ProfileBottomBar profile={profile} />
    </div>
  );
}
