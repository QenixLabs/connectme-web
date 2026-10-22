/**
 * Branded "profile card" image generation.
 *
 * The card is rendered entirely on the client with the Canvas 2D API so a
 * profile can be shared as a picture — the only way to post to Instagram.
 *
 * Everything degrades gracefully: a missing photo falls back to initials, a
 * cross-origin image that cannot be embedded falls back to a photo-less card,
 * and the QR code is optional.
 *
 * The layout is described by {@link SHARE_CARD_LAYOUT} so the geometry can be
 * asserted in tests without a DOM — every element has to stay inside the
 * canvas and inside the safe margins.
 */

import qrcode from "qrcode-generator";

import {
  SHARE_BRAND,
  buildCanonicalProfileUrl,
  type ShareProfileTarget,
} from "@/lib/share";

export const SHARE_CARD_WIDTH = 1080;
export const SHARE_CARD_HEIGHT = 1350;

/** Nothing may be drawn outside this margin. */
export const SHARE_CARD_SAFE_MARGIN = 48;

/**
 * The geometry of the card.
 *
 * Vertical rhythm (top to bottom): header, portrait, name, profession,
 * verification badge, call to action, link panel with the QR code, footer.
 */
export const SHARE_CARD_LAYOUT = {
  header: {
    markX: 112,
    markY: 112,
    markRadius: 24,
    brandX: 152,
    brandSize: 46,
    labelSize: 22,
    labelRight: SHARE_CARD_WIDTH - 80,
  },
  portrait: {
    centerX: SHARE_CARD_WIDTH / 2,
    centerY: 400,
    radius: 180,
    ringWidth: 12,
    ringGap: 18,
  },
  name: {
    y: 680,
    fontSize: 76,
    maxWidth: SHARE_CARD_WIDTH - 180,
  },
  headline: {
    y: 756,
    fontSize: 38,
    maxWidth: SHARE_CARD_WIDTH - 220,
  },
  badge: {
    y: 798,
    height: 62,
    fontSize: 30,
  },
  cta: {
    y: 888,
    height: 70,
    fontSize: 30,
    label: "Discover the portfolio",
  },
  panel: {
    x: 80,
    y: 980,
    width: SHARE_CARD_WIDTH - 160,
    height: 250,
    radius: 44,
    /** Vertical offsets of the three text rows inside the panel. */
    handleOffset: 78,
    linkOffset: 126,
    ctaOffset: 172,
  },
  qr: {
    size: 176,
  },
  footer: {
    x: 80,
    right: SHARE_CARD_WIDTH - 80,
    y: 1284,
    fontSize: 26,
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
  /** Short, human friendly link label, e.g. `rootin.app/talent/asha-rao`. */
  shortUrl: string;
  /** The handle shown in the link panel, e.g. `@asha-rao`. */
  handle: string;
  isVerified: boolean;
}

/**
 * The textual content of the share card.
 *
 * Kept separate from the canvas rendering so it can be asserted in tests
 * without a DOM.
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
  };
}

/**
 * Short label for a canonical URL, e.g. `rootin.app/talent/asha-rao`.
 *
 * The raw URL is never printed on the card — it is long, it wraps badly and
 * it is unreadable at phone size.
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

const BRAND_PURPLE = "#6428F5";
const BRAND_PINK = "#E84AAB";
const INK = "#12143A";
const MUTED = "#62678A";
const BORDER = "#E7E5F4";

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
  if (typeof document === "undefined") return "Rubik, system-ui, sans-serif";
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue("--font-rubik")
    .trim();
  return value ? `${value}, system-ui, sans-serif` : "Rubik, system-ui, sans-serif";
}

interface LoadedImage {
  image: HTMLImageElement;
  /** True when the image was loaded without CORS and taints the canvas. */
  tainted: boolean;
}

/**
 * Loads an image for canvas drawing.
 *
 * Tries a CORS-enabled load first; if the server does not send CORS headers
 * the load fails and we retry without CORS. A non-CORS image taints the
 * canvas, which is detected later when the export is attempted.
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
 *
 * Returns a square boolean matrix plus the module count, or `null` when the
 * payload cannot be encoded.
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
 * Draws a QR code with a quiet zone.
 *
 * The white plate behind the modules is the quiet zone — it keeps the symbol
 * readable when it sits on the light card surface.
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

  const quiet = 2;
  const total = matrix.count + quiet * 2;
  const cell = size / total;

  ctx.fillStyle = "#FFFFFF";
  roundedRect(ctx, x, y, size, size, 24);
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
      // A non-CORS image taints the canvas; the caller re-renders without it.
      return !loaded.tainted;
    }
  }

  // Initials fallback.
  const gradient = ctx.createLinearGradient(
    centerX - radius,
    centerY - radius,
    centerX + radius,
    centerY + radius,
  );
  gradient.addColorStop(0, "#F1EAFF");
  gradient.addColorStop(1, "#FFE3F0");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = BRAND_PURPLE;
  ctx.font = `700 ${Math.round(radius * 0.78)}px ${resolveFontFamily()}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(initials, centerX, centerY + radius * 0.04);
  return true;
}

/**
 * Detects a tainted canvas.
 *
 * Reading a single pixel throws a `SecurityError` as soon as a cross-origin
 * image has been drawn, which is far more reliable than waiting for the
 * export to fail.
 */
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
 *
 * `withPhoto` is a parameter so the export can be retried without the photo
 * when a cross-origin image tainted the canvas.
 */
