"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Send,
  Check,
  X,
  Mail,
  User,
  Briefcase,
  Banknote,
  Globe,
  CheckCircle2,
  Ban,
  Trash2,
  Bookmark,
  Link2,
  ShieldCheck,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { campaignApi, useCampaignTalentView, useRespondToInvite } from "@/lib/api";
import { useBookmarkCampaign, useUnbookmarkCampaign } from "@/lib/api/hooks/useCampaigns";
import { useWithdrawApplication } from "@/lib/api/hooks/useCampaignTalentView";
import { getApiErrorMessage } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { usePopup } from "@/hooks/use-popup";
import { useAuthStore } from "@/providers/auth-store-provider";

/* ------------------------------------------------------------------ */
/*  HELPERS                                                           */
/* ------------------------------------------------------------------ */

const PROFESSION_GRADIENT: Record<string, string> = {
  Actor: "from-[var(--color-opportunity-theater-start)] to-[var(--color-opportunity-theater-end)]",
  Model: "from-[var(--color-opportunity-fashion-start)] to-[var(--color-opportunity-fashion-end)]",
  Dancer: "from-[var(--color-opportunity-theater-start)] to-[var(--color-opportunity-theater-end)]",
  Musician: "from-[var(--color-opportunity-theater-start)] to-[var(--color-opportunity-theater-end)]",
  "Voice Artist": "from-[var(--color-opportunity-film-start)] to-[var(--color-opportunity-film-end)]",
  Photographer: "from-[var(--color-opportunity-film-start)] to-[var(--color-opportunity-film-end)]",
  Influencer: "from-[var(--color-opportunity-tv-start)] to-[var(--color-opportunity-tv-end)]",
  "Extra / Background": "from-[var(--color-opportunity-default-start)] to-[var(--color-opportunity-default-end)]",
};

function resolveGradient(roleType?: string) {
  if (!roleType) return "from-[var(--color-opportunity-default-start)] to-[var(--color-opportunity-default-end)]";
  const key = roleType.toLowerCase();
  for (const [k, v] of Object.entries(PROFESSION_GRADIENT)) {
    if (key.includes(k.toLowerCase())) return v;
  }
  return "from-[var(--color-opportunity-default-start)] to-[var(--color-opportunity-default-end)]";
}

function formatDeadline(deadline?: string) {
  if (!deadline) return null;
  const date = new Date(deadline);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return { label: "Expired", urgent: false };
  if (daysLeft === 0) return { label: "Due today", urgent: true };
  if (daysLeft <= 3) return { label: `${daysLeft}d left`, urgent: true };
  if (daysLeft <= 7) return { label: `${daysLeft}d left`, urgent: false };
  return {
    label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    urgent: false,
  };
}

/* ------------------------------------------------------------------ */
/*  PAGE                                                              */
/* ------------------------------------------------------------------ */

