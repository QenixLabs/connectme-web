/**
 * Open Graph image endpoint for a public talent profile.
 *
 * `/api/og/talent/[username]?v=<hash>` renders the raw profile picture at
 * exactly 1200 × 630 and serves it as a JPEG below 250 kB. The URL is public
 * and has no query parameters that WhatsApp has to understand: the version
 * parameter only exists to bypass its local preview cache.
 */

import { OG_IMAGE_CONTENT_TYPE } from "@/lib/og-image";
import {
  fetchTalentProfilePhoto,
  renderTalentOgImage,
} from "@/lib/server/talent-og-image";
import { fetchPublicTalentProfile } from "@/lib/server/public-talent-profile";

export const runtime = "nodejs";

interface TalentOgRouteContext {
  params: Promise<{ username: string }>;
}

const NO_STORE = "no-store, max-age=0, must-revalidate";

function errorResponse(message: string, status: number): Response {
  return new Response(message, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": NO_STORE,
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function GET(
  request: Request,
  context: TalentOgRouteContext,
): Promise<Response> {
  const { username } = await context.params;
  const slug = (username ?? "").trim();

  if (!slug) return errorResponse("Not found", 404);

  const profile = await fetchPublicTalentProfile(slug);
  const profilePhoto = profile?.profile_photo?.trim();

  // No raw picture means no honest OG image. The page then omits
  // `og:image` rather than substituting the generated profile card.
  if (!profilePhoto) return errorResponse("No profile photo", 404);

  const source = await fetchTalentProfilePhoto(
    profilePhoto,
    new URL(request.url).origin,
  );
  if (!source) return errorResponse("Profile photo unavailable", 404);

  let image: Buffer;
  try {
    image = await renderTalentOgImage(source);
  } catch {
    return errorResponse("Could not render profile image", 500);
  }

  return new Response(new Uint8Array(image), {
    status: 200,
    headers: {
      "Content-Type": OG_IMAGE_CONTENT_TYPE,
      "Content-Length": String(image.byteLength),
      // The URL carries a content hash in `?v=`, so a long CDN lifetime is
      // safe: a new picture produces a new URL. The short browser/browserless
      // TTL lets a mis-versioned URL recover quickly.
      "Cache-Control":
        "public, max-age=300, s-maxage=31536000, stale-while-revalidate=604800",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": 'inline; filename="talent-profile.jpg"',
    },
  });
}
