import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
        <Link href="/" className="text-2xl font-bold text-slate-900">
          Connect<span className="text-amber-500">Me</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/auth/login"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
          Verified Talent.
          <span className="text-amber-500"> Trusted Hiring.</span>
        </h1>
        <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
          ConnectMe replaces broken trust in casting with verified, professional records.
          Hire with confidence. Get hired with credibility.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/talent/signup"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-all hover:scale-[1.02]"
          >
            Join as Talent
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <Link
            href="/auth/recruiter/signup"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-slate-200 text-slate-900 font-medium rounded-lg hover:border-slate-300 transition-all hover:scale-[1.02]"
          >
            Join as Recruiter
          </Link>
        </div>

        {/* Stats / Trust indicators */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
          <div>
            <div className="text-2xl font-bold text-slate-900">Verified</div>
            <div className="text-sm text-slate-500">Talent Pool</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">Safe</div>
            <div className="text-sm text-slate-500">Hiring Only</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">Trusted</div>
            <div className="text-sm text-slate-500">By Brands</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 text-center">
        <p className="text-sm text-slate-500">
          © 2026 ConnectMe. All rights reserved.
        </p>
      </footer>
    </div>
  );
}