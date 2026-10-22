"use client";

import { useRef } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  Link2,
  Loader2,
  MoreHorizontal,
  ShieldCheck,
  X,
} from "lucide-react";
import { FaInstagram, FaLinkedinIn, FaWhatsapp } from "react-icons/fa6";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Dialog,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  INSTAGRAM_INSTRUCTIONS,
  INSTAGRAM_URL,
  roleLabel,
  type ShareDestination,
  type ShareProfileTarget,
} from "@/lib/share";
import type { ShareCopyStatus } from "@/hooks/use-share-profile";

export interface ShareProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: ShareProfileTarget;
  canonicalUrl: string;
  copyStatus: ShareCopyStatus;
  error: string | null;
  /** Informational message — the action worked but needs a next step. */
  status?: string | null;
  /**
   * True when the dialog should offer the copy-link action.
   *
   * A native share that carries a file may lose its message text, so the
   * canonical link is offered for copying right next to the message.
   */
  offerLinkCopy?: boolean;
  isPreparingCard: boolean;
  isBusy?: boolean;
  /** True when the shared link points at a local address. */
  isLocalLink?: boolean;
  /** Dialog heading, e.g. "Share work" for a portfolio item. */
  heading?: string;
  /** Short explanation shown below the heading. */
  subheading?: string;
  showInstagramInstructions: boolean;
  /** Data URL of the generated card, shown as the Instagram preview. */
  instagramPreview: string | null;
  /** The caption that is pasted into the Instagram composer. */
  instagramCaption: string;
  /** True once the caption has been copied. */
  captionCopied: boolean;
  onDismissInstagramInstructions: () => void;
  onCopyLink: () => void;
  onCopyCaption: () => void;
  onShareDestination: (destination: ShareDestination) => void;
  onDownloadCard: () => void;
}

const DESTINATIONS: Array<{
  id: ShareDestination;
  label: string;
  hint: string;
  icon: typeof FaWhatsapp;
  iconClassName: string;
  iconBgClassName: string;
}> = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    hint: "Send card",
    icon: FaWhatsapp,
    iconClassName: "text-white",
    iconBgClassName: "bg-[#25D366]",
  },
  {
    id: "instagram",
    label: "Instagram",
    hint: "Share card",
    icon: FaInstagram,
    iconClassName: "text-white",
    iconBgClassName: "bg-[#E1306C]",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    hint: "Post link",
    icon: FaLinkedinIn,
    iconClassName: "text-white",
    iconBgClassName: "bg-[#0A66C2]",
  },
  {
    id: "more",
    label: "More",
    hint: "Share sheet",
    icon: MoreHorizontal,
    iconClassName: "text-white",
    iconBgClassName: "bg-[#6428F5]",
  },
];

