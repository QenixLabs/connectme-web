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
  Send,
  Zap,
  Loader2,
  MapPin,
  IndianRupee,
  DollarSign,
  Languages,
  Target,
  Users,
  FileText,
  ShieldCheck,
  AlertCircle,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { useCallback } from "react";
import { motion } from "motion/react";

import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  useCampaign,
  useCampaignRecommendations,
  useBookmarkCampaign,
  useApplyToCampaign,
} from "@/hooks/use-campaigns";

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function formatBudgetDisplay(budget?: { min?: number; max?: number; currency?: string }): string {
  if (!budget) return "Not specified";
  const isInr = budget.currency === "INR";
  const sym = isInr ? "₹" : "$";
  if (budget.min && budget.max) {
    return `${sym}${budget.min.toLocaleString()} – ${sym}${budget.max.toLocaleString()}`;
  }
  if (budget.min) return `From ${sym}${budget.min.toLocaleString()}`;
  if (budget.max) return `Up to ${sym}${budget.max.toLocaleString()}`;
  return "Not specified";
}

function formatBudgetShort(budget?: { min?: number; max?: number; currency?: string }): string {
  if (!budget) return "TBD";
  const isInr = budget.currency === "INR";
  const sym = isInr ? "₹" : "$";
  if (budget.min) return `${sym}${budget.min.toLocaleString()}`;
  if (budget.max) return `${sym}${budget.max.toLocaleString()}`;
  return "TBD";
}

function formatLocation(loc?: { city?: string; state?: string }): string {
  if (!loc) return "Remote";
  return [loc.city, loc.state].filter(Boolean).join(", ") || "Remote";
}

function daysUntil(deadline?: string): { days: number; text: string; urgent: boolean } {
  if (!deadline) return { days: 0, text: "", urgent: false };
  const diff = new Date(deadline).getTime() - Date.now();
  const days = Math.max(0, Math.ceil(diff / 86400000));
  if (days === 0) return { days, text: "Last day", urgent: true };
  if (days === 1) return { days, text: "1 day left", urgent: true };
  return { days, text: `${days} days left`, urgent: days <= 3 };
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
  return `${fmt(dates.start)} – ${fmt(dates.end)}`;
}

function recruiterInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getApplicationStatus(campaign: ReturnType<typeof useCampaign>["data"]) {
  if (!campaign?.my_application) return null;
  return campaign.my_application.status;
}

/* -------------------------------------------------------------------------- */
/*                                  SKELETON                                  */
/* -------------------------------------------------------------------------- */

function DetailSkeleton() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 px-4 pb-40 pt-4 md:pt-6">
      <Skeleton className="h-5 w-40" />
      {/* Header card */}
      <div className="flex gap-4 rounded-3xl border border-border bg-card p-4 sm:p-5">
        <Skeleton className="size-[120px] shrink-0 rounded-2xl sm:size-40" />
        <div className="flex-1 space-y-2.5 py-1">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-6 w-4/5" />
          <Skeleton className="h-6 w-3/5" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
      {/* Info panel */}
      <Skeleton className="h-28 rounded-2xl" />
      <Skeleton className="h-36 rounded-2xl" />
      <Skeleton className="h-44 rounded-2xl" />
    </div>
  );
}

function NotFound() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-32 pt-4 md:pt-6">
      <Link
        href="/talent/opportunities"
        className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Opportunities
      </Link>
      <Card className="mt-6 rounded-2xl border-border">
        <CardContent className="flex flex-col items-center py-16 text-center">
          <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-primary/10">
            <AlertCircle className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-lg font-semibold">Opportunity not found</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The listing you&apos;re looking for may have been removed or closed.
          </p>
          <Button asChild className="mt-5 rounded-lg bg-gradient-teal font-semibold text-accent-foreground">
            <Link href="/talent/opportunities">Browse opportunities</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                COMPONENTS                                  */
/* -------------------------------------------------------------------------- */

