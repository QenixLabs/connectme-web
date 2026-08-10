import Link from "next/link";
import { ArrowRight, Building2, UserRound } from "lucide-react";
import logo from "@/assets/rootin-logo-orange.png";

const talent = [
  "Build a professional profile that presents your work properly",
  "Get discovered by recruiters and brands looking for your skills",
  "Find opportunities and campaigns that actually match you",
  "Apply, track applications, complete tasks and grow your network",
];

const recruiters = [
  "Discover relevant talent instead of waiting for applicants",
  "Create opportunities and campaigns in minutes",
  "Review, compare and shortlist candidates side by side",
  "Assign tasks, verify completion and collaborate with your picks",
];

function Panel({
  id,
  tone,
  eyebrow,
  title,
  bullets,
  cta,
}: {
  id: string;
  tone: "cyan" | "gold";
  eyebrow: string;
  title: string;
  bullets: string[];
  cta: string;
}) {
  const isGold = tone === "gold";
  return (
    <div id={id} className="card-surface-landing rounded-[16px] p-6 md:p-8">
      <span
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${
          isGold ? "bg-gold-soft text-gold" : "bg-cyan-soft text-cyan"
        }`}
      >
        {isGold ? <Building2 className="size-3.5" /> : <UserRound className="size-3.5" />}
        {eyebrow}
      </span>

      <h3 className="mt-5 font-display text-2xl font-semibold text-foreground">{title}</h3>

      <ul className="mt-5 space-y-3">
        {bullets.map((b) => (
          <li key={b} className="flex gap-3 text-sm leading-relaxed text-text-secondary">
            <span
              className={`mt-2 size-1.5 shrink-0 rounded-full ${isGold ? "bg-gold" : "bg-cyan"}`}
            />
            {b}
          </li>
        ))}
      </ul>

      <Link
        href={isGold ? "/auth/recruiter/signup" : "/auth/talent/signup"}
        className={`mt-7 inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold transition-all duration-150 ${
          isGold
            ? "btn-gold"
            : "border border-cyan/40 bg-cyan-soft text-cyan hover:border-cyan hover:text-cyan-hover"
        }`}
      >
        {cta} <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}

export function AudienceSplit() {
  return (
    <section className="border-b border-border bg-background py-16 md:py-24">
      <div className="container-page">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
          — Two sides, one platform —
        </p>
        <h2 className="mx-auto mt-4 max-w-2xl text-center font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Built for the people with the skills — and the people who need them
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-text-secondary">
          <img src={logo.src} alt="RootIn" className="inline-block h-[22px] w-auto align-text-bottom" /> connects both sides of the same conversation, so nothing gets lost between
          discovery and delivery.
        </p>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <Panel
            id="for-talent"
            tone="cyan"
            eyebrow="For talent"
            title="Show what you can do — and be found for it"
            bullets={talent}
            cta="Create your profile"
          />
          <Panel
            id="for-recruiters"
            tone="gold"
            eyebrow="For recruiters & brands"
            title="Find, evaluate and work with the right people"
            bullets={recruiters}
            cta="Start a campaign"
          />
        </div>
      </div>
    </section>
  );
}
