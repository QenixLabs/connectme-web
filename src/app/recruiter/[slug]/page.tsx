"use client";

import { useParams } from "next/navigation";
import {
  Briefcase,
  ShieldCheck,
  BadgeCheck,
  Users,
  Building2,
  Calendar,
  Globe,
  Heart,
  MessageSquare,
  Share2,
  ChevronRight,
  MapPin,
  Zap,
  Trophy,
  UserPlus,
  Linkedin,
  MoreHorizontal,
  Lock,
  Sparkles,
  ExternalLink,
  Star,
} from "lucide-react";
import {
  usePublicRecruiterProfile,
  usePublicRecruiterCampaigns,
} from "@/hooks/use-recruiter-public-profile";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import { relativeTime } from "@/lib/utils";
import type { PublicRecruiterProfile, PublicCampaignSummary } from "@/lib/api/recruiter";

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

function IconTile({
  icon: Icon,
  size = "md",
}: {
  icon: typeof Zap;
  size?: "sm" | "md";
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 ${
        size === "sm" ? "size-9" : "size-11"
      }`}
    >
      <Icon
        className={
          size === "sm" ? "size-4 text-accent" : "size-5 text-accent"
        }
      />
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

function formatMemberSince(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  const d = new Date(dateString);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function getVerificationLabel(
  status: PublicRecruiterProfile["verification_status"]
): string {
  switch (status) {
    case "trusted_partner":
      return "Trusted Partner";
    case "enterprise":
      return "Enterprise";
    case "basic":
      return "Basic";
    default:
      return "Pending";
  }
}

function CampaignCard({ campaign }: { campaign: PublicCampaignSummary }) {
  const location = campaign.location?.city
    ? [campaign.location.city, campaign.location.state]
        .filter(Boolean)
        .join(", ")
    : null;

  return (
    <button className="flex w-full items-center gap-3 rounded-xl border border-border bg-secondary/50 p-3 text-left transition-colors hover:bg-secondary/80">
      <IconTile icon={Briefcase} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">{campaign.name}</span>
          {campaign.role_type && (
            <span className="rounded-md bg-accent/15 px-2 py-0.5 text-xs text-accent">
              {campaign.role_type}
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {relativeTime(campaign.created_at)}
          </span>
        </div>
        {location && (
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3.5" /> {location}
          </p>
        )}
      </div>
      <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
    </button>
  );
}

function EmptyTab({ icon: Icon, title }: { icon: typeof Sparkles; title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex size-12 items-center justify-center rounded-full border border-border bg-secondary">
        <Icon className="size-5 text-muted-foreground" />
      </div>
      <p className="mt-3 text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">Coming soon</p>
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
    usePublicRecruiterCampaigns(slug, 6);

  const isLoading = profileLoading || campaignsLoading;

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (profileError || !profile) {
    return <ProfileNotFound slug={slug} />;
  }

  const campaigns = campaignsData?.data ?? [];
  const verificationLabel = getVerificationLabel(profile.verification_status);

  const highlights = [
    {
      icon: ShieldCheck,
      title: "Identity Verified",
      sub: `Tier ${profile.verification_tier}`,
    },
    {
      icon: Zap,
      title: "Trust Score",
      sub: `${profile.trust_score}%`,
    },
    {
      icon: Trophy,
      title: "Recruiter Business",
      sub: `${profile.active_campaigns_count} active campaign${profile.active_campaigns_count !== 1 ? "s" : ""}`,
    },
    ...(profile.specialties?.length
      ? [
          {
            icon: UserPlus,
            title: "Specialties",
            sub: `${profile.specialties.length} specialit${profile.specialties.length !== 1 ? "ies" : "y"}`,
          },
        ]
      : []),
  ];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${profile.company_name} — Recruiter Profile`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <main className="min-h-screen bg-background pb-10">
      <div className="mx-auto max-w-md border-x border-border/60 bg-surface">
        {/* Cover */}
        <div className="relative h-44 bg-gradient-to-br from-accent/20 via-primary/10 to-violet/20">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-surface" />
          {profile.linkedin_company_url && (
            <a
              href={profile.linkedin_company_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-lg bg-foreground/95 text-background transition-opacity hover:opacity-90"
            >
              <Linkedin className="size-4" />
            </a>
          )}
        </div>

        <div className="px-5">
          {/* Logo */}
          <div className="relative z-10 -mt-20 flex size-28 flex-col items-center justify-center overflow-hidden rounded-2xl border border-accent/40 bg-card shadow-[var(--shadow-glow)]">
            {profile.profile_photo ? (
              <img
                src={profile.profile_photo}
                alt={profile.company_name}
                className="size-full object-cover"
              />
            ) : (
              <>
                <span className="text-4xl font-bold tracking-tight">
                  {getInitials(profile.company_name)}
                </span>
              </>
            )}
          </div>

          <h1 className="mt-5 text-[28px] font-bold leading-tight">
            {profile.company_name}
          </h1>

          <div className="mt-2 flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-accent/40 text-accent"
            >
              <ShieldCheck className="size-3" />
              {verificationLabel}
            </Badge>
            {profile.position && (
              <span className="text-sm text-muted-foreground">
                {profile.position}
              </span>
            )}
          </div>

          {profile.company_website && (
            <p className="mt-2 flex items-center gap-2 text-sm">
              <Globe className="size-4 text-muted-foreground" />
              <a
                href={profile.company_website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                {profile.company_website.replace(/^https?:\/\//, "")}
              </a>
              <ExternalLink className="size-3 text-muted-foreground" />
            </p>
          )}

          {/* Actions */}
          <div className="mt-4 flex gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="flex h-12 flex-1 rounded-xl border-accent/60 bg-accent/5 text-[15px] font-medium text-accent"
                  disabled
                >
                  <Heart className="size-4" /> Follow
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <Lock className="size-3" /> Login required
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="flex h-12 flex-1 rounded-xl text-[15px] font-medium"
                  disabled
                >
                  <MessageSquare className="size-4" /> Message
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <Lock className="size-3" /> Login required
              </TooltipContent>
            </Tooltip>
            <Button
              variant="outline"
              size="icon"
              className="size-12 rounded-xl"
              onClick={handleShare}
              aria-label="Share"
            >
              <Share2 className="size-4" />
            </Button>
          </div>

          {/* Stats */}
          <Card className="mt-5 rounded-2xl py-0">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-y-1">
                {[
                  {
                    icon: Briefcase,
                    label: "Active Jobs",
                    value: String(profile.active_campaigns_count),
                  },
                  {
                    icon: BadgeCheck,
                    label: "Trust Score",
                    value: `${profile.trust_score}%`,
                  },
                  {
                    icon: ShieldCheck,
                    label: "Verification Tier",
                    value: `Tier ${profile.verification_tier}`,
                  },
                  {
                    icon: Users,
                    label: "Company Size",
                    value: profile.company_size || "—",
                  },
                  {
                    icon: Building2,
                    label: "Industry",
                    value: profile.industry || "—",
                  },
                  {
                    icon: Calendar,
                    label: "Member Since",
                    value: formatMemberSince(profile.member_since),
                  },
                ].map((s, i) => (
                  <div
                    key={s.label}
                    className={`flex items-center gap-3 py-3 ${
                      i % 2 === 0 ? "pr-3" : "pl-3"
                    } ${i < 4 ? "border-b border-border/70" : ""}`}
                  >
                    <IconTile icon={s.icon} size="sm" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">
                        {s.label}
                      </p>
                      <p className="text-lg font-semibold text-accent">
                        {s.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="mt-6">
            <TabsList variant="line" className="w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="jobs">Jobs</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-5 space-y-4">
              {/* About snippet */}
              {profile.about && (
                <Card className="rounded-2xl">
                  <CardContent className="p-4">
                    <h2 className="text-base font-semibold">
                      About {profile.company_name}
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {profile.about}
                    </p>
                    {profile.location &&
                      (profile.location.city ||
                        profile.location.state ||
                        profile.location.country) && (
                        <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="size-4" />
                          {[
                            profile.location.city,
                            profile.location.state,
                            profile.location.country,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}
                  </CardContent>
                </Card>
              )}

              {/* Active campaigns */}
              {campaigns.length > 0 && (
                <Card className="rounded-2xl">
                  <CardContent className="p-4">
                    <h2 className="text-base font-semibold">Active Jobs</h2>
                    <div className="mt-3 space-y-2">
                      {campaigns.map((c) => (
                        <CampaignCard key={c._id} campaign={c} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Highlights */}
              {highlights.length > 0 && (
                <Card className="rounded-2xl">
                  <CardContent className="p-4">
                    <h2 className="text-base font-semibold">
                      Company Highlights
                    </h2>
                    <ul className="mt-3 space-y-4">
                      {highlights.map((h) => (
                        <li key={h.title} className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-full border border-accent/25 bg-accent/10">
                            <h.icon className="size-4 text-accent" />
                          </div>
                          <div>
                            <p className="font-medium">{h.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {h.sub}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Bottom actions */}
              <div className="flex gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex h-12 flex-1 rounded-xl border-accent/60 bg-accent/5 font-medium text-accent shadow-[var(--shadow-glow)]"
                      disabled
                    >
                      <MessageSquare className="size-4" /> Message
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <Lock className="size-3" /> Login required
                  </TooltipContent>
                </Tooltip>
                <Button
                  variant="outline"
                  className="flex h-12 flex-1 rounded-xl font-medium"
                  disabled
                >
                  <MoreHorizontal className="size-4" /> More
                </Button>
              </div>
            </TabsContent>

            {/* About Tab */}
            <TabsContent value="about" className="mt-5">
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <h2 className="text-base font-semibold">
                    About {profile.company_name}
                  </h2>

                  {profile.about && (
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      {profile.about}
                    </p>
                  )}

                  <Separator className="my-4" />

                  <div className="space-y-4">
                    {profile.company_size && (
                      <div className="flex items-center gap-3">
                        <IconTile icon={Users} size="sm" />
                        <div>
                          <p className="font-medium">{profile.company_size}</p>
                          <p className="text-sm text-muted-foreground">
                            Company Size
                          </p>
                        </div>
                      </div>
                    )}
                    {profile.industry && (
                      <div className="flex items-center gap-3">
                        <IconTile icon={Building2} size="sm" />
                        <div>
                          <p className="font-medium">{profile.industry}</p>
                          <p className="text-sm text-muted-foreground">
                            Industry
                          </p>
                        </div>
                      </div>
                    )}
                    {profile.founded_year && (
                      <div className="flex items-center gap-3">
                        <IconTile icon={Calendar} size="sm" />
                        <div>
                          <p className="font-medium">{profile.founded_year}</p>
                          <p className="text-sm text-muted-foreground">
                            Founded
                          </p>
                        </div>
                      </div>
                    )}
                    {profile.location &&
                      (profile.location.city ||
                        profile.location.state ||
                        profile.location.country) && (
                        <div className="flex items-center gap-3">
                          <IconTile icon={MapPin} size="sm" />
                          <div>
                            <p className="font-medium">
                              {[
                                profile.location.city,
                                profile.location.state,
                                profile.location.country,
                              ]
                                .filter(Boolean)
                                .join(", ")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Location
                            </p>
                          </div>
                        </div>
                      )}
                    {profile.specialties &&
                      profile.specialties.length > 0 && (
                        <div className="flex items-start gap-3">
                          <IconTile icon={Sparkles} size="sm" />
                          <div>
                            <div className="flex flex-wrap gap-1.5">
                              {profile.specialties.map((s) => (
                                <Badge
                                  key={s}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {s}
                                </Badge>
                              ))}
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Specialties
                            </p>
                          </div>
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Jobs Tab */}
            <TabsContent value="jobs" className="mt-5">
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <h2 className="text-base font-semibold">Active Jobs</h2>
                  {campaigns.length > 0 ? (
                    <div className="mt-3 space-y-2">
                      {campaigns.map((c) => (
                        <CampaignCard key={c._id} campaign={c} />
                      ))}
                    </div>
                  ) : (
                    <EmptyTab icon={Briefcase} title="No active jobs" />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Team Tab */}
            <TabsContent value="team" className="mt-5">
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <EmptyTab icon={Users} title="Team information coming soon" />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="mt-5">
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <EmptyTab
                    icon={Star}
                    title="Reviews coming soon"
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
