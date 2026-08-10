import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthStoreProvider } from "@/providers/auth-store-provider";
import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
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
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="min-h-screen antialiased">
        <AuthStoreProvider>
          <QueryProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </QueryProvider>
        </AuthStoreProvider>
      </body>
    </html>
  );
}
