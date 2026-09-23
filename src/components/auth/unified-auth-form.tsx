"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { ArrowRight, BriefcaseBusiness, Search, Users } from "lucide-react";
import Link from "next/link";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Card, CardContent } from "@/components/ui/card";
import { SignInForm } from "@/components/auth/signin-form";
import { SignupWizard } from "@/components/auth/signup-wizard";
import { RootInLogo } from "@/components/RootInLogo";

type Mode = "signin" | "signup";

function UnifiedAuthContent() {
  const searchParams = useSearchParams();
  const initialMode = (searchParams.get("mode") === "signup" ? "signup" : "signin") as Mode;
  const roleParam = searchParams.get("role");
  const roleLocked = roleParam === "recruiter" || roleParam === "talent";
  const initialRole = roleParam === "recruiter" ? "recruiter" : "talent";
  const recruiterSignup = initialMode === "signup" && initialRole === "recruiter";

  if (initialMode === "signin") {
    return (
      <main className="onboarding-theme relative min-h-dvh overflow-hidden bg-[#F8FAFF] text-[#080B2B]">
        <div className="pointer-events-none absolute -left-32 top-0 size-[22rem] rounded-full bg-[#EDEBFF]/70 blur-3xl" />
        <div className="pointer-events-none absolute -right-40 bottom-0 size-[24rem] rounded-full bg-[#EAF4FF]/80 blur-3xl" />
        <div className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-[18px] py-5 sm:px-6 sm:py-7">
          <header className="flex items-center">
            <Link href="/" aria-label="RootIn home" className="w-[104px]">
              <RootInLogo />
            </Link>
          </header>
          <div className="flex flex-1 flex-col justify-start py-4 sm:py-6">
            <SignInForm />
          </div>
        </div>
      </main>
    );
  }

  return (
    <AuthLayout showGlow wide={recruiterSignup}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.45, ease: [0.25, 0.4, 0.25, 1] }}
      >
        {recruiterSignup && (
          <div className="mb-5 rounded-2xl border border-primary/20 bg-primary/[0.07] p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                <BriefcaseBusiness className="size-5" strokeWidth={1.7} />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                  Recruiter workspace
                </p>
                <h1 className="mt-1 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  Build your next great team.
                </h1>
                <p className="mt-1 text-sm leading-5 text-muted-foreground">
                  Find verified creative talent, manage briefs, and move every project forward.
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-primary/15 pt-3">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Search className="size-3.5 shrink-0 text-primary" />
                Find talent
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Users className="size-3.5 shrink-0 text-primary" />
                Build shortlists
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <ArrowRight className="size-3.5 shrink-0 text-primary" />
                Start hiring
              </div>
            </div>
          </div>
        )}

        <Card className="mt-4 border-border/50 bg-card/80 backdrop-blur-sm sm:mt-5">
          <CardContent className="p-4 sm:p-6 lg:p-8">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <SignupWizard initialRole={initialRole} roleLocked={roleLocked} />
            </motion.div>
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-xs font-light text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>

        <p className="mt-4 text-center text-xs font-light text-muted-foreground">
          By using RootIn you agree to our{" "}
          <a
            href="/terms"
            className="text-foreground/70 underline underline-offset-2 transition-colors hover:text-foreground"
          >
            Terms
          </a>{" "}
          and{" "}
          <a
            href="/privacy"
            className="text-foreground/70 underline underline-offset-2 transition-colors hover:text-foreground"
          >
            Privacy Policy
          </a>
        </p>
      </motion.div>
    </AuthLayout>
  );
}

export function UnifiedAuthForm() {
  return (
    <Suspense
      fallback={
        <AuthLayout showGlow>
          <div className="flex h-60 items-center justify-center">
            <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        </AuthLayout>
      }
    >
      <UnifiedAuthContent />
    </Suspense>
  );
}
