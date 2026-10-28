/**
 * Branded "profile card" image generation.
 *
 * The card is rendered on the client with the Canvas 2D API so a profile
 * can be shared as a high-fidelity image on Instagram, WhatsApp, LinkedIn, etc.
 *
 * Uses the custom RootIn creative template background and overlays:
 * - Top talent badge
 * - Circular avatar with vivid gradient ring & verified check badge
 * - Talent name with verified badge and role headline
 * - Pastel category pills (Model, Fashion, Commercial, Editorial, etc.)
 * - Four-column stats bar (RootScore, Response Rate, Rating, Shortlists)
 * - QR code & profile link panel
 *
 * Everything degrades gracefully: missing photo falls back to initials,
 * missing template falls back to procedural glass gradient, and non-CORS
 * images are handled safely without crashing.
 */

import qrcode from "qrcode-generator";

import {
  SHARE_BRAND,
  buildCanonicalProfileUrl,
  type ShareCardStatItem,
  type ShareProfileTarget,
} from "@/lib/share";

export const SHARE_CARD_WIDTH = 682;
export const SHARE_CARD_HEIGHT = 1024;

/** Nothing may be drawn outside this margin. */
export const SHARE_CARD_SAFE_MARGIN = 24;

/**
 * The geometry of the card.
 */
export const SHARE_CARD_LAYOUT = {
  header: {
    badgeX: 50,
    badgeY: 202,
    badgeWidth: 118,
    badgeHeight: 28,
  },
  portrait: {
    centerX: 352,
    centerY: 286,
    radius: 174,
    ringWidth: 10,
    ringGap: 6,
    badgeX: 477,
    badgeY: 411,
    badgeRadius: 26,
  },
  name: {
    y: 493,
    fontSize: 38,
    maxWidth: 540,
  },
  headline: {
    y: 523,
    fontSize: 17,
    maxWidth: 540,
  },
  badge: {
    y: 493,
    height: 24,
    fontSize: 14,
  },
  pills: {
    y: 543,
    height: 27,
    fontSize: 13,
  },
  stats: {
    y: 598,
    col1X: 128,
    col2X: 270,
    col3X: 412,
    col4X: 554,
    dividerY1: 574,
    dividerY2: 646,
  },
  panel: {
    x: 44,
    y: 650,
    width: 594,
    height: 140,
    radius: 20,
  },
  qr: {
    x: 488,
    y: 652,
    size: 136,
    codeSize: 128,
  },
  footer: {
    x: 64,
    right: SHARE_CARD_WIDTH - 64,
    y: 950,
    fontSize: 22,
    tagline: "Discover verified talent and roles",
  },
} as const;

export interface ShareCardContent {
  brand: string;
  name: string;
  headline: string;
  roleLabel: string;
  initials: string;
  url: string;
  /** Short, human friendly link label, e.g. `rootin.com/talent/asha-rao`. */
  shortUrl: string;
  /** The handle shown in the link panel, e.g. `@asha-rao`. */
  handle: string;
  isVerified: boolean;
  tags: string[];
  /** RootScore, response rate, rating and shortlists in display order. */
  statItems: ShareCardStatItem[];
}

/**
 * Builds the four profile proof points shown on every talent share card.
 */
export function selectBestTalentStats(params: {
  profile?: {
    trust_score?: number;
    response_rate?: number;
    analytics?: {
      shortlist_count?: number;
    };
  } | null;
  testimonials?: Array<{ rating?: number }>;
}): ShareCardStatItem[] {
  const profile = params.profile;
  const testimonials = params.testimonials ?? [];
  const rating =
    testimonials.length > 0
      ? testimonials.reduce((sum, testimonial) => sum + (testimonial.rating ?? 5), 0) /
        testimonials.length
      : null;
  const rootScore =
    typeof profile?.trust_score === "number" && profile.trust_score > 0
      ? String(Math.round(profile.trust_score))
      : "—";
  const responseRate =
    typeof profile?.response_rate === "number"
      ? `${Math.round(profile.response_rate)}%`
      : "—";
  const shortlistCount = profile?.analytics?.shortlist_count ?? 0;
  const trustScoreValue = profile?.trust_score;
  const responseRateValue = profile?.response_rate;

  return [
    {
      icon: "award",
      count: rootScore,
      label: "RootScore",
      note:
        typeof trustScoreValue !== "number" || trustScoreValue <= 0
          ? "Not scored"
          : trustScoreValue >= 80
            ? "Excellent"
            : trustScoreValue >= 60
              ? "Good"
              : "Average",
    },
    {
      icon: "message",
      count: responseRate,
      label: "Response Rate",
      note:
        typeof responseRateValue !== "number"
          ? "Not shared"
          : responseRateValue >= 80
            ? "Very Responsive"
            : "Responsive",
    },
    {
      icon: "star",
      count: rating === null ? "—" : rating.toFixed(1),
      label: "Rating",
      note: testimonials.length
        ? `${testimonials.length} Review${testimonials.length === 1 ? "" : "s"}`
        : "No reviews",
    },
    {
      icon: "bookmark",
      count: shortlistCount > 0 ? String(shortlistCount) : "—",
      label: "Shortlists",
      note: shortlistCount > 0 ? "Saved by recruiters" : "None yet",
    },
  ];
}

