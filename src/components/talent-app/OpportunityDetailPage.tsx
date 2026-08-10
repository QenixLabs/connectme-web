"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Bookmark,
  Briefcase,
  Calendar,
  Check,
  Clock,
  Heart,
  IndianRupee,
  MapPin,
  Play,
  Send,
  Settings,
  User,
  UserPlus,
  Zap,
  Loader2,
} from "lucide-react";
import { Fragment, useState, useCallback } from "react";

import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useCampaign,
  useCampaignRecommendations,
  useBookmarkCampaign,
  useApplyToCampaign,
} from "@/hooks/use-campaigns";

/* -------------------------------------------------------------------------- */
/*                              MOCK DATA (no API)                             */
/* -------------------------------------------------------------------------- */

const gallery = [
  { url: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&q=80", span: 2, video: true },
  { url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&q=80" },
  { url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=80" },
  { url: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&q=80" },
  { url: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=300&q=80", plus: 3 },
];

const processSteps = [
  { label: "Apply Now", date: "By deadline", icon: Check, done: true },
  { label: "Shortlisting", date: "Review period", icon: User, done: false },
  { label: "Audition", date: "TBD", icon: Settings, done: false },
  { label: "Final Selection", date: "TBD", icon: Zap, done: false },
  { label: "Project Starts", date: "TBD", icon: Calendar, done: false },
];

const savedBy = {
  count: 183,
  avatars: [
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=faces",
    "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=80&h=80&fit=crop&crop=faces",
    "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=80&h=80&fit=crop&crop=faces",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=faces",
    "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=80&h=80&fit=crop&crop=faces",
  ],
};

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function formatBudgetDisplay(budget?: { min?: number; max?: number; currency?: string }): string {
  if (!budget) return "Not specified";
  const sym = budget.currency === "INR" ? "\u20B9" : "$";
  if (budget.min && budget.max) return sym + budget.min.toLocaleString() + " \u2013 " + sym + budget.max.toLocaleString() + " / Day";
  if (budget.min) return "From " + sym + budget.min.toLocaleString() + " / Day";
  if (budget.max) return "Up to " + sym + budget.max.toLocaleString() + " / Day";
  return "Not specified";
}

function formatLocation(loc?: { city?: string; state?: string }): string {
  if (!loc) return "Remote";
  return [loc.city, loc.state].filter(Boolean).join(", ") || "Remote";
}

function daysUntil(deadline?: string): number {
  if (!deadline) return 0;
  const diff = new Date(deadline).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

function formatDateRange(dates?: { start?: string; end?: string }): string {
  if (!dates?.start) return "TBD";
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  if (!dates.end) return fmt(dates.start);
  return fmt(dates.start) + " \u2013 " + fmt(dates.end);
}

/* -------------------------------------------------------------------------- */
/*                                  SKELETON                                  */
/* -------------------------------------------------------------------------- */

function DetailSkeleton() {
  return (
    <div className="pt-5">
      <div className="mx-auto w-full max-w-[1000px] px-4 pb-6 md:px-6 space-y-5">
        <Skeleton className="h-5 w-40" />
        <Card className="gap-0 rounded-2xl border-border bg-surface py-0 shadow-none">
          <CardContent className="p-5 md:p-7 space-y-4">
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-5 md:grid-cols-2">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="pt-5">
      <div className="mx-auto w-full max-w-[1000px] px-4 pb-6 md:px-6">
        <Link
          href="/talent/opportunities"
          className="inline-flex items-center gap-2 text-sm text-teal mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Opportunities
        </Link>
        <Card className="gap-0 rounded-2xl border-border bg-surface py-0 shadow-none">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Opportunity not found.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   PAGE                                     */
/* -------------------------------------------------------------------------- */

export function OpportunityDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const { data: campaign, isLoading, isError } = useCampaign(id);
  const { data: recommendations } = useCampaignRecommendations(3);
  const bookmarkMutation = useBookmarkCampaign();
  const applyMutation = useApplyToCampaign();
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleBookmark = useCallback(() => {
    if (!id) return;
    setIsBookmarked((prev) => !prev);
    bookmarkMutation.mutate({ id, bookmarked: isBookmarked });
  }, [id, isBookmarked, bookmarkMutation]);

  const handleApply = useCallback(() => {
    if (!id) return;
    applyMutation.mutate({ id });
  }, [id, applyMutation]);

  if (isLoading) return <DetailSkeleton />;
  if (isError || !campaign) return <NotFound />;

  const days = daysUntil(campaign.deadline);
  const recruiterName = campaign.recruiter?.company_name || "Recruiter";
  const recruiterInitials = recruiterName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const skills = campaign.requirements?.skills || [];
  const lookingFor = campaign.requirements?.attributes
    ? campaign.requirements.attributes.split(",").map((s: string) => s.trim()).filter(Boolean)
    : [];
  const locationStr = formatLocation(campaign.location);
  const budgetStr = formatBudgetDisplay(campaign.budget_range);

  return (
    <div className="pt-5">
      <div className="mx-auto w-full max-w-[1000px] px-4 pb-6 md:px-6">
        <Link
          href="/talent/opportunities"
          className="inline-flex items-center gap-2 text-sm text-teal mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Opportunities
        </Link>

        {/* HERO */}
        <Card className="mb-5 gap-0 rounded-2xl border-border bg-surface py-0 shadow-none">
          <CardContent className="p-5 md:p-7">
            <div className="grid gap-6 md:grid-cols-[1.1fr_1fr] items-start">
              <div>
                <div className="mb-4 flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className="border-teal/40 bg-teal/10 text-teal"
                  >
                    {campaign.role_type || "Campaign"}
                  </Badge>
                </div>
                <h1 className="mb-3 text-2xl font-bold leading-tight font-sans md:text-[2rem]">
                  {campaign.name}
                </h1>
                <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                  by{" "}
                  <span className="font-medium text-foreground">
                    {recruiterName}
                  </span>
                  {campaign.recruiter?.verification_status ===
                    "trusted_partner" && (
                    <BadgeCheck className="h-4 w-4 text-teal" />
                  )}
                </div>
                {campaign.recruiter?.headline && (
                  <p className="text-xs text-muted-foreground">
                    {campaign.recruiter.headline}
                  </p>
                )}
              </div>

              {campaign.cover_image_url && (
                <div className="relative min-h-[180px] overflow-hidden rounded-xl md:aspect-auto md:h-full">
                  <img
                    src={campaign.cover_image_url}
                    alt={campaign.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute right-3 top-3 flex gap-2">
                    <button
                      onClick={handleBookmark}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-black/50 backdrop-blur"
                    >
                      <Bookmark
                        className={cn(
                          "h-[15px] w-[15px] text-white",
                          isBookmarked && "fill-white",
                        )}
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="rounded-xl border border-border/70 bg-surface-2 p-3.5">
                <div className="text-lg font-bold text-teal font-sans">
                  {budgetStr}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground/70">
                  Compensation
                </div>
              </div>
              <div className="rounded-xl border border-border/70 bg-surface-2 p-3.5">
                <div className="flex items-center gap-1.5 text-sm font-semibold">
                  <MapPin className="h-3.5 w-3.5" /> {locationStr}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground/70">
                  Location
                </div>
              </div>
              {campaign.deadline && (
                <div className="rounded-xl border border-border/70 bg-surface-2 p-3.5">
                  <div
                    className={cn(
                      "flex items-center gap-1.5 text-sm font-semibold",
                      days <= 3 ? "text-orange" : "",
                    )}
                  >
                    <Clock className="h-3.5 w-3.5" /> {days} days left
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground/70">
                    Apply by deadline
                  </div>
                </div>
              )}
              <div className="rounded-xl border border-border/70 bg-surface-2 p-3.5">
                <div className="flex items-center gap-1.5 text-sm font-semibold">
                  <UserPlus className="h-3.5 w-3.5" />{" "}
                  {campaign.applications_count}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground/70">
                  Applicants
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ABOUT + ORGANIZER */}
        <div className="mb-5 grid gap-5 md:grid-cols-2">
          <Card className="gap-0 rounded-2xl border-border bg-surface py-0 shadow-none">
            <CardContent className="p-5 md:p-6">
              <h2 className="mb-3 text-base font-bold font-sans">
                About the Campaign
              </h2>
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                {campaign.description || "No description provided."}
              </p>
              <div className="flex flex-wrap gap-2">
                {(campaign.specialties || campaign.requirements?.skills || [])
                  .slice(0, 5)
                  .map((tag: string) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="border-border text-muted-foreground"
                    >
                      {tag}
                    </Badge>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card className="gap-0 rounded-2xl border-border bg-surface py-0 shadow-none">
            <CardContent className="p-5 md:p-6">
              <h2 className="mb-4 flex items-center gap-2 text-base font-bold font-sans">
                About {recruiterName}
                {campaign.recruiter?.verification_status ===
                  "trusted_partner" && (
                  <BadgeCheck className="h-4 w-4 text-teal" />
                )}
              </h2>
              <div className="mb-4 flex items-center gap-3">
                {campaign.recruiter?.profile_photo ? (
                  <Avatar className="h-11 w-11">
                    <AvatarImage src={campaign.recruiter.profile_photo} />
                    <AvatarFallback>{recruiterInitials}</AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange/10 text-sm font-bold font-sans text-orange">
                    {recruiterInitials}
                  </div>
                )}
                <div>
                  <div className="text-sm font-semibold">{recruiterName}</div>
                  <div className="text-xs text-muted-foreground/70">
                    {campaign.recruiter?.location
                      ? formatLocation(campaign.recruiter.location)
                      : "Location not specified"}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full rounded-xl border-border bg-transparent font-semibold shadow-none hover:border-teal hover:bg-transparent hover:text-teal"
              >
                View Organizer Profile
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* DETAILS + SAVED */}
        <div className="mb-5 grid gap-5 md:grid-cols-2">
          <Card className="gap-0 rounded-2xl border-border bg-surface py-0 shadow-none">
            <CardContent className="p-5 md:p-6">
              <h2 className="mb-4 text-base font-bold font-sans">
                Campaign Details
              </h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
                <div className="flex gap-2.5">
                  <MapPin className="mt-0.5 h-[15px] w-[15px] shrink-0 text-teal" />
                  <div>
                    <div className="mb-0.5 text-xs text-muted-foreground/70">
                      Location
                    </div>
                    {locationStr}
                  </div>
                </div>
                <div className="flex gap-2.5">
                  <Briefcase className="mt-0.5 h-[15px] w-[15px] shrink-0 text-teal" />
                  <div>
                    <div className="mb-0.5 text-xs text-muted-foreground/70">
                      Type
                    </div>
                    Paid
                  </div>
                </div>
                <div className="flex gap-2.5">
                  <IndianRupee className="mt-0.5 h-[15px] w-[15px] shrink-0 text-teal" />
                  <div>
                    <div className="mb-0.5 text-xs text-muted-foreground/70">
                      Compensation
                    </div>
                    {budgetStr}
                  </div>
                </div>
                <div className="flex gap-2.5">
                  <Calendar className="mt-0.5 h-[15px] w-[15px] shrink-0 text-teal" />
                  <div>
                    <div className="mb-0.5 text-xs text-muted-foreground/70">
                      Dates
                    </div>
                    {formatDateRange(campaign.dates)}
                  </div>
                </div>
                {campaign.deadline && (
                  <div className="flex gap-2.5">
                    <Clock className="mt-0.5 h-[15px] w-[15px] shrink-0 text-orange" />
                    <div>
                      <div className="mb-0.5 text-xs text-muted-foreground/70">
                        Deadline
                      </div>
                      <span className="text-orange font-medium">
                        {days} days left
                      </span>
                    </div>
                  </div>
                )}
                {campaign.role_type && (
                  <div className="flex gap-2.5">
                    <Zap className="mt-0.5 h-[15px] w-[15px] shrink-0 text-teal" />
                    <div>
                      <div className="mb-0.5 text-xs text-muted-foreground/70">
                        Role Type
                      </div>
                      {campaign.role_type}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="gap-0 rounded-2xl border-border bg-surface py-0 shadow-none">
            <CardContent className="p-5 md:p-6">
              <h2 className="mb-4 flex items-center gap-2 text-base font-bold font-sans">
                <Heart className="h-4 w-4 fill-rose text-rose" /> Saved by
                artists
              </h2>
              <div className="mb-4 text-sm">
                <span className="font-bold text-rose">{savedBy.count}</span>{" "}
                <span className="text-muted-foreground">
                  artists saved this opportunity
                </span>
              </div>
              <AvatarGroup className="-space-x-2.5">
                {savedBy.avatars.map((src, i) => (
                  <Avatar key={i} className="h-9 w-9 border-2 border-surface">
                    <AvatarImage src={src} />
                    <AvatarFallback>{i + 1}</AvatarFallback>
                  </Avatar>
                ))}
                <AvatarGroupCount className="h-9 w-9 bg-surface-2 text-[10px] text-muted-foreground">
                  +{savedBy.count - savedBy.avatars.length}
                </AvatarGroupCount>
              </AvatarGroup>
            </CardContent>
          </Card>
        </div>

        {/* APPLICATION PROCESS */}
        <Card className="mb-5 gap-0 rounded-2xl border-border bg-surface py-0 shadow-none">
          <CardContent className="p-5 md:p-7">
            <h2 className="mb-6 text-base font-bold font-sans">
              Application Process
            </h2>
            <div className="hidden items-start md:flex">
              {processSteps.map((step, i) => (
                <Fragment key={step.label}>
                  {i > 0 && (
                    <div
                      className={cn(
                        "mt-5 h-[2px] flex-1",
                        step.done && processSteps[i - 1].done
                          ? "bg-teal"
                          : "bg-border",
                      )}
                    />
                  )}
                  <div className="flex flex-1 flex-col items-center px-1 text-center">
                    <div
                      className={cn(
                        "grid h-10 w-10 place-items-center rounded-full border-2",
                        step.done
                          ? "border-teal text-teal"
                          : "border-border text-muted-foreground",
                      )}
                    >
                      <step.icon className="h-4 w-4" />
                    </div>
                    <div className="mt-2 text-xs font-semibold">
                      {step.label}
                    </div>
                    <div className="text-[11px] text-muted-foreground/70">
                      {step.date}
                    </div>
                  </div>
                </Fragment>
              ))}
            </div>
            <div className="flex flex-col md:hidden">
              {processSteps.map((step, i) => {
                const isLast = i === processSteps.length - 1;
                return (
                  <div key={step.label} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "grid h-9 w-9 shrink-0 place-items-center rounded-full border-2",
                          step.done
                            ? "border-teal text-teal"
                            : "border-border text-muted-foreground",
                        )}
                      >
                        <step.icon className="h-3.5 w-3.5" />
                      </div>
                      {!isLast && (
                        <div
                          className={cn(
                            "my-1 w-[2px] min-h-6 flex-1",
                            processSteps[i + 1].done ? "bg-teal" : "bg-border",
                          )}
                        />
                      )}
                    </div>
                    <div className={cn(!isLast && "pb-5")}>
                      <div className="text-sm font-semibold">{step.label}</div>
                      <div className="text-xs text-muted-foreground/70">
                        {step.date}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* SKILLS + GALLERY */}
        <div className="mb-5 grid gap-5 md:grid-cols-2">
          <Card className="gap-0 rounded-2xl border-border bg-surface py-0 shadow-none">
            <CardContent className="p-5 md:p-6">
              <h2 className="mb-4 text-base font-bold font-sans">
                Skills &amp; Requirements
              </h2>
              <div className="mb-5 flex flex-wrap gap-2">
                {skills.map((skill: string) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="border-border text-muted-foreground"
                  >
                    {skill}
                  </Badge>
                ))}
                {skills.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No specific skills listed.
                  </p>
                )}
              </div>
              {lookingFor.length > 0 && (
                <div>
                  <div className="mb-2.5 text-xs font-semibold text-muted-foreground">
                    What we&apos;re looking for
                  </div>
                  <ul className="space-y-2 text-sm">
                    {lookingFor.map((item: string) => (
                      <li key={item} className="flex gap-2">
                        <Check className="mt-0.5 h-[13px] w-[13px] shrink-0 text-teal" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="gap-0 rounded-2xl border-border bg-surface py-0 shadow-none">
            <CardContent className="p-5 md:p-6">
              <h2 className="mb-4 text-base font-bold font-sans">
                Campaign Gallery
              </h2>
              <div className="grid grid-cols-4 gap-2">
                {gallery.map((img, i) => (
                  <div
                    key={i}
                    className={cn(
                      "relative overflow-hidden rounded-lg aspect-square",
                      img.span === 2 && "col-span-2 row-span-2",
                    )}
                  >
                    <img
                      src={img.url}
                      alt=""
                      className={cn(
                        "h-full w-full object-cover",
                        img.plus && "opacity-40",
                      )}
                    />
                    {img.video && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90">
                          <Play className="h-3.5 w-3.5 fill-[#0e1a29] text-[#0e1a29]" />
                        </div>
                      </div>
                    )}
                    {img.plus && (
                      <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
                        +{img.plus}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SIMILAR */}
        <div className="mb-24">
          <Card className="gap-0 rounded-2xl border-border bg-surface py-0 shadow-none">
            <CardContent className="p-5 md:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-bold font-sans">
                  Similar Opportunities
                </h2>
                <Link
                  href="/talent/opportunities"
                  className="text-xs text-teal"
                >
                  View all
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {recommendations?.map((rec) => (
                  <Link
                    key={rec._id}
                    href={"/talent/opportunities/" + rec._id}
                    className="overflow-hidden rounded-xl border border-border bg-surface-2"
                  >
                    {rec.cover_image_url && (
                      <div className="relative h-20">
                        <img
                          src={rec.cover_image_url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                        <span className="absolute left-1.5 top-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px]">
                          {rec.role_type || "Campaign"}
                        </span>
                      </div>
                    )}
                    <div className="p-2.5">
                      <div className="mb-1 text-xs font-semibold leading-tight line-clamp-2">
                        {rec.name}
                      </div>
                      <div className="mb-1.5 flex items-center gap-1 text-[10px] text-muted-foreground/70">
                        <MapPin className="h-[9px] w-[9px]" />
                        {formatLocation(rec.location)}
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="font-semibold text-teal">
                          {rec.budget_range?.min
                            ? "\u20B9" + rec.budget_range.min.toLocaleString()
                            : "TBD"}
                        </span>
                        {rec.deadline && (
                          <span className="text-muted-foreground/70">
                            {daysUntil(rec.deadline)}d left
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
                {(!recommendations || recommendations.length === 0) && (
                  <p className="text-sm text-muted-foreground">
                    No similar opportunities found.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* STICKY BOTTOM BAR */}
      <div className="sticky bottom-14 z-30 border-t border-border bg-background px-4 py-3.5 md:bottom-0 md:px-6">
        <div className="mx-auto flex max-w-[1000px] items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5 md:flex-row md:items-center md:gap-4">
            <span className="text-base font-bold font-sans text-teal">
              {budgetStr}
            </span>
            {campaign.deadline && (
              <span className="hidden items-center gap-1 text-xs text-orange md:flex">
                <Clock className="h-3 w-3" /> {days} days left to apply
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleBookmark}
              className="hidden rounded-xl border-border bg-transparent font-semibold shadow-none sm:flex hover:border-teal hover:bg-transparent hover:text-teal"
            >
              <Bookmark
                className={cn("h-4 w-4", isBookmarked && "fill-current")}
              />
              {isBookmarked ? "Saved" : "Save Opportunity"}
            </Button>
            <Button
              onClick={handleApply}
              disabled={applyMutation.isPending}
              className="rounded-xl bg-gradient-teal font-semibold text-accent-foreground hover:brightness-110"
            >
              {applyMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Apply Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
