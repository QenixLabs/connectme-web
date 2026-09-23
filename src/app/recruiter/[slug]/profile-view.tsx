"use client";

import {
  ArrowLeft,
  ArrowUpRight,
  Award,
  BarChart3,
  BadgeCheck,
  Bookmark,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronRight,
  Clapperboard,
  Clock3,
  Crown,
  Gem,
  Globe,
  Heart,
  MapPin,
  MessageCircle,
  MessageSquareText,
  Mic2,
  MoreHorizontal,
  Music2,
  Play,
  Quote,
  Send,
  ShieldCheck,
  Share2,
  Sparkles,
  Star,
  Trophy,
  UserPlus,
  Users,
  WalletCards,
} from "lucide-react";
import { siInstagram, siX, siYoutube } from "simple-icons/icons";
import { useState } from "react";
import type { ReactNode } from "react";
import { relativeTime } from "@/lib/utils";
import type {
  PublicRecruiterProfile,
  PublicCampaignSummary,
  PublicTeamMember,
  PublicReview,
} from "@/lib/api/recruiter";
import type { SubmitRecruiterReviewPayload } from "@/lib/api/recruiter";
import styles from "./page.module.css";

export const castingHero = "/images/casting/casting-hero.jpg";

export const fallbackImages = [
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

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function formatLocation(location?: PublicRecruiterProfile["location"]): string | null {
  if (!location) return null;
  return [location.city, location.state, location.country].filter(Boolean).join(", ") || null;
}

export function normalizeUrl(url?: string): string | null {
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

export function InstagramLogo({ size = 18 }: { size?: number }) {
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

export function LinkedInLogo({ size = 18 }: { size?: number }) {
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

export function YouTubeLogo({ size = 18 }: { size?: number }) {
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

export function XIcon({ size = 18 }: { size?: number }) {
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
  action,
}: {
  children: React.ReactNode;
  onClick?: (() => void) | undefined;
  icon?: React.ReactNode;
  action?: React.ReactNode;
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
      {action}
    </div>
  );
}

export function Overview({
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

export function Projects({
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

export function Jobs({
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

export function Team({ profile, team }: { profile: PublicRecruiterProfile; team: PublicTeamMember[] }) {
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

export function Reviews({
  go,
  profile,
  campaigns = [],
  reviews,
  totalReviews,
  averageRating,
  verifiedReviews,
  hasMoreReviews,
  loadingMoreReviews,
  onLoadMoreReviews,
  reviewCampaigns = [],
  reviewPending = false,
  onSubmitReview,
}: {
  go: (tab: string) => void;
  profile: PublicRecruiterProfile;
  campaigns?: PublicCampaignSummary[];
  reviews: PublicReview[];
  totalReviews: number;
  averageRating: number;
  verifiedReviews: number;
  hasMoreReviews: boolean;
  loadingMoreReviews: boolean;
  onLoadMoreReviews?: () => void;
  reviewCampaigns?: { _id: string; name: string }[];
  reviewPending?: boolean;
  onSubmitReview?: (payload: SubmitRecruiterReviewPayload) => Promise<void>;
}) {
  const [composerOpen, setComposerOpen] = useState(false);
  const [campaignId, setCampaignId] = useState(reviewCampaigns[0]?._id ?? "");
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [showAllReviews, setShowAllReviews] = useState(false);

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  const roundedRating = averageRating > 0 ? averageRating.toFixed(1) : null;
  const positiveRating = averageRating > 0 ? Math.round((averageRating / 5) * 100) : null;
  const isVerified = profile.verification_status !== "pending";
  const isTrustedPartner = profile.verification_status === "trusted_partner";
  const categoryRows = [
    { name: "Communication", Icon: MessageCircle },
    { name: "Professionalism", Icon: BriefcaseBusiness },
    { name: "Payment Reliability", Icon: WalletCards },
    { name: "Project Experience", Icon: Clapperboard },
  ];
  const earnedBadges = [
    ...(isVerified
      ? [{ icon: <BadgeCheck size={18} />, title: "Verified Recruiter", copy: "Identity verified" }]
      : []),
    ...(isTrustedPartner
      ? [{ icon: <Award size={18} />, title: "Preferred Partner", copy: "RootIn partner status confirmed" }]
      : []),
  ];

  return (
    <div className={styles.reputationPage}>
      <section className={styles.reputationIntro}>
        <div>
          <p className={styles.eyebrow}>Reputation</p>
          <h2><span className={styles.reputationTitleIcon}><Award size={18} /></span>Recruiter Reputation</h2>
          <p>See what talent you&apos;ve worked with says about your agency.</p>
        </div>
        {reviewCampaigns.length > 0 && onSubmitReview && (
          <button
            className={styles.writeReviewButton}
            type="button"
            onClick={() => {
              if (!reviewCampaigns.some((campaign) => campaign._id === campaignId)) {
                setCampaignId(reviewCampaigns[0]._id);
              }
              setComposerOpen((open) => !open);
            }}
          >
            <Star size={16} />
            {composerOpen ? "Close" : "Write a review"}
          </button>
        )}
      </section>

      <section className={styles.ratingSummaryCard}>
        <div className={styles.ratingHeroMain}>
          <div>
            <p className={styles.cardKicker}>Overall rating</p>
            <div className={styles.overallRatingLine}>
              <strong className={styles.overallRating}>{roundedRating ?? "—"}</strong>
              <span>/ 5</span>
            </div>
            <div className={styles.ratingStars} aria-label={roundedRating ? `${roundedRating} out of 5 stars` : "No rating yet"}>
              <RatingStars rating={averageRating} />
            </div>
            <p className={styles.ratingMeta}>
              {totalReviews > 0
                ? `Based on ${totalReviews} talent review${totalReviews === 1 ? "" : "s"}`
                : "Reviews from talent will appear here"}
            </p>
          </div>
          <div
            className={styles.ratingRing}
            style={{ background: `conic-gradient(var(--primary) ${positiveRating ?? 0}%, color-mix(in oklab, var(--primary) 12%, white) 0)` }}
            aria-label={positiveRating ? `${positiveRating}% positive rating` : "No positive rating yet"}
          >
            <div>
              <strong>{positiveRating ? `${positiveRating}%` : "—"}</strong>
              <small>Positive rating</small>
            </div>
          </div>
        </div>
        <div className={`${styles.ratingSummaryNote} ${!isVerified ? styles.ratingSummaryNotePending : ""}`}>
          <span className={styles.trustStripIcon}><ShieldCheck size={16} /></span>
          <span>
            <strong>{isVerified ? "Verified Recruiter" : "Verification in progress"}</strong>
            <small>{isVerified ? "Identity & business verified" : "Verification is still being reviewed"}</small>
          </span>
        </div>
      </section>

      <section className={styles.categoryRatings}>
        <div className={styles.reputationSectionHeading}>
          <div>
            <h3><span className={styles.sectionHeadingIcon}><BarChart3 size={16} /></span>Category Ratings</h3>
            <p>Based on ratings submitted by talent</p>
          </div>
        </div>
        <div className={styles.categoryList}>
          {categoryRows.map(({ name, Icon }) => (
            <div className={styles.categoryRatingRow} key={name}>
              <span className={styles.categoryIcon}><Icon size={16} /></span>
              <strong>{name}</strong>
              <div className={styles.categoryRatingValue}>
                <span className={styles.categoryUnavailable}>Not enough ratings</span>
                <span className={styles.categoryTrack}><span /></span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className={styles.reputationSectionHeading}>
          <div>
            <p className={styles.eyebrow}>At a glance</p>
            <h3>Reputation Stats</h3>
          </div>
        </div>
        <div className={styles.reputationStats}>
          <ReputationStat icon={<Clapperboard size={17} />} value={String(profile.completed_campaigns_count)} label="Completed Projects" />
          <ReputationStat icon={<Users size={17} />} value={String(profile.total_talents_count)} label="Talents Worked With" />
          <ReputationStat icon={<Star size={17} />} value={roundedRating ?? "—"} label="Average Rating" />
          <ReputationStat icon={<BadgeCheck size={17} />} value={String(verifiedReviews)} label="Verified Reviews" />
        </div>
      </section>

      <section className={styles.reviewsSection}>
        <div className={styles.reputationSectionHeading}>
          <div>
            <p className={styles.eyebrow}>Talent feedback</p>
            <h3>Talent Reviews</h3>
          </div>
          {totalReviews > 0 && <span className={styles.reviewCount}>{totalReviews} review{totalReviews === 1 ? "" : "s"}</span>}
        </div>
        {composerOpen && onSubmitReview && (
          <form
            className={styles.reviewComposer}
            onSubmit={(event) => {
              event.preventDefault();
              if (!campaignId || !rating || content.trim().length < 10) return;
              void onSubmitReview({
                rating,
                content: content.trim(),
                campaign_id: campaignId,
              }).then(() => {
                setComposerOpen(false);
                setRating(0);
                setContent("");
              }).catch(() => undefined);
            }}
          >
            <div>
              <label htmlFor="review-campaign">Which campaign did you apply for?</label>
              <select
                id="review-campaign"
                value={campaignId}
                onChange={(event) => setCampaignId(event.target.value)}
                disabled={reviewPending}
              >
                {reviewCampaigns.map((campaign) => (
                  <option key={campaign._id} value={campaign._id}>
                    {campaign.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <span className={styles.reviewComposerLabel}>Your rating</span>
              <div className={styles.ratingPicker} aria-label="Choose a rating">
                {Array.from({ length: 5 }, (_, index) => {
                  const value = index + 1;
                  return (
                    <button
                      key={value}
                      type="button"
                      className={value <= rating ? styles.ratingSelected : ""}
                      aria-label={`${value} star${value === 1 ? "" : "s"}`}
                      aria-pressed={value === rating}
                      onClick={() => setRating(value)}
                      disabled={reviewPending}
                    >
                      <Star size={18} fill="currentColor" />
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label htmlFor="review-content">Tell other talent about your experience</label>
              <textarea
                id="review-content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="What stood out about working with this recruiter?"
                minLength={10}
                maxLength={1000}
                rows={4}
                disabled={reviewPending}
                required
              />
            </div>
            <button
              className={styles.submitReviewButton}
              type="submit"
              disabled={reviewPending || !rating || content.trim().length < 10}
            >
              {reviewPending ? "Submitting..." : "Submit review"}
            </button>
          </form>
        )}
        <div className={styles.reviewList}>
          {reviews.length > 0 ? (
            reviews.slice(0, showAllReviews ? undefined : 2).map((review) => (
              <article className={styles.reviewCard} key={review._id}>
                <div className={styles.reviewHead}>
                  {review.author_photo ? (
                    <img
                      className={styles.reviewAvatar}
                      src={review.author_photo}
                      alt={review.author_name}
                      loading="lazy"
                    />
                  ) : (
                    <div className={styles.reviewAvatarFallback}>
                      {getInitials(review.author_name)}
                    </div>
                  )}
                  <div className={styles.reviewIdentity}>
                    <strong>{review.author_name} {review.is_verified && <BadgeCheck size={14} />}</strong>
                    <small>{review.author_role || "Talent"}</small>
                  </div>
                  <div className={styles.reviewRating}><RatingStars rating={review.rating} /><strong>{review.rating.toFixed(1)} <span>★</span></strong></div>
                </div>
                <div className={styles.reviewProject}>
                  <BriefcaseBusiness size={13} />
                  <span>{review.campaign_name || campaigns.find((campaign) => campaign._id === review.campaign_id)?.name || "Project review"}</span>
                </div>
                <div className={styles.reviewQuote}>
                  <Quote size={20} />
                  <p>{review.content}</p>
                </div>
                <div className={styles.reviewFooter}>
                  <time><CalendarDays size={13} />{formatDate(review.created_at)}</time>
                  {review.is_verified && <span><BadgeCheck size={13} /> Verified Talent</span>}
                </div>
              </article>
            ))
          ) : (
            <div className={styles.emptyReviews}>
              <MessageCircle size={18} />
              <p>No reviews yet. Talent feedback will appear here after approved reviews are published.</p>
            </div>
          )}
        </div>
        {!showAllReviews && totalReviews > 0 && (
          <button
            className={styles.viewAllReviews}
            type="button"
            onClick={() => {
              setShowAllReviews(true);
              if (hasMoreReviews && onLoadMoreReviews) void onLoadMoreReviews();
            }}
            disabled={loadingMoreReviews}
          >
            <MessageSquareText size={16} />
            {loadingMoreReviews ? "Loading reviews..." : `View all ${totalReviews} review${totalReviews === 1 ? "" : "s"}`}
            {!loadingMoreReviews && <ArrowUpRight size={15} />}
          </button>
        )}
      </section>

      <section>
        <div className={styles.reputationSectionHeading}>
          <div><p className={styles.eyebrow}>Earned recognition</p><h3>Trust Badges</h3></div>
        </div>
        {earnedBadges.length > 0 ? (
          <div className={styles.badgeGrid}>
            {earnedBadges.map((badge) => (
              <div className={styles.badgeCard} key={badge.title}>
                <span>{badge.icon}</span>
                <div>
                  <strong>{badge.title}</strong>
                  <small>{badge.copy}</small>
                </div>
              </div>
            ))}
          </div>
        ) : <p className={styles.emptySection}>No trust badges have been earned yet.</p>}
      </section>

      <section>
        <div className={styles.reputationSectionHeading}>
          <div><p className={styles.eyebrow}>Work in view</p><h3>Featured Projects</h3></div>
          {campaigns.length > 0 && <button className={styles.sectionAction} type="button" onClick={() => go("Projects")}>View All <ArrowUpRight size={13} /></button>}
        </div>
        {campaigns.length > 0 ? (
          <div className={styles.reputationProjectScroll}>
            {campaigns.slice(0, 5).map((project, index) => (
              <a className={styles.reputationProjectCard} href={`/recruiter/campaigns/${project._id}`} key={project._id}>
                <img
                  src={project.cover_image_url || fallbackImages[index % fallbackImages.length]}
                  alt={project.name}
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = fallbackImages[index % fallbackImages.length];
                  }}
                />
                <strong>{project.name}</strong>
                <small>{project.role_type || "Project"} · {project.applications_count} talents</small>
              </a>
            ))}
          </div>
        ) : <p className={styles.emptySection}>No public projects yet.</p>}
      </section>

      <section className={styles.reputationCta}>
        <span className={styles.reputationIcon}><Trophy size={20} /></span>
        <div><strong>Build an Even Stronger Reputation</strong><p>Complete successful projects and earn reviews from talent.</p></div>
        <ArrowUpRight size={18} />
      </section>
    </div>
  );
}

function RatingStars({ rating }: { rating: number }) {
  return <span className={styles.ratingStars} aria-hidden="true">{Array.from({ length: 5 }, (_, index) => <Star key={index} size={14} fill={index < Math.round(rating) ? "currentColor" : "none"} />)}</span>;
}

function ReputationStat({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return <div className={styles.reputationStat}><span className={styles.reputationStatIcon}>{icon}</span><strong>{value}</strong><small>{label}</small></div>;
}

/** Inert Connect/Message/Follow/Share row for read-only previews. */
export function InertPreviewActions() {
  return (
    <>
      <div className={styles.primaryRow}>
        <button className={styles.primaryAction} disabled aria-label="Connect (preview)">
          <UserPlus size={16} /> Connect
        </button>
        <button className={styles.secondaryAction} disabled aria-label="Message (preview)">
          <Send size={16} />
          Message
        </button>
      </div>

      <div className={styles.secondaryRow}>
        <button className={styles.ghostAction} disabled aria-label="Follow (preview)">
          <Heart size={14} fill="none" />
          Follow
        </button>
        <button className={styles.ghostAction} disabled aria-label="Share (preview)">
          <Share2 size={14} />
          Share
        </button>
        <div className={styles.moreWrap}>
          <button className={styles.moreAction} disabled aria-label="More profile actions (preview)">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>
    </>
  );
}

export interface RecruiterProfileViewProps {
  profile: PublicRecruiterProfile;
  campaigns?: PublicCampaignSummary[];
  team?: PublicTeamMember[];
  reviews?: PublicReview[];
  totalReviews?: number;
  averageRating?: number;
  verifiedReviews?: number;
  hasMoreReviews?: boolean;
  loadingMoreReviews?: boolean;
  onLoadMoreReviews?: () => void;
  reviewCampaigns?: { _id: string; name: string }[];
  reviewPending?: boolean;
  onSubmitReview?: (payload: SubmitRecruiterReviewPayload) => Promise<void>;
  /** Connect/Message/Follow/Share rows. Defaults to inert preview buttons. */
  actions?: ReactNode;
  /** When provided, a back button is rendered in the hero. */
  onBack?: () => void;
  /** Scroll to tabs when switching (public page). Off in previews. */
  scrollOnTabChange?: boolean;
}

/** Full public-profile canvas (hero, stats, socials, tabs). Single source of truth. */
export function RecruiterProfileView({
  profile,
  campaigns = [],
  team = [],
  reviews = [],
  totalReviews,
  averageRating,
  verifiedReviews = 0,
  hasMoreReviews = false,
  loadingMoreReviews = false,
  onLoadMoreReviews,
  reviewCampaigns = [],
  reviewPending = false,
  onSubmitReview,
  actions,
  onBack,
  scrollOnTabChange = false,
}: RecruiterProfileViewProps) {
  const [active, setActive] = useState("Overview");
  const [notice, setNotice] = useState("");

  const go = (tab: string) => {
    setActive(tab);
    if (scrollOnTabChange) {
      window.scrollTo({ top: 420, behavior: "smooth" });
    }
  };
  const notify = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2200);
  };

  const resolvedTotalReviews = totalReviews ?? profile.total_reviews_count ?? 0;
  const resolvedAverageRating = averageRating ?? profile.average_rating ?? 0;
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
          {onBack && (
            <button
              onClick={onBack}
              className={`${styles.iconButtonDark} absolute left-4 top-4 z-20`}
              style={{ color: "#fff" }}
              aria-label="Go back"
            >
              <ArrowLeft size={20} />
            </button>
          )}
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

          {actions ?? <InertPreviewActions />}

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
              onClick={() => go(tab)}
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
              go={go}
              profile={profile}
              campaigns={campaigns}
              reviews={reviews}
              totalReviews={resolvedTotalReviews}
              averageRating={resolvedAverageRating}
              verifiedReviews={verifiedReviews}
              hasMoreReviews={hasMoreReviews}
              loadingMoreReviews={loadingMoreReviews}
              onLoadMoreReviews={onLoadMoreReviews}
              reviewCampaigns={reviewCampaigns}
              reviewPending={reviewPending}
              onSubmitReview={onSubmitReview}
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
