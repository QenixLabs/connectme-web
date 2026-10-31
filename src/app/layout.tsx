import type { Metadata, Viewport } from "next";
import { Caveat, Rubik } from "next/font/google";
import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";
import { TooltipProvider } from "@/components/ui/tooltip";
import { resolveSiteOrigin } from "@/lib/site";
import { AuthStoreProvider } from "@/providers/auth-store-provider";
import { QueryProvider } from "@/providers/query-provider";
import { SocketProvider } from "@/providers/socket-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";
import "./globals.css";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const caveat = Caveat({
  variable: "--font-script",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

/**
 * The public origin of the application.
 *
 * It is used as the `metadataBase` so every relative social preview URL
 * resolves to an absolute, publicly reachable address.
 */
const siteOrigin = resolveSiteOrigin({
  configured: process.env.NEXT_PUBLIC_SITE_URL,
});

export const metadata: Metadata = {
  metadataBase: siteOrigin ? new URL(siteOrigin) : undefined,
  applicationName: "RootIn",
  title: "RootIn – Talent Platform",
  description:
    "RootIn connects verified talent with recruiters: portfolios, campaigns, messaging and opportunities in one platform.",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    title: "RootIn",
    statusBarStyle: "black-translucent",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "mobile-web-app-capable": "yes",
  },
  openGraph: {
    title: "RootIn – Talent Platform",
    description:
      "RootIn connects verified talent with recruiters: portfolios, campaigns, messaging and opportunities in one platform.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  themeColor: "#1A5BDB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${rubik.variable} ${caveat.variable}`}
      data-theme="light"
      suppressHydrationWarning
    >
      <head />
      <body className="min-h-screen antialiased">
        <ServiceWorkerRegistration />
        {/**
         * Password-manager / form-filling browser extensions sometimes inject an
         * `fdprocessedid` attribute into buttons and inputs before React hydrates,
         * causing a hydration mismatch. This script strips the attribute (and
         * watches for late injections) before hydration starts.
         */}
        <Script
          id="strip-fdprocessedid"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                var ATTR = 'fdprocessedid';
                function strip(el){ if(el && el.removeAttribute) el.removeAttribute(ATTR); }
                function walk(root){ if(root && root.querySelectorAll) root.querySelectorAll('['+ATTR+']').forEach(strip); }
                walk(document);
                if(typeof MutationObserver !== 'undefined'){
                  new MutationObserver(function(mutations){
                    mutations.forEach(function(mutation){
                      if(mutation.type === 'attributes'){
                        strip(mutation.target);
                      } else if(mutation.type === 'childList'){
                        mutation.addedNodes.forEach(function(node){
                          if(node.nodeType === 1){
                            strip(node);
                            walk(node);
                          }
                        });
                      }
                    });
                  }).observe(document.documentElement, { attributes: true, attributeFilter: [ATTR], childList: true, subtree: true });
                }
              })();
            `,
          }}
        />
        <ThemeProvider>
          <AuthStoreProvider>
            <SocketProvider>
              <QueryProvider>
                <TooltipProvider>
                  {children}
                  <Toaster position="top-right" richColors />
                </TooltipProvider>
              </QueryProvider>
            </SocketProvider>
          </AuthStoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
