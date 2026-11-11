"use client";

import { createElement, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Building2,
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ExternalLink,
  Eye,
  Facebook,
  Globe2,
  type LucideIcon,
  ImageIcon,
  Images,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Navigation,
  Package as PackageIcon,
  Phone,
  ShieldCheck,
  Share2,
  Sparkles,
  Star,
  UserRound,
  UsersRound,
  Youtube,
} from "lucide-react";
import { findProviderSkill } from "@/data/provider-skills";
import { SKILL_TONE_STYLES } from "@/data/skills";
import type {
  ProviderRatingSummary,
  PublicProviderPackage,
  PublicProviderProduct,
  PublicProviderProfile,
} from "@/lib/api/marketplace";
import type { ShareProfileTarget } from "@/lib/share";
import { ContactProviderButton } from "@/components/marketplace/contact-provider-button";
import { ShareProfileButton } from "@/components/shared/share-profile-button";
import { HeroGallery } from "@/components/marketplace/hero-gallery";
import {
  PackageCard,
  StatTile,
} from "@/components/marketplace/provider-profile-components";
import { ProviderProfileHeader } from "@/components/marketplace/provider-profile-header";
import { formatAmount, formatShortPrice } from "@/components/marketplace/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProviderProfileViewProps {
  profile: PublicProviderProfile;
  ratingSummary?: ProviderRatingSummary | null;
  variant?: "public" | "preview";
  inquirySlot?: (
    selection: ProviderQuoteSelection | null,
  ) => React.ReactNode;
  reviewsSlot?: React.ReactNode;
}

interface ProviderQuoteSelection {
  serviceId?: string;
  packageTitle?: string;
}

const PROVIDER_TYPE_LABELS: Record<string, string> = {
  individual: "Individual / Freelancer",
  company: "Company / Business",
  studio: "Studio / Venue",
  agency: "Agency / Service Firm",
  equipment: "Equipment Provider",
  other: "Specialized Services",
};

const PROVIDER_TYPE_ICONS: Record<string, LucideIcon> = {
  individual: UserRound,
  company: Building2,
  studio: ImageIcon,
  agency: BriefcaseBusiness,
  equipment: PackageIcon,
  other: Sparkles,
};

function providerTypeLabel(value?: string) {
  if (!value) return "";
  return (
    PROVIDER_TYPE_LABELS[value.toLowerCase()] ??
    value.charAt(0).toUpperCase() + value.slice(1)
  );
}

function providerTypeIcon(value?: string): LucideIcon {
  return value ? PROVIDER_TYPE_ICONS[value.toLowerCase()] ?? Sparkles : Sparkles;
}

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "P"
  );
}

function SectionHeading({
  icon: Icon,
  title,
  action,
}: {
  icon: LucideIcon;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
        {title}
      </h2>
      {action}
    </div>
  );
}

function Breadcrumbs({ profile, name }: { profile: PublicProviderProfile; name: string }) {
  return (
    <nav
      className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground sm:text-sm"
      aria-label="Breadcrumb"
    >
      <Link href="/" className="transition-colors hover:text-foreground">
        Home
      </Link>
      <ChevronRight className="size-3.5 shrink-0" aria-hidden />
      <Link href="/providers" className="transition-colors hover:text-foreground">
        Providers
      </Link>
      {profile.categories[0] && (
        <>
          <ChevronRight className="size-3.5 shrink-0" aria-hidden />
          <Link
            href={`/providers?category=${encodeURIComponent(profile.categories[0])}`}
            className="transition-colors hover:text-foreground"
          >
            {profile.categories[0]}
          </Link>
        </>
      )}
      <ChevronRight className="size-3.5 shrink-0" aria-hidden />
      <span className="truncate font-medium text-foreground">{name}</span>
    </nav>
  );
}

