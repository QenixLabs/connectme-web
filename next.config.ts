import type { NextConfig } from "next";

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL;

if (!configuredApiUrl && process.env.NODE_ENV === "production") {
  throw new Error("NEXT_PUBLIC_API_URL is required in production");
}

const API_URL = configuredApiUrl || "http://localhost:3001/api/v1";

let backendPattern:
  | { protocol: "http" | "https"; hostname: string; port?: string; pathname: string }
  | undefined;

try {
  const parsed = new URL(API_URL);
  const apiPath = parsed.pathname.replace(/\/+$/, "");
  backendPattern = {
    protocol: parsed.protocol.replace(":", "") as "http" | "https",
    hostname: parsed.hostname,
    port: parsed.port || undefined,
    pathname: `${apiPath}/files/access`,
  };
} catch {
  backendPattern = undefined;
}

const nextConfig: NextConfig = {
  images: {
    unoptimized: process.env.NODE_ENV === "development",
    remotePatterns: [
      ...(backendPattern ? [backendPattern] : []),
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "images.pexels.com" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/talent/profile/experience",
        destination: "/talent/profile/credits",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      // Only emitted by production builds. Browsers ignore HSTS over plain
      // HTTP, so local `next start` checks are unaffected.
      ...(process.env.NODE_ENV === "production"
        ? [
            {
              source: "/:path*",
              headers: [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=31536000",
                },
              ],
            },
          ]
        : []),
      {
        // Always revalidate the worker so a deployment can publish a new
        // version immediately. The worker is served from the origin root.
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        // Let browsers pick up manifest edits on the next visit.
        source: "/manifest.webmanifest",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
