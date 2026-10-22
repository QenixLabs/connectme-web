/**
 * Public site origin resolution.
 *
 * Every shared link and every social preview has to point at the publicly
 * reachable application origin. It must never be:
 *
 * - a development machine (`localhost`, `127.0.0.1`, a private LAN address);
 * - the internal API host;
 * - a deep link that belongs to another surface (a portfolio item, a tab).
 *
 * The origin comes from `NEXT_PUBLIC_SITE_URL`, following the same
 * `NEXT_PUBLIC_` convention the app already uses for `NEXT_PUBLIC_API_URL` and
 * `NEXT_PUBLIC_SOCKET_URL`. It is inlined at build time, which is exactly what
 * a public share link needs.
 */

/** Environment variable holding the public application origin. */
export const SITE_URL_ENV_VAR = "NEXT_PUBLIC_SITE_URL";

const LOOPBACK_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "::",
]);

/** Strips the brackets of an IPv6 literal and lowercases the host. */
function normalizeHostname(hostname: string): string {
  return hostname.trim().toLowerCase().replace(/^\[/, "").replace(/\]$/, "");
}

/** True for hosts that only ever resolve inside the machine or the network. */
export function isLoopbackHostname(hostname: string): boolean {
  const host = normalizeHostname(hostname);
  if (!host) return true;
  if (LOOPBACK_HOSTNAMES.has(host)) return true;
  if (host.endsWith(".localhost")) return true;
  if (/^127(?:\.\d{1,3}){3}$/.test(host)) return true;
  return false;
}

/** True for private, link-local or otherwise non-routable hosts. */
export function isPrivateHostname(hostname: string): boolean {
  const host = normalizeHostname(hostname);
  if (!host) return true;
  if (host.endsWith(".local") || host.endsWith(".internal") || host.endsWith(".lan")) {
    return true;
  }
  if (/^10(?:\.\d{1,3}){3}$/.test(host)) return true;
  if (/^192\.168(?:\.\d{1,3}){2}$/.test(host)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])(?:\.\d{1,3}){2}$/.test(host)) return true;
  if (/^169\.254(?:\.\d{1,3}){2}$/.test(host)) return true;
  if (host.startsWith("fd") && host.includes(":")) return true;
  return false;
}

/**
 * Normalizes an origin to `scheme://host` without a trailing slash.
 *
 * Returns an empty string when the value is not a usable http(s) origin, so
 * callers never concatenate a broken URL.
 */
export function normalizeOrigin(origin?: string | null): string {
  const candidate = (origin ?? "").trim();
  if (!candidate) return "";

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return "";
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") return "";
  if (!url.hostname) return "";

  return `${url.protocol}//${url.host}`;
}

/** True when the origin resolves on the public internet. */
export function isPubliclyReachableOrigin(origin?: string | null): boolean {
  const normalized = normalizeOrigin(origin);
  if (!normalized) return false;

  let hostname: string;
  try {
    hostname = new URL(normalized).hostname;
  } catch {
    return false;
  }

  return !isLoopbackHostname(hostname) && !isPrivateHostname(hostname);
}

/** True when the origin points at the local machine or a private network. */
export function isLocalOrigin(origin?: string | null): boolean {
  const normalized = normalizeOrigin(origin);
  if (!normalized) return true;

  let hostname: string;
  try {
    hostname = new URL(normalized).hostname;
  } catch {
    return true;
  }

  return isLoopbackHostname(hostname) || isPrivateHostname(hostname);
}

export interface SiteOriginOptions {
  /** Value of `NEXT_PUBLIC_SITE_URL`. */
  configured?: string | null;
  /** `window.location.origin`, when a browser is available. */
  windowOrigin?: string | null;
  /** `process.env.NODE_ENV`. */
  nodeEnv?: string;
}

/**
 * Resolves the origin that shared links must use.
 *
 * - The configured site URL always wins — that is how a local build shares the
 *   real public domain.
 * - The origin the app is currently served from is the fallback, which is the
 *   public domain in staging and production.
 * - A local origin is only accepted outside production. A production build
 *   served from a local address is a misconfiguration, and sharing it would
 *   hand out a dead link.
 *
 * Returns an empty string when no usable origin exists.
 */
export function resolveSiteOrigin(options: SiteOriginOptions = {}): string {
  const { configured, windowOrigin, nodeEnv } = options;
  const isProduction = nodeEnv === "production";

  const configuredOrigin = normalizeOrigin(configured);
  if (configuredOrigin && isPubliclyReachableOrigin(configuredOrigin)) {
    return configuredOrigin;
  }

  const fallback = normalizeOrigin(windowOrigin);
  if (fallback) {
    if (isPubliclyReachableOrigin(fallback)) return fallback;
    if (!isProduction) return fallback;
  }

  return "";
}

/** Reads the configured site origin from the environment. */
export function getConfiguredSiteOrigin(): string {
  return normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL);
}

/**
 * Resolves the site origin for the current runtime.
 *
 * On the server there is no window, so only the configured value can be used.
 */
export function getSiteOrigin(): string {
  const windowOrigin =
    typeof window !== "undefined" ? window.location.origin : undefined;

  return resolveSiteOrigin({
    configured: process.env.NEXT_PUBLIC_SITE_URL,
    windowOrigin,
    nodeEnv: process.env.NODE_ENV,
  });
}
