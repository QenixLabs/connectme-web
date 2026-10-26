/**
 * Server-side access to the public talent profile.
 *
 * The public profile page needs the profile data in the server-rendered HTML
 * so that social crawlers can read the Open Graph metadata without running
 * any JavaScript. This module talks to the API directly with `fetch` — the
 * browser axios client is not usable on the server.
 *
 * Every failure is swallowed: a missing profile, a private profile or an
 * unreachable API must never break the page.
 */

import type {
  Credit,
  PortfolioApiResponse,
  PublicTalentProfileResponse,
  Testimonial,
} from "@/lib/api/talent";
import { isPrivateTalentProfileResponse } from "@/lib/api/talent";

/** How long the metadata may be cached before it is refreshed. */
export const PUBLIC_PROFILE_REVALIDATE_SECONDS = 300;

/** The public profile payload, or `null` when it cannot be read. */
export type PublicTalentProfile = Exclude<
  PublicTalentProfileResponse,
  { private: true }
>;

function apiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!configured) return "";
  return configured.replace(/\/+$/, "");
}

/**
 * Reads a public API path and returns the unwrapped `data` payload.
 *
 * The public API answers with `{ success: true, data: ... }`; anything else is
 * returned as-is. Every failure resolves to `null` so one broken request can
 * never break a render.
 */
async function fetchPublicJson<T>(path: string): Promise<T | null> {
  const base = apiBaseUrl();
  if (!base) return null;

  try {
    const response = await fetch(`${base}${path}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: PUBLIC_PROFILE_REVALIDATE_SECONDS },
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as
      | { success?: boolean; data?: unknown }
      | unknown;

    const data =
      payload && typeof payload === "object" && "data" in payload
        ? (payload as { data?: unknown }).data
        : payload;

    return (data ?? null) as T | null;
  } catch {
    return null;
  }
}

/**
 * Reads the public profile of a talent.
 *
 * Returns `null` for a missing profile, a private profile and for every
 * error — the caller falls back to generic metadata.
 */
export async function fetchPublicTalentProfile(
  username: string,
): Promise<PublicTalentProfile | null> {
  const slug = (username ?? "").trim();
  if (!slug) return null;

  const data = await fetchPublicJson<unknown>(
    `/talent/profile/${encodeURIComponent(slug)}`,
  );

  if (!data || typeof data !== "object") return null;
  if (isPrivateTalentProfileResponse(data as PublicTalentProfileResponse)) {
    return null;
  }

  return data as PublicTalentProfile;
}

/**
 * Downloads an image and returns it as a data URL.
 *
 * Used by the Open Graph image renderer: an image that cannot be fetched must
 * not break the whole preview, so the caller falls back to initials.
 */
export async function fetchImageAsDataUrl(
  url: string,
  options: { timeoutMs?: number; maxBytes?: number } = {},
): Promise<string | null> {
  const timeoutMs = options.timeoutMs ?? 4000;
  const maxBytes = options.maxBytes ?? 4 * 1024 * 1024;

  const value = (url ?? "").trim();
  if (!value || !/^https?:\/\//i.test(value)) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(value, { signal: controller.signal });
    if (!response.ok) return null;

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/")) return null;

    const buffer = await response.arrayBuffer();
    if (buffer.byteLength === 0 || buffer.byteLength > maxBytes) return null;

    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let index = 0; index < bytes.length; index += 1) {
      binary += String.fromCharCode(bytes[index]);
    }
    const base64 =
      typeof btoa === "function"
        ? btoa(binary)
        : Buffer.from(bytes).toString("base64");

    return `data:${contentType};base64,${base64}`;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Headline numbers shown on the Open Graph image.
 *
 * Every field is `null`/`0` when the matching request fails, so the renderer
 * can fall back to an em dash without losing the whole preview.
 */
export interface PublicTalentStats {
  /** RootScore, 0–100, from `profile.trust_score`. */
  rootScore: number | null;
  /** Average testimonial rating, one decimal. */
  rating: number | null;
  /** Number of approved testimonials behind the rating. */
  reviewCount: number;
  /** Portfolio items of type `image`. */
  photoCount: number;
  /** Portfolio items of type `video` or `youtube`. */
  videoCount: number;
  /** Credits of type `credit`. */
  projectCount: number;
}

const EMPTY_TALENT_STATS: PublicTalentStats = {
  rootScore: null,
  rating: null,
  reviewCount: 0,
  photoCount: 0,
  videoCount: 0,
  projectCount: 0,
};

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

/**
 * Collects the numbers rendered in the stats row of the OG image.
 *
 * Takes the profile the caller already fetched so the profile endpoint is not
 * requested twice. The remaining three requests run in parallel and each one
 * degrades to empty data on failure.
 */
export async function fetchPublicTalentStats(
  username: string,
  profile: PublicTalentProfile | null,
): Promise<PublicTalentStats> {
  const slug = (username ?? "").trim();
  if (!slug) return { ...EMPTY_TALENT_STATS };

  const encoded = encodeURIComponent(slug);

  const [testimonials, portfolio, credits] = await Promise.all([
    fetchPublicJson<Testimonial[]>(`/talent/profile/${encoded}/testimonials`),
    fetchPublicJson<
      | { items?: PortfolioApiResponse[] }
      | PortfolioApiResponse[]
    >(`/talent/portfolio/${encoded}`),
    fetchPublicJson<Credit[]>(`/talent/profile/${encoded}/credits`),
  ]);

  const reviewList = asArray<Testimonial>(testimonials);
  const ratingSum = reviewList.reduce(
    (total, review) => total + (review.rating ?? 5),
    0,
  );

  const portfolioItems = Array.isArray(portfolio)
    ? portfolio
    : asArray<PortfolioApiResponse>(portfolio?.items);

  const creditList = asArray<Credit>(credits);

  const trustScore = profile?.trust_score;

  return {
    rootScore:
      typeof trustScore === "number" && trustScore > 0
        ? Math.round(trustScore)
        : null,
    rating:
      reviewList.length > 0
        ? Number((ratingSum / reviewList.length).toFixed(1))
        : null,
    reviewCount: reviewList.length,
    photoCount: portfolioItems.filter((item) => item.type === "image").length,
    videoCount: portfolioItems.filter(
      (item) => item.type === "video" || item.type === "youtube",
    ).length,
    projectCount: creditList.filter((credit) => credit.type === "credit").length,
  };
}
