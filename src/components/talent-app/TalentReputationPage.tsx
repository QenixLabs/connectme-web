"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart3,
  BadgeCheck,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  Copy,
  ExternalLink,
  Info,
  MapPin,
  MessageCircle,
  Quote,
  Share2,
  ShieldCheck,
  Star,
  Trophy,
  Video,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useMyProfile,
  useMyReputation,
  useTalentCredits,
  useTalentTestimonials,
} from "@/hooks/use-talent-profile";
import type { Credit, TalentProfile, TalentReputation, Testimonial } from "@/lib/api/talent";
import { formatLocation, formatRelativeTime } from "@/components/talent-profile/data";

const PAGE_BG = "var(--background)";
const TEXT = "var(--foreground)";
const MUTED = "var(--muted-foreground)";
const BORDER = "var(--border)";

function ReputationSkeleton() {
  return (
    <div className="reputation-page-theme mx-auto max-w-7xl space-y-5 px-4 pb-28 pt-5 sm:px-6 lg:px-8">
      <Skeleton className="h-52 rounded-[28px] bg-[#F1EAFF]" />
      <Skeleton className="h-48 rounded-[24px] bg-white" />
      <div className="grid gap-5 lg:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.7fr)]">
        <Skeleton className="h-72 rounded-[24px] bg-white" />
        <Skeleton className="h-72 rounded-[24px] bg-white" />
      </div>
      <Skeleton className="h-36 rounded-[24px] bg-white" />
    </div>
  );
}

function ReputationError() {
  return (
    <main className="reputation-page-theme mx-auto flex min-h-[70vh] max-w-lg items-center px-4 py-12 text-center">
      <div className="w-full rounded-[28px] border border-[#E7E5F4] bg-white p-8 shadow-[0_12px_40px_rgba(77,52,155,0.07)]">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#FFF0F3] text-[#D94C70]">
          <Info className="size-6" />
        </div>
        <h1 className="mt-4 text-xl font-bold text-[#12143A]">We couldn&apos;t load your reputation</h1>
        <p className="mt-2 text-sm text-[#62678A]">Please try again in a moment.</p>
        <Button className="mt-6 rounded-xl bg-[#6428F5] hover:bg-[#5420D7]" onClick={() => window.location.reload()}>
          Try again
        </Button>
      </div>
    </main>
  );
}

function getDisplayName(profile: TalentProfile) {
  return profile.professional_name || profile.full_legal_name || profile.username;
}

function getRootRating(trustScore: number) {
  return trustScore > 5 ? trustScore / 20 : trustScore;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function StarRating({ rating, compact = false }: { rating: number | null | undefined; compact?: boolean }) {
  if (rating == null) {
    return <span className="text-xs text-[#8A8EAC]">No rating</span>;
  }

  return (
    <span className={`inline-flex items-center gap-0.5 text-[#F4A900] ${compact ? "text-xs" : "text-sm"}`} aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star key={index} className={`size-3.5 ${index < Math.round(rating) ? "fill-current" : ""}`} />
      ))}
    </span>
  );
}

function SectionHeading({
  title,
  count,
  action,
}: {
  title: string;
  count?: number;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="flex min-w-0 items-center gap-2 text-[18px] font-bold tracking-[-0.02em] text-[#12143A] sm:text-xl">
        {title}
        {count !== undefined && <span className="text-sm font-medium text-[#6428F5]">({count})</span>}
      </h2>
      {action}
    </div>
  );
}

function Hero() {
  return (
    <section className="relative isolate min-h-[210px] overflow-hidden rounded-[28px] bg-[linear-gradient(110deg,#F4EEFF_0%,#FBFAFF_48%,#FFF3F7_100%)] px-5 py-7 sm:min-h-[230px] sm:px-8 sm:py-9">
      <div className="absolute -left-12 top-6 -z-10 size-40 rounded-full bg-[#D9C7FF]/40 blur-3xl" />
      <div className="absolute right-20 top-0 -z-10 size-48 rounded-full bg-[#FFD9E8]/45 blur-3xl" />
      <div className="relative z-10 max-w-[430px]">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#6428F5]">Your creative credibility</p>
        <h1 className="text-[30px] font-bold leading-[1.04] tracking-[-0.045em] text-[#12143A] sm:text-[40px]">
          Talent <span className="text-[#6428F5]">Reputation</span>
        </h1>
        <p className="mt-3 max-w-[260px] text-[15px] leading-6 text-[#62678A] sm:max-w-none sm:text-base">
          Your work speaks.<br />
          Your reputation opens doors.
        </p>
      </div>
      <Image
        src="/assets/talent-edit/talent-rep-header.png"
        alt="Film set representing talent reputation"
        width={700}
        height={400}
        className="pointer-events-none absolute -right-16 bottom-0 z-0 h-[205px] w-[76%] max-w-[620px] object-contain object-right-bottom sm:-right-5 sm:h-[245px] sm:w-[61%]"
      />
    </section>
  );
}

