import type { NextConfig } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

let backendPattern:
  | { protocol: "http" | "https"; hostname: string; port?: string; pathname: string }
  | undefined;

try {
  const parsed = new URL(API_URL);
  backendPattern = {
    protocol: parsed.protocol.replace(":", "") as "http" | "https",
    hostname: parsed.hostname,
    port: parsed.port || undefined,
    pathname: "/api/v1/files/access/**",
  };
} catch {
  backendPattern = undefined;
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      ...(backendPattern ? [backendPattern] : []),
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
};

export default nextConfig;
