import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
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

export const metadata: Metadata = {
  title: "RootIn – Talent Platform",
  description:
    "RootIn connects verified talent with recruiters: portfolios, campaigns, messaging and opportunities in one platform.",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${rubik.variable}`}
      data-theme="light"
      suppressHydrationWarning
    >
      <head>
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
      </head>
      <body className="min-h-screen antialiased">
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
