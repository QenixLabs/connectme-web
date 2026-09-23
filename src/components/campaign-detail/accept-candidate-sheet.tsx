"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  BadgeCheck,
  CalendarDays,
  Check,
  Loader2,
  MessageSquareText,
  X,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useBulkUpdateApplications, useCampaign } from "@/hooks/use-campaigns";
import { conversationsApi } from "@/lib/api";
import type { EnrichedApplication } from "@/lib/api/campaigns";

const MESSAGE_MAX_LENGTH = 500;

type NextStep = "schedule" | "message";

function displayNameOf(app: EnrichedApplication): string {
  const tp = app.talent_profile;
  if (tp?.full_legal_name) return tp.full_legal_name;
  if (tp?.username) return tp.username;
  const tid = app.talent_id;
  if (typeof tid === "object")
    return tid.full_legal_name || tid.username || "Unknown";
  return "Unknown";
}

function firstNameOf(app: EnrichedApplication): string {
  return displayNameOf(app).trim().split(/\s+/)[0] || "there";
}

function usernameOf(app: EnrichedApplication): string | undefined {
  if (app.talent_profile?.username) return app.talent_profile.username;
  const tid = app.talent_id;
  if (typeof tid === "object") return tid.username;
  return undefined;
}

function professionOf(app: EnrichedApplication): string {
  return app.talent_profile?.professions?.[0]?.trim() || "Talent";
}

function locationOf(app: EnrichedApplication): string {
  const city = app.talent_profile?.location?.city?.trim();
  const state = app.talent_profile?.location?.state?.trim();
  return [city, state].filter(Boolean).join(", ");
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "–";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
}

