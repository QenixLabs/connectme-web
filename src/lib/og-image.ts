/**
 * Shared constants and versioning for talent Open Graph images.
 *
 * WhatsApp (and every other crawler) reads the Open Graph tags from the
 * server-rendered HTML, so the image URL has to be absolute, publicly
 * reachable and cache-busted whenever the upload changes. This module stays
 * free of `sharp` and of any other runtime-specific code so the metadata
 * builder can import it without pulling the image renderer into the page
 * bundle.
 */

import { createHash } from "node:crypto";

import { normalizeOrigin } from "@/lib/site";

/** Exact canvas size expected by WhatsApp's large landscape preview. */
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

/** JPEG is the most broadly supported `og:image` format. */
export const OG_IMAGE_CONTENT_TYPE = "image/jpeg";

/**
 * Hard ceiling for the served image.
 *
 * WhatsApp silently drops images that take too long to download; 250 kB
 * (decimal, not KiB) keeps a healthy margin below its documented ~300 kB
 * limit and below the 5 second crawler timeout.
 */
export const OG_IMAGE_MAX_BYTES = 250_000;

/**
 * Bump this when the renderer changes in a way that must invalidate every
 * cached preview (for example a new background or crop strategy).
 */
const VERSION_NAMESPACE = "talent-og-image:v1";

/** Route that renders the raw profile picture at exactly 1200 × 630. */
export function buildTalentOgImagePath(slug: string): string {
  const value = (slug ?? "").trim();
  if (!value) return "";
  return `/api/og/talent/${encodeURIComponent(value)}`;
}

export interface TalentOgImageUrlInput {
  /** Public application origin, e.g. `https://rootin.app`. */
  origin?: string | null;
  /** Talent username. */
  slug: string;
  /** Version returned by `buildTalentOgImageVersion`. */
  version?: string | null;
}

/**
 * Absolute URL of the rendered preview image.
 *
 * The `v` parameter is the cache buster WhatsApp needs: the crawler keys its
 * local preview cache by the full image URL, so a changed hash forces a
 * re-download instead of showing the previous picture.
 */
export function buildTalentOgImageUrl(
  input: TalentOgImageUrlInput,
): string {
  const path = buildTalentOgImagePath(input.slug);
  const origin = normalizeOrigin(input.origin);
  if (!path || !origin) return "";

  const version = (input.version ?? "").trim();
  return version
    ? `${origin}${path}?v=${encodeURIComponent(version)}`
    : `${origin}${path}`;
}

/**
 * Query parameters that change on every signed URL without identifying the
 * underlying file. Everything else (notably `path` on the app's own storage
 * controller) is part of the identity.
 */
const VOLATILE_QUERY_PARAMS = new Set([
  "expires",
  "signature",
  "token",
  "x-amz-signature",
  "x-amz-date",
  "x-amz-expires",
  "x-amz-credential",
  "x-amz-security-token",
  "x-goog-signature",
  "x-goog-date",
  "x-goog-expires",
  "x-goog-credential",
]);

/**
 * Stable identity of an uploaded picture.
 *
 * Storage URLs are signed and carry expiring query parameters. Hashing the
 * whole URL would therefore change every few minutes and defeat every cache
 * (CDN and WhatsApp alike). Only the path plus the stable parameters — such as
 * `path` on `/files/access?path=…` — are used as the identity.
 */
export function talentPhotoIdentity(profilePhoto?: string | null): string {
  const value = (profilePhoto ?? "").trim();
  if (!value) return "";

  try {
    const url = new URL(value);
    if (url.protocol === "http:" || url.protocol === "https:") {
      const stable = [...url.searchParams.entries()]
        .filter(([key]) => !VOLATILE_QUERY_PARAMS.has(key.toLowerCase()))
        .sort(([left], [right]) => left.localeCompare(right));

      const query = stable
        .map(
          ([key, entry]) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(entry)}`,
        )
        .join("&");

      const pathname = url.pathname.replace(/\/+$/, "");
      return `${url.origin}${pathname}${query ? `?${query}` : ""}`;
    }
  } catch {
    // A relative path is handled below.
  }

  return value.split(/[?#]/, 1)[0].replace(/\/+$/, "");
}

export interface TalentOgImageVersionInput {
  /** Raw profile picture URL returned by the API. */
  profilePhoto?: string | null;
  /** Profile `updated_at`, used when the file path itself is reused. */
  updatedAt?: string | null;
}

/**
 * Cache-busting hash for the preview image.
 *
 * The hash covers the picture identity (path only) *and* the profile update
 * timestamp, so both a new upload and an in-place replacement produce a new
 * `?v=` value. It is short enough to stay readable and long enough to avoid
 * collisions across profiles.
 */
export function buildTalentOgImageVersion(
  input: TalentOgImageVersionInput,
): string {
  const identity = talentPhotoIdentity(input.profilePhoto);
  const updatedAt = (input.updatedAt ?? "").trim();

  return createHash("sha256")
    .update(`${VERSION_NAMESPACE}|${identity}|${updatedAt}`)
    .digest("hex")
    .slice(0, 16);
}
