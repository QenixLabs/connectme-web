import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio - Morporfiil Talent Platform",
  description:
    "Explore a talent's complete body of work: photo and video portfolio pieces, filterable by media type, category, project and year.",
  openGraph: {
    title: "Portfolio - Morporfiil Talent Platform",
    description: "Browse the talent's full portfolio of images and video reels on Morporfiil.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