function newClientMessageId(): string {
  return `client-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Accept-candidate confirmation.
 *
 * IMPORTANT: this sheet never accepts on open. The existing accept mutation
 * (`useBulkUpdateApplications` → `bulkUpdateApplications(..., "accepted")`)
 * runs ONLY from `handleConfirm` (the "Confirm & Accept" button).
 */
export function AcceptCandidateSheet({
  open,
  onOpenChange,
  campaignId,
  application,
  onAccepted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: string;
  application: EnrichedApplication | null;
  onAccepted?: () => void;
}) {
  // Reuses the CURRENT accept mutation + its query invalidation. No new endpoint.
  const bulkUpdate = useBulkUpdateApplications();
  // Already cached by the dashboard; only used for the message placeholder.
  const { data: campaign } = useCampaign(campaignId);

  const [message, setMessage] = useState("");
  const [nextStep, setNextStep] = useState<NextStep>("message");

  // Keep the last candidate rendered so the close animation has content,
  // and reset the form whenever a *different* candidate is opened.
  const [lastApp, setLastApp] = useState<EnrichedApplication | null>(application);
  const [lastAppId, setLastAppId] = useState<string | null>(
    application?._id ?? null,
  );
  if (application && application._id !== lastAppId) {
    setLastApp(application);
    setLastAppId(application._id);
    setMessage("");
    setNextStep("message");
  }

  const target = application ?? lastApp;
  const pending = bulkUpdate.isPending;

  const campaignName = campaign?.name?.trim() || "this campaign";

  const handleOpenChange = (next: boolean) => {
    // Backdrop tap / Escape / close button must not interrupt a submission.
    if (pending && !next) return;
    onOpenChange(next);
  };

  const sendFollowUpMessage = async (
    username: string | undefined,
    text: string,
    firstName: string,
  ) => {
    if (!username) {
      toast.error("Accepted, but the message could not be sent");
      return;
    }
    try {
      const { conversation_id } =
        await conversationsApi.startByUsername(username);
      await conversationsApi.sendMessage({
        conversation_id,
        content: text,
        client_message_id: newClientMessageId(),
      });
      toast.success(`Message sent to ${firstName}`);
    } catch {
      toast.error("Accepted, but the message could not be sent");
    }
  };

  const handleConfirm = () => {
    // ONLY here does the accept API run — never from the outer Accept button.
    if (!target || pending) return;
    const followUp = message.trim();
    const talentUsername = usernameOf(target);
    const talentFirstName = firstNameOf(target);
    bulkUpdate.mutate(
      { campaignId, applicationIds: [target._id], status: "accepted" },
      {
        onSuccess: (data) => {
          // Existing success toast copy.
          toast.success(
            `Accepted ${data.updated} applicant${data.updated === 1 ? "" : "s"}`,
          );
          setMessage("");
          setNextStep("message");
          onOpenChange(false);
          onAccepted?.();
          // Optional message is delivered through the existing messaging
          // API (same pattern as audition reminders). It never blocks the
          // accept result and never reopens the sheet.
          if (followUp) {
            void sendFollowUpMessage(
              talentUsername,
              followUp,
              talentFirstName,
            );
          }
        },
        onError: () => {
          // Existing error toast copy. Sheet stays open and the
          // typed message is preserved.
          toast.error("Failed to accept applicants");
        },
      },
    );
  };

  const name = target ? displayNameOf(target) : "";
  const firstName = target ? firstNameOf(target) : "there";
  const photo = target?.talent_profile?.profile_photo;
  const verified = target?.talent_profile?.is_verified ?? false;
  const profession = target ? professionOf(target) : "";
  const location = target ? locationOf(target) : "";
  const match = target?.match_score ?? 0;
  const alreadyAccepted = target?.status === "accepted";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        aria-label={target ? `Accept ${name}` : "Accept candidate"}
        onInteractOutside={(event) => {
          if (pending) event.preventDefault();
        }}
        onEscapeKeyDown={(event) => {
          if (pending) event.preventDefault();
        }}
        className={cn(
          // Mobile-first bottom sheet (<sm): full width, fixed to bottom,
          // rounded top corners, capped height, safe-area aware footer.
          "top-auto bottom-0 left-0 right-0 flex max-h-[88dvh] w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none rounded-t-[24px] p-0",
          // Desktop/tablet (sm+): centered dialog, compact.
          "sm:bottom-auto sm:left-1/2 sm:right-auto sm:top-1/2 sm:w-full sm:max-w-[540px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[24px]",
        )}
      >
        {/* Header */}
        <div className="flex shrink-0 items-start gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
            <Check className="size-5" strokeWidth={3} />
          </span>
          <div className="min-w-0 flex-1">
            <DialogTitle className="font-display text-[17px] font-extrabold leading-tight">
              Accept Candidate
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-[13px] leading-snug">
              Confirm that you want to accept this talent for this campaign.
            </DialogDescription>
          </div>
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            disabled={pending}
            aria-label="Close accept confirmation"
            className="grid size-11 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          {/* Compact candidate summary */}
          {target && (
            <div className="flex items-center gap-3 rounded-2xl bg-muted/60 p-3">
              <div className="relative size-12 shrink-0 overflow-hidden rounded-full bg-muted">
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <span className="absolute inset-0 grid place-items-center text-sm font-extrabold text-muted-foreground">
                    {initialsOf(name)}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1 truncate text-[15px] font-bold leading-snug">
                  <span className="truncate">{name}</span>
                  {verified && (
                    <BadgeCheck
                      aria-label="Verified talent"
                      className="size-4 shrink-0 text-primary"
                    />
                  )}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {profession}
                  {location ? ` · ${location}` : ""}
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center whitespace-nowrap rounded-full bg-primary-soft px-2 py-1 text-[11px] font-bold leading-none text-primary">
                {match}% Match
              </span>
            </div>
          )}

          {/* Optional message */}
          <div className="mt-4">
            <label
              htmlFor="accept-candidate-message"
              className="text-[13px] font-bold"
            >
              Message to Candidate{" "}
              <span className="font-semibold text-muted-foreground">
                (Optional)
              </span>
            </label>
            <Textarea
              id="accept-candidate-message"
              value={message}
              onChange={(event) =>
                setMessage(event.target.value.slice(0, MESSAGE_MAX_LENGTH))
              }
              maxLength={MESSAGE_MAX_LENGTH}
              rows={3}
              disabled={pending}
              aria-describedby="accept-candidate-message-count"
              placeholder={`Hi ${firstName}, we'd like to move forward with you for ${campaignName}...`}
              className="mt-1.5 max-h-40 min-h-[88px] w-full max-w-full resize-none bg-card text-sm"
            />
            <p
              id="accept-candidate-message-count"
              aria-live="polite"
              className="mt-1 text-right text-[11px] font-semibold tabular-nums text-muted-foreground"
            >
              {message.length} / {MESSAGE_MAX_LENGTH}
            </p>
          </div>

          {/* What's next */}
          <div
            role="radiogroup"
            aria-label="What's next after accepting"
            className="mt-3"
          >
            <p className="text-[13px] font-bold">What&apos;s next?</p>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              <button
                type="button"
                role="radio"
                aria-checked={nextStep === "schedule"}
                onClick={() => setNextStep("schedule")}
                disabled={pending}
                className={cn(
                  "flex min-h-[44px] flex-col items-start gap-1.5 rounded-2xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
                  nextStep === "schedule"
                    ? "border-primary bg-primary-soft/50"
                    : "border-border bg-card hover:border-primary/40",
                )}
              >
                <span className="flex w-full items-center justify-between gap-2">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <CalendarDays className="size-4" />
                  </span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors",
                      nextStep === "schedule"
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-background",
                    )}
                  >
                    {nextStep === "schedule" && (
                      <Check className="size-3" strokeWidth={4} />
                    )}
                  </span>
                </span>
                <span className="text-[13px] font-bold leading-tight">
                  Schedule Next Step
                </span>
                <span className="text-[11px] leading-snug text-muted-foreground">
                  Set up a call, meeting or shoot date
                </span>
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={nextStep === "message"}
                onClick={() => setNextStep("message")}
                disabled={pending}
                className={cn(
                  "flex min-h-[44px] flex-col items-start gap-1.5 rounded-2xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
                  nextStep === "message"
                    ? "border-primary bg-primary-soft/50"
                    : "border-border bg-card hover:border-primary/40",
                )}
              >
                <span className="flex w-full items-center justify-between gap-2">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <MessageSquareText className="size-4" />
                  </span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors",
                      nextStep === "message"
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-background",
                    )}
                  >
                    {nextStep === "message" && (
                      <Check className="size-3" strokeWidth={4} />
                    )}
                  </span>
                </span>
                <span className="text-[13px] font-bold leading-tight">
                  Send Message Only
                </span>
                <span className="text-[11px] leading-snug text-muted-foreground">
                  I&apos;ll reach out later
                </span>
              </button>
            </div>
            {nextStep === "schedule" && (
              <p className="mt-2 flex items-start gap-2 rounded-xl bg-primary-soft/50 px-3 py-2.5 text-[12px] leading-snug text-foreground/90">
                <CalendarDays className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>
                  After accepting, assign a self-tape task from the Auditions
                  tab or message {target ? firstName : "the talent"} to fix a
                  date.
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Sticky action area */}
        <div className="shrink-0 border-t border-border/70 bg-background px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 sm:px-5">
          <p className="flex items-center justify-center gap-1.5 text-center text-[12px] font-semibold text-muted-foreground">
            <AlertTriangle className="size-3.5 shrink-0 text-warning" />
            Confirming will mark this candidate as Accepted.
          </p>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={pending || !target || alreadyAccepted}
            aria-label={
              target ? `Confirm and accept ${name}` : "Confirm and accept"
            }
            className="mt-2 h-12 min-h-[44px] w-full rounded-xl text-[15px] font-bold"
          >
            {pending ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Accepting...
              </>
            ) : (
              <>
                <Check className="size-5" strokeWidth={3} />
                Confirm &amp; Accept
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
