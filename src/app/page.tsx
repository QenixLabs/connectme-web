import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-page">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 bg-card border-b border-border">
        <Link href="/" className="text-2xl font-bold text-text-primary">
          Connect<span className="text-brand">Me</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/auth/login"
            className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary mb-4 sm:mb-6">
          Verified Talent.
          <span className="text-brand"> Trusted Hiring.</span>
        </h1>
        <p className="text-base sm:text-lg text-text-secondary mb-8 sm:mb-10 max-w-2xl mx-auto">
          ConnectMe replaces broken trust in casting with verified, professional records.
          Hire with confidence. Get hired with credibility.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/talent/signup"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-surface-dark text-on-surface-dark font-medium rounded-lg hover:bg-surface-darker transition-all hover:scale-[1.02]"
          >
            Join as Talent
            <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
          </Link>
          <Link
            href="/auth/recruiter/signup"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-card border-2 border-border text-text-primary font-medium rounded-lg hover:border-border-subtle transition-all hover:scale-[1.02]"
          >
            Join as Recruiter
          </Link>
        </div>

        {/* Stats / Trust indicators */}
        <div className="mt-10 sm:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 max-w-sm sm:max-w-lg mx-auto">
          <StatCard label="Talent Pool" value="Verified" align="center" />
          <StatCard label="Hiring Only" value="Safe" align="center" />
          <StatCard label="By Brands" value="Trusted" align="center" />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center">
        <p className="text-sm text-text-muted">
          © 2026 ConnectMe. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