/**
 * The textual and metric content of the share card.
 */
export function buildShareCardContent(
  options: ShareCardOptions,
): ShareCardContent {
  const brand = options.brand ?? SHARE_BRAND;
  const name =
    options.name?.trim() || options.target.name?.trim() || "Unnamed profile";
  const roleLabel = options.target.role === "recruiter" ? "Recruiter" : "Talent";
  const headline = options.headline?.trim() || options.target.headline?.trim() || roleLabel;
  const url =
    options.url ??
    buildCanonicalProfileUrl(options.target, options.origin);

  const rawTags =
    options.target.tags && options.target.tags.length > 0
      ? options.target.tags
      : headline
          .split(/[\/|·,]/)
          .map((s) => s.trim())
          .filter(Boolean);

  const tags =
    rawTags.length > 0
      ? rawTags.slice(0, 4)
      : ["Model", "Fashion", "Commercial", "Editorial"];

  const statItems =
    options.target.statItems && options.target.statItems.length === 4
      ? options.target.statItems
      : selectBestTalentStats({});

  return {
    brand,
    name,
    headline,
    roleLabel,
    initials: initialsFor(name),
    url,
    shortUrl: buildShortLinkLabel(url),
    handle: buildHandleLabel(options.target.slug),
    isVerified: Boolean(options.target.isVerified),
    tags,
    statItems,
  };
}

/**
 * Short label for a canonical URL, e.g. `rootin.com/talent/asha-rao`.
 */