function initialsFor(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  if (parts.length === 0) return "?";
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

/**
 * The one and only profile sharing overlay.
 *
 * On mobile it is a bottom sheet, on desktop a centered modal — the same
 * content, the same actions, the same analytics.
 */
export function ShareProfileDialog({
  open,
  onOpenChange,
  target,
  canonicalUrl,
  copyStatus,
  error,
  status = null,
  offerLinkCopy = false,
  isPreparingCard,
  isBusy = false,
  isLocalLink = false,
  heading = "Share profile",
  subheading,
  showInstagramInstructions,
  instagramPreview,
  instagramCaption,
  captionCopied,
  onDismissInstagramInstructions,
  onCopyLink,
  onCopyCaption,
  onShareDestination,
  onDownloadCard,
}: ShareProfileDialogProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const displayName = target.name?.trim() || `This ${roleLabel(target.role).toLowerCase()}`;
  const copied = copyStatus === "copied";
  const actionsDisabled = isBusy || isPreparingCard;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-[#1b1147]/45 backdrop-blur-[2px]" />
        <DialogPrimitive.Content
          ref={contentRef}
          data-slot="dialog-content"
          tabIndex={-1}
          aria-describedby="share-profile-description"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            contentRef.current?.focus();
          }}
          className={cn(
            "fixed z-50 flex max-h-[92dvh] w-full flex-col overflow-y-auto bg-white shadow-2xl outline-none",
            // Mobile: bottom sheet.
            "inset-x-0 bottom-0 top-auto max-w-none rounded-t-[28px] border-t border-[#e4ddf8]",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom",
            // Desktop: centered modal.
            "sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-h-[min(88dvh,42rem)] sm:w-[26rem] sm:max-w-[26rem] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:border sm:border-[#e4ddf8]",
            "sm:data-[state=closed]:animate-out sm:data-[state=closed]:fade-out-0 sm:data-[state=closed]:zoom-out-95",
            "sm:data-[state=open]:animate-in sm:data-[state=open]:fade-in-0 sm:data-[state=open]:zoom-in-95",
          )}
        >
          {/* Drag affordance for the mobile sheet. */}
          <div
            aria-hidden="true"
            className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-[#e4ddf8] sm:hidden"
          />

          <header className="flex items-start gap-3 px-5 pt-4 pb-3 sm:px-6 sm:pt-6">
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-lg font-bold text-[#121846]">
                {heading}
              </DialogTitle>
              <DialogDescription
                id="share-profile-description"
                className="mt-1 text-sm text-[#62678A]"
              >
                {subheading ??
                  `Share ${displayName}'s public profile with your network.`}
              </DialogDescription>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="Close share dialog"
              className="-mt-1 -mr-1 inline-flex size-10 shrink-0 items-center justify-center rounded-full text-[#62678A] transition-colors hover:bg-[#f8f2ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6428F5]/50"
            >
              <X className="size-5" />
            </button>
          </header>

          {/* Profile preview */}
          <div className="px-5 sm:px-6">
            <div className="rounded-2xl border border-[#e4ddf8] bg-[#f8f2ff] p-4">
              <div className="flex items-center gap-3">
                <Avatar className="size-14 border-2 border-white shadow-sm">
                  {target.photoUrl ? (
                    <AvatarImage src={target.photoUrl} alt="" />
                  ) : null}
                  <AvatarFallback className="bg-[#6428F5] text-sm font-bold text-white">
                    {initialsFor(displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-bold text-[#121846]">
                      {displayName}
                    </p>
                    {target.isVerified ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#2379EF]/10 px-2 py-0.5 text-[11px] font-semibold text-[#1B5FCB]">
                        <ShieldCheck className="size-3" aria-hidden="true" />
                        Verified
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-[#62678A]">
                    {target.headline?.trim() || roleLabel(target.role)}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-start gap-2 rounded-xl border border-[#e4ddf8] bg-white px-3 py-2">
                <Link2
                  className="mt-0.5 size-3.5 shrink-0 text-[#6428F5]"
                  aria-hidden="true"
                />
                <p className="min-w-0 flex-1 break-all text-[11px] leading-relaxed text-[#62678A]">
                  {canonicalUrl || "No public link available yet."}
                </p>
              </div>

              {isLocalLink ? (
                <p className="mt-2 rounded-xl border border-[#f4ddb0] bg-[#fff8ea] px-3 py-2 text-[11px] leading-relaxed text-[#8a6116]">
                  This link points at a local address, so it only works on this
                  device. Configure <code>NEXT_PUBLIC_SITE_URL</code> to share
                  the public profile.
                </p>
              ) : null}
            </div>
          </div>

          {/* Destinations */}
          <div className="px-5 pt-4 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#8b90ad]">
              Share to
            </p>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {DESTINATIONS.map((destination) => {
                const Icon = destination.icon;
                return (
                  <button
                    key={destination.id}
                    type="button"
                    onClick={() => onShareDestination(destination.id)}
                    disabled={actionsDisabled}
                    aria-label={`Share on ${destination.label}`}
                    className="flex min-h-[88px] flex-col items-center justify-center gap-1.5 rounded-2xl border border-[#e4ddf8] bg-white px-1 py-3 text-center transition-colors hover:border-[#d9c9ff] hover:bg-[#f8f2ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6428F5]/50 active:bg-[#f1e9ff] disabled:pointer-events-none disabled:opacity-60"
                  >
                    <span
                      className={cn(
                        "flex size-10 items-center justify-center rounded-full",
                        destination.iconBgClassName,
                      )}
                    >
                      <Icon
                        className={cn("size-5", destination.iconClassName)}
                        aria-hidden="true"
                      />
                    </span>
                    <span className="text-[11px] font-semibold leading-tight text-[#121846]">
                      {destination.label}
                    </span>
                    <span className="text-[10px] leading-tight text-[#8b90ad]">
                      {destination.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Instagram hand-off: the card is generated and downloaded, the
              user publishes it from the Instagram app. */}
          {showInstagramInstructions ? (
            <div
              role="status"
              className="mx-5 mt-4 rounded-2xl border border-[#e4ddf8] bg-[#fff6fa] p-4 sm:mx-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-[#121846]">
                    Card ready to publish
                  </p>
                  <p className="mt-0.5 text-xs text-[#62678A]">
                    The image was downloaded and the preview is below. Nothing
                    has been posted to Instagram yet.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onDismissInstagramInstructions}
                  aria-label="Dismiss Instagram instructions"
                  className="-mt-1 -mr-1 inline-flex size-8 shrink-0 items-center justify-center rounded-full text-[#62678A] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6428F5]/50"
                >
                  <X className="size-4" />
                </button>
              </div>

              {instagramPreview ? (
                <div className="mt-3 flex justify-center rounded-2xl border border-[#e4ddf8] bg-white p-3">
                  {/* The preview is a locally generated data URL. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={instagramPreview}
                    alt="Preview of the generated profile card"
                    className="max-h-56 w-auto rounded-xl"
                  />
                </div>
              ) : null}

              <ol className="mt-3 space-y-1.5 text-xs leading-relaxed text-[#62678A]">
                {INSTAGRAM_INSTRUCTIONS.map((instruction, index) => (
                  <li key={instruction} className="flex gap-2">
                    <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-[#E1306C]/10 text-[10px] font-bold text-[#E1306C]">
                      {index + 1}
                    </span>
                    <span>{instruction}</span>
                  </li>
                ))}
              </ol>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={onCopyCaption}
                  aria-label="Copy Instagram caption"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#e4ddf8] bg-white px-3 text-xs font-semibold text-[#121846] transition-colors hover:bg-[#f8f2ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6428F5]/50"
                >
                  {captionCopied ? (
                    <Check className="size-4 text-[#16a34a]" aria-hidden="true" />
                  ) : (
                    <Copy className="size-4" aria-hidden="true" />
                  )}
                  {captionCopied ? "Caption copied" : "Copy caption"}
                </button>

                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#E1306C] px-3 text-xs font-semibold text-white transition-colors hover:bg-[#c72a5e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E1306C]/50"
                >
                  <ExternalLink className="size-4" aria-hidden="true" />
                  Open Instagram
                </a>
              </div>

              {instagramCaption ? (
                <details className="mt-3 rounded-xl border border-[#e4ddf8] bg-white px-3 py-2">
                  <summary className="cursor-pointer text-xs font-semibold text-[#121846]">
                    Show caption
                  </summary>
                  <p className="mt-2 whitespace-pre-wrap text-[11px] leading-relaxed text-[#62678A]">
                    {instagramCaption}
                  </p>
                </details>
              ) : null}
            </div>
          ) : null}

          {/* Primary actions */}
          <div className="mt-5 space-y-2 px-5 pb-5 sm:px-6 sm:pb-6">
            <button
              type="button"
              onClick={onCopyLink}
              disabled={actionsDisabled}
              aria-label="Copy profile link"
              className={cn(
                "flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl px-4 text-sm font-bold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6428F5]/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
                copied
                  ? "bg-[#16a34a]"
                  : "bg-[#6428F5] hover:bg-[#5420D7]",
              )}
            >
              {copied ? (
                <Check className="size-4" aria-hidden="true" />
              ) : (
                <Copy className="size-4" aria-hidden="true" />
              )}
              {copied ? "Link copied" : "Copy profile link"}
            </button>

            <button
              type="button"
              onClick={onDownloadCard}
              disabled={actionsDisabled}
              aria-label="Download profile card"
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-[#e4ddf8] bg-white px-4 text-sm font-bold text-[#263267] transition-colors hover:bg-[#f8f2ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6428F5]/50 disabled:pointer-events-none disabled:opacity-60"
            >
              {isPreparingCard ? (
                <Loader2
                  className="size-4 animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <Download className="size-4" aria-hidden="true" />
              )}
              {isPreparingCard ? "Preparing card…" : "Download profile card"}
            </button>

            <p
              role="status"
              aria-live="polite"
              className={cn(
                "min-h-4 text-center text-xs",
                error ? "text-[#b42318]" : "text-[#62678A]",
              )}
            >
              {error ?? status ?? (copied ? "The public link is on your clipboard." : "")}
            </p>

            {/* The share sheet does not report back whether the app kept the
                message text, so the canonical link is offered right where the
                message asks for it. */}
            {offerLinkCopy ? (
              <button
                type="button"
                onClick={onCopyLink}
                disabled={actionsDisabled}
                aria-label="Copy profile link"
                className="mx-auto inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#d9c9ff] bg-white px-4 text-xs font-bold text-[#5420D7] transition-colors hover:bg-[#f8f2ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6428F5]/50 disabled:pointer-events-none disabled:opacity-60"
              >
                {copied ? (
                  <Check className="size-4 text-[#16a34a]" aria-hidden="true" />
                ) : (
                  <Copy className="size-4" aria-hidden="true" />
                )}
                {copied ? "Profile link copied" : "Copy profile link"}
              </button>
            ) : null}
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