function ProfileSummary({ profile }: { profile: TalentProfile }) {
  const [shared, setShared] = useState(false);
  const name = getDisplayName(profile);
  const professions = profile.professions?.filter(Boolean) ?? [];
  const location = formatLocation(profile.location);
  const skills = [
    ...(profile.specialties ?? []),
    ...(profile.skills?.map((skill) => skill.name) ?? []),
  ].filter(Boolean);

  const handleShare = async () => {
    const url = `${window.location.origin}/talent/${profile.username}`;
    const nativeShare = navigator.share as ((data: ShareData) => Promise<void>) | undefined;
    try {
      if (nativeShare) {
        await nativeShare({ title: `${name} on RootIn`, url });
      } else {
        await navigator.clipboard.writeText(url);
      }
      setShared(true);
      toast.success(nativeShare ? "Profile shared" : "Profile link copied");
      window.setTimeout(() => setShared(false), 2000);
    } catch {
      // Closing the native share sheet is not an error.
    }
  };

  return (
    <section className="rounded-[24px] border bg-white p-4 shadow-[0_12px_40px_rgba(77,52,155,0.06)] sm:p-6" style={{ borderColor: BORDER }}>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          <Avatar className="size-[76px] shrink-0 border-4 border-[#F1EAFF] bg-[#F1EAFF] sm:size-[88px]">
            <AvatarImage src={profile.profile_photo} alt={`${name} profile photo`} />
            <AvatarFallback className="bg-[#EDE5FF] text-lg font-bold text-[#6428F5]">
              {name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 pt-0.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <h2 className="truncate text-xl font-bold tracking-[-0.03em] text-[#12143A] sm:text-2xl">{name}</h2>
              {profile.is_verified && <BadgeCheck className="size-5 shrink-0 fill-[#2379EF] text-white" aria-label="Verified talent" />}
            </div>
            <p className="mt-1 text-sm text-[#62678A]">{professions.length ? professions.join("  |  ") : "Creative professional"}</p>
            {location && (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-[#62678A]"><MapPin className="size-3.5 text-[#6428F5]" />{location}</p>
            )}
            {(profile.about || profile.headline) && (
              <p className="mt-2 line-clamp-2 text-sm italic leading-5 text-[#62678A]">“{profile.about || profile.headline}”</p>
            )}
          </div>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto lg:shrink-0">
          <Button variant="outline" asChild className="h-10 flex-1 rounded-xl border-[#6428F5] bg-white text-[#12143A] hover:bg-[#F7F3FF] sm:flex-none">
            <Link href={`/talent/${profile.username}`} target="_blank" rel="noreferrer">
              <ExternalLink className="size-4" />
              View Public Profile
            </Link>
          </Button>
          <Button onClick={handleShare} className="h-10 flex-1 rounded-xl bg-[#6428F5] text-white shadow-[0_8px_18px_rgba(100,40,245,0.2)] hover:bg-[#5420D7] sm:flex-none">
            {shared ? <Copy className="size-4" /> : <Share2 className="size-4" />}
            {shared ? "Copied" : "Share Profile"}
          </Button>
        </div>
      </div>
      {skills.length > 0 && (
        <div className="mt-5 flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {skills.slice(0, 8).map((skill) => (
            <span key={skill} className="shrink-0 rounded-full bg-[#F1EAFF] px-3 py-1.5 text-xs font-medium text-[#5420D7]">{skill}</span>
          ))}
        </div>
      )}
    </section>
  );
}

