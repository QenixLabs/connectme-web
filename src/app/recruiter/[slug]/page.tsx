"use client";

import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Bookmark,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  Clapperboard,
  Clock3,
  Copy,
  Crown,
  Gem,
  Globe,
  Heart,
  MapPin,
  MessageCircle,
  Mic2,
  MoreHorizontal,
  Music2,
  Play,
  Send,
  Share2,
  Sparkles,
  Star,
  Trophy,
  UserPlus,
  Users,
} from "lucide-react";
import { siInstagram, siX, siYoutube } from "simple-icons/icons";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  usePublicRecruiterProfile,
  usePublicRecruiterCampaigns,
  usePublicRecruiterTeam,
  usePublicRecruiterReviews,
} from "@/hooks/use-recruiter-public-profile";
import { useSaveRecruiter, useStartConversation } from "@/hooks/use-recruiter-actions";
import { useConnectionRequest } from "@/hooks/use-talent-actions";
import { Skeleton } from "@/components/ui/skeleton";
import { relativeTime } from "@/lib/utils";
import type {
  PublicRecruiterProfile,
  PublicCampaignSummary,
  PublicTeamMember,
  PublicReview,
} from "@/lib/api/recruiter";
import styles from "./page.module.css";

const castingHero = "/images/casting/casting-hero.jpg";

const fallbackImages = [
  "/images/casting/actor-male.jpg",
  "/images/casting/actor-female.jpg",
  "/images/casting/casting-team.jpg",
  "/images/casting/casting-hero.jpg",
];

const categoryIcons = [
  Star,
  Users,
  Sparkles,
  Music2,
  Clapperboard,
  Mic2,
  BriefcaseBusiness,
  Crown,
];

const valueIcons = [Star, Users, Gem, Clapperboard, MapPin, Crown];

const tabs = ["Overview", "Projects", "Jobs", "Team", "Reviews"];

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="mx-auto max-w-md border-x border-border/60 bg-surface px-5">
        <Skeleton className="h-44 w-full rounded-none" />
        <div className="relative z-10 -mt-20 size-28 rounded-2xl border border-border bg-card" />
        <Skeleton className="mt-5 h-8 w-64" />
        <Skeleton className="mt-2 h-4 w-48" />
        <div className="mt-4 flex gap-3">
          <Skeleton className="h-12 flex-1 rounded-xl" />
          <Skeleton className="h-12 flex-1 rounded-xl" />
          <Skeleton className="h-12 w-12 rounded-xl" />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <Skeleton className="mt-6 h-10 w-full rounded-lg" />
        <Skeleton className="mt-5 h-40 rounded-2xl" />
        <Skeleton className="mt-4 h-32 rounded-2xl" />
      </div>
    </div>
  );
}

function ProfileNotFound({ slug }: { slug: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Profile not found</h1>
        <p className="mt-2 text-muted-foreground">
          The recruiter profile{" "}
          <span className="font-medium text-foreground">/{slug}</span> doesn&apos;t
          exist.
        </p>
      </div>
    </div>
  );
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function formatLocation(location?: PublicRecruiterProfile["location"]): string | null {
  if (!location) return null;
  return [location.city, location.state, location.country].filter(Boolean).join(", ") || null;
}

function normalizeUrl(url?: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  const withProtocol = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const parsed = new URL(withProtocol);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return withProtocol;
  } catch {
    return null;
  }
}

function InstagramLogo({ size = 18 }: { size?: number }) {
  return (
    <svg role="img" viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <defs>
        <linearGradient id="ig-brand-gradient" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#FEDA75" />
          <stop offset="0.25" stopColor="#FA7E1E" />
          <stop offset="0.5" stopColor="#D62976" />
          <stop offset="0.75" stopColor="#962FBF" />
          <stop offset="1" stopColor="#4F5BD5" />
        </linearGradient>
      </defs>
      <path fill="url(#ig-brand-gradient)" d={siInstagram.path} />
    </svg>
  );
}

function LinkedInLogo({ size = 18 }: { size?: number }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="#0A66C2"
      aria-hidden="true"
    >
      {/* Official LinkedIn logo (removed from simple-icons upstream) */}
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function YouTubeLogo({ size = 18 }: { size?: number }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="#FF0000"
      aria-hidden="true"
    >
      <path d={siYoutube.path} />
    </svg>
  );
}

function XIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d={siX.path} />
    </svg>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className={styles.statCell}>
      <span className="text-gold">{icon}</span>
      <div>
        <strong>{value}</strong>
        <small>{label}</small>
      </div>
    </div>
  );
}

function SectionTitle({
  children,
  onClick,
  icon,
}: {
  children: React.ReactNode;
  onClick?: (() => void) | undefined;
  icon?: React.ReactNode;
}) {
  return (
    <div className={styles.sectionTitle}>
      <div className={styles.sectionTitleCopy}>
        {icon && <span className={styles.sectionTitleIcon}>{icon}</span>}
        <h2>{children}</h2>
      </div>
      {onClick && (
        <button onClick={onClick}>
          View all <ChevronRight size={13} />
        </button>
      )}
    </div>
  );
}

function Overview({
  go,
  profile,
  campaigns,
}: {
  go: (tab: string) => void;
  profile: PublicRecruiterProfile;
  campaigns: PublicCampaignSummary[];
}) {
  const projectImages = campaigns.slice(0, 5).map(
    (c, i) => c.cover_image_url || fallbackImages[i % fallbackImages.length],
  );

  return (
    <div className={styles.spaceY5}>
      <section className={styles.overviewCard}>
        <SectionTitle icon={<BriefcaseBusiness size={16} />}>About</SectionTitle>
        <p className={styles.aboutText}>
          {profile.about ||
            "We are a leading casting and talent management agency working across films, web series, television, commercials and digital content. We connect the right talent with the right stories."}
        </p>
      </section>
      {profile.specialties && profile.specialties.length > 0 && (
        <section className={styles.overviewCard}>
          <SectionTitle icon={<Sparkles size={16} />}>Specialities</SectionTitle>
          <div className={styles.chipRow}>
            {profile.specialties.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
        </section>
      )}
      {profile.languages && profile.languages.length > 0 && (
        <section className={styles.overviewCard}>
          <SectionTitle icon={<Globe size={16} />}>Languages</SectionTitle>
          <div className={styles.chipRow}>
            {profile.languages.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </div>
        </section>
      )}
      <section className={`${styles.overviewCard} ${styles.featuredWorkCard}`}>
        <SectionTitle icon={<Clapperboard size={16} />} onClick={() => go("Projects")}>
          Featured Work
        </SectionTitle>
        {campaigns.length > 0 ? (
          <button
            onClick={() => go("Projects")}
            className={styles.showreel}
            aria-label="View featured casting call"
          >
            <img
              src={campaigns[0].cover_image_url || fallbackImages[0]}
              alt={campaigns[0].name}
              width={720}
              height={900}
            />
            <span className={styles.showreelShade} />
            <span className={styles.playButton}>
              <Play size={23} fill="currentColor" />
            </span>
            <span className={styles.showreelCopy}>
              <strong>{campaigns[0].name}</strong>
              <small>{campaigns[0].role_type || "Casting Call"}</small>
            </span>
          </button>
        ) : (
          <button
            onClick={() => go("Projects")}
            className={styles.showreel}
            aria-label="View casting portfolio"
          >
            <img
              src={profile.profile_photo || castingHero}
              alt={`${profile.company_name} portfolio`}
              width={720}
              height={900}
            />
            <span className={styles.showreelShade} />
            <span className={styles.playButton}>
              <Play size={23} fill="currentColor" />
            </span>
            <span className={styles.showreelCopy}>
              <strong>{profile.company_name}</strong>
              <small>Real Talent. Real Opportunities.</small>
            </span>
          </button>
        )}
        {projectImages.length > 0 && (
          <div className={styles.thumbnailRow}>
            {projectImages.map((image, index) => (
              <img key={index} src={image} alt="Featured casting work" loading="lazy" />
            ))}
          </div>
        )}
      </section>
      <section className={styles.achievementGrid}>
        <div>
          <Clapperboard />
          <strong>{profile.completed_campaigns_count}+</strong>
          <small>
            Successful
            <br />
            Projects
          </small>
        </div>
        <div>
          <Heart />
          <strong>{profile.total_talents_count}+</strong>
          <small>
            Talents
            <br />
            Launched
          </small>
        </div>
        <div>
          <Star />
          <strong>{profile.average_rating > 0 ? `${Math.round(profile.average_rating * 10)}%` : "—"}</strong>
          <small>
            Client
            <br />
            Satisfaction
          </small>
        </div>
      </section>
      <blockquote className={styles.blockquote}>
        <span className={styles.quoteMark}>&ldquo;</span>
        <p>{profile.motto || "We don't just cast. We create opportunities."}</p>
        <small>{profile.company_name}</small>
      </blockquote>
    </div>
  );
}

function Projects({
  go,
  profile,
  campaigns,
}: {
  go: (tab: string) => void;
  profile: PublicRecruiterProfile;
  campaigns: PublicCampaignSummary[];
}) {
  return (
    <div className={styles.spaceY6}>
      <section>
        <SectionTitle>Featured Projects</SectionTitle>
        {campaigns.length > 0 ? (
          <div className={styles.projectScroll}>
            {campaigns.map((project, i) => (
              <article className={styles.projectCard} key={project._id}>
                <div>
                  <img
                    src={project.cover_image_url || fallbackImages[i % fallbackImages.length]}
                    alt={project.name}
                    loading="lazy"
                  />
                  <strong>{project.name}</strong>
                </div>
                <p>
                  {project.role_type || "Casting Call"}
                  {project.created_at && ` · ${new Date(project.created_at).getFullYear()}`}
                </p>
                <small>{project.location?.city || "Multiple Cities"}</small>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-4">No projects published yet.</p>
        )}
      </section>
      <Jobs go={go} condensed campaigns={campaigns} />
      <section>
        <SectionTitle>Our Casting Categories</SectionTitle>
        <div className={styles.categoryGrid}>
          {(
            profile.casting_categories ?? [
              "Actors",
              "Models",
              "Dancers",
              "Singers",
              "Child Artists",
              "Voice Over",
              "Influencers",
              "Crew",
            ]
          ).map((label, i) => {
            const CategoryIcon = categoryIcons[i % categoryIcons.length];
            return (
              <div
                key={`${label}-${i}`}
                className={`${styles.category} ${styles[`category${i % 4}`]}`}
              >
                <CategoryIcon />
                <span>{label}</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Jobs({
  go,
  condensed = false,
  campaigns,
}: {
  go: (tab: string) => void;
  condensed?: boolean;
  campaigns?: PublicCampaignSummary[];
}) {
  const [saved, setSaved] = useState<number[]>([]);
  const [applied, setApplied] = useState<number[]>([]);

  const displayJobs =
    campaigns && campaigns.length > 0
      ? campaigns.map((c, i) => ({
          title: c.name,
          tags: [
            c.role_type || "Open Role",
            c.location?.city || "Multiple Cities",
            c.budget_range?.currency
              ? `${c.budget_range.currency} ${c.budget_range.min ?? ""}-${c.budget_range.max ?? ""}`
              : "Competitive",
          ],
          meta: [c.role_type || "Casting Call", relativeTime(c.created_at)].filter(Boolean).join("   ·   "),
          date: c.deadline
            ? `Apply by ${new Date(c.deadline).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}`
            : "Open until filled",
          image: c.cover_image_url || fallbackImages[i % fallbackImages.length],
          featured: i === 0,
        }))
      : [];

  if (displayJobs.length === 0) {
    return (
      <section>
        <SectionTitle onClick={condensed ? () => go("Jobs") : undefined}>
          Current Openings
        </SectionTitle>
        <p className="text-sm text-muted-foreground py-4">No active openings at the moment.</p>
      </section>
    );
  }

  return (
    <section>
      <SectionTitle onClick={condensed ? () => go("Jobs") : undefined}>
        Current Openings
      </SectionTitle>
      <div className={styles.spaceY3}>
        {displayJobs.map((job, index) => (
          <article className={styles.jobCard} key={`${job.title}-${index}`}>
            <img src={job.image} alt="Casting candidate" loading="lazy" />
            <div className="min-w-0 flex-1">
              <div className={styles.jobHeading}>
                <div>
                  {job.featured && <span>FEATURED</span>}
                  <h3>{job.title}</h3>
                </div>
                <button
                  onClick={() =>
                    setSaved((items) =>
                      items.includes(index)
                        ? items.filter((i) => i !== index)
                        : [...items, index]
                    )
                  }
                  aria-label="Save casting call"
                >
                  <Bookmark
                    size={17}
                    fill={saved.includes(index) ? "currentColor" : "none"}
                  />
                </button>
              </div>
              <div className={styles.tagRow}>
                {job.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <p>
                <Clapperboard size={13} />
                {job.meta}
              </p>
              <p>
                <Clock3 size={13} />
                {job.date}
              </p>
              <button
                className={styles.applyButton}
                onClick={() => setApplied((items) => [...items, index])}
              >
                {applied.includes(index) ? (
                  <>
                    <Check size={15} /> Applied
                  </>
                ) : (
                  "Apply Now"
                )}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Team({ profile, team }: { profile: PublicRecruiterProfile; team: PublicTeamMember[] }) {
  const values =
    profile.team_values?.map((v, i) => [valueIcons[i % valueIcons.length], v.title, v.description] as const) ??
    ([
      [Star, "Fresh Talent", "New Faces Welcome"],
      [Users, "Diversity", "All Backgrounds"],
      [Gem, "Unique Looks", "Stand Out"],
      [Clapperboard, "Strong Performers", "On Screen Presence"],
      [MapPin, "Regional Talent", "Pan India"],
      [Crown, "Professionalism", "Reliable & Committed"],
    ] as const);

  return (
    <div className={styles.spaceY6}>
      <section>
        <SectionTitle>Our Team</SectionTitle>
        {team.length > 0 ? (
          <div className={styles.teamGrid}>
            {team.map((member) => (
              <article key={member._id}>
                {member.photo ? (
                  <img src={member.photo} alt={member.name} loading="lazy" />
                ) : (
                  <div className="size-20 rounded-full bg-muted flex items-center justify-center text-lg font-semibold">
                    {getInitials(member.name)}
                  </div>
                )}
                <strong>{member.name}</strong>
                <small>{member.role}</small>
                {member.linkedin_url && (
                  <a
                    href={member.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${member.name} on LinkedIn`}
                  >
                    <LinkedInLogo size={11} />
                  </a>
                )}
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-4">No team members added yet.</p>
        )}
      </section>
      <section>
        <SectionTitle>What We Look For</SectionTitle>
        <div className={styles.valuesGrid}>
          {values.map(([Icon, title, copy], i) => {
            const ValueIcon = Icon as typeof Star;
            return (
              <div className={`${styles.value} ${styles[`value${i % 3}`]}`} key={title as string}>
                <ValueIcon />
                <strong>{title as string}</strong>
                <small>{copy as string}</small>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Reviews({
  profile,
  reviews,
  totalReviews,
  averageRating,
}: {
  profile: PublicRecruiterProfile;
  reviews: PublicReview[];
  totalReviews: number;
  averageRating: number;
}) {
  function renderStars(rating: number) {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className={styles.spaceY6}>
      <section>
        <SectionTitle>
          Reviews
          {totalReviews > 0 && (
            <span className="text-sm font-normal text-muted-foreground ml-2">
              {averageRating > 0 && `${averageRating.toFixed(1)} · `}{totalReviews} review{totalReviews !== 1 ? "s" : ""}
            </span>
          )}
        </SectionTitle>
        <div className={styles.spaceY4}>
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <article className={styles.review} key={review._id}>
                <div className={styles.reviewHead}>
                  {review.author_photo ? (
                    <img src={review.author_photo} alt={review.author_name} loading="lazy" />
                  ) : (
                    <div className="size-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
                      {getInitials(review.author_name)}
                    </div>
                  )}
                  <div>
                    <strong>{review.author_name}</strong>
                    <small>{review.author_role || "Talent"}</small>
                  </div>
                  <time>{formatDate(review.created_at)}</time>
                </div>
                <div className={styles.stars}>{renderStars(review.rating)}</div>
                <p>{review.content}</p>
              </article>
            ))
          ) : (
            <p className="text-sm text-muted-foreground py-4">No reviews yet.</p>
          )}
        </div>
      </section>
      <section className={styles.ctaBanner}>
        <img src={profile.cta_image_url || castingHero} alt="Film director on set" loading="lazy" />
        <div>
          {(() => {
            const words = (profile.cta_headline || "Let&rsquo;s Create Great Stories Together").split(" ");
            const mid = Math.ceil(words.length / 2);
            return (
              <h2>
                {words.slice(0, mid).join(" ")}
                <br />
                {words.slice(mid).join(" ")}
              </h2>
            );
          })()}
          <p>{profile.cta_subheadline || "Get in touch for collaborations and talent requirements."}</p>
          <div>
            <button>
              <Send size={15} />
              Message Agency
            </button>
            <button>
              <Share2 size={15} />
              Visit Website
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function PublicRecruiterProfilePage() {
  const params = useParams();
  const slug = (params?.slug as string) || "";

  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = usePublicRecruiterProfile(slug);
  const { data: campaignsData, isLoading: campaignsLoading } =
    usePublicRecruiterCampaigns(slug, 50);
  const { data: teamData } = usePublicRecruiterTeam(slug);
  const { data: reviewsData } = usePublicRecruiterReviews(slug);

  const { isSaved: followed, toggleSave: toggleFollow } = useSaveRecruiter(slug);
  const { start: startConversation, isPending: messagePending } = useStartConversation(slug, "recruiter");
  const { status: connectionStatus, isPending: connectPending, send: sendConnection } = useConnectionRequest(profile?.user_id || "");

  const [active, setActive] = useState("Overview");
  const [notice, setNotice] = useState("");
  const [moreOpen, setMoreOpen] = useState(false);
  const moreWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!moreOpen) return;
    const close = (e: MouseEvent) => {
      if (moreWrapRef.current && !moreWrapRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [moreOpen]);

  const go = (tab: string) => {
    setActive(tab);
    window.scrollTo({ top: 420, behavior: "smooth" });
  };
  const notify = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2200);
  };

  const copyProfileLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      notify("Link copied");
    } catch {
      notify("Couldn't copy link");
    }
  };

  const handleShare = async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: profile?.company_name ?? "ConnectMe",
          text:
            profile?.headline ??
            (profile ? `Check out ${profile.company_name} on ConnectMe` : ""),
          url: window.location.href,
        });
        return;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
      }
    }
    await copyProfileLink();
  };

  const isLoading = profileLoading || campaignsLoading;

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (profileError || !profile) {
    return <ProfileNotFound slug={slug} />;
  }

  const campaigns = campaignsData?.data ?? [];
  const team = teamData ?? [];
  const reviews = reviewsData?.data ?? [];
  const totalReviews = reviewsData?.total ?? profile.total_reviews_count ?? 0;
  const averageRating = profile.average_rating ?? 0;
  const location = formatLocation(profile.location);

  const stats = [
    { icon: <Star size={19} fill="currentColor" />, value: `${profile.trust_score}%`, label: "Trust score" },
    { icon: <Users size={19} />, value: String(profile.active_campaigns_count), label: "Active jobs" },
    { icon: <Clapperboard size={19} />, value: `Tier ${profile.verification_tier}`, label: "Verified" },
    { icon: <Trophy size={19} />, value: profile.company_size || "—", label: "Company size" },
  ];

  const socials: { key: string; label: string; url: string; icon: ReactNode }[] = [
    { key: "instagram", label: "Instagram", url: profile.instagram_url ?? "", icon: <InstagramLogo /> },
    { key: "linkedin", label: "LinkedIn", url: profile.linkedin_company_url ?? "", icon: <LinkedInLogo /> },
    { key: "youtube", label: "YouTube", url: profile.youtube_url ?? "", icon: <YouTubeLogo /> },
    { key: "x", label: "X", url: profile.x_url ?? "", icon: <XIcon /> },
    { key: "website", label: "Web", url: profile.company_website ?? "", icon: <Globe size={18} /> },
  ]
    .map((s) => ({ ...s, url: normalizeUrl(s.url) ?? "" }))
    .filter((s) => s.url.length > 0);

  return (
    <main className={styles.pageShell}>
      <div className={styles.phoneCanvas}>
        <section className={styles.heroPanel}>
          <button
            onClick={() => window.history.back()}
            className={`${styles.iconButtonDark} absolute left-4 top-4 z-20`}
            style={{ color: "#fff" }}
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
          <img
            src={profile.banner_image_url || castingHero}
            alt={`${profile.company_name} cover`}
            width={1200}
            height={912}
          />
          <div className={styles.heroOverlay} />
        </section>

        <section className={styles.profilePanel}>
          <div className={styles.brandRow}>
            <div className={styles.agencyLogo}>
              {profile.profile_photo ? (
                <img
                  src={profile.profile_photo}
                  alt={profile.company_name}
                  className="size-full rounded-full object-cover"
                />
              ) : (
                <>
                  <span>{getInitials(profile.company_name)}</span>
                  <small>RECRUITER</small>
                </>
              )}
            </div>
            <div className="min-w-0">
              <h1>
                {profile.company_name} <span>●</span>
              </h1>
              <p>
                {profile.position || "Recruiter"}
                {location && <>&nbsp; · &nbsp;{location}</>}
              </p>
            </div>
          </div>

          <h2>
            {profile.headline || "Real People. Real Stories. Extraordinary Talent."}
          </h2>

          <div className={styles.statsRow}>
            {stats.map((s) => (
              <Stat key={s.label} icon={s.icon} value={s.value} label={s.label} />
            ))}
          </div>

          <div className={styles.primaryRow}>
            <button
              className={styles.primaryAction}
              onClick={sendConnection}
              disabled={connectPending || connectionStatus === "connected" || connectionStatus === "pending"}
            >
              {connectionStatus === "connected" ? (
                <>
                  <Check size={16} /> Connected
                </>
              ) : connectionStatus === "pending" ? (
                "Pending"
              ) : (
                <>
                  <UserPlus size={16} /> Connect
                </>
              )}
            </button>
            <button
              className={styles.secondaryAction}
              onClick={startConversation}
              disabled={messagePending}
            >
              <Send size={16} />
              {messagePending ? "Starting..." : "Message"}
            </button>
          </div>

          <div className={styles.secondaryRow}>
            <button
              className={`${styles.ghostAction} ${followed ? styles.on : ""}`}
              onClick={toggleFollow}
            >
              <Heart size={14} fill={followed ? "currentColor" : "none"} />
              {followed ? "Following" : "Follow"}
            </button>
            <button className={styles.ghostAction} onClick={() => void handleShare()}>
              <Share2 size={14} />
              Share
            </button>
            <div className={styles.moreWrap} ref={moreWrapRef}>
              <button
                className={styles.moreAction}
                aria-label="More profile actions"
                aria-expanded={moreOpen}
                aria-haspopup="menu"
                onClick={() => setMoreOpen((v) => !v)}
              >
                <MoreHorizontal size={18} />
              </button>
              {moreOpen && (
                <div className={styles.moreMenu} role="menu">
                  <button
                    role="menuitem"
                    onClick={() => {
                      setMoreOpen(false);
                      void copyProfileLink();
                    }}
                  >
                    <Copy size={13} />
                    Copy profile link
                  </button>
                </div>
              )}
            </div>
          </div>

          {socials.length > 0 && (
            <>
              <div className={styles.divider} />
              <div className={styles.socialRow}>
                {socials.map((s) => (
                  <a
                    key={s.key}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                    aria-label={`${profile.company_name} on ${s.label}`}
                  >
                    {s.icon}
                    <span>{s.label}</span>
                  </a>
                ))}
              </div>
            </>
          )}

          <button
            className={styles.followers}
            onClick={() => notify(`${profile.total_talents_count}+ talent community`)}
          >
            <span className={styles.avatarStack}>
              <img src={fallbackImages[0]} alt="" />
              <img src={fallbackImages[1]} alt="" />
              <img src={fallbackImages[2]} alt="" />
            </span>
            <span>
              Followed by <strong>{profile.total_talents_count}+ talents</strong>
            </span>
            <ChevronRight size={17} />
          </button>
        </section>

        <nav className={styles.tabBar} aria-label="Agency sections">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={active === tab ? styles.active : ""}
              onClick={() => setActive(tab)}
            >
              {tab}
              {tab === "Jobs" && <span>{campaigns.length}</span>}
            </button>
          ))}
        </nav>

        <div className={styles.contentPanel}>
          {active === "Overview" && (
            <Overview go={go} profile={profile} campaigns={campaigns} />
          )}
          {active === "Projects" && <Projects go={go} profile={profile} campaigns={campaigns} />}
          {active === "Jobs" && <Jobs go={go} campaigns={campaigns} />}
          {active === "Team" && <Team profile={profile} team={team} />}
          {active === "Reviews" && (
            <Reviews
              profile={profile}
              reviews={reviews}
              totalReviews={totalReviews}
              averageRating={averageRating}
            />
          )}
        </div>

        {notice && (
          <div className={styles.toast}>
            <MessageCircle size={16} />
            {notice}
          </div>
        )}
      </div>
    </main>
  );
}
