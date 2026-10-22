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

import type { PublicTalentProfileResponse } from "@/lib/api/talent";
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
 * Reads the public profile of a talent.
 *
 * Returns `null` for a missing profile, a private profile and for every
 * error — the caller falls back to generic metadata.
 */
export async function fetchPublicTalentProfile(
  username: string,
): Promise<PublicTalentProfile | null> {
  const slug = (username ?? "").trim();
  const base = apiBaseUrl();
  if (!slug || !base) return null;

  try {
    const response = await fetch(
      `${base}/talent/profile/${encodeURIComponent(slug)}`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: PUBLIC_PROFILE_REVALIDATE_SECONDS },
      },
    );

    if (!response.ok) return null;

    const payload = (await response.json()) as
      | { success?: boolean; data?: unknown }
      | unknown;

    const data =
      payload && typeof payload === "object" && "data" in payload
        ? (payload as { data?: unknown }).data
        : payload;

    if (!data || typeof data !== "object") return null;
    if (isPrivateTalentProfileResponse(data as PublicTalentProfileResponse)) {
      return null;
    }

    return data as PublicTalentProfile;
  } catch {
    return null;
  }
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
