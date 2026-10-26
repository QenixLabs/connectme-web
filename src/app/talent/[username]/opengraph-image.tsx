import { ImageResponse } from "next/og";

import {
  fetchImageAsDataUrl,
  fetchPublicTalentProfile,
  fetchPublicTalentStats,
} from "@/lib/server/public-talent-profile";

/**
 * The Open Graph preview of a public talent profile.
 *
 * It is rendered by the app itself so the image is always publicly
 * reachable, always 1200 × 630 and never points at an internal API host.
 * The profile photo is embedded when it can be fetched; otherwise the brand
 * monogram is used.
 *
 * A proof-point row carries the four numbers a recruiter scans first:
 * RootScore, testimonial rating, portfolio size and credit count. Each row
 * cell degrades to an em dash, so a partial API failure still renders a
 * complete image.
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

/** RootScore band, matching the wording used by `StatsBento`. */
function trustBand(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  return "Average";
}

function plural(
  count: number,
  singular: string,
  pluralWord = `${singular}s`,
): string {
  return `${count} ${count === 1 ? singular : pluralWord}`;
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

  const stats = await fetchPublicTalentStats(username, profile);
  const mediaCount = stats.photoCount + stats.videoCount;

  const statCards = [
    {
      value: stats.rootScore != null ? String(stats.rootScore) : "—",
      label: "RootScore",
      note: stats.rootScore != null ? trustBand(stats.rootScore) : "Not scored",
      color: "#2563EB",
    },
    {
      value: stats.rating != null ? stats.rating.toFixed(1) : "—",
      label: "Rating",
      note:
        stats.reviewCount > 0
          ? plural(stats.reviewCount, "review")
          : "No reviews",
      color: "#D97706",
    },
    {
      value: mediaCount > 0 ? String(mediaCount) : "—",
      label: "Portfolio",
      note:
        mediaCount > 0
          ? [
              stats.photoCount > 0 ? plural(stats.photoCount, "photo") : null,
              stats.videoCount > 0 ? plural(stats.videoCount, "video") : null,
            ]
              .filter((part): part is string => part !== null)
              .join(" · ")
          : "No media yet",
      color: "#7C3AED",
    },
    {
      value: stats.projectCount > 0 ? String(stats.projectCount) : "—",
      label: "Projects",
      note:
        stats.projectCount > 0
          ? plural(stats.projectCount, "credit")
          : "No credits yet",
      color: "#0F9F92",
    },
  ];

  const hasStats = statCards.some((card) => card.value !== "—");

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

        {/* Proof points */}
        {hasStats ? (
          <div style={{ display: "flex", width: "100%" }}>
            {statCards.map((card, index) => (
              <div
                key={card.label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flexGrow: 1,
                  flexBasis: 0,
                  marginLeft: index === 0 ? 0 : 16,
                  padding: "18px 24px",
                  borderRadius: 22,
                  backgroundColor: "#FFFFFF",
                  border: "2px solid rgba(18, 20, 58, 0.07)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: 46,
                    fontWeight: 700,
                    lineHeight: 1,
                    color: card.color,
                  }}
                >
                  {card.value}
                </div>
                <div
                  style={{
                    display: "flex",
                    marginTop: 9,
                    fontSize: 16,
                    fontWeight: 700,
                    letterSpacing: 1.2,
                    color: INK,
                  }}
                >
                  {card.label.toUpperCase()}
                </div>
                <div
                  style={{
                    display: "flex",
                    marginTop: 4,
                    fontSize: 16,
                    color: MUTED,
                  }}
                >
                  {card.note}
                </div>
              </div>
            ))}
          </div>
        ) : null}

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