function Identity({
  profile,
  name,
  location,
  ratingSummary,
  isPreview,
  onRequestQuote,
  shareTarget,
}: {
  profile: PublicProviderProfile;
  name: string;
  location: string;
  ratingSummary?: ProviderRatingSummary | null;
  isPreview: boolean;
  onRequestQuote: () => void;
  shareTarget: ShareProfileTarget;
}) {
  const ratingCount = ratingSummary?.review_count ?? 0;
  const averageRating = ratingSummary?.average_rating;
  const typeLabel = providerTypeLabel(profile.provider_type);
  const TypeIcon = providerTypeIcon(profile.provider_type);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const visibleCategories = showAllCategories
    ? profile.categories
    : profile.categories.slice(0, 3);
  const hiddenCategoryCount = profile.categories.length - visibleCategories.length;
  const credibilityTiles: {
    label: string;
    value: string;
    icon: LucideIcon;
  }[] = [];

  if (profile.experience_years != null) {
    credibilityTiles.push({
      label: "Experience",
      value: `${profile.experience_years} years`,
      icon: BriefcaseBusiness,
    });
  }
  if (profile.team_size != null) {
    credibilityTiles.push({
      label: "Team",
      value: `${profile.team_size} members`,
      icon: UserRound,
    });
  }
  if (profile.equipment_summary?.trim()) {
    credibilityTiles.push({
      label: "Equipment",
      value: profile.equipment_summary,
      icon: Images,
    });
  }

  const verificationStatus = [
    profile.pan_verified == null
      ? null
      : `PAN ${profile.pan_verified ? "verified" : "not verified"}`,
    profile.gst_verified == null
      ? null
      : `GST ${profile.gst_verified ? "verified" : "not verified"}`,
  ].filter((status): status is string => status !== null);
  if (verificationStatus.length > 0) {
    credibilityTiles.push({
      label: "PAN / GST",
      value: verificationStatus.join(" · "),
      icon: Globe2,
    });
  }

  return (
    <div className="relative z-10 px-4 pb-4 pt-1 sm:px-7 sm:pb-7">
      <div className="flex flex-col gap-3">
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          {profile.profile_photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.profile_photo}
              alt={`${name} profile photo`}
              className="-mt-9 size-[72px] shrink-0 rounded-full border-4 border-provider-surface object-cover shadow-provider-card sm:-mt-12 sm:size-24"
            />
          ) : (
            <span className="-mt-9 flex size-[72px] shrink-0 items-center justify-center rounded-full border-4 border-provider-surface bg-provider-tint text-2xl font-bold text-provider-primary shadow-provider-card sm:-mt-12 sm:size-24 sm:text-3xl">
              {initials(name)}
            </span>
          )}

          <div className="min-w-0 pb-1">
            <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
              {name}
            </h1>
            {profile.business_name && profile.business_name !== name && (
              <p className="text-sm text-provider-muted">
                {profile.business_name}
              </p>
            )}
            {!profile.business_name && typeLabel && (
              <p className="flex items-center gap-1.5 text-sm text-provider-muted">
                {createElement(TypeIcon, {
                  className: "size-3.5",
                  "aria-hidden": true,
                })}
                {typeLabel}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            {ratingCount > 0 && averageRating != null && (
              <span className="inline-flex items-center gap-1.5">
                <Star
                  className="size-4 fill-provider-star text-provider-star"
                  aria-hidden="true"
                />
                <span className="font-semibold">{averageRating.toFixed(1)}</span>
                <span className="text-provider-muted">
                  ({ratingCount} review{ratingCount === 1 ? "" : "s"})
                </span>
              </span>
            )}
            {profile.project_count != null && (
              <span className="text-provider-muted">
                {profile.project_count} project
                {profile.project_count === 1 ? "" : "s"}
              </span>
            )}
          </div>
          {location && (
            <p className="flex items-center gap-1 text-sm text-provider-muted">
              <MapPin className="size-4 shrink-0" />
              {location}
            </p>
          )}
          {profile.tagline && (
            <p className="pt-1 text-sm leading-relaxed text-provider-foreground">
              {profile.tagline}
            </p>
          )}
        </div>

        {profile.categories.length > 0 && (
          <div
            className={`flex items-center gap-2 ${
              showAllCategories
                ? "flex-wrap"
                : "flex-nowrap overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            }`}
          >
            {visibleCategories.map((category) => {
              return (
                <Badge
                  key={category}
                  variant="secondary"
                  className="rounded-full border border-violet-200/80 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-800 shadow-none transition-colors hover:border-violet-300 hover:bg-violet-100"
                >
                  {category}
                </Badge>
              );
            })}
            {hiddenCategoryCount > 0 && (
              <button
                type="button"
                aria-expanded={showAllCategories}
                aria-label={`Show ${hiddenCategoryCount} more categor${hiddenCategoryCount === 1 ? "y" : "ies"}`}
                onClick={() => setShowAllCategories(true)}
                className="inline-flex min-h-7 items-center rounded-full border border-violet-200/80 bg-violet-50 px-3 text-xs font-semibold text-violet-800 transition-colors hover:border-violet-300 hover:bg-violet-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-provider-primary focus-visible:ring-offset-2"
              >
                +{hiddenCategoryCount}
              </button>
            )}
          </div>
        )}

        {!isPreview && (
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={onRequestQuote}
              className="h-11 min-w-0 flex-[1.2] rounded-full bg-gradient-to-r from-provider-primary-strong to-provider-primary px-2 text-xs font-semibold shadow-provider-action hover:brightness-105 sm:text-sm"
            >
              Request Quote
            </Button>
            <ContactProviderButton
              providerSlug={profile.slug}
              providerName={name}
              buttonLabel="Chat"
              className="h-11 min-w-0 flex-1 rounded-full border-provider-border bg-provider-surface px-2 text-xs text-provider-foreground hover:bg-provider-canvas sm:text-sm"
              variant="outline"
            />
            <ShareProfileButton
              target={shareTarget}
              source="public_provider_profile"
              directDestination="whatsapp"
              className="inline-flex h-11 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full border border-provider-border bg-provider-surface px-2 text-xs font-medium text-provider-foreground transition-colors hover:bg-provider-canvas sm:text-sm"
            >
              <Share2 className="size-4 shrink-0" aria-hidden="true" />
              Share
            </ShareProfileButton>
          </div>
        )}
        {!isPreview && profile.public_phone && (
          <Button
            asChild
            variant="outline"
            className="h-10 w-full rounded-full border-provider-border bg-provider-surface text-provider-foreground hover:bg-provider-canvas"
          >
            <a href={`tel:${profile.public_phone}`}>
              <Phone className="size-4" />
              Call
            </a>
          </Button>
        )}
      </div>

      {credibilityTiles.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {credibilityTiles.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="flex min-w-0 items-center gap-2 rounded-xl border border-provider-border bg-provider-surface px-2 py-2 shadow-sm"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-provider-tint text-provider-primary">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-semibold text-provider-foreground">
                  {value}
                </span>
                <span className="mt-0.5 block text-[10px] text-provider-muted">
                  {label}
                </span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AboutSection({ profile }: { profile: PublicProviderProfile }) {
  const [expanded, setExpanded] = useState(false);
  const [skillsExpanded, setSkillsExpanded] = useState(false);
  const [hasMoreSkills, setHasMoreSkills] = useState(false);
  const skillsContainerRef = useRef<HTMLDivElement>(null);
  const about = profile.about?.trim();
  const skills = profile.skills.filter(Boolean);
  const skillsKey = skills.join("\0");

  useEffect(() => {
    const container = skillsContainerRef.current;
    if (!container || skillsExpanded) return;

    const measureOverflow = () => {
      setHasMoreSkills(container.scrollHeight > container.clientHeight + 1);
    };

    measureOverflow();
    const observer = new ResizeObserver(measureOverflow);
    observer.observe(container);
    return () => observer.disconnect();
  }, [skillsExpanded, skillsKey]);

  if (!about && !profile.tagline && skills.length === 0) return null;

  return (
    <section className="relative overflow-hidden rounded-provider-card border border-violet-100 bg-gradient-to-br from-white via-white to-violet-50/80 p-5 shadow-provider-card sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-14 size-40 rounded-full bg-violet-100/60 blur-3xl"
      />
      <div className="relative">
        <SectionHeading icon={UserRound} title="About" />
        {profile.tagline && (
          <p className="mt-4 rounded-xl border border-violet-100 bg-white/80 px-4 py-3 text-sm font-semibold leading-relaxed text-provider-foreground">
            {profile.tagline}
          </p>
        )}
        {about && (
          <div className="mt-4">
            <p
              className={`whitespace-pre-line text-sm leading-7 text-provider-foreground/90 sm:text-[15px] ${expanded ? "" : "line-clamp-4"}`}
            >
              {about}
            </p>
            {about.length > 240 && (
              <Button
                type="button"
                variant="link"
                className="mt-1 min-h-10 h-auto px-0 text-sm font-semibold"
                aria-expanded={expanded}
                onClick={() => setExpanded((value) => !value)}
              >
                Read {expanded ? "Less" : "More"}
              </Button>
            )}
          </div>
        )}
        {skills.length > 0 && (
          <div className="mt-5 border-t border-provider-border/70 pt-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-provider-foreground">
                <Sparkles
                  className="size-4 text-provider-primary"
                  aria-hidden="true"
                />
                Skills & specialties
              </h3>
              <span className="shrink-0 rounded-full bg-provider-tint px-2.5 py-1 text-xs font-medium text-provider-primary">
                {skills.length}
              </span>
            </div>
            <div
              id="provider-profile-skills"
              ref={skillsContainerRef}
              className={`flex flex-wrap gap-2 ${skillsExpanded ? "" : "max-h-[72px] overflow-hidden"}`}
            >
              {skills.map((skill) => {
                const definition = findProviderSkill(skill);
                const SkillIcon = definition?.icon ?? Sparkles;
                const tone = SKILL_TONE_STYLES[definition?.tone ?? "violet"];
                return (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-provider-border/60 px-2.5 py-1.5 text-xs font-medium shadow-none transition-colors hover:border-provider-primary/30"
                    style={{
                      backgroundColor: tone.background,
                      color: tone.foreground,
                    }}
                  >
                    {createElement(SkillIcon, {
                      className: "size-3.5",
                      "aria-hidden": true,
                    })}
                    {skill}
                  </Badge>
                );
              })}
            </div>
            {hasMoreSkills && (
              <Button
                type="button"
                variant="outline"
                className="mt-3 h-9 rounded-full border-provider-border bg-white px-3.5 text-xs font-semibold text-provider-foreground shadow-sm hover:border-provider-primary/40 hover:bg-provider-tint hover:text-provider-primary"
                aria-expanded={skillsExpanded}
                aria-controls="provider-profile-skills"
                onClick={() => setSkillsExpanded((value) => !value)}
              >
                {skillsExpanded ? "Show fewer skills" : "View all skills"}
                {skillsExpanded ? (
                  <ChevronUp className="size-3.5" aria-hidden="true" />
                ) : (
                  <ChevronDown className="size-3.5" aria-hidden="true" />
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function OverviewSection({
  profile,
  name,
  onRequestQuote,
  onViewProducts,
}: {
  profile: PublicProviderProfile;
  name: string;
  onRequestQuote: () => void;
  onViewProducts: () => void;
}) {
  const reasons = profile.choose_us_reasons?.filter(Boolean) ?? [];
  const members =
    profile.team_members?.filter(
      (member) => member.name?.trim() || member.avatar_url,
    ) ?? [];
  const memberCount = profile.team_members_count ?? members.length;
  const productsCount = profile.products_count ?? profile.products?.length ?? 0;
  const stats: {
    label: string;
    value: number;
    icon: LucideIcon;
    onClick?: () => void;
    clickLabel?: string;
  }[] = [
    ...(profile.services_count > 0
      ? [{ label: "Services", value: profile.services_count, icon: BriefcaseBusiness }]
      : []),
    ...(profile.skills.length > 0
      ? [{ label: "Specialties", value: profile.skills.length, icon: Sparkles }]
      : []),
    ...(profile.portfolio.length > 0
      ? [{ label: "Portfolio", value: profile.portfolio.length, icon: Images }]
      : []),
    ...(productsCount > 0
      ? [
          {
            label: "Products",
            value: productsCount,
            icon: PackageIcon,
            onClick: onViewProducts,
            clickLabel: "View products",
          },
        ]
      : []),
    ...(profile.project_count != null
      ? [{ label: "Projects", value: profile.project_count, icon: BadgeCheck }]
      : []),
  ];

  return (
    <div className="space-y-5">
      <AboutSection profile={profile} />

      {stats.length > 0 && (
        <section
          aria-label="Provider statistics"
          className="grid grid-cols-2 gap-2 sm:grid-cols-4"
        >
          {stats.map((stat) => (
            <StatTile key={stat.label} {...stat} />
          ))}
        </section>
      )}

      {reasons.length > 0 && (
        <section className="rounded-provider-card border border-emerald-100 bg-gradient-to-br from-emerald-50/70 via-white to-white p-5 shadow-provider-card sm:p-6">
          <SectionHeading icon={BadgeCheck} title="Why Choose Us" />
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {reasons.map((reason) => (
              <li
                key={reason}
                className="flex items-start gap-2.5 rounded-xl border border-emerald-100/80 bg-white/80 p-3 text-sm text-provider-foreground shadow-sm"
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                  <BadgeCheck className="size-4" aria-hidden="true" />
                </span>
                {reason}
              </li>
            ))}
          </ul>
        </section>
      )}

      {members.length > 0 && (
        <section className="rounded-provider-card border border-amber-100 bg-gradient-to-br from-amber-50/70 via-white to-white p-5 shadow-provider-card sm:p-6">
          <SectionHeading icon={UsersRound} title="Meet Our Team" />
          <div className="mt-4 flex items-center justify-between gap-4">
            <AvatarGroup className="*:data-[slot=avatar]:ring-provider-surface">
              {members.slice(0, 4).map((member, index) => (
                <Avatar
                  key={`${member.name ?? "member"}-${index}`}
                  aria-label={member.name ?? "Team member"}
                  className="size-11"
                >
                  {member.avatar_url && (
                    <AvatarImage
                      src={member.avatar_url}
                      alt={member.name ?? ""}
                    />
                  )}
                  <AvatarFallback>
                    {member.name?.slice(0, 1).toUpperCase() ?? "?"}
                  </AvatarFallback>
                </Avatar>
              ))}
              {memberCount > 4 && (
                <AvatarGroupCount className="size-11 bg-provider-tint font-semibold text-provider-primary ring-provider-surface">
                  +{memberCount - 4}
                </AvatarGroupCount>
              )}
            </AvatarGroup>
            {memberCount > 0 && (
              <p className="text-sm text-provider-muted">
                {memberCount} team members
              </p>
            )}
          </div>
        </section>
      )}

      <section className="grid gap-3 rounded-provider-card bg-provider-tint p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-6">
        <div>
          <h2 className="text-lg font-bold text-provider-foreground">
            Let&apos;s create something together
          </h2>
          <p className="mt-1 text-sm text-provider-muted">
            Tell {name} about your project and get a quote.
          </p>
        </div>
        <Button
          type="button"
          onClick={onRequestQuote}
          className="h-11 rounded-full bg-gradient-to-r from-provider-primary-strong to-provider-primary shadow-provider-action"
        >
          Request Quote
        </Button>
      </section>
    </div>
  );
}

function ServiceRow({
  service,
  onRequestQuote,
  onQuickView,
}: {
  service: PublicProviderProfile["services"][number];
  onRequestQuote: () => void;
  onQuickView: () => void;
}) {
  return (
    <article className="group min-w-0 overflow-hidden rounded-[24px] border border-provider-border/80 bg-provider-surface shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-provider-card">
      <button
        type="button"
        onClick={onQuickView}
        aria-label={`Quick view ${service.title}`}
        className="relative block aspect-square w-full overflow-hidden bg-gradient-to-br from-provider-tint via-violet-100 to-provider-primary/30 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      >
          {service.images?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={service.images[0]}
              alt={`${service.title} preview`}
              className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <span className="absolute inset-0 grid place-items-center text-provider-primary/70">
              <BriefcaseBusiness className="size-10" aria-hidden="true" />
            </span>
          )}
          <span className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" />
          {service.category && (
            <span className="absolute left-3 top-3 max-w-[calc(100%-1.5rem)] truncate rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-provider-primary shadow-sm backdrop-blur-sm">
              {service.category}
            </span>
          )}
          {service.images && service.images.length > 1 && (
            <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-1 text-[10px] font-semibold text-white">
              <Images className="size-3" aria-hidden="true" />
              {service.images.length}
            </span>
          )}
      </button>
      <div className="flex min-h-40 flex-col p-3 sm:p-4">
        <Link
          href={`/services/${service.id}`}
          className="line-clamp-2 text-sm font-bold leading-snug text-provider-foreground transition-colors hover:text-provider-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-base"
        >
          {service.title}
        </Link>
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-provider-muted sm:text-sm">
          {service.short_description || service.description}
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-provider-border/70 pt-3">
          <span className="min-w-0 truncate text-xs font-bold text-provider-primary sm:text-sm">
            {formatShortPrice(service.indicative_price)}
          </span>
          <Button
            type="button"
            variant="outline"
            className="size-9 shrink-0 rounded-full border-provider-border p-0 text-provider-primary shadow-sm hover:border-provider-primary/30 hover:bg-provider-tint"
            aria-label={`Request a quote for ${service.title}`}
            onClick={onRequestQuote}
          >
            <Sparkles className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </article>
  );
}

function FeaturedServiceCard({
  service,
  onRequestQuote,
  onQuickView,
}: {
  service: PublicProviderProfile["services"][number];
  onRequestQuote: () => void;
  onQuickView: () => void;
}) {
  return (
    <article className="overflow-hidden rounded-[28px] border border-provider-border bg-provider-surface shadow-provider-card">
      <button
        type="button"
        onClick={onQuickView}
        aria-label={`Quick view ${service.title}`}
        className="group relative block aspect-[1.35] w-full overflow-hidden bg-gradient-to-br from-provider-primary-strong via-provider-primary to-fuchsia-500 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:aspect-[2.1]"
      >
        {service.images?.[0] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={service.images[0]}
            alt=""
            className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        <span className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-slate-950/10" />
        <span className="absolute inset-0 flex flex-col justify-between p-4 sm:p-6">
          <span className="flex items-start justify-between gap-2">
            {service.category && (
              <span className="max-w-[75%] truncate rounded-full border border-white/25 bg-black/25 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white shadow-sm backdrop-blur-md">
                {service.category}
              </span>
            )}
            {service.images && service.images.length > 1 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/35 px-2.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                <Images className="size-3.5" aria-hidden="true" />
                {service.images.length} photos
              </span>
            )}
          </span>
          <span className="block max-w-xl">
            <span className="block text-xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl">
              {service.title}
            </span>
          </span>
        </span>
      </button>
      <div className="p-4 sm:p-5">
        <p className="line-clamp-3 text-sm leading-relaxed text-provider-muted sm:text-base">
          {service.short_description || service.description}
        </p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-provider-border/70 pt-4">
          <span className="min-w-0">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-provider-muted">
              Starting at
            </span>
            <span className="mt-0.5 block truncate text-xl font-extrabold text-provider-foreground sm:text-2xl">
              {formatShortPrice(service.indicative_price)}
            </span>
          </span>
          <div className="flex shrink-0 items-center gap-3">
            <Link
              href={`/services/${service.id}`}
              className="text-xs font-semibold text-provider-muted underline-offset-4 hover:text-provider-primary hover:underline"
            >
              Full details
            </Link>
            <Button
              type="button"
              onClick={onRequestQuote}
              className="h-11 rounded-full bg-gradient-to-r from-provider-primary-strong to-provider-primary px-4 font-semibold text-white shadow-provider-action transition hover:-translate-y-0.5 hover:brightness-105 sm:px-5"
            >
              <Sparkles className="size-4" aria-hidden="true" />
              Get a quote
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

function ServicesSection({
  profile,
  ratingSummary,
  onRequestQuote,
  onQuickView,
}: {
  profile: PublicProviderProfile;
  ratingSummary?: ProviderRatingSummary | null;
  onRequestQuote: (serviceId?: string) => void;
  onQuickView: (service: PublicProviderProfile["services"][number]) => void;
}) {
  if (profile.services.length === 0) return null;

  const stats = [
    { label: "Services", value: String(profile.services.length) },
    ...(profile.project_count && profile.project_count > 0
      ? [{ label: "Projects", value: String(profile.project_count) }]
      : []),
    ...(ratingSummary?.average_rating != null
      ? [{ label: "Rating", value: ratingSummary.average_rating.toFixed(1) }]
      : []),
    ...(profile.experience_years && profile.experience_years > 0
      ? [{ label: "Years experience", value: String(profile.experience_years) }]
      : []),
  ];

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-provider-border bg-gradient-to-b from-provider-surface to-provider-canvas px-3 py-6 shadow-provider-card sm:px-5 sm:py-8">
      <div className="relative">
        <div className="flex items-end justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-provider-primary sm:text-xs">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Our services
            </span>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-provider-foreground sm:text-3xl">
              Find the right service
            </h2>
          </div>
          <span className="shrink-0 rounded-full border border-provider-border bg-provider-surface px-3 py-1.5 text-xs font-bold text-provider-primary shadow-sm">
            {profile.services.length} {profile.services.length === 1 ? "service" : "services"}
          </span>
        </div>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-provider-muted sm:text-base">
          Explore the services available from {profile.display_name || profile.business_name || "this provider"}.
        </p>
        <div className="mt-5">
          <FeaturedServiceCard
            service={profile.services[0]}
            onRequestQuote={() => onRequestQuote(profile.services[0].id)}
            onQuickView={() => onQuickView(profile.services[0])}
          />
        </div>
        {profile.services.length > 1 && (
          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-provider-foreground sm:text-base">
                More services
              </h3>
              <span className="text-xs font-medium text-provider-muted">
                {profile.services.length - 1} more
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {profile.services.slice(1).map((service) => (
                <ServiceRow
                  key={service.id}
                  service={service}
                  onRequestQuote={() => onRequestQuote(service.id)}
                  onQuickView={() => onQuickView(service)}
                />
              ))}
            </div>
          </div>
        )}
        {stats.length > 0 && (
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-provider-border/80 bg-provider-surface px-3 py-3 text-center shadow-sm"
              >
                <span className="block text-lg font-extrabold text-provider-primary sm:text-xl">
                  {stat.value}
                </span>
                <span className="mt-0.5 block text-[10px] font-medium text-provider-muted sm:text-xs">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-40 border-t border-provider-border bg-provider-surface/95 p-3 backdrop-blur-xl md:static md:mt-4 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
        <Button
          type="button"
          onClick={() => onRequestQuote()}
          className="mx-auto h-11 w-full max-w-6xl rounded-full shadow-provider-action"
        >
          <Sparkles className="size-4" />
          Request Custom Quote
        </Button>
      </div>
    </section>
  );
}

const SERVICE_DELIVERY_LABELS: Record<
  NonNullable<PublicProviderProfile["services"][number]["delivery_time"]>,
  string
> = {
  "1-3_days": "1–3 days",
  "5-10_days": "5–10 days",
  "2-4_weeks": "2–4 weeks",
  "1_month_or_more": "1 month or more",
  custom: "Custom timeline",
};

const SERVICE_EQUIPMENT_LABELS: Record<
  NonNullable<PublicProviderProfile["services"][number]["equipment"]>,
  string
> = {
  provider: "Provided by the provider",
  client: "Provided by the client",
  both: "Shared between both",
};

function ServiceQuickView({
  service,
  onRequestQuote,
}: {
  service: PublicProviderProfile["services"][number];
  onRequestQuote: () => void;
}) {
  const details = [
    ...(service.service_areas.filter(Boolean).length > 0
      ? [
          {
            label: "Service areas",
            value: service.service_areas.filter(Boolean).join(", "),
            icon: MapPin,
          },
        ]
      : []),
    ...(service.delivery_time
      ? [
          {
            label: "Delivery time",
            value: SERVICE_DELIVERY_LABELS[service.delivery_time],
            icon: Clock3,
          },
        ]
      : []),
    ...(service.team_size
      ? [
          {
            label: "Team size",
            value: `${service.team_size} people`,
            icon: UsersRound,
          },
        ]
      : []),
    ...(service.equipment
      ? [
          {
            label: "Equipment",
            value: SERVICE_EQUIPMENT_LABELS[service.equipment],
            icon: BriefcaseBusiness,
          },
        ]
      : []),
  ];

  return (
    <SheetContent
      side="bottom"
      className="provider-profile-theme max-h-[90dvh] gap-0 overflow-hidden rounded-t-[28px] border-provider-border bg-provider-surface p-0 text-provider-foreground"
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="relative h-44 shrink-0 overflow-hidden bg-gradient-to-br from-provider-primary-strong via-provider-primary to-fuchsia-500 sm:h-56">
          {service.images?.[0] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={service.images[0]}
              alt={`${service.title} preview`}
              className="size-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent" />
          {service.category && (
            <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-provider-primary shadow-sm">
              {service.category}
            </span>
          )}
        </div>
        <div className="px-5 pb-5 pt-4 sm:px-7">
          <SheetHeader className="p-0">
            <SheetTitle className="pr-10 text-xl font-extrabold text-provider-foreground sm:text-2xl">
              {service.title}
            </SheetTitle>
            <SheetDescription className="text-sm leading-relaxed text-provider-muted">
              {service.short_description || service.description}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-provider-canvas p-4">
            <span>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-provider-muted">
                Starting at
              </span>
              <span className="mt-0.5 block text-xl font-extrabold text-provider-primary">
                {formatShortPrice(service.indicative_price)}
              </span>
            </span>
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-provider-tint text-provider-primary">
              <BriefcaseBusiness className="size-5" aria-hidden="true" />
            </span>
          </div>
          {details.length > 0 && (
            <section className="mt-5">
              <h3 className="text-sm font-bold text-provider-foreground">
                Service details
              </h3>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {details.map(({ label, value, icon: Icon }) => (
                  <li
                    key={label}
                    className="flex min-w-0 items-start gap-2.5 rounded-xl border border-provider-border/80 bg-provider-surface p-3"
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-provider-tint text-provider-primary">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[10px] font-semibold uppercase tracking-wide text-provider-muted">
                        {label}
                      </span>
                      <span className="mt-0.5 block text-xs font-medium text-provider-foreground">
                        {value}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
      <div className="flex shrink-0 gap-3 border-t border-provider-border bg-provider-surface p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <Button variant="outline" className="h-11 flex-1 rounded-full" asChild>
          <Link href={`/services/${service.id}`}>View full details</Link>
        </Button>
        <Button
          type="button"
          onClick={onRequestQuote}
          className="h-11 flex-1 rounded-full shadow-provider-action"
        >
          Get a quote
        </Button>
      </div>
    </SheetContent>
  );
}

function ProductsSection({ profile }: { profile: PublicProviderProfile }) {
  const products = profile.products ?? [];
  if (products.length === 0) return null;
  const total = profile.products_count ?? products.length;

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/70 to-teal-50/50 px-4 py-6 shadow-provider-card sm:px-6 sm:py-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700 sm:text-xs">
            <PackageIcon className="size-3.5" aria-hidden="true" />
            Ready to buy
          </span>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-provider-foreground sm:text-3xl">
            Our Products
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-provider-muted sm:text-base">
            Physical and digital products from {profile.display_name || profile.business_name || "this provider"}.
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-emerald-200 bg-white/80 px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-sm">
          {total} {total === 1 ? "product" : "products"}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {total > products.length && (
        <p className="mt-4 text-center text-xs font-medium text-provider-muted">
          Showing {products.length} of {total} products
        </p>
      )}
    </section>
  );
}

function ProductCard({ product }: { product: PublicProviderProduct }) {
  const cover = product.images?.[0];
  const price =
    product.pricing?.mode === "variants"
      ? product.price_from ?? undefined
      : product.pricing?.price;
  const originalPrice =
    product.pricing?.mode === "single" ? product.pricing.original_price : undefined;

  return (
    <Link
      href={`/products/${encodeURIComponent(product.id)}`}
      aria-label={`View ${product.title}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-emerald-100/80 bg-provider-surface shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-provider-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <span className="relative block aspect-[1.3] overflow-hidden bg-gradient-to-br from-emerald-50 via-provider-canvas to-teal-50">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={`${product.title} preview`}
            className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-emerald-300">
            <PackageIcon className="size-9" aria-hidden="true" />
          </span>
        )}
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
          {product.product_type === "digital" ? "Digital" : "Physical"}
        </span>
      </span>
      <span className="flex flex-1 flex-col gap-1 p-3.5">
        {product.category && (
          <span className="block truncate text-[10px] font-semibold uppercase tracking-wide text-emerald-700 sm:text-[11px]">
            {product.category}
          </span>
        )}
        <span className="line-clamp-1 block text-sm font-bold text-provider-foreground sm:text-base">
          {product.title}
        </span>
        {product.short_description && (
          <span className="line-clamp-2 block text-xs leading-relaxed text-provider-muted sm:text-sm">
            {product.short_description}
          </span>
        )}
        <span className="mt-auto flex items-center justify-between gap-2 border-t border-emerald-100/70 pt-2.5">
          <span className="min-w-0">
            <span className="block truncate text-sm font-extrabold text-emerald-800">
              {price === undefined
                ? "View price"
                : formatAmount(price, product.pricing?.currency)}
            </span>
            {originalPrice !== undefined && originalPrice > (price ?? 0) && (
              <span className="block truncate text-[11px] text-provider-muted line-through">
                {formatAmount(originalPrice, product.pricing?.currency)}
              </span>
            )}
          </span>
          <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-provider-muted transition-colors group-hover:text-emerald-700">
            View details
            <ChevronRight className="size-3.5" aria-hidden="true" />
          </span>
        </span>
      </span>
    </Link>
  );
}

function PackagesSection({
  profile,
  onSelectPackage,
}: {
  profile: PublicProviderProfile;
  onSelectPackage: (providerPackage: PublicProviderPackage) => void;
}) {
  const packages = profile.packages?.filter(
    (providerPackage) => providerPackage.name?.trim(),
  );
  if (!packages?.length) return null;

  return (
    <section>
      <div className="flex items-end justify-between gap-2">
        <SectionHeading icon={PackageIcon} title="Popular Packages" />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3">
        {packages.map((providerPackage, index) => (
          <PackageCard
            key={providerPackage.id ?? providerPackage.name ?? index}
            package={providerPackage}
            onSelect={() => onSelectPackage(providerPackage)}
          />
        ))}
      </div>
    </section>
  );
}

function PortfolioSection({ profile }: { profile: PublicProviderProfile }) {
  if (profile.portfolio.length === 0) return null;

  return (
    <section>
      <SectionHeading
        icon={Images}
        title="Portfolio & work samples"
        action={
          <span className="text-sm text-provider-muted">
            {profile.portfolio.length} piece
            {profile.portfolio.length === 1 ? "" : "s"}
          </span>
        }
      />
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {profile.portfolio.map((item, index) => (
          <figure key={`${item.title}-${index}`} className="min-w-0">
            <div className="overflow-hidden rounded-xl border border-provider-border bg-provider-canvas">
              {item.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="aspect-square w-full object-cover transition-transform duration-300 hover:scale-105"
                />
              ) : (
                <div className="flex aspect-square items-center justify-center">
                  <ImageIcon className="size-8 text-provider-muted" />
                </div>
              )}
            </div>
            <figcaption className="mt-2 space-y-0.5">
              <p className="truncate text-sm font-semibold text-provider-foreground">
                {item.title}
              </p>
              {item.description && (
                <p className="line-clamp-2 text-xs text-provider-muted">
                  {item.description}
                </p>
              )}
              {item.link_url && (
                <a
                  href={item.link_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex min-h-11 items-center gap-1 text-xs font-medium text-provider-primary hover:underline"
                >
                  View project
                  <ExternalLink className="size-3" />
                </a>
              )}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function safeWebUrl(value?: string) {
  const url = value?.trim();
  return url && /^https?:\/\//i.test(url) ? url : null;
}

function mapUrl(
  profile: PublicProviderProfile,
  location: string,
  mode: "view" | "directions",
) {
  const { latitude, longitude } = profile.coordinates ?? {};
  const query =
    typeof latitude === "number" && typeof longitude === "number"
      ? `${latitude},${longitude}`
      : location;
  if (!query) return null;

  const path = mode === "directions" ? "dir" : "search";
  const param = mode === "directions" ? "destination" : "query";
  return `https://www.google.com/maps/${path}/?api=1&${param}=${encodeURIComponent(query)}`;
}

const SOCIAL_ICONS: Record<string, LucideIcon> = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
};

function LocationContactSection({
  profile,
  location,
}: {
  profile: PublicProviderProfile;
  location: string;
}) {
  const serviceAreas = profile.service_areas.filter(Boolean);
  const websiteUrl = safeWebUrl(profile.website_url);
  const hours =
    profile.business_hours?.filter(
      (item) =>
        item.day?.trim() &&
        (item.is_closed === true || item.open?.trim() || item.close?.trim()),
    ) ?? [];
  const viewMapUrl = mapUrl(profile, location, "view");
  const directionsUrl = mapUrl(profile, location, "directions");
  const hasContent = Boolean(
    location ||
      profile.map_image_url ||
      serviceAreas.length ||
      profile.public_phone ||
      profile.public_email ||
      websiteUrl ||
      hours.length ||
      profile.is_open_now != null,
  );
  if (!hasContent) return null;

  return (
    <section className="relative overflow-hidden rounded-provider-card border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-cyan-50/50 p-5 shadow-provider-card sm:p-6">
      <SectionHeading icon={MapPin} title="Location & Contact" />

      {profile.map_image_url && (
        <div className="relative mt-4 overflow-hidden rounded-xl border border-provider-border bg-provider-canvas">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profile.map_image_url}
            alt={`Map showing ${location || "the provider's area"}`}
            className="h-40 w-full object-cover"
          />
          {viewMapUrl && (
            <a
              href={viewMapUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="absolute right-2 top-2 inline-flex min-h-11 items-center gap-1.5 rounded-full bg-provider-surface/95 px-3 text-xs font-semibold text-provider-primary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ExternalLink className="size-3.5" />
              View on Map
            </a>
          )}
        </div>
      )}

      <div className="relative mt-4 space-y-4 text-sm">
        {location && (
          <div className="flex items-center gap-3 rounded-2xl bg-white/90 p-3.5 shadow-[0_6px_20px_rgba(14,116,144,0.08)] ring-1 ring-inset ring-sky-100/70">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-sky-100 to-cyan-100 text-sky-700">
              <MapPin className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-700">
                Based in
              </p>
              <p className="mt-0.5 font-semibold text-provider-foreground">
                {location}
              </p>
            </div>
            {viewMapUrl && !profile.map_image_url && (
              <a
                href={viewMapUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full bg-sky-50 px-3 text-xs font-semibold text-sky-700 transition-colors hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ExternalLink className="size-3.5" aria-hidden="true" />
                <span className="hidden min-[380px]:inline">Map</span>
              </a>
            )}
          </div>
        )}

        {viewMapUrl && profile.map_image_url && (
          <a
            href={viewMapUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-white/90 px-3 text-xs font-semibold text-sky-700 shadow-sm transition-colors hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ExternalLink className="size-3.5" aria-hidden="true" />
            View on Map
          </a>
        )}

        {serviceAreas.length > 0 && (
          <div className="rounded-2xl bg-sky-100/45 p-3.5">
            <p className="flex items-center gap-2 text-xs font-semibold text-provider-foreground">
              <Navigation className="size-3.5 text-sky-700" aria-hidden="true" />
              Service areas
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {serviceAreas.map((area) => (
                <Badge
                  key={area}
                  variant="secondary"
                  className="rounded-full bg-white px-2.5 py-1 font-medium text-sky-800 shadow-sm ring-1 ring-inset ring-sky-200/60 hover:bg-sky-50"
                >
                  {area}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {(profile.public_phone || profile.public_email || websiteUrl) && (
            <div className="rounded-2xl bg-indigo-50/75 p-3.5">
              <p className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-indigo-800">
                <Mail className="size-3.5" aria-hidden="true" />
                Contact information
              </p>
              {profile.public_phone && (
                <a
                  href={`tel:${profile.public_phone}`}
                  className="flex min-h-10 items-center gap-2 rounded-lg px-1 text-provider-foreground transition-colors hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Phone className="size-4 text-indigo-700" />
                  {profile.public_phone}
                </a>
              )}
              {profile.public_email && (
                <a
                  href={`mailto:${profile.public_email}`}
                  className="flex min-h-10 items-center gap-2 rounded-lg px-1 text-provider-foreground transition-colors hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Mail className="size-4 shrink-0 text-indigo-700" />
                  <span className="break-all">{profile.public_email}</span>
                </a>
              )}
              {websiteUrl && (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex min-h-10 items-center gap-2 rounded-lg px-1 text-provider-foreground transition-colors hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Globe2 className="size-4 shrink-0 text-indigo-700" />
                  <span className="break-all">{websiteUrl}</span>
                  <ExternalLink className="size-3.5 shrink-0" />
                </a>
              )}
            </div>
        )}

        {(hours.length > 0 || profile.is_open_now != null) && (
            <div className="rounded-2xl bg-amber-50/75 p-3.5">
              <div className="flex items-center justify-between gap-2">
                <p className="flex items-center gap-2 text-xs font-semibold text-amber-900">
                  <Clock3 className="size-4 text-amber-700" />
                  Business Hours
                </p>
                {profile.is_open_now != null && (
                  <Badge
                    className={
                      profile.is_open_now
                        ? "min-h-7 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                        : "min-h-7 rounded-full bg-provider-canvas text-provider-muted hover:bg-provider-canvas"
                    }
                  >
                    {profile.is_open_now ? "Open Now" : "Closed Now"}
                  </Badge>
                )}
              </div>
              {hours.length > 0 && (
                <dl className="mt-2 space-y-2">
                  {hours.map((item, index) => (
                    <div
                      key={`${item.day}-${index}`}
                      className="flex justify-between gap-3 rounded-lg px-2.5 py-2 text-xs odd:bg-white/75"
                    >
                      <dt className="text-provider-muted">{item.day}</dt>
                      <dd className="text-right text-provider-foreground">
                        {item.is_closed
                          ? "Closed"
                          : [item.open, item.close]
                              .filter(Boolean)
                              .join(" – ") || null}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
        )}

        {directionsUrl && (
          <div>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="flex min-h-11 items-center justify-between gap-2 rounded-xl bg-gradient-to-r from-sky-700 to-cyan-700 px-3 font-semibold text-white shadow-[0_8px_18px_rgba(14,116,144,0.2)] transition-[filter,transform] hover:brightness-105 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
            >
              <span className="flex items-center gap-2">
                <Navigation className="size-4" />
                Get Directions
              </span>
              <ExternalLink className="size-4 opacity-80" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

function BusinessDetailsSection({
  profile,
}: {
  profile: PublicProviderProfile;
}) {
  const typeLabel = providerTypeLabel(profile.provider_type);
  const languages = profile.languages?.filter(Boolean) ?? [];
  const certifications = profile.certifications?.filter(Boolean) ?? [];
  const socialLinks =
    profile.social_links?.filter(
      (item): item is { platform: string; url: string } =>
        Boolean(item.platform?.trim() && safeWebUrl(item.url)),
    ) ?? [];
  const hasDetails = Boolean(
    typeLabel ||
      profile.established_year != null ||
      profile.team_size != null ||
      profile.pan_verified != null ||
      profile.gst_verified != null ||
      languages.length ||
      certifications.length ||
      socialLinks.length,
  );
  if (!hasDetails) return null;

  return (
    <section className="relative overflow-hidden rounded-provider-card border border-violet-200/80 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50/50 p-5 shadow-provider-card sm:p-6">
      <SectionHeading icon={Building2} title="Business Details" />
      {typeLabel && (
        <div className="relative mt-4 flex items-center gap-3 overflow-hidden rounded-2xl border border-violet-100 bg-white/90 p-4 shadow-sm">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-4 -top-8 size-24 rounded-full bg-fuchsia-100/70 blur-2xl"
          />
          <span className="relative grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet-100 to-fuchsia-100 text-violet-700">
            {createElement(providerTypeIcon(profile.provider_type), {
              className: "size-5",
              "aria-hidden": true,
            })}
          </span>
          <div className="relative min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-violet-700">
              Provider type
            </p>
            <p className="mt-0.5 font-semibold text-provider-foreground">
              {typeLabel}
            </p>
          </div>
        </div>
      )}
      <dl className="mt-3 grid gap-2.5 text-sm [&>div]:rounded-xl [&>div]:border [&>div]:border-violet-100 [&>div]:bg-white/80 [&>div]:p-3 [&>div]:shadow-sm sm:grid-cols-2">
        {profile.established_year != null && (
          <div>
            <dt className="flex items-center gap-1.5 text-xs font-medium text-provider-muted">
              <CalendarDays className="size-4 text-provider-primary" />
              Established
            </dt>
            <dd className="mt-1 text-provider-foreground">
              {profile.established_year}
            </dd>
          </div>
        )}
        {profile.team_size != null && (
          <div>
            <dt className="flex items-center gap-1.5 text-xs font-medium text-provider-muted">
              <UsersRound className="size-4 text-provider-primary" />
              Team Size
            </dt>
            <dd className="mt-1 text-provider-foreground">
              {profile.team_size} members
            </dd>
          </div>
        )}
        {(profile.gst_verified != null || profile.pan_verified != null) && (
          <div>
            <dt className="flex items-center gap-1.5 text-xs font-medium text-provider-muted">
              <ShieldCheck className="size-4 text-provider-primary" />
              Tax & Identity
            </dt>
            <dd className="mt-1 flex flex-wrap gap-1.5">
              {profile.gst_verified != null && (
                <Badge variant="outline" className="rounded-full font-normal">
                  GST {profile.gst_verified ? "Verified" : "Not verified"}
                </Badge>
              )}
              {profile.pan_verified != null && (
                <Badge variant="outline" className="rounded-full font-normal">
                  PAN {profile.pan_verified ? "Verified" : "Not verified"}
                </Badge>
              )}
            </dd>
          </div>
        )}
        {languages.length > 0 && (
          <div>
            <dt className="text-xs font-medium text-provider-muted">
              Languages
            </dt>
            <dd className="mt-1 flex flex-wrap gap-1.5">
              {languages.map((language) => (
                <Badge
                  key={language}
                  variant="secondary"
                  className="rounded-full bg-provider-tint font-normal text-provider-foreground hover:bg-provider-tint"
                >
                  {language}
                </Badge>
              ))}
            </dd>
          </div>
        )}
        {certifications.length > 0 && (
          <div>
            <dt className="text-xs font-medium text-provider-muted">
              Certifications & Accreditations
            </dt>
            <dd className="mt-1 flex flex-wrap gap-1.5">
              {certifications.map((certification) => (
                <Badge
                  key={certification}
                  variant="outline"
                  className="rounded-full font-normal"
                >
                  {certification}
                </Badge>
              ))}
            </dd>
          </div>
        )}
        {socialLinks.length > 0 && (
          <div>
            <dt className="text-xs font-medium text-provider-muted">
              Social Media
            </dt>
            <dd className="mt-1 flex flex-wrap gap-2">
              {socialLinks.map((item) => {
                const Icon =
                  SOCIAL_ICONS[item.platform.toLowerCase()] ?? ExternalLink;
                const href = safeWebUrl(item.url);
                if (!href) return null;
                return (
                  <a
                    key={`${item.platform}-${href}`}
                    href={href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={`${item.platform} profile`}
                    title={item.platform}
                    className="grid size-11 place-items-center rounded-full border border-provider-border text-provider-primary hover:bg-provider-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </a>
                );
              })}
            </dd>
          </div>
        )}
      </dl>
    </section>
  );
}

function DetailsSection({
  profile,
  location,
}: {
  profile: PublicProviderProfile;
  location: string;
}) {
  return (
    <>
      <LocationContactSection profile={profile} location={location} />
      <BusinessDetailsSection profile={profile} />
    </>
  );
}

function PreviewNote() {
  return (
    <section className="rounded-2xl border border-dashed border-border bg-card p-5 text-sm text-muted-foreground">
      <p className="flex items-center gap-2 font-medium text-foreground">
        <Eye className="size-4 text-primary" />
        Preview mode
      </p>
      <p className="mt-2">
        This shows your last saved profile. Inquiry and review actions are hidden
        here so you can review the layout.
      </p>
    </section>
  );
}

export function ProviderProfileView({
  profile,
  ratingSummary,
  variant = "public",
  inquirySlot,
  reviewsSlot,
}: ProviderProfileViewProps) {
  const isPreview = variant === "preview";
  const [quoteSelection, setQuoteSelection] =
    useState<ProviderQuoteSelection | null>(null);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quickViewService, setQuickViewService] =
    useState<PublicProviderProfile["services"][number] | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const name =
    profile.display_name || profile.business_name || "Service provider";
  const location = [
    profile.location?.city,
    profile.location?.state,
    profile.location?.country,
  ]
    .filter(Boolean)
    .join(", ");
  const providerShareTarget: ShareProfileTarget = {
    role: "provider",
    slug: profile.slug,
    name,
    headline:
      profile.tagline ||
      providerTypeLabel(profile.provider_type) ||
      profile.categories.join(" · "),
    photoUrl: profile.profile_photo,
    isVerified: profile.is_verified,
    tags: profile.categories.slice(0, 4),
    statItems: [
      {
        icon: "briefcase",
        count: profile.services_count > 0 ? String(profile.services_count) : "—",
        label: "Services",
        note: "Listed",
      },
      {
        icon: "star",
        count:
          ratingSummary?.average_rating != null
            ? ratingSummary.average_rating.toFixed(1)
            : "—",
        label: "Rating",
        note:
          (ratingSummary?.review_count ?? 0) > 0
            ? `${ratingSummary?.review_count} Reviews`
            : "No reviews",
      },
      {
        icon: "play",
        count:
          profile.project_count != null && profile.project_count > 0
            ? String(profile.project_count)
            : "—",
        label: "Projects",
        note: "Completed",
      },
    ],
  };

  const hasPackages = Boolean(
    profile.packages?.some((providerPackage) => providerPackage.name?.trim()),
  );
  const productCount = profile.products_count ?? profile.products?.length ?? 0;
  const hasProducts = productCount > 0 && (profile.products?.length ?? 0) > 0;
  const tabs: { value: string; label: string; icon: LucideIcon }[] = [
    { value: "overview", label: "Overview", icon: UserRound },
    ...(profile.services.length > 0
      ? [{ value: "services", label: "Services", icon: BriefcaseBusiness }]
      : []),
    ...(hasProducts
      ? [{ value: "products", label: "Products", icon: PackageIcon }]
      : []),
    ...(profile.portfolio.length > 0
      ? [{ value: "portfolio", label: "Portfolio", icon: Images }]
      : []),
    ...(hasPackages
      ? [{ value: "packages", label: "Packages", icon: PackageIcon }]
      : []),
    ...(reviewsSlot
      ? [{ value: "reviews", label: "Reviews", icon: Star }]
      : []),
  ];

  function requestQuote(selection: ProviderQuoteSelection | null = null) {
    setQuoteSelection(selection);
    setQuoteOpen(true);
  }

  function selectPackage(providerPackage: PublicProviderPackage) {
    requestQuote({
      serviceId: providerPackage.service_id,
      packageTitle: providerPackage.name,
    });
  }

  const inquiryContent = inquirySlot?.(quoteSelection);

  const contents = (
    <>
      <TabsContent value="overview" className="mt-0">
        <OverviewSection
          profile={profile}
          name={name}
          onRequestQuote={() => requestQuote()}
          onViewProducts={() => setActiveTab("products")}
        />
      </TabsContent>
      {profile.services.length > 0 && (
        <TabsContent value="services" className="mt-0">
          <ServicesSection
            profile={profile}
            ratingSummary={ratingSummary}
            onRequestQuote={(serviceId) =>
              requestQuote(serviceId ? { serviceId } : null)
            }
            onQuickView={setQuickViewService}
          />
        </TabsContent>
      )}
      {hasProducts && (
        <TabsContent value="products" className="mt-0">
          <ProductsSection profile={profile} />
        </TabsContent>
      )}
      {profile.portfolio.length > 0 && (
        <TabsContent value="portfolio" className="mt-0">
          <PortfolioSection profile={profile} />
        </TabsContent>
      )}
      {hasPackages && (
        <TabsContent value="packages" className="mt-0">
          <PackagesSection profile={profile} onSelectPackage={selectPackage} />
        </TabsContent>
      )}
      {reviewsSlot && (
        <TabsContent value="reviews" className="mt-0">
          {reviewsSlot}
        </TabsContent>
      )}
    </>
  );

  const detailsAndInquiry = (
    <aside className="grid content-start gap-6">
      {isPreview && <PreviewNote />}
      <DetailsSection profile={profile} location={location} />
    </aside>
  );

  return (
    <div
      className={
        isPreview
          ? "space-y-5"
          : "provider-profile-theme -mx-4 -mt-4 space-y-4 sm:mx-0 sm:mt-0 sm:space-y-6"
      }
    >
      {!isPreview && (
        <ProviderProfileHeader />
      )}

      {!isPreview && (
        <div className="hidden sm:block">
          <Breadcrumbs profile={profile} name={name} />
        </div>
      )}

      <section className="overflow-hidden border border-provider-border bg-provider-surface shadow-provider-card sm:rounded-provider-card">
        <HeroGallery profile={profile} providerName={name} />

        <Identity
          profile={profile}
          name={name}
          location={location}
          ratingSummary={ratingSummary}
          isPreview={isPreview}
          onRequestQuote={() => requestQuote()}
          shareTarget={providerShareTarget}
        />
      </section>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="mt-2"
      >
        <div className="sticky top-14 z-30 -mx-1 px-1">
          <TabsList className="!h-auto min-h-[3.75rem] w-full justify-start gap-1 overflow-x-auto rounded-full border border-provider-border bg-provider-surface p-1.5 shadow-provider-card [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tabs.map(({ value, label, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="min-h-11 shrink-0 rounded-full px-3 text-xs font-semibold text-provider-muted data-[state=active]:bg-provider-primary data-[state=active]:text-white data-[state=active]:shadow-sm sm:px-4 sm:text-sm"
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div
          className={
            isPreview
              ? "mt-6 grid grid-cols-1 gap-5"
              : activeTab === "services" || activeTab === "products"
                ? "mt-6 grid grid-cols-1 gap-6"
              : "mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]"
          }
        >
          <div className="grid min-w-0 grid-cols-1 gap-6">{contents}</div>
          {activeTab !== "services" && detailsAndInquiry}
        </div>
      </Tabs>
      {inquiryContent && (
        <Sheet open={quoteOpen} onOpenChange={setQuoteOpen}>
          <SheetContent
            side="right"
            className="inset-y-0 right-0 h-dvh w-full max-w-none gap-0 overflow-hidden rounded-none border-0 p-0 [&_[data-slot=sheet-close]]:right-3 [&_[data-slot=sheet-close]]:top-3 [&_[data-slot=sheet-close]]:grid [&_[data-slot=sheet-close]]:size-11 [&_[data-slot=sheet-close]]:place-items-center sm:inset-y-4 sm:right-auto sm:left-1/2 sm:h-[calc(100dvh-2rem)] sm:max-w-2xl sm:-translate-x-1/2 sm:rounded-2xl sm:border"
          >
            {inquiryContent}
          </SheetContent>
        </Sheet>
      )}
      {quickViewService && (
        <Sheet
          open
          onOpenChange={(open) => {
            if (!open) setQuickViewService(null);
          }}
        >
          <ServiceQuickView
            service={quickViewService}
            onRequestQuote={() => {
              const serviceId = quickViewService.id;
              setQuickViewService(null);
              requestQuote({ serviceId });
            }}
          />
        </Sheet>
      )}
    </div>
  );
}
