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
};

export default nextConfig;
