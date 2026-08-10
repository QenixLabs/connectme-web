import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import logo from "@/assets/rootin-logo-orange.png";
import { NetworkVisual } from "./network-visual";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden border-b border-border bg-surface">
      <div
        className="pointer-events-none absolute -left-40 top-0 size-[520px] rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(245,169,0,0.12), transparent 65%)" }}
        aria-hidden="true"
      />
      <div className="container-page relative grid items-center gap-12 py-16 md:py-24 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-text-secondary">
            <Sparkles className="size-3.5 text-gold" />
            Talent and opportunities, on one platform
          </span>

          <h1 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl lg:text-[3.4rem]">
            The right talent,{" "}
            <span className="bg-[image:var(--gradient-gold)] bg-clip-text text-transparent">
              connected
            </span>{" "}
            to the right opportunity.
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-text-secondary">
            <img src={logo.src} alt="RootIn" className="inline-block h-[22px] w-auto align-text-bottom" /> is where professionals showcase their work and discover opportunities, and where
            recruiters and brands discover, evaluate, shortlist and collaborate with the people they
            need — from profile to finished project.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/auth/talent/signup"
              className="btn-gold inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold"
            >
              Join as talent <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/auth/recruiter/signup"
              className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-card px-6 text-sm font-semibold text-foreground transition-colors duration-150 hover:border-border-hover"
            >
              Hire talent
            </Link>
          </div>

          <p className="mt-6 flex items-center gap-2 text-xs text-text-muted">
            <span className="size-1.5 rounded-full bg-success" />
            One profile. Verified tasks. Real collaboration — not just applications into a void.
          </p>
        </div>

        <NetworkVisual />
      </div>
    </section>
  );
}
