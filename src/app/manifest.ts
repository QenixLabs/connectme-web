import type { MetadataRoute } from "next";

/**
 * Web app manifest for browser-native installation.
 *
 * Next.js exposes this route at `/manifest.webmanifest` and automatically adds
 * the `<link rel="manifest">` tag to the document. Keep the icon files in
 * `public/icons` in sync with the sizes declared here.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "RootIn – Talent Platform",
    short_name: "RootIn",
    description:
      "RootIn connects verified talent with recruiters: portfolios, campaigns, messaging and opportunities in one platform.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#00060C",
    theme_color: "#1A5BDB",
    lang: "en",
    dir: "ltr",
    categories: ["business", "productivity"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
