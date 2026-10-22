/**
 * Shared profile-sharing primitives.
 *
 * Everything in this module is pure so it can be unit tested without a DOM.
 * The rule that drives the whole design: a shared profile always points at the
 * *canonical* public URL — never at `window.location.href`, which may carry
 * query parameters, tab state or a portfolio deep link.
 */

import { normalizeOrigin } from "@/lib/site";

export { normalizeOrigin };

export const SHARE_BRAND = "RootIn";

export type ShareProfileRole = "talent" | "recruiter";

/** The profile a user is sharing. */
export interface ShareProfileTarget {
  role: ShareProfileRole;
  /** Canonical username (talent) or slug (recruiter). */
  slug: string;
  /** Display name shown in the share sheet and on the share card. */
  name: string;
  /** Professional role / headline. */
  headline?: string;
  /** Absolute or relative profile photo URL. */
  photoUrl?: string;
  /** Whether the profile carries a verification badge. */
  isVerified?: boolean;
  /**
   * Explicit public path, e.g. a portfolio item deep link.
   *
   * When it is present it replaces the role/slug path. It is only ever set
   * when the user intentionally shares a specific surface — the default
   * profile share always uses the canonical profile path.
   */
  path?: string;
}

/** Destinations the share sheet can hand off to. */
export type ShareDestination = "whatsapp" | "instagram" | "linkedin" | "more";

/** How a share was carried out — mirrored in the analytics event vocabulary. */
export type ShareMethod = "native" | "clipboard" | "file" | "external_link" | "download" | "none";

/** Mirrors `ProfileShareEventType` on the API side. */
export type ShareEventType =
  | "dialog_open"
  | "link_copy"
  | "destination_selected"
  | "native_share"
  | "card_download"
  | "attempt_failed"
  | "profile_visit";

export const SHARE_EVENT_TYPES = {
  dialogOpen: "dialog_open",
  linkCopy: "link_copy",
  destinationSelected: "destination_selected",
  nativeShare: "native_share",
  cardDownload: "card_download",
  attemptFailed: "attempt_failed",
  profileVisit: "profile_visit",
} as const satisfies Record<string, ShareEventType>;

export const SHARE_DESTINATIONS = {
  whatsapp: "whatsapp",
  instagram: "instagram",
  linkedin: "linkedin",
  more: "more",
  copy: "copy",
  native: "native",
  download: "download",
} as const;

/**
 * Normalizes an explicit public path.
 *
 * Only root-relative paths are accepted — a value that carries a protocol or
 * that is protocol relative (`//evil.example`) is rejected so a shared link
 * can never be pointed at another host.
 */
export function normalizePublicPath(path?: string | null): string {
  const candidate = (path ?? "").trim();
  if (!candidate) return "";
  if (!candidate.startsWith("/")) return "";
  if (candidate.startsWith("//")) return "";
  if (candidate.startsWith("/\\")) return "";
  if (/^\/[a-z][a-z0-9+.-]*:/i.test(candidate)) return "";
  return candidate;
}

/**
 * Canonical public path for a profile.
 *
 * `talent` profiles live at `/talent/<username>`, recruiter / agency
 * profiles at `/recruiter/<slug>`. An explicit `path` (a portfolio item deep
 * link the user explicitly asked to share) takes precedence.
 */
export function buildProfilePath(target: {
  role: ShareProfileRole;
  slug: string;
  path?: string;
}): string {
  const explicit = normalizePublicPath(target.path);
  if (explicit) return explicit;

  const slug = (target.slug ?? "").trim();
  if (!slug) return "";
  return target.role === "recruiter"
    ? `/recruiter/${encodeURIComponent(slug)}`
    : `/talent/${encodeURIComponent(slug)}`;
}

/**
 * Canonical, absolute public URL for a profile.
 *
 * The slug is encoded so a malformed value can never break out of the path.
 * Returns an empty string when the origin is missing or unusable — a broken
 * link is worse than no link.
 */
export function buildCanonicalProfileUrl(
  target: { role: ShareProfileRole; slug: string; path?: string },
  origin?: string,
): string {
  const path = buildProfilePath(target);
  if (!path) return "";
  const base = normalizeOrigin(origin);
  if (!base) return "";
  return `${base}${path}`;
}

