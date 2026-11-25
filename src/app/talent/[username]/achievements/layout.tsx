import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Awards & Training | Morporfile",
  description:
    "Explore Morporfile talent awards, nominations, training, workshops, certifications and institutions.",
  openGraph: {
    title: "Awards & Training | Morporfile",
    description:
      "Explore Morporfile talent awards, nominations, training, workshops, certifications and institutions.",
    type: "profile",
  },
};

export default function PublicTalentAchievementsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