function InfoItem({
  icon: Icon,
  label,
  value,
  urgent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  urgent?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <div
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-lg",
          urgent ? "bg-orange/10 text-orange" : "bg-muted text-primary",
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] leading-tight text-muted-foreground">{label}</div>
        <div
          className={cn(
            "truncate text-sm font-semibold leading-tight",
            urgent && "text-orange",
          )}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl border border-border bg-card p-4 sm:p-5", className)}>
      <h2 className="flex items-center gap-2 text-base font-semibold">
        {Icon && <Icon className="h-4 w-4 text-primary" />}
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
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

  const handleBookmark = useCallback(() => {
    if (!id) return;
    bookmarkMutation.mutate({ id, bookmarked: campaign?.is_bookmarked ?? false });
  }, [id, campaign?.is_bookmarked, bookmarkMutation]);

  const handleApply = useCallback(() => {
    if (!id) return;
    applyMutation.mutate({ id });
  }, [id, applyMutation]);

  if (isLoading) return <DetailSkeleton />;
  if (isError || !campaign) return <NotFound />;

  const deadline = daysUntil(campaign.deadline);
  const recruiterName = campaign.recruiter?.company_name || "Recruiter";
  const isVerified = campaign.recruiter?.verification_status === "trusted_partner";
  const skills = campaign.requirements?.skills || [];
  const languages = campaign.requirements?.languages || [];
  const lookingFor = campaign.requirements?.attributes
    ? campaign.requirements.attributes.split(",").map((s) => s.trim()).filter(Boolean)
    : [];
  const locationStr = formatLocation(campaign.location);
  const budgetStr = formatBudgetDisplay(campaign.budget_range);
  const applicationStatus = getApplicationStatus(campaign);
  const hasApplied = !!applicationStatus;
  const isInviteOnly = campaign.visibility === "invite_only";
  const hasTask = campaign.task?.is_enabled;
  const hasQuestions = (campaign.questions?.length ?? 0) > 0;
  const hasRoleInfo = !!campaign.role_type || (campaign.specialties?.length ?? 0) > 0;
  const hasRequirements =
    !!campaign.requirements?.gender ||
    !!campaign.requirements?.age_range ||
    languages.length > 0 ||
    lookingFor.length > 0;

  const processSteps = [
    { label: "Apply", date: "By deadline", done: hasApplied },
    { label: "Shortlisting", date: "Review period", done: applicationStatus === "accepted" },
    { label: "Audition", date: "TBD", done: false },
    { label: "Final Selection", date: "TBD", done: false },
    { label: "Project Starts", date: formatDateRange(campaign.dates), done: false },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-40 pt-4 md:pt-6">
      {/* Back Link */}
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <Link
          href="/talent/opportunities"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to opportunities
        </Link>
      </motion.div>

      {/* Header Card — square cover + identity */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <Card className="mt-4 rounded-3xl border-border bg-card">
          <CardContent className="p-4 sm:p-5">
            <div className="flex gap-4">
              {/* Square campaign cover */}
              <div className="relative size-[120px] shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-cyan/10 to-transparent sm:size-40 md:size-44">
                {campaign.cover_image_url ? (
                  <img
                    src={campaign.cover_image_url}
                    alt={campaign.name}
                    className="aspect-square h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Zap className="h-10 w-10 text-primary/40" />
                  </div>
                )}
              </div>

              {/* Identity */}
              <div className="relative min-w-0 flex-1">
                {/* Bookmark */}
                <button
                  aria-label={campaign?.is_bookmarked ? "Remove bookmark" : "Save opportunity"}
                  onClick={handleBookmark}
                  className={cn(
                    "absolute right-0 top-0 grid size-9 place-items-center rounded-full border border-border bg-muted text-muted-foreground transition-all hover:scale-105 hover:border-primary hover:text-primary",
                    campaign?.is_bookmarked && "border-primary bg-primary text-primary-foreground hover:text-primary-foreground",
                  )}
                >
                  <Bookmark className={cn("h-4 w-4", campaign?.is_bookmarked && "fill-current")} />
                </button>

                <div className="flex flex-wrap items-center gap-1.5 pr-11">
                  <Badge
                    variant="outline"
                    className="border-primary/30 bg-primary/15 text-primary"
                  >
                    {campaign.role_type || "Campaign"}
                  </Badge>
                </div>

                <h1 className="mt-1.5 line-clamp-2 text-xl font-bold leading-snug sm:text-2xl">
                  {campaign.name}
                </h1>

                <div className="mt-1.5 flex min-w-0 items-center gap-1.5 text-sm">
                  <Avatar size="sm" className="size-6">
                    <AvatarImage src={campaign.recruiter?.profile_photo} alt={recruiterName} />
                    <AvatarFallback className="bg-surface-2 text-[10px] font-medium">
                      {recruiterInitials(recruiterName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate font-medium text-foreground">{recruiterName}</span>
                  {isVerified && <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />}
                </div>
              </div>
            </div>

            {/* Metadata line */}
            <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {locationStr}
              </span>
              <span>·</span>
              <Badge
                variant="outline"
                className={cn(
                  "gap-1",
                  isInviteOnly
                    ? "border-gold/30 bg-gold/15 text-gold"
                    : "border-green/30 bg-green/10 text-green",
                )}
              >
                {isInviteOnly ? <ShieldCheck className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                {isInviteOnly ? "Invite Only" : "Open"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Key Information — compact 2×2 panel */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
      >
        <Card className="mt-4 rounded-2xl border-border bg-card">
          <CardContent className="grid grid-cols-2 gap-x-3 gap-y-4 p-4 sm:p-5">
            <InfoItem
              icon={campaign.budget_range?.currency === "INR" ? IndianRupee : DollarSign}
              label="Compensation"
              value={budgetStr}
            />
            <InfoItem icon={MapPin} label="Location" value={locationStr} />
            <InfoItem
              icon={Clock}
              label="Deadline"
              value={deadline.text || "Open"}
              urgent={deadline.urgent}
            />
            <InfoItem
              icon={Users}
              label="Applicants"
              value={campaign.applications_count.toLocaleString()}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Content Sections */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="mt-4 space-y-4"
      >
        {/* About */}
        <Section title="About the Campaign">
          <p className="whitespace-pre-line text-sm leading-relaxed text-text-secondary">
            {campaign.description || "No description provided."}
          </p>
        </Section>

        {/* Role */}
        {hasRoleInfo && (
          <Section title="Role">
            <div className="space-y-3">
              {campaign.role_type && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Category</span>
                  <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                    {campaign.role_type}
                  </Badge>
                </div>
              )}
              {(campaign.specialties?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-2">
                  {campaign.specialties?.map((tag) => (
                    <Badge key={tag} variant="outline" className="border-border bg-muted text-foreground">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Requirements */}
        {hasRequirements && (
          <Section title="Requirements">
            <div className="space-y-4">
              {(campaign.requirements?.gender || campaign.requirements?.age_range) && (
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {campaign.requirements?.gender && (
                    <div className="rounded-xl border border-border bg-muted p-3">
                      <div className="text-xs text-muted-foreground">Gender</div>
                      <div className="mt-0.5 text-sm font-medium capitalize">
                        {campaign.requirements.gender}
                      </div>
                    </div>
                  )}
                  {campaign.requirements?.age_range && (
                    <div className="rounded-xl border border-border bg-muted p-3">
                      <div className="text-xs text-muted-foreground">Age Range</div>
                      <div className="mt-0.5 text-sm font-medium">
                        {campaign.requirements.age_range.min ?? "—"}–
                        {campaign.requirements.age_range.max ?? "—"} years
                      </div>
                    </div>
                  )}
                </div>
              )}

              {languages.length > 0 && (
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Languages className="h-3.5 w-3.5" /> Languages
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {languages.map((lang) => (
                      <Badge key={lang} variant="outline" className="border-cyan/30 bg-cyan/10 text-cyan">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {lookingFor.length > 0 && (
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    What we&apos;re looking for
                  </h3>
                  <ul className="space-y-2">
                    {lookingFor.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-text-secondary">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <Section title="Skills" icon={Target}>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge key={skill} variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                  {skill}
                </Badge>
              ))}
            </div>
          </Section>
        )}

        {/* Recruiter Information */}
        <Section title="About the Recruiter">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {campaign.recruiter?.profile_photo ? (
                <Avatar size="lg">
                  <AvatarImage src={campaign.recruiter.profile_photo} alt={recruiterName} />
                  <AvatarFallback>{recruiterInitials(recruiterName)}</AvatarFallback>
                </Avatar>
              ) : (
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                  {recruiterInitials(recruiterName)}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 font-semibold">
                  <span className="truncate">{recruiterName}</span>
                  {isVerified && <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />}
                </div>
                <div className="text-xs text-muted-foreground">
                  {campaign.recruiter?.location
                    ? formatLocation(campaign.recruiter.location)
                    : "Location not specified"}
                </div>
              </div>
            </div>
            {campaign.recruiter?.headline && (
              <p className="text-sm text-text-secondary">{campaign.recruiter.headline}</p>
            )}
            <Button
              variant="outline"
              className="w-full rounded-lg border-border bg-transparent font-semibold hover:border-primary hover:bg-primary/5 hover:text-primary"
            >
              View Recruiter Profile
            </Button>
          </div>
        </Section>

        {/* Campaign Details */}
        <Section title="Campaign Details">
          <div className="grid gap-3.5 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-primary">
                <Briefcase className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">Type</div>
                <div className="text-sm font-medium">{campaign.role_type || "Campaign"}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-primary">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">Location</div>
                <div className="text-sm font-medium">{locationStr}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-primary">
                <Calendar className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">Project Dates</div>
                <div className="text-sm font-medium">{formatDateRange(campaign.dates)}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-primary">
                <Clock className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">Apply By</div>
                <div className={cn("text-sm font-medium", deadline.urgent && "text-orange")}>
                  {campaign.deadline
                    ? new Date(campaign.deadline).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Open"}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-primary">
                <Users className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">Applicants</div>
                <div className="text-sm font-medium">
                  {campaign.applications_count.toLocaleString()}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-primary">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">Visibility</div>
                <div className="text-sm font-medium capitalize">
                  {campaign.visibility.replace("_", " ")}
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Application Process */}
        <Section title="Application Process">
          <p className="-mt-1 mb-3 text-xs text-muted-foreground">What happens after you apply</p>
          <div className="flex flex-col">
            {processSteps.map((step, i) => {
              const isLast = i === processSteps.length - 1;
              return (
                <div key={step.label} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "grid size-9 shrink-0 place-items-center rounded-full border-2",
                        step.done
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-muted-foreground",
                      )}
                    >
                      {step.done ? <Check className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                    </div>
                    {!isLast && (
                      <div
                        className={cn(
                          "my-1 w-0.5 min-h-6 flex-1 rounded-full",
                          processSteps[i + 1].done ? "bg-primary" : "bg-border",
                        )}
                      />
                    )}
                  </div>
                  <div className={cn(!isLast && "pb-5")}>
                    <div className="text-sm font-semibold">{step.label}</div>
                    <div className="text-xs text-muted-foreground">{step.date}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* Task Section */}
        {hasTask && (
          <Section title="Task / Audition Brief" icon={FileText}>
            <div className="space-y-2.5">
              <h3 className="text-sm font-medium">{campaign.task?.title}</h3>
              <p className="text-sm text-text-secondary">{campaign.task?.description}</p>
              {campaign.task?.deadline_days && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  Submit within {campaign.task.deadline_days} days after applying
                </div>
              )}
              {campaign.task?.nda_enabled && (
                <div className="flex items-center gap-2 rounded-xl border border-warning/30 bg-warning/10 p-3 text-xs text-warning">
                  <ShieldCheck className="h-4 w-4" />
                  NDA required before accessing task details
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Questions Section */}
        {hasQuestions && (
          <Section title="Application Questions" icon={MessageSquare}>
            <p className="-mt-1 mb-3 text-xs text-muted-foreground">
              You&apos;ll answer these when applying
            </p>
            <ul className="space-y-3">
              {campaign.questions?.map((q, i) => (
                <li key={q._id || i} className="flex gap-3 text-sm">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                    {i + 1}
                  </span>
                  <span className="text-text-secondary">
                    {q.question_text}
                    {q.is_required && <span className="ml-1 text-destructive">*</span>}
                  </span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Quick Stats */}
        <Card className="rounded-2xl border-border bg-card">
          <CardContent className="p-4 sm:p-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge
                  variant="outline"
                  className={cn(
                    "capitalize",
                    campaign.status === "active"
                      ? "border-green/30 bg-green/10 text-green"
                      : "border-muted-foreground/30 bg-muted text-muted-foreground",
                  )}
                >
                  {campaign.status}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Posted</span>
                <span className="font-medium">
                  {new Date(campaign.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last updated</span>
                <span className="font-medium">
                  {new Date(campaign.updated_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Similar Opportunities */}
        {recommendations && recommendations.length > 0 && (
          <Card className="rounded-2xl border-border bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Similar Roles</CardTitle>
                <Link
                  href="/talent/opportunities"
                  className="text-xs text-primary hover:underline"
                >
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {recommendations.map((rec) => (
                <Link
                  key={rec._id}
                  href={`/talent/opportunities/${rec._id}`}
                  className="group flex gap-3 rounded-xl border border-border bg-muted/50 p-3 transition-all hover:border-border-hover hover:bg-muted"
                >
                  {/* Square thumbnail */}
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-surface">
                    {rec.cover_image_url ? (
                      <img
                        src={rec.cover_image_url}
                        alt=""
                        className="aspect-square h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary/10">
                        <Zap className="h-5 w-5 text-primary/50" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Badge variant="outline" className="mb-1 text-[10px] uppercase tracking-wider">
                      {rec.role_type || "Campaign"}
                    </Badge>
                    <div className="line-clamp-1 text-sm font-medium transition-colors group-hover:text-primary">
                      {rec.name}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-0.5">
                        <MapPin className="h-3 w-3" />
                        {formatLocation(rec.location)}
                      </span>
                      <span>·</span>
                      <span className="font-medium text-green">
                        {formatBudgetShort(rec.budget_range)}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="hidden h-4 w-4 shrink-0 self-center text-muted-foreground transition-colors group-hover:text-primary sm:block" />
                </Link>
              ))}
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Sticky Apply Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 bottom-[72px] z-30 border-t border-border bg-background/85 px-4 py-3.5 backdrop-blur-xl md:bottom-0"
      >
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <div className="hidden flex-col sm:flex">
            <span className="text-lg font-bold text-primary">{budgetStr}</span>
            {deadline.text && (
              <span className={cn("flex items-center gap-1 text-xs", deadline.urgent ? "text-orange" : "text-muted-foreground")}>
                <Clock className="h-3 w-3" /> {deadline.text} to apply
              </span>
            )}
          </div>
          <div className="flex flex-1 items-center gap-2 sm:flex-initial">
            <Button
              variant="outline"
              onClick={handleBookmark}
              className="hidden rounded-lg border-border bg-transparent font-semibold hover:border-primary hover:bg-primary/5 hover:text-primary sm:flex"
            >
              <Bookmark className={cn("h-4 w-4", campaign?.is_bookmarked && "fill-current")} />
              {campaign?.is_bookmarked ? "Saved" : "Save"}
            </Button>
            <Button
              onClick={handleApply}
              disabled={applyMutation.isPending || hasApplied}
              className={cn(
                "flex-1 rounded-lg font-semibold text-accent-foreground shadow-button transition-all hover:shadow-button-hover sm:flex-initial",
                hasApplied
                  ? "bg-green hover:bg-green"
                  : "bg-gradient-teal hover:brightness-110",
              )}
            >
              {applyMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : hasApplied ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {hasApplied ? "Applied" : "Apply Now"}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
