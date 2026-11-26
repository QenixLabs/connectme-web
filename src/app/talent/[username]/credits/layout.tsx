import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Credits | Morporfiil",
  description: "Explore Morporfiil talent project credits and production experience.",
  openGraph: {
    title: "Credits | Morporfiil",
    description: "Explore Morporfiil talent project credits and production experience.",
    type: "profile",
  },
};

export default function PublicTalentCreditsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