export async function renderShareCardToCanvas(
  options: ShareCardOptions & { withPhoto: boolean },
): Promise<HTMLCanvasElement> {
  const { target, withPhoto } = options;
  const content = buildShareCardContent(options);
  const brand = content.brand;
  const url = content.url;
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

  // Background — soft lavender wash matching the app theme.
  const background = ctx.createLinearGradient(0, 0, SHARE_CARD_WIDTH, SHARE_CARD_HEIGHT);
  background.addColorStop(0, "#F6F1FF");
  background.addColorStop(0.52, "#FFFFFF");
  background.addColorStop(1, "#FFF2F7");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, SHARE_CARD_WIDTH, SHARE_CARD_HEIGHT);

  // Decorative blobs.
  const blob = (x: number, y: number, r: number, color: string) => {
    const radial = ctx.createRadialGradient(x, y, 0, x, y, r);
    radial.addColorStop(0, color);
    radial.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = radial;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  };
  blob(120, 140, 320, "rgba(217,199,255,0.5)");
  blob(980, 1180, 340, "rgba(255,217,232,0.45)");

  // --- Header: brand mark, brand name and the "talent profile" label -----
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  const brandGradient = ctx.createLinearGradient(
    layout.header.markX - layout.header.markRadius,
    layout.header.markY - layout.header.markRadius,
    layout.header.markX + layout.header.markRadius,
    layout.header.markY + layout.header.markRadius,
  );
  brandGradient.addColorStop(0, BRAND_PURPLE);
  brandGradient.addColorStop(1, BRAND_PINK);
  ctx.fillStyle = brandGradient;
  ctx.beginPath();
  ctx.arc(
    layout.header.markX,
    layout.header.markY,
    layout.header.markRadius,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  ctx.fillStyle = INK;
  ctx.font = `700 ${layout.header.brandSize}px ${font}`;
  ctx.fillText(brand, layout.header.brandX, layout.header.markY + 2);

  const label = "TALENT PROFILE";
  ctx.font = `700 ${layout.header.labelSize}px ${font}`;
  const labelWidth = ctx.measureText(label).width;
  const labelPaddingX = 22;
  const labelHeight = 42;
  const labelX = layout.header.labelRight - labelWidth - labelPaddingX * 2;
  const labelY = layout.header.markY - labelHeight / 2;

  ctx.fillStyle = "rgba(100, 40, 245, 0.08)";
  roundedRect(ctx, labelX, labelY, labelWidth + labelPaddingX * 2, labelHeight, 21);
  ctx.fill();
  ctx.strokeStyle = "rgba(100, 40, 245, 0.16)";
  ctx.lineWidth = 2;
  roundedRect(ctx, labelX, labelY, labelWidth + labelPaddingX * 2, labelHeight, 21);
  ctx.stroke();

  ctx.fillStyle = BRAND_PURPLE;
  ctx.textAlign = "center";
  ctx.fillText(label, labelX + labelWidth / 2 + labelPaddingX, labelY + labelHeight / 2 + 1);

  // --- Portrait ------------------------------------------------------------
  const { centerX, centerY, radius, ringWidth, ringGap } = layout.portrait;
  const ringRadius = radius + ringGap;

  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.arc(centerX, centerY, ringRadius + 7, 0, Math.PI * 2);
  ctx.stroke();

  const ring = ctx.createLinearGradient(
    centerX - ringRadius,
    centerY - ringRadius,
    centerX + ringRadius,
    centerY + ringRadius,
  );
  ring.addColorStop(0, BRAND_PURPLE);
  ring.addColorStop(1, BRAND_PINK);
  ctx.strokeStyle = ring;
  ctx.lineWidth = ringWidth;
  ctx.beginPath();
  ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
  ctx.stroke();

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

  // --- Name and profession -------------------------------------------------
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = INK;
  ctx.font = `700 ${layout.name.fontSize}px ${font}`;
  const name = truncateToWidth(ctx, content.name, layout.name.maxWidth);
  ctx.fillText(name, centerX, layout.name.y);

  ctx.fillStyle = MUTED;
  ctx.font = `500 ${layout.headline.fontSize}px ${font}`;
  const headline = truncateToWidth(
    ctx,
    content.headline,
    layout.headline.maxWidth,
  );
  ctx.fillText(headline, centerX, layout.headline.y);

  // --- Verification badge (only for verified profiles) ----------------------
  if (content.isVerified) {
    const badgeText = `Verified on ${brand}`;
    ctx.font = `600 ${layout.badge.fontSize}px ${font}`;
    const textWidth = ctx.measureText(badgeText).width;
    const badgeWidth = textWidth + 92;
    const badgeX = centerX - badgeWidth / 2;
    const badgeY = layout.badge.y;

    ctx.fillStyle = "rgba(35,121,239,0.10)";
    roundedRect(ctx, badgeX, badgeY, badgeWidth, layout.badge.height, 31);
    ctx.fill();
    ctx.strokeStyle = "rgba(35,121,239,0.32)";
    ctx.lineWidth = 2;
    roundedRect(ctx, badgeX, badgeY, badgeWidth, layout.badge.height, 31);
    ctx.stroke();

    const badgeIconX = badgeX + 34;
    const badgeIconY = badgeY + layout.badge.height / 2;
    ctx.fillStyle = "#2379EF";
    ctx.beginPath();
    ctx.arc(badgeIconX, badgeIconY, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(badgeIconX - 6, badgeIconY);
    ctx.lineTo(badgeIconX - 1, badgeIconY + 5);
    ctx.lineTo(badgeIconX + 7, badgeIconY - 6);
    ctx.stroke();

    ctx.fillStyle = "#1B5FCB";
    ctx.textAlign = "left";
    ctx.fillText(badgeText, badgeIconX + 26, badgeIconY + 1);
    ctx.textAlign = "center";
  }

  // --- Call to action ------------------------------------------------------
  const ctaGradient = ctx.createLinearGradient(
    centerX - 220,
    layout.cta.y,
    centerX + 220,
    layout.cta.y + layout.cta.height,
  );
  ctaGradient.addColorStop(0, BRAND_PURPLE);
  ctaGradient.addColorStop(1, BRAND_PINK);

  ctx.font = `600 ${layout.cta.fontSize}px ${font}`;
  const ctaTextWidth = ctx.measureText(layout.cta.label).width;
  const ctaWidth = ctaTextWidth + 88;
  const ctaX = centerX - ctaWidth / 2;

  ctx.fillStyle = ctaGradient;
  roundedRect(ctx, ctaX, layout.cta.y, ctaWidth, layout.cta.height, 35);
  ctx.fill();

  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.fillText(layout.cta.label, centerX, layout.cta.y + layout.cta.height / 2 + 1);

  // --- Link panel: short label and the QR code -----------------------------
  const panel = layout.panel;
  ctx.fillStyle = "#FFFFFF";
  roundedRect(ctx, panel.x, panel.y, panel.width, panel.height, panel.radius);
  ctx.fill();
  ctx.strokeStyle = BORDER;
  ctx.lineWidth = 3;
  roundedRect(ctx, panel.x, panel.y, panel.width, panel.height, panel.radius);
  ctx.stroke();

  const textX = panel.x + 48;
  const textMaxWidth = panel.width - 48 * 2 - layout.qr.size - 32;

  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = INK;
  ctx.font = `700 36px ${font}`;
  const handle = content.handle || content.shortUrl;
  ctx.fillText(
    truncateToWidth(ctx, handle, textMaxWidth),
    textX,
    panel.y + panel.handleOffset,
  );

  ctx.fillStyle = MUTED;
  ctx.font = `500 26px ${font}`;
  ctx.fillText(
    truncateToWidth(ctx, content.shortUrl, textMaxWidth),
    textX,
    panel.y + panel.linkOffset,
  );

  ctx.fillStyle = BRAND_PURPLE;
  ctx.font = `600 24px ${font}`;
  ctx.fillText(
    truncateToWidth(ctx, layout.cta.label, textMaxWidth),
    textX,
    panel.y + panel.ctaOffset,
  );

  if (options.includeQr !== false) {
    const qrX = panel.x + panel.width - 40 - layout.qr.size;
    const qrY = panel.y + (panel.height - layout.qr.size) / 2;
    drawQr(ctx, url, qrX, qrY, layout.qr.size);
  }

  // --- Footer --------------------------------------------------------------
  ctx.fillStyle = BRAND_PURPLE;
  ctx.font = `700 26px ${font}`;
  ctx.textAlign = "left";
  ctx.fillText(brand, layout.footer.x, layout.footer.y);

  ctx.fillStyle = MUTED;
  ctx.font = `500 ${layout.footer.fontSize}px ${font}`;
  ctx.textAlign = "right";
  ctx.fillText(layout.footer.tagline, layout.footer.right, layout.footer.y);

  return canvas;
}

/**
 * Renders and exports the share card.
 *
 * If a cross-origin photo taints the canvas the card is re-rendered without
 * the photo, so the download always succeeds.
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
 *
 * The name is the same for every profile of a role so the shared attachment
 * reads like a RootIn card instead of exposing a slug.
 */
export function shareCardFileName(target: ShareProfileTarget): string {
  const role = target.role === "recruiter" ? "recruiter" : "talent";
  return `rootin-${role}-profile.png`;
}