function RootScore({ scorePercent, rating }: { scorePercent: number; rating: number | null }) {
  const score = Math.min(5, Math.max(0, getRootRating(scorePercent)));
  const progress = score / 5;

  return (
    <section className="rounded-[24px] border bg-white p-5 shadow-[0_12px_40px_rgba(77,52,155,0.06)] sm:p-6" style={{ borderColor: BORDER }}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-[-0.03em] text-[#12143A]">RootScore</h2>
        <Info className="size-4 text-[#6428F5]" />
      </div>
      <div className="mt-4 flex items-center gap-5 sm:justify-center">
        <div className="relative size-[148px] shrink-0 sm:size-[168px]">
          <svg viewBox="0 0 168 168" className="size-full -rotate-90" aria-hidden="true">
            <defs>
              <linearGradient id="root-score-gradient" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#6428F5" />
                <stop offset="55%" stopColor="#E84AAB" />
                <stop offset="100%" stopColor="#F6B72E" />
              </linearGradient>
            </defs>
            <circle cx="84" cy="84" r="68" fill="none" stroke="#F1EAFF" strokeWidth="12" />
            <circle cx="84" cy="84" r="68" fill="none" stroke="url(#root-score-gradient)" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 68}`} strokeDashoffset={`${2 * Math.PI * 68 * (1 - progress)}`} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[42px] font-bold leading-none tracking-[-0.06em] text-[#12143A]">{score.toFixed(1)}</span>
            <span className="mt-1 text-xs text-[#62678A]">out of 5</span>
          </div>
        </div>
        <div className="min-w-0">
          <StarRating rating={rating} />
          <p className="mt-2 text-lg font-bold text-[#12143A]">{score >= 4.5 ? "Excellent" : score >= 3.5 ? "Strong" : score ? "Growing" : "Building"}</p>
          <p className="mt-1 max-w-[190px] text-sm leading-5 text-[#62678A]">Consistently delivers, builds trust and creates impact.</p>
        </div>
      </div>
    </section>
  );
}

type Highlight = {
  label: string;
  value: string;
  progress?: number;
  icon: typeof ShieldCheck;
  tone: string;
  iconBg: string;
  helper?: string;
};

function ReputationHighlights({ reputation }: { reputation: TalentReputation }) {
  const rootScore = getRootRating(reputation.root_score);
  const score = Math.round(Math.min(100, Math.max(0, rootScore * 20)));
  const highlights: Highlight[] = [
    { label: "RootScore", value: rootScore.toFixed(1), progress: score, icon: ShieldCheck, tone: "text-[#6428F5]", iconBg: "bg-[#F1EAFF]" },
    { label: "Average Rating", value: reputation.average_rating != null ? reputation.average_rating.toFixed(1) : "—", progress: reputation.average_rating != null ? reputation.average_rating * 20 : undefined, icon: Star, tone: "text-[#8B4DDE]", iconBg: "bg-[#F5ECFF]" },
    { label: "Verified Projects", value: String(reputation.verified_projects), icon: Trophy, tone: "text-[#D98A00]", iconBg: "bg-[#FFF7DF]", helper: "public or recruiter verified" },
    { label: "Positive Reviews", value: String(reputation.testimonial_count), icon: MessageCircle, tone: "text-[#E14E9C]", iconBg: "bg-[#FFF0F8]", helper: "approved testimonials" },
    { label: "Response Rate", value: reputation.response_rate != null ? `${Math.round(reputation.response_rate)}%` : "—", progress: reputation.response_rate ?? undefined, icon: BarChart3, tone: "text-[#3277E8]", iconBg: "bg-[#EAF2FF]", helper: reputation.response_rate == null ? "No invite data yet" : undefined },
    { label: "On-Time Delivery", value: reputation.on_time_delivery_rate != null ? `${Math.round(reputation.on_time_delivery_rate)}%` : "—", progress: reputation.on_time_delivery_rate ?? undefined, icon: CheckCircle2, tone: "text-[#0D9F8A]", iconBg: "bg-[#E7FBF7]", helper: reputation.on_time_delivery_rate == null ? "No task data yet" : undefined },
  ];

  return (
    <section className="rounded-[24px] border bg-white p-5 shadow-[0_12px_40px_rgba(77,52,155,0.06)] sm:p-6" style={{ borderColor: BORDER }}>
      <SectionHeading title="Reputation Highlights" />
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {highlights.map((highlight) => {
          const Icon = highlight.icon;
          return (
            <div key={highlight.label} className="min-w-0 rounded-2xl border border-[#EEEAF9] bg-[#FCFBFF] p-3 sm:p-3.5">
              <div className="flex items-start gap-2.5">
                <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${highlight.iconBg} ${highlight.tone}`}><Icon className="size-[18px]" /></span>
                <div className="min-w-0">
                  <p className="truncate text-xs text-[#62678A]">{highlight.label}</p>
                  <p className="mt-1 truncate text-xl font-bold tracking-[-0.04em] text-[#12143A]">{highlight.value}</p>
                </div>
              </div>
              {highlight.progress != null ? (
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#EEEAF9]">
                  <div className="h-full rounded-full bg-[linear-gradient(90deg,#6428F5,#A266F7)]" style={{ width: `${Math.max(0, Math.min(100, highlight.progress))}%` }} />
                </div>
              ) : highlight.helper ? <p className="mt-3 truncate text-[11px] text-[#8A8EAC]">{highlight.helper}</p> : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function TrustBadges({ reputation, profile }: { reputation: TalentReputation; profile: TalentProfile }) {
  const badges = [
    { title: "Verified Identity", text: reputation.is_verified ? "Government ID verified" : "Verification pending", icon: ShieldCheck, color: "text-[#6428F5]", bg: "bg-[#F1EAFF]" },
    { title: "Verified Projects", text: `${reputation.verified_projects} public or recruiter verified`, icon: Trophy, color: "text-[#D98A00]", bg: "bg-[#FFF7DF]" },
    { title: "Positive Reviews", text: reputation.average_rating != null ? `${reputation.average_rating.toFixed(1)}/5 average rating` : "No rated reviews yet", icon: Star, color: "text-[#E14E9C]", bg: "bg-[#FFF0F8]" },
    { title: "Profile Reach", text: `${profile.analytics?.profile_views_30d ?? 0} views in the last 30 days`, icon: BarChart3, color: "text-[#3277E8]", bg: "bg-[#EAF2FF]" },
  ];

  return (
    <section className="rounded-[24px] border bg-white p-5 shadow-[0_12px_40px_rgba(77,52,155,0.06)] sm:p-6" style={{ borderColor: BORDER }}>
      <SectionHeading title="Trust Badges" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {badges.map(({ title, text, icon: Icon, color, bg }) => (
          <div key={title} className="flex min-w-0 items-start gap-2.5 rounded-2xl border border-[#EEEAF9] bg-[#FCFBFF] p-3">
            <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${bg} ${color}`}><Icon className="size-5" /></span>
            <div className="min-w-0">
              <p className="text-xs font-bold leading-4 text-[#12143A]">{title}</p>
              <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-[#62678A]">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const initials = testimonial.author_name.slice(0, 2).toUpperCase();
  const isVerified = testimonial.verification_status === "public_record" || testimonial.verification_status === "recruiter_cosigned";
  return (
    <article className="flex min-w-[88%] snap-start flex-col rounded-2xl border border-[#EDE9F8] bg-white p-4 shadow-[0_8px_24px_rgba(77,52,155,0.04)] sm:min-w-[70%] md:min-w-0">
      <div className="flex items-start gap-3">
        <Avatar className="size-11 shrink-0 border border-[#E7E5F4]">
          <AvatarFallback className="bg-[#F1EAFF] text-xs font-bold text-[#6428F5]">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="flex items-center gap-1 truncate text-sm font-bold text-[#12143A]">
            {testimonial.author_name}
            {isVerified && <BadgeCheck className="size-3.5 shrink-0 fill-[#2379EF] text-white" aria-label="Verified testimonial" />}
          </p>
          <p className="truncate text-xs text-[#62678A]">{[testimonial.author_role, testimonial.author_company].filter(Boolean).join(" · ") || "Role not provided"}</p>
        </div>
      </div>
      <div className="mt-3"><StarRating rating={testimonial.rating} compact /></div>
      {testimonial.content ? (
        <p className="mt-2 line-clamp-4 text-sm leading-5 text-[#414565]">“{testimonial.content}”</p>
      ) : (
        <p className="mt-2 text-sm italic text-[#8A8EAC]">No written comment provided.</p>
      )}
      <p className="mt-auto pt-4 text-xs text-[#8A8EAC]">{formatDate(testimonial.created_at)} · {formatRelativeTime(testimonial.created_at)}</p>
    </article>
  );
}

function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const [showAll, setShowAll] = useState(false);

  return (
    <section className="rounded-[24px] border bg-white p-4 shadow-[0_12px_40px_rgba(77,52,155,0.06)] sm:p-6" style={{ borderColor: BORDER }}>
      <SectionHeading
        title="Testimonials"
        count={testimonials.length}
        action={testimonials.length > 3 ? <button onClick={() => setShowAll((value) => !value)} className="inline-flex items-center gap-1 text-sm font-semibold text-[#6428F5] hover:text-[#5420D7]">{showAll ? "Show Less" : "View All"} <ChevronRight className="size-4" /></button> : undefined}
      />
      {testimonials.length > 0 ? (
        <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-3 md:overflow-visible">
          {testimonials.slice(0, showAll ? undefined : 3).map((testimonial) => <TestimonialCard key={testimonial._id} testimonial={testimonial} />)}
        </div>
      ) : (
        <div className="rounded-2xl bg-[#FCFBFF] px-5 py-8 text-center">
          <Quote className="mx-auto size-7 text-[#C6B5F8]" />
          <p className="mt-2 text-sm font-semibold text-[#12143A]">Your first review is waiting to be written.</p>
          <p className="mt-1 text-xs text-[#62678A]">Complete great work and invite collaborators to share their experience.</p>
        </div>
      )}
    </section>
  );
}

function Projects({ credits }: { credits: Credit[] }) {
  const [showAll, setShowAll] = useState(false);

  return (
    <section className="rounded-[24px] border bg-white p-5 shadow-[0_12px_40px_rgba(77,52,155,0.06)] sm:p-6" style={{ borderColor: BORDER }}>
      <SectionHeading title="Project History" action={credits.length > 4 ? <button onClick={() => setShowAll((value) => !value)} className="inline-flex items-center gap-1 text-sm font-semibold text-[#6428F5]">{showAll ? "Show Less" : "View All"} <ChevronRight className="size-4" /></button> : undefined} />
      {credits.length > 0 ? (
        <div className="space-y-2">
          {credits.slice(0, showAll ? undefined : 4).map((credit) => {
            const media = credit.media_url;
            const status = credit.verification_status === "recruiter_cosigned"
              ? "Recruiter verified"
              : credit.verification_status === "public_record"
                ? "Public record"
                : "Self-reported";
            return (
              <div key={credit._id} className="flex min-w-0 items-center gap-3 rounded-2xl border border-[#EEEAF9] bg-[#FCFBFF] p-2.5">
                <div className="size-[62px] shrink-0 overflow-hidden rounded-xl bg-[linear-gradient(135deg,#E9DFFF,#FFD9E8)]">
                  {media ? <div className="size-full bg-cover bg-center" style={{ backgroundImage: `url(${media})` }} /> : <div className="grid size-full place-items-center text-[#6428F5]"><Video className="size-5" /></div>}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-[#12143A]">{credit.project_name || "Untitled project"}</p>
                  <p className="truncate text-xs text-[#62678A]">{[credit.platform, credit.role_played].filter(Boolean).join(" · ") || "Creative project"}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="flex items-center justify-end gap-1 text-xs font-semibold text-[#0D9F8A]"><CheckCircle2 className="size-3.5" />{status}</p>
                  <p className="mt-1 text-xs text-[#62678A]">{credit.year || "—"}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl bg-[#FCFBFF] px-5 py-8 text-center">
          <BriefcaseBusiness className="mx-auto size-7 text-[#C6B5F8]" />
          <p className="mt-2 text-sm font-semibold text-[#12143A]">Your project history will appear here.</p>
        </div>
      )}
    </section>
  );
}

function ReputationTrend({ history }: { history: TalentReputation["rating_history"] }) {
  const chartData = history.map((point) => ({
    label: new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date(point.date)),
    score: point.average,
  }));
  const growth = chartData.length > 1 ? chartData[chartData.length - 1].score - chartData[0].score : 0;

  return (
    <section className="rounded-[24px] border bg-white p-5 shadow-[0_12px_40px_rgba(77,52,155,0.06)] sm:p-6" style={{ borderColor: BORDER }}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xl font-bold tracking-[-0.03em] text-[#12143A]">Reputation Trend <Info className="size-4 text-[#6428F5]" /></h2>
        <span className="shrink-0 rounded-lg border border-[#E7E5F4] px-2.5 py-1.5 text-xs font-medium text-[#62678A]">All available reviews</span>
      </div>
      {chartData.length > 0 ? (
        <>
          <div className="mt-5 h-[190px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="trend-fill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#8A57F6" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="#8A57F6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#EEEAF9" vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: MUTED, fontSize: 11 }} />
                <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} axisLine={false} tickLine={false} tick={{ fill: MUTED, fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 12, borderColor: BORDER, color: TEXT, fontSize: 12 }} formatter={(value) => [`${value}/5`, "Score"]} />
                <Area type="monotone" dataKey="score" stroke="#6428F5" strokeWidth={2.5} fill="url(#trend-fill)" />
                <Line type="monotone" dataKey="score" stroke="#6428F5" strokeWidth={2.5} dot={{ r: 3, fill: "#6428F5", strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-[#F8F6FF] p-3">
            <span className="grid size-9 place-items-center rounded-xl bg-[#EDE5FF] text-[#6428F5]"><BarChart3 className="size-5" /></span>
            <p className="text-xs leading-4 text-[#62678A]">{growth > 0 ? `Your review score has grown by ${growth.toFixed(1)} points across the available reviews.` : "Your review score is holding steady across the available reviews."}</p>
            {growth > 0 && <span className="ml-auto shrink-0 text-lg font-bold text-[#0D9F8A]">↑ {growth.toFixed(1)}</span>}
          </div>
        </>
      ) : (
        <div className="mt-5 rounded-2xl bg-[#FCFBFF] px-5 py-10 text-center">
          <BarChart3 className="mx-auto size-8 text-[#C6B5F8]" />
          <p className="mt-2 text-sm font-semibold text-[#12143A]">Your trend will appear after your first review.</p>
          <p className="mt-1 text-xs text-[#62678A]">This chart reflects rated testimonials over time.</p>
        </div>
      )}
    </section>
  );
}

function BottomArtwork() {
  return (
    <div className="overflow-hidden rounded-[22px] bg-[#F1EAFF]">
      <Image src="/assets/talent-edit/talent-rep-bottom.png" alt="Your reputation today, bigger opportunities tomorrow" width={1200} height={300} className="h-auto w-full object-contain" />
    </div>
  );
}

export function TalentReputationPage() {
  const profileQuery = useMyProfile();
  const reputationQuery = useMyReputation();
  const profile = profileQuery.data;
  const username = profile?.username ?? "";
  const creditsQuery = useTalentCredits(username);
  const testimonialsQuery = useTalentTestimonials(username);

  if (profileQuery.isLoading || reputationQuery.isLoading || creditsQuery.isLoading || testimonialsQuery.isLoading) return <ReputationSkeleton />;
  if (profileQuery.isError || reputationQuery.isError || creditsQuery.isError || testimonialsQuery.isError) return <ReputationError />;
  if (!profile) return null;

  const credits = creditsQuery.data ?? [];
  const testimonials = testimonialsQuery.data ?? [];
  const reputation = reputationQuery.data;
  if (!reputation) return null;

  return (
    <main className="reputation-page-theme min-h-full overflow-hidden bg-background pb-24 text-foreground" style={{ backgroundColor: PAGE_BG, color: TEXT }}>
      <div className="mx-auto max-w-7xl space-y-5 px-4 pb-8 pt-4 sm:px-6 sm:pt-6 lg:px-8">
        <Hero />
        <ProfileSummary profile={profile} />
        <div className="grid gap-5 lg:grid-cols-[minmax(270px,0.78fr)_minmax(0,1.7fr)]">
          <RootScore scorePercent={reputation.root_score} rating={reputation.average_rating} />
          <ReputationHighlights reputation={reputation} />
        </div>
        <TrustBadges profile={profile} reputation={reputation} />
        <Testimonials testimonials={testimonials} />
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.25fr)]">
          <Projects credits={credits} />
          <ReputationTrend history={reputation.rating_history} />
        </div>
        <BottomArtwork />
      </div>
    </main>
  );
}
