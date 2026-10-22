import type { Metadata } from "next";
import { headers } from "next/headers";

import { PublicTalentProfileClient } from "./profile-client";
import { buildCanonicalProfileUrl } from "@/lib/share";
import { buildProfileMetadata } from "@/lib/share-metadata";
import { fetchPublicTalentProfile } from "@/lib/server/public-talent-profile";
import { resolveSiteOrigin } from "@/lib/site";

interface ProfileRouteParams {
  username: string;
}

/**
 * The origin the page is served from.
 *
 * The configured public site URL always wins. The request host is only used
 * as a fallback so a local preview still produces a working preview URL.
 */
async function resolveRequestOrigin(): Promise<string> {
  const headerList = await headers();
  const host = headerList.get("host");
  if (!host) return "";

  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  return `${protocol}://${host}`;
}

/**
 * Social preview metadata for a public talent profile.
 *
 * The metadata is rendered on the server so a crawler sees the name, the
 * profession and the preview image in the initial HTML — a client-side update
 * is too late for WhatsApp, LinkedIn or X.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<ProfileRouteParams>;
}): Promise<Metadata> {
  const { username } = await params;
  const slug = (username ?? "").trim();

  const origin = resolveSiteOrigin({
    configured: process.env.NEXT_PUBLIC_SITE_URL,
    windowOrigin: await resolveRequestOrigin(),
    nodeEnv: process.env.NODE_ENV,
  });

  const profile = slug ? await fetchPublicTalentProfile(slug) : null;

  const name =
    profile?.professional_name?.trim() ||
    profile?.full_legal_name?.trim() ||
    slug ||
    "Talent";
  const headline =
    profile?.headline?.trim() || profile?.professions?.join(" · ") || undefined;

  const url = slug
    ? buildCanonicalProfileUrl({ role: "talent", slug }, origin)
    : "";
  const imageUrl = origin
    ? `${origin}/talent/${encodeURIComponent(slug)}/opengraph-image`
    : "";

  return buildProfileMetadata({
    name,
    headline,
    url,
    imageUrl,
  });
}

export default async function PublicTalentProfilePage({
  params,
}: {
  params: Promise<ProfileRouteParams>;
}) {
  const { username } = await params;
  return <PublicTalentProfileClient username={username} />;
}
