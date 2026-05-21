import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PopupProvider } from "@/providers/popup-provider";
import { SocketProvider } from "@/providers/socket-provider";
import { AuthStoreProvider } from "@/providers/auth-store-provider";
import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ConnectMe - Verified Talent Platform",
  description:
    "ConnectMe is a verification-first talent operating system for casting and influencer ecosystems",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthStoreProvider>
          <SocketProvider>
            <QueryProvider>
              {children}
              <PopupProvider />
            </QueryProvider>
          </SocketProvider>
        </AuthStoreProvider>
      </body>
    </html>
  );
}
