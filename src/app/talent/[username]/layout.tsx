import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Talent Profile | RootIn",
  description:
    "RootIn talent profile: portfolio reels, experience timeline, skills, reviews and awards.",
  openGraph: {
    title: "Talent Profile | RootIn",
    description:
      "RootIn talent profile: portfolio reels, experience timeline, skills, reviews and awards.",
    type: "profile",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default async function PublicTalentProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-bg-page">
      <main className="flex-1">{children}</main>
    </div>
  );
}
