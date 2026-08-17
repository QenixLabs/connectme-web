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
import { Fragment, useCallback } from "react";
import { motion } from "motion/react";

import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 pb-32 pt-4 md:pt-6">
      <Skeleton className="h-5 w-40" />
      <div className="space-y-6 lg:grid lg:grid-cols-3 lg:gap-6">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-64 rounded-3xl" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-56 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-32 pt-4 md:pt-6">
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

function InfoPill({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-border-hover">
      <div
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-xl",
          highlight ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className={cn("mt-0.5 truncate text-sm font-semibold", highlight && "text-primary")}>
          {value}
        </div>
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

  const processSteps = [
    { label: "Apply", date: "By deadline", done: hasApplied },
    { label: "Shortlisting", date: "Review period", done: applicationStatus === "accepted" },
    { label: "Audition", date: "TBD", done: false },
    { label: "Final Selection", date: "TBD", done: false },
    { label: "Project Starts", date: formatDateRange(campaign.dates), done: false },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-32 pt-4 md:pt-6">
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

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mt-5 overflow-hidden rounded-3xl border border-border bg-card"
      >
        <div className="relative">
          {/* Cover */}
          <div className="relative aspect-[16/10] w-full min-h-[220px] overflow-hidden sm:aspect-[21/9] md:aspect-[3/1]">
            {campaign.cover_image_url ? (
              <>
                <img
                  src={campaign.cover_image_url}
                  alt={campaign.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 via-cyan/10 to-transparent">
                <Zap className="h-16 w-16 text-primary/40" />
              </div>
            )}
          </div>

          {/* Floating bookmark */}
          <button
            aria-label={campaign?.is_bookmarked ? "Remove bookmark" : "Save opportunity"}
            onClick={handleBookmark}
            className={cn(
              "absolute right-4 top-4 grid size-10 place-items-center rounded-full border border-white/10 bg-black/40 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-black/60",
              campaign?.is_bookmarked && "bg-primary text-primary-foreground",
            )}
          >
            <Bookmark className={cn("h-5 w-5", campaign?.is_bookmarked && "fill-current")} />
          </button>

          {/* Hero Content */}
          <div className="absolute bottom-0 left-0 w-full p-5 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-primary/30 bg-primary/15 text-primary">
                {campaign.role_type || "Campaign"}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  "gap-1",
                  isInviteOnly
                    ? "border-gold/30 bg-gold/15 text-gold"
                    : "border-border/60 bg-background/60 text-muted-foreground backdrop-blur-sm",
                )}
              >
                {isInviteOnly ? <ShieldCheck className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                {isInviteOnly ? "Invite Only" : "Open"}
              </Badge>
            </div>

            <h1 className="mt-3 max-w-3xl text-2xl font-bold leading-tight sm:text-3xl md:text-4xl">
              {campaign.name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-text-secondary">
              <div className="flex items-center gap-2">
                <Avatar size="sm">
                  <AvatarImage src={campaign.recruiter?.profile_photo} alt={recruiterName} />
                  <AvatarFallback className="bg-surface-2 text-xs font-medium">
                    {recruiterInitials(recruiterName)}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-foreground">{recruiterName}</span>
                {isVerified && <BadgeCheck className="h-4 w-4 text-primary" />}
              </div>
              {campaign.recruiter?.headline && (
                <>
                  <span className="hidden text-muted-foreground sm:inline">·</span>
                  <span className="text-muted-foreground">{campaign.recruiter.headline}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Info Strip */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        <InfoPill
          icon={campaign.budget_range?.currency === "INR" ? IndianRupee : DollarSign}
          label="Compensation"
          value={budgetStr}
          highlight
        />
        <InfoPill icon={MapPin} label="Location" value={locationStr} />
        <InfoPill
          icon={Clock}
          label="Deadline"
          value={deadline.text || "Open"}
          highlight={deadline.urgent}
        />
        <InfoPill icon={Users} label="Applicants" value={campaign.applications_count.toLocaleString()} />
      </motion.div>

      {/* Main Content */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6 lg:col-span-2"
        >
          {/* About */}
          <Card className="rounded-2xl border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base">About the Campaign</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="whitespace-pre-line text-sm leading-relaxed text-text-secondary">
                {campaign.description || "No description provided."}
              </p>
              {(campaign.specialties?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-2">
                  {campaign.specialties?.map((tag) => (
                    <Badge key={tag} variant="outline" className="border-border bg-muted text-foreground">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card className="rounded-2xl border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base">Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {skills.length > 0 && (
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Target className="h-3.5 w-3.5" /> Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <Badge key={skill} variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
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

              {(campaign.requirements?.gender || campaign.requirements?.age_range) && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {campaign.requirements.gender && (
                    <div className="rounded-xl border border-border bg-muted p-3">
                      <div className="text-xs text-muted-foreground">Gender</div>
                      <div className="mt-0.5 text-sm font-medium capitalize">{campaign.requirements.gender}</div>
                    </div>
                  )}
                  {campaign.requirements.age_range && (
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

              {skills.length === 0 && languages.length === 0 && lookingFor.length === 0 && !campaign.requirements?.gender && !campaign.requirements?.age_range && (
                <p className="text-sm text-muted-foreground">No specific requirements listed.</p>
              )}
            </CardContent>
          </Card>

          {/* Campaign Details */}
          <Card className="rounded-2xl border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base">Campaign Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <div className="grid size-9 place-items-center rounded-lg bg-muted text-primary">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Type</div>
                    <div className="text-sm font-medium">{campaign.role_type || "Campaign"}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="grid size-9 place-items-center rounded-lg bg-muted text-primary">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Location</div>
                    <div className="text-sm font-medium">{locationStr}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="grid size-9 place-items-center rounded-lg bg-muted text-primary">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Project Dates</div>
                    <div className="text-sm font-medium">{formatDateRange(campaign.dates)}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="grid size-9 place-items-center rounded-lg bg-muted text-primary">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
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
                  <div className="grid size-9 place-items-center rounded-lg bg-muted text-primary">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Applicants</div>
                    <div className="text-sm font-medium">{campaign.applications_count.toLocaleString()}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="grid size-9 place-items-center rounded-lg bg-muted text-primary">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Visibility</div>
                    <div className="text-sm font-medium capitalize">{campaign.visibility.replace("_", " ")}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Application Process */}
          <Card className="rounded-2xl border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base">Application Process</CardTitle>
              <CardDescription>What happens after you apply</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="hidden items-start md:flex">
                {processSteps.map((step, i) => (
                  <Fragment key={step.label}>
                    {i > 0 && (
                      <div
                        className={cn(
                          "mx-1 mt-5 h-0.5 flex-1 rounded-full",
                          step.done ? "bg-primary" : "bg-border",
                        )}
                      />
                    )}
                    <div className="flex flex-1 flex-col items-center px-1 text-center">
                      <div
                        className={cn(
                          "grid size-10 place-items-center rounded-full border-2 transition-colors",
                          step.done
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card text-muted-foreground",
                        )}
                      >
                        {step.done ? <Check className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                      </div>
                      <div className="mt-2 text-xs font-semibold">{step.label}</div>
                      <div className="text-[11px] text-muted-foreground">{step.date}</div>
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
            </CardContent>
          </Card>

          {/* Task Section */}
          {hasTask && (
            <Card className="rounded-2xl border-border bg-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" /> Task / Audition Brief
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
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
              </CardContent>
            </Card>
          )}

          {/* Questions Section */}
          {hasQuestions && (
            <Card className="rounded-2xl border-border bg-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" /> Application Questions
                </CardTitle>
                <CardDescription>You&apos;ll answer these when applying</CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Right Column */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6"
        >
          {/* Recruiter Card */}
          <Card className="rounded-2xl border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base">About the Recruiter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                    {isVerified && <BadgeCheck className="h-4 w-4 text-primary" />}
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
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="rounded-2xl border-border bg-card">
            <CardContent className="p-5">
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
              <CardHeader>
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
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-surface">
                      {rec.cover_image_url ? (
                        <img
                          src={rec.cover_image_url}
                          alt=""
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
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
      </div>

      {/* Sticky Apply Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 bottom-[72px] z-30 border-t border-border bg-background/85 px-4 py-3.5 backdrop-blur-xl md:bottom-0"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
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
