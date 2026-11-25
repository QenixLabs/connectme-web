import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plans & Pricing Â· Morporfile",
  description:
    "Hire the best creative talent and pay only for what you need. Free, Pro and Business plans with no hidden fees.",
  openGraph: {
    title: "Plans & Pricing Â· Morporfile",
    description:
      "Free, Pro and Business plans for hiring creative talent. No hidden fees, cancel anytime.",
    type: "website",
  },
  twitter: { card: "summary" },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
