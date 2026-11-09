"use client";

import type { ReactNode } from "react";
import { Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ShareDestination, ShareProfileTarget } from "@/lib/share";
import { useShareProfile } from "@/hooks/use-share-profile";
import { ShareProfileDialog } from "@/components/shared/share-profile-dialog";

export interface ShareProfileButtonProps {
  /** The profile to share. */
  target: ShareProfileTarget;
  /** Entry point identifier recorded with the analytics events. */
  source: string;
  /** Trigger content. Replaces the default button when provided. */
  children?: ReactNode;
  /** Visual treatment of the default trigger. */
  variant?: "button" | "icon";
  /** Accessible label for the icon-only trigger. */
  label?: string;
  /** Skip the dialog and hand off directly to this destination. */
  directDestination?: ShareDestination;
  className?: string;
  /** Notified whenever the overlay opens or closes. */
  onOpenChange?: (open: boolean) => void;
}

/**
 * Convenience trigger that wires {@link useShareProfile} to
 * {@link ShareProfileDialog}.
 *
 * Every share entry point in the app uses this component so the behaviour,
 * the copy and the analytics stay identical everywhere.
 */
export function ShareProfileButton({
  target,
  source,
  children,
  variant = "button",
  label = "Share profile",
  directDestination,
  className,
  onOpenChange,
}: ShareProfileButtonProps) {
  const share = useShareProfile({
    target,
    source,
    onOpenChange,
  });
  const handleClick = () => {
    if (directDestination) {
      void share.shareDestination(directDestination);
      return;
    }
    share.open();
  };

  return (
    <>
      {children ? (
        <button type="button" onClick={handleClick} className={className}>
          {children}
        </button>
      ) : variant === "icon" ? (
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleClick}
          aria-label={label}
          title={label}
          className={className}
        >
          <Share2 className="size-4" aria-hidden="true" />
        </Button>
      ) : (
        <Button
          type="button"
          onClick={handleClick}
          aria-label={label}
          className={cn("gap-2", className)}
        >
          <Share2 className="size-4" aria-hidden="true" />
          Share
        </Button>
      )}

      {!directDestination && (
        <ShareProfileDialog
          open={share.isOpen}
          onOpenChange={(next) => {
            if (!next) share.close();
          }}
          target={target}
          canonicalUrl={share.canonicalUrl}
          copyStatus={share.copyStatus}
          error={share.error}
          status={share.status}
          offerLinkCopy={share.offerLinkCopy}
          isPreparingCard={share.isPreparingCard}
          isBusy={share.isBusy}
          isLocalLink={share.isLocalLink}
          showInstagramInstructions={share.showInstagramInstructions}
          instagramPreview={share.instagramPreview}
          instagramCaption={share.instagramCaption}
          captionCopied={share.captionCopied}
          onDismissInstagramInstructions={() =>
            share.setShowInstagramInstructions(false)
          }
          onCopyLink={() => void share.copyLink()}
          onCopyCaption={() => void share.copyCaption()}
          onShareDestination={(destination) =>
            void share.shareDestination(destination)
          }
          onDownloadCard={() => void share.downloadCard()}
        />
      )}
    </>
  );
}
