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
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { campaignApi, useCampaignTalentView, useRespondToInvite } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

  const [applyMessage, setApplyMessage] = useState("");
  const [showApplyForm, setShowApplyForm] = useState(false);

  const {
    data: campaign,
    isLoading,
    error,
  } = useCampaignTalentView(campaignId);

  const respondToInvite = useRespondToInvite();

  const applyMutation = useMutation({
    mutationFn: () =>
      campaignApi.apply(campaignId, { message: applyMessage || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["campaigns", "talent-view", campaignId],
      });
      toast.success("Application sent!");
      setShowApplyForm(false);
      setApplyMessage("");
    },
    onError: (err) => {
      toast.error("Failed to apply", {
        description: getApiErrorMessage(
          err,
          "Something went wrong. Please try again.",
        ),
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
      toast.success("Invite accepted");
    } catch {
      toast.error("Failed to accept invite");
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
      toast.success("Invite declined");
    } catch {
      toast.error("Failed to decline invite");
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
    <div className="max-w-[800px] mx-auto w-full px-4 py-6 pb-24 lg:pb-8 flex flex-col gap-5">
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
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary mt-2">
          {campaign.name}
        </h1>
      </div>

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
                onClick={() => setShowApplyForm(true)}
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
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowApplyForm(false);
                    setApplyMessage("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => applyMutation.mutate()}
                  disabled={applyMutation.isPending}
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
    </div>
  );
}