export function buildShortLinkLabel(url: string): string {
  const value = (url ?? "").trim();
  if (!value) return "";

  const withoutProtocol = value.replace(/^https?:\/\//i, "");
  const [host, ...rest] = withoutProtocol.split("/");
  const path = rest.filter(Boolean).join("/");
  return path ? `${host}/${path}` : host;
}

/** Handle label for a profile, e.g. `@asha-rao`. */
export function buildHandleLabel(slug: string): string {
  const value = (slug ?? "").trim();
  if (!value) return "";
  return `@${value}`;
}

export interface ShareCardOptions {
  target: ShareProfileTarget;
  /** Canonical absolute profile URL. Derived from the target when omitted. */
  url?: string;
  /** Whether to render a QR code for the profile URL. */
  includeQr?: boolean;
  /** Brand name rendered in the card header. */
  brand?: string;
  /** Origin used when the URL has to be derived. */
  origin?: string;
  /** Overrides the display name (defaults to the target name). */
  name?: string;
  /** Overrides the profession line (defaults to the target headline). */
  headline?: string;
}

export interface ShareCardResult {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  /** Set when the photo had to be dropped (cross-origin image not embeddable). */
  photoOmitted: boolean;
}

const INK = "#0A1128";
const MUTED = "#5E6585";

type Ctx = CanvasRenderingContext2D;

function roundedRect(
  ctx: Ctx,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/** Truncates a string so it fits the given width, adding an ellipsis. */
export function truncateToWidth(
  ctx: Ctx,
  text: string,
  maxWidth: number,
): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let result = text;
  while (result.length > 1 && ctx.measureText(`${result}…`).width > maxWidth) {
    result = result.slice(0, -1);
  }
  return `${result}…`;
}

function initialsFor(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  if (parts.length === 0) return "?";
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

function resolveFontFamily(): string {
  if (typeof document === "undefined") return "Rubik, system-ui, -apple-system, sans-serif";
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue("--font-rubik")
    .trim();
  return value ? `${value}, system-ui, -apple-system, sans-serif` : "Rubik, system-ui, -apple-system, sans-serif";
}

interface LoadedImage {
  image: HTMLImageElement;
  /** True when the image was loaded without CORS and taints the canvas. */
  tainted: boolean;
}

/**
 * Loads an image for canvas drawing.
 */
export async function loadImageForCanvas(
  src: string,
): Promise<LoadedImage | null> {
  if (typeof window === "undefined" || !src) return null;

  const tryLoad = (crossOrigin: boolean): Promise<LoadedImage | null> =>
    new Promise((resolve) => {
      const image = new Image();
      if (crossOrigin) image.crossOrigin = "anonymous";
      image.onload = () => resolve({ image, tainted: !crossOrigin });
      image.onerror = () => resolve(null);
      image.src = src;
    });

  return (await tryLoad(true)) ?? (await tryLoad(false));
}

/**
 * Builds the QR matrix for a URL.
 */
export function buildQrMatrix(
  value: string,
): { modules: boolean[][]; count: number } | null {
  if (!value) return null;
  try {
    const qr = qrcode(0, "M");
    qr.addData(value);
    qr.make();
    const count = qr.getModuleCount();
    const modules: boolean[][] = [];
    for (let row = 0; row < count; row += 1) {
      const line: boolean[] = [];
      for (let col = 0; col < count; col += 1) {
        line.push(qr.isDark(row, col));
      }
      modules.push(line);
    }
    return { modules, count };
  } catch {
    return null;
  }
}

/**
 * Draws a QR code inside a quiet white zone.
 */
export function drawQr(
  ctx: Ctx,
  value: string,
  x: number,
  y: number,
  size: number,
) {
  const matrix = buildQrMatrix(value);
  if (!matrix) return;

  const quiet = 4;
  const total = matrix.count + quiet * 2;
  const cell = size / total;

  ctx.fillStyle = "#FFFFFF";
  roundedRect(ctx, x, y, size, size, 12);
  ctx.fill();

  ctx.fillStyle = INK;
  for (let row = 0; row < matrix.count; row += 1) {
    for (let col = 0; col < matrix.count; col += 1) {
      if (!matrix.modules[row][col]) continue;
      ctx.fillRect(
        x + (col + quiet) * cell,
        y + (row + quiet) * cell,
        Math.ceil(cell),
        Math.ceil(cell),
      );
    }
  }
}

function drawVerifiedBadge(
  ctx: Ctx,
  x: number,
  y: number,
  radius: number,
  hasBorder = true,
) {
  ctx.save();
  if (hasBorder) {
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = Math.max(3, radius * 0.22);
    ctx.beginPath();
    ctx.arc(x, y, radius + ctx.lineWidth / 2, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = "#0075FF";
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = Math.max(2.5, radius * 0.24);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(x - radius * 0.45, y);
  ctx.lineTo(x - radius * 0.1, y + radius * 0.38);
  ctx.lineTo(x + radius * 0.48, y - radius * 0.34);
  ctx.stroke();
  ctx.restore();
}

function drawCameraIcon(ctx: Ctx, x: number, y: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  roundedRect(ctx, x - 11, y - 7, 22, 16, 3.5);
  ctx.fill();
  roundedRect(ctx, x - 5, y - 10, 10, 4, 1.5);
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.arc(x, y + 1, 4.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y + 1, 2.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPlayIcon(ctx: Ctx, x: number, y: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  roundedRect(ctx, x - 12, y - 8, 24, 17, 4);
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.moveTo(x - 3, y - 4.5);
  ctx.lineTo(x + 4.5, y);
  ctx.lineTo(x - 3, y + 4.5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawBriefcaseIcon(ctx: Ctx, x: number, y: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  roundedRect(ctx, x - 12, y - 6, 24, 16, 3.5);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(x, y - 6, 4.5, Math.PI, 0);
  ctx.stroke();
  ctx.fillStyle = "#FFFFFF";
  roundedRect(ctx, x - 2.5, y - 1.5, 5, 3.5, 1);
  ctx.fill();
  ctx.restore();
}

function drawStarIcon(ctx: Ctx, x: number, y: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  const spikes = 5;
  const outerRadius = 10;
  const innerRadius = 4.8;
  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / spikes;
  ctx.beginPath();
  ctx.moveTo(x, y - outerRadius);
  for (let i = 0; i < spikes; i++) {
    let cx = x + Math.cos(rot) * outerRadius;
    let cy = y + Math.sin(rot) * outerRadius;
    ctx.lineTo(cx, cy);
    rot += step;
    cx = x + Math.cos(rot) * innerRadius;
    cy = y + Math.sin(rot) * innerRadius;
    ctx.lineTo(cx, cy);
    rot += step;
  }
  ctx.lineTo(x, y - outerRadius);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawHeartIcon(ctx: Ctx, x: number, y: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y + 8);
  ctx.bezierCurveTo(x - 9, y + 2, x - 10, y - 6, x - 5, y - 6);
  ctx.bezierCurveTo(x - 1, y - 6, x, y - 2, x, y - 2);
  ctx.bezierCurveTo(x, y - 2, x + 1, y - 6, x + 5, y - 6);
  ctx.bezierCurveTo(x + 10, y - 6, x + 9, y + 2, x, y + 8);
  ctx.fill();
  ctx.restore();
}

function drawAwardIcon(ctx: Ctx, x: number, y: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  // Cup body
  ctx.beginPath();
  ctx.arc(x, y - 4, 6.5, 0, Math.PI);
  ctx.lineTo(x + 6.5, y - 8);
  ctx.lineTo(x - 6.5, y - 8);
  ctx.closePath();
  ctx.fill();
  // Stem & Base
  ctx.fillRect(x - 1.5, y + 2.5, 3, 3.5);
  roundedRect(ctx, x - 5.5, y + 6, 11, 2.5, 1);
  ctx.fill();
  // Handles
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(x - 6.5, y - 4, 3, -Math.PI / 2, Math.PI / 2, true);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + 6.5, y - 4, 3, -Math.PI / 2, Math.PI / 2, false);
  ctx.stroke();
  ctx.restore();
}

function drawCalendarIcon(ctx: Ctx, x: number, y: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  roundedRect(ctx, x - 9.5, y - 7.5, 19, 16, 3);
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  roundedRect(ctx, x - 6, y - 9.5, 2.5, 3.5, 1);
  roundedRect(ctx, x + 3.5, y - 9.5, 2.5, 3.5, 1);
  ctx.fill();
  roundedRect(ctx, x - 7.5, y - 4, 15, 2, 1);
  ctx.fill();
  ctx.fillRect(x - 5.5, y, 2.2, 2.2);
  ctx.fillRect(x - 1, y, 2.2, 2.2);
  ctx.fillRect(x + 3.5, y, 2.2, 2.2);
  ctx.fillRect(x - 5.5, y + 4, 2.2, 2.2);
  ctx.fillRect(x - 1, y + 4, 2.2, 2.2);
  ctx.fillRect(x + 3.5, y + 4, 2.2, 2.2);
  ctx.restore();
}

function drawEyeIcon(ctx: Ctx, x: number, y: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y - 4.5, 11, 0.28 * Math.PI, 0.72 * Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y + 4.5, 11, 1.28 * Math.PI, 1.72 * Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, 3.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawMessageIcon(ctx: Ctx, x: number, y: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  roundedRect(ctx, x - 9.5, y - 8, 19, 14, 3.5);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - 4, y + 6);
  ctx.lineTo(x - 4, y + 9);
  ctx.lineTo(x + 1.5, y + 6);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(x - 5.5, y - 3.5, 11, 1.6);
  ctx.fillRect(x - 5.5, y + 0.5, 7.5, 1.6);
  ctx.restore();
}

function drawBookmarkIcon(ctx: Ctx, x: number, y: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x - 7, y - 10);
  ctx.quadraticCurveTo(x - 9, y - 10, x - 9, y - 8);
  ctx.lineTo(x - 9, y + 9);
  ctx.lineTo(x, y + 4);
  ctx.lineTo(x + 9, y + 9);
  ctx.lineTo(x + 9, y - 8);
  ctx.quadraticCurveTo(x + 9, y - 10, x + 7, y - 10);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

async function drawAvatar(
  ctx: Ctx,
  target: ShareProfileTarget,
  initials: string,
  origin: string,
  centerX: number,
  centerY: number,
  radius: number,
  withPhoto: boolean,
): Promise<boolean> {
  const photoUrl = target.photoUrl
    ? /^https?:\/\//i.test(target.photoUrl)
      ? target.photoUrl
      : `${origin}${target.photoUrl.startsWith("/") ? "" : "/"}${target.photoUrl}`
    : "";

  if (withPhoto && photoUrl) {
    const loaded = await loadImageForCanvas(photoUrl);
    if (loaded) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      const source = loaded.image;
      const side = Math.min(source.naturalWidth, source.naturalHeight);
      const sx = (source.naturalWidth - side) / 2;
      const sy = (source.naturalHeight - side) / 2;
      ctx.drawImage(
        source,
        sx,
        sy,
        side,
        side,
        centerX - radius,
        centerY - radius,
        radius * 2,
        radius * 2,
      );
      ctx.restore();
      return !loaded.tainted;
    }
  }

  // Initials fallback
  const gradient = ctx.createLinearGradient(
    centerX - radius,
    centerY - radius,
    centerX + radius,
    centerY + radius,
  );
  gradient.addColorStop(0, "#D13B08");
  gradient.addColorStop(1, "#A92A00");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#FFFFFF";
  ctx.font = `700 ${Math.round(radius * 0.72)}px ${resolveFontFamily()}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(initials, centerX, centerY + radius * 0.04);
  return true;
}

export function isCanvasTainted(ctx: Ctx): boolean {
  try {
    ctx.getImageData(0, 0, 1, 1);
    return false;
  } catch {
    return true;
  }
}

/**
 * Renders the branded share card onto a canvas.
 */
export async function renderShareCardToCanvas(
  options: ShareCardOptions & { withPhoto: boolean },
): Promise<HTMLCanvasElement> {
  const { target, withPhoto } = options;
  const content = buildShareCardContent(options);
  const layout = SHARE_CARD_LAYOUT;
  const origin =
    options.origin ??
    (typeof window !== "undefined" ? window.location.origin : undefined);

  const canvas = document.createElement("canvas");
  canvas.width = SHARE_CARD_WIDTH;
  canvas.height = SHARE_CARD_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context is not available");

  const font = resolveFontFamily();

  // 1. Draw Template Background
  let templateDrawn = false;
  if (typeof window !== "undefined") {
    const loadedTemplate = await loadImageForCanvas("/share-template.png");
    if (loadedTemplate) {
      ctx.drawImage(
        loadedTemplate.image,
        0,
        0,
        SHARE_CARD_WIDTH,
        SHARE_CARD_HEIGHT,
      );
      templateDrawn = true;
    }
  }

  // Fallback procedural background if template is absent (e.g. offline unit test)
  if (!templateDrawn) {
    const bgGrad = ctx.createLinearGradient(0, 0, SHARE_CARD_WIDTH, SHARE_CARD_HEIGHT);
    bgGrad.addColorStop(0, "#EBF1FC");
    bgGrad.addColorStop(0.5, "#F7F5FE");
    bgGrad.addColorStop(1, "#FFEFE6");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, SHARE_CARD_WIDTH, SHARE_CARD_HEIGHT);

    // Decorative brand blobs
    const blob = (x: number, y: number, r: number, color: string) => {
      const radial = ctx.createRadialGradient(x, y, 0, x, y, r);
      radial.addColorStop(0, color);
      radial.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = radial;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    };
    blob(80, 100, 220, "rgba(0,128,255,0.08)");
    blob(600, 120, 240, "rgba(255,140,0,0.1)");
    blob(620, 920, 260, "rgba(255,100,0,0.08)");

    // Frosted glass card plate
    ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
    roundedRect(ctx, 36, 172, 610, 690, 36);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
    ctx.lineWidth = 2;
    roundedRect(ctx, 36, 172, 610, 690, 36);
    ctx.stroke();

    // Footer brand text
    ctx.fillStyle = "#6428F5";
    ctx.font = `700 24px ${font}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(content.brand, layout.footer.x, layout.footer.y);

    ctx.fillStyle = MUTED;
    ctx.font = `500 ${layout.footer.fontSize}px ${font}`;
    ctx.textAlign = "right";
    ctx.fillText(layout.footer.tagline, layout.footer.right, layout.footer.y);
  }

  if (templateDrawn) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
    roundedRect(ctx, 34, 180, 614, 674, 30);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx.lineWidth = 1.5;
    roundedRect(ctx, 34, 180, 614, 674, 30);
    ctx.stroke();
  }

  // --- A. Top-Left Badge: TALENT PROFILE ------------------------------------
  const badgeH = layout.header.badgeHeight;
  const badgeW = layout.header.badgeWidth;
  const badgeX = layout.header.badgeX;
  const badgeY = layout.header.badgeY;

  ctx.fillStyle = "rgba(240, 235, 255, 0.92)";
  roundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 14);
  ctx.fill();
  ctx.strokeStyle = "rgba(130, 80, 245, 0.28)";
  ctx.lineWidth = 1.4;
  roundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 14);
  ctx.stroke();

  // User icon
  ctx.fillStyle = "#6E38F7";
  ctx.beginPath();
  ctx.arc(badgeX + 17, badgeY + 11, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(badgeX + 17, badgeY + 21, 6.5, Math.PI, 0);
  ctx.fill();

  ctx.fillStyle = "#6E38F7";
  ctx.font = `700 11px ${font}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("TALENT PROFILE", badgeX + 28, badgeY + badgeH / 2 + 1);

  // --- B. Avatar with Rainbow Ring -----------------------------------------
  const { centerX, centerY, radius, ringWidth, ringGap, badgeX: avBadgeX, badgeY: avBadgeY, badgeRadius } =
    layout.portrait;
  const ringRadius = radius + ringGap;

  // Inner white gap ring
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
  ctx.stroke();

  // Multi-color rainbow gradient ring
  ctx.save();
  let ringStroke: CanvasGradient | string;
  try {
    const conic = (ctx as unknown as { createConicGradient?: (angle: number, x: number, y: number) => CanvasGradient }).createConicGradient?.(
      0,
      centerX,
      centerY,
    );
    if (conic) {
      conic.addColorStop(0.0, "#8E2DE2");
      conic.addColorStop(0.22, "#F02875");
      conic.addColorStop(0.42, "#FF6B00");
      conic.addColorStop(0.65, "#FFB800");
      conic.addColorStop(0.85, "#0084FF");
      conic.addColorStop(1.0, "#8E2DE2");
      ringStroke = conic;
    } else {
      throw new Error("No conic gradient");
    }
  } catch {
    const linear = ctx.createLinearGradient(
      centerX - ringRadius,
      centerY - ringRadius,
      centerX + ringRadius,
      centerY + ringRadius,
    );
    linear.addColorStop(0, "#8E2DE2");
    linear.addColorStop(0.35, "#F02875");
    linear.addColorStop(0.7, "#FF6B00");
    linear.addColorStop(1, "#0084FF");
    ringStroke = linear;
  }
  ctx.strokeStyle = ringStroke;
  ctx.lineWidth = ringWidth;
  ctx.beginPath();
  ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Inner portrait photo
  await drawAvatar(
    ctx,
    target,
    content.initials,
    origin ?? "",
    centerX,
    centerY,
    radius,
    withPhoto,
  );

  // Blue verified badge attached to bottom-right of avatar ring
  drawVerifiedBadge(ctx, avBadgeX, avBadgeY, badgeRadius, true);

  // --- C. Name with Inline Verified Check -----------------------------------
  ctx.textBaseline = "middle";
  ctx.font = `700 ${layout.name.fontSize}px ${font}`;
  const maxNameWidth = layout.name.maxWidth;
  const rawName = content.name;

  if (content.isVerified) {
    const nameBadgeSize = 22;
    const nameGap = 8;
    const truncatedName = truncateToWidth(ctx, rawName, maxNameWidth - nameBadgeSize - nameGap);
    const measuredWidth = ctx.measureText(truncatedName).width;
    const totalW = measuredWidth + nameGap + nameBadgeSize;
    const startX = centerX - totalW / 2;

    ctx.fillStyle = INK;
    ctx.textAlign = "left";
    ctx.fillText(truncatedName, startX, layout.name.y);

    drawVerifiedBadge(
      ctx,
      startX + measuredWidth + nameGap + nameBadgeSize / 2,
      layout.name.y + 1,
      nameBadgeSize / 2,
      false,
    );
  } else {
    const truncatedName = truncateToWidth(ctx, rawName, maxNameWidth);
    ctx.fillStyle = INK;
    ctx.textAlign = "center";
    ctx.fillText(truncatedName, centerX, layout.name.y);
  }

  // --- D. Headline / Roles -------------------------------------------------
  ctx.textAlign = "center";
  ctx.fillStyle = MUTED;
  ctx.font = `600 ${layout.headline.fontSize}px ${font}`;
  const headline = truncateToWidth(ctx, content.headline, layout.headline.maxWidth);
  ctx.fillText(headline, centerX, layout.headline.y);

  // --- E. Category / Skill Pills -------------------------------------------
  const pillColors = [
    { bg: "#E0EDFD", text: "#1877F2" }, // Model - Blue
    { bg: "#FEEFE6", text: "#E65100" }, // Fashion - Orange
    { bg: "#F2E7FE", text: "#7C3AED" }, // Commercial - Purple
    { bg: "#E0F6F7", text: "#0891B2" }, // Editorial - Teal
  ];

  ctx.font = `600 ${layout.pills.fontSize}px ${font}`;
  const pillPaddingX = 14;
  const pillGap = 10;
  const pillHeight = layout.pills.height;

  const measuredPills = content.tags.slice(0, 4).map((tag, idx) => {
    const textWidth = ctx.measureText(tag).width;
    return {
      tag,
      width: textWidth + pillPaddingX * 2,
      color: pillColors[idx % pillColors.length],
    };
  });

  const totalPillsWidth =
    measuredPills.reduce((sum, p) => sum + p.width, 0) +
    Math.max(0, measuredPills.length - 1) * pillGap;

  let currentPillX = centerX - totalPillsWidth / 2;
  const pillY = layout.pills.y;

  for (const pill of measuredPills) {
    ctx.fillStyle = pill.color.bg;
    roundedRect(ctx, currentPillX, pillY, pill.width, pillHeight, pillHeight / 2);
    ctx.fill();

    ctx.fillStyle = pill.color.text;
    ctx.textAlign = "center";
    ctx.fillText(
      pill.tag,
      currentPillX + pill.width / 2,
      pillY + pillHeight / 2 + 1,
    );
    currentPillX += pill.width + pillGap;
  }

  // --- F. Stats Bar --------------------------------------------------------
  const statsY = layout.stats.y;
  const items = content.statItems;

  const statsCols = [
    { x: layout.stats.col1X, ...items[0] },
    { x: layout.stats.col2X, ...items[1] },
    { x: layout.stats.col3X, ...items[2] },
    { x: layout.stats.col4X, ...items[3] },
  ];

  for (const col of statsCols) {
    ctx.save();
    ctx.translate(col.x, statsY - 14);
    ctx.scale(1.35, 1.35);
    if (col.icon === "camera") drawCameraIcon(ctx, 0, 0, "#0084FF");
    else if (col.icon === "play") drawPlayIcon(ctx, 0, 0, "#FF6E00");
    else if (col.icon === "briefcase") drawBriefcaseIcon(ctx, 0, 0, "#8B2CF5");
    else if (col.icon === "star") drawStarIcon(ctx, 0, 0, "#FF9500");
    else if (col.icon === "heart") drawHeartIcon(ctx, 0, 0, "#E11D48");
    else if (col.icon === "award") drawAwardIcon(ctx, 0, 0, "#F59E0B");
    else if (col.icon === "calendar") drawCalendarIcon(ctx, 0, 0, "#6366F1");
    else if (col.icon === "eye") drawEyeIcon(ctx, 0, 0, "#0D9488");
    else if (col.icon === "message") drawMessageIcon(ctx, 0, 0, "#0284C7");
    else if (col.icon === "bookmark") drawBookmarkIcon(ctx, 0, 0, "#C026D3");
    else drawStarIcon(ctx, 0, 0, "#FF9500");
    ctx.restore();

    ctx.fillStyle = INK;
    ctx.font = `700 22px ${font}`;
    ctx.textAlign = "center";
    ctx.fillText(col.count, col.x, statsY + 8);

    ctx.fillStyle = MUTED;
    ctx.font = `600 14px ${font}`;
    ctx.fillText(col.label, col.x, statsY + 25);

    ctx.fillStyle = "#64748B";
    ctx.font = `500 11px ${font}`;
    ctx.fillText(col.note ?? "", col.x, statsY + 41);
  }

  // Vertical dividers between stats columns
  ctx.strokeStyle = "#E2E8F0";
  ctx.lineWidth = 1;
  const dividers = [199, 341, 483];
  for (const divX of dividers) {
    ctx.beginPath();
    ctx.moveTo(divX, layout.stats.dividerY1);
    ctx.lineTo(divX, layout.stats.dividerY2);
    ctx.stroke();
  }

  // --- G. Link & QR Code Card ----------------------------------------------
  const panel = layout.panel;
  const panelGradient = ctx.createLinearGradient(
    panel.x,
    panel.y,
    panel.x + panel.width,
    panel.y,
  );
  panelGradient.addColorStop(0, "#0878F9");
  panelGradient.addColorStop(0.48, "#7C18D8");
  panelGradient.addColorStop(0.72, "#E50059");
  panelGradient.addColorStop(1, "#FF9A00");
  ctx.fillStyle = panelGradient;
  roundedRect(ctx, panel.x, panel.y, panel.width, panel.height, panel.radius);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
  ctx.lineWidth = 1;
  roundedRect(ctx, panel.x, panel.y, panel.width, panel.height, panel.radius);
  ctx.stroke();

  // Left text column
  const textX = panel.x + 32;
  const textMaxW = layout.qr.x - textX - 26;

  ctx.textAlign = "left";
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `700 30px ${font}`;
  const handle = content.handle || content.shortUrl;
  ctx.fillText(truncateToWidth(ctx, handle, textMaxW), textX, panel.y + 58);

  ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
  ctx.font = `400 18px ${font}`;
  ctx.fillText(
    truncateToWidth(ctx, "Discover my work, skills and more on RootIn", textMaxW),
    textX,
    panel.y + 84,
  );

  // QR Code box on right
  const qrBoxX = layout.qr.x;
  const qrBoxY = layout.qr.y;
  const qrBoxSize = layout.qr.size;

  if (options.includeQr !== false) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
    roundedRect(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 12);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    ctx.lineWidth = 1.5;
    roundedRect(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 12);
    ctx.stroke();

    const qrInnerPadding = (qrBoxSize - layout.qr.codeSize) / 2;
    drawQr(ctx, content.url, qrBoxX + qrInnerPadding, qrBoxY + qrInnerPadding, layout.qr.codeSize);
  }

  return canvas;
}

/**
 * Renders and exports the share card.
 */
export async function renderShareCard(
  options: ShareCardOptions,
): Promise<ShareCardResult> {
  if (typeof document === "undefined") {  
    throw new Error("Share cards can only be rendered in the browser");
  }

  if (typeof document !== "undefined" && "fonts" in document) {
    try {
      await (document as Document & { fonts: { ready: Promise<unknown> } }).fonts.ready;
    } catch {
      // Font loading is best-effort.
    }
  }

  const origin =
    options.origin ??
    (typeof window !== "undefined" ? window.location.origin : undefined);

  const withPhotoCanvas = await renderShareCardToCanvas({
    ...options,
    origin,
    withPhoto: true,
  });

  const withPhotoCtx = withPhotoCanvas.getContext("2d");
  const tainted = withPhotoCtx ? isCanvasTainted(withPhotoCtx) : false;

  if (!tainted) {
    const blob = await canvasToBlob(withPhotoCanvas);
    const dataUrl = withPhotoCanvas.toDataURL("image/png");
    return {
      blob,
      dataUrl,
      width: withPhotoCanvas.width,
      height: withPhotoCanvas.height,
      photoOmitted: false,
    };
  }

  // The canvas was tainted by a cross-origin image — fall back.
  const fallback = await renderShareCardToCanvas({
    ...options,
    origin,
    withPhoto: false,
  });
  const blob = await canvasToBlob(fallback);
  const dataUrl = fallback.toDataURL("image/png");
  return {
    blob,
    dataUrl,
    width: fallback.width,
    height: fallback.height,
    photoOmitted: true,
  };
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to export the share card"));
    }, "image/png");
  });
}

/** Triggers a browser download for a generated blob. */
export function downloadBlob(blob: Blob, filename: string): void {
  if (!blob || blob.size === 0) {
    throw new Error("The share card is empty and cannot be downloaded");
  }
  if (typeof document === "undefined") return;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Filesystem-safe file name for the downloaded / shared card.
 */
export function shareCardFileName(target: ShareProfileTarget): string {
  const role = target.role === "recruiter" ? "recruiter" : "talent";
  return `rootin-${role}-profile.png`;
}
