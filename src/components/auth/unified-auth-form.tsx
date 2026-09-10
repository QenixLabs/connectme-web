"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, BriefcaseBusiness, Search, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Card, CardContent } from "@/components/ui/card";
import { SignInForm } from "@/components/auth/signin-form";
import { SignupWizard } from "@/components/auth/signup-wizard";

type Mode = "signin" | "signup";

function UnifiedAuthContent() {
  const searchParams = useSearchParams();
  const initialMode = (searchParams.get("mode") === "signup" ? "signup" : "signin") as Mode;
  const roleParam = searchParams.get("role");
  const roleLocked = roleParam === "recruiter" || roleParam === "talent";
  const initialRole = roleParam === "recruiter" ? "recruiter" : "talent";
  const [mode, setMode] = useState<Mode>(initialMode);
  const recruiterSignup = initialMode === "signup" && initialRole === "recruiter";

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

        <div className="mt-4 flex rounded-xl bg-muted/30 p-1 sm:mt-5">
          {(["signin", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                "relative flex-1 rounded-lg py-2.5 text-sm font-medium whitespace-nowrap transition-colors duration-200",
                mode === m
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground/80",
              )}
            >
              {mode !== m && (m === "signin" ? "Sign In" : "Create Account")}
              {mode === m && (
                <>
                  <motion.div
                    layoutId="auth-tab-indicator"
                    className="absolute inset-0 rounded-lg bg-card shadow-sm"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                  <span className="relative z-10">{m === "signin" ? "Sign In" : "Create Account"}</span>
                </>
              )}
            </button>
          ))}
        </div>

        <Card className="mt-4 border-border/50 bg-card/80 backdrop-blur-sm sm:mt-5">
          <CardContent className="p-4 sm:p-6 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {mode === "signin" ? <SignInForm /> : <SignupWizard initialRole={initialRole} roleLocked={roleLocked} />}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        {mode === "signin" && (
          <div className="mt-4 border-t border-border/40 pt-4">
            <p className="mb-4 text-center text-xs font-light text-muted-foreground">
              New to RootIn?
            </p>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className="flex h-11 w-full items-center justify-center rounded-xl border border-border bg-card text-sm font-medium text-muted-foreground transition-all duration-200 hover:border-primary/30 hover:bg-primary/10 hover:text-foreground active:scale-[0.98]"
            >
              Create your account
            </button>
          </div>
        )}

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