/**
 * Human readable share line, without the URL.
 *
 * `navigator.share` receives the URL separately, so the text stays clean.
 */
export function buildShareText(target: ShareProfileTarget): string {
  const name = (target.name ?? "").trim() || defaultNameFor(target.role);
  const headline = (target.headline ?? "").trim();
  if (headline) {
    return `Check out ${name} — ${headline} on ${SHARE_BRAND}.`;
  }
  return `Check out ${name} on ${SHARE_BRAND}.`;
}

/**
 * Full share message including the canonical URL.
 *
 * WhatsApp renders the first line as the preview title and the following
 * lines as the message body, so the message leads with the name, keeps the
 * profession on its own line and puts the link at the very end where it stays
 * clickable.
 */
export function buildShareMessage(
  target: ShareProfileTarget,
  url: string,
): string {
  const name = (target.name ?? "").trim();
  const headline = (target.headline ?? "").trim();

  const lines: string[] = [
    name
      ? `Hey! Check out ${name}'s profile on ${SHARE_BRAND}.`
      : `Hey! Check out this profile on ${SHARE_BRAND}.`,
  ];

  if (headline) lines.push("", headline);
  if (url) lines.push("", "Explore the profile and portfolio:", url);

  return lines.join("\n");
}

/**
 * The text that accompanies a shared card.
 *
 * The card already shows the name and the profession, so the text stays short
 * and only adds the canonical link — the recipient needs it to open the
 * profile.
 */
export function buildCardShareText(
  target: ShareProfileTarget,
  url: string,
): string {
  const text = buildShareText(target);
  const link = (url ?? "").trim();
  if (!link) return text;
  return `${text}\n${link}`;
}

/**
 * The Instagram caption.
 *
 * The caption is pasted into the Instagram composer, so it is written the way
 * a caption is written — no URL fragments, no duplicated hashtags and no
 * placeholder text for missing fields.
 */
export function buildInstagramCaption(
  target: ShareProfileTarget,
  url: string,
): string {
  const name = (target.name ?? "").trim();
  const headline = (target.headline ?? "").trim();

  const lines: string[] = [name ? `Meet ${name} ✨` : "Meet this talent ✨"];
  if (headline) lines.push("", headline);

  lines.push(
    "",
    `Explore the portfolio and connect with verified talent on ${SHARE_BRAND}.`,
  );
  if (url) lines.push("", `Discover more: ${url}`);
  lines.push("", "#RootIn #TalentPortfolio");

  return dedupeHashtags(lines.join("\n"));
}

/**
 * Removes repeated hashtags while keeping the original order.
 *
 * The caption can carry a hashtag that also appears in the headline, and a
 * duplicated hashtag reads like a mistake.
 */
