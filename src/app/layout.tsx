import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthStoreProvider } from "@/providers/auth-store-provider";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
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
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          <AuthStoreProvider>
            <QueryProvider>
              <TooltipProvider>
                {children}
                <Toaster position="top-right" richColors />
              </TooltipProvider>
            </QueryProvider>
          </AuthStoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
