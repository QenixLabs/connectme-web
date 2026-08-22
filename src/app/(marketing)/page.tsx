import type { Metadata } from "next";
import Image from "next/image";
import { Users, Briefcase, Star, type LucideIcon } from "lucide-react";
import { RootInLogo } from "@/components/RootInLogo";
import Link from "next/link";
const title = "RootIn — Network for Entertainment & Creative Talent";
const description =
  "RootIn connects verified talent, recruiters, companies and mentors across the entertainment and creative industry.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
  },
};

const stats = [
  { icon: Users, value: "500K+", label: "Verified Talent", color: "text-blue" },
  { icon: Briefcase, value: "10K+", label: "Companies", color: "text-blue" },
  { icon: Star, value: "50K+", label: "Opportunities", color: "text-gold" },
];

export default function MarketingHomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <Image
        src="/hero-bg.png"
        alt="A director's chair and lit studio spotlight on a dark film set"
        fill
        priority
        className="absolute inset-0 h-full w-full object-cover"
        sizes="100vw"
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#00060C]/80 via-[#00060C]/60 to-[#00060C]/90" />
      <div className="pointer-events-none absolute inset-0 bg-black/40" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col text-white animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="px-6 pt-10">
          <RootInLogo />
        </header>

        <section className="px-6">
          <h1 className="font-display text-[1.65rem] font-bold leading-[1.2] tracking-tight text-white drop-shadow-sm">
            The Professional Network
            <br />
            for Entertainment
            <br />& Creative Industry
          </h1>
          <p className="mt-4 max-w-[22rem] text-sm leading-relaxed text-white/90 drop-shadow-sm">
            Join verified talent, recruiters, companies and mentors to create endless
            opportunities.
          </p>
          <Link
  href="/auth"
  className="mt-5 inline-flex items-center justify-center rounded-full bg-blue px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-blue/90 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue focus:ring-offset-2 focus:ring-offset-[#00060C]"
>
  Join Our Network
</Link>
        </section>

        <div className="flex-1" />

        <section className="grid grid-cols-3 gap-4 px-6 pb-12 pt-2 text-center">
          {stats.map(({ icon: Icon, value, label, color }) => (
            <Stat
              key={label}
              icon={Icon}
              value={value}
              label={label}
              color={color}
            />
          ))}
        </section>
      </div>
    </main>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: LucideIcon;
  value: string;
  label: string;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl bg-black/40 p-3 backdrop-blur-sm">
      <Icon className={`h-6 w-6 ${color}`} strokeWidth={1.75} aria-hidden="true" />
      <p className="mt-3 font-display text-xl font-bold text-white drop-shadow-sm">
        {value}
      </p>
      <p className="mt-1 text-[0.7rem] text-white/80">{label}</p>
    </div>
  );
}
