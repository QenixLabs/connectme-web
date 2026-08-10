import type { Metadata } from "next";
import {
  BadgeCheck,
  Bell,
  Briefcase,
  ClipboardCheck,
  Compass,
  Filter,
  Layers,
  ListChecks,
  MessagesSquare,
  Search,
  Sparkles,
  UserRoundSearch,
} from "lucide-react";

import { SiteNav } from "@/components/landing/site-nav";
import { Hero } from "@/components/landing/hero";
import { AudienceSplit } from "@/components/landing/audience-split";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Stats } from "@/components/landing/stats";
import { FeatureGrid, type Feature } from "@/components/landing/feature-grid";
import { ShortlistPreview } from "@/components/landing/shortlist-preview";
import { CtaBand } from "@/components/landing/cta-band";
import { SiteFooter } from "@/components/landing/site-footer";

const title = "RootIn — Connect, collaborate, get in";
const description =
  "RootIn connects professionals with opportunities and lets recruiters discover, shortlist and collaborate with the right talent — from profile to finished project.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

const talentFeatures: Feature[] = [
  {
    icon: Layers,
    title: "Showcase your work",
    copy: "A profile built around projects, skills and proof — not a bare CV.",
  },
  {
    icon: Compass,
    title: "Get discovered",
    copy: "Appear in recruiter searches for the skills you actually have.",
  },
  {
    icon: Sparkles,
    title: "Matched opportunities",
    copy: "See roles and campaigns relevant to your profile, not everything at once.",
  },
  {
    icon: Bell,
    title: "Apply and track",
    copy: "Every application in one list, with its real status attached.",
  },
  {
    icon: ClipboardCheck,
    title: "Complete tasks",
    copy: "Finish the tasks a campaign requires and let the work speak for you.",
  },
  {
    icon: BadgeCheck,
    title: "Build relationships",
    copy: "Stay connected to the brands and recruiters you have worked with.",
  },
];

const recruiterFeatures: Feature[] = [
  {
    icon: UserRoundSearch,
    title: "Discover talent",
    copy: "Search and filter profiles by skill, discipline and proven work.",
  },
  {
    icon: Briefcase,
    title: "Create campaigns",
    copy: "Publish an opportunity or campaign with the requirements you need.",
  },
  {
    icon: Search,
    title: "Review applicants",
    copy: "Applications arrive structured, so evaluation is not an inbox problem.",
  },
  {
    icon: Filter,
    title: "Compare and shortlist",
    copy: "Put candidates next to each other and shortlist with confidence.",
  },
  {
    icon: ListChecks,
    title: "Assign and verify tasks",
    copy: "See exactly who completed what before you commit.",
  },
  {
    icon: MessagesSquare,
    title: "Collaborate",
    copy: "Communicate and manage the work with the people you selected.",
  },
];

export default function MarketingHomePage() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <SiteNav />
      <main>
        <Hero />
        <AudienceSplit />
        <HowItWorks />
        <Stats />
        <FeatureGrid
          eyebrow="Talent toolkit"
          tone="cyan"
          surface="background"
          title="Everything you need to be found and chosen"
          subtitle="Present your work once, then let relevant opportunities come to you."
          features={talentFeatures}
        />
        <FeatureGrid
          eyebrow="Recruiter toolkit"
          tone="gold"
          surface="surface"
          title="From first search to finished collaboration"
          subtitle="Discovery, applications, shortlists, tasks and delivery — one workflow instead of five tools."
          features={recruiterFeatures}
        />
        <ShortlistPreview />
        <CtaBand />
      </main>
      <SiteFooter />
    </div>
  );
}