export function dedupeHashtags(text: string): string {
  const seen = new Set<string>();

  return text
    .split("\n")
    .map((line) => {
      const tokens = line.split(/\s+/);
      const kept = tokens.filter((token) => {
        if (!token.startsWith("#") || token.length < 2) return true;
        const key = token.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      return kept.join(" ");
    })
    .join("\n");
}

export function defaultNameFor(role: ShareProfileRole): string {
  return role === "recruiter" ? "a recruiter" : "a talent";
}

/** WhatsApp deep link with a prefilled message. */
export function buildWhatsAppUrl(
  target: ShareProfileTarget,
  url: string,
): string {
  return `https://wa.me/?text=${encodeURIComponent(buildShareMessage(target, url))}`;
}

/** How a WhatsApp hand-off is carried out. */
export type WhatsAppShareMode = "file" | "link";

export interface WhatsAppSharePlan {
  /**
   * `file` — the card is attached through the native share sheet.
   * `link` — the browser cannot share files, so the card is downloaded and
   * the link is shared instead.
   */
  mode: WhatsAppShareMode;
  /** Title of the shared file. */
  title: string;
  /** Short text that accompanies the shared card. */
  text: string;
  /** Prefilled WhatsApp link used by the fallback. */
  link: string;
}

/**
 * Decides how a WhatsApp share is carried out.
 *
 * A `wa.me` link can only carry text — it cannot attach a local file. The
 * card therefore travels through the native share sheet whenever the browser
 * supports sharing files, and only falls back to a download when it does not.
 */
export function planWhatsAppShare(options: {
  target: ShareProfileTarget;
  url: string;
  /** Whether the browser can share files. */
  canShareFiles: boolean;
}): WhatsAppSharePlan {
  const { target, url } = options;
  const name = (target.name ?? "").trim() || defaultNameFor(target.role);

  return {
    mode: options.canShareFiles ? "file" : "link",
    title: `${name} on ${SHARE_BRAND}`,
    text: buildCardShareText(target, url),
    link: buildWhatsAppUrl(target, url),
  };
}

/** The outcome of a native share-sheet attempt that carries the card. */
export type CardShareResult =
  | "shared"
  | "cancelled"
  | "unsupported"
  | "failed";

/**
 * Shown after the card was handed to the native share sheet.
 *
 * It deliberately does not claim that the message text was delivered — some
 * apps drop it as soon as a file is attached.
 */
export const WHATSAPP_CARD_SHARED_MESSAGE =
  "Card shared. If the message has no link, copy the profile link below.";

/** Shown when the native share sheet could not be used. */
export const WHATSAPP_CARD_SHARE_FAILED_MESSAGE =
  "Sharing failed. Copy the profile link and attach the card yourself.";

/** Shown by the download-and-share hand-off. */
export const WHATSAPP_CARD_FALLBACK_MESSAGE =
  "Card downloaded and link copied — attach the image in WhatsApp.";

/** Shown by the download-and-share hand-off when the clipboard refused the link. */
export const WHATSAPP_CARD_FALLBACK_COPY_FAILED_MESSAGE =
  "Card downloaded — copy the profile link and attach the image in WhatsApp.";

/**
 * The message of the download-and-share hand-off.
 *
 * It only claims that the link was copied when the clipboard really took it.
 */
export function buildWhatsAppFallbackMessage(copied: boolean): string {
  return copied
    ? WHATSAPP_CARD_FALLBACK_MESSAGE
    : WHATSAPP_CARD_FALLBACK_COPY_FAILED_MESSAGE;
}

/**
 * What the share dialog does after a card share attempt.
 */
export interface WhatsAppShareFeedback {
  /** The message shown in the dialog — empty when there is nothing to say. */
  message: string;
  /** Whether the message describes a failure. */
  isError: boolean;
  /** Whether the dialog should offer the copy-link action. */
  offerCopy: boolean;
  /** Whether the download-and-share hand-off should run. */
  useFallback: boolean;
}

/**
 * Turns the result of a native file share into the next step.
 *
 * A share sheet that resolved says nothing about the message text: some apps
 * drop it as soon as a file is attached, and the platform does not report
 * back. The link is therefore never claimed as delivered — it is offered for
 * copying instead.
 */
export function buildWhatsAppShareFeedback(
  result: CardShareResult,
): WhatsAppShareFeedback {
  switch (result) {
    case "shared":
      return {
        message: WHATSAPP_CARD_SHARED_MESSAGE,
        isError: false,
        offerCopy: true,
        useFallback: false,
      };
    case "failed":
      return {
        message: WHATSAPP_CARD_SHARE_FAILED_MESSAGE,
        isError: true,
        offerCopy: true,
        useFallback: false,
      };
    case "unsupported":
      // The browser cannot attach the file — download it and share the link.
      return {
        message: "",
        isError: false,
        offerCopy: false,
        useFallback: true,
      };
    case "cancelled":
    default:
      // The user closed the share sheet — nothing happened, nothing is said.
      return {
        message: "",
        isError: false,
        offerCopy: false,
        useFallback: false,
      };
  }
}

/**
 * LinkedIn share URL.
 *
 * LinkedIn renders its own preview — we only guarantee the canonical link it
 * receives, never the preview image it chooses to show.
 */
export function buildLinkedInUrl(url: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
}

/** Instagram has no web share endpoint — the card must be shared manually. */
export const INSTAGRAM_URL = "https://www.instagram.com/";

export const INSTAGRAM_INSTRUCTIONS = [
  "Open the downloaded card image.",
  "Open Instagram and choose Stories, a post, or a DM.",
  "Attach the card, paste the caption, and publish.",
];

/** WhatsApp share URL for a plain URL with no prefilled message. */
export function buildWhatsAppUrlForUrl(url: string, text?: string): string {
  const message = text ? `${text} ${url}` : url;
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

/** Friendly label for the role shown in the share sheet. */
export function roleLabel(role: ShareProfileRole): string {
  return role === "recruiter" ? "Recruiter" : "Talent";
}

/**
 * Whether the native share sheet can be used at all.
 *
 * `navigator.share` exists on most mobile browsers but is missing on desktop
 * Chrome/Firefox, so callers must always have a clipboard fallback.
 */
export function isNativeShareSupported(): boolean {
  if (typeof navigator === "undefined") return false;
  return typeof navigator.share === "function";
}

/**
 * Whether the browser can share the given payload natively.
 *
 * `navigator.canShare` is optional; when it is missing we optimistically
 * assume a plain URL share works and let `navigator.share` reject otherwise.
 */
export function canShareNative(payload: ShareData): boolean {
  if (typeof navigator === "undefined") return false;
  if (typeof navigator.canShare === "function") {
    try {
      return navigator.canShare(payload);
    } catch {
      return false;
    }
  }
  return typeof navigator.share === "function";
}

/**
 * Whether the browser can share files (used for the share card).
 */
export function canShareFiles(files: File[]): boolean {
  if (typeof navigator === "undefined") return false;
  if (typeof navigator.canShare !== "function") return false;
  if (typeof navigator.share !== "function") return false;
  try {
    return navigator.canShare({ files });
  } catch {
    return false;
  }
}

/**
 * A 1 × 1 transparent PNG.
 *
 * The probe file only has to look like a real PNG — browsers check the file
 * type, not the content — but a valid image keeps the check faithful on
 * browsers that inspect the payload.
 */
const PNG_PROBE_BYTES = Uint8Array.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
  0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
  0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
  0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
  0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
]);

/**
 * Synchronous capability probe for file sharing.
 *
 * `navigator.canShare` needs a file, but the real card is only ready after an
 * asynchronous render. A tiny PNG placeholder answers the same question and
 * the probe has to happen inside the click handler so the fallback can still
 * open a window: popup blockers only allow that while the user gesture is
 * still active.
 */
export function canShareFilesSync(): boolean {
  if (typeof navigator === "undefined") return false;
  if (typeof navigator.canShare !== "function") return false;
  if (typeof navigator.share !== "function") return false;
  try {
    const probe = new File([PNG_PROBE_BYTES], "rootin-talent-profile.png", {
      type: "image/png",
    });
    return navigator.canShare({ files: [probe] });
  } catch {
    return false;
  }
}

/** True when the clipboard API is usable (it needs a secure context). */
export function isClipboardSupported(): boolean {
  if (typeof navigator === "undefined") return false;
  return typeof navigator.clipboard?.writeText === "function";
}

/** True when the page is served from a secure context. */
export function isSecureContext(): boolean {
  if (typeof window === "undefined") return true;
  if (typeof window.isSecureContext === "boolean") return window.isSecureContext;
  return window.location.protocol === "https:";
}

/**
 * Copies text to the clipboard.
 *
 * Falls back to a hidden textarea + `execCommand` because the async
 * clipboard API is unavailable in insecure contexts and can be denied by
 * permission policy.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && typeof navigator.clipboard?.writeText === "function") {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to the legacy path below.
    }
  }

  if (typeof document === "undefined") return false;

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "-9999px";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand?.("copy") ?? false;
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

/**
 * Absolute URL for an image that may be stored as a relative path.
 *
 * Returns an empty string when the image is relative and no usable origin is
 * available — a preview image that points nowhere is worse than none.
 */
export function toAbsoluteUrl(url: string | undefined, origin?: string): string {
  const value = (url ?? "").trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value) || value.startsWith("data:")) return value;
  const base = normalizeOrigin(origin);
  if (!base) return "";
  return `${base}${value.startsWith("/") ? "" : "/"}${value}`;
}
