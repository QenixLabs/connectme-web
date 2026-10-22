import { ImageResponse } from "next/og";

import {
  fetchImageAsDataUrl,
  fetchPublicTalentProfile,
} from "@/lib/server/public-talent-profile";

/**
 * The Open Graph preview of a public talent profile.
 *
 * It is rendered by the app itself so the image is always publicly
 * reachable, always 1200 × 630 and never points at an internal API host.
 * The profile photo is embedded when it can be fetched; otherwise the brand
 * monogram is used.
 */

export const alt = "Talent profile on RootIn";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BRAND_PURPLE = "#6428F5";
const BRAND_PINK = "#E84AAB";
const INK = "#12143A";
const MUTED = "#62678A";

function initialsFor(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  if (parts.length === 0) return "T";
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await fetchPublicTalentProfile(username);

  const name =
    profile?.professional_name?.trim() ||
    profile?.full_legal_name?.trim() ||
    (username ?? "").trim() ||
    "Talent";
  const headline =
    profile?.headline?.trim() ||
    profile?.professions?.join(" · ") ||
    "Talent profile";
  const isVerified = Boolean(profile?.is_verified);

  const photo = profile?.profile_photo
    ? await fetchImageAsDataUrl(profile.profile_photo)
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 64px",
          backgroundImage:
            "linear-gradient(135deg, #F6F1FF 0%, #FFFFFF 55%, #FFF2F7 100%)",
          color: INK,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundImage: `linear-gradient(135deg, ${BRAND_PURPLE} 0%, ${BRAND_PINK} 100%)`,
              display: "flex",
            }}
          />
          <div
            style={{
              marginLeft: 16,
              fontSize: 34,
              fontWeight: 700,
              display: "flex",
            }}
          >
            RootIn
          </div>
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              padding: "10px 20px",
              borderRadius: 999,
              backgroundColor: "rgba(100, 40, 245, 0.08)",
              border: "2px solid rgba(100, 40, 245, 0.16)",
              color: BRAND_PURPLE,
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            TALENT PROFILE
          </div>
        </div>

        {/* Portrait and identity */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 240,
              height: 240,
              borderRadius: 120,
              border: "6px solid #FFFFFF",
              boxShadow: "0 0 0 6px rgba(100, 40, 245, 0.35)",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundImage: `linear-gradient(135deg, #F1EAFF 0%, #FFE3F0 100%)`,
            }}
          >
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photo}
                alt=""
                width={240}
                height={240}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  fontSize: 96,
                  fontWeight: 700,
                  color: BRAND_PURPLE,
                  display: "flex",
                }}
              >
                {initialsFor(name)}
              </div>
            )}
          </div>

          <div
            style={{
              marginLeft: 44,
              display: "flex",
              flexDirection: "column",
              flexGrow: 1,
            }}
          >
            <div
              style={{
                fontSize: 68,
                fontWeight: 700,
                lineHeight: 1.1,
                display: "flex",
              }}
            >
              {name}
            </div>
            <div
              style={{
                marginTop: 12,
                fontSize: 30,
                color: MUTED,
                display: "flex",
              }}
            >
              {headline}
            </div>
            {isVerified ? (
              <div
                style={{
                  marginTop: 22,
                  alignSelf: "flex-start",
                  display: "flex",
                  alignItems: "center",
                  padding: "10px 22px",
                  borderRadius: 999,
                  backgroundColor: "rgba(35, 121, 239, 0.10)",
                  border: "2px solid rgba(35, 121, 239, 0.32)",
                  color: "#1B5FCB",
                  fontSize: 24,
                  fontWeight: 600,
                }}
              >
                Verified on RootIn
              </div>
            ) : null}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 24,
            color: MUTED,
          }}
        >
          <div style={{ display: "flex", color: BRAND_PURPLE, fontWeight: 700 }}>
            RootIn
          </div>
          <div style={{ marginLeft: 14, display: "flex" }}>
            Discover verified talent and roles
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
