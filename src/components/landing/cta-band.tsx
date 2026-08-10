import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CtaBand() {
  return (
    <section id="cta" className="bg-background py-16 md:py-24">
      <div className="container-page">
        <div className="rounded-[20px] border border-border bg-elevated px-6 py-12 text-center shadow-[var(--glow-gold)] md:px-12">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Start where you are — <span className="text-gold">talent or hiring</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-text-secondary">
            Create one profile to be discovered, or open your first campaign and start reviewing the
            right people today.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
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
        </div>
      </div>
    </section>
  );
}
