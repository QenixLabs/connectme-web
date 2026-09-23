"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Award,
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Camera,
  Check,
  ChevronRight,
  Clapperboard,
  FileText,
  Grid2x2,
  Home,
  Image as ImageIcon,
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
  User,
  UserRound,
  Wand2,
} from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { computeStrength } from "./compute-strength";
import { Ring } from "./editors/StrengthScreen";
import type { Profile, ScreenKey } from "./profile-types";

interface DashboardProps {
  profile: Profile;
  onOpen: (key: ScreenKey) => void;
  onPhotoClick: () => void;
  onBannerClick: () => void;
}

type MenuItem = {
  key: ScreenKey;
  icon: ReactNode;
  title: string;
  subtitle: string;
  href?: string;
  strengthKey: string;
  done: boolean;
  progress?: string;
};

export function Dashboard({
  profile,
  onOpen,
  onPhotoClick,
  onBannerClick,
}: DashboardProps) {
  const { percent, items } = computeStrength(profile);
  const remaining = items.filter((i) => !i.done);
  const completedCount = items.length - remaining.length;
  const nextItem = remaining[0];
  const router = useRouter();

  const socialCount = Object.values(profile.socialLinks).filter((l) => Boolean(l.url)).length;
  const documentCount = [
    profile.documents.resume_url,
    profile.documents.portfolio_pdf_url,
    profile.documents.measurements_sheet_url,
  ].filter(Boolean).length;
  const physicalAttributeCount = [
    profile.physicalAttributes.height_cm,
    profile.physicalAttributes.weight_kg,
  ].filter(Boolean).length;
  const screenByStrengthKey: Partial<Record<string, ScreenKey>> = {
    basic_info: "basic",
    professional_profile: "professional",
    physical_attributes: "physical",
    social_links: "social",
    resume: "documents",
    measurements: "documents",
  };

  const sectionState = {
    basic: Boolean(profile.fullLegalName && profile.username && profile.location),
    professional: profile.professions.length > 0 && Boolean(profile.headline),
    about: profile.about.trim().length > 80,
    availability: Boolean(profile.availability),
    skills: profile.skills.length >= 5,
    portfolio: profile.portfolio.length > 0,
    experience: profile.experience.length > 0,
    credits: profile.credits.length > 0,
    awards: profile.awards.length > 0,
    physical: physicalAttributeCount === 2,
    languages: profile.languages.length >= 4,
    social: socialCount >= 3,
    documents: documentCount >= 2,
    testimonials: profile.testimonials.some((t) => t.approvedByTalent),
    privacy: true,
  };

  const nextAction = nextItem
    ? {
        label: nextItem.label,
        run:
          nextItem.key === "profile_photo"
            ? onPhotoClick
            : nextItem.key === "cover_image"
              ? onBannerClick
              : nextItem.key === "portfolio"
                ? () => router.push("/talent/portfolio")
                : () => onOpen(screenByStrengthKey[nextItem.key] ?? (nextItem.key as ScreenKey)),
      }
    : { label: "Review your profile", run: () => onOpen("strength") };

  const groups: { label: string; items: MenuItem[] }[] = [
    {
      label: "Profile",
      items: [
        {
          key: "basic",
          icon: <UserRound className="size-[18px]" />,
          title: "Basic Information",
          subtitle: "Name, username, location, DOB",
          strengthKey: "basic_info",
          done: sectionState.basic,
        },
        {
          key: "professional",
          icon: <Sparkles className="size-[18px]" />,
          title: "Professional Profile",
          subtitle:
            profile.professions.length > 0
              ? `${profile.professions.length} professions · ${profile.specialties.length} specialties`
              : "Add a role and headline to get discovered",
          strengthKey: "professional_profile",
          done: sectionState.professional,
        },
        {
          key: "about",
          icon: <Wand2 className="size-[18px]" />,
          title: "About Me",
          subtitle: profile.about ? "Your story in your words" : "Not added yet",
          strengthKey: "about",
          done: sectionState.about,
        },
        {
          key: "availability",
          icon: <MapPin className="size-[18px]" />,
          title: "Availability",
          subtitle:
            profile.availability === "available"
              ? "Available now"
              : profile.availability === "busy"
                ? "Busy"
                : "Not available",
          strengthKey: "availability",
          done: sectionState.availability,
        },
      ],
    },
    {
      label: "Work",
      items: [
        {
          key: "skills",
          icon: <Star className="size-[18px]" />,
          title: "Skills",
          subtitle:
            profile.skills.length > 0
              ? `${profile.skills.length} added · aim for 5`
              : "Add skills recruiters search for",
          strengthKey: "skills",
          done: sectionState.skills,
          progress:
            profile.skills.length > 0 && !sectionState.skills
              ? `${Math.round((profile.skills.length / 5) * 100)}%`
              : undefined,
        },
        {
          key: "portfolio",
          icon: <Grid2x2 className="size-[18px]" />,
          title: "Portfolio",
          subtitle:
            profile.portfolio.length > 0
              ? `${profile.portfolio.length} projects`
              : "Add your first project",
          href: "/talent/portfolio",
          strengthKey: "portfolio",
          done: sectionState.portfolio,
        },
        {
          key: "experience",
          icon: <Briefcase className="size-[18px]" />,
          title: "Work Experience",
          subtitle:
            profile.experience.length > 0
              ? `${profile.experience.length} roles added`
              : "Add your first role or production",
          strengthKey: "experience",
          done: sectionState.experience,
        },
        {
          key: "credits",
          icon: <Clapperboard className="size-[18px]" />,
          title: "Credits",
          subtitle:
            profile.credits.length > 0
              ? `${profile.credits.length} projects`
              : "Add a credit to build trust",
          strengthKey: "credits",
          done: sectionState.credits,
        },
        {
          key: "awards",
          icon: <Trophy className="size-[18px]" />,
          title: "Awards",
          subtitle:
            profile.awards.length > 0
              ? `${profile.awards.length} recognitions`
              : "Add awards and recognitions",
          strengthKey: "awards",
          done: sectionState.awards,
        },
      ],
    },
    {
      label: "Personal",
      items: [
        {
          key: "physical",
          icon: <Ruler className="size-[18px]" />,
          title: "Physical Attributes",
          subtitle:
            physicalAttributeCount > 0
              ? `${profile.physicalAttributes.height_cm ?? "—"} cm · ${profile.physicalAttributes.body_type ?? "Add body type"}`
              : "Add measurements recruiters may need",
          strengthKey: "physical_attributes",
          done: sectionState.physical,
          progress: physicalAttributeCount === 1 ? "50%" : undefined,
        },
        {
          key: "languages",
          icon: <Languages className="size-[18px]" />,
          title: "Languages & Accents",
          subtitle:
            profile.languages.map((l) => l.name).join(", ") || "Add languages and accents",
          strengthKey: "languages",
          done: sectionState.languages,
          progress:
            profile.languages.length > 0 && !sectionState.languages
              ? `${Math.round((profile.languages.length / 4) * 100)}%`
              : undefined,
        },
      ],
    },
    {
      label: "Account",
      items: [
        {
          key: "social",
          icon: <Link2 className="size-[18px]" />,
          title: "Social Links",
          subtitle: socialCount > 0 ? `${socialCount} connected` : "Connect social proof for more reach",
          strengthKey: "social_links",
          done: sectionState.social,
          progress:
            socialCount > 0 && !sectionState.social
              ? `${Math.round((socialCount / 3) * 100)}%`
              : undefined,
        },
        {
          key: "documents",
          icon: <FileText className="size-[18px]" />,
          title: "Documents",
          subtitle:
            documentCount > 0
              ? `${documentCount} uploaded`
              : "Upload a resume or measurements sheet",
          strengthKey: "resume",
          done: sectionState.documents,
          progress: documentCount === 1 ? "50%" : undefined,
        },
        {
          key: "testimonials",
          icon: <MessageSquareQuote className="size-[18px]" />,
          title: "Testimonials",
          subtitle: profile.testimonials.some((t) => t.approvedByTalent)
            ? "Testimonials approved"
            : "Request a testimonial",
          strengthKey: "testimonials",
          done: sectionState.testimonials,
        },
        {
          key: "privacy",
          icon: <Lock className="size-[18px]" />,
          title: "Privacy & Visibility",
          subtitle: `Profile is ${profile.privacyMode}`,
          strengthKey: "privacy",
          done: sectionState.privacy,
        },
      ],
    },
  ];

  return (
    <div className="min-h-full pb-8">
      {/* Hero */}
      <div className="relative">
        <div
          className={cn(
            "h-36 w-full bg-cover bg-center",
            !profile.heroBackground && "bg-gradient-to-br from-primary/10 via-muted to-muted/50",
          )}
          style={
            profile.heroBackground
              ? { backgroundImage: `url(${profile.heroBackground})` }
              : undefined
          }
        />
        <button
          onClick={onBannerClick}
          className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-card/85 px-3 py-1.5 text-xs font-bold text-secondary-foreground backdrop-blur active:scale-95"
        >
          <Camera className="size-3.5" /> Cover
        </button>

        <div className="px-4">
          <div className="-mt-12 flex items-end gap-3">
            <div className="relative">
              <div className="grid size-24 place-items-center overflow-hidden rounded-3xl border-4 border-background bg-muted text-[26px] font-extrabold tracking-wide">
                {profile.profilePhoto ? (
                  <img
                    src={profile.profilePhoto}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (profile.fullLegalName || profile.username || "?")[0]?.toUpperCase()
                )}
              </div>
              <button
                onClick={onPhotoClick}
                aria-label="Change photo"
                className="absolute -right-1 -bottom-1 grid size-8 place-items-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow active:scale-95"
              >
                <Camera className="size-3.5" />
              </button>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/talent/${profile.username}`,
                );
                // toast handled by parent if needed
              }}
              className="mb-1 ml-auto flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-bold text-secondary-foreground active:scale-95"
            >
              <Share2 className="size-3.5" /> Share
            </button>
          </div>

          <div className="mt-3">
            <div className="flex items-center gap-1.5">
              <h1 className="truncate text-[22px] font-extrabold tracking-tight">
                {profile.fullLegalName || "Add your name"}
              </h1>
              {profile.isVerified ? (
                <BadgeCheck className="size-5 shrink-0 text-primary" />
              ) : null}
            </div>
            <p className="text-[13.5px] font-semibold text-muted-foreground">
              @{profile.username}
            </p>
            <p className="mt-1 text-[14px] font-semibold">{profile.headline}</p>
            <p className="mt-1 flex items-center gap-1 text-[12.5px] text-muted-foreground">
              <MapPin className="size-3.5" /> {profile.location || "Add location"}
            </p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {profile.professions.slice(0, 3).map((p) => (
                <span
                  key={p}
                  className="rounded-full bg-primary/10 px-3 py-1.5 text-[12px] font-bold text-primary"
                >
                  {p}
                </span>
              ))}
              <span
                className={cn(
                  "rounded-full px-3 py-1.5 text-[12px] font-bold",
                  profile.availability === "available"
                    ? "bg-success/15 text-success"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {profile.availability === "available"
                  ? "Available now"
                  : profile.availability === "busy"
                    ? "Busy"
                    : "Not available"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Strength */}
      <div className="mt-5 px-4">
        <Card
          className="cursor-pointer border-primary/15 shadow-[0_8px_24px_rgba(37,99,235,0.08)]"
          onClick={() => onOpen("strength")}
        >
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-4">
              <Ring percent={percent} size={104} />
              <div className="min-w-0 flex-1">
                <p className="text-[16px] font-extrabold tracking-tight">Profile Strength</p>
                <p className="mt-1 text-[14px] font-bold text-primary">{percent}% complete</p>
                <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                  {completedCount} of {items.length} sections complete
                </p>
              </div>
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">
              Complete your profile to improve your visibility to recruiters.
            </p>
            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-primary/5 px-3 py-2.5">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wide text-primary/75">Next</p>
                <p className="truncate text-[13px] font-semibold">{nextAction.label}</p>
              </div>
              <Button
                size="sm"
                className="h-9 rounded-lg px-3 text-xs font-bold shadow-sm"
                onClick={(event) => {
                  event.stopPropagation();
                  nextAction.run();
                }}
              >
                Complete Profile <ArrowRight className="size-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Groups */}
      <div className="space-y-6 px-4 pt-4 pb-24">
        {groups.map((g) => (
          <div key={g.label}>
            <p className="mb-2 flex items-center justify-between px-1 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
              <span>{g.label}</span>
              <span className="text-[10px] font-bold tracking-normal text-muted-foreground/70">
                {g.items.filter((item) => item.done).length}/{g.items.length}
              </span>
            </p>
            <Card className="divide-y p-0">
              {g.items.map((it) => {
                const isRecommended =
                  it.strengthKey === nextItem?.key ||
                  (it.key === "documents" &&
                    (nextItem?.key === "resume" || nextItem?.key === "measurements"));
                const content = (
                  <>
                    <span
                      className={cn(
                        "grid size-8 shrink-0 place-items-center rounded-lg",
                        isRecommended
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {it.icon}
                    </span>
                    <span
                      className={cn(
                        "grid size-5 shrink-0 place-items-center rounded-full",
                        it.done
                          ? "bg-success/15 text-success"
                          : isRecommended
                            ? "border border-primary/50 bg-primary/5 text-primary"
                            : "border border-muted-foreground/35 text-transparent",
                      )}
                    >
                      {it.done ? <Check className="size-3" strokeWidth={3} /> : null}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "text-[14.5px] font-semibold",
                          isRecommended && "text-primary",
                        )}
                      >
                        {it.title}
                      </p>
                      <p className="truncate text-[12.5px] text-muted-foreground">
                        {it.subtitle}
                      </p>
                    </div>
                    {it.progress ? (
                      <span className="shrink-0 text-[10px] font-bold text-primary/75">
                        {it.progress}
                      </span>
                    ) : null}
                    <ChevronRight className="size-[18px] shrink-0 text-muted-foreground/70" />
                  </>
                );

                return it.href ? (
                  <Link
                    key={it.key}
                    href={it.href}
                    className={cn(
                      "flex items-center gap-2.5 px-4 py-3 transition-colors hover:bg-muted/40",
                      isRecommended && "bg-primary/[0.035]",
                    )}
                  >
                    {content}
                  </Link>
                ) : (
                  <button
                    key={it.key}
                    onClick={() => onOpen(it.key as ScreenKey)}
                    className={cn(
                      "flex w-full items-center gap-2.5 px-4 py-3 text-left transition-colors hover:bg-muted/40",
                      isRecommended && "bg-primary/[0.035]",
                    )}
                  >
                    {content}
                  </button>
                );
              })}
            </Card>
          </div>
        ))}
      </div>

      <BottomNav onOpen={onOpen} />
    </div>
  );
}

function BottomNav({ onOpen }: { onOpen: (key: ScreenKey) => void }) {
  const router = useRouter();

  const tabs: { label: string; icon: ReactNode; onClick: () => void }[] = [
    { label: "Overview", icon: <Home className="size-[19px]" />, onClick: () => {} },
    { label: "Portfolio", icon: <ImageIcon className="size-[19px]" />, onClick: () => router.push("/talent/portfolio") },
    { label: "Awards", icon: <Award className="size-[19px]" />, onClick: () => onOpen("awards") },
    { label: "Reviews", icon: <User className="size-[19px]" />, onClick: () => onOpen("testimonials") },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto flex w-full max-w-[430px] items-end justify-around border-t bg-background/95 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-xl">
      {tabs.slice(0, 2).map((t) => (
        <NavTab key={t.label} {...t} />
      ))}
      <button
        onClick={() => onOpen("media")}
        aria-label="Add media"
        className="-mt-6 flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg active:scale-95"
      >
        <Plus className="size-6" strokeWidth={2.5} />
      </button>
      {tabs.slice(2).map((t) => (
        <NavTab key={t.label} {...t} />
      ))}
    </nav>
  );
}

function NavTab({ label, icon, onClick }: { label: string; icon: ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-16 flex-col items-center gap-1 rounded-2xl py-1.5 text-[10.5px] font-bold text-muted-foreground transition-colors hover:text-primary"
    >
      {icon}
      {label}
    </button>
  );
}
