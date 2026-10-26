import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Credits | RootIn",
  description: "Explore RootIn talent project credits and production experience.",
  openGraph: {
    title: "Credits | RootIn",
    description: "Explore RootIn talent project credits and production experience.",
    type: "profile",
  },
};

export default function PublicTalentCreditsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
