/**
 * Social preview metadata for public profiles.
 *
 * The metadata is what a crawler (WhatsApp, LinkedIn, X, iMessage, Slack)
 * reads from the server-rendered HTML, so it has to be complete, absolute and
 * free of private fields. Only the display name, the profession, the
 * verification state and the canonical link are exposed.
 */

import { SHARE_BRAND } from "@/lib/share";

export interface ProfileMetadataInput {
  /** Display name of the profile owner. */
  name: string;
  /** Profession or headline. */
  headline?: string;
  /** Canonical, absolute profile URL. */
  url: string;
  /** Absolute URL of the preview image. */
  imageUrl: string;
  /**
   * Pixel dimensions of the served image.
   *
   * Crawlers use these to reserve the card before the image downloads.
   * Defaults to 1200 × 630, the size WhatsApp needs for a large preview.
   */
  imageWidth?: number;
  imageHeight?: number;
  /** MIME type of the served image. Defaults to `image/png`. */
  imageType?: string;
  /** Alt text for crawlers that expose it. Defaults to the preview title. */
  imageAlt?: string;
  /** Site name shown next to the title. */
  siteName?: string;
  /** Whether the profile carries a verification badge. */
  isVerified?: boolean;
}

/**
 * The metadata shape the builder produces.
 *
 * It is a structural subset of Next's `Metadata`, declared explicitly so the
 * fields can be asserted in tests without casting.
 */
export interface ProfileMetadata {
  title: string;
  description: string;
  alternates?: { canonical?: string };
  openGraph: {
    type: "profile";
    title: string;
    description: string;
    url?: string;
    siteName: string;
    images: Array<{
      url: string;
      width: number;
      height: number;
      type: string;
      alt: string;
    }>;
  };
  twitter: {
    card: "summary_large_image";
    title: string;
    description: string;
    images: string[];
  };
}

function displayName(name: string): string {
  return (name ?? "").trim();
}

/**
 * The preview title: the name, the profession and the brand.
 *
 * WhatsApp and LinkedIn both truncate the title, so the name comes first.
 */
export function buildProfileTitle(input: ProfileMetadataInput): string {
  const name = displayName(input.name);
  const headline = (input.headline ?? "").trim();
  const brand = input.siteName ?? SHARE_BRAND;

  if (!name) {
    return headline ? `${headline} on ${brand}` : `${brand} — Talent Profile`;
  }
  if (!headline) {
    return `${name} on ${brand}`;
  }
  return `${name} — ${headline} | ${brand}`;
}

/** The preview description: what the recipient gets when they open the link. */
export function buildProfileDescription(
  input: ProfileMetadataInput,
): string {
  const name = displayName(input.name);
  const headline = (input.headline ?? "").trim();
  const brand = input.siteName ?? SHARE_BRAND;

  if (!name) {
    return headline
      ? `Explore ${headline} work, portfolio and professional profile on ${brand}.`
      : `Explore verified talent, portfolios and professional profiles on ${brand}.`;
  }

  const subject = headline ? `${name}, ${headline}` : name;
  return `Explore ${subject}'s portfolio, credits and professional profile on ${brand}.`;
}

/**
 * Builds the Open Graph and Twitter/X card metadata for a profile.
 *
 * The preview image is always absolute — a relative URL is ignored by most
 * crawlers and would leave the preview empty. Width, height and MIME type are
 * emitted alongside the URL because WhatsApp uses them to decide between a
 * full landscape card and a small square thumbnail.
 */
export function buildProfileMetadata(
  input: ProfileMetadataInput,
): ProfileMetadata {
  const brand = input.siteName ?? SHARE_BRAND;
  const title = buildProfileTitle(input);
  const description = buildProfileDescription(input);
  const image = input.imageUrl?.trim() ?? "";

  const width =
    typeof input.imageWidth === "number" && input.imageWidth > 0
      ? input.imageWidth
      : 1200;
  const height =
    typeof input.imageHeight === "number" && input.imageHeight > 0
      ? input.imageHeight
      : 630;
  const type = input.imageType?.trim() || "image/png";
  const alt = input.imageAlt?.trim() || title;

  const images = image
    ? [
        {
          url: image,
          width,
          height,
          type,
          alt,
        },
      ]
    : [];

  return {
    title,
    description,
    alternates: input.url ? { canonical: input.url } : undefined,
    openGraph: {
      type: "profile",
      title,
      description,
      url: input.url || undefined,
      siteName: brand,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
  };
}
