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
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { campaignApi, useCampaignTalentView, useRespondToInvite } from "@/lib/api";
import { useBookmarkCampaign, useUnbookmarkCampaign } from "@/lib/api/hooks/useCampaigns";
import { useWithdrawApplication } from "@/lib/api/hooks/useCampaignTalentView";
import { getApiErrorMessage } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { usePopup } from "@/hooks/use-popup";
import { useAuthStore } from "@/providers/auth-store-provider";

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

export default function TalentCampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;
  const queryClient = useQueryClient();
  const { show } = usePopup();

  const [applyMessage, setApplyMessage] = useState("");
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [showTierDialog, setShowTierDialog] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const { user } = useAuthStore();

  const {
    data: campaign,
    isLoading,
    error,
  } = useCampaignTalentView(campaignId);

  const respondToInvite = useRespondToInvite();
  const withdrawMutation = useWithdrawApplication();
  const bookmarkMutation = useBookmarkCampaign();
  const unbookmarkMutation = useUnbookmarkCampaign();
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const isBookmarkPending = bookmarkMutation.isPending || unbookmarkMutation.isPending;

  const applyMutation = useMutation({
    mutationFn: () =>
      campaignApi.apply(campaignId, {
        message: applyMessage || undefined,
        answers: campaign?.questions?.length
          ? campaign.questions
              .filter((q) => answers[q._id] || q.is_required)
              .map((q) => ({ question_id: q._id, answer: answers[q._id] || '' }))
          : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["campaigns", "talent-view", campaignId],
      });
      show({ title: "Application sent!", variant: "success", position: "top-center" });
      setShowApplyForm(false);
      setApplyMessage("");
      setAnswers({});
    },
    onError: (err) => {
      show({
        title: "Failed to apply",
        description: getApiErrorMessage(
          err,
          "Something went wrong. Please try again.",
        ),
        variant: "error",
        position: "bottom-center",
      });
    },
  });

  const handleAcceptInvite = async () => {
    if (!campaign?.my_invite) return;
    try {
      await respondToInvite.mutateAsync({
        inviteId: campaign.my_invite._id,
        action: "accept",
      });
      queryClient.invalidateQueries({
        queryKey: ["campaigns", "talent-view", campaignId],
      });
      show({ title: "Invite accepted", variant: "success", position: "bottom-center" });
    } catch {
      show({ title: "Failed to accept invite", variant: "error", position: "bottom-center" });
    }
  };

  const handleDeclineInvite = async () => {
    if (!campaign?.my_invite) return;
    try {
      await respondToInvite.mutateAsync({
        inviteId: campaign.my_invite._id,
        action: "decline",
      });
      queryClient.invalidateQueries({
        queryKey: ["campaigns", "talent-view", campaignId],
      });
      show({ title: "Invite declined", variant: "success", position: "bottom-center" });
    } catch {
      show({ title: "Failed to decline invite", variant: "error", position: "bottom-center" });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-[800px] mx-auto w-full px-4 py-6 pb-24 lg:pb-8 space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="max-w-[800px] mx-auto w-full px-4 py-6">
        <Alert variant="destructive">
          <AlertDescription>
            {getApiErrorMessage(error, "Failed to load campaign")}
          </AlertDescription>
        </Alert>
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

  return (
    <div className="max-w-[800px] mx-auto w-full px-4 py-6 lg:pb-8 flex flex-col gap-5">
      {/* Back */}
      <Button
        variant="ghost"
        size="sm"
        className="w-fit -ml-2 text-text-secondary"
        onClick={() => router.push("/talent/opportunities")}
      >
        <ArrowLeft className="w-4 h-4 mr-1" strokeWidth={1.5} />
        Back to Opportunities
      </Button>

      {/* Invite / Application Status Banner */}
      {inviteStatus === "pending" && (
        <Card className="p-4 border-amber-200 bg-amber-50/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-amber-600" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  You have a pending invite
                </p>
                <p className="text-xs text-text-secondary mt-0.5">
                  Accept this invite to apply to the campaign.
                </p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                disabled={respondToInvite.isPending}
                onClick={handleDeclineInvite}
              >
                <X className="w-3.5 h-3.5 mr-1" strokeWidth={1.5} />
                Decline
              </Button>
              <Button
                size="sm"
                disabled={respondToInvite.isPending}
                onClick={handleAcceptInvite}
              >
                <Check className="w-3.5 h-3.5 mr-1" strokeWidth={1.5} />
                Accept
              </Button>
            </div>
          </div>
        </Card>
      )}

      {inviteStatus === "declined" && (
        <Card className="p-4 border-error-muted bg-error-light/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-error-light flex items-center justify-center shrink-0">
                <Ban className="w-4 h-4 text-error-text" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  You declined this invite
                </p>
                <p className="text-xs text-text-secondary mt-0.5">
                  You can re-accept if you changed your mind.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              disabled={respondToInvite.isPending}
              onClick={handleAcceptInvite}
              className="shrink-0"
            >
              <Check className="w-3.5 h-3.5 mr-1" strokeWidth={1.5} />
              Re-accept Invite
            </Button>
          </div>
        </Card>
      )}

      {hasApplied && (
        <Card
          className={cn(
            "p-4",
            applicationStatus === "pending"
              ? "border-warning-muted bg-warning-light/30"
              : applicationStatus === "accepted"
                ? "border-success-muted bg-success-light/30"
                : "border-error-muted bg-error-light/30",
          )}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                  applicationStatus === "pending"
                    ? "bg-warning-light"
                    : applicationStatus === "accepted"
                      ? "bg-success-light"
                      : "bg-error-light",
                )}
              >
                {applicationStatus === "pending" ? (
                  <Clock className="w-4 h-4 text-warning-text" strokeWidth={1.5} />
                ) : applicationStatus === "accepted" ? (
                  <CheckCircle2
                    className="w-4 h-4 text-success-text"
                    strokeWidth={1.5}
                  />
                ) : (
                  <X className="w-4 h-4 text-error-text" strokeWidth={1.5} />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  {applicationStatus === "pending"
                    ? "Application pending review"
                    : applicationStatus === "accepted"
                      ? "Application accepted"
                      : "Application rejected"}
                </p>
                <p className="text-xs text-text-secondary mt-0.5">
                  {applicationStatus === "pending"
                    ? "The recruiter is reviewing your application."
                    : applicationStatus === "accepted"
                      ? "Congratulations! The recruiter accepted your application."
                      : "Your application was not selected for this campaign."}
                </p>
              </div>
            </div>
            {(applicationStatus === "pending" || applicationStatus === "accepted") && (
              <Button
                size="sm"
                variant="outline"
                className="shrink-0 text-error-text hover:bg-error-light"
                onClick={() => setShowWithdrawConfirm(true)}
                disabled={withdrawMutation.isPending}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" strokeWidth={1.5} />
                Withdraw
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Campaign Header */}
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="text-2xs capitalize">
            {campaign.industry || "Campaign"}
          </Badge>
          {deadline && (
            <Badge
              variant="outline"
              className={cn(
                "text-2xs",
                deadline.urgent
                  ? "text-error-text border-error-muted"
                  : "",
              )}
            >
              <Calendar className="w-3 h-3 mr-0.5" strokeWidth={1.5} />
              {deadline.label}
            </Badge>
          )}
          {campaign.visibility === "invite_only" && (
            <Badge variant="outline" className="text-2xs">
              <Mail className="w-3 h-3 mr-0.5" strokeWidth={1.5} />
              Invite Only
            </Badge>
          )}
        </div>
        <div className="flex items-start justify-between gap-3 mt-2">
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">
            {campaign.name}
          </h1>
          <button
            onClick={() => {
              if (isBookmarkPending) return;
              if (campaign.is_bookmarked) {
                unbookmarkMutation.mutate(campaignId);
              } else {
                bookmarkMutation.mutate(campaignId);
              }
            }}
            disabled={isBookmarkPending}
            className="p-2 rounded-full hover:bg-muted-bg transition-colors shrink-0"
            aria-label={campaign.is_bookmarked ? "Remove bookmark" : "Bookmark"}
          >
            <Bookmark
              className={cn(
                "w-5 h-5",
                campaign.is_bookmarked ? "fill-brand text-brand" : "text-text-muted"
              )}
              strokeWidth={1.5}
            />
          </button>
          <button
            onClick={() => {
              const url = `${window.location.origin}/talent/opportunities/${campaignId}`;
              navigator.clipboard.writeText(url);
            }}
            className="p-2 rounded-full hover:bg-muted-bg transition-colors shrink-0"
            aria-label="Copy link"
          >
            <Link2 className="w-5 h-5 text-text-muted" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Media */}
      {campaign.cover_image_url && (
        <Card className="p-0 overflow-hidden">
          <img src={campaign.cover_image_url} alt={campaign.name} className="w-full h-48 sm:h-64 object-cover" />
        </Card>
      )}
      {campaign.media && campaign.media.length > 0 && (
        <div className="flex flex-col gap-5">
          {campaign.media.map((item, idx) => (
            <Card key={idx} className="p-0 overflow-hidden">
              {item.type === 'video' ? (
                <video src={item.url} className="w-full h-48 sm:h-64 object-cover" controls />
              ) : (
                <img src={item.url} alt={item.caption || ''} className="w-full h-48 sm:h-64 object-cover" />
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Campaign Details */}
      <Card className="p-5 space-y-4">
        {campaign.description && (
          <div>
            <h2 className="text-sm font-semibold text-text-primary mb-1">
              About
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              {campaign.description}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {loc && (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <MapPin className="w-4 h-4 text-text-muted" strokeWidth={1.5} />
              {loc}
            </div>
          )}
          {campaign.role_type && (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Briefcase className="w-4 h-4 text-text-muted" strokeWidth={1.5} />
              {campaign.role_type}
            </div>
          )}
          {campaign.budget_range && (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Banknote className="w-4 h-4 text-text-muted" strokeWidth={1.5} />
              {campaign.budget_range.currency || "USD"}{" "}
              {campaign.budget_range.min?.toLocaleString()}
              {campaign.budget_range.max
                ? ` - ${campaign.budget_range.max.toLocaleString()}`
                : "+"}
            </div>
          )}
          {campaign.dates?.start && (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Calendar className="w-4 h-4 text-text-muted" strokeWidth={1.5} />
              {new Date(campaign.dates.start).toLocaleDateString()}
              {campaign.dates.end
                ? ` - ${new Date(campaign.dates.end).toLocaleDateString()}`
                : ""}
            </div>
          )}
        </div>

        {!!(campaign.requirements?.skills?.length ||
          campaign.requirements?.languages?.length ||
          campaign.requirements?.gender ||
          campaign.requirements?.age_range) && (
          <div className="pt-3 border-t border-border-subtle">
            <h2 className="text-sm font-semibold text-text-primary mb-2">
              Requirements
            </h2>
            <div className="flex flex-wrap gap-2">
              {campaign.requirements?.skills?.map((skill) => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="text-xs font-normal"
                >
                  {skill}
                </Badge>
              ))}
              {campaign.requirements?.languages?.map((lang) => (
                <Badge
                  key={lang}
                  variant="outline"
                  className="text-xs font-normal"
                >
                  <Globe className="w-3 h-3 mr-0.5" strokeWidth={1.5} />
                  {lang}
                </Badge>
              ))}
              {campaign.requirements?.gender && (
                <Badge variant="outline" className="text-xs font-normal">
                  <User className="w-3 h-3 mr-0.5" strokeWidth={1.5} />
                  {campaign.requirements.gender}
                </Badge>
              )}
              {campaign.requirements?.age_range && (
                <Badge variant="outline" className="text-xs font-normal">
                  Age: {campaign.requirements.age_range.min ?? "Any"} -
                  {campaign.requirements.age_range.max ?? "Any"}
                </Badge>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Apply Section */}
      {!hasApplied && inviteStatus !== "pending" && (
        <Card className="p-5">
          {!showApplyForm ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center">
                  <Send className="w-5 h-5 text-brand" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    Interested in this role?
                  </p>
                  <p className="text-xs text-text-secondary">
                    Apply now to be considered for this campaign.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => {
                  if ((user?.verification_tier ?? 1) < 3) {
                    setShowTierDialog(true);
                  } else {
                    setShowApplyForm(true);
                  }
                }}
                className="shrink-0"
              >
                <Send className="w-4 h-4 mr-1.5" strokeWidth={1.5} />
                Apply Now
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-text-secondary mb-1.5 block">
                  Message to recruiter (optional)
                </label>
                <Textarea
                  value={applyMessage}
                  onChange={(e) => setApplyMessage(e.target.value)}
                  placeholder="Introduce yourself, mention relevant experience..."
                  rows={4}
                  maxLength={1000}
                  className="resize-none"
                />
                <p className="text-[11px] text-text-muted mt-1 text-right">
                  {applyMessage.length}/1000
                </p>
              </div>

              {campaign?.questions && campaign.questions.length > 0 && (
                <div className="space-y-3"
                >
                  <p className="text-sm font-medium text-text-secondary"
                  >Application questions
                  </p>
                  {campaign.questions.map((q) => (
                    <div key={q._id} className="space-y-1.5"
                    >
                      <label className="text-sm text-text-primary"
                      >
                        {q.question_text}
                        {q.is_required && <span className="text-error-text"> *</span>}
                      </label>
                      {q.question_type === 'text' && (
                        <Textarea
                          value={answers[q._id] || ''}
                          onChange={(e) => setAnswers((prev) => ({ ...prev, [q._id]: e.target.value }))}
                          placeholder="Your answer..."
                          rows={2}
                          className="resize-none text-sm"
                        />
                      )}
                      {q.question_type === 'number' && (
                        <Input
                          type="number"
                          value={answers[q._id] || ''}
                          onChange={(e) => setAnswers((prev) => ({ ...prev, [q._id]: e.target.value }))}
                          className="text-sm h-9"
                        />
                      )}
                      {(q.question_type === 'select' || q.question_type === 'multiselect') && (
                        <div className="flex flex-wrap gap-2"
                        >
                          {q.options?.map((opt) => (
                            <Button
                              key={opt}
                              type="button"
                              variant={answers[q._id]?.includes(opt) ? 'primary' : 'outline'}
                              size="sm"
                              onClick={() => {
                                if (q.question_type === 'multiselect') {
                                  const current = answers[q._id] || '';
                                  const selected = current ? current.split(', ') : [];
                                  const next = selected.includes(opt)
                                    ? selected.filter((s) => s !== opt).join(', ')
                                    : [...selected, opt].join(', ');
                                  setAnswers((prev) => ({ ...prev, [q._id]: next }));
                                } else {
                                  setAnswers((prev) => ({ ...prev, [q._id]: opt }));
                                }
                              }}
                            >
                              {opt}
                            </Button>
                          ))}
                        </div>
                      )}
                      {q.question_type === 'boolean' && (
                        <div className="flex gap-2"
                        >
                          <Button
                            type="button"
                            variant={answers[q._id] === 'Yes' ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => setAnswers((prev) => ({ ...prev, [q._id]: 'Yes' }))}
                          >
                            Yes
                          </Button>
                          <Button
                            type="button"
                            variant={answers[q._id] === 'No' ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => setAnswers((prev) => ({ ...prev, [q._id]: 'No' }))}
                          >
                            No
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2 justify-end"
              >
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowApplyForm(false);
                    setApplyMessage("");
                    setAnswers({});
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => applyMutation.mutate()}
                  disabled={applyMutation.isPending || (campaign?.questions?.some((q) => q.is_required && !answers[q._id]) ?? false)}
                >
                  <Send className="w-4 h-4 mr-1.5" strokeWidth={1.5} />
                  {applyMutation.isPending
                    ? "Sending..."
                    : "Send Application"}
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Tier Requirement Dialog */}
      <Dialog open={showTierDialog} onOpenChange={setShowTierDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verification Required</DialogTitle>
            <DialogDescription>
              Only Tier 3 verified talents can apply to campaigns. Complete your verification to unlock applications.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTierDialog(false)}>Cancel</Button>
            <Button onClick={() => router.push("/talent/verify-documents")}>
              Verify Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw Confirmation Dialog */}
      <Dialog open={showWithdrawConfirm} onOpenChange={setShowWithdrawConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Withdraw Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to withdraw your application for &quot;{campaign?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWithdrawConfirm(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                withdrawMutation.mutate(campaignId, {
                  onSuccess: () => setShowWithdrawConfirm(false),
                });
              }}
              disabled={withdrawMutation.isPending}
            >
              Withdraw
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
