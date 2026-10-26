"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import {
  buildCanonicalProfileUrl,
  buildInstagramCaption,
  buildLinkedInUrl,
  buildShareText,
  buildWhatsAppFallbackMessage,
  buildWhatsAppShareFeedback,
  canShareFiles,
  canShareFilesSync,
  copyTextToClipboard,
  isNativeShareSupported,
  planWhatsAppShare,
  SHARE_BRAND,
  SHARE_EVENT_TYPES,
  type CardShareResult,
  type ShareDestination,
  type ShareEventType,
  type ShareMethod,
  type ShareProfileTarget,
} from "@/lib/share";
import {
  downloadBlob,
  renderShareCard,
  shareCardFileName,
} from "@/lib/share-card";
import { isLocalOrigin, resolveSiteOrigin } from "@/lib/site";
import {
  profileSharesApi,
  type ProfileShareDestinationType,
} from "@/lib/api/profile-shares";
import { createShareEventRecorder } from "@/lib/share-events";

export type ShareCopyStatus = "idle" | "copied" | "error";

export type { CardShareResult } from "@/lib/share";

export interface UseShareProfileOptions {
  /** The profile being shared. */
  target: ShareProfileTarget;
  /** Entry point identifier recorded with every analytics event. */
  source: string;
  /** Overrides the detected origin (used by tests and SSR). */
  origin?: string;
  /** Called whenever the overlay opens or closes. */
  onOpenChange?: (open: boolean) => void;
}

interface EventPayload {
  type: ShareEventType;
  destination?: ProfileShareDestinationType;
  method?: ShareMethod;
}

function isAbortError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name?: string }).name === "AbortError"
  );
}

/**
 * Single entry point for every profile share in the app.
 *
 * It owns the overlay state, produces the canonical URL, performs the actual
 * share (native sheet, clipboard, external destination, card download) and
 * records the analytics event for it.
 */