export default function TalentCampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;
  const queryClient = useQueryClient();
  const { show } = usePopup();
  const { user } = useAuthStore();

  const [applyMessage, setApplyMessage] = useState("");
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [showTierDialog, setShowTierDialog] = useState(false);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const {
    data: campaign,
    isLoading,
    error,
  } = useCampaignTalentView(campaignId);

  const respondToInvite = useRespondToInvite();
  const withdrawMutation = useWithdrawApplication();
  const bookmarkMutation = useBookmarkCampaign();
  const unbookmarkMutation = useUnbookmarkCampaign();
  const isBookmarkPending = bookmarkMutation.isPending || unbookmarkMutation.isPending;

  const applyMutation = useMutation({
    mutationFn: () =>
      campaignApi.apply(campaignId, {
        message: applyMessage || undefined,
        answers: campaign?.questions?.length
          ? campaign.questions
              .filter((q) => answers[q._id] || q.is_required)
              .map((q) => ({ question_id: q._id, answer: answers[q._id] || "" }))
          : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns", "talent-view", campaignId] });
      show({ title: "Application sent!", variant: "success", position: "top-center" });
      setShowApplyForm(false);
      setApplyMessage("");
      setAnswers({});
    },
    onError: (err) => {
      show({
        title: "Failed to apply",
        description: getApiErrorMessage(err, "Something went wrong. Please try again."),
        variant: "error",
        position: "bottom-center",
      });
    },
  });

  const handleInviteResponse = async (action: "accept" | "decline") => {
    if (!campaign?.my_invite) return;
    try {
      await respondToInvite.mutateAsync({ inviteId: campaign.my_invite._id, action });
      queryClient.invalidateQueries({ queryKey: ["campaigns", "talent-view", campaignId] });
      show({
        title: action === "accept" ? "Invite accepted" : "Invite declined",
        variant: "success",
        position: "bottom-center",
      });
    } catch {
      show({ title: `Failed to ${action} invite`, variant: "error", position: "bottom-center" });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-5 pb-24 space-y-4">
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-5">
        <Card className="p-4 border-error-muted bg-error-light text-sm text-error-text">
          {getApiErrorMessage(error, "Failed to load campaign")}
        </Card>
      </div>
    );
  }

  const deadline = formatDeadline(campaign.deadline);
  const loc = [campaign.location?.city, campaign.location?.state]
    .filter((s): s is string => !!s && s.trim() !== "")
    .join(", ");
  const inviteStatus = campaign.my_invite?.status;
  const applicationStatus = campaign.my_application?.status;
  const hasApplied = !!campaign.my_application;
  const gradient = resolveGradient(campaign.role_type);

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 pb-24 space-y-4">
      <BackButton onClick={() => router.push("/talent/opportunities")} />

      <CampaignHeader
        campaign={campaign}
        deadline={deadline}
        gradient={gradient}
        isBookmarkPending={isBookmarkPending}
        onBookmark={() => {
          if (campaign.is_bookmarked) {
            unbookmarkMutation.mutate(campaignId);
          } else {
            bookmarkMutation.mutate(campaignId);
          }
        }}
        onCopyLink={() => {
          navigator.clipboard.writeText(`${window.location.origin}/talent/opportunities/${campaignId}`);
          show({ title: "Link copied", variant: "success", position: "bottom-center" });
        }}
      />

      <InviteBanner
        status={inviteStatus}
        isPending={respondToInvite.isPending}
        onAccept={() => handleInviteResponse("accept")}
        onDecline={() => handleInviteResponse("decline")}
      />

      <ApplicationBanner
        hasApplied={hasApplied}
        status={applicationStatus}
        isPending={withdrawMutation.isPending}
        onWithdraw={() => setShowWithdrawConfirm(true)}
      />

      <MediaGallery campaign={campaign} />

      <DetailsCard campaign={campaign} loc={loc} deadline={deadline} />

      {!hasApplied && inviteStatus !== "pending" && (
        <ApplyCard
          showForm={showApplyForm}
          onToggleForm={() => {
            if ((user?.verification_tier ?? 1) < 3) {
              setShowTierDialog(true);
            } else {
              setShowApplyForm(true);
            }
          }}
          applyMessage={applyMessage}
          onApplyMessageChange={setApplyMessage}
          answers={answers}
          onAnswersChange={setAnswers}
          questions={campaign.questions}
          isSubmitting={applyMutation.isPending}
          onSubmit={() => applyMutation.mutate()}
          onCancel={() => {
            setShowApplyForm(false);
            setApplyMessage("");
            setAnswers({});
          }}
        />
      )}

      <TierDialog open={showTierDialog} onOpenChange={setShowTierDialog} onVerify={() => router.push("/talent/verify-documents")} />

      <WithdrawDialog
        open={showWithdrawConfirm}
        onOpenChange={setShowWithdrawConfirm}
        campaignName={campaign.name}
        isPending={withdrawMutation.isPending}
        onConfirm={() => withdrawMutation.mutate(campaignId, { onSuccess: () => setShowWithdrawConfirm(false) })}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  BACK BUTTON                                                       */
/* ------------------------------------------------------------------ */

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-soft hover:text-ink transition-colors"
    >
      <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
      Back to Opportunities
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  CAMPAIGN HEADER                                                   */
/* ------------------------------------------------------------------ */

function CampaignHeader({
  campaign,
  deadline,
  gradient,
  isBookmarkPending,
  onBookmark,
  onCopyLink,
}: {
  campaign: NonNullable<ReturnType<typeof useCampaignTalentView>["data"]>;
  deadline: ReturnType<typeof formatDeadline>;
  gradient: string;
  isBookmarkPending: boolean;
  onBookmark: () => void;
  onCopyLink: () => void;
}) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden rounded-xl border-0 text-white p-5",
        "bg-gradient-to-br",
        gradient,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {campaign.role_type && (
              <span className="text-[10.5px] bg-white/15 backdrop-blur-sm rounded-full px-2.5 py-1 font-medium">
                {campaign.role_type}
              </span>
            )}
            {campaign.specialties?.map((s) => (
              <span key={s} className="text-[10.5px] bg-white/15 backdrop-blur-sm rounded-full px-2.5 py-1 font-medium">
                {s}
              </span>
            ))}
            {campaign.visibility === "invite_only" && (
              <span className="text-[10.5px] bg-white/15 backdrop-blur-sm rounded-full px-2.5 py-1 font-medium flex items-center gap-1">
                <Mail className="h-3 w-3" />
                Invite Only
              </span>
            )}
          </div>

          <h1 className="text-xl font-serif font-bold leading-snug">{campaign.name}</h1>

          <div className="flex items-center gap-3 mt-2.5 flex-wrap">
            {deadline && (
              <span
                className={cn(
                  "text-[11px] flex items-center gap-1",
                  deadline.urgent ? "text-amber-300 font-medium" : "text-white/70",
                )}
              >
                <Clock className="h-3 w-3" />
                {deadline.label}
              </span>
            )}
            {campaign.applications_count > 0 && (
              <span className="text-[11px] text-white/70 flex items-center gap-1">
                <User className="h-3 w-3" />
                {campaign.applications_count} applicant{campaign.applications_count !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onBookmark(); }}
            disabled={isBookmarkPending}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            aria-label={campaign.is_bookmarked ? "Remove bookmark" : "Bookmark"}
          >
            <Bookmark
              className={cn("h-4 w-4", campaign.is_bookmarked ? "fill-white text-white" : "text-white/70")}
              strokeWidth={1.5}
            />
          </button>
          <button
            onClick={onCopyLink}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <Link2 className="h-4 w-4 text-white/70" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  INVITE BANNER                                                     */
/* ------------------------------------------------------------------ */

function InviteBanner({
  status,
  isPending,
  onAccept,
  onDecline,
}: {
  status?: string;
  isPending: boolean;
  onAccept: () => void;
  onDecline: () => void;
}) {
  if (!status || status === "accepted") return null;

  const isDeclined = status === "declined";

  return (
    <Card
      className={cn(
        "p-4",
        isDeclined
          ? "border-error-muted bg-error-light/50"
          : "border-gold/30 bg-gold-soft/50",
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
              isDeclined ? "bg-error-light text-error-text" : "bg-gold-soft text-gold-ink",
            )}
          >
            {isDeclined ? <Ban className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
          </div>
          <div>
            <p className="text-[13px] font-semibold text-ink">
              {isDeclined ? "You declined this invite" : "You have a pending invite"}
            </p>
            <p className="text-[12px] text-ink-soft mt-0.5">
              {isDeclined
                ? "You can re-accept if you changed your mind."
                : "Accept this invite to apply to the campaign."}
            </p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          {isDeclined ? null : (
            <Button size="sm" variant="outline" disabled={isPending} onClick={onDecline}>
              <X className="h-3.5 w-3.5 mr-1" />
              Decline
            </Button>
          )}
          <Button size="sm" disabled={isPending} onClick={onAccept}>
            <Check className="h-3.5 w-3.5 mr-1" />
            {isDeclined ? "Re-accept" : "Accept"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  APPLICATION BANNER                                                */
/* ------------------------------------------------------------------ */

function ApplicationBanner({
  hasApplied,
  status,
  isPending,
  onWithdraw,
}: {
  hasApplied: boolean;
  status?: string;
  isPending: boolean;
  onWithdraw: () => void;
}) {
  if (!hasApplied) return null;

  const isAccepted = status === "accepted";
  const isRejected = status === "rejected";

  const colors = isAccepted
    ? { border: "border-success-muted", bg: "bg-success-light/50", iconBg: "bg-success-light", icon: "text-success-text", Icon: CheckCircle2 }
    : isRejected
      ? { border: "border-error-muted", bg: "bg-error-light/50", iconBg: "bg-error-light", icon: "text-error-text", Icon: X }
      : { border: "border-gold/30", bg: "bg-gold-soft/50", iconBg: "bg-gold-soft", icon: "text-gold-ink", Icon: Clock };

  const title = isAccepted
    ? "Application accepted"
    : isRejected
      ? "Application rejected"
      : "Application pending review";

  const desc = isAccepted
    ? "Congratulations! The recruiter accepted your application."
    : isRejected
      ? "Your application was not selected for this campaign."
      : "The recruiter is reviewing your application.";

  return (
    <Card className={cn("p-4", colors.border, colors.bg)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0", colors.iconBg)}>
            <colors.Icon className={cn("h-4 w-4", colors.icon)} />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-ink">{title}</p>
            <p className="text-[12px] text-ink-soft mt-0.5">{desc}</p>
          </div>
        </div>
        {(status === "pending" || status === "accepted") && (
          <Button
            size="sm"
            variant="outline"
            className="shrink-0 text-error-text hover:bg-error-light"
            onClick={onWithdraw}
            disabled={isPending}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Withdraw
          </Button>
        )}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  MEDIA GALLERY                                                     */
/* ------------------------------------------------------------------ */

function MediaGallery({ campaign }: { campaign: NonNullable<ReturnType<typeof useCampaignTalentView>["data"]> }) {
  const media = campaign.media && campaign.media.length > 0 ? campaign.media : [];
  const hasCover = !!campaign.cover_image_url;

  if (!hasCover && media.length === 0) return null;

  const allItems = [
    ...(hasCover ? [{ url: campaign.cover_image_url!, type: "image" as const, caption: undefined as string | undefined }] : []),
    ...media,
  ];

  return (
    <div className="space-y-2">
      {allItems.map((item, i) => (
        <Card key={i} className="overflow-hidden border-0 rounded-xl">
          {item.type === "video" ? (
            <video src={item.url} className="w-full h-48 sm:h-64 object-cover" controls />
          ) : (
            <img
              src={item.url}
              alt={item.caption || campaign.name}
              className="w-full h-48 sm:h-64 object-cover"
            />
          )}
        </Card>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  DETAILS CARD                                                      */
/* ------------------------------------------------------------------ */

function DetailsCard({
  campaign,
  loc,
  deadline,
}: {
  campaign: NonNullable<ReturnType<typeof useCampaignTalentView>["data"]>;
  loc: string;
  deadline: ReturnType<typeof formatDeadline>;
}) {
  const hasRequirements = !!(
    campaign.requirements?.skills?.length ||
    campaign.requirements?.languages?.length ||
    campaign.requirements?.gender ||
    campaign.requirements?.age_range
  );

  return (
    <Card className="p-5 space-y-5">
      {campaign.description && (
        <div>
          <h2 className="text-sm font-semibold text-ink mb-2">About</h2>
          <p className="text-[13px] text-ink-soft leading-relaxed">{campaign.description}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {loc && (
          <DetailItem icon={MapPin} label="Location" value={loc} />
        )}
        {campaign.role_type && (
          <DetailItem icon={Briefcase} label="Role Type" value={campaign.role_type} />
        )}
        {campaign.budget_range && (
          <DetailItem
            icon={Banknote}
            label="Budget"
            value={
              campaign.budget_range.currency
                ? `${campaign.budget_range.currency} ${campaign.budget_range.min?.toLocaleString() || ""}${campaign.budget_range.max ? ` - ${campaign.budget_range.max.toLocaleString()}` : campaign.budget_range.min ? "+" : "Not disclosed"}`
                : campaign.budget_range.min?.toLocaleString() || "Not disclosed"
            }
          />
        )}
        {campaign.dates?.start && (
          <DetailItem
            icon={Calendar}
            label="Dates"
            value={`${new Date(campaign.dates.start).toLocaleDateString()}${campaign.dates.end ? ` - ${new Date(campaign.dates.end).toLocaleDateString()}` : ""}`}
          />
        )}
        {deadline && (
          <DetailItem
            icon={Clock}
            label="Deadline"
            value={deadline.label}
            valueClass={deadline.urgent ? "text-amber-600 font-medium" : undefined}
          />
        )}
        {campaign.visibility === "invite_only" && (
          <DetailItem icon={ShieldCheck} label="Visibility" value="Invite Only" />
        )}
      </div>

      {hasRequirements && (
        <div className="pt-3 border-t border-border">
          <h2 className="text-sm font-semibold text-ink mb-2.5">Requirements</h2>
          <div className="flex flex-wrap gap-1.5">
            {campaign.requirements?.skills?.map((skill) => (
              <span
                key={skill}
                className="text-[11px] px-2.5 py-1 rounded-full bg-cream border border-border text-ink-soft font-medium"
              >
                {skill}
              </span>
            ))}
            {campaign.requirements?.languages?.map((lang) => (
              <span
                key={lang}
                className="text-[11px] px-2.5 py-1 rounded-full bg-cream border border-border text-ink-soft font-medium inline-flex items-center gap-1"
              >
                <Globe className="h-3 w-3" />
                {lang}
              </span>
            ))}
            {campaign.requirements?.gender && (
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-cream border border-border text-ink-soft font-medium inline-flex items-center gap-1">
                <User className="h-3 w-3" />
                {campaign.requirements.gender}
              </span>
            )}
            {campaign.requirements?.age_range && (
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-cream border border-border text-ink-soft font-medium">
                Age: {campaign.requirements.age_range.min ?? "Any"} - {campaign.requirements.age_range.max ?? "Any"}
              </span>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
  valueClass,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-8 w-8 rounded-lg bg-cream border border-border shrink-0 grid place-items-center">
        <Icon className="h-3.5 w-3.5 text-ink-muted" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.1em] text-ink-muted font-medium">{label}</p>
        <p className={cn("text-[13px] text-ink truncate", valueClass)}>{value}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  APPLY CARD                                                        */
/* ------------------------------------------------------------------ */

function ApplyCard({
  showForm,
  onToggleForm,
  applyMessage,
  onApplyMessageChange,
  answers,
  onAnswersChange,
  questions,
  isSubmitting,
  onSubmit,
  onCancel,
}: {
  showForm: boolean;
  onToggleForm: () => void;
  applyMessage: string;
  onApplyMessageChange: (v: string) => void;
  answers: Record<string, string>;
  onAnswersChange: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  questions?: Array<{
    _id: string;
    question_text: string;
    question_type: "text" | "number" | "select" | "multiselect" | "boolean";
    options: string[];
    is_required: boolean;
  }>;
  isSubmitting: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  if (!showForm) {
    return (
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gold-soft grid place-items-center shrink-0">
              <Send className="h-5 w-5 text-gold-ink" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-ink">Interested in this role?</p>
              <p className="text-[12px] text-ink-soft mt-0.5">Apply now to be considered for this campaign.</p>
            </div>
          </div>
          <Button onClick={onToggleForm} className="shrink-0">
            <Send className="h-4 w-4 mr-1.5" />
            Apply Now
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5 space-y-4">
      <div>
        <label className="text-[13px] font-medium text-ink mb-2 block">
          Message to recruiter <span className="text-ink-muted font-normal">(optional)</span>
        </label>
        <Textarea
          value={applyMessage}
          onChange={(e) => onApplyMessageChange(e.target.value)}
          placeholder="Introduce yourself, mention relevant experience..."
          rows={4}
          maxLength={1000}
          className="resize-none text-[13px]"
        />
        <p className="text-[10px] text-ink-muted mt-1 text-right">{applyMessage.length}/1000</p>
      </div>

      {questions && questions.length > 0 && (
        <div className="space-y-3">
          <p className="text-[13px] font-medium text-ink">Application questions</p>
          {questions.map((q) => (
            <div key={q._id} className="space-y-1.5">
              <label className="text-[13px] text-ink-soft">
                {q.question_text}
                {q.is_required && <span className="text-error-text"> *</span>}
              </label>
              {q.question_type === "text" && (
                <Textarea
                  value={answers[q._id] || ""}
                  onChange={(e) => onAnswersChange((prev) => ({ ...prev, [q._id]: e.target.value }))}
                  placeholder="Your answer..."
                  rows={2}
                  className="resize-none text-[13px]"
                />
              )}
              {q.question_type === "number" && (
                <Input
                  type="number"
                  value={answers[q._id] || ""}
                  onChange={(e) => onAnswersChange((prev) => ({ ...prev, [q._id]: e.target.value }))}
                  className="text-[13px] h-9"
                />
              )}
              {(q.question_type === "select" || q.question_type === "multiselect") && (
                <div className="flex flex-wrap gap-2">
                  {q.options?.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        if (q.question_type === "multiselect") {
                          const current = answers[q._id] || "";
                          const selected = current ? current.split(", ") : [];
                          const next = selected.includes(opt)
                            ? selected.filter((s) => s !== opt).join(", ")
                            : [...selected, opt].join(", ");
                          onAnswersChange((prev) => ({ ...prev, [q._id]: next }));
                        } else {
                          onAnswersChange((prev) => ({ ...prev, [q._id]: opt }));
                        }
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors",
                        answers[q._id]?.includes(opt)
                          ? "bg-gold border-gold text-white"
                          : "bg-card border-border text-ink-soft hover:bg-cream",
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
              {q.question_type === "boolean" && (
                <div className="flex gap-2">
                  {["Yes", "No"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => onAnswersChange((prev) => ({ ...prev, [q._id]: opt }))}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors",
                        answers[q._id] === opt
                          ? "bg-gold border-gold text-white"
                          : "bg-card border-border text-ink-soft hover:bg-cream",
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 justify-end pt-2 border-t border-border">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button
          onClick={onSubmit}
          disabled={isSubmitting || (questions?.some((q) => q.is_required && !answers[q._id]) ?? false)}
        >
          <Send className="h-4 w-4 mr-1.5" />
          {isSubmitting ? "Sending..." : "Send Application"}
        </Button>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  DIALOGS                                                           */
/* ------------------------------------------------------------------ */

function TierDialog({
  open,
  onOpenChange,
  onVerify,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onVerify: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verification Required</DialogTitle>
          <DialogDescription>
            Only Tier 3 verified talents can apply to campaigns. Complete your verification to unlock applications.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onVerify}>Verify Now</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function WithdrawDialog({
  open,
  onOpenChange,
  campaignName,
  isPending,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  campaignName: string;
  isPending: boolean;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Withdraw Application</DialogTitle>
          <DialogDescription>
            Are you sure you want to withdraw your application for &quot;{campaignName}&quot;? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isPending}>Withdraw</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
