"use client";

import Link from "next/link";
import {
  Award,
  BadgeCheck,
  Briefcase,
  Camera,
  ChevronRight,
  Clapperboard,
  FileText,
  Film,
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
  key: ScreenKey | "portfolio" | "experience";
  icon: ReactNode;
  title: string;
  subtitle: string;
  href?: string;
};

export function Dashboard({
  profile,
  onOpen,
  onPhotoClick,
  onBannerClick,
}: DashboardProps) {
  const { percent, items } = computeStrength(profile);
  const remaining = items.filter((i) => !i.done);

  const groups: { label: string; items: MenuItem[] }[] = [
    {
      label: "Profile",
      items: [
        {
          key: "basic",
          icon: <UserRound className="size-[18px]" />,
          title: "Basic Information",
          subtitle: "Name, username, location, DOB",
        },
        {
          key: "professional",
          icon: <Sparkles className="size-[18px]" />,
          title: "Professional Profile",
          subtitle: `${profile.professions.length} professions · ${profile.specialties.length} specialties`,
        },
        {
          key: "about",
          icon: <Wand2 className="size-[18px]" />,
          title: "About Me",
          subtitle: profile.about ? "Your story in your words" : "Not added yet",
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
          subtitle: `${profile.skills.length} added`,
        },
        {
          key: "portfolio",
          icon: <Grid2x2 className="size-[18px]" />,
          title: "Portfolio",
          subtitle: `${profile.portfolio.length} items`,
        },
        {
          key: "experience",
          icon: <Briefcase className="size-[18px]" />,
          title: "Work Experience",
          subtitle: `${profile.experience.length} entries`,
        },
        {
          key: "credits",
          icon: <Clapperboard className="size-[18px]" />,
          title: "Credits",
          subtitle: `${profile.credits.length} projects`,
        },
        {
          key: "awards",
          icon: <Trophy className="size-[18px]" />,
          title: "Awards",
          subtitle: `${profile.awards.length} recognitions`,
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
          subtitle: `${profile.physicalAttributes.height_cm ?? "—"} cm · ${profile.physicalAttributes.body_type ?? "—"}`,
        },
        {
          key: "languages",
          icon: <Languages className="size-[18px]" />,
          title: "Languages & Accents",
          subtitle:
            profile.languages.map((l) => l.name).join(", ") || "Not added yet",
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
          subtitle: `${Object.values(profile.socialLinks).filter((l) => Boolean(l.url)).length} connected`,
        },
        {
          key: "documents",
          icon: <FileText className="size-[18px]" />,
          title: "Documents",
          subtitle: `${[
            profile.documents.resume_url,
            profile.documents.portfolio_pdf_url,
            profile.documents.measurements_sheet_url,
          ].filter(Boolean).length} uploaded`,
        },
        {
          key: "testimonials",
          icon: <MessageSquareQuote className="size-[18px]" />,
          title: "Testimonials",
          subtitle: `${profile.testimonials.filter((t) => t.approvedByTalent).length} approved`,
        },
        {
          key: "privacy",
          icon: <Lock className="size-[18px]" />,
          title: "Privacy & Visibility",
          subtitle: `Profile is ${profile.privacyMode}`,
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
        <Card className="cursor-pointer" onClick={() => onOpen("strength")}>
          <CardContent className="flex items-center gap-4 py-4">
            <Ring percent={percent} />
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-extrabold">Profile Strength</p>
              <p className="mt-0.5 text-[12.5px] leading-snug text-muted-foreground">
                {remaining.length === 0
                  ? "Your profile is complete"
                  : `${remaining.length} steps left · next: ${remaining[0]?.label}`}
              </p>
            </div>
            <ChevronRight className="size-[18px] shrink-0 text-muted-foreground/70" />
          </CardContent>
        </Card>
      </div>

      {/* Groups */}
      <div className="space-y-6 px-4 pt-4 pb-24">
        {groups.map((g) => (
          <div key={g.label}>
            <p className="mb-2 px-1 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
              {g.label}
            </p>
            <Card className="divide-y p-0">
              {g.items.map((it) => {
                const content = (
                  <>
                    <span className="text-muted-foreground">{it.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14.5px] font-semibold">{it.title}</p>
                      <p className="truncate text-[12.5px] text-muted-foreground">
                        {it.subtitle}
                      </p>
                    </div>
                    <ChevronRight className="size-[18px] shrink-0 text-muted-foreground/70" />
                  </>
                );

                return it.href ? (
                  <Link
                    key={it.key}
                    href={it.href}
                    className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/40"
                  >
                    {content}
                  </Link>
                ) : (
                  <button
                    key={it.key}
                    onClick={() => onOpen(it.key as ScreenKey)}
                    className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/40"
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
  const tabs: { label: string; icon: ReactNode; onClick: () => void }[] = [
    { label: "Overview", icon: <Home className="size-[19px]" />, onClick: () => {} },
    { label: "Portfolio", icon: <ImageIcon className="size-[19px]" />, onClick: () => onOpen("portfolio") },
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
