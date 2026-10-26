/**
 * Server-side renderer for the talent Open Graph image.
 *
 * The preview uses the **raw** profile picture — never the generated profile
 * card — and normalises it onto an exact 1200 × 630 canvas. A portrait photo
 * is centred on a solid brand background instead of being cropped, which keeps
 * the face intact while still meeting the 1.91:1 ratio WhatsApp requires for a
 * large top-stacked landscape preview.
 *
 * Every output is re-encoded as progressive JPEG and checked against
 * `OG_IMAGE_MAX_BYTES` before it is returned, so a crawler never receives an
 * image that is too large for its timeout.
 */

import sharp from "sharp";

import {
  OG_IMAGE_HEIGHT,
  OG_IMAGE_MAX_BYTES,
  OG_IMAGE_WIDTH,
} from "@/lib/og-image";
import { normalizeOrigin } from "@/lib/site";

/** Background used around pictures that are not already 1.91:1. */
const OG_IMAGE_BACKGROUND = "#F1EAFE";

/** Abort a slow photo download before a crawler gives up on us. */
const PHOTO_TIMEOUT_MS = 5_000;

/** Refuse absurd source files before sharp allocates memory for them. */
const MAX_PHOTO_BYTES = 12 * 1024 * 1024;

/**
 * Highest quality first. Every entry produces the exact same dimensions; only
 * the JPEG quality (and therefore the file size) changes.
 */
const JPEG_QUALITIES = [82, 76, 70, 64, 58, 52, 46, 40, 34, 28];

/**
 * Origin that serves uploaded files.
 *
 * `NEXT_PUBLIC_API_URL` normally includes the API prefix
 * (`https://api.example.com/api/v1`), while the storage controller lives at
 * the host root (`/files/access`). Normalising to an origin drops the prefix.
 */
function apiOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  return configured ? normalizeOrigin(configured) : "";
}

/**
 * Candidate absolute URLs for a stored picture.
 *
 * The API mostly returns absolute signed URLs, but older records (and local
 * development fixtures) can contain a root-relative path. Both the API host
 * and the request host are tried so the renderer stays portable.
 */
export function buildTalentPhotoCandidates(
  profilePhoto: string,
  requestOrigin?: string | null,
): string[] {
  const value = (profilePhoto ?? "").trim();
  if (!value) return [];

  if (/^https?:\/\//i.test(value)) {
    try {
      new URL(value);
      return [value];
    } catch {
      return [];
    }
  }

  if (value.startsWith("//")) {
    const protocol = (requestOrigin ?? "").startsWith("http://")
      ? "http:"
      : "https:";
    return [`${protocol}${value}`];
  }

  if (!value.startsWith("/") || value.startsWith("/\\")) return [];

  const origins = [apiOrigin(), normalizeOrigin(requestOrigin)].filter(
    (origin): origin is string => Boolean(origin),
  );

  return [...new Set(origins.map((origin) => `${origin}${value}`))];
}

/** Downloads one candidate image, or resolves to `null` when it is unusable. */
async function downloadPhoto(url: string): Promise<Buffer | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PHOTO_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "image/*" },
      cache: "no-store",
      redirect: "follow",
    });

    if (!response.ok) return null;

    const contentType = (response.headers.get("content-type") ?? "")
      .trim()
      .toLowerCase();
    if (!contentType.startsWith("image/")) return null;

    const declaredLength = Number(response.headers.get("content-length") ?? "0");
    if (Number.isFinite(declaredLength) && declaredLength > MAX_PHOTO_BYTES) {
      return null;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.byteLength === 0 || buffer.byteLength > MAX_PHOTO_BYTES) {
      return null;
    }

    return buffer;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Downloads the raw profile picture from the first reachable candidate.
 *
 * The caller falls back to omitting `og:image` when this returns `null`; a
 * broken picture must never break the profile page itself.
 */
export async function fetchTalentProfilePhoto(
  profilePhoto: string,
  requestOrigin?: string | null,
): Promise<Buffer | null> {
  for (const candidate of buildTalentPhotoCandidates(
    profilePhoto,
    requestOrigin,
  )) {
    const buffer = await downloadPhoto(candidate);
    if (buffer) return buffer;
  }

  return null;
}

/**
 * Renders the picture onto a 1200 × 630 canvas and compresses it below the
 * hard byte limit.
 *
 * `fit: "contain"` guarantees an exact canvas for every source ratio: a
 * portrait is centred with solid padding, while an ultra-wide photo is
 * letterboxed instead of losing its subject. `rotate()` applies the EXIF
 * orientation first so phone photos are never sideways.
 */
export async function renderTalentOgImage(source: Buffer): Promise<Buffer> {
  const pipeline = sharp(source, {
    failOn: "none",
    limitInputPixels: 60_000_000,
  })
    .rotate()
    .resize({
      width: OG_IMAGE_WIDTH,
      height: OG_IMAGE_HEIGHT,
      fit: "contain",
      position: "centre",
      background: OG_IMAGE_BACKGROUND,
      kernel: sharp.kernel.lanczos3,
      withoutEnlargement: false,
    })
    .flatten({ background: OG_IMAGE_BACKGROUND });

  let smallest: Buffer | null = null;

  for (const quality of JPEG_QUALITIES) {
    const output = await pipeline
      .clone()
      .jpeg({
        quality,
        mozjpeg: true,
        progressive: true,
        chromaSubsampling: "4:2:0",
      })
      .toBuffer();

    if (output.byteLength < OG_IMAGE_MAX_BYTES) return output;

    if (!smallest || output.byteLength < smallest.byteLength) {
      smallest = output;
    }
  }

  throw new Error(
    `Open Graph image could not be compressed below ${OG_IMAGE_MAX_BYTES} bytes ` +
      `(smallest attempt: ${smallest?.byteLength ?? 0} bytes).`,
  );
}