export function useShareProfile({
  target,
  source,
  origin: originOverride,
  onOpenChange,
}: UseShareProfileOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState<ShareCopyStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  /** An informational message — the action worked, but needs a next step. */
  const [status, setStatus] = useState<string | null>(null);
  /**
   * True when the dialog should offer the copy-link action.
   *
   * A share sheet that resolved says nothing about the message text — some
   * apps drop it as soon as a file is attached — so the link is offered for
   * copying instead of being claimed as delivered.
   */
  const [offerLinkCopy, setOfferLinkCopy] = useState(false);
  const [isPreparingCard, setIsPreparingCard] = useState(false);
  const [showInstagramInstructions, setShowInstagramInstructions] = useState(false);
  /** Data URL of the card that was generated for Instagram. */
  const [instagramPreview, setInstagramPreview] = useState<string | null>(null);
  /** True once the Instagram caption has been copied. */
  const [captionCopied, setCaptionCopied] = useState(false);
  /** True while an action is in flight, so it cannot be triggered twice. */
  const [isBusy, setIsBusy] = useState(false);

  const recorderRef = useRef<ReturnType<typeof createShareEventRecorder> | null>(
    null,
  );
  const copyResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const captionResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // A stable target keeps the memoised values from being recreated on every
  // render, which matters because the target object is usually built inline.
  const stableTarget = useMemo<ShareProfileTarget>(
    () => ({
      role: target.role,
      slug: target.slug,
      name: target.name,
      headline: target.headline,
      photoUrl: target.photoUrl,
      isVerified: target.isVerified,
      path: target.path,
    }),
    [
      target.role,
      target.slug,
      target.name,
      target.headline,
      target.photoUrl,
      target.isVerified,
      target.path,
    ],
  );

  // The shared profile always points at the public application origin — never
  // at `window.location.href`, which may carry a portfolio deep link.
  const detectedOrigin = useMemo(
    () =>
      originOverride ??
      resolveSiteOrigin({
        configured: process.env.NEXT_PUBLIC_SITE_URL,
        windowOrigin:
          typeof window !== "undefined" ? window.location.origin : undefined,
        nodeEnv: process.env.NODE_ENV,
      }),
    [originOverride],
  );

  useEffect(() => {
    return () => {
      if (copyResetTimer.current) clearTimeout(copyResetTimer.current);
      if (captionResetTimer.current) clearTimeout(captionResetTimer.current);
    };
  }, []);

  const canonicalUrl = useMemo(
    () => buildCanonicalProfileUrl(stableTarget, detectedOrigin),
    [stableTarget, detectedOrigin],
  );

  const shareText = useMemo(() => buildShareText(stableTarget), [stableTarget]);

  const instagramCaption = useMemo(
    () => buildInstagramCaption(stableTarget, canonicalUrl),
    [stableTarget, canonicalUrl],
  );

  const hasCanonicalUrl = canonicalUrl.length > 0;

  /** True when the link points at a local address — it only works on this machine. */
  const isLocalLink = useMemo(
    () => hasCanonicalUrl && isLocalOrigin(canonicalUrl),
    [canonicalUrl, hasCanonicalUrl],
  );

  // (Re)create the recorder whenever the shared profile changes so the
  // dedupe memory never leaks across profiles.
  useEffect(() => {
    recorderRef.current = createShareEventRecorder({
      role: stableTarget.role,
      slug: stableTarget.slug,
      source,
      send: (payload) => profileSharesApi.recordEvent(payload),
    });
  }, [source, stableTarget]);

  /** Records an analytics event. Failures never surface to the user. */
  const recordEvent = useCallback(
    async (event: EventPayload) => {
      await recorderRef.current?.record(event);
    },
    [],
  );

  const markCopied = useCallback(() => {
    setCopyStatus("copied");
    setError(null);
    setStatus(null);
    if (copyResetTimer.current) clearTimeout(copyResetTimer.current);
    copyResetTimer.current = setTimeout(() => setCopyStatus("idle"), 2000);
  }, []);

  /**
   * The reason a share cannot be performed, or `null` when it can.
   *
   * A missing origin is a deployment problem, a missing slug is a profile
   * problem — the user needs a different message for each.
   */
  const unavailableReason = useMemo(() => {
    if (!stableTarget.slug) return "This profile does not have a public link yet.";
    if (!detectedOrigin) {
      return "Public sharing is not available in this environment yet.";
    }
    return null;
  }, [detectedOrigin, stableTarget.slug]);

  const open = useCallback(() => {
    if (!hasCanonicalUrl) {
      const message =
        unavailableReason ?? "This profile does not have a public link yet.";
      setError(message);
      toast.error(message);
      return;
    }
    setError(null);
    setStatus(null);
    setCopyStatus("idle");
    setOfferLinkCopy(false);
    setShowInstagramInstructions(false);
    setInstagramPreview(null);
    setCaptionCopied(false);
    setIsOpen(true);
    onOpenChange?.(true);
    void recordEvent({ type: SHARE_EVENT_TYPES.dialogOpen });
  }, [
    hasCanonicalUrl,
    onOpenChange,
    recordEvent,
    unavailableReason,
  ]);

  const close = useCallback(() => {
    setIsOpen(false);
    setError(null);
    setStatus(null);
    setOfferLinkCopy(false);
    setShowInstagramInstructions(false);
    setInstagramPreview(null);
    setCaptionCopied(false);
    onOpenChange?.(false);
  }, [onOpenChange]);

  const copyLink = useCallback(async (): Promise<boolean> => {
    if (!hasCanonicalUrl) {
      const message =
        unavailableReason ?? "This profile does not have a public link yet.";
      setError(message);
      toast.error(message);
      return false;
    }

    const copied = await copyTextToClipboard(canonicalUrl);
    if (copied) {
      markCopied();
      toast.success("Profile link copied");
      void recordEvent({
        type: SHARE_EVENT_TYPES.linkCopy,
        destination: "copy",
        method: "clipboard",
      });
      return true;
    }

    setCopyStatus("error");
    setError("Couldn't copy the link. Please copy it manually.");
    toast.error("Couldn't copy the link. Please copy it manually.");
    void recordEvent({
      type: SHARE_EVENT_TYPES.attemptFailed,
      destination: "copy",
      method: "clipboard",
    });
    return false;
  }, [canonicalUrl, hasCanonicalUrl, markCopied, recordEvent, unavailableReason]);

  /**
   * Copies the Instagram caption.
   *
   * The caption is written by the user in the Instagram composer, so the
   * clipboard is the only reliable hand-off.
   */
  const copyCaption = useCallback(async (): Promise<boolean> => {
    if (!instagramCaption) return false;

    const copied = await copyTextToClipboard(instagramCaption);
    if (copied) {
      setCaptionCopied(true);
      setError(null);
      toast.success("Caption copied");
      if (captionResetTimer.current) clearTimeout(captionResetTimer.current);
      captionResetTimer.current = setTimeout(() => setCaptionCopied(false), 2500);
      return true;
    }

    setError("Couldn't copy the caption. Select it and copy it manually.");
    toast.error("Couldn't copy the caption. Select it and copy it manually.");
    return false;
  }, [instagramCaption]);

  const buildCard = useCallback(
    async (customTarget?: ShareProfileTarget, customUrl?: string) => {
      const activeTarget = customTarget ?? stableTarget;
      const activeUrl = customUrl ?? canonicalUrl;
      const card = await renderShareCard({
        target: activeTarget,
        url: activeUrl,
        includeQr: true,
        origin: detectedOrigin,
      });
      return card;
    },
    [canonicalUrl, detectedOrigin, stableTarget],
  );

  /**
   * Builds the share card as a real file.
   *
   * The card is a PNG blob that travels as an attachment — never as a data
   * URL inside the message and never as a link to an image.
   */
  const buildCardFile = useCallback(
    async (customTarget?: ShareProfileTarget, customUrl?: string): Promise<File> => {
      const activeTarget = customTarget ?? stableTarget;
      const card = await buildCard(activeTarget, customUrl);
      return new File([card.blob], shareCardFileName(activeTarget), {
        type: "image/png",
      });
    },
    [buildCard, stableTarget],
  );

  /**
   * Shares the card through the native share sheet.
   *
   * The image is attached to the payload, so the recipient receives the card
   * and the link — not a link to an image.
   */
  const shareCardFile = useCallback(
    async (
      options: {
        title: string;
        text: string;
      },
      customTarget?: ShareProfileTarget,
      customUrl?: string,
    ): Promise<CardShareResult> => {
      let file: File;
      try {
        file = await buildCardFile(customTarget, customUrl);
      } catch {
        // The card could not be rendered — the caller falls back.
        return "failed";
      }

      if (!canShareFiles([file])) {
        return "unsupported";
      }

      try {
        const activeUrl = customUrl ?? canonicalUrl;
        
        // FIX: Ensure text and URL are combined into a single caption.
        // If the URL isn't already inside the text payload, we append it.
        const captionText = options.text.includes(activeUrl)
          ? options.text
          : `${options.text}\n${activeUrl}`;

        await navigator.share({
          files: [file],
          text: captionText,
          // FIX: Intentionally omit `title` and `url`. When sharing files, 
          // passing multiple intent fields confuses Android/WhatsApp into splitting messages.
        });
        return "shared";
      } catch (error) {
        // The user closed the share sheet — that is not a failure.
        if (isAbortError(error)) return "cancelled";
        return "failed";
      }
    },
    [buildCardFile, canonicalUrl],
  );

  /**
   * The hand-off for browsers that cannot share files.
   *
   * The card is downloaded so it can be attached to the WhatsApp message by
   * hand and the canonical link is copied so the user can paste it anywhere.
   */
  const deliverCardFallback = useCallback(
    async (customTarget?: ShareProfileTarget, customUrl?: string): Promise<void> => {
      const activeTarget = customTarget ?? stableTarget;
      const activeUrl = customUrl ?? canonicalUrl;
      try {
        const card = await buildCard(activeTarget, activeUrl);
        downloadBlob(card.blob, shareCardFileName(activeTarget));
      } catch {
        setError("Couldn't create the profile card. Please try again.");
        toast.error("Couldn't create the profile card. Please try again.");
        void recordEvent({
          type: SHARE_EVENT_TYPES.attemptFailed,
          destination: "whatsapp",
          method: "download",
        });
        return;
      }

      // The link is copied as well, so the user can paste it into the chat.
      const copied = await copyTextToClipboard(activeUrl);
      const message = buildWhatsAppFallbackMessage(copied);

      setError(null);
      setStatus(message);
      toast.success(message);
      void recordEvent({
        type: SHARE_EVENT_TYPES.destinationSelected,
        destination: "whatsapp",
        method: "download",
      });

      // The clipboard refused the link — let the user copy it by hand.
      if (!copied) setOfferLinkCopy(true);
    },
    [buildCard, canonicalUrl, recordEvent, stableTarget],
  );

  /**
   * Shares through the OS share sheet.
   *
   * The branded card is attached when the browser allows sharing files;
   * otherwise the share falls back to the plain canonical URL.
   */
  const shareNative = useCallback(
    async (options: { withCard?: boolean } = {}): Promise<boolean> => {
      if (!hasCanonicalUrl) {
        const message =
          unavailableReason ?? "This profile does not have a public link yet.";
        setError(message);
        toast.error(message);
        return false;
      }

      if (!isNativeShareSupported()) {
        toast.info("Sharing is not supported here — copying the link instead.");
        return copyLink();
      }

      if (options.withCard) {
        try {
          const card = await buildCard();
          const file = new File([card.blob], shareCardFileName(stableTarget), {
            type: "image/png",
          });
          if (canShareFiles([file])) {
            // FIX: Combine link with text and exclude `title` to enforce single WhatsApp message 
            const captionText = shareText.includes(canonicalUrl)
              ? shareText
              : `${shareText}\n${canonicalUrl}`;

            await navigator.share({
              files: [file],
              text: captionText,
              // Omitted: `title` and `url` to prevent intent splitting
            });
            
            toast.success("Shared");
            void recordEvent({
              type: SHARE_EVENT_TYPES.nativeShare,
              destination: "native",
              method: "file",
            });
            return true;
          }
          // File sharing unsupported — fall back to the plain URL share.
        } catch (error) {
          if (isAbortError(error)) return false;
        }
      }

      try {
        // Fallback for non-file native sharing (e.g. basic web links)
        // Here, it is safe to keep title and url because no files are attached.
        await navigator.share({
          title: `${stableTarget.name} on ${SHARE_BRAND}`,
          text: shareText,
          url: canonicalUrl,
        });
        toast.success("Shared");
        void recordEvent({
          type: SHARE_EVENT_TYPES.nativeShare,
          destination: "native",
          method: "native",
        });
        return true;
      } catch (error) {
        if (isAbortError(error)) {
          // The user closed the share sheet — not a failure.
          return false;
        }
        toast.info("Sharing wasn't available — copying the link instead.");
        return copyLink();
      }
    },
    [
      buildCard,
      canonicalUrl,
      copyLink,
      hasCanonicalUrl,
      recordEvent,
      shareText,
      stableTarget,
      unavailableReason,
    ],
  );

  /** Downloads the branded profile card. */
  const downloadCard = useCallback(
    async (options: { record?: boolean } = {}): Promise<boolean> => {
      if (!hasCanonicalUrl) {
        const message =
          unavailableReason ?? "This profile does not have a public link yet.";
        setError(message);
        toast.error(message);
        return false;
      }

      setIsPreparingCard(true);
      try {
        const card = await buildCard();
        downloadBlob(card.blob, shareCardFileName(stableTarget));
        toast.success("Profile card downloaded");
        if (options.record !== false) {
          void recordEvent({
            type: SHARE_EVENT_TYPES.cardDownload,
            destination: "download",
            method: "download",
          });
        }
        return true;
      } catch {
        toast.error("Couldn't create the profile card.");
        void recordEvent({
          type: SHARE_EVENT_TYPES.attemptFailed,
          destination: "download",
          method: "download",
        });
        return false;
      } finally {
        setIsPreparingCard(false);
      }
    },
    [buildCard, hasCanonicalUrl, recordEvent, stableTarget, unavailableReason],
  );

  /**
   * Hands the profile over to an external destination.
   *
   * Each destination produces exactly one action event so the recorded
   * "shares" metric never counts a single user action twice.
   */
  const shareDestination = useCallback(
    async (
      destination: ShareDestination,
      targetOverride?: ShareProfileTarget,
    ): Promise<void> => {
      const activeTarget = targetOverride
        ? {
            role: targetOverride.role,
            slug: targetOverride.slug,
            name: targetOverride.name,
            headline: targetOverride.headline,
            photoUrl: targetOverride.photoUrl,
            isVerified: targetOverride.isVerified,
            path: targetOverride.path,
            tags: targetOverride.tags,
            statItems: targetOverride.statItems,
          }
        : stableTarget;

      const activeUrl = targetOverride
        ? buildCanonicalProfileUrl(activeTarget, detectedOrigin)
        : canonicalUrl;

      const targetHasCanonicalUrl = activeUrl.length > 0;

      if (!targetHasCanonicalUrl) {
        const message =
          unavailableReason ?? "This profile does not have a public link yet.";
        setError(message);
        toast.error(message);
        return;
      }

      if (isBusy) return;
      setIsBusy(true);
      setOfferLinkCopy(false);

      try {
        switch (destination) {
          case "whatsapp": {
            // A `wa.me` link cannot carry a local file, so the card travels
            // through the native share sheet whenever the browser supports
            // sharing files. The capability is probed synchronously — inside
            // the click handler — so the fallback can still open WhatsApp
            // before the popup blocker's user gesture expires.
            const plan = planWhatsAppShare({
              target: activeTarget,
              url: activeUrl,
              canShareFiles: canShareFilesSync(),
            });

            if (plan.mode === "file") {
              const result = await shareCardFile(
                {
                  title: plan.title,
                  text: plan.text,
                },
                activeTarget,
                activeUrl,
              );
              const feedback = buildWhatsAppShareFeedback(result);

              if (feedback.useFallback) {
                // The browser cannot attach the file after all: open WhatsApp
                // with the prefilled message and hand over card and link.
                window.open(plan.link, "_blank", "noopener,noreferrer");
                await deliverCardFallback(activeTarget, activeUrl);
                break;
              }

              if (feedback.message) {
                if (feedback.isError) {
                  void recordEvent({
                    type: SHARE_EVENT_TYPES.attemptFailed,
                    destination: "whatsapp",
                    method: "file",
                  });
                  setError(feedback.message);
                  toast.error(feedback.message);
                } else {
                  void recordEvent({
                    type: SHARE_EVENT_TYPES.destinationSelected,
                    destination: "whatsapp",
                    method: "file",
                  });
                  setStatus(feedback.message);
                  toast.info(feedback.message);
                }
              }

              // The share sheet never reports back whether the app kept the
              // message text, so the link is offered for copying. No second
              // share flow is opened behind the user's back.
              setOfferLinkCopy(feedback.offerCopy);
              break;
            }

            // The browser cannot share files: open WhatsApp with the message
            // and hand the user the card to attach by hand.
            window.open(plan.link, "_blank", "noopener,noreferrer");
            await deliverCardFallback(activeTarget, activeUrl);
            break;
          }
          case "linkedin": {
            window.open(
              buildLinkedInUrl(activeUrl),
              "_blank",
              "noopener,noreferrer",
            );
            void recordEvent({
              type: SHARE_EVENT_TYPES.destinationSelected,
              destination: "linkedin",
              method: "external_link",
            });
            break;
          }
          case "instagram": {
            // Instagram has no web share endpoint — hand the user the card and
            // the caption instead of pretending the image is attached.
            setIsPreparingCard(true);
            try {
              const card = await buildCard(activeTarget, activeUrl);
              setInstagramPreview(card.dataUrl);
              downloadBlob(card.blob, shareCardFileName(activeTarget));
              setShowInstagramInstructions(true);
              void recordEvent({
                type: SHARE_EVENT_TYPES.destinationSelected,
                destination: "instagram",
                method: "download",
              });
            } catch {
              setError("Couldn't create the profile card. Please try again.");
              toast.error("Couldn't create the profile card. Please try again.");
              void recordEvent({
                type: SHARE_EVENT_TYPES.attemptFailed,
                destination: "instagram",
                method: "download",
              });
            } finally {
              setIsPreparingCard(false);
            }
            break;
          }
          case "more": {
            if (isNativeShareSupported()) {
              await shareNative({ withCard: true });
            } else {
              await copyLink();
            }
            break;
          }
          default:
            break;
        }
      } finally {
        setIsBusy(false);
      }
    },
    [
      buildCard,
      canonicalUrl,
      copyLink,
      deliverCardFallback,
      detectedOrigin,
      isBusy,
      recordEvent,
      shareCardFile,
      shareNative,
      stableTarget,
      unavailableReason,
    ],
  );

  return {
    isOpen,
    open,
    close,
    canonicalUrl,
    shareText,
    instagramCaption,
    instagramPreview,
    captionCopied,
    copyCaption,
    copyStatus,
    error,
    status,
    offerLinkCopy,
    isPreparingCard,
    isBusy,
    isLocalLink,
    showInstagramInstructions,
    setShowInstagramInstructions,
    hasCanonicalUrl,
    canUseNativeShare: isNativeShareSupported(),
    copyLink,
    shareNative,
    shareDestination,
    downloadCard,
  };
}