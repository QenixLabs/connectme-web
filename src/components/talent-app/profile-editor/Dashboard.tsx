"use client";

import { useRouter } from "next/navigation";
import {
  Award,
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  Camera,
  Check,
  ChevronRight,
  Clapperboard,
  FileText,
  Home,
  Image as ImageIcon,
  Instagram,
  Languages,
  Link2,
  Lock,
  MapPin,
  MessageSquareQuote,
  Plus,
  Ruler,
  Share2,
  Sparkles,
  Star,
  Trophy,
  UserRound,
  Wand2,
  Youtube,
} from "lucide-react";
import type { ReactNode } from "react";
import type {
  PortfolioApiResponse,
  ProfileHighlightsResponse,
} from "@/lib/api/talent";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { computeStrength } from "./compute-strength";
import { Ring } from "./editors/StrengthScreen";
import type { Profile, ScreenKey } from "./profile-types";

interface DashboardProps {
  profile: Profile;
  portfolioItems: PortfolioApiResponse[];
  profileHighlights?: ProfileHighlightsResponse;
  onOpen: (key: ScreenKey) => void;
  onPhotoClick: () => void;
  onBannerClick: () => void;
}

type CardProps = {
  title: string;
  subtitle: string;
  icon: ReactNode;
  done?: boolean;
  actionLabel?: string;
  children?: ReactNode;
  className?: string;
  onClick: () => void;
};

const strengthKeyByScreen: Partial<Record<ScreenKey, string>> = {
  basic: "basic_info",
  professional: "professional_profile",
  about: "about",
  skills: "skills",
  portfolio: "portfolio",
  media: "media",
  awards: "awards",
  physical: "physical_attributes",
  languages: "languages",
  social: "social_links",
  documents: "resume",
};

