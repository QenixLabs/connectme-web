import type { Metadata } from "next";
import Image from "next/image";
import type { ComponentType } from "react";
import { Building2, Star, Users } from "lucide-react";
import logo from "@/assets/rootin-logo-orange.png";

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

export default function MarketingHomePage() {
  return (
    <main className="relative flex h-screen w-full flex-col overflow-hidden bg-black text-white">
      <Image
        src="/hero-bg.png"
        alt="RootIn background"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/80" />

      <div className="relative z-10 flex flex-1 flex-col justify-between px-6 py-10">
        <div>
          <Image src={logo} alt="RootIn" className="h-16 w-auto" priority />
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80">
            Connect • Collaborate • Get in
          </p>
        </div>

        <div className="max-w-md">
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            The Professional Network for Entertainment & Creative Industry
          </h1>
          <p className="mt-4 text-base leading-relaxed text-white/80">
            Join verified talent, recruiters, companies and mentors to create endless opportunities.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Stat icon={Users} value="500K+" label="Verified Talent" />
          <Stat icon={Building2} value="10K+" label="Companies" />
          <Stat icon={Star} value="50K+" label="Opportunities" />
        </div>
      </div>
    </main>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: ComponentType<{ className?: string }>;
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <Icon className="mb-2 h-6 w-6 text-blue-400" />
      <span className="text-lg font-bold">{value}</span>
      <span className="text-[10px] uppercase tracking-wide text-white/70">
        {label}
      </span>
    </div>
  );
}