export function Dashboard({
  profile,
  portfolioItems,
  profileHighlights,
  onOpen,
  onPhotoClick,
  onBannerClick,
}: DashboardProps) {
  const router = useRouter();
  const strength = computeStrength(profile);
  const strengthMap = new Map(strength.items.map((item) => [item.key, item]));
  const completedCount = strength.items.filter((item) => item.done).length;
  const nextItem = strength.items.find((item) => !item.done);

  const socialEntries = Object.entries(profile.socialLinks).filter(([, link]) => Boolean(link.url));
  const documentEntries = [
    ["Resume", profile.documents.resume_url],
    ["Portfolio PDF", profile.documents.portfolio_pdf_url],
    ["Measurements", profile.documents.measurements_sheet_url],
  ].filter(([, url]) => Boolean(url));
  const physicalValues = [
    profile.physicalAttributes.height_cm,
    profile.physicalAttributes.weight_kg,
    profile.physicalAttributes.body_type,
    profile.physicalAttributes.complexion,
    profile.physicalAttributes.hair_color,
    profile.physicalAttributes.eye_color,
  ].filter(Boolean);
  const approvedTestimonials = profile.testimonials.filter((item) => item.approvedByTalent);

  const navigateToStrengthItem = (key?: string) => {
    if (!key) {
      onOpen("strength");
      return;
    }
    if (key === "profile_photo") return onPhotoClick();
    if (key === "cover_image") return onBannerClick();
    if (key === "portfolio") return router.push("/talent/portfolio");
    if (key === "resume" || key === "measurements") return onOpen("documents");
    const screen = Object.entries(strengthKeyByScreen).find(([, value]) => value === key)?.[0];
    onOpen((screen as ScreenKey | undefined) ?? "strength");
  };

  const nextDetail = nextItem
    ? nextItem.key === "skills"
      ? `${profile.skills.length} added · aim for 5`
      : nextItem.key === "portfolio"
        ? "Add a project or portfolio media"
        : nextItem.key === "media"
          ? "Show recruiters your work"
          : `Add your ${nextItem.label.toLowerCase()}`
    : "Your profile is ready to be discovered";

  const sectionState = (screen: ScreenKey, fallback = false) =>
    strengthMap.get(strengthKeyByScreen[screen] ?? "")?.done ?? fallback;

  const profileCategory = [
    "profile_photo",
    "cover_image",
    "basic_info",
    "professional_profile",
    "about",
  ];
  const personalCategory = ["physical_attributes", "languages"];
  const creativeSections = [
    sectionState("skills"),
    portfolioItems.length > 0,
    profile.yearsOfExperience > 0,
    profile.credits.length > 0,
    profile.awards.length > 0,
  ];
  const accountSections = [
    socialEntries.length > 0,
    documentEntries.length > 0,
    approvedTestimonials.length > 0,
    Boolean(profile.privacyMode),
  ];

  const recommendations: Recommendation[] = [];
  const hasShowreel = profile.media.some((item) => item.kind === "showreel");
  if (!hasShowreel) {
    recommendations.push({
      icon: <Clapperboard className="size-4" />,
      title: "Add your showreel",
      description: "Show recruiters your work immediately.",
      action: "Add Showreel",
      onClick: () => onOpen("media"),
    });
  }
  if (profile.skills.length < 5) {
    recommendations.push({
      icon: <Star className="size-4" />,
      title: "Add another skill",
      description: `${profile.skills.length} skills added · aim for 5.`,
      action: "Add Skill",
      onClick: () => onOpen("skills"),
    });
  }
  if (portfolioItems.length === 0) {
    recommendations.push({
      icon: <ImageIcon className="size-4" />,
      title: "Add portfolio media",
      description: "Give recruiters a quick view of your work.",
      action: "Add Portfolio",
      onClick: () => router.push("/talent/portfolio"),
    });
  }
  if (profile.yearsOfExperience === 0 && recommendations.length < 3) {
    recommendations.push({
      icon: <BriefcaseBusiness className="size-4" />,
      title: "Add work experience",
      description: "Show recruiters the roles you have worked on.",
      action: "Add Experience",
      onClick: () => onOpen("experience"),
    });
  }
  const visibleRecommendations = recommendations.slice(0, 3);

  return (
    <div className="min-h-full bg-[linear-gradient(180deg,#f8f9ff_0%,#f5f7fc_46%,#f8f9fc_100%)] pb-28">
      <div className="mx-auto w-full max-w-[1060px] px-4 pb-8 pt-3 sm:px-6 lg:px-8">
        <IdentityHeader
          profile={profile}
          onPhotoClick={onPhotoClick}
          onBannerClick={onBannerClick}
        />

        <section className="relative mt-5 overflow-hidden rounded-[22px] border border-[#dfe2fb] bg-[#fbfbff] shadow-[0_16px_40px_rgba(61,70,160,0.10)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_15%,rgba(99,102,241,0.15),transparent_34%),linear-gradient(115deg,#ffffff_0%,#f5f3ff_58%,#eeeaff_100%)]" />
          <div className="relative h-[238px] md:h-[260px]">
            <div className="absolute inset-y-0 left-0 z-20 w-[48%] pb-3 pl-5 pr-2 pt-5 sm:px-7 sm:pt-7">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary/75">
                Profile strength
              </p>
              <h2 className="mt-2 max-w-full font-display text-[19px] font-bold leading-[1.05] tracking-[-0.04em] text-[#14225a] sm:text-3xl">
                <span className="block">Build a profile</span>
                <span className="block">recruiters</span>
                <span className="block">can&apos;t overlook.</span>
              </h2>
              <div className="mt-3">
                <div className="w-fit text-center">
                  <Ring percent={strength.percent} size={72} />
                  <p className="mt-0.5 text-[11px] font-bold text-[#18265e]">Complete</p>
                </div>
                <p className="mt-1 text-[11.5px] leading-snug text-muted-foreground">
                  {completedCount} of {strength.items.length} sections
                </p>
              </div>
            </div>
            <div className="absolute inset-y-0 right-0 z-10 w-[52%]">
              <img
                src="/assets/talent-dashboard/profile-hero.png"
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 h-full w-full object-contain object-bottom object-right"
              />
            </div>
          </div>
          <div className="relative z-30 border-t border-[#e1e2f3] bg-[#fbfbff]/95 px-5 pb-4 pt-3 backdrop-blur-[2px] sm:px-7">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-primary/70">
              Next to complete
            </p>
            <button
              className="mt-1 flex w-full items-center gap-2 text-left"
              onClick={() => navigateToStrengthItem(nextItem?.key)}
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-white/80 text-primary shadow-sm">
                <Sparkles className="size-3.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-bold text-[#17245b]">
                  {nextItem?.label ?? "Profile complete"}
                </span>
                <span className="block truncate text-[10px] text-muted-foreground">
                  {nextDetail}
                </span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-primary" />
            </button>
            <Button
              className="mt-3 h-9 w-full rounded-xl text-xs font-bold shadow-[0_7px_16px_rgba(86,71,220,0.20)]"
              onClick={() => navigateToStrengthItem(nextItem?.key)}
            >
              Complete Profile <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </section>

        <section className="mt-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary/75">
                Profile completion
              </p>
              <h2 className="mt-1 font-display text-xl font-bold tracking-tight text-[#14225a]">
                See what&apos;s complete and what needs attention.
              </h2>
            </div>
            <span className="shrink-0 text-sm font-extrabold text-primary">
              {completedCount}/{strength.items.length}
            </span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e5e8f4]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-violet-500 transition-all"
              style={{ width: `${strength.percent}%` }}
            />
          </div>
        </section>

        <CategoryHeader label="Profile" done={countDone(profileCategory, strengthMap)} total={profileCategory.length} />
        <div className="grid gap-2.5 md:grid-cols-2">
          <SummaryCard
            title="Basic Information"
            subtitle={`${basicCount(profile)}/4 details complete`}
            icon={<UserRound className="size-[17px]" />}
            done={sectionState("basic")}
            onClick={() => onOpen("basic")}
          />
          <SummaryCard
            title="Professional Profile"
            subtitle={`${profile.professions.length} professions · ${profile.specialties.length} specialties`}
            icon={<Sparkles className="size-[17px]" />}
            done={sectionState("professional")}
            onClick={() => onOpen("professional")}
          />
          <SummaryCard
            title="About Me"
            subtitle={profile.about.trim() ? `${wordCount(profile.about)} words · Complete` : "Not added yet"}
            icon={<Wand2 className="size-[17px]" />}
            done={sectionState("about")}
            onClick={() => onOpen("about")}
          />
          <SummaryCard
            title="Availability"
            subtitle={availabilityLabel(profile.availability)}
            icon={<CalendarDays className="size-[17px]" />}
            done={Boolean(profile.availability)}
            onClick={() => onOpen("availability")}
          />
        </div>

        <CategoryHeader label="Creative & career" done={creativeSections.filter(Boolean).length} total={creativeSections.length} />
        <div className="mt-2 grid gap-2.5 md:grid-cols-2">
          <SummaryCard
            title="Skills"
            subtitle={`${profile.skills.length} ${profile.skills.length === 1 ? "skill" : "skills"}${profile.skills.length > 0 ? " · aim for 5" : ""}`}
            icon={<Star className="size-[17px]" />}
            done={sectionState("skills")}
            className="border-primary/20 bg-[linear-gradient(135deg,#fff 0%,#f6f3ff 100%)]"
            onClick={() => onOpen("skills")}
          >
            {profile.skills.length > 0 ? (
              <div className="mt-3 flex max-w-full items-center gap-1.5 overflow-hidden">
                {profile.skills.slice(0, 3).map((skill) => (
                  <span key={skill.name} className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-primary shadow-sm ring-1 ring-primary/10">
                    {skill.name}
                  </span>
                ))}
                {profile.skills.length > 3 ? (
                  <span className="shrink-0 text-[10px] font-bold text-muted-foreground">
                    +{profile.skills.length - 3}
                  </span>
                ) : null}
              </div>
            ) : null}
          </SummaryCard>

          <PortfolioCard
            items={portfolioItems}
            profileHighlights={profileHighlights}
            onClick={() => router.push("/talent/portfolio")}
          />
          <SummaryCard
            title="Work Experience"
            subtitle={profile.yearsOfExperience > 0 ? `${profile.yearsOfExperience} years experience` : "No experience added yet"}
            icon={<BriefcaseBusiness className="size-[17px]" />}
            done={profile.yearsOfExperience > 0}
            actionLabel={profile.yearsOfExperience > 0 ? undefined : "+ Add"}
            onClick={() => onOpen("experience")}
          >
            {profile.yearsOfExperience > 0 ? (
              <p className="mt-3 truncate text-xs text-muted-foreground">Experience summary available in your profile</p>
            ) : null}
          </SummaryCard>
          <SummaryCard
            title="Credits"
            subtitle={profile.credits.length > 0 ? `${profile.credits.length} ${profile.credits.length === 1 ? "credit" : "credits"}` : "No credits added"}
            icon={<Clapperboard className="size-[17px]" />}
            done={profile.credits.length > 0}
            actionLabel={profile.credits.length > 0 ? undefined : "+ Add"}
            onClick={() => onOpen("credits")}
          >
            {profile.credits[0]?.project ? <p className="mt-3 truncate text-xs text-muted-foreground">{profile.credits[0].project}</p> : null}
          </SummaryCard>
          <SummaryCard
            title="Awards"
            subtitle={profile.awards.length > 0 ? `${profile.awards.length} ${profile.awards.length === 1 ? "award" : "awards"}` : "No awards added"}
            icon={<Trophy className="size-[17px]" />}
            done={profile.awards.length > 0}
            actionLabel={profile.awards.length > 0 ? undefined : "+ Add"}
            onClick={() => onOpen("awards")}
          >
            {profile.awards[0]?.name ? <p className="mt-3 truncate text-xs text-muted-foreground">{profile.awards[0].name}</p> : null}
          </SummaryCard>
        </div>

        <CategoryHeader label="Personal" done={countDone(personalCategory, strengthMap)} total={personalCategory.length} />
        <div className="grid gap-2.5 md:grid-cols-2">
          <SummaryCard
            title="Physical Attributes"
            subtitle={physicalValues.length > 0 ? `${profile.physicalAttributes.height_cm ? `${profile.physicalAttributes.height_cm} cm` : ""}${profile.physicalAttributes.height_cm && profile.physicalAttributes.body_type ? " · " : ""}${profile.physicalAttributes.body_type ?? ""}` : "Not added yet"}
            icon={<Ruler className="size-[17px]" />}
            done={sectionState("physical")}
            onClick={() => onOpen("physical")}
          />
          <SummaryCard
            title="Languages & Accents"
            subtitle={`${profile.languages.length} ${profile.languages.length === 1 ? "language" : "languages"} · ${profile.accents.length} ${profile.accents.length === 1 ? "accent" : "accents"}`}
            icon={<Languages className="size-[17px]" />}
            done={sectionState("languages")}
            onClick={() => onOpen("languages")}
          >
            {profile.languages.length > 0 ? <p className="mt-3 truncate text-[11.5px] text-muted-foreground">{languagePreview(profile.languages.map((language) => language.name))}</p> : null}
          </SummaryCard>
        </div>

        <CategoryHeader label="Account" done={accountSections.filter(Boolean).length} total={accountSections.length} />
        <div className="grid gap-2.5 md:grid-cols-2">
          <SummaryCard
            title="Social Links"
            subtitle={socialEntries.length > 0 ? `${socialEntries.length} connected` : "No social links connected"}
            icon={<Link2 className="size-[17px]" />}
            done={socialEntries.length > 0}
            className="rounded-[14px] bg-white/80 shadow-none"
            onClick={() => onOpen("social")}
          >
            {socialEntries.length > 0 ? <SocialPlatforms entries={socialEntries.map(([key]) => key)} /> : null}
          </SummaryCard>
          <SummaryCard
            title="Documents"
            subtitle={documentEntries.length > 0 ? `${documentEntries.length} uploaded` : "No documents uploaded"}
            icon={<FileText className="size-[17px]" />}
            done={documentEntries.length > 0}
            actionLabel={documentEntries.length > 0 ? undefined : "+ Upload"}
            className="rounded-[14px] bg-white/80 shadow-none"
            onClick={() => onOpen("documents")}
          >
            {documentEntries.length > 0 ? <p className="mt-3 truncate text-xs text-muted-foreground">{documentEntries.map(([label]) => label).join(" · ")}</p> : null}
          </SummaryCard>
          <SummaryCard
            title="Testimonials"
            subtitle={approvedTestimonials.length > 0 ? `${approvedTestimonials.length} received` : "No testimonials yet"}
            icon={<MessageSquareQuote className="size-[17px]" />}
            done={approvedTestimonials.length > 0}
            actionLabel={approvedTestimonials.length > 0 ? undefined : "Request"}
            className="rounded-[14px] bg-white/80 shadow-none"
            onClick={() => onOpen("testimonials")}
          />
          <SummaryCard
            title="Privacy & Visibility"
            subtitle={privacyLabel(profile.privacyMode)}
            icon={<Lock className="size-[17px]" />}
            done
            className="rounded-[14px] bg-white/80 shadow-none"
            onClick={() => onOpen("privacy")}
          />
        </div>

        {visibleRecommendations.length > 0 ? (
          <section className="mt-6">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary/75">Improve your profile</p>
                <h2 className="mt-1 font-display text-xl font-bold tracking-tight text-[#14225a]">A few things that can make your profile stronger.</h2>
              </div>
              <button onClick={() => onOpen("strength")} className="shrink-0 text-[11px] font-bold text-primary">View all <ArrowRight className="ml-0.5 inline size-3" /></button>
            </div>
            <div className="mt-3 space-y-2.5">
              {visibleRecommendations.map((recommendation) => (
                <RecommendationCard key={recommendation.title} {...recommendation} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
      <BottomNav onOpen={onOpen} />
    </div>
  );
}

interface Recommendation {
  icon: ReactNode;
  title: string;
  description: string;
  action: string;
  onClick: () => void;
}

function IdentityHeader({ profile, onPhotoClick, onBannerClick }: Pick<DashboardProps, "profile" | "onPhotoClick" | "onBannerClick">) {
  return (
    <section className="relative">
      <div className="relative h-32 overflow-hidden rounded-b-[22px] rounded-t-[18px] bg-[#e9eafa] sm:h-40">
        {profile.heroBackground ? <img src={profile.heroBackground} alt="Cover" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-[radial-gradient(circle_at_15%_20%,rgba(93,85,225,0.22),transparent_35%),linear-gradient(115deg,#e7eafd,#f3efff)]" />}
        <button onClick={onBannerClick} className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-bold text-[#263267] shadow-sm backdrop-blur" aria-label="Change cover image"><Camera className="size-3.5" /> Cover</button>
      </div>
      <div className="px-1 sm:px-3">
        <div className="-mt-11 flex items-end gap-3">
          <div className="relative">
            <button onClick={onPhotoClick} aria-label="Change profile photo" className="grid size-[88px] place-items-center overflow-hidden rounded-[25px] border-4 border-[#f8f9ff] bg-[#e6e8f4] text-2xl font-extrabold shadow-md sm:size-24">
              {profile.profilePhoto ? <img src={profile.profilePhoto} alt="Profile" className="h-full w-full object-cover" /> : (profile.fullLegalName || profile.username || "?")[0]?.toUpperCase()}
            </button>
            <span className="pointer-events-none absolute -bottom-1 -right-1 grid size-7 place-items-center rounded-full border-2 border-[#f8f9ff] bg-primary text-primary-foreground shadow-sm"><Camera className="size-3.5" /></span>
          </div>
          <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/talent/${profile.username}`)} className="mb-1 ml-auto flex items-center gap-1.5 rounded-full border border-[#dfe2ed] bg-white px-3.5 py-2 text-[11px] font-bold text-[#263267] shadow-sm"><Share2 className="size-3.5" /> Share</button>
        </div>
        <div className="mt-3">
          <div className="flex items-center gap-1.5"><h1 className="truncate font-display text-[23px] font-bold tracking-tight text-[#14225a]">{profile.fullLegalName || "Add your name"}</h1>{profile.isVerified ? <BadgeCheck className="size-5 shrink-0 text-primary" /> : null}</div>
          <p className="text-[13px] font-semibold text-muted-foreground">@{profile.username}</p>
          <p className="mt-1 text-sm font-semibold text-[#263267]">{profile.headline || "Add a professional headline"}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3.5" /> {profile.location || "Add location"}</p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {profile.professions.slice(0, 3).map((profession) => <span key={profession} className="rounded-full bg-primary/10 px-3 py-1.5 text-[11px] font-bold text-primary">{profession}</span>)}
            {profile.specialties.slice(0, 2).map((specialty) => <span key={specialty} className="rounded-full border border-primary/15 bg-white/80 px-3 py-1.5 text-[11px] font-bold text-primary">{specialty}</span>)}
            {profile.availability ? <span className={cn("rounded-full px-3 py-1.5 text-[11px] font-bold", profile.availability === "available" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground")}>{availabilityShortLabel(profile.availability)}</span> : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function SummaryCard({ title, subtitle, icon, done, actionLabel, children, className, onClick }: CardProps) {
  return (
    <button onClick={onClick} className={cn("group w-full rounded-[18px] border border-[#e1e4ef] bg-white p-3.5 text-left shadow-[0_7px_20px_rgba(31,48,107,0.045)] transition hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_12px_26px_rgba(31,48,107,0.09)]", className)}>
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#f0efff] text-primary">{icon}</span>
        <span className="min-w-0 flex-1"><span className="flex items-center gap-1.5 text-[13.5px] font-bold text-[#17245b]"><span className="truncate">{title}</span>{done ? <span className="grid size-4 shrink-0 place-items-center rounded-full bg-[#e0f5ea] text-[#21925a]"><Check className="size-2.5" strokeWidth={3} /></span> : null}</span><span className="mt-0.5 block truncate text-[11.5px] text-muted-foreground">{subtitle}</span></span>
        {actionLabel ? <span className="shrink-0 rounded-full bg-primary/8 px-2 py-1 text-[10px] font-bold text-primary">{actionLabel}</span> : null}
        <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground/60 transition group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>
      {children}
    </button>
  );
}

function PortfolioCard({ items, profileHighlights, onClick }: { items: PortfolioApiResponse[]; profileHighlights?: ProfileHighlightsResponse; onClick: () => void }) {
  const counts = portfolioCounts(items);
  const showcaseCount = profileHighlights ? Number(Boolean(profileHighlights.showreel_id)) + profileHighlights.video_ids.length + profileHighlights.image_ids.length : null;
  return (
    <button onClick={onClick} className="group relative min-h-[120px] overflow-hidden rounded-[18px] border border-[#d8dcf5] bg-[linear-gradient(135deg,#ffffff_0%,#f3f2ff_100%)] p-3.5 text-left shadow-[0_8px_22px_rgba(58,62,154,0.07)] transition hover:-translate-y-0.5">
      <div className="relative z-10 flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#e9e8ff] text-primary"><ImageIcon className="size-[17px]" /></span><span className="min-w-0 flex-1"><span className="flex items-center gap-1.5 text-[13.5px] font-bold text-[#17245b]">Portfolio<span className="grid size-4 place-items-center rounded-full bg-[#e0f5ea] text-[#21925a]"><Check className="size-2.5" strokeWidth={3} /></span></span><span className="mt-0.5 block text-[11.5px] text-muted-foreground">{items.length > 0 ? `${items.length} ${items.length === 1 ? "item" : "items"}` : "No portfolio items yet"}</span>{items.length > 0 ? <span className="mt-1 block truncate text-[10.5px] font-medium text-primary/80">{counts.join(" · ")}</span> : null}{showcaseCount !== null ? <span className="mt-1 block text-[10px] text-muted-foreground">Featured on profile · {showcaseCount} of 8 slots used</span> : null}</span><ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground/60 group-hover:text-primary" /></div>
      {items.length > 0 ? <div className="absolute bottom-3 right-3 flex -space-x-2">{items.filter((item) => thumbnailFor(item)).slice(0, 3).map((item) => <span key={item.id} className="grid size-12 overflow-hidden rounded-xl border-2 border-white bg-[#e4e6f4] shadow-sm"><img src={thumbnailFor(item)} alt="" className="h-full w-full object-cover" /></span>)}</div> : <span className="absolute bottom-3 right-3 rounded-lg bg-white/80 px-2 py-1 text-[10px] font-bold text-primary shadow-sm">+ Add Portfolio</span>}
    </button>
  );
}

function RecommendationCard({ icon, title, description, action, onClick }: Recommendation) {
  return <div className="flex items-center gap-3 rounded-[16px] border border-primary/12 bg-[linear-gradient(110deg,#ffffff_0%,#f7f4ff_100%)] p-3 shadow-[0_6px_18px_rgba(31,48,107,0.04)]"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#f0efff] text-primary">{icon}</span><div className="min-w-0 flex-1"><p className="truncate text-[12.5px] font-bold text-[#17245b]">{title}</p><p className="truncate text-[11px] text-muted-foreground">{description}</p></div><Button variant="outline" size="sm" onClick={onClick} className="h-8 shrink-0 rounded-lg px-2.5 text-[10px] font-bold text-primary">{action}</Button></div>;
}

function CategoryHeader({ label, done, total }: { label: string; done: number; total: number }) {
  return <div className="mt-6 flex items-center gap-3"><div className="flex min-w-0 items-center gap-2"><span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-muted-foreground">{label}</span><span className="text-[10px] font-bold text-muted-foreground/70">{done}/{total}</span></div><span className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" /></div>;
}

function SocialPlatforms({ entries }: { entries: string[] }) {
  return <div className="mt-3 flex items-center gap-2 overflow-hidden">{entries.slice(0, 3).map((entry) => <span key={entry} className="flex shrink-0 items-center gap-1 rounded-full bg-muted/70 px-2 py-1 text-[10px] font-semibold text-muted-foreground"><SocialIcon platform={entry} />{socialLabel(entry)}</span>)}{entries.length > 3 ? <span className="shrink-0 text-[10px] font-bold text-muted-foreground">+{entries.length - 3}</span> : null}</div>;
}

function SocialIcon({ platform }: { platform: string }) {
  const value = platform.toLowerCase();
  if (value.includes("instagram")) return <Instagram className="size-3" />;
  if (value.includes("youtube")) return <Youtube className="size-3" />;
  return <Link2 className="size-3" />;
}

function socialLabel(platform: string) { return platform.replaceAll("_", " ").replace(/(^|\s)\S/g, (letter) => letter.toUpperCase()); }
function wordCount(value: string) { return value.trim().split(/\s+/).filter(Boolean).length; }
function basicCount(profile: Profile) { return [profile.fullLegalName, profile.username, profile.location, profile.dateOfBirth].filter(Boolean).length; }
function languagePreview(languages: string[]) { return languages.length > 2 ? `${languages.slice(0, 2).join(" · ")} +${languages.length - 2}` : languages.join(" · "); }
function countDone(keys: string[], map: Map<string, { done: boolean }>) { return keys.filter((key) => map.get(key)?.done).length; }
function availabilityLabel(value: Profile["availability"]) { return value === "available" ? "Available now · Open to work" : value === "busy" ? "Busy" : "Not available"; }
function availabilityShortLabel(value: Profile["availability"]) { return value === "available" ? "Available now" : value === "busy" ? "Busy" : "Not available"; }
function privacyLabel(value: Profile["privacyMode"]) { return value === "recruiters_only" ? "Recruiters only" : value === "private" ? "Private" : "Public"; }

function portfolioCounts(items: PortfolioApiResponse[]) {
  const counts: string[] = [];
  const showreels = items.filter((item) => item.profile_highlight_type === "showreel").length;
  const videos = items.filter((item) => item.type === "video" || item.type === "youtube").length;
  const images = items.filter((item) => item.type === "image").length;
  const links = items.filter((item) => item.type === "link" || item.type === "instagram").length;
  if (showreels) counts.push(`${showreels} ${showreels === 1 ? "Reel" : "Reels"}`);
  if (videos) counts.push(`${videos} ${videos === 1 ? "Video" : "Videos"}`);
  if (images) counts.push(`${images} ${images === 1 ? "Photo" : "Photos"}`);
  if (links) counts.push(`${links} ${links === 1 ? "Link" : "Links"}`);
  return counts.length > 0 ? counts : ["Media added"];
}

function thumbnailFor(item: PortfolioApiResponse) {
  return item.thumbnail_url || (item.type === "image" ? item.url : undefined);
}

function BottomNav({ onOpen }: { onOpen: (key: ScreenKey) => void }) {
  const router = useRouter();
  const tabs: { label: string; icon: ReactNode; onClick: () => void }[] = [
    { label: "Overview", icon: <Home className="size-[19px]" />, onClick: () => {} },
    { label: "Portfolio", icon: <ImageIcon className="size-[19px]" />, onClick: () => router.push("/talent/portfolio") },
    { label: "Awards", icon: <Award className="size-[19px]" />, onClick: () => onOpen("awards") },
    { label: "Reviews", icon: <UserRound className="size-[19px]" />, onClick: () => onOpen("testimonials") },
  ];
  return <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto flex w-full max-w-[430px] items-end justify-around border-t border-[#e0e3ee] bg-white/95 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-8px_20px_rgba(32,47,96,0.06)] backdrop-blur-xl">{tabs.slice(0, 2).map((tab) => <NavTab key={tab.label} {...tab} />)}<button onClick={() => onOpen("media")} aria-label="Add media" className="-mt-6 flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg active:scale-95"><Plus className="size-6" strokeWidth={2.5} /></button>{tabs.slice(2).map((tab) => <NavTab key={tab.label} {...tab} />)}</nav>;
}

function NavTab({ label, icon, onClick }: { label: string; icon: ReactNode; onClick: () => void }) {
  return <button onClick={onClick} className="flex w-16 flex-col items-center gap-1 rounded-2xl py-1.5 text-[10.5px] font-bold text-muted-foreground transition-colors hover:text-primary">{icon}{label}</button>;
}
